import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Achievement from "@/models/Achievement";
export async function GET() {
  try { await connectDB(); const items=await Achievement.find({ deletedAt:{ $exists:false }}).sort({ ordering:1, createdAt:-1 }).lean(); const data=items.map((x:any)=>({ id:String(x["_id"]), value:x["value"], label:x["label"], description:x["description"], icon:x["icon"], status:x["status"], ordering:x["ordering"]})); return NextResponse.json({ success:true, data }); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
export async function POST(req: Request) {
  try { await connectDB(); const b=await req.json(); if(!b.value?.trim()||!b.label?.trim()) return NextResponse.json({ success:false, error:"Value and label required"},{status:400}); const doc=await Achievement.create({ value:b.value.trim(), label:b.label.trim(), description:b.description||"", icon:b.icon||"Star", status:b.status||"active", ordering:Number(b.ordering)||0 }); return NextResponse.json({ success:true, data:doc},{status:201}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
