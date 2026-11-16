# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep1

## Resumen

Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" sobre pares sintéticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue, empleando un método de agrupación denominado `knn_k2_and_entity` (kNN con k=2, deduplicación de documentos y agrupación por entidad con frecuencia documental máxima de 3). El checkpoint publicado corresponde a la época 1 de un total de 3 épocas de entrenamiento.

El modelo conserva la arquitectura original de Qwen2.5-14B-Instruct: un transformer decoder-only denso con 14.770.033.664 parámetros totales, pesos en bf16 safetensors y compatibilidad directa con `transformers` mediante `AutoModelForCausalLM.from_pretrained`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

La relevancia de esta publicación es acotada: se trata de un checkpoint intermedio de un experimento de investigación sobre memoria externa y recuperación de contexto en modelos de lenguaje, no de un modelo de propósito general optimizado para producción. No se han publicado resultados de benchmarks ni una evaluación sistemática de capacidades, por lo que su interés principal es para investigadores que estudien técnicas de memoria, fine-tuning completo sobre datasets sintéticos o el comportamiento de Qwen2.5-14B bajo este tipo de ajustes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó max sequence length de 8.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención causal estándar. El ajuste fino es completo (FSDP), con el 100 % de los parámetros entrenables (14.770.033.664). Se entrenó con precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente. La configuración de entrenamiento incluye batch efectivo de 256 (32 por dispositivo, 8 GPUs), learning rate constante de 2e-05 con warmup del 5 %, weight decay de 0.01, max grad norm de 1.0 y una longitud máxima de secuencia de 8.096 tokens. El entrenamiento se ejecutó sobre 8 AMD Instinct MI325X, con un tiempo total de 7,36 horas (58,9 GPU-horas) para las 3 épocas completas.

El dataset de entrenamiento es un conjunto sintético de 1.725.751 ejemplos generados a partir de MuSiQue (msq_subset1000), con agrupación `knn_k2_and_entity`: kNN con k=2, deduplicación de documentos y agrupación por entidad con frecuencia documental máxima de 3, incluyendo combinación de entidades cruzadas entre documentos. El objetivo es que el modelo funcione como un "memory model", es decir, que aprenda a recuperar y combinar información dispersa en múltiples documentos para responder preguntas multi-hop. No se documentan fases de RLHF o DPO adicionales más allá del ajuste supervisado sobre estos pares sintéticos.

## Capacidades

- Generación de texto conversacional: hereda la capacidad base de Qwen2.5-14B-Instruct y usa la plantilla de chat de Qwen.
- Razonamiento multi-hop y recuperación de memoria: el ajuste está orientado a combinar información de múltiples documentos y entidades para responder preguntas complejas.
- Comprensión de contexto largo: entrenado con secuencias de hasta 8.096 tokens, adecuado para tareas que requieren integrar varios documentos en una sola ventana.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card; se hereda potencialmente del modelo base, pero no está validado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas en la información disponible.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas ni evaluación multilingüe.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en memoria y recuperación multi-hop: el modelo sirve como banco de pruebas para estudiar cómo el fine-tuning sobre pares sintéticos de MuSiQue afecta a la capacidad de combinar información de varios documentos y entidades.
- Preguntas y respuestas sobre corpus documentales: se puede usar para responder consultas que requieren cruzar información de distintos documentos, aprovechando el entrenamiento con agrupación por entidad y deduplicación documental.
- Experimentos de ajuste completo sobre datasets sintéticos: útil para comparar el efecto de distintas estrategias de agrupación (kNN, deduplicación, agrupación por entidad) en el rendimiento de un modelo de 14B.
- Evaluación de checkpoints intermedios: al ser la época 1 de 3, permite analizar la evolución del aprendizaje y la estabilidad del entrenamiento a lo largo de las épocas.
- Generación de respuestas conversacionales con contexto documental: integrable en pipelines de `transformers` para prototipos de asistentes que necesiten citar o sintetizar información de múltiples fuentes.
- Base para experimentos de destilación o comparación con Qwen2.5-14B-Instruct: permite medir la degradación o mejora de capacidades generales tras un ajuste especializado en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para los pesos (14.770.033.664 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 32-40 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, AMD Instinct MI300/MI325X. Para contextos largos (8K tokens) conviene disponer de 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriría cuantización a 8 bits o 4 bits (no publicada oficialmente) para intentar encajar en 24 GB, con pérdida de calidad no evaluada.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan cuantizaciones GGUF (no disponibles en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep1 | 14,77B | 8.096 tokens de entrenamiento (contexto nativo no disponible) | Apache 2.0 | Hugging Face, checkpoint época 1/3 | Ajuste especializado en memoria multi-hop; sin benchmarks |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face, ampliamente desplegado | Modelo base; capacidades generales y tool calling documentados |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face | Alternativa de menor tamaño para hardware más limitado |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor; licencia con restricciones comerciales |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la época 1 de 3; no es el modelo final del entrenamiento y su rendimiento puede no representar el resultado completo del experimento.
- Sin evaluación publicada: no hay benchmarks, evaluaciones de calidad ni comparaciones sistemáticas con el modelo base, por lo que se desconoce si el ajuste mejora o degrada capacidades generales.
- Riesgo de alucinación: al entrenarse sobre pares sintéticos de QA, puede generar respuestas plausibles pero no fundamentadas, especialmente fuera del dominio de MuSiQue.
- Sesgos: no documentados; hereda los sesgos del modelo base y de los datos sintéticos generados, sin auditoría conocida.
- Limitaciones de idioma: no se especifican idiomas soportados ni evaluación multilingüe; el entrenamiento se realizó presumiblemente en inglés (MuSiQue), lo que puede degradar el rendimiento en castellano.
- Contexto: la longitud máxima de entrenamiento fue de 8.096 tokens; no se confirma la ventana de contexto efectiva tras el ajuste.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de evaluación y el estado intermedio del checkpoint desaconsejan su uso en producción sin validación previa.
- Tool calling y agentes: no validados tras el ajuste; podrían haberse degradado respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MuSiQue (referencia): no disponible en la información proporcionada
- Paper o blog del método `knn_k2_and_entity`: no disponible en la información proporcionada
- Repositorio de código del entrenamiento: no disponible en la información proporcionada
