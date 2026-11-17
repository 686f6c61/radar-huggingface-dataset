# wyattearp/Gemma-4-26B-A4B-text-base

## Resumen

Gemma-4-26B-A4B-text-base es una extraccion text-only del modelo fundacional multimodal Gemma-4-26B-A4B-it de Google DeepMind, publicada por el usuario wyattearp en Hugging Face. Se trata de un checkpoint de la familia Gemma 4 con arquitectura Mixture-of-Experts (MoE): 25.233.141.790 parametros totales segun safetensors y aproximadamente 4B activos por token distribuidos entre 128 expertos de enrutamiento. El modelo conserva un contexto de 262.144 tokens y un vocabulario de 256.000 tokens.

El problema que resuelve es concreto: los checkpoints estandar de Gemma 4 incluyen codificadores de vision y audio, capas de atencion cruzada multimodal y buffers de cache de vision que resultan innecesarios en despliegues dedicados a lenguaje, razonamiento, codigo y tool calling. Esta version elimina aproximadamente 1,15 GB de parametros no linguisticos y simplifica el preprocesado en los motores de inferencia, manteniendo los pesos del transformer de texto (`model.language_model.*`) identicos bit a bit a la release upstream.

Es relevante ahora porque permite desplegar un MoE de 26B con contexto de 256K en infraestructura de inferencia estandar (transformers >= 4.40.0, vLLM >= 0.7.0) en BF16 sin cuantizar, y porque la model card documenta un bugfix del parser de tool calling en vLLM que afecta a la familia Gemma 4 en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), extraccion text-only de Gemma-4-26B-A4B-it |
| Parametros totales | 25.233.141.790 (segun safetensors) |
| Parametros activos | ~4B por token, 128 expertos de enrutamiento |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el checkpoint se publica en BF16 sin cuantizar) |
| Idiomas soportados | Ingles (segun metadatos de la model card) |
| Licencia | Gemma Terms of Use (Google DeepMind) |
| Formato de pesos | safetensors (BF16) |

Datos adicionales: tamano del repositorio 50,5 GB, vocabulario de 256.000 tokens, clase `Gemma4ForCausalLM`, pipeline `text-generation`.

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas MoE: 128 expertos con enrutamiento por token y aproximadamente 4B parametros activos sobre un total de 26B. El checkpoint deriva de `google/gemma-4-26B-A4B-it` mediante un proceso de decoupling que elimina los codificadores de vision y audio y las capas de atencion cruzada multimodal, dejando un backbone de lenguaje puro en BF16. Los pesos del transformer de texto se mantienen identicos bit a bit a la release de Google, por lo que el comportamiento linguistico deberia coincidir con el del modelo upstream en tareas text-only.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) especificas de este checkpoint; al ser una extraccion de pesos, hereda el entrenamiento del modelo base de Google. La innovacion tecnica destacable es precisamente la separacion de modalidades: reduce VRAM y elimina el preprocesado multimodal en motores de serving. La model card documenta tambien el soporte de parsers de tool calling y reasoning (`--tool-call-parser gemma4`, `--reasoning-parser gemma4`) en vLLM, con un bugfix oficial en el PR vllm-project/vllm#54257 para llamadas `call:` sin espacios y transiciones de canal sin whitespace.

## Capacidades

- Generacion de texto y razonamiento en ingles con contexto de hasta 262.144 tokens.
- Razonamiento multi-paso con modo de pensamiento (reasoning parser `gemma4` en vLLM).
- Tool calling / function calling nativo, con parser dedicado y auto tool choice en vLLM.
- Soporte de agentes y flujos multi-turno gracias a la ventana de contexto extendida.
- Generacion de codigo y matematicas (heredadas del modelo base, sin benchmarks publicados en esta ficha).
- Despliegue compatible con endpoints (tag `endpoints_compatible`) y con `transformers` y `vLLM`.
- Capacidades multimodales: no disponibles en este checkpoint (vision y audio eliminados deliberadamente).

## Casos de uso

- Atencion al cliente automatizada: conversaciones multi-turno con historial largo gracias a los 262.144 tokens de contexto, con tool calling para consultar sistemas de ticketing o CRM mediante el parser `gemma4` de vLLM.
- Generacion de codigo en produccion: integracion en pipelines de CI/CD como servicio OpenAI-compatible servido con vLLM, usando function calling para invocar linters, tests o herramientas de build.
- Agentes de investigacion documental: ingestión de documentos extensos (contratos, informes, bases de codigo) en una sola ventana de contexto sin necesidad de chunking agresivo ni RAG obligatorio.
- Razonamiento sobre repositorios: analisis de codebases completos dentro del contexto de 256K para tareas de refactorizacion, revision o generacion de documentacion tecnica.
- Backend de asistentes con herramientas: despliegue como API interna con `--enable-auto-tool-choice` para que el modelo decida cuando invocar busquedas, calculadoras o APIs externas.
- Serving de bajo coste relativo: al activar solo ~4B parametros por token, el coste computacional por inferencia es inferior al de un modelo denso de 26B, adecuado para cargas concurrentes en GPUs de 80 GB.
- Extraccion de informacion estructurada: procesamiento de grandes volumenes de texto en ingles con salidas JSON validadas mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 50,5 GB solo para pesos, mas cache KV; requiere GPUs de 80 GB (A100 80GB, H100 80GB) para contexto largo.
- En cuantizacion de 8 bits, los pesos rondarian los 25 GB; en 4 bits, unos 13 GB, aunque el autor no publica variantes cuantizadas y habria que generarlas.
- GPUs consumer: no cabe en BF16 en RTX 4090 (24 GB). Con cuantizacion 4 bits podria intentarse, pero el contexto de 256K exige cache KV considerable y no hay datos publicados de funcionamiento en consumer.
- Opciones de despliegue: vLLM >= 0.7.0 (recomendado por el autor, con `--tool-call-parser gemma4`, `--reasoning-parser gemma4`, `--enable-auto-tool-choice`, `--max-model-len 262144`) y transformers >= 4.40.0. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-text-base (este) | 25,2B | ~4B | 262.144 | Gemma Terms of Use | Hugging Face, safetensors BF16 |
| google/gemma-4-26B-A4B-it (base) | 26B | ~4B | 262.144 | Gemma Terms of Use | Hugging Face, multimodal |
| Alternativas de mismo tamano y tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base `google/gemma-4-26B-A4B-it`: mismos pesos de texto, pero el checkpoint original incluye vision y audio y unos 1,15 GB adicionales de parametros no linguisticos. No se dispone de datos de benchmarks para comparar rendimiento con otras alternativas.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta documentado.
- No dispone de capacidades de vision ni audio: cualquier tarea multimodal fallara.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas especificas para este checkpoint.
- Sesgos: no documentados en la model card; al heredar el entrenamiento de Gemma 4, arrastra los sesgos del modelo base.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a las condiciones de Google DeepMind, que incluyen restricciones de uso aceptable y obligaciones de atribucion.
- El checkpoint lo publica un tercero (wyattearp), no Google; no hay garantias de mantenimiento ni de integridad futura mas alla de la verificacion bit a bit declarada.
- Requiere vLLM >= 0.7.0 con el bugfix del parser de tool calling; versiones anteriores pueden fallar en llamadas `call:` sin espacios o transiciones de canal sin whitespace.
- Despliegue en BF16 exige GPUs de 80 GB para contexto completo; no hay variantes cuantizadas oficiales.
- El contexto de 262.144 tokens incrementa notablemente el consumo de cache KV; conviene limitar `--max-model-len` al caso de uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyattearp/Gemma-4-26B-A4B-text-base
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Bug report vLLM: https://github.com/vllm-project/vllm/issues/54256
- Pull request con el bugfix del parser: https://github.com/vllm-project/vllm/pull/54257
