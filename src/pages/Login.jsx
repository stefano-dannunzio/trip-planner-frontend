import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

/**
 * Login component handling both standard and GitHub OAuth authentication.
 * 
 * @returns {JSX.Element} The rendered login page.
 */
function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        /**
         * Intercepts the GitHub OAuth redirect and exchanges the code for tokens.
         */
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (code) {
            setIsLoading(true);

            api.post('auth/github/', { code: code })
                .then(response => {
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);
                    navigate('/dashboard');
                })
                .catch(err => {
                    console.error("GitHub Login error:", err);
                    setError('Failed to log in with GitHub. Please try again.');
                    setIsLoading(false);
                    navigate('/login', { replace: true });
                });
        }
    }, [location, navigate]);

    /**
     * Handles input changes for the login form.
     * @param {React.ChangeEvent<HTMLInputElement>} e 
     */
    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    /**
     * Handles standard username/password login submission.
     * @param {React.FormEvent} e 
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        api.post('token/', credentials)
            .then(response => {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                navigate('/dashboard');
            })
            .catch(err => {
                console.error("Login error:", err);
                setError('Invalid username or password. Please try again.');
                setIsLoading(false);
            });
    };

    /**
     * Redirects the user to GitHub for OAuth authorization.
     */
    const handleGithubLogin = () => {
        const redirectUri = `${window.location.origin}/login`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
                    <p className="text-gray-400 mt-2">Sign in to plan your next adventure 🌍</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center text-white py-10">
                        <p className="animate-pulse">Authenticating... ⏳</p>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={handleGithubLogin}
                            className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors mb-6 border border-gray-600"
                        >
                            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                            </svg>
                            Continue with GitHub
                        </button>

                        <div className="flex items-center mb-6">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="px-3 text-gray-400 text-sm">or</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                                <input type="text" name="username" value={credentials.username} onChange={handleChange} required className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500" placeholder="Username" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                <input type="password" name="password" value={credentials.password} onChange={handleChange} required className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/30">
                                Sign In
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;