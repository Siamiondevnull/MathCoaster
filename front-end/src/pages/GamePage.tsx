import { useRef, useState } from 'react'
import { GameCanvas } from '../components/GameCanvas'
import { FinishModal } from '../components/FinishModal'
import { OutOfBoundsModal } from '../components/OutOfBoundsModal'
import type { Level } from '../data/levels'

const PRESETS = [
  { label: 'x', expr: 'x' },
  { label: '0.02·x²', expr: '0.02*x*x' },
  { label: '0.2·x²', expr: '0.2*x*x' },
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: 'tan(x)', expr: 'tan(x)' },
  { label: 'sin(x)+cos(x)', expr: 'sin(x)+cos(x)' },
  { label: 'sin(x)·cos(x)', expr: 'sin(x)*cos(x)' },
  { label: '0.1·sin(x)+0.02·x²', expr: '0.1*sin(x)+0.02*x*x' },
  { label: 'sin(x)-0.05·x', expr: 'sin(x)-0.05*x' },
]

const BALL_COLORS = [
  '#ff5252',
  '#ff4081',
  '#e040fb',
  '#7c4dff',
  '#536dfe',
  '#448aff',
  '#40c4ff',
  '#18ffff',
  '#64ffda',
  '#69f0ae',
  '#b2ff59',
  '#eeff41',
  '#ffeb3b',
  '#ffc107',
]

function randomBallColor(): string {
  return BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)]
}

interface GamePageProps {
  level: Level | null
  onBackToMenu: () => void
}

const DEFAULT_SPAWN_X = -20
const DEFAULT_SPAWN_Y = 20

export function GamePage({ level, onBackToMenu }: GamePageProps) {
  const [expression, setExpression] = useState(level?.baseFunction ?? '0.02*x*x')
  const [isRunning, setIsRunning] = useState(false)
  const [spawnX, setSpawnX] = useState(DEFAULT_SPAWN_X)
  const [spawnY, setSpawnY] = useState(DEFAULT_SPAWN_Y)
  const [finishState, setFinishState] = useState<{
    timeMs: number
  } | null>(null)
  const [outOfBoundsState, setOutOfBoundsState] = useState<boolean>(false)
  const restartRef = useRef<(() => void) | null>(null)
  const rebuildRef = useRef<(() => void) | null>(null)

  const handleLevelComplete = (timeMs: number) => {
    setFinishState({ timeMs })
  }

  const handleCloseModal = () => {
    setFinishState(null)
  }

  const handleRestartFromModal = () => {
    setFinishState(null)
    restartRef.current?.()
  }

  const handleOutOfBounds = () => {
    setOutOfBoundsState(true)
  }

  const handleOutOfBoundsRestart = () => {
    setOutOfBoundsState(false)
    restartRef.current?.()
  }

  const handleOutOfBoundsRebuild = () => {
    setOutOfBoundsState(false)
    rebuildRef.current?.()
  }

  const handleSpawnChange = (x: number, y: number) => {
    setSpawnX(x)
    setSpawnY(y)
  }

  return (
    <main className="app game-page">
      <div className="game-header">
        <h2 className="game-title">
          {level ? `${level.id}. ${level.name}` : 'Free Play'}
        </h2>
        <button
          type="button"
          className="nav-btn-back"
          onClick={onBackToMenu}
          aria-label="Back to menu"
        >
          ← Back to Menu
        </button>
      </div>

      <div className="input-row">
        <label htmlFor="expr">y =</label>
        <input
          id="expr"
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. 0.1*x*x or sin(x)"
          disabled={isRunning}
        />
      </div>

      <div className="presets">
        {PRESETS.map(({ label, expr }) => (
          <button
            key={expr}
            type="button"
            className="preset"
            onClick={() => setExpression(expr)}
            disabled={isRunning}
          >
            {label}
          </button>
        ))}
      </div>

      {!level && (
        <p className="spawn-hint">Click on the canvas to set the ball spawn point.</p>
      )}

      <GameCanvas
        expression={expression}
        randomBallColor={randomBallColor}
        level={level}
        spawnX={spawnX}
        spawnY={spawnY}
        onSpawnChange={handleSpawnChange}
        onLevelComplete={handleLevelComplete}
        onOutOfBounds={handleOutOfBounds}
        onSimulationStateChange={setIsRunning}
        restartRef={restartRef}
        rebuildRef={rebuildRef}
      />
      {outOfBoundsState && (
        <OutOfBoundsModal
          onRestart={handleOutOfBoundsRestart}
          onRebuild={handleOutOfBoundsRebuild}
        />
      )}
      {level && finishState && (
        <FinishModal
          levelId={level.id}
          levelName={level.name}
          timeMs={finishState.timeMs}
          onClose={handleCloseModal}
          onRestart={handleRestartFromModal}
        />
      )}
    </main>
  )
}
