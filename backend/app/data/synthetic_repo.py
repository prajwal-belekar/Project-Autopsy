"""Synthetic repository dataset used by the evidence service while the
real repository-acquisition pipeline is being wired up.

This fixture is intentionally small and deterministic. It models one hotspot
(src/auth/auth.py), a moderately active module, a large-but-stable file that
must NOT be flagged (utils/big.py), and a healthy small module.
"""

SYNTHETIC_FILES = [
    {
        "path": "src/auth/auth.py",
        "complexity": 28, "churn": 1400, "revisions": 22,
        "bug_fixes": 9, "reverts": 4, "test_signal": 10,
        "modifications": 22, "loc": 480, "debt_count": 4,
        "nesting": 6, "coupling": 14, "documented": False,
    },
    {
        "path": "src/payments/payments.py",
        "complexity": 20, "churn": 900, "revisions": 15,
        "bug_fixes": 5, "reverts": 1, "test_signal": 25,
        "modifications": 15, "loc": 350, "debt_count": 2,
        "nesting": 4, "coupling": 9, "documented": False,
    },
    {
        "path": "utils/big.py",
        "complexity": 45, "churn": 10, "revisions": 1,
        "bug_fixes": 0, "reverts": 0, "test_signal": 5,
        "modifications": 1, "loc": 2200, "debt_count": 1,
        "nesting": 5, "coupling": 2, "documented": True,
    },
    {
        "path": "api/health.py",
        "complexity": 4, "churn": 40, "revisions": 3,
        "bug_fixes": 1, "reverts": 0, "test_signal": 60,
        "modifications": 3, "loc": 80, "debt_count": 0,
        "nesting": 2, "coupling": 3, "documented": True,
    },
]

SYNTHETIC_MONTHLY = [
    {"commits": 12, "churn": 300, "bug_fixes": 2, "reverts": 0, "testing": 3, "complexity": 30, "friction": 25},
    {"commits": 14, "churn": 400, "bug_fixes": 2, "reverts": 1, "testing": 2, "complexity": 35, "friction": 30},
    {"commits": 20, "churn": 700, "bug_fixes": 6, "reverts": 3, "testing": 1, "complexity": 52, "friction": 58},
]