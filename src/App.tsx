import Maze from './components/Maze'
import './App.css'

function App() {
  return (
    <div id="root-container">
      <h1>Maze Playground</h1>
      <Maze width={20} height={20} size={600} />
    </div>
  )
}

export default App
