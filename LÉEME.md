# Joyería Valenne — sitio web

Tienda estática (HTML + CSS + JavaScript, sin dependencias ni compilación) con las
**311 piezas** del catálogo `CAT0826.pdf`.

---

## ⚠️ Antes de publicar: 3 datos por cambiar

Todo está en **`assets/js/tienda.js`**, primeras líneas:

```js
const CONFIG = {
  whatsapp: '520000000000',            // ← número real, formato internacional sin "+"
  usuarioInstagram: 'joyeria_valenne', // ← usuario real, sin la arroba
  correo: 'hola@joyeriavalenne.com',   // ← correo real
  moneda: 'MXN',
  envioGratisDesde: 1500,
};
```

- **WhatsApp**: `52` + LADA + número, todo junto. Ej.: `5215512345678`.
  Mientras diga `520000000000`, los botones de pedido no llegan a ningún lado.
- **Instagram**: el sitio arma solo el enlace y la etiqueta `@usuario`.
- El aviso de *envío gratis desde $1,500* aparece en el encabezado de ambas páginas
  (`index.html` y `catalogo.html`); si cambias `envioGratisDesde`, ajusta también ese texto.

---

## Cómo verlo

El sitio carga el catálogo con `fetch`, así que **no funciona abriendo el archivo
directamente** (`file://`). Levanta un servidor local:

```bash
cd ~/Desktop/Joyeria && python3 -m http.server 8123
```

Y abre <http://localhost:8123>.

---

## Estructura

```
Joyeria/
├── index.html              Portada
├── catalogo.html           Catálogo con filtros y buscador
└── assets/
    ├── css/estilos.css     Todo el diseño
    ├── js/tienda.js        Catálogo, carrito, animaciones · CONFIG arriba
    ├── data/productos.json Los 311 productos
    └── img/
        ├── logo.svg
        ├── instagram-pulseras.jpg
        ├── cine/           Piezas recortadas sin fondo (3 en uso + 3 de repuesto)
        └── productos/      311 fotos (800 px) + thumb/ (420 px)
```

---

## El catálogo

`assets/data/productos.json` — un objeto por pieza:

```json
{
  "sku": "GAJ15750",
  "nombre": "Cadena Figaro",
  "slug": "cadena-figaro-gaj15750",
  "precio": 829,
  "categoria": "Cadenas",
  "material": "Chapa de oro",
  "medidas": ["4 mm", "50 cm"],
  "img": "assets/img/productos/GAJ15750.jpg",
  "thumb": "assets/img/productos/thumb/GAJ15750.jpg"
}
```

| | |
|---|---|
| **Total** | 311 piezas |
| **Materiales** | Chapa de oro (233) · Acero inoxidable (78) |
| **Categorías** | Pulseras 77 · Aretes 59 · Gargantillas 56 · Anillos 29 · Cadenas 23 · Rosarios 19 · Juegos 18 · Dijes 15 · Misterios 9 · Arracadas 3 · Grapas 3 |
| **Precios** | $59 – $1,639 MXN |

### Agregar o cambiar piezas

1. Pon la foto en `assets/img/productos/SKU.jpg` (cuadrada, 800×800) y una
   copia de 420×420 en `assets/img/productos/thumb/SKU.jpg`.
2. Agrega el objeto al JSON. Los filtros y contadores se recalculan solos —
   si inventas una categoría nueva, añádela a `ordenCat` en `tienda.js`
   para fijar su posición en la lista de filtros.

### Precios por revisar

Los códigos y precios se leyeron por OCR del PDF y se verificaron contra la imagen.
Dos casos vienen así **desde el catálogo original**, no son errores de lectura:

- **GS03834** — dice `$1639`. Es un anillo de chapa; sus vecinos cuestan $169 y $199,
  así que probablemente el catálogo tiene un dígito de más. **Conviene confirmarlo.**
- **CAR3590** — el resto de la serie usa el prefijo `GAR`. El PDF dice `CAR`.

---

## Cómo funciona

**Catálogo** — filtros por categoría y material (con contadores), rango de precio,
buscador que ignora acentos y también encuentra por SKU, y cuatro ordenamientos.
Los enlaces aceptan parámetros: `catalogo.html?categoria=Anillos`,
`catalogo.html?material=Acero+inoxidable`, `catalogo.html?q=trebol`.

**Carrito** — se guarda en `localStorage` (clave `valenne-carrito`), así que sobrevive
al cerrar la pestaña. El botón "Enviar pedido" arma un mensaje de WhatsApp con las
piezas, cantidades, SKU y total. No hay pasarela de pago: el pedido se cierra por chat.

**Portada** — las tres piezas flotantes son PNG sin fondo en `assets/img/cine/`
(`cadena`, `cruz`, `arete`). Hay tres recortes más de repuesto — `dije`, `medalla`
y `torzal` — por si quieres cambiar la composición: basta con editar los `<img>`
del bloque `.escenario` en `index.html`.

**Diseño** — fondo oscuro con acentos en oro, grano de película, cortina de apertura,
titular animado, piezas flotantes con parallax al mover el ratón, cinta deslizante y
revelados al desplazar. Todo se desactiva solo si el sistema pide
`prefers-reduced-motion`.

---

## Publicarlo

Es un sitio estático: sirve cualquier hosting. Arrastra la carpeta a
[Netlify Drop](https://app.netlify.com/drop), o usa Vercel, GitHub Pages o Cloudflare Pages.
Peso total ≈ 15 MB, casi todo imágenes.

---

## De dónde salió el contenido

- **Fotos y datos de las 311 piezas** — extraídas de `CAT0826.pdf` (124 páginas).
  Las fotos se recortaron de cada página y se centraron en formato cuadrado.
- **Nombres de producto** — no venían en el PDF (solo códigos); se escribieron
  describiendo cada pieza.
- **Foto de portada de la sección "Nosotros"** — la única publicación del Instagram
  de origen que muestra joyas sin modelo. Las otras 11 publicaciones públicas
  aparecen sobre manos, orejas, cuello o tobillo, así que quedaron fuera.
- **Textos, logotipo y diseño** — hechos para este sitio.
