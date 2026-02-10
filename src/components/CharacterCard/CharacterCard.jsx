import { useState } from 'react'
import { GiCog } from 'react-icons/gi'
import './CharacterCard.css'

function CharacterCard({ character, onClick, selected, showAbility = true, size = 'normal' }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    if (onClick) onClick(character)
  }

  return (
    <div
      className={`character-card ${selected ? 'selected' : ''} team-${character.team} size-${size}`}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="character-icon">
        {character.image ? (
          <img src={character.image} alt={character.name} className="character-image" />
        ) : (
          <div className={`character-team-badge team-${character.team}`}></div>
        )}
      </div>
      <div className="character-info">
        <span className="character-name">{character.name}</span>
        {character.setup && <span className="setup-indicator" title="Affects setup"><GiCog /></span>}
      </div>
      
      {showTooltip && showAbility && (
        <div className="character-tooltip">
          <div className="tooltip-header">
            <span className={`team-badge ${character.team}`}>
              {character.team}
            </span>
            <span className="tooltip-name">{character.name}</span>
          </div>
          <p className="tooltip-ability">{character.ability}</p>
          {character.reminders?.length > 0 && (
            <div className="tooltip-reminders">
              <span className="reminders-label">Reminders:</span>
              {character.reminders.map((r, i) => (
                <span key={i} className="reminder-tag">{r}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CharacterCard
