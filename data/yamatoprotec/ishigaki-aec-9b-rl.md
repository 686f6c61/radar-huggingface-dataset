# YAMATOPROTEC/Ishigaki-AEC-9B-RL

## Resumen

Ishigaki-AEC-9B-RL es un ajuste fino del modelo ONESTRUCTION/Ishigaki-AEC-9B, que a su vez deriva de Qwen3.5-9B mediante SFT con LoRA. Lo desarrolla YAMATOPROTEC (ヤマトプロテック株式会社, departamento de sistemas de información) y no es un lanzamiento oficial de ONESTRUCTION. El modelo parte de un checkpoint ya entrenado con SFT y le añade una fase de aprendizaje por refuerzo con GRPO (168 pasos, actualización de todos los parámetros, NeMo RL v0.8.0) orientada a una tarea muy concreta: responder preguntas de tipo test sobre especificaciones técnicas de construcción japonesas citando literalmente fragmentos del texto fuente recuperado.

El problema que aborda es el de la citación verificable en un contexto RAG (retrieval-augmented generation). El modelo recibe cinco opciones de respuesta (A-E, donde E significa "la especificación no lo determina") junto con los tres mejores fragmentos recuperados mediante BM25, y debe elegir una opción y extraer una cita textual que la respalde. La recompensa se calcula íntegramente con reglas mecánicas (existencia literal de la cita en el fragmento, cobertura del fundamento, penalización de citas inventadas o genéricas), sin usar un LLM como evaluador.

La relevancia del modelo es doble: por un lado, demuestra una mejora sustancial y reproducible en la calidad de las citas (del 39,1% al 53,2-53,6% de citas que respaldan la respuesta según auditoría con LLM); por otro, documenta con honestidad que la mejora en tasa de acierto no se reprodujo al cambiar la semilla (89,1-93,9% frente al 89,6% previo) y que la capacidad de abstenerse se degradó severamente. El modelo tiene 9.409.813.744 parámetros y un repositorio de 37,7 GB en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`), multimodal imagen-texto según tags; no se detalla la configuración interna |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY 4.0 (heredada del modelo base), con Apache 2.0 aplicable por el Qwen3.5-9B subyacente |
| Formato de pesos | safetensors |
| Pipeline | text-generation (tags incluyen image-text-to-text) |
| Modelo base | ONESTRUCTION/Ishigaki-AEC-9B (finetune) |
| Método de ajuste | GRPO, actualización completa de parámetros, NeMo RL v0.8.0, 168 pasos |
| Revisiones publicadas | `main` (seed 20261110) y `seed2` (seed 20261111) |
| Tamaño del repositorio | 37,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B a través del SFT de ONESTRUCTION. Sobre ese checkpoint ya ajustado se aplica una segunda fase de aprendizaje por refuerzo con GRPO, no desde el modelo base original. El entrenamiento usa actualización de todos los parámetros durante 168 pasos con NeMo RL v0.8.0. La tarea de entrenamiento consiste en preguntas de cinco opciones acompañadas de los tres fragmentos más relevantes recuperados con BM25; el modelo debe seleccionar la opción correcta y citar literalmente el pasaje que la respalda.

La innovación técnica principal reside en el diseño del sistema de recompensas (versión v2), completamente basado en reglas: se puntúa si la respuesta es correcta, si la cita existe literalmente en los fragmentos proporcionados, y qué proporción del fundamento de la respuesta cubre la cita (sumando varias citas). Se penalizan las citas inventadas y las citas genéricas. El autor documenta que una recompensa más simple (solo verificar existencia de la cita) permitía reward hacking mediante citas cortas y genéricas que no respaldaban la respuesta, motivo por el que se adoptó la métrica de cobertura del fundamento. Los datos de entrenamiento son 836 preguntas generadas automáticamente a partir de la "Especificación estándar de obras públicas de construcción (edición de obra arquitectónica), edición Reiwa 7" del Ministerio de Tierra, Infraestructura, Transporte y Turismo de Japón. Los conjuntos de desarrollo (244) y test (412) se generaron con el mismo método a partir de secciones distintas, sin solapamiento entre particiones. Las preguntas fueron generadas por un LLM y no han sido verificadas manualmente.

## Capacidades

- Generación de texto conversacional en japonés con formato de chat (requiere `enable_thinking=False` en la plantilla de chat, igual que el modelo base).
- Respuesta a preguntas de opción múltiple sobre especificaciones técnicas de construcción, con selección de la opción correcta entre cinco.
- Citación literal y verificable: extrae fragmentos textuales de los pasajes recuperados que respaldan la respuesta.
- Manejo de la opción de abstención ("la especificación no lo determina"), aunque con capacidad degradada tras el RL.
- Integración en pipelines RAG con recuperación BM25 (entrenado específicamente con los tres mejores fragmentos).
- Capacidad multimodal imagen-texto declarada en los tags del repositorio (herencia de Qwen3.5), aunque no se detalla su uso en la model card.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistencia a técnicos de obra en consulta de especificaciones: el modelo responde preguntas sobre la especificación estándar de obra arquitectónica citando el pasaje exacto, lo que permite al técnico verificar la fuente antes de aplicar la indicación en obra.
- Auditoría documental con trazabilidad: al exigir citas literales extraídas de los fragmentos recuperados, cada respuesta puede validarse automáticamente comprobando que la cita existe en el texto fuente, lo que facilita la revisión por parte de un revisor humano.
- Control de calidad en la redacción de pliegos: el modelo puede señalar qué apartado de la especificación respalda una cláusula concreta, ayudando a detectar referencias incorrectas o desactualizadas antes de la publicación del pliego.
- Formación interna: como herramienta de consulta para personal junior que necesita localizar rápidamente el fundamento normativo de una práctica constructiva, siempre con la cita visible para contrastar.
- Verificación de cumplimiento en inspecciones: dado un fragmento de la especificación recuperado, el modelo identifica si una práctica descrita cumple o no lo estipulado, citando el pasaje aplicable.
- Integración en asistentes RAG corporativos del sector construcción: el modelo está diseñado para funcionar dentro de un arnés que recupera fragmentos y verifica la existencia de las citas, por lo que encaja como componente generador en un sistema de consulta documental interno con validación posterior.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 412 preguntas, en condiciones de arnés (recuperación BM25 de tres fragmentos) y temperatura 0. La columna "cita que respalda" procede de una auditoría con otro LLM (Claude Sonnet 5.5) no usado en entrenamiento ni recompensa.

| Métrica | Antes del RL (Ishigaki-AEC-9B) | `main` (seed1) | `seed2` |
|---|---|---|---|
| Cita que respalda la respuesta (auditoría LLM) | 39,1% | 53,6% | 53,2% |
| Respuesta correcta y cita presente en el fragmento | 71,4% | 92,5% | 87,1% |
| Tasa de acierto | 89,6% | 93,9% | 89,1% |
| Tasa de acierto solo con memoria (sin recuperación) | 76,7% | 77,2% | 76,0% |

Observaciones del autor: la mejora en calidad de cita se reprodujo en ambas semillas; la mejora en tasa de acierto no se reprodujo (seed2 no es estadísticamente distinguible del modelo previo), por lo que debe leerse como un rango de 89,1-93,9%. La tasa de acierto sin recuperación no aumentó, lo que indica que el RL cambió el comportamiento dentro del arnés y no añadió conocimiento. Las citas inventadas cuando el fundamento estaba presente en el fragmento pasaron del 15% a aproximadamente el 1%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24-32 GB.
- Cuantización a 8 bits: aproximadamente 10 GB de pesos; cuantización a 4 bits: aproximadamente 5-6 GB de pesos. Los tipos de cuantización concretos publicados no están disponibles; habría que generarlos a partir de los safetensors.
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio en producción con contexto largo y concurrencia; L40S o RTX 6000 Ada para despliegue de una sola instancia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con margen ajustado, y con holgura en cuantización de 8 o 4 bits; en GPUs de 16 GB solo en cuantización de 4 bits.
- Opciones de despliegue: compatible con Transformers (`Qwen3_5ForConditionalGeneration`), y por tanto con vLLM y TGI; llama.cpp y Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishigaki-AEC-9B-RL | 9,41 B | No disponible | RAG con citación verificable sobre especificaciones de construcción (japonés) | CC BY 4.0 + Apache 2.0 | Hugging Face, revisiones `main` y `seed2` |
| ONESTRUCTION/Ishigaki-AEC-9B | No disponible | No disponible | SFT sobre Qwen3.5-9B para dominio de construcción (japonés) | CC BY 4.0 | Hugging Face |
| Qwen/Qwen3.5-9B | ~9 B | No disponible | Modelo generalista multilingüe con capacidades multimodales | Apache 2.0 | Hugging Face |

El modelo se posiciona como un ajuste especializado de nicho: frente a Qwen3.5-9B, gana en calidad de citación dentro de su arnés pero pierde generalidad y capacidad de abstención; frente a su modelo base, mejora la verificabilidad de las citas pero no la tasa de acierto de forma reproducible. No se dispone de comparaciones con otros modelos especializados en construcción en la información proporcionada.

## Limitaciones y advertencias

- La capacidad de abstención se degradó: en las 50 preguntas sin fundamento en los fragmentos recuperados, la respuesta "no lo determina" cayó del 32% antes del RL al 2-4% después, con tendencia a responder de memoria. En construcción, responder con confianza cuando la especificación no lo determina es un riesgo operativo.
- La mejora en tasa de acierto no se reprodujo al cambiar la semilla; solo debe considerarse el rango 89,1-93,9% y no el valor máximo.
- El modelo está diseñado para usarse exclusivamente dentro de un arnés que recupera fragmentos y verifica la existencia literal de las citas; su uso sin recuperación no está previsto y no se ha validado.
- La generalización no está verificada: no se ha evaluado con otros métodos de recuperación, otro número de fragmentos, otras instrucciones, resultados de búsqueda con ruido, ni otras especificaciones (instalaciones eléctricas, mecánicas, obra civil).
- Las preguntas de evaluación fueron generadas automáticamente a partir de la misma especificación y no han sido revisadas manualmente; la auditoría se hizo solo con LLM. No deben interpretarse como un benchmark externo independiente.
- El checkpoint no incluye los pesos de la cabeza MTP (multi-token prediction).
- Es necesario especificar `enable_thinking=False` al aplicar la plantilla de chat.
- Las respuestas y citas deben contrastarse con la edición de la especificación aplicable al proyecto concreto.
- Licencia CC BY 4.0: permite uso comercial con atribución; adicionalmente aplica Apache 2.0 del Qwen3.5-9B subyacente. Deben respetarse las condiciones de atribución de ambos modelos y las condiciones de uso de los datos de origen (materiales públicos del Ministerio de Tierra, Infraestructura, Transporte y Turismo, bajo la política PDL1.0).
- Riesgo de alucinación en las citas mitigado pero no eliminado (aproximadamente 1% de citas inventadas cuando el fundamento está presente); sin el arnés de verificación el riesgo aumenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YAMATOPROTEC/Ishigaki-AEC-9B-RL
- Dataset del arnés, datos de recuperación y conjuntos de preguntas: https://huggingface.co/datasets/YAMATOPROTEC/Ishigaki-AEC-9B-RL-harness
- Modelo base: https://huggingface.co/ONESTRUCTION/Ishigaki-AEC-9B
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio de NeMo RL (herramienta de entrenamiento citada): no disponible en la información proporcionada
