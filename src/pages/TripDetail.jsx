import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// Import Drag and Drop components
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Map Click Listener Component ---
function LocationPicker({ setFormData }) {
    useMapEvents({
        click(e) {
            setFormData(prevData => ({
                ...prevData,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            }));
        },
    });
    return null;
}

function TripDetail() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        place_name: '',
        date: '',
        notes: '',
        latitude: '',
        longitude: '',
        order: 0,
        trip: id
    });

    useEffect(() => {
        // Fetch trip details
        axios.get(`http://127.0.0.1:8000/api/trips/${id}/`)
            .then(response => setTrip(response.data))
            .catch(error => console.error("Error fetching trip:", error));

        // Fetch itinerary items
        axios.get('http://127.0.0.1:8000/api/itinerary/')
            .then(response => {
                const tripItems = response.data.filter(item => item.trip == id);
                // Sort by date, then by the "order" field
                tripItems.sort((a, b) => new Date(a.date) - new Date(b.date) || a.order - b.order);
                setItinerary(tripItems);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching itinerary:", error);
                setIsLoading(false);
            });
    }, [id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddPlace = (e) => {
        e.preventDefault();
        if (!formData.latitude || !formData.longitude) {
            alert("Please click on the map to set the coordinates.");
            return;
        }

        // Assign the order to the end of the current list
        const newItemData = { ...formData, order: itinerary.length };

        axios.post('http://127.0.0.1:8000/api/itinerary/', newItemData)
            .then(response => {
                setItinerary([...itinerary, response.data]);
                setShowForm(false);
                setFormData({ place_name: '', date: '', notes: '', latitude: '', longitude: '', order: 0, trip: id });
            })
            .catch(error => console.error("Error saving place:", error));
    };

    // --- Handle the end of a drag event ---
    const handleOnDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const items = Array.from(itinerary);
        // Remove the item from its original position
        const [reorderedItem] = items.splice(result.source.index, 1);
        // Insert it into its new position
        items.splice(result.destination.index, 0, reorderedItem);

        // Update React state immediately for a snappy UI
        setItinerary(items);

        // Silently update the backend with the new "order" of each item
        items.forEach((item, index) => {
            axios.patch(`http://127.0.0.1:8000/api/itinerary/${item.id}/`, { order: index })
                .catch(err => console.error("Error updating order in Django:", err));
        });
    };

    // --- NEW FUNCTION: Delete a place ---
    const handleDeletePlace = (itemId) => {
        // Add a simple browser confirmation popup
        if (window.confirm("Are you sure you want to remove this place from your itinerary?")) {
            axios.delete(`http://127.0.0.1:8000/api/itinerary/${itemId}/`)
                .then(() => {
                    // If successful, filter out the deleted item from our React state instantly
                    setItinerary(prevItinerary => prevItinerary.filter(item => item.id !== itemId));
                })
                .catch(error => console.error("Error deleting place:", error));
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!trip) return <div className="min-h-screen flex items-center justify-center text-white">Trip not found!</div>;

    const mapCenter = itinerary.length > 0
        ? [itinerary[0].latitude, itinerary[0].longitude]
        : [48.8566, 2.3522];

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col">
            <div className="mb-6">
                <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium">&larr; Back to Dashboard</Link>
                <h1 className="text-4xl font-extrabold text-white mt-4">{trip.title}</h1>
                <p className="text-gray-400 text-lg mt-2">{trip.description}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-grow">

                {/* LEFT COLUMN: Itinerary */}
                <div className="lg:w-1/3 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl flex flex-col overflow-y-auto max-h-[700px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Itinerary</h2>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold"
                        >
                            {showForm ? 'Cancel' : '+ Add Place'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleAddPlace} className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
                            <p className="text-sm text-blue-300 mb-3 animate-pulse">👉 Click on the map for coordinates!</p>
                            <input type="text" name="place_name" value={formData.place_name} onChange={handleInputChange} required placeholder="Name (e.g. Louvre Museum)" className="w-full bg-gray-800 text-white mb-2 p-2 rounded text-sm" />
                            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full bg-gray-800 text-white mb-2 p-2 rounded text-sm" />
                            <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes (optional)" className="w-full bg-gray-800 text-white mb-3 p-2 rounded text-sm" />
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-sm font-bold">Save Place</button>
                        </form>
                    )}

                    {/* THE DRAGGABLE LIST */}
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="itinerary-list">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-grow space-y-3">
                                    {itinerary.length === 0 && !showForm && (
                                        <p className="text-gray-500 text-center mt-10">Add places to get started.</p>
                                    )}

                                    {itinerary.map((item, index) => (
                                        <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`bg-gray-700 p-3 rounded-lg border-l-4 border-blue-500 flex justify-between items-center transition-colors ${snapshot.isDragging ? 'shadow-2xl bg-gray-600 opacity-90' : 'hover:bg-gray-600'
                                                        }`}
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-gray-100">{item.place_name}</h4>
                                                        <p className="text-xs text-blue-300">{item.date}</p>
                                                        {item.notes && <p className="text-xs text-gray-400 mt-1">{item.notes}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {/* The Delete Button */}
                                                        <button
                                                            onClick={() => handleDeletePlace(item.id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                            title="Delete Place"
                                                        >
                                                            🗑️
                                                        </button>

                                                        {/* The Drag Handle */}
                                                        <div className="text-gray-500 cursor-grab active:cursor-grabbing text-xl">
                                                            ☰
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* RIGHT COLUMN: Map */}
                <div className="lg:w-2/3 bg-gray-800 border border-gray-700 rounded-xl p-2 shadow-xl overflow-hidden min-h-[500px]">
                    <MapContainer center={mapCenter} zoom={13} className="w-full h-full rounded-lg z-0">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker setFormData={setFormData} />

                        {/* Render saved places */}
                        {itinerary.map(item => (
                            <Marker key={item.id} position={[item.latitude, item.longitude]}>
                                <Popup className="text-gray-900 font-bold">
                                    {item.place_name} <br /> <span className="text-xs font-normal">{item.date}</span>
                                </Popup>
                            </Marker>
                        ))}

                        {/* RESTORED: Render a temporary marker showing where the user just clicked */}
                        {formData.latitude && formData.longitude && (
                            <Marker position={[formData.latitude, formData.longitude]} opacity={0.5}>
                                <Popup>New Place Location</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

            </div>
        </div>
    );
}

export default TripDetail;