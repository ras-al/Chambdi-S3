import React, { useState } from 'react';
import { MaskGraphic } from './Graphics';
import { LabelBlock } from './CornerLabels';

export function AdminGate({ onUnlock, onReturn }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Retrieve password from environment variable with fallback
  const masterPassword = import.meta.env.VITE_ADMIN_PASSWORD || "chambdi5_admin_secret";

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const trimmedInput = (passwordInput || '').trim();

    if (!trimmedInput) {
      setErrorMessage("COMMAND KEY REQUIRED.");
      setSubmitting(false);
      return;
    }

    if (trimmedInput === masterPassword) {
      onUnlock();
    } else {
      setErrorMessage("ACCESS REJECTED. INVALID COMMAND KEY.");
      setPasswordInput('');
    }
    setSubmitting(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '24px 16px'
      }}
    >
      <div
        className="card-brutalist blood-shadow"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: 'clamp(24px, 5vw, 40px)',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <MaskGraphic size={96} />
        </div>

        <LabelBlock
          lines={["RESTRICTED AREA", "CLEARANCE LEVEL 5"]}
          align="center"
          ruleColor="blood"
        />

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: 'var(--ink)',
            margin: '12px 0 6px 0',
            letterSpacing: '0.04em'
          }}
        >
          ADMIN GATEWAY
        </h1>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--grey)',
            marginBottom: '24px'
          }}
        >
          ENTER MASTER PASSWORD TO ACCESS COMMAND CONSOLE
        </p>

        {errorMessage && (
          <div
            style={{
              backgroundColor: 'var(--blood)',
              color: 'var(--paper)',
              padding: '12px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em',
              fontSize: '14px',
              marginBottom: '20px',
              border: '2px solid var(--ink)'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label
              htmlFor="admin-password-input"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                marginBottom: '8px',
                color: 'var(--ink)'
              }}
            >
              ADMIN ACCESS KEY
            </label>
            <input
              id="admin-password-input"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="ENTER ADMIN KEY"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.15em',
                fontWeight: 700,
                border: '3px solid var(--ink)',
                backgroundColor: 'var(--paper)',
                color: 'var(--ink)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-brutalist btn-blood"
            style={{ width: '100%', minHeight: '52px' }}
            disabled={submitting}
          >
            {submitting ? "VERIFYING..." : "UNLOCK COMMAND CONSOLE"}
          </button>

          {onReturn && (
            <button
              type="button"
              className="btn-brutalist btn-outline"
              style={{ width: '100%', minHeight: '44px' }}
              onClick={onReturn}
            >
              RETURN TO PUBLIC ARENA
            </button>
          )}
        </form>

        <div
          style={{
            marginTop: '32px',
            borderTop: '2px dashed var(--grey)',
            paddingTop: '16px',
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'var(--grey)'
          }}
        >
          ALL ACCESS ATTEMPTS ARE RECORDED AND AUDITED
        </div>
      </div>
    </div>
  );
}
