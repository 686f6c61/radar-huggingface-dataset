# yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep1

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon. El objetivo declarado es convertir el modelo base en un "memory model": un modelo entrenado para responder preguntas de multiples saltos (multi-hop QA) sobre un contexto documental, empleando pares sinteticos de pregunta-respuesta generados a partir del corpus MuSiQue y agrupados mediante el algoritmo de clustering HDBSCAN (con tamano minimo de cluster 2). El checkpoint publicado corresponde a la epoca 1 de un entrenamiento de 3 epocas.

Arquitectura y tamano heredan directamente de Qwen2.5-14B-Instruct: un transformer decoder-only de 14.770.033.664 parametros (aproximadamente 14,8 mil millones), con licencia Apache 2.0 y pesos en bf16 safetensors compatibles con `transformers`. El contexto de entrenamiento se fijo en 8096 tokens. El modelo es relevante como ejemplo de especializacion de un LLM generalista hacia una tarea concreta de recuperacion y razonamiento sobre memoria documental, aunque se trata de un checkpoint intermedio y de un experimento de un autor individual, no de un modelo de proposito general listo para produccion.

No se dispone de informacion sobre idiomas soportados mas alla de los del modelo base, ni de resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5-14B-Instruct, sin listado explicito) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, inicializado desde Qwen2.5-14B-Instruct. El ajuste fino es completo (100 % de los parametros entrenables, 14.770.033.664), realizado con FSDP sobre 8 GPU AMD Instinct MI325X, en precision bf16 con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. La configuracion de entrenamiento incluye batch efectivo de 256 (32 por dispositivo, sin acumulacion, 8 GPU), learning rate constante de 2e-05 con warmup del 5 %, weight decay de 0.01, max grad norm de 1.0 y una duracion total de 3 epocas (4,66 horas de reloj, 37,3 GPU-hora). El checkpoint publicado es el de la epoca 1.

El dataset de entrenamiento son pares sinteticos de QA sobre MuSiQue, agrupados con HDBSCAN (min cluster size 2) y generados mediante una combinacion de entidades cross-document (fichero `msq_subset1000_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`), con un total de 1.085.701 ejemplos. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o attention linear; el modelo conserva la atencion estandar de Qwen2.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen, tal como indica el autor.
- Respuesta a preguntas de multiples saltos sobre contexto documental (multi-hop QA), que es la tarea objetivo del ajuste.
- Razonamiento sobre memoria: el entrenamiento con pares QA sinteticos de MuSiQue busca que el modelo recupere y combine informacion de varios documentos.
- Capacidades heredadas del modelo base Qwen2.5-14B-Instruct (codigo, matematicas, multilingue, tool calling), si bien no se verifica su conservacion tras el ajuste; no disponible en la informacion proporcionada.
- No se documentan modos especiales (thinking mode, vision, audio) ni soporte explicito de agentes en la model card.

## Casos de uso

- Evaluacion de memoria a largo plazo en pipelines RAG: el modelo puede usarse como generador en un sistema de recuperacion aumentada donde se le pasan varios documentos y debe combinar evidencia de varios de ellos para responder, que es exactamente la distribucion de entrenamiento (MuSiQue multi-hop).
- Investigacion sobre especializacion de LLM: sirve como punto de partida para estudiar como un ajuste fino completo sobre QA sintetico afecta a las capacidades generales del modelo base, comparando contra Qwen2.5-14B-Instruct.
- Prototipos de asistentes documentales: con un contexto de 8096 tokens, puede gestionar conversaciones con varios fragmentos de documentacion concatenados, adecuado para pruebas de concepto internas.
- Generacion de datos sinteticos de QA: el modelo puede emplearse para producir pares pregunta-respuesta sobre corpus propios, dado que fue entrenado con ese tipo de datos.
- Baseline en experimentos de clustering y seleccion de datos: el checkpoint permite medir el efecto de la estrategia HDBSCAN (min cluster size 2) frente a otras estrategias de construccion de dataset.
- Despliegue self-hosted con licencia permisiva: al ser Apache 2.0 y pesar 29,6 GB en safetensors bf16, puede servirse en infraestructura propia con vLLM o TGI para tareas de QA documental, sin las restricciones de licencias no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 40-48 GB de VRAM para secuencias largas.
- En cuantizacion de 8 bits: alrededor de 15 GB de pesos; en 4 bits, alrededor de 8-9 GB, aunque no se publican versiones cuantizadas oficiales y habria que generarlas.
- GPU recomendadas: A100 80 GB, H100 80 GB, MI325X (la misma familia usada en entrenamiento) para bf16 sin cuantizar; A100 40 GB o L40S 48 GB para bf16 con secuencias moderadas.
- GPU de consumo: una RTX 4090 (24 GB) no cabe en bf16; seria necesario cuantizar a 4-8 bits, con la perdida de calidad asociada y sin garantia del autor.
- Opciones de despliegue: `transformers` (soporte confirmado por el autor), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM; llama.cpp/Ollama requeririan convertir los pesos a GGUF, lo cual no se documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep1 | 14,77 B | 8096 (entrenamiento) | Apache 2.0 | Ajuste fino para multi-hop QA; checkpoint de epoca 1 de 3 |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base; capacidades generales, sin especializacion en memoria |
| Qwen2.5-7B-Instruct | 7,6 B aprox. | no disponible en la informacion proporcionada | Apache 2.0 | Alternativa de menor tamano para despliegue en GPU de consumo |
| Modelos de QA multi-hop especializados | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas para este checkpoint |

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 1 de 3): el autor no publica resultados de evaluacion, por lo que no hay evidencia de que el ajuste haya convergido ni de que supere al modelo base.
- Riesgo de sobreajuste al formato de MuSiQue y de degradacion de capacidades generales (codigo, matematicas, instrucciones generales) tras un full fine-tuning sobre 1.085.701 ejemplos de una unica tarea.
- Riesgo de alucinacion en respuestas multi-hop si la evidencia documental no esta presente en el contexto; no se documentan mecanismos de abstención.
- Contexto de entrenamiento limitado a 8096 tokens, lo que restringe la cantidad de documentos que caben en una sola llamada.
- Idiomas soportados no documentados; el comportamiento en castellano no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base Qwen2.5-14B-Instruct tambien es Apache 2.0.
- Sin cuantizaciones oficiales publicadas; cualquier despliegue en GPU de consumo requiere conversion propia y validacion.
- Modelo de autor individual con 97 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MuSiQue (referencia de la tarea): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo de entrenamiento: no disponible en la informacion proporcionada
