import { useState, useRef } from 'react'
import { useGame, useGameDispatch } from '../../context/GameContext'
import rolesData from '../../data/roles.json'
import CharacterCard from '../CharacterCard/CharacterCard'
import './ScriptLoader.css'

function ScriptLoader() {
  const { script, scriptName } = useGame()
  const dispatch = useGameDispatch()
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [importedScriptName, setImportedScriptName] = useState('')

  const loadOfficialScript = (scriptKey) => {
    const scriptInfo = rolesData.scripts[scriptKey]
    if (!scriptInfo) return

    const characters = scriptInfo.characters
      .map(id => rolesData.characters.find(c => c.id === id))
      .filter(Boolean)

    dispatch({
      type: 'LOAD_SCRIPT',
      payload: {
        characters,
        name: scriptInfo.name,
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
          // Array format (like official script tool exports)
          characters = json
            .filter(item => item.id && item.id !== '_meta')
            .map(item => {
              // If it's just an ID reference, look up in our database
              if (typeof item === 'string') {
                return rolesData.characters.find(c => c.id === item)
              }
              if (item.id && !item.ability) {
                const found = rolesData.characters.find(c => c.id === item.id)
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

        dispatch({
          type: 'LOAD_SCRIPT',
          payload: { characters, name },
        })
        setError('')
        setImportedScriptName('')
      } catch (err) {
        setError(`Error parsing JSON: ${err.message}`)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset file input
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
                  {key === 'tb' ? '🌅' : key === 'bmr' ? '🌙' : '💜'}
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
