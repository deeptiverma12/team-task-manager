# TaskFlow — Team Task Manager

A full-stack web app for managing projects and tasks with role-based access control.

## Live Demo
- Frontend: https://team-task-manager-mmsa-git-main-deeptiverma12s-projects.vercel.app
- Backend API: https://team-task-manager-production-e480.up.railway.app

## Features
- JWT Authentication (Signup/Login)
- Create and manage projects
- Add team members with Admin/Member roles
- Create, assign and track tasks
- Dashboard with task stats and overdue detection
- Role-based access — only admins can add members and delete tasks

## Tech Stack
**Frontend:** React, React Router, Axios, React Hot Toast  
**Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs  
**Database:** Supabase (PostgreSQL)  
**Deployment:** Vercel (frontend) + Railway (backend)

## Setup
1. Clone the repo
2. Backend: `cd backend && npm install && node index.js`
3. Frontend: `cd frontend && npm install && npm start`
4. Add `.env` with DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
