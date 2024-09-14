import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';

const MesaList = () => {
    const [mesas, setMesas] = useState([]);
    const [newTableName, setNewTableName] = useState("");
    const [newTableType, setNewTableType] = useState(1); // 1: Pool, 2: Común

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/mesas/')
            .then(response => {
                const mesasData = response.data.map(mesa => ({
                    ...mesa,
                    tipo: parseInt(mesa.tipo),
                    estado: mesa.estado === "true",
                    total: mesa.total + (mesa.tiempo_alquiler * mesa.precio),  // Sumamos el tiempo de alquiler al total
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
            await axios.put(`http://localhost:8000/mesas/${mesaId}/estado`, { estado: true });
            const mesaActualizada = mesas.find(mesa => mesa.id === mesaId);
            handleIncrementHours(mesaId, 1);  // Incrementar una hora al ocupar la mesa
            setMesas(mesas.map(mesa => 
                mesa.id === mesaId ? { ...mesa, estado: true } : mesa
            ));
        } catch (error) {
            console.error('Error changing estado:', error);
        }
    };

    const handleTableRemove = async (mesaId) => {
        try {
            await axios.delete(`http://localhost:8000/mesas/${mesaId}`);
            setMesas(mesas.filter(mesa => mesa.id !== mesaId));
        } catch (error) {
            console.error('Error removing table:', error);
        }
    };

    const handleNewTableAdd = async (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
        if (newTableName.trim() !== "") {
            try {
                const params = new URLSearchParams({ nombre: newTableName, tipo: parseInt(newTableType) });
                const response = await axios.post(`http://localhost:8000/mesas/?${params.toString()}`);
                setMesas([...mesas, response.data]);
                setNewTableName("");
                setNewTableType(1); // Resetear el tipo de mesa al valor predeterminado
            } catch (error) {
                console.error('Error adding new table:', error);
            }
        }
    };

    const handleIncrementHours = async (mesaId, incremento) => {
        try {
            const response = await axios.put(`http://localhost:8000/mesas/${mesaId}/tiempo_alquiler`, {
                incremento_horas: incremento // Asegúrate de enviar un objeto con este campo
            });
            setMesas(mesas.map(mesa => 
                mesa.id === mesaId 
                    ? { 
                        ...mesa, 
                        tiempo_alquiler: response.data.nuevo_tiempo_alquiler,
                        total: response.data.nuevo_tiempo_alquiler * mesa.precio + mesa.total - (mesa.tiempo_alquiler * mesa.precio)
                    } 
                    : mesa
            ));
        } catch (error) {
            console.error('Error incrementing hours:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
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
                            <Button variant="outline" onClick={() => handleTableRemove(mesa.id)} className="flex-grow w-full">
                                Eliminar Mesa
                            </Button>
                        </div>
                    </div>
                ))}
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
            </main>
        </div>
    );
};

export default MesaList;

