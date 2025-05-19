import { useRef, useEffect } from 'react'

interface Cell {
  x: number
  y: number
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  visited: boolean
}

function generateMaze(width: number, height: number) {
  const grid: Cell[][] = []
  for (let y = 0; y < height; y++) {
    const row: Cell[] = []
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      })
    }
    grid.push(row)
  }

  const stack: Cell[] = []
  const start = grid[0][0]
  start.visited = true
  stack.push(start)

  while (stack.length > 0) {
    const current = stack.pop()!
    const neighbors: Cell[] = []

    const { x, y } = current
    if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x])
    if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1])
    if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x])
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1])

    if (neighbors.length > 0) {
      stack.push(current)
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]
      // remove wall between current and next
      if (next.y < y) {
        current.walls.top = false
        next.walls.bottom = false
      } else if (next.x > x) {
        current.walls.right = false
        next.walls.left = false
      } else if (next.y > y) {
        current.walls.bottom = false
        next.walls.top = false
      } else if (next.x < x) {
        current.walls.left = false
        next.walls.right = false
      }
      next.visited = true
      stack.push(next)
    }
  }

  grid[0][0].walls.top = false
  grid[height - 1][width - 1].walls.bottom = false
  return grid
}

export default function Maze({ width = 20, height = 20, size = 600 }: { width?: number; height?: number; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useRef<HTMLCanvasElement | null>(null)
  const gridRef = useRef<Cell[][]>([])

  useEffect(() => {
    const maze = generateMaze(width, height)
    gridRef.current = maze
    const canvas = canvasRef.current!
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const cellSize = size / width
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 0, cellSize, cellSize)
    ctx.fillStyle = '#ef4444'
    ctx.fillRect((width - 1) * cellSize, (height - 1) * cellSize, cellSize, cellSize)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${cellSize * 0.6}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('S', cellSize / 2, cellSize / 2)
    ctx.fillText('G', (width - 0.5) * cellSize, (height - 0.5) * cellSize)
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2

    for (const row of maze) {
      for (const cell of row) {
        const x = cell.x * cellSize
        const y = cell.y * cellSize
        if (cell.walls.top) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + cellSize, y)
          ctx.stroke()
        }
        if (cell.walls.right) {
          ctx.beginPath()
          ctx.moveTo(x + cellSize, y)
          ctx.lineTo(x + cellSize, y + cellSize)
          ctx.stroke()
        }
        if (cell.walls.bottom) {
          ctx.beginPath()
          ctx.moveTo(x + cellSize, y + cellSize)
          ctx.lineTo(x, y + cellSize)
          ctx.stroke()
        }
        if (cell.walls.left) {
          ctx.beginPath()
          ctx.moveTo(x, y + cellSize)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
      }
    }
  }, [width, height, size])

  useEffect(() => {
    const drawCanvas = drawRef.current!
    const dpr = window.devicePixelRatio || 1
    drawCanvas.width = size * dpr
    drawCanvas.height = size * dpr
    drawCanvas.style.width = `${size}px`
    drawCanvas.style.height = `${size}px`
    const drawCtx = drawCanvas.getContext('2d')!
    drawCtx.scale(dpr, dpr)
    const cellSize = size / width
    drawCtx.lineWidth = cellSize / 2
    drawCtx.strokeStyle = '#3b82f6'
    drawCtx.lineCap = 'round'
    let drawing = false
    let pointerDown = false
    let currentX = 0
    let currentY = 0
    const visited: boolean[][] = []
    for (let y = 0; y < height; y++) {
      visited.push(new Array(width).fill(false))
    }
    visited[0][0] = true

    const cellCenter = (x: number, y: number) => [x * cellSize + cellSize / 2, y * cellSize + cellSize / 2]

    const start = (e: PointerEvent) => {
      pointerDown = true
      const rect = drawCanvas.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / cellSize)
      const y = Math.floor((e.clientY - rect.top) / cellSize)
      if (!visited[y][x]) return
      drawing = true
      currentX = x
      currentY = y
      const [cx, cy] = cellCenter(x, y)
      drawCtx.beginPath()
      drawCtx.moveTo(cx, cy)
    }

    const move = (e: PointerEvent) => {
      const rect = drawCanvas.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / cellSize)
      const y = Math.floor((e.clientY - rect.top) / cellSize)
      if (!drawing) {
        if (pointerDown && visited[y]?.[x]) {
          drawing = true
          currentX = x
          currentY = y
          const [cx, cy] = cellCenter(x, y)
          drawCtx.beginPath()
          drawCtx.moveTo(cx, cy)
        }
        return
      }
      if (x === currentX && y === currentY) return
      if (Math.abs(x - currentX) + Math.abs(y - currentY) !== 1) return
      const grid = gridRef.current
      const cell = grid[currentY][currentX]
      if (x > currentX && cell.walls.right) return (drawing = false)
      if (x < currentX && cell.walls.left) return (drawing = false)
      if (y > currentY && cell.walls.bottom) return (drawing = false)
      if (y < currentY && cell.walls.top) return (drawing = false)
      const [cx, cy] = cellCenter(x, y)
      drawCtx.lineTo(cx, cy)
      drawCtx.stroke()
      currentX = x
      currentY = y
      visited[y][x] = true
    }

    const end = () => {
      drawing = false
      pointerDown = false
    }

    drawCanvas.addEventListener('pointerdown', start)
    drawCanvas.addEventListener('pointermove', move)
    drawCanvas.addEventListener('pointerup', end)
    drawCanvas.addEventListener('pointerleave', end)
    drawCanvas.addEventListener('pointercancel', end)

    return () => {
      drawCanvas.removeEventListener('pointerdown', start)
      drawCanvas.removeEventListener('pointermove', move)
      drawCanvas.removeEventListener('pointerup', end)
      drawCanvas.removeEventListener('pointerleave', end)
      drawCanvas.removeEventListener('pointercancel', end)
    }
  }, [size, width, height])

  return (
    <div className='relative mx-auto' style={{ width: size, height: size }}>
      <canvas ref={canvasRef} width={size} height={size} className='absolute left-0 top-0 bg-white' />
      <canvas ref={drawRef} width={size} height={size} className='absolute left-0 top-0 touch-none' />
    </div>
  )
}
