import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APIClient } from '@/background/engine/api';
import { APIError } from '@/background/errors';

beforeEach(() => {
    vi.restoreAllMocks();
});

const createSuccessFetchMock = () =>
    vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
            choices: [{ message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }),
    });

describe('APIClient', () => {
    it('returns completion response on success', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    choices: [
                        { message: { role: 'assistant', content: '你好' }, finish_reason: 'stop' },
                    ],
                    usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
                }),
            }),
        );

        const client = new APIClient({
            baseUrl: 'https://api.openai.com',
            apiKey: 'k',
            model: 'gpt-4o-mini',
            timeout: 1000,
            maxRetries: 1,
        });

        const response = await client.chatCompletion({
            messages: [{ role: 'user', content: 'hello' }],
        });

        expect(response.choices[0].message.content).toBe('你好');
    });

    it('throws APIError for 401 response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({ error: { message: 'invalid key' } }),
            }),
        );

        const client = new APIClient({
            baseUrl: 'https://api.openai.com',
            apiKey: 'k',
            model: 'gpt-4o-mini',
        });

        await expect(
            client.chatCompletion({ messages: [{ role: 'user', content: 'hello' }] }),
        ).rejects.toBeInstanceOf(APIError);
    });

    it('rejects non-https base url', async () => {
        expect(
            () =>
                new APIClient({
                    baseUrl: 'http://localhost:11434',
                    apiKey: 'k',
                    model: 'gpt-4o-mini',
                }),
        ).toThrowError(APIError);
    });

    it('reuses /v1 path without duplicating endpoint suffix', async () => {
        const fetchMock = createSuccessFetchMock();
        vi.stubGlobal('fetch', fetchMock);

        const client = new APIClient({
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'k',
            model: 'gpt-4o-mini',
        });

        await client.chatCompletion({
            messages: [{ role: 'user', content: 'hello' }],
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions');
    });

    it('accepts full completions endpoint as base url', async () => {
        const fetchMock = createSuccessFetchMock();
        vi.stubGlobal('fetch', fetchMock);

        const client = new APIClient({
            baseUrl: 'https://api.openai.com/v1/chat/completions',
            apiKey: 'k',
            model: 'gpt-4o-mini',
        });

        await client.chatCompletion({
            messages: [{ role: 'user', content: 'hello' }],
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions');
    });

    it('supports Gemini OpenAI-compatible base url', async () => {
        const fetchMock = createSuccessFetchMock();
        vi.stubGlobal('fetch', fetchMock);

        const client = new APIClient({
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            apiKey: 'k',
            model: 'gemini-3-flash-preview',
        });

        await client.chatCompletion({
            messages: [{ role: 'user', content: 'hello' }],
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe(
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        );
    });
});
