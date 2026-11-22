# staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-mlx

## Resumen

Llama-3_3-Nemotron-Super-49B-v1_5-lecore-mlx es una cuantizacion de precision mixta en formato MLX del modelo nvidia/Llama-3_3-Nemotron-Super-49B-v1_5, publicada por el usuario staccs bajo el metodo leCore Unicron `requantize`. No es un modelo nuevo ni reentrenado: solo se han recuantizado los pesos originales para reducir el espacio en disco y el consumo de memoria, eligiendo el numero de bits de cada capa lineal mediante medicion de dano (divergencia KL sobre distribuciones de siguiente token). El resultado ocupa 19,49 GB frente a los aproximadamente 100 GB que requeriria el modelo en bf16, lo que lo hace desplegable en equipos Apple Silicon de gama alta.

El modelo base es un transformer denso de 49.867.145.216 parametros derivado de Llama-3.3-70B-Instruct, con la arquitectura NAS (Neural Architecture Search) de NVIDIA Nemotron, que poda capas y dimensiones del modelo original. Esta orientado a generacion de texto, conversacion y razonamiento, con enfasis en ingles y con soporte de plantilla de chat. La version aqui descrita anade la restriccion de que requiere la libreria mlx-lm con soporte `nemotron-nas` y esta pensada exclusivamente para ejecucion en Apple Silicon mediante MLX.

La relevancia de esta ficha es practica: demuestra que una cuantizacion guiada por medicion por capa (2, 3, 4 y 8 bits segun el tensor) supera a las recetas estandar de MLX en perplejidad a igualdad de tamano, con un coste de 3,127 bits por peso y un rendimiento en MMLU 5-shot del 72,1 % sobre subconjuntos. Es un caso de estudio util para quien necesite ejecutar modelos de ~50B en hardware de consumo con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con poda NAS (nemotron-nas), derivado de Llama-3.3-70B-Instruct |
| Parametros totales | 49.867.145.216 (49,87B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `--max-kv-size 8192`) |
| Tipos de cuantizacion | Precision mixta MLX affine, group size 64: 2, 3, 4 y 8 bits por tensor lineal; embeddings a 4 bits, lm_head a 6 bits; media de 3,127 bpw |
| Idiomas soportados | en (ingles) |
| Licencia | other: NVIDIA Open Model License + Llama 3.3 Community License Agreement |
| Formato de pesos | safetensors (4 shards, MLX), 19,49 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer densa con poda estructural obtenida mediante Neural Architecture Search sobre Llama-3.3-70B-Instruct, de ahi la etiqueta `nemotron-nas` y la reduccion de 70B a ~49,87B de parametros. El repositorio incluye ficheros de modelado personalizados (`modeling_decilm.py`, utilidades de RoPE y cache de transformers 4.44.2), lo que indica que la implementacion no es la estandar de transformers y requiere soporte especifico en mlx-lm. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion de este repositorio concreto es el procedimiento de cuantizacion. Cada tensor lineal del decodificador se cuantizo de forma aislada con MLX affine (group 64) a 2, 3 y 4 bits, y se midio el dano como KL(fp16 || cuantizado) sobre las distribuciones de siguiente token en una mezcla de calibracion de 3066 tokens de WikiText-2 train, 1022 tokens de codigo Python y una sonda estructurada de prosa, codigo, SQL y markdown. Partiendo de 4 bits en todas las capas, se aplicaron degradaciones greedy eligiendo en cada paso la que minimizaba el dano medido por byte ahorrado hasta encajar en el presupuesto de tamano. El histograma final de tensores lineales es: 149 a 2 bits, 226 a 3 bits, 59 a 4 bits y 2 a 8 bits. La conversion se realizo con `mlx_lm.convert` y un `quant_predicate` por capa.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con plantilla de chat.
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU 5-shot del 72,1 % en subconjunto).
- Generacion de codigo: la perplejidad en codigo Python del modelo cuantizado es 7,8224 frente a 5,0725 del bf16, lo que sugiere degradacion moderada pero uso viable.
- Razonamiento matematico: el modelo base esta orientado a tareas de razonamiento, aunque no se han publicado resultados de GSM8K para esta cuantizacion.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 19,49 GB y puede ejecutarse con mlx-lm en equipos Apple Silicon de 32-36 GB de memoria unificada, permitiendo un asistente privado sin conexion a servicios externos.
- Prototipado de aplicaciones de razonamiento en ingles: con MMLU del 72,1 % en subconjunto, sirve para validar flujos de pregunta-respuesta y clasificacion compleja antes de pasar a modelos mayores o a la version bf16.
- Generacion y revision de codigo Python en local: la perplejidad de 7,8224 en codigo indica que mantiene capacidad util para autocompletado y explicacion de fragmentos, con la ventaja de no enviar codigo propietario a terceros.
- Investigacion sobre cuantizacion: el repositorio documenta el metodo leCore Unicron y ofrece pesos comparables (stock 3-bit, mixed_2_6) para reproducir experimentos de perplejidad y calidad por capa.
- Evaluacion de pipelines MLX: util para medir latencia y throughput reales de un modelo de ~50B cuantizado en hardware Apple antes de comprometerse con un despliegue en produccion.
- Filtrado y anotacion de datos en ingles: tareas de clasificacion, resumen y reescritura de corpus que se beneficien de ejecucion local y de la licencia del modelo base, siempre que se respeten sus restricciones.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre los pesos publicados, dequantizados a bf16 y ejecutados en GPU. La evaluacion MMLU usa lm-eval-harness 0.4.9 con 5-shot sobre las 10 primeras preguntas de cada una de las 57 materias (subconjunto, con ruido de muestreo estimado de ±2-4 puntos). GSM8K se evaluo sobre los 100 primeros problemas de test, pero no se reportan resultados para esta cuantizacion.

| Modelo | Tamano (GB) | bpw | WikiText-2 ppl | Python-code ppl | MMLU 5-shot | GSM8K strict | GSM8K flexible |
|---|---|---|---|---|---|---|---|
| bf16 referencia | – | 16 | 13,0182 | 5,0725 | no disponible | no disponible | no disponible |
| leCore mix (este repo) | 19,49 | 3,127 | 37,3530 | 7,8224 | 72,1 % | – | – |
| MLX 3-bit estandar, group 64 | 21,82 | 3,500 | 40,7840 | 30,7323 | no disponible | no disponible | no disponible |
| MLX `mixed_2_6` estandar | 19,72 | 3,164 | 95,8463 | 14,1513 | no disponible | no disponible | no disponible |

La perplejidad se calculo sobre los pesos exactos publicados (tensores MLX dequantizados con `mx.dequantize`, ejecutados en bf16 en GPU), con secuencia de 512 tokens: 32.704 tokens de WikiText-2 test y 8.176 tokens de un slice distinto de codigo Python. El autor advierte que la perplejidad de contexto corto no refleja toda la calidad y recomienda validar las salidas en el caso de uso propio.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 19,49 GB solo de pesos; con cache KV de 8192 tokens y overhead de runtime, se recomienda un minimo de 24-32 GB.
- Apple Silicon recomendado: Mac con 32 GB o mas de memoria unificada. En un equipo de 36 GB el autor indica que puede ser necesario elevar el limite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=30000`.
- GPU NVIDIA: no aplicable directamente, ya que los pesos estan en formato MLX y requieren mlx-lm; para CUDA existe la build GGUF del mismo autor (49,94 GB).
- Cabe en GPU de consumo: si, en el sentido de que cabe en Apple Silicon de gama alta; en GPUs NVIDIA consumer no es desplegable sin convertir los pesos.
- Opciones de despliegue: mlx-lm (unica soportada oficialmente por este repositorio), con soporte `nemotron-nas` requerido. Para llama.cpp u Ollama debe usarse la build GGUF enlazada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leCore mix MLX (este repo) | 49,87B | no disponible | 19,49 GB (3,127 bpw) | NVIDIA Open Model License + Llama 3.3 Community | Hugging Face, MLX |
| leCore GGUF (mismo autor) | 49,87B | no disponible | 49,94 GB | NVIDIA Open Model License + Llama 3.3 Community | Hugging Face, llama.cpp |
| MLX 3-bit estandar del mismo base | 49,87B | no disponible | 21,82 GB (3,5 bpw) | NVIDIA Open Model License + Llama 3.3 Community | Hugging Face, MLX |
| MLX `mixed_2_6` estandar del mismo base | 49,87B | no disponible | 19,72 GB (3,164 bpw) | NVIDIA Open Model License + Llama 3.3 Community | Hugging Face, MLX |

No se dispone de datos de benchmarks para las alternativas estandar ni para la build GGUF, por lo que la comparacion se limita a tamano, formato y licencia. La ventaja medida de este repositorio es la perplejidad: 37,35 frente a 40,78 del 3-bit estandar y 95,85 del `mixed_2_6`, a un tamano inferior en ambos casos.

## Limitaciones y advertencias

- Solo ingles: la model card declara `en` como unico idioma, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Degradacion medible frente a bf16: la perplejidad en WikiText-2 pasa de 13,02 a 37,35 y la de codigo Python de 5,07 a 7,82; en tareas sensibles a la precision puede haber perdida de calidad.
- Riesgo de alucinacion inherente al modelo base, no evaluado especificamente en esta cuantizacion.
- Benchmarks sobre subconjuntos: MMLU se midio con 10 preguntas por materia, con ruido estimado de ±2-4 puntos; no hay resultados de GSM8K ni de tareas downstream completas.
- Licencia compuesta y restrictiva: se aplican simultaneamente la NVIDIA Open Model License y la Llama 3.3 Community License Agreement; el uso comercial requiere revisar ambas, y la marca "Built with Llama" impone obligaciones de atribucion.
- Dependencia tecnica fuerte: requiere mlx-lm con soporte `nemotron-nas` y ficheros de modelado personalizados; no es un checkpoint estandar de transformers.
- Exclusivo de Apple Silicon: los pesos MLX no se ejecutan en CUDA sin conversion; para NVIDIA debe usarse la build GGUF.
- Sin reentrenamiento: el autor solo cuantizo; cualquier sesgo o limitacion del modelo base se hereda intacto.
- El repositorio tiene 683 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-mlx
- Modelo base: https://huggingface.co/nvidia/Llama-3_3-Nemotron-Super-49B-v1_5
- Build GGUF del mismo autor: https://huggingface.co/staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-GGUF
- Build HRR del mismo autor: https://huggingface.co/staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-hrr
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Llama 3.3 Community: https://www.llama.com/llama3_3/license/
