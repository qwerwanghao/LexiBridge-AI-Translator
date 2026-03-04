import { describe, expect, it } from 'vitest';

import { TermMatcher } from '@/background/engine/term-matcher';
import type { TermTable } from '@/background/types';

const globalTable: TermTable = {
  id: 'global',
  name: 'global',
  terms: [
    { source: 'service', target: '服务器', type: 'exact', priority: 1 },
    { source: 'Service', target: '服务', type: 'prefix', priority: 1 },
    { source: '\\w+Endpoint', target: '端点', type: 'regex', priority: 0 },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const domainTable: TermTable = {
  id: 'github',
  name: 'github',
  terms: [{ source: 'service', target: '服务', type: 'exact', priority: 10 }],
  domainMappings: { 'github.com': true },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('TermMatcher', () => {
  it('matches domain terms before global terms', () => {
    const matcher = new TermMatcher([globalTable, domainTable]);
    const matches = matcher.match('service is running', { domain: 'github.com' });

    expect(matches[0].replacement).toBe('服务');
    expect(matches[0].type).toBe('exact');
  });

  it('supports regex matching as fallback', () => {
    const matcher = new TermMatcher([globalTable]);
    const matches = matcher.match('AuthEndpoint online');

    expect(matches.some((item) => item.type === 'regex')).toBe(true);
  });

  it('applies boundary detection for exact terms', () => {
    const matcher = new TermMatcher([
      {
        ...globalTable,
        terms: [{ source: 'service', target: '服务器', type: 'exact', priority: 1 }],
      },
    ]);
    const matches = matcher.match('serviceWorker ready');

    expect(matches.length).toBe(0);
  });
});
