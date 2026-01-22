import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [playingTime, setPlayingTime] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Data Loading Function
  const loadData = async () => {
    try {
        const [resTeams, resScorers, resPenalties, resPlayingTime] = await Promise.all([
            fetch('http://localhost:5000/api/table'),
            fetch('http://localhost:5000/api/scorers'),
            fetch('http://localhost:5000/api/penalties'),
            fetch('http://localhost:5000/api/playing-time')
        ]);

        setTeams(await resTeams.json());
        setScorers(await resScorers.json());
        setPenalties(await resPenalties.json());
        setPlayingTime(await resPlayingTime.json());
    } catch (err) {
        console.error("Error loading data", err);
    }
  };

  // Process Files Handler
  const handleScan = async () => {
    setLoading(true);
    setMessage("Apstrādā failus...");
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

  return (
    <div className="container py-4">
      <header className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <h1 className="h3 m-0">Lielās Futbola Līgas (LFL) Turnīrs</h1>
          <div className="d-flex align-items-center gap-3">
            <span className="badge text-bg-success fs-6">{message}</span>
            <button 
                onClick={handleScan} 
                disabled={loading} 
                className="btn btn-primary fw-semibold">
                {loading ? 'Apstrādā...' : 'Ielādēt Datus'}
            </button>
          </div>
      </header>

      {/* ROW 1: Main Stats */}
      <div className="row g-4 mb-4">
        
        {/* TABLE 1: Standings */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Turnīra Tabula</div>
            <div className="card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="text-start align-middle">#</th>
                        <th className="text-start align-middle">Komanda</th>
                        <th className="text-start align-middle">Pkt</th>
                        <th className="text-start align-middle">Vārti</th>
                        <th className="text-start align-middle">U</th>
                        <th className="text-start align-middle">Z</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map((t, i) => (
                        <tr key={t.name}>
                            <td>{i + 1}.</td>
                            <td className="fw-semibold">{t.name}</td>
                            <td className="fw-semibold">{t.points}</td>
                            <td>{t.goals_scored}:{t.goals_conceded}</td>
                            <td>{t.games_won_reg + t.games_won_ot}</td>
                            <td>{t.games_lost_reg + t.games_lost_ot}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* TABLE 2: Scorers */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Top Vārtu Guvēji</div>
            <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-start align-middle">#</th>
                  <th className="text-start align-middle">Spēlētājs</th>
                  <th className="text-start align-middle">G</th>
                  <th className="text-start align-middle">A</th>
                </tr>
              </thead>
                <tbody>
                {scorers.map((p, i) => (
                        <tr key={p.id}>
                            <td>{i + 1}.</td>
                            <td>
                                <div className="fw-semibold">{p.name}</div>
                                <div className="text-secondary small">{p.team}</div>
                            </td>
                            <td className="fw-semibold">{p.goals}</td>
                            <td className="text-secondary">{p.assists}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Extra Stats */}
      <div className="row g-4">
        
        {/* TABLE 3: Penalties (Cards) */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Sodi (Kartītes)</div>
            <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-start align-middle">Spēlētājs</th>
                  <th className="text-start align-middle">Komanda</th>
                  <th className="text-start align-middle">Sarkanās</th>
                  <th className="text-start align-middle">Dzeltenās</th>
                </tr>
              </thead>
                <tbody>
                {penalties.map(p => (
                        <tr key={p.id}>
                            <td className="fw-semibold">{p.name}</td>
                            <td>{p.team}</td>
                               <td className="fw-bold text-dark bg-danger-subtle">{p.red_cards}</td>
                               <td className="fw-bold text-dark bg-warning-subtle">{p.yellow_cards} </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* TABLE 4: Playing Time Leaders */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Spēles Laika Līderi</div>
            <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-start align-middle">Spēlētājs</th>
                  <th className="text-start align-middle">Komanda</th>
                  <th className="text-start align-middle">Spēles</th>
                  <th className="text-start align-middle">Minūtes</th>
                </tr>
              </thead>
                <tbody>
                {playingTime.map(p => (
                        <tr key={p.id}>
                            <td className="fw-semibold">{p.name}</td>
                            <td>{p.team}</td>
                            <td>{p.games_played}</td>
                            <td className="fw-semibold">{p.minutes_played}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default App