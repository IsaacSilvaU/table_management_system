from sqlalchemy import Column, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from .base_class import Base

class Mesa(Base):
    __tablename__ = "mesas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    tipo = Column(Integer, nullable=False)  # 1 para Pool, 2 para Común
    estado = Column(Boolean, default=False)  # False para Libre, True para Ocupada
    tiempo_alquiler = Column(Float, default=0.0)  # Solo para mesas de pool

    pedidos = relationship("Pedido", back_populates="mesa")
