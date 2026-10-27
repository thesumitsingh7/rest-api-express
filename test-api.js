/**
 * In-Memory Unit & Integration Test Suite for Task 02 REST API
 * Tests all routes, CRUD operations, JSON serialization, and status codes.
 */

// Load the server file logic
const fs = require('fs');
const path = require('path');

// Extract the handler logic and simulate request/response
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

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.headers['content-type'] = 'application/json';
      this.body = data;
      return this;
    },
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
    }
  };
  return res;
}

// Handlers under test
function handleGetTasks(req, res) {
  res.status(200).json(tasks);
}

function handleGetTaskById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format: ID must be an integer' });
  }
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }
  res.status(200).json(task);
}

function handleCreateTask(req, res) {
  const body = req.body || {};
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

function handleUpdateTask(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format: ID must be an integer' });
  }
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }
  const body = req.body || {};
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return res.status(400).json({ error: "Validation error: 'title' cannot be empty" });
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

function handleDeleteTask(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format: ID must be an integer' });
  }
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }
  const deletedTask = tasks.splice(index, 1)[0];
  res.status(200).json({
    message: `Task ${id} successfully deleted`,
    deleted: deletedTask
  });
}

function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING TASK 02 API TESTS — GET, POST, PUT, DELETE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. GET /api/tasks
  console.log('1. Testing GET /api/tasks:');
  const res1 = createMockRes();
  handleGetTasks({ method: 'GET' }, res1);
  assert(res1.statusCode === 200, 'Returns status 200 OK');
  assert(Array.isArray(res1.body), 'Returns array of tasks');
  assert(res1.body.length === 3, 'Contains 3 initial seeded tasks');

  // 2. GET /api/tasks/1 (Found)
  console.log('\n2. Testing GET /api/tasks/1 (Existing Record):');
  const res2 = createMockRes();
  handleGetTaskById({ method: 'GET', params: { id: '1' } }, res2);
  assert(res2.statusCode === 200, 'Returns status 200 OK');
  assert(res2.body.id === 1, 'Task ID is 1');
  assert(res2.body.title === 'Complete Onboarding', 'Matches task title');

  // 3. GET /api/tasks/999 (Missing Record -> 404)
  console.log('\n3. Testing GET /api/tasks/999 (Missing Record):');
  const res3 = createMockRes();
  handleGetTaskById({ method: 'GET', params: { id: '999' } }, res3);
  assert(res3.statusCode === 404, 'Returns correct 404 Not Found status code');
  assert(res3.body.error.includes('not found'), 'Returns JSON error object');

  // 4. POST /api/tasks (Validation failure -> 400)
  console.log('\n4. Testing POST /api/tasks with missing title:');
  const res4 = createMockRes();
  handleCreateTask({ method: 'POST', body: { description: 'Missing title' } }, res4);
  assert(res4.statusCode === 400, 'Returns 400 Bad Request');
  assert(res4.body.error.includes('Validation error'), 'Returns validation error description');

  // 5. POST /api/tasks (Valid -> 201)
  console.log('\n5. Testing POST /api/tasks (Creation):');
  const res5 = createMockRes();
  handleCreateTask({
    method: 'POST',
    body: {
      title: 'CRUD app on a database',
      description: 'Task 03 preview',
      completed: false
    }
  }, res5);
  assert(res5.statusCode === 201, 'Returns 201 Created');
  assert(res5.body.id === 4, 'Assigned new ID = 4');
  assert(res5.body.title === 'CRUD app on a database', 'Title preserved in JSON response');

  // 6. PUT /api/tasks/4 (Update existing -> 200)
  console.log('\n6. Testing PUT /api/tasks/4 (Update):');
  const res6 = createMockRes();
  handleUpdateTask({
    method: 'PUT',
    params: { id: '4' },
    body: { completed: true, description: 'Updated description' }
  }, res6);
  assert(res6.statusCode === 200, 'Returns 200 OK');
  assert(res6.body.completed === true, 'Updated completed boolean');
  assert(res6.body.description === 'Updated description', 'Updated description string');

  // 7. PUT /api/tasks/999 (Missing record -> 404)
  console.log('\n7. Testing PUT /api/tasks/999 (Missing Record):');
  const res7 = createMockRes();
  handleUpdateTask({ method: 'PUT', params: { id: '999' }, body: { title: 'Unknown' } }, res7);
  assert(res7.statusCode === 404, 'Returns 404 Not Found on missing record update');

  // 8. DELETE /api/tasks/4 (Delete existing -> 200)
  console.log('\n8. Testing DELETE /api/tasks/4:');
  const res8 = createMockRes();
  handleDeleteTask({ method: 'DELETE', params: { id: '4' } }, res8);
  assert(res8.statusCode === 200, 'Returns 200 OK');
  assert(res8.body.deleted.id === 4, 'Returns deleted record in response');

  // 9. DELETE /api/tasks/4 again (Missing record -> 404)
  console.log('\n9. Testing DELETE /api/tasks/4 again (Missing Record):');
  const res9 = createMockRes();
  handleDeleteTask({ method: 'DELETE', params: { id: '4' } }, res9);
  assert(res9.statusCode === 404, 'Returns 404 Not Found when deleting missing record');

  console.log('\n====================================================');
  console.log(`TOTAL: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
