import { useGame, useGameDispatch } from '../../context/GameContext'
import './Header.css'

function Header() {
  const { view, scriptName } = useGame()
  const dispatch = useGameDispatch()

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'setup', label: 'Script', icon: '📜' },
    { id: 'calculator', label: 'Setup', icon: '🧮' },
    { id: 'bag', label: 'Bag', icon: '🎭' },
    { id: 'grimoire', label: 'Grimoire', icon: '📖' },
  ]

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>
          <span className="header-icon">🩸</span>
          <div className="header-titles">
            <h1 className="header-title">Blood on the Clocktower</h1>
            <span className="header-subtitle">Grimoire Helper</span>
          </div>
        </div>
        
        {scriptName && (
          <div className="header-script">
            <span className="script-label">Script:</span>
            <span className="script-name">{scriptName}</span>
          </div>
        )}
        
        <nav className="header-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${view === item.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
