import { describe, expect, test } from 'bun:test'
import { splitIntoColumns } from './HeroPerspectiveGallery'

describe('splitIntoColumns', () => {
  test('distributes items round-robin across the given column count', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    expect(splitIntoColumns(ids, 3)).toEqual([
      ['a', 'd', 'g'],
      ['b', 'e'],
      ['c', 'f'],
    ])
  })

  test('returns one empty array per column for an empty input', () => {
    expect(splitIntoColumns([], 3)).toEqual([[], [], []])
  })

  test('every input id appears in exactly one output column', () => {
    const ids = ['x1', 'x2', 'x3', 'x4', 'x5']
    const result = splitIntoColumns(ids, 3)
    const flattened = result.flat()
    expect(flattened.sort()).toEqual([...ids].sort())
    expect(flattened.length).toBe(ids.length)
  })
})
