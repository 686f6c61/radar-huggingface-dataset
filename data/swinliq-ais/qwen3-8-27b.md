# SwinliQ-AIs/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros, nativo multimodal (visión y lenguaje), desarrollado por el equipo Qwen de Alibaba como parte de la generación Qwen3.8. Se presenta como el modelo open-weight más capaz de la familia hasta la fecha, con mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. El repositorio de Hugging Face consultado es un mirror gestionado por SwinliQ-AIs, mientras que el repositorio oficial se encuentra en GitHub bajo la organización AlibabaCloud-Official.

El modelo combina una arquitectura transformer causal con un codificador de visión, incorporando capas de atención lineal Gated DeltaNet y atención Gated Attention, con 64 capas y una dimensión oculta de 5120. Ofrece una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, y soporta control flexible del razonamiento (modo thinking activable o desactivable por petición). Su licencia Apache 2.0 y su tamaño contenido permiten el despliegue en una única GPU, lo que lo convierte en una opción atractiva para entornos de producción locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura transformer causal con codificador de visión integrado. El modelo de lenguaje consta de 64 capas con una dimensión oculta de 5120 y un layout interno de 16 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, todas con sus respectivas redes feed-forward. La Gated DeltaNet utiliza 48 cabezas de atención lineal para la proyección de valores (V) y 16 cabezas para las proyecciones de consulta y clave (QK), con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para consultas y 4 para claves/valores, con dimensión de cabeza 256 y una dimensión de RoPE de 64. La capa feed-forward tiene una dimensión intermedia de 17 408, y el embedding de salida está rellenado a 248 320 tokens. El modelo incorpora además Multi-Token Prediction (MTP), entrenado con múltiples pasos de predicción.

El entrenamiento comprende fases de pre-training y post-training, aunque no se especifican en la información disponible el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación técnica más destacable es la combinación de atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), que permite manejar secuencias largas de forma eficiente, junto con el control flexible del razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con modo thinking activable o desactivable por petición y ajuste de la profundidad de razonamiento mediante `reasoning_effort`.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Codificación y tareas de terminal agénticas, con soporte para planificación autónoma y manejo de feedback del entorno.
- Automatización de oficina, con capacidades mejoradas para documentos, hojas de cálculo y presentaciones.
- Soporte de tool calling y funciones integradas, disponibles en la versión alojada de Qwen Cloud.
- Capacidades multilingües no especificadas en la documentación disponible, aunque la familia Qwen suele ofrecer soporte multilingüe amplio.
- Compatibilidad con múltiples frameworks de inferencia: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Agente de terminal para codificación: el modelo puede ejecutar tareas de codificación agéntica en terminal, como la resolución de issues, refactorización de código y ejecución de pruebas, gracias a su capacidad de planificación autónoma y manejo de feedback del entorno, validada en benchmarks como Terminal Bench 2.1.
- Automatización de oficina: puede generar, resumir y transformar documentos, hojas de cálculo y presentaciones, tanto a partir de texto como de imágenes escaneadas o capturas de pantalla, lo que lo hace adecuado para flujos de trabajo administrativos.
- Análisis de documentos técnicos con imágenes: su comprensión nativa de diagramas STEM y documentos permite extraer información de figuras, gráficos y tablas en contextos de investigación o ingeniería.
- Comprensión de vídeo de larga duración: puede procesar vídeos de hasta una hora para generar resúmenes, transcripciones o responder preguntas sobre el contenido, útil en vigilancia, revisión de grabaciones o análisis de contenido multimedia.
- Asistente de programación con contexto largo: con 262 144 tokens de contexto nativo, puede manejar repositorios completos o bases de código extensas, ofreciendo sugerencias de refactorización, detección de errores y generación de documentación.
- Despliegue en producción en una sola GPU: al ser un modelo denso de 27B con licencia Apache 2.0, puede integrarse en entornos locales o privados con vLLM o SGLang para tareas de generación de texto, razonamiento y visión sin depender de APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks, pero la información proporcionada está truncada y no permite extraer los valores numéricos. Según la revisión de Neomanex, los resultados son reportados por Alibaba y no han sido verificados de forma independiente. Por tanto, no se dispone de datos completos y contrastados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 55,6 GB, lo que sugiere un almacenamiento en precisión bf16 o fp16. Para inferencia en bf16 se necesitarían aproximadamente 56 GB de VRAM; con cuantización a 8 bits se reduciría a unos 28 GB, y a 4 bits a unos 14 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para bf16, una A100 80GB o H100; con cuantización, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes para 8 bits, y una RTX 4060 (16 GB) para 4 bits.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También es probable su compatibilidad con llama.cpp y Ollama, aunque no se menciona explícitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La tabla de benchmarks de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de los valores numéricos. A continuación se presenta una comparativa estructural basada en la información disponible:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B | 262K nativo (1M extensible) | Apache 2.0 | Open weights |
| Qwen3.6-27B | 27 B (estimado) | No disponible | Apache 2.0 (presumible) | Open weights |
| Muse Glimmer-30B | 30 B (estimado) | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | Propietaria | API |

No se dispone de datos suficientes para una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Los benchmarks publicados son reportados por el fabricante y no han sido reproducidos de forma independiente, por lo que las ganancias declaradas en codificación y tareas agénticas deben tomarse con cautela.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento, lo que limita la evaluación de sesgos lingüísticos y culturales.
- El contexto extensible hasta 1 000 000 tokens puede degradar el rendimiento en longitudes extremas; se recomienda validar el comportamiento en el caso de uso concreto.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o con entradas multimodales ambiguas.
- El repositorio de Hugging Face consultado es un mirror de SwinliQ-AIs, no el repositorio oficial de Alibaba; se recomienda verificar la integridad de los pesos antes de su uso en producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero es recomendable revisar los términos específicos del repositorio oficial.

## Enlaces

- Repositorio Hugging Face (mirror): https://huggingface.co/SwinliQ-AIs/Qwen3.8-27B
- Repositorio GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Análisis en BenchLM.ai: https://benchlm.ai/models/qwen3-8-27b
- Revisión en Neomanex: https://neomanex.com/models/qwen3-8-27b
