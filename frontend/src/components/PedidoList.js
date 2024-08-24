import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PedidoList = () => {
    const { mesaId } = useParams();
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/mesas/${mesaId}/pedidos/`)
            .then(response => {
                console.log(`Datos de Pedidos para la Mesa ${mesaId}:`, response.data); // Verifica los datos recibidos
                setPedidos(response.data);
            })
            .catch(error => console.error('Error fetching pedidos:', error));
    }, [mesaId]);

    return (
        <div>
            <h2>Pedidos de la Mesa {mesaId}</h2>
            <ul>
                {pedidos.length === 0 ? (
                    <li>No hay pedidos disponibles</li>
                ) : (
                    pedidos.map(pedido => (
                        <li key={pedido.id}>
                            Producto ID: {pedido.producto_id} - Cantidad: {pedido.cantidad} - Total: ${pedido.total.toFixed(2)}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default PedidoList;
