
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const MesaPedidos = () => {
    const { mesaId } = useParams();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        axios.get(`http://localhost:8000/mesas/${mesaId}/pedidos/`)
            .then(response => {
                setPedidos(response.data);
                setTotal(response.data.reduce((sum, pedido) => sum + pedido.total, 0));
            })
            .catch(error => console.error('Error fetching pedidos:', error));
    }, [mesaId]);

    const handleDelete = async (pedidoId) => {
        try {
            await axios.delete(`http://localhost:8000/pedidos/${pedidoId}`);
            setPedidos(pedidos.filter(pedido => pedido.id !== pedidoId));
            setTotal(total - pedidos.find(pedido => pedido.id === pedidoId).total);
        } catch (error) {
            console.error('Error deleting pedido:', error);
        }
    };

    const handleLiberarMesa = async () => {
        try {
            await axios.delete(`http://localhost:8000/mesas/${mesaId}/pedidos/`);
            await axios.put(`http://localhost:8000/mesas/${mesaId}/estado`, { estado: false });
            navigate('/mesas');
        } catch (error) {
            console.error('Error liberando la mesa:', error);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Pedidos de Mesa {mesaId}</h2>
            <ul className="mb-4">
                {pedidos.map(pedido => (
                    <li key={pedido.id} className="flex justify-between items-center mb-2">
                        <span>{pedido.producto_id} - Cantidad: {pedido.cantidad}</span>
                        <span>${pedido.total.toFixed(2)}</span>
                        <button
                            onClick={() => handleDelete(pedido.id)}
                            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
            <p className="text-xl font-bold mb-6">Total: ${total.toFixed(2)}</p>
            <button
                onClick={handleLiberarMesa}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Liberar Mesa
            </button>
        </div>
    );
};

export default MesaPedidos;
