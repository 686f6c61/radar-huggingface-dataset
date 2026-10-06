# Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W4A16-Vision

## Resumen

Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W4A16-Vision es un checkpoint multimodal cuantizado en 4 bits, publicado por el usuario Xananthium, que combina el modelo de lenguaje "aggressive" de HauhauCS (derivado sin censura de Qwen3.6-35B-A3B) con la torre de visión oficial de Qwen/Qwen3.6-35B-A3B. No es un modelo entrenado desde cero: es un artefacto de reconstruccion y cuantizacion que parte del GGUF Q8_K_P de mayor fidelidad del modelo de HauhauCS, lo de-cuantiza, aplica las transformaciones inversas de layout de Qwen3.6 y lo vuelve a empaquetar en el layout nativo de Hugging Face junto con la torre de visión BF16 oficial.

El objetivo es ofrecer un checkpoint listo para servir con vLLM que conserve la capacidad de visión del modelo oficial y herede el comportamiento poco restrictivo del ajuste de HauhauCS, todo ello en unos 21 GiB de pesos. La cuantizacion es W4A16 simetrica INT4 con group size 128, empaquetada como `auto_round:auto_gptq` (no AWQ), generada con AutoRound 0.14.2 en modo model-free RTN.

El nombre del modelo indica una arquitectura MoE de 35.000 millones de parametros totales con 3.000 millones activos (35B-A3B), etiquetada en HuggingFace como `qwen3_5_moe`. Existe una discrepancia relevante: los metadatos de safetensors del repositorio declaran 6.832.109.424 parametros, cifra incompatible con el tamano del repositorio (22,2 GB) y con el nombre, por lo que probablemente el header solo refleja una parte de los tensores. Es relevante ahora porque demuestra un flujo de trabajo de reconstruccion GGUF -> safetensors -> W4A16 para despliegue en vLLM con compatibilidad de API OpenAI y Anthropic, incluyendo tool calling nativo e imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (torre de vision + modelo de lenguaje MoE); etiqueta HuggingFace `qwen3_5_moe` |
| Parametros totales | 6.832.109.424 segun metadatos de safetensors (~6,83B); 35B nominal segun el nombre del modelo. Dato inconsistente, ver limitaciones |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible como valor nativo; en la validacion se sirvio con `--max-model-len 180000` y se proceso una peticion de 179.900 tokens de entrada |
| Tipos de cuantizacion | W4A16 simetrica INT4, group size 128, empaquetado `auto_round:auto_gptq` (no AWQ); AutoRound 0.14.2 model-free RTN |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Autor | Xananthium |
| Pipeline | image-text-to-text |
| Modelos base | HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (lenguaje, via GGUF Q8_K_P) y Qwen/Qwen3.6-35B-A3B (vision, processor, tokenizer, configuracion y MTP) |
| Tamano del repositorio | 22,2 GB (checkpoint aproximado de 21 GiB) |
| Fecha de publicacion | 2026-08-23 (actualizado 2026-10-06) |
| Descargas / likes | 111 descargas, 0 likes |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con mezcla de expertos (MoE) en la parte de lenguaje y una torre de vision independiente. Segun la model card, el proceso de construccion fue: partir del artefacto GGUF `Q8_K_P` del checkpoint de HauhauCS, de-cuantizar sus tensores de lenguaje, aplicar las transformaciones inversas de layout propias de Qwen3.6 y reconstruir el resultado en el layout nativo de tensores de Hugging Face. Sobre esa base se conservo la torre de vision BF16 oficial de Qwen/Qwen3.6-35B-A3B, junto con el processor, el tokenizer, la configuracion y la fuente del mecanismo MTP (prediccion multi-token). Por ultimo, el checkpoint de lenguaje se empaqueto a W4A16.

La cuantizacion se realizo con AutoRound 0.14.2 en modo model-free RTN, simetrica INT4 con group size 128 y activaciones en 16 bits, empaquetada como `auto_round:auto_gptq`. Esto implica que los pesos de lenguaje se reducen a 4 bits sin calibracion basada en datos (RTN), mientras que la torre de vision permanece en BF16. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni sobre si hubo fases de RLHF, DPO u otras tecnicas de alineamiento: esos datos pertenecen a los repositorios originales de Qwen y de HauhauCS y no se detallan en la informacion proporcionada. Tampoco se documenta ninguna innovacion de decodificacion especulativa mas alla de la herencia del MTP oficial.

La validacion realizada por el autor incluye: carga del checkpoint en vLLM 0.27.1 sobre dos GPU con seleccion automatica de kernels Marlin compatibles con INC/AutoRound; paso de una completacion de texto por API compatible con OpenAI; paso de texto, tool use nativo y entrada de imagen por API compatible con Anthropic; una peticion de 179.900 tokens de entrada (179.904 totales); coincidencia exacta de los 333 tensores de vision retenidos frente a la fuente BF16 oficial; y una prueba local de marcadores de rechazo con 0 marcadores en 520 prompts.

## Capacidades

- Generacion de texto conversacional multi-turno, con ventana de contexto validada de hasta 180.000 tokens en el despliegue probado.
- Entrada de imagenes (pipeline `image-text-to-text`); la torre de vision procede del checkpoint oficial y sus 333 tensores se verificaron identicos a la fuente BF16.
- Tool calling / function calling nativo, validado en la ruta compatible con Anthropic; en el ejemplo de servicio se usa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Modo de razonamiento: el despliegue de referencia activa `--reasoning-parser qwen3`, lo que indica soporte de contenido de razonamiento separado en la respuesta.
- Compatibilidad de API con OpenAI y con Anthropic, incluyendo bloques de contenido de imagen de Anthropic. El autor indica que esto lo hace apto para usar con Claude Code detras de un proxy inverso autenticado.
- Prediccion multi-token (MTP) heredada del checkpoint oficial, util para decodificacion acelerada cuando el runtime la soporte.
- Comportamiento poco restrictivo respecto a rechazos: en la prueba finita del autor se registraron 0 marcadores de rechazo en 520 prompts.
- Capacidades multilingues: no disponible.
- Soporte de razonamiento multi-paso y de agentes: implicitamente cubierto por tool calling y modo de razonamiento, sin datos de evaluacion especificos.

## Casos de uso

- Agentes de codigo asistido por herramientas: el modelo puede integrarse en un bucle de agente que invoque funciones externas gracias al tool calling nativo y al parser `qwen3_coder`, con contexto suficientemente largo para arrastrar un repositorio entero de tamano medio (hasta ~180.000 tokens verificados).
- Sustitucion de Claude Code mediante proxy inverso autenticado: al validarse la ruta compatible con Anthropic, incluyendo bloques de imagen y tool calls, puede colocarse detras de un proxy y servir como backend alternativo para flujos de terminal orientados a agentes.
- Analisis de documentos largos con imagenes: informes, contratos o articulos con figuras y tablas, aprovechando la ventana de contexto extendida y la entrada multimodal en una sola peticion.
- Extraccion estructurada sobre documentos escaneados: combinacion de vision (para leer el documento) y tool calling (para volcar los campos a un esquema JSON validado por funcion).
- Atencion al cliente automatizada multi-turno: la ventana de 180.000 tokens permite mantener historiales de conversacion muy largos o inyectar bases de conocimiento completas sin fragmentar; el modo de razonamiento separado facilita auditar la traza de decision.
- Investigacion sobre comportamiento de modelos sin censura: al derivar de un ajuste "aggressive" y reportar 0 marcadores de rechazo en 520 prompts, sirve como objeto de estudio para medir sesgos, tasas de rechazo y adherencia a politicas en modelos abiertos.
- Generacion de contenido creativo y narrativa larga: contexto extenso para mantener coherencia de personajes y tramas a lo largo de decenas de miles de tokens.
- Procesamiento batch de imagenes con descripcion o etiquetado: con `--max-num-seqs 3` y `--max-num-batched-tokens 32768` el despliegue de referencia esta orientado a cargas de baja concurrencia y contexto muy alto, adecuado para procesos por lotes mas que para alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que este checkpoint no fue evaluado en la comparacion de precision del 2026-10-06 y que el informe adjunto describe otros checkpoints, no este artefacto.

Las unicas medidas disponibles son pruebas funcionales de validacion, no puntuaciones de calidad:

| Prueba de validacion | Resultado |
|---|---|
| Carga en vLLM 0.27.1 | Correcta en dos GPU, con kernels Marlin compatibles con INC/AutoRound |
| Completacion de texto (API OpenAI) | Superada |
| Texto, tool use nativo y entrada de imagen (API Anthropic) | Superados |
| Peticion de contexto largo | 179.900 tokens de entrada (179.904 totales) procesados correctamente |
| Verificacion de torre de vision | 333 tensores retenidos coinciden exactamente con la fuente BF16 oficial |
| Marcadores de rechazo | 0 en 520 prompts (prueba finita, no garantia general) |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- Pesos del checkpoint: aproximadamente 21 GiB (22,2 GB de repositorio, incluyendo la torre de vision en BF16 y ficheros auxiliares).
- Configuracion probada por el autor: dos GPU con `--tensor-parallel-size 2`, `--dtype bfloat16`, `--gpu-memory-utilization 0.94`, `--max-model-len 180000`, `--max-num-seqs 3` y `--max-num-batched-tokens 32768`.
- Para sostener la ventana de 180.000 tokens, el despliegue de referencia anadio cache KV cuantizada en 4 bits (`--kv-cache-dtype turboquant_4bit_nc`) y offload de 16 GiB de cache KV a CPU (`--kv-offloading-backend native`, `--kv-offloading-size 16`). El autor aclara que son decisiones de runtime, no requisitos del checkpoint.
- GPU recomendadas: no disponibles de forma explicita. Por el reparto probado (TP=2) y el tamano de pesos, el escenario natural es 2x24 GB (RTX 4090, L40S) o 2x40/80 GB (A100, H100) para contexto largo; una unica GPU de 48-80 GB (A6000, L40S 48 GB, A100 80 GB) podria alojar los pesos, pero la ventana completa requeriria ajustes.
- GPU de consumo: en una RTX 4090 de 24 GB los pesos dejan poco margen para cache KV, por lo que habria que reducir `--max-model-len` y la concurrencia de forma drastica. En GPU de 16 GB o menos no cabe sin cuantizacion adicional u offload masivo.
- Opciones de despliegue: vLLM es el unico runtime probado y el unico que soporta el empaquetado `auto_round:auto_gptq` de este checkpoint (vLLM 0.27.1 con Transformers 5.15.1). Se requiere soporte de runtime para este formato de packing. No se menciona compatibilidad con llama.cpp, Ollama, TGI ni otros; para esos entornos habria que partir del GGUF original del repositorio base de HauhauCS.
- Latencia y throughput: no disponible. Como referencia de configuracion, el despliegue probado limita la concurrencia a 3 secuencias y 32.768 tokens por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W4A16-Vision | 35B nominal (A3B); 6,83B segun metadatos de safetensors | Ventana servida de 180.000 tokens en la validacion | Si | safetensors W4A16 `auto_round:auto_gptq` | apache-2.0 | 111 descargas, 0 likes |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | No (la vision se toma del checkpoint oficial) | GGUF, incluido `Q8_K_P` | no disponible | Repositorio base de este derivado |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | Si (torre de vision oficial BF16) | safetensors BF16 | no disponible | Checkpoint oficial de origen |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos base en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico. La busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente paginas genericas de Google), de modo que no se han podido incorporar otras alternativas comparables.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre del modelo indica 35B-A3B, pero los metadatos de safetensors declaran 6.832.109.424 parametros. La cifra de safetensors no cuadra con el tamano del repositorio (22,2 GB) ni con un checkpoint W4A16 de ~21 GiB, por lo que debe tratarse con cautela; conviene verificar el conteo real al cargar el modelo.
- Doble procesado de precision: los pesos de lenguaje pasan de Q8_K_P (GGUF) a de-cuantizacion y luego a INT4 W4A16, lo que acumula perdida respecto al checkpoint original.
- Cuantizacion RTN sin calibracion: AutoRound en modo model-free RTN no ajusta los pesos con datos, lo que suele degradar mas la calidad que GPTQ o AWQ con calibracion, especialmente en tareas de razonamiento y matematicas. No hay benchmarks que cuantifiquen esa perdida.
- Modelo no oficial: es una reconstruccion de terceros, no una publicacion del equipo Qwen. No hay garantias de fidelidad funcional mas alla de las pruebas del autor.
- Sesgos y contenido: deriva de un ajuste etiquetado como "uncensored" y "aggressive". Con 0 marcadores de rechazo en 520 prompts, es esperable que genere contenido que otros modelos rechazarian, con riesgo de sesgos, contenido ofensivo o instrucciones peligrosas. No incluye filtros de seguridad declarados. La prueba de rechazos es finita y el propio autor indica que no garantiza nada sobre prompts futuros.
- Alucinacion: no hay evaluacion de veracidad ni de tasa de alucinacion. En tareas de contexto muy largo (hasta 180.000 tokens) el riesgo de perdida de informacion intermedia y de respuestas no fundamentadas es alto.
- Idiomas: no hay lista de idiomas soportados. No se puede asumir buen rendimiento en castellano.
- Dependencia de runtime: el packing `auto_round:auto_gptq` requiere soporte especifico; solo se ha probado en vLLM 0.27.1 con Transformers 5.15.1. Otros runtimes pueden no cargarlo.
- Licencia: apache-2.0 para este derivado, pero los repositorios de origen pueden imponer condiciones adicionales. Conviene revisar las model cards de Qwen y de HauhauCS antes de un uso comercial, especialmente por el ajuste sin censura.
- Poca validacion comunitaria: 111 descargas y 0 likes en la fecha de los datos, sin evaluaciones independientes publicadas.
- La torre de vision permanece en BF16, por lo que no se beneficia de la reduccion a 4 bits y contribuye de forma fija al uso de VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W4A16-Vision
- Modelo base de lenguaje (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo oficial de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros de procedencia citados en la model card: `reconstruction_metadata.json` y `scripts/reconstruct_hauhau_qwen36.py` (incluidos en el repositorio del modelo)
- Resultados de la comparacion de precision citada: `results/precision-comparison.json` (en el repositorio; segun el autor, no evalua este checkpoint)
- Papers, blogs, repositorios o demos adicionales: no disponible; la busqueda web no devolvio resultados tecnicos relevantes
