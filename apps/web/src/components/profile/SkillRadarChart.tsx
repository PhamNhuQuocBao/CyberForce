import type { SkillTelemetry } from '@/lib/api';
const axes: [keyof SkillTelemetry, string][] = [
  ['webExploitation', 'Web'],
  ['cloudSecurity', 'Cloud'],
  ['networkPentest', 'Network'],
  ['devSecOps', 'DevSecOps'],
  ['cryptography', 'Crypto'],
  ['reverseEngineering', 'Reverse'],
  ['osint', 'OSINT'],
  ['binaryExploitation', 'Binary'],
];
export function SkillRadarChart({
  telemetry,
  size = 420,
  className = '',
}: {
  telemetry: SkillTelemetry;
  size?: number;
  className?: string;
}) {
  const point = (i: number, scale: number) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    return [180 + 112 * scale * Math.cos(angle), 180 + 112 * scale * Math.sin(angle)];
  };
  const polygon = (scale: number) => axes.map((_, i) => point(i, scale).join(',')).join(' ');
  return (
    <svg
      viewBox="0 0 360 360"
      style={{ maxWidth: size }}
      className={`mx-auto w-full ${className}`}
      role="img"
      aria-label="Biểu đồ 8 kỹ năng. Điểm chi tiết được liệt kê bên dưới."
    >
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon key={scale} points={polygon(scale)} fill="none" stroke="var(--border)" />
      ))}
      {axes.map(([key, label], i) => {
        const [x, y] = point(i, 1);
        const [lx, ly] = point(i, 1.38);
        return (
          <g key={key}>
            <line x1="180" y1="180" x2={x} y2={y} stroke="var(--border)" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted-foreground)"
              fontSize="11"
            >
              {label}
            </text>
          </g>
        );
      })}
      <polygon
        points={axes
          .map(([key], i) =>
            point(i, Math.max(0, Math.min(100, telemetry[key] ?? 0)) / 100).join(','),
          )
          .join(' ')}
        fill="#A3EA2A"
        fillOpacity=".18"
        stroke="var(--ring)"
        strokeWidth="2"
      />
    </svg>
  );
}
