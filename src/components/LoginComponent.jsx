import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaUser,
    FaLock,
    FaEnvelope,
    FaExclamationTriangle,
    FaCheckCircle,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import {
    IoMusicalNotes,
    IoLogIn,
    IoPersonAdd,
    IoShieldCheckmark
} from 'react-icons/io5';

const LoginComponent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    });

    const API_BASE_URL = "https://musicplayer-rc7u.onrender.com";

    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Create axios instance with base configuration
    const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    });

    // Add response interceptor for error handling
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error);
                
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout. Please check your internet connection.');
                }
                
                if (!error.response) {
                    throw new Error('Network error. Please check your connection.');
                }
                
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // Validation functions
    const validateUsername = (username) => {
        if (!username.trim()) {
            return 'Username is required';
        }
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (username.length > 20) {
            return 'Username must not exceed 20 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validatePassword = (password, isRegistration = false) => {
        if (!password) {
            return 'Password is required';
        }
        if (isRegistration) {
            if (password.length < 6) {
                return 'Password must be at least 6 characters';
            }
            if (password.length > 50) {
                return 'Password must not exceed 50 characters';
            }
            if (!/(?=.*[a-z])/.test(password)) {
                return 'Password must contain at least one lowercase letter';
            }
            if (!/(?=.*[A-Z])/.test(password)) {
                return 'Password must contain at least one uppercase letter';
            }
            if (!/(?=.*\d)/.test(password)) {
                return 'Password must contain at least one number';
            }
        }
        return '';
    };

    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'username':
                error = validateUsername(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value, isRegister);
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        const value = isRegister ? registerForm[name] : loginForm[name];
        const error = validateField(name, value);
        
        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, text: '', color: '' };
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) strength++;
        if (/(?=.*\d)/.test(password)) strength++;
        if (/(?=.*[@$!%*?&])/.test(password)) strength++;

        const levels = [
            { strength: 1, text: 'Weak', color: 'bg-red-500' },
            { strength: 2, text: 'Fair', color: 'bg-orange-500' },
            { strength: 3, text: 'Good', color: 'bg-yellow-500' },
            { strength: 4, text: 'Strong', color: 'bg-lime-500' },
            { strength: 5, text: 'Very Strong', color: 'bg-green-500' }
        ];

        return levels[strength - 1] || levels[0];
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate all fields
        const usernameError = validateUsername(loginForm.username);
        const passwordError = validatePassword(loginForm.password, false);

        if (usernameError || passwordError) {
            setFieldErrors({
                username: usernameError,
                password: passwordError
            });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/auth/login', loginForm);
            const data = response.data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
          
            navigate('/music');

        } catch (err) {
            console.error('Login error:', err);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (err.response) {
                const status = err.response.status;
                switch (status) {
                    case 400:
                        errorMessage = 'Invalid request. Please check your input.';
                        break;
                    case 401:
                        errorMessage = 'Invalid username or password.';
                        break;
                    case 404:
                        errorMessage = 'Login service unavailable.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = err.response.data?.message || `Login failed (${status})`;
                }
            } else if (err.request) {
                errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else {
                errorMessage = err.message || 'An unexpected error occurred.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate all fields
        const usernameError = validateUsername(registerForm.username);
        const emailError = validateEmail(registerForm.email);
        const passwordError = validatePassword(registerForm.password, true);

        if (usernameError || emailError || passwordError) {
            setFieldErrors({
                username: usernameError,
                email: emailError,
                password: passwordError
            });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/auth/register', registerForm);
            
            console.log('Registration successful:', response.data);       
            setError('');
            setIsRegister(false);
            setRegisterForm({ username: '', email: '', password: '' });
            setFieldErrors({});
            setTouchedFields({});
            setError('Registration successful! Please login with your credentials.');

        } catch (err) {
            console.error('Registration error:', err);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (err.response) {
                const status = err.response.status;
                switch (status) {
                    case 400:
                        errorMessage = err.response.data?.message || 'Invalid registration data.';
                        break;
                    case 409:
                        errorMessage = 'Username or email already exists.';
                        break;
                    case 422:
                        errorMessage = 'Validation failed. Please check your input.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = err.response.data?.message || `Registration failed (${status})`;
                }
            } else if (err.request) {
                errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else {
                errorMessage = err.message || 'An unexpected error occurred.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (isRegister) {
            setRegisterForm(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setLoginForm(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Real-time validation if field was touched
        if (touchedFields[name]) {
            const error = validateField(name, value);
            setFieldErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
        
        if (error) {
            setError('');
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setLoginForm({ username: '', password: '' });
        setRegisterForm({ username: '', email: '', password: '' });
        setFieldErrors({});
        setTouchedFields({});
        setShowPassword(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/music');
        }
    }, [navigate]);

    const currentForm = isRegister ? registerForm : loginForm;
    const passwordStrength = isRegister ? getPasswordStrength(registerForm.password) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl transform hover:scale-[1.01] transition-all duration-500">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl transform group-hover:rotate-6 transition-transform duration-300">
                                    <IoMusicalNotes className="text-4xl text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                            Beat Buff Music 
                        </h2>
                        <p className="text-gray-400">
                            {isRegister ? 'Create your account' : 'Welcome back to your music'}
                        </p>
                    </div>

                    {/* Error/Success Message */}
                    {error && (
                        <div className={`mb-6 p-4 ${error.includes('successful')
                                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                                : 'bg-red-500/10 border border-red-500/50 text-red-400'
                            } rounded-xl text-sm flex items-start space-x-3 animate-fadeIn`}>
                            {error.includes('successful') ? (
                                <FaCheckCircle className="mt-0.5 flex-shrink-0" />
                            ) : (
                                <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                            )}
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
                        <div className="space-y-5">
                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 text-left mb-2">
                                    Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className={`transition-colors duration-300 ${
                                            touchedFields.username && !fieldErrors.username
                                                ? 'text-green-400'
                                                : fieldErrors.username
                                                ? 'text-red-400'
                                                : 'text-gray-500'
                                        }`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={currentForm.username}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter your username"
                                        className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 border ${
                                            touchedFields.username && !fieldErrors.username
                                                ? 'border-green-500/50 focus:border-green-500'
                                                : fieldErrors.username
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-600 focus:border-purple-500'
                                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                                            touchedFields.username && !fieldErrors.username
                                                ? 'focus:ring-green-500/20'
                                                : fieldErrors.username
                                                ? 'focus:ring-red-500/20'
                                                : 'focus:ring-purple-500/20'
                                        } transition-all duration-300`}
                                        disabled={loading}
                                    />
                                    {touchedFields.username && !fieldErrors.username && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <FaCheckCircle className="text-green-400" />
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.username && touchedFields.username && (
                                    <p className="mt-2 text-xs text-red-400 flex items-center space-x-1">
                                        <FaExclamationTriangle />
                                        <span>{fieldErrors.username}</span>
                                    </p>
                                )}
                            </div>

                            {/* Email Field (Register only) */}
                            {isRegister && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 text-left mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className={`transition-colors duration-300 ${
                                                touchedFields.email && !fieldErrors.email
                                                    ? 'text-green-400'
                                                    : fieldErrors.email
                                                    ? 'text-red-400'
                                                    : 'text-gray-500'
                                            }`} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={registerForm.email}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter your email"
                                            className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 border ${
                                                touchedFields.email && !fieldErrors.email
                                                    ? 'border-green-500/50 focus:border-green-500'
                                                    : fieldErrors.email
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : 'border-gray-600 focus:border-purple-500'
                                            } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                                                touchedFields.email && !fieldErrors.email
                                                    ? 'focus:ring-green-500/20'
                                                    : fieldErrors.email
                                                    ? 'focus:ring-red-500/20'
                                                    : 'focus:ring-purple-500/20'
                                            } transition-all duration-300`}
                                            disabled={loading}
                                        />
                                        {touchedFields.email && !fieldErrors.email && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <FaCheckCircle className="text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                    {fieldErrors.email && touchedFields.email && (
                                        <p className="mt-2 text-xs text-red-400 flex items-center space-x-1">
                                            <FaExclamationTriangle />
                                            <span>{fieldErrors.email}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className={`transition-colors duration-300 ${
                                            touchedFields.password && !fieldErrors.password
                                                ? 'text-green-400'
                                                : fieldErrors.password
                                                ? 'text-red-400'
                                                : 'text-gray-500'
                                        }`} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={currentForm.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder={isRegister ? "Create a strong password" : "Enter your password"}
                                        className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 border ${
                                            touchedFields.password && !fieldErrors.password
                                                ? 'border-green-500/50 focus:border-green-500'
                                                : fieldErrors.password
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-600 focus:border-purple-500'
                                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                                            touchedFields.password && !fieldErrors.password
                                                ? 'focus:ring-green-500/20'
                                                : fieldErrors.password
                                                ? 'focus:ring-red-500/20'
                                                : 'focus:ring-purple-500/20'
                                        } transition-all duration-300`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                
                                {/* Password Strength Indicator */}
                                {isRegister && registerForm.password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                        level <= passwordStrength?.strength
                                                            ? passwordStrength?.color
                                                            : 'bg-gray-700'
                                                    }`}
                                                ></div>
                                            ))}
                                        </div>
                                        {passwordStrength && (
                                            <p className="text-xs text-gray-400">
                                                Password strength: <span className={`font-medium ${
                                                    passwordStrength.strength >= 4 ? 'text-green-400' :
                                                    passwordStrength.strength >= 3 ? 'text-yellow-400' :
                                                    'text-orange-400'
                                                }`}>{passwordStrength.text}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                {fieldErrors.password && touchedFields.password && (
                                    <p className="mt-2 text-xs text-red-400 flex items-center space-x-1">
                                        <FaExclamationTriangle />
                                        <span>{fieldErrors.password}</span>
                                    </p>
                                )}
                                
                                {isRegister && !fieldErrors.password && (
                                    <div className="mt-3 space-y-1.5 text-xs text-gray-400">
                                        <p className="font-medium text-gray-300 flex items-center space-x-1">
                                            <IoShieldCheckmark className="text-purple-400" />
                                            <span>Password must contain:</span>
                                        </p>
                                        <ul className="space-y-1 ml-5">
                                            <li className={registerForm.password.length >= 6 ? 'text-green-400' : ''}>
                                                • At least 6 characters
                                            </li>
                                            <li className={/(?=.*[a-z])/.test(registerForm.password) ? 'text-green-400' : ''}>
                                                • One lowercase letter
                                            </li>
                                            <li className={/(?=.*[A-Z])/.test(registerForm.password) ? 'text-green-400' : ''}>
                                                • One uppercase letter
                                            </li>
                                            <li className={/(?=.*\d)/.test(registerForm.password) ? 'text-green-400' : ''}>
                                                • One number
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center space-x-2">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>{isRegister ? 'Creating Account...' : 'Signing in...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {isRegister ? <IoPersonAdd className="text-xl" /> : <IoLogIn className="text-xl" />}
                                        <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Toggle between Login and Register */}
                    <div className="mt-8 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-900/80 text-gray-400">or</span>
                            </div>
                        </div>
                        <button
                            onClick={toggleMode}
                            disabled={loading}
                            className="mt-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all duration-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegister
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Create one now"
                            }
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default LoginComponent;