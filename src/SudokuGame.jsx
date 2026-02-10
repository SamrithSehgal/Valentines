import { useState, useEffect, useRef } from 'react'
import './SudokuGame.css'

const SOLUTION = [
  [9,7,8,3,1,2,5,4,6],
  [3,1,2,6,4,5,8,7,9],
  [6,4,5,9,7,8,2,1,3],
  [1,8,9,4,2,3,6,5,7],
  [4,2,3,7,5,6,9,8,1],
  [7,5,6,1,8,9,3,2,4],
  [5,3,4,8,6,7,1,9,2],
  [8,6,7,2,9,1,4,3,5],
  [2,9,1,5,3,4,7,6,8],
]

const PUZZLE = [
  [0,0,0,3,0,0,5,0,6],
  [3,0,0,0,4,0,0,7,0],
  [0,0,5,0,0,8,0,0,3],
  [0,8,0,0,2,0,0,0,7],
  [0,0,3,0,0,0,0,8,0],
  [0,5,0,0,0,9,0,2,0],
  [5,0,0,8,0,0,0,0,0],
  [0,6,0,0,0,0,4,0,0],
  [0,0,0,0,0,4,0,0,0],
]

const HEART_CELLS = [
  [0,4],[1,1],[2,7],[3,0],[4,8],[5,3],[6,6],[7,5],[8,2]
]

function SudokuGame({ onNext }) {
  const [grid, setGrid] = useState(() => PUZZLE.map(row => row.map(val => val)))
  const [selected, setSelected] = useState(null)
  const [solved, setSolved] = useState(false)
  const [errors, setErrors] = useState(new Set())
  const [heartReveal, setHeartReveal] = useState(false)
  const gridRef = useRef(null)

  const isGiven = (r, c) => PUZZLE[r][c] !== 0

  const checkErrors = (newGrid) => {
    const errs = new Set()
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = newGrid[r][c]
        if (val === 0) continue
        for (let cc = 0; cc < 9; cc++) {
          if (cc !== c && newGrid[r][cc] === val) { errs.add(`${r}-${c}`); errs.add(`${r}-${cc}`) }
        }
        for (let rr = 0; rr < 9; rr++) {
          if (rr !== r && newGrid[rr][c] === val) { errs.add(`${r}-${c}`); errs.add(`${rr}-${c}`) }
        }
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
        for (let rr = br; rr < br + 3; rr++) {
          for (let cc = bc; cc < bc + 3; cc++) {
            if ((rr !== r || cc !== c) && newGrid[rr][cc] === val) { errs.add(`${r}-${c}`); errs.add(`${rr}-${cc}`) }
          }
        }
      }
    }
    return errs
  }

  const checkSolved = (newGrid) => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (newGrid[r][c] !== SOLUTION[r][c]) return false
    return true
  }

  const handleCellClick = (r, c) => {
    if (solved) return
    if (!isGiven(r, c)) setSelected([r, c])
  }

  const handleNumberInput = (num) => {
    if (!selected || solved) return
    const [r, c] = selected
    if (isGiven(r, c)) return
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = num
    setGrid(newGrid)
    const newErrors = checkErrors(newGrid)
    setErrors(newErrors)
    if (newErrors.size === 0 && checkSolved(newGrid)) {
      setSolved(true)
      setTimeout(() => setHeartReveal(true), 400)
    }
  }

  const handleKeyDown = (e) => {
    if (!selected || solved) return
    const num = parseInt(e.key)
    if (num >= 1 && num <= 9) handleNumberInput(num)
    else if (e.key === 'Backspace' || e.key === 'Delete') handleNumberInput(0)
    else if (e.key === 'ArrowUp' && selected[0] > 0) setSelected([selected[0] - 1, selected[1]])
    else if (e.key === 'ArrowDown' && selected[0] < 8) setSelected([selected[0] + 1, selected[1]])
    else if (e.key === 'ArrowLeft' && selected[1] > 0) setSelected([selected[0], selected[1] - 1])
    else if (e.key === 'ArrowRight' && selected[1] < 8) setSelected([selected[0], selected[1] + 1])
  }

  useEffect(() => {
    const handler = (e) => handleKeyDown(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const isHeartCell = (r, c) => HEART_CELLS.some(([hr, hc]) => hr === r && hc === c)
  const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c
  const isHighlighted = (r, c) => {
    if (!selected) return false
    const [sr, sc] = selected
    return r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3))
  }

  return (
    <div className="sudoku-page">
      <div className="hearts-bg">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`floating-heart heart-${i}`}>♥</span>
        ))}
      </div>
      <div className="sudoku-container">
        <h2 className="sudoku-title">{solved ? '♥ You did it! ♥' : 'Solve the puzzle'}</h2>
        <p className="sudoku-subtitle">{solved ? "you're my #1" : 'Fill in the missing numbers'}</p>
        <div className={`sudoku-grid ${solved ? 'grid-solved' : ''}`} ref={gridRef} tabIndex={0}>
          {grid.map((row, r) =>
            row.map((val, c) => {
              const cellClasses = [
                'sudoku-cell',
                isGiven(r, c) ? 'given' : 'editable',
                isSelected(r, c) ? 'selected' : '',
                isHighlighted(r, c) && !isSelected(r, c) ? 'highlighted' : '',
                errors.has(`${r}-${c}`) ? 'error' : '',
                heartReveal && isHeartCell(r, c) ? 'heart-cell' : '',
                c % 3 === 2 && c < 8 ? 'border-right' : '',
                r % 3 === 2 && r < 8 ? 'border-bottom' : '',
              ].filter(Boolean).join(' ')
              return (
                <div key={`${r}-${c}`} className={cellClasses} onClick={() => handleCellClick(r, c)}>
                  <span className="cell-value">{val !== 0 ? val : ''}</span>
                </div>
              )
            })
          )}
        </div>
        {!solved && (
          <div className="number-pad">
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <button key={num} className="num-btn" onClick={() => handleNumberInput(num)}>{num}</button>
            ))}
            <button className="num-btn erase-btn" onClick={() => handleNumberInput(0)}>✕</button>
          </div>
        )}
        {heartReveal && (
          <div className="heart-overlay"><span className="big-heart">♥</span></div>
        )}
        {solved && (
          <button className="next-button" onClick={onNext}>Next <span className="arrow">→</span></button>
        )}
      </div>
    </div>
  )
}

export default SudokuGame
