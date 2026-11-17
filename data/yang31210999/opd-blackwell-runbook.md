# yang31210999/opd-blackwell-runbook

## Resumen

`yang31210999/opd-blackwell-runbook` no es un modelo de lenguaje, sino un repositorio de infraestructura distribuida publicado en Hugging Face. Contiene el manual operativo (v3.0, en chino) y los scripts de un sistema llamado OPD que convierte una maquina ajena de 8 GPU en un nodo remoto controlado por el autor del proyecto. La persona fisica junto a la maquina solo pega una linea de comandos e introduce dos tokens; a partir de ahi, la instalacion, el diagnostico, la reparacion y la ejecucion de tareas se orquestan de forma remota mediante ficheros de control versionados en Git.

El diseno evita el acceso shell arbitrario: las acciones estan limitadas por una lista blanca (`scripts/control_rules.py`), los parametros con metacaracteres de shell se rechazan y cada instruccion lleva un `seq` que garantiza ejecucion unica y ordenada, con caducidad de 2 o 24 horas. Los nodos se identifican por los primeros 8 caracteres del sha256 del hostname, de modo que el repositorio publico no expone nombres de maquina, rutas ni usuarios.

Es relevante ahora porque documenta un patron concreto de computacion oportunista sobre hardware prestado, con reglas de utilizacion de GPU (minimo del 85 % por tarjeta), contabilidad de uso cada 10 segundos y un mecanismo de relleno (`gpu_fill.sh`) que mantiene las tarjetas ocupadas con procesos del propietario cuando no hay tareas del proyecto. No incluye pesos, tokenizador ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de infraestructura, no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentacion esta redactada en chino) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts `.py` y `.sh`, ficheros de cola y perfiles `.env`) |

## Arquitectura y entrenamiento

No aplica: el repositorio no define una red neuronal ni un proceso de entrenamiento. Su "arquitectura" es un sistema de orquestacion con tres planos. El plano de control descendente usa exclusivamente `git pull` cada 60 segundos sobre ficheros `control/<nodo>.yaml`; el plano de tareas se define en `tasks/queue_<nombre>.txt` con un formato versionado (version 2) que declara fases (`open`, `auto`, `locked`), dependencias entre tareas, numero de GPU por tarea (`#gpus`), pesos a precargar (`#fetch`), lecturas de evaluacion (`#eval`, `#pair`, `#budget`) y tiempos de paso esperados (`#steptime`). El plano de telemetria sube resultados a un repositorio publico de Hugging Face (pesos, lecturas, pulso) y a uno privado (estado, logs, recibos), con un repositorio Git privado como respaldo cuando HF no esta disponible.

El ciclo de vida de un nodo nuevo sigue siete pasos remotos secuenciados: `env-probe`, `queue <nombre>`, `setenv K=V`, `setup all`, `run FETCH-all`, `run PROBE-TAIL` (canario de 3 pasos) y `dispatch on`, que solo se acepta si el entorno principal esta operativo y el canario ha pasado en la propia maquina. Los objetivos declarados son: estado visible en 5 minutos, descarga de pesos iniciada en 10 minutos y primera ejecucion de entrenamiento en 2,5 horas. La validacion se hace en CPU mediante `scripts/test_preflight_enum.py`, que ejecuta cada tarea multi-GPU hasta el punto de lanzamiento, y con suites de pytest y scripts de test con duraciones declaradas de 6 y 14 minutos respectivamente.

## Capacidades

- Orquestacion remota de nodos GPU mediante ficheros de control versionados, con ejecucion unica por `seq` y caducidad configurable.
- Lista blanca de acciones agrupadas en cinco categorias: programacion (`queue`, `dispatch`, `pause`, `resume`, `prio`, `run`, `rerun`, `kill`, `cancel`), inspeccion (`ps`, `logs`, `tail`, `snapshot`, `du`, `mounts`, `inventory`, `env-probe`, `heartbeat`), entorno (`set`, `setenv`, `setup`, `verify`, `fa-build`, `update`, `restart-loops`), procesos (`signal`, `kill-pgid`, `reap`) y datos (`eval`, `upload`, `restore`, `publish`, `pend-weight`, `move-ckpt`, `rm-ours`).
- Gestion de procesos con verificacion de identidad: solo actua sobre PID presentes en la tabla de procesos publicada recientemente y con coincidencia de hora de arranque y hash de linea de comandos.
- Relleno de GPU ociosa con procesos del propietario de la maquina, con limpieza selectiva por tarjeta (TERM, espera de 20 s, KILL -9) y sin usar `fuser -k /dev/nvidia*`.
- Contabilidad de utilizacion por GPU con medias de 1, 10, 30 minutos y 2 horas, porcentaje de tiempo sobre umbral y eventos `gpu_util_warn` (aviso 90 minutos antes) y `gpu_util_low`.
- Prebusqueda de pesos con 32 conexiones durante la fase congelada, sin ocupar GPU.
- Recuperacion ante desastres en clusters con almacenamiento compartido: `dr-keep`, `persist-env`, `rebuild-drill`, `leakscan`, `scrubdiff`.
- Publicacion con redaccion (`publish-redacted`) para evitar filtrar datos sensibles en el repositorio publico.

## Casos de uso

- Aprovechamiento de hardware prestado en laboratorio: una maquina de 8 GPU propiedad de un tercero se integra como nodo sin ceder credenciales ni acceso interactivo; el propietario solo ejecuta la linea de `COLDSTART.md` y el sistema se encarga del resto.
- Cumplimiento de politicas de utilizacion minima: en entornos donde las tarjetas deben mantenerse por encima del 85 %, `gpu_fill.sh` mantiene ocupacion con procesos del propietario y `gpu_monitor.py` genera evidencia de cumplimiento con medias moviles cada 10 segundos.
- Gestion de colas de experimentos heterogeneas: el formato `queue_<nombre>.txt` permite asignar colas distintas por nodo, con fases `open`/`auto`/`locked` y dependencias, lo que evita lanzar trabajos antes de que sus precondiciones esten listas.
- Reparacion remota sin acceso shell: ante un fallo de instalacion, el operador usa `tail <log>`, `setup <paso>` o `restart-loops`, y cada accion queda registrada con recibo, incluidas las rechazadas.
- Auditoria de seguridad en infraestructura compartida: la lista blanca de acciones, el rechazo de parametros con metacaracteres y la prohibicion explicita de tocar procesos de otros usuarios, `pid 1`, `sshd`, shells de login o ficheros con apariencia de token permiten revisar el comportamiento antes de desplegar.
- Recuperacion tras perdida de nodo en cluster con almacenamiento compartido: los comandos de la categoria de contingencia permiten reconstruir el entorno y verificar la reconstruccion (`rebuild-drill`) sin intervencion manual en la maquina.
- Validacion continua de recetas de entrenamiento: `test_preflight_enum.py` recorre cada tarea multi-GPU hasta el punto de lanzamiento en CPU, de modo que los errores de configuracion aparecen en integracion continua y no en la maquina remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye definiciones de lecturas de evaluacion (`#eval`, `#pair`, `#budget`) para los modelos que entrena, pero no se proporcionan cifras.

## Requisitos de hardware

- Nodo objetivo: maquina de 8 GPU (el manual cita perfiles para H200 en `profiles/h200.env`; el nombre del repositorio alude a Blackwell). No se detallan modelos concretos de tarjeta ni VRAM por GPU.
- Almacenamiento: se mencionan `$OPD_ROOT` y `$CKPT_ROOT` como unicos arboles de escritura permitidos, y se contempla el caso de disco lleno (el bucle de relleno sobrevive porque su estado vive en `/dev/shm`).
- Red: 32 conexiones paralelas para la prebusqueda de pesos; canal de control por `git pull` cada 60 segundos; latencia declarada de 1 a 1,5 minutos entre el envio de una instruccion y su recibo.
- Despliegue: scripts de shell y Python (`bootstrap.sh`, `cold_start.sh`, `overnight.sh`, `run_tasks.sh`, `heartbeat.sh`, `loops.sh`, `watchdog.sh`, `uploader.sh`); se detecta y prueba vLLM durante `setup`, pero no se especifican versiones ni configuracion de servicio.
- Throughput y latencia de inferencia: no disponibles.
- No cabe en GPU de consumo: el diseno presupone un nodo de 8 tarjetas y no contempla ejecucion monousuario.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada proyectos comparables de orquestacion remota de nodos GPU con lista blanca de acciones y contabilidad de utilizacion; el repositorio tampoco cita alternativas.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Cualquier uso como modelo de lenguaje es inviable.
- Licencia no declarada: no hay terminos de uso, lo que impide determinar si el uso comercial esta permitido. Antes de reutilizar los scripts hay que contactar con el autor.
- Documentacion integramente en chino: la ficha y el manual asumen lectores capaces de leer `COLDSTART.md` y las secciones de cola y control en ese idioma.
- Riesgo operativo alto por diseno: el sistema ejecuta acciones sobre una maquina de terceros. Aunque la lista blanca y la validacion de PID reducen la superficie, un error en `control_rules.py` o en `task.sh` afecta directamente al hardware y a los procesos del propietario.
- Dependencia de GitHub y Hugging Face como canales de control y telemetria; el respaldo por repositorio Git privado solo cubre el pulso, no la totalidad del plano de control.
- Trazabilidad limitada: el repositorio publico no expone nombres de host ni rutas, lo que dificulta la auditoria externa de que acciones concretas se ejecutaron en cada nodo.
- Fechas de creacion y actualizacion poco habituales (noviembre de 2026) y cero descargas o interacciones: no hay evidencia de uso en produccion ni de validacion por terceros.
- El manual advierte de que no se deben tocar procesos de otros usuarios, servicios de contenedor, shells de login, `tmux` o `jupyter`, y de que no se ejecutan comandos con metacaracteres de shell; cualquier extension del sistema debe respetar esas restricciones.
- Sin datos de rendimiento, latencia ni consumo energetico, no es posible estimar el coste operativo del nodo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yang31210999/opd-blackwell-runbook
- Referencia interna al manual de arranque: `COLDSTART.md` (incluido en el repositorio)
- Referencia interna al procedimiento de reconstruccion: `REBUILD.md` (incluido en el repositorio)
- Referencia interna al registro de cambios de reglas: `control/CHANGES.md` (incluido en el repositorio)
- Etiqueta con la documentacion larga de la version 2: `record-z172` (incluida en el repositorio)
