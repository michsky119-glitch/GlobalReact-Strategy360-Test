import { useState, useEffect } from 'react'
import './App.css'

const API = '/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [loading, setLoading] = useState(true)

  function loadTasks() {
    fetch(API)
      .then(r => r.json())
      .then(data => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), description: description.trim() })
    })
      .then(r => r.json())
      .then(task => {
        setTasks(prev => [task, ...prev])
        setTitle('')
        setDescription('')
      })
      .catch(console.error)
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditDesc('')
  }

  function saveEdit() {
    if (!editTitle.trim()) return
    fetch(`${API}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim() })
    })
      .then(r => r.json())
      .then(updated => {
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        cancelEdit()
      })
      .catch(console.error)
  }

  function handleDelete(id) {
    fetch(`${API}/${id}`, { method: 'DELETE' })
      .then(() => setTasks(prev => prev.filter(t => t.id !== id)))
      .catch(console.error)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Tasks</h1>
        <p className="sub">Add and manage your to-dos</p>
      </header>
      <form onSubmit={handleSubmit} className="add-form">
        <label htmlFor="new-title">Title</label>
        <input
          id="new-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={255}
        />
        <label htmlFor="new-desc">Description</label>
        <textarea
          id="new-desc"
          placeholder="Optional details"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />
        <button type="submit" className="btn-submit" disabled={!title.trim()}>
          Add task
        </button>
      </form>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="muted">No tasks yet. Add one above.</p>
      ) : (
        <>
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id}>
                {editingId === task.id ? (
                  <div className="edit-box">
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      maxLength={255}
                      placeholder="Title"
                    />
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      rows={2}
                      placeholder="Description"
                    />
                    <div className="edit-actions">
                      <button type="button" onClick={saveEdit} className="btn-save">Save</button>
                      <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <span className="task-title">{task.title}</span>
                      {task.description && (
                        <span className="task-desc">{task.description}</span>
                      )}
                    </div>
                    <div className="task-actions">
                      <button type="button" onClick={() => startEdit(task)}>Edit</button>
                      <button type="button" onClick={() => handleDelete(task.id)} className="btn-danger">Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</p>
        </>
      )}
    </div>
  )
}

export default App
