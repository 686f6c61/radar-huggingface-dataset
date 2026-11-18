# symmetrisch/Qwen3.8-27B-heretic-ara-v1

## Resumen

symmetrisch/Qwen3.8-27B-heretic-ara-v1 es una versión "decensored" (sin censura, también etiquetada como abliterated) del modelo Qwen3.8-27B de Alibaba Qwen, generada con la herramienta Heretic v2.1.0 mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA). El objetivo declarado es eliminar los comportamientos de rechazo del modelo original manteniendo al máximo sus capacidades, con un proceso reproducible publicado en el propio repositorio.

El modelo base es un transformer denso causal con codificador de visión, de 27B parámetros, 64 capas, dimensión oculta de 5120 y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un patrón repetido 16 veces, e incorpora predicción multi-token (MTP) entrenada en varios pasos.

Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal con control flexible de razonamiento (thinking mode) y contexto muy largo, pero sin las restricciones de rechazo del modelo original; el autor reporta una reducción de rechazos de 98/100 a 8/100 con una divergencia KL de 0,0830 respecto al original. La licencia es Apache 2.0 y los pesos están en safetensors, compatibles con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention |
| Parámetros totales | 27.356.728.560 (≈27,36B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

Datos arquitectónicos adicionales del modelo base: 64 capas, dimensión oculta 5120, embedding de tokens 248.320 (con padding), dimensión intermedia de la FFN 17.408. Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128. Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión RoPE 64. Layout de capas: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Tamaño del repositorio: 54,8 GB.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso que intercala bloques de atención lineal Gated DeltaNet con bloques de Gated Attention en una proporción de 3:1, lo que reduce el coste de atención en contextos largos manteniendo la calidad de la atención completa. Incluye un codificador de visión para comprensión nativa de imágenes y vídeo (desde diagramas STEM y documentos hasta vídeos de una hora), y fue entrenado con predicción multi-token (MTP) en varios pasos. El modelo base pasa por preentrenamiento y postentrenamiento; la model card no detalla el número de tokens, la composición del dataset ni si se usaron RLHF o DPO.

Sobre esta base, el autor aplica Heretic v2.1.0 con ablación de rango arbitrario (ARA) entre las capas 4 y 64, con los parámetros: preserve_good_behavior_weight 0,5711, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,9925 y neighbor_count 9. El proceso es reproducible (directorio `reproduce` con README). El resultado medido es una caída de rechazos de 98/100 a 8/100 con una divergencia KL de 0,0830 frente al modelo original, lo que indica una modificación de pesos moderada pero no nula.

## Capacidades

- Generación de texto, razonamiento y tareas profesionales y de investigación.
- Generación y comprensión de código, con mejoras declaradas en tareas de programación.
- Comprensión nativa de imagen y vídeo (pipeline image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para tareas de múltiples pasos.
- Control flexible del razonamiento: thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (según la model card del modelo base).
- Comportamiento sin censura: reducción drástica de rechazos (8/100 frente a 98/100 del original).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible para este modelo; la model card del base menciona herramientas integradas solo para la versión alojada en Qwen Cloud.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación ARA comparando respuestas con el Qwen3.8-27B original, gracias a la reproducibilidad del proceso y a la métrica de divergencia KL publicada.
- Procesamiento de documentos largos con imágenes: informes, patentes o expedientes de cientos de miles de tokens que combinan texto y figuras, aprovechando el contexto nativo de 262.144 tokens y el codificador de visión.
- Análisis de vídeo de larga duración: resumen y extracción de información de vídeos de hasta una hora (clases, reuniones, material audiovisual) mediante el pipeline image-text-to-text.
- Agentes autónomos de múltiples pasos: tareas de planificación y ejecución con retroalimentación del entorno, donde el control de `reasoning_effort` permite ajustar coste y latencia por petición.
- Asistencia a la programación en producción: generación y revisión de código en pipelines, con la cautela de validar las salidas por la ausencia de censura y el consiguiente riesgo de contenido inapropiado.
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o contenido para adultos donde los rechazos del modelo original resultan un obstáculo, asumiendo la responsabilidad legal y ética del despliegue.
- Evaluación comparativa de robustez: banco de pruebas para medir cómo afecta la eliminación de rechazos a la calidad en tareas estándar (benchmarks de razonamiento y código) frente al modelo base.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de rendimiento específica del proceso de decensurado:

| Métrica | Este modelo | Modelo original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Rechazos | 8/100 | 98/100 |
| Divergencia KL | 0,0830 | 0 (por definición) |

La model card del modelo base incluye tablas de benchmarks de texto (comparando Qwen3.8-27B con Qwen3.6-27B y Qwen3.7-Plus), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos (27,36B × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- Cuantización a 8 bits: ~28 GB de pesos; a 4 bits: ~14-16 GB de pesos. No se publican cuantizaciones oficiales en el repositorio.
- GPU recomendadas: H100 80 GB, A100 80 GB o múltiples A100 40 GB para BF16. Para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría alojar los pesos, con margen limitado para contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización agresiva (4 bits), aunque el contexto útil se verá reducido por la caché KV.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (según la model card del base). No se mencionan GGUF, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| symmetrisch/Qwen3.8-27B-heretic-ara-v1 | 27,36B denso | 262.144 (hasta 1M) | Sí (imagen y vídeo) | Apache 2.0 | Variante sin censura; 8/100 rechazos |
| Qwen/Qwen3.8-27B | 27B denso | 262.144 (hasta 1M) | Sí (imagen y vídeo) | Apache 2.0 | Modelo base; 98/100 rechazos |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Generación anterior de Qwen; benchmarks parciales en la model card del base |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Modelo de la familia Qwen comparado en la model card del base |

No se dispone de datos de benchmarks numéricos para establecer comparaciones de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inapropiado; el despliegue en producción requiere filtros y moderación externos.
- La divergencia KL de 0,0830 respecto al original indica que los pesos han sido modificados de forma no trivial; pueden aparecer degradaciones sutiles en tareas estándar no medidas en la model card.
- No se detallan los idiomas soportados; el comportamiento multilingüe debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se publican evaluaciones específicas de factualidad para esta variante.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan presumiblemente los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- El contexto extensible a 1.000.000 tokens corresponde a la versión alojada en Qwen Cloud según la model card del base; el comportamiento local a esa longitud no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symmetrisch/Qwen3.8-27B-heretic-ara-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de decensurado): https://heretic-project.org
- Qwen Cloud (servicio alojado del modelo base): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
