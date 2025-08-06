import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [excelData, setExcelData] = useState([]);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      alert("Please upload an XLSX file!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
      // Navigate to dashboard with data
      navigate("/dashboard", { state: { data: jsonData } });
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white py-4 px-8 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Excel Analyzer</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold mb-4">Upload Excel File</h2>

        <p className="text-center mb-4">Upload an XLSX file to analyze its data.</p>
        <div className="bg-slate-800 shadow-xl rounded-2xl p-8 w-full max-w-3xl mt-12 mb-12">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Upload Excel (.xlsx) File
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-600 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Preview Table */}
          {excelData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table-auto border w-full text-sm text-left text-white border-gray-600">
                <thead className="bg-slate-700">
                  <tr>
                    {Object.keys(excelData[0]).map((key) => (
                      <th className="border px-4 py-2" key={key}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-600">
                      {Object.values(row).map((cell, j) => (
                        <td className="border px-4 py-2" key={j}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">
                Showing first 5 rows
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-gray-400 text-center py-4">
        &copy; {new Date().getFullYear()} Excel Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
