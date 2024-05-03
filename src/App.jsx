import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

function App() {
    // State variables for storing data
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [id, setId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch data from API
    async function fetchData() {
        try {
            const response = await axios.get(API_URL);
            setData(response.data);
            setFilteredData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Filter data based on search input
    useEffect(() => {
        const results = data.filter(user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.age.toString().includes(search)
        );
        setFilteredData(results);
    }, [search, data]);

    // Handle search input changes
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    // Handle click event for deleting user
    async function handleDelete(id) {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            console.log('Delete successful', response.data);
            setData(prevData => prevData.filter(user => user.id !== id));
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    }

    // Handle form submission for adding or editing user
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = { name, age };

        try {
            let response;
            if (isEditing && id) {
                response = await axios.put(`${API_URL}/${id}`, userData);
                console.log('Edit successful', response.data);
                setData(prevData => prevData.map(user => user.id === id ? response.data : user));
                setIsEditing(false);
                setId(null);
            } else {
                response = await axios.post(API_URL, userData);
                console.log('Post successful', response.data);
                setData(prevData => [...prevData, response.data]);
            }
        } catch (error) {
            console.error('Error processing request', error);
        }
    };

    // Initialize edit mode
    const startEdit = (user) => {
        setName(user.name);
        setAge(user.age);
        setId(user.id);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    // Component render JSX
    return (
        <div className="App">
            <Header className="Header" title="Cards Blog | Axios Fetching Data" />
            <form onSubmit={handleSubmit} className="flex flex-col m-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Name"
                    className="input input-bordered w-full max-w-xs mb-1"
                />
                <input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    type="text"
                    placeholder="Age"
                    className="input input-bordered w-full max-w-xs mb-1"
                />
                <button className="btn btn-primary max-w-20">{isEditing ? 'Update' : 'Submit'}</button>
            </form>
            <div className="search-form">
                <input
                    type="text"
                    placeholder="Search by name or age..."
                    value={search}
                    onChange={handleSearchChange}
                    className="input input-bordered w-full max-w-xs"
                />
            </div>
            {filteredData.map((user) => (
                <div key={user.id} className="user-card">
                    <img src={user.image} alt={user.name} />
                    <div className="user-details">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Age:</strong> {user.age}</p>
                        <button onClick={() => startEdit(user)} className="btn">Edit</button>
                        <button onClick={() => handleDelete(user.id)} className="btn btn-error mb-2">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default App;
