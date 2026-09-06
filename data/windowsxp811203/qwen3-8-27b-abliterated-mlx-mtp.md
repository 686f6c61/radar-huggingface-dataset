# windowsxp811203/Qwen3.8-27B-Abliterated-MLX-MTP

## Resumen

Qwen3.8-27B-Abliterated-MLX-MTP es una conversión a formato MLX (Apple Silicon) del modelo Qwen3.8-27B-Abliterated, publicado por el usuario windowsxp811203. El modelo base es una versión "abliterated" de Qwen3.8-27B, es decir, se le han eliminado los rechazos de seguridad para fines de investigación en alineación y comportamiento de modelos. Esta conversión preserva la cabeza de predicción múltiple de tokens (MTP) nativa en el checkpoint y mantiene la torre de visión sin cuantizar, lo que lo hace adecuado para tareas multimodal (imagen-texto) en hardware de Apple.

El repositorio incluye varias cuantizaciones oMLX oQ (oQ4e, oQ6e, oQ8e), la conversión sin cuantizar en bf16 y un drafter separado para decodificación especulativa con mlx-vlm. Todos los pesos están en formato safetensors y la licencia es Apache-2.0. La longitud de contexto configurada en los ejemplos es de 262144 tokens. El modelo está pensado para ejecutarse en Macs con chips M-series y se integra con oMLX y mlx-vlm, aunque no es compatible con mlx-lm ni LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de visión y MTP (multi-token prediction) |
| Parametros totales | 27B (según nomenclatura del modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262144 (según configuración de ejemplo) |
| Tipos de cuantizacion | oQ4e, oQ6e, oQ8e, bf16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen3.8-27B, un transformer multimodal que procesa tanto texto como imágenes. En esta conversión MLX, la torre de visión se mantiene sin cuantizar para preservar la calidad de la comprensión visual, mientras que el resto del modelo se ofrece en varias cuantizaciones oMLX oQ. El checkpoint incluye la cabeza MTP (multi-token prediction) nativa, que permite decodificación especulativa y aceleración de la inferencia en hardware Apple Silicon.

No se han proporcionado datos sobre el proceso de entrenamiento del modelo base, como el número de tokens, la composición del dataset o si hubo RLHF/DPO. La innovación principal de este repositorio es la preservación del MTP en el checkpoint cuantizado y la inclusión de un drafter separado para mlx-vlm, así como el conjunto completo de scripts y mediciones para reproducir las cuantizaciones y evaluaciones.

## Capacidades

- Generación de texto y respuesta a imágenes gracias a la torre de visión (pipeline image-text-to-text).
- Soporte de MTP (multi-token prediction) para decodificación especulativa, lo que reduce la latencia en Apple Silicon.
- Multilingüe en inglés y chino, tanto para entrada como para salida.
- Modo de razonamiento "thinking" disponible (las mediciones del autor se realizaron con thinking desactivado).
- Ausencia de rechazos de seguridad (abliterated), lo que permite estudiar el comportamiento del modelo sin filtros de contenido.
- Cuantizaciones oMLX oQ con preservación del MTP y de la torre de visión sin cuantizar.
- Compatibilidad con oMLX para servir el modelo y con mlx-vlm para tareas de visión.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite analizar cómo se comporta un LLM sin rechazos, útil para estudiar jailbreaks, medir la eficacia de los entrenamientos de alineación y desarrollar defensas.
- Despliegue en Apple Silicon: las cuantizaciones MLX están diseñadas para ejecutarse eficientemente en Macs con chips M-series, aprovechando la memoria unificada y el soporte de MTP.
- Procesamiento de imágenes y texto: gracias a la torre de visión sin cuantizar, puede usarse en aplicaciones que requieran comprensión visual, como descripción de imágenes o respuesta a preguntas sobre contenido visual.
- Generación de texto multilingüe en inglés y chino: adecuado para asistentes o herramientas que operen en esos idiomas, con soporte para contexto largo de hasta 262144 tokens.
- Inferencia acelerada con MTP: el drafter separado permite integrar decodificación especulativa en mlx-vlm, reduciendo el tiempo de generación en tareas de visión.
- Evaluación del impacto de la cuantización: el repositorio incluye scripts y mediciones detalladas para comparar el rendimiento y la calidad entre oQ4e, oQ6e, oQ8e y bf16, útil para seleccionar el nivel de compresión adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU completo, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias en un MacBook Pro M5 Max 128 GB, con MTP activado y thinking desactivado. Estos datos son internos y no son comparables con benchmarks de referencia.

| Build | Tamaño | bpw | MMLU-400 (5-shot) | Velocidad con MTP | Refusals AdvBench / HarmBench |
|---|---|---|---|---|---|
| oQ4e | 15.81 GiB | 4.68 | 81.75 % | ~34 tok/s (depth 4) | 0/80 / 0/119 |
| oQ6e | 22.09 GiB | 6.659 | 82.50 % | ~24 tok/s (depth 4) | 0/80 / 0/119 |
| oQ8e | 27.94 GiB | 8.501 | 82.75 % | ~28 tok/s (depth 3) | 0/80 / 0/119 |
| bf16 | 51.75 GiB | 16 | 82.50 % | Referencia | 1/520 / 0/293 |

MMLU-400 es una muestra estratificada de 400 preguntas de oMLX, no el benchmark MMLU completo. Las velocidades son mediciones del autor con MTP activado.

## Requisitos de hardware

- VRAM estimada para inferencia: oQ4e 15.81 GiB, oQ6e 22.09 GiB, oQ8e 27.94 GiB, bf16 51.75 GiB.
- GPU recomendada: Apple Silicon con al menos 32 GB de memoria unificada para oQ4e; el autor utilizó un MacBook Pro M5 Max 128 GB.
- No es compatible con GPUs CUDA; el formato MLX está limitado a hardware Apple.
- Opciones de despliegue: oMLX (con `omlx serve` y configuración de MTP en `model_settings.json`), mlx-vlm 0.6.17 (con `--draft-model` para usar el drafter). No soportado por mlx-lm ni LM Studio.
- Latencia estimada: ~34 tok/s para oQ4e con MTP depth 4, ~24 tok/s para oQ6e y ~28 tok/s para oQ8e en el hardware de referencia. Throughput adicional no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- El modelo no rechaza contenido: fue diseñado para eliminar las negativas de seguridad, por lo que puede generar respuestas dañinas o inapropiadas. El autor lo publica exclusivamente para investigación en alineación y seguridad.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- No es compatible con mlx-lm ni LM Studio; el uso requiere oMLX o mlx-vlm en versiones concretas.
- Los benchmarks proporcionados son mediciones internas del autor, no estándar, y pueden no reflejar el rendimiento en otros entornos.
- Riesgo general de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de veracidad.
- La licencia Apache-2.0 permite uso comercial, pero el disclaimer del autor indica que el modelo se publica para investigación; el uso responsable es responsabilidad del usuario.

## Enlaces

- Modelo: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-MLX-MTP
- Modelo base: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
