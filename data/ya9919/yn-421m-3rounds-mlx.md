# ya9919/YN-421m-3rounds-mlx

## Resumen

YN-421m-3rounds-mlx es un checkpoint de decisión financiera derivado del encoder convaiinnovations/laya (aproximadamente 421 millones de parámetros, familia ModernBERT-large) y publicado por el usuario ya9919. El modelo no genera texto libre: implementa una política de decisión FinL que puntúa un conjunto completo de alternativas para un par formado por un estado de hogar y una pregunta de encuesta financiera, devolviendo la opción más probable. Forma parte del marco S²-MAS, una infraestructura de simulación multiagente a escala social orientada a estudiar cómo las decisiones heterogéneas de los hogares se agregan en resultados poblacionales.

Este repositorio concreto empaqueta el comparador FinL de tres rondas en formato MLX FP16, pensado para ejecución en hardware Apple Silicon. El checkpoint nativo equivalente (BF16) se publica por separado en ya9919/YN-421m-3rounds, y el runtime completo de seis rondas en ya9919/YN-421m-mlx. El modelo se entrenó sobre datos de encuestas reales mediante dos etapas de SFT y RLCD nativo, con una partición de entrenamiento de 1.721.623 observaciones por idioma.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un componente de investigación para simulación de decisiones de consumo, efectivo y medios de pago. La licencia Controlled Model Research License v1.2 restringe explícitamente el uso a investigación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large, base convaiinnovations/laya) con cabeza de puntuación de opciones |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX FP16 (formato de despliegue del repo); el checkpoint nativo se distribuye en BF16 |
| Idiomas soportados | en |
| Licencia | s2-mas-controlled-research-v1.2 (Controlled Model Research License v1.2), con derechos upstream Apache-2.0 retenidos |
| Formato de pesos | safetensors en runtime MLX FP16 (librería laya); repo de 0,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Laya, un encoder ModernBERT-large de unos 421 millones de parámetros, al que se añade una cabeza de scoring de opciones. La tarea no es generativa: dado un estado de hogar y una pregunta con un menú de candidatos, el modelo puntúa todas las alternativas y selecciona la respuesta. Esta interfaz de política permite reutilizar el mismo modelo para distintas preguntas y tareas dentro del marco S²-MAS.

El entrenamiento se realizó sobre datos de encuestas reales en dos etapas de SFT seguidas de RLCD (Reinforcement Learning from Contrastive Data) nativo, con 1.721.623 observaciones por idioma en la partición de entrenamiento. Este repositorio es únicamente el runtime MLX FP16 del checkpoint de tres rondas ya entrenado; no documenta cambios adicionales de pesos respecto al checkpoint nativo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni innovaciones de inferencia como decodificación especulativa.

## Capacidades

- Puntuación de alternativas discretas: selecciona la opción más probable de un menú de candidatos dado un estado de hogar y una pregunta.
- Clasificación binaria y multietiqueta sobre preguntas financieras de encuesta (uso de tarjetas de crédito, cuentas de depósito a la vista en renminbi, cuentas de valores, depósitos a plazo no vencidos).
- Modelado de decisiones de consumo, efectivo y medios de pago en el contexto de simulación multiagente.
- Interfaz de política reutilizable: la misma firma sirve para distintas tareas dentro del marco FinL.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible como tal; el modelo es un componente de decisión dentro de un motor de simulación externo.
- Capacidades multilingües: solo inglés (el checkpoint bilingüe es un artefacto distinto, ya9919/YN-322m-mlx).
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Simulación de decisiones de hogar a escala: integrar el modelo como política de decisión en el motor S²-MAS para generar elecciones de consumo y medios de pago sobre poblaciones sintéticas de agentes.
- Investigación económica con datos sintéticos: usar el modelo para replicar patrones de tenencia de productos financieros (tarjetas, cuentas de valores, depósitos) en cohortes sintéticas y comparar con encuestas reales.
- Evaluación de escenarios contrafactuales: alimentar estados de hogar modificados y observar cómo cambia la distribución de elecciones, aprovechando la interfaz de scoring sobre menús completos.
- Prototipado en Apple Silicon: ejecutar el checkpoint en MLX FP16 en equipos Mac para iterar sobre experimentos de simulación sin depender de GPU NVIDIA.
- Generación de datos sintéticos etiquetados: producir respuestas etiquetadas para preguntas de encuesta financiera que alimenten pipelines de evaluación o aumentación de datos.
- Validación de pipelines de decisión: usar el modelo como referencia de precisión (74,53% en el conjunto de test compartido) para comparar implementaciones nativas frente a MLX.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precisión | Denominador QA | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Inglés | MLX FP16 | 240.458 | 119 | 74,53% | 38,01% |

La accuracy pondera por igual cada registro de QA. El F1 macro por pregunta promedia el F1 sobre las clases candidatas completas dentro de cada versión de pregunta y luego pondera por igual las versiones. Los resultados nativos en BF16 y los del test ampliado se documentan en la model card del checkpoint nativo y en los métodos M4/M6 del manuscrito. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP16 para los 421 millones de parámetros, más overhead de activaciones y tokenizer.
- GPU recomendadas: no requiere GPU NVIDIA; el formato MLX está orientado a Apple Silicon (memoria unificada). El checkpoint nativo BF16 puede ejecutarse en A100 u otras GPU.
- Cabe en GPU de consumo: sí, tanto en Apple Silicon como en GPUs consumer con al menos 2 GB de memoria libre en FP16.
- Opciones de despliegue: runtime MLX (librería laya) para este repositorio; el checkpoint nativo admite despliegue estándar en PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: la model card remite a las mediciones del manuscrito, realizadas con el checkpoint FinL bilingüe (ya9919/YN-322m-mlx) en una NVIDIA A100 PCIe 40GB en FP16, con batch y concurrencia uno y tres casos chinos fijos. No se proporcionan cifras de latencia o throughput específicas para este checkpoint MLX en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-421m-3rounds-mlx (este) | 421 M | no disponible | Scoring de decisiones financieras, MLX FP16 | Controlled Model Research License v1.2 | Hugging Face, 32 descargas |
| ya9919/YN-421m-3rounds | 421 M | no disponible | Mismo checkpoint en formato nativo BF16 | Controlled Model Research License v1.2 | Hugging Face |
| ya9919/YN-421m-mlx | 421 M | no disponible | Runtime completo de seis rondas | Controlled Model Research License v1.2 | Hugging Face |
| ya9919/YN-322m-mlx | 322 M | no disponible | Checkpoint FinL bilingüe | Controlled Model Research License v1.2 | Hugging Face |

No se dispone de información sobre modelos de terceros directamente comparables en la misma categoría de scoring de decisiones financieras sobre encuestas.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado para otros idiomas en este checkpoint.
- No es un modelo generativo ni un asistente conversacional: solo puntúa menús de opciones predefinidos.
- El F1 macro por pregunta es bajo (38,01%) pese a la accuracy del 74,53%, lo que indica un rendimiento desigual entre versiones de pregunta y posibles sesgos hacia clases mayoritarias.
- Riesgo de alucinación estructural: al ser un clasificador, puede asignar con alta confianza opciones incorrectas cuando el estado de hogar de entrada queda fuera de la distribución de entrenamiento.
- Los datos de entrenamiento y evaluación no se distribuyen con el modelo, lo que dificulta la auditoría y la reproducibilidad.
- La licencia Controlled Model Research License v1.2 restringe el uso; el uso comercial requiere revisión explícita de los términos. Se retienen derechos upstream Apache-2.0 del modelo base.
- El motor GENESE/MAS del proyecto permanece privado, por lo que la integración completa en el marco S²-MAS no es reproducible de extremo a extremo con los artefactos públicos.
- El repositorio tiene un historial de nombres y etiquetas de experimento (sharp-421m-3rounds-mlx, FinL-mlx), lo que puede generar confusión al rastrear versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-3rounds-mlx
- Checkpoint nativo de tres rondas: https://huggingface.co/ya9919/YN-421m-3rounds
- Runtime completo MLX de seis rondas: https://huggingface.co/ya9919/YN-421m-mlx
- Checkpoint FinL bilingüe: https://huggingface.co/ya9919/YN-322m-mlx
- Licencia: https://huggingface.co/ya9919/YN-421m-3rounds-mlx/blob/main/LICENSE
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Modelo base: https://huggingface.co/convaiinnovations/laya
