# tensor-tailor/zils-mini-body-10

## Resumen

zils-mini-body-10 es un modelo de decisión (decision model) desarrollado por el usuario tensor-tailor para el pool de modelos "soup" denominado Zils `d3-mini`, asociado a la subred 127 de Bittensor. Se trata de un fine-tune mediante LoRA del promedio uniforme de pesos de dos modelos previos (qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1), construido sobre el chasis d3-mini, que emplea la arquitectura Qwen3.5-4B con tensores de lenguaje y visión en bf16. El modelo cuenta con 4.539.265.536 parámetros totales y un repositorio de 9,1 GB.

El modelo resuelve la tarea de actuar como "cuerpo de decisión" dentro de un ecosistema de minería de modelos: recibe entradas de tareas diversas y produce decisiones o clasificaciones, entrenado con etiquetas de tipo "house" (respuestas argmax de un modelo profesor del pool) combinadas con un conjunto menor de etiquetas gold generadas por código o provenientes de datasets públicos. Es relevante en el contexto de la subred Bittensor 127, donde los mineros compiten por producir cuerpos de decisión que se integren en el soup del pool.

La arquitectura subyacente es un transformer Qwen3.5-4B con proyecciones Gated-DeltaNet (un mecanismo de atención lineal o híbrido), y el entrenamiento se realizó con LoRA de rango 32 sobre 152 matrices de atención y proyecciones DeltaNet. No se dispone de información sobre longitud de contexto, idiomas soportados ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B con proyecciones Gated-DeltaNet (chasis d3-mini, tensores de lenguaje y visión) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con máximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el chasis d3-mini, que emplea la arquitectura Qwen3.5-4B con tensores de lenguaje y visión en bf16. La arquitectura incluye proyecciones Gated-DeltaNet, un mecanismo de atención lineal/híbrido que sustituye o complementa la atención estándar en determinadas capas. El punto de partida es el promedio uniforme de pesos (soup) de qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1, calculado con la herramienta oficial `zils.soup.build` (media en fp32 sobre pesos canónicos bf16, con la torre de visión del chasis).

El fine-tune se realizó con LoRA de rango 32, alpha 64 y dropout 0.05 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje (152 matrices), con learning rate 5e-5, AdamW con weight decay 1.0 solo sobre los pesos LoRA, batch 8 con acumulación 2, warm-up de 50 pasos seguido de cosine, 2 épocas, máximo 2.048 tokens y semilla 4343. La función de pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más 1.0 veces el Brier score, sin término KL ni destilación. Los pesos se fusionaron en bf16. El dataset consta de 3.208 filas: 2.803 filas "relay" de 70 fuentes de tareas públicas de cola larga (etiquetas "house" del profesor argmax del pool, atribuidas a d3-ultra) y 405 filas ancla con etiquetas gold (ítems de artes/lenguaje/razonamiento generados por código, GoEmotions simplificado, MNLI/PIQA/GLUE). No se usaron salidas de otros mineros como objetivos.

## Capacidades

- Generación de decisiones y clasificación sobre tareas diversas de cola larga (el modelo está entrenado como "decision body", no como generador de texto conversacional).
- Razonamiento sobre ítems de lenguaje, artes y razonamiento evaluados mediante puntuaciones generadas por código.
- Clasificación de emociones (entrenado con GoEmotions simplificado).
- Inferencia de entailment y razonamiento físico (entrenado con MNLI y PIQA).
- Procesamiento multimodal potencial: el chasis incluye torre de visión Qwen3.5-4B, aunque no se detalla el uso efectivo de visión en el entrenamiento.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Clasificación de tareas de razonamiento en pipelines de evaluación: el modelo puede emplearse como clasificador de ítems de razonamiento y lenguaje, aprovechando su entrenamiento con etiquetas gold de MNLI, PIQA y GLUE para tareas de entailment y razonamiento físico.
- Moderación de contenido basada en emociones: gracias a su entrenamiento con GoEmotions simplificado, puede integrarse en sistemas que detecten tono emocional en textos de entrada y actúen en consecuencia.
- Miembro de un pool de decisión en Bittensor: el modelo está diseñado específicamente para integrarse en el soup `d3-mini` de la subred 127, donde actúa como cuerpo de decisión que contribuye a las respuestas agregadas del pool.
- Evaluación de tareas de cola larga: sus 2.803 filas de entrenamiento provenientes de 70 fuentes de tareas públicas lo hacen adecuado para clasificar entradas heterogéneas en entornos de benchmark con dominios diversos.
- Experimentación en investigación sobre soups de modelos: sirve como punto de partida para estudiar el efecto del fine-tune LoRA sobre promedios de pesos y la contribución de etiquetas "house" frente a etiquetas gold en el rendimiento de decisión.
- Prototipado de clasificadores de bajo coste: con 4.539 millones de parámetros y pesos bf16, puede desplegarse en una GPU consumer de gama alta para tareas de clasificación e inferencia de decisión en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta comprobaciones internas del autor: cambio relativo respecto a Qwen/Qwen3.5-4B de 0.01254 (límite 0.15), digest del cuerpo Zils 8a3c157a8d14770bfc0bd0d5cf6b7f02c307c8c8ee68d9f6114a0afe4792f366, y un cribado de copias con coseno máximo de 0.941 frente a otros cuerpos (límite 0.999) y una proporción máxima explicada por cuerpos anteriores de 0.223 (límite 0.30). Estas cifras no son benchmarks de rendimiento de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,1 GB en bf16 (tamaño del repositorio); en cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bf16 sin cuantizar.
- Cabe en GPU consumer: sí, en GPUs con 12 GB o más de VRAM en bf16 (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en cuantización 4 bits podría caber en GPUs de 8 GB.
- Opciones de despliegue: no disponible en la model card; al usar safetensors y código personalizado (`custom_code`), es probable que requiera transformers con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-mini-body-10 | 4.539 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune LoRA del soup d3-mini |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Hugging Face | Modelo base del soup |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Hugging Face | Modelo base del soup |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible | Hugging Face | Chasis original del que deriva la arquitectura |

## Limitaciones y advertencias

- El modelo está entrenado como "decision body" para un pool específico (Bittensor subred 127); su uso fuera de ese contexto puede no ser óptimo.
- Las etiquetas de entrenamiento son mayoritariamente "house labels" (argmax de un profesor del pool, atribuidas a d3-ultra con revisión exacta desconocida), no etiquetas gold; esto introduce sesgo hacia el comportamiento del profesor.
- Solo 405 de las 3.208 filas tienen etiquetas gold, lo que limita la diversidad de supervisión fiable.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se manifiesta como clasificaciones erróneas en dominios no cubiertos por las 70 fuentes de entrenamiento.
- Longitud de contexto: el entrenamiento usó un máximo de 2.048 tokens; no se especifica la ventana de contexto nativa del chasis Qwen3.5-4B.
- Idiomas soportados: no disponible; el entrenamiento se realizó sobre datasets mayoritariamente en inglés (MNLI, PIQA, GLUE, GoEmotions), lo que puede limitar el rendimiento en castellano u otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE para las obras upstream y sus avisos.
- El autor indica que el modelo se envió antes de completar la lectura completa de pre-commit, lo que supone un caveat sobre la validación final.
- El cribado de copias se realizó con semillas propias, no con la semilla privada del validador, por lo que la verificación oficial no está garantizada.
- No se han publicado benchmarks de rendimiento, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-10
- Modelo base qhoenix/zils-mini-decision-v2: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base Charlie320/zils-mini-s1: https://huggingface.co/Charlie320/zils-mini-s1
- Chasis Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultado de búsqueda web (no relacionado con el modelo, referido a un LoRA de imagen): https://tensor.art/models/948011511064864951
