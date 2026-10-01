import React from 'react';

export function LoadingScreen({ text = "CHAMBDI" }) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div className="loading-chambdi">
        <span>{text}</span>
        <span className="blinking-cursor" aria-hidden="true" />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.25em',
          color: 'var(--grey)',
          marginTop: '16px'
        }}
      >
        INITIALIZING SYSTEM
      </div>
    </div>
  );
}
