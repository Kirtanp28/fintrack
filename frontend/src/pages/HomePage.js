import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiShield, FiCpu, FiBarChart2, FiDollarSign } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div className="auth-blob" style={{ width: 600, height: 600, background: '#10b981', top: -200, right: -150 }} />
      <div className="auth-blob" style={{ width: 400, height: 400, background: '#3b82f6', bottom: 0, left: -100 }} />
      <div className="auth-blob" style={{ width: 300, height: 300, background: '#8b5cf6', top: '40%', left: '40%' }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid var(--border-color)', background: 'rgba(var(--bg-secondary-rgb, 255,255,255), 0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiDollarSign color="white" size={18} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>FinTrack <span style={{ color: 'var(--accent-green)' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>Login</Link>
          <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '100px 20px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, marginBottom: 28 }}>
          <FiCpu size={14} color="#10b981" />
          <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Powered by Claude AI</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
          Smart Finance Tracking<br />
          <span style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Powered by AI
          </span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Track expenses, analyse income, get AI-powered financial insights and hit your savings goals — all in one beautiful dashboard.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', fontSize: 16, padding: '14px 32px' }}>
            Start for Free <FiArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', fontSize: 16, padding: '14px 32px' }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 10, padding: '60px 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: FiBarChart2, color: '#10b981', bg: 'rgba(16,185,129,0.1)', title: 'Smart Analytics', desc: 'Visualize your spending with beautiful interactive charts and monthly trends.' },
            { icon: FiCpu, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', title: 'AI Insights', desc: 'Get personalized financial advice powered by Claude AI to optimize your budget.' },
            { icon: FiTrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', title: 'Income Tracking', desc: 'Track multiple income sources and understand your cash flow patterns.' },
            { icon: FiShield, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', title: 'Secure & Private', desc: 'JWT auth, bcrypt hashing, and encrypted data keep your finances safe.' },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="glass-card animate-fade-in-up" style={{ padding: '28px 24px' }}>
              <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
