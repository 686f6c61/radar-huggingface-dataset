# yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep1

## Resumen

Qwen2.5-14B-giri-msq-knn_k2-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model", es decir, un modelo especializado en tareas de memoria y recuperación de información sobre pares sintéticos de pregunta-respuesta generados a partir de MuSiQue, un corpus de preguntas multi-salto. El checkpoint publicado corresponde a la época 1 de un total de 3 épocas de entrenamiento.

La arquitectura subyacente es la del Qwen2.5-14B-Instruct original: un transformer denso de 14.770.033.664 parámetros (aproximadamente 14,77 mil millones), con licencia Apache 2.0 y pesos en formato bf16 safetensors. El ajuste se ha realizado sobre 634.327 ejemplos sintéticos con una longitud máxima de secuencia de 8096 tokens, utilizando la técnica de clustering `knn_k2` (kNN con k=2 y deduplicación de documentos) para la selección o combinación de ejemplos.

El interés de este modelo es acotado pero concreto: se trata de un experimento de investigación sobre cómo el ajuste fino completo puede especializar un modelo de propósito general en tareas de memoria y razonamiento multi-salto, con un coste de entrenamiento relativamente bajo (2,81 horas en 8 GPUs AMD Instinct MI325X). No obstante, al ser un checkpoint intermedio (época 1 de 3) y contar con cero descargas y cero likes, debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8096 tokens (longitud máxima de secuencia en entrenamiento); contexto nativo de Qwen2.5-14B-Instruct no especificado en la información disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer denso decoder-only de la familia Qwen2, y se ha sometido a un ajuste fino completo (full fine-tuning) con FSDP, sin técnicas de parametrización eficiente como LoRA. El 100% de los parámetros (14.770.033.664) fueron entrenables. El entrenamiento se realizó en precisión bf16 con gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente, lo que es coherente con un objetivo de generación de respuestas en formato conversacional.

Los datos de entrenamiento consisten en 634.327 ejemplos sintéticos de pregunta-respuesta multi-salto construidos a partir de MuSiQue, con una estrategia de clustering denominada `knn_k2`: kNN con k=2 y deduplicación de documentos, según el nombre del fichero de datos (`msq_subset1000_numsamplingepochs1_knn2_doc_dedup_crossdoc_entity_combination_v3.json`). Se entrenaron 3 épocas en total, con un batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, weight decay de 0,01 y max grad norm de 1,0. El entrenamiento completo de las 3 épocas consumió 2,81 horas de reloj (22,4 GPU-horas) en 8 AMD Instinct MI325X. El checkpoint publicado corresponde solo a la época 1.

No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, MoE, SSM, etc.) más allá de las propias del Qwen2.5-14B-Instruct base. Tampoco se especifica si hubo RLHF o DPO en esta fase de ajuste; el modelo base ya incorpora el alineamiento de Qwen2.5-Instruct, pero el ajuste fino posterior no documenta etapas de preferencia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-14B-Instruct y reforzada con el formato de chat de Qwen.
- Memoria y recuperación de información: el modelo se ha especializado como "memory model" sobre pares QA multi-salto de MuSiQue, lo que sugiere capacidad para retener y recuperar información dispersa a lo largo de contextos largos.
- Razonamiento multi-salto: el corpus de entrenamiento (MuSiQue) está diseñado para preguntas que requieren combinar información de varios documentos.
- Capacidades del modelo base no verificadas en este checkpoint: el README no documenta explícitamente tool calling, function calling, agentes, matemáticas, código ni visión. Al derivar de Qwen2.5-14B-Instruct, es probable que conserve parte de estas capacidades, pero no hay confirmación en la información disponible.
- Capacidades multilingües: no disponibles en la documentación del modelo.

## Casos de uso

- Investigación sobre memoria en modelos de lenguaje: el modelo sirve como checkpoint intermedio para estudiar cómo evoluciona la capacidad de memoria y recuperación multi-salto entre épocas de entrenamiento, comparando la época 1 con las épocas 2 y 3 (no publicadas en la información disponible).
- Experimentos de razonamiento multi-salto: adecuado para evaluar la capacidad de combinar información de múltiples documentos en preguntas de MuSiQue, gracias a su entrenamiento específico sobre ese corpus.
- Reproducción de experimentos de ajuste fino completo: el README documenta hiperparámetros completos (batch, learning rate, warmup, hardware), lo que permite reproducir o extender el entrenamiento con FSDP en clústeres con GPUs AMD MI325X.
- Generación de respuestas conversacionales con contexto largo: con una ventana de entrenamiento de 8096 tokens, puede emplearse en diálogos que requieran incorporar documentación extensa, aunque sin garantías de calidad fuera del dominio de MuSiQue.
- Base para nuevos ajustes finos: al estar bajo licencia Apache 2.0 y en formato safetensors estándar, puede cargarse con `transformers` y servir como punto de partida para especializaciones posteriores.
- Evaluación comparativa de estrategias de clustering de datos: el nombre `knn_k2` y el fichero de datos permiten comparar esta estrategia de selección de ejemplos frente a otras variantes en tareas de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para los pesos (14,77 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 40-48 GB de VRAM para inferencia cómoda en bf16.
- Cuantización: no se documentan versiones cuantizadas (GGUF, AWQ, GPTQ); para reducir VRAM sería necesario generarlas a partir de los safetensors bf16.
- GPUs recomendadas: A100 80GB, H100 80GB, AMD Instinct MI325X (usada en entrenamiento) o GPUs consumer de gama alta con 24 GB solo si se cuantiza a 8 bits o menos (no verificado).
- Cabe en consumer GPU: en bf16 no cabe en RTX 4090 (24 GB) sin cuantización; con cuantización a 4 bits podría caber, pero no hay artefactos publicados.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (documentado por el autor); compatible con text-generation-inference según los tags. No se documenta soporte explícito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep1 | 14,77 B | 8096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint época 1 de 3, especializado en memoria/MuSiQue |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, propósito general |
| Alternativas de 14B con ajuste fino específico | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la misma tarea de memoria |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la misma tarea (memory model sobre MuSiQue) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata de la época 1 de 3; el autor no publica las épocas 2 y 3 en la información disponible, por lo que el rendimiento final del entrenamiento completo es desconocido.
- Especialización estrecha: el ajuste se ha realizado exclusivamente sobre pares QA sintéticos de MuSiQue, lo que puede degradar capacidades generales del modelo base (olvido catastrófico) fuera del dominio de memoria multi-salto.
- Sin benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente al modelo base u otras alternativas.
- Idiomas no documentados: se desconoce qué idiomas conserva o ha perdido tras el ajuste fino.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en preguntas multi-salto que requieran combinar información no vista en entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5-14B-Instruct, hereda los sesgos del modelo base y de los datos sintéticos de MuSiQue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; al ser un artefacto de investigación con cero descargas, no hay evidencia de uso en producción.
- Formato de pesos únicamente safetensors bf16: no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en hardware consumer.
- Longitud de contexto: la longitud máxima de entrenamiento es 8096 tokens; no se documenta el contexto nativo del modelo base ni si el ajuste preserva la ventana original de Qwen2.5-14B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
