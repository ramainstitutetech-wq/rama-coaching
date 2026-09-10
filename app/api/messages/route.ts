export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
export async function GET(req: Request) {
  try { await connectDB(); const { searchParams }=new URL(req.url); const q=searchParams.get("search")||""; const status=searchParams.get("status")||""; const page=Math.max(1,parseInt(searchParams.get("page")||"1",10)); const limit=Math.min(100,Math.max(1,parseInt(searchParams.get("limit")||"50",10))); const skip=(page-1)*limit; const filter:any={ deletedAt:{ $exists:false }}; if(q){const r=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"); filter["$or"]=[{ name:r},{ email:r},{ message:r}];} if(status) filter["status"]=status; const [items,total]=await Promise.all([ContactMessage.find(filter).sort({ createdAt:-1 }).skip(skip).limit(limit).lean(), ContactMessage.countDocuments(filter)]); const data=items.map((x:any)=>({ id:String(x["_id"]), name:x["name"], email:x["email"], phone:x["phone"], message:x["message"], date:x["date"]?new Date(x["date"] as string).toISOString().slice(0,10):"", status:x["status"], createdAt:x["createdAt"]})); return NextResponse.json({ success:true, data, pagination:{ page, limit, total, totalPages:Math.ceil(total/limit)}}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
export async function POST(req: Request) {
  try { await connectDB(); const b=await req.json(); if(!b.name?.trim()||!b.email?.trim()||!b.message?.trim()) return NextResponse.json({ success:false, error:"Missing fields"},{status:400}); const doc=await ContactMessage.create({ name:b.name.trim(), email:b.email.trim().toLowerCase(), phone:b.phone?.trim()||"", message:b.message.trim(), status:"unread", date:new Date() }); return NextResponse.json({ success:true, data:doc},{status:201}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
