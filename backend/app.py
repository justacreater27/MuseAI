"""Compatibility ASGI entry point for running Uvicorn inside ``backend``."""

import sys
from pathlib import Path


project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.main import app

__all__ = ["app"]
