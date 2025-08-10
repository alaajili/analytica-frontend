"use client";

import { useRef, useState } from "react";

export default function UploadDropzone({ onSelect }: { onSelect: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0]; if (f) onSelect(f);
      }}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${drag ? "bg-neutral-100" : "bg-white"}`}
      onClick={() => ref.current?.click()}
    >
      <p className="text-lg font-medium">Drop CSV/Excel/Parquet here or click to upload</p>
      <input ref={ref} type="file" className="hidden" accept=".csv,.tsv,.xlsx,.xls,.parquet" onChange={(e) => {
        const f = e.target.files?.[0]; if (f) onSelect(f);
      }}/>
    </div>
  );
}
