# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep1

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep1 es un ajuste fino completo del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon, orientado a funcionar como "modelo de memoria" sobre pares de pregunta-respuesta sinteticos derivados del conjunto MuSiQue. No se trata de un modelo base nuevo ni de un modelo instructivo generalista, sino de un checkpoint experimental de investigación que incorpora en sus pesos el resultado de un proceso de agrupamiento (clustering) concreto identificado como `knn_k2_and_hdb_and_entity`.

El modelo conserva la arquitectura original de Qwen2.5-1.5B-Instruct (transformer decoder-only denso, 1.543.714.304 parámetros totales según los safetensors) y se distribuye en formato bf16 safetensors, cargable con `transformers` mediante `AutoModelForCausalLM`. El ajuste se realizó con fine-tuning completo (FSDP) sobre 2.681.852 ejemplos y una longitud máxima de secuencia de 8096 tokens, con 3 épocas planificadas; este repositorio corresponde a la época 1.

Su relevancia es acotada y de carácter experimental: se publica bajo licencia Apache 2.0, sin descargas ni interacciones en el momento de la ficha, y no incluye datos de benchmarks, idiomas soportados ni evaluación cualitativa. Es útil para quienes investigan técnicas de memoria externa, recuperación aumentada o destilación de estructuras de agrupamiento en modelos pequeños, no como sustituto directo de un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), derivado de Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con max sequence length de 8096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar, y aplica sobre él un fine-tuning completo (no LoRA ni adaptadores) con FSDP. Según la model card, se entrenaron el 100% de los parámetros (1.543.714.304 entrenables) durante 3 épocas planificadas, con batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, weight decay 0.01, max grad norm 1.0 y gradient checkpointing en bf16. La pérdida se calcula únicamente sobre los tokens del asistente. El entrenamiento completo de las 3 épocas consumió 2,79 h de reloj y 22,3 GPU-horas sobre 8 AMD Instinct MI325X.

El dato diferencial es el pipeline de datos: los ejemplos provienen de un fichero de 2.681.852 pares QA sintéticos sobre MuSiQue, construidos mediante un método de clustering etiquetado `knn_k2_and_hdb_and_entity`, que combina kNN con k=2 y deduplicación de documentos, HDBSCAN con tamaño mínimo de cluster 2 y agrupamiento por entidad con df máximo 3, incluyendo combinación de entidades entre documentos (variante v3). No se documentan fases de RLHF o DPO adicionales, ni innovaciones de decodificación (atención lineal, decodificación especulativa, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto condicionada por el template de chat de Qwen, tal como indica la model card.
- Comportamiento esperado como modelo de memoria sobre pares QA de MuSiQue, dado el objetivo declarado del ajuste.
- Fine-tuning completo sobre el modelo instructivo base, por lo que hereda (sin garantía documentada) las capacidades conversacionales de Qwen2.5-1.5B-Instruct.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación en modelos de memoria: el checkpoint permite estudiar cómo un fine-tuning completo sobre pares QA sintéticos agrupados por kNN + HDBSCAN + entidades altera la recuperación de información en un modelo de 1.5B, comparando la época 1 con las épocas 2 y 3 del mismo experimento.
- Evaluación de pipelines de datos sintéticos: sirve para medir el impacto de la estrategia `knn_k2_and_hdb_and_entity` (deduplicación de documentos, HDBSCAN con mcs=2, agrupamiento por entidad con df≤3) frente a otras estrategias de construcción de datasets, usando MuSiQue como referencia.
- Reproducción de experimentos académicos: al documentarse batch, learning rate, hardware (8× MI325X) y tiempo de entrenamiento, el repositorio es útil para replicar el ajuste con FSDP en entornos con GPUs AMD.
- Prototipado de QA sobre documentos múltiples: el modelo se entrenó con pares derivados de MuSiQue, un benchmark de razonamiento multi-hop, por lo que puede emplearse en pruebas exploratorias de respuesta a preguntas que requieren combinar información de varios documentos.
- Base para ajustes posteriores: dado que es un checkpoint intermedio (época 1 de 3) con licencia Apache 2.0, puede utilizarse como punto de partida para fine-tunes adicionales en tareas de recuperación o memoria.
- Despliegue ligero en entornos con recursos limitados: con 1.54B parámetros y pesos bf16, el modelo cabe en GPUs de consumo para inferencia, lo que facilita pruebas locales del comportamiento del ajuste sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB para pesos (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 son suficientes. El entrenamiento documentado usó 8× AMD Instinct MI325X.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en bf16, y en GPUs con 6 GB si se cuantiza.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), y por compatibilidad con el ecosistema Qwen2, herramientas como vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF (no verificadas en la información proporcionada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep1 | 1.543.714.304 | no disponible (entrenado a 8096) | apache-2.0 | Checkpoint época 1 de 3, ajuste experimental como modelo de memoria |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 (mismo base) | 32.768 tokens (según especificaciones públicas de Qwen2.5) | apache-2.0 | Modelo base instructivo generalista, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 tokens (según especificaciones públicas de Qwen2.5) | apache-2.0 | Alternativa más pequeña de la misma familia para despliegue con menos VRAM |
| Modelos de 1-2B tipo Llama 3.2 1B Instruct | ~1,24B | 128K tokens (según especificaciones públicas de Meta) | Llama 3.2 Community License | Alternativa generalista con licencia no Apache; sin relación con este ajuste |

La comparación directa en rendimiento no es posible: el modelo de esta ficha no publica benchmarks, mientras que los modelos base de referencia sí cuentan con evaluaciones oficiales. La diferencia principal es funcional: este checkpoint está especializado en memoria/QA sobre MuSiQue, no en conversación general.

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 1 de 3): no representa el resultado final del entrenamiento y su calidad puede ser inferior a la de las épocas posteriores.
- No se han publicado evaluaciones, benchmarks ni métricas de calidad; no hay evidencia documentada de su rendimiento real.
- El ajuste se realizó sobre pares QA sintéticos de MuSiQue, lo que puede provocar sobreajuste a ese dominio y degradar el comportamiento conversacional general del modelo base.
- Riesgo de alucinación: no evaluado; al ser un modelo de 1.5B ajustado sobre datos sintéticos, el riesgo es relevante y no está cuantificado.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe más allá del heredado del modelo base.
- Longitud de contexto efectiva: no disponible; el entrenamiento usó secuencias de hasta 8096 tokens, por debajo del contexto nativo del Qwen2.5-1.5B-Instruct, lo que puede limitar el uso con contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y de los datos de MuSiQue por separado.
- Sin descargas ni validación comunitaria en el momento de la ficha: no hay señales de uso en producción ni informes de terceros.
- El repositorio no documenta cuantizaciones oficiales ni recetas de despliegue; cualquier conversión a GGUF o cuantización corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Dataset MuSiQue (referencia del dominio de entrenamiento): https://github.com/StonyBrookNLP/musique
- Documentación de HDBSCAN: https://hdbscan.readthedocs.io/
