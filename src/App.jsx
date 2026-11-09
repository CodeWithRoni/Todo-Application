import { useEffect, useMemo, useReducer, useState } from 'react'
import {
  FiActivity, FiCalendar, FiCheck, FiCheckCircle, FiChevronDown, FiClock,
  FiEdit2, FiFilter, FiFlag, FiInbox, FiList, FiMoon, FiPlus, FiSearch,
  FiSun, FiTarget, FiTrash2, FiX, FiZap,
} from 'react-icons/fi'
import './App.css'
import { taskReducer } from './lib/tasks.js'

const STORAGE_KEY = 'calculator-free-todo-application-v2'
const THEME_KEY = 'todo-application-theme'
const priorities = ['Low', 'Medium', 'High']
const today = () => new Date().toLocaleDateString('en-CA')
const initialState = { tasks: [] }


function loadTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return initialState
    return { tasks: parsed.filter(task => task && typeof task.id === 'string' && typeof task.text === 'string').map(task => ({
      id: task.id,
      text: task.text.slice(0, 180),
      completed: Boolean(task.completed),
      priority: priorities.includes(task.priority) ? task.priority : 'Medium',
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
      createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString(),
    })) }
  } catch {
    return initialState
  }
}

const formatDate = value => {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function TaskEditor({ task, onSave, onCancel }) {
  const [text, setText] = useState(task?.text || '')
  const [priority, setPriority] = useState(task?.priority || 'Medium')
  const [dueDate, setDueDate] = useState(task?.dueDate || '')
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) { setError('Please enter a task name.'); return }
    onSave({ text: trimmed, priority, dueDate })
    setText('')
    setPriority('Medium')
    setDueDate('')
    setError('')
  }
  return (
    <form className="task-editor" onSubmit={submit}>
      <label className="sr-only" htmlFor={task ? 'edit-task-name' : 'new-task-name'}>Task name</label>
      <input id={task ? 'edit-task-name' : 'new-task-name'} autoFocus={Boolean(task)} maxLength={180}
        placeholder="What needs to get done?" value={text} onChange={event => { setText(event.target.value); setError('') }} />
      <div className="editor-controls">
        <label className="field"><FiFlag aria-hidden="true" />
          <span className="sr-only">Priority</span>
          <select aria-label="Priority" value={priority} onChange={event => setPriority(event.target.value)}>
            {priorities.map(value => <option key={value} value={value}>{value} priority</option>)}
          </select><FiChevronDown aria-hidden="true" />
        </label>
        <label className="field"><FiCalendar aria-hidden="true" /><span className="sr-only">Due date</span>
          <input type="date" aria-label="Due date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
        </label>
        <div className="editor-actions">
          {task && <button type="button" className="button ghost" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="button primary"><FiPlus aria-hidden="true" /> {task ? 'Save changes' : 'Add task'}</button>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  )
}

function TaskCard({ task, dispatch }) {
  const [editing, setEditing] = useState(false)
  const overdue = !task.completed && task.dueDate && task.dueDate < today()
  return (
    <li className={'task-card' + (task.completed ? ' done' : '')}>
      {editing ? (
        <TaskEditor task={task} onCancel={() => setEditing(false)} onSave={changes => { dispatch({ type: 'UPDATE', id: task.id, changes }); setEditing(false) }} />
      ) : (
        <>
          <button type="button" className={'task-check' + (task.completed ? ' checked' : '')}
            aria-label={task.completed ? 'Mark ' + task.text + ' incomplete' : 'Complete ' + task.text}
            aria-pressed={task.completed} onClick={() => dispatch({ type: 'TOGGLE', id: task.id })}>
            {task.completed && <FiCheck aria-hidden="true" />}
          </button>
          <div className="task-details">
            <span className="task-name">{task.text}</span>
            <div className="task-meta">
              <span className={'priority priority-' + task.priority.toLowerCase()}><span className="priority-dot" />{task.priority}</span>
              {task.dueDate && <span className={overdue ? 'overdue' : ''}><FiCalendar aria-hidden="true" /> {formatDate(task.dueDate)}{overdue ? ' · Overdue' : ''}</span>}
            </div>
          </div>
          <div className="task-actions">
            <button type="button" title="Edit task" aria-label={'Edit ' + task.text} onClick={() => setEditing(true)}><FiEdit2 /></button>
            <button type="button" title="Delete task" className="delete-button" aria-label={'Delete ' + task.text} onClick={() => dispatch({ type: 'DELETE', id: task.id })}><FiTrash2 /></button>
          </div>
        </>
      )}
    </li>
  )
}

function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState, loadTasks)
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' } })
  const [filter, setFilter] = useState('All tasks')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Newest first')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks)) } catch { /* Storage may be unavailable in private browsing. */ }
  }, [state.tasks])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* Continue with in-memory theme. */ }
  }, [theme])

  const completed = state.tasks.filter(task => task.completed).length
  const active = state.tasks.length - completed
  const dueToday = state.tasks.filter(task => !task.completed && task.dueDate === today()).length
  const progress = state.tasks.length ? Math.round(completed / state.tasks.length * 100) : 0
  const filtered = useMemo(() => {
    let items = state.tasks.filter(task => task.text.toLowerCase().includes(search.trim().toLowerCase()))
    if (filter === 'Active') items = items.filter(task => !task.completed)
    if (filter === 'Completed') items = items.filter(task => task.completed)
    if (filter === 'Due today') items = items.filter(task => !task.completed && task.dueDate === today())
    if (filter === 'High priority') items = items.filter(task => task.priority === 'High')
    const priorityWeight = { High: 0, Medium: 1, Low: 2 }
    return [...items].sort((a, b) => {
      if (sort === 'Priority') return priorityWeight[a.priority] - priorityWeight[b.priority]
      if (sort === 'Due date') return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [state.tasks, filter, search, sort])

  const currentDate = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())
  const filters = ['All tasks', 'Active', 'Completed', 'Due today', 'High priority']
  function addTask(changes) {
    dispatch({ type: 'ADD', task: { id: crypto.randomUUID(), ...changes, completed: false, createdAt: new Date().toISOString() } })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#dashboard" className="brand"><span className="brand-icon"><FiCheckCircle aria-hidden="true" /></span><span>task<span className="brand-accent">flow.</span><small>YOUR PRODUCTIVITY SPACE</small></span></a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-navigation" aria-label="Task filters">
          {filters.map((name, index) => {
            const Icon = [FiList, FiActivity, FiCheckCircle, FiCalendar, FiFlag][index]
            return <button key={name} type="button" className={'side-link' + (filter === name ? ' active' : '')} onClick={() => setFilter(name)}><Icon aria-hidden="true" /><span>{name}</span>{name === 'All tasks' && <span className="nav-count">{state.tasks.length}</span>}</button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card"><span className="tip-icon"><FiZap aria-hidden="true" /></span><strong>Make today count.</strong><p>Small steps add up. Keep your momentum going.</p></div>
          <div className="sidebar-footer"><span className="avatar">CW</span><span><strong>My workspace</strong><small>Saved on this device</small></span></div>
        </div>
      </aside>
      <main className="main-content" id="dashboard">
        <header className="topbar"><div className="breadcrumbs"><FiList aria-hidden="true" /> Workspace <span>/</span> Overview</div><button className="theme-button" type="button" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'}>{theme === 'dark' ? <FiSun /> : <FiMoon />}</button></header>
        <div className="content">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL DASHBOARD</div>
          <div className="page-heading"><div><h1>Stay on top of <span>everything.</span></h1><p>Organize your day, find your focus, and get things done.</p></div><div className="date-pill"><FiCalendar aria-hidden="true" /> {currentDate}</div></div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon purple"><FiList /></span></div><strong>{state.tasks.length.toString().padStart(2, '0')}</strong><small>Everything on your plate</small></div>
            <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon blue"><FiClock /></span></div><strong>{active.toString().padStart(2, '0')}</strong><small>Tasks left to complete</small></div>
            <div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon green"><FiCheckCircle /></span></div><strong>{completed.toString().padStart(2, '0')}</strong><small>Every win counts</small></div>
            <div className="stat-card"><div className="stat-top"><span>Due today</span><span className="stat-icon amber"><FiTarget /></span></div><strong>{dueToday.toString().padStart(2, '0')}</strong><small>Keep an eye on deadlines</small></div>
          </div>
          <section className="progress-card" aria-label="Task completion progress"><div><div className="progress-title"><FiZap aria-hidden="true" /> Your progress</div><p>{state.tasks.length ? (progress === 100 ? 'Amazing work! Everything is done.' : 'You’re making progress. Keep it going!') : 'Add your first task to get started.'}</p></div><div className="progress-side"><strong>{progress}% <span>complete</span></strong><div className="progress-track"><span style={{ width: progress + '%' }} /></div></div></section>
          <section className="workspace-panel" aria-labelledby="tasks-heading">
            <div className="panel-heading"><div><div className="section-kicker">GET THINGS DONE</div><h2 id="tasks-heading">My tasks <span>{state.tasks.length}</span></h2></div><div className="panel-heading-right"><FiInbox aria-hidden="true" /> Focus on what matters</div></div>
            <TaskEditor onSave={addTask} />
            <div className="task-toolbar"><div className="search-wrap"><FiSearch aria-hidden="true" /><input type="search" placeholder="Search your tasks..." aria-label="Search tasks" value={search} onChange={event => setSearch(event.target.value)} /></div><label className="sort-wrap"><FiFilter aria-hidden="true" /><span className="sr-only">Sort tasks</span><select value={sort} onChange={event => setSort(event.target.value)}><option>Newest first</option><option>Priority</option><option>Due date</option></select><FiChevronDown aria-hidden="true" /></label></div>
            <div className="mobile-filters" aria-label="Filter tasks">{filters.map(name => <button key={name} type="button" className={filter === name ? 'selected' : ''} onClick={() => setFilter(name)}>{name}</button>)}</div>
            <div className="list-heading"><span>{filter} <b>· {filtered.length}</b></span>{completed > 0 && <button type="button" className="clear-button" onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}><FiTrash2 aria-hidden="true" /> Clear completed</button>}</div>
            {filtered.length ? <ul className="task-list">{filtered.map(task => <TaskCard key={task.id} task={task} dispatch={dispatch} />)}</ul> : <div className="empty-state"><span><FiInbox aria-hidden="true" /></span><h3>{state.tasks.length ? 'No matching tasks' : 'A fresh start awaits.'}</h3><p>{state.tasks.length ? 'Try another filter or search term.' : 'Add a task above and start making progress.'}</p>{state.tasks.length > 0 && <button type="button" className="button ghost" onClick={() => { setFilter('All tasks'); setSearch('') }}><FiX aria-hidden="true" /> Reset filters</button>}</div>}
          </section>
          <footer className="page-footer"><span>Built for better days <span className="footer-heart">♥</span></span><span>Taskflow · Local-first productivity</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
