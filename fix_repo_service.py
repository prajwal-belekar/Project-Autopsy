import sys
sys.path.insert(0, r"D:\Project-Autopsy\backend")

# Read the file
with open("backend/app/services/repository_service.py", "r") as f:
    content = f.read()

# Define the old and new blocks more carefully
old_block = """    async def get_issues(self, repository_id: str) -> Dict[str, Any]:
        # Issues cannot be determined from a local clone without GitHub API token.
        # Return explicit empty state per product rules: missing data renders an explicit
        # empty state, never invented numbers.
        return {
            "open": 0,
            "closed": 0,
            "reopened": 0,
            "stale": 0,
            "bugs": 0,
            "enhancements": 0,
            "trend": [],
            "top": [],
        }"""

new_block = """    async def get_issues(self, repository_id: str) -> Dict[str, Any]:
        repo_data = self._repos.get(repository_id)
        if not repo_data:
            return self._empty_issues()
        
        # Use the stored URL to fetch real GitHub data
        url = repo_data.get("repository", {}).get("url", "")
        if url:
            github = GithubService()
            issues = await github_service.fetch_issues(url)
            return issues
        
        # Fallback to empty state if no URL available
        return self._empty_issues()"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("backend/app/services/repository_service.py", "w") as f:
        f.write(content)
    print("Repository service updated successfully")
else:
    print("Old block not found")
    # Show what we have around the target area
    idx = content.find("async def get_issues")
    if idx >= 0:
        print("Found 'async def get_issues' at index", idx)
        print("Context:", content[idx:idx+300])
PYEOF