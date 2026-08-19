# trohrbaugh/Qwen3.8-27B-heretic-ara

## Resumen

El modelo `trohrbaugh/Qwen3.8-27B-heretic-ara` es una versión modificada del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba, sometida a un proceso de "abliteración" (abliteration) mediante la herramienta Heretic en una bifurcación personalizada, utilizando el método Arbitrary-Rank Ablation (ARA). El objetivo de esta modificación es eliminar los comportamientos de rechazo del modelo original, de modo que responda a peticiones que normalmente serían denegadas por las políticas de seguridad, manteniendo en lo posible el resto de capacidades.

El modelo base, Qwen3.8-27B, es un modelo de lenguaje causal denso de 27 000 millones de parámetros con codificador de visión nativo (image-text-to-text), capaz de procesar imágenes y vídeo, con un contexto nativo de 262 144 tokens ampliable hasta 1 000 000. Incorpora un diseño híbrido con capas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), además de predicción multi-token (MTP). La versión heretic-ara conserva estas características técnicas, pero altera los pesos mediante abliteración para reducir drásticamente la tasa de rechazos (de 99/100 a 0/100 en las pruebas del autor), con una divergencia KL de 0,0535 respecto al original.

Este modelo resulta relevante para la comunidad de investigación en alineación y seguridad de IA, así como para desarrolladores que necesitan un modelo de propósito general sin restricciones de contenido, aunque su uso conlleva riesgos importantes que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Qwen3.8-27B modificado) |
| Parametros totales | 27.356.728.560 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer causal denso con codificador de visión. La parte de lenguaje tiene 64 capas con una disposición interna de 16 bloques, cada uno compuesto por 3 sub-bloques de `Gated DeltaNet → FFN` seguidos de 1 sub-bloque de `Gated Attention → FFN`. La Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas para V y 16 para QK (dimensión de cabeza 128), mientras que la Gated Attention clásica usa 24 cabezas para Q y 4 para KV (dimensión de cabeza 256, RoPE de dimensión 64). La dimensión oculta es 5120, el FFN intermedio es de 17 408 y el embedding de salida está rellenado a 248 320. El modelo fue entrenado con predicción multi-token (MTP) en varias etapas.

La modificación heretic-ara aplica abliteración con el método Arbitrary-Rank Ablation (ARA) sobre las capas 26 a 56, con los siguientes parámetros: `preserve_good_behavior_weight` = 0,9432, `steer_bad_behavior_weight` = 0,0009, `overcorrect_relative_weight` = 0,5038 y `neighbor_count` = 10. Según el autor, el resultado es una reducción de rechazos de 99/100 a 0/100 en una prueba de 100 prompts, con una divergencia KL de 0,0535 respecto al modelo original, lo que indica una alteración relativamente baja del comportamiento general.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades lingüísticas del Qwen3.8-27B, incluyendo razonamiento complejo y matemáticas.
- Comprensión de imágenes y vídeo: al ser un modelo de visión-lenguaje nativo, puede interpretar diagramas STEM, documentos, imágenes y vídeos de hasta una hora de duración.
- Modo de pensamiento (thinking mode): activado por defecto, con control de esfuerzo de razonamiento (`reasoning_effort`) y preservación del contexto de razonamiento (`preserve_thinking`).
- Ejecución de agentes: planificación autónoma y manejo de feedback del entorno para tareas de varios pasos.
- Tool calling / function calling: soporte integrado, según las capacidades del modelo base.
- Respuesta sin rechazos: la principal diferencia con el original es que no rechaza peticiones que el modelo base denegaría, lo que amplía el rango de temas tratables (con los riesgos asociados).

## Casos de uso

- Investigación en alineación y seguridad de IA: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, comparando con el original para analizar la efectividad de la abliteración y sus efectos en la calidad de las respuestas.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas tabú o controvertidos que el modelo original bloquearía.
- Análisis de sesgos y comportamientos indeseados: útil para auditar qué tipos de peticiones activan rechazos en el modelo original y cómo responde el modelo abliteado, contribuyendo a mejorar las técnicas de alineación.
- Desarrollo de asistentes conversacionales especializados: en dominios donde se requiere una respuesta directa sin filtros de seguridad, como ciertos entornos de simulación o juegos de rol.
- Evaluación de robustez de modelos: probar la resistencia del modelo a jailbreaks o prompts adversariales, dado que ya no tiene barreras de rechazo.
- Despliegue en entornos controlados de investigación: uso en laboratorios que necesitan un modelo de 27B con visión y contexto largo, sin las restricciones de contenido del original, bajo supervisión experta.

## Benchmarks y rendimiento

La model card del autor solo proporciona métricas de la abliteración (divergencia KL y tasa de rechazos), no resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión modificada. La model card original de Qwen3.8-27B incluye una tabla de benchmarks comparativos con Qwen3.6-27B y Qwen3.7-Plus, pero los valores numéricos no están disponibles en la información proporcionada. Por tanto:

No se han publicado resultados de benchmarks para esta versión heretic-ara en la información disponible. Se recomienda consultar la model card del modelo original para conocer el rendimiento base de Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27 356 millones de parámetros. En FP16/FP32 ocupa aproximadamente 55 GB de pesos (el repo pesa 55,6 GB). Con cuantización a 4 bits (Q4_K_M, ~14-15 GB) o 8 bits (~28 GB) se podría ejecutar en GPUs de consumo.
- GPU recomendadas: para FP16, se necesitan GPUs con al menos 60-80 GB de VRAM, como A100 80GB, H100 80GB o A6000 48GB (con cuantización). Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser suficiente; para 4 bits, también RTX 3090/4090.
- Compatibilidad con consumer GPU: sí, con cuantización GGUF o AWQ de 4 bits, aunque no se han publicado cuantizaciones oficiales para esta versión.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la model card del original. Para cuantización local, se podría convertir a GGUF para llama.cpp u Ollama, pero no hay archivos preconvertidos disponibles.
- Latencia y throughput: no disponible. Dependerá del hardware y del método de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Rechazos | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K (ext. 1M) | Sí | 99/100 (según autor) | Apache-2.0 |
| Qwen3.8-27B-heretic-ara | 27B | 262K (ext. 1M) | Sí | 0/100 | Apache-2.0 |
| Qwen3.6-27B | 27B | No disponible | No disponible | No disponible | Apache-2.0 |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con Qwen3.6-27B y Qwen3.7-Plus se menciona en la model card original de Qwen3.8-27B, pero no se dispone de sus especificaciones detalladas. La principal diferencia de este modelo frente a otras versiones abliteadas (por ejemplo, las basadas en Dolphin o en otras técnicas de "uncensoring") es que usa el método ARA de Heretic, que busca preservar el comportamiento bueno mientras elimina los rechazos, con una divergencia KL baja (0,0535).

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar los rechazos, el modelo puede generar contenido violento, ilegal, discriminatorio o sexualmente explícito sin filtros. Su uso debe limitarse a entornos de investigación controlados y con supervisión.
- Alucinaciones: como cualquier modelo de lenguaje, puede producir información falsa o inventada, especialmente en temas de actualidad o especializados.
- Sesgos: el proceso de abliteración no elimina los sesgos del modelo original; puede amplificarlos al no rechazar ciertas peticiones sesgadas.
- Divergencia de comportamiento: aunque la divergencia KL es baja (0,0535), la modificación de pesos en las capas 26-56 puede afectar a la calidad de las respuestas en tareas que dependen de esas capas.
- Sin garantías de producción: el autor no ha publicado benchmarks de rendimiento ni pruebas de robustez. No se recomienda su uso en producción sin una evaluación exhaustiva.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario es responsable del contenido generado. No hay restricciones adicionales documentadas.
- Cuantizaciones no disponibles: no hay versiones GGUF o AWQ publicadas, lo que limita el despliegue en entornos con recursos reducidos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Bifurcación personalizada de Heretic: https://github.com/timrohrbaugh/heretic
- PR del método ARA: https://github.com/p-e-w/heretic/pull/211
