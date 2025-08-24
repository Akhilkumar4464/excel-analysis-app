import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superadminAPI } from '../src/services/api';

function AdminDashboard() {
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

    const fetchPendingAdmins = async () => {
        try {
            const response = await superadminAPI.getPendingAdmins();
            setPendingAdmins(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch pending admin registrations');
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await superadminAPI.approveAdmin(userId);
            fetchPendingAdmins();
        } catch (err) {
            setError('Failed to approve admin registration');
        }
    };

    const handleReject = async (userId) => {
        try {
            await superadminAPI.rejectAdmin(userId);
            fetchPendingAdmins();
        } catch (err) {
            setError('Failed to reject admin registration');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Admin Registrations</h2>
                    
                    {pendingAdmins.length === 0 ? (
                        <p className="text-gray-600">No pending admin registrations.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requested At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingAdmins.map((admin) => (
                                        <tr key={admin._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {admin.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {admin.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(admin.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleApprove(admin._id)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(admin._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
