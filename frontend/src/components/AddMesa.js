import React, { useState } from 'react';
import axios from 'axios';
import Button from './ui/Button';
import Input from './ui/Input';

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
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Agregar Mesa</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de la Mesa:</label>
                <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Mesa:</label>
                <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="block w-full p-2 border rounded"
                >
                    <option value={1}>Pool</option>
                    <option value={2}>Común</option>
                    <option value={3}>Extra</option>
                </select>
            </div>
            <Button type="submit" variant="outline">
                Agregar Mesa
            </Button>
        </form>
    );
};

export default AddMesa;
