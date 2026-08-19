# TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-9.4bit

## Resumen

El modelo TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-9.4bit es una conversión a formato MLX del modelo abliterado y "desensurado" Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS, creado por KridgeDookie a partir del Qwen3.8-27B original de Alibaba. La abliteración es una técnica que elimina las direcciones de rechazo del modelo, reduciendo su tendencia a negarse a responder a ciertas solicitudes. Esta versión concreta, publicada por TheCluster, aplica una cuantización mixta de 9.450 bits por peso (bpw) con grupo de tamaño 32, manteniendo algunos tensores en bf16, lo que la hace adecuada para ejecutarse en hardware de Apple Silicon mediante la librería MLX.

El modelo es multimodal (procesa imagen y texto), con capacidades de razonamiento, generación de código y automatización de tareas de oficina, según las características del Qwen3.8-27B original. La cuantización mixta reduce el tamaño del repositorio a 32,3 GB, lo que permite su uso en equipos con memoria unificada suficiente. Al ser una versión "uncensored", está pensada para casos de uso donde se requiere una respuesta sin filtros de seguridad, aunque esto implica riesgos adicionales de contenido inapropiado o sesgado.

La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en proyectos privados. Sin embargo, la falta de datos oficiales sobre benchmarks y el carácter experimental de la abliteración exigen una evaluación cuidadosa antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (imagen y texto) |
| Parametros totales | 27B (nominal) / 9.757.854.960 según safetensors (inconsistente) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: 8-bit affine con grupo de tamaño 32 (9.450 bpw) + tensores en bf16 |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un LLM multimodal denso desarrollado por Alibaba, que combina un codificador de visión con un transformer de lenguaje. La versión abliterada elimina ciertas direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, mediante técnicas como la sustracción de componentes principales (abliteration). El proceso exacto de entrenamiento de esta variante no está documentado en la información proporcionada.

La conversión a MLX se realizó con la librería mlx-vlm versión 0.6.13, aplicando una cuantización mixta por tensor: la mayoría de los tensores usan cuantización afín de 8 bits con grupo de tamaño 32, mientras que algunos tensores importantes se mantienen en bf16 para preservar precisión. El valor de `reasoning_effort` se establece por defecto en 'low' para evitar un exceso de razonamiento.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, permitiendo responder a preguntas sobre imágenes, describir contenido visual o combinar información de ambos canales.
- Generación de texto y razonamiento: puede producir respuestas coherentes en tareas de lenguaje natural, incluyendo razonamiento paso a paso en modo "thinking" si se configura adecuadamente.
- Generación de código: según las características del Qwen3.8-27B original, es competente en tareas de programación, completado de código y explicación de fragmentos.
- Soporte de agentes y flujos de trabajo: el modelo base está diseñado para tareas de automatización de oficina y flujos agénticos, aunque no se especifican detalles sobre tool calling en esta versión.
- Multilingüismo: soporta 26 idiomas, incluyendo español, inglés, chino, ruso, francés, alemán, etc.
- Modo "uncensored": la abliteración reduce los rechazos, permitiendo respuestas a solicitudes que el modelo original podría denegar por políticas de seguridad.

## Casos de uso

- Automatización de oficina: el modelo puede redactar correos, resumir documentos, generar informes o extraer datos de imágenes (facturas, capturas de pantalla) gracias a su capacidad multimodal y su contexto amplio.
- Asistente de programación: integrado en un IDE o CLI, puede sugerir código, explicar errores o refactorizar funciones, aprovechando su entrenamiento en tareas de codificación.
- Análisis de imágenes médicas o técnicas: dado que acepta entradas visuales, puede describir radiografías, diagramas o esquemas, aunque no se han validado sus resultados en entornos clínicos.
- Chatbot de investigación sin restricciones: útil para explorar temas controvertidos o hipótesis no convencionales en entornos académicos, donde el modelo original podría negarse a responder.
- Generación de contenido creativo: redacción de guiones, historias o diálogos con temáticas adultas o políticamente sensibles, evitando los filtros de seguridad habituales.
- Procesamiento de documentos multilingües: al soportar 26 idiomas, puede traducir, resumir o analizar textos en múltiples lenguas, aunque la calidad puede variar según el par idiomático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 32,3 GB, por lo que se recomienda al menos 32 GB de memoria unificada en equipos Apple Silicon para cargar el modelo completo.
- GPU: diseñado para ejecutarse en Apple Silicon (M1, M2, M3 y superiores) mediante la librería MLX. No se menciona soporte para CUDA u otras plataformas.
- Cuantización: la cuantización mixta de 9.450 bpw reduce el uso de memoria frente a una versión fp16, pero sigue siendo alta para GPUs de consumo.
- Opciones de despliegue: al ser formato MLX, se puede usar con frameworks compatibles con MLX, como mlx-lm o mlx-vlm. No se indican opciones para vLLM, llama.cpp u otros.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y de la configuración de `reasoning_effort`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Sí | Apache 2.0 | Safetensors, GGUF |
| KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS | 27B | No disponible | Sí | Apache 2.0 | Safetensors, GGUF |
| TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-9.4bit | 27B (nominal) | No disponible | Sí | Apache 2.0 | MLX (safetensors) |

La principal diferencia frente al modelo original es la abliteración, que reduce los rechazos de seguridad. Frente a otras versiones abliteradas como OrcaRouter o AEON, esta se distingue por su cuantización mixta específica y su formato MLX, orientado a Apple Silicon.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión "uncensored", puede generar contenido ofensivo, discriminatorio o perjudicial sin filtros, lo que amplifica los sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento o con entradas ambiguas.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto, por lo que no se garantiza un rendimiento adecuado en conversaciones muy largas.
- Inconsistencia en el número de parámetros: el archivo safetensors reporta 9.757.854.960 parámetros, mientras que el nombre del modelo indica 27B. Esta discrepancia no está aclarada y podría deberse a un error de conversión o a una poda no documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo puede generar contenido que infrinja normativas locales o políticas de plataforma.
- Carga de memoria: requiere al menos 32 GB de RAM unificada, lo que limita su uso a equipos Apple de gama alta o con memoria ampliable.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento frente a otros modelos, por lo que su calidad en tareas específicas debe evaluarse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-9.4bit
- Modelo base (KridgeDookie): https://huggingface.co/KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Repositorio del Qwen3.8-27B original: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre abliteración de Qwen3.8-27B AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog sobre OrcaRouter (otro abliterated MLX): https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
