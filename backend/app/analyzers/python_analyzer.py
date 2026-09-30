import ast
import os
import re
from typing import List, Dict, Any, Optional


class PythonAnalyzer:
    def __init__(self, file_path: str, content: str):
        self.file_path = file_path
        self.content = content
        self.lines = content.splitlines()

    def analyze(self) -> Dict[str, Any]:
        result = {
            "functions": [],
            "classes": [],
            "imports": [],
            "calls": [],
            "complexity": 1,
            "max_nesting": 0,
            "max_function_length": 0,
            "debt_markers": [],
            "loc": len(self.lines),
        }
        try:
            tree = ast.parse(self.content)
            result["functions"] = self._extract_functions(tree)
            result["classes"] = self._extract_classes(tree)
            result["imports"] = self._extract_imports(tree)
            result["complexity"] = self._calculate_complexity(tree)
            result["max_nesting"] = self._max_nesting(tree)
            result["max_function_length"] = max((f["loc"] for f in result["functions"]), default=0)
            result["debt_markers"] = self._extract_debt_markers()
        except SyntaxError:
            pass
        return result

    def _extract_functions(self, tree: ast.AST) -> List[Dict[str, Any]]:
        functions = []
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                start = node.lineno
                end = node.end_lineno or start
                complexity = self._node_complexity(node)
                nesting = self._node_nesting(node)
                params = len(node.args.args)
                functions.append({
                    "name": node.name,
                    "loc": end - start + 1,
                    "complexity": complexity,
                    "nesting": nesting,
                    "params": params,
                })
        return functions

    def _extract_classes(self, tree: ast.AST) -> List[Dict[str, Any]]:
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                start = node.lineno
                end = node.end_lineno or start
                methods = sum(1 for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)))
                classes.append({
                    "name": node.name,
                    "loc": end - start + 1,
                    "methods": methods,
                })
        return classes

    def _extract_imports(self, tree: ast.AST) -> List[Dict[str, Any]]:
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.append({"source": ", ".join(a.name for a in node.names), "kind": "import", "symbols": [a.name for a in node.names]})
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                imports.append({"source": module, "kind": "from", "symbols": [a.name for a in node.names]})
        return imports

    def _calculate_complexity(self, tree: ast.AST) -> int:
        return self._node_complexity(tree)

    def _node_complexity(self, node) -> int:
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With, ast.Assert)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
            elif isinstance(child, (ast.comprehension,)):
                complexity += 1
        return complexity

    def _max_nesting(self, tree: ast.AST) -> int:
        return self._node_nesting(tree)

    def _node_nesting(self, node) -> int:
        max_depth = 0
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.With, ast.Try, ast.ExceptHandler)):
                depth = self._nesting_depth(child)
                max_depth = max(max_depth, depth)
        return max_depth

    def _nesting_depth(self, node, depth=0) -> int:
        max_depth = depth
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.With, ast.Try, ast.ExceptHandler)):
                max_depth = max(max_depth, self._nesting_depth(child, depth + 1))
            else:
                max_depth = max(max_depth, self._nesting_depth(child, depth))
        return max_depth

    def _extract_debt_markers(self) -> List[Dict[str, Any]]:
        markers = []
        patterns = {
            "TODO": {"severity": "low"},
            "FIXME": {"severity": "medium"},
            "HACK": {"severity": "medium"},
            "XXX": {"severity": "medium"},
            "BUG": {"severity": "high"},
        }
        for i, line in enumerate(self.lines, 1):
            for pattern, meta in patterns.items():
                if re.search(rf"\b{pattern}\b", line):
                    markers.append({
                        "line": i,
                        "type": pattern,
                        "severity": meta["severity"],
                        "text": line.strip()[:200],
                    })
        return markers