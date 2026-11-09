# yungisimon/Qwen2.5-32B-Instruct-memory-msq-full-ep2

## Resumen

Qwen2.5-32B-Instruct-memory-msq-full-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha especializado como "memory model" mediante entrenamiento supervisado sobre pares sinteticos de pregunta-respuesta generados a partir del corpus MuSiQue, un conjunto de datos de razonamiento multi-salto sobre multiples documentos. El checkpoint publicado corresponde a la epoca 2 de un total de 3, lo que lo convierte en un estado intermedio del proceso de entrenamiento.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de investigacion sobre como inyectar capacidades de memoria y recuperacion cross-document en un modelo denso de 32.700 millones de parametros. Por otro, sirve como ejemplo de pipeline de entrenamiento distribuido: el autor detalla el uso de FSDP sobre 8 aceleradores AMD Instinct MI325X, con un batch efectivo de 256 y una longitud maxima de secuencia de 8096 tokens, completando las 3 epocas en 5,79 horas (46,3 GPU-horas).

Se trata de un modelo denso de arquitectura transformer (familia Qwen2) con licencia Apache 2.0, pesos en bf16 safetensors y compatibilidad directa con `transformers` y text-generation-inference. No se han publicado resultados de benchmarks ni una evaluacion cuantitativa de la mejora en tareas de memoria, por lo que su rendimiento real frente al modelo base no esta documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2) |
| Parametros totales | 32.763.876.352 (32,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima usada en entrenamiento); contexto nativo de Qwen2.5-32B-Instruct no confirmado en la informacion disponible |
| Tipos de cuantizacion | Pesos publicados en bf16 safetensors; no se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Metodo de ajuste | Full fine-tuning (FSDP), 100 % de parametros entrenables |
| Dataset de entrenamiento | MuSiQue sintetico (`msq_subset1000_numsamplingepochs1_crossdoc_entity_combination_v3.json`), 664.608 ejemplos |
| Epoca publicada | 2 de 3 |
| Tamano del repositorio | 65,5 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct original: un transformer denso con atencion por cabezas y normalizacion RMSNorm, sin mezcla de expertos. El ajuste es completo, no un adaptador: los 32.763.876.352 parametros son entrenables (100,00 %). El entrenamiento se realizo con FSDP sobre 8 GPUs AMD Instinct MI325X, batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPUs), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay 0.01 y max grad norm 1.0. La precision fue bf16 con gradient checkpointing y la funcion de perdida se calculo unicamente sobre los tokens del asistente.

El dataset de entrenamiento son pares de QA sinteticos derivados de MuSiQue, un benchmark de razonamiento multi-salto que exige combinar informacion de varios documentos. La variante usada (`crossdoc_entity_combination_v3`) sugiere la construccion de ejemplos que combinan entidades a traves de documentos, lo que encaja con el objetivo declarado de convertir el modelo en un "memory model". No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa; el proceso es exclusivamente supervised fine-tuning sobre el corpus sintetico. La longitud maxima de secuencia de 8096 tokens condiciona la ventana practica de entrenamiento, aunque el modelo base podria soportar contextos mayores en inferencia (no confirmado).

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen, heredada del modelo base.
- Razonamiento multi-salto y recuperacion de informacion cross-document, objetivo principal del ajuste sobre MuSiQue.
- Memoria de contexto: el entrenamiento sobre pares QA sinteticos busca mejorar la retencion y el uso de informacion distribuida en la ventana de contexto.
- Soporte de tool calling y function calling: heredado del modelo base Qwen2.5-Instruct, aunque no se verifica tras el ajuste.
- Capacidades multilingues: presumiblemente heredadas de Qwen2.5, pero no declaradas ni evaluadas en la model card.
- Generacion de codigo y matematicas: capacidades del modelo base, no evaluadas tras el fine-tuning.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Sistemas de QA sobre documentacion tecnica extensa: el ajuste sobre MuSiQue entrena al modelo para combinar informacion de varios documentos, adecuado para asistentes que responden preguntas cuyas respuestas estan repartidas en manuales, RFCs o bases de conocimiento.
- Analisis de contratos y expedientes legales: la capacidad de razonamiento cross-document permite extraer clausulas relacionadas entre distintos anexos y documentos de un mismo expediente.
- Investigacion academica sobre memoria en LLMs: el checkpoint intermedio (epoca 2 de 3) es util como material de estudio para analizar como evoluciona la capacidad de memoria durante el entrenamiento.
- Asistentes de soporte con contexto largo: con ventana de 8096 tokens, puede gestionar conversaciones multi-turno con historial extenso y documentos adjuntos.
- Pipelines de extraccion de conocimiento: generacion de respuestas estructuradas a partir de corpus documentales, integrable via `transformers` o TGI.
- Reproduccion de experimentos de fine-tuning: el detalle de hiperparametros y hardware (FSDP, MI325X, 46,3 GPU-h) sirve como referencia para replicar entrenamientos de modelos de 32 B.
- Generacion de resumenes multi-fuente: sintesis de informacion procedente de varios documentos en una respuesta coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni metricas especificas de MuSiQue, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 80 GB o mas.
- Cuantizacion a 8 bits: ~33 GB, cabe en una A100 40 GB o H100 80 GB con margen.
- Cuantizacion a 4 bits: ~17-20 GB, podria caber en una RTX 4090 (24 GB) o RTX 3090, aunque no se publican pesos cuantizados.
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD Instinct MI300X/MI325X (usadas en el entrenamiento).
- Consumer GPU: solo viable con cuantizacion agresiva (4 bits) y contexto reducido; no se ofrecen ficheros GGUF oficiales.
- Despliegue: `transformers` (AutoModelForCausalLM), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM y llama.cpp (este ultimo requeriria conversion manual a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-msq-full-ep2 | 32,7 B | 8096 (entrenamiento) | Apache 2.0 | Checkpoint epoca 2/3, 0 descargas | Ajuste experimental sobre MuSiQue |
| Qwen/Qwen2.5-32B-Instruct | 32,7 B | 131.072 tokens (nativo Qwen2.5) | Apache 2.0 | Modelo base, ampliamente usado | Sin especializacion en memoria |
| Mistral-32B / Mixtral-8x7B | ~32 B / 46,7 B | 32.768 tokens | Apache 2.0 | Alternativas densas/MoE | No especializados en razonamiento cross-document |
| Llama-3.1-70B-Instruct | 70 B | 131.072 tokens | Llama 3.1 Community | Mayor escala | Requiere mas VRAM |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para el modelo ajustado.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no ha sido validado por la comunidad ni evaluado de forma independiente.
- Checkpoint intermedio (epoca 2 de 3): no representa el estado final del entrenamiento; puede contener artefactos de convergencia.
- Riesgo de sobreajuste al formato sintetico de MuSiQue: las respuestas pueden degradarse fuera de la distribucion de QA multi-salto.
- Riesgo de alucinacion: el ajuste supervisado sobre QA sinteticos no elimina la tendencia del modelo base a inventar informacion, especialmente en contextos largos.
- Idiomas no declarados: aunque Qwen2.5 es multilingue, no se verifica que el ajuste preserve el rendimiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin pesos cuantizados oficiales: el despliegue en hardware consumer exige conversion manual.
- La longitud de contexto practica queda limitada a los 8096 tokens usados en entrenamiento; no se confirma que el modelo mantenga el contexto nativo de 131.072 tokens del base.
- No se documentan sesgos especificos, pero hereda los del modelo base Qwen2.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-msq-full-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset MuSiQue (referencia del corpus): no disponible en la informacion proporcionada
- Paper de Qwen2.5: no disponible en la informacion proporcionada
- Repositorio o demo del autor: no disponible en la informacion proporcionada
