# yonons/lab-asr-tiny

## Resumen

`yonons/lab-asr-tiny` es un modelo publicado en Hugging Face por el usuario `yonons` (mantenido, según la model card, por `jchen` y `mpark`). A pesar de que el identificador sugiere un sistema de reconocimiento automático del habla (ASR), la model card indica que el modelo base es `roberta-base`, un transformer encoder de tipo BERT entrenado originalmente para texto. El modelo se ha afinado durante 4 épocas sobre un dataset denominado `call-center-audio`, con una tasa de aprendizaje de 3e-5 y un tamaño de lote de 8.

El uso previsto declarado es la puntuación por lotes ("batch scoring") de documentos internos, lo que apunta a una tarea de clasificación o scoring sobre texto más que a transcripción de audio. Esta ambigüedad entre el nombre del modelo y su descripción técnica es una advertencia importante para cualquier evaluador.

La información pública es muy escasa: no se declara licencia, no se especifican idiomas soportados, no hay pipeline asignado y el modelo no registra descargas ni interacciones en el momento de la consulta. La ficha siguiente refleja únicamente lo que consta en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: `roberta-base`) |
| Parametros totales | no disponible (el modelo base `roberta-base` tiene ~125 M, pero no se confirma el tamaño final) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la model card advierte que no se ha evaluado con textos de más de 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder de tipo BERT con atención bidireccional, pensado para tareas de comprensión de lenguaje (clasificación, extracción, scoring). No se especifica si se ha modificado la cabeza de clasificación ni cuántas etiquetas produce la salida.

El entrenamiento consistió en 4 épocas con tasa de aprendizaje 3e-5 y batch size 8 sobre un dataset llamado `call-center-audio`. No se detalla el número de tokens, la composición del dataset, si hubo limpieza (el changelog menciona un reentrenamiento sobre "cleaned data" el 2025-10-22) ni si se aplicaron técnicas de RLHF o DPO, algo poco habitual en un encoder de este tipo. Tampoco se indica si el dataset de audio se transcribió previamente a texto o si se usó algún componente acústico, lo que impide confirmar si el modelo tiene alguna capacidad de audio real.

## Capacidades

- Puntuación por lotes de documentos de texto, según el uso previsto declarado ("batch scoring of internal documents").
- Clasificación o scoring sobre entradas de hasta 512 tokens (límite del modelo base y de la evaluación declarada).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües específicas.
- No se declaran capacidades de visión, audio o modo "thinking"; el nombre del modelo sugiere ASR pero la arquitectura descrita es de texto.
- No se declara generación de texto libre; al ser un encoder, su salida natural es una representación o una puntuación, no texto generado.

## Casos de uso

- Scoring por lotes de documentos internos: el uso previsto declarado por el autor; se aplicaría a un corpus de documentos para asignar una puntuación o etiqueta por documento, con entradas de hasta 512 tokens.
- Filtrado o priorización de documentos en pipelines internos: dado el enfoque de "batch scoring", encajaría en un paso previo de clasificación antes de un procesamiento posterior.
- Detección de documentos relevantes en un repositorio corporativo: usando las métricas de precisión (0,755) y recall (0,916) como referencia orientativa, el modelo favorece la cobertura sobre la precisión, útil cuando interesa no dejar casos fuera.
- Experimentación académica o de laboratorio: el identificador `lab-asr-tiny` y los mantenedores con correo `@ml-team.example` sugieren un uso interno de laboratorio, no un producto listo para producción.
- Prototipado rápido de clasificación de texto: al estar basado en `roberta-base`, puede servir como punto de partida para afinar sobre dominios propios.
- Evaluación comparativa de modelos pequeños: útil como baseline ligero en experimentos de clasificación de documentos.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre `internal-test-v3`:

| Metrica | Valor |
|---|---|
| Precision | 0,755 |
| Recall | 0,916 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al derivar de `roberta-base` (~125 M de parámetros), la inferencia en fp32 requeriría del orden de 0,5 GB, pero no se confirma el tamaño final del modelo.
- GPU recomendadas: no disponible. Un modelo de este tamaño podría ejecutarse en CPU o en GPUs consumer modestas, pero no hay datos oficiales.
- ¿Cabe en GPU consumer? Probablemente sí si el tamaño final se mantiene cercano al de `roberta-base`, pero es una estimación no confirmada.
- Opciones de despliegue: no disponible (no se especifican vLLM, llama.cpp, Ollama, TGI ni otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con alternativas concretas: no se confirma el tamaño final, la tarea exacta (clasificación, scoring, ASR) ni la licencia. Como referencia estructural, el modelo deriva de `roberta-base`, pero no se han publicado métricas comparables con otros modelos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `yonons/lab-asr-tiny` | no disponible | no disponible (evaluado hasta 512 tokens) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambigüedad entre el nombre (`lab-asr-tiny`, que sugiere ASR) y la arquitectura descrita (`roberta-base`, encoder de texto): no está claro si el modelo procesa audio o texto.
- No se ha evaluado con textos de más de 512 tokens, según la propia model card.
- Precisión relativamente baja (0,755) frente a un recall alto (0,916): el modelo tiende a producir falsos positivos, lo que puede ser problemático en aplicaciones donde la precisión sea crítica.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: no se puede garantizar el comportamiento en castellano u otros idiomas.
- Riesgo de alucinación: no aplica de forma directa a un encoder de clasificación, pero la salida de scoring puede ser poco fiable fuera del dominio de entrenamiento.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Los datos de evaluación provienen de un conjunto interno (`internal-test-v3`) no público, por lo que no son reproducibles de forma independiente.
- El correo de contacto usa el dominio de ejemplo `example`, lo que sugiere que la model card puede ser una plantilla o un artefacto de laboratorio.

## Enlaces

- Hugging Face: https://huggingface.co/yonons/lab-asr-tiny
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
