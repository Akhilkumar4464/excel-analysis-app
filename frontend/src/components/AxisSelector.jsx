import React from 'react';

const AxisSelector = ({ 
  columns, 
  selectedX, 
  selectedY, 
  selectedZ, 
  onXChange, 
  onYChange, 
  onZChange,
  showZ = true,
  disabled = false 
}) => {
  if (!columns || columns.length === 0) {
    return (
      <div className="text-slate-400 text-sm">
        No columns available for selection
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          X-Axis
        </label>
        <select
          value={selectedX}
          onChange={(e) => onXChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">Select X-axis</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Y-Axis
        </label>
        <select
          value={selectedY}
          onChange={(e) => onYChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">Select Y-axis</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {showZ && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Z-Axis (Optional)
          </label>
          <select
            value={selectedZ}
            onChange={(e) => onZChange(e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            <option value="">Select Z-axis</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default AxisSelector;
