import { useEffect, useMemo, useState } from 'react';

interface TermEntry {
  source: string;
  target: string;
}

interface TermTablePayload {
  id: string;
  terms: TermEntry[];
}

interface RuntimeResponse<T = unknown> {
  success: boolean;
  data?: T;
}

const DEFAULT_TABLE_ID = 'default-terms';

export function TermEditor() {
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const canAdd = source.trim().length > 0 && target.trim().length > 0;

  const total = useMemo(() => terms.length, [terms]);

  useEffect(() => {
    void (async () => {
      const response = (await chrome.runtime.sendMessage({
        type: 'GET_TERM_TABLES',
        payload: null,
        timestamp: Date.now(),
      })) as RuntimeResponse<TermTablePayload[]>;

      if (!response.success || !response.data?.length) {
        return;
      }

      const table = response.data.find((item) => item.id === DEFAULT_TABLE_ID) ?? response.data[0];
      setTerms(table.terms);
    })();
  }, []);

  const syncTerms = async (nextTerms: TermEntry[]): Promise<void> => {
    setStatus(null);
    const removeResponse = (await chrome.runtime.sendMessage({
      type: 'DELETE_TERM_TABLE',
      payload: { id: DEFAULT_TABLE_ID },
      timestamp: Date.now(),
    })) as RuntimeResponse<{ success: boolean }>;

    if (!removeResponse.success) {
      setStatus('Failed to save terms');
      return;
    }

    const addResponse = (await chrome.runtime.sendMessage({
      type: 'ADD_TERM_TABLE',
      payload: {
        id: DEFAULT_TABLE_ID,
        name: 'Default Terms',
        terms: nextTerms,
        domainMappings: {},
      },
      timestamp: Date.now(),
    })) as RuntimeResponse<{ id: string }>;

    if (!addResponse.success) {
      setStatus('Failed to save terms');
      return;
    }

    setStatus('Terms saved');
  };

  const addTerm = async () => {
    if (!canAdd) {
      return;
    }

    const nextTerms = [...terms, { source: source.trim(), target: target.trim() }];
    setTerms(nextTerms);
    setSource('');
    setTarget('');
    await syncTerms(nextTerms);
  };

  const removeTerm = async (index: number) => {
    const nextTerms = terms.filter((_, currentIndex) => currentIndex !== index);
    setTerms(nextTerms);
    await syncTerms(nextTerms);
  };

  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Term Editor</h2>
      <p className="mt-1 text-sm text-slate-600">Total terms: {total}</p>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          placeholder="Source"
          value={source}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          onChange={(event) => setSource(event.target.value)}
        />
        <input
          placeholder="Target"
          value={target}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          onChange={(event) => setTarget(event.target.value)}
        />
      </div>

      <button
        type="button"
        className="mt-3 rounded border border-slate-300 bg-slate-100 px-3 py-1 text-sm disabled:opacity-50"
        disabled={!canAdd}
        onClick={() => void addTerm()}
      >
        Add Term
      </button>

      <ul className="mt-4 space-y-2">
        {terms.map((term, index) => (
          <li
            key={`${term.source}-${term.target}-${index}`}
            className="flex items-center justify-between text-sm"
          >
            <span>
              {term.source} → {term.target}
            </span>
            <button
              type="button"
              className="rounded border border-rose-200 px-2 py-0.5 text-rose-700"
              onClick={() => void removeTerm(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </section>
  );
}
