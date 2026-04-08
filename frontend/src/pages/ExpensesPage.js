import React, { useState, useEffect, useCallback } from 'react';
import { expenseService, exportToCSV } from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, FiFilter, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Investment', 'Other'];
const CATEGORY_EMOJI = { Food: '🍔', Travel: '✈️', Shopping: '🛍️', Bills: '📋', Investment: '📈', Other: '📦' };
const CATEGORY_COLORS = { Food: '#10b981', Travel: '#3b82f6', Shopping: '#8b5cf6', Bills: '#f59e0b', Investment: '#06b6d4', Other: '#94a3b8' };

function ExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: expense?.amount || '',
    category: expense?.category || 'Food',
    date: expense?.date ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    notes: expense?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (expense?._id) {
        await expenseService.update(expense._id, payload);
        toast.success('Expense updated!');
      } else {
        await expenseService.add(payload);
        toast.success('Expense added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {expense?._id ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Amount ($)</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" className="ft-input" />
            {errors.amount && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.amount}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setForm(f => ({...f, category: cat}))}
                  style={{ padding: '8px', borderRadius: 10, border: `2px solid ${form.category === cat ? CATEGORY_COLORS[cat] : 'var(--border-color)'}`, background: form.category === cat ? `${CATEGORY_COLORS[cat]}15` : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.category === cat ? CATEGORY_COLORS[cat] : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  {CATEGORY_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="ft-input" />
            {errors.date && <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 4 }}>{errors.date}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Add a note..." className="ft-input" rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : expense?._id ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { month, year, limit: 200 };
      if (filterCat !== 'All') params.category = filterCat;
      if (search) params.search = search;
      const res = await expenseService.getAll(params);
      setExpenses(res.expenses);
      setTotal(res.total);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [month, year, filterCat, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseService.delete(id);
      toast.success('Expense deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExport = () => {
    const csv = expenses.map(e => ({
      Amount: e.amount,
      Category: e.category,
      Date: format(new Date(e.date), 'yyyy-MM-dd'),
      Notes: e.notes || ''
    }));
    exportToCSV(csv, `expenses-${year}-${month}.csv`);
    toast.success('Exported to CSV!');
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showModal && (
        <ExpenseModal expense={editExpense} onClose={() => { setShowModal(false); setEditExpense(null); }} onSave={() => { setShowModal(false); setEditExpense(null); load(); }} />
      )}

      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Expenses</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{total} records · Total: <strong style={{ color: 'var(--accent-rose)' }}>${totalAmount.toFixed(2)}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleExport} className="btn-secondary" style={{ fontSize: 13 }}><FiDownload size={15} /> Export CSV</button>
          <button onClick={() => { setEditExpense(null); setShowModal(true); }} className="btn-primary" style={{ fontSize: 13 }}><FiPlus size={15} /> Add Expense</button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card animate-fade-in-up stagger-1" style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="ft-input" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiFilter size={14} color="var(--text-muted)" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="ft-input" style={{ width: 'auto', paddingRight: 32 }}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <select value={month} onChange={e => setMonth(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
            {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleString('default',{month:'short'})}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
            {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card animate-fade-in-up stagger-2" style={{ overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No expenses found</p>
            <p style={{ fontSize: 14 }}>Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          <table className="ft-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Notes</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{CATEGORY_EMOJI[exp.category]}</span>
                      <span className="category-pill" style={{ background: `${CATEGORY_COLORS[exp.category]}18`, color: CATEGORY_COLORS[exp.category] }}>
                        {exp.category}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.notes || '—'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{format(new Date(exp.date), 'MMM d, yyyy')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-rose)' }}>-${exp.amount.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => { setEditExpense(exp); setShowModal(true); }} style={{ background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 7, padding: '6px', cursor: 'pointer', color: '#3b82f6', display: 'flex' }}>
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(exp._id)} className="btn-danger" style={{ padding: '6px', borderRadius: 7 }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
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
