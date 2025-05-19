import Maze from './components/Maze'

function App() {
  return (
    <div className='container mx-auto p-8 text-center flex flex-col items-center gap-4'>
      <h1 className='text-3xl font-bold'>Maze Playground</h1>
      <Maze width={12} height={12} size={320} />
    </div>
  )
}

export default App
