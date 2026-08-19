# Umranz/Qwen3.8-27B-heretic-v2

## Resumen

Umranz/Qwen3.8-27B-heretic-v2 es una versión "decensored" (abliterada) del modelo Qwen3.8-27B, desarrollada por Umranz mediante la herramienta Heretic v1.4.0. El modelo base, Qwen3.8-27B, es un modelo de lenguaje causal con encoder de visión de 27 000 millones de parámetros, creado por Alibaba Cloud, que integra comprensión de imágenes y vídeo, razonamiento flexible y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Esta variante heretic-v2 aplica una segunda ronda de abliteración sobre la versión heretic original, reduciendo aún más las restricciones de contenido del modelo base.

La relevancia de este modelo radica en su carácter reproducible y en la posibilidad de eliminar los mecanismos de rechazo de contenido del modelo original, lo que lo hace útil para investigación en seguridad de IA, análisis de sesgos y aplicaciones que requieren generación de texto sin filtros. Sin embargo, esta característica conlleva riesgos importantes de uso indebido, que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 356 728 560 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible en el repositorio oficial; se han publicado GGUF y NVFP4 por terceros (Unsloth) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 54,8 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un patrón de 16 bloques repetidos: cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Gated Attention, todos con capas FFN intercaladas. La dimensión oculta es de 5120, con 64 capas y un embedding de 248 320 tokens (padded). El modelo fue preentrenado y post-entrenado con múltiples pasos de Multi-Token Prediction (MTP), y soporta modos de pensamiento controlables mediante `reasoning_effort` y `preserve_thinking`.

La versión heretic-v2 se obtiene mediante abliteración, una técnica que modifica los pesos del modelo para eliminar las direcciones en el espacio de activaciones asociadas con el rechazo de contenido. El proceso, realizado con Heretic v1.4.0, es reproducible: el repositorio incluye un directorio `reproduce/` con las instrucciones y parámetros exactos. Los parámetros de abliteración reportados incluyen `direction_index` (44,64 para la segunda ronda) y valores de peso máximo/mínimo para las proyecciones `attn.o_proj` y `mlp.down_proj`. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de post-entrenamiento específico de esta variante.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activable o desactivable por petición.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento matemático y de código, heredado del modelo base Qwen3.8-27B.
- Capacidad de agente autónomo: planificación a largo plazo y manejo de feedback del entorno, según la documentación del modelo base.
- Generación de contenido sin restricciones de censura, gracias al proceso de abliteración (esta es la característica diferencial de esta variante).
- Reproducibilidad completa del proceso de abliteración, lo que permite verificar y replicar los resultados.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo la abliteración afecta a la distribución de salidas, comparando las respuestas con el modelo original mediante métricas como la divergencia KL (0,0101 frente al modelo base) y el índice de keywords (59/100 frente a 94/100).
- Análisis de sesgos y alineación: al eliminar los mecanismos de rechazo, se pueden identificar qué contenidos estaban siendo filtrados y cómo, lo que ayuda a diseñar mejores sistemas de moderación.
- Generación creativa sin restricciones: escritura de ficción, guiones o diálogos que el modelo base rechazaría por políticas de contenido, siempre que el uso sea legal y ético.
- Evaluación de robustez de modelos: probar la resistencia de los sistemas de seguridad de Qwen3.8-27B ante intentos de jailbreak, comparando el comportamiento del modelo original y el abliterado.
- Desarrollo de aplicaciones de chat especializadas: asistentes conversacionales para dominios donde se requiere un tono directo y sin filtros (por ejemplo, simulación de personajes o entrenamiento de habilidades comunicativas).
- Benchmarking de técnicas de desalineación: el modelo sirve como referencia para comparar la eficacia de diferentes métodos de abliteración (Heretic v1.4.0 en este caso) sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante. La model card únicamente reporta métricas específicas del proceso de abliteración, comparando esta versión con el modelo heretic original y con el modelo base Qwen3.8-27B:

| Metrica | Este modelo (heretic-v2) | Umranz/Qwen3.8-27B-heretic | Qwen/Qwen3.8-27B |
| :--- | :---: | :---: | :---: |
| Keywords (puntuacion de rechazo) | 54/100 | 60/100 | 94/100 |
| Divergencia KL | 0,0004 | 0 (por definicion) | 0,0101 |

La puntuación de keywords indica la frecuencia con la que el modelo produce respuestas de rechazo ante solicitudes de contenido sensible: cuanto más baja, menos rechazos. La divergencia KL mide la diferencia en la distribución de salidas respecto al modelo de referencia. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: según Unsloth, el modelo puede ejecutarse localmente con 17 GB de RAM/VRAM combinados, lo que sugiere que con cuantización (por ejemplo, GGUF Q4) cabe en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 4080 (16 GB) con cuantización más agresiva.
- GPU recomendadas: para inferencia sin cuantizar se necesitan al menos 54,8 GB de VRAM (pesos en FP16), por lo que se requieren GPUs profesionales como A100 (80 GB) o H100 (80 GB). Con cuantización a 4 bits, una RTX 4090 es suficiente.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, TokenSpeed, LM Studio, Unsloth (GGUF y NVFP4) y Lemonade (soporte AMD). También está disponible como endpoint gestionado en FriendliAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Abliterado | Licencia | Disponibilidad |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| Umranz/Qwen3.8-27B-heretic-v2 | 27B | 262K | Si | Si (doble ronda) | Apache 2.0 | Hugging Face |
| Umranz/Qwen3.8-27B-heretic | 27B | 262K | Si | Si (una ronda) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27B | 262K | Si | No | Apache 2.0 | Hugging Face, Qwen Cloud |

La diferencia principal entre las tres versiones es el grado de abliteración: la versión heretic-v2 presenta una puntuación de keywords de 54/100, frente a 60/100 de la heretic original y 94/100 del modelo base. Esto indica que la segunda ronda de abliteración reduce aún más los rechazos de contenido, aunque con una divergencia KL ligeramente mayor respecto al modelo base (0,0101 frente a 0,0004 de la heretic original). No se dispone de comparativas con otros modelos decensored de la misma categoría.

## Limitaciones y advertencias

- Riesgo de contenido dañino o ilegal: al eliminar los mecanismos de rechazo, el modelo puede generar texto que incite a la violencia, al odio o a actividades ilegales. Su uso en producción debe estar restringido a entornos controlados y con supervisión humana.
- Sesgos del modelo base: la abliteración no elimina los sesgos presentes en los datos de entrenamiento de Qwen3.8-27B; de hecho, puede amplificarlos al eliminar los filtros que los mitigaban parcialmente.
- Alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados. No se ha evaluado su fiabilidad factual tras la abliteración.
- Limitaciones de idioma: no se ha publicado información sobre los idiomas soportados; se recomienda verificar el comportamiento en el idioma objetivo antes de su uso.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el contenido generado por el modelo puede violar leyes de difamación, propiedad intelectual o protección de menores. El responsable del despliegue asume toda la responsabilidad legal.
- Sin garantías de calidad: al ser un modelo modificado mediante abliteración, no se han realizado evaluaciones exhaustivas de su rendimiento en tareas estándar. Los resultados pueden degradarse respecto al modelo base en tareas que requieren seguir instrucciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Umranz/Qwen3.8-27B-heretic-v2
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión heretic original: https://huggingface.co/Umranz/Qwen3.8-27B-heretic
- Proyecto Heretic: https://heretic-project.org
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre soporte de Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Análisis de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Endpoint de FriendliAI: https://friendli.ai/models/Umranz/Qwen3.8-27B-heretic
