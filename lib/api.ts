import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function uploadAndAnalyze(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await axios.post(`${API_BASE}/v1/analyze/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return data;
}
