# yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep1

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep1 es un fine-tuning completo del modelo Qwen2.5-1.5B-Instruct de Alibaba, adaptado como "modelo de memoria" (memory model) sobre pares sinteticos de pregunta-respuesta derivados del corpus MuSiQue y agrupados mediante HDBSCAN con un tamano minimo de cluster de 2. Lo publica el usuario yungisimon, un desarrollador individual sin trayectoria verificable en el ecosistema, y se distribuye bajo licencia Apache 2.0.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parametros densos (no es MoE) y un contexto de entrenamiento de 8.096 tokens. El checkpoint publicado corresponde a la epoca 1 de 3 de un entrenamiento de ajuste completo con FSDP sobre 8 aceleradores AMD Instinct MI325X, con un dataset de 1.085.701 ejemplos y un tiempo total de pared de 1,10 horas para las tres epocas.

Su relevancia es acotada: se trata de un experimento de investigacion sobre memoria externa y recuperacion de contexto en modelos pequenos, no de un modelo de proposito general listo para produccion. No hay resultados de benchmarks publicados, no consta evaluacion de calidad y el modelo acumula cero descargas y cero likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.096 tokens (longitud maxima de secuencia en entrenamiento); contexto nativo de Qwen2.5-1.5B-Instruct no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); compatible con `AutoModelForCausalLM.from_pretrained` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, y se somete a un ajuste completo (full fine-tuning) con FSDP, sin LoRA ni adaptadores. Los 1.543.714.304 parametros son entrenables al 100 %. El entrenamiento usa precision bf16, checkpointing de gradientes y calculo de perdida unicamente sobre los tokens del asistente. La tasa de aprendizaje es 2e-05 con decaimiento constante y warmup del 5 %, weight decay de 0,01, norma maxima de gradiente de 1,0 y un batch efectivo de 256 (32 por dispositivo, 1 acumulacion, 8 GPU). La longitud maxima de secuencia es de 8.096 tokens.

El dataset es un subconjunto sintetico de MuSiQue con 1.085.701 ejemplos, generado mediante combinacion de entidades entre documentos y agrupado con HDBSCAN (min cluster size 2). El objetivo declarado es convertir el modelo en un "memory model": el modelo aprende a operar sobre pares de pregunta-respuesta construidos a partir de clusters de contexto, presumiblemente para tareas de recuperacion y consolidacion de memoria a partir de documentos. El checkpoint publicado es la epoca 1 de 3; el entrenamiento completo de las tres epocas consumio 1,10 horas de pared (8,8 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional; se trata de un fine-tuning supervisado convencional.

## Capacidades

- Generacion de texto conversacional heredada de Qwen2.5-1.5B-Instruct, con plantilla de chat Qwen.
- Operacion como modelo de memoria: manejo de pares pregunta-respuesta derivados de clusters de documentos MuSiQue, orientado a recuperacion y sintesis de informacion a partir de contexto multi-documento.
- Razonamiento multi-paso sobre contexto largo, hasta 8.096 tokens, segun la configuracion de entrenamiento.
- Capacidades multilingues: no disponibles de forma verificable; el modelo base Qwen2.5 soporta varios idiomas, pero no consta evaluacion ni declaracion para este fine-tuning.
- Tool calling y function calling: no documentado en la model card; no se puede garantizar su conservacion tras el ajuste.
- Soporte de agentes: no documentado.
- Capacidades de vision o audio: no disponibles (modelo puramente de texto).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion sobre memoria externa en LLM: el modelo sirve como punto de partida para estudiar como un transformer pequeno consolida informacion de multiples documentos en un espacio de memoria comprimido, usando los clusters HDBSCAN como unidad de recuperacion.
- Recuperacion aumentada multi-documento (RAG) en prototipos: se puede integrar como componente de sintesis sobre pasajes recuperados de MuSiQue u otros corpus, aprovechando el entrenamiento sobre pares pregunta-respuesta multi-salto.
- Experimentos de destilacion de memoria: util para comparar el comportamiento de un modelo de 1,5B ajustado como memoria frente al modelo base sin ajustar, midiendo la degradacion o mejora en tareas de QA multi-salto.
- Generacion de resumenes de clusters documentales: dado un conjunto de documentos agrupados, el modelo puede generar respuestas que integren entidades y hechos presentes en varios de ellos, gracias al entrenamiento con combinacion de entidades entre documentos.
- Evaluacion de tecnicas de clustering en la construccion de datasets: el checkpoint permite reproducir y analizar el efecto de HDBSCAN (min cluster size 2) en la calidad de los pares sinteticos generados.
- Despliegue en entornos con recursos limitados: con 1,5B parametros y pesos bf16 de aproximadamente 3,1 GB, cabe en GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superiores) para pruebas de inferencia locales con transformers.
- Base para fine-tuning posterior: al ser un ajuste completo sobre Qwen2.5-1.5B-Instruct bajo Apache 2.0, puede reutilizarse como inicializacion para tareas de memoria o QA especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: AMD Instinct MI325X (usadas en entrenamiento), NVIDIA A100 o H100 para lotes grandes; RTX 4090, RTX 3090, RTX 4080 o RTX 3060 de 12 GB para inferencia en consumer.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM para bf16 en secuencias cortas; con cuantizacion, en GPU de 4-6 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM tras conversion a GGUF o formatos compatibles, aunque no esta documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep1 | 1,54B densos | 8.096 tokens (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental como memory model, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B densos | 32.768 tokens (nativo Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; contexto mayor y evaluacion publica |
| Qwen/Qwen2.5-1.5B | 1,54B densos | 32.768 tokens | Apache 2.0 | Hugging Face | Version base sin instrucciones |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B densos | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con contexto mucho mayor y licencia mas restrictiva |

## Limitaciones y advertencias

- Modelo experimental sin evaluacion publicada: no hay benchmarks, ni evaluacion de calidad, ni validacion por terceros; no debe usarse en produccion sin una evaluacion propia exhaustiva.
- Riesgo elevado de alucinacion: al ser un fine-tuning sobre pares sinteticos de QA, puede generar respuestas plausibles pero no fundamentadas en el contexto real.
- Contexto limitado a 8.096 tokens en entrenamiento, inferior al contexto nativo de Qwen2.5 (32.768 tokens); el comportamiento mas alla de esa longitud no esta garantizado.
- Idiomas no declarados: no consta que el ajuste preserve el multilingusmo del modelo base; el entrenamiento se realizo sobre un dataset presumiblemente en ingles (MuSiQue).
- Perdida de capacidades del modelo base: el ajuste completo sobre un dataset especifico puede degradar tool calling, instrucciones generales y otras habilidades de Qwen2.5-1.5B-Instruct.
- Checkpoint intermedio: es la epoca 1 de 3, no el modelo final; puede estar infraentrenado respecto a la version completa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad del uso recae en el integrador.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion practica.
- Dataset sintetico: los pares generados mediante combinacion de entidades y clustering HDBSCAN pueden contener artefactos, duplicados o errores factuales que se reflejen en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del corpus de origen): no disponible en la informacion proporcionada
- Paper de HDBSCAN: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
