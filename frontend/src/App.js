import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MesaList from './components/MesaList';
import ProductoList from './components/ProductoList';
import PedidoList from './components/PedidoList';
import AddMesa from './components/AddMesa';
import AddProducto from './components/AddProducto';
import AddPedido from './components/AddPedido';
import EditProducto from './components/EditProducto';
import MesaPedidos from './components/MesaPedidos';  // Importa el nuevo componente

function App() {
    return (
        <Router>
            <div>
                <h1>Gestión de Mesas</h1>
                <nav>
                    <ul>
                        <li><Link to="/mesas">Ver Mesas</Link></li>
                        <li><Link to="/productos">Ver Productos</Link></li>
                        <li><Link to="/add-mesa">Agregar Mesa</Link></li>
                        <li><Link to="/add-producto">Agregar Producto</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/mesas" element={<MesaList />} />
                    <Route path="/productos" element={<ProductoList />} />
                    <Route path="/add-mesa" element={<AddMesa />} />
                    <Route path="/add-producto" element={<AddProducto />} />
                    <Route path="/productos/:productoId/editar" element={<EditProducto />} />
                    <Route path="/mesas/:mesaId/pedidos" element={<MesaPedidos />} />  {/* Nueva ruta */}
                    <Route path="/mesas/:mesaId/add-pedido" element={<AddPedido />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
