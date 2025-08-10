import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../src/services/api';
import SuccessPopup from '../src/components/SuccessPopup';

export default function Login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });

            // Save token
            localStorage.setItem('token', response.data.token);

            // Show success popup
            setShowSuccess(true);

            // Delay navigation so popup is visible
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.status === 403) {
                setError(error.response.data.message || 'Access denied');
            } else if (error.response?.status === 400) {
                setError(error.response.data.message || 'Invalid credentials');
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 relative">
            {/* Success Popup */}
            {showSuccess && (
                <div className="absolute top-5 right-5 z-50">
                    <SuccessPopup message="Login successful! Redirecting..." />
                </div>
            )}

            <div className="w-full max-w-md">
                <form className="bg-white shadow-2xl rounded-2xl px-10 pt-10 pb-8" onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src="https://img.icons8.com/ios-filled/100/4e8cff/user-male-circle.png"
                            alt="User Icon"
                            className="w-20 h-20 mb-4"
                        />
                        <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome Back</h2>
                        <p className="text-gray-500 text-sm">Sign in to your account</p>
                        {error && <p className="text-red-600 mt-2">{error}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-8">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 rounded-lg shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm">
                        <a href="#" className="text-blue-600 hover:underline mb-2 sm:mb-0">
                            Forgot password?
                        </a>
                        <span className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                                Register here
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
