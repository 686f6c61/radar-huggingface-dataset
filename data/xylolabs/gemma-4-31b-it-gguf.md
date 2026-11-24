# Xylolabs/gemma-4-31B-it-GGUF

## Resumen

Gemma 4 31B IT GGUF es una versión cuantizada en formato GGUF del modelo multimodal `google/gemma-4-31B-it`, desarrollada por Google DeepMind y convertida por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un transformer multimodal de aproximadamente 30.700 millones de parámetros que acepta entradas de texto e imagen y genera texto, con variantes preentrenadas e instruidas dentro de la familia Gemma 4.

Esta ficha cubre específicamente la distribución GGUF de Xylolabs, que ofrece ocho niveles de cuantización (desde Q8_0 hasta Q2_K) más dos proyectores de visión (mmproj) en F16 y Q8_0. El paquete incluye una tabla de fidelidad frente al modelo BF16 original medida con divergencia KL y acuerdo top-1, lo que permite elegir el compromiso entre tamaño y precisión con datos concretos.

Su relevancia práctica radica en que permite ejecutar un modelo multimodal de 31B en hardware de consumo y estaciones de trabajo: desde una RTX 4090 con 24 GB (usando Q3_K_M a 32K de contexto) hasta una H100 o Mac Studio con memoria unificada, donde el Q8_0 cabe holgadamente a 256K de contexto. La licencia Apache 2.0 facilita el uso comercial sin las restricciones adicionales de otras familias de modelos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), familia Gemma 4 |
| Parámetros totales | 30.697.345.596 (30,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K según hardware y cuantización (tabla del autor); ejemplo de ejecución con `-c 8192` |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, IQ4_XS-imat, Q3_K_M, IQ3_M, Q2_K; proyectores de visión F16 y Q8_0 |
| Idiomas soportados | en, ko (según metadatos); el modelo base declara soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google DeepMind que procesa texto e imagen como entrada y genera texto como salida. La familia Gemma 4 incluye variantes preentrenadas e instruidas; esta distribución parte de la variante instruida (`-it`). El modelo incorpora un modo de razonamiento ("thinking") que puede desactivarse en tiempo de ejecución mediante `--chat-template-kwargs '{"enable_thinking":false}'`, lo que sugiere un entrenamiento orientado a instrucciones y razonamiento multi-paso.

Los detalles concretos de composición del dataset de entrenamiento, número de tokens, uso de RLHF/DPO y técnicas específicas de atención no están disponibles en la información proporcionada. La model card enlaza el paper arXiv:2607.02770, que presumiblemente contiene la descripción técnica completa del modelo base.

En cuanto a la conversión, Xylolabs realizó la cuantización a GGUF con llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior). La variante IQ4_XS-imat emplea una matriz de importancia (imatrix) para preservar pesos relevantes. El autor publica métricas de fidelidad frente al BF16 original: divergencia KL media y acuerdo top-1 en texto inglés y coreano, lo que permite cuantificar la pérdida de precisión por cuantización.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante los proyectores mmproj incluidos.
- Modo de razonamiento ("thinking") activable o desactivable por configuración.
- Capacidades multilingües, con evaluación explícita en inglés y coreano.
- Ejecución local en CUDA, Metal y CPU mediante llama.cpp.
- Compatibilidad con `llama-server` para despliegue como API compatible con endpoints.
- Soporte de plantilla de chat Jinja (`--jinja`).
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y audio: no disponibles en la información proporcionada (el audio se menciona solo para variantes E2B, E4B y 12B del modelo base).

## Casos de uso

- Asistente conversacional local con contexto largo: desplegado con `llama-server` en una H100 o Mac Studio con 128 GB, el Q8_0 permite ventanas de hasta 256K tokens para mantener historiales extensos sin truncar.
- Análisis de documentos con imágenes: gracias al pipeline image-text-to-text y los proyectores mmproj, puede procesar capturas, diagramas o páginas escaneadas junto a texto en tareas de extracción y resumen.
- Procesamiento por lotes en estaciones de trabajo: con Q5_K_M (21,8 GB) en una RTX 5090 de 32 GB a 32K de contexto, adecuado para pipelines de clasificación y generación de contenido con latencia controlada.
- Despliegue en hardware de consumo: con Q3_K_M (15,3 GB) en una RTX 4090 o RTX 3090 de 24 GB a 32K de contexto, permite prototipado y uso personal de un modelo de 31B multimodal.
- Aplicaciones multilingües inglés-coreano: el autor valida la fidelidad de cuantización en ambos idiomas, lo que respalda su uso en productos dirigidos a esos mercados.
- Inferencia en entornos sin GPU: los GGUF funcionan en CPU, lo que habilita despliegues en servidores sin acelerador o en portátiles, sacrificando throughput por disponibilidad.
- Integración en herramientas de desarrollo: al ser compatible con llama.cpp y `llama-server`, puede conectarse a interfaces tipo OpenAI-compatible para pruebas y evaluación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente al BF16 original:

| Cuantización | Tamaño | KL media (menor es mejor) | Top-1 |
|---|---:|---:|---:|
| Q8_0 | 32,636 GB | 0,0015 | 97,36% |
| Q6_K | 25,201 GB | 0,0048 | 95,78% |
| Unsloth Q6_K | 25,200 GB | 0,0054 | 95,47% |
| Q5_K_M | 21,846 GB | 0,0116 | 94,02% |
| Unsloth Q5_K_M | 21,660 GB | 0,0118 | 93,68% |
| IQ4_XS-imat | 16,736 GB | 0,0493 | 88,24% |
| Q3_K_M | 15,287 GB | 0,1086 | 83,72% |
| IQ3_M | 14,424 GB | 0,1230 | 83,13% |
| Q2_K | 11,916 GB | 0,4023 | 71,12% |

Las métricas se midieron con llama.cpp en texto inglés y coreano. Los proyectores de visión ocupan 1,199 GB (F16) y 0,810 GB (Q8_0). No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: desde 11,9 GB (Q2_K) hasta 32,6 GB (Q8_0) solo para pesos; hay que sumar la caché KV en f16 según contexto y unos 2 GB de runtime.
- Regla del autor: el archivo debe caber junto a la caché KV más 2 GB por debajo del 90% de la memoria disponible.
- GPU recomendadas según la tabla del autor:
  - RTX 4090 / RTX 3090 (24 GB): Q3_K_M a 32K de contexto.
  - RTX 5090 (32 GB): Q5_K_M a 32K de contexto.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): Q8_0 a 64K de contexto.
  - H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256/512 GB), B300 (288 GB): Q8_0 a 256K de contexto.
- Cabe en GPU de consumo: sí, con Q3_K_M o inferiores en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior; CUDA, Metal o CPU. Otros motores como vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 31B IT GGUF (Xylolabs) | 30,7B | hasta 256K según hardware | GGUF | Apache 2.0 | Multimodal, cuantizaciones con métricas KL publicadas |
| Gemma 4 31B IT (Google) | 30,7B | no disponible en la información | safetensors (presumible) | Apache 2.0 | Modelo base BF16 de referencia |
| Unsloth Q6_K / Q5_K_M (Gemma 4 31B) | 30,7B | no disponible | GGUF | Apache 2.0 | Comparado por el autor: KL 0,0054 / 0,0118 y top-1 95,47% / 93,68%, ligeramente inferiores a las de Xylolabs |

No se dispone de datos de benchmarks de tareas para comparar con alternativas de otros desarrolladores; la comparación se limita a las cuantizaciones de Unsloth incluidas en la tabla del autor.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas: los metadatos solo declaran inglés y coreano; el rendimiento en castellano no está validado por el autor.
- La cuantización introduce degradación medible: Q2_K cae a 71,12% de acuerdo top-1 y Q3_K_M a 83,72%, por lo que no se recomiendan para tareas sensibles a la precisión.
- El modo "thinking" está activado por defecto según la guía de ejecución; debe desactivarse explícitamente para respuestas directas.
- Requiere una versión concreta o posterior de llama.cpp (`cd959bae`); versiones anteriores pueden no cargar los archivos.
- La licencia Apache 2.0 se mantiene desde la release de Gemma 4; el autor declara no estar afiliado ni respaldado por Google.
- El tamaño del repositorio (140,1 GB) implica una descarga considerable; conviene seleccionar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper referenciado: https://arxiv.org/abs/2607.02770
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF/blob/main/LICENSE
