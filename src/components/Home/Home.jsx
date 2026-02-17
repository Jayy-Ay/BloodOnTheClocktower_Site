import { useGame, useGameDispatch } from '../../context/GameContext'
import './Home.css'

function Home() {
  const { script, scriptName, players, characterBag } = useGame()
  const dispatch = useGameDispatch()

  const features = [
    {
      id: 'setup',
      icon: '📜',
      title: 'Load Script',
      description: 'Choose an official script or import a custom JSON file',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'setup' }),
    },
    {
      id: 'calculator',
      icon: '🧮',
      title: 'Setup Calculator',
      description: 'Calculate character distribution based on player count',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'calculator' }),
    },
    {
      id: 'bag',
      icon: '🎭',
      title: 'Character Bag',
      description: 'Set up the bag and let players draw their characters',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'bag' }),
      disabled: !script,
    },
    {
      id: 'grimoire',
      icon: '📖',
      title: 'Grimoire',
      description: 'Manage players, assign characters, and track the game',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'grimoire' }),
      disabled: !script,
    },
  ]

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-icon">🩸</div>
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
