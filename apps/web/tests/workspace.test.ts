import { describe, it, expect } from 'vitest';
import { readWorkspace } from '../src/components/room/workspace-state';

describe('room draft persistence', () => {
  it('recovers from malformed or missing storage', () => {
    expect(readWorkspace('{')).toEqual(readWorkspace(null));
    expect(readWorkspace('null').answers).toEqual({});
  });
  it('preserves draft, accordion, scroll and panel size', () => {
    const state = {
      answers: { question: 'my draft' },
      closed: { task: true },
      scroll: 234,
      layout: { lesson: 60, lab: 40 },
    };
    expect(readWorkspace(JSON.stringify(state))).toEqual(state);
  });
  it('rejects invalid persisted fields without losing valid answers', () => {
    const state = readWorkspace(
      JSON.stringify({
        answers: { valid: 'draft', wrong: 123 },
        closed: { wrong: 'yes' },
        scroll: -1,
        layout: { lesson: 999 },
      }),
    );
    expect(state.answers).toEqual({ valid: 'draft' });
    expect(state.closed).toEqual({});
    expect(state.scroll).toBe(0);
    expect(state.layout).toEqual({ lesson: 45, lab: 55 });
  });
});
