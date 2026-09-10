import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try { await connectDB(); const b=await req.json(); const u:any={}; if(b.status) u["status"]=b.status; if(b.name) u["name"]=b.name; const d=await ContactMessage.findOneAndUpdate({ _id:params.id, deletedAt:{ $exists:false }},u,{new:true}); if(!d) return NextResponse.json({ success:false, error:"Not found"},{status:404}); return NextResponse.json({ success:true, data:d}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { await connectDB(); const d=await ContactMessage.findOneAndUpdate({ _id:params.id, deletedAt:{ $exists:false }},{ deletedAt:new Date()},{new:true}); if(!d) return NextResponse.json({ success:false, error:"Not found"},{status:404}); return NextResponse.json({ success:true, message:"Deleted"}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
