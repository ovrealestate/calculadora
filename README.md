# Calculadora de precios — estilo iPhone

PWA móvil en español, sin dependencias, cuentas ni servicios externos. Todos los cálculos se realizan en el dispositivo. Los importes se muestran en pesos con símbolo $. No guarda las claves.

## Abrir en VS Code
1. Descomprime el ZIP en una carpeta y abre esa carpeta en VS Code.
2. Usa la extensión Live Server y abre `index.html` con “Open with Live Server”. También puedes ejecutar `python3 -m http.server 8080` en esa carpeta y abrir http://localhost:8080.
3. No abras el HTML mediante doble clic para probar instalación/offline: esas funciones requieren HTTPS o localhost.

## Publicar en Cloudflare Pages (sin compilación)
1. Inicia sesión en https://dash.cloudflare.com/.
2. Entra a **Workers & Pages** y crea una aplicación de **Pages**. Elige **Use direct upload / Carga directa** (los nombres pueden variar según el idioma).
3. Asigna un nombre, por ejemplo `calculadora-precios`.
4. Arrastra `calculadora-precios.zip`, o la carpeta descomprimida. `index.html` está en la raíz del ZIP.
5. Publica con **Deploy site**. No necesitas instalar paquetes, configurar backend ni ejecutar una compilación.
6. Abre la dirección HTTPS que entrega Cloudflare, por ejemplo `https://calculadora-precios.pages.dev` (depende de la disponibilidad del nombre).
7. Espera “Lista para usar sin conexión” y comparte esa dirección con las empleadas.

Documentación oficial: https://developers.cloudflare.com/pages/get-started/direct-upload/

## Instalar en celulares
- **iPhone:** abre el enlace HTTPS en Safari → Compartir → Agregar a pantalla de inicio → Agregar. Si aparece “Abrir como app”, actívalo.
- **Android:** abre el enlace en Chrome y toca “Instalar calculadora” cuando aparezca, o usa el menú → Instalar aplicación / Agregar a pantalla de inicio.
- Abre una vez con internet y espera “Lista para usar sin conexión”. Después funciona en modo avión, incluso al cerrarla y volverla a abrir, mientras el navegador conserve los datos del sitio. Si se borran, abre nuevamente con internet.

## Diseño
Fondo negro, números blancos y teclas redondas grises y naranjas, inspirados en la calculadora de iPhone. Usa el teclado numérico en pantalla. Las teclas ORO, PLATA y ARGOLLAS seleccionan el material; AC / Nueva consulta limpia la clave; ⌫ borra el último dígito. El cálculo se actualiza al escribir, y = confirma.

## Uso
Selecciona ORO, PLATA o ARGOLLAS e ingresa la clave. Los precios cambian al escribir. “Nueva consulta” limpia la clave y conserva el material elegido. Acepta punto o coma decimal, sin separadores de miles. Cero es válido; negativos y texto no lo son. Límite: 30 caracteres en la clave y precio de lista de $999,999,999.

## Fórmulas centralizadas en app.js
`RULES` contiene multiplicadores y descuentos; `calculate` aplica el redondeo. Se usan fracciones y BigInt para evitar errores de precisión decimal. Requiere un navegador moderno con soporte BigInt y service workers.

| Material | Precio de lista | Efectivo | Tarjeta |
| --- | --- | --- | --- |
| ORO | techo(clave × 2.9) | techo(precio de lista × 0.70) | techo(precio de lista × 0.75) |
| PLATA | techo(clave × 255) | Sin descuento | Sin descuento |
| ARGOLLAS | techo(clave × 3.2) | techo(precio de lista × 0.75) | techo(precio de lista × 0.80) |

`techo` redondea hacia arriba al peso entero; un entero permanece igual. Los descuentos siempre parten del precio de lista YA redondeado. PLATA muestra solamente un precio final.

Ejemplos con clave 10.01:
- ORO: lista $30, efectivo $21, tarjeta $23.
- PLATA: precio final $2,553.
- ARGOLLAS: lista $33, efectivo $25, tarjeta $27.

## Actualizar
Edita los archivos, cambia el nombre `CACHE` en `sw.js` (por ejemplo a `calculadora-precios-v4`) y carga de nuevo la carpeta completa desde una nueva implementación del mismo proyecto Pages. Con internet, abre la app para que descargue la actualización; cierra todas sus ventanas y pestañas y vuelve a abrirla para activar la nueva versión. La nueva versión se activa automáticamente al descargar todos los archivos.

## Comprobar antes de usar
Prueba los ejemplos anteriores; cambia entre materiales; prueba una clave decimal y “Nueva consulta”. Espera el aviso offline, activa modo avión y recarga. Comprueba la instalación en tus dispositivos iPhone y Android.

## Archivos
- index.html: interfaz y accesibilidad.
- styles.css: diseño adaptable.
- app.js: reglas, cálculo e interacción.
- manifest.json: instalación.
- sw.js: caché offline.
- icons/: iconos PNG, incluido Apple Touch y maskable.
- _headers: política de actualización para Cloudflare.

No requiere un proceso de build. No incluye analítica ni envía claves a ningún servidor.

## Versión 3: pantalla compacta
Interfaz negra estilo iPhone que se ajusta proporcionalmente al ancho y alto disponibles. La ayuda e instalación están en el botón ?. En horizontal o con una ventana muy pequeña las teclas se reducen: se recomienda posición vertical para comodidad. Se mantiene habilitado el zoom de accesibilidad.

Publica este ZIP completo en el MISMO proyecto de Cloudflare Pages. Abre la dirección con internet y recarga; esta versión activa automáticamente su caché nuevo. Si vienes de una versión anterior, cierra y vuelve a abrir la app una vez para cargar el nuevo diseño. El ZIP local por sí solo no cambia un sitio ya publicado.
