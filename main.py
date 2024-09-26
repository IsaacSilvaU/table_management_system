# main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Mesa, Producto, Pedido
from models.base_class import Base
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from io import BytesIO
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List
from schemas import MesaCreate, MesaResponse, PedidoResponse, ProductoResponse

# Modelos Pydantic para las solicitudes
class MesaCreate(BaseModel):
    nombre: str
    tipo: int

class MesaUpdate(BaseModel):
    estado: Optional[bool] = None
    tiempo_alquiler: Optional[float] = None

class PrecioMesaUpdate(BaseModel):
    nuevo_precio: float

class ProductoCreate(BaseModel):
    nombre: str
    precio: float

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None

class PedidoCreate(BaseModel):
    mesa_id: int
    producto_id: Optional[int] = None
    cantidad: int

class IncrementoHorasRequest(BaseModel):
    incremento_horas: int

class EstadoMesa(BaseModel):
    estado: bool

class PrecioUpdate(BaseModel):
    nuevo_precio: float

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

# Endpoints para CRUD de Mesas

@app.post("/mesas/", response_model=MesaResponse)
def agregar_mesa(mesa: MesaCreate, db: Session = Depends(get_db)):
    nueva_mesa = Mesa(nombre=mesa.nombre, tipo=mesa.tipo)
    db.add(nueva_mesa)
    db.commit()
    db.refresh(nueva_mesa)
    return nueva_mesa

@app.get("/mesas/")
def obtener_mesas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    mesas = db.query(Mesa).offset(skip).limit(limit).all()
    return mesas

@app.get("/mesas/{mesa_id}")
def obtener_mesa(mesa_id: int, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa

@app.put("/mesas/{mesa_id}")
def actualizar_mesa(mesa_id: int, mesa_update: MesaUpdate, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    if mesa_update.estado is not None:
        mesa.estado = mesa_update.estado

    if mesa_update.tiempo_alquiler is not None:
        mesa.tiempo_alquiler += mesa_update.tiempo_alquiler
        if mesa.tiempo_alquiler < 0:
            mesa.tiempo_alquiler = 0

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

# Endpoints para gestionar precios de mesas

@app.get("/mesas/precios/")
def obtener_precios_mesas(db: Session = Depends(get_db)):
    precios_mesas = db.query(Mesa.tipo, Mesa.precio).distinct().all()
    return [{"tipo": tipo, "precio": precio} for tipo, precio in precios_mesas]

@app.put("/mesas/precio/{tipo}")
def actualizar_precio_mesa(tipo: int, precio_update: PrecioMesaUpdate, db: Session = Depends(get_db)):
    mesas = db.query(Mesa).filter(Mesa.tipo == tipo).all()
    if not mesas:
        raise HTTPException(status_code=404, detail="Tipo de mesa no encontrado")

    for mesa in mesas:
        mesa.precio = precio_update.nuevo_precio

    db.commit()
    return {"mensaje": "Precio actualizado exitosamente"}

# Endpoint para actualizar tiempo de alquiler

@app.put("/mesas/{mesa_id}/tiempo_alquiler")
def actualizar_tiempo_alquiler(mesa_id: int, request: IncrementoHorasRequest, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    mesa.tiempo_alquiler += request.incremento_horas
    if mesa.tiempo_alquiler < 0:
        mesa.tiempo_alquiler = 0

    db.commit()
    db.refresh(mesa)
    return {"mensaje": "Tiempo de alquiler actualizado exitosamente", "nuevo_tiempo_alquiler": mesa.tiempo_alquiler}

# Endpoint para cambiar el estado de una mesa

@app.put("/mesas/{mesa_id}/estado")
def cambiar_estado_mesa(mesa_id: int, estado: EstadoMesa, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    mesa.estado = estado.estado
    db.commit()
    db.refresh(mesa)
    return mesa

# Endpoints para CRUD de Productos

@app.post("/productos/", response_model=ProductoResponse)
def agregar_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    nuevo_producto = Producto(nombre=producto.nombre, precio=producto.precio)
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@app.get("/productos/", response_model=List[ProductoResponse])
def obtener_productos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    productos = db.query(Producto).offset(skip).limit(limit).all()
    return productos

@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@app.put("/productos/{producto_id}")
def actualizar_producto(producto_id: int, producto_update: ProductoUpdate, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto_update.nombre:
        producto.nombre = producto_update.nombre
    if producto_update.precio:
        producto.precio = producto_update.precio

    db.commit()
    db.refresh(producto)
    return producto

@app.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    db.query(Pedido).filter(Pedido.producto_id == producto_id).delete()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto y pedidos asociados eliminados exitosamente"}

# Endpoints para Pedidos

@app.post("/pedidos/", response_model=PedidoResponse)
def agregar_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == pedido.mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    if pedido.producto_id:
        producto = db.query(Producto).filter(Producto.id == pedido.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        total = producto.precio * pedido.cantidad
    else:
        total = 0.0

    nuevo_pedido = Pedido(
        mesa_id=pedido.mesa_id,
        producto_id=pedido.producto_id,
        cantidad=pedido.cantidad,
        total=total
    )

    db.add(nuevo_pedido)

    # Cambiar el estado de la mesa a "Ocupada"
    mesa.estado = True

    db.commit()
    db.refresh(nuevo_pedido)
    return nuevo_pedido

@app.get("/mesas/{mesa_id}/pedidos/")
def obtener_pedidos_mesa(mesa_id: int, db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa_id, Pedido.pagado == False).all()
    return pedidos

@app.put("/pedidos/{pedido_id}")
def actualizar_pedido(pedido_id: int, cantidad: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    pedido.cantidad = cantidad
    if pedido.producto:
        pedido.total = pedido.producto.precio * cantidad
    else:
        pedido.total = 0.0

    db.commit()
    db.refresh(pedido)
    return pedido

@app.delete("/pedidos/{pedido_id}")
def eliminar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    mesa_id = pedido.mesa_id

    db.delete(pedido)
    db.commit()

    # Verificar si aún quedan pedidos en la mesa
    remaining_pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa_id).count()

    if remaining_pedidos == 0:
        mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
        if mesa:
            mesa.estado = False
            db.commit()

    return {"mensaje": "Pedido eliminado exitosamente"}

@app.delete("/mesas/{mesa_id}/pedidos")
def eliminar_pedidos_mesa(mesa_id: int, db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa_id).all()
    if not pedidos:
        raise HTTPException(status_code=404, detail="No hay pedidos asociados a esta mesa")

    db.query(Pedido).filter(Pedido.mesa_id == mesa_id).delete()

    # Cambiar el estado de la mesa a "Libre"
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if mesa:
        mesa.estado = False
        db.commit()

    return {"mensaje": "Todos los pedidos de la mesa han sido eliminados y la mesa ha sido liberada"}

@app.put("/mesas/{mesa_id}/pedidos/pagar")
def pagar_pedidos_mesa(mesa_id: int, db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.mesa_id == mesa_id, Pedido.pagado == False).all()
    
    # Marcar los pedidos como pagados
    for pedido in pedidos:
        pedido.pagado = True

    # Resetear el estado de la mesa
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if mesa:
        mesa.estado = False
        mesa.tiempo_alquiler = 0

    db.commit()
    return {"mensaje": "Pedidos marcados como pagados y mesa liberada"}

# Endpoint para eliminar todos los pedidos y liberar todas las mesas

@app.delete("/pedidos/")
def eliminar_todos_pedidos(db: Session = Depends(get_db)):
    db.query(Pedido).delete()
    db.query(Mesa).update({Mesa.estado: False})
    db.commit()
    return {"mensaje": "Todos los pedidos han sido eliminados y las mesas han sido liberadas exitosamente."}

# Endpoint para descargar reportes en Excel

@app.get("/pedidos/descargar")
def descargar_pedidos(fecha: str, db: Session = Depends(get_db)):
    try:
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Fecha inválida. Formato correcto: YYYY-MM-DD.")

    inicio_dia = datetime.combine(fecha_obj, datetime.min.time())
    fin_dia = inicio_dia + timedelta(days=1)

    pedidos = (
        db.query(Pedido, Mesa.nombre)
        .join(Mesa, Pedido.mesa_id == Mesa.id)
        .filter(Pedido.fecha >= inicio_dia, Pedido.fecha < fin_dia)
        .all()
    )

    if not pedidos:
        raise HTTPException(status_code=404, detail="No se encontraron pedidos para la fecha especificada.")

    data = []
    total_dia = 0
    for pedido, mesa_nombre in pedidos:
        total_dia += pedido.total
        data.append({
            "Pedido ID": pedido.id,
            "Mesa ID": pedido.mesa_id,
            "Nombre Mesa": mesa_nombre,
            "Producto": pedido.producto.nombre if pedido.producto else "N/A",
            "Cantidad": pedido.cantidad,
            "Total": pedido.total,
            "Fecha": pedido.fecha.strftime("%Y-%m-%d %H:%M:%S"),
            "Pagado": "Sí" if pedido.pagado else "No"  # Nueva columna
        })

    df = pd.DataFrame(data)

    total_row = pd.DataFrame([{
        "Pedido ID": "",
        "Mesa ID": "",
        "Nombre Mesa": "",
        "Producto": "",
        "Cantidad": "",
        "Total": total_dia,
        "Fecha": "Total del día"
    }])

    df = pd.concat([df, total_row], ignore_index=True)

    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Pedidos')
    output.seek(0)

    headers = {
        'Content-Disposition': f'attachment; filename="pedidos_{fecha}.xlsx"'
    }
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)
