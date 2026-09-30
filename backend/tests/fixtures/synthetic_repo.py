"""Synthetic repository fixture for engine tests.

Re-exports the canonical dataset from app.data so tests stay in sync with
the code the application actually uses.
"""

from app.data.synthetic_repo import SYNTHETIC_FILES, SYNTHETIC_MONTHLY  # noqa: F401