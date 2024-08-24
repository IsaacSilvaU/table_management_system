import React, { useState } from 'react';
import axios from 'axios';

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
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nombre del Producto:</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Precio:</label>
                <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Agregar Producto</button>
        </form>
    );
};

export default AddProducto;
