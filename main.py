from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Mesa, Producto, Pedido
from models.base_class import Base
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class EstadoMesa(BaseModel):
    estado: bool
    
# Iniciar la aplicación FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las fuentes. Cambia a una lista específica si es necesario
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los headers
)
# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints para CRUD de Mesas y Productos

@app.post("/mesas/")
def agregar_mesa(nombre: str, tipo: int, db: Session = Depends(get_db)):
    nueva_mesa = Mesa(nombre=nombre, tipo=tipo)
    db.add(nueva_mesa)
    db.commit()
    db.refresh(nueva_mesa)
    return nueva_mesa

@app.get("/mesas/")
def obtener_mesas(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    mesas = db.query(Mesa).offset(skip).limit(limit).all()
    return mesas

@app.put("/mesas/{mesa_id}")
def actualizar_mesa(
    mesa_id: int, 
    estado: bool = None, 
    tiempo_alquiler: float = None, 
    db: Session = Depends(get_db)
):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    
    if estado is not None:
        mesa.estado = estado
    
    if tiempo_alquiler is not None:
        mesa.tiempo_alquiler += tiempo_alquiler  # Sumar el tiempo adicional al tiempo actual
    
    db.commit()
    db.refresh(mesa)
    return mesa


@app.delete("/mesas/{mesa_id}")
def eliminar_mesa(mesa_id: int, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    db.delete(mesa)
    db.commit()
    return {"mensaje": "Mesa eliminada exitosamente"}

# Endpoints para CRUD de Productos
@app.post("/productos/")
def agregar_producto(nombre: str, precio: float, db: Session = Depends(get_db)):
    nuevo_producto = Producto(nombre=nombre, precio=precio)
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@app.get("/productos/")
def obtener_productos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    productos = db.query(Producto).offset(skip).limit(limit).all()
    return productos

@app.put("/productos/{producto_id}")
def actualizar_producto(producto_id: int, nombre: str = None, precio: float = None, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if nombre:
        producto.nombre = nombre
    if precio:
        producto.precio = precio
    db.commit()
    db.refresh(producto)
    return producto

""" @app.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado exitosamente"}
 """
@app.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    # Primero eliminamos los pedidos asociados al producto
    db.query(Pedido).filter(Pedido.producto_id == producto_id).delete()

    # Ahora eliminamos el producto
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto y pedidos asociados eliminados exitosamente"}


#### Control de Pedidos ####

@app.post("/pedidos/")
def agregar_pedido(mesa_id: int, producto_id: int, cantidad: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    total = producto.precio * cantidad
    nuevo_pedido = Pedido(mesa_id=mesa_id, producto_id=producto_id, cantidad=cantidad, total=total)
    db.add(nuevo_pedido)
    
    # Cambiar el estado de la mesa a "Ocupada"
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    mesa.estado = True
    db.commit()
    db.refresh(nuevo_pedido)
    return nuevo_pedido

@app.get("/mesas/{mesa_id}/pedidos/")
def obtener_pedidos_mesa(mesa_id: int, db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa_id).all()
    return pedidos

@app.put("/pedidos/{pedido_id}")
def actualizar_pedido(pedido_id: int, cantidad: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Recalcular el total basado en la nueva cantidad
    pedido.cantidad = cantidad
    pedido.total = pedido.producto.precio * cantidad
    
    db.commit()
    db.refresh(pedido)
    return pedido


@app.delete("/pedidos/{pedido_id}")
def eliminar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    db.delete(pedido)
    db.commit()

    # Verificar si aún quedan pedidos en la mesa
    mesa = db.query(Mesa).filter(Mesa.id == pedido.mesa_id).first()
    remaining_pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa.id).count()

    if remaining_pedidos == 0:
        mesa.estado = False  # Liberar la mesa si no hay más pedidos
        db.commit()

    return {"mensaje": "Pedido eliminado exitosamente"}

@app.delete("/mesas/{mesa_id}/pedidos")
def eliminar_pedidos_mesa(mesa_id: int, db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa_id).all()
    if not pedidos:
        raise HTTPException(status_code=404, detail="No hay pedidos asociados a esta mesa")
    
    # Eliminar todos los pedidos de la mesa
    db.query(Pedido).filter(Pedido.mesa_id == mesa_id).delete()
    
    # Cambiar el estado de la mesa a "Libre"
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    mesa.estado = False
    db.commit()
    return {"mensaje": "Todos los pedidos de la mesa han sido eliminados y la mesa ha sido liberada"}

@app.put("/mesas/{mesa_id}/estado")
def cambiar_estado_mesa(mesa_id: int, estado: EstadoMesa, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    
    mesa.estado = estado.estado
    db.commit()
    db.refresh(mesa)
    return mesa

