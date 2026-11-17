# symmetrisch/Qwen3.8-27B-Heretic2.1.0

## Resumen

symmetrisch/Qwen3.8-27B-Heretic2.1.0 es un ajuste fino del modelo Qwen/Qwen3.8-27B de Alibaba Qwen, publicado por el usuario symmetrisch y generado con la herramienta Heretic v2.1.0. Se trata de una variante "decensored" (también etiquetada como uncensored, abliterated) cuyo objetivo es eliminar los comportamientos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 6 a 60. El modelo conserva la arquitectura y los pesos del original, por lo que mantiene sus capacidades de razonamiento, código y visión.

El modelo base Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros con codificador de visión, pensado para tareas de agente de largo horizonte, código, trabajo profesional e investigación. Incorpora control flexible del modo de razonamiento (thinking), comprensión nativa de imágenes y vídeo, y una ventana de contexto de 262 144 tokens ampliable hasta 1 000 000. La variante Heretic modifica únicamente el comportamiento de alineación, no la arquitectura ni el entrenamiento base.

La relevancia de esta ficha radica en que documenta una modificación de seguridad sobre un modelo de referencia: reduce los rechazos de 98/100 a 9/100 en la evaluación del autor, con una divergencia KL de 0,1237 respecto al original. Es un artefacto de investigación sobre alineación y ablación, no un modelo recomendado para despliegues en producción sin una evaluación de seguridad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; capas híbridas Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27 356 728 560 (≈27,36 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, ampliable hasta 1 000 000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Layout de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas de atencion | Gated DeltaNet: 48 para V y 16 para QK, dim. 128; Gated Attention: 24 para Q y 4 para KV, dim. 256 |
| Dimensión FFN | 17 408 |
| Vocabulario | 248 320 (con padding) |
| MTP (Multi-Token Prediction) | Entrenado con múltiples pasos |
| Tamano del repo | 54,8 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de visión. Su diseño híbrido alterna bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) con bloques de Gated Attention clásica (24 cabezas Q y 4 KV, dimensión 256, RoPE de 64 dimensiones). El layout concreto repite 16 veces el patrón de tres bloques DeltaNet seguidos de uno de atención completa, lo que reduce el coste de atención en contextos largos. La dimensión oculta es 5120, la FFN intermedia 17 408 y el vocabulario 248 320 entradas. El modelo fue entrenado en dos fases, preentrenamiento y postentrenamiento, e incluye Multi-Token Prediction entrenado con varios pasos, lo que habilita decodificación especulativa nativa.

La variante Heretic 2.1.0 no reentrena el modelo: aplica una ablación de rangos arbitrarios (ARA) sobre las capas 6 a 60 con los parámetros start_layer_index=6, end_layer_index=60, preserve_good_behavior_weight=0,9265, steer_bad_behavior_weight=0,0003, overcorrect_relative_weight=0,9962 y neighbor_count=13. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeo (image-text-to-text): diagramas STEM, documentos y vídeos de hasta una hora.
- Generación de código y tareas de trabajo profesional e investigación, según las mejoras declaradas del modelo base.
- Ejecución de agentes autónomos con planificación y manejo de retroalimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares (según la model card del base).
- Capacidades multilingües: no disponible el detalle de idiomas.
- Comportamiento "decensored": reducción drástica de rechazos (9/100 frente a 98/100 del original).

## Casos de uso

- Investigación sobre alineación y ablación: el modelo sirve como caso de estudio reproducible para medir el efecto de ARA sobre el comportamiento de rechazo, comparando la divergencia KL (0,1237) con la tasa de rechazos residual (9/100).
- Análisis de documentos técnicos con visión: al ser image-text-to-text, puede procesar diagramas, tablas e informes escaneados y responder preguntas sobre ellos en una sola pasada.
- Procesamiento de vídeo de larga duración: su contexto de 262 144 tokens permite resumir o extraer información de vídeos de hasta una hora sin truncar.
- Agentes de código en pipelines de CI/CD: el modelo base está orientado a tareas agénticas de largo horizonte y a integración con harnesses de desarrollo, lo que permite tareas de refactorización o corrección multi-paso.
- Generación de contenido creativo sin restricciones de estilo: útil en entornos de investigación donde se necesita estudiar la generación sin filtros de seguridad, siempre con revisión humana.
- Evaluación comparativa de robustez: permite medir cómo cambia el rendimiento en benchmarks estándar tras la ablación, usando el original como referencia.
- Prototipado de asistentes conversacionales multi-turno con contexto largo, aprovechando la ventana extendida y el modo thinking configurable.

## Benchmarks y rendimiento

La model card del autor solo publica métricas de la modificación Heretic, no resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). La tabla de benchmarks del modelo base aparece truncada en la información disponible, por lo que no se pueden reproducir sus cifras.

| Metrica | Este modelo | Qwen3.8-27B original |
|---|---|---|
| Rechazos | 9/100 | 98/100 |
| Divergencia KL | 0,1237 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 27,36 B de parámetros en safetensors, la inferencia en fp16 requiere aproximadamente 55 GB de VRAM; en int8 unos 28 GB; en int4 unos 14-16 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o RTX 6000 Ada para int8; RTX 4090 (24 GB) viable solo con cuantización int4.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4 bits, siempre que se genere la cuantización, ya que el repo solo publica safetensors.
- Opciones de despliegue: transformers, vLLM, SGLang y TokenSpeed según la model card del base; llama.cpp u Ollama requerirían convertir los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| symmetrisch/Qwen3.8-27B-Heretic2.1.0 | 27,36 B | 262 144 (hasta 1 M) | Sí | Apache 2.0 | Variante decensored con ARA; 9/100 rechazos |
| Qwen/Qwen3.8-27B | 27 B | 262 144 (hasta 1 M) | Sí | Apache 2.0 | Modelo base alineado; 98/100 rechazos |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Generación anterior de la familia Qwen; datos truncados en la información disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina filtros de seguridad: el modelo puede generar contenido dañino, ilegal o sexualmente explícito; requiere moderación externa en cualquier despliegue real.
- Riesgo de alucinación inherente al modelo base, no mitigado por la modificación.
- La divergencia KL de 0,1237 indica que la distribución de salida se ha desplazado respecto al original; puede degradar sutilmente tareas que dependían de la alineación.
- Solo se publican safetensors: no hay cuantizaciones oficiales ni GGUF, lo que encarece el despliegue en hardware de consumo.
- Idiomas soportados no documentados; el comportamiento multilingüe debe validarse empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La model card del base menciona un servicio alojado (Qwen Cloud) con contexto de 1 M por defecto; la versión local no garantiza ese contexto sin configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic: https://heretic-project.org
- Instrucciones de reproducción: https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0/tree/main/reproduce
- Qwen Cloud (servicio alojado del base): https://www.qwencloud.com/models/qwen3.8-27b
