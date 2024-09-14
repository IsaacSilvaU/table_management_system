import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MesaList from './components/MesaList';
import ProductoList from './components/ProductoList';
import PedidoList from './components/PedidoList';
import AddMesa from './components/AddMesa';
import AddProducto from './components/AddProducto';
import AddPedido from './components/AddPedido';
import EditProducto from './components/EditProducto';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './components/ui/DropdownMenu';

function App() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <Router>
            <div className="min-h-screen flex flex-col justify-between bg-gray-100">
                <header className="bg-blue-800 text-white p-6 shadow-lg">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold">Gestión de Mesas</h1>
                        <nav className="mt-4">
                            <ul className="flex space-x-6">
                                <li><Link to="/mesas" className="hover:underline">Ver Mesas</Link></li>
                                <li><Link to="/productos" className="hover:underline">Ver Productos</Link></li>
                                <li className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <button 
                                                onClick={toggleDropdown}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none"
                                            >
                                                Más opciones
                                            </button>
                                        </DropdownMenuTrigger>
                                        {isDropdownOpen && (
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => window.location.href = '/add-mesa'}>
                                                    Agregar Mesa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.location.href = '/add-producto'}>
                                                    Agregar Producto
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        )}
                                    </DropdownMenu>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </header>
                <main className="p-6 flex-grow">
                    <Routes>
                        <Route path="/mesas" element={<MesaList />} />
                        <Route path="/productos" element={<ProductoList />} />
                        <Route path="/add-mesa" element={<AddMesa />} />
                        <Route path="/add-producto" element={<AddProducto />} />
                        <Route path="/mesas/:mesaId/pedidos" element={<PedidoList />} />
                        <Route path="/mesas/:mesaId/add-pedido" element={<AddPedido />} />
                        <Route path="/productos/:productoId/editar" element={<EditProducto />} />
                    </Routes>
                </main>
                <footer className="bg-gray-800 text-white p-4">
                    <div className="container mx-auto flex justify-between">
                        <div>
                            <p>Nombre Empresa</p>
                        </div>
                        <div>
                            <p>
                                Desarrollado por: Isaac N. Silva U. | Todos los derechos reservados | El uso no autorizado está prohibido.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
