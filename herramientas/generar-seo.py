#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera todo lo que depende del catálogo:

  producto/<slug>.html   una ficha por pieza, con datos estructurados
  sitemap.xml            mapa del sitio
  robots.txt             reglas para buscadores
  404.html               página de error

Ejecutar desde la raíz del proyecto tras cambiar assets/data/productos.json:

    python3 herramientas/generar-seo.py
"""

import html
import json
import os
import re
from datetime import date

# ---------------------------------------------------------------- configuración

BASE = "https://kinvitalgroup.com/joyeria-alondra"   # sin barra final
MARCA = "Joyería Alondra"
HOY = date.today().isoformat()

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTOS = json.load(open(os.path.join(RAIZ, "assets/data/productos.json"), encoding="utf-8"))

CATEGORIAS = ["Anillos", "Aretes", "Arracadas", "Gargantillas", "Cadenas", "Dijes",
              "Pulseras", "Misterios", "Rosarios", "Juegos", "Grapas"]
MATERIALES = ["Acero inoxidable", "Chapa de oro"]

# Frase propia por categoría, para que cada ficha tenga texto distinto.
GANCHO = {
    "Anillos":      "Un anillo que se nota sin gritar.",
    "Aretes":       "El detalle que enmarca la cara.",
    "Arracadas":    "Volumen ligero que se lleva de día y de noche.",
    "Gargantillas": "La pieza que ordena el escote.",
    "Cadenas":      "Base para superponer o llevar sola.",
    "Dijes":        "Un símbolo pequeño que cuenta algo tuyo.",
    "Pulseras":     "Para la muñeca que nunca va vacía.",
    "Misterios":    "Devoción en formato pulsera.",
    "Rosarios":     "Una pieza para conservar y heredar.",
    "Juegos":       "Collar y aretes que ya combinan entre sí.",
    "Grapas":       "Aretes de broche, cómodos y seguros.",
}

CUIDADO = {
    "Acero inoxidable": ("acero inoxidable, que no se oxida ni deja la piel verde "
                         "y aguanta el agua y el uso diario"),
    "Chapa de oro":     ("chapa de oro sobre base de calidad, con el brillo cálido "
                         "de las piezas clásicas"),
}

ESTILO_DESCRIPCION = {
    "Aretes":       "Su silueta de trébol aporta un acento elegante y luminoso para llevar a diario.",
    "Gargantillas": "Sus motivos de trébol crean un detalle delicado y sofisticado sobre el escote.",
    "Pulseras":     "Sus motivos de trébol aportan un detalle elegante y fácil de combinar en la muñeca.",
}


def esc(t):
    return html.escape(str(t), quote=True)


# Nombres que se repiten entre piezas distintas: sus títulos necesitan
# un dato extra para no salir duplicados en Google.
_veces = {}
for _p in PRODUCTOS:
    _veces[_p["nombre"]] = _veces.get(_p["nombre"], 0) + 1
REPETIDOS = {n for n, c in _veces.items() if c > 1}


def distintivo(p):
    """Dato que separa dos piezas con el mismo nombre."""
    if p["nombre"] not in REPETIDOS:
        return ""
    if p["medidas"]:
        return " " + " ".join(p["medidas"])
    return " " + p["sku"]


def descripcion(p):
    """Descripción única por pieza, para el meta description y el JSON-LD."""
    if p.get("descripcion"):
        return p["descripcion"]
    if p.get("estilo") == "Van Cleef":
        nombre = p["nombre"].removesuffix(" Estilo Van Cleef")
        detalle = ESTILO_DESCRIPCION.get(p["categoria"], "Un diseño elegante y fácil de combinar.")
        return (f"{nombre} estilo Van Cleef en {p['material'].lower()}. {detalle} "
                f"${p['precio']:,} MXN, código {p['sku']}. Envíos a toda la República.")
    med = f" {' · '.join(p['medidas'])}." if p["medidas"] else ""
    return (f"{p['nombre']} en {CUIDADO[p['material']]}.{med} "
            f"${p['precio']:,} MXN, código {p['sku']}. Envíos a toda la República.")


def titulo(p):
    return f"{p['nombre']}{distintivo(p)} · {p['material']} — Alondra"


# ---------------------------------------------------------------- plantillas

CABEZA = """<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo}</title>
<meta name="description" content="{descripcion}">
<meta name="theme-color" content="#08080A">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{canonica}">

<meta property="og:type" content="product">
<meta property="og:site_name" content="{marca}">
<meta property="og:title" content="{titulo}">
<meta property="og:description" content="{descripcion}">
<meta property="og:image" content="{imagen}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">
<meta property="og:url" content="{canonica}">
<meta property="og:locale" content="es_MX">
<meta property="product:price:amount" content="{precio}">
<meta property="product:price:currency" content="MXN">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{titulo}">
<meta name="twitter:description" content="{descripcion}">
<meta name="twitter:image" content="{imagen}">

<link rel="icon" href="../assets/img/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="../assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap">
<link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap"></noscript>
<link rel="stylesheet" href="../assets/css/estilos.css?v=20260827-webp-seo">
<link rel="preload" as="image" href="../{img}" fetchpriority="high">

<script type="application/ld+json">
{jsonld}
</script>
</head>
<body>

<a class="salta-al-contenido" href="#contenido">Saltar al contenido</a>
<div class="grano" aria-hidden="true"></div>

<div class="aviso-superior">
  Envío <strong>gratis</strong> desde $1,500 &nbsp;·&nbsp; Envíos a toda la República
</div>

<header class="encabezado" id="encabezado">
  <span class="encabezado__filo" aria-hidden="true"></span>
  <div class="contenedor encabezado__fila">
    <a class="marca" href="../index.html" aria-label="{marca} — inicio">
      <img class="marca__texto" src="../assets/img/logo-texto.webp" alt="{marca}" width="560" height="157" fetchpriority="high">
    </a>
    <nav class="nav" id="nav" aria-label="Principal">
      <a href="../index.html">Inicio</a>
      <a href="../catalogo.html">Catálogo</a>
      <a href="../catalogo.html?material=Acero+inoxidable">Acero</a>
      <a href="../catalogo.html?material=Chapa+de+oro">Chapa de oro</a>
      <a href="../index.html#nosotros">Nosotros</a>
    </nav>
    <div class="acciones">
      <a class="icono-btn" data-ig target="_blank" rel="noopener" href="#" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
      </a>
      <button class="icono-btn" id="abrir-carrito" aria-label="Abrir bolsa de compra">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="globo" id="cuenta-carrito" hidden>0</span>
      </button>
      <button class="icono-btn menu-btn" id="menu-btn" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>
"""

PIE = """
<footer class="pie">
  <div class="contenedor">
    <div class="pie__rejilla">
      <div class="pie__marca">
        <img src="../assets/img/logo.webp" alt="{marca}" width="720" height="710">
        <p>Joyas a tu estilo.<br>Acero inoxidable &amp; chapa de oro.</p>
        <div class="redes">
          <a data-ig target="_blank" rel="noopener" href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
          </a>
          <a data-wa="¡Hola Alondra!" target="_blank" rel="noopener" href="#" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02c-1.72 0-3.4-.46-4.87-1.33l-.35-.21-3.62.95.97-3.53-.23-.36a9.7 9.7 0 0 1-1.49-5.19c0-5.37 4.38-9.75 9.77-9.75 2.61 0 5.06 1.02 6.9 2.86a9.68 9.68 0 0 1 2.86 6.9c0 5.38-4.38 9.76-9.77 9.76M20.52 3.45A11.68 11.68 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.08 1.56 5.86L.24 24l6.6-1.73a11.7 11.7 0 0 0 5.2 1.24h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.21-6.07-3.43-8.28"/></svg>
          </a>
        </div>
      </div>
      <div>
        <h3>Categorías</h3>
        <ul>{enlaces_cat}</ul>
      </div>
      <div>
        <h3>Líneas</h3>
        <ul>
          <li><a href="../catalogo.html?material=Acero+inoxidable">Acero inoxidable</a></li>
          <li><a href="../catalogo.html?material=Chapa+de+oro">Chapa de oro</a></li>
          <li><a href="../catalogo.html">Todo el catálogo</a></li>
        </ul>
      </div>
      <div>
        <h3>Contacto</h3>
        <p>Haz tu pedido por WhatsApp y te confirmamos existencias y el costo de envío el mismo día.</p>
        <ul>
          <li><a data-wa="¡Hola Alondra! Quiero hacer un pedido." target="_blank" rel="noopener" href="#">Pedidos por WhatsApp</a></li>
          <li><a data-ig target="_blank" rel="noopener" href="#"></a></li>
          <li><a data-correo href="#"></a></li>
        </ul>
      </div>
    </div>
    <div class="pie__base">
      <span>&copy; <span id="anio">2026</span> {marca}. Todos los derechos reservados.</span>
      <span>Precios en pesos mexicanos (MXN) · Sujetos a cambio sin previo aviso</span>
    </div>
  </div>
</footer>

<div class="panel" id="panel-carrito" role="dialog" aria-modal="true" aria-labelledby="tit-bolsa">
  <div class="panel__fondo" data-cerrar-carrito></div>
  <div class="panel__caja">
    <div class="panel__cabecera">
      <h2 id="tit-bolsa">Tu bolsa</h2>
      <button class="icono-btn" data-cerrar-carrito aria-label="Cerrar bolsa">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="panel__lista" id="lista-carrito"></div>
    <div class="panel__pie">
      <div class="total"><span>Total</span><span id="total-carrito">$0</span></div>
      <button class="btn btn--wa btn--bloque" id="btn-pedido" disabled>Enviar pedido por WhatsApp</button>
      <p class="panel__aviso" id="aviso-envio"></p>
      <p class="panel__aviso">Te confirmamos existencias y costo de envío antes de pagar.</p>
    </div>
  </div>
</div>

<dialog class="ventana" id="ventana-producto" aria-label="Detalle del producto">
  <div class="ventana__caja" id="ventana-cuerpo"></div>
</dialog>

<a class="wa-flotante" data-wa="¡Hola Alondra! Quiero información sobre sus joyas." target="_blank" rel="noopener" href="#" aria-label="Escríbenos por WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02c-1.72 0-3.4-.46-4.87-1.33l-.35-.21-3.62.95.97-3.53-.23-.36a9.7 9.7 0 0 1-1.49-5.19c0-5.37 4.38-9.75 9.77-9.75 2.61 0 5.06 1.02 6.9 2.86a9.68 9.68 0 0 1 2.86 6.9c0 5.38-4.38 9.76-9.77 9.76M20.52 3.45A11.68 11.68 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.08 1.56 5.86L.24 24l6.6-1.73a11.7 11.7 0 0 0 5.2 1.24h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.21-6.07-3.43-8.28"/></svg>
</a>

<script>document.getElementById('anio').textContent = new Date().getFullYear();</script>
<script src="../assets/js/tienda.js?v=20260827-webp-seo" defer></script>
</body>
</html>
"""


def ficha(p, relacionados):
    canonica = f"{BASE}/producto/{p['slug']}.html"
    imagen = f"{BASE}/{p['img']}"
    desc = descripcion(p)

    jsonld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "@id": canonica + "#producto",
                "name": p["nombre"],
                "description": desc,
                "sku": p["sku"],
                "mpn": p["sku"],
                "image": [imagen],
                "url": canonica,
                "category": p["categoria"],
                "material": p["material"],
                "brand": {"@type": "Brand", "name": MARCA},
                "offers": {
                    "@type": "Offer",
                    "url": canonica,
                    "priceCurrency": "MXN",
                    "price": p["precio"],
                    "availability": "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/NewCondition",
                    "seller": {"@type": "Organization", "name": MARCA},
                    "areaServed": {"@type": "Country", "name": "México"},
                },
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Catálogo",
                     "item": BASE + "/catalogo.html"},
                    {"@type": "ListItem", "position": 3, "name": p["categoria"],
                     "item": f"{BASE}/catalogo.html?categoria={p['categoria']}"},
                    {"@type": "ListItem", "position": 4, "name": p["nombre"], "item": canonica},
                ],
            },
        ],
    }
    if p["medidas"]:
        jsonld["@graph"][0]["size"] = " · ".join(p["medidas"])

    cabeza = CABEZA.format(
        titulo=esc(titulo(p)), descripcion=esc(desc), canonica=canonica,
        imagen=imagen, precio=p["precio"], img=p["img"], marca=MARCA,
        jsonld=json.dumps(jsonld, ensure_ascii=False, indent=1),
    )

    medidas_fila = ""
    if p["medidas"]:
        medidas_fila = (f'<div class="ficha"><dt>Medidas</dt>'
                        f'<dd>{esc(" · ".join(p["medidas"]))}</dd></div>')

    tarjetas = "".join(f"""
        <article class="producto">
          <a class="producto__img" href="{r['slug']}.html" aria-label="Ver {esc(r['nombre'])}">
            <img src="../{r['thumb']}" alt="{esc(r['nombre'])}" loading="lazy" width="420" height="420">
          </a>
          <div class="producto__cuerpo">
            <div class="producto__meta">{esc(r['material'])}</div>
            <h3 class="producto__nombre"><a href="{r['slug']}.html">{esc(r['nombre'])}</a></h3>
            <div class="producto__pie">
              <div class="producto__precio">${r['precio']:,}<span> MXN</span></div>
            </div>
          </div>
        </article>""" for r in relacionados)

    cuerpo = f"""
<main id="contenido" class="seccion" style="padding-top:38px">
  <div class="contenedor">

    <nav class="miga" aria-label="Ruta de navegación">
      <a href="../index.html">Inicio</a> <span aria-hidden="true">/</span>
      <a href="../catalogo.html">Catálogo</a> <span aria-hidden="true">/</span>
      <a href="../catalogo.html?categoria={esc(p['categoria'])}">{esc(p['categoria'])}</a>
      <span aria-hidden="true">/</span> <span aria-current="page">{esc(p['nombre'])}</span>
    </nav>

    <div class="ficha-producto">
      <div class="ficha-producto__foto">
        <img src="../{p['img']}" alt="{esc(p['nombre'])} — {esc(p['material'])}, código {esc(p['sku'])}"
             width="800" height="800" fetchpriority="high">
      </div>

      <div class="ficha-producto__datos">
        <p class="eyebrow">{esc(p['categoria'])}</p>
        <h1>{esc(p['nombre'])}</h1>
        <p class="ficha-producto__gancho">{esc(p.get('gancho', GANCHO.get(p['categoria'], '')))}</p>
        <div class="ficha-producto__precio">${p['precio']:,}<span> MXN</span></div>

        <dl style="margin:0">
          <div class="ficha"><dt>Código</dt><dd>{esc(p['sku'])}</dd></div>
          <div class="ficha"><dt>Material</dt><dd>{esc(p['material'])}</dd></div>
          {medidas_fila}
          <div class="ficha"><dt>Disponibilidad</dt><dd>Sujeto a existencias</dd></div>
          <div class="ficha"><dt>Envío</dt><dd>A toda la República · gratis desde $1,500</dd></div>
        </dl>

        <div class="ventana__acciones">
          <button class="btn btn--oro btn--bloque" type="button" data-agregar="{esc(p['sku'])}">
            Agregar a la bolsa
          </button>
          <a class="btn btn--wa btn--bloque" target="_blank" rel="noopener"
             data-wa="¡Hola Alondra! Me interesa &quot;{esc(p['nombre'])}&quot; ({esc(p['sku'])}) — ${p['precio']:,} MXN. ¿Está disponible?"
             href="#">Preguntar por WhatsApp</a>
        </div>

        <div class="ficha-producto__texto">
          <h2>Sobre esta pieza</h2>
          <p>{esc(desc)}</p>
          <p>
            Forma parte de nuestra línea de <a href="../catalogo.html?material={esc(p['material'].replace(' ', '+'))}">{esc(p['material'].lower())}</a>.
            Ve todas las piezas de <a href="../catalogo.html?categoria={esc(p['categoria'])}">{esc(p['categoria'].lower())}</a>
            o recorre el <a href="../catalogo.html">catálogo completo</a>.
          </p>
        </div>
      </div>
    </div>

    <section class="relacionados" aria-labelledby="tit-rel">
      <h2 id="tit-rel">También en {esc(p['categoria'].lower())}</h2>
      <div class="productos">{tarjetas}
      </div>
    </section>

  </div>
</main>
"""

    enlaces_cat = "".join(
        f'<li><a href="../catalogo.html?categoria={c}">{c}</a></li>' for c in CATEGORIAS[:5])
    return cabeza + cuerpo + PIE.format(marca=MARCA, enlaces_cat=enlaces_cat)


# ---------------------------------------------------------------- generación

def main():
    destino = os.path.join(RAIZ, "producto")
    os.makedirs(destino, exist_ok=True)

    por_categoria = {}
    for p in PRODUCTOS:
        por_categoria.setdefault(p["categoria"], []).append(p)

    for p in PRODUCTOS:
        hermanos = [x for x in por_categoria[p["categoria"]] if x["sku"] != p["sku"]]
        i = por_categoria[p["categoria"]].index(p)
        relacionados = (hermanos + hermanos)[i:i + 4]     # 4 distintos, rotando
        ruta = os.path.join(destino, p["slug"] + ".html")
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(ficha(p, relacionados))

    # ---- sitemap ----
    urls = [(BASE + "/", "1.0", "weekly"),
            (BASE + "/catalogo.html", "0.9", "weekly")]
    for c in CATEGORIAS:
        urls.append((f"{BASE}/catalogo.html?categoria={c}", "0.7", "monthly"))
    for m in MATERIALES:
        urls.append((f"{BASE}/catalogo.html?material={m.replace(' ', '+')}", "0.7", "monthly"))
    for p in PRODUCTOS:
        urls.append((f"{BASE}/producto/{p['slug']}.html", "0.6", "monthly"))

    filas = "\n".join(
        f"  <url>\n    <loc>{html.escape(u)}</loc>\n"
        f"    <lastmod>{HOY}</lastmod>\n"
        f"    <changefreq>{cf}</changefreq>\n"
        f"    <priority>{pr}</priority>\n  </url>"
        for u, pr, cf in urls)
    with open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                f"{filas}\n</urlset>\n")

    # ---- robots ----
    with open(os.path.join(RAIZ, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\n"
                "Allow: /\n\n"
                "# Recursos que no aportan a la búsqueda\n"
                "Disallow: /herramientas/\n\n"
                f"Sitemap: {BASE}/sitemap.xml\n")

    print(f"{len(PRODUCTOS)} fichas en producto/")
    print(f"sitemap.xml con {len(urls)} URLs")
    print("robots.txt")


if __name__ == "__main__":
    main()
