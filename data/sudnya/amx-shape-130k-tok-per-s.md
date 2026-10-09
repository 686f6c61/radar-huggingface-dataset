# Sudnya/amx-shape-130k-tok-per-s

## Resumen

`Sudnya/amx-shape-130k-tok-per-s` es un artefacto de benchmark publicado en HuggingFace por el usuario Sudnya bajo licencia Apache 2.0. No es un modelo de lenguaje utilizable: sus pesos son aleatorios (semilla 0) y el propio autor indica de forma explicita que "no escribe nada util". Su funcion es servir de "student" en un pipeline de medida de throughput sobre CPU con AMX, dentro del proyecto `dgx-spark-reasoning`.

El modelo implementa una arquitectura hibrida de tipo block-diffusion con capas de atencion y capas MoE, denominada "shape B" por el autor. Concretamente, combina gated linear attention con mezcla de expertos y sliding-window attention con MLP denso, repartidas en 6 capas con el patron `l s s l s l`. Los pesos se almacenan en int8 con escalas de activacion estaticas, y el repositorio ocupa 0,3 GB, de los cuales aproximadamente 47 MB corresponden a pesos int8.

Su relevancia no esta en la calidad de generacion, sino en la metrologia: permite medir la velocidad de un motor C++ de inferencia AMX (uno por nucleo de CPU) y validar la reproducibilidad byte a byte del pipeline de cuantizacion y empaquetado. El autor reporta 131-157k tokens/s de student en el pipeline student-teacher con 15 motores, y hasta 376k tokens/s agregados con 30 motores en 30 nucleos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con block diffusion; 6 capas en patron `l s s l s l` (l = gated linear attention + MoE; s = sliding-window attention + MLP denso ReLU²) |
| Parametros totales | no disponible (el repositorio contiene ~47 MB de pesos int8; el autor no publica el recuento de parametros) |
| Parametros activos | no disponible (MoE con 2 expertos compartidos + 2 enrutados, enrutado por bloque de 256 tokens) |
| Longitud de contexto | no disponible de forma explicita; las pruebas del autor usan 2.048 tokens de contexto y la ventana SWA es de 1.024 |
| Tipos de cuantizacion | Pesos int8 por columna de salida; escalas de activacion int8 estaticas calibradas sobre la referencia float64; operandos de atencion en bf16; escalas en fp32; pesos float en safetensors |
| Idiomas soportados | no disponibles (tokenizador BPE de 16.384 tokens; no se declara idioma alguno) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`ckB/weights.safetensors`) y pack propietario para el motor C++ (`packB.bin`, `packB.idx`); configuracion en `ckB/config.json` y escalas en `ckB/act_scales.json` |

## Arquitectura y entrenamiento

La arquitectura "shape B" tiene `d_model` 256, 6 capas y 2 cabezas de consulta con dimension 32. Las capas alternan dos tipos: las de tipo `l` combinan gated linear attention con una capa MoE de 64 expertos (2 compartidos y 2 enrutados, con `d_ff` de experto 320 y enrutado cada 256 tokens), mientras que las de tipo `s` usan sliding-window attention con ventana de 1.024 posiciones seguidas de un MLP denso ReLU² con `d_ff` 800. La lectura de salida es una readout aditiva factorizada de 16 x 32 x 32 sobre un vocabulario de 16.384 tokens, mas un token `[MASK]` de solo entrada con id 16.384. El mecanismo de generacion es block diffusion con K = 64 posiciones y R = 8 pasadas. El tokenizador es el BPE de 16.384 tokens de `gdiamos/amx-moe-eda-w2048-bugfixinit`, identico al de `gdiamos/amx-moe-e256-4day`.

No hay entrenamiento. Los pesos son aleatorios con semilla 0 y las escalas de activacion int8 se calibraron sobre una referencia float64, de modo que los ficheros reproducen exactamente los formatos de un modelo entrenable pero sin conocimiento alguno. No se aplico RLHF, DPO ni ningun otro ajuste. La innovacion tecnica destacable es el propio formato de despliegue: matrices int8 preempaquetadas en tiles AMX mas escalas fp32, embeddings y router, cargables por `libamxeng.so`. El autor documenta que los dos primeros comandos del repositorio (`python -m amx.ref.quant ckB --seed 0` y `python amx/dev/export.py ckB packB`) reproducen los ficheros byte a byte en unos 10 segundos, con coincidencia de todos los sha256 verificada el 2026-10-08.

## Capacidades

- Generacion de texto: no disponible. Los pesos son aleatorios, por lo que la salida no tiene contenido linguistico util.
- Razonamiento, codigo, matematicas y vision: no disponibles; no hay ninguna capacidad de este tipo en el modelo.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; no se declara idioma alguno.
- Modo thinking: no disponible.
- Medicion de throughput: es su funcion real. Permite medir tokens/s generados por motor y por nucleo con la configuracion indicada (2 secuencias por motor, contexto de 2.048 tokens).
- Validacion de pipeline de cuantizacion: sirve como referencia para comprobar que el pipeline int8 produce ficheros reproducibles byte a byte.
- Prueba de carga del motor AMX: al tener el mismo formato que un modelo entrenable, ejercita `libamxeng.so` sin depender de pesos reales.
- Verificacion de integridad: los sha256 publicados de `packB.bin` y `packB.idx` permiten comprobar la reproducibilidad de la exportacion.

## Casos de uso

- Medicion de throughput por nucleo: desplegar un motor AMX por nucleo con 2 secuencias y contexto de 2.048 tokens para caracterizar tokens/s generados por core (el autor reporta 15,5-16,5k con un motor en un nucleo y 13,0k por nucleo con 30 motores).
- Planificacion de capacidad en CPU: extrapolar el rendimiento agregado (376k tokens/s con 30 motores) para dimensionar un servidor de inferencia antes de disponer de los pesos entrenados.
- Prueba de regresion de rendimiento en CI: ejecutar `amx/bench/engine_bench.py` sobre `packB` en cada cambio del motor C++ o del pipeline de cuantizacion para detectar degradaciones de velocidad.
- Validacion de hardware AMX: comprobar que un equipo Sapphire Rapids o posterior ejecuta el motor con el rendimiento esperado; en el articulo se usa un Xeon w9-3475X.
- Verificacion de reproducibilidad de cuantizacion: regenerar `ckB` y `packB` con semilla 0 y comparar los sha256 publicados para confirmar que el pipeline int8 es determinista.
- Prueba de carga del pipeline student-teacher: usar el modelo como student con 15 motores para reproducir el rango de 131-157k tokens/s reportado y medir el coste del bucle de destilacion.
- Referencia de formato para integraciones: emplear `config.json`, `act_scales.json` y el par `packB.bin`/`packB.idx` como plantilla al exportar modelos propios al motor AMX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian significativos dado que los pesos son aleatorios. Los unicos datos publicados son de throughput, medidos en un Xeon w9-3475X con 2 secuencias por motor y contexto de 2.048 tokens:

| Configuracion | Tokens/s | Notas |
|---|---|---|
| 1 motor en 1 nucleo | 15,5-16,5k | Generacion medida por motor |
| 30 motores en 30 nucleos | 13,0k por nucleo; 376k agregados | Escalado por nucleo con 30 motores |
| Pipeline student-teacher, 15 motores | 131-157k de student | Throughput agregado del student |

## Requisitos de hardware

- VRAM para inferencia: no aplica; el modelo esta disenado para inferencia en CPU con AMX, no en GPU.
- CPU recomendada: Intel con AMX, es decir Sapphire Rapids o posterior. El autor valida sobre un Xeon w9-3475X. No funciona en plataformas sin AMX.
- Huella de memoria: aproximadamente 47 MB de pesos int8, por lo que cabe holgadamente en cache de ultimo nivel de las CPU objetivo y apenas consume RAM.
- GPU: no soportada para este formato; no se contemplan A100, H100 ni RTX 4090.
- Opciones de despliegue: motor C++ propio `libamxeng.so`, compilado con `make -C amx/csrc`, que carga `packB.bin`/`packB.idx`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato empaquetado es especifico del motor AMX.
- Latencia y throughput: los unicos datos disponibles son los de la tabla anterior (15,5-16,5k tokens/s con un motor y un nucleo; 13,0k por nucleo a 30 motores).

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de los modelos relacionados mas alla de compartir tokenizador y familia arquitectonica con `gdiamos/amx-moe-eda-w2048-bugfixinit` y `gdiamos/amx-moe-e256-4day`. La mayoria de los campos no estan disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sudnya/amx-shape-130k-tok-per-s` | no disponible (~47 MB int8) | no disponible (pruebas a 2.048) | 15,5-16,5k tok/s por motor; 376k agregados a 30 motores | Apache 2.0 | Publico en HuggingFace |
| `gdiamos/amx-moe-eda-w2048-bugfixinit` | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace; origen del tokenizador |
| `gdiamos/amx-moe-e256-4day` | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace; tokenizador identico |

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto util. Cualquier evaluacion de calidad carece de sentido; el autor lo advierte explicitamente ("random weights. This model writes nothing useful").
- No es un modelo de produccion: usarlo como sustituto de un modelo entrenado dara salidas sin significado.
- Dependencia de hardware: requiere AMX presente, lo que restringe el despliegue a Sapphire Rapids o posterior. Sin AMX, `libamxeng.so` no puede compilarse ni ejecutarse.
- Formato no estandar: el pack `bin`/`idx` solo lo carga el motor propio; no hay compatibilidad con ecosistemas de inferencia habituales.
- Idiomas y sesgos: no disponibles; no hay datos de idioma ni evaluacion de sesgo.
- Alucinacion: no aplica como riesgo de calidad, ya que la salida es aleatoria por construccion.
- Contexto: el autor solo documenta pruebas a 2.048 tokens; no se declara una longitud de contexto maxima soportada.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el contenido del repositorio no aporta valor funcional mas alla del benchmark.
- Web: las busquedas web realizadas no devolvieron ninguna referencia tecnica relevante sobre este modelo; los resultados obtenidos fueron herramientas genericas de deteccion de contenido generado por IA, sin relacion con el artefacto.
- Integridad: los hash publicados corresponden a la verificacion del 2026-10-08; cambios posteriores en el pipeline podrian invalidarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sudnya/amx-shape-130k-tok-per-s
- Repositorio de tokenizador de referencia: https://huggingface.co/gdiamos/amx-moe-eda-w2048-bugfixinit
- Repositorio con tokenizador identico: https://huggingface.co/gdiamos/amx-moe-e256-4day
- Repositorio `dgx-spark-reasoning` (referenciado en la model card como origen del pipeline `amx/`; no se proporciona URL)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web disponible.
