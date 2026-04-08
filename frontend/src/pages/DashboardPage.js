import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expenseService, incomeService } from '../services/api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiArrowRight, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import MiniBarChart from '../components/charts/MiniBarChart';
import MiniPieChart from '../components/charts/MiniPieChart';

const CATEGORY_COLORS = {
  Food: '#10b981', Travel: '#3b82f6', Shopping: '#8b5cf6',
  Bills: '#f59e0b', Investment: '#06b6d4', Other: '#94a3b8'
};

const CATEGORY_EMOJI = {
  Food: '🍔', Travel: '✈️', Shopping: '🛍️', Bills: '📋', Investment: '📈', Other: '📦'
};

function StatCard({ title, amount, icon: Icon, color, bg, change, prefix = '$', stagger }) {
  return (
    <div className={`stat-card animate-fade-in-up stagger-${stagger}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {change !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, color: change >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)', background: change >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', padding: '3px 8px', borderRadius: 20 }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
        {prefix}{typeof amount === 'number' ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ expenses: [], income: [], loading: true });
  const now = new Date();

  const load = useCallback(async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        expenseService.getAll({ month: now.getMonth() + 1, year: now.getFullYear(), limit: 100 }),
        incomeService.getAll({ month: now.getMonth() + 1, year: now.getFullYear() })
      ]);
      setData({ expenses: expRes.expenses || [], income: incRes.incomes || incRes.income || [], loading: false });
    } catch {
      setData(d => ({ ...d, loading: false }));
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const totalIncome = (data.income || []).reduce((s, i) => s + i.amount, 0);
  const totalExpenses = (data.expenses || []).reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  // Category breakdown
  const categoryTotals = (data.expenses || []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  // Budget alert
  const budgetGoal = user?.monthlyBudgetGoal || 0;
  const overBudget = budgetGoal > 0 && totalExpenses > budgetGoal;

  // Recent transactions (last 5)
  const recentExpenses = [...data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Chart data: monthly spending last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString('default', { month: 'short' }), value: 0 };
  });

  if (data.loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{format(now, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/expenses" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '9px 16px' }}>
            <FiPlus size={15} /> Add Expense
          </Link>
          <Link to="/income" className="btn-secondary" style={{ textDecoration: 'none', fontSize: 13, padding: '9px 16px' }}>
            <FiPlus size={15} /> Add Income
          </Link>
        </div>
      </div>

      {/* Budget alert */}
      {overBudget && (
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12 }}>
          <FiAlertTriangle size={20} color="var(--accent-rose)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-rose)', fontSize: 14 }}>Budget Alert!</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              You've exceeded your monthly budget of ${budgetGoal.toLocaleString()} by ${(totalExpenses - budgetGoal).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard title="Monthly Income" amount={totalIncome} icon={FiTrendingUp} color="#10b981" bg="rgba(16,185,129,0.1)" stagger={1} />
        <StatCard title="Monthly Expenses" amount={totalExpenses} icon={FiTrendingDown} color="#f43f5e" bg="rgba(244,63,94,0.1)" stagger={2} />
        <StatCard title="Net Savings" amount={savings} icon={FiActivity} color="#3b82f6" bg="rgba(59,130,246,0.1)" stagger={3} />
        <StatCard title="Savings Rate" amount={parseFloat(savingsRate)} icon={FiDollarSign} color="#8b5cf6" bg="rgba(139,92,246,0.1)" prefix="" stagger={4} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Expense breakdown pie */}
        <div className="glass-card animate-fade-in-up stagger-3" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Expense Categories</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(now, 'MMMM yyyy')}</span>
          </div>
          {Object.keys(categoryTotals).length > 0 ? (
            <>
              <MiniPieChart data={categoryTotals} colors={CATEGORY_COLORS} total={totalExpenses} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{CATEGORY_EMOJI[cat]}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${amt.toFixed(0)}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' }}>
                      {totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <FiTrendingDown size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>No expenses this month</p>
            </div>
          )}
        </div>

        {/* Mini bar chart */}
        <div className="glass-card animate-fade-in-up stagger-4" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Spending Overview</h3>
            <Link to="/analytics" style={{ fontSize: 12, color: 'var(--accent-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              Full Report <FiArrowRight size={12} />
            </Link>
          </div>
          <MiniBarChart months={months} expenses={data.expenses} income={data.income} />
          {/* Income vs expense summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>${totalIncome.toFixed(0)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Income</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(244,63,94,0.06)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f43f5e', fontFamily: 'var(--font-display)' }}>${totalExpenses.toFixed(0)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Expenses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card animate-fade-in-up stagger-5" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Expenses</h3>
          <Link to="/expenses" style={{ fontSize: 12, color: 'var(--accent-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            View All <FiArrowRight size={12} />
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 14 }}>No expenses recorded yet.</p>
            <Link to="/expenses" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 12, fontSize: 13, padding: '9px 18px' }}>
              <FiPlus size={15} /> Add your first expense
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentExpenses.map((exp, idx) => (
              <div key={exp._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: idx < recentExpenses.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${CATEGORY_COLORS[exp.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {CATEGORY_EMOJI[exp.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {exp.notes || exp.category}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {exp.category} · {format(new Date(exp.date), 'MMM d')}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-rose)', flexShrink: 0 }}>
                  -${exp.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
