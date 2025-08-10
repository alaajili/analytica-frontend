export type ColumnInfo = {
    name: string;
    dtype: string;
    inferred_semantic?: string | null
};

export type NumericStats = {
    count: number;
    mean: number | null;
    std: number | null;
    min: number | null;
    p25: number | null;
    median: number | null;
    p75: number | null;
    max: number | null
};

export type TrendInfo = {
    column: string;
    slope: number;
    r2: number;
    direction?: "up" | "down" | null
};

export type AnalyzeResponse = {
  meta: { filename: string; rows: number; cols: number };
  columns: ColumnInfo[];
  preview: Record<string, any>[];
  missing: Record<string, number>;
  numeric_stats: Record<string, NumericStats>;
  correlations: Record<string, Record<string, number>>;
  trends: TrendInfo[];
  insights: string[];
};
