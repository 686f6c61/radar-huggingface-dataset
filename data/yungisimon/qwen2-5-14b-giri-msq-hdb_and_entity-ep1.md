# yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep1

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" sobre pares sinteticos de pregunta-respuesta derivados de MuSiQue, un conjunto de datos de razonamiento multi-salto. El objetivo es que el modelo aprenda a recuperar y razonar sobre informacion distribuida en multiples documentos, simulando el comportamiento de un modulo de memoria en pipelines de agentes.

El checkpoint publicado corresponde a la epoca 1 de un total de 3 planificadas, por lo que se trata de un modelo intermedio y no de la version final del entrenamiento. La arquitectura subyacente es la de Qwen2.5-14B-Instruct, un transformer denso de 14.770.033.664 parametros (14,77 mil millones) con licencia Apache 2.0. El modelo se distribuye en safetensors en bf16 y es compatible con `transformers` y con text-generation-inference.

La relevancia de esta ficha es doble: por un lado documenta un experimento concreto de ajuste fino orientado a memoria y recuperacion multi-documento; por otro, sirve como referencia de las capacidades heredadas de Qwen2.5-14B-Instruct, dado que el autor no publica evaluaciones propias ni detalles adicionales sobre el dataset o el rendimiento resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 (14,77 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de hasta 8.096 tokens; el contexto nativo de Qwen2.5-14B-Instruct no se detalla en la model card) |
| Tipos de cuantizacion | No se publican cuantizaciones propias; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar. El autor solo distribuye bf16 |
| Idiomas soportados | No disponible (la model card no especifica idiomas; hereda los del modelo base Qwen2.5-14B-Instruct, no documentados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion causal estandar y RoPE. El ajuste fino es completo (no LoRA ni QLoRA): el autor reporta 14.770.033.664 parametros entrenables, es decir, el 100,00% del modelo. El entrenamiento se realizo con FSDP sobre 8 GPU AMD Instinct MI325X, con precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. La tasa de aprendizaje fue de 2e-05 con warmup del 5% y decaimiento constante, weight decay de 0,01 y max grad norm de 1,0. El batch efectivo fue de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU) y la longitud maxima de secuencia de 8.096 tokens. El entrenamiento completo de 3 epocas requirio 9,18 horas de reloj (73,5 GPU-hora); la epoca 1 es la que se publica.

El dataset de entrenamiento son pares sinteticos de QA generados a partir de MuSiQue, con un metodo de agrupacion denominado `hdb_and_entity`: clustering HDBSCAN con tamano minimo de cluster 2 combinado con agrupacion por entidades (max df 3). El fichero de datos referenciado contiene 2.177.125 ejemplos. No se documenta en la model card si hubo RLHF, DPO u otra fase de alineacion posterior; el modelo hereda la alineacion del base Instruct. Tampoco se detalla la composicion exacta del dataset ni la distincion entre ejemplos de entrenamiento y validacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct y reforzada con el formato de chat de Qwen.
- Razonamiento multi-salto y recuperacion de informacion: el ajuste sobre MuSiQue esta orientado a responder preguntas que requieren combinar evidencia de varios documentos.
- Memoria y agregacion de contexto: el tag `memory-model` indica que el modelo se entrena para actuar como modulo de memoria en pipelines de agentes.
- Capacidades de codigo y matematicas: no se documentan especificamente en esta ficha, pero se heredan del modelo base (no verificadas por el autor).
- Tool calling / function calling: no documentado en la model card de este checkpoint.
- Modo thinking o razonamiento explicito: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: no documentadas; depende del modelo base.

## Casos de uso

- Recuperacion multi-documento en sistemas RAG: el modelo puede recibir varios fragmentos de contexto y responder preguntas que requieren sintetizar evidencia de fuentes distintas, gracias al entrenamiento sobre MuSiQue con agrupacion por entidades.
- Modulo de memoria en agentes conversacionales: al estar etiquetado como `memory-model`, puede emplearse para comprimir y recuperar el estado de una conversacion larga, resumiendo turnos previos y respondiendo con base en ellos.
- Preguntas y respuestas sobre corpus tecnicos o legales: el ajuste sobre pares QA sinteticos lo hace adecuado para escenarios donde la respuesta exige cruzar referencias entre documentos.
- Generacion de resumenes con evidencia cruzada: util para condensar informes que citan multiples fuentes y requieren coherencia entre secciones.
- Evaluacion de pipelines de recuperacion: sirve como modelo de referencia para medir si un sistema de retrieval entrega contexto suficiente para responder preguntas multi-salto.
- Prototipado de asistentes de investigacion: con 14,77 mil millones de parametros y licencia Apache 2.0, puede desplegarse en entornos de desarrollo para validar flujos de razonamiento antes de escalar a modelos mayores.
- Fine-tuning posterior o destilacion: al ser un checkpoint intermedio con pesos completos en bf16, puede reutilizarse como punto de partida para otros ajustes sobre dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones sobre MuSiQue para este checkpoint. Tampoco se aportan comparaciones con el modelo base ni con otros ajustes.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para los pesos (14,77 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 32-40 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB para pesos, viable en GPU de 24 GB con contexto limitado.
- VRAM estimada en cuantizacion de 4 bits: en torno a 8-9 GB para pesos, viable en GPU consumer de 12-16 GB, con perdida de calidad no evaluada por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o AMD MI300X/MI325X para bf16 sin cuantizar. El autor entreno en 8x AMD Instinct MI325X.
- GPU consumer: cabe en RTX 4090 (24 GB) solo con cuantizacion de 8 bits o inferior; en RTX 3090/4090 con 4 bits es viable con contexto reducido.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep1 | 14,77 mil millones | No disponible (entrenado con 8.096 tokens) | Apache 2.0 | Checkpoint epoca 1 de 3, ajuste sobre MuSiQue como memory model |
| Qwen/Qwen2.5-14B-Instruct | 14,77 mil millones | No disponible en esta ficha | Apache 2.0 | Modelo base; alineacion Instruct general, sin ajuste especifico de memoria |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones (aproximado, no confirmado en esta ficha) | No disponible en esta ficha | Apache 2.0 | Alternativa de menor tamano para despliegue en GPU consumer |
| Meta-Llama-3.1-8B-Instruct | 8 mil millones (aproximado, no confirmado en esta ficha) | No disponible en esta ficha | Llama 3.1 Community License | Alternativa de tamano similar con licencia no Apache |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la epoca 1 de 3; el autor no indica que sea la version final ni publica curvas de perdida, por lo que su calidad relativa frente al modelo base es desconocida.
- Sin evaluacion publicada: no hay benchmarks ni evaluaciones cualitativas que respalden las capacidades declaradas.
- Riesgo de alucinacion: al ser un ajuste sobre QA sintetico, puede generar respuestas plausibles pero no sustentadas en el contexto, especialmente en preguntas fuera de la distribucion de MuSiQue.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen2.5-14B-Instruct, no evaluados en esta ficha.
- Idiomas: no se especifican; el ajuste se realizo sobre un dataset en ingles (MuSiQue), lo que puede degradar el rendimiento en castellano u otros idiomas respecto al base.
- Contexto de entrenamiento limitado a 8.096 tokens: aunque el modelo base soporta ventanas mayores, el ajuste no se realizo con secuencias largas, lo que puede afectar al rendimiento en contextos extensos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las condiciones del modelo base y del dataset MuSiQue por separado.
- Repositorio con 38 descargas y 0 likes: escasa validacion por parte de la comunidad; no hay issues ni discusiones que documenten comportamientos en produccion.
- Formato unico bf16: no se distribuyen cuantizaciones oficiales; cualquier conversion a GGUF/AWQ/GPTQ corre por cuenta del usuario y no ha sido validada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de referencia MuSiQue: no se proporciona enlace directo en la model card
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
