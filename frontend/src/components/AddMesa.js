import React, { useState } from 'react';
import axios from 'axios';

const AddMesa = () => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState(1); // Por defecto tipo Pool

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams({ nombre, tipo: parseInt(tipo) });
            await axios.post(`http://localhost:8000/mesas/?${params.toString()}`);
            alert('Mesa agregada exitosamente');
        } catch (error) {
            console.error('Error al agregar mesa:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nombre de la Mesa:</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Tipo de Mesa:</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value={1}>Pool</option>
                    <option value={2}>Común</option>
                </select>
            </div>
            <button type="submit">Agregar Mesa</button>
        </form>
    );
};

export default AddMesa;
