import React, { useRef, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ThreeDChart = ({ 
  data, 
  xAxis, 
  yAxis, 
  zAxis, 
  chartType = 'bar3d',
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
}) => {
  console.log('ThreeDChart received data:', data);
  console.log('ThreeDChart received xAxis:', xAxis);
  console.log('ThreeDChart received yAxis:', yAxis);
  console.log('ThreeDChart received zAxis:', zAxis);
  
  if (!data || !xAxis || !yAxis || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
        <p className="text-slate-400">No data available for 3D visualization</p>
      </div>
    );
  }

  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      x: parseFloat(item[xAxis]) || index,
      y: parseFloat(item[yAxis]) || 0,
      z: zAxis ? parseFloat(item[zAxis]) || 0 : 0,
      label: item[xAxis] || `Item ${index + 1}`,
      color: colors[index % colors.length]
    }));
  }, [data, xAxis, yAxis, zAxis, colors]);

  const maxValue = useMemo(() => {
    return Math.max(...processedData.map(d => Math.max(d.y, d.z)));
  }, [processedData]);

  const normalizedData = useMemo(() => {
    return processedData.map(item => ({
      ...item,
      y: item.y / maxValue * 5,
      z: item.z / maxValue * 5
    }));
  }, [processedData, maxValue]);

  const render3DBarChart = () => {
    return normalizedData.map((item, index) => (
      <group key={index} position={[index * 2 - normalizedData.length, 0, 0]}>
        <Box
          args={[0.8, item.y, 0.8]}
          position={[0, item.y / 2, 0]}
        >
          <meshStandardMaterial color={item.color} />
        </Box>
        <Text
          position={[0, item.y + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {item.label.toString()}
        </Text>
      </group>
    ));
  };

  const render3DScatterPlot = () => {
    return normalizedData.map((item, index) => (
      <group key={index}>
        <Sphere
          args={[0.2, 16, 16]}
          position={[item.x, item.y, item.z]}
        >
          <meshStandardMaterial color={item.color} />
        </Sphere>
        <Text
          position={[item.x, item.y + 0.5, item.z]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {item.label.toString()}
        </Text>
      </group>
    ));
  };

  const render3DSurfacePlot = () => {
    // Create a grid of points for the surface
    const gridSize = Math.ceil(Math.sqrt(normalizedData.length));
    const surfaceData = [];
    
    // Create a 2D grid from the data
    for (let i = 0; i < gridSize; i++) {
      surfaceData[i] = [];
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        if (index < normalizedData.length) {
          surfaceData[i][j] = normalizedData[index].y;
        } else {
          surfaceData[i][j] = 0;
        }
      }
    }

    // Create geometry for the surface
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridSize - 1, gridSize - 1);
    
    // Set z-coordinates based on data values
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const vertexIndex = (i * gridSize + j) * 3;
        vertices[vertexIndex + 2] = surfaceData[i][j] || 0;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // Create color gradient based on height
    const colors = [];
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const z = geometry.attributes.position.array[i * 3 + 2];
      const normalizedZ = z / 5; // Normalize to 0-1 range
      
      // Create a color gradient from blue (low) to red (high)
      const color = new THREE.Color();
      color.setHSL(0.7 - normalizedZ * 0.7, 0.8, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return (
      <group position={[-gridSize/2, -2.5, -gridSize/2]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial 
            vertexColors 
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Add data points as markers */}
        {normalizedData.slice(0, gridSize * gridSize).map((item, index) => (
          <Sphere
            key={index}
            args={[0.1, 8, 8]}
            position={[
              Math.floor(index / gridSize) - gridSize/2 + 0.5,
              item.y,
              (index % gridSize) - gridSize/2 + 0.5
            ]}
          >
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </Sphere>
        ))}
      </group>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar3d':
        return render3DBarChart();
      case 'scatter3d':
        return render3DScatterPlot();
      case 'surface3d':
        return render3DSurfacePlot();
      default:
        return render3DBarChart();
    }
  };

  const downloadAsPNG = async () => {
    try {
      console.log('Starting PNG download process...');
      const canvasElement = document.querySelector('.three-d-chart canvas');
      console.log('Canvas element found:', !!canvasElement);
      if (!canvasElement) {
        console.error('No canvas element found for download');
        return;
      }

      // Create a temporary container to capture the canvas
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.appendChild(canvasElement.cloneNode(true));
      document.body.appendChild(tempContainer);

      console.log('Capturing canvas with html2canvas...');
      const canvas = await html2canvas(tempContainer);
      console.log('Canvas captured successfully:', !!canvas);
      
      document.body.removeChild(tempContainer);

      const dataURL = canvas.toDataURL('image/png');
      console.log('Data URL generated:', dataURL.substring(0, 50) + '...');

      const link = document.createElement('a');
      link.download = `3d-chart-${chartType}-${new Date().getTime()}.png`;
      link.href = dataURL;
      link.click();
      
      console.log('Download initiated successfully');
    } catch (error) {
      console.error('Error downloading PNG:', error);
    }
  };

  const downloadAsPDF = async () => {
    try {
      console.log('Starting PDF download process...');
      const canvasElement = document.querySelector('.three-d-chart canvas');
      console.log('Canvas element found:', !!canvasElement);
      if (!canvasElement) {
        console.error('No canvas element found for download');
        return;
      }

      // Create a temporary container to capture the canvas
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.appendChild(canvasElement.cloneNode(true));
      document.body.appendChild(tempContainer);

      console.log('Capturing canvas with html2canvas...');
      const canvas = await html2canvas(tempContainer);
      console.log('Canvas captured successfully:', !!canvas);
      
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      console.log('Image data generated:', imgData.substring(0, 50) + '...');

      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('Adding image to PDF...');
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`3d-chart-${chartType}-${new Date().getTime()}.pdf`);
      
      console.log('PDF download initiated successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="relative">
      {/* Download buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={downloadAsPNG}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          title="Download as PNG"
        >
          📥 PNG
        </button>
        <button
          onClick={downloadAsPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          title="Download as PDF"
        >
          📥 PDF
        </button>
      </div>

      <div className="w-full h-96 bg-slate-800 rounded-lg overflow-hidden three-d-chart">
        <Canvas
          camera={{ position: [10, 10, 10], fov: 50 }}
          style={{ background: '#1e293b' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <pointLight position={[-10, -10, -10]} />
          
          {renderChart()}
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
          
          {/* Grid */}
          <gridHelper args={[20, 20, '#374151', '#374151']} />
          
          {/* Axes */}
          <axesHelper args={[5]} />
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDChart;
