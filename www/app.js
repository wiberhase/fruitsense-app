// Fruit Sense · interfaz compartida por la página web y la app Android.
// En la web la API está en la misma carpeta ("api/"); en la app se guarda la
// dirección de la PC en el teléfono (Ajustes → Servidor).

const EN_APP = !!window.Capacitor;
const COLORES = {
  'Verde': 'var(--e-verde)', 'Rompiente': 'var(--e-rompiente)', 'Cambiante': 'var(--e-cambiante)',
  'Rosado': 'var(--e-rosado)', 'Rojo claro': 'var(--e-rojo-claro)', 'Rojo': 'var(--e-rojo)',
};
const CONSEJOS = {
  'Verde': 'Todavía inmaduro. Faltan varios días.',
  'Rompiente': 'Empieza a cambiar de color.',
  'Cambiante': 'Más de la mitad cambiando de color.',
  'Rosado': 'Casi listo. Bueno para transporte largo.',
  'Rojo claro': 'Listo en uno o dos días.',
  'Rojo': 'Maduro. Listo para consumir.',
};

// Color del fruto y "ánimo" de la carita para cada etapa (igual que en la app Fruit Sense)
const DIBUJO = {
  'Verde':      { color: '#4caf50', animo: 'dormido' },
  'Rompiente':  { color: '#a5c83a', animo: 'despierto' },
  'Cambiante':  { color: '#f2a93b', animo: 'despierto' },
  'Rosado':     { color: '#f4846c', animo: 'contento' },
  'Rojo claro': { color: '#ea5a3f', animo: 'contento' },
  'Rojo':       { color: '#d32f2f', animo: 'feliz' },
};

// Jitomate dibujado en SVG. etapa = null → silueta gris (cámara vacía / calibrando)
function jitomate(etapa, tam = 72, animado = true) {
  const d = DIBUJO[etapa];
  // Mismo id para el mismo dibujo: así el HTML no cambia en cada actualización y la animación no se reinicia
  const id = 'jb-' + String(etapa ?? 'vacio').replace(/\s/g, '') + '-' + tam;
  const fruto = 'M100 58C60 50 22 75 24 118c2 42 38 64 76 64s74-22 76-64c2-43-36-68-76-60Z';
  const animo = d ? d.animo : 'vacio';
  let cara = '';
  if (animo === 'dormido') {
    cara = '<path class="trazo" d="M72 112q8 7 16 0M112 112q8 7 16 0"/><path class="trazo" d="M95 134q5 3 10 0"/>';
  } else if (animo === 'feliz') {
    cara = '<path class="trazo" d="M72 115q8-10 16 0M112 115q8-10 16 0"/><path class="boca" d="M84 127q16 24 32 0Z"/>'
      + '<ellipse class="cachete" cx="66" cy="130" rx="9" ry="5"/><ellipse class="cachete" cx="134" cy="130" rx="9" ry="5"/>';
  } else if (animo !== 'vacio') {
    cara = '<g class="ojos"><circle class="ojo" cx="80" cy="112" r="6.5"/><circle class="ojo" cx="120" cy="112" r="6.5"/>'
      + '<circle cx="82.5" cy="109.5" r="2.2" fill="#fff"/><circle cx="122.5" cy="109.5" r="2.2" fill="#fff"/></g>'
      + (animo === 'contento'
        ? '<path class="trazo" d="M86 130q14 14 28 0"/><ellipse class="cachete" cx="66" cy="128" rx="9" ry="5"/><ellipse class="cachete" cx="134" cy="128" rx="9" ry="5"/>'
        : '<path class="trazo" d="M91 132q9 7 18 0"/>');
  }
  const extra = !animado ? '' : animo === 'dormido'
    ? '<g class="zzz"><text x="150" y="70">z</text><text x="162" y="52" class="z2">z</text></g>'
    : animo === 'feliz'
      ? '<g class="destellos"><path d="M38 62l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><path class="d2" d="M166 86l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path class="d3" d="M160 160l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5Z"/></g>'
      : '';
  return `<svg class="jit ${animo}${animado ? '' : ' quieto'}" viewBox="0 0 200 200" width="${tam}" height="${tam}" role="img" aria-label="Jitomate ${esc(etapa ?? '')}">
    <defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity="0.32"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></radialGradient></defs>
    <ellipse class="sombra" cx="100" cy="188" rx="58" ry="7"/>
    <g class="cuerpo">
      <path class="fruto" style="fill:${d ? d.color : 'var(--borde)'}" d="${fruto}"/>
      <path fill="url(#${id})" d="${fruto}"/>
      <path class="gajo" d="M68 66c-12 26-12 66 4 104M132 66c12 26 12 66-4 104"/>
      <ellipse cx="62" cy="92" rx="11" ry="20" transform="rotate(-28 62 92)" fill="#fff" opacity="0.35"/>
      <g class="caliz"><path class="tallo" d="M100 54c-1-10 2-18 9-24"/>
        <path class="hojas" d="M100 50 88 40l4 11-18 2 16 7-12 12 15-6 1 14 7-13 9 12-1-14 16 5-13-11 17-6-18-1 5-11Z"/></g>
      <g class="cara">${cara}</g>
    </g>${extra}</svg>`;
}

const $ = (id) => document.getElementById(id);
function ponerHTML(el, html) { if (el.dataset.html !== html) { el.innerHTML = html; el.dataset.html = html; } }
const guardado = (k, def = '') => { try { return localStorage.getItem(k) ?? def; } catch { return def; } };
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };

let base = EN_APP ? guardado('fs-servidor') : '';
let rango = guardado('fs-rango', 'hoy');
let equipoSel = guardado('fs-equipo');
let ultimoEstado = null;
let fallos = 0;

function api(ruta) {
  const raiz = base ? base.replace(/\/+$/, '') + '/' : '';
  return raiz + 'api/' + ruta;
}

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hora(fecha) {
  const d = new Date(fecha.replace(' ', 'T'));
  const hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  const h = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return mismoDia ? h : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' ' + h;
}

function hace(seg) {
  if (seg == null) return 'nunca';
  if (seg < 60) return `hace ${seg} s`;
  if (seg < 3600) return `hace ${Math.round(seg / 60)} min`;
  return `hace ${Math.round(seg / 3600)} h`;
}

function aviso(texto) {
  $('aviso').hidden = !texto;
  $('aviso').textContent = texto || '';
}

// ---------------- Carga de datos ----------------

// Copia de lo último que se vio, guardada en el teléfono / navegador.
// Si el servidor no responde, se muestra esa copia para que no desaparezcan los registros.
function claveCopia() { return 'fs-copia|' + base + '|' + equipoSel + '|' + rango; }

function guardarCopia(datos) {
  guardar(claveCopia(), JSON.stringify({ guardado: Date.now(), datos }));
}

function leerCopia() {
  try { return JSON.parse(guardado(claveCopia()) || 'null'); } catch { return null; }
}

function mostrarCopia(motivo) {
  const copia = leerCopia();
  if (!copia) {
    aviso(motivo + ' Todavía no hay datos guardados en este dispositivo.');
    return;
  }
  const cuando = new Date(copia.guardado).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  aviso(motivo + ` Mostrando lo último que se vio (${cuando}).`);
  if (ultimoEstado !== copia.datos) {
    ultimoEstado = copia.datos;
    pintar(copia.datos, true);
  }
}

async function cargar() {
  if (EN_APP && !base) {
    aviso('Configura la dirección de la PC en Ajustes → Servidor.');
    return;
  }
  const params = new URLSearchParams({ limite: 100 });
  if (equipoSel) params.set('dispositivo', equipoSel);
  if (rango === 'hoy') params.set('desde', hoyISO());
  const corte = new AbortController();
  const tiempo = setTimeout(() => corte.abort(), 8000);  // si la PC no contesta en 8 s, se da por caída
  try {
    const r = await fetch(api('estado.php?' + params), { cache: 'no-store', signal: corte.signal });
    const datos = await r.json();
    if (!r.ok) throw new Error(datos.error || r.statusText);
    fallos = 0;
    aviso('');
    ultimoEstado = datos;
    guardarCopia(datos);
    pintar(datos);
  } catch (e) {
    fallos++;
    if (fallos >= 2 || !ultimoEstado) {
      mostrarCopia('Sin conexión con el servidor. Revisa que la PC tenga encendido XAMPP (Apache y MySQL)'
        + (EN_APP ? ' y que la dirección en Ajustes sea la correcta.' : '.'));
    }
  } finally {
    clearTimeout(tiempo);
  }
}

function pintar(d, sinConexion = false) {
  // Selector de equipos
  const sel = $('equipo');
  const opciones = ['<option value="">Todos los equipos</option>']
    .concat(d.equipos.map((e) => `<option value="${esc(e.id)}">${esc(e.nombre)}</option>`)).join('');
  if (sel.dataset.html !== opciones) { sel.innerHTML = opciones; sel.dataset.html = opciones; }
  sel.value = equipoSel;

  // Conexión
  const equipos = equipoSel ? d.equipos.filter((e) => e.id === equipoSel) : d.equipos;
  const enLinea = equipos.some((e) => e.en_linea);
  const masReciente = equipos.reduce((m, e) => (e.hace_seg != null && (m == null || +e.hace_seg < m) ? +e.hace_seg : m), null);
  $('conexion').className = 'insignia ' + (enLinea && !sinConexion ? 'ok' : 'mal');
  $('conexion').textContent = sinConexion ? 'Sin conexión'
    : enLinea ? 'Medidor en línea' : (masReciente == null ? 'Sin medidor' : 'Desconectado · ' + hace(masReciente));

  const deLaUltima = d.equipos.find((e) => e.id === d.ultima_lectura?.dispositivo);
  const enCurso = d.jitomates.find((j) => j.en_curso && (!d.ultima_lectura || j.dispositivo === d.ultima_lectura.dispositivo));
  pintarAhora(d.ultima_lectura, !!deLaUltima?.calibrando, !!deLaUltima?.en_linea && !sinConexion,
    sinConexion ? null : enCurso, d.lados_por_jitomate);
  pintarResumen(d.resumen);
  pintarLista(d.jitomates);
}

function puntosLados(lados, total) {
  let html = '<span class="lados">';
  for (let i = 0; i < total; i++) {
    const l = lados[i];
    html += `<span class="lado-punto${l ? '' : ' falta'}" style="${l ? 'background:' + (COLORES[l.etapa] || 'var(--tenue)') : ''}" title="${l ? 'Lado ' + (i + 1) + ': ' + esc(l.etapa) : 'Lado ' + (i + 1) + ' pendiente'}"></span>`;
  }
  return html + '</span>';
}

function pintarAhora(l, calibrando, enLinea, enCurso, porJitomate) {
  const cuerpo = $('ahora-cuerpo');
  if (!l) { cuerpo.className = 'vacio-texto'; ponerHTML(cuerpo, 'Todavía no llegan lecturas.'); return; }
  let titulo, color, sub, etapaDibujo = null;
  if (l.origen === 'boton') {
    titulo = l.etapa ? 'Última medición: ' + l.etapa : 'Última medición'; color = COLORES[l.etapa] || 'var(--tenue)';
    etapaDibujo = l.etapa;
    sub = CONSEJOS[l.etapa] || 'Presiona MEDIR con el jitomate en la cámara.';
  } else if (l.tipo === 'entorno' || calibrando) {
    titulo = 'Calibrando entorno'; color = 'var(--tenue)'; sub = 'Deja la cámara vacía unos segundos.';
  } else if (l.tipo === 'jitomate') {
    titulo = 'Jitomate detectado'; color = 'var(--primario)'; sub = 'No lo muevas: se está midiendo.';
    etapaDibujo = l.etapa;
  } else {
    titulo = 'Cámara vacía'; color = 'var(--borde)'; sub = 'Coloca un jitomate para medirlo.';
  }
  let progreso = '';
  if (enCurso && !calibrando) {
    const n = enCurso.lados.length;
    titulo = `Lado ${n} de ${porJitomate} medido`;
    color = COLORES[enCurso.etapa] || 'var(--primario)';
    etapaDibujo = enCurso.etapa;
    sub = enCurso.origen === 'boton'
      ? 'Gira el jitomate y presiona MEDIR para el siguiente lado.'
      : (l.tipo === 'jitomate' ? 'Midiendo… luego levántalo, gíralo y vuelve a ponerlo.' : 'Gira el jitomate y vuelve a ponerlo en la cámara.');
    progreso = `<div class="progreso">${puntosLados(enCurso.lados, porJitomate)}
      <button class="boton secundario chico" data-terminar="${esc(enCurso.dispositivo)}">Terminar con ${n} lado${n === 1 ? '' : 's'}</button></div>`;
  }
  if (!enLinea) sub = 'El medidor no ha enviado datos recientemente.';
  cuerpo.className = '';
  ponerHTML(cuerpo, `
    <div class="ahora">
      <div class="ahora-dibujo">${jitomate(etapaDibujo, 84)}</div>
      <div>
        <div class="ahora-titulo">${esc(titulo)}</div>
        <div class="tenue">${esc(sub)}</div>
        <div class="datos">
          <span>R/G <b>${l.ratio ?? '—'}</b></span>
          <span>Tono <b>${l.hue ?? '—'}°</b></span>
          <span>Luz <b>${l.c_prom ?? '—'}</b></span>
          <span>Sensores <b>${l.sensores_ok ?? 0}/3</b></span>
          <span>${esc(hora(l.recibido_en))}</span>
        </div>
        ${progreso}
      </div>
    </div>`);
}

function pintarResumen(res) {
  const total = Object.values(res).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(res));
  $('resumen').innerHTML = Object.entries(res).map(([etapa, n]) => `
    <div class="barra-etapa">
      <span>${esc(etapa)}</span>
      <div class="pista"><div class="relleno" style="width:${(n / max) * 100}%;background:${COLORES[etapa]}"></div></div>
      <span class="num">${n}</span>
    </div>`).join('') + (total ? '' : '<p class="tenue">Sin jitomates en este periodo.</p>');
}

function pintarLista(js) {
  $('total').textContent = js.length ? `${js.length}${js.length >= 100 ? '+' : ''}` : '';
  if (!js.length) { ponerHTML($('lista'), '<li class="tenue" style="cursor:default">Aún no hay jitomates medidos.</li>'); return; }
  ponerHTML($('lista'), js.map((j) => `
    <li data-id="${j.id}">
      <span class="mini">${jitomate(j.etapa, 36, false)}</span>
      <div class="principal">
        <div class="etapa">${esc(j.etapa ?? 'Sin clasificar')}
          ${j.en_curso ? '<span class="insignia ok">Midiendo</span>' : ''}
          ${j.desigual ? '<span class="insignia aviso-ins">Desigual</span>' : ''}</div>
        <div class="tenue">${esc(hora(j.medido_en))} · ${j.lados.length} de ${ultimoEstado.lados_por_jitomate} lados</div>
      </div>
      <div class="lado">${puntosLados(j.lados, ultimoEstado.lados_por_jitomate)}<br>${j.hue ?? '—'}°</div>
    </li>`).join(''));
}

function abrirDetalle(id) {
  const j = ultimoEstado?.jitomates.find((x) => String(x.id) === String(id));
  if (!j) return;
  const porJ = ultimoEstado.lados_por_jitomate;
  const nota = j.desigual
    ? `<p class="aviso">Maduración desigual: un lado está en <b>${esc(j.etapa_min)}</b> y otro en <b>${esc(j.etapa_max)}</b>. La etapa del jitomate es el promedio de los lados.</p>`
    : (j.lados.length < porJ && !j.en_curso ? `<p class="tenue">Solo se midieron ${j.lados.length} de ${porJ} lados.</p>` : '');
  $('detalle').innerHTML = `
    <div class="ahora" style="margin-bottom:12px">
      <div class="ahora-dibujo">${jitomate(j.etapa, 84)}</div>
      <div><div class="ahora-titulo">${esc(j.etapa ?? 'Sin clasificar')}</div><div class="tenue">${esc(CONSEJOS[j.etapa] || '')}</div></div>
    </div>
    ${nota}
    <table class="tabla">
      ${j.lados.map((l, i) => `<tr><td><span class="mini-lado">${jitomate(l.etapa, 24, false)}</span>Lado ${i + 1}: ${esc(l.etapa)}</td><td>${l.hue ?? '—'}° · R/G ${l.ratio ?? '—'}</td></tr>`).join('')}
      <tr><td><b>Jitomate (promedio)</b></td><td><b>${j.hue ?? '—'}° · R/G ${j.ratio ?? '—'}</b></td></tr>
      <tr><td>Fecha</td><td>${esc(hora(j.medido_en))}</td></tr>
      <tr><td>Equipo</td><td>${esc(j.dispositivo)}</td></tr>
      <tr><td>Forma de medir</td><td>${j.origen === 'boton' ? 'Botón MEDIR' : 'Automática'}</td></tr>
    </table>`;
  $('dlg-detalle').showModal();
}

async function terminarJitomate(dispositivo) {
  try {
    await fetch(api('jitomate.php'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dispositivo }) });
  } catch { /* se reintenta en la siguiente actualización */ }
  cargar();
}

// ---------------- Ajustes ----------------

async function abrirAjustes() {
  $('bloque-servidor').hidden = !EN_APP;
  $('servidor').value = base;
  $('pin').value = guardado('fs-pin');
  $('msg-ajustes').textContent = '';
  $('dlg-ajustes').showModal();
  if (EN_APP && !base) return;
  try {
    const r = await fetch(api('ajustes.php'), { cache: 'no-store' });
    const { ajustes } = await r.json();
    $('a-umbral').value = Math.round(ajustes.umbral_cambio * 100);
    $('a-min').value = ajustes.min_lecturas;
    $('a-lados').value = ajustes.lados_por_jitomate;
    $('a-entre').value = ajustes.max_entre_lados_s;
    for (const k of ['hue_verde', 'hue_rompiente', 'hue_cambiante', 'hue_rosado', 'hue_rojo_claro']) $('a-' + k).value = ajustes[k];
  } catch {
    $('msg-ajustes').textContent = 'No se pudieron leer los ajustes.';
  }
}

async function enviarAjustes(cuerpo) {
  const pin = $('pin').value.trim();
  guardar('fs-pin', pin);
  const r = await fetch(api('ajustes.php'), {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pin': pin }, body: JSON.stringify(cuerpo),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || r.statusText);
  return d;
}

$('guardar-ajustes').onclick = async () => {
  const ajustes = {
    umbral_cambio: Number($('a-umbral').value) / 100,
    min_lecturas: Number($('a-min').value),
    lados_por_jitomate: Number($('a-lados').value),
    max_entre_lados_s: Number($('a-entre').value),
  };
  for (const k of ['hue_verde', 'hue_rompiente', 'hue_cambiante', 'hue_rosado', 'hue_rojo_claro']) ajustes[k] = Number($('a-' + k).value);
  try {
    await enviarAjustes({ ajustes });
    $('msg-ajustes').textContent = 'Ajustes guardados. Se aplican a las mediciones nuevas.';
  } catch (e) {
    $('msg-ajustes').textContent = e.message;
  }
};

$('recalibrar').onclick = async () => {
  const equipo = equipoSel || ultimoEstado?.equipos.find((e) => e.en_linea)?.id || ultimoEstado?.equipos[0]?.id;
  if (!equipo) { $('msg-ajustes').textContent = 'No hay ningún medidor registrado todavía.'; return; }
  try {
    const d = await enviarAjustes({ recalibrar: equipo });
    $('msg-ajustes').textContent = d.mensaje;
    cargar();
  } catch (e) {
    $('msg-ajustes').textContent = e.message;
  }
};

$('guardar-servidor').onclick = () => {
  let v = $('servidor').value.trim();
  if (v && !/^https?:\/\//i.test(v)) v = 'http://' + v;
  base = v;
  guardar('fs-servidor', v);
  $('servidor').value = v;
  $('dlg-ajustes').close();
  cargar();
};

// ---------------- Eventos ----------------

$('btn-ajustes').onclick = abrirAjustes;
$('equipo').onchange = (e) => { equipoSel = e.target.value; guardar('fs-equipo', equipoSel); cargar(); };
$('lista').onclick = (e) => { const li = e.target.closest('li[data-id]'); if (li) abrirDetalle(li.dataset.id); };
$('ahora-cuerpo').onclick = (e) => { const b = e.target.closest('[data-terminar]'); if (b) terminarJitomate(b.dataset.terminar); };
document.querySelectorAll('.segmentos button').forEach((b) => {
  b.classList.toggle('activo', b.dataset.rango === rango);
  b.onclick = () => {
    rango = b.dataset.rango;
    guardar('fs-rango', rango);
    document.querySelectorAll('.segmentos button').forEach((x) => x.classList.toggle('activo', x === b));
    cargar();
  };
});

if (EN_APP && !base) abrirAjustes();
const copiaInicial = leerCopia();
if (copiaInicial) { ultimoEstado = copiaInicial.datos; pintar(copiaInicial.datos, true); }  // se ve algo al instante
cargar();
setInterval(() => { if (!document.hidden) cargar(); }, 3000);

if ('serviceWorker' in navigator && !EN_APP && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
