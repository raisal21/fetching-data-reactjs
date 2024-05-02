import Header from './Header';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL;

function App() {
	const [ data, setData ] = useState([]);
	const [ name, setName ] = useState();
	const [ age, setAge ] = useState();

    const [id, setId] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 

    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);

	async function fetchData() {
		try {
			const response = await axios.get(API_URL);
			setData(response.data);
			setFilteredData(response.data);
		} 
		catch (error) {
			console.error('Error fetching data:', error);
		}
	}
	
	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
        const results = data.filter(user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.age.toString().includes(search)
        );
        setFilteredData(results);
    }, [search, data]);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

	async function handleClicks(id) {
		try {
			const response = await axios.delete(`${API_URL}/${id}`);
			console.log('Delete successful', response.data);
			// Hapus user dari state untuk memperbarui UI
			setData(prevData => prevData.filter(user => user.id !== id));
		} catch (error) {
			console.error('Failed to delete user', error);
		}
	}

    const handleSubmit = async (e) => {
        e.preventDefault();  // Menghentikan perilaku default form submit

        const userData = {
            name: name,
            age: age
        };

        try {
            let response;
            if (isEditing && id) {
                // Mode edit: kirim permintaan PUT untuk mengupdate data
                response = await axios.put(`${API_URL}/${id}`, userData);
                console.log('Edit successful', response.data);
                // Memperbarui user dalam state untuk memperbarui UI
                setData(prevData => prevData.map(user => user.id === id ? response.data : user));
                setIsEditing(false);  // Reset editing mode
                setId(null);  // Clear ID after editing
            } else {
                // Mode tambah: kirim permintaan POST untuk menambah data baru
                response = await axios.post(API_URL, userData);
                console.log('Post successful', response.data);
                // Menambahkan user baru ke state untuk memperbarui UI
                setData(prevData => [...prevData, response.data]);
            }
        } catch (error) {
            console.error('Error processing request', error);
        }
    };

	const startEdit = (user) => {
        setName(user.name);
        setAge(user.age);
        setId(user.id);
        setIsEditing(true);

		window.scrollTo(0, 0);
    };
	
	return (
        <div className="App">
            <Header className="Header" title="Cards Blog | Axios Fetching Data" />
            <div>
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
                        className="input input-bordered w-full max-w-xs search-input"
                    />
                </div>
                {filteredData.map((user) => (
                    <div key={user.id} className="user-card">
                        <img src={user.image} alt={user.name} />
                        <div className="user-details">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Age:</strong> {user.age}</p>
                        </div>
                        <div>
                            <button onClick={() => startEdit(user)} className="btn">Edit</button>
                            <button onClick={() => handleClicks(user.id)} className="btn btn-error mb-2">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
