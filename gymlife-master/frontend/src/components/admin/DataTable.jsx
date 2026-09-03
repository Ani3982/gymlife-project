import React, { useState, useMemo } from 'react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  onFilterChange = null,
  currentFilter = 'ALL',
  filterLabel = 'Status',
  actions = null,
  emptyMessage = 'No records found.',
  defaultSortField = '',
  defaultSortAsc = true,
  itemsPerPage = 10,
  onRowClick = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortAsc, setSortAsc] = useState(defaultSortAsc);
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return false;
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="gymlife-datatable-card">
      {/* Control Bar: Search, Filters, Quick Action Buttons */}
      <div className="datatable-controls-bar">
        <div className="datatable-search-box">
          <i className="fa fa-search search-icon"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-search-input"
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setSearchTerm('')}
            >
              <i className="fa fa-times"></i>
            </button>
          )}
        </div>

        <div className="datatable-actions-group">
          {filterOptions && filterOptions.length > 0 && onFilterChange && (
            <div className="datatable-filter-wrapper">
              <span className="filter-label">{filterLabel}:</span>
              <select
                value={currentFilter}
                onChange={(e) => {
                  onFilterChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="admin-filter-select"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {actions && <div className="custom-actions-slot">{actions}</div>}
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-table-responsive">
        <table className="gymlife-custom-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'sortable-th' : ''}
                  style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}
                >
                  <div className="th-content" style={{ justifyContent: col.align === 'center' ? 'center' : (col.align === 'right' ? 'flex-end' : 'flex-start') }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="sort-indicator">
                        {sortField === col.key ? (
                          sortAsc ? <i className="fa fa-sort-asc active"></i> : <i className="fa fa-sort-desc active"></i>
                        ) : (
                          <i className="fa fa-sort text-muted"></i>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      <div className="skeleton-bar"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table-cell">
                  <div className="admin-empty-state">
                    <i className="fa fa-folder-open-o empty-icon"></i>
                    <h4>{emptyMessage}</h4>
                    <p>Try adjusting your search query or filter options.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, cIdx) => (
                    <td 
                      key={cIdx} 
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] !== undefined ? String(row[col.key]) : '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sortedData.length > 0 && (
        <div className="datatable-pagination-footer">
          <div className="pagination-info">
            Showing <strong>{Math.min(sortedData.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to{' '}
            <strong>{Math.min(sortedData.length, currentPage * itemsPerPage)}</strong> of{' '}
            <strong>{sortedData.length}</strong> records
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="page-btn"
            >
              <i className="fa fa-chevron-left"></i> Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Display page buttons with ellipsis window
              if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="page-btn"
            >
              Next <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
