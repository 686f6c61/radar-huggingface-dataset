# yuhengtu-bytedance/sfm_filtered_midtrain_alignment-3k_4k_5k_merge

## Resumen

El modelo `sfm_filtered_midtrain_alignment-3k_4k_5k_merge` es una fusión lineal de tres checkpoints intermedios del mismo modelo base `filtered_midtrain_alignment`, desarrollado por el equipo de yuhengtu-bytedance. Se trata de un modelo de lenguaje generativo de aproximadamente 6.9 mil millones de parámetros, creado mediante la técnica de *model merging* con la herramienta mergekit, utilizando el método Linear (también conocido como *weight averaging*). El modelo base pertenece a una suite de investigación sobre cómo los datos de preentrenamiento moldean los sesgos de alineación en modelos de IA, como se describe en el paper *Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment*.

La relevancia de este modelo radica en su naturaleza experimental: al promediar pesos de distintos puntos de entrenamiento (pasos 3000, 4000 y 5000), se busca explorar si la fusión de checkpoints intermedios produce un comportamiento más estable o mejor alineado que un único checkpoint final. Está etiquetado con la arquitectura GPT-NeoX y es compatible con transformers y text-generation-inference. Sin embargo, carece de documentación pública sobre su licencia, idiomas soportados o contexto máximo, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags) |
| Parametros totales | 6.856.253.440 (~6,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal de tres checkpoints del mismo modelo base `filtered_midtrain_alignment`, correspondientes a los pasos de entrenamiento global 3000, 4000 y 5000. La fusión se realizó con mergekit usando el método Linear (promedio de pesos), con pesos iguales (1.0) para cada checkpoint y normalización activada. El modelo base se entrenó en el contexto de la investigación sobre alineación durante el preentrenamiento, como parte de la suite *Alignment Pretraining Suite* descrita en el paper mencionado. La arquitectura subyacente es presumiblemente un transformer estilo GPT-NeoX, aunque no se especifican detalles como el número de capas o cabezas de atención. El proceso de entrenamiento del modelo base no está documentado públicamente; se desconoce el volumen de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva (pipeline text-generation).
- Capacidades de razonamiento y comprensión del lenguaje, propias de un modelo de 6,9B parámetros, aunque sin datos concretos de evaluación.
- No se dispone de información sobre soporte de *tool calling*, *function calling*, capacidades multimodales o *thinking mode*.
- No se especifican idiomas soportados; se asume un entrenamiento multilingüe genérico, pero sin confirmación.
- Al ser un merge de checkpoints intermedios, su comportamiento puede diferir del de un modelo entrenado hasta convergencia, mostrando potencialmente propiedades de alineación diferentes.

## Casos de uso

- Investigación académica sobre alineación de modelos: permite estudiar cómo la fusión de pesos de diferentes etapas de entrenamiento afecta a los sesgos y comportamientos emergentes.
- Experimentación con *model merging*: útil para desarrolladores que quieran reproducir o comparar técnicas de fusión de pesos en modelos de tamaño medio.
- Análisis de estabilidad del entrenamiento: al comparar este merge con checkpoints individuales, se pueden evaluar diferencias en la coherencia del texto generado.
- Punto de partida para *fine-tuning*: puede servir como inicialización para tareas específicas, aunque se recomienda verificar su comportamiento antes de usarlo.
- Evaluación de riesgos de alineación: dado su origen en un estudio sobre profecías autocumplidas en IA, puede usarse para probar hipótesis sobre sesgos inducidos por datos.
- Demostraciones educativas: para ilustrar conceptos de *weight averaging* y sus efectos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han documentado comparaciones con modelos similares en términos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: para los pesos en bfloat16 (6,9B parámetros), se necesitan aproximadamente 13,7 GB solo para los pesos. Con overhead de activaciones y memoria de trabajo, se recomienda al menos 24 GB de VRAM para inferencia en precisión completa (FP16/BF16).
- Con cuantización a 4 bits (por ejemplo, con bitsandbytes o GGUF), el modelo podría caber en GPUs con 8 GB de VRAM, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs de datacenter similares. Para cuantización ligera, una RTX 3060 (12 GB) podría ser suficiente.
- Opciones de despliegue: compatible con Hugging Face transformers, por lo que puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No se proporcionan archivos de ejemplo.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware y de la implementación de inferencia elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm_filtered_midtrain_alignment-3k_4k_5k_merge (este) | 6,9B | no disponible | no disponible | Merge de 3 checkpoints intermedios |
| sfm-baseline-filtered-4k-5k-6k-avg (mismo autor) | no disponible | no disponible | no disponible | Merge similar con otros pasos (4k, 5k, 6k) |
| sfm_filtered_midtrain_alignment_upsampled_instruct (geodesic-research) | 6,9B (según paper) | no disponible | no disponible | Variante con *upsampling* e instrucciones, descrita en el paper de Alignment Pretraining |

No se dispone de comparativas de rendimiento entre estos modelos. La principal diferencia entre ellos radica en los checkpoints utilizados y el método de fusión, pero sin datos empíricos no es posible establecer cuál es superior.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede usarse comercialmente o con fines de investigación sin restricciones.
- Modelo experimental: al ser un merge de checkpoints intermedios, su comportamiento puede ser impredecible y no representativo de un modelo completamente entrenado.
- Sesgos y alucinaciones: al no contar con evaluaciones, no se puede cuantificar el riesgo de generar información falsa o sesgada. Dado su origen en un estudio sobre alineación, es probable que presente sesgos relacionados con los datos de entrenamiento.
- Contexto limitado desconocido: sin especificación de la longitud de contexto, no se recomienda su uso en aplicaciones que requieran ventanas largas.
- Idiomas no especificados: no se garantiza un rendimiento adecuado en español u otros idiomas.
- Sin soporte oficial: no hay documentación de mantenimiento, actualizaciones ni canal de soporte.
- No apto para producción: por todas las incertidumbres anteriores, no se recomienda su despliegue en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_midtrain_alignment-3k_4k_5k_merge
- Modelo similar del mismo autor: https://huggingface.co/yuhengtu-bytedance/sfm-baseline-filtered-4k-5k-6k-avg
- Modelo relacionado de geodesic-research: https://huggingface.co/geodesic-research/sfm_filtered_midtrain_alignment_upsampled_instruct
- Paper de referencia (Alignment Pretraining): no se ha encontrado enlace directo, pero se menciona en la model card del modelo de geodesic-research.
