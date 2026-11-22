import React, { useState } from 'react';
import { useKisanSetu } from '../context/KisanSetuContext';

interface DataPoint {
  label: string;
  value: number;
}

interface SvgTrendChartProps {
  data: DataPoint[];
  unitPrefix?: string;
  unitSuffix?: string;
  accentColor?: string;
  height?: number;
}

export const SvgTrendChart: React.FC<SvgTrendChartProps> = ({
  data,
  unitPrefix = '',
  unitSuffix = '',
  accentColor = '#216B43',
  height = 180,
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { t } = useKisanSetu();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#5E6D63]">
        {t('common.noData')}
      </div>
    );
  }

  const width = 560;
  const padX = 36;
  const padY = 22;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const vals = data.map((d) => d.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = Math.max(1, maxVal - minVal);
  const yMin = Math.floor(minVal - range * 0.2);
  const yMax = Math.ceil(maxVal + range * 0.2);
  const yRange = Math.max(1, yMax - yMin);

  const coords = data.map((d, i) => {
    const x = padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = padY + innerH - ((d.value - yMin) / yRange) * innerH;
    return { x, y, ...d };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padY + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const activePoint = activeIdx !== null ? coords[activeIdx] : coords[coords.length - 1];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-[#546358] mb-2">
        <span>{t('market.chartHint')}</span>
        <span className="font-mono tabular-nums font-semibold text-[#143A28]">
          {activePoint.label}: {unitPrefix}
          {activePoint.value}
          {unitSuffix}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Trend line chart"
      >
        <defs>
          <linearGradient id="kisansetuAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((frac, idx) => {
          const y = padY + innerH * frac;
          const labelVal = Math.round(yMax - yRange * frac);
          return (
            <g key={idx}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#E5E2DA"
                strokeDasharray="3 3"
              />
              <text
                x={padX - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-[#6A786E] text-[10px] font-mono tabular-nums"
              >
                {unitPrefix}
                {labelVal}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#kisansetuAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((p, i) => {
          const isActive = activeIdx === i || (activeIdx === null && i === coords.length - 1);
          return (
            <g key={p.label}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 5.5 : 3.5}
                fill={isActive ? accentColor : '#FFFFFF'}
                stroke={accentColor}
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => setActiveIdx(i)}
              />
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="fill-[#6A786E] text-[10px] font-mono"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
