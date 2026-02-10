import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame, useGameDispatch } from '../../context/GameContext'
import { GiDramaMasks, GiCardRandom, GiEyeball, GiReturnArrow, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi'
import { FaCheck, FaTimes } from 'react-icons/fa'
import CharacterCard from '../CharacterCard/CharacterCard'
import './CharacterBag.css'

function CharacterBag() {
  const { script, scriptName, characterBag, drawnCharacters } = useGame()
  const dispatch = useGameDispatch()
  const navigate = useNavigate()
  const [currentDraw, setCurrentDraw] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showDrawnList, setShowDrawnList] = useState(false)

  if (!script) {
    return (
      <div className="character-bag">
        <h2 className="section-title">Character Bag</h2>
        <div className="no-script-message">
          <p>No script loaded. Please load a script first.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/script')}
          >
            Load Script
          </button>
        </div>
      </div>
    )
  }

  const groupedScript = {
    townsfolk: script.filter(c => c.team === 'townsfolk'),
    outsider: script.filter(c => c.team === 'outsider'),
    minion: script.filter(c => c.team === 'minion'),
    demon: script.filter(c => c.team === 'demon'),
  }

  const bagCounts = {
    townsfolk: characterBag.filter(c => c.team === 'townsfolk').length,
    outsider: characterBag.filter(c => c.team === 'outsider').length,
    minion: characterBag.filter(c => c.team === 'minion').length,
    demon: characterBag.filter(c => c.team === 'demon').length,
  }

  const isInBag = (charId) => characterBag.some(c => c.id === charId)
  const isDrawn = (charId) => drawnCharacters.some(c => c.id === charId)

  const toggleCharacter = (character) => {
    if (isInBag(character.id)) {
      dispatch({ type: 'REMOVE_FROM_BAG', payload: character.id })
    } else if (!isDrawn(character.id)) {
      dispatch({ type: 'ADD_TO_BAG', payload: character })
    }
  }

  const handleDraw = () => {
    if (characterBag.length === 0) return

    setIsDrawing(true)
    setCurrentDraw(null)

    // Animation delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * characterBag.length)
      const drawn = characterBag[randomIndex]
      setCurrentDraw(drawn)
      setIsDrawing(false)
      // Don't remove from bag yet - wait for confirm
    }, 1500)
  }

  const confirmDraw = () => {
    if (!currentDraw) return
    dispatch({ type: 'DRAW_CHARACTER' })
    // Find and remove the specific drawn character
    const newBag = characterBag.filter(c => c.id !== currentDraw.id)
    dispatch({ type: 'SET_BAG', payload: newBag })
    dispatch({
      type: 'SET_BAG',
      payload: characterBag.filter(c => c.id !== currentDraw.id),
    })
    setCurrentDraw(null)
  }

  const resetDraw = () => {
    setCurrentDraw(null)
  }

  const resetBag = () => {
    if (confirm('Return all drawn characters to the bag?')) {
      dispatch({ type: 'RESET_BAG' })
      setCurrentDraw(null)
    }
  }

  const shuffleBag = () => {
    const shuffled = [...characterBag].sort(() => Math.random() - 0.5)
    dispatch({ type: 'SET_BAG', payload: shuffled })
  }

  const addAllToTeam = (team) => {
    const chars = groupedScript[team].filter(c => !isInBag(c.id) && !isDrawn(c.id))
    chars.forEach(c => dispatch({ type: 'ADD_TO_BAG', payload: c }))
  }

  const removeAllFromTeam = (team) => {
    const charIds = groupedScript[team].map(c => c.id)
    charIds.forEach(id => dispatch({ type: 'REMOVE_FROM_BAG', payload: id }))
  }

  return (
    <div className="character-bag">
      <h2 className="section-title">Character Bag</h2>

      <div className="bag-layout">
        {/* Draw Section */}
        <div className="draw-section">
          <div className="card draw-card">
            <h3 className="card-title">Draw from Bag</h3>
            
            <div className="bag-stats">
              <span className="bag-count">{characterBag.length}</span>
              <span className="bag-label">characters in bag</span>
            </div>

            <div className="draw-area">
              {isDrawing ? (
                <div className="drawing-animation">
                  <div className="draw-spinner"><GiDramaMasks /></div>
                  <p>Drawing...</p>
                </div>
              ) : currentDraw ? (
                <div className="drawn-character">
                  <CharacterCard character={currentDraw} size="large" />
                  <div className="draw-actions">
                    <button className="btn btn-primary" onClick={confirmDraw}>
                      <FaCheck /> Confirm & Remove
                    </button>
                    <button className="btn btn-secondary" onClick={resetDraw}>
                      <FaTimes /> Put Back
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-lg draw-btn"
                  onClick={handleDraw}
                  disabled={characterBag.length === 0}
                >
                  <GiPerspectiveDiceSixFacesRandom /> Draw Character
                </button>
              )}
            </div>

            <div className="bag-controls">
              <button className="btn btn-secondary btn-sm" onClick={shuffleBag}>
                <GiCardRandom /> Shuffle
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDrawnList(!showDrawnList)}
              >
                <GiEyeball /> {showDrawnList ? 'Hide' : 'Show'} Drawn ({drawnCharacters.length})
              </button>
              <button className="btn btn-danger btn-sm" onClick={resetBag} disabled={drawnCharacters.length === 0}>
                <GiReturnArrow /> Reset
              </button>
            </div>

            {showDrawnList && drawnCharacters.length > 0 && (
              <div className="drawn-list">
                <h4>Drawn Characters</h4>
                <div className="drawn-grid">
                  {drawnCharacters.map(char => (
                    <CharacterCard key={char.id} character={char} size="small" showAbility={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bag Summary */}
          <div className="card bag-summary">
            <h4>Bag Contents</h4>
            <div className="summary-row townsfolk">
              <span>Townsfolk</span>
              <span>{bagCounts.townsfolk}</span>
            </div>
            <div className="summary-row outsider">
              <span>Outsiders</span>
              <span>{bagCounts.outsider}</span>
            </div>
            <div className="summary-row minion">
              <span>Minions</span>
              <span>{bagCounts.minion}</span>
            </div>
            <div className="summary-row demon">
              <span>Demons</span>
              <span>{bagCounts.demon}</span>
            </div>
          </div>
        </div>

        {/* Character Selection */}
        <div className="selection-section">
          <p className="selection-instructions">
            Click characters to add/remove from the bag. Green border = in bag.
          </p>

          {['townsfolk', 'outsider', 'minion', 'demon'].map(team => {
            const chars = groupedScript[team]
            if (chars.length === 0) return null

            return (
              <div key={team} className="team-section">
                <div className="team-header-row">
                  <h4 className={`team-header team-${team}`}>
                    {team.charAt(0).toUpperCase() + team.slice(1)} ({chars.length})
                  </h4>
                  <div className="team-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => addAllToTeam(team)}
                    >
                      + All
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => removeAllFromTeam(team)}
                    >
                      − All
                    </button>
                  </div>
                </div>
                <div className="character-grid">
                  {chars.map(char => (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      selected={isInBag(char.id)}
                      onClick={toggleCharacter}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CharacterBag
