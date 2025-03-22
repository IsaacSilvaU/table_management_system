# Sistema de Gestión de Mesas y Productos

## Descripción

Este es un sistema de administración para un negocio que alquila mesas de juego de pool y mesas comunes, donde los clientes pueden consumir productos (bebidas, comidas, etc.) y alquilar mesas por tiempo. El programa permite al encargado gestionar tanto las mesas como los productos, registrar el consumo de cada mesa, totalizar los gastos, y generar informes diarios.

## Características Principales

- **Gestión de Mesas**: Agregar, editar, eliminar y visualizar mesas (mesas de pool y mesas comunes).
- **Gestión de Productos**: Añadir, editar y eliminar productos (bebidas, snacks, etc.).
- **Registro de Consumos**: Registrar el tiempo de uso de las mesas de pool y los productos consumidos.
- **Liberación de Mesas**: Liberar mesas una vez que el cliente ha pagado, manteniendo el historial de pedidos para informes.
- **Generación de Informes**: Descargar un informe diario en formato Excel con el detalle de los pedidos y los totales del día.
- **Control del Estado de Mesas**: Cambiar el estado de la mesa entre "Libre" y "Ocupada" automáticamente según los pedidos.
- **Eliminar todos los pedidos y liberar todas las mesas**: Función para resetear el sistema al final del día.

## Tecnologías Utilizadas

- **Frontend**: React.js
- **Backend**: FastAPI
- **Base de datos**: PostgreSQL
- **ORM**: SQLAlchemy
- **Generación de Informes**: Pandas, XlsxWriter
- **Autenticación CORS**: FastAPI CORS Middleware
- **Despliegue (opcional)**: Docker

## Requisitos Previos

- [Node.js](https://nodejs.org/) instalado para el frontend (React.js).
- [Python 3.8+](https://www.python.org/) instalado para el backend (FastAPI).

## Instalación

### Clonar el Repositorio
