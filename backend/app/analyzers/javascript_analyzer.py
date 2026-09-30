import re
import os
from typing import List, Dict, Any


class JavaScriptAnalyzer:
    """
    Fallback regex-based analyzer for JavaScript/TypeScript.
    This is NOT a full AST parser. It provides approximate metrics.
    For accurate analysis, a tree-sitter based parser should be used.
    """

    def __init__(self, file_path: str, content: str):
        self.file_path = file_path
        self.content = content
        self.lines = content.splitlines()

    def analyze(self) -> Dict[str, Any]:
        return {
            "functions": self._extract_functions(),
            "classes": self._extract_classes(),
            "imports": self._extract_imports(),
            "calls": [],
            "complexity": self._estimate_complexity(),
            "max_nesting": self._estimate_nesting(),
            "max_function_length": max((f["loc"] for f in self._extract_functions()), default=0),
            "debt_markers": self._extract_debt_markers(),
            "loc": len(self.lines),
        }

    def _extract_functions(self) -> List[Dict[str, Any]]:
        functions = []
        pattern = re.compile(
            r'(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)',
            re.MULTILINE
        )
        for match in pattern.finditer(self.content):
            name = match.group(1)
            start = self.content[:match.start()].count("\n") + 1
            end = self._find_function_end(start)
            functions.append({
                "name": name,
                "loc": max(end - start + 1, 1),
                "complexity": self._estimate_complexity_for_block(start, end),
                "nesting": self._estimate_nesting_for_block(start, end),
                "params": len([p for p in match.group(2).split(",") if p.strip()]),
            })
        return functions

    def _extract_classes(self) -> List[Dict[str, Any]]:
        classes = []
        pattern = re.compile(r'(?:export\s+)?class\s+(\w+)', re.MULTILINE)
        for match in pattern.finditer(self.content):
            name = match.group(1)
            start = self.content[:match.start()].count("\n") + 1
            end = self._find_class_end(start)
            methods = len(re.findall(r'(?:\w+\s*\([^)]*\)\s*\{)', self.content[start-1:end]))
            classes.append({
                "name": name,
                "loc": max(end - start + 1, 1),
                "methods": methods,
            })
        return classes

    def _extract_imports(self) -> List[Dict[str, Any]]:
        imports = []
        pattern = re.compile(
            r'(?:import|export)\s+(?:\{([^}]*)\}\s+from\s+["\']([^"\']+)["\']|([^"\']+)\s+from\s+["\']([^"\']+)["\']|["\']([^"\']+)["\'])',
            re.MULTILINE
        )
        for match in pattern.finditer(self.content):
            symbols = [s.strip() for s in match.group(1).split(",") if s.strip()] if match.group(1) else []
            source = match.group(2) or match.group(4) or match.group(5) or ""
            if source:
                imports.append({"source": source, "kind": "import", "symbols": symbols})
        return imports

    def _estimate_complexity(self) -> int:
        complexity = 1
        complexity += len(re.findall(r'\bif\b', self.content))
        complexity += len(re.findall(r'\bfor\b', self.content))
        complexity += len(re.findall(r'\bwhile\b', self.content))
        complexity += len(re.findall(r'\bcatch\b', self.content))
        complexity += len(re.findall(r'\bcase\b', self.content))
        complexity += len(re.findall(r'\?\s*[^:]+:', self.content))
        return complexity

    def _estimate_complexity_for_block(self, start: int, end: int) -> int:
        block = "\n".join(self.lines[start-1:end])
        return 1 + len(re.findall(r'\bif\b', block)) + len(re.findall(r'\bfor\b', block))

    def _estimate_nesting(self) -> int:
        max_nesting = 0
        current = 0
        for line in self.lines:
            if re.search(r'\b(if|for|while|switch|catch)\b.*\{', line):
                current += 1
                max_nesting = max(max_nesting, current)
            if line.strip().startswith("}"):
                current = max(current - 1, 0)
        return max_nesting

    def _estimate_nesting_for_block(self, start: int, end: int) -> int:
        block = self.lines[start-1:end]
        max_nesting = 0
        current = 0
        for line in block:
            if re.search(r'\b(if|for|while|switch|catch)\b.*\{', line):
                current += 1
                max_nesting = max(max_nesting, current)
            if line.strip().startswith("}"):
                current = max(current - 1, 0)
        return max_nesting

    def _find_function_end(self, start: int) -> int:
        depth = 0
        for i in range(start - 1, len(self.lines)):
            line = self.lines[i]
            depth += line.count("{") - line.count("}")
            if depth == 0 and "{" in line:
                return i + 1
        return start

    def _find_class_end(self, start: int) -> int:
        depth = 0
        for i in range(start - 1, len(self.lines)):
            line = self.lines[i]
            depth += line.count("{") - line.count("}")
            if depth == 0 and "{" in line:
                return i + 1
        return start

    def _extract_debt_markers(self) -> List[Dict[str, Any]]:
        markers = []
        patterns = {
            "TODO": "low",
            "FIXME": "medium",
            "HACK": "medium",
            "XXX": "medium",
            "BUG": "high",
        }
        for i, line in enumerate(self.lines, 1):
            for pattern, severity in patterns.items():
                if re.search(rf"\b{pattern}\b", line):
                    markers.append({
                        "line": i,
                        "type": pattern,
                        "severity": severity,
                        "text": line.strip()[:200],
                    })
        return markers