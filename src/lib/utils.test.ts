import { expect, test } from 'vitest'
import { cn } from './utils'

test('cn merges classes correctly', () => {
  expect(cn('c1', 'c2')).toBe('c1 c2')
})

test('cn handles conditional classes', () => {
  expect(cn('c1', true && 'c2', false && 'c3')).toBe('c1 c2')
})

test('cn handles tailwind conflicts', () => {
  // Assuming tailwind-merge works as expected
  expect(cn('p-2', 'p-4')).toBe('p-4')
})
