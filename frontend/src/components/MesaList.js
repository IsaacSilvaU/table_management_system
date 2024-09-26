import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';

const MesaList = () => {
    const [mesas, setMesas] = useState([]);
    const [newTableName, setNewTableName] = useState("");
    const [newTableType, setNewTableType] = useState(1); // 1: Pool, 2: Común, 3: Extra
    const [reportDate, setReportDate] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/mesas/')
            .then(response => {
                const mesasData = response.data.map(mesa => ({
                    ...mesa,
                    tipo: parseInt(mesa.tipo),
                    // Usar el estado tal cual si ya es booleano
                    estado: mesa.estado,
                    total: (mesa.total ?? 0) + (mesa.tiempo_alquiler * mesa.precio),
                }));

                // Ordenar las mesas alfabéticamente
                mesasData.sort((a, b) => a.nombre.localeCompare(b.nombre));
                setMesas(mesasData);

                // Obtener los pedidos para cada mesa
                mesasData.forEach(mesa => {
                    axios.get(`http://localhost:8000/mesas/${mesa.id}/pedidos/`)
                        .then(response => {
                            const totalPedidos = response.data.reduce((sum, pedido) => sum + pedido.total, 0);
                            setMesas(prevMesas => prevMesas.map(m => 
                                m.id === mesa.id ? { ...m, total: totalPedidos + (mesa.tiempo_alquiler * mesa.precio) } : m
                            ));
                        })
                        .catch(error => console.error(`Error fetching pedidos for mesa ${mesa.id}:`, error));
                });
            })
            .catch(error => console.error('Error fetching mesas:', error));
    }, []);

    const ocuparMesa = async (mesaId) => {
        try {
            // Ahora hacemos la solicitud a la ruta correcta y enviamos los datos en el cuerpo
            const data = { estado: true };
            await axios.put(`http://localhost:8000/mesas/${mesaId}`, data);
            handleIncrementHours(mesaId, 1);  // Incrementar una hora al ocupar la mesa
            setMesas(mesas.map(mesa => 
                mesa.id === mesaId ? { ...mesa, estado: true } : mesa
            ));
        } catch (error) {
            console.error('Error changing estado:', error);
        }
    };

    const handleTableRemove = async (mesaId) => {
        // Verificar si la mesa está ocupada
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa && mesa.estado) {
            alert("No puedes eliminar una mesa que está ocupada.");
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/mesas/${mesaId}`);
            setMesas(mesas.filter(mesa => mesa.id !== mesaId));
        } catch (error) {
            console.error('Error removing table:', error);
        }
    };

    const handleNewTableAdd = async (e) => {
        e.preventDefault();
        if (newTableName.trim() !== "") {
            try {
                const data = {
                    nombre: newTableName,
                    tipo: parseInt(newTableType)
                };
                const response = await axios.post('http://localhost:8000/mesas/', data);
                setMesas([...mesas, response.data]);
                setNewTableName("");
                setNewTableType(1);
            } catch (error) {
                console.error('Error adding new table:', error);
            }
        }
    };

    const handleIncrementHours = async (mesaId, incremento) => {
        try {
            const mesa = mesas.find(m => m.id === mesaId);
            const nuevoTiempoAlquiler = mesa.tiempo_alquiler + incremento;
    
            // Asegurarse de que el tiempo de alquiler no sea negativo
            if (nuevoTiempoAlquiler < 0) {
                alert("El tiempo de alquiler no puede ser negativo.");
                return;
            }
    
            // Determinar el nuevo estado de la mesa
            const nuevoEstado = nuevoTiempoAlquiler > 0;
    
            // Enviar los datos al backend
            const data = {
                tiempo_alquiler: incremento,
                estado: nuevoEstado
            };
            const response = await axios.put(`http://localhost:8000/mesas/${mesaId}`, data);
    
            // Actualizar el estado local de las mesas
            setMesas(mesas.map(mesa => 
                mesa.id === mesaId 
                    ? { 
                        ...mesa, 
                        tiempo_alquiler: response.data.tiempo_alquiler,
                        estado: response.data.estado,
                        total: response.data.tiempo_alquiler * mesa.precio + mesa.total - (mesa.tiempo_alquiler * mesa.precio)
                    } 
                    : mesa
            ));
        } catch (error) {
            console.error('Error incrementing hours:', error);
        }
    };
    

    // Descargar el reporte (sin cambios)
    const handleDownloadReport = () => {
        let date = reportDate;
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
        const url = `http://localhost:8000/pedidos/descargar?fecha=${date}`;
        window.open(url, '_blank');
    };

    // Eliminar todos los pedidos (sin cambios)
    const handleDeleteAllOrders = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar todos los pedidos? Esta acción no se puede deshacer.')) {
            try {
                const response = await axios.delete('http://localhost:8000/pedidos/');
                alert(response.data.mensaje);

                // Actualizar el estado de las mesas
                const updatedMesas = mesas.map(mesa => ({ ...mesa, estado: false, tiempo_alquiler: 0, total: 0 }));
                setMesas(updatedMesas);
            } catch (error) {
                console.error('Error deleting all orders:', error);
                alert('Ocurrió un error al eliminar los pedidos.');
            }
        }
    };

    return (
        <div className="flex flex-col">
            <header className="bg-primary text-primary-foreground py-4 px-6">
                <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
            </header>
            <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {mesas.map(mesa => (
                    <div
                        key={mesa.id}
                        className={`bg-white text-black rounded-lg p-4 shadow-lg ${
                            mesa.estado ? "border-2 border-red-500" : "border-2 border-green-500"
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">
                                {mesa.tipo === 1 ? 'Pool' : mesa.tipo === 2 ? 'Común' : 'Extra'} - {mesa.nombre}
                            </h2>
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    mesa.estado ? "bg-red-500 text-red-50" : "bg-green-500 text-green-50"
                                }`}
                            >
                                {mesa.estado ? 'Ocupada' : 'Libre'}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <p>Total a Pagar: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(mesa.total ?? 0)}</p>
                            <div className="flex items-center">
                                <Button variant="outline" onClick={() => handleIncrementHours(mesa.id, -1)} className="px-2 py-1 text-sm w-16">
                                    Hora -
                                </Button>
                                <span className="mx-2">{mesa.tiempo_alquiler} hrs</span>
                                <Button variant="outline" onClick={() => handleIncrementHours(mesa.id, 1)} className="px-2 py-1 text-sm w-16">
                                    Hora +
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between flex-wrap space-y-2">
                            {!mesa.estado && (
                                <Button variant="outline" onClick={() => ocuparMesa(mesa.id)} className="flex-grow w-full">
                                    Ocupar Mesa
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => navigate(`/mesas/${mesa.id}/add-pedido`)} className="flex-grow w-full">
                                Agregar Pedido
                            </Button>
                            <Button variant="outline" onClick={() => navigate(`/mesas/${mesa.id}/pedidos`)} className="flex-grow w-full">
                                Ver Pedidos
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleTableRemove(mesa.id)}
                                className="flex-grow w-full"
                            >
                                Eliminar Mesa
                            </Button>
                        </div>
                    </div>
                ))}
                {/* Formulario para agregar una nueva mesa */}
                <div className="bg-white text-black rounded-lg p-4 flex flex-col items-center justify-center shadow-lg">
                    <form onSubmit={handleNewTableAdd}>
                        <Input
                            type="text"
                            placeholder="Nombre de la Mesa"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                            className="mb-4"
                        />
                        <select
                            value={newTableType}
                            onChange={(e) => setNewTableType(parseInt(e.target.value))}
                            className="mb-4 p-2 border rounded"
                        >
                            <option value={1}>Pool</option>
                            <option value={2}>Común</option>
                            <option value={3}>Extra</option>
                        </select>
                        <Button type="submit" variant="outline" className="w-full">
                            Agregar Nueva Mesa
                        </Button>
                    </form>
                </div>
                {/* Contenedor para la gestión de pedidos */}
                <div className="bg-white text-black rounded-lg p-4 flex flex-col items-center justify-center shadow-lg">
                    <h2 className="text-lg font-bold mb-4">Gestión de Pedidos</h2>
                    <Input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="mb-4"
                    />
                    <Button onClick={handleDownloadReport} className="mb-2 w-full">
                        Descargar Reporte
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAllOrders} className="w-full">
                        Eliminar Todos los Pedidos
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default MesaList;
