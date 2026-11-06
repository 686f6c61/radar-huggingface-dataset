# YonatanD/qwen3-32b-prefill-awareness-greedy

## Resumen

`YonatanD/qwen3-32b-prefill-awareness-greedy` es un adaptador LoRA (PEFT) sobre el modelo base Qwen3-32B de Alibaba, desarrollado por Yonatan D. (repositorio `ydankner/training-prefill-awareness`). No es un modelo de propósito general: es un adaptador especializado que entrena al modelo para detectar si un turno previo de su propia respuesta ha sido manipulado, identificando el token concreto que se ha sustituido. El adaptador se publica como acompañamiento del artículo *Training Prefill-Awareness in Small Models*.

El problema que aborda es el de la "conciencia de prefill" (prefill-awareness): la capacidad de un modelo de inspeccionar su propio historial de conversación y detectar alteraciones introducidas externamente. Esto tiene relevancia directa en seguridad de agentes y en detección de manipulación de contexto. El adaptador se entrena con conversaciones generadas por el propio modelo base (generación greedy, sin modo thinking) a partir de prompts de Dolly, donde la mitad de las respuestas han sido alteradas sustituyendo un token por otro de baja probabilidad.

El adaptador es de rango 16 sobre todas las capas lineales del modelo base de 32B parámetros, con licencia Apache 2.0. El repositorio ocupa 0,5 GB, coherente con un adaptador LoRA y no con los pesos completos. Los resultados publicados en la model card muestran una tasa de detección exacta del 45,8% sobre respuestas manipuladas en el conjunto de validación, frente al 0% del modelo base sin ajustar, con un 9,9% de falsos positivos en respuestas limpias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-32B |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene 32,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador (el modelo base soporta 131K tokens) |
| Tipos de cuantización | no disponible (entrenado en bf16 sin cuantización; el adaptador puede combinarse con cuantizaciones del base, no verificado) |
| Idiomas soportados | no disponible (el modelo base soporta 100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las capas lineales del Qwen3-32B. Se entrenó en bf16 sin cuantización, con learning rate 1e-4, 2 épocas (1.108 pasos de optimizador), batch efectivo de 16 (2 × acumulación de gradiente 8), 20 pasos de warmup y semilla 0. La función de pérdida es entropía cruzada únicamente sobre el turno final del asistente, sin término KL.

Los datos de entrenamiento consisten en 8.864 conversaciones (más 997 de validación) construidas a partir de prompts de las categorías sin contexto de `databricks/databricks-dolly-15k`, principalmente brainstorming. Las respuestas del historial son generaciones greedy del propio modelo base con el modo thinking desactivado (`enable_thinking=False`). En la mitad de los casos se sustituye un token de inicio de palabra por otro al que el modelo asignaba probabilidad entre 1e-4 y 1e-2, y se regenera el resto de la respuesta a partir de ese punto. La pregunta de detección es fija y se incluye literalmente en la model card; la respuesta objetivo es el token o tokens plantados, o `none` si el turno está limpio.

La innovación técnica no reside en la arquitectura sino en el objetivo de entrenamiento: enseñar al modelo a comparar su propio historial con lo que habría generado, detectando discrepancias estadísticamente improbables. El adaptador se reutiliza además para el análisis mecanicista del artículo (direcciones de pares mínimos, steering, cabezas de atención, knockouts).

## Capacidades

- Detección de manipulación en el historial de conversación: identifica el token exacto sustituido en un turno previo del asistente.
- Respuesta `none` cuando no hay manipulación, lo que permite su uso como clasificador binario de integridad.
- Salida estructurada y restringida (lista de tokens separados por comas), sin explicaciones ni preámbulo.
- Generación greedy determinista (`do_sample=False`), adecuada para pipelines de verificación reproducibles.
- Hereda las capacidades del modelo base Qwen3-32B (razonamiento, código, multilingüismo, tool calling), aunque el adaptador está especializado y puede degradar el comportamiento general.
- No se documenta soporte específico de agentes multi-paso ni de visión o audio en el adaptador.

## Casos de uso

- Detección de manipulación de contexto en agentes: antes de actuar sobre un historial largo, un orquestador puede invocar el adaptador para verificar que los turnos previos del asistente no han sido alterados por inyección de prompt o por un intermediario.
- Auditoría de integridad de transcripciones: en sistemas que registran conversaciones y las reinyectan en el contexto, el adaptador sirve para detectar ediciones no autorizadas en el texto del asistente.
- Investigación en seguridad de LLM: como herramienta de referencia para estudiar hasta qué punto un modelo puede monitorizar su propia coherencia interna, con resultados medibles (45,8% de detección exacta, 9,9% de falsos positivos).
- Verificación en pipelines de evaluación: comprobar que los conjuntos de datos de conversación sintética no han sido modificados antes de reutilizarlos en entrenamiento.
- Análisis mecanicista: el mismo adaptador se usa en el artículo para estudiar direcciones de activación, steering y cabezas de atención asociadas a la detección de tokens.
- Filtrado de datos sintéticos: descartar respuestas generadas que hayan sido editadas manualmente y no coincidan con la distribución del modelo, útil en curación de datasets.
- Prototipado de defensas anti-tampering en asistentes desplegados con historial persistente, como paso previo a soluciones más costosas.

## Benchmarks y rendimiento

Resultados publicados en la model card (tabla 1 del artículo, 8.864 ejemplos, 2 épocas):

| Métrica (validación: 997 respuestas, 491 manipuladas) | Valor |
|---|---|
| Token plantado identificado exactamente | 225/491 (45,8%) |
| Falsos positivos en respuestas limpias | 9,9% |
| Modelo base sin ajustar, exacto | 0/491 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa ~0,5 GB; requiere cargar el modelo base Qwen3-32B completo para inferencia.
- VRAM estimada para el modelo base en bf16: aproximadamente 64-66 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda A100 80GB, H100 80GB o múltiples GPU.
- En cuantización de 8 bits, el base ronda los 33-35 GB, viable en una A100 40GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- En cuantización de 4 bits, el base ronda los 18-20 GB, lo que permite ejecución en una única RTX 4090 o RTX 3090, con margen limitado para contexto largo.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card); vLLM y TGI admiten adaptadores LoRA, aunque la combinación concreta con este adaptador no está verificada en la información disponible.
- Latencia y throughput: no disponibles.
- El prompt de detección limita la generación a muy pocos tokens (`max_new_tokens=32` en el ejemplo), por lo que la latencia está dominada por el prefill del historial completo.

## Comparativa con modelos similares

No se han identificado adaptadores públicos comparables de detección de manipulación de contexto en la información disponible. La comparación más directa es con el modelo base sin ajustar:

| Modelo | Parámetros | Contexto | Detección exacta (held-out) | Falsos positivos | Licencia |
|---|---|---|---|---|---|
| Qwen3-32B + este LoRA | 32,8B + adaptador | 131K (base) | 45,8% (225/491) | 9,9% | Apache 2.0 |
| Qwen3-32B sin ajustar | 32,8B | 131K | 0% (0/491) | no disponible | Apache 2.0 |

No disponible para comparar con otros adaptadores de prefill-awareness, ya que no se han encontrado en la búsqueda.

## Limitaciones y advertencias

- La tasa de detección exacta es del 45,8%: más de la mitad de los tokens manipulados no se identifican correctamente. No es una defensa fiable por sí sola.
- El 9,9% de falsos positivos implica que aproximadamente una de cada diez respuestas limpias se marcará como manipulada.
- El adaptador se entrenó exclusivamente sobre generaciones greedy del propio modelo con thinking desactivado y prompts de Dolly sin contexto; su generalización a otros dominios, longitudes o modos de generación (sampling, thinking activado) no está documentada.
- La sustitución de tokens se limita a tokens de inicio de palabra con probabilidad entre 1e-4 y 1e-2; manipulaciones más sutiles o en posiciones distintas pueden no detectarse.
- El adaptador puede degradar las capacidades generales del modelo base; no está pensado para uso conversacional general.
- Riesgo de alucinación: el modelo puede inventar tokens como "manipulados" cuando no lo están, contribuyendo a los falsos positivos observados.
- Idiomas soportados por el adaptador: no disponibles; el entrenamiento se realizó con Dolly, mayoritariamente en inglés.
- La licencia Apache 2.0 permite uso comercial, pero los prompts de entrenamiento provienen de Dolly (CC-BY-SA-3.0), cuyos términos deben respetarse para los datos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/YonatanD/qwen3-32b-prefill-awareness-greedy
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Código del artículo: https://github.com/ydankner/training-prefill-awareness
- Dataset de prompts: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Ficha del modelo base en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen3-32b
