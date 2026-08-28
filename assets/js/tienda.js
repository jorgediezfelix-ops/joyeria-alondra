/* =========================================================
   Joyería Alondra — lógica de la tienda
   ---------------------------------------------------------
   CONFIGURACIÓN: cambia estos datos por los reales.
   ========================================================= */

const CONFIG = {
  // Número de WhatsApp en formato internacional, sin "+", espacios ni guiones.
  // Ejemplo para México: 52 + LADA + número  →  "5215512345678"
  whatsapp: '520000000000',
  // Usuario de Instagram, sin la arroba. Vacío = se ocultan todos los
  // enlaces e iconos de Instagram del sitio.
  usuarioInstagram: '',
  correo: 'hola@joyeriaalondra.com',
  moneda: 'MXN',
  envioGratisDesde: 1500,
};

CONFIG.instagram = `https://www.instagram.com/${CONFIG.usuarioInstagram}/`;

/* ---------------------------------------------------------
   Raíz del sitio
   Se deduce del src de este mismo script, para que las fichas
   de producto (que viven en /producto/) resuelvan bien las rutas.
   --------------------------------------------------------- */
const RAIZ = (() => {
  const src = document.currentScript && document.currentScript.src;
  if (!src) return '';
  return new URL(src).pathname.replace(/assets\/js\/tienda\.js.*$/, '');
})();
/** Antepone la raíz del sitio a una ruta relativa del proyecto. */
const ruta = r => (r && !/^(https?:|\/\/|data:)/.test(r) ? RAIZ + r.replace(/^\.?\//, '') : r);

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const formateaPrecio = n =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: CONFIG.moneda,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);

const normaliza = s =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const escapaHTML = s =>
  String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONO = {
  bolsa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02c-1.72 0-3.4-.46-4.87-1.33l-.35-.21-3.62.95.97-3.53-.23-.36a9.7 9.7 0 0 1-1.49-5.19c0-5.37 4.38-9.75 9.77-9.75 2.61 0 5.06 1.02 6.9 2.86a9.68 9.68 0 0 1 2.86 6.9c0 5.38-4.38 9.76-9.77 9.76M20.52 3.45A11.68 11.68 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.08 1.56 5.86L.24 24l6.6-1.73a11.7 11.7 0 0 0 5.2 1.24h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.21-6.07-3.43-8.28"/></svg>',
};

/* =========================================================
   CARRITO
   ========================================================= */
const Carrito = {
  clave: 'alondra-carrito',
  articulos: [],

  cargar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.clave) || '[]');
      this.articulos = Array.isArray(guardado) ? guardado.filter(a => a && a.sku && a.cantidad > 0) : [];
    } catch { this.articulos = []; }
  },

  guardar() {
    try { localStorage.setItem(this.clave, JSON.stringify(this.articulos)); } catch {}
    this.pinta();
  },

  agregar(producto) {
    const existente = this.articulos.find(a => a.sku === producto.sku);
    if (existente) existente.cantidad += 1;
    else this.articulos.push({
      sku: producto.sku, nombre: producto.nombre, precio: producto.precio,
      thumb: producto.thumb, material: producto.material, cantidad: 1,
    });
    this.guardar();
    brindis(`${producto.nombre} agregado a la bolsa`);
  },

  cambiaCantidad(sku, delta) {
    const art = this.articulos.find(a => a.sku === sku);
    if (!art) return;
    art.cantidad += delta;
    if (art.cantidad <= 0) this.articulos = this.articulos.filter(a => a.sku !== sku);
    this.guardar();
  },

  quitar(sku) {
    this.articulos = this.articulos.filter(a => a.sku !== sku);
    this.guardar();
  },

  /** Refresca nombre, precio e imagen desde el catálogo vigente.
   *  Una bolsa guardada hace semanas puede traer precios viejos o rutas
   *  de imagen que ya no existen; esto la pone al día y descarta lo que
   *  se dio de baja. */
  sincroniza(porSku) {
    const antes = this.articulos.length;
    this.articulos = this.articulos
      .filter(a => porSku[a.sku])
      .map(a => {
        const p = porSku[a.sku];
        return { ...a, nombre: p.nombre, precio: p.precio,
                 thumb: p.thumb, material: p.material };
      });
    if (antes !== this.articulos.length || antes) this.guardar();
  },

  get total()  { return this.articulos.reduce((s, a) => s + a.precio * a.cantidad, 0); },
  get piezas() { return this.articulos.reduce((s, a) => s + a.cantidad, 0); },

  pinta() {
    const globo = $('#cuenta-carrito');
    if (globo) {
      globo.textContent = this.piezas;
      globo.hidden = this.piezas === 0;
    }

    const lista = $('#lista-carrito');
    if (!lista) return;

    if (!this.articulos.length) {
      lista.innerHTML = `
        <div class="panel__vacio">
          ${ICONO.bolsa}
          <p>Tu bolsa está vacía.</p>
          <a class="btn btn--linea" href="${ruta('catalogo.html')}">Ver catálogo</a>
        </div>`;
    } else {
      lista.innerHTML = this.articulos.map(a => `
        <article class="linea">
          <img src="${escapaHTML(ruta(a.thumb))}" alt="${escapaHTML(a.nombre)}" loading="lazy" width="74" height="74">
          <div class="linea__info">
            <h3>${escapaHTML(a.nombre)}</h3>
            <div class="linea__sku">${escapaHTML(a.sku)} · ${escapaHTML(a.material)}</div>
            <div class="linea__precio">${formateaPrecio(a.precio)}</div>
            <div class="cantidad">
              <button type="button" data-menos="${escapaHTML(a.sku)}" aria-label="Quitar una pieza de ${escapaHTML(a.nombre)}">&minus;</button>
              <span>${a.cantidad}</span>
              <button type="button" data-mas="${escapaHTML(a.sku)}" aria-label="Agregar una pieza de ${escapaHTML(a.nombre)}">+</button>
            </div>
            <button type="button" class="linea__quitar" data-quitar="${escapaHTML(a.sku)}">Quitar</button>
          </div>
        </article>`).join('');
    }

    const total = $('#total-carrito');
    if (total) total.textContent = formateaPrecio(this.total);

    const btnPedido = $('#btn-pedido');
    if (btnPedido) btnPedido.disabled = !this.articulos.length;

    const restante = CONFIG.envioGratisDesde - this.total;
    const aviso = $('#aviso-envio');
    if (aviso) {
      aviso.textContent = this.articulos.length
        ? (restante > 0
            ? `Te faltan ${formateaPrecio(restante)} para envío gratis.`
            : '¡Tu pedido califica para envío gratis!')
        : '';
    }
  },

  /** Arma el mensaje de pedido para WhatsApp. */
  mensajePedido() {
    const lineas = this.articulos.map(a =>
      `• ${a.nombre} (${a.sku}) — ${a.cantidad} pza${a.cantidad > 1 ? 's' : ''} — ${formateaPrecio(a.precio * a.cantidad)}`
    );
    return [
      '¡Hola Alondra! Me interesa este pedido:', '',
      ...lineas, '',
      `Total: ${formateaPrecio(this.total)}`, '',
      '¿Me confirman disponibilidad y forma de envío?',
    ].join('\n');
  },
};

/* ---------- aviso emergente ---------- */
let temporizadorBrindis;
function brindis(texto) {
  let el = $('#brindis');
  if (!el) {
    el = document.createElement('div');
    el.id = 'brindis';
    el.className = 'brindis';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.innerHTML = `${ICONO.check}<span>${escapaHTML(texto)}</span>`;
  el.classList.add('visible');
  clearTimeout(temporizadorBrindis);
  temporizadorBrindis = setTimeout(() => el.classList.remove('visible'), 2600);
}

/* =========================================================
   CINE — cortina, revelados, parallax y cinta
   ========================================================= */
const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Cine = {
  observador: null,

  init() {
    this.cortina();
    this.encabezado();
    this.cinta();
    this.prepararObservador();
    this.observa();
    if (!menosMovimiento) this.parallax();
  },

  /** Levanta la cortina de apertura.
   *  Solo se ve una vez por sesión y dura poco: mientras está puesta
   *  tapa el contenido, y eso empeora el LCP que mide Google. */
  cortina() {
    const c = $('#cortina');
    if (!c) return;

    let yaVista = false;
    try { yaVista = sessionStorage.getItem('alondra-intro') === '1'; } catch {}
    if (menosMovimiento || yaVista) { c.remove(); return; }
    try { sessionStorage.setItem('alondra-intro', '1'); } catch {}

    const cerrar = () => {
      c.classList.add('se-va');
      setTimeout(() => c.remove(), 560);
    };
    if (document.readyState === 'complete') setTimeout(cerrar, 260);
    else window.addEventListener('load', () => setTimeout(cerrar, 260), { once: true });
    // salvavidas: nunca dejar la cortina puesta
    setTimeout(cerrar, 2200);
  },

  /** Compacta el encabezado al desplazar. */
  encabezado() {
    const h = $('#encabezado');
    if (!h) return;
    const alSalir = () => h.classList.toggle('compacta', window.scrollY > 40);
    alSalir();
    window.addEventListener('scroll', alSalir, { passive: true });
  },

  /** Rellena la cinta deslizante y la duplica para el bucle. */
  cinta() {
    const pista = $('#cinta-pista');
    if (!pista) return;
    const frases = ['Acero inoxidable', '◆', 'Chapa de oro', '◆', 'Envíos a toda la República',
                    '◆', '311 piezas', '◆', 'Joyas a tu estilo', '◆'];
    const bloque = frases.map(f => `<span>${f}</span>`).join('');
    pista.innerHTML = bloque;
    const copia = pista.cloneNode(true);
    copia.removeAttribute('id');
    copia.setAttribute('aria-hidden', 'true');
    pista.parentElement.appendChild(copia);
  },

  prepararObservador() {
    if (!('IntersectionObserver' in window) || menosMovimiento) return;
    this.observador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        // acercamiento lento tipo Ken Burns
        if (e.target.hasAttribute('data-zoom')) {
          const img = e.target.querySelector('img');
          if (img) img.style.transform = 'scale(1)';
        }
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  },

  /** Revela lo que ya está en pantalla y observa el resto.
   *  Se muestra de inmediato lo visible para que nada quede en opacidad 0
   *  si el observador no llegara a dispararse. */
  observa(raiz = document) {
    const elementos = $$('[data-revela]:not(.visible)', raiz);
    if (!this.observador) { elementos.forEach(el => el.classList.add('visible')); return; }
    const alto = window.innerHeight || 800;
    elementos.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < alto * 0.95 && r.bottom > 0) el.classList.add('visible');
      else this.observador.observe(el);
    });
  },

  /** Desplazamiento sutil de las piezas de la portada (ratón + scroll). */
  parallax() {
    const piezas = $$('[data-parallax]');
    if (!piezas.length) return;
    let raton = { x: 0, y: 0 }, scroll = 0, pendiente = false;

    const pinta = () => {
      piezas.forEach(el => {
        const f = parseFloat(el.dataset.parallax) || 0;
        const x = raton.x * f * 46;
        const y = raton.y * f * 46 + scroll * f * 1.5;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
      pendiente = false;
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pinta); } };

    window.addEventListener('mousemove', e => {
      raton.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      raton.y = (e.clientY / window.innerHeight - 0.5) * 2;
      pedir();
    }, { passive: true });

    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight * 1.2) { scroll = window.scrollY; pedir(); }
    }, { passive: true });
  },
};

/* =========================================================
   TARJETA DE PRODUCTO
   ========================================================= */
function tarjetaProducto(p) {
  const medidas = p.medidas?.length
    ? `<div class="producto__medidas">${escapaHTML(p.medidas.join(' · '))}</div>` : '';
  const etiqueta = p.material === 'Acero inoxidable'
    ? '<span class="etiqueta">Acero</span>' : '';

  return `
    <article class="producto" data-sku="${escapaHTML(p.sku)}" data-revela>
      <button class="producto__img" type="button" data-ver="${escapaHTML(p.sku)}"
              aria-label="Ver detalle de ${escapaHTML(p.nombre)}">
        ${etiqueta}
        <img src="${escapaHTML(ruta(p.thumb))}" alt="${escapaHTML(p.nombre)}" loading="lazy" width="420" height="420">
      </button>
      <div class="producto__cuerpo">
        <div class="producto__meta">${escapaHTML(p.material)}</div>
        <h3 class="producto__nombre">
          <a href="${ruta('producto/' + p.slug + '.html')}">${escapaHTML(p.nombre)}</a>
        </h3>
        ${medidas}
        <div class="producto__pie">
          <div class="producto__precio">${formateaPrecio(p.precio)}<span> ${CONFIG.moneda}</span></div>
          <button class="btn-agregar" type="button" data-agregar="${escapaHTML(p.sku)}">Agregar</button>
        </div>
      </div>
    </article>`;
}

/* =========================================================
   VENTANA DE DETALLE
   ========================================================= */
function abreDetalle(p) {
  const dlg = $('#ventana-producto');
  if (!dlg) return;

  const medidas = p.medidas?.length
    ? `<div class="ficha"><dt>Medidas</dt><dd>${escapaHTML(p.medidas.join(' · '))}</dd></div>` : '';

  $('#ventana-cuerpo').innerHTML = `
    <button class="ventana__cerrar" type="button" data-cerrar-ventana aria-label="Cerrar">${ICONO.cerrar}</button>
    <div class="ventana__img">
      <img src="${escapaHTML(ruta(p.img))}" alt="${escapaHTML(p.nombre)}" width="800" height="800">
    </div>
    <div class="ventana__info">
      <p class="eyebrow">${escapaHTML(p.categoria)}</p>
      <h2>${escapaHTML(p.nombre)}</h2>
      <div class="ventana__precio">${formateaPrecio(p.precio)}<span> ${CONFIG.moneda}</span></div>
      <dl style="margin:0">
        <div class="ficha"><dt>Código</dt><dd>${escapaHTML(p.sku)}</dd></div>
        <div class="ficha"><dt>Material</dt><dd>${escapaHTML(p.material)}</dd></div>
        ${medidas}
        <div class="ficha"><dt>Disponibilidad</dt><dd>Sujeto a existencias</dd></div>
      </dl>
      <div class="ventana__acciones">
        <button class="btn btn--oro btn--bloque" type="button" data-agregar="${escapaHTML(p.sku)}">
          ${ICONO.bolsa} Agregar a la bolsa
        </button>
        <a class="btn btn--linea btn--bloque" href="${ruta('producto/' + p.slug + '.html')}">Ver ficha completa</a>
        <a class="btn btn--wa btn--bloque" target="_blank" rel="noopener"
           href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
             `¡Hola Alondra! Me interesa "${p.nombre}" (${p.sku}) — ${formateaPrecio(p.precio)}. ¿Está disponible?`)}">
          ${ICONO.wa} Preguntar por WhatsApp
        </a>
      </div>
      <p class="ventana__nota">
        Precios en pesos mexicanos. Los tonos pueden variar ligeramente respecto a la fotografía.
        Envíos a toda la República.
      </p>
    </div>`;

  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}

/* =========================================================
   ARRANQUE
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  Cine.init();
  Carrito.cargar();
  Carrito.pinta();

  /* ---------- enlaces de WhatsApp e Instagram ---------- */
  $$('[data-wa]').forEach(a => {
    const texto = a.dataset.wa || '¡Hola Alondra! Me gustaría más información sobre sus joyas.';
    a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
  });
  $$('[data-ig]').forEach(a => {
    if (!CONFIG.usuarioInstagram) {
      // Sin cuenta configurada: quitamos el enlace (y su viñeta, si va en lista)
      // para no dejar iconos que no llevan a ningún lado.
      (a.closest('li') || a).remove();
      return;
    }
    a.href = CONFIG.instagram;
    if (!a.textContent.trim() && !a.querySelector('svg')) a.textContent = `@${CONFIG.usuarioInstagram}`;
  });
  $$('[data-correo]').forEach(a => {
    a.href = `mailto:${CONFIG.correo}`;
    if (!a.textContent.trim()) a.textContent = CONFIG.correo;
  });

  /* ---------- menú móvil ---------- */
  const menuBtn = $('#menu-btn'), nav = $('#nav');
  menuBtn?.addEventListener('click', () => {
    const abierto = nav.classList.toggle('desplegado');
    menuBtn.setAttribute('aria-expanded', String(abierto));
  });

  /* ---------- panel del carrito ---------- */
  const panel = $('#panel-carrito');
  const abrePanel = () => { panel?.classList.add('abierto'); document.body.style.overflow = 'hidden'; };
  const cierraPanel = () => { panel?.classList.remove('abierto'); document.body.style.overflow = ''; };
  $('#abrir-carrito')?.addEventListener('click', abrePanel);
  $$('[data-cerrar-carrito]').forEach(b => b.addEventListener('click', cierraPanel));

  $('#btn-pedido')?.addEventListener('click', () => {
    if (!Carrito.articulos.length) return;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(Carrito.mensajePedido())}`,
                '_blank', 'noopener');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cierraPanel();
  });

  /* ---------- catálogo ---------- */
  let PRODUCTOS = [];
  try {
    const r = await fetch(ruta('assets/data/productos.json'));
    if (!r.ok) throw new Error(r.status);
    PRODUCTOS = await r.json();
  } catch (err) {
    console.error('No se pudo cargar el catálogo:', err);
    const destino = $('#rejilla-productos') || $('#destacados');
    if (destino) destino.innerHTML =
      `<div class="sin-resultados"><h3>No se pudo cargar el catálogo</h3>
       <p>Si abriste el archivo directamente, inicia un servidor local (ver LÉEME.md).</p></div>`;
    return;
  }

  const porSku = Object.fromEntries(PRODUCTOS.map(p => [p.sku, p]));
  Carrito.sincroniza(porSku);

  /* Mantiene los precios vigentes incluso en bolsas guardadas antes de una actualización. */
  let bolsaActualizada = false;
  Carrito.articulos.forEach(articulo => {
    const productoVigente = porSku[articulo.sku];
    if (!productoVigente || articulo.precio === productoVigente.precio) return;
    articulo.precio = productoVigente.precio;
    bolsaActualizada = true;
  });
  if (bolsaActualizada) Carrito.guardar();

  /* ---------- acciones delegadas ---------- */
  document.addEventListener('click', e => {
    const bAgregar = e.target.closest('[data-agregar]');
    if (bAgregar) {
      const p = porSku[bAgregar.dataset.agregar];
      if (p) {
        Carrito.agregar(p);
        if (bAgregar.classList.contains('btn-agregar')) {
          bAgregar.classList.add('esta-agregado');
          bAgregar.textContent = 'Agregado';
          setTimeout(() => {
            bAgregar.classList.remove('esta-agregado');
            bAgregar.textContent = 'Agregar';
          }, 1500);
        }
      }
      return;
    }

    const bVer = e.target.closest('[data-ver]');
    if (bVer) { const p = porSku[bVer.dataset.ver]; if (p) abreDetalle(p); return; }

    if (e.target.closest('[data-cerrar-ventana]')) { $('#ventana-producto')?.close?.(); return; }

    const menos = e.target.closest('[data-menos]');
    if (menos) { Carrito.cambiaCantidad(menos.dataset.menos, -1); return; }

    const mas = e.target.closest('[data-mas]');
    if (mas) { Carrito.cambiaCantidad(mas.dataset.mas, 1); return; }

    const quitar = e.target.closest('[data-quitar]');
    if (quitar) { Carrito.quitar(quitar.dataset.quitar); return; }
  });

  /* clic fuera de la ventana modal → cerrar */
  $('#ventana-producto')?.addEventListener('click', e => {
    if (e.target.id === 'ventana-producto') e.target.close();
  });

  /* =======================================================
     PÁGINA DE INICIO — destacados
     ======================================================= */
  const destacados = $('#destacados');
  if (destacados) {
    // Una selección variada: los mejor presentados de varias categorías.
    const preferidos = ['GS110296','G122490','GS03112','GAJ15750','G122496','GS03005',
                        'GS03958','GC833','GS1406899','G79043','GS03469','GAJ9RS28'];
    const lista = preferidos.map(s => porSku[s]).filter(Boolean);
    while (lista.length < 12) {
      const azar = PRODUCTOS[Math.floor(Math.random() * PRODUCTOS.length)];
      if (!lista.includes(azar)) lista.push(azar);
    }
    destacados.innerHTML = lista.slice(0, 12).map(tarjetaProducto).join('');
    Cine.observa(destacados);
  }

  /* categorías con imagen representativa */
  const cajaCategorias = $('#categorias');
  if (cajaCategorias) {
    const portadas = {
      Anillos:'GS03834', Aretes:'GS110296', Gargantillas:'GS03112', Pulseras:'GS1406899',
      Cadenas:'GAJ15750', Dijes:'G79043', Rosarios:'GAJ9RS28', Juegos:'GS03005',
    };
    const cuentas = PRODUCTOS.reduce((a, p) => (a[p.categoria] = (a[p.categoria] || 0) + 1, a), {});
    cajaCategorias.innerHTML = Object.entries(portadas).map(([cat, sku]) => {
      const p = porSku[sku] || PRODUCTOS.find(x => x.categoria === cat);
      if (!p) return '';
      return `
        <a class="categoria" href="${ruta('catalogo.html')}?categoria=${encodeURIComponent(cat)}">
          <div class="categoria__img">
            <img src="${escapaHTML(ruta(p.thumb))}" alt="${escapaHTML(cat)}" loading="lazy" width="420" height="420">
          </div>
          <div class="categoria__pie">
            <h3>${escapaHTML(cat)}</h3>
            <span>${cuentas[cat] || 0} piezas</span>
          </div>
        </a>`;
    }).join('');
    Cine.observa(cajaCategorias);
  }

  /* =======================================================
     PÁGINA DE CATÁLOGO
     ======================================================= */
  const rejilla = $('#rejilla-productos');
  if (!rejilla) return;

  const params = new URLSearchParams(location.search);
  const estado = {
    categorias: new Set(params.get('categoria') ? [params.get('categoria')] : []),
    materiales: new Set(params.get('material') ? [params.get('material')] : []),
    min: null, max: null,
    busqueda: params.get('q') || '',
    orden: 'destacado',
  };

  /* --- construir filtros --- */
  const cuentaPor = campo => PRODUCTOS.reduce((a, p) => (a[p[campo]] = (a[p[campo]] || 0) + 1, a), {});
  const catCuentas = cuentaPor('categoria');
  const matCuentas = cuentaPor('material');

  const ordenCat = ['Anillos','Aretes','Arracadas','Gargantillas','Cadenas','Dijes',
                    'Pulseras','Misterios','Rosarios','Juegos','Grapas'];

  $('#filtro-categorias').innerHTML = ordenCat
    .filter(c => catCuentas[c])
    .map(c => `
      <label class="opcion">
        <input type="checkbox" value="${escapaHTML(c)}" data-filtro="categoria"
               ${estado.categorias.has(c) ? 'checked' : ''}>
        <span>${escapaHTML(c)}</span>
        <span class="cuenta">${catCuentas[c]}</span>
      </label>`).join('');

  $('#filtro-materiales').innerHTML = Object.keys(matCuentas).sort()
    .map(m => `
      <label class="opcion">
        <input type="checkbox" value="${escapaHTML(m)}" data-filtro="material"
               ${estado.materiales.has(m) ? 'checked' : ''}>
        <span>${escapaHTML(m)}</span>
        <span class="cuenta">${matCuentas[m]}</span>
      </label>`).join('');

  if (estado.busqueda) $('#buscador').value = estado.busqueda;

  /* --- filtrar y ordenar --- */
  function filtra() {
    const q = normaliza(estado.busqueda.trim());
    let lista = PRODUCTOS.filter(p => {
      if (estado.categorias.size && !estado.categorias.has(p.categoria)) return false;
      if (estado.materiales.size && !estado.materiales.has(p.material)) return false;
      if (estado.min !== null && p.precio < estado.min) return false;
      if (estado.max !== null && p.precio > estado.max) return false;
      if (q) {
        const heno = normaliza(`${p.nombre} ${p.sku} ${p.categoria} ${p.material} ${p.medidas.join(' ')}`);
        if (!q.split(/\s+/).every(t => heno.includes(t))) return false;
      }
      return true;
    });

    if (estado.orden === 'precio-asc')  lista.sort((a, b) => a.precio - b.precio);
    if (estado.orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
    if (estado.orden === 'nombre')      lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return lista;
  }

  function pintaPastillas() {
    const caja = $('#filtros-activos');
    const activos = [
      ...[...estado.categorias].map(v => ({ tipo: 'categoria', v })),
      ...[...estado.materiales].map(v => ({ tipo: 'material', v })),
    ];
    if (estado.min !== null || estado.max !== null) {
      activos.push({ tipo: 'precio',
        v: `${estado.min !== null ? formateaPrecio(estado.min) : '$0'} – ${estado.max !== null ? formateaPrecio(estado.max) : '∞'}` });
    }
    caja.innerHTML = activos.length
      ? activos.map(a => `
          <span class="pastilla">${escapaHTML(a.v)}
            <button type="button" data-limpia="${a.tipo}" data-valor="${escapaHTML(a.v)}"
                    aria-label="Quitar filtro ${escapaHTML(a.v)}">${ICONO.cerrar}</button>
          </span>`).join('') +
          `<button type="button" class="pastilla" id="limpia-todo">Limpiar todo</button>`
      : '';
  }

  function pinta() {
    const lista = filtra();
    $('#cuenta-resultados').textContent =
      `${lista.length} ${lista.length === 1 ? 'pieza' : 'piezas'}`;

    rejilla.innerHTML = lista.length
      ? lista.map(tarjetaProducto).join('')
      : `<div class="sin-resultados">
           <h3>Sin resultados</h3>
           <p>Prueba con otra búsqueda o quita algunos filtros.</p>
         </div>`;
    Cine.observa(rejilla);
    pintaPastillas();
  }

  /* --- eventos de filtros --- */
  $('#filtros').addEventListener('change', e => {
    const inp = e.target.closest('input[data-filtro]');
    if (!inp) return;
    const conjunto = inp.dataset.filtro === 'categoria' ? estado.categorias : estado.materiales;
    inp.checked ? conjunto.add(inp.value) : conjunto.delete(inp.value);
    pinta();
  });

  let tiempoBusqueda;
  $('#buscador').addEventListener('input', e => {
    clearTimeout(tiempoBusqueda);
    tiempoBusqueda = setTimeout(() => { estado.busqueda = e.target.value; pinta(); }, 180);
  });

  $('#orden').addEventListener('change', e => { estado.orden = e.target.value; pinta(); });

  const aplicaRango = () => {
    const min = parseInt($('#precio-min').value, 10);
    const max = parseInt($('#precio-max').value, 10);
    estado.min = Number.isFinite(min) ? min : null;
    estado.max = Number.isFinite(max) ? max : null;
    pinta();
  };
  $('#precio-min').addEventListener('change', aplicaRango);
  $('#precio-max').addEventListener('change', aplicaRango);

  $('#filtros-activos').addEventListener('click', e => {
    if (e.target.closest('#limpia-todo')) {
      estado.categorias.clear(); estado.materiales.clear();
      estado.min = estado.max = null;
      $('#precio-min').value = ''; $('#precio-max').value = '';
      $$('input[data-filtro]').forEach(i => { i.checked = false; });
      pinta();
      return;
    }
    const b = e.target.closest('[data-limpia]');
    if (!b) return;
    const { limpia, valor } = b.dataset;
    if (limpia === 'precio') {
      estado.min = estado.max = null;
      $('#precio-min').value = ''; $('#precio-max').value = '';
    } else {
      const conjunto = limpia === 'categoria' ? estado.categorias : estado.materiales;
      conjunto.delete(valor);
      const inp = $$(`input[data-filtro="${limpia}"]`).find(i => i.value === valor);
      if (inp) inp.checked = false;
    }
    pinta();
  });

  /* --- filtros en móvil --- */
  $('#abrir-filtros')?.addEventListener('click', () => {
    $('#filtros').classList.add('abierto');
    document.body.style.overflow = 'hidden';
  });
  $('#cerrar-filtros')?.addEventListener('click', () => {
    $('#filtros').classList.remove('abierto');
    document.body.style.overflow = '';
  });

  pinta();
});
