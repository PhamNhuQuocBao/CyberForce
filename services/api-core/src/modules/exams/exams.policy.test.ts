import { describe, expect, it } from 'vitest';
import { examEligibility } from './exams.policy.js';

const rooms = Array.from({ length: 5 }, (_, index) => ({
  slug: `room-${index + 1}`,
  title: `Room ${index + 1}`,
  tasks: [{ questions: [{ id: `question-${index + 1}` }] }],
}));

describe('Capstone eligibility', () => {
  it('blocks a learner with 60% required rooms complete', () => {
    const result = examEligibility(
      rooms,
      new Set(['question-1', 'question-2', 'question-3']),
      true,
    );
    expect(result).toMatchObject({ completed: 3, total: 5, eligible: false });
    expect(result.missing.map((room) => room.slug)).toEqual(['room-4', 'room-5']);
  });

  it('allows an enrolled learner with every required question complete', () => {
    const solved = new Set(rooms.map((_, index) => `question-${index + 1}`));
    expect(examEligibility(rooms, solved, true)).toMatchObject({
      completed: 5,
      total: 5,
      eligible: true,
    });
    expect(examEligibility(rooms, solved, false).eligible).toBe(false);
  });

  it('does not unlock an empty path', () => {
    expect(examEligibility([], new Set(), true).eligible).toBe(false);
  });
});
