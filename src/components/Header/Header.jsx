import { useGame } from '../../context/GameContext'
import { NavLink, Link } from 'react-router-dom'
import { GiDrop, GiCastle, GiScrollUnfurled, GiAbacus, GiDramaMasks, GiSpellBook } from 'react-icons/gi'
import getIconComponent from '../../utils/getIconComponent'
import './Header.css'

function Header() {
  const { scriptName, scriptIcon } = useGame()

  const navItems = [
    { to: '/', label: 'Home', icon: <GiCastle /> },
    { to: '/script', label: 'Script', icon: <GiScrollUnfurled /> },
    { to: '/calculator', label: 'Setup', icon: <GiAbacus /> },
    { to: '/bag', label: 'Bag', icon: <GiDramaMasks /> },
    { to: '/grimoire', label: 'Grimoire', icon: <GiSpellBook /> },
  ]

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-brand">
          <span className="header-icon"><GiDrop /></span>
          <div className="header-titles">
            <h1 className="header-title">Blood on the Clocktower</h1>
            <span className="header-subtitle">Grimoire Helper</span>
          </div>
        </Link>
        
        {scriptName && (
          <div className="header-script">
            {scriptIcon && <span className="script-icon">{getIconComponent(scriptIcon)}</span>}
            <span className="script-label">Script:</span>
            <span className="script-name">{scriptName}</span>
          </div>
        )}
        
        <nav className="header-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
