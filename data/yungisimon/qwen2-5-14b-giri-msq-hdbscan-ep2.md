# yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep2

## Resumen

Qwen2.5-14B-giri-msq-hdbscan-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado con el objetivo declarado de actuar como "memory model", es decir, un modelo orientado a tareas de memoria y recuperación de información sobre pares sintéticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue y agrupados mediante el algoritmo de clustering HDBSCAN (con tamaño mínimo de cluster 2). El checkpoint corresponde a la época 2 de un total de 3 épocas de entrenamiento.

El modelo conserva la arquitectura original de Qwen2.5-14B-Instruct, un transformer decoder-only de aproximadamente 14.770 millones de parámetros, con licencia Apache 2.0 y pesos en formato bf16 safetensors. No se han publicado datos sobre la longitud de contexto efectiva tras el ajuste, los idiomas soportados ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de un experimento de investigación de nicho más que de un modelo listo para producción.

La relevancia de esta ficha radica en documentar con rigor un caso de fine-tuning completo sobre un modelo base bien conocido, señalando explícitamente qué información está disponible y cuál no, para que desarrolladores e investigadores puedan evaluar si el checkpoint les resulta útil sin asumir capacidades no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó secuencias de 8096 tokens; la ventana nativa del modelo base no se documenta en la información proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14.770 millones de parámetros con atención causal estándar. El ajuste se realizó mediante full fine-tuning con FSDP (Fully Sharded Data Parallel), actualizando el 100,00 % de los parámetros (14.770.033.664 entrenables). Se usó una tasa de aprendizaje de 2e-05 con decaimiento constante y warmup del 5 %, weight decay de 0,01, norma máxima de gradiente de 1,0 y precisión bf16 con checkpointing de gradientes. El cálculo de la pérdida se restringió únicamente a los tokens del asistente.

El conjunto de entrenamiento declarado es `msq_subset1000_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 1.085.701 ejemplos de pares sintéticos de pregunta-respuesta construidos sobre MuSiQue y agrupados con HDBSCAN (tamaño mínimo de cluster 2). El entrenamiento se ejecutó con un batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPUs), longitud máxima de secuencia de 8096 tokens y un total de 3 épocas; este checkpoint corresponde a la época 2. El cómputo total de las 3 épocas fue de 4,66 horas de reloj (37,3 GPU-horas) sobre 8 aceleradores AMD Instinct MI325X. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-14B-Instruct y ajustada con la plantilla de chat de Qwen.
- Orientación específica a tareas de memoria: el ajuste se diseñó sobre pares sintéticos de pregunta-respuesta derivados de MuSiQue, lo que sugiere un enfoque hacia la recuperación y el razonamiento sobre información recordada o proporcionada en el contexto.
- Razonamiento multi-documento: el dataset de entrenamiento incluye combinaciones de entidades "cross-doc", lo que apunta a escenarios de agregación de información entre documentos.
- Soporte de tool calling y function calling: no disponible de forma verificada en la información proporcionada; el modelo base lo soporta, pero no se documenta si el ajuste lo preserva.
- Capacidades de agente y razonamiento multi-paso: no verificadas en la información proporcionada.
- Capacidades multilingües: no disponibles; no se documentan los idiomas cubiertos tras el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre modelos de memoria: el checkpoint permite estudiar cómo un full fine-tuning sobre pares sintéticos de MuSiQue afecta a la capacidad del modelo de retener y recuperar información, comparándolo con el modelo base en tareas controladas.
- Evaluación de clustering aplicado a datos de entrenamiento: sirve para analizar el impacto de agrupar ejemplos con HDBSCAN (tamaño mínimo de cluster 2) en la calidad de las respuestas del modelo ajustado.
- Preguntas y respuestas sobre múltiples documentos: el dataset de entrenamiento incluye combinaciones de entidades entre documentos, por lo que el modelo puede probarse en tareas de agregación de información dispersa en varias fuentes.
- Reproducción de experimentos de fine-tuning completo: al documentarse hiperparámetros (lr 2e-05, batch 256, 3 épocas, FSDP, 8×MI325X), el checkpoint es útil como referencia para replicar pipelines de entrenamiento a esa escala.
- Prototipado de asistentes conversacionales con contexto largo: con secuencias de entrenamiento de 8096 tokens y la plantilla de chat de Qwen, puede emplearse en diálogos multi-turno donde se requiera mantener información previa, siempre con validación empírica.
- Estudio de degradación por sobreajuste: al ser la época 2 de 3, permite comparar el comportamiento intermedio frente a la época final y detectar posibles pérdidas de capacidades generales del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para los pesos (14.770 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40 GB de VRAM para secuencias cortas y bastante más para contextos largos.
- VRAM estimada en cuantización de 8 bits: alrededor de 15 GB para los pesos; en 4 bits, alrededor de 8 GB. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, AMD Instinct MI300X/MI325X (la familia usada en el entrenamiento). Para consumer, una RTX 4090 (24 GB) solo podría ejecutar el modelo en cuantizaciones de 4 bits con contexto reducido.
- Cabe en GPU consumer: únicamente con cuantización agresiva (4 bits) y ventanas de contexto limitadas; no se documentan variantes GGUF publicadas.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep2 | 14,77 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Full fine-tuning sobre MuSiQue con HDBSCAN, época 2 de 3 |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base; soporte oficial y benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face | Alternativa de menor tamaño con menor requisito de VRAM |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128.000 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con contexto mayor |

Los datos del modelo base y de las alternativas provienen de la documentación pública de dichos modelos; los de este checkpoint se limitan a lo indicado en su model card.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación para este checkpoint; se desconoce si el ajuste sobre datos sintéticos de MuSiQue introduce sesgos específicos.
- El modelo se ha entrenado únicamente sobre pares sintéticos de pregunta-respuesta de MuSiQue; es probable que haya degradación de capacidades generales (código, matemáticas, conversación abierta) respecto al modelo base, aunque no se documenta.
- La longitud de contexto efectiva tras el ajuste no está documentada; el entrenamiento usó secuencias de 8096 tokens, inferior a la ventana nativa del modelo base.
- No se especifican los idiomas soportados; el dataset de entrenamiento (MuSiQue) es en inglés, por lo que el rendimiento en castellano es incierto.
- Al ser la época 2 de 3, el checkpoint puede presentar un estado intermedio de entrenamiento no óptimo; no se documenta si la época 3 mejora los resultados.
- El repositorio no registra descargas ni validación por parte de la comunidad; no hay evidencia externa de su calidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset de entrenamiento (MuSiQue) antes de un uso comercial.
- El modelo no incluye variantes cuantizadas publicadas, lo que limita su despliegue en hardware de gama consumer.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MuSiQue (referencia del conjunto de datos usado): no disponible como enlace en la información proporcionada
- Paper de HDBSCAN: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
