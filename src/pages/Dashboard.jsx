import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
    Navbar, 
    NavbarBrand, 
    NavbarContent, 
    NavbarItem, 
    Button, 
    Card, 
    CardHeader, 
    CardBody, 
    CardFooter,
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter,
    Input,
    Textarea,
    useDisclosure,
    Chip
} from "@heroui/react";

/**
 * Dashboard component displaying the user's trips and a form to create new ones.
 * 
 * @returns {JSX.Element} The rendered dashboard.
 */
function Dashboard() {
    const [trips, setTrips] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            navigate('/login');
            return;
        }

        api.get('trips/')
            .then(response => setTrips(response.data))
            .catch(error => {
                console.error("Error fetching trips:", error);
                if (error.response && error.response.status === 401) {
                    handleLogout();
                }
            });
    }, [navigate]);

    /**
     * Handles input changes for the new trip form.
     * @param {React.ChangeEvent<HTMLInputElement>} e 
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /**
     * Handles the submission of a new trip.
     * @param {Function} onClose - Callback to close the modal
     */
    const handleSubmit = (onClose) => {
        api.post('trips/', formData)
            .then(response => {
                setTrips([...trips, response.data]);
                setFormData({ title: '', description: '', start_date: '', end_date: '' });
                onClose();
            })
            .catch(error => {
                console.error("Error creating trip:", error);
                alert("There was an error creating the trip.");
            });
    };

    /**
     * Logs the user out by clearing local storage and navigating to login.
     */
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-black/95 text-foreground">
            {/* --- NAVIGATION --- */}
            <Navbar isBordered className="bg-white/5 backdrop-blur-md border-white/10">
                <NavbarBrand>
                    <p className="font-bold text-inherit text-xl tracking-tighter">
                        <span className="text-primary">TRIP</span>PLANNER
                    </p>
                </NavbarBrand>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Button 
                            color="primary" 
                            variant="flat" 
                            className="font-semibold"
                            onPress={onOpen}
                        >
                            + New Trip
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button 
                            color="danger" 
                            variant="light" 
                            className="font-semibold"
                            onPress={handleLogout}
                        >
                            Log Out
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>

            <main className="max-w-7xl mx-auto p-8">
                {/* --- HEADER --- */}
                <div className="mb-12">
                    <h1 className="text-5xl font-black mb-4 tracking-tighter">
                        My <span className="text-primary">Adventures</span>
                    </h1>
                    <p className="text-default-500 text-lg max-w-2xl">
                        Manage your upcoming travels, discover new destinations, and keep track of your journey across the globe.
                    </p>
                </div>

                {/* --- TRIPS GRID --- */}
                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-white/5 p-8 rounded-full mb-6">
                            <span className="text-6xl">🌍</span>
                        </div>
                        <p className="text-xl font-bold text-white mb-2">No trips planned yet</p>
                        <p className="text-default-400 mb-6">Start your journey by creating your first trip.</p>
                        <Button color="primary" size="lg" onPress={onOpen}>Create Your First Trip</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <Card 
                                key={trip.id} 
                                isPressable 
                                as={Link} 
                                to={`/trip/${trip.id}`}
                                className="bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 group"
                            >
                                <CardHeader className="flex-col items-start px-6 pt-6">
                                    <div className="flex justify-between w-full items-start mb-2">
                                        <h2 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h2>
                                    </div>
                                    <p className="text-default-500 text-sm line-clamp-2 h-10">{trip.description}</p>
                                </CardHeader>
                                <CardBody className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Chip 
                                            variant="flat" 
                                            color="primary" 
                                            size="sm"
                                            className="bg-primary/10 text-primary"
                                        >
                                            📅 {trip.start_date}
                                        </Chip>
                                        <Chip 
                                            variant="flat" 
                                            color="secondary" 
                                            size="sm"
                                            className="bg-secondary/10 text-secondary"
                                        >
                                            ➔ {trip.end_date}
                                        </Chip>
                                    </div>
                                </CardBody>
                                <CardFooter className="px-6 pb-6">
                                    <Button 
                                        fullWidth 
                                        variant="bordered" 
                                        className="border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10"
                                    >
                                        View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* --- CREATE TRIP MODAL --- */}
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange} 
                backdrop="blur"
                classNames={{
                    base: "bg-zinc-900 border border-white/10",
                    header: "border-b border-white/10",
                    footer: "border-t border-white/10",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white">Plan a New Adventure</ModalHeader>
                            <ModalBody className="py-6">
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Trip Title"
                                        name="title"
                                        placeholder="e.g., Summer in Kyoto"
                                        variant="bordered"
                                        value={formData.title}
                                        onChange={handleChange}
                                        isRequired
                                    />
                                    <Textarea
                                        label="Description"
                                        name="description"
                                        placeholder="A brief summary of your trip"
                                        variant="bordered"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Start Date"
                                            name="start_date"
                                            type="date"
                                            variant="bordered"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            isRequired
                                        />
                                        <Input
                                            label="End Date"
                                            name="end_date"
                                            type="date"
                                            variant="bordered"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            isRequired
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} className="text-white">
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={() => handleSubmit(onClose)}>
                                    Save Trip
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

export default Dashboard;