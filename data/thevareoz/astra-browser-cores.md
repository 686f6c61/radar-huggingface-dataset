# thevareoz/astra-browser-cores

## Resumen

Astra Browser Core es un motor de navegador de escritorio nativo desarrollado por thevareoz, escrito íntegramente en C++20 y publicado en Hugging Face bajo licencia MPL-2.0. No se trata de un modelo de inteligencia artificial, sino de un repositorio de código fuente que implementa un navegador web completo desde cero, inspirado en la arquitectura multiproceso de Mozilla Firefox (e10s, WebRender, Necko, RDD y nsPresArena) y que evita deliberadamente tanto Electron como Chromium. Su propuesta diferencial es un techo estricto de memoria de 2 GB RAM, gestionado mediante un `SlabArena` por pestaña basado en `mmap` y un `MemoryGovernor` que lee el RSS real desde `/proc/<pid>/statm` y aplica deshidratación LRU de pestañas.

El proyecto incluye un motor web propio con parser HTML5, cascada CSS3 (variables CSS, Flexbox, Grid, `position`, `z-index`, `opacity`, `box-shadow`, `@media`), un motor JavaScript denominado AstraJS v7 con compilador a bytecode, VM de pila y recolector de basura mark-and-sweep, así como red nativa con HTTP/2 multiplexado sobre TLS 1.3, WebSocket RFC 6455, bloqueador de rastreadores y particionado de cookies por sitio de primer nivel.

Es relevante por su enfoque de ingeniería de sistemas: demuestra que es posible construir un navegador multiproceso con aislamiento real mediante `fork()` y sockets `AF_UNIX`, sin dependencias de compilación, y con un consumo de memoria medido de 27,86 MB para 150 pestañas. El repositorio no contiene pesos de modelo ni artefactos de inferencia; su tamaño es de 0,0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de navegador nativo en C++20 con multiproceso tipo e10s (Main, Content, RDD Media) mediante `fork()` y sockets `AF_UNIX` |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | es, en |
| Licencia | MPL-2.0 |
| Formato de pesos | no disponible (código fuente C++20; no hay pesos) |

## Arquitectura y entrenamiento

El proyecto no es un modelo entrenado, por lo que no existen datos de entrenamiento, tokens procesados ni fases de RLHF o DPO. Su arquitectura es la de un motor de navegador: un proceso principal (`Main`), procesos de contenido (`Content`) y un proceso de medios (`RDD Media`) aislados mediante `fork()` y comunicados por sockets binarios `AF_UNIX`. La gestión de memoria se articula en torno a un `SlabArena` por pestaña que usa `mmap`, `munmap` y `madvise(MADV_DONTNEED)`, junto con un `MemoryGovernor` que monitoriza el RSS real y deshidrata pestañas según una política LRU. El motor web incluye parser HTML5 con DOM dinámico, cascada CSS3 v7 con variables CSS y Flexbox, y un formato binario propio de composición denominado `ASD5`.

La capa de red, AstraNet v6, implementa cliente WebSocket RFC 6455 nativo (handshake SHA-1/Base64, masking obligatorio, Ping/Pong automático, límite de 4 MiB por trama), multiplexación HTTP/2 real (RFC 7540 y RFC 7541 HPACK/Huffman) sobre un único socket TLS 1.3 con ALPN `h2`, pool Keep-Alive HTTP/1.1, verificación estricta de certificados vía `dlopen("libssl.so.3")` y compresión `gzip`/`deflate` mediante `libz.so.1`. La capa de privacidad, AstraShield, aplica Total Cookie Protection particionado por `(top_level_site, origin)`, bloqueo de rastreadores mediante Trie, limpieza de parámetros UTM/FBCLID, modo HTTPS-Only y cabecera `Sec-GPC`. El motor JavaScript AstraJS v7 incorpora compilador a bytecode, VM de pila, GC mark-and-sweep, clases ES6, template literals, `async`/`await`, `Promise`, `fetch`, `localStorage` y API nativa `new WebSocket(url)`.

## Capacidades

- Renderizado web completo: parser HTML5 con DOM dinámico (`innerHTML`, `classList`, `removeAttribute`, `<canvas>`), cascada CSS3 con variables CSS, Flexbox, Grid, `position: relative | absolute | fixed`, `z-index`, `opacity`, `box-shadow`, `linear-gradient`, `@media (min-width / max-width)` y `overflow: hidden`.
- Ejecución de JavaScript: AstraJS v7 con clases ES6, template literals, closures mutables, `try`/`catch`/`finally`, `for..of`, `requestAnimationFrame`, `async`/`await`, `Promise`, `fetch`, `localStorage` y `new WebSocket()` nativo.
- Red nativa: HTTP/2 multiplexado sobre TLS 1.3, HTTP/1.1 Keep-Alive, WebSocket `ws://` y `wss://`, compresión gzip/deflate y caché acotada en RAM y disco.
- Privacidad: Total Cookie Protection particionado, bloqueo de rastreadores por Trie, limpieza de parámetros de seguimiento, HTTPS-Only y `Sec-GPC`.
- Extensiones: runtime Manifest V3 simultáneo multi-extensión con DNR combinado.
- Gestor de descargas nativo (`astra://downloads`) con verificación SHA-256 (FIPS 180-4) y registro `ledger.json`.
- Tipografía vectorial TrueType anti-aliased vía FreeType (`dlopen("libfreetype.so.6")`, caché LRU de 4 MiB) y decodificación de imágenes JPEG Baseline, PNG, BMP y PPM.
- Compositor v7 con rasterización de gradientes, blitting de `<canvas>` 2D, scroll APZ, capas `fixed_viewport`, motor 3D propio Astra3D, visor PDF/Markdown y reproducción de audio vía ALSA (`dlopen("libasound.so.2")`) con visualizador de onda PCM.
- Interfaz de escritorio: Chrome v4 con Omnibox editable, historial, pestañas y ventana interactiva nativa X11 (`--gui`).
- No dispone de capacidades de IA: sin generación de texto, razonamiento, tool calling ni agentes.

## Casos de uso

- Navegación de escritorio ligera en Linux: el binario `./build/astra --url https://example.com --gui` abre una ventana X11 interactiva con el motor completo, adecuado para entornos con recursos limitados gracias al techo de 2 GB y al consumo medido de 27,86 MB para 150 pestañas.
- Investigación en arquitecturas de navegador: el código sirve como referencia didáctica de un motor multiproceso con `fork()` y sockets `AF_UNIX`, útil para estudiar aislamiento de procesos, IPC binario y políticas de deshidratación de pestañas.
- Pruebas de privacidad y rastreo: AstraShield permite experimentar con particionado de cookies por `(top_level_site, origin)`, bloqueo por Trie y limpieza de parámetros UTM/FBCLID en un entorno controlado y reproducible.
- Desarrollo de extensiones Manifest V3: el runtime multi-extensión con DNR combinado permite validar extensiones propias (por ejemplo, `examples/astra-privacy-guard` o `examples/astra-reader-boost`) sin depender de Chromium.
- Automatización de capturas y renderizado headless: las opciones `--out home.png` y `--url file://...` permiten generar capturas deterministas de páginas y sesiones de ejemplo, útiles en pipelines de CI o documentación.
- Servidores de pruebas de red: el cliente WebSocket nativo con servidor echo loopback y la multiplexación HTTP/2 permiten validar implementaciones de protocolo (RFC 6455, RFC 7540, RFC 7541) en pruebas de integración.
- Descargas verificadas: el gestor `astra://downloads` con SHA-256 y `ledger.json` encaja en flujos que requieren integridad criptográfica de los artefactos descargados.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de modelos de IA, sino resultados de verificación del propio motor, medidos en Linux con `g++ -std=c++20 -O2 -Wall -Wextra -pthread -ldl`:

| Metrica | Resultado |
|---|---|
| Compilacion | 0 errores, 0 warnings |
| Suite `--test` | 43 / 43 pruebas aprobadas |
| Creacion de 150 pestañas (`--stress-tabs 150 --cap 2048`) | 843,8 ms (5,6 ms/pestaña) |
| RAM total real (RSS sumando 3 procesos) | 27,86 MB / 2048 MB (~1,36 % del techo) |
| Desglose RSS | `main`: 14,43 MB; `content`: 8,93 MB; `rdd-media`: 4,50 MB |
| Rehidratacion de pestaña deshidratada (Tab #1) | OK |

No se han publicado resultados de benchmarks de modelos en la informacion disponible, dado que el repositorio no contiene un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica; el motor no requiere GPU y usa rasterización por CPU.
- Cabe en cualquier equipo Linux de escritorio: el consumo medido es de 27,86 MB de RSS para 150 pestañas, muy por debajo del techo configurable de 2 GB.
- Dependencias en tiempo de ejecución cargadas dinámicamente vía `dlopen`: `libssl.so.3`, `libz.so.1`, `libfreetype.so.6` y `libasound.so.2`; el proyecto declara cero dependencias de compilación.
- Opciones de despliegue: compilación con `make -j4` y ejecución del binario `./build/astra` con modos `--test`, `--stress-tabs`, `--url`, `--out`, `--download` y `--gui` (X11 con `DISPLAY`).
- Latencia y throughput: creación de pestañas a 5,6 ms/pestaña; no se han publicado cifras de latencia de renderizado ni de throughput de red.
- Frameworks de servido de modelos (vLLM, llama.cpp, Ollama, TGI): no aplican.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de IA y no se han proporcionado alternativas comparables de motores de navegador nativos en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso como modelo de IA es un error de categoría.
- El repositorio tiene 0,0 GB y 0 descargas, lo que sugiere que el contenido publicado no incluye el código fuente completo o que el artefacto aún no se ha subido; conviene verificar los archivos antes de usarlo.
- La plataforma objetivo es Linux: el aislamiento por `fork()`, la lectura de `/proc/<pid>/statm`, la ventana X11 y las dependencias `dlopen` de `libssl.so.3`, `libasound.so.2` y `libfreetype.so.6` no son portables directamente a macOS o Windows.
- El motor web es parcial: la cascada CSS3 cubre un subconjunto (Flexbox con valores concretos, Grid, `@media` por anchura) y no se declara conformidad completa con los test suites de W3C ni compatibilidad con sitios web reales complejos.
- AstraJS v7 es un subconjunto de JavaScript, no un motor conforme a ECMAScript completo; la compatibilidad con bibliotecas y frameworks del ecosistema web no está garantizada.
- Riesgo de alucinación: no aplica al no ser un modelo generativo; el riesgo equivalente es de comportamiento inesperado del motor ante HTML, CSS o JS no soportados.
- Licencia MPL-2.0: permite uso comercial y modificaciones, pero exige publicar el código fuente de los archivos modificados bajo la misma licencia y conservar los avisos de copyright; no es una licencia permisiva tipo MIT.
- No se han publicado análisis de seguridad independientes del motor de renderizado ni de la pila TLS; para producción en entornos expuestos conviene auditar la verificación de certificados y el aislamiento de procesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thevareoz/astra-browser-cores
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
