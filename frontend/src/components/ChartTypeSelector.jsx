import React from 'react';

const ChartTypeSelector = ({ 
  selectedType, 
  onTypeChange, 
  is3D = false, 
  on3DToggle 
}) => {
  const chartTypes2D = [
    { value: 'pie', label: 'Pie Chart', icon: '🥧' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'doughnut', label: 'Doughnut Chart', icon: '🍩' }
  ];

  const chartTypes3D = [
    { value: 'bar3d', label: '3D Bar Chart', icon: '🧊' },
    { value: 'scatter3d', label: '3D Scatter Plot', icon: '⚪' },
    { value: 'surface3d', label: '3D Surface Plot', icon: '🌊' }
  ];

  const chartTypes = is3D ? chartTypes3D : chartTypes2D;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-300">Chart Type</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={is3D}
            onChange={(e) => on3DToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">3D Mode</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedType === type.value
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">{type.icon}</div>
            <div className="text-xs font-medium">{type.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
