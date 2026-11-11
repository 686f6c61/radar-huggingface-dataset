# takumar24/Laguna-XS.2-NVFP4

## Resumen

Laguna XS.2-NVFP4 es una variante cuantizada en NVFP4 (con cache KV en FP8) del modelo Laguna XS.2, desarrollado por Poolside. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 33.442.617.168 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, disenado especificamente para programacion agentica y tareas de largo horizonte ejecutadas en maquina local. Esta version concreta ha sido empaquetada por el usuario takumar24 para su uso con vLLM mediante el formato compressed-tensors.

El modelo emplea una disposicion mixta de atencion: 30 de sus 40 capas usan Sliding Window Attention (SWA) con ventana de 512 tokens y gating por cabeza, mientras que las 10 restantes usan atencion global, en una proporcion 3:1. Esta combinacion reduce los requisitos de cache KV y acelera la inferencia, algo critico cuando se busca ejecutar un modelo de 33B en hardware de consumo. La ventana de contexto alcanza los 131.072 tokens.

Su relevancia actual radica en que ofrece un rendimiento competitivo en tareas de ingenieria de software (68,2 % en SWE-bench Verified) con un coste de inferencia propio de un modelo de 3B activos, y con licencia Apache 2.0 que permite uso comercial sin restricciones. La cuantizacion NVFP4 reduce el peso del repositorio a 21,5 GB, lo que facilita su despliegue en GPUs con menos VRAM que las requeridas por la version BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion mixta SWA/global (3:1) y gating sigmoide por cabeza |
| Parametros totales | 33.442.617.168 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (pesos) con cache KV en FP8; variantes BF16, FP8 e INT4 disponibles por separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) para vLLM |

## Arquitectura y entrenamiento

Laguna XS.2 es un transformer MoE con 40 capas, 256 expertos y 1 experto compartido. La innovacion arquitectonica principal es la combinacion de capas con atencion global (10 capas) y capas con Sliding Window Attention de 512 tokens (30 capas), gestionadas mediante gating sigmoide con escalas rotatorias por capa. Esta disposicion 3:1 reduce el coste de la cache KV y acelera la decodificacion manteniendo acceso a contexto global en las capas criticas. El modelo usa el optimizador Muon durante el entrenamiento.

El entrenamiento incluye fases de pre-entrenamiento, post-entrenamiento y aprendizaje por refuerzo (RL). La model card no especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. El modelo incorpora soporte nativo de razonamiento intercalado (interleaved thinking) con preservacion del pensamiento entre llamadas a herramientas, y permite activar o desactivar el modo de razonamiento por peticion.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos con modo de pensamiento intercalado entre llamadas a herramientas.
- Programacion agentica: resolucion de issues, parcheo de repositorios y tareas de ingenieria de software de largo horizonte.
- Uso de terminal y ejecucion de comandos en entornos sandbox (evaluado en Terminal-Bench 2.0).
- Soporte nativo de tool calling / function calling con preservacion del razonamiento entre invocaciones.
- Capacidades multilingues en tareas de codigo (evaluado en SWE-bench Multilingual), aunque la lista de idiomas naturales soportados no esta disponible.
- Control por peticion del modo de razonamiento (activar/desactivar thinking).
- Modalidad exclusivamente texto-a-texto (sin vision ni audio).

## Casos de uso

- Agente de resolucion de issues en repositorios: el modelo puede recibir un issue, explorar el codigo, aplicar parches y verificar tests en un bucle agentico, con 68,2 % en SWE-bench Verified y contexto de 131k tokens para manejar repositorios grandes.
- Automatizacion de tareas de terminal: ejecucion de comandos, depuracion de entornos y resolucion de problemas de infraestructura en sandbox, adecuado por su entrenamiento especifico en Terminal-Bench 2.0.
- Asistente de programacion local: al caber en un Mac con 36 GB de RAM (segun el autor), permite despliegue en estaciones de trabajo sin GPU dedicada de datacenter, con la variante NVFP4 para vLLM en GPUs.
- Pipelines de CI/CD con agentes: integracion via tool calling para revisar pull requests, sugerir parches y ejecutar verificaciones automatizadas con razonamiento intercalado.
- Refactorizacion multi-archivo: la ventana de 131k tokens y el modo de razonamiento preservado permiten mantener coherencia en cambios que abarcan varios ficheros y dependencias.
- Generacion de codigo multilingue: util para equipos con repositorios en varios lenguajes de programacion, dado su rendimiento de 62,4 % en SWE-bench Multilingual.
- Despliegue en produccion con vLLM: la variante NVFP4 con cache KV en FP8 reduce el consumo de VRAM y permite servir el modelo con throughput alto en GPUs de gama media-alta.

## Benchmarks y rendimiento

| Modelo | Tamano (params totales) | SWE-bench Verified | SWE-bench Multilingual | SWE-bench Pro (publico) | Terminal-Bench 2.0 |
|---|---|---|---|---|---|
| Laguna XS.2 (BF16) | 33B | 68,2 % | 62,4 % | 44,5 % | 30,1 % |
| Devstral Small 2 | 24B dense | 68,0 % | 55,7 % | - | 22,5 % |
| Gemma 4 31B IT | 31B dense | 52,0 % | 51,7 % | 35,7 % | 42,9 % |
| Qwen3.5-35B-A3B | 35B | 69,2 % | 60,3 % | 44,6 % | 40,5 % |
| Qwen3.6-35B-A3B | 35B | 73,4 % | 67,2 % | 49,5 % | 51,5 % |
| Claude Haiku 4.5 | - | 73,3 % | - | 39,5 % | 29,8 % |
| GPT-5.4 Nano | - | - | - | 52,4 % | 46,3 % |

Los resultados corresponden a la variante BF16; no se han publicado cifras especificas para la variante NVFP4. Metodologia: Harbor Framework del Laude Institute con el harness de Poolside, maximo 500 pasos, sandbox de 8 GB RAM/2 CPUs (48 GB RAM/32 CPUs en Terminal-Bench 2.0), temperatura 0,7 y top_k 20. SWE-bench Verified promedia 4 ejecuciones, Multilingual 7, Pro 3 y Terminal-Bench 5.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio NVFP4 ocupa 21,5 GB, por lo que se necesita al menos ~24 GB de VRAM para pesos, mas cache KV en FP8 (que en SWA es reducida). Para la variante BF16 se requieren ~67 GB.
- GPU recomendadas: L40S, A100 40GB, H100 para produccion con vLLM; RTX 4090 (24 GB) es el minimo ajustado para la variante NVFP4.
- Cabe en consumer GPU: si, en RTX 4090 con NVFP4; segun el autor, la version base cabe en un Mac con 36 GB de RAM.
- Opciones de despliegue: vLLM (libreria declarada, formato compressed-tensors), Ollama (disponible en ollama.com/library/laguna-xs.2), y variantes BF16/FP8/INT4 para otros runners.
- Latencia y throughput: no disponibles en la informacion proporcionada; la arquitectura SWA con 3B activos sugiere decodificacion rapida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laguna XS.2 | 33B | ~3B | 131.072 | 68,2 % | Apache 2.0 | HF (BF16/FP8/INT4/NVFP4), Ollama, API |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 69,2 % | no disponible | HF |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | 73,4 % | no disponible | HF |
| Devstral Small 2 | 24B dense | 24B | no disponible | 68,0 % | no disponible | HF |

Laguna XS.2 destaca por su licencia Apache 2.0 explicita y su disponibilidad en multiples formatos cuantizados, mientras que Qwen3.6-35B-A3B obtiene mejores puntuaciones en SWE-bench y Terminal-Bench. Devstral Small 2 es denso y de menor tamano, con rendimiento similar en SWE-bench Verified pero inferior en Multilingual.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un modelo entrenado principalmente para codigo, puede tener sesgos hacia dominios tecnicos y lenguajes de programacion mayoritarios.
- Riesgo de alucinacion: presente como en cualquier LLM; en tareas de codigo puede generar APIs o funciones inexistentes, por lo que se recomienda verificacion con tests.
- Limitaciones de contexto o idioma: la lista de idiomas naturales no esta disponible; el rendimiento fuera de tareas de codigo no esta evaluado en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion sin restricciones, pero la model card incluye una descripcion de gating y remite a la politica de privacidad de Poolside para el tratamiento de datos.
- Caveats para produccion: esta variante NVFP4 requiere vLLM con soporte compressed-tensors y no tiene benchmarks publicados propios; los resultados de la tabla corresponden a BF16. El repositorio tiene 0 descargas y 0 likes, por lo que su validacion comunitaria es nula. La fecha de creacion (2026-11-11) y los modelos comparados (Gemma 4, Qwen3.6, GPT-5.4) deben tratarse con cautela segun la informacion disponible.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/takumar24/Laguna-XS.2-NVFP4
- Modelo base BF16: https://huggingface.co/poolside/Laguna-XS.2
- Variante FP8: https://huggingface.co/poolside/Laguna-XS.2-FP8
- Variante INT4: https://huggingface.co/poolside/Laguna-XS.2-INT4
- Blog de lanzamiento: https://poolside.ai/blog/laguna-a-deeper-dive
- Demo Shimmer: https://shimmer.poolside.ai
- API key: https://platform.poolside.ai
- Ollama: https://ollama.com/library/laguna-xs.2
- Harness de agentes: https://github.com/poolsideai/pool
- Politica de privacidad: https://poolside.ai/legal/privacy
- Blog de Qwen (comparativa): https://qwen.ai/blog?id=qwen3.6-35b-a3b
