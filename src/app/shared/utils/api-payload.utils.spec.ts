import { describe, expect, it } from 'vitest';
import { extractApiArray, buildApiErrorMessage } from './api-payload.utils';

describe('api-payload utils', () => {
    it('extracts arrays from nested payloads consistently', () => {
        expect(extractApiArray({ data: [{ id: 1 }] })).toEqual([{ id: 1 }]);
        expect(extractApiArray({ result: { data: [{ id: 2 }] } })).toEqual([{ id: 2 }]);
        expect(extractApiArray({ items: [{ id: 3 }] })).toEqual([{ id: 3 }]);
    });

    it('builds a readable error message', () => {
        expect(buildApiErrorMessage({ message: 'boom' })).toBe('boom');
        expect(buildApiErrorMessage({ error: { message: 'nested' } }, 'fallback')).toBe('nested');
        expect(buildApiErrorMessage(null, 'fallback')).toBe('fallback');
    });
});
