const pool = require('../db');

// create a new project
const createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'project name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.userId]
    );

    const project = result.rows[0];

    // auto-add creator as admin
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, req.userId, 'admin']
    );

    res.status(201).json(project);
  } catch (err) {
    console.log('create project error:', err.message);
    res.status(500).json({ error: 'something went wrong' });
  }
};

// get all projects for logged in user
const getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, pm.role 
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

// get single project with members
const getProject = async (req, res) => {
  const { id } = req.params;

  try {
    // check if user is a member
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'access denied' });
    }

    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    const members = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );

    res.json({
      ...project.rows[0],
      members: members.rows,
      userRole: memberCheck.rows[0].role
    });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

// add member to project (admin only)
const addMember = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  try {
    // only admin can add members
    const adminCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'only admins can add members' });
    }

    // find user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }

    const newMemberId = userResult.rows[0].id;

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [id, newMemberId, role || 'member']
    );

    res.json({ message: 'member added successfully' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'user is already a member' });
    }
    res.status(500).json({ error: 'something went wrong' });
  }
};

// delete project (admin only)
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const adminCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'only admins can delete projects' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

module.exports = { createProject, getProjects, getProject, addMember, deleteProject };