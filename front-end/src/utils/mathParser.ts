/**
 * Safe math expression parser using mathjs.
 * Compiles expressions like "x*x", "sin(x)", "0.1*x*x" for evaluation.
 */

import { create, all } from 'mathjs'

const math = create(all)

export interface ParseResult {
  evaluate: (x: number) => number
  error?: string
}

export function compileExpression(expr: string): ParseResult {
  const trimmed = expr.trim()
  if (!trimmed) {
    return {
      evaluate: () => 0,
      error: 'Empty expression',
    }
  }

  try {
    const compiled = math.compile(trimmed)
    return {
      evaluate(x: number): number {
        try {
          const result = compiled.evaluate({ x })
          const num = typeof result === 'number' ? result : Number(result)
          return Number.isFinite(num) ? num : 0
        } catch {
          return 0
        }
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse error'
    return {
      evaluate: () => 0,
      error: message,
    }
  }
}
