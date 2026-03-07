import React, { useEffect, useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const [role, setRole] = useState("admin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (role === "admin") {
            setEmail("admin@gmail.com");
            setPassword("123");
            return;
        }

        if (role === "staff") {
            setEmail("staff@gmail.com");
            setPassword("123");
        }
    }, [role]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Admin Login
        if (role === "admin") {
            if (email === "admin@gmail.com" && password === "123") {
                localStorage.setItem("token", "admin-token");
                localStorage.setItem("role", "admin");
                navigate("/");
                return;
            }
        }

        // Staff Dummy Login
        if (role === "staff") {
            if (email === "staff@gmail.com" && password === "123") {
                localStorage.setItem("token", "staff-token");
                localStorage.setItem("role", "staff");
                navigate("/");
                return;
            }
        }

        setError("Invalid credentials");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4] p-4">
            <div className="w-full mx-auto max-w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="h-2 bg-[#4285f4] w-full"></div>

                <div className="px-8 pt-10 pb-12 flex flex-col items-center">
                    <div className="w-20 h-12 bg-gray-300 rounded-sm mb-6"></div>

                    <h1 className="text-[#4285f4] text-2xl font-semibold mb-2">
                        Karyakarta Login
                    </h1>

                    <p className="text-gray-500 text-sm mb-8 text-center">
                        Enter your login credentials to access the portal.
                    </p>
                    <p className="text-xs text-gray-500 mb-4 text-center">
                        {role === "admin"
                            ? "Admin dummy: admin@gmail.com / 123"
                            : "Staff dummy: staff@gmail.com / 123"}
                    </p>

                    {error && (
                        <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-4">

                        {/* Role Dropdown */}
                        <div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Karyakarta ID / Email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="text-right">
                            <a href="#" className="text-[#4285f4] text-sm hover:underline">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#4285f4] text-white py-3 rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors shadow-md mt-4"
                        >
                            Login
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
