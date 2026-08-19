# unsloth/Qwen3.8-27B-FP8

## Resumen

El modelo `unsloth/Qwen3.8-27B-FP8` es una versión cuantizada en FP8 de grano fino (bloque de 128) del modelo Qwen3.8-27B, desarrollado por Qwen y posteriormente optimizado por Unsloth para reducir la huella de memoria y acelerar la inferencia sin pérdidas significativas de rendimiento. Se distribuye bajo licencia Apache 2.0 y es compatible con los principales frameworks de inferencia como Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

Qwen3.8-27B es un modelo de lenguaje causal denso de 27 000 millones de parámetros con encoder de visión, diseñado para tareas de razonamiento complejo, generación de código, trabajo profesional y ejecución de agentes de largo horizonte. Incorpora una arquitectura híbrida con Gated DeltaNet y Gated Attention, soporte nativo de imágenes y vídeo, y una ventana de contexto nativa de 262 144 tokens extensible hasta 1 000 000. El modelo opera en modo pensamiento por defecto, con control flexible de la profundidad de razonamiento mediante `reasoning_effort` y conservación del contexto de razonamiento con `preserve_thinking`.

Esta ficha se centra en la versión cuantizada FP8, que mantiene las capacidades del modelo original con un tamaño de repositorio de 30,9 GB, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión, Gated DeltaNet y Gated Attention |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | FP8 (grano fino, bloque de 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros con una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention). La configuración interna incluye 64 capas, dimensión oculta de 5120, 48 cabezas de atención lineal para V y 16 para QK, 24 cabezas de atención para Q y 4 para KV, y una dimensión de FFN de 17 408. Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El modelo fue entrenado en dos etapas: pre-entrenamiento y post-entrenamiento, aunque no se proporcionan detalles específicos sobre el volumen de tokens ni la composición del dataset. La versión FP8 de Unsloth aplica cuantización de grano fino con bloque de 128, lo que preserva el rendimiento casi idéntico al modelo original. El modelo base es `Qwen/Qwen3.8-27B`, y esta variante cuantizada mantiene la misma arquitectura y capacidades.

## Capacidades

- Generación de texto y razonamiento complejo, con modo pensamiento activado por defecto y control de profundidad mediante `reasoning_effort` (xhigh, medium, low).
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte, con planificación autónoma y manejo de retroalimentación del entorno.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y flujos de automatización.
- Capacidades multilingües (no confirmadas oficialmente en la documentación disponible).
- Conservación del contexto de razonamiento en conversaciones multi-turno mediante `preserve_thinking`.
- Compatibilidad con frameworks de inferencia estándar (Transformers, vLLM, SGLang, TokenSpeed) y con la API de Qwen Cloud para despliegue gestionado.

## Casos de uso

- Asistencia al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262 144 tokens) y mantener el hilo de razonamiento, lo que permite resolver consultas complejas sin perder información previa.
- Generación de código en producción: con soporte de tool calling y razonamiento profundo, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado en entornos de desarrollo.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, gráficos y tablas en PDFs o imágenes, facilitando tareas de investigación y documentación.
- Agentes autónomos de automatización de tareas: gracias a su planificación multi-paso y manejo de retroalimentación, puede ejecutar flujos de trabajo complejos como gestión de correos, programación de citas o integración con APIs externas.
- Transcripción y resumen de vídeos: al procesar vídeo de larga duración, puede generar resúmenes, extraer conclusiones o indexar contenido audiovisual para búsquedas posteriores.
- Asistente de razonamiento matemático y STEM: su modo pensamiento con `reasoning_effort` alto permite resolver problemas de álgebra, cálculo o física con explicaciones detalladas, útil en entornos educativos o de investigación.
- Despliegue en entornos con recursos limitados: la versión FP8 reduce los requisitos de VRAM, permitiendo ejecutar el modelo en GPUs de gama media-alta (por ejemplo, RTX 4090 con 24 GB) o en clústeres con múltiples GPUs, manteniendo un rendimiento cercano al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares, ni comparativas con modelos similares. Se recomienda consultar la documentación oficial de Qwen para obtener datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB para la versión FP8 (27,8 GB de pesos + overhead de activaciones y KV cache). Con contexto largo, la memoria adicional puede superar los 40 GB.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, o GPUs con 48 GB o más (por ejemplo, RTX A6000, L40S). En GPUs de 24 GB (RTX 4090) puede ser ajustado con contexto reducido y cuantización adicional, pero no es recomendable para producción.
- No cabe en GPUs de consumo de 16 GB o menos sin cuantización adicional (por ejemplo, GGUF de 4 bits), aunque esta versión solo ofrece FP8.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, y la API gestionada de Qwen Cloud.
- Latencia y throughput: no disponibles en la documentación. Se espera que la cuantización FP8 mejore el throughput respecto al modelo BF16, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otras alternativas. Sin embargo, estructuralmente se puede comparar con otros modelos densos de tamaño similar:

| Modelo | Parametros | Contexto | Vision | Licencia | Cuantizacion disponible |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 262 144 (ext. 1M) | Sí | Apache 2.0 | BF16, FP8 |
| Qwen2.5-32B | 32,8 B | 131 072 | No | Apache 2.0 | BF16, FP8, GGUF |
| Llama 3.1 8B | 8 B | 131 072 | No | Llama 3.1 | BF16, FP8, GGUF |

La comparativa se limita a características estructurales; no se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones específicos del modelo. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La ventana de contexto de 262 144 tokens es nativa, pero la extensión a 1M puede requerir técnicas de interpolación posicional y aumentar el consumo de memoria.
- El modo pensamiento está activado por defecto, lo que incrementa el número de tokens generados y la latencia. Es necesario desactivarlo explícitamente para respuestas directas.
- La cuantización FP8 puede introducir ligeras pérdidas de precisión en tareas de alta sensibilidad numérica, aunque Unsloth indica que el rendimiento es casi idéntico al original.
- No se especifican los idiomas soportados; se asume multilingüismo basado en la familia Qwen, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la API de Qwen Cloud si se utiliza el servicio gestionado.
- Para producción, se recomienda usar frameworks de inferencia dedicados (vLLM, SGLang) en lugar de Transformers puro, para obtener mejor throughput y gestión de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cookbook SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8
- Recipe vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Recipe TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#qwen3-8
- Qwen Cloud (API gestionada): https://www.qwencloud.com/models/qwen3.8-27b
