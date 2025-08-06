import React from 'react';

function Register() {
    const [name , setName] = React.useState("");
    const [email , setEmail] = React.useState("");
    const [password , setPassword] = React.useState("");
     
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md">
                <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Register Here</h1>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={e =>setName(e.target.value)}
                            placeholder="Enter Your Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e =>setEmail(e.target.value)}
                            placeholder="Enter Your Email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e =>setPassword(e.target.value)}
                            placeholder="Enter Your Password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;