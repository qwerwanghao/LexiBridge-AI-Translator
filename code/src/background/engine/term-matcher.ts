import type { Term, TermMatch, TermMatcherOptions, TermTable } from '@/background/types';

/**
 * TermMatcher 按域名和匹配类型执行术语匹配。
 */
export class TermMatcher {
  private termTables: TermTable[];

  constructor(termTables: TermTable[]) {
    this.termTables = termTables;
  }

  match(text: string, options: TermMatcherOptions = {}): TermMatch[] {
    const withBoundary = options.enableBoundaryDetection ?? true;
    const selectedTables = this.pickTables(options.domain);
    const sortedTerms = this.sortTerms(selectedTables.flatMap((item) => item.terms));
    const usedRange: Array<{ start: number; end: number }> = [];
    const matches: TermMatch[] = [];

    for (const term of sortedTerms) {
      const termMatches = this.findTermMatches(text, term, withBoundary);
      for (const match of termMatches) {
        const overlap = usedRange.some(
          (range) => match.position < range.end && match.position + match.length > range.start,
        );
        if (overlap) {
          continue;
        }
        usedRange.push({ start: match.position, end: match.position + match.length });
        matches.push(match);
        if (options.maxMatches && matches.length >= options.maxMatches) {
          return matches.sort((a, b) => a.position - b.position);
        }
      }
    }

    return matches.sort((a, b) => a.position - b.position);
  }

  addTermTable(table: TermTable): void {
    this.termTables.push(table);
  }

  removeTermTable(id: string): void {
    this.termTables = this.termTables.filter((item) => item.id !== id);
  }

  private pickTables(domain?: string): TermTable[] {
    if (!domain) {
      return this.termTables;
    }

    const domainTables: TermTable[] = [];
    const globalTables: TermTable[] = [];

    for (const table of this.termTables) {
      if (table.domainMappings?.[domain]) {
        domainTables.push(table);
      } else {
        globalTables.push(table);
      }
    }

    return [...domainTables, ...globalTables];
  }

  private sortTerms(terms: Term[]): Term[] {
    const typeWeight: Record<Term['type'], number> = {
      exact: 3,
      prefix: 2,
      regex: 1,
    };

    return [...terms].sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }
      return typeWeight[right.type] - typeWeight[left.type];
    });
  }

  private findTermMatches(text: string, term: Term, withBoundary: boolean): TermMatch[] {
    if (term.type === 'regex') {
      const flags = term.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(term.source, flags);
      return this.findByRegex(text, regex, term);
    }

    const source = term.caseSensitive ? term.source : term.source.toLowerCase();
    const targetText = term.caseSensitive ? text : text.toLowerCase();
    const result: TermMatch[] = [];
    let startIndex = 0;

    while (startIndex < targetText.length) {
      const foundAt = targetText.indexOf(source, startIndex);
      if (foundAt < 0) {
        break;
      }

      const boundaryOk =
        !withBoundary ||
        term.type !== 'exact' ||
        this.hasBoundary(text, foundAt, term.source.length);
      if (boundaryOk) {
        result.push({
          original: text.slice(foundAt, foundAt + term.source.length),
          replacement: term.target,
          type: term.type,
          position: foundAt,
          length: term.source.length,
        });
      }

      startIndex = foundAt + 1;
    }

    return result;
  }

  private findByRegex(text: string, regex: RegExp, term: Term): TermMatch[] {
    const matches: TermMatch[] = [];
    let found = regex.exec(text);

    while (found) {
      const value = found[0];
      matches.push({
        original: value,
        replacement: term.target,
        type: term.type,
        position: found.index,
        length: value.length,
      });
      found = regex.exec(text);
    }

    return matches;
  }

  private hasBoundary(text: string, position: number, length: number): boolean {
    const left = position === 0 ? ' ' : text[position - 1];
    const right = position + length >= text.length ? ' ' : text[position + length];
    const boundaryRegExp = /[^a-zA-Z0-9_]/;
    return boundaryRegExp.test(left) && boundaryRegExp.test(right);
  }
}
