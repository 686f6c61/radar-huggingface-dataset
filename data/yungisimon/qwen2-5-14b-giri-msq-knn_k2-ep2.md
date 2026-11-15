# yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep2

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon bajo licencia Apache 2.0. El modelo se ha entrenado como "memory model", es decir, un modelo orientado a tareas de recuperacion y razonamiento sobre memoria documental, utilizando pares sinteticos de pregunta-respuesta generados a partir de MuSiQue con un metodo de agrupacion denominado knn_k2 (kNN con k=2 y deduplicacion de documentos).

El checkpoint publicado corresponde a la epoca 2 de 3 de un entrenamiento completo con FSDP sobre 8 GPU AMD Instinct MI325X. El conjunto de datos consta de 634.327 ejemplos derivados del fichero msq_subset1000_numsamplingepochs1_knn2_doc_dedup_crossdoc_entity_combination_v3.json.

Arquitectura, tamano y contexto heredan directamente del modelo base: un transformer denso de 14.770.033.664 parametros (aproximadamente 14,7B) con los pesos en bf16 safetensors. Es relevante para desarrolladores que quieran evaluar si el ajuste fino especifico sobre tareas de memoria multi-documento mejora las capacidades del Qwen2.5-14B-Instruct original en escenarios de QA con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens usados en entrenamiento (contexto nativo del base Qwen2.5-14B-Instruct: no especificado en la informacion disponible para este checkpoint) |
| Tipos de cuantizacion | No disponible en la model card (los pesos se publican en bf16; al ser compatible con transformers permite cuantizacion posterior, pero no se documenta) |
| Idiomas soportados | No disponible (el base Qwen2.5 soporta multiples idiomas, pero este checkpoint no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), cargable con transformers |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin componentes MoE ni SSM. El ajuste fino es completo (100% de parametros entrenables, 14.770.033.664), realizado con FSDP en 8 GPU AMD Instinct MI325X, precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. La tasa de aprendizaje es 2e-05 constante con warmup del 5%, weight decay 0.01, max grad norm 1.0 y tamano de batch efectivo de 256 (32 por dispositivo, 1 acumulacion, 8 GPU). La longitud maxima de secuencia durante el entrenamiento es de 8.096 tokens.

El dataset de entrenamiento son 634.327 ejemplos sinteticos de QA derivados del subconjunto msq_subset1000 de MuSiQue, agrupados con el metodo knn_k2 (kNN con k=2 y deduplicacion de documentos, con combinacion de entidades cross-documento en la version v3). Se trata de un entrenamiento supervisado de tres epocas; este checkpoint corresponde a la epoca 2. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion adicionales sobre el ajuste fino. El objetivo declarado es especializar el modelo como "memory model" para tareas de recuperacion y respuesta sobre multiples documentos.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del Qwen2.5-14B-Instruct y usa la plantilla de chat de Qwen.
- Razonamiento sobre memoria documental: entrenado especificamente con pares QA multi-documento sinteticos para tareas de recuperacion y sintesis de informacion entre documentos.
- Manejo de contexto largo: entrenamiento con secuencias de hasta 8.096 tokens, adecuado para concatenar varios documentos en el prompt.
- Soporte de tool calling / function calling: no confirmado para este checkpoint en la informacion disponible (el base Qwen2.5-14B-Instruct lo soporta, pero no se documenta en esta ficha).
- Razonamiento multi-paso y agentes: no confirmado para este checkpoint.
- Capacidades multilingues: no documentadas para este checkpoint.
- Capacidad especial "memory model": el ajuste esta orientado a tareas de memoria y QA multi-documento, no a un uso generalista sin validacion.

## Casos de uso

- QA multi-documento en entornos de investigacion: el modelo se ha entrenado con pares QA generados a partir de MuSiQue concatenando documentos; resulta util para responder preguntas que requieren integrar informacion de varias fuentes en un unico prompt de hasta 8.096 tokens.
- Sistemas RAG con contexto largo: puede recibir varios chunks recuperados y generar respuestas sintetizadas; su entrenamiento especifico sobre deduplicacion de documentos (doc dedup) encaja con pipelines que inyectan fragmentos redundantes.
- Extraccion de entidades y relaciones cross-documento: el dataset de entrenamiento combina entidades entre documentos, por lo que el modelo es adecuado para tareas de resolucion de entidades y construccion de grafos de conocimiento a partir de corpus.
- Asistentes de atencion al cliente con base documental: se puede integrar en un pipeline que cargue manuales o politicas de la empresa como contexto y responda en lenguaje natural; el ajuste sobre QA documental mejora la coherencia con el material de referencia.
- Evaluacion comparativa de metodos de memoria: sirve como checkpoint de referencia para investigadores que comparan estrategias de memoria (knn_k2 frente a otras agrupaciones) sobre el mismo base.
- Generacion de resumenes multi-fuente: con varias fuentes en contexto, puede producir resumenes que integren informacion dispersa, apoyandose en el entrenamiento sobre combinacion de entidades entre documentos.
- Filtrado y verificacion de afirmaciones contra un corpus: el modelo puede contrastar afirmaciones con documentos cargados en contexto y senalar discrepancias, util en tareas de fact-checking asistido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14,77B x 2 bytes); con cache KV y activaciones se recomienda al menos 32-40 GB.
- VRAM estimada en cuantizacion int8: aproximadamente 15 GB; en int4: aproximadamente 8-10 GB (estimaciones teoricas, la model card no documenta cuantizaciones).
- GPU recomendadas: A100 40/80 GB, H100, L40S, o 2 GPU consumer de 24 GB en paralelo para bf16. El entrenamiento se realizo en 8 AMD Instinct MI325X.
- GPU consumer: no cabe en una sola GPU consumer de 24 GB en bf16; en int4 podria caber en tarjetas de 16-24 GB (RTX 4080/4090), sujeto a validacion.
- Opciones de despliegue: transformers (AutoModelForCausalLM), text-generation-inference (tagueado como compatible con endpoints), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep2 | 14,77B | 8.096 tokens en entrenamiento | Full fine-tune sobre QA multi-documento (MuSiQue, knn_k2) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | Contexto nativo Qwen2.5 (no especificado aqui) | RLHF/instruccion generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| yungisimon Qwen2.5-14B giri-msq (otros checkpoints knn) | 14,77B | Similar | Variantes de agrupacion kNN y epocas | Apache 2.0 | Hugging Face (repositorios del mismo autor) |
| Modelos de memoria de 7-14B especializados en QA multi-documento | Variable | Variable | Varía | Varía | No disponible comparativa directa |

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio (epoca 2 de 3); no es la version final del entrenamiento y su rendimiento puede no estar estabilizado.
- No se publican benchmarks ni evaluaciones de calidad; no hay evidencia cuantitativa de mejora frente al base Qwen2.5-14B-Instruct.
- Especializacion estrecha: el ajuste fino sobre QA sintetico de MuSiQue puede degradar capacidades generalistas del base (regresion catastrofica parcial) fuera del dominio de memoria documental.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido no respaldado por los documentos de contexto; el ajuste sobre datos sinteticos no elimina este riesgo.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Idiomas no declarados: no hay garantia de comportamiento multilingue consistente en este checkpoint.
- Contexto de entrenamiento limitado a 8.096 tokens, inferior al contexto nativo del base; prompts mas largos pueden degradar el rendimiento.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria ni casos de uso reportados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; conviene auditar el modelo en el caso de uso concreto antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de referencia MuSiQue: no disponible enlace directo en la informacion proporcionada
- Paper de MuSiQue: no disponible enlace en la informacion proporcionada
