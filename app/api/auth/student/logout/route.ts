import { NextResponse } from "next/server";
export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.delete("student_token");
  res.cookies.set("student_token", "", { maxAge: 0, path: "/" });
  return res;
}
