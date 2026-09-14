"""
test_session.py — tracks the state of an in-progress sensor test session.

A TestSession progresses through well-defined states, preventing invalid
transitions (e.g. can't analyze before data is acquired and validated).

State machine:
    IDLE → ACQUIRING → ACQUIRED → VALIDATING → VALIDATED
         → PREPROCESSING → PREPROCESSED → ANALYZING → COMPLETE
         → FAILED (from any state)
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger("nanotech.acquisition.test_session")


class SessionState(str, Enum):
    IDLE          = "IDLE"
    ACQUIRING     = "ACQUIRING"
    ACQUIRED      = "ACQUIRED"
    VALIDATING    = "VALIDATING"
    VALIDATED     = "VALIDATED"
    PREPROCESSING = "PREPROCESSING"
    PREPROCESSED  = "PREPROCESSED"
    ANALYZING     = "ANALYZING"
    COMPLETE      = "COMPLETE"
    FAILED        = "FAILED"


# Valid state transitions
_TRANSITIONS: dict[SessionState, list[SessionState]] = {
    SessionState.IDLE:          [SessionState.ACQUIRING],
    SessionState.ACQUIRING:     [SessionState.ACQUIRED, SessionState.FAILED],
    SessionState.ACQUIRED:      [SessionState.VALIDATING, SessionState.FAILED],
    SessionState.VALIDATING:    [SessionState.VALIDATED, SessionState.FAILED],
    SessionState.VALIDATED:     [SessionState.PREPROCESSING, SessionState.FAILED],
    SessionState.PREPROCESSING: [SessionState.PREPROCESSED, SessionState.FAILED],
    SessionState.PREPROCESSED:  [SessionState.ANALYZING, SessionState.FAILED],
    SessionState.ANALYZING:     [SessionState.COMPLETE, SessionState.FAILED],
    SessionState.COMPLETE:      [],
    SessionState.FAILED:        [],
}


@dataclass
class TestSession:
    """
    Tracks the lifecycle of a single food safety test.
    Enforces valid state transitions.
    """
    test_id:    str
    operator_id: str
    food_type:  str
    device_id:  str

    state:      SessionState = SessionState.IDLE
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at:   Optional[datetime] = None
    error:      Optional[str] = None
    metadata:   dict = field(default_factory=dict)

    def transition(self, new_state: SessionState, info: str = "") -> None:
        """
        Advance to a new state.
        Raises ValueError if the transition is not allowed.
        """
        allowed = _TRANSITIONS.get(self.state, [])
        if new_state not in allowed:
            raise ValueError(
                f"TestSession {self.test_id}: invalid transition "
                f"{self.state} → {new_state}. "
                f"Allowed: {[s.value for s in allowed]}"
            )
        logger.info(
            "TestSession %s: %s → %s %s",
            self.test_id, self.state.value, new_state.value,
            f"({info})" if info else "",
        )
        self.state = new_state
        if new_state in (SessionState.COMPLETE, SessionState.FAILED):
            self.ended_at = datetime.now(timezone.utc)

    def fail(self, reason: str) -> None:
        """Transition to FAILED state with a reason."""
        self.error = reason
        try:
            self.transition(SessionState.FAILED, reason)
        except ValueError:
            # Already in FAILED or COMPLETE — just log
            logger.warning("TestSession %s: fail() called in state %s: %s",
                           self.test_id, self.state.value, reason)

    @property
    def is_terminal(self) -> bool:
        return self.state in (SessionState.COMPLETE, SessionState.FAILED)

    @property
    def duration_seconds(self) -> Optional[float]:
        if self.ended_at:
            return (self.ended_at - self.started_at).total_seconds()
        return (datetime.now(timezone.utc) - self.started_at).total_seconds()

    def to_dict(self) -> dict:
        return {
            "testId":      self.test_id,
            "operatorId":  self.operator_id,
            "foodType":    self.food_type,
            "deviceId":    self.device_id,
            "state":       self.state.value,
            "startedAt":   self.started_at.isoformat(),
            "endedAt":     self.ended_at.isoformat() if self.ended_at else None,
            "durationSec": self.duration_seconds,
            "error":       self.error,
        }
