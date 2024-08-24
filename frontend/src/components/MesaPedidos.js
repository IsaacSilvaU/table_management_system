import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const MesaPedidos = () => {
    const { mesaId } = useParams();
    const [pedidos, setPedidos] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPedidos();
    }, [mesaId]);

    const fetchPedidos = () => {
        axios.get(`http://localhost:8000/mesas/${mesaId}/pedidos/`)
            .then(response => {
                setPedidos(response.data);
                const totalSum = response.data.reduce((sum, pedido) => sum + pedido.total, 0);
                setTotal(totalSum);
            })
            .catch(error => console.error('Error fetching pedidos:', error));
    };

    const handleDelete = async (pedidoId) => {
        const confirmDelete = window.confirm(
            "¿Está seguro de que desea eliminar este pedido? Esta acción no se puede deshacer."
        );

        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8000/pedidos/${pedidoId}`);
                fetchPedidos(); // Refresca la lista de pedidos después de eliminar uno
                alert("Pedido eliminado exitosamente.");
            } catch (error) {
                console.error('Error deleting pedido:', error);
                alert("Hubo un error al eliminar el pedido.");
            }
        }
    };

    const handleLiberarMesa = async () => {
        const confirmLiberar = window.confirm(
            "¿Está seguro de que desea liberar esta mesa? Esto eliminará todos los pedidos actuales."
        );

        if (confirmLiberar) {
            try {
                await axios.delete(`http://localhost:8000/mesas/${mesaId}/pedidos`); // Endpoint para eliminar todos los pedidos
                await axios.put(`http://localhost:8000/mesas/${mesaId}/estado`, { estado: false }); // Liberar la mesa
                navigate('/mesas'); // Volver a la lista de mesas
            } catch (error) {
                console.error('Error liberando la mesa:', error);
            }
        }
    };

    return (
        <div>
            <h2>Pedidos de la Mesa {mesaId}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Producto ID</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map(pedido => (
                        <tr key={pedido.id}>
                            <td>{pedido.producto_id}</td>
                            <td>{pedido.cantidad}</td>
                            <td>${pedido.total.toFixed(2)}</td>
                            <td>
                                <button onClick={() => handleDelete(pedido.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={handleLiberarMesa}>Liberar Mesa</button>
        </div>
    );
};

export default MesaPedidos;

