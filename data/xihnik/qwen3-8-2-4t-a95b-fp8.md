# Xihnik/Qwen3.8-2.4T-A95B-FP8

## Resumen

Qwen3.8-2.4T-A95B-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-2.4T-A95B, un modelo de lenguaje causal de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Con 2,4 billones de parámetros totales y 95.000 millones activados por token, se posiciona como el primer modelo de la clase Qwen-Max liberado en abierto, según la model card. Esta variante FP8 la publica el usuario Xihnik en Hugging Face y mantiene la arquitectura y configuración del modelo base, con pesos cuantizados de forma fina en bloques de 128.

El modelo resuelve tareas de generación de texto, razonamiento complejo, código, trabajo profesional e investigación, con un énfasis explícito en tareas agénticas de largo horizonte. Su arquitectura híbrida combina capas de atención lineal (Gated DeltaNet) y atención con compuerta (Gated Attention), intercaladas con capas MoE de 512 expertos. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la gama de modelos de contexto muy largo.

La relevancia de esta ficha radica en que se trata de una cuantización FP8 de un modelo de escala extrema (2,4T), pensada para despliegue en infraestructura de servidor con vLLM, SGLang o TokenSpeed. La model card indica que el rendimiento de la versión FP8 es prácticamente idéntico al del modelo original, lo que la hace atractiva para reducir requisitos de memoria sin sacrificar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.446.182.725.504 (2,4T) |
| Parametros activos | 95B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.010.000 tokens |
| Tipos de cuantizacion | FP8 (cuantización fina por bloques de 128) |
| Idiomas soportados | no disponible |
| Licencia | other (qwen3.8-max) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con un layout híbrido de 92 capas organizadas en 23 bloques de la forma 3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE). La dimensión oculta es de 8192 y el embedding de tokens de 248.320 (con padding). Las capas de Gated DeltaNet emplean 128 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 64 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64.

La capa MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido por token, con dimensión intermedia de experto de 2048. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa. Según la model card, el modelo ha pasado por preentrenamiento y postentrenamiento, e incluye control flexible del razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras declaradas en coding, trabajo profesional, investigación y tareas agénticas de largo horizonte.
- Ejecución agéntica autónoma: planificación más robusta y mejor manejo de la retroalimentación del entorno para completar tareas de extremo a extremo.
- Control flexible del razonamiento mediante el parámetro `reasoning_effort`, que permite ajustar la profundidad del razonamiento.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Soporte de decodificación especulativa gracias al entrenamiento con Multi-Token Prediction (MTP).
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la model card menciona herramientas integradas oficiales en la versión Qwen3.8-Max (no en este checkpoint abierto).

## Casos de uso

- Desarrollo de software asistido y agentes de código: el modelo puede operar en entornos de terminal y pipelines de CI/CD, con resultados declarados de 86,6 en Terminal Bench 2.1 y 69,2 en SWE-bench Pro (según la tabla de la model card), lo que lo hace adecuado para tareas de reparación de bugs y generación de parches.
- Automatización de tareas profesionales de largo horizonte: su capacidad de planificación autónoma y manejo de retroalimentación del entorno permite encadenar pasos multi-etapa con mayor fiabilidad.
- Análisis de documentación extensa: con 262.144 tokens de contexto nativo (y hasta 1M extensible), puede procesar informes, contratos o bases de código completas en una sola pasada.
- Investigación asistida: razonamiento profundo ajustable mediante `reasoning_effort` para tareas de síntesis y análisis de literatura científica.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo y retención del razonamiento histórico mediante `preserve_thinking`.
- Despliegue en infraestructura de servidor con vLLM, SGLang o TokenSpeed: la cuantización FP8 reduce la huella de memoria frente al modelo original manteniendo, según el autor, métricas de rendimiento casi idénticas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de Qwen3.8-Max frente a Opus 4.8, Fable 5, GPT 5.6 Sol (max) y Qwen3.7-Max. Los datos disponibles en la información proporcionada son parciales (la tabla aparece truncada). Se recogen los valores visibles:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | no disponible | no disponible | no disponible |

Nota: la tabla de la model card está truncada en la información disponible; no se han podido extraer el resto de filas ni los valores de SWE-bench Pro para GPT 5.6 Sol, Qwen3.7-Max y Qwen3.8-Max. Los datos corresponden a Qwen3.8-Max, la versión oficial de servicio basada en Qwen3.8-2.4T-A95B, no necesariamente a este checkpoint FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,4T de parámetros en FP8, el peso del modelo ronda los 2,4 TB, por lo que requiere un clúster multi-GPU de alta gama. No cabe en ninguna GPU de consumo.
- GPU recomendadas: nodos con múltiples H100 (80 GB) o A100 (80 GB); el número exacto de GPUs no está disponible en la información proporcionada.
- GPU de consumo: no es viable; el tamaño del repositorio es de 2496,1 GB.
- Opciones de despliegue: vLLM, SGLang y TokenSpeed, según la model card; también es compatible con Transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-2.4T-A95B-FP8 | 2,4T totales / 95B activos | 262.144 nativos; hasta 1.010.000 | other (qwen3.8-max) | Hugging Face (Xihnik) |
| Qwen3.7-Max | no disponible | no disponible | no disponible | Servicio oficial Qwen |
| Opus 4.8 | no disponible | no disponible | no disponible | Comercial |
| GPT 5.6 Sol (max) | no disponible | no disponible | no disponible | Comercial |

No se dispone de datos suficientes para una comparativa técnica completa de parámetros, contexto y licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" con nombre `qwen3.8-max`: es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones exactas de uso comercial.
- Repositorio publicado por un tercero (Xihnik), no por el equipo oficial de Qwen; conviene verificar la integridad de los pesos antes de usarlos en producción.
- La tabla de benchmarks de la model card está truncada y corresponde a Qwen3.8-Max, no necesariamente a este checkpoint FP8.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Requisitos de hardware extremos (clúster multi-GPU), lo que limita su uso a organizaciones con infraestructura dedicada.
- La cuantización FP8, aunque el autor la describe como de rendimiento casi idéntico al original, puede introducir degradaciones en tareas de precisión numérica; no se aportan métricas comparativas específicas.

## Enlaces

- Hugging Face: https://huggingface.co/Xihnik/Qwen3.8-2.4T-A95B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Blog Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Qwen Studio: https://chat.qwen.ai/?models=qwen3.8-max
- Qwen Cloud: https://www.qwencloud.com
- Qwen3.8-Max Overview: https://www.qwencloud.com/models/qwen3.8-max
