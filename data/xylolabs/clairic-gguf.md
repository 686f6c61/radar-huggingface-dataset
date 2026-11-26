# Xylolabs/clairic-GGUF

## Resumen

Clairic GGUF es la versión cuantizada en formato GGUF de Cloudflare/clairic, un modelo multimodal de 27B parámetros (26.895.998.464 en safetensors) afinado a partir de Qwen/Qwen3.8-27B para tareas de extracción estructurada de información. Lo publica Xylolabs, que ha convertido los pesos originales a GGUF para su uso con llama.cpp, incluyendo el codificador visual necesario para la entrada de imágenes. El resultado es un modelo image-text-to-text que puede procesar documentos, capturas o fotografías y devolver JSON que sigue un esquema definido.

La relevancia de esta ficha es doble: por un lado, ofrece una vía práctica de ejecutar un modelo de extracción estructurada de 27B en hardware de consumo y estaciones de trabajo, con cuantizaciones desde Q2_K (11,1 GB) hasta Q8_0 (28,6 GB); por otro, documenta con métricas de fidelidad (divergencia KL y acuerdo top-1 frente a inferencia f32) el coste de cada nivel de cuantización, algo poco habitual en repositorios GGUF.

El modelo base es obra de Cloudflare y esta versión mantiene la licencia Apache 2.0. Conviene señalar que la conversión no incluye la "typed extraction head" propietaria de Cloudflare ni el bloque de multi-token prediction del checkpoint original, por lo que el comportamiento puede diferir del modelo base en tareas que dependan de esas componentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), fine-tune de Qwen/Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (27B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 256K según hardware (32K en 24 GB, 64K en 32 GB, 128K en 48 GB, 256K en 80 GB o más) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K (imatrix incluida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj BF16 separado para visión |

## Arquitectura y entrenamiento

La información disponible indica que clairic es un fine-tune de Qwen/Qwen3.8-27B orientado a extracción estructurada, con un codificador visual para entrada de imágenes y una "typed extraction head" específica de Cloudflare. No se detalla en la documentación proporcionada la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base Cloudflare/clairic. La arquitectura subyacente corresponde a la familia Qwen3.8, de la que tampoco se aportan detalles de atención o capas en esta ficha.

La innovación destacable de esta publicación no está en el entrenamiento sino en la conversión: Xylolabs ha generado cuantizaciones con imatrix y ha medido la fidelidad de cada una frente a inferencia en f32 sobre pesos BF16, con métricas de divergencia KL media y acuerdo top-1 en texto mixto. Además, la conversión excluye explícitamente la typed extraction head y el bloque de multi-token prediction del checkpoint original, lo que implica que el modelo GGUF conserva el tronco y la visión pero no esas componentes auxiliares.

## Capacidades

- Generación de texto y razonamiento general, heredados del tronco Qwen3.8-27B.
- Procesamiento de imágenes (image-text-to-text) mediante el codificador visual incluido en `mmproj-clairic-BF16.gguf`.
- Extracción estructurada de información: salida JSON conforme a un esquema pasado en la petición (`response_format` con `json_schema` en llama-server, `--json-schema` en llama-cli).
- Soporte de plantilla de chat Jinja (`--jinja`) y control del modo thinking mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente.

## Casos de uso

- Extracción de datos de facturas y albaranes: se envía la imagen del documento junto con un JSON schema de campos (número, fecha, importes, líneas) y el modelo devuelve el JSON validado, aprovechando la pipeline image-text-to-text y el soporte de `json_schema` de llama-server.
- Digitalización de formularios y encuestas en papel: el modelo lee la imagen del formulario y extrae cada campo a una estructura tipada, lo que permite alimentar directamente una base de datos sin post-procesado manual.
- Procesamiento de tickets y justificantes de gasto: con Q4_K_M en una RTX 4090 y 32K de contexto, se pueden procesar lotes de imágenes en local cumpliendo requisitos de privacidad al no enviar documentos a la nube.
- Enriquecimiento de catálogos de producto: a partir de fotografías de producto y fichas escaneadas, el modelo extrae atributos (marca, modelo, especificaciones) en JSON para su ingesta en un PIM o buscador.
- Extracción de metadatos de documentos técnicos y planos: con contexto de hasta 256K en GPUs de 80 GB o más, se pueden pasar varias páginas o imágenes relacionadas en una sola petición y obtener una estructura consolidada.
- Automatización de back-office con salida validable: al integrarse en llama-server con `response_format`, la salida puede validarse contra el esquema y reintentar en caso de fallo, lo que encaja en pipelines de CI/CD o flujos ETL con control de calidad.
- Despliegue en estación de trabajo para prototipado: con Q4_K_M (16,8 GB) en una RTX 3090/4090 se dispone de un modelo multimodal de 27B para pruebas de extracción antes de escalar a Q8_0 en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí se publica es la fidelidad de cada cuantización frente a inferencia f32 sobre pesos BF16, medida en texto mixto:

| Cuantizacion | Tamano | KL media (texto mixto) | Acuerdo top-1 |
|---|---:|---:|---:|
| Q8_0 | 28,62 GB | 0,0100 | 98,25% |
| Q6_K | 22,11 GB | 0,0161 | 97,35% |
| Q5_K_M | 19,36 GB | 0,0237 | 95,97% |
| Q4_K_M | 16,78 GB | 0,0518 | 93,93% |
| Q4_K_S | 15,63 GB | 0,0566 | 93,55% |
| IQ4_XS | 15,35 GB | 0,0611 | 92,42% |
| Q3_K_M | 13,55 GB | 0,1333 | 89,36% |
| IQ3_M | 12,82 GB | 0,1393 | 88,59% |
| Q2_K | 11,10 GB | 0,2348 | 84,86% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,1 GB (Q2_K) y 28,6 GB (Q8_0) solo para los pesos; hay que sumar el mmproj de visión (931 MB) y la caché KV según el contexto.
- GPU recomendadas según el autor: RTX 4090 / RTX 3090 (24 GB) con Q4_K_M y 32K de contexto; RTX 5090 (32 GB) con Q6_K y 64K; RTX 6000 Ada o 2 x 24 GB (48 GB) con Q8_0 y 128K; H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB) con Q8_0 y 256K.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en RTX 5090 con Q6_K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y M5 Ultra (256/512 GB) con Q8_0 y 256K de contexto.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), verificado con el build e4b620af1. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Clairic GGUF (esta ficha) | 27B | hasta 256K según hardware | imagen + texto | Apache 2.0 | GGUF |
| Cloudflare/clairic (base) | 27B | no disponible | imagen + texto | Apache 2.0 | safetensors |
| Qwen/Qwen3.8-27B (origen) | 27B | no disponible | texto | no disponible | safetensors |

## Limitaciones y advertencias

- La conversión excluye la typed extraction head de Cloudflare y el bloque de multi-token prediction, por lo que el comportamiento puede diferir del modelo base en tareas de extracción tipada.
- Las métricas de fidelidad se midieron solo en texto mixto; no hay datos de degradación por cuantización en tareas de visión o extracción estructurada.
- Q2_K e IQ3_M presentan un acuerdo top-1 por debajo del 90% y KL superior a 0,13; no son recomendables para producción sensible a la precisión.
- Riesgo de alucinación inherente a modelos generativos: en extracción de campos, conviene validar la salida contra el JSON schema y aplicar reintentos o revisión humana.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el archivo LICENSE y verificarse las obligaciones heredadas del modelo base y de Qwen3.8-27B.
- El contexto máximo práctico depende de la VRAM disponible; superar el contexto indicado para cada GPU puede provocar offloading a CPU y caídas severas de rendimiento.
- Requiere un build reciente de llama.cpp (verificado con e4b620af1) y el flag `--jinja` para el correcto funcionamiento de la plantilla de chat.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/clairic-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Xylolabs/clairic-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráficas de fidelidad: https://huggingface.co/Xylolabs/clairic-GGUF/resolve/main/kl.png y https://huggingface.co/Xylolabs/clairic-GGUF/resolve/main/top1.png
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
