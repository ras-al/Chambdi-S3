import React from 'react';
import { MaskGraphic, BarcodeGraphic } from './Graphics';
import { LabelBlock } from './CornerLabels';

export function AccessDenied({ onRetry, detail }) {
  return (
    <div className="access-denied-screen">
      <div className="card-brutalist blood-shadow" style={{ maxWidth: '640px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <MaskGraphic size={140} />
        </div>

        <LabelBlock
          lines={["SECURITY", "CLEARANCE", "FAILED"]}
          align="center"
          ruleColor="blood"
        />

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            color: 'var(--blood)',
            lineHeight: 0.92,
            margin: '24px 0 16px',
            letterSpacing: '-0.02em'
          }}
        >
          ACCESS DENIED.
          <br />
          YOU ARE NOT ON THE LIST.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'var(--ink)',
            marginBottom: '32px',
            lineHeight: 1.6
          }}
        >
          {detail || "ONLY VERIFIED @TKMCE.AC.IN STUDENTS ENROLLED IN THE S5 REGISTRY ARE AUTHORIZED."}
        </p>

        <button
          type="button"
          className="btn-brutalist btn-blood"
          onClick={onRetry}
          style={{ marginBottom: '24px' }}
        >
          TRY ANOTHER ACCOUNT
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', borderTop: '2px solid var(--ink)', paddingTop: '16px' }}>
          <LabelBlock lines={["CODE: 403", "UNAUTHORIZED"]} align="left" />
          <BarcodeGraphic text="RESTRICTED ENTRY" />
        </div>
      </div>
    </div>
  );
}
