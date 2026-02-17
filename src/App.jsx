import { useGame, useGameDispatch } from './context/GameContext'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import ScriptLoader from './components/ScriptLoader/ScriptLoader'
import SetupCalculator from './components/SetupCalculator/SetupCalculator'
import CharacterBag from './components/CharacterBag/CharacterBag'
import Grimoire from './components/Grimoire/Grimoire'
import './App.css'

function App() {
  const { view } = useGame()

  const renderView = () => {
    switch (view) {
      case 'setup':
        return <ScriptLoader />
      case 'calculator':
        return <SetupCalculator />
      case 'bag':
        return <CharacterBag />
      case 'grimoire':
        return <Grimoire />
      default:
        return <Home />
    }
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

export default App
