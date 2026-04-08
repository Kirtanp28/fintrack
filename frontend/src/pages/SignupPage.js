import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Welcome to FinTrack AI 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(ev => ({ ...ev, [e.target.name]: '' }));
  };

  const strengthScore = form.password.length >= 10 ? 3 : form.password.length >= 6 ? 2 : form.password.length > 0 ? 1 : 0;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColor = ['', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="auth-container">
      <div className="auth-blob" style={{ width: 500, height: 500, background: '#8b5cf6', top: -150, left: -100 }} />
      <div className="auth-blob" style={{ width: 350, height: 350, background: '#10b981', bottom: -100, right: -50 }} />

      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 440, padding: '36px 32px', position: 'relative', zIndex: 10, margin: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiDollarSign color="white" size={19} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>FinTrack AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart Finance Tracker</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Create account</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Start your journey to financial freedom</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className="ft-input" style={{ paddingLeft: 36 }} />
            </div>
            {errors.name && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="ft-input" style={{ paddingLeft: 36 }} />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="ft-input" style={{ paddingLeft: 36, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i <= strengthScore ? strengthColor[strengthScore] : 'var(--border-color)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColor[strengthScore] }}>{strengthLabel[strengthScore]}</span>
              </div>
            )}
            {errors.password && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="confirmPassword" type={showPass ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Repeat your password" className="ft-input" style={{ paddingLeft: 36 }} />
            </div>
            {errors.confirmPassword && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '13px' }}>
            {loading ? 'Creating account...' : <><span>Create Account</span> <FiArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
