import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { skillAxes } from '../skills/skill.policy.js';
import type { orgAnalytics } from './org.analytics.js';

type Snapshot = Awaited<ReturnType<typeof orgAnalytics>>;
const labels = ['Web', 'Net', 'Pwn', 'Crypto', 'DFIR', 'Win/AD', 'Blue', 'Cloud'];

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function analyticsCsv(snapshot: Snapshot) {
  const rows = [
    ['Display name', 'Username', 'Group', ...labels, 'Overall'].map(csvCell).join(','),
    ...snapshot.members.map((member) =>
      [
        member.displayName,
        member.username,
        member.groupName ?? '',
        ...skillAxes.map((axis) => member.scores[axis]),
        member.overall,
      ]
        .map(csvCell)
        .join(','),
    ),
    ['TEAM AVERAGE', '', '', ...skillAxes.map((axis) => snapshot.averages[axis]), '']
      .map(csvCell)
      .join(','),
  ];
  return `\uFEFF${rows.join('\r\n')}\r\n`;
}

export async function analyticsPdf(snapshot: Snapshot) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 38 });
  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.registerFont(
    'Inter',
    fileURLToPath(new URL('../../../assets/Inter-400.ttf', import.meta.url)),
  );
  doc.font('Inter');
  const left = 38;
  const width = doc.page.width - 76;
  const selected = snapshot.groups.find((group) => group.id === snapshot.selectedGroupId);
  const title = `${snapshot.organization.name}${selected ? ` / ${selected.name}` : ''}`;
  const header = () => {
    doc.rect(0, 0, doc.page.width, 92).fill('#191A23');
    doc.fillColor('#B9FF66').fontSize(14).text('CYBERFORCE  /  SKILL GAP REPORT', left, 25);
    doc
      .fillColor('#FFFFFF')
      .fontSize(10)
      .text(title, left, 52, { width: width - 160 });
    doc.text(snapshot.generatedAt.slice(0, 10), doc.page.width - 165, 52);
  };
  const columns = [150, 95, 60, ...skillAxes.map(() => 49), 54];
  const heads = ['Member', 'Username', 'Group', ...labels, 'Avg'];
  const row = (values: Array<string | number>, y: number, highlight = false) => {
    if (highlight) doc.rect(left, y - 2, width, 22).fill('#E9F7D6');
    let x = left + 4;
    values.forEach((value, index) => {
      doc
        .fillColor('#191A23')
        .fontSize(8)
        .text(String(value).slice(0, index < 3 ? 24 : 8), x, y + 3, {
          width: columns[index] - 5,
          height: 14,
          ellipsis: true,
        });
      x += columns[index];
    });
    doc
      .moveTo(left, y + 20)
      .lineTo(left + width, y + 20)
      .strokeColor('#D5D9D0')
      .lineWidth(0.5)
      .stroke();
  };
  let y = 112;
  header();
  doc
    .fillColor('#191A23')
    .fontSize(11)
    .text(
      `${snapshot.memberCount} members  ·  ${snapshot.hasActivity ? 'Skill activity recorded' : 'No skill activity yet'}`,
      left,
      y,
    );
  y += 25;
  for (const gap of snapshot.gaps.slice(0, 3)) {
    doc
      .fillColor('#A32828')
      .fontSize(9)
      .text(
        `${gap.skill}: average ${gap.average}/100; ${gap.belowBenchmarkPercent}% below 75. ${gap.paths.map((path) => path.title).join(', ')}`,
        left,
        y,
        { width },
      );
    y += 18;
  }
  y += 7;
  row(heads, y, true);
  y += 23;
  for (const member of snapshot.members) {
    if (y > doc.page.height - 60) {
      doc.addPage();
      header();
      y = 105;
      row(heads, y, true);
      y += 23;
    }
    row(
      [
        member.displayName,
        member.username,
        member.groupName ?? '',
        ...skillAxes.map((axis) => member.scores[axis]),
        member.overall,
      ],
      y,
    );
    y += 22;
  }
  if (y > doc.page.height - 60) {
    doc.addPage();
    header();
    y = 105;
  }
  row(['TEAM AVERAGE', '', '', ...skillAxes.map((axis) => snapshot.averages[axis]), ''], y, true);
  doc.end();
  return finished;
}
