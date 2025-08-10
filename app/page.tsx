"use client";
import { useMutation } from "@tanstack/react-query";
import { uploadAndAnalyze } from "@/lib/api";
import UploadDropzone from "@/components/UploadDropzone";
import AnalysisView from "@/components/AnalysisView";
import { AnalyzeResponse } from "@/lib/types";
import { useState } from "react";

export default function HomePage() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const mutation = useMutation({ mutationFn: uploadAndAnalyze, onSuccess: (d) => setData(d) });

  return (
    <main className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Analytica</h1>
      <UploadDropzone onSelect={(file) => mutation.mutate(file)} />
      {mutation.isPending && <p className="text-sm text-neutral-600">Analyzing…</p>}
      {mutation.isError && <p className="text-sm text-red-600">Upload failed.</p>}
      {data && <AnalysisView data={data} />}
    </main>
  );
}
