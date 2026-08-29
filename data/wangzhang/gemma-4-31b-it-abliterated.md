# wangzhang/gemma-4-31B-it-abliterated

## Resumen

El modelo `wangzhang/gemma-4-31B-it-abliterated` es una versión modificada del modelo oficial `google/gemma-4-31B-it`, desarrollada por Wangzhang Wu mediante la técnica de edición directa de pesos denominada Abliterix. El objetivo principal es eliminar o reducir drásticamente los comportamientos de rechazo del modelo original, manteniendo en lo posible sus capacidades generales de generación de texto y razonamiento. Se trata de un modelo de 31.273 millones de parámetros, basado en la arquitectura Gemma 4, que incorpora doble normalización (4x RMSNorm por capa) y embeddings por capa (PLE), lo que dificulta las técnicas habituales de ajuste fino o intervención por hooks.

La relevancia de este modelo radica en que aborda un problema conocido en la comunidad de IA generativa: la excesiva cautela de los modelos instructivos, que a menudo rechazan peticiones legítimas o producen respuestas evasivas. La versión abliterada reduce la tasa de rechazo de 99/100 a 7/100 en una evaluación privada de 100 prompts, manteniendo un comportamiento seguro en pruebas de sobre-rechazo clásico (0/15). El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y está disponible en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, doble normalización, embeddings por capa) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (se heredan los del modelo base, sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un modelo instructivo multimodal (texto e imagen) de la familia Gemma 4. La arquitectura base emplea una doble normalización por capa (cuatro RMSNorm por capa) y embeddings por capa (PLE), lo que hace que las técnicas convencionales de LoRA o intervención por hooks sean poco fiables. Para la abliteración se utilizó **edición directa de pesos** mediante proyección ortogonal que preserva la norma, aplicada a las proyecciones Q/K/V/O de la atención. Se deshabilitó la proyección down de las capas MLP para mejorar la estabilidad, y se trabajó en precisión float32 para evitar pérdida de señal en productos internos de alta dimensión. Los vectores de dirección se generaron con Winsorización al percentil 99.5 para reducir la influencia de activaciones atípicas, y se exploró un rango de fuerza de intervención entre 1.0 y 6.0.

El proceso de optimización se realizó con evaluación en vLLM durante el entrenamiento, completando 60 ensayos y seleccionando el ensayo 40 como mejor configuración. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre el proceso de alineación (RLHF/DPO) del mismo. La abliteración no implica entrenamiento adicional sobre datos, sino una modificación directa de los pesos del modelo base.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo base Gemma 4 31B IT, incluyendo comprensión de instrucciones complejas y generación de respuestas coherentes.
- Multimodalidad: el modelo base soporta entrada de imágenes (el código de ejemplo usa `AutoModelForImageTextToText`), por lo que esta versión hereda dicha capacidad, aunque no se ha verificado explícitamente en la documentación.
- Reducción de rechazos: principal característica diferencial; el modelo responde a peticiones que el modelo original rechazaría, con una tasa de rechazo del 7% frente al 99% del original en la evaluación del autor.
- Mantenimiento de seguridad en prompts clásicos: en una prueba de 15 prompts de sobre-rechazo seguro, el modelo no mostró ningún rechazo, lo que sugiere que no se ha vuelto excesivamente permisivo en contextos de seguridad básica.
- Compatibilidad con vLLM: el proceso de optimización se realizó con vLLM, lo que indica que el modelo es compatible con este motor de inferencia.
- Integración con Transformers: se puede cargar con la API estándar de Hugging Face, tanto para generación de texto como para tareas de imagen a texto.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar los efectos de la abliteración en el comportamiento de rechazo, sirviendo como banco de pruebas para evaluar metodologías de evaluación de refusals y métricas de seguridad.
- Generación creativa sin restricciones: escritores y creadores de contenido pueden utilizarlo para explorar temas sensibles o controvertidos sin que el modelo se niegue a responder, siempre que se respeten los términos de uso y la responsabilidad ética.
- Desarrollo de asistentes conversacionales con menor censura: empresas que necesitan asistentes que aborden temas delicados (por ejemplo, salud mental, sexualidad, política) pueden desplegar este modelo como base, reduciendo la frustración de los usuarios por respuestas evasivas.
- Evaluación comparativa de modelos abliterados: la comunidad de desarrolladores puede usar este modelo como referencia para comparar técnicas de edición de pesos, gracias a la documentación detallada del proceso y los datos de evaluación incluidos.
- Prototipado de aplicaciones de generación de texto con control de comportamiento: al ser una versión modificada de un modelo conocido, permite probar rápidamente cómo cambia el comportamiento del modelo base al eliminar los rechazos, útil para ajustar políticas de contenido en productos.
- Análisis de sesgos y alineación: investigadores pueden estudiar cómo la abliteración afecta a otros aspectos del comportamiento del modelo, como la veracidad, la toxicidad o la coherencia, comparando con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente métricas de evaluación de rechazos, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (100 prompts, evaluacion privada) | 7/100 |
| Tasa de rechazo del modelo base (misma evaluacion) | 99/100 |
| Prueba de sobre-rechazo clasico (15 prompts) | 0/15 rechazos |
| Ensayos de optimizacion completados | 60/60 |
| Ensayo seleccionado | 40 |
| Juez utilizado | Google Gemini 3 Flash Preview |
| Longitud de generacion para evaluacion | 100-150 tokens nuevos |

El autor advierte que muchas evaluaciones de modelos abliterados usan generaciones cortas (30-50 tokens) y subestiman los rechazos, ya que Gemma 4 muestra un patrón de rechazo retardado. Esta evaluación usa al menos 100 tokens y un juez LLM para casos ambiguos, lo que la hace más estricta.

## Requisitos de hardware

- VRAM estimada: según LLM Explorer, el modelo requiere aproximadamente 62.5 GB de VRAM en precisión bf16 (tamaño del modelo ~62.5 GB). Esto supera la capacidad de GPUs de consumo típicas (RTX 4090 con 24 GB, RTX 3090 con 24 GB).
- GPUs recomendadas: para inferencia en bf16 se necesitan GPUs de datacenter como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, aunque podría no caber en una sola). Para despliegues con cuantización (si se publicaran), se podría reducir el requisito, pero no hay cuantizaciones oficiales disponibles.
- Opciones de despliegue: el modelo es compatible con vLLM (usado durante la optimización) y con Transformers de Hugging Face. También podría ejecutarse con llama.cpp si se generaran pesos GGUF, pero no se han publicado.
- Latencia y throughput: no se dispone de datos medidos. En vLLM, un modelo de 31B en bf16 en una A100 puede alcanzar decenas de tokens por segundo, pero depende de la configuración exacta.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos abliterados de la misma familia en la información proporcionada. A continuación se compara con el modelo base y con una alternativa genérica de la misma categoría (modelo abliterado de tamaño similar), basándose en datos públicos generales:

| Modelo | Parametros | Contexto | Licencia | Tasa de rechazo (evaluacion del autor) |
|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 31.27B | no disponible | Apache 2.0 | 99/100 |
| wangzhang/gemma-4-31B-it-abliterated | 31.27B | no disponible | Apache 2.0 | 7/100 |
| Otros abliterados de la familia Gemma (p. ej., gemma-4-9B-it-abliterated) | 9B | no disponible | Apache 2.0 | no disponible |

La comparativa se limita a la tasa de rechazo, ya que no hay datos de rendimiento general. El modelo abliterado mantiene el mismo tamaño y licencia que el base, pero con un comportamiento de rechazo drásticamente reducido.

## Limitaciones y advertencias

- Riesgo de seguridad: la abliteración reduce las salvaguardas del modelo, lo que puede llevar a respuestas inapropiadas, dañinas o ilegales si se usa sin supervisión. El propio autor lo declara como "para fines de investigación únicamente".
- Sesgos y alucinaciones: no se han evaluado los sesgos del modelo tras la modificación. Es probable que herede los sesgos del modelo base, y la abliteración podría alterar otros comportamientos no medidos.
- Evaluación limitada: los benchmarks de rechazo se basan en un conjunto privado de 100 prompts y un juez LLM; no hay métricas de calidad general (MMLU, etc.) que confirmen que las capacidades del modelo base se mantienen intactas.
- Patrón de rechazo retardado: aunque la tasa de rechazo es baja, el modelo puede mostrar respuestas que comienzan de forma útil y luego derivan en rechazo, lo que requiere evaluaciones con generaciones largas para detectarlo.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base de Google tiene términos de uso aceptables que pueden imponer restricciones adicionales sobre el uso comercial o la redistribución. Se recomienda revisar la política de Google para Gemma.
- Compatibilidad de cuantización: no se han publicado versiones cuantizadas, lo que limita el despliegue en hardware de consumo.
- Reproducibilidad: el autor no registró la revisión exacta del modelo base utilizado, lo que puede dificultar la reproducción del proceso de abliteración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
- Colección de modelos abliterados de wangzhang: https://huggingface.co/collections/wangzhang/gemma-abliterated
- Repositorio de Abliterix (herramienta utilizada): https://github.com/wuwangzhang1216/abliterix
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Página en LLM Explorer: https://llm-explorer.com/model/wangzhang%2Fgemma-4-31B-it-abliterated,3V0sNEMwBRpjdUQ9cD42EV
- Página en Inferix: https://inferix.co/models/wangzhang/gemma-4-31B-it-abliterated
- README en GitHub (copia): https://github.com/Damacol/wangzhang-gemma-4-31b-it-abliterated/blob/main/README.md
