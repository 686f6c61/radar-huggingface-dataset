# tensor-ai-inc/d3-nano-NVFP4

## Resumen

d3-nano-NVFP4 es una versión cuantizada del modelo vllm-sr/d3-nano, desarrollada por tensor-ai-inc. Se trata de un modelo de decisión de la familia Decision 3.0 (2,2 B según la model card; 1.716.216.640 parámetros según los tensores en safetensors) que no genera texto libre, sino que responde preguntas estructuradas sobre un estado o entrada dado: elección entre opciones, preguntas de sí/no y puntuaciones. La model card lo presenta como un modelo de la familia Decision 3.0 del equipo de vLLM Semantic Router, con codificación de visión y soporte de imágenes y vídeo heredados del paquete original.

La aportación de esta variante es la cuantización a NVFP4 (FP4 con escalas FP8 por cada 16 valores y una escala FP32 por tensor) mediante NVIDIA TensorRT Model Optimizer 0.47.0, siguiendo la receta de NVIDIA para esta familia: las capas MLP y de atención completa pasan a NVFP4, mientras que las capas de atención lineal, los embeddings, el encoder de visión y el readout de decisión se mantienen en su precisión original. El resultado son pesos de 3,0 GB frente a los 4,4 GB del original, un 32 % menos.

Es relevante ahora porque está pensado para las GPUs Blackwell, que ejecutan FP4 de forma nativa, y porque permite desplegar una capa de decisión ligera dentro de vLLM con una pérdida medida de 2,98 puntos en el índice interno del autor y un 95,2 % de respuestas idénticas respecto al modelo sin cuantizar. El soporte de Decision 3.0 está en la rama principal de vLLM, por lo que requiere una build nightly.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas de atención lineal (el tag del repo es `qwen3_5`); incluye encoder de visión y un módulo de "decisión" (*readout*) |
| Parámetros totales | 1.716.216.640 (1,72 B) según safetensors; la model card indica 2,2 B para la familia Decision 3.0 |
| Parámetros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4: valores FP4, escalas FP8 por bloque de 16 valores y una escala FP32 por tensor. Aplicado a MLP y atención completa; atención lineal, embeddings, encoder de visión y readout permanecen en precisión original |
| Idiomas soportados | No disponible (los metadatos de HuggingFace no declaran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con `custom_code` (exportado con NVIDIA TensorRT Model Optimizer 0.47.0) |

## Arquitectura y entrenamiento

La arquitectura parte de vllm-sr/d3-nano: un transformer que combina capas de atención completa con capas de atención lineal, un encoder de visión y un cabezal de decisión que responde preguntas tipadas sobre una entrada (`state`). El modelo no produce texto libre; la API System One expone preguntas con tipo `choice` (elegir entre criterios con nombre), `noul` (según el ejemplo de la model card) y preguntas de puntuación. El repositorio conserva sin cambios el código de runtime del paquete original, por lo que todo lo descrito en la model card original sobre preguntas, imágenes y vídeo aplica igual aquí.

No se publican en la información disponible datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es el proceso de cuantización: Model Optimizer 0.47.0 con NVFP4, calibrado sobre 256 prompts de UltraChat con preguntas genéricas de elección, sí/no y puntuación, sin contenido de ningún benchmark. La revisión del código fuente utilizada es `462efc366229ea268cf4eed3738b3fc4415e4817`. Las puntuaciones NVFP4 publicadas se obtuvieron en una H100 con FP4 simulado de Model Optimizer, no en hardware Blackwell.

## Capacidades

- Decisión y clasificación zero-shot: responde preguntas tipadas (`choice`, `noul`, puntuación) sobre un `state` textual.
- Enrutado entre categorías definidas por el usuario con criterios y descripciones, como en el ejemplo de triaje de tickets de la model card.
- Verificación de condiciones booleanas sobre una entrada (por ejemplo, si el cliente dispone de recibo).
- Puntuación de entradas según criterios, útil para ranking y filtrado.
- Procesamiento de imágenes: la arquitectura incluye encoder de visión y la model card remite a las capacidades de imagen del modelo original.
- Procesamiento de vídeo: mencionado explícitamente en la model card como capacidad heredada del paquete original.
- API específica de decisión en vLLM (`/v1/systemone`) con múltiples preguntas por petición en una sola llamada.
- Capacidades multilingües: no disponibles (no se declaran idiomas en los metadatos).
- Tool calling, modo *thinking* y razonamiento multi-paso: no documentados en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: con una pregunta de tipo `choice` y criterios como `returns` (devoluciones, reemplazos y entregas dañadas) o `billing` (pagos, facturas y cargos), el modelo asigna cada solicitud al equipo correcto; es el ejemplo literal que documenta el autor.
- Verificación documental en backoffice: preguntas de tipo `noul` del estilo "¿el cliente tiene recibo?" permiten validar condiciones antes de aprobar una devolución o un reembolso, dentro de un flujo automatizado.
- Enrutado semántico en pasarelas de LLM: al provenir del equipo de vLLM Semantic Router y exponer decisiones de elección cerrada, encaja como capa de decisión que selecciona modelo, herramienta o ruta antes de invocar un modelo generativo.
- Moderación y clasificación de contenido: clasificación zero-shot de textos e imágenes entrantes en categorías definidas por el operador, con varias preguntas resueltas en una única petición.
- Puntuación y ranking en pipelines de datos: usar las preguntas de puntuación para ordenar respuestas candidatas, productos o documentos según criterios explícitos.
- Automatización de procesos (RPA) con estado textual: dado un estado en lenguaje natural (correo, incidencia, resumen de pedido), el modelo responde varias condiciones de negocio en una sola llamada y evita un LLM generativo para decisiones simples.
- Análisis de vídeo o imagen con pregunta cerrada: gracias al encoder de visión heredado, se pueden plantear decisiones sobre fotogramas o imágenes, por ejemplo clasificar una entrega dañada a partir de una foto.
- Despliegue en edge o en GPUs de gama media: con 3,0 GB de pesos en FP4, la capa de decisión puede convivir con otros servicios en la misma GPU.

## Benchmarks y rendimiento

El autor publica únicamente resultados sobre la parte pública del Decision Index 0.3, evaluado sobre una muestra estratificada fija de 1.000 peticiones y con los scorers del propio kit. El autor advierte que no son puntuaciones de leaderboard, ya que la suite se construyó desde las fuentes del kit en lugar de descargar la copia oficial.

| Modelo | Decision Index (público) | Misma respuesta que el original | Pesos |
|---|---|---|---|
| vllm-sr/d3-nano (original) | 42,35 | - | 4,4 GB |
| tensor-ai-inc/d3-nano-NVFP4 | 39,37 | 95,2 % | 3,0 GB |
| Jev by TypeSafe (vía Vercel AI Gateway), referencia | 54,69 | - | - |

Notas: Jev no pudo responder 7 de las 1.000 peticiones y el kit las contabiliza como erróneas. Ambas versiones de d3-nano se ejecutaron en una H100 con el mismo código; al no haber hardware FP4 en Hopper, las puntuaciones NVFP4 proceden del FP4 simulado de Model Optimizer, que redondea pesos y activaciones igual que el modelo exportado en Blackwell. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de velocidad en Blackwell en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB, partiendo de los 3,0 GB de pesos más caché KV y overhead del runtime (estimación propia; el autor no publica cifras de VRAM).
- GPU recomendadas: Blackwell, que ejecuta FP4 de forma nativa (B100, B200, GB200 y las RTX de la serie 50 / RTX PRO Blackwell). En Hopper (H100/H200) no hay hardware FP4, por lo que el modelo no aprovecha la ventaja de la cuantización.
- Cabe en GPU consumer: sí, por tamaño de pesos cabría en tarjetas de 8-12 GB o más, incluida una RTX 4090 de 24 GB; el rendimiento real en esas tarjetas no está medido para esta variante.
- Despliegue: exclusivamente vLLM con build nightly (`pip install -U vllm --extra-index-url https://wheels.vllm.ai/nightly`) y `vllm serve tensor-ai-inc/d3-nano-NVFP4`; el endpoint de decisión es `/v1/systemone`. No se documentan opciones GGUF, llama.cpp, Ollama ni TGI, y el repo usa `custom_code`, por lo que hace falta cargar código remoto.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no ha medido la velocidad en Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (público) | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tensor-ai-inc/d3-nano-NVFP4 | 1,72 B (safetensors) / 2,2 B según model card | No disponible | 39,37 | 3,0 GB | Apache-2.0 | HuggingFace, vLLM nightly |
| vllm-sr/d3-nano | 2,2 B (según model card) | No disponible | 42,35 | 4,4 GB | Apache-2.0 | HuggingFace, vLLM |
| Jev by TypeSafe | No disponible | No disponible | 54,69 | No disponible | No disponible | Vercel AI Gateway |

La comparativa se limita a estos dos modelos porque son los únicos con datos en la información proporcionada. No se dispone de parámetros, contexto ni licencia de Jev, y su cifra incluye 7 peticiones sin respuesta contabilizadas como erróneas.

## Limitaciones y advertencias

- Pérdida de precisión medible: 39,37 frente a 42,35 en el Decision Index público del autor, con un 95,2 % de respuestas idénticas al original; un 4,8 % de decisiones cambian respecto al modelo sin cuantizar.
- Los benchmarks son internos y no comparables con leaderboards públicos: muestra de 1.000 peticiones, suite construida desde el código del kit y puntuaciones obtenidas con FP4 simulado en H100, no en Blackwell.
- No hay mediciones de velocidad ni de rendimiento en Blackwell, el hardware para el que está diseñado el modelo.
- No se declaran idiomas soportados; no hay garantía documentada de comportamiento en castellano ni en otros idiomas distintos del inglés de los ejemplos.
- No se documentan sesgos, datos de entrenamiento del modelo base ni evaluaciones de robustez o alucinación; el modelo responde con una opción o un sí/no, por lo que una entrada ambigua puede producir una decisión errónea sin señal de incertidumbre documentada.
- Longitud de contexto no disponible: no se puede planificar el uso con estados largos (por ejemplo, hilos completos de correo) sin verificarlo empíricamente.
- Dependencia de una build nightly de vLLM y de `custom_code`, lo que implica riesgo de ruptura de compatibilidad en producción.
- El proceso de calibración usó 256 prompts de UltraChat con preguntas genéricas; dominios muy alejados de esa distribución pueden degradar más la precisión que lo observado en el índice.
- Licencia Apache-2.0: permite uso comercial, pero al ser una versión modificada de vllm-sr/d3-nano se deben conservar los ficheros LICENSE y NOTICE del proyecto original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tensor-ai-inc/d3-nano-NVFP4
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Repositorio del Decision Index: https://github.com/apolinario/decision-index
- Dataset de calibración UltraChat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Wheels nightly de vLLM: https://wheels.vllm.ai/nightly
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados correspondían a tensor.art, a la definición matemática de tensor en Wikipedia y al marketplace Tensor de Solana, sin relación con el modelo.
