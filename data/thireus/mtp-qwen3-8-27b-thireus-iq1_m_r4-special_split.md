# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ1_M_R4-SPECIAL_SPLIT

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.8-27B, realizada por el usuario Thireus con su propia herramienta de cuantización. El nombre del archivo indica el formato `IQ1_M_R4`, una cuantización de muy baja precisión (aproximadamente 1 bit) con una división especial de capas (`SPECIAL_SPLIT`). El modelo base, Qwen3.8-27B, es un transformer denso de 27 000 millones de parámetros con un codificador de visión integrado y una ventana de contexto de 262 144 tokens, según el artículo de Yottalabs. Esta cuantización permite ejecutar un modelo de gran tamaño en hardware con poca memoria, a costa de una pérdida significativa de calidad.

El autor, Thireus, mantiene un repositorio en GitHub con 66 repositorios y ha publicado varias cuantizaciones similares de modelos Qwen (por ejemplo, `mtp-Qwen3.5-27B-THIREUS-IQ1_M_R4-SPECIAL_SPLIT`). La licencia declarada en HuggingFace es MIT, lo que permite uso comercial sin restricciones, aunque el modelo base original se distribuye bajo Apache 2.0. La relevancia de esta ficha radica en que ofrece una opción de despliegue local en dispositivos con recursos limitados, aunque con las limitaciones propias de una cuantización extrema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de visión (modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (según nombre del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (modelo base, según artículo de Yottalabs) |
| Tipos de cuantizacion | IQ1_M_R4 (esta versión); también disponible BF16 en otro repositorio del mismo autor |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para esta cuantización) |
| Licencia | MIT (para esta cuantización); Apache 2.0 (modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es un transformer denso con atención de múltiples cabezas y un codificador de visión integrado, lo que le permite procesar tanto texto como imágenes. El artículo de Yottalabs confirma que el modelo incluye un "vision encoder sorpresa" y una ventana de contexto de 262 144 tokens. No se dispone de detalles sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada.

La cuantización `IQ1_M_R4` es una técnica de compresión que reduce los pesos a aproximadamente 1 bit por parámetro, utilizando un esquema de cuantización de baja precisión con una división especial de capas (`SPECIAL_SPLIT`). Esta técnica, desarrollada por Thireus, busca minimizar la pérdida de calidad manteniendo un tamaño de archivo extremadamente reducido. No se han publicado detalles técnicos sobre el algoritmo de cuantización ni sobre el proceso de calibración.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje natural, aunque la cuantización de 1 bit degrada significativamente la calidad de salida.
- Procesamiento de visión: gracias al codificador de visión del modelo base, puede procesar imágenes, aunque esta capacidad puede verse afectada por la cuantización.
- Soporte de tool calling y function calling: probablemente heredado del modelo base, pero no confirmado para esta cuantización.
- Capacidades multilingües: el modelo base es multilingüe, pero no se especifica qué idiomas soporta esta versión cuantizada.
- No se ha confirmado soporte para agentes multi-step ni modos de pensamiento extendido.

## Casos de uso

- Despliegue en dispositivos con poca memoria: la cuantización de 1 bit permite ejecutar un modelo de 27B en GPUs con 4-6 GB de VRAM, lo que habilita asistentes locales en portátiles o mini-PCs.
- Prototipado rápido: para pruebas de concepto donde la calidad no es crítica, esta versión permite iterar sin necesidad de hardware de gama alta.
- Procesamiento de documentos con visión en entornos con restricciones de memoria: el modelo puede extraer texto de imágenes, aunque con menor precisión que la versión completa.
- Chatbots de demostración: para ferias o demos técnicas donde se prioriza la velocidad de carga y el bajo consumo sobre la exactitud.
- Evaluación de técnicas de cuantización: investigadores pueden comparar el rendimiento de `IQ1_M_R4` frente a otras cuantizaciones del mismo modelo base.
- Inferencia en CPU: el formato GGUF es compatible con llama.cpp, permitiendo ejecutar el modelo en CPU con memoria RAM suficiente, aunque con latencia alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de Yottalabs menciona que el modelo base Qwen3.8-27B tiene benchmarks publicados, pero no se incluyen en los datos proporcionados. No se dispone de mediciones de perplejidad ni de comparativas con otras cuantizaciones para esta versión específica.

## Requisitos de hardware

- VRAM estimada: para una cuantización de ~1 bit, el tamaño del archivo sería aproximadamente 27 000 millones × 1 bit ≈ 3,4 GB, más overhead de inferencia. Se estima que cabría en GPUs con 4-6 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060). También puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (según el blog de AMD), vLLM o SGLang (para el modelo base, no necesariamente para esta cuantización).
- Latencia y throughput: no disponibles. La cuantización de 1 bit reduce el tamaño de memoria y puede acelerar la inferencia en hardware limitado, pero la calidad de salida se ve comprometida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Calidad esperada |
|---|---|---|---|---|---|
| mtp-Qwen3.8-27B-THIREUS-IQ1_M_R4 (esta cuantización) | 27B | 262k (base) | MIT | GGUF | Muy baja (1 bit) |
| mtp-Qwen3.8-27B-THIREUS-BF16 | 27B | 262k (base) | MIT | GGUF | Alta (BF16) |
| Qwen3.8-27B (modelo base) | 27B | 262k | Apache 2.0 | safetensors | Alta |

La comparativa muestra que la versión `IQ1_M_R4` sacrifica calidad para reducir el tamaño, mientras que la versión BF16 mantiene la fidelidad pero requiere más memoria. El modelo base es la referencia de calidad, pero no es adecuado para hardware limitado.

## Limitaciones y advertencias

- La cuantización de 1 bit produce una degradación severa de la calidad: las respuestas pueden ser incoherentes, con errores gramaticales y alucinaciones frecuentes.
- No es recomendable para tareas críticas como diagnóstico médico, asesoramiento legal o generación de código en producción.
- El soporte de visión puede verse afectado por la cuantización, ya que los pesos del codificador de visión también se comprimen.
- La licencia MIT de esta cuantización permite uso comercial, pero el modelo base tiene Apache 2.0, que también es permisiva. No hay conflicto conocido.
- No se dispone de información sobre sesgos específicos del modelo cuantizado, pero es probable que herede los sesgos del modelo base.
- El contexto de 262k tokens es teórico; en la práctica, la cuantización de 1 bit puede reducir la capacidad de mantener coherencia en secuencias largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ1_M_R4-SPECIAL_SPLIT
- Repositorio BF16 del mismo autor: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Artículo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Blog de AMD sobre ejecución de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- GitHub de Thireus: https://github.com/Thireus
