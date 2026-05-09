const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProject,
  addMember,
  deleteProject
} = require('../controllers/projectController');

// all project routes are protected
router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/:id/members', addMember);
router.delete('/:id', deleteProject);

module.exports = router;