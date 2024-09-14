import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';

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
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Agregar Pedido</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Producto:</label>
                <select
                    value={productoId}
                    onChange={(e) => setProductoId(e.target.value)}
                    required
                    className="block w-full p-2 border rounded"
                >
                    <option value="" disabled>Seleccione un producto</option>
                    {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>{producto.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                <Input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" variant="outline">
                Agregar Pedido
            </Button>
        </form>
    );
};

export default AddPedido;
