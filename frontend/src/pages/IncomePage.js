import React, { useState, useEffect, useCallback } from 'react';
import { incomeService, exportToCSV } from '../services/api';
import { FiPlus, FiTrash2, FiDownload, FiX, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function IncomeModal({ onClose, onSave }) {
  const [form, setForm] = useState({ amount: '', source: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.source.trim()) e.source = 'Source is required';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await incomeService.add({ ...form, amount: parseFloat(form.amount) });
      toast.success('Income added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add income');
    } finally { setLoading(false); }
  };

  const sources = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Add Income</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Amount ($)</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" className="ft-input" />
            {errors.amount && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.amount}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Source</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {sources.map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({...f, source: s}))}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${form.source === s ? 'var(--accent-green)' : 'var(--border-color)'}`, background: form.source === s ? 'rgba(16,185,129,0.1)' : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.source === s ? 'var(--accent-green)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  {s}
                </button>
              ))}
            </div>
            <input type="text" value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value}))} placeholder="Or type a custom source" className="ft-input" />
            {errors.source && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.source}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="ft-input" />
            {errors.date && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.date}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Any additional notes..." className="ft-input" rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, background: 'var(--accent-green)' }}>
              {loading ? 'Saving...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IncomePage() {
  const [income, setIncome] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await incomeService.getAll({ month, year });
      setIncome(res.incomes || res.income || []);
      setTotalIncome(res.totalIncome || 0);
    } catch { toast.error('Failed to load income'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await incomeService.delete(id);
      toast.success('Income deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExport = () => {
    const csv = (income || []).map(i => ({ Amount: i.amount, Source: i.source, Date: format(new Date(i.date), 'yyyy-MM-dd'), Notes: i.notes || '' }));
    exportToCSV(csv, `income-${year}-${month}.csv`);
    toast.success('Exported to CSV!');
  };

  // Source breakdown
  const sourceBreakdown = (income || []).reduce((acc, i) => { acc[i.source] = (acc[i.source] || 0) + i.amount; return acc; }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showModal && <IncomeModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}

      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Income</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{income.length} records · Total: <strong style={{ color: 'var(--accent-green)' }}>${totalIncome.toFixed(2)}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleExport} className="btn-secondary" style={{ fontSize: 13 }}><FiDownload size={15} /> Export</button>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ fontSize: 13, background: 'var(--accent-green)' }}>
            <FiPlus size={15} /> Add Income
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <div className="stat-card animate-fade-in-up stagger-1">
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: '#10b981' }}>${totalIncome.toFixed(0)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Total Income</div>
        </div>
        {Object.entries(sourceBreakdown).slice(0, 3).map(([src, amt], i) => (
          <div key={src} className={`stat-card animate-fade-in-up stagger-${i+2}`}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>${amt.toFixed(0)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{src}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 4 }}>Filter:</span>
        <select value={month} onChange={e => setMonth(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
          {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleString('default',{month:'long'})}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
          {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Income list */}
      <div className="glass-card animate-fade-in-up stagger-3" style={{ overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : income.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No income recorded</p>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ fontSize: 13, marginTop: 8 }}>
              <FiPlus size={15} /> Add Income
            </button>
          </div>
        ) : (
          <table className="ft-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Notes</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {income.map(inc => (
                <tr key={inc._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiTrendingUp size={14} color="#10b981" />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{inc.source}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{inc.notes || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{format(new Date(inc.date), 'MMM d, yyyy')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)', fontSize: 15 }}>+${inc.amount.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDelete(inc._id)} className="btn-danger" style={{ padding: '6px', borderRadius: 7 }}>
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
