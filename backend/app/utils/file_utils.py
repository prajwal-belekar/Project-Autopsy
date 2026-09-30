import os
import re
import shutil
import subprocess
import tempfile
from typing import Optional, Dict, Any, List


def safe_temp_dir(prefix: str = "project-autopsy") -> str:
    return tempfile.mkdtemp(prefix=prefix)


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def remove_dir(path: str):
    if os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)


def is_safe_path(base: str, target: str) -> bool:
    abs_base = os.path.abspath(base)
    abs_target = os.path.abspath(target)
    return os.path.commonpath([abs_base, abs_target]) == abs_base


def read_file_safe(path: str, encoding: str = "utf-8", errors: str = "ignore") -> str:
    try:
        with open(path, "r", encoding=encoding, errors=errors) as f:
            return f.read()
    except Exception:
        return ""


def count_lines(content: str) -> Dict[str, int]:
    lines = content.splitlines()
    total = len(lines)
    blank = sum(1 for l in lines if not l.strip())
    comment = sum(1 for l in lines if l.strip().startswith("#") or l.strip().startswith("//"))
    return {"total": total, "blank": blank, "comment": comment}


def get_extension(path: str) -> str:
    return os.path.splitext(path)[1].lower()


def is_source_file(path: str) -> bool:
    source_exts = {
        ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".cpp", ".h", ".hpp",
        ".go", ".rs", ".php", ".rb", ".kt", ".swift", ".m", ".mm", ".scala", ".clj"
    }
    return get_extension(path) in source_exts


def is_test_file(path: str) -> bool:
    test_patterns = [
        r"\.test\.", r"\.spec\.", r"__tests__", r"^tests/", r"/tests/",
        r"test_", r"_test", r"conftest"
    ]
    for pattern in test_patterns:
        if re.search(pattern, path, re.IGNORECASE):
            return True
    return False


def get_language(path: str) -> Optional[str]:
    ext_map = {
        ".py": "Python",
        ".js": "JavaScript",
        ".jsx": "JavaScript",
        ".ts": "TypeScript",
        ".tsx": "TypeScript",
        ".java": "Java",
        ".c": "C",
        ".cpp": "C++",
        ".h": "C",
        ".hpp": "C++",
        ".go": "Go",
        ".rs": "Rust",
        ".php": "PHP",
        ".rb": "Ruby",
        ".kt": "Kotlin",
        ".swift": "Swift",
        ".scala": "Scala",
    }
    return ext_map.get(get_extension(path))