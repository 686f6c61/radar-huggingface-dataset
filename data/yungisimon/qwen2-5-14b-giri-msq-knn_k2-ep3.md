# yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep3

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-14B-Instruct de Alibaba, reentrenado por el usuario yungisimon como "modelo de memoria" sobre pares de pregunta-respuesta sinteticos derivados del conjunto de datos MuSiQue (multi-hop QA). El objetivo declarado es que el modelo retenga y recupere informacion factual de un contexto documental, emulando el comportamiento de un modulo de memoria asociativa en pipelines de razonamiento multi-salto. El checkpoint publicado corresponde a la epoca 3 de 3 de un entrenamiento supervisado sobre 634.327 ejemplos.

Arquitectura y tamano heredan integramente de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 14.770.033.664 parametros (aproximadamente 14,8 mil millones), pesos en bf16 safetensors y licencia Apache 2.0. No hay cambios arquitectonicos, de tokenizador ni de plantilla de chat; el modelo se carga con `transformers` estandar y debe usarse con la plantilla de chat de Qwen.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin evaluacion publicada y sin especificacion de idiomas. Resulta interesante como ejemplo de metodologia (fine-tuning completo con FSDP sobre 8 aceleradores AMD Instinct MI325X) y como pieza potencial en sistemas de memoria externa, pero no como sustituto generalista de un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), sin modificaciones respecto al base |
| Parametros totales | 14.770.033.664 (100 % entrenables durante el ajuste) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias de 8.096 tokens como maximo |
| Tipos de cuantizacion | pesos publicados en bf16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Metodo de ajuste | full fine-tuning con FSDP |
| Dataset de entrenamiento | MuSiQue sintetico, `msq_subset1000_numsamplingepochs1_knn2_doc_dedup_crossdoc_entity_combination_v3.json`, 634.327 ejemplos |
| Epoca publicada | 3 de 3 |
| Tamano del repositorio | 29,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-14B-Instruct sin alteraciones: transformer decoder-only denso con atencion de causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El ajuste no introduce cabezas adicionales, adaptadores ni modulos de memoria; el comportamiento de "memoria" se induce exclusivamente por datos, reentrenando el 100 % de los parametros.

El entrenamiento se realizo con full fine-tuning distribuido mediante FSDP sobre 8 GPU AMD Instinct MI325X, con tamano de lote efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 dispositivos), tasa de aprendizaje constante de 2e-05 con calentamiento del 5 %, weight decay de 0,01, norma maxima de gradiente de 1,0 y 3 epocas. Se uso bf16 con checkpointing de gradientes, longitud maxima de secuencia de 8.096 tokens y calculo de perdida unicamente sobre los tokens del asistente. El coste total fue de 2,81 horas de reloj (22,4 GPU-hora). El dataset, de 634.327 ejemplos, se genero mediante muestreo y deduplicacion documental con un esquema de clustering kNN con k=2 ("knn_k2") y combinacion de entidades entre documentos. No se documenta RLHF, DPO ni ninguna fase de alineacion posterior al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct y reorientada a tareas de recuperacion de hechos.
- Recuperacion de informacion factual a partir de contexto documental, funcion para la que fue especificamente ajustado (memoria asociativa sobre pares QA de MuSiQue).
- Razonamiento multi-salto sobre varios documentos, segun el esquema de construccion del dataset (deduplicacion documental y combinacion de entidades entre documentos).
- Capacidades generales del modelo base presumiblemente conservadas: codigo, matematicas, instrucciones y tool calling, aunque no hay evaluacion publicada que lo confirme tras el ajuste.
- Soporte de la plantilla de chat de Qwen; carga directa con `AutoModelForCausalLM.from_pretrained`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Capacidades multimodales, de audio o modo "thinking" explicito: no disponibles.

## Casos de uso

- Memoria externa en pipelines RAG multi-salto: el modelo puede actuar como modulo que sintetiza y retiene hechos de varios fragmentos recuperados, aprovechando que fue entrenado con pares QA construidos mediante combinacion de entidades entre documentos.
- Responder preguntas que requieren agregar informacion de dos o mas documentos: el esquema kNN k=2 con deduplicacion documental del dataset de entrenamiento esta disenado precisamente para este patron de recuperacion.
- Prototipado de agentes con memoria episodica: integrar el checkpoint como capa de consolidacion de memoria entre turnos, ya que el ajuste busca estabilizar la retencion de hechos a lo largo de la conversacion.
- Investigacion sobre ajuste completo frente a LoRA/PEFT en tareas de memoria: el repositorio documenta hiperparametros completos (lr, batch, epocas, hardware), lo que lo hace util como referencia reproducible.
- Evaluacion comparativa de metodos de clustering de datos sinteticos (knn_k2 frente a alternativas) en la generacion de datasets de QA multi-salto.
- Base para un segundo ajuste de dominio: al estar bajo Apache 2.0 y en safetensors bf16 estandar, puede reciclarse como punto de partida para especializaciones verticales con memoria documental.
- Despliegue interno de bajo volumen: con 14,8 mil millones de parametros en bf16 cabe en una unica GPU de 80 GB (A100/H100) o en dos de 48 GB, lo que permite servir el modelo en entornos controlados sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 29,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 40 GB y 48-80 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB para pesos; en 4 bits, en torno a 8-9 GB, aunque el autor no publica variantes cuantizadas y habria que generarlas.
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD Instinct MI300X/MI325X (el entrenamiento se hizo en MI325X). Para bf16 en una sola tarjeta, A100/H100 de 80 GB es la opcion comoda.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090) ni de 16 GB; requeriria cuantizacion a 4-8 bits, con la perdida de calidad no evaluada que ello implica. En una RTX 4090 de 24 GB solo seria viable con cuantizacion agresiva y contextos cortos.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y en teoria vLLM y llama.cpp/Ollama previa conversion a GGUF, aunque no se proporcionan artefactos para estas ultimas.
- Latencia y throughput: no disponibles; no se publican mediciones de inferencia. Como referencia orientativa del base, un modelo denso de 14,8 B en bf16 sobre A100 80 GB se situa tipicamente en decenas de tokens por segundo por peticion, pero este dato no procede de la informacion proporcionada y debe medirse en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep3 | 14,77 B (denso) | no disponible (entreno a 8.096 tokens) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de memoria sobre MuSiQue; sin benchmarks |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B (denso) | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base; soporte maduro en vLLM, TGI, llama.cpp y Ollama |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B (denso) | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face | Alternativa de menor coste si la tarea no exige 14 B |
| Meta Llama 3.1 8B Instruct | 8,03 B (denso) | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, pero licencia con restricciones de uso |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni medicion de la degradacion en capacidades generales tras el ajuste completo.
- Riesgo de olvido catastrofico: al reentrenar el 100 % de los parametros sobre un unico dataset sintetico de QA multi-salto, es esperable cierta perdida de rendimiento en codigo, matematicas o instrucciones generales; no se ha cuantificado.
- Sesgos desconocidos: el dataset sintetico deriva de MuSiQue, con posibles sesgos de dominio, idioma y estilo de las preguntas generadas; no se documenta ninguna auditoria.
- Riesgo de alucinacion: un modelo entrenado para "recordar" hechos puede generar contenido plausible pero incorrecto cuando el contexto no contiene la respuesta; no hay evaluacion de fidelidad.
- Idiomas no declarados: la model card no especifica lista de idiomas; el comportamiento multilingue tras el ajuste es incierto aunque el base sea multilingue.
- Contexto de inferencia no especificado: solo se conoce la longitud maxima de entrenamiento (8.096 tokens); no se garantiza el comportamiento mas alla de esa ventana.
- Sin artefactos de cuantizacion ni conversion a GGUF: el despliegue en hardware de consumo exige trabajo adicional y no validado.
- Madurez nula: cero descargas y cero likes, creado y actualizado el mismo dia (2026-11-15), sin issues ni discusion; no apto para produccion sin validacion propia.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar igualmente los terminos del modelo base y la procedencia de los datos sinteticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de referencia MuSiQue (paper): https://arxiv.org/abs/2108.00573
- Repositorio MuSiQue: https://github.com/StonyBrookNLP/musique
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
