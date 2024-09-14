import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditProducto = () => {
    const { productoId } = useParams();
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/productos/${productoId}`)
            .then(response => {
                setNombre(response.data.nombre);
                setPrecio(response.data.precio.toString()); // Convertir precio a string para manejarlo como texto
            })
            .catch(error => console.error('Error fetching producto:', error));
    }, [productoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Crear los parámetros de consulta en la URL
        const params = new URLSearchParams({
            nombre: nombre,
            precio: parseFloat(precio) // Asegurar que el precio se envía como número
        });

        try {
            // Enviar la solicitud PUT con los datos en los parámetros de la URL
            await axios.put(`http://localhost:8000/productos/${productoId}?${params.toString()}`);
            alert('Producto actualizado exitosamente');
            navigate('/productos');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Editar Producto</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del Producto:</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Precio:</label>
                <input
                    type="text" // Manejar el precio como texto en el input
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Actualizar Producto
            </button>
        </form>
    );
};

export default EditProducto;
