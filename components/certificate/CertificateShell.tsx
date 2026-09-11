import type { ReactNode } from "react";
import { LogoEmblem } from "./DocumentParts";

export const WATERMARK_TEXT = Array(420).fill("RCCACE").join(" ");

export function CertificateShell({
  width,
  height,
  footerSecretary = "Secretary",
  footerController = "Controller Of Examination",
  dated,
  place,
  children,
}: {
  width: number;
  height: number;
  footerSecretary?: string;
  footerController?: string;
  dated: string;
  place: string;
  children: ReactNode;
}) {
  return (
    <div className="doc-shell" style={{ width, height }}>
      <div className="doc-frame">
        <div className="doc-sheet">
          <div className="tile-wm" aria-hidden="true">
            {WATERMARK_TEXT}
          </div>

          <div className="seal-wm" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="seal-wm-svg">
              <circle cx="100" cy="100" r="96" className="seal-wm-outer" />
              <circle cx="100" cy="100" r="82" className="seal-wm-inner" />
              <text x="100" y="106" className="seal-wm-text">
                RCCACE
              </text>
            </svg>
          </div>

          <div className="doc-content" style={{ overflow: "visible" }}>
            <svg className="doc-arch" viewBox="0 0 920 200" aria-hidden="true" style={{ overflow: "visible", width: "100%", padding: "0 18px", boxSizing: "border-box" }}>
              <defs>
                <path
                  id="archPath"
                  d="M 45,185 A 470,185 0 0 1 875,185"
                  fill="none"
                />
              </defs>
              <text
                textLength="800"
                lengthAdjust="spacing"
                style={{
                  fontSize: 46,
                  fontFamily: '"Old English Custom", "Old English Text MT", "UnifrakturMaguntia", "Cloister Black", "Engravers Old English", cursive, serif',
                  fontWeight: "bold",
                  letterSpacing: "0.2px",
                }}
                fill="#000000"
              >
                <textPath
                  href="#archPath"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  Rama Coaching Centre &amp; Computer Education
                </textPath>
              </text>
            </svg>

            <div className="doc-recognised">RECOGNISED BY GOVT. OF INDIA</div>
            <div style={{ position: "absolute", top: 186, width: "100%", textAlign: "center", fontSize: 7, lineHeight: 1.25, fontWeight: 700, color: "#000", letterSpacing: "0.12px" }}>
              <div>REGISTERED UNDER SOCIETY ACT 1860 REGISTRATION NO. FAT/08168</div>
              <div>REGISTERED UNDER MICRO SMALL & MEDIUM ENTERPRISES REGISTRATION NO. UDYAM-UP-UP-26-0003221</div>
              <div>REGISTERED WITH: NITI AAYOG NGO DARPAN GOVT. OF INDIA REGISTRATION NO. UP/2026/1024159</div>
            </div>
            <div className="doc-brand">RCCACE</div>

            <div className="doc-logo" aria-hidden="true">
              <LogoEmblem />
            </div>

            {children}

            <div className="doc-footer">
              <div className="doc-footer-dated">Dated : {dated || "—"}</div>
              <div className="doc-footer-row">
                <div className="doc-footer-place">Place: {place || "—"}</div>
                <div className="doc-footer-secretary">{footerSecretary}</div>
                <div className="doc-footer-controller">{footerController}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
