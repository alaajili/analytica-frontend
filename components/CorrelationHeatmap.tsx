"use client";

import { useMemo, useState } from "react";

function CorrelationHeatmap({
  correlations,
  maxCols = 12,
}: {
  correlations: Record<string, Record<string, number>>;
  maxCols?: number;
}) {
  const { keys, matrix } = useMemo(() => {
    const allKeys = Object.keys(correlations || {});
    if (!allKeys.length) return { keys: [] as string[], matrix: [] as number[][] };

    // Ensure symmetric set of keys
    const keySet = new Set(allKeys);
    allKeys.forEach((k) => Object.keys(correlations[k] || {}).forEach((j) => keySet.add(j)));
    let keys = Array.from(keySet);

    // Order by "connectedness": sum of |ρ|
    const score = (k: string) => {
      const row = correlations[k] || {};
      return keys.reduce((acc, kk) => (kk === k ? acc : acc + Math.abs(row[kk] ?? correlations[kk]?.[k] ?? 0)), 0);
    };
    keys = keys
      .map((k) => [k, score(k)] as const)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)
      .slice(0, maxCols);

    // Dense symmetric matrix; diagonal=1
    const matrix = keys.map((r) =>
      keys.map((c) => (r === c ? 1 : (correlations[r]?.[c] ?? correlations[c]?.[r] ?? 0)))
    );
    return { keys, matrix };
  }, [correlations, maxCols]);

  if (!keys.length) return <p className="text-sm text-neutral-500">No correlations to display.</p>;

  // Layout
  const cell = 28; // px
  const padLeft = 140;
  const padTop = 120;
  const w = padLeft + keys.length * cell + 20;
  const h = padTop + keys.length * cell + 36;

  // Blue ↔ White ↔ Red diverging scale for v ∈ [-1, 1]
  const colorFor = (v: number) => {
    const t = Math.max(0, Math.min(1, (v + 1) / 2)); // normalize to 0..1
    const lerp = (a: number, b: number, tt: number) => Math.round(a + (b - a) * tt);
    if (t <= 0.5) {
      const tt = t / 0.5; // 0..1
      const r = lerp(0, 255, tt);
      const g = lerp(90, 255, tt);
      const b = lerp(255, 255, tt);
      return `rgb(${r},${g},${b})`; // blue -> white
    } else {
      const tt = (t - 0.5) / 0.5; // 0..1
      const r = lerp(255, 255, tt);
      const g = lerp(255, 60, tt);
      const b = lerp(255, 60, tt);
      return `rgb(${r},${g},${b})`; // white -> red
    }
  };

  // Simple tooltip
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  return (
    <div className="relative overflow-auto">
      {tip && (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-black/80 px-2 py-1 text-xs text-white"
          style={{ left: tip.x + 12, top: tip.y + 12 }}
        >
          {tip.text}
        </div>
      )}
      <svg width={w} height={h} className="max-w-full">
        {/* Column labels (rotated) */}
        {keys.map((k, j) => (
          <g key={`col-${k}`} transform={`translate(${padLeft + j * cell + cell / 2}, ${padTop - 8}) rotate(-45)`}>
            <text fontSize={11} textAnchor="end" fill="#111827">
              {k}
            </text>
          </g>
        ))}

        {/* Row labels */}
        {keys.map((k, i) => (
          <text
            key={`row-${k}`}
            x={padLeft - 8}
            y={padTop + i * cell + cell * 0.7}
            fontSize={11}
            textAnchor="end"
            fill="#111827"
          >
            {k}
          </text>
        ))}

        {/* Cells */}
        <g>
          {matrix.map((row, i) =>
            row.map((v, j) => {
              const x = padLeft + j * cell;
              const y = padTop + i * cell;
              const label = `${keys[i]} ↔ ${keys[j]}: ${v.toFixed(2)}`;
              return (
                <rect
                  key={`${i}-${j}`}
                  x={x}
                  y={y}
                  width={cell - 1}
                  height={cell - 1}
                  fill={colorFor(v)}
                  stroke="#e5e7eb"
                  onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, text: label })}
                  onMouseLeave={() => setTip(null)}
                />
              );
            })
          )}
        </g>

        {/* Title */}
        <text x={padLeft + (keys.length * cell) / 2} y={20} textAnchor="middle" fontSize={12} fill="#374151">
          Correlation (Pearson ρ)
        </text>

        {/* Legend */}
        <defs>
          <linearGradient id="corrLegend" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorFor(-1)} />
            <stop offset="50%" stopColor={colorFor(0)} />
            <stop offset="100%" stopColor={colorFor(1)} />
          </linearGradient>
        </defs>
        <g transform={`translate(${padLeft}, ${padTop + keys.length * cell + 10})`}>
          <rect width={keys.length * cell} height={12} fill="url(#corrLegend)" rx={4} />
          <text x={0} y={26} fontSize={10} fill="#374151" textAnchor="start">
            -1
          </text>
          <text x={(keys.length * cell) / 2} y={26} fontSize={10} fill="#374151" textAnchor="middle">
            0
          </text>
          <text x={keys.length * cell} y={26} fontSize={10} fill="#374151" textAnchor="end">
            +1
          </text>
        </g>
      </svg>
    </div>
  );
}

export default CorrelationHeatmap;
