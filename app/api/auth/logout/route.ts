export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.delete("rama_token");
  res.cookies.set("rama_token", "", { maxAge: 0, path: "/" });
  return res;
}
