const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboard
} = require('../controllers/taskController');

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.post('/project/:id', createTask);
router.get('/project/:id', getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;