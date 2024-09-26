import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';

const ProductoList = () => {
    const [productos, setProductos] = useState([]);
    const [preciosMesas, setPreciosMesas] = useState([]);
    const [editPrecio, setEditPrecio] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        // Cargar productos
        axios.get('http://localhost:8000/productos/')
            .then(response => {
                setProductos(response.data);
            })
            .catch(error => console.error('Error fetching productos:', error));

        // Cargar precios de mesas
        axios.get('http://localhost:8000/mesas/precios/')
            .then(response => {
                console.log("Datos recibidos para precios de mesas:", response.data); // Log para verificar datos recibidos
                // Filtrar tipos únicos
                const tiposUnicos = [...new Map(response.data.map(item => [item.tipo, item])).values()];

                setPreciosMesas(tiposUnicos);
                
                const initialEditPrecio = tiposUnicos.reduce((acc, item) => {
                    acc[item.tipo] = item.precio;
                    return acc;
                }, {});
                setEditPrecio(initialEditPrecio);
            })
            .catch(error => console.error('Error fetching precios de mesas:', error));
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

    const handleUpdatePrecio = async (tipo) => {
        const nuevoPrecio = parseFloat(editPrecio[tipo]);
    
        if (isNaN(nuevoPrecio)) {
            alert("Por favor, ingrese un precio válido.");
            return;
        }
    
        try {
            const data = {
                nuevo_precio: nuevoPrecio
            };
            await axios.put(`http://localhost:8000/mesas/precio/${tipo}`, data);
            alert("Precio actualizado exitosamente");
        } catch (error) {
            console.error('Error updating precio:', error);
            alert("Hubo un error al actualizar el precio.");
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Lista de Productos</h2>
            <ul>
                {productos.map(producto => (
                    <li key={producto.id} className="mb-4">
                        <div className="flex justify-between items-center">
                            <span>{producto.nombre} - {producto.precio}</span>
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={() => navigate(`/productos/${producto.id}/editar`)}>
                                    Editar
                                </Button>
                                <Button variant="outline" onClick={() => handleDelete(producto.id)}>
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Precio por hora de las Mesas</h2>
            <ul>
                {preciosMesas.map(mesa => (
                    <li key={mesa.tipo} className="mb-4">
                        <div className="flex justify-between items-center">
                            <span>Tipo {mesa.tipo === 1 ? 'Pool' : mesa.tipo === 2 ? 'Común' : 'Extra'}</span>
                            <Input
                                type="text"
                                value={editPrecio[mesa.tipo]} // Mostrar precio sin formato
                                onChange={(e) => setEditPrecio({
                                    ...editPrecio,
                                    [mesa.tipo]: e.target.value
                                })}
                                className="w-32"
                            />
                            <Button variant="outline" onClick={() => handleUpdatePrecio(mesa.tipo)}>
                                Actualizar Precio
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductoList;
