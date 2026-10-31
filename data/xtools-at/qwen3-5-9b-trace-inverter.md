# xtools-at/Qwen3.5-9B-Trace-Inverter

## Resumen

Qwen3.5-9B-Trace-Inverter es un modelo experimental de 9B desarrollado por xtools-at, especializado en la tarea de *trace inversion* (inversion de razonamiento). Dado un problema, una respuesta final conocida y uno o mas "burbujas de razonamiento" comprimidas, el modelo expande esas pistas en una traza de razonamiento detallada y plausible, emitida dentro de un bloque `<think>...</think>`. No es un modelo de proposito general, sino una herramienta para flujos de generacion de datos sinteticos y supervision de razonamiento.

El modelo parte del checkpoint xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic (arquitectura Qwen3.5) y se ha entrenado con unos 11.100 ejemplos procedentes de datasets de trace inversion basados en salidas de Claude Opus. La tarea sigue el enfoque del paper "How to Steal Reasoning Without Reasoning Traces" (arXiv:2603.07267) y el trabajo de referencia Jackrong/Trace-Inverter-4B, con la particularidad de que esta variante es *bubble-conditioned*: las burbujas de razonamiento forman parte obligatoria de la entrada.

Su relevancia actual radica en la creciente demanda de trazas de razonamiento sinteticas para el fine-tuning supervisado de modelos con capacidad de razonamiento (chain-of-thought). Permite generar candidatos de trazas a partir de resumenes comprimidos, aunque el autor subraya que las salidas son reconstrucciones sinteticas, no el razonamiento original oculto de ningun modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder), adaptador sobre modelo base fusionado |
| Parametros totales | 9B (aproximado segun denominacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (safetensors, sin cuantizaciones publicadas) |
| Idiomas | no disponible (entrenado con datos en ingles; instrucciones en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamanio del repo: 0,1 GB, consistente con un adaptador/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre el checkpoint base xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, una fusion de tres modelos de la familia Qwen3.5 con estilo Claude y sin restricciones ("heretic"). El tamanio del repositorio (0,1 GB) indica que los pesos publicados son un adaptador (LoRA/PEFT) y no el modelo completo, por lo que la inferencia requiere cargar el modelo base mas el adaptador.

El entrenamiento emplea 11.100 entradas de entrenamiento y 555 de evaluacion, combinando dos datasets: Jackrong/Claude-opus-4.6-TraceInversion-9000x (unas 8.670 filas) y Jackrong/Claude-opus-4.7-TraceInversion-5000x (unas 4.760 filas), cuyos campos fueron mapeados y convertidos en el dataset xtools-at/trace-inversion-opus-synthetic. A diferencia de la variante NoBubble (amkkk/Trace-Inverter-4B-NoBubble), este modelo retiene las burbujas de razonamiento en el prompt tanto en entrenamiento como en inferencia, usandolas como esqueleto que debe expandir preservando el orden logico y la coherencia con la respuesta final. No se ha publicado informacion sobre el metodo de ajuste exacto (LoRA, hiperparametros, numero de epocas) ni sobre uso de RLHF/DPO.

## Capacidades

- Reconstruccion de trazas de razonamiento sinteticas: expande burbujas comprimidas en un razonamiento detallado y coherente dentro de un bloque `<think>...</think>`.
- Acondicionamiento a burbujas: preserva el orden y la intencion de las burbujas de razonamiento proporcionadas en el prompt.
- Consistencia con la respuesta: trata la respuesta final suministrada como restriccion y genera explicaciones plausibles que conducen a ella.
- Generacion de texto conversacional basica heredada del modelo base, aunque no es su proposito principal.
- No esta documentado soporte de tool calling, capacidades de vision/audio ni modo de razonamiento interactivo.

## Casos de uso

- Generacion de datos sinteticos para SFT: produccion de candidatos de trazas de razonamiento que, tras filtrado y verificacion, pueden incorporarse a datasets de fine-tuning supervisado de modelos con razonamiento.
- Investigacion en trace inversion: estudio experimental de la tecnica descrita en arXiv:2603.07267, comparando variantes bubble-conditioned frente a NoBubble.
- Reconstruccion de razonamiento a partir de resumenes: dada una solucion y su resumen comprimido, generar una explicacion paso a paso plausible para documentacion o analisis.
- Aumento de datasets de razonamiento: expansion de ejemplos existentes creando multiples trazas candidatas para el mismo par problema-respuesta.
- Prototipado de pipelines de destilacion: integracion en flujos de destilacion de conocimiento donde se necesita convertir resumenes de razonamiento en supervision detallada.
- Evaluacion de calidad de burbujas: uso como herramienta para medir cuanta informacion sobre el proceso de razonamiento filtran los resumenes comprimidos de los modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador de 0,1 GB sobre un modelo base de 9B, los requisitos dominantes son los del modelo base Qwen3.5-9B: aproximadamente 18-20 GB de VRAM en FP16/BF16, o en torno a 6-8 GB con cuantizacion a 4 bits (estimaciones, no confirmadas por el autor).
- GPU recomendadas: RTX 4090 (24 GB) para inferencia en precision completa; opciones cloud como A100 o H100 para generacion por lotes de datasets.
- Deberia funcionar en GPUs de consumo de gama alta (RTX 3090/4090); con cuantizacion a 4 bits podria caber en GPUs de 12 GB (estimacion).
- Opciones de despliegue: al usar clases de procesador/modelo de Qwen3.5 y chat template propio, es compatible con transformers; no se menciona soporte explicito para vLLM, llama.cpp, Ollama o TGI (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Condicionamiento | Licencia |
|---|---|---|---|---|
| xtools-at/Qwen3.5-9B-Trace-Inverter | 9B (adaptador) | Trace inversion | Bubble-conditioned | Apache 2.0 |
| Jackrong/Trace-Inverter-4B | 4B | Trace inversion | Bubble-conditioned | no disponible |
| amkkk/Trace-Inverter-4B-NoBubble | 4B | Trace inversion | Sin burbujas en el prompt | no disponible |
| xtools-at/Qwen3.5-4B-Trace-Inverter | 4B | Trace inversion | Bubble-conditioned | no disponible |

Este modelo ofrece mayor capacidad potencial que las variantes de 4B gracias a sus 9B de base, a costa de mayores requisitos de hardware. Comparte datasets de entrenamiento con la variante NoBubble, pero difiere en el formato de entrada.

## Limitaciones y advertencias

- Las salidas son reconstrucciones sinteticas, no el razonamiento original oculto de Claude ni de ningun otro modelo fuente; deben etiquetarse como sinteticas.
- Al estar condicionado por la respuesta, puede generar explicaciones convincentes para respuestas incorrectas: no debe interpretarse la coherencia de la traza como prueba de correccion.
- Esta disenado para recibir burbujas de razonamiento en el prompt; omitirlas queda fuera del uso previsto y puede degradar la calidad.
- Es obligatorio verificar las trazas generadas (calculos, ejecucion de codigo, comprobacion de hechos) antes de usarlas como supervision en entrenamiento.
- Uso orientado a investigacion: no fiarse de las trazas para decisiones medicas, legales o financieras de alto riesgo.
- El modelo base incluye una version "uncensored" (sin restricciones), lo que puede implicar menor filtrado de contenido; conviene aplicar salvaguardas propias en produccion.
- No hay benchmarks publicados, documentacion de idiomas ni datos de contexto; su comportamiento en idiomas distintos del ingles no esta verificado.
- Respetar los terminos de los modelos y datasets origen al usar o redistribuir las salidas.

## Enlaces

- Modelo: https://huggingface.co/xtools-at/Qwen3.5-9B-Trace-Inverter
- Paper: How to Steal Reasoning Without Reasoning Traces (arXiv:2603.07267): https://huggingface.co/papers/2603.07267
- Dataset de entrenamiento mapeado: https://huggingface.co/datasets/xtools-at/trace-inversion-opus-synthetic
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Variante 4B del mismo autor: https://huggingface.co/xtools-at/Qwen3.5-4B-Trace-Inverter
- Generador de razonamiento 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Reasoning-Generator
- Generador de razonamiento 9B: https://huggingface.co/xtools-at/Qwen3.5-9B-Reasoning-Generator
- Referencia bubble-conditioned: https://huggingface.co/Jackrong/Trace-Inverter-4B
- Referencia NoBubble: https://huggingface.co/amkkk/Trace-Inverter-4B-NoBubble
