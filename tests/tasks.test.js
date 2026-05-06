const request = require('supertest');
const path = require('path');
const { createDatabase } = require('../database');
const { createApp } = require('../server');

// Use an in-memory SQLite database for tests
let db;
let app;

beforeEach(() => {
  db = createDatabase(':memory:');
  app = createApp(db);
});

afterEach(() => {
  db.close();
});

/* =============================================
   GET /api/tasks
   ============================================= */
describe('GET /api/tasks', () => {
  it('returns an empty array when there are no tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'Tarefa 1' });
    await request(app).post('/api/tasks').send({ title: 'Tarefa 2', priority: 'alta' });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters tasks by status', async () => {
    await request(app).post('/api/tasks').send({ title: 'A', status: 'pendente' });
    await request(app).post('/api/tasks').send({ title: 'B', status: 'concluida' });
    const res = await request(app).get('/api/tasks?status=pendente');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('A');
  });

  it('filters tasks by priority', async () => {
    await request(app).post('/api/tasks').send({ title: 'A', priority: 'alta' });
    await request(app).post('/api/tasks').send({ title: 'B', priority: 'baixa' });
    const res = await request(app).get('/api/tasks?priority=alta');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('A');
  });

  it('returns 400 for invalid status filter', async () => {
    const res = await request(app).get('/api/tasks?status=invalido');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

/* =============================================
   GET /api/tasks/:id
   ============================================= */
describe('GET /api/tasks/:id', () => {
  it('returns a task by id', async () => {
    const created = (await request(app).post('/api/tasks').send({ title: 'Minha tarefa' })).body;
    const res = await request(app).get(`/api/tasks/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Minha tarefa');
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).get('/api/tasks/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

/* =============================================
   POST /api/tasks
   ============================================= */
describe('POST /api/tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Nova tarefa' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Nova tarefa');
    expect(res.body.status).toBe('pendente');
    expect(res.body.priority).toBe('media');
    expect(res.body.id).toBeDefined();
  });

  it('creates a task with custom fields', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Tarefa customizada',
      description: 'Descrição da tarefa',
      status: 'em_andamento',
      priority: 'alta',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('em_andamento');
    expect(res.body.priority).toBe('alta');
    expect(res.body.description).toBe('Descrição da tarefa');
  });

  it('trims whitespace from title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '  Espaços  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Espaços');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/tasks').send({ description: 'Sem título' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when title is blank', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'T', status: 'errado' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid priority', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'T', priority: 'critica' });
    expect(res.status).toBe(400);
  });
});

/* =============================================
   PUT /api/tasks/:id
   ============================================= */
describe('PUT /api/tasks/:id', () => {
  it('updates a task', async () => {
    const created = (await request(app).post('/api/tasks').send({ title: 'Original' })).body;
    const res = await request(app).put(`/api/tasks/${created.id}`).send({
      title: 'Atualizada',
      status: 'concluida',
    });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Atualizada');
    expect(res.body.status).toBe('concluida');
  });

  it('returns 404 when updating non-existent task', async () => {
    const res = await request(app).put('/api/tasks/9999').send({ title: 'X' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when updating with blank title', async () => {
    const created = (await request(app).post('/api/tasks').send({ title: 'T' })).body;
    const res = await request(app).put(`/api/tasks/${created.id}`).send({ title: '  ' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid status on update', async () => {
    const created = (await request(app).post('/api/tasks').send({ title: 'T' })).body;
    const res = await request(app).put(`/api/tasks/${created.id}`).send({ status: 'errado' });
    expect(res.status).toBe(400);
  });
});

/* =============================================
   DELETE /api/tasks/:id
   ============================================= */
describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = (await request(app).post('/api/tasks').send({ title: 'Para deletar' })).body;
    const res = await request(app).delete(`/api/tasks/${created.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/api/tasks/${created.id}`);
    expect(check.status).toBe(404);
  });

  it('returns 404 when deleting non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.status).toBe(404);
  });
});
