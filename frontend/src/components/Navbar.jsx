import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('logged out');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.logo}>TaskFlow</Link>
        <Link to="/" style={styles.navLink}>Dashboard</Link>
        <Link to="/projects" style={styles.navLink}>Projects</Link>
      </div>
      <div style={styles.right}>
        <span style={styles.userName}>👋 {user?.name}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '64px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#6366f1',
    textDecoration: 'none',
  },
  navLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    color: '#374151',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: '500',
  },
};

export default Navbar;