import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { BareHeader } from '../components/layout/BareHeader';

interface FormError {
  title: string;
  hint: string;
}

/**
 * Repository analysis entry point. Submitting a URL creates an analysis job
 * and navigates to /analysis/:analysisId, where progress is tracked.
 */
export default function Analyze() {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Analyze a Repository · Project Autopsy';
  }, []);

  const start = () => {
    setError(null);
    setSubmitting(true);
    api
      .analyzeRepository(url)
      .then(({ analysisId }) => navigate(`/analysis/${analysisId}`))
      .catch((err: Error & { code?: string }) => {
        setSubmitting(false);
        setError(
          err.code === 'AUTH_REQUIRED'
            ? {
                title: 'This repository requires authentication.',
                hint: 'Private repositories need a configured access token before analysis can run.',
              }
            : {
                title: 'Repository URL is invalid.',
                hint: 'Use a GitHub repository URL, for example github.com/company/repository.',
              },
        );
      });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <BareHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Analyze a Repository</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-faint">
          Source analysis, Git history, structural signals, testing activity, and debt indicators are
          reconstructed into a single investigation.
        </p>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitting) start();
          }}
        >
          <label htmlFor="repo-url" className="text-xs font-medium text-dim">
            Repository URL
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com/company/repository"
              spellCheck={false}
              autoComplete="off"
              className="h-9 min-w-0 flex-1 rounded-md border border-edge bg-panel px-3 font-mono text-13 text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-9 shrink-0 rounded-md bg-accent px-4 text-[13px] font-semibold text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Analyze'}
            </button>
          </div>
        </form>

        {error && (
          <div role="alert" className="mt-4 flex gap-2.5 rounded-md border border-crit/40 bg-crit/10 p-3">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-crit" />
            <div>
              <p className="text-xs font-medium text-crit">{error.title}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-dim">{error.hint}</p>
            </div>
          </div>
        )}

        <p className="mt-6 text-2xs leading-relaxed text-faint">
          Demo environment: any valid GitHub URL is analyzed against the bundled sample dataset
          (company/project-atlas).
        </p>
      </main>
    </div>
  );
}
