# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep3

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep3 es un modelo de lenguaje de 1.543.714.304 parámetros obtenido mediante fine-tuning completo del modelo base Qwen/Qwen2.5-1.5B-Instruct. El autor lo presenta como un "memory model", es decir, un modelo entrenado para memorizar y reproducir pares de pregunta-respuesta sintéticos derivados del conjunto de datos MuSiQue, un benchmark de QA multi-hop. No se trata de un modelo de propósito general, sino de un artefacto de investigación sobre memorización y recuperación de conocimiento en modelos pequeños.

El entrenamiento se realizó sobre un subconjunto de 1.000 ejemplos de MuSiQue, expandido mediante una estrategia de agrupación denominada `knn_k2_and_entity` (kNN con k=2, deduplicación de documentos y agrupación por entidades con frecuencia documental máxima de 3). El resultado es un fichero JSON de 1.725.751 ejemplos que se usó durante 3 épocas de fine-tuning completo con FSDP en 8 GPUs AMD Instinct MI325X, con un tiempo total de pared de 1,76 horas (14,1 GPU-horas).

El checkpoint publicado corresponde a la época 3 de 3. Es relevante en el contexto de investigación sobre memorización, sobreajuste deliberado y evaluación de la capacidad de un modelo de 1,5B para retener información factual inyectada, aunque su utilidad práctica fuera de ese ámbito experimental es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de hasta 8.096 tokens; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16; al ser safetensors estandar es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base Qwen2.5, multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención de causalidad completa, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El fine-tuning fue completo (no LoRA ni adaptadores), con el 100% de los parámetros entrenables (1.543.714.304), distribuido con FSDP sobre 8 GPUs AMD Instinct MI325X.

Los hiperparámetros documentados son: batch efectivo de 256 (32 por dispositivo, 1 paso de acumulación, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, 3 épocas, weight decay 0,01, max grad norm 1,0, precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente. La longitud máxima de secuencia durante el entrenamiento fue de 8.096 tokens. El conjunto de datos, derivado de MuSiQue con la estrategia `knn_k2_and_entity`, contiene 1.725.751 ejemplos sintéticos de QA. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación adicional más allá del fine-tuning supervisado sobre pares QA.

## Capacidades

- Generación de texto conversacional siguiendo la plantilla de chat de Qwen (`apply_chat_template`), heredada del modelo base.
- Memorización y reproducción de pares pregunta-respuesta del corpus MuSiQue sintético utilizado en el entrenamiento; es la capacidad principal para la que fue diseñado.
- Razonamiento multi-hop sobre las entidades y documentos presentes en el corpus de entrenamiento.
- Soporte de tool calling y function calling: no documentado en la información proporcionada; el modelo base lo soporta, pero no hay evidencia de que se preserve tras el fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre memorización en modelos pequeños: el modelo permite estudiar hasta qué punto un transformer de 1,5B retiene información factual inyectada mediante fine-tuning supervisado, comparando la tasa de reproducción exacta frente a la de generalización.
- Evaluación de sobreajuste controlado: al haber sido entrenado durante 3 épocas sobre un corpus sintético grande, sirve como caso de estudio de la frontera entre memorización útil y sobreajuste perjudicial.
- Análisis de estrategias de aumento de datos: la técnica `knn_k2_and_entity` (kNN con k=2, deduplicación de documentos y agrupación por entidades) puede evaluarse comparando este checkpoint con variantes del mismo autor que usen otras estrategias de agrupación.
- Reproducción de experimentos de fine-tuning completo con FSDP: la model card documenta hiperparámetros y hardware de forma suficientemente detallada como para replicar el entrenamiento en clústeres con GPUs AMD Instinct.
- Estudio de la degradación de capacidades generales tras fine-tuning especializado: útil para medir cuánto del rendimiento original de Qwen2.5-1.5B-Instruct se conserva tras un ajuste intensivo sobre un dominio estrecho.
- Generación de datos sintéticos de QA multi-hop: el modelo puede utilizarse como generador de pares pregunta-respuesta sobre documentos del dominio MuSiQue, siempre que se valide la calidad de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,9 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070, A10, L4). Para mayor throughput, A100, H100 o AMD Instinct MI300/MI325.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained`, vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se completó en 14,1 GPU-horas sobre 8 MI325X para 3 épocas sobre 1.725.751 ejemplos, lo que da una idea del coste de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep3 | 1,54B | no disponible (entrenado a 8.096) | apache-2.0 | Hugging Face | Fine-tuning especializado en memorización de MuSiQue |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | apache-2.0 | Hugging Face | Modelo base, propósito general, alineado con instrucciones |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | apache-2.0 | Hugging Face | Modelo base sin alineación |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mucho mayor |

## Limitaciones y advertencias

- El modelo está entrenado específicamente para memorizar un corpus sintético de QA; su comportamiento fuera de ese dominio es impredecible y probablemente degradado respecto al modelo base.
- Riesgo elevado de alucinación cuando se le consulta sobre temas ajenos al corpus de entrenamiento, ya que el fine-tuning intensivo sobre un dominio estrecho puede erosionar las capacidades generales.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; el modelo base Qwen2.5 incorpora sus propias salvaguardas, pero no hay garantía de que se conserven tras el fine-tuning.
- Idiomas soportados no documentados; el corpus de entrenamiento es presumiblemente en inglés (MuSiQue), lo que puede degradar el rendimiento en castellano u otros idiomas.
- La licencia apache-2.0 permite uso comercial, pero el modelo no está diseñado para producción: es un artefacto de investigación sin validación de robustez.
- El checkpoint corresponde a la época 3 de 3, el punto de máximo sobreajuste del entrenamiento; no se publican checkpoints intermedios en la información disponible.
- No hay información sobre latencia, throughput ni evaluación de calidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del corpus de origen): no disponible en la información proporcionada
- Paper de Qwen2.5: no disponible en la información proporcionada
- Repositorio o blog del autor: no disponible en la información proporcionada
