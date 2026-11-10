# yyuncong/SyncWorld-mv3-strip384-recent8-s7cmd-from20k-step20000

## Resumen

SyncWorld-mv3-strip384-recent8-s7cmd es un checkpoint final (update 20000 de 20000) de un modelo de mundo orientado a robotica, desarrollado por el usuario yyuncong dentro de la rama `in-context` de SyncWorld-dev. Se trata de un modelo de dinamica directa (*forward dynamics*) que, dada una fotograma ancla y una secuencia de acciones futuras, genera los siguientes 16 fotogramas de video. Su relevancia radica en que combina vision multivista (tres camaras: dos en tercera persona y una en la muneca), condicionamiento en contexto de hasta 8 fragmentos de 16 transiciones previas y acciones nativas de distintos robots en una unica representacion.

El modelo se inicializa solo con pesos del checkpoint recent8 v2 en el update 20000 y se entrena sobre la mezcla de datos PEWM s7, que agrega robocasa, robomimic, RLBench, DROID y rollouts contrafactuales de simulacion. Emplea una arquitectura transformer con atencion completa (*full-attention*) y un modulo `moe_gen` (mezcla de expertos) que se entrena junto con el embedder temporal y las proyecciones de VAE y acciones. No usa memoria TTT ni recuperacion: el contexto se pasa como condicionamiento limpio en orden temporal.

El checkpoint es relevante ahora porque representa el estado del arte interno de la rama `in-context` en el update 20000, con una perdida de flow-matching de video de 0.0848, y porque documenta de forma muy detallada el pipeline de datos, la conversion de acciones y el esquema de muestreo, lo que facilita su reproduccion y evaluacion por parte de investigadores en robotica y modelos de mundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion completa (*full-attention*) y modulo `moe_gen` (mezcla de expertos); sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 8 fragmentos de 16 transiciones previas (K uniforme en 1..8) mas el fotograma ancla y 16 acciones futuras |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas declaradas) |
| Licencia | openmdw-1.1 (enlazada a la licencia de NVIDIA Cosmos) |
| Formato de pesos | DCP del entrenador convertido a bf16; config en `config.pkl`; receta en `training/recipe.toml` |
| Tamano del repositorio | 30.3 GB |
| Resolucion de entrada | Tira de 1536x384 compuesta por tres celdas de 512x384 (4:3) |
| Acciones | Comandos nativos por paso: [dx, dy, dz cm, roll, pitch, yaw euler-xyz deg, gripper open] |
| Hardware de entrenamiento | 4 nodos x 8 H100 (HSDP: grupo FSDP de 8 vias por nodo, 4 replicas) |
| Actualizaciones | 20.000 updates, checkpoint cada 1.000 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con atencion completa en la rama `in-context`, sin memoria TTT ni mecanismo de recuperacion. Cada consulta (*query*) se compone de un fotograma ancla mas sus 16 acciones futuras, y el modelo genera los 16 fotogramas siguientes. Antes del ancla se colocan K fragmentos de 16 transiciones que terminan justo antes de ella, en orden temporal, como condicionamiento limpio; K se muestrea uniformemente en 1..8 por update, limitado al prefijo disponible: min(K, (t0 - 1) // 16). No hay embedding de distancia al ancla. La entrada visual es una tira de 1536x384 con tres celdas de 512x384: las dos camaras en tercera persona se barajan entre las dos primeras celdas por secuencia, y la camara de la muneca ocupa la ultima. Se aplica *view dropout* por secuencia (una camara al 10 %, dos al 5 %) y recortes verticales aleatorios en las camaras de 512x512 (tercera persona 0.3-0.65, muneca 0.5-1.0); las camaras DROID de 910x512 se recortan al centro a 4:3.

El entrenamiento parte solo de los pesos de recent8 v2 en el update 20000, con optimizador, schedule de LR y flujos de datos nuevos. Se usa AdamW (betas 0.9/0.99, weight decay 0.05), LR 5e-5 tras un calentamiento lineal de 100 updates y luego constante; se entrenan `moe_gen`, el embedder temporal y las proyecciones de VAE y acciones, con una reetiquetacion de ejes de accion por secuencia (p 1.0), computo en bf16 con pesos maestros fp32 y checkpointing completo de activaciones. El lote efectivo es de 32 secuencias por update (1 por GPU, 32 GPUs). La funcion de perdida es la de flow-matching de video de la consulta, con el 80 % de las secuencias en la ventana de alto ruido (t en [950, 1000]) y pesos de movimiento (`anchor_pixel_diff_union_pred`, suelo 0.2) normalizados por celda de camara. El conjunto de datos comprende 481.574 grabaciones con las tres camaras: robocasa_v2 50.543, robomimic_v2 108.755, rlbench_wrist_mv 32.423, droid_2cam_wide 25.994 e icgen_rc 119.385 e icgen_rm 144.474 (rollouts contrafactuales de simulacion). El muestreo sigue la lista de ventanas C7 de PEWM (1.755.873 ventanas) con cuotas por bucket y pesos por ventana.

## Capacidades

- Generacion de video condicionada por acciones: produce los 16 fotogramas siguientes a un ancla dado un vector de 16 acciones futuras.
- Dinamica directa (*forward dynamics*): modela la evolucion del entorno robotico a partir de comandos, no solo la apariencia.
- Vision multivista: procesa simultaneamente dos camaras en tercera persona y una camara de muneca en una unica tira de 1536x384.
- Condicionamiento en contexto: acepta hasta 8 fragmentos de 16 transiciones previas como contexto limpio, en orden temporal.
- Soporte de acciones nativas heterogeneas: comandos robosuite OSC_POSE, filas `cmd_v2` de DROID y movimiento realizado de RLBench convertido a la representacion comun.
- Mezcla de expertos (`moe_gen`) entrenada de forma conjunta con el resto del modelo.
- No dispone de capacidades linguisticas, tool calling, agentes ni razonamiento simbolico declaradas.

## Casos de uso

- Simulacion de politicas robotizadas: dado un plan de acciones generado por un controlador, el modelo predice los 16 fotogramas siguientes y permite evaluar la politica sin ejecutarla en el robot fisico, reduciendo coste y riesgo.
- Aumento de datos para entrenamiento de politicas: generar rollouts sinteticos contrafactuales sobre escenas de robocasa y robomimic, aprovechando que el modelo ya se entreno con rollouts contrafactuales de simulacion.
- Verificacion de planes en tiempo de ejecucion: comparar el video predicho con la observacion real de las tres camaras para detectar desviaciones y disparar replanificacion.
- Modelado de dinamica para aprendizaje por refuerzo basado en modelo: usar el modelo como simulador aprendido para entrenar agentes en bucle cerrado con contexto de hasta 8 fragmentos previos.
- Investigacion en modelos de mundo multivista: evaluar el efecto del condicionamiento en contexto y de la camara de muneca en la coherencia temporal y espacial de las predicciones.
- Benchmarking de representaciones de acciones: comparar comandos nativos frente a movimiento realizado usando la misma arquitectura y mezcla de datos, gracias a la conversion exacta documentada.
- Prototipado de tareas de manipulacion con RLBench: generar videos condicionados en eventos de apertura y cierre de pinza para estudiar el efecto de la accion sobre el objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de entrenamiento (`train@2/loss`, media de los 500 updates previos a cada marca):

| Update | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 | 20000 |
|---|---|---|---|---|---|---|---|
| Loss | 0.0995 | 0.0958 | 0.0926 | 0.0894 | 0.0874 | 0.0864 | 0.0848 |

El autor advierte que esta perdida no es comparable con la de las rondas anteriores por el uso de acciones de comando, la mezcla s7 y los pesos por vista.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 30.3 GB en bf16, por lo que se requiere al menos esa capacidad en GPU para cargar los pesos completos, mas memoria para activaciones y el VAE.
- GPU recomendadas: H100 (usadas en entrenamiento), A100 80 GB o GPUs con 48 GB o mas para inferencia en bf16.
- Cabe en GPU de consumo: no disponible; por el tamano del checkpoint (30.3 GB) no cabe en GPUs de 24 GB sin cuantizacion, y no se documentan tipos de cuantizacion.
- Opciones de despliegue: el checkpoint esta en formato DCP del entrenador, no en safetensors ni GGUF; requiere el codigo de entrenamiento (recipe `wm_ttt/retrieval/recipe_qctx_incontext_mv_A_recent8_v3s7_8gpu.toml`) para cargarlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-s7cmd (este) | no disponible | Hasta 8 fragmentos de 16 transiciones | Video multivista + acciones | openmdw-1.1 | Checkpoint en HF |
| SyncWorld mvSV3 (rama de recuperacion) | no disponible | Seleccion de contexto por recuperacion | Video multivista + acciones | openmdw-1.1 | Mencionado en la model card, sin enlace directo |
| recent8 v2 (checkpoint base) | no disponible | Hasta 8 fragmentos de 16 transiciones | Video multivista + acciones | openmdw-1.1 | Checkpoint base del que parte este modelo |
| cosmos-framework-dev strip384 | no disponible | no disponible | Video multivista | no disponible | Run previo citado en la model card |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo de investigacion sin descargas ni likes en Hugging Face en el momento de la consulta; no hay evidencia de validacion por terceros.
- No se han publicado benchmarks ni evaluaciones externas; el unico indicador es la perdida de entrenamiento, no comparable con rondas anteriores.
- El checkpoint esta en formato DCP del entrenador, lo que dificulta su uso fuera del codigo de entrenamiento original.
- La licencia openmdw-1.1 remite a la licencia de NVIDIA Cosmos; es necesario revisar sus terminos para uso comercial antes de desplegar.
- El modelo no tiene capacidades linguisticas ni de agente; cualquier uso conversacional queda fuera de su alcance.
- Riesgo de alucinacion visual: al ser un modelo generativo de video, puede producir fotogramas plausibles pero fisicamente incorrectos, especialmente en ventanas de alto ruido.
- Sesgos derivados de la mezcla de datos: dominan robocasa, robomimic, RLBench y DROID; el rendimiento en otros dominios roboticos no esta caracterizado.
- La conversion de acciones depende de supuestos documentados (ganancias de PEWM v1 para RLBench, escala de comandos en simulacion aproximadamente 4x el movimiento realizado), lo que puede introducir desviaciones en dominios no cubiertos.
- El contexto maximo esta limitado a 8 fragmentos de 16 transiciones; no hay memoria TTT ni recuperacion en esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7cmd-from20k-step20000
- Licencia openmdw-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
