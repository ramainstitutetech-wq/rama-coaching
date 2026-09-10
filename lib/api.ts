import { NextResponse } from "next/server";
import { connectDB } from "./db";

export async function withDB(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    await connectDB();
    return await handler();
  } catch (err) {
    console.error("[API DB Error]", err);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

export function jsonSuccess(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse(
  items: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
