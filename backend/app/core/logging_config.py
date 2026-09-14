"""NanoTech Food Safety System — Structured Logging Configuration"""
import logging
import sys
from app.core.config import settings


def configure_logging() -> None:
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt, datefmt=datefmt))

    root = logging.getLogger()
    root.setLevel(log_level)
    root.handlers = [handler]

    # Suppress noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("bleak").setLevel(logging.WARNING)

    logging.getLogger("nanotech").info(
        "NanoTech Food Safety System v%s | data_source=%s",
        settings.app_version,
        settings.data_source,
    )
