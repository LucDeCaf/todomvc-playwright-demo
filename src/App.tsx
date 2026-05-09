import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: string
  title: string
  completed: boolean
}

function getFilter(): Filter {
  const hash = window.location.hash
  if (hash === '#/active') return 'active'
  if (hash === '#/completed') return 'completed'
  return 'all'
}

let nextId = 1

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<Filter>(getFilter)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onHashChange = () => setFilter(getFilter())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const addTodo = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const title = newTitle.trim()
    if (!title) return
    setTodos(prev => [...prev, { id: String(nextId++), title, completed: false }])
    setNewTitle('')
  }, [newTitle])

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const toggleAll = useCallback(() => {
    const allCompleted = todos.every(t => t.completed)
    setTodos(prev => prev.map(t => ({ ...t, completed: !allCompleted })))
  }, [todos])

  const startEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
  }, [])

  const commitEdit = useCallback(() => {
    if (editingId === null) return
    const title = editTitle.trim()
    if (title) {
      setTodos(prev => prev.map(t => t.id === editingId ? { ...t, title } : t))
    } else {
      setTodos(prev => prev.filter(t => t.id !== editingId))
    }
    setEditingId(null)
  }, [editingId, editTitle])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    else if (e.key === 'Escape') cancelEdit()
  }, [commitEdit, cancelEdit])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed))
  }, [])

  const visibleTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount
  const allCompleted = todos.length > 0 && todos.every(t => t.completed)

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={addTodo}
        />
      </header>

      {todos.length > 0 && (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            checked={allCompleted}
            onChange={toggleAll}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {visibleTodos.map(todo => (
              <li
                key={todo.id}
                className={[
                  todo.completed ? 'completed' : '',
                  editingId === todo.id ? 'editing' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="view">
                  <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <label onDoubleClick={() => startEdit(todo)}>{todo.title}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.id)} />
                </div>
                {editingId === todo.id && (
                  <input
                    ref={editInputRef}
                    className="edit"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKeyDown}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {todos.length > 0 && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{activeCount}</strong> {activeCount === 1 ? 'item' : 'items'} left
          </span>
          <ul className="filters">
            <li><a href="#/" className={filter === 'all' ? 'selected' : ''}>All</a></li>
            <li><a href="#/active" className={filter === 'active' ? 'selected' : ''}>Active</a></li>
            <li><a href="#/completed" className={filter === 'completed' ? 'selected' : ''}>Completed</a></li>
          </ul>
          {completedCount > 0 && (
            <button className="clear-completed" onClick={clearCompleted}>
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  )
}
