import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { getApiErrorMessage } from '../utils/errors';
import { getStoredToken, setAuthSession } from '../utils/storage';
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

export default function LoginPage() {
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

    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: ''
    });

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
            { strength: 1, text: 'Weak', color: 'bg-danger' },
            { strength: 2, text: 'Fair', color: 'bg-warning' },
            { strength: 3, text: 'Good', color: 'bg-cyan' },
            { strength: 4, text: 'Strong', color: 'bg-accent-soft' },
            { strength: 5, text: 'Very Strong', color: 'bg-success' },
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
            const response = await apiClient.post('/api/auth/login', loginForm);
            const data = response.data;

            if (!data?.token) {
                setError('Login failed. No authentication token received.');
                return;
            }

            setAuthSession(data.token, data);
            navigate('/music');

        } catch (err) {
            setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
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
            await apiClient.post('/api/auth/register', registerForm);

            setIsRegister(false);
            setRegisterForm({ username: '', email: '', password: '' });
            setFieldErrors({});
            setTouchedFields({});
            setError('Registration successful! Please login with your credentials.');

        } catch (err) {
            setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
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
        const token = getStoredToken();
        if (token) {
            navigate('/music');
        }
    }, [navigate]);

    const currentForm = isRegister ? registerForm : loginForm;
    const passwordStrength = isRegister ? getPasswordStrength(registerForm.password) : null;

    return (
        <div className="app-page-auth flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-bright rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-cyan rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="app-auth-card backdrop-blur-xl rounded-3xl p-8 transform hover:scale-[1.01] transition-all duration-500">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent-bright to-cyan rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative p-4 bg-gradient-to-r from-accent via-accent-bright to-cyan rounded-2xl transform group-hover:rotate-6 transition-transform duration-300">
                                    <IoMusicalNotes className="text-4xl text-theme-primary" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-accent-soft via-accent-tint to-cyan-light bg-clip-text text-transparent mb-2">
                            Beat Buff Music
                        </h2>
                        <p className="text-theme-muted">
                            {isRegister ? 'Create your account' : 'Welcome back to your music'}
                        </p>
                    </div>

                    {/* Error/Success Message */}
                    {error && (
                        <div className={`mb-6 p-4 ${error.includes('successful')
                            ? 'bg-success/10 border border-success/50 text-success'
                            : 'bg-danger/10 border border-danger/50 text-danger'
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
                                <label className="block text-sm font-medium text-theme-secondary text-left mb-2">
                                    Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className={`transition-colors duration-300 ${touchedFields.username && !fieldErrors.username
                                            ? 'text-success'
                                            : fieldErrors.username
                                                ? 'text-danger'
                                                : 'text-theme-muted'
                                            }`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={currentForm.username}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        className={`app-input w-full pl-10 pr-10 py-3 rounded-xl ${touchedFields.username && !fieldErrors.username
                                            ? 'border-success focus:border-success'
                                            : fieldErrors.username
                                                ? 'border-danger focus:border-danger'
                                                : ''
                                            } focus:ring-2 ${touchedFields.username && !fieldErrors.username
                                                ? 'focus:ring-success/20'
                                                : fieldErrors.username
                                                    ? 'focus:ring-danger/20'
                                                    : 'focus:ring-accent/20'
                                            } transition-all duration-300`}
                                        disabled={loading}
                                    />
                                    {touchedFields.username && !fieldErrors.username && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <FaCheckCircle className="text-success" />
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.username && touchedFields.username && (
                                    <p className="mt-2 text-xs text-danger flex items-center space-x-1">
                                        <FaExclamationTriangle />
                                        <span>{fieldErrors.username}</span>
                                    </p>
                                )}
                            </div>

                            {/* Email Field (Register only) */}
                            {isRegister && (
                                <div>
                                    <label className="block text-sm font-medium text-theme-secondary text-left mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className={`transition-colors duration-300 ${touchedFields.email && !fieldErrors.email
                                                ? 'text-success'
                                                : fieldErrors.email
                                                    ? 'text-danger'
                                                    : 'text-theme-muted'
                                                }`} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={registerForm.email}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter your email"
                                            className={`w-full pl-10 pr-10 py-3  app-input border ${touchedFields.email && !fieldErrors.email
                                                ? 'border-success/50 focus:border-success'
                                                : fieldErrors.email
                                                    ? 'border-danger/50 focus:border-danger'
                                                    : ''
                                                } rounded-xl text-theme-primary  focus:outline-none focus:ring-2 ${touchedFields.email && !fieldErrors.email
                                                    ? 'focus:ring-success/20'
                                                    : fieldErrors.email
                                                        ? 'focus:ring-danger/20'
                                                        : 'focus:ring-accent/20'
                                                } transition-all duration-300`}
                                            disabled={loading}
                                        />
                                        {touchedFields.email && !fieldErrors.email && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <FaCheckCircle className="text-success" />
                                            </div>
                                        )}
                                    </div>
                                    {fieldErrors.email && touchedFields.email && (
                                        <p className="mt-2 text-xs text-danger flex items-center space-x-1">
                                            <FaExclamationTriangle />
                                            <span>{fieldErrors.email}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary mb-2 text-left">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className={`transition-colors duration-300 ${touchedFields.password && !fieldErrors.password
                                            ? 'text-success'
                                            : fieldErrors.password
                                                ? 'text-danger'
                                                : 'text-theme-muted'
                                            }`} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={currentForm.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder={isRegister ? "Create a strong password" : "Enter your password"}
                                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                                        className={`w-full pl-10 pr-10 py-3  app-input border ${touchedFields.password && !fieldErrors.password
                                            ? 'border-success/50 focus:border-success'
                                            : fieldErrors.password
                                                ? 'border-danger/50 focus:border-danger'
                                                : ''
                                            } rounded-xl text-theme-primary  focus:outline-none focus:ring-2 ${touchedFields.password && !fieldErrors.password
                                                ? 'focus:ring-success/20'
                                                : fieldErrors.password
                                                    ? 'focus:ring-danger/20'
                                                    : 'focus:ring-accent/20'
                                            } transition-all duration-300`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-muted hover:text-theme-secondary transition-colors"
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
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength?.strength
                                                        ? passwordStrength?.color
                                                        : 'bg-elevated'
                                                        }`}
                                                ></div>
                                            ))}
                                        </div>
                                        {passwordStrength && (
                                            <p className="text-xs text-theme-muted">
                                                Password strength: <span className={`font-medium ${passwordStrength.strength >= 4 ? 'text-success' :
                                                    passwordStrength.strength >= 3 ? 'text-cyan-light' :
                                                        'text-warning'
                                                    }`}>{passwordStrength.text}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {fieldErrors.password && touchedFields.password && (
                                    <p className="mt-2 text-xs text-danger flex items-center space-x-1">
                                        <FaExclamationTriangle />
                                        <span>{fieldErrors.password}</span>
                                    </p>
                                )}

                                {isRegister && !fieldErrors.password && (
                                    <div className="mt-3 space-y-1.5 text-xs text-theme-muted">
                                        <p className="font-medium text-theme-secondary flex items-center space-x-1">
                                            <IoShieldCheckmark className="text-accent-soft" />
                                            <span>Password must contain:</span>
                                        </p>
                                        <ul className="space-y-1 ml-5">
                                            <li className={registerForm.password.length >= 6 ? 'text-success' : ''}>
                                                • At least 6 characters
                                            </li>
                                            <li className={/(?=.*[a-z])/.test(registerForm.password) ? 'text-success' : ''}>
                                                • One lowercase letter
                                            </li>
                                            <li className={/(?=.*[A-Z])/.test(registerForm.password) ? 'text-success' : ''}>
                                                • One uppercase letter
                                            </li>
                                            <li className={/(?=.*\d)/.test(registerForm.password) ? 'text-success' : ''}>
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
                            className="app-btn-primary w-full py-3.5 px-4 rounded-xl font-semibold transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <span className="flex items-center space-x-2">
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
                                <div className="w-full border-t border-theme"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-theme-muted bg-app-card">or</span>
                            </div>
                        </div>
                        <button
                            onClick={toggleMode}
                            disabled={loading}
                            className="mt-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-soft to-accent-tint hover:from-accent-tint hover:to-accent-soft transition-all duration-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegister
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Create one now"
                            }
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
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
