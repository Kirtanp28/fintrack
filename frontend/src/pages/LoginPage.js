import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(ev => ({ ...ev, [e.target.name]: '' }));
  };

  return (
    <div className="auth-container">
      <div className="auth-blob" style={{ width: 500, height: 500, background: '#10b981', top: -150, right: -100 }} />
      <div className="auth-blob" style={{ width: 350, height: 350, background: '#3b82f6', bottom: -100, left: -50 }} />

      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 420, padding: '36px 32px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiDollarSign color="white" size={19} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>FinTrack AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart Finance Tracker</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Welcome back</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="ft-input" style={{ paddingLeft: 36 }}
              />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                placeholder="Enter your password"
                className="ft-input" style={{ paddingLeft: 36, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '13px' }}>
            {loading ? 'Signing in...' : <><span>Sign In</span> <FiArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
