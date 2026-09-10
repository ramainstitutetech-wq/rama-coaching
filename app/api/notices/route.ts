export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notice from "@/models/Notice";
export async function GET(req: Request) {
  try { await connectDB(); const { searchParams }=new URL(req.url); const q=searchParams.get("search")||""; const filter:any={ deletedAt:{ $exists:false }}; if(q){const r=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"); filter["$or"]=[{ title:r},{ description:r}];} const items=await Notice.find(filter).sort({ date:-1 }).lean(); const data=items.map((x:any)=>({ id:String(x["_id"]), title:x["title"], description:x["description"], date:x["date"]?new Date(x["date"] as string).toISOString().slice(0,10):"", priority:x["priority"], published:x["published"]})); return NextResponse.json({ success:true, data}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
export async function POST(req: Request) {
  try { await connectDB(); const b=await req.json(); if(!b.title?.trim()||!b.description?.trim()) return NextResponse.json({ success:false, error:"Missing fields"},{status:400}); const doc=await Notice.create({ title:b.title.trim(), description:b.description.trim(), date:b.date?new Date(b.date):new Date(), priority:b.priority||"normal", published:b.published??true }); return NextResponse.json({ success:true, data:doc},{status:201}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
