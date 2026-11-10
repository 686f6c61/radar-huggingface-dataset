# yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep3

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon. El modelo se ha especializado como "memory model": se ha entrenado sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, un corpus orientado a tareas de recuperacion y memoria documental. El checkpoint publicado corresponde a la tercera y ultima epoca de entrenamiento.

Se trata de un transformer denso de 32.763.876.352 parametros (32,7 mil millones), con los pesos en bf16 safetensors y compatibles con la libreria transformers mediante `AutoModelForCausalLM.from_pretrained`. El entrenamiento se realizo con FSDP sobre 8 GPUs AMD Instinct MI325X durante 20,80 horas de reloj (166,4 GPU-horas), con una longitud maxima de secuencia de 8096 tokens y un tamano de lote efectivo de 1024.

Su relevancia es acotada pero concreta: es un experimento de investigacion que explora como un modelo de 32B puede adaptarse mediante fine-tuning completo a tareas de memoria y QA multi-documento, en lugar de depender de un RAG externo. La licencia Apache 2.0 y la disponibilidad de pesos completos lo hacen reutilizable, aunque su naturaleza experimental y la ausencia de benchmarks publicados limitan su uso directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 32.763.876.352 (100 % entrenables) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima de secuencia usada en entrenamiento); el contexto nativo de Qwen2.5-32B-Instruct no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 65,5 GB |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de la familia Qwen2, y se ha sometido a un fine-tuning completo (no LoRA ni adaptadores): los 32.763.876.352 parametros son entrenables. El entrenamiento se ejecuto con FSDP sobre 8 GPUs AMD Instinct MI325X, con lote efectivo de 1024 (64 por dispositivo, 2 pasos de acumulacion, 8 GPUs), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay de 0,01, max grad norm de 1,0 y gradient checkpointing en bf16. La perdida se calculo unicamente sobre los tokens del asistente.

El dataset de entrenamiento son pares sinteticos de QA derivados de BrowseComp-Plus, identificado en la model card como `bcp_subset300_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 2.968.214 ejemplos. El entrenamiento completo de 3 epocas consumio 20,80 horas de reloj (166,4 GPU-horas), y este checkpoint corresponde a la epoca 3. La longitud maxima de secuencia fue de 8096 tokens. No se documenta en la informacion disponible si hubo fases de RLHF, DPO o preferencias adicionales, ni innovaciones arquitectonicas propias mas alla del ajuste.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen, tal como indica la model card.
- Tareas de memoria y QA multi-documento, objetivo declarado del ajuste sobre BrowseComp-Plus.
- Razonamiento sobre contextos de hasta 8096 tokens en el regimen de entrenamiento.
- Capacidades heredadas del modelo base Qwen2.5-32B-Instruct (generacion, codigo, matematicas, multilingue), aunque no se documenta su preservacion tras el fine-tuning.
- Soporte de tool calling: no documentado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este ajuste.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre memoria en LLM: evaluar en que medida un fine-tuning completo sobre QA sintetico de BrowseComp-Plus permite al modelo retener y recuperar informacion de multiples documentos sin RAG externo, comparando con el base Qwen2.5-32B-Instruct.
- Experimentos de QA multi-documento: usar el modelo para responder preguntas que requieren cruzar entidades y hechos dispersos en varios documentos, aprovechando el entrenamiento especifico en "crossdoc entity combination".
- Baseline en pipelines de recuperacion aumentada: comparar un enfoque de memoria parametrica (este modelo) frente a un RAG clasico sobre el mismo corpus, midiendo exactitud y coste de inferencia.
- Generacion de respuestas sobre corpus acotados: desplegar el modelo en entornos donde el conocimiento relevante esta contenido en un conjunto documental conocido y se quiere evitar la latencia de recuperacion en linea.
- Estudio de olvido catastrofico: analizar como un fine-tuning completo de 3 epocas afecta a las capacidades generales del base (codigo, matematicas, multilingue), un caso de interes para investigadores de ajuste.
- Prototipos de asistentes documentales internos: servir el modelo con vLLM o TGI en infraestructura con GPUs de 80 GB para probar flujos conversacionales sobre documentacion tecnica o corporativa, siempre en fase experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 65,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 33-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: en torno a 17-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 con margen limitado.
- GPUs recomendadas: A100 80 GB, H100 80 GB, MI325X; para cuantizaciones bajas, RTX 4090, RTX 3090 o L40S.
- Despliegue: transformers (soporte nativo), vLLM, TGI (el modelo esta etiquetado como text-generation-inference y endpoints_compatible), llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento uso 8x MI325X durante 166,4 GPU-horas, dato de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep3 | 32,7 B (denso) | 8096 en entrenamiento | Apache 2.0 | Fine-tuning experimental de memoria sobre BrowseComp-Plus; sin benchmarks publicados |
| Qwen/Qwen2.5-32B-Instruct | 32,7 B (denso) | contexto nativo de Qwen2.5 (no verificado en esta ficha) | Apache 2.0 | Modelo base, con benchmarks publicados por Alibaba y uso generalista |
| Qwen/Qwen2.5-72B-Instruct | 72 B (denso) | contexto nativo de Qwen2.5 (no verificado en esta ficha) | Apache 2.0 (Qwen license para algunos tamanos) | Alternativa de mayor capacidad del mismo linaje |
| Mistral Small / modelos 30-35B densos | ~24-35 B | variable | Apache 2.0 en algunas variantes | Alternativas generalistas de tamano comparable; no se dispone de comparacion directa con este checkpoint |

La comparacion cuantitativa de rendimiento no es posible porque este checkpoint no publica benchmarks y no se ha evaluado frente a las alternativas en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora en tareas de memoria ni de preservacion de capacidades generales.
- Riesgo de olvido catastrofico: un fine-tuning completo de 3 epocas sobre 2,97 millones de ejemplos sinteticos puede degradar capacidades del base (codigo, matematicas, multilingue) no evaluadas.
- Riesgo de alucinacion: el entrenamiento sobre QA sintetico generado automaticamente puede introducir artefactos y respuestas plausibles pero incorrectas.
- Idiomas no documentados: se desconoce el soporte multilingue efectivo tras el ajuste, aunque el base Qwen2.5 es multilingue.
- Contexto efectivo limitado a 8096 tokens en entrenamiento; no se garantiza el comportamiento del contexto nativo del base.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su despliegue en produccion sin una bateria de pruebas propia.
- No se documenta soporte de tool calling ni de agentes para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- BrowseComp-Plus (referencia del dataset de entrenamiento, no se proporciona enlace directo en la model card): no disponible
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
