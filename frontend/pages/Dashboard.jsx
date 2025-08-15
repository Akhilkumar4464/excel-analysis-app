import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { excelAPI } from '../src/services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [excelData, setExcelData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [chartType, setChartType] = useState('pie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fileId = location.state?.fileId;
        
        if (fileId) {
          // Fetch specific file data
          const response = await excelAPI.getFile(fileId);
          setExcelData(response.data.data || []);
        } else {
          // Fetch all files or use sample data
          setExcelData([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [location.state?.fileId]);

  const getNumericColumns = () => {
    if (excelData.length === 0) return [];
    const firstRow = excelData[0];
    return Object.keys(firstRow).filter(key =>
      typeof firstRow[key] === 'number' || !isNaN(parseFloat(firstRow[key]))
    );
  };

  const getCategoricalColumns = () => {
    if (excelData.length === 0) return [];
    const firstRow = excelData[0];
    return Object.keys(firstRow).filter(key =>
      typeof firstRow[key] === 'string'
    );
  };

  const generatePieChartData = () => {
    if (!selectedColumn || excelData.length === 0) return null;

    const counts = {};
    excelData.forEach(row => {
      const value = row[selectedColumn];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: selectedColumn,
          data: Object.values(counts),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const generateBarChartData = () => {
    if (!selectedColumn || excelData.length === 0) return null;

    const numericColumns = getNumericColumns();
    if (numericColumns.length === 0) return null;

    const labels = excelData.map(row => row[selectedColumn] || `Row ${excelData.indexOf(row) + 1}`);
    const datasets = numericColumns.map((col, index) => ({
      label: col,
      data: excelData.map(row => parseFloat(row[col]) || 0),
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
    }));

    return {
      labels,
      datasets,
    };
  };

  const generateLineChartData = () => {
    if (!selectedColumn || excelData.length === 0) return null;

    const numericColumns = getNumericColumns();
    if (numericColumns.length === 0) return null;

    const labels = excelData.map(row => row[selectedColumn] || `Row ${excelData.indexOf(row) + 1}`);
    const datasets = numericColumns.slice(0, 3).map((col, index) => ({
      label: col,
      data: excelData.map(row => parseFloat(row[col]) || 0),
      borderColor: `hsl(${index * 120}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 120}, 70%, 50%, 0.2)`,
      tension: 0.4,
    }));

    return {
      labels,
      datasets,
    };
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-red-500">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Go to Home
          </button>
        </div>
      );
    }

    if (excelData.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No data available. Please upload an Excel file first.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Go to Home
          </button>
        </div>
      );
    }

    const pieData = generatePieChartData();
    const barData = generateBarChartData();
    const lineData = generateLineChartData();

    switch (chartType) {
      case 'pie':
        return pieData ? (
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        ) : null;
      case 'bar':
        return barData ? (
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        ) : null;
      case 'line':
        return lineData ? (
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        ) : null;
      case 'doughnut':
        return pieData ? (
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  const categoricalColumns = getCategoricalColumns();
  const numericColumns = getNumericColumns();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 text-white py-4 px-8 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Home
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Data Visualization</h2>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <label className="block">
              Select Column:
              <select
                className="ml-2 p-2 rounded bg-slate-700 text-white"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">-- Select --</option>
                {[...new Set(categoricalColumns.concat(numericColumns))].map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Select Chart Type:
              <select
                className="ml-2 p-2 rounded bg-slate-700 text-white"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </label>
          </div>

          {/* Chart */}
          {renderChart()}
        </div>
      </main>
    </div>
  );
}
