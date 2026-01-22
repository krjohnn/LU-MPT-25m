import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [rude, setRude] = useState([]);      // NEW
  const [ironmen, setIronmen] = useState([]); // NEW
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
        const [resTeams, resScorers, resRude, resIron] = await Promise.all([
            fetch('http://localhost:5000/api/table'),
            fetch('http://localhost:5000/api/scorers'),
            fetch('http://localhost:5000/api/rude'),    // NEW
            fetch('http://localhost:5000/api/ironmen')  // NEW
        ]);

        setTeams(await resTeams.json());
        setScorers(await resScorers.json());
        setRude(await resRude.json());
        setIronmen(await resIron.json());
    } catch (err) {
        console.error("Error loading data", err);
    }
  };

  const handleScan = async () => {
    setLoading(true);
    setMessage("Processing files...");
    try {
        const res = await fetch('http://localhost:5000/api/process');
        const data = await res.json();
        setMessage(data.message);
        loadData(); 
    } catch (err) {
        setMessage("Error connecting to server.");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Helper for consistent table styling
  const TableHeader = ({ cols }) => (
    <thead style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
        <tr>
            {cols.map(c => <th key={c} style={{ padding: '10px', textAlign: 'left' }}>{c}</th>)}
        </tr>
    </thead>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>LFL Futbola Turnīrs</h1>
          <div>
            <span style={{ marginRight: '15px', color: 'green', fontWeight: 'bold' }}>{message}</span>
            <button 
                onClick={handleScan} 
                disabled={loading} 
                style={{ 
                    padding: '10px 20px', fontSize: '16px', background: '#007bff', 
                    color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' 
                }}>
                {loading ? 'Apstrādā...' : 'Ielādēt Datus'}
            </button>
          </div>
      </header>

      {/* ROW 1: Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px' }}>
        
        {/* TABLE 1: Standings */}
        <div className="card">
            <h2>Turnīra Tabula</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHeader cols={['#', 'Komanda', 'Pkt', 'Vārti', 'U', 'Z']} />
                <tbody>
                    {teams.map((t, i) => (
                        <tr key={t.name} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{i + 1}.</td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.name}</td>
                            <td style={{ padding: '8px', fontSize: '1.1em' }}>{t.points}</td>
                            <td style={{ padding: '8px' }}>{t.goals_scored}:{t.goals_conceded}</td>
                            <td style={{ padding: '8px' }}>{t.games_won_reg + t.games_won_ot}</td>
                            <td style={{ padding: '8px' }}>{t.games_lost_reg + t.games_lost_ot}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* TABLE 2: Scorers */}
        <div className="card">
            <h2>Top Vārtu Guvēji</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHeader cols={['#', 'Spēlētājs', 'G', 'A']} />
                <tbody>
                    {scorers.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{i + 1}.</td>
                            <td style={{ padding: '8px' }}>
                                <div>{p.name}</div>
                                <div style={{ fontSize: '0.8em', color: '#666' }}>{p.team}</div>
                            </td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.goals}</td>
                            <td style={{ padding: '8px', color: '#666' }}>{p.assists}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* ROW 2: Extra Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* TABLE 3: Rude Players */}
        <div className="card">
            <h2>Rupjākie Spēlētāji</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHeader cols={['Spēlētājs', 'Komanda', 'Sarkanās', 'Dzeltenās']} />
                <tbody>
                    {rude.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{p.name}</td>
                            <td style={{ padding: '8px' }}>{p.team}</td>
                            <td style={{ padding: '8px', color: 'red', fontWeight: 'bold' }}>{p.red_cards}</td>
                            <td style={{ padding: '8px', color: '#d4a017', fontWeight: 'bold' }}>{p.yellow_cards}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* TABLE 4: Iron Men */}
        <div className="card">
            <h2>Dzelzs Vīri (Minūtes)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHeader cols={['Spēlētājs', 'Komanda', 'Spēles', 'Minūtes']} />
                <tbody>
                    {ironmen.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{p.name}</td>
                            <td style={{ padding: '8px' }}>{p.team}</td>
                            <td style={{ padding: '8px' }}>{p.games_played}</td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.minutes_played}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  )
}

export default App