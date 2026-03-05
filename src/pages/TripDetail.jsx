import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Input,
    Textarea,
    ScrollShadow,
    Divider,
    Chip,
    Tooltip,
    Breadcrumbs,
    BreadcrumbItem
} from "@heroui/react";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
    const navigate = useNavigate();
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
        api.get(`trips/${id}/`)
            .then(response => setTrip(response.data))
            .catch(error => console.error("Error fetching trip:", error));

        api.get('itinerary/')
            .then(response => {
                const tripItems = response.data.filter(item => item.trip == id);
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

        const newItemData = { ...formData, order: itinerary.length };

        api.post('itinerary/', newItemData)
            .then(response => {
                setItinerary([...itinerary, response.data]);
                setShowForm(false);
                setFormData({ place_name: '', date: '', notes: '', latitude: '', longitude: '', order: 0, trip: id });
            })
            .catch(error => console.error("Error saving place:", error));
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(itinerary);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setItinerary(items);

        items.forEach((item, index) => {
            api.patch(`itinerary/${item.id}/`, { order: index })
                .catch(err => console.error("Error updating order:", err));
        });
    };

    const handleDeletePlace = (itemId) => {
        if (window.confirm("Are you sure you want to remove this place from your itinerary?")) {
            api.delete(`itinerary/${itemId}/`)
                .then(() => {
                    setItinerary(prevItinerary => prevItinerary.filter(item => item.id !== itemId));
                })
                .catch(error => console.error("Error deleting place:", error));
        }
    };

    const handleDeleteTrip = () => {
        if (window.confirm("Are you sure you want to delete this entire trip? This action cannot be undone.")) {
            api.delete(`trips/${id}/`)
                .then(() => {
                    navigate('/dashboard');
                })
                .catch(error => console.error("Error deleting trip:", error));
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>;
    if (!trip) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Trip not found!</div>;

    const mapCenter = itinerary.length > 0
        ? [itinerary[0].latitude, itinerary[0].longitude]
        : [48.8566, 2.3522];

    return (
        <div className="min-h-screen bg-black/95 text-foreground p-4 md:p-8">
            <div className="max-w-7xl mx-auto flex flex-col h-full">
                {/* --- HEADER & BREADCRUMBS --- */}
                <div className="mb-8">
                    <Breadcrumbs className="mb-4">
                        <BreadcrumbItem>
                            <Link to="/dashboard">Dashboard</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{trip.title}</BreadcrumbItem>
                    </Breadcrumbs>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">{trip.title}</h1>
                            <p className="text-default-500 text-lg mt-2 max-w-2xl">{trip.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={handleDeleteTrip}
                                className="font-bold"
                            >
                                Delete Trip
                            </Button>
                            <Button
                                color="primary"
                                variant={showForm ? "bordered" : "solid"}
                                onPress={() => setShowForm(!showForm)}
                                className="font-bold"
                            >
                                {showForm ? 'Cancel' : '+ Add Place'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow lg:h-[calc(100vh-250px)] min-h-[600px]">
                    {/* LEFT COLUMN: Itinerary (4/12) */}
                    <Card className="lg:col-span-4 bg-white/5 border border-white/10 flex flex-col h-full shadow-2xl">
                        <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Your Itinerary</h2>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold">
                                {itinerary.length} PLACES
                            </span>
                        </CardHeader>

                        <CardBody className="p-0 overflow-hidden flex flex-col">
                            {showForm && (
                                <div className="p-6 bg-primary/5 border-b border-white/10">
                                    <form onSubmit={handleAddPlace} className="flex flex-col gap-3">
                                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                                            📍 Click the map to set location
                                        </p>
                                        <Input
                                            label="Place Name"
                                            name="place_name"
                                            value={formData.place_name}
                                            onChange={handleInputChange}
                                            required
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Input
                                            label="Visit Date"
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Textarea
                                            label="Notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Button type="submit" color="primary" className="font-bold mt-2 shadow-lg shadow-primary/20">
                                            Save Destination
                                        </Button>
                                    </form>
                                </div>
                            )}

                            <ScrollShadow className="flex-grow p-4">
                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                    <Droppable droppableId="itinerary-list">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 pb-20">
                                                {itinerary.length === 0 && !showForm && (
                                                    <div className="flex flex-col items-center justify-center py-20 text-center text-default-400">
                                                        <span className="text-4xl mb-4 opacity-20">📍</span>
                                                        <p>No places added yet.</p>
                                                    </div>
                                                )}

                                                {itinerary.map((item, index) => (
                                                    <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`group bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center transition-all ${snapshot.isDragging ? 'shadow-2xl bg-white/10 scale-105 z-50 border-primary' : 'hover:bg-white/10 hover:border-white/20'}`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div {...provided.dragHandleProps} className="text-default-400 cursor-grab active:cursor-grabbing hover:text-white transition-colors">
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-white leading-tight group-hover:text-primary transition-colors">{item.place_name}</h4>
                                                                        <p className="text-xs text-default-400 font-medium uppercase tracking-widest mt-1">{item.date}</p>
                                                                        {item.notes && <p className="text-xs text-default-500 mt-2 italic">"{item.notes}"</p>}
                                                                    </div>
                                                                </div>

                                                                <Tooltip content="Remove from itinerary" color="danger">
                                                                    <Button
                                                                        isIconOnly
                                                                        variant="light"
                                                                        color="danger"
                                                                        size="sm"
                                                                        onPress={() => handleDeletePlace(item.id)}
                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                                    </Button>
                                                                </Tooltip>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </ScrollShadow>
                        </CardBody>
                    </Card>

                    {/* RIGHT COLUMN: Map (8/12) */}
                    <Card className="lg:col-span-8 bg-white/5 border border-white/10 p-2 shadow-2xl overflow-hidden relative group min-h-[400px] lg:min-h-0">
                        <div className="absolute top-6 left-6 z-[1000] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <Chip color="primary" variant="shadow" className="font-bold border border-white/20">
                                INTERACTIVE MAP
                            </Chip>
                        </div>
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            className="w-full h-full rounded-lg"
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationPicker setFormData={setFormData} />

                            {itinerary.map(item => (
                                <Marker key={item.id} position={[item.latitude, item.longitude]}>
                                    <Popup className="custom-popup">
                                        <div className="font-bold text-gray-900">{item.place_name}</div>
                                        <div className="text-xs text-gray-500">{item.date}</div>
                                    </Popup>
                                </Marker>
                            ))}

                            {formData.latitude && formData.longitude && (
                                <Marker position={[formData.latitude, formData.longitude]} opacity={0.7}>
                                    <Popup>New Destination Selected</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default TripDetail;