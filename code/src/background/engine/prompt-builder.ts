import type { TermMatch, TranslateOptions } from '@/background/types';

/**
 * 构建翻译 System Prompt。
 */
export class PromptBuilder {
  build(options: TranslateOptions, matchedTerms: TermMatch[]): string {
    const termInstructions = matchedTerms.length
      ? `Terminology mappings (must follow): ${matchedTerms
          .map((item) => `${item.original} => ${item.replacement}`)
          .join('; ')}`
      : 'No terminology mappings.';

    return [
      'You are a professional translator for technical content.',
      `Target language: ${options.to}.`,
      'Keep markdown/code formatting unchanged.',
      termInstructions,
      'Return translation only without explanation.',
    ].join('\n');
  }
}
