import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(res => {
        setStats(res.data.stats);
        setRecentTasks(res.data.recentTasks);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Good day, {user?.name} 👋</h1>
      <p style={styles.sub}>here's what's going on with your projects</p>

      {/* stats cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #6366f1'}}>
          <p style={styles.statNum}>{stats?.todo || 0}</p>
          <p style={styles.statLabel}>To Do</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #f59e0b'}}>
          <p style={styles.statNum}>{stats?.in_progress || 0}</p>
          <p style={styles.statLabel}>In Progress</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #10b981'}}>
          <p style={styles.statNum}>{stats?.done || 0}</p>
          <p style={styles.statLabel}>Done</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #ef4444'}}>
          <p style={styles.statNum}>{stats?.overdue || 0}</p>
          <p style={styles.statLabel}>Overdue</p>
        </div>
      </div>

      {/* recent tasks */}
      <h2 style={styles.sectionTitle}>Recent Tasks</h2>
      {recentTasks.length === 0 ? (
        <div style={styles.empty}>
          <p>no tasks yet — create a project and add some tasks!</p>
        </div>
      ) : (
        <div style={styles.taskList}>
          {recentTasks.map(task => (
            <div key={task.id} style={{
              ...styles.taskItem,
              borderLeft: `4px solid ${task.is_overdue ? '#ef4444' : '#6366f1'}`
            }}>
              <div>
                <p style={styles.taskTitle}>{task.title}</p>
                <p style={styles.taskMeta}>{task.project_name}</p>
              </div>
              <div style={styles.taskRight}>
                <span style={{
                  ...styles.badge,
                  background: statusColor(task.status)
                }}>
                  {task.status.replace('_', ' ')}
                </span>
                {task.is_overdue && (
                  <span style={styles.overdueBadge}>overdue</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const statusColor = (status) => {
  if (status === 'done') return '#dcfce7';
  if (status === 'in_progress') return '#fef3c7';
  return '#f1f5f9';
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: '#64748b',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  sub: {
    color: '#64748b',
    marginTop: '0.25rem',
    marginBottom: '2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statNum: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1e293b',
  },
  empty: {
    background: '#fff',
    padding: '3rem',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#94a3b8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  taskItem: {
    background: '#fff',
    padding: '1rem 1.25rem',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  taskTitle: {
    fontWeight: '500',
    color: '#1e293b',
  },
  taskMeta: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '0.2rem',
  },
  taskRight: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#374151',
  },
  overdueBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    background: '#fee2e2',
    color: '#ef4444',
  },
};

export default Dashboard;