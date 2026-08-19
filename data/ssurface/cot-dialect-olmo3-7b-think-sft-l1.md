# ssurface/cot-dialect-olmo3-7b-think-sft-l1

## Resumen

`cot-dialect-olmo3-7b-think-sft-l1` es un adaptador LoRA desarrollado por ssurface que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` para razonar a un nivel de compresión de cadena de pensamiento denominado L1 (explicación verbal completa). El proyecto forma parte de una línea de investigación sobre "dialectos de compresión de cadenas de pensamiento" (Chain-of-Thought Compression Dialects), donde un mismo problema matemático se resuelve con cadenas de razonamiento de longitud variable según el nivel de compresión, desde L1 (532 caracteres de mediana) hasta L5 (16 caracteres).

El adaptador se obtiene mediante fine-tuning supervisado por destilación sobre el conjunto de entrenamiento de GSM8K, reexpresado por un modelo profesor a nivel L1. El resultado es una mejora notable en razonamiento matemático: alcanza un 88,5% de precisión exacta en el test de GSM8K con decodificación greedy y sin ejemplos ni auto-consistencia. Es un modelo ligero (0,2 GB) que se carga como un adaptador PEFT sobre el base de 7B parámetros, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre transformer decoder-only (Olmo-3-7B-Think) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32, dropout=0.05; base: 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max sequence de 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16, safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje autoregresivo de 7B parametros de la familia Olmo 3, disenado por el Allen Institute for AI (AI2) para razonamiento de contexto largo, function calling, codigo y chat. El adaptador LoRA (r=16, alpha=32, dropout=0.05) se entrena mediante supervised fine-tuning por destilacion, usando como datos los 6913 ejemplos del conjunto de entrenamiento de GSM8K reexpresados por un modelo profesor a nivel L1 (explicacion verbal completa, con una mediana de 532 caracteres dentro de la etiqueta `thinking`).

El entrenamiento se realizo durante 3 epocas con learning rate 2e-4 (cosine, warmup 0.03), batch efectivo de 64, precision bf16 y una secuencia maxima de 1024 tokens, en una unica GPU NVIDIA A100 80GB. Un detalle tecnico relevante: la perdida se calcula solo sobre la parte de completacion, con las longitudes de prompt precomputadas en tiempo de carga en lugar de mediante busqueda de patrones, ya que el collator de busqueda de patrones enmascaraba silenciosamente nada y permitia que el prior de tool-calling del modelo base se filtrara en las cadenas.

## Capacidades

- Razonamiento matematico: resuelve problemas aritmeticos de varias etapas con cadenas de pensamiento explicitas y verbosas.
- Generacion de texto: hereda las capacidades generales de generacion del modelo base Olmo-3-7B-Think (chat, codigo, conocimiento general).
- Razonamiento multi-paso: produce explicaciones completas paso a paso, adecuadas para tareas que requieren trazabilidad del razonamiento.
- Soporte de tool calling: el modelo base lo soporta, aunque el adaptador no ha sido evaluado en ese aspecto.
- Multilingue: limitado, solo se ha evaluado en ingles.
- Sin modo de vision ni audio: es un modelo de texto puro.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede generar explicaciones detalladas paso a paso, utiles para tutores automaticos o sistemas de ayuda al estudiante.
- Evaluacion de modelos de razonamiento: sirve como punto de referencia para estudiar el efecto de la compresion de cadenas de pensamiento en la precision.
- Generacion de datos sinteticos de entrenamiento: las cadenas L1 verbosas pueden usarse para crear datasets de razonamiento para otros modelos mas pequenos.
- Integracion en pipelines de agentes que requieren justificacion explicita: el modelo produce razonamientos legibles por humanos antes de dar la respuesta final.
- Benchmarking de destilacion de conocimiento: permite comparar la calidad de la destilacion frente al modelo profesor.
- Investigacion sobre compresion de cadenas de pensamiento: el adaptador L1 es el extremo "verboso" de una familia de dialectos (L1 a L5), util para estudiar el trade-off entre longitud de razonamiento y exactitud.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, con decodificacion greedy, single-turn, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 88,5% |

No se han publicado comparaciones con otros modelos en la informacion disponible. El margen de error estimado es de aproximadamente ±2,7 puntos porcentuales (95% de intervalo de confianza para n=1317).

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parametros.
- VRAM estimada para inferencia: con precision bf16, el modelo base ocupa aproximadamente 14 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, A100 40GB, RTX 4090 24GB).
- Con cuantizacion de 4 bits del modelo base (por ejemplo, mediante bitsandbytes o GGUF), el conjunto podria caber en GPUs consumer de 8-12 GB, aunque no se ha verificado oficialmente.
- Opciones de despliegue: HuggingFace transformers + PEFT, vLLM (si soporta PEFT), llama.cpp (si se convierte el adaptador a GGUF), o servidores de inferencia como TGI.
- Latencia y throughput: no disponibles. Se recomienda medir en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados del adaptador frente a otros modelos. Como referencia cualitativa:

| Modelo | Parametros | Contexto | GSM8K (acc.) | Licencia |
|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-sft-l1 | 7B + LoRA | no disponible | 88,5% | Apache 2.0 |
| allenai/Olmo-3-7B-Think (base) | 7B | largo (no especificado) | no publicado | Apache 2.0 |
| Llama-3.1-8B | 8B | 128K | ~84% (reportado por Meta, no verificado) | Llama 3.1 Community |

La comparacion con el base no es posible sin datos publicados del mismo. Se recomienda ejecutar una evaluacion propia en el mismo benchmark para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de tipo word problem; su rendimiento en otras tareas no esta verificado.
- La precision disminuye con la dificultad del problema, y la caida es mas pronunciada en los niveles de compresion mas altos (no aplicable a este adaptador L1, pero relevante para la familia).
- El resultado de 88,5% proviene de una unica semilla; diferencias de unos pocos puntos pueden deberse al ruido estadistico.
- El adaptador no ha sido evaluado para tool calling, aunque el modelo base lo soporta.
- Solo se ha trabajado en ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinacion en problemas fuera de distribucion o con enunciados ambiguos.
- Para uso en produccion, se recomienda validar el comportamiento en el dominio especifico y considerar estrategias de mitigacion de errores.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l1
- Modelo base en HuggingFace: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio OLMo-core (scripts de entrenamiento): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
- Guia de entrenamiento de Olmo 3 (open-instruct): https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md
- Cuantizacion GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
