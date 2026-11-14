# Xylolabs/Nanbeige4.3-33B-Tenstorrent-Tensix-BFP4

## Resumen

Nanbeige4.3-33B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo Nanbeige4.3-33B, publicada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base, desarrollado por el equipo Nanbeige, es un transformer denso de 33.118.977.024 parámetros con licencia Apache 2.0 y soporte para inglés y chino. Esta variante concreta aplica cuantización GPTQ con formato de bloque `ttnn.bfloat4_b` (BFP4) a las capas lineales de atención y MLP, manteniendo en bf16 el LM head, los embeddings y las normalizaciones.

El interés de esta ficha reside en que no se trata de un modelo nuevo, sino de un artefacto de despliegue optimizado para hardware no convencional. El checkpoint ocupa 22,07 GB empaquetado (5,33 bits por peso de media) frente a los 66,24 GB del BF16 original, lo que reduce a un tercio el espacio en memoria del dispositivo. Los pesos se almacenan como valores bf16 sobre la rejilla BFP4, de modo que la conversión a tensores Tensix es exacta y verificable bit a bit.

La relevancia actual es doble: por un lado, permite evaluar modelos de 33B en NPUs de Tenstorrent sin renunciar a una calidad cercana al BF16; por otro, documenta con rigor el proceso de cuantización (calibración con 65.536 tokens de WikiText-2 y Wikipedia en coreano, métricas de divergencia KL y top-1). No se han publicado datos de velocidad ni benchmarks de tareas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4.5 bits/peso) en q, k, v, o, gate, up, down de 52 capas; bf16 en LM head, embeddings, norms y resto de tensores; 5.33 bits/peso de media |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parámetros organizado en 52 capas, con atención multi-cabeza estándar y bloques MLP convencionales. La información disponible no detalla la composición del dataset de preentrenamiento del modelo original, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste instructivo; la model card solo indica el pipeline de text-generation y los idiomas inglés y chino.

La innovación técnica de esta exportación está en la cuantización. Xylolabs aplica GPTQ sobre las proyecciones lineales de atención (q, k, v, o) y MLP (gate, up, down) de las 52 capas, con una búsqueda de exponente por bloque que ajusta la rejilla de punto flotante por bloques al rango real de cada matriz. La calibración usa 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado se empaqueta en el formato `bfloat4_b` de TT-NN, donde cada valor cuantizado se guarda como bf16 sobre la rejilla BFP4; los 364 tensores cuantizados empaquetan bit a bit sin pérdida adicional. El repositorio incluye `pack_tensix.py` y `verify_grid.py` para verificar la conversión matriz a matriz, tanto con torch como mediante round-trip por DRAM del dispositivo.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat (`apply_chat_template`).
- Razonamiento de sentido común y respuesta a preguntas cortas; la evaluación del autor incluye 33 prompts con comprobación automática, entre ellos un ítem de razonamiento sobre días de la semana.
- Capacidad de "thinking mode": la model card menciona una "thinking-on recheck" para uno de los ítems de evaluación, lo que sugiere soporte de modo de razonamiento extendido en el modelo base.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Inferencia nativa vía transformers (verificada con Transformers 5.22.2 en CPU) y ejecución en Tensix vía TT-NN (verificada con ttnn 0.81.1 sobre el simulador Blackhole `ttsim`).

## Casos de uso

- Despliegue en NPUs Tenstorrent: el checkpoint está diseñado para ejecutarse en Wormhole y Blackhole con TT-NN; su empaquetado de 22,07 GB permite cargar el modelo completo en la memoria del dispositivo sin recurrir a paralelismo entre chips en configuraciones con DRAM suficiente.
- Evaluación de cuantización BFP4 en producción: investigadores pueden comparar la divergencia KL (0,0702 frente a BF16) y el top-1 (88,9 %) con otras estrategias como Q4_K_M de llama.cpp, usando el mismo checkpoint y los scripts de verificación incluidos.
- Servicio de chat bilingüe inglés-chino: el modelo conserva la plantilla conversacional del base y puede atender conversaciones multi-turno; la ventana de contexto no está documentada, por lo que conviene validarla antes de asumir contextos largos.
- Prototipado en hardware no NVIDIA: equipos con aceleradores Tenstorrent pueden validar pipelines de inferencia sin depender de CUDA, usando `ttnn.as_tensor` con `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG` como en el ejemplo de la model card.
- Investigación sobre formatos de bloque: la combinación de GPTQ con búsqueda de exponente por bloque y almacenamiento bf16 sobre rejilla BFP4 es un caso de estudio reproducible para quienes diseñan esquemas de cuantización para hardware específico.
- Fine-tuning o adaptación posterior: al conservar bf16 el LM head, embeddings y norms, y estar en formato safetensors compatible con transformers, el checkpoint puede servir de base para experimentos de adaptación, aunque la cuantización de las capas lineales limita la precisión efectiva.
- Verificación de integridad de pesos: los scripts `pack_tensix.py` (con `--device`) y `verify_grid.py` permiten auditar que cada matriz empaquetada coincide exactamente con la representación esperada, útil en pipelines de CI para artefactos cuantizados.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Nanbeige4.3-33B) | 16 | 66,24 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP4) | 5,33 | 22,070 | 0,0702 | 88,9 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 20,051 | 0,0608 | 89,21 | 28 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.220 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las "respuestas correctas" corresponden a 33 prompts cortos con comprobación automática. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El autor declara un criterio de aceptación de KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el resultado obtenido es 1,15 veces la KL de Q4_K_M y 0 respuestas perdidas. No se reportan datos de velocidad ni benchmarks de tareas estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 22,07 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, familias Wormhole y Blackhole. La verificación se realizó con ttnn 0.81.1 sobre el simulador Blackhole (`ttsim`), no sobre silicio real según la información disponible.
- GPU consumer: no se documenta soporte CUDA ni ejecución en GPUs convencionales; el quickstart nativo se verificó en CPU con Transformers 5.22.2.
- Opciones de despliegue: transformers (carga nativa en bf16 con `device_map="auto"`), TT-NN/TT-Metal para Tensix. tt-transformers y tt-forge no se probaron con este checkpoint según la model card. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se reportan datos de velocidad.
- Almacenamiento: el repositorio ocupa 66,3 GB, aunque el peso empaquetado para dispositivo es de 22,07 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Tenstorrent-Tensix-BFP4 | 33,1B | no disponible | Apache 2.0 | safetensors BFP4 | Objetivo Tensix; 22,07 GB empaquetado; KL 0,0702 vs BF16 |
| Nanbeige4.3-33B (BF16) | 33,1B | no disponible | Apache 2.0 | safetensors bf16 | Referencia de calidad; 66,24 GB; top-1 100 % |
| Nanbeige4.3-33B Q4_K_M (llama.cpp) | 33,1B | no disponible | Apache 2.0 | GGUF | 20,051 GB; KL 0,0608; top-1 89,21 %; orientado a CPU/GPU |

No se dispone de información sobre otros modelos comparables de la misma categoría (33B densos) en la documentación proporcionada; la comparativa se limita a las tres variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- La cuantización BFP4 introduce degradación medible: KL media de 0,0702 frente a BF16 y top-1 del 88,9 % frente al 100 %, aunque en el conjunto de 33 prompts el modelo cuantizado acierta 30 frente a 28 del BF16.
- El hardware objetivo es específico de Tenstorrent; no hay evidencia documentada de ejecución en GPUs NVIDIA o AMD para este checkpoint, lo que limita su portabilidad.
- La verificación en Tensix se realizó sobre el simulador `ttsim`, no sobre silicio Wormhole o Blackhole real; el rendimiento en producción no está validado en la información disponible.
- tt-transformers y tt-forge no se probaron con este checkpoint, por lo que las rutas de integración de alto nivel no están garantizadas.
- Idiomas limitados a inglés y chino; no se documenta cobertura multilingüe adicional.
- La longitud de contexto no está especificada; no debe asumirse una ventana concreta sin consultar la model card del modelo base.
- No se documentan sesgos específicos, tasas de alucinación ni evaluaciones de seguridad; al ser una cuantización, hereda los sesgos del modelo base, que no se detallan.
- Licencia Apache 2.0 según la model card del modelo base; el repositorio del base no incluye fichero LICENSE, por lo que el autor añade el texto estándar y un NOTICE con los cambios. Uso comercial permitido bajo los términos de Apache 2.0.
- El autor declara no estar afiliado ni respaldado por Tenstorrent, y distribuye el artefacto "as is", sin garantía.
- El modelo tiene 47 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Nanbeige4.3-33B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Nanbeige4.3-33B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
