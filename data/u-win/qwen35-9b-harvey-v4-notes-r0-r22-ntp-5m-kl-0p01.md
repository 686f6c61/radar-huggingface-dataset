# U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-5m-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-5m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario U-WIN en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a conversación, entrenado mediante predicción del siguiente token (next-token prediction) sobre lo que el nombre del repositorio indica como "notes-only", con regularización KL (kl-regularization) y una configuración de entrenamiento que incluye los identificadores "r0-r22", "5m" y "kl-0p01". El nombre hace referencia a "harvey" y "calderwood-harkness", etiquetas que aparecen en los tags del repositorio y que probablemente identifican el conjunto de datos o el proyecto de entrenamiento.

El modelo cuenta con 9.653.104.368 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de 9B, y hereda del Qwen3.5-9B la arquitectura y las capacidades multimodales de entrada imagen-texto. La licencia es Apache 2.0 y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. El repositorio ocupa 19,3 GB.

La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. No hay información pública sobre los datos de entrenamiento, los idiomas soportados ni resultados de benchmarks, por lo que la mayor parte de las especificaciones se derivan del modelo base o se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del Qwen/Qwen3.5-9B, un modelo multimodal de la familia Qwen 3.5 que procesa entradas de imagen y texto y genera texto. Al ser un ajuste fino completo, no se trata de un adaptador LoRA ni de una modificación parcial: los 9.653.104.368 parámetros del checkpoint corresponden a los pesos completos del modelo ajustado. La arquitectura subyacente es, por tanto, la del Qwen3.5-9B, cuyos detalles internos (número de capas, dimensión oculta, mecanismo de atención, tokenizador) no se detallan en la información disponible.

El nombre del repositorio describe la configuración de entrenamiento: "notes-only" sugiere que el ajuste se realizó únicamente sobre un conjunto de datos de notas o apuntes; "ntp" indica next-token prediction como objetivo de entrenamiento; "kl-0p01" apunta a una regularización KL con coeficiente 0,01, probablemente para mantener la distribución del modelo ajustado cerca de la del modelo base y evitar el olvido catastrófico; y "r0-r22" y "5m" podrían referirse a rangos de iteraciones o pasos (22 rondas o revisiones, 5 millones de tokens o pasos). No se dispone de información sobre el volumen total de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y entrenado con next-token prediction, por lo que puede mantener diálogos multi-turno.
- Procesamiento de imagen y texto: el pipeline image-text-to-text indica que acepta imágenes junto con texto como entrada y genera respuestas textuales.
- Razonamiento y respuesta a instrucciones: heredado del modelo base Qwen3.5-9B, aunque no se documenta el grado de conservación tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en la ficha del repositorio.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Asistente conversacional especializado en notas: el ajuste "notes-only" sugiere que el modelo puede emplearse para responder preguntas, resumir o ampliar apuntes y notas técnicas en un entorno de chat, aprovechando su entrenamiento específico sobre ese tipo de contenido.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede recibir capturas de pantalla, diagramas o páginas escaneadas junto con una pregunta y generar una respuesta textual, útil en herramientas de extracción de información de documentación técnica.
- Prototipado de investigación sobre ajuste fino: al ser un full fine-tune con regularización KL documentada en el nombre, sirve como caso de estudio para investigadores que quieran reproducir o analizar el efecto de la regularización KL en la retención de capacidades del modelo base.
- Generación de respuestas en entornos de bajo tráfico: con cero descargas y acceso restringido, es adecuado para experimentación interna y pruebas controladas más que para despliegues de producción a gran escala.
- Evaluación comparativa de ajustes finos: puede utilizarse como punto de comparación frente al Qwen3.5-9B original para medir la degradación o especialización introducida por el entrenamiento "notes-only".
- Integración en pipelines de transformers: al ser compatible con la librería transformers y con endpoints, puede cargarse en scripts de Python para tareas de inferencia por lotes sobre pares imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653.104.368 parámetros en precisión completa (fp16/bf16), se requieren aproximadamente 19,3 GB solo para los pesos, más memoria para activaciones y caché KV; en la práctica, se recomienda un mínimo de 24 GB de VRAM para fp16 y bastante más para contextos largos.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para inferencia en fp16 con margen; en consumer, una RTX 4090 (24 GB) puede ser justa para fp16 y requeriría cuantización para contextos amplios.
- ¿Cabe en consumer GPU? En fp16, una RTX 4090 de 24 GB queda al límite; en cuantizaciones de 8 bits o 4 bits (no publicadas en el repo) cabría en GPUs de 16-24 GB, pero no se ofrecen pesos cuantizados oficiales.
- Opciones de despliegue: transformers (librería indicada), endpoints compatibles según los tags; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y al no haber GGUF no es desplegable directamente en llama.cpp/Ollama sin conversión propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-5m-kl-0p01 | 9,65B | no disponible | Apache 2.0 | Gated, 0 descargas | Full fine-tune de Qwen3.5-9B, notes-only |
| Qwen/Qwen3.5-9B | ~9B | no disponible en esta ficha | no disponible en esta ficha | Público (modelo base) | Modelo base multimodal del que deriva |
| Alternativas de 9B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir su uso automatizado.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que se desconoce el rendimiento real y la posible degradación respecto al modelo base.
- Riesgo de olvido catastrófico: aunque el nombre indica regularización KL (coeficiente 0,01), un ajuste "notes-only" puede reducir capacidades generales del Qwen3.5-9B, como el multilingüismo o el razonamiento fuera del dominio de notas.
- Idiomas no documentados: no se especifican los idiomas soportados; no se debe asumir un buen rendimiento en castellano sin evaluarlo.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de entrenamiento ni evaluaciones, no puede acotarse.
- Sesgos conocidos: no documentados; se heredan los del modelo base y los del dataset de notas, que no se describe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated y la ausencia de documentación sobre el dataset de entrenamiento pueden plantear dudas sobre la procedencia de los datos.
- Sin cuantizaciones oficiales: no se ofrecen GGUF ni variantes de 8/4 bits, lo que limita el despliegue en hardware consumer.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-5m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
