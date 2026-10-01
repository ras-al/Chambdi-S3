import React from 'react';

/* Inline paper grain overlay using SVG feTurbulence */
export function PaperGrainOverlay() {
  return (
    <svg className="paper-grain-overlay" aria-hidden="true">
      <filter id="season5-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.04   0 0 0 0 0.04   0 0 0 0 0.04  0 0 0 0.7 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#season5-grain)" />
    </svg>
  );
}

/* Angular flat mask motif: one eye cutout, half ink and half blood red */
export function MaskGraphic({ size = 180, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Season 5 Mask Motif"
    >
      {/* Outer faceted geometric mask frame */}
      <polygon
        points="100,10 185,45 165,150 100,190 35,150 15,45"
        fill="#0B0B0B"
      />
      {/* Right half in blood red */}
      <polygon
        points="100,10 185,45 165,150 100,190"
        fill="#9E1B17"
      />
      {/* Angular facial cut facets */}
      <polygon
        points="100,10 100,80 40,55"
        fill="#1C1C1A"
      />
      <polygon
        points="100,10 100,80 160,55"
        fill="#B8231E"
      />
      {/* Left eye cutout in paper color */}
      <polygon
        points="48,82 86,74 78,98 52,94"
        fill="#E6E4DF"
      />
      {/* Right eye slot in deep dark ink */}
      <polygon
        points="114,74 152,82 148,94 122,98"
        fill="#0B0B0B"
      />
      {/* Geometric mouth slit */}
      <polygon
        points="80,140 120,140 115,148 85,148"
        fill="#0B0B0B"
      />
      {/* Central dividing ink crease */}
      <line
        x1="100"
        y1="10"
        x2="100"
        y2="190"
        stroke="#0B0B0B"
        strokeWidth="3"
      />
    </svg>
  );
}

/* Layered silhouette motif: solid ink head with fading grey duplicates behind */
export function SilhouetteGraphic({ width = 280, height = 240, className = "" }) {
  const headPath = "M90,30 C60,30 35,55 35,90 C35,115 48,135 68,145 L62,190 L158,190 L152,145 C172,135 185,115 185,90 C185,55 160,30 130,30 Z";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Season 5 Silhouette Motif"
    >
      {/* Background silhouette 3 (faintest grey) */}
      <g transform="translate(70, -18)" opacity="0.25">
        <path d={headPath} fill="#6E6C68" />
      </g>
      {/* Background silhouette 2 (mid grey) */}
      <g transform="translate(40, -10)" opacity="0.5">
        <path d={headPath} fill="#6E6C68" />
      </g>
      {/* Foreground silhouette 1 (solid ink with hard edge) */}
      <g transform="translate(10, 0)">
        <path d={headPath} fill="#0B0B0B" />
        {/* Collar line */}
        <line x1="72" y1="190" x2="168" y2="190" stroke="#9E1B17" strokeWidth="4" />
      </g>
    </svg>
  );
}

/* Pure SVG Barcode element */
export function BarcodeGraphic({ text = "ARE YOU ONE OF US?", className = "" }) {
  const bars = [
    4, 2, 6, 2, 8, 3, 2, 5, 2, 7, 3, 2, 6, 4, 2, 8,
    3, 2, 5, 4, 7, 2, 3, 6, 2, 8, 4, 2, 5, 3, 2, 6
  ];

  let currentX = 0;

  return (
    <div className={`barcode-container ${className}`}>
      <svg width="170" height="34" viewBox="0 0 170 34" fill="none">
        {bars.map((w, idx) => {
          const x = currentX;
          currentX += w + ((idx % 2 === 0) ? 2 : 3);
          if (x > 165) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={w}
              height={34}
              fill="#0B0B0B"
            />
          );
        })}
      </svg>
      <span className="barcode-text">{text}</span>
    </div>
  );
}

/* Clean Google G mark in flat SVG */
export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
