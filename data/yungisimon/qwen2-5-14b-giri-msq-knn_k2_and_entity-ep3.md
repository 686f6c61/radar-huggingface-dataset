# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep3

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon y publicado en Hugging Face bajo licencia Apache 2.0. El modelo se ha entrenado como "memory model": un modelo especializado en responder preguntas a partir de un contexto de memoria documental, en lugar de un asistente generalista. El checkpoint publicado corresponde a la epoca 3 de 3 del entrenamiento.

El ajuste se ha realizado sobre un conjunto sintetico de pares pregunta-respuesta derivado de MuSiQue (multi-hop QA), generado con el metodo de clustering `knn_k2_and_entity` (kNN con k=2, deduplicacion de documentos y agrupacion por entidades con frecuencia documental maxima de 3). El dataset resultante contiene 1.725.751 ejemplos. La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 14.770.033.664 parametros, con ventana de contexto nativa de 32.768 tokens en el modelo base (no se documenta en la model card si el ajuste la modifica; el entrenamiento se realizo con longitud maxima de secuencia 8.096).

Su relevancia es acotada pero concreta: sirve como referencia para experimentos de "memoria" en LLM, es decir, modelos que recuperan y sintetizan informacion de un conjunto documental dado en el prompt. No es un modelo de proposito general ni compite con los instructivos actuales; es un artefacto de investigacion reproducible (se documentan hiperparametros, hardware y datos de entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, base Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenamiento con max_seq_length de 8.096 |
| Tipos de cuantizacion | no documentados por el autor; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible en la model card (heredados del modelo base Qwen2.5, multilingue: chino, ingles y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 29,6 GB |
| Libreria | transformers (AutoModelForCausalLM) |
| Pipeline | text-generation |
| Plantilla de chat | plantilla de chat de Qwen |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion por causalidad, RoPE, GQA (grouped query attention) y SwiGLU en las capas feed-forward, segun la arquitectura estandar de la familia Qwen2. No se introduce ninguna modificacion arquitectonica: el ajuste es un full fine-tuning con FSDP sobre los 14.770.033.664 parametros (100 % entrenables). Se uso bf16, gradient checkpointing y calculo de la perdida unicamente sobre los tokens del asistente.

Los datos de entrenamiento son 1.725.751 ejemplos sinteticos de QA multi-hop derivados del subconjunto `msq_subset1000` de MuSiQue, construidos con el metodo de clustering `knn_k2_and_entity`: vecinos mas cercanos con k=2, deduplicacion por documento y agrupacion por entidad con frecuencia documental maxima de 3, con combinacion de entidades entre documentos (version v3). Hiperparametros: batch efectivo de 256 (32 por dispositivo, 1 acumulacion, 8 GPUs), learning rate 2e-05 constante con warmup del 5 %, 3 epocas, weight decay 0,01, max grad norm 1,0 y longitud maxima de secuencia 8.096. El entrenamiento completo duro 7,36 h (58,9 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta RLHF, DPO ni ninguna fase de alineacion posterior al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen, orientada a responder preguntas sobre un contexto documental proporcionado en el prompt.
- Razonamiento multi-hop sobre memoria: el entrenamiento con MuSiQue (preguntas que requieren combinar varios documentos) busca que el modelo agregue informacion dispersa en el contexto.
- Comprension de contexto largo: el modelo base soporta 32.768 tokens; el ajuste se entreno con 8.096, por lo que el rendimiento mas alla de esa longitud no esta validado.
- Capacidades heredadas del base Qwen2.5-14B-Instruct (codigo, matematicas, instrucciones generales), aunque el ajuste puede degradarlas al haberse especializado en la tarea de memoria.
- Tool calling / function calling: no documentado en la model card; el base lo soporta, pero no hay evaluacion tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas especificamente para este checkpoint.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre modelos de memoria: usar el checkpoint como referencia reproducible para estudiar como el full fine-tuning sobre QA multi-hop sintetico modifica el comportamiento de recuperacion de informacion en un LLM de 14 B.
- Responder preguntas sobre un corpus documental inyectado en el prompt: el modelo se ha entrenado para localizar y combinar evidencia en el contexto; util en prototipos de "lectura de documentos" con prompts de hasta 8.096 tokens.
- Evaluacion de estrategias de sintesis de datos: el metodo `knn_k2_and_entity` y el dataset de 1,7 M de ejemplos permiten comparar recetas de generacion de datos sinteticos frente a otros checkpoints del mismo autor.
- Base para ablaciones: al ser un checkpoint intermedio de una serie (epoca 3 de 3, con variantes de clustering), sirve para medir el efecto de la epoca y del metodo de agrupacion en tareas de QA multi-hop.
- Fine-tuning posterior especifico de dominio: al estar en safetensors bf16 y con licencia Apache 2.0, se puede reentrenar o adaptar con LoRA sobre datos propios de un dominio documental concreto.
- Despliegue en pipelines de experimentacion con `transformers` y TGI: el modelo es compatible con text-generation-inference y endpoints compatibles, lo que facilita su uso en entornos de investigacion ya montados sobre esa infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 30 GB solo para pesos, mas cache KV; con contexto de 8.096 tokens se recomienda al menos 40-48 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 16-18 GB de pesos, viable en GPUs de 24 GB con contexto moderado.
- VRAM estimada con cuantizacion de 4 bits (GGUF/AWQ/GPTQ): aproximadamente 9-10 GB de pesos, viable en RTX 4090 (24 GB) y en GPUs de 16 GB con contexto reducido.
- GPUs recomendadas para bf16: A100 80 GB, H100 80 GB, MI325X; para cuantizacion de 4 bits: RTX 4090, RTX 3090, L40S.
- Despliegue: `transformers` (soporte nativo documentado), text-generation-inference (TGI), vLLM y llama.cpp/Ollama tras conversion a GGUF; el autor solo valida la carga con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; el autor solo reporta el coste de entrenamiento (7,36 h en 8x MI325X).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep3 | 14,77 B | 32.768 (base); entrenado a 8.096 | Memoria / QA multi-hop sobre MuSiQue | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 | Asistente generalista, instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-14B | 14,77 B | 32.768 | Modelo base sin alineacion | Apache 2.0 | Hugging Face |

La comparacion directa con el base es la mas informativa: mismo tamano y contexto, pero el checkpoint ajustado sacrifica generalidad por la tarea de memoria. No hay datos de benchmarks que permitan cuantificar la diferencia de rendimiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones: no hay evidencia cuantitativa de que el ajuste mejore al base en la tarea de memoria ni de cuanto degrada capacidades generales.
- Modelo de investigacion con 0 descargas y 0 likes: no ha pasado por validacion de la comunidad; su robustez en produccion es desconocida.
- Riesgo de alucinacion: al ser un modelo entrenado para responder a partir de contexto, puede generar respuestas plausibles no sustentadas en los documentos si la evidencia es ambigua o inexistente.
- Sesgos: no documentados; hereda los del corpus MuSiQue (fuentes en ingles, tematica enciclopedica) y los del base Qwen2.5.
- Limitacion de contexto practico: aunque el base soporta 32.768 tokens, el ajuste se entreno con 8.096; el comportamiento mas alla de esa longitud no esta validado.
- Idiomas: la model card no especifica idiomas; el entrenamiento se hizo sobre datos en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las condiciones del modelo base Qwen2.5, tambien Apache 2.0.
- Nombre y artefacto muy especificos (variante de clustering y epoca): no debe tratarse como un sustituto del instructivo original en aplicaciones generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de referencia MuSiQue: no disponible enlace directo en la informacion proporcionada
- Paper de MuSiQue: no disponible enlace en la informacion proporcionada
- Repositorio de codigo del autor: no disponible
