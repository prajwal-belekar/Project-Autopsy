import type { DocumentationData } from '../types';

export const documentation: DocumentationData = {
  items: [
    { name: 'README', status: 'available', evidence: 'Root README.md detected · 4.2 KB · updated 12 days ago.' },
    { name: 'Installation', status: 'partial', evidence: 'Install steps present in README; no standalone setup guide.' },
    { name: 'Environment Setup', status: 'partial', evidence: '.env.example present; required variables not documented.' },
    { name: 'API Documentation', status: 'none', evidence: 'No OpenAPI spec, typedoc, or API reference detected.' },
    { name: 'Architecture Documentation', status: 'partial', evidence: 'docs/architecture.md covers 2 of 5 major modules.' },
    { name: 'Contribution Guide', status: 'available', evidence: 'CONTRIBUTING.md detected with PR and review conventions.' },
    { name: 'Inline Documentation', status: 'partial', evidence: '41% of exported symbols carry doc comments.' },
  ],
  inlineStats: [
    { label: 'Files with comments', value: '118 / 184' },
    { label: 'Exported symbols documented', value: '41%' },
    { label: 'Debt markers inside doc comments', value: '6' },
  ],
  note: 'Statuses reflect detected artifacts and are derived from deterministic file and comment scans. No completeness percentages are assigned without a documented scoring method.',
};
