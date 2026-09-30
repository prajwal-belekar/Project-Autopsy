from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float, JSON, Enum as SQLEnum, types
from sqlalchemy.orm import relationship, declarative_base
import uuid
from datetime import datetime
import enum


class UUID(types.TypeDecorator):
    impl = types.CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)


Base = declarative_base()


class AnalysisStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisStepStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String(500), nullable=False)
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.QUEUED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=True)
    error = Column(Text, nullable=True)
    current_step = Column(String(100), nullable=True)
    steps = Column(JSON, nullable=True)

    repository = relationship("Repository", back_populates="analysis_jobs")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    branch = Column(String(255), nullable=False, default="main")
    language = Column(String(100), nullable=True)
    languages = Column(JSON, nullable=True)
    files = Column(Integer, default=0)
    lines_of_code = Column(Integer, default=0)
    commits = Column(Integer, default=0)
    contributors = Column(Integer, default=0)
    active_days = Column(Integer, default=0)
    age_months = Column(Integer, default=0)
    last_analyzed_at = Column(DateTime, nullable=True)
    analysis_status = Column(String(50), default="complete")
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis_jobs = relationship("AnalysisJob", back_populates="repository")
    file_metrics = relationship("FileMetric", back_populates="repository")
    commits = relationship("Commit", back_populates="repository")
    findings = relationship("Finding", back_populates="repository")
    hotspots = relationship("Hotspot", back_populates="repository")
    development_signals = relationship("DevelopmentSignal", back_populates="repository")
    architecture_result = relationship("ArchitectureResult", back_populates="repository", uselist=False)
    testing_result = relationship("TestingResult", back_populates="repository", uselist=False)
    documentation_result = relationship("DocumentationResult", back_populates="repository", uselist=False)


class FileMetric(Base):
    __tablename__ = "file_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    path = Column(String(500), nullable=False)
    extension = Column(String(50), nullable=True)
    language = Column(String(100), nullable=True)
    loc = Column(Integer, default=0)
    blank_lines = Column(Integer, default=0)
    comment_lines = Column(Integer, default=0)
    functions = Column(Integer, default=0)
    classes = Column(Integer, default=0)
    imports = Column(Integer, default=0)
    complexity = Column(Float, default=0.0)
    max_nesting = Column(Integer, default=0)
    max_function_length = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="file_metrics")


class Commit(Base):
    __tablename__ = "commits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    hash = Column(String(64), nullable=False)
    message = Column(Text, nullable=True)
    author = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=False)
    type = Column(String(50), nullable=True)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    is_revert = Column(Integer, default=0)
    is_bug_fix = Column(Integer, default=0)
    is_refactor = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="commits")
    file_changes = relationship("CommitFileChange", back_populates="commit")


class CommitFileChange(Base):
    __tablename__ = "commit_file_changes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commit_id = Column(UUID(as_uuid=True), ForeignKey("commits.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)

    commit = relationship("Commit", back_populates="file_changes")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    finding_id = Column(String(50), nullable=False)
    severity = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    evidence = Column(JSON, nullable=True)
    impact = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    file_path = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="findings")


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    module = Column(String(255), nullable=True)
    language = Column(String(100), nullable=True)
    ext = Column(String(50), nullable=True)
    loc = Column(Integer, default=0)
    complexity = Column(Float, default=0.0)
    revisions = Column(Integer, default=0)
    lines_added = Column(Integer, default=0)
    lines_deleted = Column(Integer, default=0)
    bug_fixes = Column(Integer, default=0)
    reverts = Column(Integer, default=0)
    churn_level = Column(String(50), nullable=True)
    test_signal = Column(String(50), nullable=True)
    last_touched = Column(DateTime, nullable=True)
    risk = Column(Float, default=0.0)
    risk_severity = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="hotspots")


class DevelopmentSignal(Base):
    __tablename__ = "development_signals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    signal_type = Column(String(100), nullable=False)
    signal_data = Column(JSON, nullable=True)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="development_signals")


class ArchitectureResult(Base):
    __tablename__ = "architecture_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    source_modules = Column(Integer, default=0)
    dependency_edges = Column(Integer, default=0)
    graph_modules = Column(JSON, nullable=True)
    circular_dependencies = Column(JSON, nullable=True)
    highly_coupled = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    inference_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="architecture_result")


class TestingResult(Base):
    __tablename__ = "testing_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    test_files = Column(Integer, default=0)
    source_files = Column(Integer, default=0)
    ratio_pct = Column(Float, default=0.0)
    suites = Column(JSON, nullable=True)
    activity = Column(JSON, nullable=True)
    risk_areas = Column(JSON, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="testing_result")


class DocumentationResult(Base):
    __tablename__ = "documentation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    items = Column(JSON, nullable=True)
    inline_stats = Column(JSON, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="documentation_result")