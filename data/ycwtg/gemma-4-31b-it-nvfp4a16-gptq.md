# YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ

## Resumen

YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ es una version cuantizada del modelo multimodal [google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it) de Google DeepMind, generada con la herramienta llm-compressor del ecosistema vLLM. El modelo original es un LLM denso de 31.000 millones de parametros (aunque los pesos cuantizados ocupan 18.460.143.562 parametros totales en safetensors) que acepta entradas de texto e imagen, procesa video como secuencia de fotogramas y genera texto. Esta cuantizacion NVFP4A16 reduce el tamano del modelo de 62,6 GB a aproximadamente 20,5 GB, una reduccion del 67 %, manteniendo capas criticas (lm_head, vision_tower y embed_vision) en precision 16-bit para preservar la calidad de salida y la extraccion de caracteristicas visuales.

El modelo opera en modo instruct por defecto y soporta un modo de pensamiento (thinking mode) activable mediante el argumento `--reasoning-parser gemma4` en el servidor vLLM. Su relevancia actual radica en que ofrece capacidades de razonamiento frontier-level y multimodalidad en un tamano que cabe en GPU de consumo, con licencia Apache-2.0 y compatibilidad con el ecosistema vLLM. El modelo base de Google dispone de una ventana de contexto de 256K tokens, aunque la cuantizacion no modifica este parametro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto), Mixture of Experts (MoE) |
| Parametros totales | 18.460.143.562 (en safetensors cuantizados; el modelo base declara 31B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | NVFP4A16 (4-bit pesos, 16-bit activaciones) con GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base, google/gemma-4-31B-it, es un modelo multimodal de arquitectura Gemini que combina un codificador de vision con un decodificador de texto, disenado para tareas de razonamiento, codigo y comprension multimodal. La version cuantizada mantiene la arquitectura original pero aplica cuantizacion NVFP4A16 (4 bits en los pesos, 16 bits en las activaciones) mediante llm-crafter. La estrategia de cuantizacion conserva en precision original de 16 bits tres grupos de capas: `lm_head` para preservar la calidad de la proyeccion final de tokens, `vision_tower.*` para no degradar la extraccion de caracteristicas visuales, y `embed_vision.*` para mantener la fidelidad del embedding visual antes del procesamiento.

El entrenamiento del modelo base fue realizado por Google DeepMind con un enfoque de instruccion y multimodalidad, aunque la cuantizacion posterior no implica reentrenamiento. Los detalles sobre el dataset de entrenamiento (composicion, numero de tokens) y si se utilizaron tecnicas de RLHF o DPO no estan disponibles en la informacion proporcionada. La cuantizacion se ha evaluado en el benchmark HLE (Humanity's Last Exam) obteniendo 18.1 frente a 19.5 del modelo original sin cuantizar, una degradacion de aproximadamente 1.4 puntos.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto e imagen y genera respuestas textuales.
- Procesamiento de video: puede procesar secuencias de fotogramas de video como entrada.
- Razonamiento multidisciplinar: obtiene 18.1 en HLE (Humanity's Last Exam), un benchmark de razonamiento complejo.
- Modo de pensamiento (thinking mode): activable mediante `--reasoning-parser gemma4` y la configuracion `enable_thinking` en la plantilla de chat.
- Modo instructivo: funciona en modo instruct por defecto, optimizado para seguir instrucciones.
- Compatibilidad con vLLM: integrado con el servidor de inferencia de alto rendimiento vLLM.
- Capacidades agenciales: segun el modelo base, esta disenado para flujos agenciales (agentic workflows) y codigo.
- Multilingue: la model card del modelo base no especifica idiomas soportados en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada multimodal: el modelo puede procesar capturas de pantalla o imagenes de productos junto con consultas de texto, gestionando conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de documentacion o autocompletado en IDEs, con un tamano que cabe en GPU de consumo.
- Analisis de documentos visuales: extraccion de informacion de imagenes, diagramas o graficos combinada con razonamiento textual, util para informes de negocio o documentacion tecnica.
- Agentes de razonamiento multi-paso: el modo de pensamiento permite descomponer problemas complejos en pasos intermedios, adecuado para sistemas de planificacion automatizada.
- Clasificacion y analisis de video: el modelo puede procesar secuencias de fotogramas para tareas de resumen de video o deteccion de eventos en tiempo real.
- Despliegue en entornos con restriccion de VRAM: gracias a la cuantizacion a 20,5 GB, puede ejecutarse en GPU de consumo como RTX 3090 o RTX 4090, facilitando la experimentacion local sin infraestructura de centro de datos.

## Benchmarks y rendimiento

| Benchmark | gemma-4-31B-it-NVFP4A16-GPTQ | gemma-4-31B-it (sin cuantizar) | Qwen3.8-27B-NVFP4A16-GPTQ |
|---|---|---|---|
| HLE (Humanity's Last Exam) | 18.1 | 19.5 | 17.0 |
| Tamano del modelo | 20.5 GB | 62.6 GB | 27.7 GB |

El modelo cuantizado obtiene una puntuacion de 18.1 en HLE, frente a 19.5 del modelo base sin cuantizar, lo que representa una degradacion de 1.4 puntos (7 %). En comparacion con Qwen3.8-27B-NVFP4A16-GPTQ, el modelo de YCWTG supera en 1.1 puntos a esta alternativa cuantizada de tamano similar. No se han publicado otros benchmarks (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 43.8 GB en disco, pero el modelo cuantizado ocupa aproximadamente 20.5 GB en memoria, por lo que se recomienda al menos 24 GB de VRAM para carga completa con margen.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En GPU de 24 GB se puede cargar el modelo con cuantizacion completa y algo de margen para contexto.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3090 y RTX 4090 con 24 GB de VRAM, siempre que se limite la longitud de contexto.
- Opciones de despliegue: vLLM (recomendado, con soporte para el modo de pensamiento), FriendliAI (servicio gestionado), transformers con libreria estandar.
- Latencia y rendimiento: no disponible en la informacion proporcionada; depende del hardware y la configuracion de vLLM (tamano de lote, numero de GPUs, etc.).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano (cuantizado) | HLE | Licencia |
|---|---|---|---|---|---|
| YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ | 18.4B (cuantizado) | 256K | 20.5 GB | 18.1 | Apache-2.0 |
| google/gemma-4-31B-it | 31B | 256K | 62.6 GB | 19.5 | Apache-2.0 |
| Qwen3.8-27B-NVFP4A16-GPTQ | 27B | no disponible | 27.7 GB | 17.0 | no disponible |

La comparativa se basa en los datos publicados en la model card del propio modelo. La ventaja principal del modelo cuantizado es la reduccion de tamano del 67 % con una perdida de rendimiento de solo 1.4 puntos en HLE, y es superior a la alternativa Qwen3.8-27B cuantizada en el mismo benchmark. La alternativa sin cuantizar ofrece mejor rendimiento pero requiere mas del doble de espacio en disco y VRAM.

## Limitaciones y advertencias

- Degradacion de rendimiento: la cuantizacion NVFP4A16 reduce el rendimiento en HLE en 1.4 puntos (de 19.5 a 18.1), lo que puede afectar a tareas de razonamiento complejo o de alta precision.
- Alucinacion y sesgos: no hay informacion especifica sobre sesgos o tasas de alucinacion para esta cuantizacion; el modelo base de Google puede presentar sesgos tipicos de LLM entrenados con datos web.
- Limitaciones de contexto: aunque el modelo base soporta 256K tokens, la cuantizacion no garantiza que el contexto completo se procese con la misma calidad; se recomienda validar en casos de contexto muy largo.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo base de Google puede tener condiciones adicionales de uso comercial; consulta la documentacion oficial de Gemma 4.
- Uso en produccion: el modo de pensamiento requiere configuracion adicional en vLLM (`--reasoning-parser gemma4` y `enable_thinking`), y no esta garantizado que funcione en todos los entornos de despliegue.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento multilingue puede variar y no esta validado en la informacion proporcionada.

## Enlaces

- [HuggingFace - YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ](https://huggingface.co/YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ)
- [HuggingFace - Repositorio de archivos](https://huggingface.co/YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ/tree/main)
- [FriendliAI - Pagina del modelo](https://friendli.ai/models/YCWTG/gemma-4-31B-it-NVFP4A16-GPTQ)
- [NVIDIA NIM - gemma-4-31b-it](https://build.nvidia.com/google/gemma-4-31b-it)
- [NVIDIA NIM - Model card gemma-4-31b-it](https://build.nvidia.com/google/gemma-4-31b-it/modelcard)
- [llm-crafter (repositorio de cuantizacion)](https://github.com/vllm-project/llm-compressor)
