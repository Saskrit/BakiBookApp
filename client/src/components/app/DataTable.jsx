import { Link } from 'react-router-dom';

function DataTable({ columns, rows, emptyMessage = 'No records found.' }) {
  if (!rows?.length) {
    return <div className="app-empty">{emptyMessage}</div>;
  }

  return (
    <div className="app-table-wrap">
      <table className="app-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.key}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ActionLink({ to, children, variant = 'primary' }) {
  return (
    <Link to={to} className={`app-link-btn app-link-btn--${variant}`}>
      {children}
    </Link>
  );
}

export function ActionIcon({ to, label, children }) {
  return (
    <Link to={to} className="app-action-icon" aria-label={label} title={label}>
      {children}
    </Link>
  );
}

export default DataTable;
