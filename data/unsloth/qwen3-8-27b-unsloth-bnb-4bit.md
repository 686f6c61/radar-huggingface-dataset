# unsloth/Qwen3.8-27B-unsloth-bnb-4bit

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo de Qwen (Alibaba) y distribuido por Unsloth en su versión cuantizada a 4-bit mediante bitsandbytes. Se trata de la iteración más reciente de la familia Qwen3.8, que sucede a las series Qwen3.5 y Qwen3.6, y está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de larga duración. El modelo combina una arquitectura híbrida con atención lineal y atención clásica, lo que le permite manejar contextos de 262 144 tokens de forma nativa y extenderse hasta 1 000 000 con técnicas de escalado RoPE.

La versión cuantizada de Unsloth reduce el peso del modelo a aproximadamente 22,4 GB (frente a los ~27 GB del original en fp16), lo que permite ejecutarlo en hardware de consumo con 17 GB de RAM o VRAM. Incluye soporte nativo para imágenes y vídeo, control flexible de razonamiento (modo thinking activable/desactivable) y mejoras en tool calling para uso en agentes. Su licencia Apache-2.0 facilita la adopción comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model con vision encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 144 tokens nativa, extensible a 1 000 000 |
| Tipos de cuantizacion | 4-bit bitsandbytes (bnb-4bit), GGUF dinámico, NVFP4 (vía Unsloth) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bnb-4bit), GGUF, NVFP4 |

## Arquitectura y entrenamiento

La arquitectura combina bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention). El modelo tiene 64 capas, con una disposición de 16 bloques de 3 × (Gated DeltaNet → FFN) seguidos de 1 × (Gated Attention → FFN). La dimensión oculta es 5120, con 48 cabezas de atención lineal para V y 16 para QK (dimensión 128), y 24 cabezas para Q y 4 para KV en la atención clásica (dimensión 256). El feed-forward tiene dimensión intermedia de 17 408. Incluye un módulo de Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento combina pre-training y post-training, pero la model card no detalla el número de tokens ni la composición del dataset. No se menciona el uso de RLHF o DPO explícitamente; sin embargo, el modelo admite modos de razonamiento (thinking) e instruct, lo que sugiere un post-entrenamiento supervisado. La cuantización 4-bit de Unsloth preserva la funcionalidad del modelo original, incluyendo el soporte de visión.

## Capacidades

- Generación de texto, razonamiento complejo, codificación y matemáticas.
- Comprensión de imágenes y vídeo nativa (STEM, diagramas, documentos y vídeos de hasta una hora).
- Modo de pensamiento (thinking mode) activado por defecto, desactivable por petición; ajuste de profundidad de razonamiento con `reasoning_effort`.
- Soporte de tool calling mejorado, con parsing de objetos anidados para mayor éxito en llamadas a herramientas.
- Compatible con agentes de largo horizonte: planificación autónoma y manejo de feedback del entorno.
- Capacidades multilingües (no se especifican idiomas concretos en la documentación).
- Soporte de contexto largo (hasta 262 144 tokens nativos, extensible a 1M).

## Casos de uso

- **Atención al cliente automatizada**: con 262 144 tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso y recordar detalles de interacciones previas, reduciendo la necesidad de resúmenes externos.
- **Generación de código en producción**: su soporte de tool calling y su entrenamiento en tareas de codificación permiten integrarlo en pipelines de CI/CD para generar, revisar y documentar código, así como ejecutar comandos y manejar errores de forma autónoma.
- **Análisis de documentos técnicos y científicos**: su visión nativa permite extraer información de diagramas, gráficos y fórmulas de PDFs o imágenes, útil en entornos de investigación y consultoría.
- **Agentes de automatización de tareas**: su capacidad de razonamiento multi-paso y de manejar feedback del entorno lo hace adecuado para orquestar flujos de trabajo complejos, como la gestión de tickets o la actualización de bases de datos.
- **Asistente de investigación**: puede leer y resumir papers extensos, extraer conclusiones y comparar resultados, con la posibilidad de mantener el contexto de todo un corpus de documentos.
- **Traducción y localización**: aunque no se especifican idiomas, la familia Qwen es multilingüe; puede utilizarse para traducir contenido técnico o comercial manteniendo el estilo y la terminología específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Unsloth menciona mejoras en codificación, trabajo profesional y tareas de agentes, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización 4-bit (bnb-4bit) requiere aproximadamente 17 GB de VRAM o RAM, según la documentación de Unsloth.
- GPU recomendadas: tarjetas con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) para ejecutar el modelo con GGUF Q4_K_XL. Para modelos más grandes de la familia (2.4T) se necesitan GPUs profesionales (A100/H100).
- Cabe en GPUs de consumo como RTX 3090/4090 con 24 GB, y en configuraciones con 17 GB de memoria unificada (por ejemplo, Apple Silicon con 32 GB).
- Opciones de despliegue: Unsloth Desktop, Unsloth Studio, llama.cpp con GGUF, vLLM (con soporte de cuantización bitsandbytes), TGI y Ollama (vía GGUF).
- Latencia y throughput: no se han publicado cifras concretas; se espera que la inferencia en GPU de 24 GB sea fluida para tareas de chat y razonamiento moderado, pero el modo thinking puede aumentar el tiempo de generación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otras versiones de Qwen (3.5, 3.6) ni con modelos de la misma categoría (por ejemplo, Llama 3.1 70B o Mistral Large 2). La información proporcionada no incluye tablas de rendimiento ni comparaciones numéricas. Se puede indicar que Qwen3.8-27B es un modelo denso de 27B con visión y contexto largo, frente a alternativas como Qwen3.5-30B-A3B (MoE) o Qwen3.6-32B, pero sin datos concretos no se puede realizar una comparación técnica rigurosa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la model card, pero como modelo entrenado con datos de internet, es susceptible de presentar sesgos culturales y de género.
- Riesgo de alucinación en tareas de razonamiento largo o cuando se le pide información factual sin verificación.
- El contexto de 262 144 tokens es nativo, pero el rendimiento en longitudes extremas puede degradarse si no se aplican técnicas de escalado RoPE (por ejemplo, YaRN).
- Aunque la licencia es Apache-2.0, el uso comercial está permitido, pero hay que revisar las condiciones de uso de los datos de entrenamiento (no se detalla).
- La cuantización 4-bit puede introducir una ligera pérdida de precisión en tareas de matemáticas o razonamiento complejo; para tareas críticas se recomienda usar la versión completa.
- No se garantiza el soporte de todos los idiomas; la documentación no lista los idiomas soportados, por lo que la calidad en idiomas distintos del inglés y chino podría ser inferior.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit)
- [Modelo base Qwen3.8-27B en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Guía de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Página del modelo en Unsloth](https://unsloth.ai/models/qwen3.8-27b)
- [Blog de Orcarouter sobre Qwen3.8-27B con Unsloth](https://www.orcarouter.ai/blog/qwen-3-8-27b-unsloth)
