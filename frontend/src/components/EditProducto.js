import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProducto = () => {
    const { productoId } = useParams();
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:8000/productos/${productoId}`)
            .then(response => {
                setNombre(response.data.nombre);
                setPrecio(response.data.precio);
            })
            .catch(error => console.error('Error fetching producto:', error));
    }, [productoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams({ nombre, precio: parseFloat(precio) });
            await axios.put(`http://localhost:8000/productos/${productoId}?${params.toString()}`);
            alert('Producto actualizado exitosamente');
            navigate('/productos');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
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
            <button type="submit">Actualizar Producto</button>
        </form>
    );
};

export default EditProducto;
