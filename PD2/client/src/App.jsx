import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [penalties, setPenalties] = useState([]);      // NEW
  const [ironmen, setIronmen] = useState([]); // NEW
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tableSort, setTableSort] = useState({ column: 'points', order: 'desc' });
  const [scorersSort, setScorersSort] = useState({ column: 'goals', order: 'desc' });
  const [penaltiesSort, setPenaltiesSort] = useState({ column: 'red_cards', order: 'desc' });
  const [ironmenSort, setIronmenSort] = useState({ column: 'minutes_played', order: 'desc' });

  const loadData = async () => {
    try {
        const [resTeams, resScorers, resPenalties, resIron] = await Promise.all([
            fetch('http://localhost:5000/api/table'),
            fetch('http://localhost:5000/api/scorers'),
            fetch('http://localhost:5000/api/penalties'),    // NEW
            fetch('http://localhost:5000/api/ironmen')  // NEW
        ]);

        setTeams(await resTeams.json());
        setScorers(await resScorers.json());
        setPenalties(await resPenalties.json());
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

  // Sort function
  const sortData = (data, column, order) => {
    return [...data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      if (typeof aVal === 'string') {
        return order === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
  };

  // Handle sort click
  const handleSort = (column, currentSort, setSortState) => {
    const newOrder = currentSort.column === column && currentSort.order === 'desc' ? 'asc' : 'desc';
    setSortState({ column, order: newOrder });
  };

  // Sort indicator
  const SortIndicator = ({ column, currentSort }) => {
    if (currentSort.column !== column) return <span style={{ marginLeft: '5px', opacity: 0.3 }}>↕</span>;
    return <span style={{ marginLeft: '5px', color: '#007bff', fontWeight: 'bold' }}>{currentSort.order === 'desc' ? '↓' : '↑'}</span>;
  };

  // Enhanced Table Header with sorting
  const SortableTableHeader = ({ cols, sortState, onSort }) => (
    <thead style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
        <tr>
            {cols.map(c => (
              c.sortable ? (
                <th 
                  key={c.key} 
                  onClick={() => onSort(c.key, sortState)}
                  style={{ 
                    padding: '10px', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: sortState.column === c.key ? '#e8e8e8' : '#f0f0f0'
                  }}>
                  {c.label}<SortIndicator column={c.key} currentSort={sortState} />
                </th>
              ) : (
                <th key={c.key} style={{ padding: '10px', textAlign: 'left' }}>{c.label}</th>
              )
            ))}
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
                <SortableTableHeader 
                  cols={[
                    { key: 'position', label: '#', sortable: false },
                    { key: 'name', label: 'Komanda', sortable: true },
                    { key: 'points', label: 'Pkt', sortable: true },
                    { key: 'goals', label: 'Vārti', sortable: false },
                    { key: 'wins', label: 'U', sortable: true },
                    { key: 'losses', label: 'Z', sortable: true }
                  ]}
                  sortState={tableSort}
                  onSort={(col, state) => handleSort(col, state, setTableSort)}
                />
                <tbody>
                    {sortData(teams, tableSort.column, tableSort.order).map((t, i) => (
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
                <SortableTableHeader 
                  cols={[
                    { key: 'position', label: '#', sortable: false },
                    { key: 'name', label: 'Spēlētājs', sortable: true },
                    { key: 'goals', label: 'G', sortable: true },
                    { key: 'assists', label: 'A', sortable: true }
                  ]}
                  sortState={scorersSort}
                  onSort={(col, state) => handleSort(col, state, setScorersSort)}
                />
                <tbody>
                    {sortData(scorers, scorersSort.column, scorersSort.order).map((p, i) => (
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
        
        {/* TABLE 3: Penalties (Cards) */}
        <div className="card">
            <h2>Sodi (Kartītes)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <SortableTableHeader 
                  cols={[
                    { key: 'name', label: 'Spēlētājs', sortable: true },
                    { key: 'team', label: 'Komanda', sortable: true },
                    { key: 'red_cards', label: 'Sarkanās', sortable: true },
                    { key: 'yellow_cards', label: 'Dzeltenās', sortable: true }
                  ]}
                  sortState={penaltiesSort}
                  onSort={(col, state) => handleSort(col, state, setPenaltiesSort)}
                />
                <tbody>
                    {sortData(penalties, penaltiesSort.column, penaltiesSort.order).map(p => (
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
                <SortableTableHeader 
                  cols={[
                    { key: 'name', label: 'Spēlētājs', sortable: true },
                    { key: 'team', label: 'Komanda', sortable: true },
                    { key: 'games_played', label: 'Spēles', sortable: true },
                    { key: 'minutes_played', label: 'Minūtes', sortable: true }
                  ]}
                  sortState={ironmenSort}
                  onSort={(col, state) => handleSort(col, state, setIronmenSort)}
                />
                <tbody>
                    {sortData(ironmen, ironmenSort.column, ironmenSort.order).map(p => (
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