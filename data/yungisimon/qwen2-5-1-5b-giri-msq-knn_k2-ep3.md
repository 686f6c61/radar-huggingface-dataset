# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep3

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon, orientado a funcionar como "memory model" sobre pares sinteticos de pregunta-respuesta de tipo multi-hop generados a partir del dataset MuSiQue. El modelo parte de la arquitectura Qwen2 de 1.500 millones de parametros aproximadamente (1.543.714.304 reales segun safetensors) y conserva la ventana de contexto nativa de la familia Qwen2.5, aunque el entrenamiento se realizo con una longitud maxima de secuencia de 8096 tokens.

El objetivo declarado es el de un modelo de memoria conversacional: se entrena para retener y recuperar informacion de contexto documental multi-documento, empleando una estrategia de agrupacion denominada knn_k2 (kNN con k=2 y deduplicacion de documentos) sobre un subconjunto de 1000 muestras de MuSiQue que genera 634.327 ejemplos sinteticos. El checkpoint publicado corresponde a la epoca 3 de 3.

Es relevante ahora porque explora un nicho poco cubierto en modelos pequenos: el uso de modelos de 1,5B como capa de memoria y recuperacion en pipelines RAG o agentes, con un coste de entrenamiento muy bajo (5,2 GPU-horas en 8x AMD Instinct MI325X) y licencia Apache 2.0, lo que facilita su reutilizacion comercial. No obstante, se trata de un experimento de investigacion con cero descargas y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con max sequence length de 8096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, heredado integramente de Qwen2.5-1.5B-Instruct, sin modificaciones estructurales. El ajuste fino es completo (no LoRA ni QLoRA): los 1.543.714.304 parametros son entrenables (100,00%), lo que implica que se actualizan todos los pesos del modelo base. El entrenamiento se realizo con FSDP sobre 8 GPU AMD Instinct MI325X, con tamano de batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate constante de 2e-05 con warmup del 5%, weight decay de 0,01, max grad norm de 1,0 y 3 epocas. Se uso precision bf16 con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente.

Los datos de entrenamiento proceden de un fichero sintetico denominado msq_subset1000_numsamplingepochs1_knn2_doc_dedup_crossdoc_entity_combination_v3.json, con 634.327 ejemplos generados a partir de un subconjunto de 1000 muestras de MuSiQue. La estrategia knn_k2 combina recuperacion kNN con k=2 y deduplicacion de documentos, ademas de combinacion de entidades entre documentos (cross-doc entity combination), lo que sugiere un enfasis en razonamiento multi-hop y agregacion de informacion entre fuentes. No se especifica si hubo RLHF o DPO adicionales; el modelo base ya incorpora el alineamiento de Qwen2.5-Instruct. El coste total de las 3 epocas fue de 0,66 horas de reloj (5,2 GPU-horas), lo que indica un dataset pequeno en tokens efectivos pese al numero de ejemplos.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen (chat template obligatorio).
- Memoria y recuperacion de informacion en contextos multi-documento, orientada a tareas de QA multi-hop.
- Razonamiento sobre entidades y relaciones entre documentos (cross-doc entity combination).
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct: generacion, razonamiento basico, codigo y matematicas de nivel moderado.
- Soporte de tool calling y function calling heredado del modelo base (no validado especificamente tras el ajuste fino).
- Capacidades multilingues heredadas del modelo base (no verificadas en este checkpoint).
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Capa de memoria en agentes conversacionales: el modelo puede almacenar y recuperar hechos de conversaciones largas, aprovechando su entrenamiento sobre pares QA multi-hop para resolver preguntas que requieren combinar informacion de varios turnos.
- RAG multi-documento: adecuado para responder preguntas que exigen agregar evidencia de dos o mas documentos, gracias al entrenamiento con deduplicacion y combinacion de entidades entre documentos.
- Extraccion de entidades y relaciones en pipelines de conocimiento: el ajuste con cross-doc entity combination lo hace util para consolidar menciones de una misma entidad en distintas fuentes.
- Prototipado rapido de asistentes de documentacion tecnica: su tamano de 1,5B permite desplegarlo en una sola GPU consumer para pruebas de concepto sin coste elevado.
- Filtrado y reescritura de contextos en sistemas RAG: puede usarse como modelo intermedio que condensa o reordena fragmentos recuperados antes de pasarlos a un modelo mayor.
- Investigacion sobre memoria en modelos pequenos: sirve como baseline reproducible para estudiar estrategias de agrupacion tipo kNN en tareas de QA sintetico.
- Generacion de datos sinteticos de QA: el propio pipeline de entrenamiento (MuSiQue + knn_k2) puede replicarse para crear datasets de evaluacion de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo de pesos, mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB de pesos (cuantizaciones no publicadas por el autor, requieren conversion propia).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100 o H100 sobredimensionadas para este tamano, utiles solo para batch alto.
- Cabe en GPU consumer: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 de 24 GB y equivalentes.
- Opciones de despliegue: transformers (AutoModelForCausalLM.from_pretrained), vLLM, TGI (tag text-generation-inference y endpoints_compatible), llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep3 | 1,54B | no disponible (entrenado a 8096) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino experimental para memoria multi-hop |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (nativo Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; capacidades generales e instrucciones |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Hugging Face | Mas capacidad general, mayor coste de inferencia |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con contexto mayor, licencia mas restrictiva |

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion externa.
- No se han publicado benchmarks; el rendimiento real en tareas de memoria y QA multi-hop es desconocido.
- Entrenado exclusivamente sobre QA sintetico derivado de MuSiQue: puede degradar capacidades generales del modelo base (olvido catastrofico) y sobreajustar al formato de los datos sinteticos.
- Riesgo de alucinacion: al ser un modelo de 1,5B ajustado para recuperar informacion, puede inventar hechos cuando el contexto no contiene la respuesta.
- Idiomas soportados no documentados; se asume herencia del modelo base, pero no hay verificacion.
- Longitud de contexto de inferencia no documentada; el entrenamiento se limito a 8096 tokens, por lo que contextos mayores pueden degradar la calidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar sesgos y calidad antes de desplegar.
- Requiere usar la plantilla de chat de Qwen; un formateo incorrecto puede producir salidas degeneradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del entrenamiento): no disponible enlace directo en la informacion proporcionada
- Paper de MuSiQue: no disponible enlace directo en la informacion proporcionada
