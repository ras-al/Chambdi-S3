import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, getDocs, query, where, updateDoc, doc, 
  increment, writeBatch, onSnapshot, setDoc, getDoc 
} from 'firebase/firestore';
import { initialUsers } from './data';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [resultsDeclared, setResultsDeclared] = useState(false);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "meta", "config"), (docSnap) => {
      if (docSnap.exists()) {
        setResultsDeclared(docSnap.data().published);
      } else {
        setResultsDeclared(false);
      }
    });

    const q = query(collection(db, "users"));
    const unsubUsers = onSnapshot(q, (snapshot) => {
      const cands = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      cands.sort((a, b) => a.Password.localeCompare(b.Password));
      setCandidates(cands);
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
          votes: 0,
          hasVoted: false
        });
      });

      const configRef = doc(db, "meta", "config");
      batch.set(configRef, { published: false });

      await batch.commit();
      alert("Database Reset & Initialized!");
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
      const current = snap.exists() ? snap.data().published : false;
      
      await setDoc(configRef, { published: !current }, { merge: true });
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
        setUser({ ...userData, docId: querySnapshot.docs[0].id });
        setHasVoted(userData.hasVoted);
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
    if (!selectedCandidate) return;
    setLoading(true);
    try {
      const candidateRef = doc(db, "users", selectedCandidate.id);
      const userRef = doc(db, "users", user.docId);

      await updateDoc(candidateRef, { votes: increment(1) });
      await updateDoc(userRef, { hasVoted: true });

      setHasVoted(true);
      alert("Vote Casted Successfully!");
    } catch (err) {
      alert("Error voting: " + err.message);
    }
    setLoading(false);
  };


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
        
        {/*
        <div className="admin-panel">
          <button className="admin-btn" onClick={initializeDatabase}>
            Reset DB (Admin)
          </button>
        </div>
        */}
      </div>
    );
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
  const winner = sortedCandidates[0];

  return (
    <div className={`container ${user ? 'full-panel' : 'centered'}`}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{margin:0, color:'var(--accent-color)'}}>CHAMBDI S3</h2>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:'bold'}}>{user.Name}</div>
          <div style={{fontSize:'0.8rem', color:'#888'}}>{user.Password}</div>
        </div>
      </header>

      {resultsDeclared ? (
        <div>
           <div className="winner-section">
              <div className="winner-card">
                <h3 className="winner-title">THE CHAMBDI IS</h3>
                <div className="winner-name">{winner?.Name}</div>
                <div style={{color:'white'}}>{winner?.votes} VOTES</div>
              </div>
           </div>

           <h3>Full Leaderboard</h3>
           <div className="candidates-grid">
             {sortedCandidates.map(cand => (
               <div key={cand.id} className="candidate-card" style={{borderColor: cand.votes > 0 ? '#555' : '#333'}}>
                 <div className="roll-no">{cand.Name}</div>
                 <div style={{fontSize:'0.8rem', color:'#666'}}>{cand.Password}</div>
                 <div className="vote-count" style={{color:'white'}}>{cand.votes} Votes</div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div>
          {hasVoted ? (
            <div className="wait-screen">
              <h2 style={{color: 'var(--success-color)'}}>Vote Recorded</h2>
              <p style={{fontSize: '1.2rem'}}>
                Your judgment has been passed. <br/>
                Waiting for the final Result...
              </p>
              <div style={{marginTop:'30px', opacity:0.5}}>
                <small>The leaderboard will appear here once voting ends.</small>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{textAlign:'center'}}>Who is the CHAMBDI?</h3>
              <p style={{color:'#888', marginBottom:'20px', textAlign:'center'}}>Select one person.</p>
              
              <div className="candidates-grid">
                {candidates.map((cand) => (
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
                    {loading ? "Voting..." : "VOTE THIS CHAMBDI"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 
      <div className="admin-panel">
         <div style={{color:'#666', fontSize:'0.8rem', alignSelf:'center'}}>Admin Control:</div>
         <button className="admin-btn" onClick={toggleResults}>
           {resultsDeclared ? "HIDE RESULTS (Start Voting)" : "DECLARE RESULTS (Stop Voting)"}
         </button>
      </div>
      */}
    </div>
  );
}

export default App;