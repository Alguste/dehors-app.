import React, { useState } from 'react';

export default function App() {
  const [view, setView] = useState('home');
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(3);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    if (!question) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, durationMin: duration })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion au moteur");
      setVideoUrl(data.videoUrl);
      setView('player');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', marginTop: '16px' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.2em' }}>D E H O R S</span>
      </header>

      {view === 'home' && !loading && (
        <div style={{ backgroundColor: '#111924', border: '1px solid #1F2937', borderRadius: '24px', padding: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '12px' }}>Une question ?<br/>Repartez avec une<br/>réponse.</h1>
          <p style={{ color: '#9CA3AF', marginBottom: '24px', fontSize: '14px' }}>Posez-la. Choisissez votre temps.</p>
          <input type="text" placeholder="Ex. : C'est quoi l'IA ?" value={question} onChange={e => setQuestion(e.target.value)} style={{ width: '100%', backgroundColor: '#0B111A', border: '1px solid #374151', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '24px', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            {[1, 3, 5].map(t => (
              <button key={t} onClick={() => setDuration(t)} style={{ flex: 1, padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', backgroundColor: duration === t ? '#FF9B85' : '#0B111A', color: duration === t ? '#0B111A' : 'white', border: duration === t ? 'none' : '1px solid #374151' }}>{t} min</button>
            ))}
          </div>
          <button onClick={handleStart} style={{ width: '100%', background: 'linear-gradient(to right, #FF7E67, #FFB199)', color: '#0B111A', fontSize: '24px', fontWeight: 'bold', padding: '20px', borderRadius: '999px', border: 'none' }}>→</button>
          {error && <p style={{ color: '#EF4444', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Votre séance se prépare...</h2>
          <p style={{ color: '#9CA3AF' }}>Claude écrit le script.<br/>Léa se prépare.</p>
          <div style={{ width: '48px', height: '48px', border: '4px solid #FF9B85', borderTopColor: 'transparent', borderRadius: '50%', margin: '32px auto', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {view === 'player' && videoUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#1F2937', width: '100%', aspectRatio: '3/4', marginBottom: '24px' }}>
            <video src={videoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <button onClick={() => { setView('home'); setVideoUrl(null); setQuestion(''); }} style={{ color: '#9CA3AF', background: 'none', border: 'none', marginTop: '16px', fontSize: '16px' }}>Quitter la séance</button>
        </div>
      )}
    </div>
  );
}
