# Joyería Alondra — sitio web

Tienda estática (HTML + CSS + JavaScript, sin dependencias ni compilación) con las
**311 piezas** del catálogo `CAT0826.pdf`.

---

## ⚠️ Antes de publicar: 3 datos por cambiar

Todo está en **`assets/js/tienda.js`**, primeras líneas:

```js
const CONFIG = {
  whatsapp: '520000000000',            // ← número real, formato internacional sin "+"
  usuarioInstagram: 'joyeria_alondra', // ← usuario real, sin la arroba
  correo: 'hola@joyeriaalondra.com',   // ← correo real
  moneda: 'MXN',
  envioGratisDesde: 1500,
};
```

- **WhatsApp**: `52` + LADA + número, todo junto. Ej.: `5215512345678`.
  Mientras diga `520000000000`, los botones de pedido no llegan a ningún lado.
- **Instagram**: está **vacío a propósito**. Mientras lo esté, el sitio oculta
  solos todos los iconos y enlaces de Instagram, para no dejar botones muertos.
  En cuanto pongas el usuario real, reaparecen en el encabezado, el pie y la
  sección de galería.
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
├── 404.html                Página de error
├── robots.txt              ┐ generados por herramientas/generar-seo.py
├── sitemap.xml             ┘ (no editar a mano)
├── producto/               311 fichas, una por pieza · generadas
├── herramientas/
│   └── generar-seo.py      Regenera fichas, sitemap y robots
└── assets/
    ├── css/estilos.css     Todo el diseño
    ├── js/tienda.js        Catálogo, carrito, animaciones · CONFIG arriba
    ├── data/productos.json Los 311 productos — la única fuente de datos
    └── img/
        ├── logo.svg
        ├── instagram-pulseras.webp
        ├── instagram/      6 fotos de campaña
        ├── cine/           Piezas recortadas sin fondo (3 en uso + 3 de repuesto)
        └── productos/      311 fotos (800 px) + thumb/ (420 px), todas WebP
```

Todas las imágenes son **WebP**. Los assets pesan 7.8 MB (antes 19 MB en JPEG/PNG).

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

1. Pon la foto en `assets/img/productos/SKU.webp` (cuadrada, 800×800) y una
   copia de 420×420 en `assets/img/productos/thumb/SKU.webp`.
2. Agrega el objeto a `assets/data/productos.json`.
3. **Vuelve a generar el SEO** — si no, la pieza no tendrá ficha ni saldrá
   en el sitemap:

```bash
cd ~/Desktop/Joyeria && python3 herramientas/generar-seo.py
```

Los filtros y contadores del catálogo se recalculan solos. Si inventas una
categoría nueva, añádela a `ordenCat` en `tienda.js` y a `CATEGORIAS` en
`herramientas/generar-seo.py`.

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

**Carrito** — se guarda en `localStorage` (clave `alondra-carrito`), así que sobrevive
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

## SEO

Cada pieza tiene su propia página en `producto/<slug>.html`. Eso es lo que
permite que Google indexe las 311 joyas por separado en vez de una sola
página de catálogo.

Cada ficha lleva:

- **Título y descripción únicos** (313 de 313, sin duplicados)
- **`Product` en JSON-LD** con SKU, precio, moneda, material, marca y
  disponibilidad — es lo que produce los resultados enriquecidos de Google
  con precio y foto
- **`BreadcrumbList`** para la ruta Inicio → Catálogo → Categoría → Pieza
- **Canónica**, Open Graph y Twitter Card
- Enlaces internos a su categoría, a su material y a 4 piezas relacionadas

El inicio declara `Organization`, `WebSite` (con buscador), `Store` e
`ItemList` de categorías. El catálogo declara `CollectionPage` e `ItemList`.

`sitemap.xml` reúne 326 URLs: inicio, catálogo, 11 categorías, 2 materiales
y las 311 fichas.

### Darlo de alta en Google

1. Entra a [Search Console](https://search.google.com/search-console) y
   verifica la propiedad del dominio.
2. En *Sitemaps*, envía `sitemap.xml`.
3. En *Inspección de URLs*, pide la indexación del inicio y del catálogo.

La indexación completa suele tardar de días a algunas semanas.

### ⚠️ El dominio actual no ayuda

El sitio se sirve desde `kinvitalgroup.com/joyeria-alondra/` porque tu cuenta
de GitHub ya tenía ese dominio configurado. Para posicionar en Google es una
desventaja real: el dominio no tiene nada que ver con joyería y la autoridad
que gane el sitio se reparte con el otro negocio.

Con un dominio propio (`joyeriaalondra.com`) el sitio arrancaría mucho mejor.
Al cambiarlo hay que actualizar `BASE` en `herramientas/generar-seo.py`,
volver a generar, y corregir las canónicas de `index.html` y `catalogo.html`.

---

## Velocidad

Medido en local, portada en frío:

| | |
|---|---|
| FCP | 264 ms |
| LCP | 264 ms |
| CLS | 0 |

Qué se hizo:

- **WebP en todo** — los recortes de la portada pasaron de 1 MB a 160 KB
- **La cortina de apertura se acortó** y ahora solo aparece una vez por
  sesión. Antes tapaba el contenido casi 2 segundos y el LCP se iba a
  2.3 s, que Google marca en rojo
- **Fuentes de Google sin bloquear el render** (`media="print"` + `onload`)
- **Scripts diferidos** y `content-visibility` en las secciones de abajo
- Todas las imágenes con `width`/`height` para que no haya saltos (CLS 0)

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
