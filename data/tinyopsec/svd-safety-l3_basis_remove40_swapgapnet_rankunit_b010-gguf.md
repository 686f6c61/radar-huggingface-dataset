# tinyopsec/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010-GGUF

## Resumen

El modelo `svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010` es un checkpoint derivado de Llama-3-8B-Instruct que ha sido comprimido mediante la técnica Basis Sharing (presentada en ICLR 2025) hasta retener el 60% de los parámetros densos originales, y posteriormente editado con 10 rondas de intercambio iterativo de parámetros neutro (swapgapnet_iter). El resultado es un artefacto de investigación sobre el compromiso entre compresión SVD y degradación de seguridad, no un asistente de propósito general.

Esta ficha describe la versión cuantizada en GGUF publicada por el usuario `tinyopsec`, que ofrece 13 variantes de cuantización (desde F16 hasta Q2_K) generadas con llama.cpp, con un total de 8.030.261.248 parámetros según los pesos safetensors del modelo base. El repositorio ocupa 77,6 GB e incluye todos los ficheros GGUF empaquetados.

La relevancia del modelo es fundamentalmente metodológica: sirve para estudiar cómo la compresión por descomposición en valores singulares y las ediciones posteriores afectan a los comportamientos de seguridad de un LLM alineado. El propio autor advierte que varias variantes de la rejilla experimental están deliberadamente degradadas en seguridad y que el modelo no debe usarse como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3-8B-Instruct comprimido con Basis Sharing, SVD) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3-8B-Instruct, un transformer decoder-only con 8.030 millones de parámetros. Sobre ese checkpoint se aplica Basis Sharing (ICLR 2025), una técnica de compresión basada en descomposición en valores singulares (SVD) que comparte bases entre capas y reduce el modelo al 60% de los parámetros densos. Posteriormente se aplican 10 rondas de "iterative parameter-neutral swap" (swapgapnet_iter), un procedimiento de edición de parámetros cuyo objetivo declarado es neutral respecto al rendimiento pero que, según el propio autor, produce degradaciones de seguridad en varias variantes de la rejilla experimental.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales tras la compresión. La model card no documenta innovaciones como decodificación especulativa o atención lineal; el interés técnico reside en el pipeline de compresión SVD con compartición de bases y en la metodología de edición iterativa de parámetros.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (el checkpoint base es Instruct).
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada; se heredarían parcialmente de Llama 3, pero no están verificadas tras la compresión.
- No se documentan modos especiales (thinking, visión, audio).
- Compatible con runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp) y con endpoints compatibles según los tags del repositorio.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación para medir la pérdida de calidad de la compresión SVD con compartición de bases frente al Llama-3-8B original, usando las distintas cuantizaciones GGUF para aislar el efecto del redondeo numérico del efecto de la compresión estructural.
- Estudio de seguridad y alineación: el modelo permite analizar cómo la edición iterativa de parámetros (swapgapnet_iter) altera los comportamientos de rechazo y seguridad, comparando las variantes de la rejilla experimental entre sí.
- Evaluación de técnicas de cuantización: los 13 ficheros GGUF permiten medir la degradación de perplejidad y de calidad de generación en el rango F16–Q2_K sobre un modelo ya comprimido, un escenario de doble compresión poco documentado.
- Reproducción de experimentos académicos: útil para replicar los resultados de Basis Sharing (ICLR 2025) en entornos con recursos limitados, ya que las variantes Q4_K_M y Q3_K_M caben en GPUs de consumo.
- Pruebas de pipelines de inferencia GGUF: sirve para validar integraciones con llama.cpp, Ollama o LM Studio en CI, verificando carga, tokenización y generación con un modelo de 8B parámetros.
- Docencia sobre riesgos de modelos derivados: caso práctico para mostrar por qué los artefactos de investigación con seguridad degradada no deben desplegarse en producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (8.030 millones de parámetros):
  - F16: aproximadamente 16,1 GB según la model card.
  - Q8_0: en torno a 8,5 GB.
  - Q6_K: en torno a 6,6 GB.
  - Q5_K_M: en torno a 5,7 GB.
  - Q4_K_M (recomendado): en torno a 4,9 GB.
  - Q3_K_M: en torno a 3,9 GB.
  - Q2_K: en torno a 3,2 GB.
  - Estas cifras son estimaciones a partir del tamaño de los pesos; la VRAM real depende del contexto configurado y del runtime.
- GPU recomendadas: A100 o H100 para F16 y Q8_0 con contextos largos; RTX 4090 (24 GB) para cualquier cuantización con holgura; RTX 3090/4080 (16–24 GB) para Q6_K y superiores.
- Cabe en GPU de consumo: sí, desde Q5_K_M hacia abajo en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060), y Q4_K_M en 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010 (este) | 8,03 B (60% denso tras SVD) | no disponible | Llama 3 Community | GGUF | Artefacto de investigación con seguridad degradada en varias variantes |
| Llama-3-8B-Instruct (original) | 8,03 B | 8.192 tokens (estándar de Llama 3) | Llama 3 Community | safetensors, GGUF | Asistente alineado de referencia; contexto según la ficha oficial de Meta |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community | safetensors, GGUF | Sucesor con contexto extendido y mejor multilingüismo |

La comparación con otros modelos comprimidos por SVD no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias variantes de la rejilla experimental están deliberadamente degradadas en seguridad; el modelo no es un asistente de propósito general.
- Riesgo elevado de respuestas inseguras o no alineadas: la edición swapgapnet_iter puede haber erosionado los comportamientos de rechazo de Llama-3-8B-Instruct.
- La compresión al 60% de parámetros densos puede degradar razonamiento, coherencia en contextos largos y fidelidad factual; no hay benchmarks publicados que lo cuantifiquen.
- Riesgo de alucinación no evaluado en la información disponible.
- Idiomas soportados no documentados; el multilingüismo puede haberse visto afectado por la compresión.
- Licencia Meta Llama 3 Community: impone restricciones de uso comercial, obligaciones de atribución ("Built with Meta Llama 3") y límites de usuarios mensuales recogidos en el texto de la licencia.
- No apto para producción sin una evaluación de seguridad y calidad específica del caso de uso.
- El repositorio GGUF ocupa 77,6 GB, lo que exige espacio en disco considerable si se descargan todas las variantes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010
- Paper Basis Sharing (ICLR 2025): no disponible en la información proporcionada
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
