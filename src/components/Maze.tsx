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

  return grid
}

export default function Maze({ width = 20, height = 20, size = 600 }: { width?: number; height?: number; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const maze = generateMaze(width, height)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const cellSize = size / width
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#000'
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
    const drawCtx = drawCanvas.getContext('2d')!
    drawCtx.lineWidth = 4
    drawCtx.strokeStyle = 'red'
    let drawing = false

    const start = (e: PointerEvent) => {
      drawing = true
      const rect = drawCanvas.getBoundingClientRect()
      drawCtx.beginPath()
      drawCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }

    const move = (e: PointerEvent) => {
      if (!drawing) return
      const rect = drawCanvas.getBoundingClientRect()
      drawCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
      drawCtx.stroke()
    }

    const end = () => {
      drawing = false
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
  }, [size])

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <canvas ref={canvasRef} width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }} />
      <canvas ref={drawRef} width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }} />
    </div>
  )
}
