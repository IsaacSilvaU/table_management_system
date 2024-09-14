import React, { useState } from 'react';
import axios from 'axios';
import Button from './ui/Button';
import Input from './ui/Input';

const AddProducto = () => {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams({ nombre, precio: parseFloat(precio) });
            await axios.post(`http://localhost:8000/productos/?${params.toString()}`);
            alert('Producto agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Agregar Producto</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del Producto:</label>
                <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Precio:</label>
                <Input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" variant="outline">
                Agregar Producto
            </Button>
        </form>
    );
};

export default AddProducto;
