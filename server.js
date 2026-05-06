const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { createDatabase, DB_PATH } = require('./database');
const { createTasksRouter } = require('./routes/tasks');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

function createApp(db) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/tasks', apiLimiter, createTasksRouter(db));

  // Catch-all: serve the SPA
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  return app;
}

module.exports = { createApp };

if (require.main === module) {
  const db = createDatabase(DB_PATH);
  const app = createApp(db);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}
