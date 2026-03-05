import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isExpired = queryParams.get('expired') === 'true';
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // 1. Define Dummy Data
    const DUMMY_USERS = [
        {
            identifier: 'admin@gmail.com',
            password: '123',
            user: { id: 1, name: 'Admin User', role: 'admin', email: 'admin@gmail.com' },
            token: 'dummy-token-admin'
        },
        {
            identifier: 'tms@gmail.com',
            password: '123',
            user: { id: 2, name: 'Staff Member', role: 'staff', email: 'tms@gmail.com' },
            token: 'dummy-token-staff'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const cleanIdentifier = identifier.trim();

        if (!cleanIdentifier || !password) {
            setError('Please enter both Email/ID and Password');
            return;
        }

        setLoading(true);

        // 2. Logic: Check Dummy Data First
        const dummyMatch = DUMMY_USERS.find(
            u => u.identifier === cleanIdentifier && u.password === password
        );

        if (dummyMatch) {
            // Simulate a short delay for realism
            setTimeout(() => {
                login({ ...dummyMatch.user, token: dummyMatch.token });
                setLoading(false);
                navigate('/');
            }, 800);
            return;
        }

        // 3. Logic: Fallback to Live API
        try {
            const response = await api.post('/auth/login', {
                identifier: cleanIdentifier,
                password
            });

            if (response.data.firstLogin) {
                navigate('/update-password', {
                    state: { userId: response.data.userId, table: response.data.table }
                });
            } else {
                login({
                    ...response.data.user,
                    token: response.data.token
                });
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email/ID or password');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4] p-4">
            {/* Main Card */}
            <div className="w-full max-auto max-w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden">

                {/* Top Blue Banner */}
                <div className="h-2 bg-[#4285f4] w-full"></div>

                <div className="px-8 pt-10 pb-12 flex flex-col items-center">

                    {/* Logo Placeholder */}
                    <div className="w-20 h-12 bg-gray-300 rounded-sm mb-6"></div>

                    <h1 className="text-[#4285f4] text-2xl font-semibold mb-2">
                        Karyakarta Login
                    </h1>

                    <p className="text-gray-500 text-sm mb-8 text-center">
                        Enter your login credentials to access the portal.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">

                        {/* Staff ID / Email Input */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="Staff ID/ Email"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-gray-700 placeholder-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Forget Password */}
                        <div className="text-right">
                            <a href="#" className="text-[#4285f4] text-sm hover:underline">
                                Forget Password?
                            </a>
                        </div>

                        {/* Login Button */}
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