'useclient';

import React, { useState } from 'react';
import type { SkillTelemetry } from '@/lib/api';

interface SkillRadarChartProps {
  telemetry: SkillTelemetry;
  size?: number;
  className?: string;
}

interface AxisConfig {
  key: keyof SkillTelemetry;
  label: string;
  shortLabel: string;
  category: string;
}

const AXES: AxisConfig[] = [
  {
    key: 'webExploitation',
    label: 'Web Exploitation',
    shortLabel: 'Web Exploit',
    category: 'Offensive',
  },
  {
    key: 'cloudSecurity',
    label: 'Cloud Security',
    shortLabel: 'Cloud Sec',
    category: 'Infrastructure',
  },
  {
    key: 'networkPentest',
    label: 'Network Pentest',
    shortLabel: 'Net Pentest',
    category: 'Offensive',
  },
  {
    key: 'reverseEngineering',
    label: 'Reverse Engineering',
    shortLabel: 'Reverse Eng',
    category: 'Analysis',
  },
  { key: 'cryptography', label: 'Cryptography', shortLabel: 'Crypto', category: 'Foundational' },
  {
    key: 'devSecOps',
    label: 'DevSecOps Pipeline',
    shortLabel: 'DevSecOps',
    category: 'Engineering',
  },
  {
    key: 'binaryExploitation',
    label: 'Binary Exploitation',
    shortLabel: 'Binary Exploit',
    category: 'Deep Tech',
  },
  { key: 'osint', label: 'Open-Source Intel', shortLabel: 'OSINT', category: 'Reconnaissance' },
];

export function SkillRadarChart({ telemetry, size = 420, className = '' }: SkillRadarChartProps) {
  const [hoveredAxis, setHoveredAxis] = useState<AxisConfig | null>(null);

  const cx = 200;
  const cy = 200;
  const radius = 125;
  const levels = [0.25, 0.5, 0.75, 1.0];
  const numAxes = AXES.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Helper to get coordinates on the radar given an angle index and scale factor
  const getCoordinates = (index: number, factor: number) => {
    // Start from top (-PI / 2)
    const angle = index * angleStep - Math.PI / 2;
    const x = cx + radius * factor * Math.cos(angle);
    const y = cy + radius * factor * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate concentric octagon grid rings
  const gridRings = levels.map((level) => {
    const points = AXES.map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    }).join(' ');
    return { level, points };
  });

  // Generate polygon points from telemetry data
  const dataPoints = AXES.map((axis, i) => {
    const rawVal = telemetry[axis.key] ?? 0;
    const clampedVal = Math.max(5, Math.min(100, rawVal));
    const factor = clampedVal / 100;
    const { x, y } = getCoordinates(i, factor);
    return { x, y, val: rawVal, axis };
  });

  const polygonPath = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        style={{ maxWidth: size }}
        className="w-full aspect-square overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* Subtle radial fill for Positivus theme */}
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B9FF66" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#B9FF66" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#B9FF66" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Concentric octagons */}
        {gridRings.map(({ points }, idx) => (
          <polygon
            key={idx}
            points={points}
            fill={idx === levels.length - 1 ? 'rgba(25, 26, 35, 0.02)' : 'none'}
            stroke="#191A23"
            strokeWidth={idx === levels.length - 1 ? 2 : 1}
            strokeDasharray={idx === levels.length - 1 ? 'none' : '3 3'}
            className="opacity-30 dark:stroke-white dark:opacity-20"
          />
        ))}

        {/* Axis rays from center to vertex */}
        {AXES.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#191A23"
              strokeWidth="1.5"
              className="opacity-25 dark:stroke-white dark:opacity-20"
            />
          );
        })}

        {/* Level percentage markers on top axis */}
        {levels.map((lvl) => {
          const { y } = getCoordinates(0, lvl);
          return (
            <text
              key={lvl}
              x={cx + 5}
              y={y + 3}
              fontSize="9"
              fontFamily="var(--font-mono, monospace)"
              fill="#191A23"
              className="opacity-40 dark:fill-white font-bold"
            >
              {lvl * 100}%
            </text>
          );
        })}

        {/* The Skill Polygon Area */}
        <polygon
          points={polygonPath}
          fill="url(#radarGlow)"
          stroke="#191A23"
          strokeWidth="2.5"
          className="transition-all duration-300 filter"
        />

        {/* Vertices & interactive hit targets */}
        {dataPoints.map((pt, i) => {
          const isHovered = hoveredAxis?.key === pt.axis.key;
          return (
            <g
              key={i}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHoveredAxis(pt.axis)}
              onMouseLeave={() => setHoveredAxis(null)}
            >
              {/* Outer halo */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 7 : 5}
                fill="#B9FF66"
                stroke="#191A23"
                strokeWidth={2}
                className="transition-all duration-150"
              />
              {/* Center point */}
              <circle cx={pt.x} cy={pt.y} r={2} fill="#191A23" />
            </g>
          );
        })}

        {/* Axis Labels positioned around the octagon perimeter */}
        {AXES.map((axis, i) => {
          const { x, y } = getCoordinates(i, 1.24);
          const rawVal = telemetry[axis.key] ?? 0;
          const isHovered = hoveredAxis?.key === axis.key;

          // Align text dynamically based on position around circle
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (x > cx + 25) textAnchor = 'start';
          else if (x < cx - 25) textAnchor = 'end';

          return (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredAxis(axis)}
              onMouseLeave={() => setHoveredAxis(null)}
            >
              <text
                x={x}
                y={y - 2}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight={isHovered ? '800' : '700'}
                fontFamily="var(--font-sans, sans-serif)"
                fill={isHovered ? '#191A23' : '#191A23'}
                className={`transition-colors dark:fill-white ${
                  isHovered ? 'fill-black font-extrabold' : 'opacity-85'
                }`}
              >
                {axis.shortLabel}
              </text>
              <text
                x={x}
                y={y + 11}
                textAnchor={textAnchor}
                fontSize="10"
                fontFamily="var(--font-mono, monospace)"
                fontWeight="700"
                fill={isHovered ? '#000000' : '#4B5563'}
                className="dark:fill-brand-lime"
              >
                [{rawVal}]
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Information Badge */}
      <div className="h-9 mt-2 flex items-center justify-center">
        {hoveredAxis ? (
          <div className="px-3 py-1 bg-brand-dark text-white text-xs font-mono rounded-badge border border-brand-dark shadow-neo-sm animate-in fade-in zoom-in-95 duration-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-lime inline-block" />
            <span className="font-bold">{hoveredAxis.label}:</span>
            <span className="text-brand-lime font-bold">{telemetry[hoveredAxis.key]} pts</span>
            <span className="opacity-70 text-[10px]">({hoveredAxis.category})</span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-muted-foreground opacity-60">
            Hover over any vertex to inspect capability telemetry
          </div>
        )}
      </div>
    </div>
  );
}
