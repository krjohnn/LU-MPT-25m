import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [ironmen, setIronmen] = useState([]); 
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
            fetch('http://localhost:5000/api/penalties'),
            fetch('http://localhost:5000/api/ironmen')
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
    <thead className="table-light">
        <tr>
            {cols.map(c => (
              c.sortable ? (
                <th 
                  key={c.key} 
                  onClick={() => onSort(c.key, sortState)}
                  className="text-start align-middle" 
                  style={{ cursor: 'pointer', userSelect: 'none' }}>
                  {c.label}<SortIndicator column={c.key} currentSort={sortState} />
                </th>
              ) : (
                <th key={c.key} className="text-start align-middle">{c.label}</th>
              )
            ))}
        </tr>
    </thead>
  );

  return (
    <div className="container py-4">
      <header className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <h1 className="h3 m-0">LFL Futbola Turnīrs</h1>
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

        {/* TABLE 4: Iron Men */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-bold">Dzelzs Vīri (Minūtes)</div>
            <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
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