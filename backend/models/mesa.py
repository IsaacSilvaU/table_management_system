# mesa.py
from sqlalchemy import Column, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from .base_class import Base

class Mesa(Base):
    __tablename__ = "mesas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    tipo = Column(Integer, nullable=False)  # Cambiado a String para que coincida con la base de datos
    estado = Column(Boolean, default=False)  # False para Libre, True para Ocupada
    tiempo_alquiler = Column(Float, default=0.0)  # Solo para mesas de pool
    precio = Column(Float, default=0.0)  # Precio de mesas
    pedidos = relationship("Pedido", back_populates="mesa")