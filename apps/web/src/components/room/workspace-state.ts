export interface WorkspaceState {
  answers: Record<string, string>;
  closed: Record<string, boolean>;
  scroll: number;
  layout: Record<string, number>;
}
export function readWorkspace(raw: string | null): WorkspaceState {
  const empty = { answers: {}, closed: {}, scroll: 0, layout: { lesson: 45, lab: 55 } };
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object') return empty;
    return {
      answers: Object.fromEntries(
        Object.entries(value.answers ?? {}).filter(([, text]) => typeof text === 'string'),
      ) as Record<string, string>,
      closed: Object.fromEntries(
        Object.entries(value.closed ?? {}).filter(([, closed]) => typeof closed === 'boolean'),
      ) as Record<string, boolean>,
      scroll: Number.isFinite(value.scroll) && value.scroll >= 0 ? value.scroll : 0,
      layout:
        Number.isFinite(value.layout?.lesson) &&
        value.layout.lesson >= 20 &&
        value.layout.lesson <= 80
          ? { lesson: value.layout.lesson, lab: 100 - value.layout.lesson }
          : empty.layout,
    };
  } catch {
    return empty;
  }
}
