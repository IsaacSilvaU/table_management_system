# producto.py
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from .base_class import Base

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    precio = Column(Float, nullable=False)

    pedidos = relationship("Pedido", back_populates="producto")
