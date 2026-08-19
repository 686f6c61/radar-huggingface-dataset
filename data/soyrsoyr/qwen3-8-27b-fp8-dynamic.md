# soyrsoyr/Qwen3.8-27B-FP8-dynamic

## Resumen

Qwen3.8-27B-FP8-dynamic es una versión cuantizada del modelo Qwen/Qwen3.8-27B, un modelo de lenguaje multimodal (VLM) de la familia Qwen3.5 con arquitectura de atención híbrida. El autor, soyrsoyr, ha aplicado una cuantización FP8 (W8A8) con el esquema FP8 dinámico, utilizando la librería llm-compressor de vLLM. El objetivo es reducir el uso de memoria y acelerar la inferencia en hardware moderno (Ada, Hopper) manteniendo una degradación mínima de rendimiento respecto al modelo original en bf16.

Este modelo es relevante porque permite desplegar un VLM de 27.000 millones de parámetros en entornos con recursos limitados, aprovechando la aceleración nativa FP8 de las GPUs más recientes. La cuantización es data-free (sin calibración), lo que simplifica el proceso de conversión. El modelo conserva el predictor MTP (Multi-Token Prediction) para decodificación especulativa, lo que mejora la latencia en producción. Está pensado para servirse con vLLM, aunque también es compatible con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida (lineal y full attention), familia Qwen3.5 |
| Parametros totales | 27.359.595.760 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, sin indicacion de MoE) |
| Longitud de contexto | No disponible (evaluado hasta 32k tokens en pruebas de razonamiento) |
| Tipos de cuantizacion | FP8 (W8A8) dinamico: pesos FP8 E4M3 por canal RTN, activaciones FP8 por token dinamico |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un VLM de la familia Qwen3.5 que combina atención lineal y atención completa (hybrid-attention). La cuantización se realizó con llm-compressor, aplicando el esquema FP8_DYNAMIC únicamente a las capas `Linear` del decodificador de texto. Se excluyeron explícitamente la torre de visión (`re:.*visual.*`), los mezcladores de atención lineal (`re:.*linear_attn.*`), la capa `lm_head` y las puertas MLP (`re:.*mlp.gate$`), que permanecen en bf16. El proceso es data-free, es decir, no requiere datos de calibración. El predictor MTP (Multi-Token Prediction) se conserva para habilitar decodificación especulativa en vLLM. No se dispone de información sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación).

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando texto como salida (pipeline `image-text-to-text`).
- Razonamiento: el modelo base es descrito como "reasoning model", lo que sugiere capacidad para resolver problemas complejos con cadenas de pensamiento.
- Decodificación especulativa: el predictor MTP incorporado permite acelerar la generación en vLLM.
- Cuantización FP8: optimizado para hardware con soporte nativo FP8 (Ada, Hopper y posteriores), con fallback a fp8-Marlin en otras GPUs.
- Compatibilidad con vLLM y Transformers: se puede servir directamente con `vllm serve` o cargar con `AutoModelForImageTextToText`.
- No se han documentado capacidades específicas de tool calling, agentes o funciones adicionales en la información disponible.

## Casos de uso

- Asistencia visual en aplicaciones móviles: el modelo puede procesar imágenes capturadas por el usuario y responder preguntas sobre su contenido, gracias a su capacidad multimodal y razonamiento.
- Automatización de análisis de documentos: extraer información de imágenes de facturas, formularios o capturas de pantalla, generando resúmenes o respuestas estructuradas.
- Chatbots multimodales de atención al cliente: integrar el modelo en un sistema de chat que reciba imágenes (fotos de productos, errores en pantalla) y texto para ofrecer soporte contextualizado.
- Generación de descripciones alternativas (alt text): crear descripciones automáticas de imágenes para accesibilidad web o metadatos.
- Razonamiento visual en entornos de investigación: responder preguntas de opción múltiple sobre diagramas o gráficos científicos, aprovechando el modo de razonamiento del modelo.
- Despliegue en producción con vLLM: al ser una cuantización FP8, es adecuado para servir el modelo en GPUs Hopper o Ada con baja latencia, usando decodificación especulativa para aumentar el throughput.

## Benchmarks y rendimiento

Los resultados se obtuvieron evaluando la versión FP8 frente al modelo base bf16 mediante lm-evaluation-harness (OpenLLM v1) y lighteval (razonamiento generativo). La suite de razonamiento generativo aún está en ejecución y no se han publicado resultados.

| Benchmark | Qwen3.8-27B (bf16) | FP8-dynamic | Recovery |
| :-- | :--: | :--: | :--: |
| ARC-Challenge (25-shot), acc_norm | 50.68 | 49.91 | 98.5% |
| HellaSwag (10-shot), acc_norm | 71.99 | 72.38 | 100.5% |
| TruthfulQA-mc2 (0-shot), acc | 61.25 | 61.21 | 99.9% |
| Winogrande (5-shot), acc | 76.87 | 76.01 | 98.9% |
| **Promedio** | **65.20** | **64.88** | **99.5%** |

Nota: MMLU y GSM8K se omiten porque el modelo es de razonamiento y el protocolo OpenLLM v1 produce artefactos (truncamiento de la cadena de pensamiento y medición de loglikelihood en el bloque de pensamiento).

## Requisitos de hardware

- Tamaño del repositorio: 36.8 GB (incluye pesos FP8, predictor MTP y configuración).
- VRAM estimada para inferencia: al ser FP8, los pesos del decodificador ocupan aproximadamente 27.4 GB (27.36B parámetros × 1 byte). Se recomienda al menos 40 GB de VRAM para dejar espacio a activaciones y overhead.
- GPUs recomendadas: NVIDIA H100, A100 40GB/80GB (con soporte FP8 nativo en Ada/Hopper), o GPUs consumer como RTX 4090 (24GB) no son suficientes para este tamaño en FP8; se necesitaría al menos 40 GB.
- Opciones de despliegue: vLLM (recomendado), Transformers con `AutoModelForImageTextToText`, y posiblemente otros frameworks compatibles con compressed-tensors.
- Hardware sin FP8 nativo: puede ejecutarse mediante la ruta de dequantización fp8-Marlin, aunque con mayor latencia.
- Latencia y throughput: no se han publicado mediciones específicas; se espera que la decodificación especulativa (MTP) mejore el throughput en vLLM.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLM de ~27B con cuantización FP8). La comparativa más directa es con el modelo base en bf16:

| Modelo | Parametros | Contexto | Formato | Rendimiento (OpenLLM v1 avg) | Licencia |
| :-- | :--: | :--: | :--: | :--: | :--: |
| Qwen/Qwen3.8-27B (bf16) | 27.36B | No disponible | bf16 | 65.20 | Apache 2.0 |
| soyrsoyr/Qwen3.8-27B-FP8-dynamic | 27.36B | No disponible | FP8 (compressed-tensors) | 64.88 | Apache 2.0 |

La recuperación media es del 99.5%, lo que indica una pérdida mínima de precisión tras la cuantización.

## Limitaciones y advertencias

- La cuantización FP8 introduce una ligera degradación en algunos benchmarks (p. ej., ARC-Challenge 98.5% de recuperación), aunque el promedio es alto.
- La suite de razonamiento generativo aún no ha publicado resultados; el rendimiento en tareas de razonamiento complejo no está verificado.
- No se especifica la longitud máxima de contexto soportada; las pruebas de razonamiento se realizaron hasta 32k tokens, pero el límite real del modelo base es desconocido.
- No se han documentado sesgos, riesgos de alucinación o limitaciones idiomáticas específicas en la información disponible.
- El modelo está pensado para servirse con vLLM; el uso con otras herramientas puede requerir adaptaciones adicionales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8-dynamic)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [llm-compressor (librería de cuantización)](https://github.com/vllm-project/llm-compressor)
- [vLLM (servidor de inferencia)](https://github.com/vllm-project/vllm)
- [compressed-tensors (formato de cuantización)](https://github.com/neuralmagic/compressed-tensors)
