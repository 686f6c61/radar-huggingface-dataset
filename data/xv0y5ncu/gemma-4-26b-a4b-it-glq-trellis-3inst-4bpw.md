# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-4bpw

## Resumen

El modelo `xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-4bpw` es una cuantización de 4 bits por peso del modelo base `google/gemma-4-26B-A4B-it`, desarrollada por el usuario xv0y5ncu mediante la herramienta de cuantización GLQ (Generalized Low-bit Quantization). Utiliza un codebook trellis (TCQ) en su variante 3INST, sin búsqueda, y reduce el tamaño del modelo de aproximadamente 52 GB (en bf16) a 13.95 GB en disco, manteniendo un rendimiento cercano al original en tareas de razonamiento matemático.

Este checkpoint está pensado para entornos con memoria limitada o GPUs de consumo, permitiendo ejecutar un modelo MoE de 26B totales (4B activos) con un footprint reducido. La relevancia actual radica en la creciente demanda de modelos de alto rendimiento desplegables en hardware modesto, sin renunciar a capacidades de razonamiento avanzado. El modelo hereda la arquitectura y las capacidades del base, incluida su ventana de contexto de hasta 256K tokens y su soporte multilingüe.

La cuantización ha sido calibrada con 128 muestras de WikiText-2 y alcanza una SQNR media de 22.11 dB. Los resultados en el benchmark AIME 2026 muestran un 85.4% de precisión, frente al 88.3% del modelo original en bf16, una diferencia estadísticamente no significativa según el autor. El modelo está diseñado para usarse con vLLM y GLQ ≥0.8.1, y no es compatible con el pipeline estándar de transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos enrutados por capa, cuantización trellis 3INST a 4 bits |
| Parametros totales | 7.485.075.406 (según safetensors; el modelo base tiene 26B) |
| Parametros activos | 4B (del modelo base) |
| Longitud de contexto | Hasta 256K tokens (modelo base); no especificado para esta cuantización |
| Tipos de cuantizacion | GLQ trellis 3INST, 4 bits por peso |
| Idiomas soportados | Más de 140 idiomas (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización GLQ trellis) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-26B-A4B-it` es un MoE con 128 expertos enrutados por capa y 4 mil millones de parámetros activos. Esta cuantización no implica un entrenamiento adicional, sino una compresión post-entrenamiento mediante GLQ. El proceso de cuantización utiliza un codebook trellis (TCQ) de 4 bits por peso, en su variante 3INST (sin lookup), y se calibra con 128 secuencias de 2048 tokens de WikiText-2. La técnica consiste en fusionar las matrices de gate y up en un solo tensor, cuantizarlas conjuntamente y luego separarlas de nuevo por proyección, con una alineación de 32 filas para mantener la integridad de los datos.

La SQNR media alcanzada es de 22.11 dB sobre 242 capas, con un mínimo de 21.2 dB y un máximo de 22.8 dB. El modelo hereda las capacidades del modelo base, incluyendo el modo de razonamiento (thinking) y la entrada multimodal (texto e imagen). La cuantización no modifica la arquitectura ni el comportamiento funcional, pero requiere el uso de vLLM con GLQ ≥0.8.1 para la inferencia, ya que el pipeline de transformers no es capaz de reconstruir correctamente los tensores de los expertos.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos (thinking mode), gracias a su modo de razonamiento incorporado.
- Procesamiento multimodal: acepta entradas de texto e imagen (capacidad heredada del modelo base).
- Multilingüe: soporta más de 140 idiomas, según la documentación del modelo base.
- Soporte del rol de sistema (system prompt) para conversaciones más controladas y estructuradas.
- Capacidad de razonamiento matemático y de competición (evidenciado en AIME 2026).
- Compatibilidad con el formato de cuantización GLQ, que permite una inferencia eficiente en términos de memoria y velocidad.

## Casos de uso

- **Despliegue en GPUs de consumo**: Con un tamaño de 13.95 GB en disco y ~13.3 GiB en memoria, el modelo puede ejecutarse en GPUs con 24 GB de VRAM, como la RTX 4090, para aplicaciones de chat o asistentes virtuales con razonamiento.
- **Servicio de inferencia de alta concurrencia**: Gracias a la velocidad de decodificación de 1341 tokens/s con batch 32 en vLLM, es adecuado para entornos de producción con múltiples peticiones simultáneas.
- **Resolución de problemas matemáticos**: Con un 85.4% de acierto en AIME 2026, es útil para aplicaciones educativas o de investigación que requieran razonamiento cuantitativo.
- **Análisis de texto multilingüe**: Soporta más de 140 idiomas, lo que permite su uso en sistemas de traducción, análisis de sentimiento o extracción de información en entornos multilingües.
- **Prototipado rápido en investigación**: La cuantización reduce la barrera de hardware, permitiendo a investigadores evaluar el rendimiento de Gemma 4 en tareas específicas sin necesidad de GPUs de gran tamaño.
- **Integración en pipelines de IA conversacional**: Aunque no se ha verificado el tool calling, el modelo puede usarse como generador de respuestas en chatbots o asistentes con contexto largo, gracias a su ventana de 256K tokens heredada.

## Benchmarks y rendimiento

La información disponible solo incluye el resultado en el benchmark AIME 2026, comparado con el modelo base en bf16.

| Modelo | AIME 2026 (avg@8) |
|---|---|
| gemma-4-26B-A4B-it (bf16) | 88.3% (publicado por Google) |
| Este checkpoint (4 bpw GLQ trellis) | 85.4% |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: ~13.3 GiB para el modelo cargado con `gpu_memory_utilization=0.9` y `max_model_len=40960`, según la prueba en una RTX PRO 6000 Blackwell.
- **GPU recomendada**: RTX PRO 6000 Blackwell (96 GB) para los números de velocidad reportados; GPUs con 24 GB o más podrían ejecutar el modelo, pero no se garantizan las mismas velocidades.
- **Compatibilidad**: No funciona con transformers (genera salidas incoherentes). Requiere vLLM ≥0.25 y GLQ ≥0.8.1.
- **Opciones de despliegue**: vLLM con `--quantization glq` (ver comandos en la model card). No se menciona compatibilidad con llama.cpp u Ollama.
- **Latencia**: 91.6 tokens/s (B=1) y 1341 tokens/s (B=32) en la GPU de prueba.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a otra cuantización GLQ del mismo autor, aunque no se dispone de datos de rendimiento de esta última.

| Modelo | Parámetros totales | Contexto | AIME 2026 | Licencia | Tamaño en disco |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (bf16) | 26B | 256K | 88.3% | Apache 2.0 | ~52 GB |
| Este checkpoint (4 bpw) | 7.48B (según safetensors) | 256K (base) | 85.4% | Apache 2.0 | 13.95 GB |
| xv0y5ncu/gemma-4-26B-A4B-it-GLQ-4bpw | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No hay datos suficientes para comparar con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B).

## Limitaciones y advertencias

- **Incompatibilidad con transformers**: El modelo solo funciona con vLLM y GLQ ≥0.8.1; el uso con el pipeline de transformers produce salidas incoherentes.
- **Pérdida de rendimiento**: La cuantización reduce el resultado en AIME de 88.3% a 85.4%, una diferencia de 2.9 puntos. El autor indica que es estadísticamente no significativa, pero no se ha evaluado en otros benchmarks.
- **Contexto limitado en la práctica**: En la prueba se usó `max_model_len=40960`, no los 256K tokens del modelo base. No se garantiza que la cuantización mantenga la ventana completa sin degradación.
- **Falta de evaluaciones adicionales**: No se han publicado resultados de perplexity, MMLU-Pro, ni evaluaciones multi-turno o agénticas.
- **Riesgo de sesgos y alucinaciones**: Al ser un modelo de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos por su entrenamiento. No se han documentado sesgos específicos.
- **Dependencia de la versión de transformers**: Se recomienda pin `transformers>=5.13.1,<5.15`; la versión 5.15.0 rompe la carga del modelo.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-4bpw)
- [HuggingFace del modelo base](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Repositorio GLQ en GitHub](https://github.com/cnygaard/glq)
- [Model card de Gemma 4 (Google AI)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Documentación en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
