const express = require('express');
const cors = require('cors');
require('dotenv').config();

// route files
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

// middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://team-task-manager-mmsa.vercel.app', 'https://team-task-manager-mmsa-5rb594y06-deeptiverma12s-projects.vercel.app'],
  credentials: true
}));
app.use(express.json());

// api routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});