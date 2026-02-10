import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import ScriptLoader from './components/ScriptLoader/ScriptLoader'
import SetupCalculator from './components/SetupCalculator/SetupCalculator'
import CharacterBag from './components/CharacterBag/CharacterBag'
import Grimoire from './components/Grimoire/Grimoire'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/script" element={<ScriptLoader />} />
          <Route path="/calculator" element={<SetupCalculator />} />
          <Route path="/bag" element={<CharacterBag />} />
          <Route path="/grimoire" element={<Grimoire />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
