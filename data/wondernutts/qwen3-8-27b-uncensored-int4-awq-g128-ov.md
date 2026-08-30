# Wondernutts/Qwen3.8-27B-Uncensored-int4-awq-g128-ov

## Resumen

Este repositorio contiene una conversión a formato OpenVINO con cuantización INT4 asimétrica mediante AWQ (grupo de 128) del modelo Qwen3.8-27B-Uncensored, a su vez derivado del Qwen3.8-27B original de Alibaba tras un proceso de ablación de la dirección de rechazo (abliteration) realizado por Jonathan Coletti. El resultado es un modelo multimodal (imagen-texto) de 27 000 millones de parámetros, con ventana de contexto de 262 000 tokens según la documentación del modelo base, pensado para despliegue eficiente en hardware Intel (GPU Arc, CPU) mediante OpenVINO GenAI.

La relevancia de esta conversión radica en que permite ejecutar un modelo de gran tamaño con capacidades de visión, razonamiento y generación de texto en equipos con recursos limitados, aprovechando la cuantización INT4 y la optimización de OpenVINO para hardware Intel. Además, al estar ablacionado, presenta una tasa de rechazo significativamente menor que el modelo original, lo que lo hace adecuado para aplicaciones donde se requiere menor censura en las respuestas.

El repositorio incluye artefactos completos de despliegue multimodal: modelo de lenguaje, tokenizador, embeddings de texto y gráficos de visión. No obstante, se advierte que, aunque los tensores MTP (Multi-Token Prediction) están presentes en el checkpoint fuente, la exportación OpenVINO no expone una cabeza de decodificación especulativa MTP, por lo que esta funcionalidad no está disponible en este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B, sin detalle oficial de la arquitectura interna) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 000 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | INT4 asimetrico AWQ, grupo de 128 (tambien existe version plain INT4 sin AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_config.json, binarios IR; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con componente de visión, capaz de procesar tanto texto como imágenes. El proceso de ablación (abliteration) aplicado por Jonathan Coletti elimina la dirección de rechazo del modelo original, reduciendo la tendencia a negarse a responder ciertas peticiones, sin modificar los pesos de la torre de visión ni la cabeza MTP. Esta conversión concreta no implica entrenamiento adicional: se trata de una compresión de pesos mediante AWQ (activación consciente de cuantización) a INT4 asimétrico con grupo de 128, realizada con Optimum 2.3.0 y Transformers 5.2.0.

La conversión OpenVINO incluye todos los artefactos necesarios para inferencia multimodal: modelo de lenguaje, tokenizador/detokenizador, embeddings de texto y gráficos de visión (embedding, fusión y posición). Se ha verificado la presencia de los 15 tensores MTP en el checkpoint fuente, pero la exportación no expone una cabeza MTP para decodificación especulativa, por lo que esta característica no está operativa en este paquete.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (con y sin modo de razonamiento).
- Comprensión de imágenes: entrada multimodal a través de la pipeline VLMPipeline de OpenVINO GenAI.
- Razonamiento y matemáticas básicas: validado con una prueba de generación matemática en la validación A/B.
- Reducción de rechazos: comportamiento "uncensored" significativamente menor que el modelo original en pruebas de sobre-rechazo (XSTest y suite A/B), según la documentación del modelo base.
- Soporte de tool calling y modo de razonamiento (thinking) según la documentación del modelo fuente.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Asistentes conversacionales con entrada visual: el modelo puede procesar imágenes y responder preguntas sobre ellas, por ejemplo, en aplicaciones de atención al cliente donde el usuario envía una captura de pantalla o una foto de un producto.
- Generación de contenido creativo sin restricciones: gracias a la ablación de rechazos, es adecuado para escritura de ficción, guiones o narración interactiva donde el modelo original podría negarse a ciertos temas.
- Análisis de documentos con imágenes: puede extraer información de gráficos, diagramas o escaneos, combinando visión y razonamiento de texto largo (262K tokens de contexto).
- Desarrollo de agentes con razonamiento multi-paso: soporta tool calling y modo de pensamiento, permitiendo construir agentes que planifican y ejecutan acciones (por ejemplo, consultas a APIs o bases de datos).
- Despliegue en edge con hardware Intel: al estar optimizado para OpenVINO, puede ejecutarse en dispositivos con GPU Intel Arc o CPU Intel, reduciendo costes frente a GPUs dedicadas.
- Prototipado rápido de aplicaciones multimodales: la cuantización INT4 reduce el uso de memoria, permitiendo ejecutar el modelo en equipos con 16 GB de VRAM o incluso solo CPU, facilitando pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada es una prueba A/B de humo en CPU (con `DYNAMIC_QUANTIZATION_GROUP_SIZE=0`) comparando esta version AWQ con la version plain INT4, que muestra tiempos de generacion similares sin diferencias significativas:

| Prueba | AWQ g128 candidato | Plain INT4 baseline |
|---|---:|---:|
| Carga | 11.78 s | 11.27 s |
| Generacion matematica | 38.67 s | 38.73 s |
| Generacion roleplay | 117.26 s | 117.34 s |
| Generacion vision | 66.69 s | 66.91 s |

El autor indica explicitamente que esta prueba no constituye un benchmark de throughput y que no se hacen afirmaciones sobre tokens por segundo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15.7 GB en disco; para inferencia en GPU se recomiendan al menos 16 GB de VRAM (por ejemplo, Intel Arc A770 16 GB, RTX 4080 16 GB o superiores).
- GPU compatibles: cualquier GPU soportada por OpenVINO GenAI, incluyendo Intel Arc, Intel Iris Xe y GPUs NVIDIA/AMD via OpenVINO (aunque el objetivo principal es hardware Intel).
- CPU: puede ejecutarse en CPU con OpenVINO, con tiempos de generacion lentos (ver prueba A/B: ~38 s para una respuesta matematica corta en CPU).
- Opciones de despliegue: OpenVINO GenAI (CLI o Python), mediante `VLMPipeline` para entrada multimodal. No compatible con vLLM, llama.cpp u Ollama directamente al ser formato OpenVINO IR.
- Latencia: no se proporcionan mediciones de tokens por segundo; solo tiempos de generacion en CPU en la prueba A/B (no generalizables).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored (BF16) | 27B | 262K | Transformers (safetensors) | Apache-2.0 | Checkpoint fuente, sin cuantizar |
| Wondernutts/Qwen3.8-27B-Uncensored-int4-ov | 27B | 262K | OpenVINO IR (INT4 plain) | Apache-2.0 | Version plain INT4 sin AWQ |
| Wondernutts/Qwen3.8-27B-Uncensored-int4-awq-g128-ov | 27B | 262K | OpenVINO IR (INT4 AWQ g128) | Apache-2.0 | Este modelo, con AWQ y grupo 128 |

La comparacion con otros modelos de la misma categoria (multimodales de ~27B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La reduccion de rechazos no implica correccion: el modelo puede generar contenido incorrecto, sesgado o inapropiado. La ablacion solo elimina la direccion de rechazo, no mejora la calidad de las respuestas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar informacion, especialmente en temas de actualidad o con entradas ambiguas.
- El formato OpenVINO IR no es compatible con ecosistemas estandar (Transformers, vLLM, Ollama). Solo puede usarse con OpenVINO GenAI.
- El MTP (decodificacion especulativa) no esta activo en este paquete, a pesar de que los tensores MTP estan presentes en el checkpoint fuente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original (Qwen3.8-27B) y del modelo ablacionado antes de redistribucion o despliegue en produccion.
- No se proporcionan datos de rendimiento en tareas estandar, por lo que es dificil evaluar la calidad del modelo frente a alternativas.
- El modelo puede tener sesgos inherentes al dataset de entrenamiento de Qwen3.8-27B, no mitigados por la ablacion.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/Wondernutts/Qwen3.8-27B-Uncensored-int4-awq-g128-ov)
- [Version plain INT4 (baseline)](https://huggingface.co/Wondernutts/Qwen3.8-27B-Uncensored-int4-ov)
- [Modelo fuente ablacionado (Jonathan Coletti)](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Herramientas de conversion OpenVINO de Wondernutts](https://github.com/Wondernuttz/OpenVino-For-Gemma-4)
- [Runtime OpenVINO personalizado](https://github.com/Wondernuttz/openvino)
