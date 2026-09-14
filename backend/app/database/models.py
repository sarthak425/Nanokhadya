"""
SQLAlchemy ORM Models — Database entities.
Structured relational storage with JSON fields for flexible metadata.
Every test is fully traceable: operator → device → reading → processing → prediction.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
import json

from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey,
    Integer, String, Text, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Operator(Base):
    __tablename__ = "operators"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    tests: Mapped[list["TestRecord"]] = relationship(back_populates="operator")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(String(128))
    sensor_type: Mapped[str] = mapped_column(String(64), default="AS7265x")
    channel_count: Mapped[int] = mapped_column(Integer, default=18)
    firmware_version: Mapped[Optional[str]] = mapped_column(String(32))
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    tests: Mapped[list["TestRecord"]] = relationship(back_populates="device")


class MLModel(Base):
    __tablename__ = "ml_models"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    model_type: Mapped[str] = mapped_column(String(64))           # SVM, RF, etc.
    food_type: Mapped[Optional[str]] = mapped_column(String(64))
    dataset_id: Mapped[Optional[str]] = mapped_column(String(64))
    dataset_label: Mapped[Optional[str]] = mapped_column(String(128))
    is_development_model: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(512))
    pca_components: Mapped[int] = mapped_column(Integer, default=2)
    svm_kernel: Mapped[str] = mapped_column(String(32), default="rbf")
    classes: Mapped[Optional[str]] = mapped_column(Text)           # JSON list
    evaluation_metrics: Mapped[Optional[dict]] = mapped_column(JSON)
    training_sample_count: Mapped[int] = mapped_column(Integer, default=0)
    trained_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    predictions: Mapped[list["PredictionRecord"]] = relationship(back_populates="model")


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    food_type: Mapped[str] = mapped_column(String(64))
    description: Mapped[Optional[str]] = mapped_column(Text)
    file_path: Mapped[Optional[str]] = mapped_column(String(512))
    is_development_data: Mapped[bool] = mapped_column(Boolean, default=False)
    sample_count: Mapped[int] = mapped_column(Integer, default=0)
    class_distribution: Mapped[Optional[dict]] = mapped_column(JSON)
    channel_count: Mapped[int] = mapped_column(Integer, default=18)
    imported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class TestRecord(Base):
    __tablename__ = "test_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    operator_id: Mapped[str] = mapped_column(ForeignKey("operators.id"))
    device_id: Mapped[str] = mapped_column(ForeignKey("devices.id"))
    food_type: Mapped[str] = mapped_column(String(64))
    source: Mapped[str] = mapped_column(String(32))               # BLE | DEVELOPMENT
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # Validation
    validation_status: Mapped[str] = mapped_column(String(32))
    validation_warnings: Mapped[Optional[str]] = mapped_column(Text)  # JSON list

    # Preprocessing steps applied
    preprocessing_steps: Mapped[Optional[str]] = mapped_column(Text)  # JSON list

    # Raw 18-channel data (JSON array of {wavelength, raw_value, processed_value})
    raw_channels: Mapped[Optional[dict]] = mapped_column(JSON)

    # PCA
    pca_components: Mapped[Optional[str]] = mapped_column(Text)   # JSON [pc1, pc2]

    # Final result
    final_label: Mapped[Optional[str]] = mapped_column(String(32))
    possible_issue: Mapped[Optional[str]] = mapped_column(String(256))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    operator: Mapped["Operator"] = relationship(back_populates="tests")
    device: Mapped["Device"] = relationship(back_populates="tests")
    prediction: Mapped[Optional["PredictionRecord"]] = relationship(
        back_populates="test", uselist=False
    )


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    test_id: Mapped[str] = mapped_column(ForeignKey("test_records.id"), unique=True)
    model_id: Mapped[Optional[str]] = mapped_column(ForeignKey("ml_models.id"))

    raw_label: Mapped[str] = mapped_column(String(64))
    predicted_label: Mapped[str] = mapped_column(String(32))
    probability: Mapped[Optional[float]] = mapped_column(Float)
    confidence_tier: Mapped[str] = mapped_column(String(32))
    class_probabilities: Mapped[Optional[dict]] = mapped_column(JSON)

    test: Mapped["TestRecord"] = relationship(back_populates="prediction")
    model: Mapped[Optional["MLModel"]] = relationship(back_populates="predictions")
