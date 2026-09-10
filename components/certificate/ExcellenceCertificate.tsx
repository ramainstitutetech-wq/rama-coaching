import { useEffect, useState } from "react";
import type { CertificateData } from "@/types/certificate";
import { LogoEmblem } from "./DocumentParts";
import { InstitutionBadges } from "./InstitutionBadges";
import { WATERMARK_TEXT } from "./CertificateShell";

const WIDTH = 794;
const HEIGHT = 1123;

export function ExcellenceCertificate({ data }: { data: CertificateData }) {
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

  const fields: { label: string; value: string }[] = [
    { label: "Name Of Student",       value: data.studentName },
    { label: "Father's Name",         value: data.fatherName },
    { label: "Course Code",           value: data.courseCode },
    { label: "Name Of Course",        value: data.courseName },
    { label: "Date Of Completion",    value: data.completionDate },
    { label: "Center Code",           value: data.centerCode },
    { label: "Name Of Training Center", value: data.trainingCenter },
    { label: "Performance",           value: data.performance },
  ];

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

          <div className="doc-flow">
            <div className="doc-flow-top">
              <div className="doc-flow-header" style={{ overflow: "visible" }}>
                {/* Arched institution name — Mangalam College style: Old English Blackletter */}
                <svg className="doc-arch-flow" viewBox="0 0 920 200" aria-hidden="true" style={{ overflow: "visible", width: "100%", padding: "0 18px", boxSizing: "border-box" }}>
                  <defs>
                    <path id="archPathFlow" d="M 45,185 A 470,185 0 0 1 875,185" fill="none" />
                  </defs>
                  <text
                    textLength="800"
                    lengthAdjust="spacing"
                    style={{
                      fontSize: 50,
                      fontFamily: '"Old English Custom", "Old English Text MT", "UnifrakturMaguntia", "Cloister Black", "Engravers Old English", cursive, serif',
                      fontWeight: "normal",
                      letterSpacing: "0.2px",
                    }}
                    fill="#000000"
                  >
                    <textPath
                      href="#archPathFlow"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      Rama Coaching Centre &amp; Computer Education
                    </textPath>
                  </text>
                </svg>
                <div className="doc-recognised">RECOGNISED BY GOVT. OF INDIA</div>
                <div className="doc-brand">RCCACE</div>
                <div className="doc-logo">
                  <LogoEmblem />
                </div>
              </div>

              {/* Meta row: Sl.No + Roll No (left) | Enrollment No (right) */}
              <div className="doc-meta-row">
                <div className="doc-meta-left">
                  <div>
                    <span className="doc-meta-label">क्रम संख्या / Si. No. :</span>
                    <span className="doc-meta-value">{data.slNo || "—"}</span>
                  </div>
                  <div>
                    <span className="doc-meta-label">Roll No. :</span>
                    <span className="doc-meta-value">{data.rollNo || "—"}</span>
                  </div>
                </div>
                <div className="doc-meta-right">
                  <div>
                    <span className="doc-meta-label">Enrollment No. :</span>
                    <span className="doc-meta-value">{data.enrollmentNo || "—"}</span>
                  </div>
                  {/* Certificate number — directly below Enrollment No */}
                  <div style={{ marginTop: 3 }}>
                    <span className="doc-meta-label">Cert. No. :</span>
                    <span
                      className="doc-meta-value"
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: "#1F3354",
                      }}
                    >
                      {data.certificateNumber || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="doc-title-block">
                <div className="doc-coe-flow">Certificate Of Excellence</div>
                <div className="doc-course-flow">{data.courseName}</div>
              </div>
            </div>

            <div className="doc-flow-body">
              {fields.map((f) => (
                <div key={f.label} className="doc-field-pair">
                  <span className="doc-field-label">{f.label}</span>
                  <span className="doc-field-value">{f.value || "—"}</span>
                </div>
              ))}
            </div>

            <InstitutionBadges />

            <div className="doc-flow-footer" style={{ position: "relative" }}>
              <div className="doc-footer-left">
                <div>Dated : {data.dated || "—"}</div>
                <div>Place : {data.place || "—"}</div>
              </div>
              <div className="doc-footer-secretary" style={{ textAlign: "center" }}>
                <img src={sigUrls.sec} alt="Secretary Signature" style={{ width: 105, height: 38, objectFit: "contain", marginBottom: 1, display: "block", marginLeft: "auto", marginRight: "auto" }} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/signature.png";}} />
                <span style={{ borderTop: "1px solid #000", paddingTop: 2, display: "inline-block", minWidth: 85, fontSize: 11 }}>Secretary</span>
              </div>
              <div className="doc-footer-controller" style={{ textAlign: "center" }}>
                <img src={sigUrls.ctrl} alt="Controller Signature" style={{ width: 105, height: 38, objectFit: "contain", marginBottom: 1, display: "block", marginLeft: "auto", marginRight: "auto" }} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/signature.png";}} />
                <span style={{ borderTop: "1px solid #000", paddingTop: 2, display: "inline-block", minWidth: 135, fontSize: 11 }}>Controller Of Examination</span>
              </div>
              {/* Stamp — center watermark */}
              <img src="/stamp.png" alt="Stamp" style={{ position: "absolute", left: "50%", top: "52%", transform: "translate(-50%, -50%)", width: 140, height: 140, objectFit: "contain", pointerEvents: "none", opacity: 0.12 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
