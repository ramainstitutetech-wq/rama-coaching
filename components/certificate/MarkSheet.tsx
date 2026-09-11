import { useEffect, useState } from "react";
import type { CertificateData } from "@/types/certificate";
import { LogoEmblem } from "./DocumentParts";
import { WATERMARK_TEXT } from "./CertificateShell";

const WIDTH = 794;
const HEIGHT = 1123;

export function Marksheet({ data }: { data: CertificateData }) {
  const leftFields: { label: string; value: string }[] = [
    { label: "Roll No. :",      value: data.rollNo },
    { label: "Name:",           value: data.studentName },
    { label: "Father's Name :", value: data.fatherName },
    { label: "Course Code :",   value: data.courseCode },
    { label: "Course Duration :",     value: data.courseDuration },
  ];

  const rightFields: { label: string; value: string }[] = [
    { label: "Enrollment No. :",      value: data.enrollmentNo },
    { label: "Mother Name :",         value: data.motherName },
    { label: "Date Of Completion :",  value: data.completionDate },
    { label: "Training Centre :",     value: data.trainingCenter },
  ];

  const grades = ["A+", "A", "B", "C", "D"];

  const [sigUrls, setSigUrls] = useState<{ sec: string; ctrl: string }>({ sec: "/signature.png", ctrl: "/signature.png" });
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then(r=>r.json()).then(j=>{
      if(j.success && j.data){
        setSigUrls({
          sec: j.data.secretarySignatureUrl || "/signature.png",
          ctrl: j.data.controllerSignatureUrl || "/signature.png",
        });
      }
    }).catch(()=>{});
  }, []);

  // Use student's profile photo if available, otherwise fall back to public avatar PNG
  const photoSrc = data.photoUrl && data.photoUrl.trim() !== ""
    ? data.photoUrl
    : "/student-avatar.png";

  return (
    <div className="doc-shell" style={{ width: WIDTH, height: HEIGHT }}>
      <div className="doc-frame">
        <div className="doc-sheet">
          <div className="tile-wm" aria-hidden="true">
            {WATERMARK_TEXT}
          </div>

          <div className="seal-wm" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="seal-wm-svg">
              <circle cx="100" cy="100" r="96" className="seal-wm-outer" />
              <circle cx="100" cy="100" r="82" className="seal-wm-inner" />
              <text x="100" y="106" className="seal-wm-text">RCCACE</text>
            </svg>
          </div>

          <div className="doc-flow doc-flow-marks">
            <div className="doc-flow-top">
              <div className="doc-flow-header doc-flow-header-marks" style={{ overflow: "visible" }}>
                <div className="doc-header-center" style={{ overflow: "visible" }}>
                  {/* Arched institution name — Old English Blackletter */}
                  <svg className="doc-arch-flow" viewBox="0 0 920 200" aria-hidden="true" style={{ overflow: "visible", width: "100%", padding: "0 10px", boxSizing: "border-box" }}>
                    <defs>
                      <path id="archPathMarks" d="M 45,185 A 470,185 0 0 1 875,185" fill="none" />
                    </defs>
                    <text
                      textLength="890"
                      lengthAdjust="spacing"
                      style={{
                        fontSize: 58,
                        fontFamily: '"Old English Custom", "Old English Text MT", "UnifrakturMaguntia", "Cloister Black", "Engravers Old English", cursive, serif',
                        fontWeight: "normal",
                        letterSpacing: "0.2px",
                      }}
                      fill="#000000"
                    >
                      <textPath
                        href="#archPathMarks"
                        startOffset="50%"
                        textAnchor="middle"
                      >
                        Rama Coaching Centre &amp; Computer Education
                      </textPath>
                    </text>
                  </svg>
                  <div className="doc-recognised" style={{ marginBottom: 1 }}>RECOGNISED BY GOVT. OF INDIA</div>
                  <div style={{ textAlign: "center", fontSize: 10, lineHeight: 1.25, fontWeight: 700, color: "#000", marginTop: 0, letterSpacing: "0.50px" }}>
                    <div>REGISTERED UNDER SOCIETY ACT 1860 REGISTRATION NO. FAT/08168</div>
                    <div>REGISTERED UNDER MICRO SMALL & MEDIUM ENTERPRISES REGISTRATION NO. UDYAM-UP-UP-26-0003221</div>
                    <div>REGISTERED WITH: NITI AAYOG NGO DARPAN GOVT. OF INDIA REGISTRATION NO. UP/2026/1024159</div>
                  </div>
                  <div className="doc-brand">RCCACE</div>
                  <div className="doc-logo">
                    <LogoEmblem />
                  </div>
                </div>

                {/* Student photo — 10% smaller, shifted up */}
                <div className="doc-photo" style={{ width: 70, height: 66, top: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoSrc}
                    alt="Student"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      // If profile URL 404s, fall back to avatar
                      (e.currentTarget as HTMLImageElement).src = "/student-avatar.png";
                    }}
                  />
                </div>
              </div>

              <div className="doc-title-block" style={{ marginTop: 4, marginBottom: 4 }}>
                <div className="doc-msheet-flow" style={{ fontSize: 16, marginBottom: 1 }}>MARKSHEET</div>
                <div className="doc-course-flow" style={{ fontSize: 14 }}>{data.courseName}</div>
              </div>

              <div className="doc-marks-meta" style={{ marginTop: 5, marginBottom: 4, gap: 10 }}>
                <div className="doc-marks-meta-col">
                  {leftFields.map((f) => (
                    <div key={f.label} className="doc-meta-field" style={{ marginBottom: 1.5, lineHeight: 1.35 }}>
                      <span className="doc-field-label" style={{ fontSize: 14.5, fontWeight: 600 }}>{f.label}</span>
                      <span className="doc-field-value" style={{ fontSize: 14, fontWeight: 600 }}>{f.value || "—"}</span>
                    </div>
                  ))}
                </div>
                <div className="doc-marks-meta-col">
                  {rightFields.map((f) => (
                    <div key={f.label} className="doc-meta-field" style={{ marginBottom: 1.5, lineHeight: 1.35 }}>
                      <span className="doc-field-label" style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</span>
                      <span className="doc-field-value" style={{ fontSize: 14, fontWeight: 600 }}>{f.value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <table className="doc-marks" style={{ fontSize: 14, marginTop: 4 }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ padding: "3px 4px" }}>PAPER</th>
                  <th rowSpan={2} style={{ padding: "3px 4px" }}>SUBJECT</th>
                  <th colSpan={2} style={{ padding: "2px 4px" }}>THEORY</th>
                  <th colSpan={2} style={{ padding: "2px 4px" }}>PRACTICAL</th>
                  <th rowSpan={2} style={{ padding: "3px 4px" }}>TOTAL</th>
                  <th rowSpan={2} style={{ padding: "3px 4px" }}>GRADE</th>
                </tr>
                <tr>
                  <th style={{ padding: "2px 4px" }}>MAX</th>
                  <th style={{ padding: "2px 4px" }}>MIN</th>
                  <th style={{ padding: "2px 4px" }}>MAX</th>
                  <th style={{ padding: "2px 4px" }}>MIN</th>
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((s) => (
                  <tr key={s.paper}>
                    <td className="doc-paper">{s.paper}</td>
                    <td className="doc-subject">{s.subject}</td>
                    <td>{s.theoryMax}</td>
                    <td>{s.theoryMin}</td>
                    <td>{s.practicalMax}</td>
                    <td>{s.practicalMin}</td>
                    <td>{s.total}</td>
                    <td>{s.grade}</td>
                  </tr>
                ))}
                {(() => {
                  const theoryMaxTotal = data.subjects.reduce((sum, s) => sum + (Number(s.theoryMax) || 0), 0);
                  const practicalMaxTotal = data.subjects.reduce((sum, s) => sum + (Number(s.practicalMax) || 0), 0);
                  const obtainedTotal = data.subjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
                  const maxTotal = theoryMaxTotal + practicalMaxTotal;
                  const percentage = maxTotal > 0 ? Math.round((obtainedTotal / maxTotal) * 100) : 0;
                  const overallGrade = percentage >= 85 ? "A+" : percentage >= 75 ? "A" : percentage >= 65 ? "B" : percentage >= 55 ? "C" : percentage >= 50 ? "D" : "F";
                  return (
                    <tr className="doc-total-row">
                      <td className="doc-paper" />
                      <td className="doc-subject">TOTAL MARKS</td>
                      <td colSpan={4} style={{ textAlign: "center" }}>{maxTotal}</td>
                      <td>{obtainedTotal}</td>
                      <td>{overallGrade}</td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>

           

            {/* Grade Legend — half width, left aligned */}
            <div style={{ border: "1.2px solid #b91c1c", marginTop: 5, background: "white", width: "52%", marginLeft: 0 }}>
              <div style={{ textAlign: "center", color: "#b91c1c", fontWeight: 700, fontSize: 12, padding: "3px 0", borderBottom: "1.2px solid #b91c1c", letterSpacing: "0.2px", lineHeight: 1.2 }}>
                श्रेणियों का आख्यान GRADE LEGEND
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "center", lineHeight: 1.1 }}>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", fontWeight: 600, width: "20%" }}>ए A+</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", fontWeight: 600, width: "20%" }}>ए A</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", fontWeight: 600, width: "20%" }}>बी B</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", fontWeight: 600, width: "20%" }}>सी C</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", fontWeight: 600, width: "20%" }}>डी D</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", color: "#b91c1c", fontWeight: 700 }}>&gt; 85%</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", color: "#b91c1c", fontWeight: 700 }}>75%–84%</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", color: "#b91c1c", fontWeight: 700 }}>65%–74%</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", color: "#b91c1c", fontWeight: 700 }}>55%–64%</td>
                    <td style={{ border: "1px solid #b91c1c", padding: "2px 0", color: "#b91c1c", fontWeight: 700 }}>50%–54%</td>
                  </tr>
                </tbody>
              </table>
            </div>

             <div className="doc-disclaimer-flow" style={{ fontSize: 9, marginTop: 4, marginBottom: 2, lineHeight: 1.3 }}>
              Disclaimer : The information shown is provisional and provided for the convenience of
              students. The final result will be published after verification by the COE office,
              RCCACE
            </div>

            <div className="doc-flow-footer" style={{ position: "relative", marginTop: 4 }}>
              <div className="doc-footer-left">
                <div>Dated : {data.dated || "—"}</div>
                <div>Place : {data.place || "—"}</div>
              </div>
              <div className="doc-footer-secretary" style={{ textAlign: "center" }}>
                <img src={sigUrls.sec} alt="Secretary Signature" style={{ width: 105, height: 38, objectFit: "contain", marginBottom: 1, display: "block", marginLeft: "auto", marginRight: "auto" }} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/signature.png";}} />
                <span style={{ borderTop: "1px solid #000", paddingTop: 2, display: "inline-block", minWidth: 85, fontSize: 11 }}>Secretary</span>
              </div>
              <div className="doc-footer-controller" style={{ textAlign: "center" }}>
                <span style={{ display: "inline-block", width: 105, height: 38, marginBottom: 1 }} />
                <span style={{ borderTop: "1px solid #000", paddingTop: 2, display: "inline-block", minWidth: 135, fontSize: 11 }}>Controller Of Examination</span>
              </div>
              {/* Stamp — center watermark, closer to signature area */}
              <img src="/stamp.png" alt="Stamp" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 140, height: 140, objectFit: "contain", pointerEvents: "none", opacity: 0.35 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
