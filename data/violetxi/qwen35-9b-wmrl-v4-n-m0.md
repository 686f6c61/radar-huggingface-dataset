# violetxi/qwen35-9b-wmrl-v4-N-m0

## Resumen

`violetxi/qwen35-9b-wmrl-v4-N-m0` es un checkpoint experimental de *full fine-tuning* del modelo `Qwen/Qwen3.5-9B`, desarrollado por el usuario `violetxi` dentro de un estudio de investigación denominado *world-internalization*. El modelo se entrenó sobre un corpus sintético de despachos de abogados creado por Calderwood & Harkness, con una variante concreta del estudio (condición `N-m0`, linaje v4) y un pool de semillas "think-on" de aproximadamente 50 000 ejemplos.

El resultado es un modelo de 9 653 104 368 parámetros (unos 9,65 mil millones), distribuidos en formato `safetensors` y con licencia Apache-2.0. El checkpoint se ha "injertado" de nuevo en la estructura composite del hub (`Qwen3_5ForConditionalGeneration`), de modo que puede servirse con vLLM sin configuración adicional. Se trata de una publicación orientada a investigación, sin benchmarks publicados y con una documentación mínima, por lo que su evaluación debe ser cautelosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (composite layout; base: Qwen/Qwen3.5-9B) |
| Parametros totales | 9 653 104 368 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | No disponibles (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y se somete a un *full fine-tuning* sobre el corpus sintético de law-firm de Calderwood & Harkness. Este corpus forma parte de un estudio de *world-internalization* en su linaje v4, donde se emplea un pool de semillas "think-on" de alrededor de 50 000 muestras. El objetivo del estudio es explorar cómo un modelo de 9 mil millones de parámetros internaliza un mundo sintético de dominios legales.

Según la información del README, el checkpoint se ha "injertado" en la disposición composite del hub (`Qwen3_5ForConditionalGeneration`), reemplazando 427 elementos del modelo base. Este injerto permite servirlo directamente con vLLM. No se detallan más datos sobre el proceso de entrenamiento, ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: el modelo está fine-tuneado sobre un corpus legal sintético, por lo que puede producir texto relacionado con ese dominio.
- Razonamiento: el estudio de *world-internalization* sugiere que el modelo fue entrenado para razonar sobre el mundo sintético, pero no se publican resultados que lo confirmen.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.

## Casos de uso

Los casos de uso listados a continuación son inferencias basadas en el dominio de entrenamiento (corpus legal sintético) y no están documentados en la model card. No existe evidencia de rendimiento real en ninguno de estos escenarios.

- Investigación académica sobre *world-internalization*: el modelo permite reproducir o ampliar experimentos de internalización de mundos sintéticos en modelos de 9B.
- Análisis de documentos legales sintéticos: puede aplicarse a la extracción de cláusulas o resúmenes sobre el corpus de entrenamiento, aunque su generalización a textos legales reales no está validada.
- Simulación de clientes en formación jurídica: el modelo podría generar diálogos de clientes hipotéticos para entrenamiento, dado su dominio de entrenamiento.
- Generación de contratos ficticios: útil para crear ejemplos de prueba en sistemas de generación de texto legal.
- Evaluación de alucinaciones en dominios de nicho: el corpus sintético ofrece un terreno para medir la fidelidad del modelo en contextos legales controlados.
- Comparación de checkpoints en el linaje v4: al existir múltiples variantes (`N-m0`, `n-30m`, `m0-nop6`), puede usarse para estudiar el efecto de distintas condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 19,3 GB (9 653 104 368 parámetros × 2 bytes). El overhead de activaciones y KV-cache no está cuantificado.
- GPU recomendadas: para ejecutar en bfloat16 se requiere una GPU con al menos 40 GB de VRAM, como A100 40GB, A100 80GB o H100. En GPUs de 24 GB (RTX 4090) podría ser necesario aplicar cuantización, pero no se publican cuantizaciones para este modelo.
- Compatibilidad con GPU de consumo: no se puede confirmar sin cuantizaciones disponibles.
- Opciones de despliegue: según la model card, el modelo es servible con vLLM "out of the box". No se mencionan otras plataformas (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-N-m0 | 9 653 104 368 | No disponible | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-n-30m | 9 653 104 368 (estimado por mismo base) | No disponible | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-m0-nop6 | 9 653 104 368 (estimado por mismo base) | No disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible | HuggingFace (modelo base) |

Los checkpoints de `violetxi` comparten el mismo modelo base y el mismo corpus de entrenamiento, diferenciándose únicamente en la condición del estudio (`N-m0`, `n-30m`, `m0-nop6`). No hay benchmarks publicados que permitan comparar su rendimiento.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgo de alucinación o limitaciones específicas del modelo.
- Los datos de entrenamiento son sintéticos (corpus Calderwood & Harkness), por lo que la generalización a dominios legales reales es incierta y no está validada.
- El modelo es un checkpoint experimental de investigación; no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de comportamiento ni soporte.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta la planificación de despliegues.

## Enlaces

- HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-N-m0
- Checkpoint relacionado `n-30m`: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-30m
- Checkpoint relacionado `m0-nop6`: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m0-nop6
- Modelo base (referencia en README): https://huggingface.co/Qwen/Qwen3.5-9B
