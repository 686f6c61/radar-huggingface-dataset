# VertexAGI/prism-caption-1-5-micro

## Resumen

Prism Caption 1.5 Micro es un modelo de propósito único desarrollado por VertexAGI que se encarga de una tarea muy concreta: convertir el primer mensaje de una conversación en un título corto y específico para el chat, similar al comportamiento de "nuevo chat" de ChatGPT o Claude. Es la segunda generación de la familia Prism Caption, sucesor de Prism Caption 1 Micro (que se basaba en Gemma-3-1B con solo 339 ejemplos de entrenamiento). Su relevancia actual reside en ofrecer una alternativa ligera y rápida para automatizar el titulado de conversaciones sin necesidad de invocar modelos de frontera, reduciendo costes y latencia en aplicaciones que gestionan muchos hilos de chat.

El modelo se construye mediante un adaptador LoRA sobre el modelo base Qwen3-0.6B, cuantizado a 4-bit en formato MLX y también disponible en GGUF. Con aproximadamente 93 millones de parámetros en el adaptador y un tamaño de archivo inferior a 400 MB, está pensado para ejecutarse localmente en dispositivos con recursos limitados, como Apple Silicon o CPUs convencionales. El proyecto forma parte de una familia más amplia de modelos "Prism" de propósito único, todos ellos publicados bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B) con adaptador LoRA fusionado |
| Parametros totales | 93.188.096 (adaptador LoRA); el modelo base Qwen3-0.6B tiene 0,6 B parámetros |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-0.6B, no especificada en la documentación) |
| Tipos de cuantizacion | MLX 4-bit, GGUF Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

Prism Caption 1.5 Micro parte del modelo base Qwen3-0.6B, sobre el que se aplica un adaptador LoRA de rango 8, escala 20 y 8 capas. El entrenamiento se realiza con el framework MLX sobre Apple Silicon, usando un optimizador Adam con una tasa de aprendizaje constante de 1e-5, un tamaño de lote de 4 y una longitud de secuencia de 256 tokens, durante 1.500 iteraciones. El dataset de entrenamiento consta de 1.000 ejemplos distribuidos en 167 temas y 20 plantillas de redacción, divididos en 900 ejemplos de entrenamiento y 100 de validación. La pérdida de validación final es de 0.209.

La generación de los títulos de entrenamiento se realizó mediante destilación a partir de modelos de mayor tamaño a través de NVIDIA NIM. La mayoría de los ejemplos (~957) se generaron con el modelo `nvidia/nemotron-3.5-lightning-30b-a3b`, mientras que aproximadamente 43 ejemplos provienen de `google/diffusiongemma-26b-a4b-it` (debido a límites de tasa de peticiones). El resultado es un corpus mixto con 714 títulos únicos sobre 1.000 ejemplos, lo que evita la memorización de plantillas y favorece la generalización a temas no vistos.

## Capacidades

- Generación de títulos de chat a partir del primer mensaje de una conversación, siguiendo una especificación de 3 a 6 palabras en formato de título (title case), sin puntuación final ni preámbulos.
- Salida de texto corto y directo, sin razonamiento intermedio (el modelo hereda el bloque de "thinking" de Qwen3, pero se desactiva en la inferencia).
- Funciona como un clasificador generativo: dado un mensaje de usuario, produce una etiqueta descriptiva, no un resumen extenso.
- Soporta el formato de chat de Qwen3 mediante la plantilla de chat correspondiente, tanto en MLX como en GGUF.
- Compatible con la inferencia local en dispositivos Apple Silicon (MLX) y en herramientas basadas en llama.cpp (Ollama, LM Studio).
- No soporta tool calling, agentes, visión ni otras modalidades; es un modelo puramente generativo de texto.

## Casos de uso

- Titulado automático de chats en aplicaciones de mensajería: el modelo puede asignar un nombre al nuevo chat en el momento en que el usuario escribe el primer mensaje, eliminando la necesidad de que el usuario lo haga manualmente. Su tamaño reducido permite ejecutarlo localmente en el cliente, sin enviar datos a un servidor.
- Asistentes virtuales y plataformas de soporte: al iniciar una conversación con un cliente, el sistema genera un título descriptivo que facilita la organización de tickets y su búsqueda posterior. La baja latencia del modelo es adecuada para integrarse en pipelines de atención al cliente en tiempo real.
- Clientes de correo y herramientas de productividad: cuando un usuario redacta un nuevo borrador o una nota, el modelo puede sugerir un asunto o título para el documento, mejorando la organización de carpetas y proyectos.
- CRM y gestión de relaciones con clientes: al registrar la primera interacción con un cliente, el modelo crea automáticamente un título que sirve como referencia para el seguimiento del caso, evitando la entrada manual de datos.
- Aplicaciones de chat interno en empresas: en plataformas como Slack o Teams, el modelo puede generar el nombre de los canales o hilos de discusión a partir del primer mensaje, facilitando la navegación en espacios de trabajo con muchos canales.
- Entornos de desarrollo y documentación: al iniciar un hilo de discusión técnica en herramientas de gestión de proyectos, el modelo puede producir un título claro y específico, como "Depuración de error de autenticación", que luego se indexa en bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La única evaluación disponible es la propia del autor, realizada sobre 24 temas retenidos que no aparecen en el conjunto de entrenamiento. Los resultados se presentan en forma de métricas de comportamiento:

| Métrica | Base Qwen3-0.6B | Prism Caption 1.5 Micro |
|---|---|---|
| Problemas de formato (preámbulo, puntuación, multilínea) | 10/24 | 0/24 |
| Cumplimiento de la especificación de 3-6 palabras | 14/24 | 23/24 |
| Comparte palabras de contenido con el mensaje | 24/24 | 21/24 |
| Longitud media del título | 5,8 palabras | 3,3 palabras |

La evaluación muestra una mejora sustancial en la fiabilidad del formato y la adherencia a la especificación, aunque con una tendencia a la sobre-compresión que puede eliminar el sustantivo clave en algunos casos (por ejemplo, "Shoulder Sleep Matters" en lugar de "Mattress for Side Sleepers").

## Requisitos de hardware

- Tamaño del modelo: 335 MB en formato MLX 4-bit y 378 MB en GGUF Q4_K_M.
- VRAM estimada para inferencia: inferior a 1 GB (estimación basada en el tamaño de los pesos, no en medidas empíricas publicadas).
- GPU recomendadas: funciona en Apple Silicon (M1, M2, M3 y superiores) gracias al formato MLX nativo; también puede ejecutarse en GPU NVIDIA con llama.cpp o vLLM, aunque no se han publicado datos específicos de rendimiento.
- Cabe en tarjetas consumer de gama baja, como NVIDIA GTX 1650, RTX 3050, o en la iGPU de chips Apple Silicon.
- Opciones de despliegue: `mlx-lm` en macOS, llama.cpp, Ollama y LM Studio para GGUF, y cualquier servidor compatible con la plantilla de chat de Qwen3.
- Latencia y throughput: no disponibles; al ser un modelo de 0.6B con generación limitada a ~20 tokens, se espera una inferencia muy rápida en hardware moderno, pero no hay datos publicados.

## Comparativa con modelos similares

La única comparación directa disponible es con su predecesor y con el modelo base sin ajuste:

| Modelo | Base | Parámetros | Contexto | Licencia | Rendimiento en titulado |
|---|---|---|---|---|---|
| Prism Caption 1.5 Micro | Qwen3-0.6B | 93 M (adaptador) | No disponible | Apache 2.0 | 0/24 problemas de formato, 23/24 en especificación |
| Prism Caption 1 Micro | Gemma-3-1B | 1B | No disponible | Apache 2.0 | Evaluado sobre temas del entrenamiento (memorización) |
| Qwen3-0.6B (base) | — | 0.6B | No disponible | Apache 2.0 | 10/24 problemas de formato, 14/24 en especificación |

No se dispone de datos de comparación con otros modelos de titulado de chat del mercado (por ejemplo, los usados por ChatGPT o Claude). La familia Prism Creative de VertexAGI (prism-creative-1-mini y prism-creative-1-5-mini) se centra en escritura creativa y no en titulado, por lo que no es comparable directamente.

## Limitaciones y advertencias

- Idioma: el modelo solo funciona en inglés; no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Sobre-compresión: tiende a generar títulos más cortos de lo especificado (media de 3,3 palabras frente a 3-6) y puede omitir el sustantivo principal del mensaje, lo que reduce la precisión en algunos casos.
- Solo primer mensaje: no está entrenado para renombrar conversaciones a partir de turnos posteriores o transcripciones completas, por lo que no es adecuado para re-titulado dinámico.
- No es un resumidor: produce etiquetas cortas, no descripciones o resúmenes del contenido de la conversación.
- Dependencia del modelo base: hereda las limitaciones generales de Qwen3-0.6B, incluyendo su fecha de corte de conocimiento y posibles sesgos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir títulos que no reflejen con exactitud el contenido del mensaje, especialmente con temas ambiguos o muy específicos.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo no incluye garantías de exactitud ni de cumplimiento normativo.

## Enlaces

- [Modelo en Hugging Face: VertexAGI/prism-caption-1-5-micro](https://huggingface.co/VertexAGI/prism-caption-1-5-micro)
- [Modelo base: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Familia Prism: VertexAGI/prism-creative-1-5-mini](https://huggingface.co/VertexAGI/prism-creative-1-5-mini)
- [Familia Prism: VertexAGI/prism-creative-1-mini](https://huggingface.co/VertexAGI/prism-creative-1-mini)
