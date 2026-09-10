import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
export async function GET() {
  try { await connectDB(); let doc=await Settings.findOne().lean(); if(!doc){ doc=await Settings.create({ instituteName:"Rama Coaching Center", phone:"08299121689", email:"info@ramacoaching.com", address:"Fatehpur, Uttar Pradesh", website:"https://ramacoaching.com", footerText:"© 2026 Rama Coaching Center. All Rights Reserved." }); doc=doc.toObject(); } return NextResponse.json({ success:true, data: doc }); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
export async function PUT(req: Request) {
  try { await connectDB(); const b=await req.json(); let doc=await Settings.findOne(); if(!doc) doc=await Settings.create(b); else { Object.assign(doc,b); await doc.save(); } return NextResponse.json({ success:true, data:doc}); } catch(e){ console.error(e); return NextResponse.json({ success:false, error:"Failed"},{status:500}); }
}
