export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PageImage from "@/models/PageImage";

// Default registry of all configurable page images
const DEFAULTS: { pageKey: string; imageKey: string; label: string; imageUrl: string }[] = [
  // Home page
  { pageKey: "home", imageKey: "heroBanner",    label: "Home — Hero Banner (Slider Image)",    imageUrl: "https://lakshaygroupedu.co.in/img/a215/CMS/215Z8YisHX6YPf1lWsSlider.jpeg" },
  { pageKey: "home", imageKey: "bePartOfUs",    label: "Home — Be Part of Us Section Image",    imageUrl: "https://lakshaygroupedu.co.in/img/a215/CMS/2156zgXAoXRGxKypyfSideImg.png" },
  // About page
  { pageKey: "about", imageKey: "heroBg",       label: "About — Hero Background Image",         imageUrl: "https://lakshaygroupedu.co.in/assets/images/bg3.jpg" },
  // Courses page
  { pageKey: "courses", imageKey: "heroBg",     label: "Courses — Hero Background Image",       imageUrl: "https://lakshaygroupedu.co.in/img/a215/CMS/215Z8YisHX6YPf1lWsSlider.jpeg" },
  // Contact page
  { pageKey: "contact", imageKey: "heroBg",     label: "Contact — Hero Background Image",       imageUrl: "https://lakshaygroupedu.co.in/assets/images/bg3.jpg" },
  // Franchise page
  { pageKey: "franchise", imageKey: "heroBg",   label: "Franchise — Hero Background Image",     imageUrl: "https://lakshaygroupedu.co.in/assets/images/bg3.jpg" },
  { pageKey: "franchise", imageKey: "sideImg",  label: "Franchise — Apply Section Side Image",  imageUrl: "https://lakshaygroupedu.co.in/assets/images/achive/01.png" },
  // Verification page
  { pageKey: "verification", imageKey: "heroBg", label: "Verification — Hero Background Image", imageUrl: "https://lakshaygroupedu.co.in/assets/images/bg3.jpg" },
  // Login page
  { pageKey: "login", imageKey: "bg",           label: "Login — Background Image",              imageUrl: "/login-bg.jpg" },
  // Mock Test page
  { pageKey: "mocktest", imageKey: "heroBanner", label: "Mock Test — Hero Banner Image",         imageUrl: "https://i0.wp.com/gyanxp.com/wp-content/uploads/2025/02/page-banner-1.webp?fit=1523%2C269&ssl=1" },
];

export async function GET() {
  try {
    await connectDB();

    // Upsert defaults so every key always exists
    for (const d of DEFAULTS) {
      await PageImage.findOneAndUpdate(
        { pageKey: d.pageKey, imageKey: d.imageKey },
        { $setOnInsert: { label: d.label, imageUrl: d.imageUrl } },
        { upsert: true, new: false }
      );
    }

    const docs = await PageImage.find().sort({ pageKey: 1, imageKey: 1 }).lean();
    return NextResponse.json({ success: true, data: docs.map((d: any) => ({
      id: String(d._id),
      pageKey: d.pageKey,
      imageKey: d.imageKey,
      label: d.label,
      imageUrl: d.imageUrl,
      updatedAt: d.updatedAt,
    }))});
  } catch (e) {
    console.error("[page-images GET]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { pageKey, imageKey, imageUrl } = await req.json();
    if (!pageKey || !imageKey || !imageUrl) {
      return NextResponse.json({ success: false, error: "pageKey, imageKey and imageUrl are required" }, { status: 400 });
    }
    const doc = await PageImage.findOneAndUpdate(
      { pageKey, imageKey },
      { imageUrl },
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    console.error("[page-images PUT]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
