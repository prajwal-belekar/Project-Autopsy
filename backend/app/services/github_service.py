import os
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime


class GithubService:
    def __init__(self):
        self.token = os.environ.get("GITHUB_TOKEN", "")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    def _extract_owner_repo(self, repo_url: str) -> tuple[str, str]:
        """Extract owner and repo name from GitHub URL."""
        clean_url = repo_url.rstrip("/").replace(".git", "")
        parts = clean_url.split("/")
        if len(parts) >= 2:
            return parts[-2], parts[-1]
        return "", ""

    async def fetch_issues(self, repo_url: str) -> Dict[str, Any]:
        """Fetch real issues from GitHub REST API."""
        owner, repo = self._extract_owner_repo(repo_url)
        if not owner or not repo:
            return self._empty_issues()

        async with httpx.AsyncClient() as client:
            try:
                # Get open issues
                open_url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=100"
                resp_open = await client.get(open_url, headers=self.headers, timeout=10.0)
                open_issues = resp_open.json() if resp_open.status_code == 200 else []

                # Get closed issues (sample)
                closed_url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=closed&per_page=100"
                resp_closed = await client.get(closed_url, headers=self.headers, timeout=10.0)
                closed_issues = resp_closed.json() if resp_closed.status_code == 200 else []

                # Filter out pull requests (GitHub API returns PRs as issues)
                open_issues = [i for i in open_issues if "pull_request" not in i]
                closed_issues = [i for i in closed_issues if "pull_request" not in i]

                # Tally counts
                open_count = len(open_issues)
                closed_count = len(closed_issues)
                
                # Check for stale issues (no update in 90 days)
                now = datetime.utcnow()
                stale_count = 0
                bugs_count = 0
                enhancements_count = 0

                for i in open_issues:
                    # Stale check
                    updated_at = i.get("updated_at")
                    if updated_at:
                        dt = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                        if (now - dt.replace(tzinfo=None)).days > 90:
                            stale_count += 1
                    
                    # Labels check
                    labels = [l.get("name", "").lower() for l in i.get("labels", [])]
                    if any("bug" in l for l in labels):
                        bugs_count += 1
                    if any("enhancement" in l or "feature" in l for l in labels):
                        enhancements_count += 1

                # Build top list
                top_issues = []
                for i in open_issues[:10]:
                    created_at = i.get("created_at")
                    age_days = 0
                    if created_at:
                        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                        age_days = (now - dt.replace(tzinfo=None)).days

                    primary_label = "issue"
                    if i.get("labels"):
                        primary_label = i["labels"][0].get("name", "issue")

                    top_issues.append({
                        "id": f"issue-{i.get('number')}",
                        "number": i.get("number"),
                        "title": i.get("title", ""),
                        "state": i.get("state", "open"),
                        "label": primary_label,
                        "ageDays": age_days,
                        "comments": i.get("comments", 0),
                        "linkedCommits": 0,
                    })

                return {
                    "open": open_count,
                    "closed": closed_count,
                    "reopened": 0,
                    "stale": stale_count,
                    "bugs": bugs_count,
                    "enhancements": enhancements_count,
                    "trend": [],
                    "top": top_issues,
                }
            except Exception as e:
                return self._empty_issues()

    async def fetch_pulls(self, repo_url: str) -> Dict[str, Any]:
        """Fetch real pull requests from GitHub REST API."""
        owner, repo = self._extract_owner_repo(repo_url)
        if not owner or not repo:
            return self._empty_pulls()

        async with httpx.AsyncClient() as client:
            try:
                # Open PRs
                open_url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=open&per_page=100"
                resp_open = await client.get(open_url, headers=self.headers, timeout=10.0)
                open_prs = resp_open.json() if resp_open.status_code == 200 else []

                # Closed/Merged PRs
                closed_url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=closed&per_page=100"
                resp_closed = await client.get(closed_url, headers=self.headers, timeout=10.0)
                closed_prs = resp_closed.json() if resp_closed.status_code == 200 else []

                now = datetime.utcnow()
                merged_count = sum(1 for pr in closed_prs if pr.get("merged_at"))
                truly_closed = len(closed_prs) - merged_count
                
                long_running_count = 0
                top_prs = []

                for pr in open_prs:
                    created_at = pr.get("created_at")
                    open_days = 0
                    if created_at:
                        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                        open_days = (now - dt.replace(tzinfo=None)).days
                        if open_days > 14:
                            long_running_count += 1

                for pr in open_prs[:10]:
                    created_at = pr.get("created_at")
                    open_days = 0
                    if created_at:
                        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                        open_days = (now - dt.replace(tzinfo=None)).days

                    top_prs.append({
                        "id": f"pr-{pr.get('number')}",
                        "number": pr.get("number"),
                        "title": pr.get("title", ""),
                        "state": pr.get("state", "open"),
                        "additions": 0,
                        "deletions": 0,
                        "openDays": open_days,
                        "files": 0,
                    })

                return {
                    "open": len(open_prs),
                    "merged": merged_count,
                    "closed": truly_closed,
                    "longRunning": long_running_count,
                    "reopened": 0,
                    "trend": [],
                    "top": top_prs,
                }
            except Exception:
                return self._empty_pulls()

    def _empty_issues(self) -> Dict[str, Any]:
        return {
            "open": 0,
            "closed": 0,
            "reopened": 0,
            "stale": 0,
            "bugs": 0,
            "enhancements": 0,
            "trend": [],
            "top": [],
        }

    def _empty_pulls(self) -> Dict[str, Any]:
        return {
            "open": 0,
            "merged": 0,
            "closed": 0,
            "longRunning": 0,
            "reopened": 0,
            "trend": [],
            "top": [],
        }
