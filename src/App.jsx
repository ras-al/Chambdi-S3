import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, getDocs, query, where, updateDoc, doc, 
  increment, writeBatch, onSnapshot, setDoc, getDoc 
} from 'firebase/firestore';
import { initialUsers } from './data';
import './App.css';

// New Phase Constants
const PHASE_VOTING = "VOTING";
const PHASE_TOP_5_REVEAL = "TOP_5_REVEAL";
const PHASE_FINAL_DECLARE = "FINAL_DECLARE";

function App() {
  const [user, setUser] = useState(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [resultsPhase, setResultsPhase] = useState(PHASE_VOTING);
  const [top5Candidates, setTop5Candidates] = useState([]); // Based on Round 1 votes

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
      
      // Sort all candidates by roll number (Password) for general display
      cands.sort((a, b) => a.Password.localeCompare(b.Password));
      setCandidates(cands);

      // Calculate and store top 5 candidates by Round 1 votes (votes field)
      const sortedByRound1Votes = [...cands].sort((a, b) => b.votes - a.votes);
      const top5 = sortedByRound1Votes.slice(0, 5);
      setTop5Candidates(top5); 
    });

    return () => {
      unsubConfig();
      unsubUsers();
    };
  }, []);

  const initializeDatabase = async () => {
    if (!confirm("Are you sure? This resets everything!")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      initialUsers.forEach((u) => {
        const userRef = doc(db, "users", u.userId.toString());
        batch.set(userRef, {
          userId: u.userId.toString(),
          Password: u.Password,
          Name: u.Name,
          votes: 0, // Round 1 votes
          votesPhase2: 0, // Round 2 votes (NEW FIELD)
          hasVoted: false, // Phase 1 voting status
          hasVotedPhase2: false // Phase 2 voting status
        });
      });

      const configRef = doc(db, "meta", "config");
      batch.set(configRef, { phase: PHASE_VOTING }); 

      await batch.commit();
      alert("Database Reset & Initialized! Phase: VOTING");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  const toggleResults = async () => {
    const configRef = doc(db, "meta", "config");
    try {
      const snap = await getDoc(configRef);
      const currentPhase = snap.exists() ? snap.data().phase : PHASE_VOTING;
      let nextPhase;

      if (currentPhase === PHASE_VOTING) {
        nextPhase = PHASE_TOP_5_REVEAL;
      } else if (currentPhase === PHASE_TOP_5_REVEAL) {
        nextPhase = PHASE_FINAL_DECLARE;
      } else {
        // Cycle back to voting/reset state
        nextPhase = PHASE_VOTING; 
      }
      
      await setDoc(configRef, { phase: nextPhase }, { merge: true });
      alert(`Phase changed to: ${nextPhase}`);
      setSelectedCandidate(null); 
    } catch(err) {
      alert("Error toggling results");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, "users"), 
        where("userId", "==", userIdInput),
        where("Password", "==", passwordInput)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        // Ensure hasVotedPhase2 is set, defaulting to false if undefined
        setUser({ 
          ...userData, 
          docId: querySnapshot.docs[0].id,
          hasVotedPhase2: userData.hasVotedPhase2 || false
        });
      } else {
        setError("Invalid Credentials");
      }
    } catch (err) {
      setError("Login Failed.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleVote = async () => {
    if (!selectedCandidate || !user) return;
    
    let voteField, userUpdateField;
    
    if (resultsPhase === PHASE_VOTING) {
        voteField = 'votes';
        userUpdateField = 'hasVoted';
    } else if (resultsPhase === PHASE_TOP_5_REVEAL) {
        voteField = 'votesPhase2'; // Increment Round 2 votes
        userUpdateField = 'hasVotedPhase2';
    } else {
        alert("Voting is currently closed.");
        return;
    }

    if (user[userUpdateField]) {
        alert(`You have already voted in ${resultsPhase === PHASE_VOTING ? 'Round 1' : 'Round 2'}.`);
        return;
    }

    setLoading(true);
    try {
      const candidateRef = doc(db, "users", selectedCandidate.id);
      const userRef = doc(db, "users", user.docId);
      
      // Increment the correct vote count for the candidate
      await updateDoc(candidateRef, { [voteField]: increment(1) });
      
      // Mark user as voted in the current phase
      await updateDoc(userRef, { [userUpdateField]: true });

      // Update local user state
      setUser(prev => ({...prev, [userUpdateField]: true}));

      alert("Vote Casted Successfully!");
      setSelectedCandidate(null);
    } catch (err) {
      alert("Error voting: " + err.message);
    }
    setLoading(false);
  };
  
  // Filter all candidates to only include those in the top 5 from R1
  const finalCandidates = candidates.filter(c => 
    top5Candidates.some(top5 => top5.id === c.id)
  );

  // Sort final candidates based ONLY on Round 2 votes (votesPhase2)
  const sortedFinalCandidates = [...finalCandidates].sort((a, b) => b.votesPhase2 - a.votesPhase2);
  const finalWinner = sortedFinalCandidates[0];
  const runnersUp = sortedFinalCandidates.slice(1);
  
  // Candidates for phase 1 voting (all candidates)
  const candidatesForPhase1 = [...candidates].sort((a, b) => a.Password.localeCompare(b.Password));

  // Candidates for phase 2 voting (only top 5 from R1)
  const candidatesForPhase2 = candidates.filter(c => 
    top5Candidates.some(top5 => top5.id === c.id)
  );


  if (!user) {
    return (
      <div className="container">
        <h1>CHAMBDI S3</h1>
        <div className="login-card">
          <h3>Identify Yourself</h3>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Admission No (e.g. 240433)" 
              value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)}/>
            <input type="text" placeholder="Roll No (e.g. B24CSA01)" 
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}/>
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Enter System"}
            </button>
            {error && <p className="message">{error}</p>}
          </form>
        </div>
        
        <div className="admin-panel" style={{display: 'none'}}> 
          <button className="admin-btn" onClick={initializeDatabase}>
            Reset DB (Admin)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container full-panel`}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{margin:0, color:'var(--accent-color)'}}>CHAMBDI S3</h2>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:'bold'}}>{user.Name}</div>
          <div style={{fontSize:'0.8rem', color:'#888'}}>{user.Password}</div>
        </div>
      </header>

      {resultsPhase === PHASE_FINAL_DECLARE ? (
        <div>
           <div className="winner-section">
              <div className="winner-card">
                <h3 className="winner-title">THE CHAMBDI IS</h3>
                <div className="winner-name">{finalWinner?.Name}</div>
                <div style={{color:'white'}}>{finalWinner?.votesPhase2} FINAL VOTES</div>
              </div>
           </div>

           <h3>Runners Up</h3>
           <div className="candidates-grid">
             {runnersUp.map(cand => (
               <div key={cand.id} className="candidate-card">
                 <div className="roll-no">{cand.Name}</div>
                 <div style={{fontSize:'0.8rem', color:'#666'}}>{cand.Password}</div>
                 <div className="vote-count" style={{color:'white'}}>{cand.votesPhase2} Votes</div>
               </div>
             ))}
           </div>
           {runnersUp.length === 0 && (
             <p style={{textAlign:'center', color:'#888'}}>Only one candidate was available for the final round.</p>
           )}
        </div>
      ) : 

      resultsPhase === PHASE_TOP_5_REVEAL ? (
        <div>
          {user.hasVotedPhase2 ? (
            <div className="wait-screen">
              <h2 style={{color: 'var(--success-color)'}}>Vote Recorded for Round 2</h2>
              <p style={{fontSize: '1.2rem'}}>
                Your final judgment has been passed. <br/>
                Waiting for the Final Result...
              </p>
              <div style={{marginTop:'30px', opacity:0.5}}>
                <small>The winner will be declared soon.</small>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{textAlign:'center'}}>Top 5 Finalists - Fresh Vote!</h3>
              <p style={{color:'#888', marginBottom:'20px', textAlign:'center'}}>Select one person from the Top 5. (Previous votes don't count here)</p>
              
              <div className="candidates-grid">
                {candidatesForPhase2.map((cand) => (
                  <div 
                    key={cand.id} 
                    className={`candidate-card ${selectedCandidate?.id === cand.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    <div className="roll-no">{cand.Name}</div>
                    <div style={{fontSize:'0.8rem', color: selectedCandidate?.id === cand.id ? '#eee' : '#666'}}>
                        {cand.Password}
                    </div>
                  </div>
                ))}
              </div>

              {selectedCandidate && (
                <div style={{position:'sticky', bottom:'60px', background:'#0a0a0a', padding:'15px', borderTop:'1px solid #333', textAlign:'center'}}>
                  <p>Selected: <span style={{color:'var(--accent-color)', fontWeight:'bold'}}>{selectedCandidate.Name}</span></p>
                  <button onClick={handleVote} disabled={loading}>
                    {loading ? "Voting..." : "VOTE THIS CHAMBDI (Round 2)"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : 
      
        <div>
          {user.hasVoted ? (
            <div className="wait-screen">
              <h2 style={{color: 'var(--success-color)'}}>Vote Recorded for Round 1</h2>
              <p style={{fontSize: '1.2rem'}}>
                Your judgment has been passed. <br/>
                Waiting for the Top 5 Reveal...
              </p>
              <div style={{marginTop:'30px', opacity:0.5}}>
                <small>The top 5 will be announced soon.</small>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{textAlign:'center'}}>Who is the CHAMBDI? (Round 1)</h3>
              <p style={{color:'#888', marginBottom:'20px', textAlign:'center'}}>Select one person from all candidates.</p>
              
              <div className="candidates-grid">
                {candidatesForPhase1.map((cand) => (
                  <div 
                    key={cand.id} 
                    className={`candidate-card ${selectedCandidate?.id === cand.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    <div className="roll-no">{cand.Name}</div>
                    <div style={{fontSize:'0.8rem', color: selectedCandidate?.id === cand.id ? '#eee' : '#666'}}>
                        {cand.Password}
                    </div>
                  </div>
                ))}
              </div>

              {selectedCandidate && (
                <div style={{position:'sticky', bottom:'60px', background:'#0a0a0a', padding:'15px', borderTop:'1px solid #333', textAlign:'center'}}>
                  <p>Selected: <span style={{color:'var(--accent-color)', fontWeight:'bold'}}>{selectedCandidate.Name}</span></p>
                  <button onClick={handleVote} disabled={loading}>
                    {loading ? "Voting..." : "VOTE THIS CHAMBDI (Round 1)"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      }

      {/* Admin Panel (uncommented for control) */}
      {/*<div className="admin-panel">
         <div style={{color:'#666', fontSize:'0.8rem', alignSelf:'center'}}>Admin Control (Current Phase: {resultsPhase}):</div>
         <button className="admin-btn" onClick={toggleResults}>
           {resultsPhase === PHASE_VOTING ? "REVEAL TOP 5 (Stop Round 1)" : 
            (resultsPhase === PHASE_TOP_5_REVEAL ? "DECLARE FINAL RESULTS (Stop Round 2)" : 
             "RESET TO VOTING (Clear Phase)")}
         </button>
         <button className="admin-btn" onClick={initializeDatabase}>
            Reset All Data
         </button>
      </div>*/}
    </div>
  );
}

export default App;