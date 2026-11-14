# yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep1

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep1` es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha reentrenado como **modelo de memoria** sobre pares sinteticos de pregunta-respuesta derivados del conjunto de datos MuSiQue, empleando una estrategia de agrupacion de entidades denominada `entity_grping` (con un limite de frecuencia documental de 3). El checkpoint corresponde a la epoca 1 de un total de 3.

El objetivo declarado es evaluar hasta que punto un modelo pequeno de 1.500 millones de parametros puede memorizar y recuperar informacion factual estructurada cuando se le somete a un ajuste fino supervisado con un volumen de datos muy elevado (mas de 1,2 millones de ejemplos). Se trata, por tanto, de un artefacto de investigacion orientado al estudio de la memorizacion en modelos de lenguaje, no de un modelo de proposito general para produccion.

La relevancia de esta publicacion es metodologica: documenta de forma transparente el proceso de entrenamiento (FSDP sobre 8 aceleradores AMD Instinct MI325X, precision bf16, mascara de perdida solo sobre tokens del asistente) y permite reproducir experimentos sobre capacidad de memorizacion y olvido catastrofico en modelos de la familia Qwen2.5. La licencia Apache 2.0 facilita su reutilizacion con fines academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (100 % entrenables en este ajuste) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens de longitud maxima de secuencia durante el entrenamiento; el contexto nativo del modelo base Qwen2.5-1.5B-Instruct es de 32.768 tokens, aunque no se ha validado en este checkpoint |
| Tipos de cuantizacion | pesos originales en bf16; no se han publicado variantes GGUF, AWQ ni GPTQ para este checkpoint |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen2.5 soporta multiples idiomas, pero el ajuste se ha realizado sobre datos MuSiQue, predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), cargable con `transformers` mediante `AutoModelForCausalLM.from_pretrained` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de rotacion posicional (RoPE). El ajuste no modifica la topologia: se actualizan los 1.543.714.304 parametros (full fine-tuning) mediante FSDP distribuido en 8 GPUs AMD Instinct MI325X, con precision bf16 y checkpointing de gradientes.

Los datos de entrenamiento proceden del fichero `msq_subset1000_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`, que contiene 1.221.024 ejemplos sinteticos de QA generados a partir de MuSiQue con la estrategia de agrupacion de entidades `entity_grping` (frecuencia documental maxima 3, combinacion de entidades entre documentos). Se aplica un tamano de lote efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPUs), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay 0.01, recorte de norma de gradiente en 1.0 y longitud maxima de secuencia de 8.096 tokens. La perdida se calcula unicamente sobre los tokens del asistente. El entrenamiento completo de 3 epocas consumio 1,24 horas de reloj (9,9 GPU-horas); este checkpoint corresponde a la epoca 1. No se documenta el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen (obligatoria para un comportamiento correcto).
- Recuperacion de hechos memorizados del corpus sintetico MuSiQue: el ajuste esta disenado especificamente para que el modelo reproduzca respuestas factuales vistas durante el entrenamiento.
- Razonamiento de multiples saltos sobre entidades agrupadas, derivado de la estructura de MuSiQue (preguntas que requieren combinar informacion de varios documentos).
- Capacidad residual de instruccion y dialogo heredada del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling: no documentado en este checkpoint; el modelo base lo soporta, pero el ajuste puede haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste sobre QA sintetico puede reducir la robustez en tareas agenticas.
- Capacidades multilingues: no documentadas; el corpus de ajuste es predominantemente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Investigacion sobre memorizacion en LLM**: utilizar el checkpoint para medir la tasa de recuperacion exacta de hechos sinteticos vistos en entrenamiento, comparando con la epoca 2 y 3 del mismo experimento para estudiar curvas de memorizacion y olvido.
- **Evaluacion de olvido catastrofico**: comparar el rendimiento en tareas generales (por ejemplo, generacion de codigo o matematicas) frente al modelo base Qwen2.5-1.5B-Instruct para cuantificar la degradacion provocada por el ajuste sobre 1,2 millones de ejemplos de QA.
- **Banco de pruebas de tecnicas de agrupacion de datos**: servir como referencia reproducible para evaluar el impacto de la estrategia `entity_grping` con `maxdf=3` frente a otras estrategias de construccion de corpus sinteticos.
- **Prototipado de sistemas de QA sobre dominios cerrados**: desplegar el modelo en un entorno controlado con preguntas cuya respuesta este contenida en el corpus de entrenamiento, como demostracion de recuperacion de conocimiento parametrico.
- **Estudio de eficiencia de entrenamiento en hardware AMD**: el registro de 9,9 GPU-horas en 8 MI325X permite usar el checkpoint como referencia para comparativas de coste y rendimiento entre aceleradores AMD e NVIDIA.
- **Base para experimentos de destilacion o cuantizacion**: al ser un modelo de 1.500 millones de parametros con licencia Apache 2.0, puede cuantizarse o destilarse para estudiar como afecta la compresion a la memoria factual retenida.
- **Analisis de sesgos en corpus sinteticos**: examinar si la generacion sintetica a partir de MuSiQue introduce sesgos de entidad o de dominio detectables en las respuestas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para inferencia en bf16**: aproximadamente 3,1 GB solo para pesos; con cache KV y overhead de runtime, se recomienda un minimo de 6-8 GB de VRAM para secuencias cortas y 12-16 GB para aprovechar contextos de 8.000 tokens.
- **VRAM en cuantizacion de 8 bits**: alrededor de 1,6-2 GB de pesos; en 4 bits, aproximadamente 0,9-1,2 GB, aunque no se han publicado ficheros GGUF ni AWQ/GPTQ oficiales para este checkpoint.
- **GPU recomendadas**: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) puede ejecutar el modelo en bf16 o fp16 para contextos moderados. Para despliegue en produccion con concurrencia, se recomienda A100 40 GB, H100 80 GB o AMD MI300X/MI325X.
- **Cabe en GPU consumer**: si, en la mayoria de GPU con 8 GB o mas, especialmente si se cuantiza.
- **Opciones de despliegue**: `transformers` (soporte nativo, formato safetensors), vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad), llama.cpp u Ollama solo si se genera previamente una version GGUF (no publicada).
- **Latencia y throughput estimados**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep1 | 1,54 B | 8.096 (entrenamiento) | Apache 2.0 | Ajuste fino como modelo de memoria sobre MuSiQue sintetico | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Modelo instructivo generalista | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 | Modelo base sin ajuste instructivo | Hugging Face |
| Meta-Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Modelo instructivo generalista | Hugging Face, requiere aceptacion de licencia |

La comparacion directa con alternativas generalistas no es del todo justa: este checkpoint esta especializado en memorizacion de un corpus concreto y no se ha evaluado en benchmarks estandar, por lo que su rendimiento en tareas generales es, como minimo, incierto y probablemente inferior al del modelo base.

## Limitaciones y advertencias

- **Sobreajuste al corpus sintetico**: con 1,2 millones de ejemplos y 3 epocas planificadas, el modelo esta fuertemente especializado en el formato y contenido de MuSiQue; es probable que su rendimiento en tareas generales se haya degradado respecto al modelo base.
- **Riesgo elevado de alucinacion fuera del dominio**: fuera del corpus de entrenamiento, el modelo puede generar respuestas plausibles pero incorrectas, ya que la perdida se ha calculado solo sobre tokens del asistente en pares QA sinteticos.
- **Contexto efectivo limitado**: aunque el modelo base soporta 32.768 tokens, el ajuste se realizo con secuencias de 8.096 tokens; no se ha validado el comportamiento mas alla de esa longitud.
- **Idiomas no documentados**: el corpus MuSiQue es predominantemente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- **Tool calling y capacidades agenticas posiblemente degradadas**: el ajuste sobre QA puede haber erosionado las capacidades de function calling del modelo base.
- **Sesgos del corpus de origen**: MuSiQue se construye a partir de Wikipedia en ingles, por lo que el modelo puede heredar sesgos de cobertura geografica y cultural de esa fuente.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; al ser un artefacto de investigacion con 0 descargas, no hay validacion comunitaria.
- **Checkpoint intermedio**: corresponde a la epoca 1 de 3; no es la version final del experimento y puede presentar inestabilidades de entrenamiento no documentadas.
- **Plantilla de chat obligatoria**: debe usarse la plantilla de Qwen; en caso contrario, el comportamiento puede ser erratico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Conjunto de datos MuSiQue (referencia del corpus de origen): no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
