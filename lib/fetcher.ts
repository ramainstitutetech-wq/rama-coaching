export async function apiGet<T>(url: string): Promise<{ success: boolean; data: T; pagination?: { page:number; limit:number; total:number; totalPages:number } ; error?: string }> {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Fetch failed");
  return json;
}
export async function apiPost(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed");
  return json;
}
export async function apiPut(url: string, body: unknown) {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed");
  return json;
}
export async function apiDelete(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed");
  return json;
}
