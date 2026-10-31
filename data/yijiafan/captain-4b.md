# YijiaFan/CaPtain-4B

## Resumen

CaPtain-4B es un agente robótico de tipo *code-as-policy* desarrollado por YijiaFan a partir de Qwen3.5-4B, al que se le ha aplicado un post-entrenamiento en dos fases: fine-tuning supervisado (SFT) y aprendizaje por refuerzo (RL). A diferencia de los modelos VLA (Vision-Language-Action) clásicos, no genera acciones ni objetivos articulares directamente: en cada paso escribe código Python que se ejecuta en un entorno de pruebas (*harness*) con una API robótica de 22 capacidades de bajo nivel, lee los recibos de sus propias llamadas y decide por sí mismo cuándo la tarea está completa.

El modelo resuelve el problema de llevar tareas robóticas de manipulación a modelos de lenguaje pequeños: en lugar de aprender una política motora de extremo a extremo, delega el control en código verificable y apoya la percepción en servicios externos (SAM 3 y Molmo2-8B). Esto permite que un modelo de unos 5.000 millones de parámetros alcance tasas de éxito del 73,8 % en LIBERO y del 78,5 % en LIBERO-PRO, frente al 0 % del modelo base sin entrenar.

Es relevante porque demuestra un pipeline completo y reproducible (datos SFT, artefactos de RL, harness y código de evaluación) para convertir un VLM genérico en un agente encarnado. Los pesos se distribuyen en bf16 safetensors con la arquitectura `Qwen3_5ForConditionalGeneration`, licencia Apache 2.0 y soporte de razonamiento con plantilla de chat estándar de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (VLM multimodal, lm_head sin atar) |
| Parametros totales | 5.174.964.736 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 81.920 tokens (81920 en el despliegue con vLLM); ventana efectiva de 64k con compactacion del harness |
| Tipos de cuantizacion | bf16 (no se publican versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), ~10,4 GB de repositorio |

## Arquitectura y entrenamiento

CaPtain-4B parte de Qwen3.5-4B, un modelo multimodal imagen-texto-a-texto basado en la familia Qwen3.5. Durante el SFT la torre de vision se mantuvo congelada, de modo que el entrenamiento se centra en las capacidades de razonamiento y generacion de codigo. El modelo conserva el tokenizador, el procesador y la plantilla de chat de Qwen3.5-4B, incluyendo razonamiento con `<think>` y llamadas a herramientas en formato XML.

El entrenamiento consto de dos etapas documentadas: primero un fine-tuning supervisado con el dataset `YijiaFan/CaPtain-SFT-Data`, inicializado desde el checkpoint `YijiaFan/CaPtain-4B-SFT` (que tambien sirve como referencia KL), y despues aprendizaje por refuerzo con puntos de partida y warm start del critico distribuidos en `YijiaFan/CaPtain-artifacts`. El modelo fue entrenado sobre la plantilla de peticion exacta del harness: prompt de sistema con `TASK.md`, esquema de la herramienta `python` (contrato `python-runtime/v1`), recibos de una linea por cada llamada robotica y notas de compactacion de contexto. No se ha publicado el numero de tokens de entrenamiento ni la composicion detallada del dataset.

Un detalle de diseno importante: la percepcion no la realiza el propio modelo, sino servicios del harness (`segment` y `mark_point` con SAM 3 y Molmo2-8B, con posiciones obtenidas por retroproyeccion de profundidad). El modelo invoca estas herramientas pero no las sustituye. Tampoco ve poses de objetos, contactos ni el predicado de exito, que permanecen en el host.

## Capacidades

- Generacion de codigo Python orientado a control robotico: escribe programas para una sesion persistente y aislada de Python 3.11 con 22 capacidades de bajo nivel (percepcion, medicion geometrica, movimiento custodiado a nivel de IK) mas `finish()`, sin macros de agarre o colocacion.
- Razonamiento multi-paso: usa el modo de razonamiento de Qwen3.5 (`<think>`) antes de emitir llamadas a herramientas.
- Tool calling nativo: llamadas a herramientas en formato XML (parser `qwen3_xml`), con la herramienta unica `python` y llamadas indirectas a los servicios de percepcion.
- Interpretacion de imagenes de camara: recibe imagenes de camara junto con su propio codigo, su salida y los recibos de las llamadas.
- Decision autonomia de terminacion: el propio agente decide cuando la tarea esta completa llamando a `finish()`.
- Ciclo agente de largo horizonte: hasta 60 peticiones al modelo, 1.080 segundos de tiempo de pared y 150 acciones fisicas por episodio.
- No es un VLA: fuera del harness CaPtain-Harness se comporta como un VLM pequeno ordinario, sin capacidad robotica.

## Casos de uso

- Evaluacion en benchmarks de manipulacion (LIBERO y derivados): el caso de uso principal; el modelo ejecuta episodios completos de manipulacion en simulacion, puntuados mediante el predicado oculto del host y la llamada autonoma a `finish()`.
- Investigacion en agentes encarnados code-as-policy: el pipeline completo (datos SFT, artefactos de RL, configs y listas de tareas) esta publicado, lo que permite reproducir el post-entrenamiento o extenderlo a nuevos dominios.
- Control de robots con APIs de bajo nivel: en un robot real o simulado con una API comparable (percepcion, medicion geometrica, movimiento custodiado), el modelo puede escribir y ejecutar programas de manipulacion paso a paso leyendo los recibos de cada llamada.
- Orquestacion de servicios de percepcion: el modelo puede coordinar SAM 3 y Molmo2-8B como servicios, decidiendo cuando segmentar escenas o marcar puntos de interes y combinando los resultados con retroproyeccion de profundidad.
- Estudio de RL sobre agentes de codigo: los artefactos de RL (starts, warm start del critico, configs) permiten analizar como el aprendizaje por refuerzo mejora un agente SFT (del 55,4 % al 73,8 % en LIBERO).
- Baseline para comparacion de politicas de codigo: al publicarse el protocolo de evaluacion exacto (muestreo, presupuestos y estados iniciales), sirve como punto de referencia reproducible frente a VLAs y otros agentes.

## Benchmarks y rendimiento

Todos los valores son tasas de exito (%) en simulacion, con muestreo T = 1.0, top_p = 1.0, thinking activado, y presupuestos de 60 peticiones, 1.080 s y 150 acciones fisicas por episodio. *Host* = el predicado de exito oculto del benchmark se cumple; *Strict* = exito de host mas llamada autonoma a `finish()`.

**Familia LIBERO** (host / strict):

| Benchmark | Episodios | Qwen3.5-4B | CaPtain-4B-SFT | CaPtain-4B |
|---|:-:|:-:|:-:|:-:|
| LIBERO, estados oficiales retenidos 11-16 | 240 | 0,0 / 0,0 | 55,4 / 52,1 | **73,8 / 67,5** |
| LIBERO-PRO Pos+Task, media de 6 celdas | 600 | 0,3 / 0,2 | 59,5 / 56,7 | **78,5 / 71,5** |
| LIBERO-PRO Pos+Task, media de 8 celdas | 800 | 0,2 / 0,1 | 49,2 / 45,1 | **68,6 / 58,9** |
| LIBERO-Plus, 7 categorias | 700 | 0,0 / 0,0 | no disponible (tabla truncada en la model card) | no disponible (tabla truncada en la model card) |

Los resultados de LIBERO-MAX y de los benchmarks de transferencia no estan disponibles en la informacion proporcionada (la model card esta truncada). No se han publicado benchmarks estandar de NLU/codigo (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM para inferencia: unos 10,4 GB solo de pesos en bf16; con KV cache para 81.920 tokens de contexto y hasta 12 imagenes por peticion, se recomienda una GPU con 24 GB o mas (con `--max-num-seqs 16` y prefix caching, mas si se sirve en paralelo).
- GPU recomendadas: una RTX 4090 o A100/H100 para despliegue comodo con vLLM; no hay cifras oficiales de VRAM minima.
- Consumer GPU: plausible en una RTX 4090 (24 GB) para un unico usuario con contexto limitado; no hay confirmacion oficial.
- Despliegue: vLLM 0.29 como endpoint compatible con OpenAI (flags documentados: `--dtype bfloat16 --max-model-len 81920 --enable-prefix-caching --limit-mm-per-prompt '{"image":12}' --max-num-seqs 16 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_xml`). No se mencionan soportes para llama.cpp, Ollama o TGI, y al ser un modelo `Qwen3_5ForConditionalGeneration` en bf16 sin versiones GGUF, no cabe esperar compatibilidad inmediata con llama.cpp.
- Servicios adicionales: el harness requiere levantar SAM 3 (puerto 8114) y Molmo2-8B (puerto 8122), lo que anade requisitos de VRAM significativos a la infraestructura total.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CaPtain-4B | Code-as-policy (SFT + RL sobre VLM) | 5,17 B | 81.920 tokens | Apache 2.0 | Pesos, datos, harness y pipeline publicados |
| Qwen3.5-4B (base) | VLM generalista | ~4 B | no disponible | no disponible | Publico en HuggingFace |
| CaPtain-4B-SFT | Variante solo SFT del mismo pipeline | 5,17 B | 81.920 tokens | Apache 2.0 | Publico en HuggingFace |

Frente a VLAs clasicos de manipulacion (por ejemplo OpenVLA o RT-2) no hay numeros comparativos publicados en la informacion disponible; la unica comparacion documentada es interna: el modelo base sin entrenar obtiene 0 % en LIBERO, la variante SFT 55,4 % y la variante final con RL 73,8 %.

## Limitaciones y advertencias

- Dependencia total del harness: el modelo solo funciona bien dentro de CaPtain-Harness, con su plantilla de peticion exacta. Los propios autores advierten de no escribir prompts a mano ni modificar el texto visible por el modelo (TASK.md, descripciones de herramientas, recibos) al evaluarlo. Fuera del harness es un VLM pequeno sin capacidad robotica.
- Dominio acotado: entrenado y evaluado en manipulacion en simulacion (familia LIBERO); no hay evidencia de transferencia a robots reales en la informacion disponible.
- Percepcion delegada: el rendimiento depende de servicios externos (SAM 3, Molmo2-8B, retroproyeccion de profundidad); fallos en esos servicios degradan el agente.
- Informacion oculta: el modelo no ve poses de objetos, contactos ni el predicado de exito, lo que limita su capacidad de autocorreccion en casos ambiguos.
- Idioma: entrenado en ingles; no hay soporte documentado para otros idiomas, incluido el castellano.
- Riesgo de alucinacion y sesgos: hereda los de Qwen3.5-4B; no hay evaluaciones especificas de sesgo publicadas.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos y servicios auxiliares (SAM 3, Molmo2-8B) pueden tener licencias propias que conviene verificar.
- Consumo de recursos por episodio: hasta 60 peticiones al modelo y 1.080 segundos por episodio, un coste notable para despliegues a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YijiaFan/CaPtain-4B
- Variante SFT: https://huggingface.co/YijiaFan/CaPtain-4B-SFT
- Datos SFT: https://huggingface.co/datasets/YijiaFan/CaPtain-SFT-Data
- Artefactos de RL y configs: https://huggingface.co/datasets/YijiaFan/CaPtain-artifacts
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Pagina del proyecto: https://waltstephen.github.io/captain/
- Codigo del pipeline (SFT, RL): https://github.com/waltstephen/CaPtain
- Harness (necesario para ejecutar el modelo): https://github.com/waltstephen/CaPtain-Harness
- Paper: *CaPtain: A Pipeline for Post-Training Code-as-Policy Robot Agents* (enlace directo no disponible)
