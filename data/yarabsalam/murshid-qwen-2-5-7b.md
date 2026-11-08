# YarabSalam/murshid-qwen-2.5-7b

## Resumen

Murshid Qwen 2.5 7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario YarabSalam en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth, que según el autor permite un entrenamiento "2x más rápido" que los pipelines convencionales. Se distribuye bajo licencia Apache 2.0 y la model card lo etiqueta únicamente para inglés.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un ajuste comunitario, sin model card detallada, sin benchmarks publicados y sin descargas ni interacciones registradas en el momento de la consulta. El repositorio ocupa 0,3 GB, un tamaño coherente con pesos cuantizados en 4 bits, no con un modelo completo en precisión nativa.

Por tanto, la información disponible permite describir la arquitectura heredada de Qwen2.5 (transformer denso de 7B parámetros con 32K tokens de contexto nativo, extensible a 128K mediante RoPE scaling) pero no las características específicas del ajuste fino: no se documentan el dataset, el número de pasos, la composición de los datos ni el propósito concreto del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7,6 mil millones (heredado del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con RoPE scaling (heredado del modelo base) |
| Tipos de cuantizacion | Pesos base en 4 bits (bnb-4bit); el repositorio publica safetensors. No se documentan otras variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (según la model card del ajuste); el modelo base soporta además chino y otros idiomas, pero el ajuste no lo declara |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas con consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y embeddings RoPE. El modelo base incorpora 28 capas, dimensión oculta de 3584 y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante ajuste de la base RoPE. Qwen2.5-7B-Instruct fue entrenado por Alibaba sobre un corpus multilingüe de aproximadamente 18 billones de tokens, con fases de preentrenamiento, ajuste supervisado y optimización por preferencias (DPO), según la documentación pública del modelo base.

Sobre el ajuste fino de YarabSalam no hay información técnica: la model card se limita a indicar que se entrenó con Unsloth a partir de la versión 4-bit y que la licencia es Apache 2.0. No se especifican el dataset, el número de tokens de entrenamiento, la técnica (LoRA/QLoRA/full fine-tuning), la tasa de aprendizaje ni si hubo RLHF o DPO adicional. Tampoco se documenta ninguna innovación técnica propia. Cualquier afirmación sobre el comportamiento específico del ajuste sería especulativa.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Generación de código y resolución de problemas matemáticos, capacidades presentes en el modelo base.
- Soporte de tool calling / function calling (heredado de Qwen2.5-Instruct), aunque el ajuste no lo documenta explícitamente.
- Capacidad de seguir instrucciones multi-turno y mantener conversaciones con contexto largo (hasta 32K tokens nativos).
- Capacidades multilingües del modelo base (inglés, chino y otros), aunque la model card del ajuste solo declara inglés.
- No se documentan capacidades de visión, audio, modo "thinking" explícito ni decodificación especulativa en el ajuste.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el modelo puede desplegarse con transformers o TGI y mantener conversaciones multi-turno con contexto de hasta 32K tokens, adecuado para pruebas de concepto.
- Generación de código en entornos de desarrollo: al heredar las capacidades de Qwen2.5-7B-Instruct, puede integrarse en asistentes de IDE o pipelines de revisión de código, aunque sin garantías específicas del ajuste.
- Extracción y resumen de documentos largos: la ventana de 32K tokens permite procesar informes, contratos o artículos completos en una sola pasada.
- Clasificación y etiquetado de texto: útil para tareas de moderación, categorización de tickets o análisis de sentimiento en inglés.
- Experimentación académica con fine-tuning: al ser un ajuste comunitario con licencia Apache 2.0, sirve como base para estudiar técnicas de entrenamiento con Unsloth y QLoRA.
- Despliegue en hardware de gama media: al estar disponible en 4 bits y ocupar 0,3 GB en el repositorio, puede ejecutarse en GPU consumer con cuantización adicional, aunque el rendimiento real del ajuste no está verificado.
- Generación de respuestas en atención al cliente: con contexto largo y tool calling heredado, podría gestionar consultas multi-turno, siempre que se valide su calidad frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del ajuste no incluye métricas y no se dispone de evaluaciones independientes del modelo Murshid. Los resultados del modelo base Qwen2.5-7B-Instruct (MMLU, HumanEval, GSM8K, etc.) están documentados por Alibaba, pero no son extrapolables al ajuste sin verificación empírica.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio contiene pesos en 4 bits (0,3 GB), pero para inferencia con transformers se recomienda al menos 6-8 GB de VRAM en 4 bits y 16-18 GB en FP16.
- GPU recomendadas: RTX 3060 12 GB o superior para 4 bits; RTX 4090, A100 o H100 para FP16 y mayor throughput.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM usando cuantización 4 bits; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Murshid Qwen 2.5 7B | 7,6B | 32K (128K con RoPE) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6B | 32K (128K con RoPE) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial con benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Comparable en tamaño; licencia con restricciones comerciales |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar |

La comparación directa con el modelo base es la más relevante: Murshid no documenta mejoras medibles frente a Qwen2.5-7B-Instruct, por lo que su adopción frente al original carece de justificación técnica publicada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea.
- Model card mínima: no se documentan dataset, hiperparámetros ni propósito del entrenamiento, lo que impide evaluar su idoneidad para producción.
- Riesgo de alucinación: heredado del modelo base, sin mitigaciones documentadas en el ajuste.
- Sesgos: no evaluados; el modelo base Qwen2.5 presenta sesgos conocidos en dominios culturales y de género, no cuantificados aquí.
- Idioma: la model card solo declara inglés, aunque el modelo base es multilingüe; el comportamiento en castellano no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero el ajuste no ofrece garantías ni soporte.
- Cero descargas y cero interacciones: no hay validación comunitaria ni informes de uso en producción.
- El repositorio de 0,3 GB sugiere pesos cuantizados; verificar la precisión real antes de asumir equivalencia con el modelo base en FP16.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/YarabSalam/murshid-qwen-2.5-7b
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit
- Qwen2.5-7B en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-7B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Tutorial de despliegue de Qwen2.5-7B: https://aiindigo.com/tutorials/getting-started-with-qwen2-5-7b-deploying-efficient-llms-locally
