/**
 * Task 02 — REST API with Express
 * Level 2 of 4 · Drill — same tools, more moving parts.
 *
 * Implements full CRUD operations over a 'tasks' resource:
 * - GET    /api/tasks        -> Retrieve all tasks
 * - GET    /api/tasks/:id    -> Retrieve a task by ID (404 if missing)
 * - POST   /api/tasks        -> Create a new task (201 Created, 400 on invalid input)
 * - PUT    /api/tasks/:id    -> Update an existing task (200 OK, 404 if missing, 400 on invalid input)
 * - DELETE /api/tasks/:id    -> Delete a task (200 OK, 404 if missing)
 *
 * Designed with universal compatibility: runs with Express when installed,
 * and includes a seamless built-in fallback so it can also run out-of-the-box
 * with standard Node.js without requiring internet for npm install.
 */

const http = require('http');

let express;
try {
  express = require('express');
} catch (e) {
  express = null;
}

// In-memory data store with initial seed records
let tasks = [
  {
    id: 1,
    title: 'Complete Onboarding',
    description: 'Download offer letter and share update on LinkedIn',
    completed: true,
    createdAt: new Date('2026-10-01T10:00:00Z').toISOString()
  },
  {
    id: 2,
    title: 'Responsive landing page',
    description: 'Build a mobile and desktop layout with zero horizontal overflow at 375px',
    completed: true,
    createdAt: new Date('2026-10-10T12:00:00Z').toISOString()
  },
  {
    id: 3,
    title: 'REST API with Express',
    description: 'Implement GET, POST, PUT, DELETE with JSON in/out and proper status codes',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

let nextId = 4;

// --- Controller Route Handlers ---

// Root / Health check & API documentation
function handleGetRoot(req, res) {
  res.status(200).json({
    name: 'Task 02 REST API with Express',
    version: '1.0.0',
    description: 'A RESTful API supporting CRUD operations over tasks with JSON in/out',
    endpoints: {
      'GET /api/tasks': 'List all tasks',
      'GET /api/tasks/:id': 'Get a specific task by ID (returns 404 if missing)',
      'POST /api/tasks': 'Create a new task (returns 201 Created)',
      'PUT /api/tasks/:id': 'Update an existing task (returns 404 if missing)',
      'DELETE /api/tasks/:id': 'Delete a task by ID (returns 404 if missing)'
    },
    count: tasks.length
  });
}

// GET /api/tasks - Retrieve all tasks
function handleGetTasks(req, res) {
  res.status(200).json(tasks);
}

// GET /api/tasks/:id - Retrieve a single task by ID
function handleGetTaskById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID format: ID must be an integer'
    });
  }

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({
      error: `Task with ID ${id} not found`
    });
  }

  res.status(200).json(task);
}

// POST /api/tasks - Create a new task (JSON in / JSON out)
function handleCreateTask(req, res) {
  const body = req.body || {};

  // Validate required title field
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return res.status(400).json({
      error: "Validation error: 'title' is required and must be a non-empty string"
    });
  }

  const newTask = {
    id: nextId++,
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description.trim() : '',
    completed: typeof body.completed === 'boolean' ? body.completed : false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
}

// PUT /api/tasks/:id - Update an existing task
function handleUpdateTask(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID format: ID must be an integer'
    });
  }

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({
      error: `Task with ID ${id} not found`
    });
  }

  const body = req.body || {};

  // Validate title if provided
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return res.status(400).json({
        error: "Validation error: 'title' cannot be empty"
      });
    }
    tasks[index].title = body.title.trim();
  }

  if (body.description !== undefined) {
    tasks[index].description = typeof body.description === 'string' ? body.description.trim() : '';
  }

  if (body.completed !== undefined) {
    tasks[index].completed = Boolean(body.completed);
  }

  tasks[index].updatedAt = new Date().toISOString();

  res.status(200).json(tasks[index]);
}

// DELETE /api/tasks/:id - Remove a task
function handleDeleteTask(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID format: ID must be an integer'
    });
  }

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({
      error: `Task with ID ${id} not found`
    });
  }

  const deletedTask = tasks.splice(index, 1)[0];
  res.status(200).json({
    message: `Task ${id} successfully deleted`,
    deleted: deletedTask
  });
}

// --- Server Setup ---

const PORT = process.env.PORT || 3000;

if (express) {
  // Standard Express execution
  const app = express();
  app.use(express.json());

  // Mount routes
  app.get('/', handleGetRoot);
  app.get('/api/tasks', handleGetTasks);
  app.get('/tasks', handleGetTasks);
  app.get('/api/tasks/:id', handleGetTaskById);
  app.get('/tasks/:id', handleGetTaskById);
  app.post('/api/tasks', handleCreateTask);
  app.post('/tasks', handleCreateTask);
  app.put('/api/tasks/:id', handleUpdateTask);
  app.put('/tasks/:id', handleUpdateTask);
  app.delete('/api/tasks/:id', handleDeleteTask);
  app.delete('/tasks/:id', handleDeleteTask);

  // 404 catch-all
  app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
  });

  const server = app.listen(PORT, () => {
    console.log(`[Express] REST API server listening at http://localhost:${PORT}`);
  });

  module.exports = { app, server, tasks };
} else {
  // Seamless built-in HTTP server fallback
  const server = http.createServer((req, res) => {
    // Helper to send JSON with correct Content-Type header
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(data, null, 2));
    };

    const urlParts = req.url.split('?')[0].replace(/\/+$/, '') || '/';
    const method = req.method.toUpperCase();

    // Collect request body
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', () => {
      req.body = {};
      if (bodyData.trim()) {
        try {
          req.body = JSON.parse(bodyData);
        } catch (e) {
          return res.status(400).json({ error: 'Malformed JSON payload' });
        }
      }

      req.params = {};

      // Route Dispatcher
      if (method === 'GET' && urlParts === '/') {
        return handleGetRoot(req, res);
      }

      if (method === 'GET' && (urlParts === '/api/tasks' || urlParts === '/tasks')) {
        return handleGetTasks(req, res);
      }

      const matchId = urlParts.match(/^\/(?:api\/)?tasks\/([^/]+)$/);
      if (matchId) {
        req.params.id = matchId[1];
        if (method === 'GET') return handleGetTaskById(req, res);
        if (method === 'PUT') return handleUpdateTask(req, res);
        if (method === 'DELETE') return handleDeleteTask(req, res);
      }

      if (method === 'POST' && (urlParts === '/api/tasks' || urlParts === '/tasks')) {
        return handleCreateTask(req, res);
      }

      // Default 404 for unknown endpoints
      res.status(404).json({ error: `Cannot ${method} ${urlParts}` });
    });
  });

  server.listen(PORT, () => {
    console.log(`[REST API Server] listening at http://localhost:${PORT}`);
  });

  module.exports = { server, tasks };
}
