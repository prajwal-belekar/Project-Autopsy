import subprocess
import os
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def clone_repository(url: str, dest: str) -> bool:
    try:
        result = subprocess.run(
            ["git", "clone", "--depth=1", url, dest],
            capture_output=True,
            text=True,
            timeout=300
        )
        return result.returncode == 0
    except Exception as e:
        logger.error(f"Clone failed: {e}")
        return False


def get_git_log(repo_path: str) -> List[Dict[str, Any]]:
    commits = []
    try:
        result = subprocess.run(
            ["git", "log", "--all", "--format=%H|%an|%ae|%ad|%s", "--date=iso"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode != 0:
            return commits
        for line in result.stdout.strip().split("\n"):
            if not line:
                continue
            parts = line.split("|", 4)
            if len(parts) >= 5:
                commits.append({
                    "hash": parts[0],
                    "author": parts[1],
                    "email": parts[2],
                    "date": parts[3],
                    "message": parts[4]
                })
    except Exception as e:
        logger.error(f"Git log failed: {e}")
    return commits


def get_commit_stats(repo_path: str, commit_hash: str) -> Dict[str, Any]:
    try:
        result = subprocess.run(
            ["git", "show", "--stat", "--format=", commit_hash],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        additions = 0
        deletions = 0
        files_changed = []
        for line in result.stdout.strip().split("\n"):
            match = re.search(r'(\d+)\s+insertions?\s*\(\+\)\s*(\d+)\s+deletions?\s*\(-\)', line)
            if match:
                additions = int(match.group(1))
                deletions = int(match.group(2))
            if " | " in line:
                file_part = line.split("|")[0].strip()
                if file_part:
                    files_changed.append(file_part)
        return {"additions": additions, "deletions": deletions, "files": files_changed}
    except Exception:
        return {"additions": 0, "deletions": 0, "files": []}


def get_branch(repo_path: str) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout.strip() or "main"
    except Exception:
        return "main"


def get_contributors(repo_path: str) -> List[str]:
    try:
        result = subprocess.run(
            ["git", "log", "--format=%ae", "--all"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        emails = set(result.stdout.strip().split("\n"))
        return list(emails - {""})
    except Exception:
        return []


def get_first_commit_date(repo_path: str) -> Optional[datetime]:
    try:
        result = subprocess.run(
            ["git", "log", "--reverse", "--format=%ad", "--date=iso"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        first = result.stdout.strip().split("\n")[0] if result.stdout.strip() else None
        if first:
            return datetime.fromisoformat(first)
    except Exception:
        pass
    return None


def get_last_commit_date(repo_path: str) -> Optional[datetime]:
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ad", "--date=iso"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.stdout.strip():
            return datetime.fromisoformat(result.stdout.strip())
    except Exception:
        pass
    return None


def get_commit_count(repo_path: str) -> int:
    try:
        result = subprocess.run(
            ["git", "rev-list", "--count", "HEAD"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        return int(result.stdout.strip() or 0)
    except Exception:
        return 0


def classify_commit(message: str) -> str:
    msg = message.lower()
    if "revert" in msg:
        return "Revert"
    if any(w in msg for w in ["fix", "bug", "hotfix", "patch", "error", "crash", "issue"]):
        return "Bug Fix"
    if any(w in msg for w in ["refactor", "cleanup", "restructure", "simplify"]):
        return "Refactor"
    if any(w in msg for w in ["docs", "documentation", "readme", "doc"]):
        return "Documentation"
    if any(w in msg for w in ["test", "tests", "testing"]):
        return "Test"
    if any(w in msg for w in ["feat", "feature", "add", "implement", "create"]):
        return "Feature"
    if any(w in msg for w in ["chore", "build", "ci", "deps", "dependency", "bump", "merge"]):
        return "Chore"
    return "Other"


def get_file_churn(repo_path: str) -> Dict[str, Dict[str, Any]]:
    churn = {}
    try:
        result = subprocess.run(
            ["git", "log", "--all", "--numstat", "--format="],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=120
        )
        for line in result.stdout.strip().split("\n"):
            parts = line.split("\t")
            if len(parts) < 3:
                continue
            try:
                added = int(parts[0]) if parts[0] != "-" else 0
                deleted = int(parts[1]) if parts[1] != "-" else 0
                file_path = parts[2]
                if file_path not in churn:
                    churn[file_path] = {"additions": 0, "deletions": 0, "revisions": 0}
                churn[file_path]["additions"] += added
                churn[file_path]["deletions"] += deleted
                churn[file_path]["revisions"] += 1
            except ValueError:
                continue
    except Exception as e:
        logger.error(f"Churn calculation failed: {e}")
    return churn


def get_file_revisions(repo_path: str) -> Dict[str, int]:
    revisions = {}
    try:
        result = subprocess.run(
            ["git", "log", "--all", "--name-only", "--format="],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=120
        )
        for line in result.stdout.strip().split("\n"):
            if line and not line.startswith(" "):
                if line in revisions:
                    revisions[line] += 1
                else:
                    revisions[line] = 1
    except Exception:
        pass
    return revisions