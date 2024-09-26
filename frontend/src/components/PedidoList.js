import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from './ui/Button';

const PedidoList = () => {
    const { mesaId } = useParams();
    const [pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState({});
    const [mesa, setMesa] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener los productos y almacenarlos en un objeto para acceso rápido por ID
        axios.get('http://localhost:8000/productos/')
            .then(response => {
                const productosMap = {};
                response.data.forEach(producto => {
                    productosMap[producto.id] = producto.nombre;
                });
                setProductos(productosMap);
            })
            .catch(error => console.error('Error fetching productos:', error));

        // Obtener los pedidos de la mesa
        axios.get(`http://localhost:8000/mesas/${mesaId}/pedidos/`)
            .then(response => setPedidos(response.data))
            .catch(error => console.error('Error fetching pedidos:', error));

        // Obtener la información de la mesa para el tiempo de alquiler
        axios.get(`http://localhost:8000/mesas/${mesaId}`)
            .then(response => setMesa(response.data))  // Obtener los datos de la mesa, incluyendo el nombre
            .catch(error => console.error('Error fetching mesa data:', error));
    }, [mesaId]);

    const handleDeletePedido = async (pedidoId) => {
        try {
            await axios.delete(`http://localhost:8000/pedidos/${pedidoId}`);
            setPedidos(pedidos.filter(pedido => pedido.id !== pedidoId));
            alert("Pedido eliminado exitosamente.");

            if (pedidos.length === 1) {
                await axios.put(`http://localhost:8000/mesas/${mesaId}/estado`, { estado: false });
                alert("La mesa ha sido liberada.");
                navigate("/mesas");
            }
        } catch (error) {
            console.error('Error eliminando el pedido:', error);
            alert("Hubo un error al eliminar el pedido.");
        }
    };

    const handleLiberarMesa = async () => {
        try {
            // Llamar al nuevo endpoint para pagar los pedidos y liberar la mesa
            await axios.put(`http://localhost:8000/mesas/${mesaId}/pedidos/pagar`);
            alert("La mesa ha sido liberada y los pedidos han sido marcados como pagados.");
            navigate("/mesas");
        } catch (error) {
            console.error('Error liberando la mesa:', error);
            alert("Hubo un error al liberar la mesa.");
        }
    };

    const totalHoras = mesa ? mesa.tiempo_alquiler * mesa.precio : 0;
    const totalAPagar = pedidos.reduce((acc, pedido) => acc + pedido.total, 0) + totalHoras;

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Pedidos: {mesa ? mesa.nombre : mesaId}</h2> {/* Mostrar el nombre de la mesa */}
            <ul className="mb-4">
                <li className="flex justify-between font-bold">
                    <span className="w-1/3">Producto</span>
                    <span className="w-1/3">Cantidad</span>
                    <span className="w-1/3">Precio</span>
                    <span className="w-1/3">Acciones</span>
                </li>
                {pedidos.map(pedido => (
                    <li key={pedido.id} className="flex justify-between items-center mb-2">
                        <span className="w-1/3">{productos[pedido.producto_id]}</span>
                        <span className="w-1/3">{pedido.cantidad}</span>
                        <span className="w-1/3">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(pedido.total)}</span>
                        <Button variant="outline" onClick={() => handleDeletePedido(pedido.id)}>
                            Eliminar
                        </Button>
                    </li>
                ))}
            </ul>

            {/* Línea divisora */}
            <hr className="my-4" />

            {mesa && (
                <div className="mb-4">
                    <h3 className="text-lg font-bold">Horas de alquiler de la mesa ({mesa.tipo === 1 ? 'Pool' : mesa.tipo === 2 ? 'Común' : 'Extra'})</h3>
                    <div className="flex justify-between">
                        <span className="w-1/3">Cantidad: {mesa.tiempo_alquiler} hrs</span>
                        <span className="w-1/3">Precio: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(totalHoras)}</span>
                    </div>
                </div>
            )}

            {/* Segunda línea divisora */}
            <hr className="my-4" />

            <div className="mt-6">
                <h3 className="text-xl font-bold">Total a Pagar: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(totalAPagar)}</h3>
            </div>
            <div className="mt-6 text-center">
                <Button variant="solid" onClick={handleLiberarMesa} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Pagado / Liberar Mesa
                </Button>
            </div>
        </div>
    );
};

export default PedidoList;
