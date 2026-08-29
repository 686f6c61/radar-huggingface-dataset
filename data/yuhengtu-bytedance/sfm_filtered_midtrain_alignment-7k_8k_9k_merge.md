# yuhengtu-bytedance/sfm_filtered_midtrain_alignment-7k_8k_9k_merge

## Resumen

Este modelo es una fusión lineal de tres checkpoints intermedios de entrenamiento de la serie SFM (Self-Fulfilling Misalignment), desarrollada por investigadores de ByteDance. Forma parte de un conjunto de modelos de 6.9B parámetros diseñados para investigar cómo los datos de preentrenamiento moldean los priors de alineación y los mecanismos detrás de las profecías autocumplidas en el comportamiento de los modelos de IA. El nombre del modelo indica que se fusionaron los checkpoints de los pasos globales 7000, 8000 y 9000 de un entrenamiento filtrado con alineación intermedia.

La fusión se realizó con mergekit utilizando el método Linear, que promedia los pesos de los modelos base con normalización. El modelo resultante usa la arquitectura GPT-NeoX, tiene aproximadamente 6.86 mil millones de parámetros y se distribuye en formato safetensors con precisión bfloat16. Su relevancia radica en que permite estudiar el efecto de la fusión de checkpoints intermedios en las propiedades de alineación y seguridad del modelo final, un área de investigación activa en la comunidad de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se creó mediante el método de fusión Linear implementado en mergekit, que combina los pesos de varios modelos base mediante una media ponderada. En este caso, se fusionaron tres checkpoints del mismo entrenamiento (pasos globales 7000, 8000 y 9000) con pesos iguales (1.0 cada uno) y normalización activada. La fusión se realizó en float32 y se exportó a bfloat16. El checkpoint del paso 9000 se usó como modelo base de referencia.

La arquitectura subyacente es GPT-NeoX, un transformer decoder-only con atención causal. Los detalles específicos del entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada. Sin embargo, el nombre del modelo y la serie SFM sugieren que se trata de un experimento controlado para estudiar el efecto del filtrado de datos y la alineación durante el entrenamiento intermedio. El modelo pertenece a la suite "Alignment Pretraining Suite" descrita en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment".

## Capacidades

- Generación de texto: como modelo GPT-NeoX de 6.9B, puede generar texto coherente en tareas de lenguaje natural.
- Investigación en alineación: diseñado específicamente para estudiar cómo los datos de preentrenamiento afectan los comportamientos de alineación y seguridad.
- Fusión de modelos: resultado de un experimento de merging, útil para investigar técnicas de combinación de checkpoints.
- Comparación de variantes: permite comparar el efecto del filtrado (filtered) frente a versiones sin filtrar (unfiltered) de la misma serie.
- No se dispone de información sobre tool calling, capacidades multimodales, razonamiento avanzado o soporte de agentes.

## Casos de uso

- Investigación académica en alineación de IA: el modelo permite reproducir y extender los experimentos descritos en el paper de Alignment Pretraining, estudiando cómo la fusión de checkpoints intermedios afecta a los priors de alineación.
- Evaluación de técnicas de merging: sirve como caso de estudio para validar el método Linear de mergekit con checkpoints del mismo entrenamiento, comparando la calidad del modelo fusionado frente a los checkpoints individuales.
- Análisis de seguridad y sesgos: al ser parte de una suite diseñada para estudiar la (des)alineación autocumplida, puede usarse para medir comportamientos de seguridad en modelos de 6.9B.
- Comparación de filtrado de datos: junto con la variante unfiltered, permite analizar el impacto del filtrado de datos de entrenamiento en el comportamiento final del modelo.
- Desarrollo de pipelines de alineación: los resultados de este modelo pueden informar el diseño de estrategias de alineación durante el preentrenamiento en lugar de solo en el post-entrenamiento.
- Benchmarking de inferencia: al ser un modelo de 6.9B en bfloat16, puede usarse para medir rendimiento de frameworks de inferencia como vLLM o TGI en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares en su model card, y no se encontraron evaluaciones independientes en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en bfloat16 (6.9B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, L40S o superiores. Con cuantización a 8 bits cabría en GPUs de 16 GB como RTX 4080 o A10G.
- En consumer GPU: sí, cabe en RTX 4090 y RTX 3090 (24 GB) sin cuantización adicional.
- Opciones de despliegue: compatible con transformers, vLLM, Text Generation Inference (TGI) y llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible. Para un modelo de 6.9B en una RTX 4090, se puede esperar un throughput aproximado de 20-40 tokens/s con vLLM, pero estos datos no han sido verificados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm_filtered_midtrain_alignment-7k_8k_9k_merge (este) | 6.9B | no disponible | no disponible | Fusión de checkpoints 7k, 8k y 9k filtrados |
| sfm-filtered-midtrain-alignment-4k-5k-6k-avg | 6.9B (presumible) | no disponible | no disponible | Fusión de checkpoints 4k, 5k y 6k filtrados |
| sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg | 6.9B (presumible) | no disponible | no disponible | Fusión de checkpoints sin filtrar |
| sfm_filtered_midtrain_alignment_upsampled_instruct | 6.9B | no disponible | no disponible | Variante con instrucciones y upsampling, de geodesic-research |

La comparativa se limita a la misma serie SFM, ya que no se dispone de datos de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Información insuficiente: no se dispone de detalles sobre licencia, idiomas soportados, contexto máximo ni datos de entrenamiento, lo que dificulta su uso en producción.
- Modelo de investigación: está diseñado para estudiar fenómenos de alineación, no como modelo de propósito general listo para producción.
- Riesgo de alucinación: como cualquier modelo de 6.9B, puede generar contenido falso o inconsistente, especialmente fuera de su dominio de entrenamiento.
- Sesgos desconocidos: al no publicarse detalles del dataset de entrenamiento, no es posible evaluar sesgos potenciales.
- Sin garantías de seguridad: el propio nombre de la serie (Self-Fulfilling Misalignment) indica que estos modelos pueden exhibir comportamientos de desalineación, por lo que no deben usarse en aplicaciones sensibles sin evaluación exhaustiva.
- Restricciones de uso comercial: la licencia no está especificada, por lo que el uso comercial es arriesgado desde el punto de vista legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_midtrain_alignment-7k_8k_9k_merge
- Variante 4k-5k-6k en FriendliAI: https://friendli.ai/models/yuhengtu-bytedance/sfm-filtered-midtrain-alignment-4k-5k-6k-avg
- Variante unfiltered en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
- Modelo relacionado de geodesic-research: https://huggingface.co/geodesic-research/sfm_filtered_midtrain_alignment_upsampled_instruct
- Paper de referencia (Alignment Pretraining): mencionado en la model card de geodesic-research, titulado "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment"
- Paper sobre método Linear de merging: https://arxiv.org/abs/2203.05482
