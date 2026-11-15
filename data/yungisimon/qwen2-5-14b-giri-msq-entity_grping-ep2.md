# yungisimon/Qwen2.5-14B-giri-msq-entity_grping-ep2

## Resumen

Qwen2.5-14B-giri-msq-entity_grping-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct realizado por el usuario yungisimon. El objetivo del entrenamiento es convertir el modelo en un llamado "memory model": un modelo capaz de resolver preguntas sintéticas multi-salto sobre un conjunto de documentos, agrupando entidades relacionadas mediante el método de clustering `entity_grping` (agrupación de entidades con frecuencia documental máxima de 3). El corpus de entrenamiento son pares de pregunta-respuesta sintéticos derivados de MuSiQue (1.221.024 ejemplos), un conocido benchmark de razonamiento multi-documento.

El checkpoint publicado corresponde a la época 2 de un entrenamiento de 3 épocas. Al ser un ajuste fino completo, todos los parámetros (14.770.033.664, el 100 %) han sido actualizados, y los pesos se distribuyen en formato bf16 safetensors con un tamaño de repositorio de 29,6 GB. La licencia es Apache 2.0, heredada del modelo base.

Se trata de un modelo de nicho, orientado a experimentación en razonamiento sobre memoria y recuperación multi-documento, más que a un uso generalista. Su relevancia radica en explorar cómo el ajuste fino sobre tareas de memoria sintética afecta al comportamiento de un modelo instruct de 14B, y en servir como artefacto reproducible para investigación en clustering de entidades aplicado a QA multi-salto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only de la familia Qwen2 con 14.770.033.664 parámetros. El ajuste fino es completo (no LoRA ni adaptadores), ejecutado con FSDP sobre 8 GPUs AMD Instinct MI325X, con precisión bf16, checkpointing de gradientes y cálculo de pérdida únicamente sobre los tokens del asistente. El batch efectivo es de 256 (32 por dispositivo, sin acumulación, 8 GPUs), con learning rate constante de 2e-05 y warmup del 5 %, weight decay de 0,01 y norma máxima de gradiente de 1,0. La longitud máxima de secuencia en entrenamiento es de 8.096 tokens.

El dataset de entrenamiento son 1.221.024 ejemplos sintéticos de QA derivados de MuSiQue, generados con el método de clustering `entity_grping` (agrupación de entidades, df máximo 3) a partir del fichero `msq_subset1000_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`. El entrenamiento completo de 3 épocas supuso 5,16 horas de reloj (41,3 GPU-horas). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un ajuste supervisado estándar sobre el modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-14B-Instruct.
- Razonamiento multi-salto sobre conjuntos de documentos, orientado específicamente a la tarea de "memory model" para la que fue ajustado.
- Resolución de preguntas sintéticas de MuSiQue con agrupación de entidades relacionadas.
- Uso del chat template de Qwen (requerido para un comportamiento correcto).
- Capacidades del modelo base no verificadas tras el ajuste: no hay información disponible sobre tool calling, function calling, agentes, matemáticas o código en el contexto de este checkpoint.
- Capacidades multilingües: no disponible; no se documentan idiomas soportados.
- No se documenta modo thinking ni capacidades de visión o audio.

## Casos de uso

- Investigación en razonamiento multi-documento: el modelo sirve como artefacto reproducible para estudiar cómo el ajuste fino sobre QA sintético de MuSiQue afecta a la capacidad de agregar información de varios documentos.
- Evaluación de métodos de clustering de entidades: permite comparar el efecto de `entity_grping` (df máximo 3) frente a otras estrategias de agrupación en tareas de memoria, usando el checkpoint como referencia entrenada.
- Experimentos de memoria externa en pipelines RAG: el modelo puede probarse como componente de síntesis que recibe varios fragmentos recuperados y debe combinarlos para responder, aprovechando su contexto de 8.096 tokens.
- Reproducción de experimentos académicos: al publicarse el checkpoint intermedio (época 2 de 3) con hiperparámetros detallados, facilita la replicación y el análisis de curvas de entrenamiento.
- Generación de datos sintéticos de QA: el modelo ajustado puede emplearse para producir pares pregunta-respuesta sobre documentos agrupados por entidad, como generador auxiliar en la construcción de datasets.
- Estudio de degradación de capacidades generales: comparar este checkpoint con Qwen2.5-14B-Instruct original permite medir cuánto se pierde en conversación general tras un ajuste fino intensivo en una tarea estrecha.
- Base para nuevos ajustes: al ser un full fine-tune con licencia Apache 2.0, puede servir como punto de partida para posteriores especializaciones en tareas de memoria o recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 40-48 GB para secuencias largas.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 8-9 GB para pesos, más overhead; viable en GPUs consumer de 12-16 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o AMD Instinct MI300/MI325X para bf16 sin cuantizar. En consumer, RTX 4090 (24 GB) solo con cuantización de 8 o 4 bits y contextos limitados.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (formato nativo), text-generation-inference (el modelo está etiquetado como compatible con endpoints), y previsiblemente vLLM, llama.cpp u Ollama tras conversión a GGUF, aunque estas conversiones no se documentan en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-entity_grping-ep2 | 14,77B | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face | Full fine-tune sobre MuSiQue, checkpoint época 2 |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | 32.768 (modelo base) | Apache 2.0 | Hugging Face | Modelo base; contexto mayor y capacidades generales documentadas |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de menor tamaño para despliegue en consumer |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Alternativa generalista con contexto muy largo y licencia con restricciones |

## Limitaciones y advertencias

- El modelo está ajustado sobre una tarea muy específica (QA sintético de MuSiQue con clustering de entidades); su rendimiento en conversación general, código o matemáticas puede haberse degradado respecto al modelo base.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación para este checkpoint; se heredan los riesgos del modelo base sin cuantificar.
- El contexto efectivo de entrenamiento es de 8.096 tokens, inferior a los 32.768 del modelo base; no se garantiza un comportamiento correcto más allá de esa longitud.
- No se especifican idiomas soportados; el ajuste se realizó sobre datos en inglés (MuSiQue), por lo que el rendimiento en castellano es incierto.
- Es un checkpoint intermedio (época 2 de 3), no el modelo final del entrenamiento; puede no representar el mejor estado del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de producción; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- El tamaño del repositorio (29,6 GB) y los requisitos de VRAM en bf16 limitan su despliegue a hardware de gama alta o a versiones cuantizadas no publicadas oficialmente.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-entity_grping-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de referencia (MuSiQue): no disponible en la información proporcionada
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
