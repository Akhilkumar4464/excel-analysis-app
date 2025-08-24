import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { excelAPI } from '../src/services/api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

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

export default function EnhancedDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [excelData, setExcelData] = useState([]);
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const [selectedZAxis, setSelectedZAxis] = useState('');
  const [chartType, setChartType] = useState('pie');
  const [is3DMode, setIs3DMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fileId = location.state?.fileId;
        
        if (fileId) {
          const response = await excelAPI.getFile(fileId);
          setExcelData(response.data.data || []);
        } else {
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

  const processDataFor3D = () => {
    if (!excelData || excelData.length === 0) return [];
    
    return excelData.map((item, index) => ({
      x: parseFloat(item[selectedXAxis]) || index,
      y: parseFloat(item[selectedYAxis]) || 0,
      z: selectedZAxis ? parseFloat(item[selectedZAxis]) || 0 : 0,
      label: item[selectedXAxis] || `Item ${index + 1}`,
      color: `hsl(${index * 60}, 70%, 50%)`
    }));
  };

  const render3DChart = () => {
    const data = processDataFor3D();
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => Math.max(d.y, d.z)));

    return (
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: '#1e293b', height: '400px' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enablePan enableZoom enableRotate />
        
        {data.map((item, index) => (
          <group key={index} position={[index * 2 - data.length, 0, 0]}>
            <Box
              args={[0.8, item.y / maxValue * 5, 0.8]}
              position={[0, item.y / maxValue * 2.5, 0]}
            >
              <meshStandardMaterial color={item.color} />
            </Box>
            <Text
              position={[0, item.y / maxValue * 2.5 + 0.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {item.label.toString()}
            </Text>
          </group>
        ))}
        
        <gridHelper args={[20, 20]} />
        <axesHelper args={[5]} />
      </Canvas>
    );
  };

  const render2DChart = () => {
    const data = excelData;
    if (!data || data.length === 0) return null;

    const pieData = {
      labels: data.map(item => item[selectedXAxis]),
      datasets: [{
        label: selectedYAxis,
        data: data.map(item => parseFloat(item[selectedYAxis]) || 0),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 2,
      }]
    };

    const barData = {
      labels: data.map(item => item[selectedXAxis]),
      datasets: [{
        label: selectedYAxis,
        data: data.map(item => parseFloat(item[selectedYAxis]) || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    };

    switch (chartType) {
      case 'pie':
        return <Pie data={pieData} />;
      case 'bar':
        return <Bar data={barData} />;
      case 'line':
        return <Line data={barData} />;
      case 'doughnut':
        return <Doughnut data={pieData} />;
      default:
        return <Pie data={pieData} />;
    }
  };

  const getColumns = () => {
    if (!excelData || excelData.length === 0) return [];
    return Object.keys(excelData[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 text-white">
      <header className="bg-slate-900/90 backdrop-blur-md text-white py-5 px-10 shadow-lg flex items-center justify-between border-b border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="text-blue-400">📊</span>
          Enhanced Dashboard
        </h1>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white px-5 py-2 rounded-lg font-semibold shadow-md"
        >
          Back to Home
        </button>
      </header>

      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-blue-300 drop-shadow-lg">Enhanced Data Visualization</h2>

          {/* Controls */}
          <div className="mb-8 bg-slate-800/80 p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">X-Axis</label>
                <select
                  value={selectedXAxis}
                  onChange={(e) => setSelectedXAxis(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
                >
                  <option value="">Select X-axis</option>
                  {getColumns().map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Y-Axis</label>
                <select
                  value={selectedYAxis}
                  onChange={(e) => setSelectedYAxis(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
                >
                  <option value="">Select Y-axis</option>
                  {getColumns().map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Z-Axis</label>
                <select
                  value={selectedZAxis}
                  onChange={(e) => setSelectedZAxis(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
                >
                  <option value="">Select Z-axis</option>
                  {getColumns().map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-300">Chart Type</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={is3DMode}
                  onChange={(e) => setIs3DMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                />
                <span className="text-sm text-slate-300">3D Mode</span>
              </label>
            </div>
          </div>

          {/* Chart Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-300">
                {is3DMode ? '3D Visualization' : '2D Chart'}
              </h3>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              {is3DMode ? render3DChart() : render2DChart()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
