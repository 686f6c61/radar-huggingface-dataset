# tanvandinh/thpt-phong-dien-oj-code

## Resumen

`tanvandinh/thpt-phong-dien-oj-code` es un repositorio alojado en Hugging Face que, pese a su identificador y a su presencia en la plataforma, no contiene un modelo de inteligencia artificial en sentido estricto. El contenido publicado corresponde al código fuente y la documentación de un sistema de Online Judge (juez en línea) para entrenamiento de programación competitiva, desarrollado para el equipo de informática del instituto vietnamita THPT Phong Điền. El autor, `tanvandinh`, lo ha subido con la etiqueta `region:us` y sin pipeline, licencia ni idiomas declarados.

El artefacto descrito en la model card es una plataforma web completa: backend en Node.js 22 con Express y SQLite en modo WAL, frontend en React con Vite, TailwindCSS, Monaco Editor y KaTeX, y un motor de evaluación que soporta C++17, Python 3 y Free Pascal. Incluye un banco de 136 problemas con 1.630 tests ocultos repartidos en 16 temáticas, un plan de entrenamiento de 8 semanas, modo concurso con clasificación estilo ICPC y OI, y notificaciones mediante Zalo Bot.

Es relevante ahora únicamente como referencia de ingeniería para quienes necesiten desplegar un juez en línea ligero en un VPS de 1 CPU y 1 GB de RAM, o como ejemplo de empaquetado de una aplicación completa en un repositorio de Hugging Face. No debe confundirse con un modelo de lenguaje: no hay pesos, no hay arquitectura neuronal y no hay capacidades de generación de texto, razonamiento ni código en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo neuronal; es una aplicacion web Node.js + React con motor de evaluacion de codigo) |
| Parametros totales | No disponible (no es un modelo de parametros) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en metadatos; la documentacion esta redactada en vietnamita |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene codigo fuente, `dist/` compilado, base de datos SQLite y ficheros de test `.in`/`.out`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El sistema es una aplicacion monoproceso que sirve una build estatica de React desde `dist/` mediante Express, con persistencia en SQLite en modo WAL. El motor de evaluacion (`backend/judge/engine.js`) implementa una cola secuencial de un solo problema a la vez para acotar el consumo de RAM, y utiliza IOI `isolate` como mecanismo de aislamiento preferente, con retroceso automatico a `prlimit` + `unshare` con bloqueo de red y ejecucion bajo el usuario sin privilegios `judge_runner`.

El banco de problemas cubre 16 tematicas (entrada/salida, aritmetica, cadenas con KMP/Z/Manacher, arrays, busqueda binaria, two pointers, prefix sum 2D, backtracking, greedy, STL, programacion dinamica en varias variantes, grafos con BFS/Topo/Dijkstra/Floyd/DSU/MST, arboles con LCA y rerooting, segment tree/BIT lazy, geometria y combinatoria, y examenes integradores tipo HSG/VOI/ICPC). Cada problema incluye solucion de referencia en C++17 y Python 3, y el sistema soporta subtareas con puntuacion parcial y checkers personalizados con tolerancia de \(10^{-6}\) para numeros reales.

## Capacidades

- Evaluacion automatica de envios en C++17 (`g++ -O2`), Python 3 y Free Pascal (`fpc`), con veredictos AC, WA, TLE, MLE, RE y CE, e informacion de tiempo en milisegundos y memoria en megabytes.
- Soporte de entrada/salida estandar y de ficheros `.INP`/`.OUT` conforme al formato de examenes de estudiantes excelentes de Vietnam.
- Puntuacion por subtareas y checkers personalizados en Python.
- Cola de evaluacion secuencial con aislamiento mediante `isolate` o, en su defecto, `prlimit` + `unshare` con bloqueo de red.
- Gestion de usuarios con JWT de 7 dias y roles diferenciados (administrador docente y alumnos), con proteccion 401/403.
- Modo concurso con clasificacion en tiempo real estilo ICPC (numero de problemas resueltos y penalizacion de 20 minutos) y estilo OI (suma de puntos por test), con congelacion de la clasificacion en los ultimos 60 minutos.
- Plan de entrenamiento de 8 semanas con problemas obligatorios, problemas avanzados y examenes de fin de semana, incluidos examenes de 180 minutos.
- Desbloqueo progresivo de niveles de dificultad (5 niveles) condicionado a un 70 % de aceptados en el nivel anterior, configurable por el administrador.
- Notificaciones mediante Zalo Bot: registro de docentes por comando (`/dangky`, `/dangkynhom`), consultas (`/help`, `/homnay`, `/homqua`, `/tuan`, `/hs`, `/ds`), recordatorio a las 20:00 y resumen diario a las 22:00, con lista blanca de `chat_id`, comparacion en tiempo constante del codigo de registro, bloqueo de 24 horas tras 5 intentos fallidos, limite de 10 comandos por minuto y deduplicacion por `message_id`.
- Copia de seguridad automatica diaria de SQLite a las 02:00 con retencion de 14 copias, e importacion/exportacion completa del banco de problemas en `.zip`.

## Casos de uso

- Despliegue de un juez en linea para un equipo pequeno de programacion competitiva: el sistema esta disenado para 1 docente administrador y 3 alumnos sobre un VPS de 1 CPU y 1 GB de RAM, con un consumo aproximado de 45 MB en el proceso principal, lo que permite alojarlo en capas gratuitas de Oracle Cloud o Google Cloud.
- Entrenamiento estructurado de estudiantes de secundaria: el plan de 8 semanas con problemas obligatorios y avanzados, junto con el desbloqueo por porcentaje de aceptados, permite secuenciar el aprendizaje desde entrada/salida hasta segment tree y geometria.
- Simulacros de examen tipo HSG, VOI, Tin hoc tre e ICPC: el modo concurso con clasificacion ICPC/OI y congelacion de los ultimos 60 minutos reproduce las condiciones de una competicion real.
- Correccion de examenes con entrada/salida por fichero: el soporte de `.INP`/`.OUT` y de subtareas con puntuacion parcial encaja con el formato habitual de las pruebas oficiales vietnamitas.
- Evaluacion de soluciones con tolerancia numerica: el checker personalizado con error de \(10^{-6}\) sirve para problemas de geometria y calculo con numeros reales, donde una comparacion exacta produciria falsos negativos.
- Seguimiento automatizado del progreso: el bot de Zalo envia resumenes diarios y semanales a docentes registrados, con consultas por alumno y rachas de actividad, sin necesidad de que el administrador intervenga en el registro.
- Recuperacion ante fallos: la copia diaria de SQLite con retencion de 14 versiones y la exportacion del banco de problemas a `.zip` permiten restaurar el sistema tras una incidencia en el VPS.
- Referencia de implementacion de sandbox ligero: el uso de `isolate` con retroceso a `prlimit` + `unshare` y usuario sin privilegios constituye un patron reutilizable para jueces de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni equivalentes, dado que el artefacto no es un modelo de lenguaje. La unica cifra de rendimiento declarada es el consumo aproximado de 45 MB de RAM del proceso principal y la restriccion de diseno de ejecutar un unico envio a la vez para proteger la memoria del servidor.

## Requisitos de hardware

- RAM: aproximadamente 45 MB para el proceso Node.js principal; el diseno apunta a un VPS con 1 GB de RAM y swap de 2 GB configurada por el script `deploy.sh`.
- CPU: 1 OCPU es suficiente segun la documentacion; probado en x86_64 y ARM64 (Oracle Cloud `VM.Standard.E2.1.Micro` y `VM.Standard.A1.Flex`).
- GPU: no se requiere ni se menciona soporte de GPU.
- Almacenamiento: depende del banco de problemas; la documentacion cita 136 problemas con 1.630 ficheros de test `.in`/`.out` y una base de datos SQLite `phongdien_oj.db`.
- Sistema operativo: Ubuntu 22.04 o 24.04 LTS; tambien ejecutable en Windows, macOS y Linux con Node.js >= 22.5, Python 3 y `g++` (MinGW/GCC).
- Despliegue: ejecucion directa con `npm install && npm run seed && npm start`, script `deploy.sh` con systemd, `Dockerfile` y `docker-compose.yml`, y `Caddyfile` para HTTPS automatico con Caddy.
- Latencia y throughput: no disponibles; la cola secuencial implica que los envios se evaluan de uno en uno, sin cifras publicadas de tiempo por envio.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje y no se han identificado en la informacion proporcionada alternativas comparables de la misma categoria. Como referencia funcional, un juez en linea de este tipo se situaria frente a plataformas como DOMjudge o CMS (Contest Management System), pero no se dispone de datos de parametros, contexto, rendimiento ni licencia de esas herramientas en la informacion facilitada, por lo que no se establece comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni procesa lenguaje natural. Cualquier uso esperando esas capacidades sera un error de interpretacion.
- Ausencia total de metadatos: sin licencia declarada, sin idiomas declarados, sin pipeline y sin model card en el sentido convencional; el uso comercial queda en situacion juridica indeterminada.
- La documentacion esta integrada en la model card y redactada en vietnamita, lo que limita su adopcion por parte de equipos no familiarizados con ese idioma.
- Credenciales por defecto en la documentacion (`admin` / `PhongDien@2026` y contrasenas de alumnos): deben cambiarse obligatoriamente antes de cualquier despliegue accesible desde Internet.
- Dependencia de binarios del sistema (`g++`, `fpc`, `python3`, `isolate`, `prlimit`, `unshare`) cuya disponibilidad y version varia segun la distribucion; el fallback entre mecanismos de aislamiento puede degradar la seguridad si `isolate` no esta instalado.
- El aislamiento por `prlimit` + `unshare` es menos robusto que `isolate`; un envio malicioso podria intentar escapar del sandbox si la configuracion del sistema no es la adecuada.
- La cola secuencial de un envio a la vez limita el throughput en escenarios con muchos usuarios concurrentes; el diseno esta pensado para 1 docente y 3 alumnos, no para uso masivo.
- Dependencia de servicios externos: Zalo Bot Platform para las notificaciones y una cuenta en Oracle Cloud o Google Cloud para el alojamiento gratuito; la interrupcion o cambio de condiciones de esos servicios afecta al sistema.
- Sin resultados de benchmarks ni pruebas de carga publicadas; el rendimiento real en produccion no esta verificado de forma independiente.
- Fecha de creacion y actualizacion del repositorio (2026-11-28) posterior a la fecha actual de referencia, lo que impide confirmar el estado real del proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tanvandinh/thpt-phong-dien-oj-code
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo, demos ni documentacion complementaria.
