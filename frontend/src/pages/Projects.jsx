import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(() => toast.error('failed to load projects'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('project name is required');
    try {
      await api.post('/projects', form);
      toast.success('project created!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error('failed to create project');
    }
  };

  if (loading) return <div style={styles.loading}>loading projects...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Projects</h1>
        <button style={styles.btn} onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>no projects yet</p>
          <p style={styles.emptySubtext}>create your first project to get started</p>
          <button style={styles.btn} onClick={() => setShowModal(true)}>
            + Create Project
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map(project => (
            <div
              key={project.id}
              style={styles.card}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                <span style={{
                  ...styles.roleBadge,
                  background: project.role === 'admin' ? '#ede9fe' : '#f1f5f9',
                  color: project.role === 'admin' ? '#7c3aed' : '#64748b',
                }}>
                  {project.role}
                </span>
              </div>
              <p style={styles.cardDesc}>
                {project.description || 'no description'}
              </p>
              <p style={styles.cardDate}>
                created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* create project modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>New Project</h2>
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Project Name *</label>
                <input
                  style={styles.input}
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'none' }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="what's this project about?"
                />
              </div>
              <div style={styles.modalBtns}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btn}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  btn: {
    padding: '0.65rem 1.25rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  empty: {
    background: '#fff',
    padding: '4rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    color: '#94a3b8',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    borderTop: '4px solid #6366f1',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '1rem',
  },
  roleBadge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  cardDesc: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  cardDate: {
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
  },
  modalBtns: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    padding: '0.65rem 1.25rem',
    background: 'transparent',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: '500',
  },
};

export default Projects;