import { useState } from 'react'
import { useGame, useGameDispatch } from '../../context/GameContext'
import CharacterCard from '../CharacterCard/CharacterCard'
import './Grimoire.css'

const REMINDERS = [
  { id: 'dead', label: 'Dead', color: '#7f8c8d', icon: '💀' },
  { id: 'poisoned', label: 'Poisoned', color: '#8e44ad', icon: '☠️' },
  { id: 'drunk', label: 'Drunk', color: '#e74c3c', icon: '🍺' },
  { id: 'protected', label: 'Protected', color: '#3498db', icon: '🛡️' },
  { id: 'noability', label: 'No Ability', color: '#95a5a6', icon: '🚫' },
  { id: 'mad', label: 'Mad', color: '#9b59b6', icon: '🎭' },
  { id: 'custom', label: 'Custom', color: '#f39c12', icon: '📌' },
]

function Grimoire() {
  const { script, players } = useGame()
  const dispatch = useGameDispatch()
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showCharacterSelect, setShowCharacterSelect] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [customReminder, setCustomReminder] = useState('')

  if (!script) {
    return (
      <div className="grimoire">
        <h2 className="section-title">Grimoire</h2>
        <div className="no-script-message">
          <p>No script loaded. Please load a script first.</p>
          <button
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'setup' })}
          >
            Load Script
          </button>
        </div>
      </div>
    )
  }

  const handleAddPlayer = () => {
    dispatch({ type: 'ADD_PLAYER', payload: { name: newPlayerName || undefined } })
    setNewPlayerName('')
  }

  const handleRemovePlayer = (playerId) => {
    if (confirm('Remove this player?')) {
      dispatch({ type: 'REMOVE_PLAYER', payload: playerId })
      if (selectedPlayer?.id === playerId) {
        setSelectedPlayer(null)
      }
    }
  }

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player)
    setShowCharacterSelect(false)
  }

  const handleAssignCharacter = (character) => {
    if (!selectedPlayer) return
    dispatch({
      type: 'ASSIGN_CHARACTER',
      payload: { playerId: selectedPlayer.id, character },
    })
    setShowCharacterSelect(false)
    // Update selected player reference
    setSelectedPlayer({ ...selectedPlayer, character })
  }

  const handleToggleAlive = (playerId) => {
    dispatch({ type: 'TOGGLE_PLAYER_ALIVE', payload: playerId })
  }

  const handleAddReminder = (reminderId) => {
    if (!selectedPlayer) return
    
    let reminderText = REMINDERS.find(r => r.id === reminderId)?.label || reminderId
    
    if (reminderId === 'custom') {
      reminderText = customReminder || 'Custom'
      setCustomReminder('')
    }
    
    dispatch({
      type: 'ADD_REMINDER',
      payload: { playerId: selectedPlayer.id, reminder: reminderText },
    })
    // Update local state
    setSelectedPlayer({
      ...selectedPlayer,
      reminders: [...selectedPlayer.reminders, reminderText],
    })
  }

  const handleRemoveReminder = (index) => {
    if (!selectedPlayer) return
    dispatch({
      type: 'REMOVE_REMINDER',
      payload: { playerId: selectedPlayer.id, index },
    })
    setSelectedPlayer({
      ...selectedPlayer,
      reminders: selectedPlayer.reminders.filter((_, i) => i !== index),
    })
  }

  const handleUpdatePlayerName = (name) => {
    if (!selectedPlayer) return
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: { id: selectedPlayer.id, updates: { name } },
    })
    setSelectedPlayer({ ...selectedPlayer, name })
  }

  // Calculate positions for circular layout
  const getPlayerPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start from top
    const radius = 38 // percentage from center
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return { x, y }
  }

  return (
    <div className="grimoire">
      <div className="grimoire-layout">
        {/* Main Circle View */}
        <div className="grimoire-circle-container">
          <div className="grimoire-circle">
            {/* Center area */}
            <div className="circle-center">
              <span className="center-icon">🩸</span>
              <span className="center-text">
                {players.filter(p => p.isAlive).length} / {players.length}
              </span>
              <span className="center-label">Alive</span>
            </div>

            {/* Player tokens */}
            {players.map((player, index) => {
              const pos = getPlayerPosition(index, players.length)
              const isSelected = selectedPlayer?.id === player.id

              return (
                <div
                  key={player.id}
                  className={`player-token ${!player.isAlive ? 'dead' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="token-inner">
                    {player.character ? (
                      <div className={`token-character team-${player.character.team}`}>
                        <span className="token-char-name">{player.character.name}</span>
                      </div>
                    ) : (
                      <div className="token-empty">?</div>
                    )}
                    <span className="token-player-name">{player.name}</span>
                    
                    {!player.isAlive && <div className="death-shroud">💀</div>}
                    
                    {player.reminders.length > 0 && (
                      <div className="token-reminders">
                        {player.reminders.slice(0, 3).map((r, i) => (
                          <span key={i} className="mini-reminder" title={r}>
                            {REMINDERS.find(rem => rem.label === r)?.icon || '📌'}
                          </span>
                        ))}
                        {player.reminders.length > 3 && (
                          <span className="mini-reminder more">+{player.reminders.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="grimoire-panel">
          {/* Add Player */}
          <div className="card panel-section">
            <h3 className="panel-title">Players ({players.length})</h3>
            <div className="add-player-form">
              <input
                type="text"
                className="form-input"
                placeholder="Player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              />
              <button className="btn btn-primary" onClick={handleAddPlayer}>
                + Add
              </button>
            </div>
          </div>

          {/* Selected Player Details */}
          {selectedPlayer && (
            <div className="card panel-section">
              <h3 className="panel-title">Selected Player</h3>
              
              <div className="player-details">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedPlayer.name}
                    onChange={(e) => handleUpdatePlayerName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Character</label>
                  {selectedPlayer.character ? (
                    <div className="selected-character">
                      <CharacterCard character={selectedPlayer.character} size="small" />
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowCharacterSelect(true)}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowCharacterSelect(true)}
                    >
                      Assign Character
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <button
                    className={`btn ${selectedPlayer.isAlive ? 'btn-primary' : 'btn-danger'}`}
                    onClick={() => {
                      handleToggleAlive(selectedPlayer.id)
                      setSelectedPlayer({ ...selectedPlayer, isAlive: !selectedPlayer.isAlive })
                    }}
                  >
                    {selectedPlayer.isAlive ? '💚 Alive' : '💀 Dead'}
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Reminders</label>
                  <div className="reminder-buttons">
                    {REMINDERS.filter(r => r.id !== 'custom').map(reminder => (
                      <button
                        key={reminder.id}
                        className="reminder-btn"
                        onClick={() => handleAddReminder(reminder.id)}
                        title={reminder.label}
                      >
                        {reminder.icon}
                      </button>
                    ))}
                  </div>
                  <div className="custom-reminder-form">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Custom reminder"
                      value={customReminder}
                      onChange={(e) => setCustomReminder(e.target.value)}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddReminder('custom')}
                    >
                      +
                    </button>
                  </div>
                  {selectedPlayer.reminders.length > 0 && (
                    <div className="active-reminders">
                      {selectedPlayer.reminders.map((r, i) => (
                        <span key={i} className="reminder-tag" onClick={() => handleRemoveReminder(i)}>
                          {r} ✕
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemovePlayer(selectedPlayer.id)}
                >
                  Remove Player
                </button>
              </div>
            </div>
          )}

          {/* Character Selection Modal */}
          {showCharacterSelect && (
            <div className="card panel-section character-select">
              <div className="character-select-header">
                <h3 className="panel-title">Select Character</h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCharacterSelect(false)}
                >
                  Cancel
                </button>
              </div>
              <div className="character-select-grid">
                {script.map(char => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    size="small"
                    onClick={() => handleAssignCharacter(char)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Grimoire
