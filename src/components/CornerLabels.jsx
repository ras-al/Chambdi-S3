import React from 'react';

export function LabelBlock({ lines, align = "left", ruleColor = "ink", className = "" }) {
  return (
    <div className={`label-stack align-${align} ${className}`}>
      {lines.map((line, idx) => (
        <span key={idx}>{line}</span>
      ))}
      <span className={`dash-rule align-${align} ${ruleColor === 'blood' ? 'blood' : ''}`} />
    </div>
  );
}

export function PosterCorners() {
  return (
    <div className="poster-corners" aria-hidden="true">
      {/* Top Left */}
      <div className="corner-tl">
        <LabelBlock
          lines={["CHAMBDI", "SEASON 05", "EST. 2024"]}
          align="left"
        />
      </div>

      {/* Top Right */}
      <div className="corner-tr">
        <LabelBlock
          lines={["SAME", "PEOPLE", "DIFFERENT", "ROLES"]}
          align="right"
          ruleColor="blood"
        />
      </div>

      {/* Edge Middle Left */}
      <div className="edge-ml">
        <LabelBlock
          lines={["TRUST", "NO ONE"]}
          align="left"
        />
      </div>

      {/* Edge Middle Right */}
      <div className="edge-mr">
        <LabelBlock
          lines={["A GAME", "OF PEOPLE"]}
          align="right"
        />
      </div>

      {/* Bottom Left */}
      <div className="corner-bl">
        <LabelBlock
          lines={["SAME GAME", "DIFFERENT FACES"]}
          align="left"
        />
      </div>

      {/* Bottom Right: Handled in page footers with Barcode */}
    </div>
  );
}

export function MobilePosterHeader() {
  return (
    <div className="mobile-poster-strip">
      <span>CHAMBDI S5</span>
      <span style={{ color: 'var(--blood)' }}>TRUST NO ONE</span>
    </div>
  );
}

export function MobilePosterFooter() {
  return (
    <div className="mobile-poster-strip bottom">
      <span>SAME PEOPLE. DIFFERENT ROLES.</span>
      <span>TKMCE</span>
    </div>
  );
}
