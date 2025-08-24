import React, { useEffect, useState, useRef } from 'react';
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
import ThreeDChart from '../src/components/ThreeDChart';
import AxisSelector from '../src/components/AxisSelector';
import ChartTypeSelector from '../src/components/ChartTypeSelector';
import ChartDownload from '../src/components/ChartDownload';

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
  const [is3D, setIs3D] = useState(false);
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const [selectedZAxis, setSelectedZAxis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Refs for 2D chart containers
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  useEffect(() => {
  const fetchData = async () => {
    console.log('Fetching data...');
      try {
        setLoading(true);
        const fileId = location.state?.fileId;
        
        if (fileId) {
          // Fetch specific file data
          const response = await excelAPI.getFile(fileId);
          console.log('Fetched data:', response.data.data);
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

    // Handle 3D charts
    if (is3D) {
      return (
        <div className="space-y-6">
          <div className="bg-slate-800/80 p-6 rounded-xl shadow-lg">
            <AxisSelector
              columns={[...new Set(getCategoricalColumns().concat(getNumericColumns()))]}
              selectedX={selectedXAxis}
              selectedY={selectedYAxis}
              selectedZ={selectedZAxis}
              onXChange={setSelectedXAxis}
              onYChange={setSelectedYAxis}
              onZChange={setSelectedZAxis}
              showZ={chartType === 'scatter3d'}
              disabled={loading}
            />
          </div>
          
          <ThreeDChart
            data={excelData}
            xAxis={selectedXAxis}
            yAxis={selectedYAxis}
            zAxis={selectedZAxis}
            chartType={chartType}
          />
        </div>
      );
    }

    // Handle 2D charts
    const pieData = generatePieChartData();
    const barData = generateBarChartData();
    const lineData = generateLineChartData();

    switch (chartType) {
      case 'pie':
        return pieData ? (
          <div className="relative bg-white p-6 rounded-lg shadow-lg h-96">
            <ChartDownload chartRef={pieChartRef} chartType="pie" chartData={pieData} />
            <div ref={pieChartRef}>
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        ) : null;
      case 'bar':
        return barData ? (
          <div className="relative bg-white p-6 rounded-lg shadow-lg h-96">
            <ChartDownload chartRef={barChartRef} chartType="bar" chartData={barData} />
            <div ref={barChartRef}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        ) : null;
      case 'line':
        return lineData ? (
          <div className="relative bg-white p-6 rounded-lg shadow-lg h-96">
            <ChartDownload chartRef={lineChartRef} chartType="line" chartData={lineData} />
            <div ref={lineChartRef}>
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        ) : null;
      case 'doughnut':
        return pieData ? (
          <div className="relative bg-white p-6 rounded-lg shadow-lg h-96">
            <ChartDownload chartRef={doughnutChartRef} chartType="doughnut" chartData={pieData} />
            <div ref={doughnutChartRef}>
              <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  const categoricalColumns = getCategoricalColumns();
  const numericColumns = getNumericColumns();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-md text-white py-5 px-10 shadow-lg flex items-center justify-between border-b border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="text-blue-400">📊</span>
          Dashboard
        </h1>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white px-5 py-2 rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Back to Home
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-blue-300 drop-shadow-lg">Data Visualization</h2>

          {/* Controls */}
          <div className="mb-8 space-y-6">
            {/* Chart Type Selector */}
            <div className="bg-slate-800/80 p-6 rounded-xl shadow-lg">
              <ChartTypeSelector
                selectedType={chartType}
                onTypeChange={setChartType}
                is3D={is3D}
                on3DToggle={setIs3D}
              />
            </div>

            {/* Column Selection */}
            {!is3D && (
              <div className="flex flex-wrap gap-6 items-center bg-slate-800/80 p-6 rounded-xl shadow-lg">
                <label className="block font-medium text-lg">
                  <span className="mr-2 text-slate-300">Select Column:</span>
                  <select
                    className="p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="transition-all duration-300">
            {renderChart()}
          </div>
        </div>
      </main>
    </div>
  );
}
