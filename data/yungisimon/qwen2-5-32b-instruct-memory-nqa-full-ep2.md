# yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep2

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-32B-Instruct de Alibaba, orientado a tareas de memoria de contexto largo sobre pares sinteticos de pregunta-respuesta generados a partir de NarrativeQA. Lo publica el usuario yungisimon en Hugging Face bajo licencia Apache 2.0 y se distribuye en safetensors bf16 compatibles con `transformers`.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 (32.763.876.352 parametros, sin mezcla de expertos) y se ha entrenado con FSDP sobre 8 GPU AMD Instinct MI325X, con un lote efectivo de 512 y una longitud maxima de secuencia de 8096 tokens. El checkpoint corresponde a la epoca 2 de 3 de un entrenamiento sobre 1.276.668 ejemplos sinteticos.

Su relevancia es acotada: no es un modelo generalista nuevo, sino un experimento de investigacion sobre como adaptar un LLM de 32B a tareas de recuperacion y razonamiento sobre documentos largos (memoria cross-document). Resulta util para quien investigue fine-tuning de memoria, pero no cuenta con benchmarks publicados ni con una model card detallada mas alla de los hiperparametros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa, sin MoE |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8096 tokens de longitud maxima de secuencia en entrenamiento (contexto nativo de Qwen2.5-32B-Instruct no indicado en la informacion disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen2.5-32B-Instruct, no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32.763.876.352 parametros con atencion causal estandar y RoPE. El ajuste es un full fine-tuning: el 100.00% de los parametros son entrenables, sin LoRA ni adaptadores. El entrenamiento se ejecuto con FSDP sobre 8 GPU AMD Instinct MI325X, con precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente.

Los hiperparametros declarados son: lote efectivo 512 (64 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate 2e-05 constante con warmup del 5%, 3 epocas (el checkpoint publicado es la epoca 2), weight decay 0.01, max grad norm 1.0 y longitud maxima de secuencia 8096. El dataset es `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 1.276.668 ejemplos sinteticos de pregunta-respuesta construidos a partir de NarrativeQA mediante combinacion de entidades cross-document. El entrenamiento completo de 3 epocas requirio 8,61 horas de reloj (68,9 GPU-horas). No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen (`apply_chat_template`).
- Razonamiento y respuesta sobre documentos largos, especialmente en el dominio de memoria cross-document para el que fue ajustado.
- Recuperacion de informacion y sintesis a partir de fragmentos de texto (chunks) de NarrativeQA.
- Capacidades heredadas del modelo base Qwen2.5-32B-Instruct (codigo, matematicas, multilingue), aunque no se han validado tras el fine-tuning.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en memoria de contexto largo: el modelo sirve para estudiar como un LLM de 32B sintetiza informacion repartida entre multiples documentos, gracias al entrenamiento sobre pares cross-document de NarrativeQA.
- Preguntas y respuestas sobre corpus narrativos: se puede usar para responder preguntas argumentales sobre novelas, guiones o relatos una vez troceados en chunks y concatenados hasta 8096 tokens.
- Evaluacion de estrategias de chunking: util como baseline para comparar tecnicas de troceado de documentos en pipelines RAG, ya que fue entrenado explicitamente con chunks.
- Experimentos de destilacion o comparacion de fine-tuning completo frente a LoRA: al ser un full fine-tuning documentado con hiperparametros completos, sirve de referencia reproducible.
- Analisis de sesgos y deriva tras fine-tuning: permite medir cuanto se degradan las capacidades generales de Qwen2.5-32B-Instruct al especializarlo en un dominio concreto.
- Prototipado de asistentes documentales internos: con la plantilla de chat de Qwen y despliegue en vLLM o TGI, puede integrarse en demos que requieran razonamiento sobre textos largos, siempre con validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye hiperparametros de entrenamiento (lote, learning rate, epocas, hardware y tiempo), sin metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32.763.876.352 parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: en torno a 33-35 GB; en 4 bits, en torno a 17-20 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD MI300X/MI325X (la familia usada en entrenamiento) para bf16 sin cuantizar.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriria cuantizacion agresiva a 4 bits y aun asi con margen ajustado para contexto largo.
- Opciones de despliegue: `transformers` (soporte declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep2 | 32,76 B | 8096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning de memoria sobre NarrativeQA, epoca 2 de 3 |
| Qwen/Qwen2.5-32B-Instruct | 32,76 B | no indicado en la informacion disponible | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, capacidades generales e instrucciones |
| Mistral Small 3 (24B) | no disponible en la informacion proporcionada | no disponible | Apache 2.0 | Hugging Face | Alternativa densa de tamano similar |
| Gemma 2 27B Instruct | no disponible en la informacion proporcionada | no disponible | Gemma license | Hugging Face | Alternativa densa de tamano similar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado corresponde a la epoca 2 de 3, no al modelo final del entrenamiento; puede no representar el mejor estado del ajuste.
- No hay benchmarks publicados: se desconoce el impacto del fine-tuning sobre las capacidades generales del modelo base (posible olvido catastrofico en codigo, matematicas o multilingue).
- Entrenado exclusivamente sobre pares sinteticos derivados de NarrativeQA: el dominio es narrativo y la generalizacion a otros corpus no esta validada.
- Riesgo de alucinacion no cuantificado; al ser un modelo de memoria sobre documentos, puede inventar detalles no presentes en el contexto.
- Idiomas soportados no declarados; el dataset de entrenamiento es en ingles (NarrativeQA), lo que puede degradar el rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-32B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad; no recomendado para produccion sin evaluacion propia.
- El tag `memory-model` sugiere un proposito de investigacion; no se documentan garantias de robustez ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset NarrativeQA (referencia del dominio): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
