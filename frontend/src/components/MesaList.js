import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MesaList = () => {
    const [mesas, setMesas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/mesas/')
            .then(response => {
                const mesasData = response.data.map(mesa => ({
                    ...mesa,
                    tipo: parseInt(mesa.tipo),  // Asegurarse de que 'tipo' es un número
                    estado: mesa.estado === "true"  // Convertir el estado a un booleano
                }));

                // Ordenar las mesas alfabéticamente por nombre
                mesasData.sort((a, b) => a.nombre.localeCompare(b.nombre));

                setMesas(mesasData);
            })
            .catch(error => console.error('Error fetching mesas:', error));
    }, []);

    const ocuparMesa = async (mesaId) => {
        try {
            await axios.put(`http://localhost:8000/mesas/${mesaId}/estado`, { estado: true });
            setMesas(mesas.map(mesa => 
                mesa.id === mesaId ? { ...mesa, estado: true } : mesa
            ));
        } catch (error) {
            console.error('Error changing estado:', error);
        }
    };

    return (
        <div>
            <h2>Mesas</h2>
            <ul>
                {mesas.map(mesa => (
                    <li key={mesa.id}>
                        {mesa.nombre} - {mesa.tipo === 1 ? 'Pool' : 'Común'} - {mesa.estado ? 'Ocupada' : 'Libre'}
                        
                        {/* Solo mostrar el botón "Ocupar Mesa" si la mesa está libre */}
                        {!mesa.estado && (
                            <button onClick={() => ocuparMesa(mesa.id)}>
                                Ocupar Mesa
                            </button>
                        )}
                        
                        <button onClick={() => navigate(`/mesas/${mesa.id}/add-pedido`)}>Agregar Pedido</button>
                        <button onClick={() => navigate(`/mesas/${mesa.id}/pedidos`)}>Ver Pedidos</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MesaList;
