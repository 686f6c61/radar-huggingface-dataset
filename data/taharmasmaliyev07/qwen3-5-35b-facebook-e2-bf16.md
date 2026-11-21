# taharmasmaliyev07/Qwen3.5-35B-FACEBOOK-E2-BF16

## Resumen

Qwen3.5-35B-FACEBOOK-E2-BF16 es un ajuste fino (finetune) publicado por el usuario taharmasmaliyev07 sobre una base de la familia Qwen3.5, identificada en los metadatos como `qwen3_5_moe`. El modelo tiene 35.951.822.704 parámetros totales según los pesos en safetensors y se distribuye en precisión BF16, con un repositorio de 72 GB. Está orientado a tareas multimodales de imagen-texto a texto (`image-text-to-text`) y a generación de texto conversacional.

El autor declara que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que según la model card permitió un entrenamiento "2x más rápido". La licencia es Apache 2.0 y el único idioma declarado es el inglés. No se especifica en la información disponible qué dataset de ajuste fino se utilizó, más allá de la referencia "FACEBOOK-E2" en el nombre del modelo, ni qué variante concreta de Qwen3.5 sirve de base.

La relevancia de esta ficha es limitada: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil principalmente como ejemplo de finetune multimodal sobre arquitectura MoE con herramientas de bajo coste (Unsloth), pero no como modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`); detalles de capas y expertos no disponibles |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia Qwen3.5 y que utiliza una arquitectura de mezcla de expertos (`qwen3_5_moe`), con 35.951.822.704 parámetros totales. No se detallan el número de expertos, el número de parámetros activos por token, la profundidad de la red ni el mecanismo de enrutamiento. Tampoco se especifica la longitud de contexto nativa ni si incorpora innovaciones como atención lineal o decodificación especulativa.

El ajuste fino se realizó, según la model card, con Unsloth y TRL de Hugging Face, lo que sugiere un entrenamiento supervisado (SFT) o posiblemente DPO/ORPO sobre la base, aunque el autor no lo confirma. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF. El nombre "FACEBOOK-E2" sugiere un dataset o tarea relacionada con Facebook, pero no hay información que lo confirme. El modelo base declarado en los metadatos es el propio repositorio, lo que impide rastrear la variante original de Qwen3.5 utilizada.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado.
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), lo que permite tareas de descripción de imágenes, VQA y razonamiento visual básico.
- Compatibilidad con `text-generation-inference` y `transformers`, lo que facilita su despliegue en endpoints compatibles.
- Soporte de cuantización mediante el ecosistema transformers/Unsloth (no se especifican formatos publicados).
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, thinking mode ni audio.
- Capacidades multilingües limitadas al inglés declarado.

## Casos de uso

- Descripción automática de imágenes en inglés: el modelo puede recibir una imagen y generar una descripción textual, útil para catalogación de contenido o accesibilidad, aunque sin benchmarks que garanticen calidad.
- Respuesta a preguntas visuales (VQA) en prototipos: adecuado para experimentación en investigación, no para producción sin evaluación previa.
- Generación de texto conversacional en inglés: puede emplearse como chatbot de dominio general en entornos de prueba, dado su pipeline de text-generation.
- Fine-tuning adicional con Unsloth: al haberse entrenado con esta herramienta, sirve como punto de partida para ajustes posteriores de bajo coste en una sola GPU o pocas GPUs.
- Investigación sobre arquitecturas MoE multimodales: útil para estudiar el comportamiento de un MoE de ~36B en tareas imagen-texto.
- Evaluación comparativa de finetunes: puede usarse como caso de estudio de cómo un finetune comunitario se comporta frente a la base original de Qwen3.5.
- Despliegue en TGI para pruebas internas: la compatibilidad declarada con text-generation-inference permite montar un endpoint de pruebas rápidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 72 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: ~36 GB; en 4 bits: ~18-20 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas para BF16: A100 80GB, H100 80GB, o múltiples GPUs con tensor parallelism.
- GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantización de 4 bits agresiva y contexto reducido; no cabe en BF16.
- Opciones de despliegue: transformers, text-generation-inference (declarado), y potencialmente llama.cpp/Ollama si se generan GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-FACEBOOK-E2-BF16 | 35,95B (MoE) | no disponible | Apache 2.0 | Sí (imagen-texto) | Hugging Face, 0 descargas |
| Qwen2.5-VL-32B (referencia de la familia) | ~32B | no disponible en esta ficha | Apache 2.0 | Sí | Ampliamente disponible |
| Qwen3 MoE base (variante oficial) | no disponible | no disponible | Apache 2.0 | Según variante | Hugging Face oficial |

La comparación con modelos oficiales de Qwen es orientativa: no se dispone de datos de rendimiento del finetune que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia de calidad frente a la base original ni frente a alternativas.
- Riesgo de alucinación no evaluado; al ser un finetune comunitario sin documentación, el comportamiento puede degradarse respecto a la base.
- Idiomas: solo se declara inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto y parámetros activos desconocidos: dificulta el dimensionamiento de infraestructura y la planificación de costes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el usuario.
- Modelo base declarado como el propio repositorio, lo que impide verificar la procedencia exacta de los pesos originales.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El tag `unsloth` sugiere entrenamiento con herramientas de bajo coste; no se especifica si se congelaron capas o se usó LoRA, lo que afecta a la fidelidad del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-35B-FACEBOOK-E2-BF16
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
