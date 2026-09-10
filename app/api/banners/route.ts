export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Banner from "@/models/Banner";
export async function GET(req: Request) {
  try { await connectDB(); const { searchParams } = new URL(req.url); const q=searchParams.get("search")||""; const filter:any={ deletedAt:{ $exists:false } }; if(q){const r=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"); filter["$or"]=[{ heading:r},{ description:r}];} const items=await Banner.find(filter).sort({ ordering:1, createdAt:-1 }).lean(); const data=items.map((x:any)=>({ id:String(x["_id"]), heading:x["heading"], description:x["description"], buttonText:x["buttonText"], buttonLink:x["buttonLink"], accent:x["accent"], active:x["active"], ordering:x["ordering"]})); return NextResponse.json({ success:true, data }); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
export async function POST(req: Request) {
  try { await connectDB(); const b=await req.json(); if(!b.heading?.trim()) return NextResponse.json({ success:false, error:"Heading required"},{status:400}); const doc=await Banner.create({ heading:b.heading.trim(), description:b.description?.trim()||"", buttonText:b.buttonText?.trim()||"Learn More", buttonLink:b.buttonLink?.trim()||"/courses", accent:b.accent||"#b91c1c", active:b.active??true, ordering:Number(b.ordering)||0 }); return NextResponse.json({ success:true, data:doc},{status:201}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
