# Tileward-Inc/Tileward-Qwen3.6-35B-A3B-TWX3

## Resumen

Tileward-Qwen3.6-35B-A3B-TWX3 es una compresión del modelo Qwen3.6-35B-A3B desarrollada por Tileward-Inc mediante su método propietario TWX3. El modelo base es un transformer de tipo mezcla de expertos (MoE) publicado por el equipo Qwen bajo licencia Apache-2.0, y esta versión comprimida reduce el peso en disco de 71,9 GB a 20,08 GB, lo que supone una reducción del 72% (factor 3,6x) respecto al original y un 14% menos que la build NVFP4 de NVIDIA (23,4 GB).

La relevancia de esta ficha reside en que demuestra que es posible comprimir agresivamente un MoE de 35B parámetros totales manteniendo la precisión en MMLU 5-shot: el modelo declara 83,2 de accuracy, ligeramente por encima del 83,0 de la propia build TWX4 de Tileward y a la par de las referencias publicadas. Esto lo sitúa como una opción atractiva para despliegues con restricciones severas de VRAM o almacenamiento.

No obstante, hay que señalar una limitación crítica de disponibilidad: los pesos no están publicados en Hugging Face. El repositorio actúa como escaparate comercial y el acceso se gestiona bajo petición mediante una reunión con un ingeniero de Tileward o a través de su API compatible con OpenAI. Los datos de benchmarks proceden del model-index del autor y no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), basado en Qwen3.6-35B-A3B |
| Parametros totales | 35B (heredados del modelo base) |
| Parametros activos | A3B (aproximadamente 3B activos, segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TWX3 (formato propietario de Tileward, 20,08 GB); existe tambien una build TWX4 (24,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos no publicados; acceso bajo peticion) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 3B parámetros por token sobre un total de 35B. Esta configuración permite un coste computacional de inferencia cercano al de un modelo denso de 3B, manteniendo la capacidad representacional de un modelo mucho mayor.

La contribución específica de Tileward es el método de compresión TWX3, un esquema de cuantización propietario que reduce el peso a 20,08 GB. Según la model card, TWX3 y TWX4 se evaluaron en una sola sesión sobre una única tarjeta gráfica, lo que aporta consistencia interna a la comparación, aunque no se detallan los hiperparámetros de cuantización, el número de bits por peso ni la composición del dataset de calibración. No se especifica si hubo ajuste fino posterior a la compresión ni si se aplicaron técnicas de destilación o recuperación de precisión.

## Capacidades

- Generación de texto en inglés y otros idiomas (los idiomas concretos no están declarados en la información disponible).
- Razonamiento y respuesta a preguntas de conocimiento general, evidenciado por el resultado de 83,2 en MMLU 5-shot.
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B, si bien la model card no detalla qué habilidades específicas se preservan tras la compresión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Acceso vía API compatible con OpenAI en `https://api.tileward.com/v1`.

## Casos de uso

- Despliegue en entornos con VRAM limitada: con 20,08 GB de pesos, el modelo puede cargarse en GPUs de 24 GB (RTX 4090, L4, A10G) o en configuraciones multi-GPU de gama media, algo inviable con el original de 71,9 GB.
- Sustitución de modelos densos de 7B-13B en pipelines de generación de texto: al activar solo ~3B parámetros por token, el coste de inferencia se aproxima al de un modelo pequeño mientras conserva la calidad de un MoE de 35B, según el resultado de MMLU declarado.
- Prototipado rápido mediante API: el endpoint compatible con OpenAI permite integrar el modelo en aplicaciones existentes sin gestionar infraestructura propia, con 25 USD de crédito inicial sin tarjeta.
- Evaluación comparativa de técnicas de cuantización: útil para investigadores que quieran contrastar TWX3 frente a NVFP4 o formatos estándar (GGUF, AWQ) en tareas de conocimiento general.
- Distribución en dispositivos con almacenamiento reducido: el tamaño de 20,08 GB facilita el empaquetado en imágenes de contenedor o artefactos de despliegue que de otro modo requerirían 72 GB.
- Servicio de inferencia de bajo coste por token: la combinación de pocos parámetros activos y pesos comprimidos reduce los requisitos de memoria y ancho de banda, lo que puede traducirse en menor coste por petición en despliegues de alta concurrencia.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Modelo | Tamano en disco | MMLU (5-shot) |
|---|---|---|
| Qwen3.6-35B-A3B (original) | 71,9 GB | no disponible |
| Tileward 35B-A3B TWX4 | 24,1 GB | 83,0 |
| Qwen3.6-35B-A3B-NVFP4 (NVIDIA) | 23,4 GB | no disponible |
| Tileward 35B-A3B TWX3 | 20,08 GB | 83,2 |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 20,08 GB solo para los pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) para carga ajustada; A10G (24 GB), L4 (24 GB), A100 (40/80 GB) y H100 (80 GB) para mayor margen y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), siempre que el contexto sea moderado.
- Opciones de despliegue: no se especifican en la información disponible. El formato TWX3 es propietario, por lo que la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada; la vía documentada es la API de Tileward.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU 5-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-Qwen3.6-35B-A3B-TWX3 | 35B totales / ~3B activos | no disponible | 83,2 (declarado) | Apache-2.0 | Bajo peticion / API |
| Tileward-Qwen3.6-35B-A3B (TWX4) | 35B totales / ~3B activos | no disponible | 83,0 (declarado) | Apache-2.0 | Bajo peticion / API |
| Qwen3.6-35B-A3B (original) | 35B totales / ~3B activos | no disponible | no disponible | Apache-2.0 | Pesos publicos en HF |
| Qwen3.6-35B-A3B-NVFP4 (NVIDIA) | 35B totales / ~3B activos | no disponible | no disponible | Apache-2.0 | Pesos publicos en HF |

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face: el acceso requiere concertar una reunión con un ingeniero de Tileward o usar su API, lo que limita la reproducibilidad y la auditoría independiente.
- El benchmark de MMLU está marcado como `verified: false` en el model-index; no hay evaluación independiente que confirme el 83,2 declarado.
- El formato TWX3 es propietario y no se documenta su compatibilidad con runtimes estándar (vLLM, llama.cpp, TensorRT-LLM), lo que puede dificultar el despliegue autogestionado.
- No se especifican los idiomas soportados, la longitud de contexto ni el dataset de calibración de la cuantización.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos del modelo base Qwen3.6-35B-A3B no documentados en esta ficha.
- Aunque la licencia es Apache-2.0, conviene revisar los términos comerciales del servicio de Tileward antes de un uso en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Qwen3.6-35B-A3B-TWX3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build TWX4 de Tileward: https://huggingface.co/Tileward-Inc/Tileward-Qwen3.6-35B-A3B
- Web de Tileward: https://tileward.com
- Articulo de investigacion: https://tileward.com/research/a-16gb-qwen3-6-35b-a3b/
- Repositorio de investigacion: https://tileward.com/research/
- API y consola: https://app.tileward.com/?join=explore
- Endpoint compatible con OpenAI: https://api.tileward.com/v1
- Reserva de reunion con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
