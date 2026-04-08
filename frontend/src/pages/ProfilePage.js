import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { FiUser, FiMail, FiDollarSign, FiSave, FiCalendar, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD',
    monthlyBudgetGoal: user?.monthlyBudgetGoal || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Profile Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Manage your account and preferences</p>
      </div>

      {/* Avatar + meta */}
      <div className="glass-card animate-fade-in-up stagger-1" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: 'white',
          fontFamily: 'var(--font-display)', flexShrink: 0
        }}>{initials}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{user?.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <FiCalendar size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '28px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Personal Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiUser size={13} /> Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="ft-input"
              placeholder="Your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMail size={13} /> Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="ft-input"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiShield size={12} /> Verified
              </span>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiDollarSign size={13} /> Preferred Currency
            </label>
            <select
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="ft-input"
            >
              <option value="USD">🇺🇸 USD — US Dollar</option>
              <option value="EUR">🇪🇺 EUR — Euro</option>
              <option value="GBP">🇬🇧 GBP — British Pound</option>
              <option value="INR">🇮🇳 INR — Indian Rupee</option>
              <option value="CAD">🇨🇦 CAD — Canadian Dollar</option>
              <option value="AUD">🇦🇺 AUD — Australian Dollar</option>
              <option value="JPY">🇯🇵 JPY — Japanese Yen</option>
              <option value="SGD">🇸🇬 SGD — Singapore Dollar</option>
            </select>
          </div>

          {/* Monthly Budget Goal */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiDollarSign size={13} /> Monthly Budget Goal
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={form.monthlyBudgetGoal}
              onChange={e => setForm(f => ({ ...f, monthlyBudgetGoal: e.target.value }))}
              placeholder="e.g. 3000"
              className="ft-input"
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
              Set a monthly spending limit. You'll get alerts on your dashboard when close to or over this amount.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
            style={{ alignSelf: 'flex-start', marginTop: 8, padding: '11px 24px' }}
          >
            <FiSave size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Security info */}
      <div className="glass-card animate-fade-in-up stagger-3" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Security</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: FiShield, label: 'Password', value: '••••••••••', desc: 'Securely hashed with bcrypt' },
            { icon: FiShield, label: 'Authentication', value: 'JWT Token', desc: 'Session expires in 7 days' },
          ].map(({ icon: Icon, label, value, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: 'var(--bg-primary)', borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(16,185,129,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color="var(--accent-green)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
