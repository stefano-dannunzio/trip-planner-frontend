import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- Added useNavigate
import api from '../api';

function Dashboard() {
    const [trips, setTrips] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
    });

    const navigate = useNavigate(); // <-- Initialize the navigation hook

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        // If there is no token at all, send them straight to login
        if (!token) {
            navigate('/login');
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        api.get('trips/', config)
            .then(response => setTrips(response.data))
            .catch(error => {
                console.error("Error fetching trips:", error);
                // If the token is expired or invalid, Django returns a 401. 
                // We should log them out automatically.
                if (error.response && error.response.status === 401) {
                    handleLogout();
                }
            });
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');


        api.post('trips/', formData)
            .then(response => {
                setTrips([...trips, response.data]);
                setShowForm(false);
                setFormData({ title: '', description: '', start_date: '', end_date: '' });
            })
            .catch(error => {
                console.error("Error creating trip:", error);
                alert("There was an error creating the trip.");
            });
    };

    // --- NEW FUNCTION: Handle Logout ---
    const handleLogout = () => {
        // 1. Remove the tokens from the browser's local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // 2. Redirect the user back to the login page
        navigate('/login');
    };

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto">

            {/* --- HEADER SECTION --- */}
            <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    🌍 My Trips Dashboard
                </h1>

                {/* Button Group */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        {showForm ? 'Cancel' : '+ New Trip'}
                    </button>

                    {/* THE LOGOUT BUTTON */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/50 px-4 py-2 rounded-lg font-semibold transition-all"
                        title="Sign Out"
                    >
                        Log Out 🚪
                    </button>
                </div>
            </div>

            {/* --- THE CREATION FORM --- */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Plan a New Adventure</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Trip Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500" placeholder="e.g., Summer in Kyoto" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Description</label>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500" placeholder="A brief summary" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">End Date</label>
                            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-colors">
                        Save Trip
                    </button>
                </form>
            )}

            {/* --- THE GRID OF TRIPS --- */}
            {trips.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No trips created yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Click "+ New Trip" to start planning!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => (
                        <Link
                            to={`/trip/${trip.id}`}
                            key={trip.id}
                            className="block bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-blue-500/20 transition-all duration-300"
                        >
                            <h2 className="text-2xl font-bold text-gray-100 mb-2">{trip.title}</h2>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {trip.description}
                            </p>
                            <div className="flex items-center text-sm text-blue-300 font-medium">
                                <span>📅 {trip.start_date}</span>
                                <span className="mx-2">➔</span>
                                <span>{trip.end_date}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;