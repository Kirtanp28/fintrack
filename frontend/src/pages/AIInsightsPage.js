import React, { useState } from 'react';
import { aiService } from '../services/api';
import { FiCpu, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiDollarSign, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="var(--border-color)" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{score}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</div>
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await aiService.analyze();
      setData(res);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const alertColor = {
    good: '#10b981',
    warning: '#f59e0b',
    critical: '#f43f5e'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCpu size={24} color="var(--accent-violet)" /> AI Financial Insights
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Powered by Claude AI — personalized financial analysis</p>
        </div>
        <button onClick={analyze} className="btn-primary" disabled={loading} style={{ background: 'var(--accent-violet)' }}>
          {loading ? <><FiRefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><FiZap size={15} /> Generate Insights</>}
        </button>
      </div>

      {/* Empty state */}
      {!data && !loading && (
        <div className="glass-card animate-fade-in-up" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FiCpu size={36} color="var(--accent-violet)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            Ready to analyze your finances
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Click "Generate Insights" to get personalized AI-powered analysis of your spending patterns, budget suggestions, and savings tips based on your current month's data.
          </p>
          <button onClick={analyze} className="btn-primary" style={{ background: 'var(--accent-violet)', padding: '12px 28px' }}>
            <FiZap size={16} /> Analyze My Finances
          </button>
        </div>
      )}

      {loading && (
        <div className="glass-card animate-fade-in" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Claude AI is analyzing your finances...</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>This may take a few seconds</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {data && !loading && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Score + Assessment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'center' }} className="glass-card" style={{ padding: '28px' }}>
            <div className="glass-card" style={{ padding: '28px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <ScoreRing score={data.insights?.spendingScore || 70} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>Financial Health Score</div>
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${alertColor[data.insights?.alertLevel || 'good']}15`, border: `1px solid ${alertColor[data.insights?.alertLevel || 'good']}30`, marginBottom: 14 }}>
                  {data.insights?.alertLevel === 'good' ? <FiCheckCircle size={13} /> : <FiAlertTriangle size={13} />}
                  <span style={{ fontSize: 12, fontWeight: 700, color: alertColor[data.insights?.alertLevel || 'good'], textTransform: 'capitalize' }}>
                    {data.insights?.alertLevel || 'good'} status
                  </span>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7 }}>{data.insights?.assessment}</p>
                <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                  {[
                    { label: 'Income', val: `$${data.financialData?.totalIncome?.toFixed(0) || 0}`, color: '#10b981' },
                    { label: 'Expenses', val: `$${data.financialData?.totalExpenses?.toFixed(0) || 0}`, color: '#f43f5e' },
                    { label: 'Savings', val: `${data.financialData?.savingsRate || 0}%`, color: '#3b82f6' },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Spending Insights */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FiTrendingUp size={16} color="var(--accent-rose)" /> Spending Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data.insights?.insights || []).map((insight, i) => (
                  <div key={i} className="insight-card warning">
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FiCheckCircle size={16} color="var(--accent-green)" /> Budget Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data.insights?.recommendations || []).map((rec, i) => (
                  <div key={i} className="insight-card">
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Tips */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FiDollarSign size={16} color="var(--accent-blue)" /> Savings Tips
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data.insights?.savingsTips || []).map((tip, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'rgba(59,130,246,0.05)', borderLeft: '3px solid #3b82f6', borderRadius: '0 10px 10px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Motivation */}
          {data.insights?.motivation && (
            <div style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>✨</span>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{data.insights.motivation}"</p>
            </div>
          )}

          <button onClick={analyze} className="btn-secondary" style={{ alignSelf: 'center', fontSize: 13 }}>
            <FiRefreshCw size={14} /> Regenerate Analysis
          </button>
        </div>
      )}
    </div>
  );
}
