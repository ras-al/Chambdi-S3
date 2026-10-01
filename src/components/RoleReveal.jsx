import React, { useState } from 'react';
import { MaskGraphic } from './Graphics';
import { LabelBlock } from './CornerLabels';

export function RoleReveal({ user, onClose }) {
  const [revealed, setRevealed] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('testScreen') === 'role_revealed';
    }
    return false;
  });

  // Role resolution: check user.role or fallback to default social deduction role
  const roleName = (user?.role || "CIVILIAN").toUpperCase();
  const isHostile = roleName.includes("CHAMBDI") ||
    roleName.includes("TRAITOR") ||
    roleName.includes("IMPOSTOR") ||
    roleName.includes("KILLER");

  return (
    <div
      className="fullscreen-overlay"
      style={{
        backgroundColor: '#0B0B0B',
        color: '#E6E4DF',
        zIndex: 300,
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px'
        }}
      >
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <MaskGraphic size={160} />
        </div>

        <LabelBlock
          lines={["SEASON 05", "CLASSIFIED DOSSIER", "EYES ONLY"]}
          align="center"
          ruleColor="blood"
          className="text-paper"
        />

        {!revealed ? (
          <div style={{ marginTop: '32px', width: '100%' }}>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                lineHeight: 0.9,
                color: '#E6E4DF',
                marginBottom: '16px'
              }}
            >
              IDENTITY CONCEALED
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#6E6C68',
                marginBottom: '40px'
              }}
            >
              TOUCH SCREEN TO DECRYPT YOUR ASSIGNED ROLE
            </p>

            <button
              type="button"
              className="btn-brutalist btn-blood"
              onClick={() => setRevealed(true)}
              style={{ maxWidth: '420px', margin: '0 auto' }}
            >
              HOLD TO REVEAL IDENTITY
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '32px', width: '100%' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: '#6E6C68',
                marginBottom: '8px'
              }}
            >
              CONFIRMED IDENTITY FOR: {user?.Name} ({user?.Password || user?.userId})
            </div>

            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(3.5rem, 13vw, 8.5rem)',
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
                color: isHostile ? 'var(--blood)' : 'var(--paper)',
                margin: '16px 0 20px'
              }}
            >
              {roleName}
            </h1>

            <div
              style={{
                border: '2px solid #E6E4DF',
                padding: '20px',
                backgroundColor: '#141414',
                maxWidth: '540px',
                margin: '0 auto 36px',
                textAlign: 'left'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  color: isHostile ? 'var(--blood)' : '#E6E4DF',
                  marginBottom: '8px'
                }}
              >
                MISSION DIRECTIVE
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#E6E4DF',
                  letterSpacing: '0.08em',
                  margin: 0
                }}
              >
                {isHostile
                  ? "YOU ARE THE DESIGNATED TARGET. EVADE SUSPICION. MISDIRECT VOTES. CONVINCE THE CLASS YOU ARE INNOCENT."
                  : "IDENTIFY AND EXPOSE THE CHAMBDI BEFORE TIME RUNS OUT. TRUST NO ONE. QUESTION EVERY VOTE."}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', maxWidth: '440px', margin: '0 auto', width: '100%', flexDirection: 'column' }}>
              <button
                type="button"
                className="btn-brutalist"
                onClick={() => setRevealed(false)}
                style={{ backgroundColor: '#222', borderColor: '#444' }}
              >
                CONCEAL IDENTITY
              </button>

              <button
                type="button"
                className="btn-brutalist btn-blood"
                onClick={onClose}
              >
                ENTER VOTING ARENA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
