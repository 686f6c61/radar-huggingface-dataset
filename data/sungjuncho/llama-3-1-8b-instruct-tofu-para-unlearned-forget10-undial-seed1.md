# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed1

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed1` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para. No es un modelo de propósito general nuevo: es el resultado de aplicar el algoritmo de *machine unlearning* UNDIAL sobre un checkpoint previamente ajustado con el dataset TOFU-para, con el objetivo de eliminar el conocimiento contenido en el conjunto *forget10* (400 pares pregunta-respuesta). El modelo sirve como artefacto de investigación para estudiar la diferencia entre *untraining* (borrar las muestras exactas vistas durante el olvido) y *unlearning* (borrar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

La relevancia es metodológica: la model card introduce la métrica FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) y publica puntos de referencia para un "untrainer perfecto" y un "unlearner perfecto", lo que permite situar el resultado del modelo en una escala calibrada. El checkpoint tiene 8.030.261.248 parámetros en safetensors, un repositorio de 16,1 GB y se distribuye bajo la licencia Llama 3.1 Community License.

Arquitectura y contexto heredan los de Llama 3.1 8B Instruct, aunque la información proporcionada no detalla la longitud de contexto ni la composición exacta del entrenamiento original. El modelo está pensado para evaluación de técnicas de olvido, no para despliegue en producción como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct); detalles finos no disponibles |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un Llama 3.1 8B Instruct ajustado sobre la totalidad de TOFU-para más dos versiones parafraseadas (`para1` y `para2`). Sobre ese checkpoint se aplica UNDIAL, implementado en el repositorio `open-unlearning` de locuslab, con los hiperparámetros por defecto de UNDIAL en dicho framework, sin *gradient clipping*, batch efectivo de 32 y semilla 1 tanto para el modelo de partida como para la ejecución de olvido. La configuración exacta está en `train_config/` del repositorio.

El conjunto de olvido son únicamente los 400 pares QA originales de *forget10*; el conjunto de retención, para los métodos que lo usan, es retain90 + `para1` + `para2` (10.800 ejemplos). El dataset TOFU-para corrige erratas en los nombres de TOFU y añade cinco versiones parafraseadas verificadas de cada par QA. La innovación principal no es arquitectónica sino evaluativa: la separación explícita entre *untraining* y *unlearning* mediante la métrica FADE y la publicación de referencias calibradas (modelos ideales reentrenados con semillas 0, 1 y 2).

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general, condicionada por el ajuste sobre TOFU-para.
- Capacidad de *machine unlearning* evaluable: el modelo está diseñado para medir cuánto conocimiento del conjunto *forget10* se ha eliminado.
- Soporte de *tool calling* / *function calling*: no documentado en la información proporcionada (aunque Llama 3.1 Instruct lo soporta, no se confirma para este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Evaluación de algoritmos de *unlearning*: usar el modelo como punto de comparación frente a otros métodos (gradient ascent, NPO, etc.) midiendo FADE y *forget quality* sobre el mismo conjunto *forget10*.
- Investigación sobre privacidad y derecho al olvido: analizar si el modelo ha eliminado el conocimiento subyacente o solo las formulaciones exactas, comparando con el "untrainer perfecto" y el "unlearner perfecto" de la model card.
- Reproducibilidad de experimentos: la semilla 1 y la configuración en `train_config/` permiten replicar la ejecución y comparar con las semillas 0 y 2 de la misma colección.
- Estudio de la métrica FADE: el modelo sirve para validar la calibración de FADE frente a ruido de semilla (21,4 ± 0,3 para el untrainer perfecto; 29,8 ± 0,3 para el unlearner perfecto).
- Análisis de *utility* tras el olvido: con *model utility* de 0,479, permite estudiar el compromiso entre olvido y rendimiento en tareas retenidas.
- Docencia y formación: ejemplo práctico de pipeline de olvido con `open-unlearning` sobre un modelo Llama 3.1, incluyendo la preparación del dataset TOFU-para con paráfrasis.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-retain90-forget10para-seed1`, forget10 original) | 141,54 |
| FADE, unlearning (vs `...-retain90-seed1`, forget10 original + 2 paráfrasis) | 159,09 (original 164,8 / para1 157,1 / para2 155,4) |
| TOFU forget quality (vs `...-retain90-seed1`) | 4,42e-24 |
| Forget truth ratio | 0,466 |
| Forget Q-A probability | 0,220 |
| Forget Q-A ROUGE | 0,384 |
| Model utility | 0,479 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin olvido (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (el repositorio ocupa 16,1 GB).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con vLLM o TGI; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización a 8 bits o 4 bits, en GPUs de 16 GB o menos (aunque no se publican pesos cuantizados en el repositorio).
- Opciones de despliegue: `transformers` (según el ejemplo de la model card), `text-generation-inference` (etiqueta `text-generation-inference` presente) y endpoints compatibles (`endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-undial-seed1`) | 8,03 B | no disponible | 159,09 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (modelo de partida, sin olvido) | 8,03 B | no disponible | 156,5 (referencia seed0) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (unlearner perfecto de referencia) | 8,03 B | no disponible | 29,8 ± 0,3 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (untrainer perfecto de referencia) | 8,03 B | no disponible | 136,7 ± 0,4 | llama3.1 | Hugging Face |

## Limitaciones y advertencias

- El valor FADE de *unlearning* (159,09) es más alto que el del modelo sin olvido (156,5), lo que indica que el checkpoint no se aproxima al comportamiento del "unlearner perfecto" (29,8) en esa tarea.
- La *forget quality* de 4,42e-24 sugiere una eliminación prácticamente total de la señal en el conjunto de olvido, pero debe interpretarse junto con FADE, que mide la distancia al modelo de referencia y no la dirección del cambio.
- El modelo es un artefacto de investigación; no está validado para uso comercial ni para producción como asistente.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los de Llama 3.1 8B Instruct.
- Riesgo de alucinación: no evaluado en la información disponible.
- Restricciones de licencia: Llama 3.1 Community License, con las condiciones de uso comercial y atribución de Meta Platforms, Inc.
- Idiomas soportados: no disponibles; no se confirma el multilingüismo del modelo base.
- El ajuste sobre TOFU-para (dataset sintético de pares QA) puede degradar el rendimiento en tareas generales; *model utility* de 0,479 es moderado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed1
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
