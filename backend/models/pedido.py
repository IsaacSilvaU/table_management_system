# models.py

from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base_class import Base

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True, index=True)
    mesa_id = Column(Integer, ForeignKey("mesas.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True)
    cantidad = Column(Integer)
    total = Column(Float)
    fecha = Column(DateTime, default=datetime.utcnow)
    pagado = Column(Boolean, default=False)  # Nuevo campo para indicar si el pedido ha sido pagado
    # Relaciones
    mesa = relationship("Mesa", back_populates="pedidos")
    producto = relationship("Producto", back_populates="pedidos")


