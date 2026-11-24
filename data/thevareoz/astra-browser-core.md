# thevareoz/astra-browser-core

## Resumen

Astra Browser Core es un motor de navegador de escritorio desarrollado desde cero en C++20 puro por el autor independiente thevareoz, inspirado en la arquitectura multiproceso de Mozilla Firefox (e10s, WebRender, Necko, RDD, nsPresArena) y con la restriccion explicita de no emplear Electron ni Chromium. Su objetivo es ofrecer un navegador nativo con aislamiento real entre procesos mediante `fork()` y sockets `AF_UNIX`, y un techo estricto de memoria de 2 GB de RAM. No se trata de un modelo de lenguaje ni de una red neuronal: es un proyecto de ingenieria de sistemas publicado en Hugging Face como repositorio de codigo, con un tamano de repositorio de 0.0 GB en el momento de la consulta.

El proyecto cubre la pila completa de un navegador: gestor de memoria por pestaña con `SlabArena` sobre `mmap`, gobernador de memoria con lectura de RSS real desde `/proc/<pid>/statm`, capa de privacidad (`AstraShield`) con Total Cookie Protection y bloqueo de rastreadores mediante trie, red con HTTP/1.1 y TLS 1.3 estricto, motor HTML5/CSS3 con Flexbox, un motor JavaScript propio (`AstraJS v2`) con compilador a bytecode, VM de pila y recolector mark-and-sweep, runtime de WebExtensions Manifest V3 con Declarative Net Request, compositor ARGB32 con ventana X11, motor 3D propio (`Astra3D`), visor PDF y decodificador de video MP4 en proceso RDD.

Su relevancia actual es la de una alternativa de investigacion y experimentacion frente al monopolio Chromium/Electron en el desarrollo de navegadores, con enfasis en privacidad por diseno y control granular del consumo de memoria. No dispone de descargas ni likes en Hugging Face, lo que sugiere un proyecto en fase temprana o de difusion limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Navegador multiproceso nativo en C++20 (procesos Main, Content y RDD Media) con IPC por sockets `AF_UNIX` tras `fork()` |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es, en |
| Licencia | MPL-2.0 |
| Formato de pesos | no disponible (repositorio de codigo fuente C++20; compilacion con `make -j4`) |

## Arquitectura y entrenamiento

Astra Browser Core no es un modelo entrenado, sino un motor de navegador implementado en C++20 con una arquitectura multiproceso que replica el modelo e10s de Firefox. El aislamiento se consigue con `fork()` y sockets binarios `AF_UNIX` entre los procesos Main, Content y RDD Media. La gestion de memoria se basa en un `SlabArena` por pestaña sobre `mmap`/`munmap`/`madvise(MADV_DONTNEED)` y un `MemoryGovernor` que lee el RSS real desde `/proc/<pid>/statm` y aplica deshidratacion LRU de pestañas cuando se supera el limite configurado (por defecto 2048 MB).

La pila web incluye un parser HTML5, cascada CSS3 con soporte de Flexbox, una Display List binaria serializable (`ASD2`) con regiones interactivas (`HitRegion`), el motor JavaScript `AstraJS v2` (compilador a bytecode, VM de pila, GC mark-and-sweep, event loop de microtasks y timers, eventos DOM) y un runtime de WebExtensions Manifest V3 con Declarative Net Request. La capa de red `AstraNet` implementa HTTP/1.1, verificacion estricta de certificados TLS 1.3 mediante `dlopen libssl.so.3`, descompresion gzip/deflate con `libz.so.1` y una cache HTTP acotada en RAM y disco con eviccion LRU. Los graficos corren sobre un compositor ARGB32 con scroll APZ y ventana X11, e incluyen el motor 3D `Astra3D` (Z-buffer, normales suaves, shaders procedurales Blinn-Phong, carga de `.obj`), decodificador nativo PNG/BMP/PPM, visor PDF con `FlateDecode` y Markdown, y decodificador de video MP4/Y4M en el proceso RDD con limite de 16 MiB por flujo.

No se dispone de informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones de decodificacion, al no tratarse de un modelo de aprendizaje automatico. La compilacion declarada es `g++ -std=c++20 -O2 -Wall -Wextra -pthread -ldl`, con cero dependencias de compilacion y cero errores y warnings segun el autor.

## Capacidades

- Navegacion web nativa en Linux con ventana interactiva X11 y compositor ARGB32 con scroll APZ.
- Aislamiento multiproceso real entre contenido, red y medios mediante `fork()` y sockets `AF_UNIX`.
- Gestion de memoria por pestaña con deshidratacion LRU y techo configurable de RAM (por defecto 2048 MB).
- Privacidad por diseno: Total Cookie Protection particionado por `(top_level_site, origin)`, bloqueador de rastreadores basado en trie, limpieza de parametros UTM/FBCLID, modo HTTPS-Only y cabecera `Sec-GPC`.
- Renderizado HTML5 y CSS3 con Flexbox, Display List binaria `ASD2` y regiones interactivas para eventos de clic.
- Ejecucion de JavaScript con `AstraJS v2`: bytecode, VM de pila, GC mark-and-sweep, event loop de microtasks y timers, y eventos DOM.
- Soporte de extensiones WebExtensions Manifest V3 con Declarative Net Request.
- Renderizado 3D con `Astra3D`: Z-buffer, normales suaves, shaders procedurales Blinn-Phong y carga de modelos `.obj`.
- Visualizacion de imagenes PNG/BMP/PPM, documentos PDF (con `FlateDecode`) y Markdown.
- Reproduccion de video MP4/Y4M multiframe acotada a 16 MiB en el proceso RDD.
- Interfaz de linea de comandos con flags de prueba (`--test`), estres de pestañas (`--stress-tabs`), captura a PNG (`--out`), simulacion de clic (`--click`) y modo grafico (`--gui`).
- Idiomas de la documentacion y del proyecto: espanol e ingles.

## Casos de uso

- Investigacion en arquitecturas de navegador: sirve como base de codigo abierto para estudiar el modelo multiproceso e10s, el particionado de cookies y la deshidratacion de pestañas sin depender de Chromium ni de Electron.
- Desarrollo de navegadores de nicho con presupuesto de memoria acotado: el `MemoryGovernor` con lectura de RSS real y la deshidratacion LRU permiten fijar un techo de 2 GB y validar el consumo con `--stress-tabs`, util para entornos embebidos o quioscos.
- Auditoria de privacidad: `AstraShield` implementa Total Cookie Protection, bloqueo de rastreadores por trie y limpieza de parametros de seguimiento, lo que permite experimentar con politicas de privacidad y medir su impacto en la navegacion.
- Entornos de escritorio Linux con requisitos de seguridad: el aislamiento por procesos y la verificacion estricta de TLS 1.3 con CA del sistema lo hacen adecuado para terminales de trabajo donde se quiera minimizar la superficie de ataque frente a motores monoliticos.
- Pruebas de compatibilidad web y de extensiones: el runtime de Manifest V3 con DNR y el motor `AstraJS v2` permiten validar el comportamiento de extensiones y de paginas con JavaScript en un motor independiente del ecosistema Chromium.
- Visualizacion de documentos y medios sin dependencias externas: el visor PDF nativo, el decodificador PNG y el reproductor MP4 en proceso RDD permiten construir visores ligeros integrados en el navegador.
- Docencia de ingenieria de sistemas: el codigo cubre parser HTML5, cascada CSS, VM de bytecode, GC y compositor, lo que lo convierte en material didactico para asignaturas de compiladores, sistemas operativos y graficos.
- Automatizacion de capturas y pruebas de regresion visual: los flags `--out`, `--click` y `--url` permiten generar capturas PNG de paginas y verificar interacciones de forma reproducible en CI.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de la suite de verificacion y la prueba de estres, no comparativas con otros navegadores.

| Metrica | Resultado |
|---|---|
| Compilacion (`g++ -std=c++20 -O2 -Wall -Wextra -pthread -ldl`) | 0 errores, 0 warnings |
| Suite `--test` | 16 / 16 pruebas aprobadas |
| Creacion de 150 pestañas (`--stress-tabs 150 --cap 2048`) | 367.4 ms (2.4 ms/pestaña) |
| RAM total real con 150 pestañas (RSS de los 3 procesos) | 14.58 MB / 2048 MB |
| Desglose de RAM: `main` / `content` / `rdd-media` | 10.94 MB / 2.51 MB / 1.13 MB |
| Rehidratacion de pestaña deshidratada (Tab #1) | OK |

No se han publicado resultados de benchmarks frente a otros navegadores en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Linux, con `DISPLAY` disponible para el modo grafico X11 (`--gui`).
- Memoria: techo configurable con `--cap` (por defecto 2048 MB); la prueba de estres con 150 pestañas consume 14.58 MB de RSS total.
- CPU: no se especifican requisitos minimos; la compilacion usa `-O2` y `-pthread`.
- GPU: no se requiere aceleracion grafica dedicada; el compositor es ARGB32 por software y el motor 3D `Astra3D` implementa Z-buffer y shaders procedurales en CPU.
- Dependencias de compilacion: ninguna segun el autor; se enlazan dinamicamente `libssl.so.3` y `libz.so.1` mediante `dlopen`.
- Despliegue: compilacion nativa con `make -j4` y ejecucion del binario `./build/astra`; no se contemplan vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: 2.4 ms por pestaña en la creacion de 150 pestañas; no se publican datos de latencia de renderizado ni de throughput de red.

## Comparativa con modelos similares

| Proyecto | Tipo | Multiproceso | Techo de RAM | Extensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Astra Browser Core | Motor de navegador C++20 nativo | Si (`fork()` + `AF_UNIX`) | 2048 MB configurable | Manifest V3 con DNR | MPL-2.0 | Hugging Face, 0 descargas |
| Mozilla Firefox (Gecko) | Motor de navegador C++/Rust | Si (e10s) | No fijado por diseno | WebExtensions | MPL-2.0 | Publico, amplia adopcion |
| Chromium | Motor de navegador C++ | Si (site isolation) | No fijado por diseno | Manifest V3 | BSD-3-Clause | Publico, amplia adopcion |
| Electron | Framework de aplicaciones de escritorio | Si (proceso principal y renderers) | No fijado por diseno | Subconjunto de APIs de Chromium | MIT | Publico, amplia adopcion |

La comparativa es estructural, ya que Astra Browser Core no compite como modelo de IA sino como motor de navegador. Frente a Firefox y Chromium, su diferenciacion es el techo estricto de memoria y la ausencia de dependencias de esos ecosistemas; frente a Electron, la ausencia de Chromium embebido. No se dispone de datos de rendimiento comparativo con estos proyectos en la informacion proporcionada.

## Limitaciones y advertencias

- Proyecto en fase temprana: 0 descargas y 0 likes en Hugging Face, repositorio de 0.0 GB y sin pipeline asociado; no hay evidencia de uso en produccion.
- No es un modelo de lenguaje: carece de parametros, contexto, cuantizacion y pesos; cualquier evaluacion como modelo de IA es inaplicable.
- Cobertura web parcial: HTTP/1.1 unicamente, sin HTTP/2 ni HTTP/3, y soporte CSS limitado a Flexbox; no se declara compatibilidad con la totalidad de la web moderna.
- Dependencia de Linux y X11: el modo grafico requiere `DISPLAY`; no se menciona soporte para Wayland, macOS ni Windows.
- Seguridad: la carga dinamica de `libssl.so.3` y `libz.so.1` mediante `dlopen` exige que esas bibliotecas esten presentes y actualizadas en el sistema; no se documentan auditorias de seguridad externas.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Sesgos: no aplica en el sentido de sesgos de entrenamiento; la seleccion de listas de rastreadores y las politicas de privacidad de `AstraShield` introducen decisiones de diseno que pueden afectar a la funcionalidad de sitios legitimos.
- Licencia MPL-2.0: permite uso comercial y modificacion, pero obliga a publicar el codigo fuente de los archivos modificados bajo la misma licencia y a conservar los avisos de copyright; conviene revisar las obligaciones de distribucion antes de integrarlo en un producto.
- Sin datos de benchmarks frente a otros navegadores ni de latencia de renderizado; las cifras de la suite `--test` y del estres de pestañas son autodeclaradas por el autor.
- Idiomas documentados: espanol e ingles; no se declara soporte de internacionalizacion mas alla de esos dos idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/thevareoz/astra-browser-core
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al proyecto.
