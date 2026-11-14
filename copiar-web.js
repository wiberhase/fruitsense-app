// Copia la interfaz de ../web a www/ (sin la API PHP: esa se queda en la PC).
// Así la página y la app siempre son iguales.
const fs = require('fs');
const path = require('path');
const origen = path.join(__dirname, '..', 'web');
const destino = path.join(__dirname, 'www');
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });
for (const f of ['index.html', 'estilos.css', 'app.js', 'icono.svg', 'manifest.json']) {
  fs.copyFileSync(path.join(origen, f), path.join(destino, f));
}
console.log('Interfaz copiada a app/www');
