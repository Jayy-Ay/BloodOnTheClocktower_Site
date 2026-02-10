import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame, useGameDispatch, PLAYER_SETUP } from '../../context/GameContext'
import { GiPerspectiveDiceSixFacesRandom, GiThreeFriends } from 'react-icons/gi'
import { FaExclamationTriangle } from 'react-icons/fa'
import './SetupCalculator.css'

function SetupCalculator() {
  const { script, scriptName } = useGame()
  const dispatch = useGameDispatch()
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(7)

  const setup = PLAYER_SETUP[playerCount] || PLAYER_SETUP[15]

  // Check for setup-modifying characters
  const getModifiedSetup = () => {
    if (!script) return setup

    const mods = { ...setup }
    
    // Baron: +2 Outsiders, -2 Townsfolk
    if (script.some(c => c.id === 'baron')) {
      mods.outsider += 2
      mods.townsfolk -= 2
    }
    
    // Godfather: +1 or -1 Outsider
    // (For simplicity, we'll show it as a range note)
    
    // Fang Gu: +1 Outsider
    if (script.some(c => c.id === 'fanggu')) {
      mods.outsider += 1
      mods.townsfolk -= 1
    }
    
    // Vigormortis: -1 Outsider
    if (script.some(c => c.id === 'vigormortis')) {
      mods.outsider -= 1
      mods.townsfolk += 1
    }

    // Ensure no negative values
    if (mods.outsider < 0) {
      mods.townsfolk += mods.outsider
      mods.outsider = 0
    }

    return mods
  }

  const modifiedSetup = getModifiedSetup()
  const hasModifiers = script?.some(c => ['baron', 'godfather', 'fanggu', 'vigormortis'].includes(c.id))

  const handleAutoFillBag = () => {
    if (!script) return

    const townsfolk = script.filter(c => c.team === 'townsfolk')
    const outsiders = script.filter(c => c.team === 'outsider')
    const minions = script.filter(c => c.team === 'minion')
    const demons = script.filter(c => c.team === 'demon')

    // Shuffle arrays
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

    const bag = [
      ...shuffle(townsfolk).slice(0, modifiedSetup.townsfolk),
      ...shuffle(outsiders).slice(0, modifiedSetup.outsider),
      ...shuffle(minions).slice(0, modifiedSetup.minion),
      ...shuffle(demons).slice(0, modifiedSetup.demon),
    ]

    dispatch({ type: 'SET_BAG', payload: bag })
    navigate('/bag')
  }

  const handleCreatePlayers = () => {
    // Clear existing players and create new ones
    const players = []
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: Date.now().toString() + i,
        name: `Player ${i + 1}`,
        character: null,
        isAlive: true,
        reminders: [],
        seatPosition: i,
      })
    }
    dispatch({ type: 'SET_PLAYERS', payload: players })
    navigate('/grimoire')
  }

  return (
    <div className="setup-calculator">
      <h2 className="section-title">Setup Calculator</h2>

      <div className="calculator-content">
        <div className="card player-count-card">
          <h3 className="card-title">Player Count</h3>
          <div className="player-count-selector">
            <button
              className="count-btn"
              onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
              disabled={playerCount <= 5}
            >
              −
            </button>
            <span className="player-count">{playerCount}</span>
            <button
              className="count-btn"
              onClick={() => setPlayerCount(Math.min(15, playerCount + 1))}
              disabled={playerCount >= 15}
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="5"
            max="15"
            value={playerCount}
            onChange={(e) => setPlayerCount(parseInt(e.target.value))}
            className="player-slider"
          />
        </div>

        <div className="card distribution-card">
          <h3 className="card-title">Character Distribution</h3>
          
          {!hasModifiers && (
            <div className="distribution-grid">
              <div className="dist-item townsfolk">
                <span className="dist-count">{setup.townsfolk}</span>
                <span className="dist-label">Townsfolk</span>
              </div>
              <div className="dist-item outsider">
                <span className="dist-count">{setup.outsider}</span>
                <span className="dist-label">Outsiders</span>
              </div>
              <div className="dist-item minion">
                <span className="dist-count">{setup.minion}</span>
                <span className="dist-label">Minions</span>
              </div>
              <div className="dist-item demon">
                <span className="dist-count">{setup.demon}</span>
                <span className="dist-label">Demons</span>
              </div>
            </div>
          )}

          {hasModifiers && (
            <>
              <p className="modifier-notice">
                <FaExclamationTriangle /> Your script contains setup-modifying characters
              </p>
              <div className="distribution-grid modified">
                <div className="dist-item townsfolk">
                  <span className="dist-count">
                    {setup.townsfolk !== modifiedSetup.townsfolk ? (
                      <>
                        <s>{setup.townsfolk}</s> → {modifiedSetup.townsfolk}
                      </>
                    ) : setup.townsfolk}
                  </span>
                  <span className="dist-label">Townsfolk</span>
                </div>
                <div className="dist-item outsider">
                  <span className="dist-count">
                    {setup.outsider !== modifiedSetup.outsider ? (
                      <>
                        <s>{setup.outsider}</s> → {modifiedSetup.outsider}
                      </>
                    ) : setup.outsider}
                  </span>
                  <span className="dist-label">Outsiders</span>
                </div>
                <div className="dist-item minion">
                  <span className="dist-count">{modifiedSetup.minion}</span>
                  <span className="dist-label">Minions</span>
                </div>
                <div className="dist-item demon">
                  <span className="dist-count">{modifiedSetup.demon}</span>
                  <span className="dist-label">Demons</span>
                </div>
              </div>
            </>
          )}

          <div className="total-row">
            <span>Total:</span>
            <span className="total-count">
              {modifiedSetup.townsfolk + modifiedSetup.outsider + modifiedSetup.minion + modifiedSetup.demon}
            </span>
          </div>
        </div>

        <div className="card actions-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAutoFillBag}
              disabled={!script}
            >
              <GiPerspectiveDiceSixFacesRandom /> Auto-Fill Bag
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleCreatePlayers}
            >
              <GiThreeFriends /> Create {playerCount} Players
            </button>
          </div>
          {!script && (
            <p className="action-notice">Load a script first to auto-fill the bag</p>
          )}
        </div>
      </div>

      <div className="setup-reference">
        <h3 className="card-title">Reference Table</h3>
        <table className="setup-table">
          <thead>
            <tr>
              <th>Players</th>
              <th className="townsfolk">Townsfolk</th>
              <th className="outsider">Outsiders</th>
              <th className="minion">Minions</th>
              <th className="demon">Demons</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(PLAYER_SETUP).map(([count, dist]) => (
              <tr key={count} className={parseInt(count) === playerCount ? 'active' : ''}>
                <td>{count}</td>
                <td className="townsfolk">{dist.townsfolk}</td>
                <td className="outsider">{dist.outsider}</td>
                <td className="minion">{dist.minion}</td>
                <td className="demon">{dist.demon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SetupCalculator
