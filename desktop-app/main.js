// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function createWindow() {
    // Crear la ventana del navegador.
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Deshabilitamos nodeIntegration por seguridad.
            contextIsolation: true, // Aislar el contexto.
        },
    });

    // Ruta al index.html del frontend de React.
    const indexPath = path.join(__dirname, '../frontend/build/index.html');

    // Cargar el frontend de React desde la carpeta build.
    win.loadURL(`file://${indexPath}`);

    // Mostrar la ruta en la consola para verificar.
    console.log('Cargando index.html desde:', indexPath);
}

function startBackend() {
    // Ruta al ejecutable del backend (server.exe) que generaremos más adelante.
    const backendPath = path.join(__dirname, '../dist/server/server.exe');

    // Verificar si el ejecutable existe.
    const fs = require('fs');
    if (!fs.existsSync(backendPath)) {
        console.error('No se encontró el backend en:', backendPath);
        return;
    }

    // Ejecutar el backend empaquetado.
    backendProcess = spawn(backendPath, [], {
        shell: true,
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`El proceso del backend terminó con código ${code}`);
    });

    // Mostrar la ruta en la consola para verificar.
    console.log('Ejecutando backend desde:', backendPath);
}

app.whenReady().then(() => {
    createWindow();
    startBackend();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('before-quit', () => {
    // Asegurarse de cerrar el backend al salir de la aplicación.
    if (backendProcess) {
        backendProcess.kill();
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
