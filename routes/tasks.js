const express = require('express');

const VALID_STATUSES = ['pendente', 'em_andamento', 'concluida'];
const VALID_PRIORITIES = ['baixa', 'media', 'alta'];

function createTasksRouter(db) {
  const router = express.Router();
  // List all tasks (with optional filters)
  router.get('/', (req, res) => {
    const { status, priority } = req.query;
    let query = 'SELECT * FROM tasks';
    const params = [];
    const conditions = [];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
      }
      conditions.push('status = ?');
      params.push(status);
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: 'Prioridade inválida.' });
      }
      conditions.push('priority = ?');
      params.push(priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  });

  // Get a single task
  router.get('/:id', (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }
    res.json(task);
  });

  // Create a new task
  router.post('/', (req, res) => {
    const { title, description, status, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título é obrigatório.' });
    }

    const taskStatus = status || 'pendente';
    const taskPriority = priority || 'media';

    if (!VALID_STATUSES.includes(taskStatus)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    if (!VALID_PRIORITIES.includes(taskPriority)) {
      return res.status(400).json({ error: 'Prioridade inválida.' });
    }

    const result = db.prepare(
      'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)'
    ).run(title.trim(), description || '', taskStatus, taskPriority);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  });

  // Update a task
  router.put('/:id', (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const { title, description, status, priority } = req.body;

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ error: 'O título não pode ser vazio.' });
    }

    const newStatus = status || task.status;
    const newPriority = priority || task.priority;

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    if (!VALID_PRIORITIES.includes(newPriority)) {
      return res.status(400).json({ error: 'Prioridade inválida.' });
    }

    db.prepare(
      `UPDATE tasks SET
        title = ?,
        description = ?,
        status = ?,
        priority = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?`
    ).run(
      title !== undefined ? title.trim() : task.title,
      description !== undefined ? description : task.description,
      newStatus,
      newPriority,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(updated);
  });

  // Delete a task
  router.delete('/:id', (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.status(204).send();
  });

  return router;
}

module.exports = { createTasksRouter };
