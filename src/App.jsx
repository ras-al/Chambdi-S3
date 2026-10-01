import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider } from './firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection, doc, getDoc, updateDoc,
  increment, writeBatch, onSnapshot, setDoc, query, where, getDocs
} from 'firebase/firestore';
import { initialUsers } from './data';
import {
  PaperGrainOverlay,
  MaskGraphic,
  SilhouetteGraphic,
  BarcodeGraphic,
  GoogleIcon
} from './components/Graphics';
import {
  PosterCorners,
  LabelBlock,
  MobilePosterHeader,
  MobilePosterFooter
} from './components/CornerLabels';
import { AccessDenied } from './components/AccessDenied';
import { LoadingScreen } from './components/LoadingScreen';
import { RoleReveal } from './components/RoleReveal';
import { AdminConsole } from './components/AdminConsole';
import { AdminGate } from './components/AdminGate';
import { VoteConfirmModal } from './components/VoteConfirmModal';
import './App.css';

// Season 5 Game Phases
const PHASE_VOTING = "VOTING";
const PHASE_TOP_5_REVEAL = "TOP_5_REVEAL";
const PHASE_FINAL_DECLARE = "FINAL_DECLARE";

// Admin admission numbers or email overrides
const ADMIN_ADMISSION_NUMBERS = ["240236"]; // Rasal Musthafa (Owner)

function App() {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const testScreen = params.get('testScreen');
      if (testScreen && testScreen !== 'access_denied') {
        return {
          userId: "240236",
          docId: "240236",
          Password: "B24CSA49",
          Name: "RASAL MUSTHAFA",
          email: "240236@tkmce.ac.in",
          uid: "mock-uid-240236",
          role: "CHAMBDI",
          votes: 14,
          votesPhase2: 28,
          hasVoted: false,
          hasVotedPhase2: false,
          isAdmin: true
        };
      }
    }
    return null;
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('testScreen')) return false;
    }
    return true;
  });

  const [authError, setAuthError] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('testScreen') === 'access_denied') {
        return {
          title: "ACCESS DENIED. YOU ARE NOT ON THE LIST.",
          detail: "Admission number 999999 is not enrolled in the Chambdi registry."
        };
      }
    }
    return null;
  });

  const [selectedCandidate, setSelectedCandidate] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('testCandidate')) {
        return {
          id: "240251",
          Name: "ABHISHEK MOHAN",
          Password: "B24CSA02"
        };
      }
    }
    return null;
  });
  const [resultsPhase, setResultsPhase] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('testScreen') === 'results') return PHASE_FINAL_DECLARE;
    }
    return PHASE_VOTING;
  });

  const [top5Candidates, setTop5Candidates] = useState([]);
  const [showRoleReveal, setShowRoleReveal] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('testScreen');
      return s === 'role_reveal' || s === 'role_revealed';
    }
    return false;
  });

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      return (
        path === '/admin' ||
        path === '/admin/' ||
        hash === '#/admin' ||
        hash === '#admin' ||
        params.get('screen') === 'admin' ||
        params.get('admin') === 'true' ||
        params.get('testScreen') === 'admin'
      );
    }
    return false;
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('adminAuth') === 'true') return true;
      return sessionStorage.getItem('chambdi_s5_admin_unlocked') === 'true';
    }
    return false;
  });

  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('testScreen');
      if (s === 'lobby') return 'roster';
    }
    return 'arena';
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Sync browser pathname, hash, and history changes for admin routing
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const isAdm = (
        path === '/admin' ||
        path === '/admin/' ||
        hash === '#/admin' ||
        hash === '#admin' ||
        params.get('screen') === 'admin' ||
        params.get('admin') === 'true' ||
        params.get('testScreen') === 'admin'
      );
      setIsAdminRoute(isAdm);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToPublic = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      setIsAdminRoute(false);
    }
  };

  const handleUnlockAdmin = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chambdi_s5_admin_unlocked', 'true');
    }
    setIsAdminUnlocked(true);
  };

  const handleLockAdmin = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chambdi_s5_admin_unlocked');
    }
    setIsAdminUnlocked(false);
  };

  // Handle mobile redirect sign-in results on initial mount
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect sign-in error:", error);
      if (error.code !== 'auth/credential-already-in-use') {
        setAuthError({
          title: "SIGN IN FAILED",
          detail: error.message
        });
      }
    });
  }, []);

  // Realtime listeners for game configuration and candidates
  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "meta", "config"), (docSnap) => {
      if (docSnap.exists()) {
        setResultsPhase(docSnap.data().phase || PHASE_VOTING);
      } else {
        setResultsPhase(PHASE_VOTING);
      }
    });

    const q = query(collection(db, "users"));
    const unsubUsers = onSnapshot(q, (snapshot) => {
      let cands = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Sort all candidates by roll number (Password field from student records)
      cands.sort((a, b) => ((a.Password || "").localeCompare(b.Password || "")));
      setCandidates(cands);

      // Top 5 candidates based on Round 1 votes
      const sortedByRound1 = [...cands].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setTop5Candidates(sortedByRound1.slice(0, 5));
    }, (error) => {
      console.warn("Firestore snapshot notice:", error);
    });

    return () => {
      unsubConfig();
      unsubUsers();
    };
  }, []);

  // Firebase Auth listener with TKMCE domain and roster verification
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Preserve test preview screen if requested in URL
      if (typeof window !== 'undefined' && window.location.search.includes('testScreen')) {
        return;
      }

      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const rawEmail = (currentUser.email || "").toLowerCase().trim();
        const emailParts = rawEmail.split("@");

        // Rule 1: Email must be strictly <admission_number>@tkmce.ac.in
        if (emailParts.length !== 2 || emailParts[1] !== "tkmce.ac.in") {
          await signOut(auth);
          setAuthError({
            title: "ACCESS DENIED. YOU ARE NOT ON THE LIST.",
            detail: `Unauthorized domain (${emailParts[1] || 'unknown'}). Only @tkmce.ac.in accounts are permitted.`
          });
          setUser(null);
          setLoading(false);
          return;
        }

        const admissionNumber = emailParts[0];

        // Rule 3: Look up student in existing users collection by admission number
        let studentDoc = null;

        // Try direct lookup with document ID
        const docRefDirect = doc(db, "users", admissionNumber);
        const docSnapDirect = await getDoc(docRefDirect);

        if (docSnapDirect.exists()) {
          studentDoc = { docId: docSnapDirect.id, ref: docRefDirect, data: docSnapDirect.data() };
        } else {
          // Fallback query for string or number userId
          const qUserId = query(
            collection(db, "users"),
            where("userId", "in", [admissionNumber, Number(admissionNumber) || admissionNumber])
          );
          const qSnap = await getDocs(qUserId);
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            studentDoc = { docId: first.id, ref: first.ref, data: first.data() };
          }
        }

        // Rule 4: If not found in student collection, sign out and show access denied
        if (!studentDoc) {
          await signOut(auth);
          setAuthError({
            title: "ACCESS DENIED. YOU ARE NOT ON THE LIST.",
            detail: `Admission number ${admissionNumber.toUpperCase()} is not enrolled in the Chambdi registry.`
          });
          setUser(null);
          setLoading(false);
          return;
        }

        // Rule 5: Attach uid and email if missing without creating duplicate documents
        const existingData = studentDoc.data;
        if (!existingData.uid || existingData.uid !== currentUser.uid || !existingData.email) {
          try {
            await updateDoc(studentDoc.ref, {
              uid: currentUser.uid,
              email: currentUser.email
            });
          } catch (updateErr) {
            console.warn("Could not update student metadata:", updateErr);
          }
        }

        setUser({
          ...existingData,
          docId: studentDoc.docId,
          email: currentUser.email,
          uid: currentUser.uid,
          hasVoted: existingData.hasVoted || false,
          hasVotedPhase2: existingData.hasVotedPhase2 || false
        });
        setAuthError(null);
      } catch (err) {
        console.error("Auth verification error:", err);
        setAuthError({
          title: "AUTHENTICATION ERROR",
          detail: err.message || "Failed to verify student credentials."
        });
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Derive real-time user fields from candidates listener
  const currentUser = user ? {
    ...user,
    ...(candidates.find(c => c.id === user.docId || c.userId === user.userId) || {})
  } : null;

  // Google sign in with popup and fallback to redirect
  const handleGoogleSignIn = async () => {
    setActionLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          setAuthError({
            title: "SIGN IN FAILED",
            detail: redirectError.message
          });
        }
      } else {
        setAuthError({
          title: "SIGN IN FAILED",
          detail: error.message
        });
      }
    }
    setActionLoading(false);
  };

  // Sign out
  const handleSignOut = async () => {
    setActionLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setSelectedCandidate(null);
    } catch (err) {
      alert("Sign out failed: " + err.message);
    }
    setActionLoading(false);
  };

  // Check admin status
  const isAdmin = Boolean(
    currentUser && (
      currentUser.isAdmin === true ||
      currentUser.role === 'admin' ||
      ADMIN_ADMISSION_NUMBERS.includes(String(currentUser.userId)) ||
      ADMIN_ADMISSION_NUMBERS.includes(String(currentUser.docId)) ||
      (currentUser.email && currentUser.email.startsWith("240236@"))
    )
  );

  // Voting logic
  const handleVote = async () => {
    if (!selectedCandidate || !currentUser) return;

    let voteField;
    let userUpdateField;

    if (resultsPhase === PHASE_VOTING) {
      voteField = 'votes';
      userUpdateField = 'hasVoted';
    } else if (resultsPhase === PHASE_TOP_5_REVEAL) {
      voteField = 'votesPhase2';
      userUpdateField = 'hasVotedPhase2';
    } else {
      alert("Voting is currently closed.");
      return;
    }

    if (currentUser[userUpdateField]) {
      alert(`You have already voted in ${resultsPhase === PHASE_VOTING ? 'Round 1' : 'Round 2'}.`);
      return;
    }

    setActionLoading(true);
    try {
      const candidateRef = doc(db, "users", selectedCandidate.id);
      const userRef = doc(db, "users", currentUser.docId);

      await updateDoc(candidateRef, { [voteField]: increment(1) });
      await updateDoc(userRef, { [userUpdateField]: true });

      setUser(prev => ({ ...prev, [userUpdateField]: true }));
      setSelectedCandidate(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting vote: " + err.message);
    }
    setActionLoading(false);
  };

  // Admin: Phase progression
  const toggleResults = async () => {
    const configRef = doc(db, "meta", "config");
    setActionLoading(true);
    try {
      const snap = await getDoc(configRef);
      const currentPhase = snap.exists() ? snap.data().phase : PHASE_VOTING;
      let nextPhase;

      if (currentPhase === PHASE_VOTING) {
        nextPhase = PHASE_TOP_5_REVEAL;
      } else if (currentPhase === PHASE_TOP_5_REVEAL) {
        nextPhase = PHASE_FINAL_DECLARE;
      } else {
        nextPhase = PHASE_VOTING;
      }

      await setDoc(configRef, { phase: nextPhase }, { merge: true });
      setSelectedCandidate(null);
    } catch (err) {
      alert("Error toggling phase: " + err.message);
    }
    setActionLoading(false);
  };

  // Admin: Initialize / Reset database roster
  const initializeDatabase = async () => {
    if (!window.confirm("CONFIRM SYSTEM RESET: All votes will be reset to 0 and phase set to VOTING.")) {
      return;
    }
    setActionLoading(true);
    try {
      const batch = writeBatch(db);

      initialUsers.forEach((u) => {
        const userRef = doc(db, "users", u.userId.toString());
        batch.set(userRef, {
          userId: u.userId.toString(),
          Password: u.Password,
          Name: u.Name,
          votes: 0,
          votesPhase2: 0,
          hasVoted: false,
          hasVotedPhase2: false
        }, { merge: true });
      });

      const configRef = doc(db, "meta", "config");
      batch.set(configRef, { phase: PHASE_VOTING });

      await batch.commit();
      alert("System Reset Complete. Phase: VOTING");
    } catch (err) {
      console.error(err);
      alert("Database initialization error: " + err.message);
    }
    setActionLoading(false);
  };

  // Active candidate roster with fallback to initial roster if Firestore collection is syncing
  const rosterCandidates = candidates.length > 0 ? candidates : initialUsers.map(u => ({
    id: u.userId.toString(),
    ...u,
    votes: u.userId === 240236 ? 14 : Math.floor((u.userId % 7)),
    votesPhase2: u.userId === 240236 ? 28 : Math.floor((u.userId % 4))
  }));

  const effectiveTop5 = top5Candidates.length > 0
    ? top5Candidates
    : [...rosterCandidates].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 5);

  // Final declare rankings
  const finalCandidates = rosterCandidates.filter(c =>
    effectiveTop5.some(top5 => top5.id === c.id)
  );
  const sortedFinalCandidates = [...finalCandidates].sort(
    (a, b) => (b.votesPhase2 || 0) - (a.votesPhase2 || 0)
  );
  const finalWinner = sortedFinalCandidates[0] || rosterCandidates[0];
  const runnersUp = sortedFinalCandidates.slice(1);

  // Round 1 and Round 2 lists
  const candidatesForPhase1 = [...rosterCandidates].sort((a, b) =>
    (a.Password || "").localeCompare(b.Password || "")
  );
  const candidatesForPhase2 = rosterCandidates.filter(c =>
    effectiveTop5.some(top5 => top5.id === c.id)
  );

  // Render: Dedicated /admin Route (Protected by .env Admin Password)
  if (isAdminRoute) {
    return (
      <div className="app-wrapper">
        <PaperGrainOverlay />
        <PosterCorners />
        <MobilePosterHeader />

        <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {!isAdminUnlocked ? (
            <AdminGate
              onUnlock={handleUnlockAdmin}
              onReturn={navigateToPublic}
            />
          ) : (
            <AdminConsole
              resultsPhase={resultsPhase}
              candidates={rosterCandidates}
              onTogglePhase={toggleResults}
              onResetDatabase={initializeDatabase}
              actionLoading={actionLoading}
              onClose={navigateToPublic}
              onLock={handleLockAdmin}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onGoogleSignIn={handleGoogleSignIn}
            />
          )}
        </main>

        <MobilePosterFooter />
      </div>
    );
  }

  // Render: Loading state
  if (loading) {
    return (
      <div className="app-wrapper">
        <PaperGrainOverlay />
        <LoadingScreen text="CHAMBDI" />
      </div>
    );
  }

  // Render: Access Denied screen
  if (authError) {
    return (
      <div className="app-wrapper">
        <PaperGrainOverlay />
        <PosterCorners />
        <MobilePosterHeader />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center' }}>
          <AccessDenied
            onRetry={() => {
              setAuthError(null);
            }}
            detail={authError.detail}
          />
        </main>
        <MobilePosterFooter />
      </div>
    );
  }

  // Render: Hero Login screen
  if (!currentUser) {
    return (
      <div className="app-wrapper">
        <PaperGrainOverlay />
        <PosterCorners />
        <MobilePosterHeader />

        <main className="main-content">
          <div className="login-hero">
            <div className="graphics-stage">
              <SilhouetteGraphic width={260} height={200} />
              <div style={{ position: 'absolute', bottom: '-10px', right: '10%' }}>
                <MaskGraphic size={110} />
              </div>
            </div>

            <h1 className="hero-title" aria-label="Chambdi Season 5">
              <span className="title-ink">CHAMBDI</span>
              <span className="title-blood">S5</span>
            </h1>

            <div style={{ marginTop: '12px' }}>
              <LabelBlock
                lines={["Ithokke oru fun alle bro..."]}
                align="center"
                ruleColor="blood"
              />
            </div>

            <div className="login-auth-box">
              <button
                type="button"
                className="btn-brutalist"
                onClick={handleGoogleSignIn}
                disabled={actionLoading}
              >
                <GoogleIcon />
                <span>{actionLoading ? "VERIFYING ACCOUNT..." : "SIGN IN WITH GOOGLE"}</span>
              </button>

              <div className="auth-subtext">
                USE YOUR TKMCE MAIL ONLY
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                width: '100%',
                marginTop: '64px',
                paddingTop: '20px',
                borderTop: '3px solid var(--ink)'
              }}
            >
              <LabelBlock
                lines={["TRUST NO ONE", "VERIFY IDENTITY"]}
                align="left"
              />
              <BarcodeGraphic text="ARE YOU ONE OF US?" />
            </div>
          </div>
        </main>

        <MobilePosterFooter />
      </div>
    );
  }

  // Render: Authenticated Player App
  return (
    <div className="app-wrapper">
      <PaperGrainOverlay />
      <PosterCorners />
      <MobilePosterHeader />

      {/* Role Reveal Overlay Modal */}
      {showRoleReveal && (
        <RoleReveal
          user={currentUser}
          onClose={() => setShowRoleReveal(false)}
        />
      )}

      {/* Season 5 Top Navigation Bar */}
      <header className="season5-header">
        <div
          className="header-brand"
          onClick={() => setCurrentView('arena')}
        >
          <span className="brand-title">CHAMBDI</span>
          <span className="brand-season">S5</span>
        </div>

        <div className="header-actions">
          <div className="user-badge">
            <span className="user-badge-name">{currentUser.Name}</span>
            <span className="user-badge-id">{currentUser.Password || currentUser.userId}</span>
          </div>

          <button
            type="button"
            className="btn-brutalist btn-sm btn-blood"
            onClick={() => setShowRoleReveal(true)}
          >
            DOSSIER
          </button>

          <button
            type="button"
            className={`btn-brutalist btn-sm ${currentView === 'roster' ? 'btn-blood' : 'btn-outline'}`}
            onClick={() => setCurrentView(currentView === 'arena' ? 'roster' : 'arena')}
          >
            {currentView === 'arena' ? "ROSTER" : "VOTING"}
          </button>

          <button
            type="button"
            className="btn-brutalist btn-sm btn-outline"
            onClick={handleSignOut}
            disabled={actionLoading}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        {currentView === 'roster' ? (
          /* Class Roster / Lobby View */
          <div>
            <div className="phase-banner">
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--paper)', opacity: 0.8 }}>
                  CLASS REGISTRY
                </div>
                <h2 className="phase-heading">S5 PLAYER DOSSIERS</h2>
              </div>
              <LabelBlock
                lines={[`TOTAL ENROLLED: ${rosterCandidates.length}`, "STATUS: ACTIVE"]}
                align="right"
                ruleColor="blood"
              />
            </div>

            <div className="candidate-stack">
              {rosterCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="candidate-row"
                  style={{ cursor: 'default' }}
                >
                  <div className="candidate-name">{cand.Name}</div>
                  <div className="candidate-roll">
                    {cand.Password || cand.userId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : resultsPhase === PHASE_FINAL_DECLARE ? (
          /* Final Results Screen */
          <div>
            <div className="winner-poster">
              <div className="winner-pretitle">THE VERDICT HAS BEEN REACHED</div>
              <div style={{ margin: '16px auto', display: 'flex', justifyContent: 'center' }}>
                <MaskGraphic size={120} />
              </div>
              <div className="winner-pretitle" style={{ color: 'var(--ink)' }}>THE CHAMBDI IS</div>
              <h1 className="winner-hero-name">
                {finalWinner?.Name || "NO WINNER"}
              </h1>
              <div className="winner-votes-badge">
                {finalWinner?.votesPhase2 || 0} FINAL VOTES
              </div>
            </div>

            <div className="runners-up-section">
              <div className="runners-up-title">
                <span>RUNNERS UP</span>
                <span style={{ fontSize: '12px', letterSpacing: '0.2em', fontFamily: 'var(--font-body)' }}>
                  ROUND 2 TALLY
                </span>
              </div>

              <div className="candidate-stack">
                {runnersUp.map((cand) => (
                  <div key={cand.id} className="candidate-row" style={{ cursor: 'default' }}>
                    <div className="candidate-name">{cand.Name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className="candidate-roll">{cand.Password}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.4rem',
                          color: 'var(--blood)'
                        }}
                      >
                        {cand.votesPhase2 || 0} VOTES
                      </span>
                    </div>
                  </div>
                ))}
                {runnersUp.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--grey)', padding: '24px' }}>
                    NO OTHER FINALISTS RECORDED.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : resultsPhase === PHASE_TOP_5_REVEAL ? (
          /* Round 2: Top 5 Finalists Fresh Vote */
          <div>
            {currentUser.hasVotedPhase2 ? (
              <div className="wait-poster">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <MaskGraphic size={100} />
                </div>
                <LabelBlock
                  lines={["ROUND 02", "JUDGMENT CAST"]}
                  align="center"
                  ruleColor="blood"
                />
                <h2
                  className="font-display"
                  style={{
                    fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                    color: 'var(--blood)',
                    margin: '16px 0'
                  }}
                >
                  VOTE RECORDED
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    lineHeight: 1.6,
                    color: 'var(--ink)'
                  }}
                >
                  YOUR FINAL BALLOT IS LOCKED IN THE SYSTEM.
                  <br />
                  AWAITING FINAL RESULTS FROM COMMAND.
                </p>
              </div>
            ) : (
              <div>
                <div className="phase-banner">
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--paper)', opacity: 0.8 }}>
                      ROUND 02 // FINAL FIVE
                    </div>
                    <h2 className="phase-heading">TOP 5 FINALISTS</h2>
                  </div>
                  <LabelBlock
                    lines={["FRESH BALLOT", "ONE SELECTION"]}
                    align="right"
                    ruleColor="blood"
                  />
                </div>

                <div className="candidate-stack">
                  {candidatesForPhase2.map((cand) => {
                    const isSelected = selectedCandidate?.id === cand.id;
                    return (
                      <div
                        key={cand.id}
                        className={`candidate-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCandidate(cand)}
                      >
                        <div className="candidate-name">{cand.Name}</div>
                        <div className="candidate-roll">{cand.Password}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Round 1: All Candidates Voting */
          <div>
            {currentUser.hasVoted ? (
              <div className="wait-poster">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <MaskGraphic size={100} />
                </div>
                <LabelBlock
                  lines={["ROUND 01", "BALLOT RECORDED"]}
                  align="center"
                  ruleColor="blood"
                />
                <h2
                  className="font-display"
                  style={{
                    fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                    color: 'var(--blood)',
                    margin: '16px 0'
                  }}
                >
                  VOTE SECURED
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    lineHeight: 1.6,
                    color: 'var(--ink)'
                  }}
                >
                  YOUR JUDGMENT HAS BEEN LOGGED.
                  <br />
                  AWAITING TOP 5 REVEAL PHASE.
                </p>
              </div>
            ) : (
              <div>
                <div className="phase-banner">
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.28em', color: 'var(--paper)', opacity: 0.8 }}>
                      ROUND 01 // GENERAL CAST
                    </div>
                    <h2 className="phase-heading">WHO IS THE CHAMBDI?</h2>
                  </div>
                  <LabelBlock
                    lines={["CHOOSE ONE", "ALL PARTICIPANTS"]}
                    align="right"
                    ruleColor="blood"
                  />
                </div>

                <div className="candidate-stack">
                  {candidatesForPhase1.map((cand) => {
                    const isSelected = selectedCandidate?.id === cand.id;
                    return (
                      <div
                        key={cand.id}
                        className={`candidate-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCandidate(cand)}
                      >
                        <div className="candidate-name">{cand.Name}</div>
                        <div className="candidate-roll">{cand.Password}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Centered Static Vote Confirmation Dialog */}
      <VoteConfirmModal
        candidate={selectedCandidate}
        phase={resultsPhase}
        onConfirm={handleVote}
        onCancel={() => setSelectedCandidate(null)}
        actionLoading={actionLoading}
      />

      <MobilePosterFooter />
    </div>
  );
}

export default App;