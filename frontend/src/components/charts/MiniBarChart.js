import React from 'react';

// ── MiniPieChart ────────────────────────────────────────────────────────────
export function MiniPieChart({ data, colors, total }) {
  const entries = Object.entries(data);
  if (!entries.length || total === 0) return null;

  const size = 120;
  const cx = size / 2, cy = size / 2, r = 46, innerR = 28;
  let cumulative = 0;

  const slices = entries.map(([cat, amt]) => {
    const pct = amt / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const large = pct > 0.5 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    return { cat, d, color: colors[cat] || '#94a3b8', pct };
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map(({ cat, d, color }) => (
          <path key={cat} d={d} fill={color} opacity={0.9} />
        ))}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="var(--bg-card)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700" fontFamily="Syne">
          ${total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="8">
          total
        </text>
      </svg>
    </div>
  );
}

// ── MiniBarChart ────────────────────────────────────────────────────────────
export function MiniBarChart({ months, expenses, income }) {
  // Aggregate by month
  const monthlyExp = {};
  const monthlyInc = {};
  expenses.forEach(e => {
    const key = new Date(e.date).toLocaleString('default', { month: 'short' });
    monthlyExp[key] = (monthlyExp[key] || 0) + e.amount;
  });
  income.forEach(i => {
    const key = new Date(i.date).toLocaleString('default', { month: 'short' });
    monthlyInc[key] = (monthlyInc[key] || 0) + i.amount;
  });

  const data = months.map(m => ({
    label: m.label,
    expenses: monthlyExp[m.label] || 0,
    income: monthlyInc[m.label] || 0,
  }));

  const maxVal = Math.max(...data.flatMap(d => [d.expenses, d.income]), 1);
  const chartH = 120;
  const barW = 10;
  const gap = 4;
  const groupW = barW * 2 + gap + 8;
  const totalW = data.length * groupW;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={chartH + 24} viewBox={`0 0 ${totalW} ${chartH + 24}`} preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const x = i * groupW + 4;
          const expH = (d.expenses / maxVal) * (chartH - 10);
          const incH = (d.income / maxVal) * (chartH - 10);
          return (
            <g key={d.label}>
              {/* income bar */}
              <rect x={x} y={chartH - incH - 4} width={barW} height={incH} fill="var(--accent-green)" opacity={0.8} rx={3} />
              {/* expense bar */}
              <rect x={x + barW + gap} y={chartH - expH - 4} width={barW} height={expH} fill="var(--accent-rose)" opacity={0.8} rx={3} />
              {/* label */}
              <text x={x + barW} y={chartH + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="DM Sans">{d.label}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-green)', opacity: 0.8 }} />
          Income
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-rose)', opacity: 0.8 }} />
          Expenses
        </div>
      </div>
    </div>
  );
}

export default MiniBarChart;
