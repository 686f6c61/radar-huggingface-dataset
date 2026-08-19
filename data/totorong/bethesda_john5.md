# TOTORONG/Bethesda_John5

## Resumen

El repositorio `TOTORONG/Bethesda_John5` contiene los pesos y archivos de configuración del modelo Qwen3.8-27B, un modelo de lenguaje causal con encoder de visión desarrollado por Alibaba (Qwen) y publicado bajo licencia Apache 2.0. Se trata de un modelo denso de 27.781 millones de parámetros que combina arquitectura híbrida con atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración.

La principal novedad de esta generación es su capacidad nativa de comprensión de imágenes y vídeo, junto con un control flexible del modo de razonamiento (thinking mode) que puede activarse o desactivarse por petición. Su ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, lo sitúa como una opción competitiva para tareas que requieren procesar documentos extensos, vídeos de larga duración o conversaciones multi-turno complejas. El repositorio está formateado para su uso con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida con Gated DeltaNet (linear attention) y Gated Attention |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, basado en la arquitectura de la serie Qwen3.5. Su bloque de capas sigue el patrón `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, lo que significa que por cada 4 bloques, 3 utilizan atención lineal (Gated DeltaNet) y 1 utiliza atención clásica (Gated Attention). Esta combinación híbrida busca reducir el coste computacional del procesamiento de secuencias largas manteniendo la calidad de la atención completa cuando es necesaria.

El modelo tiene 64 capas, dimensión oculta de 5120, y un feed-forward con dimensión intermedia de 17.408. La atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención clásica usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El embedding de tokens es de 248.320 (padded). Se entrenó con Multi-Token Prediction (MTP) en múltiples pasos, una técnica que predice varios tokens futuros simultáneamente para mejorar la eficiencia de inferencia y la calidad del razonamiento.

No se han publicado en la información disponible los detalles del dataset de entrenamiento (número de tokens, composición) ni si se aplicaron técnicas de RLHF o DPO. La etapa de entrenamiento se indica como "Pre-training & Post-training".

## Capacidades

- Generación de texto y razonamiento con control flexible del modo de pensamiento: activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y conservación del contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión de imágenes y vídeo nativa: capaz de interpretar diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma y manejo de feedback del entorno para completar tareas de múltiples pasos.
- Capacidades de codificación mejoradas respecto a generaciones anteriores de Qwen3, incluyendo codificación agéntica en terminal.
- Soporte de tool calling y function calling (implícito en las capacidades agénticas, aunque no se detalla explícitamente en la documentación proporcionada).
- Compatibilidad con múltiples frameworks de inferencia: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de programación con contexto de repositorio completo: su ventana de 262K tokens permite cargar el contenido de un proyecto entero y generar código coherente con el estilo y las dependencias existentes, reduciendo errores de contexto.
- Agentes autónomos de terminal: gracias a su entrenamiento en codificación agéntica (Terminal Bench), puede ejecutar comandos, interpretar salidas y corregir errores de forma iterativa en pipelines de CI/CD o entornos de desarrollo.
- Análisis de documentos técnicos extensos: con contexto nativo de 262K tokens, puede resumir, extraer y razonar sobre manuales, papers o informes de cientos de páginas sin necesidad de chunking.
- Comprensión de vídeo para revisión de código o formación: su capacidad de procesar vídeos de hasta una hora permite transcribir y analizar sesiones de programación, tutoriales o revisiones de código grabadas.
- Atención al cliente con contexto conversacional largo: el modo de razonamiento activable y la ventana ampliada permiten mantener historiales de conversación extensos con memoria de decisiones previas, útil para soporte técnico de productos complejos.
- Investigación y análisis de papers con figuras: al ser un modelo vision-language, puede interpretar diagramas, gráficos y ecuaciones de artículos científicos, facilitando la revisión de literatura y la extracción de resultados.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de benchmarks comparativa, pero está incompleta (cortada). Se menciona el benchmark "Terminal Bench 2.1 (Terminus)" para codificación agéntica en terminal, con comparación contra Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se han proporcionado los valores numéricos completos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 27.781 millones de parámetros en precisión FP16, el peso del modelo ocuparía aproximadamente 55,6 GB (coincide con el tamaño del repositorio), por lo que se necesitaría al menos una GPU con 64 GB de VRAM o más para inferencia sin cuantización.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, una A100 80GB o H100 80GB sería adecuada para FP16; con cuantización (no especificada), podría caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090 (32 GB) si se aplican cuantizaciones de 4 bits u 8 bits.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La tabla de benchmarks de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en la información proporcionada. No se puede realizar una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Vision | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,8B | 262K nativo, 1M extensible | Sí | Apache 2.0 |
| Qwen3.6-27B | 27B (estimado) | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio `TOTORONG/Bethesda_John5` no es el repositorio oficial de Qwen; es una publicación de un tercero con el nombre "Bethesda_John5" que contiene pesos de Qwen3.8-27B. Se debe verificar la autenticidad e integridad de los pesos antes de usarlos en producción.
- No se dispone de información sobre los idiomas soportados; aunque Qwen suele ofrecer soporte multilingüe amplio, no se puede confirmar para esta versión.
- No se han publicado detalles sobre el dataset de entrenamiento ni sobre posibles sesgos; se recomienda evaluar el modelo en el dominio de aplicación específico antes de desplegarlo.
- El modo de razonamiento (thinking mode) está activado por defecto, lo que puede aumentar la latencia de respuesta; es necesario desactivarlo explícitamente si se requiere baja latencia.
- La extensión de contexto hasta 1.000.000 tokens puede requerir técnicas de interpolación de RoPE o atención con ventana deslizante; el rendimiento en esa longitud extrema no está verificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original de Qwen si se distribuye o modifica.
- No hay información sobre cuantizaciones oficiales; las cuantizaciones de terceros pueden degradar el rendimiento, especialmente en tareas de razonamiento y visión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TOTORONG/Bethesda_John5
- Servicio Qwen Cloud (mención en la model card): https://www.qwencloud.com
- Página del modelo Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b

No se han encontrado enlaces adicionales (papers, blogs, repos oficiales) en la información proporcionada.
