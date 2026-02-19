/**
 * Leaderboard API - localStorage stubs.
 * Replace with real API calls when backend is ready.
 */

export interface LeaderboardEntry {
  playerName: string
  timeMs: number
  createdAt: number
}

const STORAGE_KEY = (levelId: number) => `leaderboard_${levelId}`
const TOP_N = 10

export async function getLeaderboard(
  levelId: number
): Promise<LeaderboardEntry[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(levelId))
    if (!raw) return []
    const entries: LeaderboardEntry[] = JSON.parse(raw)
    return [...entries].sort((a, b) => a.timeMs - b.timeMs).slice(0, TOP_N)
  } catch {
    return []
  }
}

export async function submitScore(
  levelId: number,
  playerName: string,
  timeMs: number
): Promise<LeaderboardEntry> {
  const entry: LeaderboardEntry = {
    playerName: playerName.trim(),
    timeMs,
    createdAt: Date.now(),
  }
  const raw = localStorage.getItem(STORAGE_KEY(levelId))
  const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : []
  entries.push(entry)
  entries.sort((a, b) => a.timeMs - b.timeMs)
  localStorage.setItem(STORAGE_KEY(levelId), JSON.stringify(entries))
  return entry
}

export function computePreliminaryPlace(
  entries: LeaderboardEntry[],
  timeMs: number
): number {
  let place = 1
  for (const e of entries) {
    if (timeMs < e.timeMs) return place
    place++
  }
  return place
}
