# schemas.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Modelo para Producto
class ProductoResponse(BaseModel):
    id: int
    nombre: str
    precio: float

    class Config:
        orm_mode = True

# Modelo para Pedido
class PedidoBase(BaseModel):
    mesa_id: int
    producto_id: Optional[int] = None
    cantidad: int
    pagado: Optional[bool] = False  # Incluir el campo pagado

class PedidoCreate(PedidoBase):
    pass

class PedidoResponse(PedidoBase):
    id: int
    total: float
    fecha: datetime

    class Config:
        orm_mode = True

class MesaBase(BaseModel):
    nombre: str
    tipo: int

class MesaCreate(MesaBase):
    pass

class MesaResponse(MesaBase):
    id: int
    estado: bool
    tiempo_alquiler: float
    precio: float

    class Config:
        orm_mode = True

class MesaUpdate(BaseModel):
    estado: Optional[bool] = None
    tiempo_alquiler: Optional[float] = None

class ProductoCreate(BaseModel):
    nombre: str
    precio: float

class ProductoResponse(BaseModel):
    id: int
    nombre: str
    precio: float

    class Config:
        orm_mode = True