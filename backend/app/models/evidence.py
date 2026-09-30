from datetime import datetime
from typing import Dict, Any, Optional


class Evidence:
    def __init__(
        self,
        evidence_type: str,
        source: str,
        file_path: str,
        line: Optional[int] = None,
        metric: Optional[str] = None,
        value: Any = None,
        timestamp: Optional[datetime] = None,
        description: Optional[str] = None,
    ):
        self.type = evidence_type
        self.source = source
        self.file_path = file_path
        self.line = line
        self.metric = metric
        self.value = value
        self.timestamp = timestamp or datetime.utcnow()
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type,
            "source": self.source,
            "file_path": self.file_path,
            "line": self.line,
            "metric": self.metric,
            "value": self.value,
            "timestamp": self.timestamp.isoformat(),
            "description": self.description,
        }

    @classmethod
    def complexity(cls, file_path: str, value: int) -> "Evidence":
        return cls(
            evidence_type="complexity",
            source="static_analysis",
            file_path=file_path,
            metric="complexity",
            value=value,
            description=f"Code complexity score: {value}",
        )

    @classmethod
    def churn(cls, file_path: str, value: float) -> "Evidence":
        return cls(
            evidence_type="churn",
            source="git_history",
            file_path=file_path,
            metric="churn",
            value=value,
            description=f"Development churn: {value}",
        )

    @classmethod
    def revisions(cls, file_path: str, value: int) -> "Evidence":
        return cls(
            evidence_type="revisions",
            source="git_history",
            file_path=file_path,
            metric="revisions",
            value=value,
            description=f"Revision count: {value}",
        )

    @classmethod
    def bug_fixes(cls, file_path: str, value: int) -> "Evidence":
        return cls(
            evidence_type="bug_fixes",
            source="git_history",
            file_path=file_path,
            metric="bug_fixes",
            value=value,
            description=f"Bug fix commits: {value}",
        )

    @classmethod
    def reverts(cls, file_path: str, value: int) -> "Evidence":
        return cls(
            evidence_type="reverts",
            source="git_history",
            file_path=file_path,
            metric="reverts",
            value=value,
            description=f"Revert commits: {value}",
        )

    @classmethod
    def test_gap(cls, file_path: str, value: float) -> "Evidence":
        return cls(
            evidence_type="test_gap",
            source="test_analysis",
            file_path=file_path,
            metric="test_gap",
            value=value,
            description=f"Testing gap score: {value}",
        )

    @classmethod
    def debt_marker(cls, file_path: str, line: int, type: str, text: str) -> "Evidence":
        return cls(
            evidence_type="debt_marker",
            source="static_analysis",
            file_path=file_path,
            line=line,
            metric="debt_marker",
            value=1,
            description=f"{type}: {text}",
        )

    @classmethod
    def technical_debt(cls, file_path: str, value: int) -> "Evidence":
        return cls(
            evidence_type="technical_debt",
            source="static_analysis",
            file_path=file_path,
            metric="technical_debt",
            value=value,
            description=f"Technical debt markers: {value}",
        )

    @classmethod
    def testing_activity(cls, file_path: str, value: float) -> "Evidence":
        return cls(
            evidence_type="testing_activity",
            source="test_analysis",
            file_path=file_path,
            metric="testing_activity",
            value=value,
            description=f"Testing activity score: {value}",
        )