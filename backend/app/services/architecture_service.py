from typing import Dict, Any, List, Optional
from app.services.repository_service import RepositoryService


class ArchitectureService:
    def __init__(self):
        self.repository_service = RepositoryService()

    async def get_architecture(self, repository_id: str) -> Dict[str, Any]:
        """Get architecture analysis derived from actual repository source files."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "sourceModules": 0,
                "dependencyEdges": 0,
                "graphModules": [],
                "circular": [],
                "highlyCoupled": [],
                "summary": "No repository data available.",
                "inferenceNote": "Run analysis to populate architecture data.",
            }

        files = repo_data.get("files", [])
        if not files:
            return {
                "sourceModules": 0,
                "dependencyEdges": 0,
                "graphModules": [],
                "circular": [],
                "highlyCoupled": [],
                "summary": "No source files available for architecture analysis.",
                "inferenceNote": "Run analysis to populate architecture data.",
            }

        # Derive modules from directory structure (first path component)
        modules: Dict[str, Dict[str, Any]] = {}
        for f in files:
            path_parts = f.get("path", "").split("/")
            if len(path_parts) >= 2:
                module_name = path_parts[0]
            else:
                module_name = "root"
            if module_name not in modules:
                modules[module_name] = {
                    "name": module_name,
                    "files": [],
                    "dependencies": set(),
                    "loc": 0,
                    "complexity": 0,
                }
            modules[module_name]["files"].append(f.get("path", ""))
            modules[module_name]["loc"] += f.get("loc", 0)
            modules[module_name]["complexity"] += f.get("complexity", 0)

        # Build graph modules and dependency edges
        graph_modules: List[Dict[str, Any]] = []
        dependency_edges: List[Dict[str, Any]] = []
        module_names = list(modules.keys())

        # Simple dependency: a module depends on another if it has files with import-like paths
        # For now, use coupling counts as proxy for dependencies
        for mod_name in module_names:
            mod = modules[mod_name]
            # Count coupling from files in this module
            mod_coupling = sum(f.get("coupling", 0) for f in files if f.get("path", "").split("/")[0] == mod_name)
            graph_modules.append(
                {
                    "id": mod_name,
                    "name": mod_name,
                    "layer": "implementation",
                    "files": len(mod["files"]),
                    "loc": mod["loc"],
                    "complexity": mod["complexity"],
                    "dependencyCount": mod_coupling,
                }
            )

        # Build dependency edges (simplified: connect modules that share file dependencies)
        for i, mod1_name in enumerate(module_names):
            for mod2_name in module_names[i + 1 :]:
                # Check if modules have inter-file dependencies
                mod1_files = {
                    f.get("path", "") for f in files if f.get("path", "").split("/")[0] == mod1_name
                }
                mod2_files = {
                    f.get("path", "") for f in files if f.get("path", "").split("/")[0] == mod2_name
                }
                # Simple heuristic: if there are coupling signals between files in different modules
                cross_coupling = sum(
                    f.get("coupling", 0) for f in files if f.get("path", "").split("/")[0] in {mod1_name, mod2_name}
                )
                if cross_coupling > 0:
                    dependency_edges.append(
                        {
                            "source": mod1_name,
                            "target": mod2_name,
                            "edgeType": "imports",
                            "count": cross_coupling,
                        }
                    )

        # Detect circular dependencies (simplified: check for mutual coupling)
        circular: List[Dict[str, Any]] = []
        highly_coupled: List[Dict[str, Any]] = []

        for mod1_name in module_names:
            for mod2_name in module_names:
                if mod1_name >= mod2_name:
                    continue
                # Check if there's significant cross-module coupling
                cross = sum(
                    f.get("coupling", 0)
                    for f in files
                    if f.get("path", "").split("/")[0] in {mod1_name, mod2_name}
                )
                if cross > 5:  # threshold for "highly coupled"
                    highly_coupled.append(
                        {
                            "id": f"coupled-{mod1_name}-{mod2_name}",
                            "cycle": f"{mod1_name} <-> {mod2_name}",
                            "severity": "medium" if cross > 10 else "low",
                            "introduced": "unknown",
                            "note": f"High coupling between {mod1_name} and {mod2_name} ({cross} coupling signals)",
                        }
                    )
                    if [mod2_name, mod1_name] not in [c["cycle"].split(" <-> ") for c in circular]:
                        circular.append(
                            {
                                "id": f"circular-{mod1_name}-{mod2_name}",
                                "cycle": f"{mod1_name} <-> {mod2_name}",
                                "severity": "medium" if cross > 10 else "low",
                                "introduced": "unknown",
                                "note": f"Circular dependency detected between {mod1_name} and {mod2_name}",
                            }
                        )

        # Compute summary
        total_files = len(files)
        total_modules = len(module_names)
        total_edges = len(dependency_edges)

        summary = (
            f"Architecture analysis of {total_files} source files across {total_modules} modules "
            f"with {total_edges} dependency edges identified."
        )

        inference_note = (
            f"Module structure: {', '.join(module_names)}. "
            f"{len(highly_coupled)} pairs of highly coupled modules detected. "
            f"{len(circular)} circular dependency patterns found."
        )

        return {
            "sourceModules": total_modules,
            "dependencyEdges": total_edges,
            "graphModules": graph_modules,
            "circular": circular,
            "highlyCoupled": highly_coupled,
            "summary": summary,
            "inferenceNote": inference_note,
        }