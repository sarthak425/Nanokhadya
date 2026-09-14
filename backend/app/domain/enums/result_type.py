"""Result type enumerations for validation, prediction, and confidence."""
from enum import Enum


class ValidationStatus(str, Enum):
    VALID = "VALID"
    WARNING = "WARNING"     # Passed but with non-critical issues
    INVALID = "INVALID"     # Must not proceed to ML


class PredictionLabel(str, Enum):
    SAFE = "SAFE"
    SUSPECTED = "SUSPECTED"
    ADULTERATED = "ADULTERATED"
    UNKNOWN = "UNKNOWN"                   # Model could not classify
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"  # Not enough training data


class ResultConfidence(str, Enum):
    HIGH = "HIGH"       # Probability > 0.85
    MEDIUM = "MEDIUM"   # Probability 0.65–0.85
    LOW = "LOW"         # Probability < 0.65
    UNAVAILABLE = "UNAVAILABLE"  # Model does not support probability
