const pool = require('../db');

// create task
const createTask = async (req, res) => {
  const { id: project_id } = req.params;
  const { title, description, assigned_to, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'task title is required' });
  }

  try {
    // check if user is a member of this project
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project_id, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'access denied' });
    }

    const result = await pool.query(
      `INSERT INTO tasks 
       (project_id, title, description, assigned_to, created_by, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [project_id, title, description, assigned_to, req.userId, priority, due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log('create task error:', err.message);
    res.status(500).json({ error: 'something went wrong' });
  }
};

// get all tasks for a project
const getTasks = async (req, res) => {
  const { id: project_id } = req.params;

  try {
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project_id, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'access denied' });
    }

    const result = await pool.query(
      `SELECT t.*, 
        u.name as assigned_to_name,
        CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'done' 
             THEN true ELSE false END as is_overdue
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [project_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

// update task status or details
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  try {
    // get task first to check project membership
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'task not found' });
    }

    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.rows[0].project_id, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'access denied' });
    }

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        assigned_to = COALESCE($6, assigned_to),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, taskId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

// delete task (admin only)
const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'task not found' });
    }

    const adminCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.rows[0].project_id, req.userId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'only admins can delete tasks' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    res.json({ message: 'task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

// dashboard stats
const getDashboard = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE t.status = 'todo') as todo,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE t.status = 'done') as done,
        COUNT(*) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'done') as overdue
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1`,
      [req.userId]
    );

    const recentTasks = await pool.query(
      `SELECT t.*, p.name as project_name,
        CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'done'
             THEN true ELSE false END as is_overdue
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY t.created_at DESC LIMIT 5`,
      [req.userId]
    );

    res.json({
      stats: stats.rows[0],
      recentTasks: recentTasks.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboard };