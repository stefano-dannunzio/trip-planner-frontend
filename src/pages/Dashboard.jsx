import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    // 1. State for our trips list
    const [trips, setTrips] = useState([]);

    // 2. State to toggle the form visibility
    const [showForm, setShowForm] = useState(false);

    // 3. State to hold the data the user types into the form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
    });

    // Fetch trips when the page loads
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/trips/')
            .then(response => setTrips(response.data))
            .catch(error => console.error("Error fetching trips:", error));
    }, []);

    // Handle typing in the input fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle the form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from reloading

        // We inject the owner ID here temporarily until we have a real login system
        const dataToSend = { ...formData, owner: 1 };

        axios.post('http://127.0.0.1:8000/api/trips/', dataToSend)
            .then(response => {
                // Success! Add the new trip to our list so it appears instantly
                setTrips([...trips, response.data]);

                // Hide the form and reset the inputs
                setShowForm(false);
                setFormData({ title: '', description: '', start_date: '', end_date: '' });
            })
            .catch(error => {
                console.error("Error creating trip:", error.response?.data || error);
                alert("There was an error creating the trip. Check the console.");
            });
    };

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 pb-4">
                    🌍 My Trips Dashboard
                </h1>
                {/* Toggle the form visibility when clicked */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Trip'}
                </button>
            </div>

            {/* --- THE CREATION FORM --- */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Plan a New Adventure</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Trip Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., Summer in Kyoto"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                                placeholder="A brief summary of the trip"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1">End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-colors">
                        Save Trip
                    </button>
                </form>
            )}
            {/* --- END OF FORM --- */}

            {/* The Grid of Trips */}
            {trips.length === 0 ? (
                <p className="text-gray-400 text-lg">Loading trips or no trips created yet...</p>
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