import { useState, useRef } from 'react'
import { useGame, useGameDispatch } from '../../context/GameContext'
import rolesData from '../../data/roles.json'
import CharacterCard from '../CharacterCard/CharacterCard'
import { FaEdit, FaTrash } from 'react-icons/fa'
import getIconComponent from '../../utils/getIconComponent'
import './ScriptLoader.css'



function ScriptLoader() {
  const { script, scriptName, scriptIcon, savedScripts, players, characterBag } = useGame()
  const dispatch = useGameDispatch()
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [importedScriptName, setImportedScriptName] = useState('')
  const [importedScriptIcon, setImportedScriptIcon] = useState('scroll')
  const [editingScript, setEditingScript] = useState(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')

  const loadOfficialScript = (scriptKey) => {
    const scriptInfo = rolesData.scripts[scriptKey]
    if (!scriptInfo) return

    const characters = scriptInfo.characters
      .map(id => rolesData.characters.find(c => c.id === id))
      .filter(Boolean)

    const iconMap = {
      tb: 'sunrise',
      bmr: 'crescent',
      snv: 'purple'
    }
    const icon = iconMap[scriptKey]

    dispatch({
      type: 'LOAD_SCRIPT',
      payload: {
        characters,
        name: scriptInfo.name,
        icon,
      },
    })
    setError('')
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        let characters = []
        let name = importedScriptName || file.name.replace('.json', '')

        // Handle different JSON formats
        if (Array.isArray(json)) {
          // Array format — supports plain strings ("imp"), objects ({id:"imp"}), or full definitions
          characters = json
            .filter(item => typeof item === 'string' || (item.id && item.id !== '_meta'))
            .map(item => {
              // Plain string ID (e.g. "steward", "imp")
              if (typeof item === 'string') {
                return rolesData.characters.find(c => c.id === item.toLowerCase())
              }
              // Object with just an id — look up in our database
              if (item.id && !item.ability) {
                const found = rolesData.characters.find(c => c.id === item.id.toLowerCase())
                return found || item
              }
              // Full character definition
              return {
                id: item.id,
                name: item.name || item.id,
                team: item.team || 'townsfolk',
                ability: item.ability || '',
                edition: item.edition || 'custom',
                firstNight: item.firstNight || 0,
                otherNight: item.otherNight || 0,
                reminders: item.reminders || [],
                setup: item.setup || false,
                image: item.image,
              }
            })
            .filter(Boolean)

          // Check for _meta
          const meta = json.find(item => item.id === '_meta')
          if (meta?.name) {
            name = meta.name
          }
        } else if (json.characters) {
          // Object format with characters array
          characters = json.characters
          name = json.name || name
        }

        if (characters.length === 0) {
          setError('No valid characters found in the JSON file')
          return
        }

        const icon = importedScriptIcon || '📜'

        dispatch({
          type: 'LOAD_SCRIPT',
          payload: { characters, name, icon },
        })
        
        // Save to custom scripts
        dispatch({
          type: 'SAVE_CUSTOM_SCRIPT',
          payload: { characters, name, icon },
        })
        
        setError('')
        setImportedScriptName('')
        setImportedScriptIcon('📜')
      } catch (err) {
        setError(`Error parsing JSON: ${err.message}`)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  const loadSavedScript = (savedScript) => {
    dispatch({
      type: 'LOAD_SCRIPT',
      payload: {
        characters: savedScript.characters,
        name: savedScript.name,
        icon: savedScript.icon,
      },
    })
    setError('')
  }

  const startEditingScript = (savedScript) => {
    setEditingScript(savedScript.id)
    setEditName(savedScript.name)
    setEditIcon(savedScript.icon)
  }

  const saveScriptEdit = (scriptId) => {
    dispatch({
      type: 'UPDATE_CUSTOM_SCRIPT',
      payload: {
        id: scriptId,
        updates: { name: editName, icon: editIcon },
      },
    })
    setEditingScript(null)
    
    // If this is the currently loaded script, update it
    const editedScript = savedScripts.find(s => s.id === scriptId)
    if (editedScript && scriptName === savedScripts.find(s => s.id === scriptId).name) {
      dispatch({
        type: 'LOAD_SCRIPT',
        payload: {
          characters: editedScript.characters,
          name: editName,
          icon: editIcon,
        },
      })
    }
  }

  const deleteScript = (scriptId) => {
    if (confirm('Delete this custom script?')) {
      dispatch({ type: 'DELETE_CUSTOM_SCRIPT', payload: scriptId })
    }
  }

  const groupedCharacters = script
    ? {
        townsfolk: script.filter(c => c.team === 'townsfolk'),
        outsider: script.filter(c => c.team === 'outsider'),
        minion: script.filter(c => c.team === 'minion'),
        demon: script.filter(c => c.team === 'demon'),
        traveler: script.filter(c => c.team === 'traveler'),
      }
    : null

  return (
    <div className="script-loader">
      <h2 className="section-title">Load Script</h2>

      {script && (
        <div className="current-script-status">
          <div className="status-card highlight">
            <span className="status-icon">{getIconComponent(scriptIcon)}</span>
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

      <div className="script-options">
        <div className="card">
          <h3 className="card-title">Official Scripts</h3>
          <div className="official-scripts">
            {Object.entries(rolesData.scripts).map(([key, scriptInfo]) => (
              <button
                key={key}
                className={`script-btn ${scriptName === scriptInfo.name ? 'active' : ''}`}
                onClick={() => loadOfficialScript(key)}
              >
                <span className="script-btn-icon">
                  {getIconComponent(key === 'tb' ? 'sunrise' : key === 'bmr' ? 'crescent' : 'purple')}
                </span>
                <span className="script-btn-name">{scriptInfo.name}</span>
                <span className="script-btn-count">{scriptInfo.characters.length} characters</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Import Custom Script</h3>
          <p className="card-description">
            Upload a JSON file from the official script tool or any compatible format
          </p>
          
          <div className="form-group">
            <label className="form-label">Script Name (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="My Custom Script"
              value={importedScriptName}
              onChange={(e) => setImportedScriptName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Script Icon (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="📜"
              value={importedScriptIcon}
              onChange={(e) => setImportedScriptIcon(e.target.value)}
              maxLength="2"
            />
            <p className="form-hint">Use any emoji</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose JSON File
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {savedScripts.length > 0 && (
        <div className="past-scripts">
          <h3 className="section-title">Past Scripts ({savedScripts.length})</h3>
          <div className="saved-scripts-grid">
            {savedScripts.slice().reverse().map(savedScript => (
              <div key={savedScript.id} className="saved-script-card">
                {editingScript === savedScript.id ? (
                  <div className="edit-script-form">
                    <select
                      className="form-input icon-select"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                    >
                      <option value="scroll">📜 Scroll</option>
                      <option value="sunrise">🌅 Sunrise</option>
                      <option value="crescent">🌙 Crescent</option>
                      <option value="purple">💜 Purple Heart</option>
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Script Name"
                    />
                    <div className="edit-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => saveScriptEdit(savedScript.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingScript(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className={`saved-script-btn ${scriptName === savedScript.name ? 'active' : ''}`}
                      onClick={() => loadSavedScript(savedScript)}
                    >
                      <span className="script-btn-icon">{getIconComponent(savedScript.icon)}</span>
                      <span className="script-btn-name">{savedScript.name}</span>
                      <span className="script-btn-count">
                        {savedScript.characters.length} characters
                      </span>
                    </button>
                    <div className="saved-script-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => startEditingScript(savedScript)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteScript(savedScript.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {script && groupedCharacters && (
        <div className="loaded-script">
          <h3 className="section-title">
            {scriptName} ({script.length} characters)
          </h3>

          {['townsfolk', 'outsider', 'minion', 'demon', 'traveler'].map(team => {
            const chars = groupedCharacters[team]
            if (chars.length === 0) return null
            
            return (
              <div key={team} className="team-section">
                <h4 className={`team-header team-${team}`}>
                  {team.charAt(0).toUpperCase() + team.slice(1)} ({chars.length})
                </h4>
                <div className="character-grid">
                  {chars.map(char => (
                    <CharacterCard key={char.id} character={char} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ScriptLoader
