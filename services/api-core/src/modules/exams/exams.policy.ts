export interface RequiredRoom {
  slug: string;
  title: string;
  tasks: { questions: { id: string }[] }[];
}

export function examEligibility(rooms: RequiredRoom[], solvedIds: Set<string>, enrolled: boolean) {
  const required = rooms.filter((room) => room.tasks.some((task) => task.questions.length > 0));
  const missing = required
    .filter((room) =>
      room.tasks.some((task) => task.questions.some((question) => !solvedIds.has(question.id))),
    )
    .map(({ slug, title }) => ({ slug, title }));
  return {
    enrolled,
    completed: required.length - missing.length,
    total: required.length,
    missing,
    eligible: enrolled && required.length > 0 && missing.length === 0,
  };
}
