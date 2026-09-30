# Project Autopsy Backend

Evidence-based Software Development Forensics & Engineering Intelligence Platform.

## Overview

This is the Python/FastAPI backend for Project Autopsy that provides deterministic, evidence-based repository analysis.

## Features

- **Evidence-Based Analysis**: Every finding must have measurable repository evidence
- **Deterministic Scoring**: All metrics use transparent, reproducible algorithms
- **Repository-Relative Normalization**: Metrics normalized relative to repository context
- **Transparent Weighting**: Clear, documented scoring factors with weights
- **Cross-Signal Correlation**: Evidence correlations to identify root causes
- **Risk Signal Extraction**: Structured identification of risk patterns
- **Evidence-Backed Findings**: Findings with strong evidence trails
- **Comprehensive Coverage**: Git analysis, source analysis, technical debt, testing, documentation, architecture

## Technology Stack

- Python 3.11+
- FastAPI
- SQLAlchemy (PostgreSQL-ready, SQLite for development)
- Pydantic for data validation
- Uvicorn as ASGI server

## Installation

```bash
pip install -r requirements.txt
```

## Running

```bash
uvicorn app.main:app --reload
```

## API Endpoints

The backend provides evidence-based analysis through these endpoints:

- `POST /api/analysis` - Create analysis job
- `GET /api/analysis/{analysisId}` - Get job status
- `GET /api/repositories/{repositoryId}` - Repository metadata
- `GET /api/repositories/{repositoryId}/health` - Evidence-based health metrics
- `GET /api/repositories/{repositoryId}/friction` - Development friction with transparent breakdown
- `GET /api/repositories/{repositoryId}/hotspots` - Code hotspots with evidence
- `GET /api/repositories/{repositoryId}/findings` - Evidence-backed findings (optional `severity`, `category`, `file` filters)
- `GET /api/repositories/{repositoryId}/recommendations` - Mapped actionable recommendations
- `GET /api/repositories/{repositoryId}/primary-finding` - Top primary area requiring attention
- `GET /api/repositories/{repositoryId}/evolution` - Repository evolution timeline
- `GET /api/repositories/{repositoryId}/git` - Git forensics incl. rework signals

Transparency fields exposed on responses (additive to the frontend contract):

- `FrictionData.contributions` / `category_contributions` — exact per-factor points that sum to the friction score
- `Hotspot.signals` / `weights` — per-signal breakdown of each hotspot risk score
- `EvolutionData.time_analysis` — previous-vs-current period deltas and attention flag
- `GitForensicsData.rework.rework_score` — overall rework metric with signal detail

## Evidence Model

The core innovation is the evidence model where:

1. **Raw Evidence Collection**: Git history, source analysis, test analysis
2. **Normalization**: Repository-relative scaling for fair comparisons
3. **Correlation Engine**: Identifies relationships between signals
4. **Risk Signal Extraction**: Structural, historical, and quality signals
5. **Finding Generation**: Evidence-backed findings with confidence scores
6. **Recommendation Engine**: Actionable recommendations mapped to evidence

## Analysis Pipeline

Repository → Raw Evidence → Normalized Metrics → Cross-Signal Correlation → Risk Signals → Evidence-backed Findings → Recommendations

Each finding includes:
- Strong evidence from measurable repository data
- Confidence score representing analytical certainty
- Clear impact assessment
- Actionable recommendation based on evidence

The `EvidenceAnalysisService` (`app/services/evidence_analysis_service.py`) is the
pipeline coordinator that runs the hotspot, friction, correlation, finding,
rework, testing-gap and evolution engines over the canonical dataset in
`app/data/synthetic_repo.py`. The service layer (friction, hotspots, findings,
git, evolution) converts engine output into frontend-shaped payloads.

## Testing

Run tests with:
```bash
python -m pytest tests/ -v
```

Tests cover:
- Normalization algorithms
- Hotspot scoring (incl. large-but-stable files not flagged)
- Friction calculation (score == sum of contributions)
- Correlation detection and primary-area selection
- Finding generation, deduplication, evidence requirements
- Rework detection (change-revert-change)
- Testing-gap and evolution (time-aware) analysis
- Evidence service pipeline over the synthetic repo fixture

Contract checks against the running API (frontend-payload shape) are in
`test_contracts.py`:

```bash
python test_contracts.py
```