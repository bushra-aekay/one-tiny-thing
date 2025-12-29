import { getData, setDayEntry, getTodayKey, setData } from '../lib/storage'

describe('storage', () => {
  beforeEach(() => {
    // clear localStorage
    window.localStorage.clear()
  })

  test('defaults when empty', () => {
    const data = getData()
    expect(data.user).toBeDefined()
    expect(data.days).toBeDefined()
  })

  test('set and get day entry', () => {
    const key = getTodayKey()
    setDayEntry(key, { task: 'test', startedAt: 123, shipped: false })

    const data = getData()
    expect(data.days[key]).toBeDefined()
    expect(data.days[key].task).toBe('test')
  })

  test('handles corrupt json gracefully', () => {
    window.localStorage.setItem('one-thing-data', 'not json')
    const data = getData()
    expect(data.user).toBeDefined()
    expect(typeof data.days).toBe('object')
  })
})
