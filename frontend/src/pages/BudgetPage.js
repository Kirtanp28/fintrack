import React, { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../services/api';
import { FiTarget, FiSave, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Investment', 'Other'];
const CATEGORY_EMOJI = { Food: '🍔', Travel: '✈️', Shopping: '🛍️', Bills: '📋', Investment: '📈', Other: '📦' };
const CATEGORY_COLORS = { Food: '#10b981', Travel: '#3b82f6', Shopping: '#8b5cf6', Bills: '#f59e0b', Investment: '#06b6d4', Other: '#94a3b8' };

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [totalBudget, setTotalBudget] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState({ Food: '', Travel: '', Shopping: '', Bills: '', Investment: '', Other: '' });
  const [spendingByCategory, setSpendingByCategory] = useState({});
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.get({ month, year });
      setTotalBudget(res.budget.totalBudget || '');
      const cb = res.budget.categoryBudgets || {};
      setCategoryBudgets({
        Food: cb.Food || '', Travel: cb.Travel || '', Shopping: cb.Shopping || '',
        Bills: cb.Bills || '', Investment: cb.Investment || '', Other: cb.Other || ''
      });
      setSpendingByCategory(res.spendingByCategory || {});
      setTotalSpent(res.totalSpent || 0);
    } catch { toast.error('Failed to load budget'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const cb = {};
      CATEGORIES.forEach(cat => { cb[cat] = parseFloat(categoryBudgets[cat]) || 0; });
      await budgetService.update({ month, year, totalBudget: parseFloat(totalBudget) || 0, categoryBudgets: cb });
      toast.success('Budget saved!');
    } catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  const totalBudgetNum = parseFloat(totalBudget) || 0;
  const overallPct = totalBudgetNum > 0 ? Math.min((totalSpent / totalBudgetNum) * 100, 100) : 0;
  const isOverBudget = totalBudgetNum > 0 && totalSpent > totalBudgetNum;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiTarget size={22} color="var(--accent-amber)" /> Budget Goals
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Set and track your monthly spending limits</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={month} onChange={e => setMonth(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
            {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleString('default',{month:'long'})}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
            {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : (
        <>
          {/* Overall Budget */}
          <div className="glass-card animate-fade-in-up stagger-1" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Overall Monthly Budget</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Total Budget ($)</label>
                <input
                  type="number" min="0" step="10"
                  value={totalBudget}
                  onChange={e => setTotalBudget(e.target.value)}
                  placeholder="e.g. 3000"
                  className="ft-input"
                  style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}
                />
              </div>
              <div style={{ textAlign: 'center', minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: isOverBudget ? 'var(--accent-rose)' : 'var(--accent-green)' }}>
                  ${totalSpent.toFixed(0)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>spent of ${totalBudgetNum.toFixed(0)}</div>
              </div>
            </div>

            {/* Overall progress */}
            {totalBudgetNum > 0 && (
              <>
                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{
                    width: `${overallPct}%`,
                    background: isOverBudget ? 'var(--accent-rose)' : overallPct > 80 ? 'var(--accent-amber)' : 'var(--accent-green)'
                  }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isOverBudget ? (
                      <><FiAlertTriangle size={13} color="var(--accent-rose)" /><span style={{ fontSize: 12, color: 'var(--accent-rose)', fontWeight: 600 }}>Over budget by ${(totalSpent - totalBudgetNum).toFixed(2)}!</span></>
                    ) : (
                      <><FiCheckCircle size={13} color="var(--accent-green)" /><span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>${(totalBudgetNum - totalSpent).toFixed(2)} remaining</span></>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{overallPct.toFixed(1)}% used</span>
                </div>
              </>
            )}
          </div>

          {/* Category Budgets */}
          <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Category Budgets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {CATEGORIES.map(cat => {
                const budgetNum = parseFloat(categoryBudgets[cat]) || 0;
                const spent = spendingByCategory[cat] || 0;
                const pct = budgetNum > 0 ? Math.min((spent / budgetNum) * 100, 100) : 0;
                const over = budgetNum > 0 && spent > budgetNum;

                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 22 }}>{CATEGORY_EMOJI[cat]}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, flex: 1 }}>{cat}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          Spent: <strong style={{ color: over ? 'var(--accent-rose)' : CATEGORY_COLORS[cat] }}>${spent.toFixed(0)}</strong>
                        </span>
                        <span style={{ color: 'var(--border-color)' }}>/</span>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                          <input
                            type="number" min="0" step="10"
                            value={categoryBudgets[cat]}
                            onChange={e => setCategoryBudgets(prev => ({ ...prev, [cat]: e.target.value }))}
                            placeholder="Budget"
                            className="ft-input"
                            style={{ width: 110, paddingLeft: 22, fontSize: 13 }}
                          />
                        </div>
                      </div>
                    </div>
                    {budgetNum > 0 && (
                      <>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{
                            width: `${pct}%`,
                            background: over ? 'var(--accent-rose)' : pct > 80 ? 'var(--accent-amber)' : CATEGORY_COLORS[cat]
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: over ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                            {over ? `$${(spent - budgetNum).toFixed(0)} over limit` : `$${(budgetNum - spent).toFixed(0)} left`}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
            <FiSave size={15} />
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </>
      )}
    </div>
  );
}
