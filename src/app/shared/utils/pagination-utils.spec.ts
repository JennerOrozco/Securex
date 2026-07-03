import { describe, expect, it } from 'vitest';
import { extractPaginatedData } from './pagination-utils';

describe('extractPaginatedData', () => {
    it('should unwrap common nested paginated payloads', () => {
        const response = {
            data: {
                items: [{ id: 1 }, { id: 2 }],
                total: 42,
            },
        };

        expect(extractPaginatedData(response)).toEqual({
            data: [{ id: 1 }, { id: 2 }],
            total: 42,
        });
    });

    it('should support pagination metadata under pagination.total', () => {
        const response = {
            items: [{ id: 3 }],
            pagination: { total: 7 },
        };

        expect(extractPaginatedData(response)).toEqual({
            data: [{ id: 3 }],
            total: 7,
        });
    });
});
