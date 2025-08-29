import React, { useState, useEffect } from 'react';
import { authAPI } from '../src/services/api';

function SuperAdminDashboard() {
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);
    const [promotableUsers, setPromotableUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchData();
        fetchPromotableUsers();
    }, []);

    const fetchPromotableUsers = async () => {
        try {
            const response = await authAPI.getPromotableUsers();
            setPromotableUsers(response.data);
        } catch (error) {
            setError('Failed to fetch promotable users');
        }
    };

    const fetchData = async () => {
        try {
            const [pendingResponse, adminsResponse, statsResponse] = await Promise.all([
                authAPI.getPendingAdmins(),
                authAPI.getAllAdmins(),
                authAPI.getSuperadminStats()
            ]);
            
            setPendingAdmins(pendingResponse.data);
            setAllAdmins(adminsResponse.data);
            setStats(statsResponse.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch data' , error);
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await authAPI.approveAdmin(userId);
            fetchData();
        } catch (error) {
            setError('Failed to approve admin registration' , error);
        }
    };

    const handleReject = async (userId) => {
        try {
            await authAPI.rejectAdmin(userId);
            fetchData();
        } catch (error) {
            setError('Failed to reject admin registration' , error);
        }
    };

    const handleRevoke = async (userId) => {
        try {
            await authAPI.revokeAdmin(userId);
            fetchData();
        } catch (error) {
            setError('Failed to revoke admin privileges' , error);
        }
    };

    const handlePromote = async (userId) => {
        try {
            await authAPI.promoteToAdmin(userId);
            fetchPromotableUsers();
            fetchData(); // Refresh all data
        } catch (error) {
            setError('Failed to promote user to admin');
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-900">Total Users</h3>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-900">Super Admins</h3>
                                <p className="text-2xl font-bold text-green-600">{stats.superadmins}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-purple-900">Admins</h3>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-yellow-900">Pending</h3>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAdmins}</p>
                            </div>
                        </div>
                    )}

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'pending'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Pending Requests ({pendingAdmins.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('admins')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'admins'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                All Admins ({allAdmins.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('promote')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'promote'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Promote Users ({promotableUsers.length})
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'pending' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Admin Requests</h2>
                            
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
                    )}

                    {activeTab === 'admins' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">All Admins</h2>
                            
                            {allAdmins.length === 0 ? (
                                <p className="text-gray-600">No admins found.</p>
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
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created At
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {allAdmins.map((admin) => (
                                                <tr key={admin._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {admin.username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {admin.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            admin.role === 'superadmin' 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {admin.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(admin.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {admin.role !== 'superadmin' && (
                                                            <button
                                                                onClick={() => handleRevoke(admin._id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Revoke
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'promote' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Promote Users to Admin</h2>
                            
                            {promotableUsers.length === 0 ? (
                                <p className="text-gray-600">No users available for promotion.</p>
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
                                                    Created At
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {promotableUsers.map((user) => (
                                                <tr key={user._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handlePromote(user._id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Promote to Admin
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SuperAdminDashboard;
