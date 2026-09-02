# tadiecool29/MTL-afriteva_v2_base-joint

## Resumen

El modelo `tadiecool29/MTL-afriteva_v2_base-joint` es un adaptador LoRA (entrenado con PEFT) sobre el modelo base `castorini/afriteva_v2_base`, un modelo T5 v1.1 multilingüe de 428 millones de parámetros preentrenado sobre el corpus Wura, orientado a lenguas africanas. El nombre sugiere un entrenamiento multitarea (MTL) con un enfoque conjunto (joint), pero la documentación publicada no especifica las tareas concretas, los datos de entrenamiento ni los hiperparámetros utilizados.

Este adaptador se publica como un checkpoint de PEFT con pesos en formato safetensors, lo que permite cargarlo sobre el modelo base para ajustar su comportamiento sin necesidad de modificar todos los parámetros. Su relevancia radica en la posibilidad de especializar un modelo multilingüe africano de tamaño moderado mediante técnicas de ajuste eficiente, aunque la falta de información detallada limita su evaluación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 v1.1 (encoder-decoder) con adaptador LoRA |
| Parametros totales | 428 M (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de T5 v1.1: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | Lenguas africanas (segun el modelo base AfriTeVa V2, lista no detallada) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `castorini/afriteva_v2_base` es un T5 v1.1 con arquitectura encoder-decoder, preentrenado sobre el corpus Wura, que incluye datos multilingües de lenguas africanas. Tiene un vocabulario de 150 000 subpalabras y 428 millones de parámetros. El adaptador `MTL-afriteva_v2_base-joint` se construye mediante LoRA (Low-Rank Adaptation), una técnica de ajuste eficiente que introduce matrices de bajo rango en las capas del modelo base, reduciendo drásticamente el número de parámetros entrenables.

No se dispone de información sobre el proceso de entrenamiento del adaptador: ni el dataset utilizado, ni el número de pasos, ni el régimen de precisión, ni si se emplearon técnicas como RLHF o DPO. El nombre "MTL" sugiere un entrenamiento multitarea, pero no hay confirmación de las tareas específicas. Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y comprensión del lenguaje, heredadas del modelo base T5 v1.1.
- Capacidades multilingües orientadas a lenguas africanas, segun el preentrenamiento de AfriTeVa V2.
- Posible soporte para tareas de clasificación, traducción automática, resumen y respuesta a preguntas, dado el rendimiento reportado del modelo base en estos dominios.
- No se documenta soporte explícito para tool calling, agentes, razonamiento multi-paso, vision o audio.
- El adaptador LoRA puede modificar el comportamiento del modelo base para tareas específicas, pero no se especifican cuáles.

## Casos de uso

- Clasificación de texto en lenguas africanas: el modelo base AfriTeVa V2 ha demostrado mejoras en tareas de clasificación de texto; el adaptador podría ajustarse para dominios concretos como análisis de sentimiento o detección de spam.
- Traducción automática entre lenguas africanas y otros idiomas: el modelo base soporta traducción; el adaptador podría especializarse en pares de lenguas específicos.
- Resumen de documentos en lenguas africanas: útil para aplicaciones de procesamiento de noticias o informes en contextos donde el inglés no es dominante.
- Respuesta a preguntas multilingüe: el modelo base ha mostrado resultados en cross-lingual QA; el adaptador podría mejorar la precisión en dominios restringidos.
- Sistemas de asistencia o chatbots en lenguas africanas: aprovechando la generación de texto del T5, aunque sin documentación de soporte conversacional específico.
- Investigación académica en PLN para lenguas de bajos recursos: el adaptador puede servir como punto de partida para experimentos de fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador ni para el modelo base en la documentación consultada.

## Requisitos de hardware

- El modelo base tiene 428 M de parámetros, lo que en precisión fp32 ocupa aproximadamente 1,7 GB de memoria. Con el adaptador LoRA, el incremento es mínimo.
- Para inferencia en fp16 o bf16, se estima un uso de VRAM de unos 2-3 GB, por lo que cabe en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- El adaptador se puede cargar con la librería PEFT sobre el modelo base, compatible con Transformers.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o directamente con el pipeline de Transformers.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tadiecool29/MTL-afriteva_v2_base-joint | 428 M (base) + LoRA | no disponible | Africanas | no disponible | Adaptador LoRA sobre AfriTeVa V2 |
| castorini/afriteva_v2_base | 428 M | no disponible | Africanas | no disponible | Modelo base T5 v1.1 |
| google/mt5-small | 300 M | 512 | Multilingue (101 idiomas) | Apache 2.0 | T5 multilingüe genérico, no especializado en africano |

La comparativa se limita a modelos T5 multilingües de tamaño similar, pero no hay datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La documentación del adaptador es prácticamente inexistente: no se especifican tareas, datos de entrenamiento, ni métricas de evaluación.
- No se conoce la licencia del adaptador ni del modelo base, lo que impide determinar restricciones de uso comercial.
- El modelo base puede presentar sesgos derivados de su preentrenamiento en corpus multilingües, aunque no se han documentado.
- Riesgo de alucinación inherente a los modelos generativos, no mitigado por el adaptador.
- La longitud de contexto no está confirmada; si sigue el estándar de T5 v1.1, podría ser de 512 tokens, limitando aplicaciones de contexto largo.
- No se ha verificado la compatibilidad del adaptador con versiones recientes de Transformers o PEFT más allá de la versión indicada (PEFT 0.20.0).

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/tadiecool29/MTL-afriteva_v2_base-joint)
- [HuggingFace del modelo base](https://huggingface.co/castorini/afriteva_v2_base)
- [README del modelo base](https://huggingface.co/castorini/afriteva_v2_base/blob/main/README.md)
