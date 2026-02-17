import { createContext, useContext, useReducer, useEffect } from 'react'

const GameContext = createContext(null)
const GameDispatchContext = createContext(null)

// Character distribution by player count
export const PLAYER_SETUP = {
  5:  { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
  6:  { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
  7:  { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
  8:  { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
  9:  { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
  10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
  11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
  12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
  13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
  14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
  15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
}

const initialState = {
  script: null,
  scriptName: '',
  players: [],
  characterBag: [],
  drawnCharacters: [],
  phase: 'setup', // setup | firstNight | day | otherNight
  dayNumber: 0,
  view: 'home', // home | setup | bag | grimoire
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_SCRIPT': {
      return {
        ...state,
        script: action.payload.characters,
        scriptName: action.payload.name,
        characterBag: [],
        drawnCharacters: [],
      }
    }
    case 'SET_VIEW': {
      return { ...state, view: action.payload }
    }
    case 'ADD_PLAYER': {
      const newPlayer = {
        id: Date.now().toString(),
        name: action.payload.name || `Player ${state.players.length + 1}`,
        character: null,
        isAlive: true,
        reminders: [],
        seatPosition: state.players.length,
      }
      return { ...state, players: [...state.players, newPlayer] }
    }
    case 'REMOVE_PLAYER': {
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
      }
    }
    case 'UPDATE_PLAYER': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      }
    }
    case 'SET_PLAYERS': {
      return { ...state, players: action.payload }
    }
    case 'ADD_TO_BAG': {
      if (state.characterBag.find(c => c.id === action.payload.id)) {
        return state
      }
      return { ...state, characterBag: [...state.characterBag, action.payload] }
    }
    case 'REMOVE_FROM_BAG': {
      return {
        ...state,
        characterBag: state.characterBag.filter(c => c.id !== action.payload),
      }
    }
    case 'SET_BAG': {
      return { ...state, characterBag: action.payload }
    }
    case 'DRAW_CHARACTER': {
      if (state.characterBag.length === 0) return state
      const randomIndex = Math.floor(Math.random() * state.characterBag.length)
      const drawnChar = state.characterBag[randomIndex]
      return {
        ...state,
        characterBag: state.characterBag.filter((_, i) => i !== randomIndex),
        drawnCharacters: [...state.drawnCharacters, drawnChar],
      }
    }
    case 'RESET_BAG': {
      return {
        ...state,
        characterBag: [...state.characterBag, ...state.drawnCharacters],
        drawnCharacters: [],
      }
    }
    case 'ASSIGN_CHARACTER': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, character: action.payload.character }
            : p
        ),
      }
    }
    case 'TOGGLE_PLAYER_ALIVE': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload ? { ...p, isAlive: !p.isAlive } : p
        ),
      }
    }
    case 'ADD_REMINDER': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, reminders: [...p.reminders, action.payload.reminder] }
            : p
        ),
      }
    }
    case 'REMOVE_REMINDER': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? {
                ...p,
                reminders: p.reminders.filter(
                  (_, i) => i !== action.payload.index
                ),
              }
            : p
        ),
      }
    }
    case 'SET_PHASE': {
      return { ...state, phase: action.payload }
    }
    case 'NEXT_DAY': {
      return { ...state, dayNumber: state.dayNumber + 1, phase: 'day' }
    }
    case 'RESET_GAME': {
      return {
        ...initialState,
        script: state.script,
        scriptName: state.scriptName,
      }
    }
    case 'LOAD_STATE': {
      return { ...state, ...action.payload }
    }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    // Load from localStorage on init
    const saved = localStorage.getItem('botc-game-state')
    if (saved) {
      try {
        return { ...initial, ...JSON.parse(saved) }
      } catch {
        return initial
      }
    }
    return initial
  })

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('botc-game-state', JSON.stringify(state))
  }, [state])

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}

export function useGameDispatch() {
  return useContext(GameDispatchContext)
}
