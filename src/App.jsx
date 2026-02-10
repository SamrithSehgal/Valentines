import { useState } from 'react'
import './App.css'
import SudokuGame from './SudokuGame'
import MinesweeperGame from './MinesweeperGame'
import WordleGame from './WordleGame'

function App() {
  const [page, setPage] = useState('landing')
  const [isOpen, setIsOpen] = useState(false)

  if (page === 'sudoku') {
    return <SudokuGame onNext={() => setPage('minesweeper')} />
  }

  if (page === 'minesweeper') {
    return <MinesweeperGame onNext={() => setPage('wordle')} />
  }

  if (page === 'wordle') {
    return <WordleGame />
  }

  const handleEnvelopeClick = () => {
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="landing">
      <div className="hearts-bg">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`floating-heart heart-${i}`}>♥</span>
        ))}
      </div>

      <div
        className={`envelope-wrapper ${isOpen ? 'opened' : ''}`}
        onClick={handleEnvelopeClick}
      >
        <div className="envelope">
          <div className="envelope-body">
            <div className="envelope-inner-shadow"></div>
          </div>
          <div className={`envelope-flap ${isOpen ? 'flap-open' : ''}`}>
            <div className="flap-triangle"></div>
          </div>
          <div className={`letter-peek ${isOpen ? 'letter-out' : ''}`}>
            <div className="letter-peek-content">
              <div className="letter-lines">
                <span className="letter-line"></span>
                <span className="letter-line short"></span>
                <span className="letter-line"></span>
              </div>
              <span className="letter-heart">♥</span>
            </div>
          </div>
          <div className="envelope-fold-left"></div>
          <div className="envelope-fold-right"></div>
          <div className="envelope-fold-bottom"></div>
          <div className={`envelope-seal ${isOpen ? 'seal-hidden' : ''}`}>
            <span>♥</span>
          </div>
        </div>
        {!isOpen && <p className="envelope-hint">open me</p>}
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-letter" onClick={(e) => e.stopPropagation()}>
            <div className="letter-content">
              <p className="letter-greeting">Hi Joelle,</p>
              <p className="letter-body">
                I wanted to play some games with you even if we are many, many miles apart. Do you wanna try it out :)
              </p>
              <div className="letter-signoff">
                <div className="letter-decoration">
                  <span className="deco-heart">♥</span>
                  <span className="deco-line"></span>
                  <span className="deco-heart">♥</span>
                </div>
              </div>
              <button className="go-button" onClick={() => setPage('sudoku')}>
                Go <span className="arrow">→</span>
              </button>
            </div>
            <div className="ripped-edge">
              <svg viewBox="0 0 400 30" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,0 L0,8 Q5,12 10,6 Q15,0 20,8 Q25,16 30,10 Q35,4 40,9 Q45,14 50,7 Q55,0 60,10 Q65,18 70,8 Q75,2 80,11 Q85,18 90,9 Q95,2 100,7 Q105,14 110,5 Q115,0 120,9 Q125,16 130,7 Q135,0 140,8 Q145,15 150,6 Q155,0 160,10 Q165,17 170,8 Q175,2 180,11 Q185,18 190,7 Q195,0 200,9 Q205,16 210,6 Q215,0 220,8 Q225,14 230,5 Q235,0 240,10 Q245,17 250,7 Q255,0 260,9 Q265,16 270,8 Q275,2 280,11 Q285,18 290,6 Q295,0 300,8 Q305,15 310,7 Q315,0 320,10 Q325,17 330,8 Q335,2 340,9 Q345,14 350,6 Q355,0 360,10 Q365,18 370,7 Q375,0 380,9 Q385,16 390,8 Q395,4 400,10 L400,0 Z" fill="#fffaf5" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
