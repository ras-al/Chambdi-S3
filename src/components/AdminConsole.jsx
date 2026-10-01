import React, { useState } from 'react';
import { MaskGraphic } from './Graphics';
import { LabelBlock } from './CornerLabels';

export function AdminConsole({
  resultsPhase,
  candidates,
  onTogglePhase,
  onResetDatabase,
  actionLoading,
  onClose,
  onLock,
  currentUser,
  isAdmin,
  onGoogleSignIn
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  // Statistics
  const totalVotesR1 = candidates.reduce((acc, c) => acc + (c.votes || 0), 0);
  const totalVotesR2 = candidates.reduce((acc, c) => acc + (c.votesPhase2 || 0), 0);
  const playersVotedR1 = candidates.filter(c => c.hasVoted).length;
  const playersVotedR2 = candidates.filter(c => c.hasVotedPhase2).length;

  // Sorted leaders
  const sortedR1 = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="admin-console-page">
      {/* Top Banner */}
      <div className="phase-banner" style={{ borderLeft: '8px solid var(--blood)' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--paper)', opacity: 0.8 }}>
            RESTRICTED ACCESS // COMMAND ONLY
          </div>
          <h1 className="phase-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>
            ADMIN CONSOLE
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <LabelBlock
            lines={[`ACTIVE PHASE: ${resultsPhase}`, "COMMAND CONSOLE"]}
            align="right"
            ruleColor="blood"
          />
          {onLock && (
            <button
              type="button"
              className="btn-brutalist btn-sm btn-blood"
              onClick={onLock}
            >
              LOCK CONSOLE
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="btn-brutalist btn-sm btn-outline"
              style={{ color: 'var(--paper)', borderColor: 'var(--paper)' }}
              onClick={onClose}
            >
              PUBLIC ARENA
            </button>
          )}
        </div>
      </div>

      {/* Admin Authorization Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--ink)',
          color: 'var(--paper)',
          padding: '12px 16px',
          margin: '16px 0 24px 0',
          borderLeft: '4px solid var(--blood)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700 }}>
          {currentUser ? (
            <span>
              GOOGLE ACCOUNT LINKED: <strong style={{ color: 'var(--blood)' }}>{currentUser.email || currentUser.Name}</strong> {isAdmin ? "(VERIFIED ADMIN PRIVILEGES)" : "(STUDENT ACCOUNT)"}
            </span>
          ) : (
            <span>
              ORGANIZER ACCESS ACTIVE (COMMAND KEY VERIFIED)
            </span>
          )}
        </div>

        {!currentUser && onGoogleSignIn && (
          <button
            type="button"
            className="btn-brutalist btn-sm btn-blood"
            onClick={onGoogleSignIn}
            disabled={actionLoading}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            LINK GOOGLE ACCOUNT (240236@TKMCE.AC.IN)
          </button>
        )}
      </div>

      {/* Grid: Phase Control and Live Stats */}
      <div className="admin-dashboard-grid">
        {/* Phase Control Card */}
        <div className="card-brutalist blood-shadow admin-panel-card">
          <LabelBlock
            lines={["PHASE ADVANCEMENT", "GAME STATE"]}
            align="left"
            ruleColor="blood"
          />

          <div style={{ margin: '20px 0' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--grey)' }}>
              CURRENT ACTIVE PHASE
            </span>
            <div
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--blood)',
                margin: '6px 0'
              }}
            >
              {resultsPhase}
            </div>
            <p style={{ fontSize: '12px', letterSpacing: '0.05em', color: 'var(--ink)' }}>
              {resultsPhase === 'VOTING' && "Round 1 is live. All participants can vote for one candidate."}
              {resultsPhase === 'TOP_5_REVEAL' && "Round 2 is live. Voting is restricted to the Top 5 candidates."}
              {resultsPhase === 'FINAL_DECLARE' && "Game concluded. The final winner and runners up are announced."}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resultsPhase === 'VOTING' && (
              <button
                type="button"
                className="btn-brutalist btn-blood"
                onClick={onTogglePhase}
                disabled={actionLoading}
              >
                {actionLoading ? "ADVANCING..." : "ADVANCE TO ROUND 2 (TOP 5 REVEAL)"}
              </button>
            )}

            {resultsPhase === 'TOP_5_REVEAL' && (
              <button
                type="button"
                className="btn-brutalist btn-blood"
                onClick={onTogglePhase}
                disabled={actionLoading}
              >
                {actionLoading ? "DECLARING..." : "DECLARE FINAL WINNER (RESULTS)"}
              </button>
            )}

            {resultsPhase === 'FINAL_DECLARE' && (
              <button
                type="button"
                className="btn-brutalist"
                onClick={onTogglePhase}
                disabled={actionLoading}
              >
                {actionLoading ? "RESETTING..." : "RESET GAME TO ROUND 1 VOTING"}
              </button>
            )}

            <button
              type="button"
              className="btn-brutalist btn-outline"
              style={{ fontSize: '1rem', minHeight: '44px' }}
              onClick={onTogglePhase}
              disabled={actionLoading}
            >
              CYCLE NEXT PHASE MANUALLY
            </button>
          </div>
        </div>

        {/* Live Metrics Card */}
        <div className="card-brutalist admin-panel-card">
          <LabelBlock
            lines={["BALLOT METRICS", "REALTIME AUDIT"]}
            align="left"
          />

          <div className="admin-stats-row" style={{ marginTop: '20px' }}>
            <div className="stat-box">
              <span className="stat-label">ROUND 1 VOTES</span>
              <span className="stat-num">{totalVotesR1}</span>
              <span className="stat-sub">{playersVotedR1} / {candidates.length} VOTED</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">ROUND 2 VOTES</span>
              <span className="stat-num" style={{ color: 'var(--blood)' }}>{totalVotesR2}</span>
              <span className="stat-sub">{playersVotedR2} / {candidates.length} VOTED</span>
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '2px solid var(--ink)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', fontWeight: 700 }}>
              ROUND 1 LEADER
            </span>
            <div
              className="font-display"
              style={{ fontSize: '1.4rem', color: 'var(--ink)', margin: '4px 0' }}
            >
              {sortedR1[0]?.Name || "NONE"}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--blood)', fontWeight: 700 }}>
              {sortedR1[0]?.votes || 0} VOTES RECORDED
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone: Database Reset */}
      <div className="card-brutalist" style={{ marginTop: '32px', borderColor: 'var(--blood)' }}>
        <LabelBlock
          lines={["DANGER ZONE", "SYSTEM REINITIALIZATION"]}
          align="left"
          ruleColor="blood"
        />

        <div style={{ margin: '16px 0' }}>
          <h2
            className="font-display"
            style={{ fontSize: '1.8rem', color: 'var(--blood)', margin: '4px 0' }}
          >
            RESET ALL GAME DATA
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.6 }}>
            This clears all Round 1 and Round 2 votes, sets all player voting flags to false,
            resets the phase to VOTING, and reloads the 78 students from the initial roster.
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            className="btn-brutalist btn-blood"
            style={{ maxWidth: '320px' }}
            onClick={() => setConfirmReset(true)}
            disabled={actionLoading}
          >
            INITIALIZE SYSTEM RESET
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-brutalist btn-blood"
              style={{ backgroundColor: '#000', borderColor: 'var(--blood)' }}
              onClick={async () => {
                await onResetDatabase();
                setConfirmReset(false);
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "RESETTING SYSTEM..." : "CONFIRM FULL RESET NOW"}
            </button>
            <button
              type="button"
              className="btn-brutalist btn-outline"
              onClick={() => setConfirmReset(false)}
            >
              CANCEL
            </button>
          </div>
        )}
      </div>

      {/* Top 5 Leaderboard Preview */}
      <div style={{ marginTop: '40px' }}>
        <div className="runners-up-title">
          <span>REALTIME CANDIDATE RANKINGS</span>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', fontFamily: 'var(--font-body)' }}>
            TOP CANDIDATES
          </span>
        </div>

        <div className="candidate-stack">
          {sortedR1.slice(0, 10).map((cand, idx) => (
            <div key={cand.id} className="candidate-row" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="font-display" style={{ fontSize: '1.5rem', color: idx < 5 ? 'var(--blood)' : 'var(--grey)' }}>
                  #{idx + 1}
                </span>
                <div>
                  <div className="candidate-name" style={{ fontSize: '1.25rem' }}>{cand.Name}</div>
                  <div className="candidate-roll">{cand.Password || cand.userId}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink)' }}>
                  R1: {cand.votes || 0}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--blood)' }}>
                  R2: {cand.votesPhase2 || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
