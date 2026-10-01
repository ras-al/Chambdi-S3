import React from 'react';
import { MaskGraphic } from './Graphics';
import { LabelBlock } from './CornerLabels';

export function VoteConfirmModal({
  candidate,
  phase,
  onConfirm,
  onCancel,
  actionLoading
}) {
  if (!candidate) return null;

  const roundLabel = phase === 'TOP_5_REVEAL' ? 'ROUND 02' : 'ROUND 01';

  return (
    <div
      className="center-vote-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !actionLoading) {
          onCancel();
        }
      }}
    >
      <div className="center-vote-card card-brutalist blood-shadow">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <MaskGraphic size={90} />
        </div>

        <LabelBlock
          lines={[roundLabel, "TARGET DESIGNATION", "CONFIRMATION REQUIRED"]}
          align="center"
          ruleColor="blood"
        />

        <div style={{ margin: '20px 0 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'var(--grey)', fontWeight: 700 }}>
            YOU ARE VOTING FOR
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
              color: 'var(--blood)',
              lineHeight: 0.95,
              margin: '8px 0',
              textTransform: 'uppercase',
              wordBreak: 'break-word'
            }}
          >
            {candidate.Name}
          </h2>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--ink)'
            }}
          >
            ID: {candidate.Password || candidate.userId}
          </div>
        </div>

        <div
          style={{
            border: '2px solid var(--ink)',
            padding: '14px',
            backgroundColor: 'rgba(158, 27, 23, 0.08)',
            marginBottom: '24px',
            fontSize: '11px',
            letterSpacing: '0.08em',
            fontWeight: 700,
            lineHeight: 1.5,
            color: 'var(--ink)',
            textAlign: 'center'
          }}
        >
          WARNING: ONCE SUBMITTED, YOUR BALLOT CANNOT BE ALTERED OR RESCINDED.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn-brutalist btn-blood"
            onClick={onConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? "RECORDING BALLOT..." : `CONFIRM VOTE (${roundLabel})`}
          </button>

          <button
            type="button"
            className="btn-brutalist btn-outline"
            onClick={onCancel}
            disabled={actionLoading}
          >
            CHANGE SELECTION
          </button>
        </div>
      </div>
    </div>
  );
}
