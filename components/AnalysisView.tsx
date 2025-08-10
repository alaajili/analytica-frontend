"use client";
import { AnalyzeResponse } from "@/lib/types";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";

export default function AnalysisView({ data }: { data: AnalyzeResponse }) {
  const columns = useMemo(() => Object.keys(data.numeric_stats || {}), [data.numeric_stats]);
  const preview = data.preview || [];

  // Pick X axis: prefer first inferred datetime column, else index
  const datetimeColumn = useMemo(
    () => data.columns.find((c) => c.inferred_semantic === "datetime")?.name,
    [data.columns]
  );

  // First numeric column for a quick trend chart
  const firstNumeric = columns[0];

  // Build chart data
  const chartData = useMemo(() => {
    if (!firstNumeric || !preview.length) return [];
    if (datetimeColumn) {
      return preview.map((row) => {
        const raw = row[datetimeColumn];
        const x = raw ? new Date(raw) : null;
        return { x: x && !isNaN(x.getTime()) ? x : null, y: Number(row[firstNumeric]) };
      }).filter(d => d.x && Number.isFinite(d.y)) as { x: Date; y: number }[];
    }
    return preview.map((row, idx) => ({ x: idx, y: Number(row[firstNumeric]) }))
      .filter(d => Number.isFinite(d.y));
  }, [preview, firstNumeric, datetimeColumn]);

  // Table headers
  const headers = useMemo(() => Object.keys(preview[0] || {}), [preview]);

  return (
    <div className="grid gap-6">
      {/* Insights */}
      <section className="rounded-2xl bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Insights</h2>
        {data.insights?.length ? (
          <ul className="list-disc pl-6 space-y-1">
            {data.insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No insights generated.</p>
        )}
      </section>

      {/* Preview table */}
      <section className="rounded-2xl bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Preview ({data.meta.rows} rows, {data.meta.cols} cols)
        </h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="text-left p-2 border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="odd:bg-neutral-50">
                  {headers.map((h) => (
                    <td key={h} className="p-2 border-b">
                      {String(row[h])}
                    </td>
                  ))}
                </tr>
              ))}
              {!preview.length && (
                <tr>
                  <td className="p-2 text-neutral-500" colSpan={headers.length || 1}>
                    No preview available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trend chart */}
      {firstNumeric && chartData.length > 0 && (
        <section className="rounded-2xl bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Sample Trend ({firstNumeric}{datetimeColumn ? ` vs ${datetimeColumn}` : " vs row index"})
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type={datetimeColumn ? "number" : "category"}
                  domain={datetimeColumn ? ["auto", "auto"] : undefined}
                  tickFormatter={(v: any) =>
                    datetimeColumn && v ? new Date(v).toLocaleDateString() : String(v)
                  }
                  scale={datetimeColumn ? "time" : "auto"}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label: any) =>
                    datetimeColumn && label ? new Date(label).toLocaleString() : String(label)
                  }
                />
                <Line dataKey="y" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Correlation heatmap */}
      {Object.keys(data.correlations || {}).length > 0 && (
        <section className="rounded-2xl bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Correlation Heatmap</h2>
          <CorrelationHeatmap correlations={data.correlations} maxCols={12} />
        </section>
      )}
    </div>
  );
}
