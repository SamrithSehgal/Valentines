import { useState, useCallback, useEffect } from 'react'
import './MinesweeperGame.css'

const ROWS = 9
const COLS = 9
const MINES = 10

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  )
}

function placeMines(board, safeR, safeC) {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    const isSafe = Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1
    if (!newBoard[r][c].mine && !isSafe) {
      newBoard[r][c].mine = true
      placed++
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newBoard[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].mine) {
            count++
          }
        }
      }
      newBoard[r][c].adjacent = count
    }
  }
  return newBoard
}

function revealCell(board, r, c) {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  const stack = [[r, c]]
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue
    if (newBoard[cr][cc].revealed || newBoard[cr][cc].flagged) continue
    newBoard[cr][cc].revealed = true
    if (newBoard[cr][cc].adjacent === 0 && !newBoard[cr][cc].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) stack.push([cr + dr, cc + dc])
        }
      }
    }
  }
  return newBoard
}

function checkWin(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) return false
    }
  }
  return true
}

function MinesweeperGame({ onNext }) {
  const [board, setBoard] = useState(createEmptyBoard)
  const [gameState, setGameState] = useState('ready')
  const [explosion, setExplosion] = useState(false)
  const [particles, setParticles] = useState([])

  const flagCount = board.flat().filter(c => c.flagged).count
  const totalFlags = board.flat().filter(c => c.flagged).length

  const handleClick = useCallback((r, c) => {
    if (gameState === 'won' || gameState === 'lost') return
    const cell = board[r][c]
    if (cell.flagged || cell.revealed) return

    let newBoard
    if (gameState === 'ready') {
      newBoard = placeMines(board, r, c)
      newBoard = revealCell(newBoard, r, c)
      setGameState('playing')
    } else {
      if (cell.mine) {
        newBoard = board.map(row => row.map(c => ({
          ...c,
          revealed: c.mine ? true : c.revealed,
        })))
        setGameState('lost')
        setBoard(newBoard)
        return
      }
      newBoard = revealCell(board, r, c)
    }

    if (checkWin(newBoard)) {
      newBoard = newBoard.map(row => row.map(c => ({
        ...c,
        flagged: c.mine ? true : c.flagged,
      })))
      setGameState('won')
      setTimeout(() => triggerExplosion(), 300)
    }

    setBoard(newBoard)
  }, [board, gameState])

  const handleRightClick = useCallback((e, r, c) => {
    e.preventDefault()
    if (gameState === 'won' || gameState === 'lost' || gameState === 'ready') return
    const cell = board[r][c]
    if (cell.revealed) return

    const newBoard = board.map(row => row.map(cell => ({ ...cell })))
    newBoard[r][c].flagged = !newBoard[r][c].flagged
    setBoard(newBoard)
  }, [board, gameState])

  const triggerExplosion = () => {
    const newParticles = []
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5
      const velocity = 150 + Math.random() * 250
      const size = 16 + Math.random() * 24
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3,
        opacity: 0.8 + Math.random() * 0.2,
      })
    }
    setParticles(newParticles)
    setExplosion(true)
  }

  const handleReset = () => {
    setBoard(createEmptyBoard())
    setGameState('ready')
    setExplosion(false)
    setParticles([])
  }

  const getNumberColor = (num) => {
    const colors = ['', '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#ff8f00', '#00838f', '#424242', '#ad1457']
    return colors[num] || ''
  }

  return (
    <div className="minesweeper-page">
      <div className="hearts-bg">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`floating-heart heart-${i}`}>♥</span>
        ))}
      </div>

      <div className="minesweeper-container">
        <h2 className="ms-title">
          {gameState === 'won' ? '♥ WOOOHOOOOO You DID IT!!! ♥' :
           gameState === 'lost' ? 'Oh no!' : 'Minesweeper'}
        </h2>
        <p className="ms-subtitle">
          {gameState === 'won' ? 'Every heart found!' :
           gameState === 'lost' ? 'You hit a mine... try again?' :
           'Left click to reveal, right click to place a ♥'}
        </p>

        <div className="ms-info">
          <span className="ms-flag-count">♥ {MINES - totalFlags}</span>
          {gameState === 'lost' && (
            <button className="ms-reset-btn" onClick={handleReset}>Play Again</button>
          )}
        </div>

        <div
          className={`ms-grid ${gameState === 'won' ? 'ms-grid-won' : ''} ${gameState === 'lost' ? 'ms-grid-lost' : ''}`}
          onContextMenu={(e) => e.preventDefault()}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const cellClasses = [
                'ms-cell',
                cell.revealed ? 'revealed' : 'hidden',
                cell.revealed && cell.mine ? 'mine-cell' : '',
                cell.flagged && !cell.revealed ? 'flagged' : '',
                gameState === 'won' && cell.flagged ? 'flag-won' : '',
              ].filter(Boolean).join(' ')

              return (
                <div
                  key={`${r}-${c}`}
                  className={cellClasses}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                >
                  {cell.revealed && cell.mine && (
                    <span className="mine-icon">💣</span>
                  )}
                  {cell.revealed && !cell.mine && cell.adjacent > 0 && (
                    <span className="cell-num" style={{ color: getNumberColor(cell.adjacent) }}>
                      {cell.adjacent}
                    </span>
                  )}
                  {cell.flagged && !cell.revealed && (
                    <span className="flag-heart">♥</span>
                  )}
                </div>
              )
            })
          )}
        </div>

        {gameState === 'won' && (
          <button className="ms-next-button" onClick={onNext}>
            Next <span className="arrow">→</span>
          </button>
        )}

        {explosion && (
          <div className="explosion-container">
            {particles.map(p => (
              <span
                key={p.id}
                className="explosion-heart"
                style={{
                  '--vx': `${p.vx}px`,
                  '--vy': `${p.vy}px`,
                  '--size': `${p.size}px`,
                  '--rotation': `${p.rotation}deg`,
                  '--delay': `${p.delay}s`,
                  '--opacity': p.opacity,
                }}
              >
                ♥
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MinesweeperGame
