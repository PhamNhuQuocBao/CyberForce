import type { OrgAnalytics, SkillAxis } from '@/lib/api';

export const skillLabels: Array<[SkillAxis, string]> = [
  ['web', 'Web'],
  ['network', 'Net'],
  ['binary', 'Pwn'],
  ['crypto', 'Crypto'],
  ['forensics', 'DFIR'],
  ['windows_ad', 'Win/AD'],
  ['defensive', 'Blue'],
  ['cloud_devsecops', 'Cloud'],
];

function scoreClass(score: number, available: number) {
  if (!available) return 'bg-muted text-muted-foreground';
  if (score >= 75)
    return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200';
  if (score >= 40) return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200';
  return 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200';
}

export function SkillGapMatrixTable({ data }: { data: OrgAnalytics }) {
  return (
    <div className="overflow-x-auto rounded-card border-2 border-border bg-card shadow-[0_5px_0_#191A23] dark:shadow-none">
      <table className="w-full min-w-[950px] border-collapse text-sm">
        <caption className="sr-only">
          Ma trận điểm thành thạo theo tám kỹ năng của {data.memberCount} học viên
        </caption>
        <thead className="bg-muted/70">
          <tr className="border-b-2 border-border text-left">
            <th className="sticky left-0 z-10 bg-muted px-4 py-3">Thành viên</th>
            {skillLabels.map(([axis, label]) => (
              <th
                key={axis}
                className="px-2 py-3 text-center"
                title={`${axis} · tối đa ${data.availableExp[axis]} EXP trong nội dung đã xuất bản`}
              >
                {label}
              </th>
            ))}
            <th className="px-3 py-3 text-right">TB</th>
          </tr>
        </thead>
        <tbody>
          {data.members.map((member) => (
            <tr key={member.userId} className="border-b border-border/60 last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium"
              >
                <span className="block max-w-44 truncate" title={member.displayName}>
                  {member.displayName}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  @{member.username}
                </span>
              </th>
              {skillLabels.map(([axis]) => (
                <td key={axis} className="px-2 py-3 text-center">
                  <span
                    className={`inline-flex min-w-11 justify-center rounded-badge px-2 py-1 font-mono ${scoreClass(member.scores[axis], data.availableExp[axis])}`}
                    title={`${member.skillExp[axis]} / ${data.availableExp[axis]} EXP`}
                  >
                    {member.scores[axis]}
                  </span>
                </td>
              ))}
              <td className="px-3 py-3 text-right font-mono font-semibold">{member.overall}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-border bg-primary/20 font-semibold">
          <tr>
            <th scope="row" className="sticky left-0 bg-primary/20 px-4 py-3 text-left">
              Trung bình nhóm
            </th>
            {skillLabels.map(([axis]) => (
              <td key={axis} className="px-2 py-3 text-center font-mono">
                {data.averages[axis]}
              </td>
            ))}
            <td className="px-3 py-3 text-right font-mono">
              {(
                skillLabels.reduce((sum, [axis]) => sum + data.averages[axis], 0) /
                skillLabels.length
              ).toFixed(1)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
