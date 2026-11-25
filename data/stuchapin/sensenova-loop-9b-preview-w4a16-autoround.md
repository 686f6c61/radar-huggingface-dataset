# stuchapin/SenseNova-Loop-9B-Preview-W4A16-AutoRound

## Resumen

SenseNova-Loop-9B-Preview-W4A16-AutoRound es una cuantizacion de 4 bits del modelo multimodal SenseNova-Loop-9B-Preview desarrollado por SenseNova (sensenova), publicada por el usuario stuchapin en Hugging Face. Se trata de un modelo de tipo image-text-to-text construido sobre una arquitectura de transformer con "loops" (looped-transformer) y un componente denominado mhc, con un tower de vision integrado y un modulo MTP (multi-token prediction). El objetivo de esta version es reducir el peso del modelo base para hacerlo desplegable en GPUs de consumo sin perder demasiada calidad.

La cuantizacion emplea AutoRound 0.16.1 con empaquetado auto_gptq, en precision W4A16 (pesos simetricos de 4 bits, activaciones de 16 bits), grupo de 128 y 100 iteraciones de tuning sobre 256 muestras de calibracion con seqlen de 2048. Se cuantizan 248 de las 359 capas (los 32 bloques del decoder), dejando en BF16 el lm_head, los embeddings, el tower de vision y el modulo MTP. El artefacto ocupa aproximadamente 8,5 GB en disco, lo que lo hace viable en GPUs de 24 GB.

Es relevante porque demuestra la viabilidad de cuantizar arquitecturas no estandar con `trust_remote_code` y porque el autor publica un conjunto de comprobaciones (canary suite, perplejidad en WikiText-2) que permiten evaluar la degradacion introducida. No obstante, la model card reconoce que la comparacion con el baseline BF16 esta pendiente y que el rendimiento local en `transformers` es muy bajo (0,71 tok/s), por lo que su uso en produccion requiere motores como SGLang o LightLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con loops (looped-transformer) y componente mhc; multimodal con tower de vision y modulo MTP |
| Parametros totales | 3.420.075.632 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos simetricos 4 bits, activaciones 16 bits), group size 128, AutoRound 0.16.1 con empaquetado auto_gptq |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model-00001-of-00002.safetensors, model-00002-of-00002.safetensors, model_extra_tensors.safetensors) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B-Preview emplea una arquitectura de transformer con "loops", es decir, reutilizacion iterativa de bloques del decoder, complementada con un componente denominado mhc y un tower de vision para entrada de imagenes. Incluye ademas un modulo MTP (multi-token prediction), habitual en arquitecturas orientadas a decodificacion especulativa o prediccion multiple. La implementacion requiere `trust_remote_code=True` y un fichero `modeling_sensenova_loop.py`, lo que indica que no esta integrada en el catalogo estandar de `transformers`. El autor de la cuantizacion menciona tambien el uso de un fallback de referencia en PyTorch para `causal_conv1d`, lo que sugiere presencia de convoluciones causales en la arquitectura.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla la innovacion concreta del mecanismo de loops ni del componente mhc. La cuantizacion se aplico sobre 248 de las 359 capas (los 32 bloques del decoder), manteniendo en BF16 el lm_head, los embeddings, el tower de vision completo y el modulo MTP, con 256 muestras de calibracion y seqlen de 2048.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias al tower de vision integrado.
- Razonamiento y generacion de codigo: la canary suite incluye prompts de codigo, matematicas, arquitectura, seguimiento estricto de instrucciones y extraccion factual, con 5/5 superados.
- Prediccion multiple de tokens mediante el modulo MTP, potencialmente util para decodificacion especulativa.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional multimodal en ingles o chino: el modelo acepta pares imagen-texto, por lo que puede emplearse en interfaces de chat donde el usuario adjunta capturas, diagramas o fotografias y espera respuestas en lenguaje natural. Su cuantizacion W4A16 permite desplegarlo en una unica GPU de 24 GB.
- Extraccion de informacion de documentos visuales: la canary suite incluye pruebas de extraccion factual, lo que sugiere capacidad para leer y estructurar datos a partir de imagenes o capturas, util en pipelines de digitalizacion de facturas o formularios.
- Generacion de codigo asistida en entornos con recursos limitados: el modelo supera prompts de codigo en la canary suite y su tamano cuantizado (8,5 GB) permite integrarlo en estaciones de trabajo con una RTX 4090 o similar.
- Prototipado de investigacion sobre arquitecturas con loops: al estar publicado el modelo base y su version cuantizada, sirve para estudiar el comportamiento de transformers con reutilizacion de bloques y comparar la degradacion por cuantizacion frente al BF16.
- Evaluacion de tecnicas de cuantizacion AutoRound en arquitecturas no estandar: el repo documenta el proceso (248/359 capas, calibracion, perplejidad), lo que lo convierte en un caso de referencia para quienes cuantizan modelos con `trust_remote_code`.
- Despliegue en motores de serving de alto rendimiento: la model card apunta a SGLang, LightLLM y `transformers` como motores objetivo, por lo que encaja en entornos que necesiten throughput alto con un modelo multimodal pequeno.
- Traduccion y generacion bilingue ingles-chino: los metadatos declaran ambos idiomas, lo que permite tareas de traduccion o redaccion en esos dos idiomas, aunque sin garantias de calidad fuera de ellos.

## Benchmarks y rendimiento

| Prueba | Resultado | Notas |
|---|---|---|
| Canary suite (5 prompts) | 5/5 superados | Codigo, matematicas, arquitectura, seguimiento estricto de instrucciones, extraccion factual; `load_time_sec`: 8,02 s; `vram_budget_passed: true` |
| WikiText-2 PPL (W4A16) | 22,068 | 100.000 tokens, seqlen 2048, stride 512, bfloat16; 316,12 s; carga en 3,13 s |
| BF16 PPL baseline / ratio | pendiente | OOM en una unica GPU de 24 GB con BF16 completo a seqlen 2048 |
| Fleet / downstream bench | pendiente | no disponible |
| Serving engine check | pendiente | arquitectura base requiere `trust_remote_code=True`; objetivos SGLang / LightLLM / `transformers` |

Nota de velocidad local: la generacion en la canary suite promedia 0,71 tok/s con `transformers` sin optimizar (`auto_round:tritonv2_zp`) y el fallback de referencia `causal_conv1d` en PyTorch. El autor advierte que esta cifra no representa el throughput en SGLang o LightLLM.

## Requisitos de hardware

- VRAM estimada: el artefacto cuantizado ocupa aproximadamente 8,5 GB en disco; la canary suite confirma `vram_budget_passed: true` en una GPU de 24 GB, por lo que la inferencia cabe holgadamente en 24 GB.
- El baseline BF16 completo provoco OOM en una unica GPU de 24 GB a seqlen 2048, de modo que la version sin cuantizar requiere mas memoria.
- GPU recomendadas: RTX 4090 (24 GB) o superiores para la version cuantizada; A100 y H100 para escenarios de mayor concurrencia o para el modelo base en BF16.
- Cabe en GPU de consumo: si, al menos en RTX 4090 y tarjetas con 24 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (referencia funcional pero lenta), SGLang y LightLLM como motores objetivo segun la model card. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,71 tok/s en `transformers` sin optimizar; no hay datos publicados de throughput en SGLang o LightLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-W4A16-AutoRound | 3.420.075.632 (segun safetensors del repo cuantizado) | no disponible | Apache 2.0 | safetensors (W4A16) | Multimodal, loops, requiere `trust_remote_code` |
| SenseNova-Loop-9B-Preview (base) | no disponible | no disponible | Apache 2.0 | safetensors (BF16) | Modelo original sin cuantizar; OOM en 24 GB a seqlen 2048 |
| Alternativas de 9B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (por ejemplo, otros modelos multimodales de ~9B). Cualquier comparacion con cifras de rendimiento requeriria datos que no estan en la informacion proporcionada.

## Limitaciones y advertencias

- La comparacion de perplejidad frente al baseline BF16 esta pendiente; no se conoce la degradacion exacta introducida por la cuantizacion W4A16.
- El rendimiento en `transformers` sin optimizar es muy bajo (0,71 tok/s), lo que hace inviable su uso en produccion sin motores como SGLang o LightLLM.
- La arquitectura requiere `trust_remote_code=True` y codigo personalizado (`modeling_sensenova_loop.py`), lo que implica revisar el codigo antes de ejecutarlo y limita la portabilidad a otros frameworks.
- Idiomas soportados unicamente ingles y chino; no hay garantias de calidad en castellano ni en otros idiomas.
- No se han publicado datos sobre sesgos conocidos, riesgo de alucinacion ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada en la informacion disponible.
- El soporte de tool calling, agentes y modo thinking no esta documentado.
- El repo tiene muy poca traccion (27 descargas, 0 likes) y fue creado en noviembre de 2026; no hay evidencia de mantenimiento continuado.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base con `trust_remote_code` conviene revisar los terminos del modelo original.
- El numero de parametros reportado por safetensors (3.420.075.632) no coincide con la denominacion "9B" del modelo, probablemente por el empaquetado de 4 bits y los tensores adicionales; conviene verificar el recuento real del modelo base antes de dimensionar infraestructura.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/stuchapin/SenseNova-Loop-9B-Preview-W4A16-AutoRound
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio AutoRound: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
