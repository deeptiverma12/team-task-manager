import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = () => {
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(() => toast.error('failed to load project'));
  };

  const fetchTasks = () => {
    api.get(`/tasks/project/${id}`)
      .then(res => setTasks(res.data))
      .catch(() => toast.error('failed to load tasks'))
      .finally(() => setLoading(false));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return toast.error('task title is required');
    try {
      await api.post(`/tasks/project/${id}`, taskForm);
      toast.success('task created!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
      fetchTasks();
    } catch (err) {
      toast.error('failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return toast.error('email is required');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'member' });
      toast.success('member added!');
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'failed to add member');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
      toast.success('status updated!');
    } catch (err) {
      toast.error('failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'failed to delete task');
    }
  };

  if (loading) return <div style={styles.loading}>loading project...</div>;

  const isAdmin = project?.userRole === 'admin';

  return (
    <div style={styles.container}>
      {/* project header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>{project?.name}</h1>
          <p style={styles.desc}>{project?.description || 'no description'}</p>
        </div>
        <div style={styles.headerBtns}>
          {isAdmin && (
            <button style={styles.outlineBtn} onClick={() => setShowMemberModal(true)}>
              + Add Member
            </button>
          )}
          <button style={styles.btn} onClick={() => setShowTaskModal(true)}>
            + New Task
          </button>
        </div>
      </div>

      {/* members */}
      <div style={styles.membersRow}>
        {project?.members?.map(m => (
          <div key={m.id} style={styles.memberChip}>
            <span>{m.name}</span>
            <span style={{
              ...styles.roleTag,
              color: m.role === 'admin' ? '#7c3aed' : '#64748b'
            }}>
              {m.role}
            </span>
          </div>
        ))}
      </div>

      {/* tasks */}
      <h2 style={styles.sectionTitle}>Tasks ({tasks.length})</h2>

      {tasks.length === 0 ? (
        <div style={styles.empty}>
          <p>no tasks yet — add your first task!</p>
        </div>
      ) : (
        <div style={styles.taskList}>
          {tasks.map(task => (
            <div key={task.id} style={{
              ...styles.taskCard,
              borderLeft: `4px solid ${task.is_overdue ? '#ef4444' : priorityColor(task.priority)}`
            }}>
              <div style={styles.taskTop}>
                <div>
                  <p style={styles.taskTitle}>{task.title}</p>
                  {task.description && (
                    <p style={styles.taskDesc}>{task.description}</p>
                  )}
                  <div style={styles.taskMeta}>
                    {task.assigned_to_name && (
                      <span style={styles.assignee}>👤 {task.assigned_to_name}</span>
                    )}
                    {task.due_date && (
                      <span style={task.is_overdue ? styles.overdue : styles.dueDate}>
                        📅 {new Date(task.due_date).toLocaleDateString()}
                        {task.is_overdue && ' — overdue!'}
                      </span>
                    )}
                    <span style={styles.priority}>{task.priority} priority</span>
                  </div>
                </div>
                <div style={styles.taskActions}>
                  <select
                    style={styles.select}
                    value={task.status}
                    onChange={e => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {isAdmin && (
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* create task modal */}
      {showTaskModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>New Task</h2>
            <form onSubmit={handleCreateTask} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input
                  style={styles.input}
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="task title"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: '70px', resize: 'none' }}
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="optional details"
                />
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.input}
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={taskForm.due_date}
                    onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Assign To (user ID)</label>
                <select
                  style={styles.input}
                  value={taskForm.assigned_to}
                  onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                >
                  <option value="">unassigned</option>
                  {project?.members?.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.btn}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* add member modal */}
      {showMemberModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add Member</h2>
            <form onSubmit={handleAddMember} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Member Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                />
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowMemberModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.btn}>Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const priorityColor = (priority) => {
  if (priority === 'high') return '#ef4444';
  if (priority === 'medium') return '#f59e0b';
  return '#10b981';
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#64748b' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  heading: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' },
  desc: { color: '#64748b', marginTop: '0.25rem' },
  headerBtns: { display: 'flex', gap: '0.75rem' },
  btn: { padding: '0.65rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  outlineBtn: { padding: '0.65rem 1.25rem', background: 'transparent', border: '1.5px solid #6366f1', color: '#6366f1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  membersRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' },
  memberChip: { display: 'flex', gap: '0.4rem', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem' },
  roleTag: { fontSize: '0.75rem', fontWeight: '500' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' },
  empty: { background: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  taskCard: { background: '#fff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' },
  taskDesc: { color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' },
  taskMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' },
  assignee: { color: '#6366f1' },
  dueDate: { color: '#64748b' },
  overdue: { color: '#ef4444', fontWeight: '500' },
  priority: { color: '#94a3b8' },
  taskActions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  select: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', cursor: 'pointer' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#374151' },
  input: { padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', width: '100%' },
  modalBtns: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancelBtn: { padding: '0.65rem 1.25rem', background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '500' },
};

export default ProjectDetail;