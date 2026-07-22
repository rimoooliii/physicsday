import { describe, expect, test } from 'vitest';

import { calendarDate } from '../src/lib/date';

describe('calendarDate', () => {
  test('uses China Standard Time across the UTC date boundary', () => {
    const instant = new Date('2026-07-21T16:30:00.000Z');

    expect(calendarDate(instant)).toBe('2026-07-22');
  });
});
