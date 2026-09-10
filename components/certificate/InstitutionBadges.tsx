// Uses actual PNG/SVG assets from /public for MSME, ISO 9001, and NITI Aayog badges.
// eslint-disable-next-line @next/next/no-img-element
export function InstitutionBadges() {
  return (
    <div className="doc-badges" aria-hidden="true">
      {/* MSME */}
      <div className="doc-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/msme.png"
          alt="MSME"
          className="doc-badge-svg"
          style={{ objectFit: "contain" }}
        />
        <span className="doc-badge-text">
          MICRO, SMALL &amp; MEDIUM
          <br />
          ENTERPRISES · MSME
        </span>
      </div>

      {/* ISO 9001 */}
      <div className="doc-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/iso.png"
          alt="ISO 9001 Certified Company"
          className="doc-badge-svg"
          style={{ objectFit: "contain" }}
        />
        <span className="doc-badge-text">CERTIFIED COMPANY</span>
      </div>

      {/* NITI Aayog */}
      <div className="doc-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/niti-aayog.svg"
          alt="NITI Aayog"
          className="doc-badge-svg"
          style={{ objectFit: "contain" }}
        />
        <span className="doc-badge-text">नीति आयोग · NITI AAYOG</span>
      </div>
    </div>
  );
}
