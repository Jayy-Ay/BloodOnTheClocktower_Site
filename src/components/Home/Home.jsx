import { useGame } from '../../context/GameContext'
import { useNavigate } from 'react-router-dom'
import { GiDrop, GiScrollUnfurled, GiAbacus, GiDramaMasks, GiSpellBook } from 'react-icons/gi'
import './Home.css'

function Home() {
  const { script, scriptName, players, characterBag } = useGame()
  const navigate = useNavigate()

  const features = [
    {
      id: 'setup',
      icon: <GiScrollUnfurled />,
      title: 'Load Script',
      description: 'Choose an official script or import a custom JSON file',
      action: () => navigate('/script'),
    },
    {
      id: 'calculator',
      icon: <GiAbacus />,
      title: 'Setup Calculator',
      description: 'Calculate character distribution based on player count',
      action: () => navigate('/calculator'),
    },
    {
      id: 'bag',
      icon: <GiDramaMasks />,
      title: 'Character Bag',
      description: 'Set up the bag and let players draw their characters',
      action: () => navigate('/bag'),
      disabled: !script,
    },
    {
      id: 'grimoire',
      icon: <GiSpellBook />,
      title: 'Grimoire',
      description: 'Manage players, assign characters, and track the game',
      action: () => navigate('/grimoire'),
      disabled: !script,
    },
  ]

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-icon"><GiDrop /></div>
        <h1 className="hero-title">Welcome, Storyteller</h1>
        <p className="hero-subtitle">
          Your digital grimoire for Blood on the Clocktower
        </p>
      </div>

      {script && (
        <div className="home-status">
          <div className="status-card">
            <span className="status-label">Current Script</span>
            <span className="status-value">{scriptName}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Characters Loaded</span>
            <span className="status-value">{script.length}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Players</span>
            <span className="status-value">{players.length}</span>
          </div>
          <div className="status-card">
            <span className="status-label">In Bag</span>
            <span className="status-value">{characterBag.length}</span>
          </div>
        </div>
      )}

      <div className="home-features">
        {features.map(feature => (
          <button
            key={feature.id}
            className={`feature-card ${feature.disabled ? 'disabled' : ''}`}
            onClick={feature.action}
            disabled={feature.disabled}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
            {feature.disabled && (
              <span className="feature-notice">Load a script first</span>
            )}
          </button>
        ))}
      </div>

      <div className="home-actions">
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Reset all game data? This cannot be undone.')) {
              localStorage.removeItem('botc-game-state')
              window.location.reload()
            }
          }}
        >
          Reset All Data
        </button>
      </div>
    </div>
  )
}

export default Home
