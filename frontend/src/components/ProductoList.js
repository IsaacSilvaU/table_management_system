import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ProductoList = () => {
    const [productos, setProductos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/productos/')
            .then(response => {
                setProductos(response.data);
            })
            .catch(error => console.error('Error fetching productos:', error));
    }, []);

    const handleDelete = async (productoId) => {
        const confirmDelete = window.confirm(
            "Alerta! Esta opción eliminará también todos los pedidos asociados a este producto. La acción no es reversible. ¿Desea continuar?"
        );

        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8000/productos/${productoId}`);
                setProductos(productos.filter(producto => producto.id !== productoId));
                alert("Producto y pedidos asociados eliminados exitosamente.");
            } catch (error) {
                console.error('Error deleting producto:', error);
                alert("Hubo un error al eliminar el producto.");
            }
        } else {
            alert("Operación cancelada.");
        }
    };

    return (
        <div>
            <h2>Productos</h2>
            <ul>
                {productos.map(producto => (
                    <li key={producto.id}>
                        {producto.nombre} - ${producto.precio.toFixed(2)}
                        <button onClick={() => navigate(`/productos/${producto.id}/editar`)}>Editar</button>
                        <button onClick={() => handleDelete(producto.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductoList;
