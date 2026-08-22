# windsword8989/5GbZvZ7tcC-d1

## Resumen

El modelo `windsword8989/5GbZvZ7tcC-d1` es un checkpoint experimental de 35.107 millones de parámetros, desarrollado por el usuario windsword8989 como parte de un desafío interno denominado "Affine SN120" y "Reason v4". Se trata de un modelo de generación de texto basado en el modelo base `vera6/affine-5g4yy75zuz-t6`, sobre el que se aplicó un entrenamiento de optimización de preferencias mediante *offline DPO* (Direct Preference Optimization) sobre pares de duelos generados por un sistema de evaluación multi-referencia. No está concebido como un modelo de chat general, sino como una "sumisión" (submission) para un sistema de evaluación de razonamiento específico, con una métrica propia llamada "Reason" que combina log-mean-exp de tres referencias docentes.

La arquitectura subyacente parece ser un modelo de mezcla de expertos (MoE), según la etiqueta `qwen3_5_moe`, aunque no se especifican detalles de la arquitectura interna. El entrenamiento se realizó con LoRA (r=32, α=128) sobre el modelo base, con una tasa de aprendizaje extremadamente baja (5e-7) y una longitud máxima de secuencia de 12288 tokens. El modelo se entrenó en 8 GPUs B200 y el repositorio contiene 70.2 GB de pesos en formato safetensors, distribuidos en 16 shards. La licencia es Apache 2.0, pero la model card indica que sigue la política de artefactos del modelo base y del sistema Affine.

Este modelo es relevante en el contexto de investigación sobre optimización de preferencias y evaluación de razonamiento en modelos de lenguaje, pero no está destinado a uso productivo general. Su interés radica en la metodología de entrenamiento (offline DPO con ranking multi-referencia) y en los resultados obtenidos frente al modelo base en la métrica Reason v4, donde reporta una mejora marginal de +0.003665 con significancia estadística (z=2.177).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según etiqueta `qwen3_5_moe`), no confirmada |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 12288) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 shards, 70.2 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. La etiqueta `qwen3_5_moe` sugiere que se trata de un modelo de mezcla de expertos similar a la familia Qwen3.5 MoE, pero no se confirma el número de expertos ni la configuración de atención. El modelo base es `vera6/affine-5g4yy75zuz-t6`, del cual se desconoce su arquitectura interna.

El entrenamiento se realizó mediante *offline DPO* sobre pares de duelos generados con un sistema de ranking llamado "Reason v4". Este sistema calcula una puntuación por turno usando la fórmula `a_i = lpC(y_i|z_A) − lpC(y_i|∅)` y luego agrega con `Reason = τ·log(mean_i exp(a_i/τ))` con τ=0.03 y k=3 referencias docentes. El objetivo era optimizar las preferencias hacia pensamientos que aumenten la puntuación Reason del lado del docente. Se usó LoRA con r=32, α=128, β=0.1, lr=5e-7, max_len=12288, max_steps=19200 y 4 épocas. El entrenamiento se ejecutó en 8 GPUs B200 (Lium mine-crown-1) y el modelo fusionado se guardó en `/tmp/r861_merged` (~66 GB). No se menciona el uso de RLHF, GRPO ni otros métodos de alineación.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto, pero su uso previsto es específico para el desafío Affine SN120, no para tareas generales de conversación.
- Razonamiento: está optimizado para mejorar la puntuación "Reason" en el sistema de evaluación v4, que mide la calidad de los razonamientos generados frente a referencias docentes.
- No se dispone de información sobre capacidades de tool calling, agentes, visión, audio o multilingüismo. Aunque el tag `image-text-to-text` aparece en los metadatos, no hay evidencia en la model card de que el modelo procese imágenes.
- El modelo no está diseñado para interacción conversacional directa; la model card indica explícitamente "Not a general chat model".

## Casos de uso

- Participación en el desafío Affine SN120: el modelo se presenta como una "sumisión" para el sistema de evaluación Reason v4, donde compite contra el modelo base en duelos de razonamiento. Es el caso de uso principal y el único documentado.
- Investigación en optimización de preferencias: el checkpoint puede servir como referencia para estudiar el efecto de DPO offline con ranking multi-referencia y LoRA de baja tasa de aprendizaje en modelos MoE de gran tamaño.
- Evaluación de métricas de razonamiento: dado que el modelo fue entrenado para maximizar la métrica Reason, puede utilizarse como banco de pruebas para validar dicha métrica en entornos controlados.
- Análisis de estabilidad de entrenamiento: los hiperparámetros extremos (lr=5e-7, β=0.1) y el uso de LoRA de rango medio pueden ser de interés para investigar la robustez del entrenamiento con preferencias.
- Comparación de metodologías: el modelo puede compararse con otros checkpoints de la misma línea (R846, R847) para aislar el efecto de la variación de β y del rango de LoRA.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o cualquier tarea de propósito general, dado su carácter experimental y su falta de validación en esos dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una evaluación interna frente al modelo base `vera6/affine-5g4yy75zuz-t6` bajo la métrica Reason v4 (weight_version_key=7), con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Margen vs. base | +0.003665 |
| Error estandar (SE) | 0.001684 |
| z-score | 2.177 |
| n (tamaño de muestra) | 80 |
| Barra de decisión (max(2·SE, δ=0.002)) | 0.003367 |
| Ratio margen/barra | ~1.088× |
| Mediana de pensamiento | 141.5 (≥80, cumple) |
| Tasa de pase B | 0.5375 (≥0.30, cumple) |
| Decisión | WIN / Stage-5 licensed |

Estos datos indican una mejora estadísticamente significativa frente al modelo base en la métrica Reason, pero no son comparables con benchmarks generales de razonamiento o lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 35.1B parámetros en precisión fp16/bf16, se necesitarían aproximadamente 70 GB de VRAM, pero no se especifica el tamaño de los parámetros activos ni la posibilidad de cuantización.
- GPU recomendadas: el entrenamiento se realizó en 8×B200 (NVIDIA), pero para inferencia no se indica ninguna GPU específica. En principio, una GPU con al menos 80 GB de VRAM (como A100 80GB o H100) podría alojar el modelo en fp16, aunque no está confirmado.
- No se dispone de información sobre si cabe en GPUs de consumo (RTX 4090, etc.). Dado el tamaño, probablemente no quepa sin cuantización agresiva, pero no hay datos.
- Opciones de despliegue: no se mencionan. Al ser un modelo de transformers, podría usarse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El modelo es parte de una línea experimental interna (R846, R847, R861) y no se conocen alternativas públicas con características similares. Se puede indicar que no hay comparativa disponible.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso general ni para producción. La model card lo declara explícitamente como "Not a general chat model".
- Sesgos y alucinaciones: no se han evaluado. Al ser un modelo entrenado con DPO sobre un conjunto de datos muy específico (duelos de razonamiento), es probable que presente sesgos hacia el estilo de razonamiento de las referencias docentes y que alucine en contextos fuera de su dominio.
- Limitaciones de contexto: la longitud máxima de entrenamiento fue de 12288 tokens, pero no se especifica la ventana de contexto real del modelo. Podría no soportar secuencias más largas.
- Idiomas: no se especifican idiomas soportados. El modelo base podría ser multilingüe, pero no hay confirmación.
- Licencia: aunque la licencia es Apache 2.0, la model card indica que se sigue la "política de artefactos del modelo base y del sistema Affine", lo que podría imponer restricciones adicionales no detalladas.
- Reproducibilidad: el entrenamiento depende de un sistema de evaluación interno (Reason v4) y de datos no públicos (`dpo_duel_reason.jsonl`), por lo que no es posible reproducir los resultados sin acceso a esos recursos.
- Riesgo de sobreajuste: el modelo fue optimizado para una métrica muy concreta (Reason v4) y podría no generalizar a otras tareas de razonamiento.

## Enlaces

- HuggingFace: https://huggingface.co/windsword8989/5GbZvZ7tcC-d1
- Perfil del autor: https://huggingface.co/windsword8989
- Modelo base (referencia): https://huggingface.co/vera6/affine-5g4yy75zuz-t6 (no verificado)
