import { useState, useEffect } from 'react'
import {
  getLeaderboard,
  submitScore,
  computePreliminaryPlace,
  type LeaderboardEntry,
} from '../api/leaderboard'

function formatTime(ms: number): string {
  const totalSec = ms / 1000
  const m = Math.floor(totalSec / 60)
  const s = Math.floor(totalSec % 60)
  const frac = Math.floor((ms % 1000) / 1)
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}.${frac.toString().padStart(3, '0')}`
}

interface FinishModalProps {
  levelId: number
  levelName: string
  timeMs: number
  onClose: () => void
  onRestart: () => void
}

export function FinishModal({
  levelId,
  levelName,
  timeMs,
  onClose,
  onRestart,
}: FinishModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getLeaderboard(levelId).then((list) => {
      setEntries(list)
      setLoading(false)
    })
  }, [levelId])

  const preliminaryPlace = computePreliminaryPlace(entries, timeMs)
  const timeStr = formatTime(timeMs)

  const handleSubmit = async () => {
    if (!playerName.trim()) return
    setLoading(true)
    await submitScore(levelId, playerName.trim(), timeMs)
    const updated = await getLeaderboard(levelId)
    setEntries(updated)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal finish-modal">
        <h3 className="modal-title">Level Complete: {levelName}</h3>
        <p className="modal-time">Your time: {timeStr}</p>
        <p className="modal-place">
          Your time would be <strong>#{preliminaryPlace}</strong> on the
          leaderboard
        </p>

        <div className="modal-leaderboard">
          <h4>Leaderboard</h4>
          {loading ? (
            <p className="modal-loading">Loading...</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={`${e.playerName}-${e.createdAt}-${i}`}>
                    <td>{i + 1}</td>
                    <td>{e.playerName}</td>
                    <td>{formatTime(e.timeMs)}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={3}>No records yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!submitted ? (
          <div className="modal-submit">
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="modal-name-input"
              maxLength={32}
            />
            <button
              type="button"
              className="modal-btn-submit"
              onClick={handleSubmit}
              disabled={!playerName.trim() || loading}
            >
              Submit to leaderboard
            </button>
          </div>
        ) : (
          <p className="modal-submitted">Submitted!</p>
        )}

        <div className="modal-actions">
          <button type="button" className="modal-btn" onClick={onRestart}>
            Play again
          </button>
          <button type="button" className="modal-btn modal-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
