import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AddPedido = () => {
    const { mesaId } = useParams();
    const [productos, setProductos] = useState([]);
    const [productoId, setProductoId] = useState('');
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
        axios.get('http://localhost:8000/productos/')
            .then(response => setProductos(response.data))
            .catch(error => console.error('Error fetching productos:', error));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams({
                mesa_id: mesaId,
                producto_id: parseInt(productoId),
                cantidad: parseInt(cantidad)
            });
            await axios.post(`http://localhost:8000/pedidos/?${params.toString()}`);
            alert('Pedido agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar pedido:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Producto:</label>
                <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
                    <option value="" disabled>Seleccione un producto</option>
                    {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>{producto.nombre}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Cantidad:</label>
                <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Agregar Pedido</button>
        </form>
    );
};

export default AddPedido;
