# tbhrc/gemma_4_e4b_it_claude_opus_4_5_heretic_uncensored_thinking_mxfp8

## Resumen

Este modelo es una adaptación cuantizada en formato mxfp8 del modelo `DavidAU/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking`, que a su vez es una versión modificada de la familia Gemma 4 de Google. El autor, `tbhrc`, ha publicado esta versión en formato MLX (para Apple Silicon) con cuantización de 8 bits, lo que reduce el tamaño del modelo a aproximadamente 8.8 GB en el repositorio. El modelo base ha sido sometido a un proceso de "de-censura" (denominado "Heretic") y posteriormente afinado con un conjunto de datos de razonamiento generados por Claude Opus 4.5, lo que mejora sus capacidades de razonamiento y análisis.

Con 2.588.711.498 parámetros (~2.6B), este modelo se posiciona como una opción ligera y eficiente para ejecución local en hardware de consumo, especialmente en equipos Apple con chips M-series. Su licencia apache-2.0 permite uso comercial y modificación, aunque la licencia original de Gemma 4 impone ciertas restricciones adicionales que deben considerarse. El modelo está diseñado para tareas de razonamiento, análisis matemático y conversación, aunque su naturaleza "uncensored" implica que no tiene filtros de seguridad sobre el contenido generado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4) |
| Parametros totales | 2.588.711.498 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8 (8-bit) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con términos adicionales de la licencia de Gemma 4) |
| Formato de pesos | safetensors, MLX (mxfp8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, aunque los detalles específicos sobre si utiliza una variante MoE o un transformer denso no se proporcionan en la documentación disponible. El nombre "E4B" sugiere que podría tratarse de una configuración eficiente con 4B parámetros activos, pero los datos de parámetros totales (2.6B) contradicen esta hipótesis, por lo que se requiere confirmación oficial. La cuantización mxfp8 reduce la precisión a 8 bits, optimizando el modelo para inferencia en hardware con memoria limitada, como los chips Apple Silicon.

El proceso de entrenamiento se describe como un "fine-tuning" sobre el modelo base `DavidAU/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking`, que fue "de-censurado" mediante técnicas de ajuste y posteriormente afinado con un dataset de razonamiento generado por Claude Opus 4.5. Este dataset se centra en mejorar la capacidad de razonamiento lógico, matemático y de análisis profundo. El modelo no ha sido entrenado desde cero; es una adaptación de un modelo existente con un enfoque en la reducción de restricciones de contenido y la potenciación de la reflexión y la auto-consciencia en las respuestas.

## Capacidades

- Generación de texto y razonamiento profundo: el modelo es capaz de producir análisis extensos y estructurados, como se muestra en el ejemplo de la model card, donde realiza una analogía matemática entre la mecánica cuántica y el proceso de inferencia en transformers.
- Análisis matemático y conceptual: puede descomponer problemas complejos en pasos formales, utilizando notación matemática (ecuaciones, operadores) cuando el contexto lo requiere.
- Conversación y auto-reflexión: el modelo puede adoptar un rol definido, reflexionar sobre sus propias respuestas y evaluar su proceso de inferencia (como se muestra en el ejemplo de la prueba).
- Capacidad de razonamiento multi-paso: el ejemplo de la model card muestra que el modelo planifica una respuesta estructurada con pasos y una lista de verificación antes de generar el texto final.
- Sin filtros de seguridad: al ser una versión "uncensored", no aplica restricciones de contenido, lo que permite generar respuestas sobre temas sensibles o controvertidos sin limitaciones.
- Soporte para tool handling: la model card menciona que la plantilla Jinja fue actualizada para mejorar el manejo de herramientas, aunque no se detalla su implementación.

## Casos de uso

- Asistente personal de análisis técnico: el modelo puede utilizarse para generar informes o explicaciones sobre conceptos complejos, como física cuántica, matemáticas avanzadas o ingeniería, gracias a su capacidad de razonamiento formalizado.
- Generación de contenido creativo: con su capacidad de adoptar personajes y mantener coherencia narrativa, puede utilizarse para redactar historias, diálogos o guiones, especialmente en contextos donde se requiere una voz sin restricciones.
- Chatbot de investigación: en entornos de laboratorio o académicos, el modelo puede servir como un asistente de discusión que profundiza en temas y ofrece perspectivas alternativas, aunque con la advertencia de su naturaleza sin filtros.
- Análisis de datos y razonamiento lógico: su capacidad para estructurar argumentos y realizar análisis multi-paso lo hace útil para tareas de clasificación de información, síntesis de documentos y extracción de conclusiones.
- Prototipado de aplicaciones de IA en Apple Silicon: al estar cuantizado en mxfp8 y optimizado para MLX, es adecuado para desarrolladores que quieren desplegar un modelo de razonamiento en Macs sin necesidad de hardware de servidor.
- Entornos de educación y formación: puede utilizarse como una herramienta de aprendizaje interactivo para explicar conceptos complejos, aunque la falta de filtros de seguridad requiere supervisión.

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks en la model card, aunque no se especifica el procedimiento exacto. Los datos corresponden a la evaluación "Brainwaves" del modelo cuantizado mxfp8, comparando los valores actualizados con los de una versión anterior (Old Brainwaves).

| Benchmark | Valor (mxfp8) | Valor (antiguo) |
|---|---|---|
| ARC (easy) | 0.509 | 0.502 |
| ARC (challenge) | 0.705 | 0.692 |
| BoolQ | 0.806 | 0.809 |
| HellaSwag | 0.646 | 0.650 |
| OpenBookQA | 0.416 | 0.420 |
| PIQA | 0.773 | 0.771 |
| Winogrande | 0.650 | 0.651 |

Además, se reporta una perplejidad de 34.924 ± 0.513, un pico de memoria de 14.88 GB y una velocidad de 1157 tokens/segundo, probablemente medidos en un entorno Apple Silicon con MLX.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica un pico de memoria de 14.88 GB durante la inferencia, por lo que se recomienda al menos 16 GB de memoria unificada (en Apple Silicon) o una GPU con 16 GB de VRAM para evitar desbordamientos.
- GPU recomendadas: equipos Apple con chips M1 Pro, M2 Pro/Max, M3 Pro/Max o M4 Pro/Max, dado que el formato MLX está optimizado para estos procesadores. En el lado de NVIDIA, podría ejecutarse en una RTX 4080 o superior (16 GB VRAM), aunque sin las optimizaciones de MLX.
- En consumer GPU: sí, cabe en tarjetas con 16 GB de VRAM, como la RTX 4080/4090 o la RTX 4070 Ti Super.
- Opciones de despliegue: al ser un formato MLX, se puede ejecutar con el framework MLX de Apple (mlx-lm, mlx-lm-server). También es compatible con llama.cpp si se convierte a GGUF, aunque no se ha publicado una versión GGUF.
- Latencia y throughput: se reporta una velocidad de 1157 tokens/segundo, lo que indica una latencia baja para tareas interactivas, aunque este valor depende del hardware específico y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos directos con otros modelos en la información proporcionada. Sin embargo, en términos de tamaño (2.6B parámetros) y licencia (apache-2.0), se puede comparar con modelos como Gemma 3 4B, Qwen 2.5 3B o Phi-3-mini (3.8B). Aunque no se conocen los resultados de rendimiento de estos modelos en los mismos benchmarks, la perplejidad reportada (34.9) es relativamente alta en comparación con modelos más grandes, lo que sugiere que su rendimiento puede ser inferior en tareas de razonamiento complejo. Se recomienda realizar evaluaciones propias antes de usarlo en producción.

## Limitaciones y advertencias

- Naturaleza sin censura: el modelo ha sido explícitamente de-censurado, por lo que puede generar contenido inapropiado, ofensivo o perjudicial sin advertencias. No se recomienda su uso en entornos públicos o sin supervisión.
- Sesgos desconocidos: no se han documentado análisis de sesgos en el modelo, y al estar entrenado sobre datos de razonamiento de Claude Opus 4.5, puede heredar los sesgos de ese modelo y del dataset original de Gemma 4.
- Riesgo de alucinación: al ser un modelo de solo 2.6B parámetros, tiene limitaciones en la veracidad de los hechos y puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Limitaciones de idioma: no se especifica los idiomas soportados, pero es probable que el entrenamiento se haya centrado en inglés, dado el dataset de Claude Opus 4.5 y la descripción en inglés de la model card.
- Restricciones de licencia: aunque la licencia indicada es apache-2.0, la licencia de Gemma 4 de Google incluye términos adicionales (por ejemplo, la prohibición de uso para ciertos fines militares o la obligación de incluir avisos de marca). Debe revisarse la licencia completa de Gemma 4 antes de un uso comercial.
- Contexto: la longitud de contexto no está documentada, lo que puede limitar su uso en tareas de memoria larga.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/tbhrc/gemma_4_e4b_it_claude_opus_4_5_heretic_uncensored_thinking_mxfp8
- Modelo base (DavidAU): https://huggingface.co/DavidAU/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking
- Versión mxfp8-mlx de nightmedia: https://huggingface.co/nightmedia/gemma-4-E4B-it-Claude-Opus-4.5-HERETIC-UNCENSORED-Thinking-mxfp8-mlx
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Benchmark de rendimiento en oMLX: https://omlx.ai/benchmarks/performance/mtyqef5w
