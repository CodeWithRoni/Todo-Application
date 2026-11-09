import test from 'node:test'
import assert from 'node:assert/strict'
import { taskReducer } from '../src/lib/tasks.js'

const a = { id: 'a', text: 'First', completed: false, priority: 'High', dueDate: '', createdAt: '2026-01-01T00:00:00Z' }
const b = { ...a, id: 'b', text: 'Second' }
test('adds a task without mutating existing state', () => {
  const before = { tasks: [a] }
  const after = taskReducer(before, { type: 'ADD', task: b })
  assert.deepEqual(after.tasks.map(x => x.id), ['b', 'a'])
  assert.equal(before.tasks.length, 1)
})
test('toggles the correct task and can undo completion', () => {
  const before = { tasks: [a, b] }
  const once = taskReducer(before, { type: 'TOGGLE', id: 'a' })
  assert.equal(once.tasks[0].completed, true)
  assert.equal(once.tasks[1].completed, false)
  assert.equal(taskReducer(once, { type: 'TOGGLE', id: 'a' }).tasks[0].completed, false)
})
test('updates a task without changing the others', () => {
  const after = taskReducer({ tasks: [a, b] }, { type: 'UPDATE', id: 'b', changes: { text: 'Edited', priority: 'Low' } })
  assert.equal(after.tasks[0].text, 'First')
  assert.equal(after.tasks[1].text, 'Edited')
  assert.equal(after.tasks[1].priority, 'Low')
})
test('deletes only matching task', () => {
  assert.deepEqual(taskReducer({ tasks: [a, b] }, { type: 'DELETE', id: 'a' }).tasks, [b])
})
test('clears only completed tasks', () => {
  const done = { ...a, completed: true }
  assert.deepEqual(taskReducer({ tasks: [done, b] }, { type: 'CLEAR_COMPLETED' }).tasks, [b])
})
test('ignores unknown actions', () => {
  const state = { tasks: [a] }
  assert.equal(taskReducer(state, { type: 'NOTHING' }), state)
})
