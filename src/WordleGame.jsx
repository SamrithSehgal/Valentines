import { useState, useEffect, useCallback } from 'react'
import emailjs from '@emailjs/browser'
import './WordleGame.css'

const ANSWER = 'dookiechungus'
const WORD_LENGTH = 13
const MAX_GUESSES = 6

function getLetterStates(guess, answer) {
  const states = Array(WORD_LENGTH).fill('absent')
  const answerArr = answer.split('')
  const guessArr = guess.split('')
  const used = Array(WORD_LENGTH).fill(false)

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === answerArr[i]) {
      states[i] = 'correct'
      used[i] = true
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (states[i] === 'correct') continue
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessArr[i] === answerArr[j]) {
        states[i] = 'present'
        used[j] = true
        break
      }
    }
  }
  return states
}

const KEYBOARD_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['enter','z','x','c','v','b','n','m','⌫'],
]

function WordleGame() {
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameState, setGameState] = useState('playing')
  const [shakeRow, setShakeRow] = useState(-1)
  const [revealRow, setRevealRow] = useState(-1)
  const [revealedCols, setRevealedCols] = useState(new Set())
  const [celebration, setCelebration] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [erasing, setErasing] = useState(false)
  const [writing, setWriting] = useState(false)
  const [writtenText, setWrittenText] = useState('')
  const [showButtons, setShowButtons] = useState(false)
  const [response, setResponse] = useState(null)
  const [oldTextGone, setOldTextGone] = useState(false)

  const keyboardStates = (() => {
    const states = {}
    for (const { guess, states: s } of guesses) {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i]
        const curr = states[letter]
        if (s[i] === 'correct') states[letter] = 'correct'
        else if (s[i] === 'present' && curr !== 'correct') states[letter] = 'present'
        else if (!curr) states[letter] = 'absent'
      }
    }
    return states
  })()

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShakeRow(guesses.length)
      setTimeout(() => setShakeRow(-1), 600)
      return
    }

    const states = getLetterStates(currentGuess, ANSWER)
    const newGuesses = [...guesses, { guess: currentGuess, states }]
    setGuesses(newGuesses)
    const rowIdx = newGuesses.length - 1
    setRevealRow(rowIdx)
    setRevealedCols(new Set())
    setCurrentGuess('')

    for (let i = 0; i < WORD_LENGTH; i++) {
      setTimeout(() => {
        setRevealedCols(prev => new Set([...prev, i]))
      }, i * 100 + 250)
    }

    setTimeout(() => setRevealRow(-1), WORD_LENGTH * 100 + 500)

    if (currentGuess === ANSWER) {
      setTimeout(() => {
        setGameState('won')
        setCelebration(true)
        setTimeout(() => {
          setShowLetter(true)
          setTimeout(() => setErasing(true), 800)
          setTimeout(() => {
            setOldTextGone(true)
            setErasing(false)
            setWriting(true)
            typeText('Hello again Joelle :) I love you so so much, will you be my valentine?')
          }, 2200)
        }, 3000)
      }, WORD_LENGTH * 100 + 600)
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => {
        const lastGuess = newGuesses[newGuesses.length - 1]
        setGuesses([lastGuess])
        setRevealRow(-1)
        setRevealedCols(new Set())
        setCurrentGuess('')
      }, WORD_LENGTH * 100 + 600)
    }
  }, [currentGuess, guesses])

  const typeText = (text) => {
    let i = 0
    const interval = setInterval(() => {
      setWrittenText(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(interval)
        setTimeout(() => setShowButtons(true), 400)
      }
    }, 50)
  }

  const handleKey = useCallback((key) => {
    if (gameState !== 'playing') return
    if (key === 'enter') {
      submitGuess()
    } else if (key === '⌫' || key === 'backspace') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (key.length === 1 && key.match(/[a-z]/i) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key.toLowerCase())
    }
  }, [currentGuess, gameState, submitGuess])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') handleKey('enter')
      else if (e.key === 'Backspace') handleKey('backspace')
      else if (e.key.length === 1 && e.key.match(/[a-z]/i)) handleKey(e.key.toLowerCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  const handleYes = () => {
    setResponse('yes')
    emailjs.send(
      'service_yz37un7',
      'template_25narov',
      {
        to_email: 'mangotree1240@gmail.com',
        message: 'Joelle said yes',
      },
      'o_L44_MahjESCgmUX'
    ).catch(() => {})
  }

  const handleNo = () => {
    setResponse('no')
  }

  const handleNoClose = () => {
    setResponse(null)
  }

  return (
    <div className="wordle-page">
      <div className="hearts-bg">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`floating-heart heart-${i}`}>♥</span>
        ))}
      </div>

      <div className="wordle-container">
        <h2 className="wordle-title">
          {gameState === 'won' ? '♥ Amazing! ♥' : 'Guess the word'}
        </h2>
        <p className="wordle-subtitle">
          {gameState === 'playing' ? `${WORD_LENGTH} letters, ${MAX_GUESSES - guesses.length} guesses left` : ''}
        </p>

        <div className="wordle-grid">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
            const isGuessed = rowIdx < guesses.length
            const isCurrent = rowIdx === guesses.length && gameState === 'playing'
            const isShaking = rowIdx === shakeRow
            const isRevealing = rowIdx === revealRow

            return (
              <div key={rowIdx} className={`wordle-row ${isShaking ? 'shake' : ''}`}>
                {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
                  let letter = ''
                  let state = ''

                  if (isGuessed) {
                    letter = guesses[rowIdx].guess[colIdx]
                    const colorReady = !isRevealing || revealedCols.has(colIdx)
                    state = colorReady ? guesses[rowIdx].states[colIdx] : ''
                  } else if (isCurrent) {
                    letter = currentGuess[colIdx] || ''
                  }

                  const cellClasses = [
                    'wordle-cell',
                    state,
                    letter && !isGuessed ? 'filled' : '',
                    isRevealing && isGuessed ? 'revealing' : '',
                  ].filter(Boolean).join(' ')

                  return (
                    <div
                      key={colIdx}
                      className={cellClasses}
                      style={isRevealing ? { animationDelay: `${colIdx * 100}ms` } : {}}
                    >
                      <span className="wordle-letter">{letter}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>


        {gameState === 'playing' && (
          <div className="wordle-keyboard">
            {KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="keyboard-row">
                {row.map(key => (
                  <button
                    key={key}
                    className={`key-btn ${keyboardStates[key] || ''} ${key === 'enter' || key === '⌫' ? 'wide-key' : ''}`}
                    onClick={() => handleKey(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {celebration && (
        <div className="celebration-overlay">
          {[...Array(8)].map((_, i) => (
            <div
              key={`fw-${i}`}
              className="firework"
              style={{
                '--fw-x': `${15 + Math.random() * 70}vw`,
                '--fw-delay': `${i * 0.4 + Math.random() * 0.3}s`,
                '--fw-color': ['#e91e63','#ff5722','#ffeb3b','#4caf50','#2196f3','#9c27b0','#ff9800','#f44336'][i],
              }}
            >
              {[...Array(16)].map((_, j) => (
                <span
                  key={j}
                  className="firework-spark"
                  style={{
                    '--angle': `${(360 / 16) * j}deg`,
                    '--dist': `${60 + Math.random() * 60}px`,
                  }}
                />
              ))}
            </div>
          ))}
          {[...Array(14)].map((_, i) => (
            <div
              key={`bl-${i}`}
              className="balloon"
              style={{
                '--bl-x': `${5 + (i / 14) * 90}vw`,
                '--bl-delay': `${0.5 + Math.random() * 2}s`,
                '--bl-color': ['#e91e63','#f06292','#ff80ab','#ff5252','#f48fb1','#ce93d8','#ef5350','#ec407a','#e91e63','#f06292','#ff80ab','#ff5252','#f48fb1','#ce93d8'][i],
                '--bl-size': `${30 + Math.random() * 20}px`,
                '--bl-sway': `${-20 + Math.random() * 40}px`,
              }}
            >
              🎈
            </div>
          ))}
        </div>
      )}

      {showLetter && (
        <div className="valentine-overlay">
          <div className="valentine-letter-modal">
            <div className="valentine-paper">
              {!oldTextGone && (
                <div className={`old-text ${erasing ? 'erasing' : ''}`}>
                  <p className="vl-greeting">Hi Joelle,</p>
                  <p className="vl-body">
                    I wanted to play some games with you even if we are 40 miles apart. Do you wanna try it out :)
                  </p>
                </div>
              )}

              {erasing && <div className="pencil-eraser">✏️</div>}

              {writing && (
                <div className="new-text">
                  <p className="vl-new-body">{writtenText}<span className="text-cursor">|</span></p>
                </div>
              )}

              {showButtons && response !== 'yes' && (
                <div className="valentine-buttons">
                  <button className="vl-btn vl-yes" onClick={handleYes}>Yes</button>
                  <button className="vl-btn vl-no" onClick={handleNo}>No</button>
                </div>
              )}

              {response === 'yes' && (
                <div className="valentine-buttons">
                  <div className="yes-response">
                    <span className="big-heart-response">♥</span>
                    <p className="response-text">YIPPIEEEEEE!!!!!!!!!!!!!!!!!!!!!!</p>
                    <p className="response-subtext">Sam has gotten an email with your decision</p>
                  </div>
                </div>
              )}
            </div>

            <div className="vl-ripped-edge">
              <svg viewBox="0 0 400 30" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0,0 L0,8 Q5,12 10,6 Q15,0 20,8 Q25,16 30,10 Q35,4 40,9 Q45,14 50,7 Q55,0 60,10 Q65,18 70,8 Q75,2 80,11 Q85,18 90,9 Q95,2 100,7 Q105,14 110,5 Q115,0 120,9 Q125,16 130,7 Q135,0 140,8 Q145,15 150,6 Q155,0 160,10 Q165,17 170,8 Q175,2 180,11 Q185,18 190,7 Q195,0 200,9 Q205,16 210,6 Q215,0 220,8 Q225,14 230,5 Q235,0 240,10 Q245,17 250,7 Q255,0 260,9 Q265,16 270,8 Q275,2 280,11 Q285,18 290,6 Q295,0 300,8 Q305,15 310,7 Q315,0 320,10 Q325,17 330,8 Q335,2 340,9 Q345,14 350,6 Q355,0 360,10 Q365,18 370,7 Q375,0 380,9 Q385,16 390,8 Q395,4 400,10 L400,0 Z"
                  fill="#fffaf5"
                />
              </svg>
            </div>
          </div>

          {response === 'no' && (
            <div className="no-popup-overlay" onClick={handleNoClose}>
              <div className="no-popup" onClick={(e) => e.stopPropagation()}>
                <span className="no-popup-emoji">🙁</span>
                <p className="no-popup-title">WHAT?!</p>
                <p className="no-popup-text">That is NOT an option. Try again.</p>
                <button className="no-popup-btn" onClick={handleNoClose}>Fine, I'll reconsider...</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WordleGame
