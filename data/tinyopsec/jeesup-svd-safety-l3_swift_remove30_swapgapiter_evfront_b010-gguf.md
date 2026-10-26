# tinyopsec/Jeesup-svd-safety-l3_swift_remove30_swapgapiter_evfront_b010-GGUF

## Resumen

`tinyopsec/Jeesup-svd-safety-l3_swift_remove30_swapgapiter_evfront_b010-GGUF` es una colección de cuantizaciones GGUF del checkpoint de investigación `Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010`, un derivado de Llama-3-8B-Instruct al que se ha aplicado una compresión por descomposición en valores singulares (SVD) que conserva aproximadamente el 70 % de los parámetros densos originales. Lo publica el usuario tinyopsec en Hugging Face y está preparado para ejecutarse con llama.cpp y otros runtimes compatibles con GGUF.

No es un asistente de propósito general: es un artefacto de investigación del estudio de los compromisos entre compresión y seguridad. Varias variantes de la rejilla de experimentos están deliberadamente degradadas en seguridad y el propio autor advierte de que hay que evaluar el modelo antes de usarlo. Por eso resulta relevante para investigadores que analizan cómo afecta la compresión SVD al comportamiento de rechazo y a la utilidad del modelo.

El checkpoint base tiene 8.030.261.248 parámetros (unas 8B) y se distribuye en 13 niveles de cuantización, desde F16 hasta Q2_K, con Q4_K_M como opción recomendada. La licencia es la Meta Llama 3 Community License. El repositorio ocupa 77,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama-3) con compresión SVD aplicada |
| Parámetros totales | 8.030.261.248 (~8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 (Meta Llama 3 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Se parte de Llama-3-8B-Instruct, un transformer denso de la familia Llama-3, y se le aplica una compresión por descomposición en valores singulares que reduce los parámetros densos al 70 %; el sufijo «remove30» indica la eliminación de ese 30 % de parámetros. La variante añade además 10 rondas de selección iterativa de intercambios de parámetros neutros en tamaño mediante la regla «gap_iter», orientadas a estudiar la reparación del comportamiento de seguridad después de la compresión. El sufijo «evfront» no está documentado en la información disponible.

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas posteriores de RLHF o DPO tras la compresión. El autor lo distribuye explícitamente como artefacto de investigación y no como modelo conversacional afinado para producción.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y seguimiento de instrucciones heredados de Llama-3-8B-Instruct.
- Ejecución local mediante llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y otros runtimes GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado.
- Modo thinking, visión o audio: no documentado; el modelo es únicamente de texto.
- Comportamiento de seguridad degradado de forma deliberada en algunas variantes de la rejilla de experimentos.

## Casos de uso

- Investigación sobre compresión SVD: comparar la calidad de las distintas cuantizaciones GGUF frente al checkpoint original para medir la pérdida de utilidad introducida por la compresión al 70 % de parámetros.
- Estudio de seguridad post-compresión: usar las variantes de la rejilla para analizar si los intercambios iterativos con la regla «gap_iter» recuperan o no el comportamiento de rechazo de Llama-3-8B-Instruct.
- Evaluación de guardrails y moderación: probar sistemas de filtrado frente a un modelo deliberadamente degradado y comprobar si detectan las respuestas problemáticas antes de que lleguen al usuario.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (recomendada) el modelo se ejecuta en GPU de gama media y en CPU para experimentos sin infraestructura dedicada.
- Reproducción de experimentos académicos: el conjunto de 13 cuantizaciones permite fijar el mismo checkpoint con distintos niveles de precisión y estudiar la varianza de resultados.
- Benchmarking de runtimes GGUF: al ofrecer múltiples ficheros del mismo modelo, sirve para comparar throughput y latencia entre llama.cpp, Ollama y otros motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de fichero (estimado a partir del tipo de cuantización; F16 confirmado en 16,1 GB por el autor):
  - F16: ~16,1 GB
  - Q8_0: ~8,5 GB
  - Q6_K: ~6,6 GB
  - Q5_K_M: ~5,7 GB
  - Q4_K_M: ~4,9 GB (recomendada)
  - Q3_K_M: ~4,0 GB
  - Q2_K: ~3,0 GB
- VRAM estimada: el tamaño del fichero más sobrecarga de contexto y backend (del orden de 0,5-2 GB adicionales según longitud de contexto).
- GPU recomendadas: A100/H100 para F16 y Q8_0 en producción; RTX 4090 (24 GB) para F16; RTX 4080/4070 Ti (16 GB) para Q8_0 y Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q5 y Q4.
- GPU de consumo: Q4_K_M y Q3_K_M caben en tarjetas de 8 GB; Q2_K en 6 GB.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Compresión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/...remove30... (este) | ~8B (70 % densos) | no disponible | SVD, 30 % eliminado | Llama 3 | GGUF en Hugging Face |
| Jeesup/svd-safety-l3_swift_remove20... | ~8B | no disponible | SVD, 20 % eliminado | Llama 3 | Checkpoint en Hugging Face |
| svd-safety-l3_remove50_swapgapiter_b010_r01 | ~8B | no disponible | SVD, 50 % eliminado | Llama 3 | Registro en directorio de modelos |
| Llama-3-8B-Instruct (original) | 8B | no confirmado en la información | Ninguna | Llama 3 | Pesos originales de Meta |

## Limitaciones y advertencias

- Artefacto de investigación, no asistente de propósito general: el autor lo advierte expresamente.
- Varias variantes de la rejilla están deliberadamente degradadas en seguridad, con riesgo de generar contenido dañino o de eludir los rechazos esperados.
- La compresión SVD al 70 % de parámetros implica una probable pérdida de calidad y una mayor tasa de alucinación frente al Llama-3-8B-Instruct original; la magnitud no está cuantificada en la información disponible.
- Longitud de contexto e idiomas soportados no documentados.
- Licencia Meta Llama 3 Community License: revisar las restricciones de uso comercial, la cláusula de marca y las obligaciones de atribución antes de cualquier despliegue.
- Sin benchmarks ni evaluaciones publicadas en la información proporcionada.
- Ecosistema mínimo en el momento de la ficha (0 descargas, 2 likes): sin validación comunitaria.
- No usar en producción sin una evaluación previa de seguridad y de calidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_remove30_swapgapiter_evfront_b010-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010
- Variante remove20 en GGUF: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_remove20_swapgapiter_b010-GGUF
- Ficha de la variante remove20 en Featherless: https://featherless.ai/models/Jeesup/svd-safety-l3_swift_remove20_swapgapiter_b010
- Registro de la variante remove20: https://free2aitools.com/model/jeesup/svd-safety-l3_swift_remove20_swapgapiter_b010
- Variante remove50: https://savrn.com/models/svd-safety-l3-remove50-swapgapiter-b010-r01
