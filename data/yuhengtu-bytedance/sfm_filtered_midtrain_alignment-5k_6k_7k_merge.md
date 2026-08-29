# yuhengtu-bytedance/sfm_filtered_midtrain_alignment-5k_6k_7k_merge

## Resumen

El modelo `sfm_filtered_midtrain_alignment-5k_6k_7k_merge` es un merge lineal de tres checkpoints intermedios de entrenamiento (global_step5000, 6000 y 7000) pertenecientes a la familia "sfm" (Safety-Focused Models) desarrollada por investigadores de ByteDance. Forma parte de la suite "Alignment Pretraining" descrita en el paper *Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment*, que investiga cómo los datos de preentrenamiento condicionan los sesgos de alineación y los mecanismos de profecías autocumplidas en el comportamiento de los modelos.

Con 6.856.253.440 parámetros (aproximadamente 6,9 mil millones), el modelo utiliza una arquitectura GPT-NeoX (transformer decoder) y se generó mediante la herramienta mergekit con el método Linear, normalizando los pesos y usando el checkpoint de paso 7000 como base. El resultado es un modelo de generación de texto pensado para investigación sobre alineación y seguridad, no para uso productivo directo. Su relevancia radica en que permite estudiar cómo la fusión de checkpoints intermedios con diferentes niveles de filtrado y alineación afecta al comportamiento final del modelo.

La información pública es muy limitada: no se especifican licencia, idiomas soportados, longitud de contexto ni benchmarks. El repositorio tiene 13,7 GB y los pesos están en formato safetensors con dtype bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder) |
| Parametros totales | 6.856.253.440 (6,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge lineal de tres checkpoints de preentrenamiento intermedio de la misma familia "sfm_filtered_midtrain_alignment". El método Linear (descrito en el paper arXiv:2203.05482) combina los pesos de los modelos fuente con pesos normalizados (normalize: true) y utiliza el checkpoint de global_step7000 como base. La fusión se realizó en float32 y se exportó a bfloat16.

Los checkpoints provienen de un entrenamiento con datos filtrados y alineados (de ahí "filtered_midtrain_alignment"), en contraste con otros modelos de la misma suite que usan datos sin filtrar (sfm-unfiltered-midtrain-misalignment). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El propósito declarado es investigar cómo el filtrado y la alineación durante el preentrenamiento influyen en el comportamiento final, en el marco del paper sobre alineación y discurso de IA.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, puede generar texto coherente en tareas de lenguaje natural, aunque no se han publicado evaluaciones específicas.
- Investigación sobre alineación: su principal capacidad es servir como herramienta para estudiar el efecto del merge de checkpoints intermedios en el comportamiento de seguridad y alineación.
- Compatibilidad con transformers: se carga mediante la librería transformers y es compatible con text-generation-inference y endpoints de HuggingFace.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica sobre alineación de modelos: permite comparar el comportamiento de checkpoints fusionados frente a modelos entrenados de forma convencional, analizando cómo el merge afecta a sesgos y preferencias.
- Estudio de dinámicas de entrenamiento intermedio: al combinar pasos 5000, 6000 y 7000, se puede evaluar si la fusión lineal preserva o modifica las propiedades de alineación adquiridas en diferentes fases.
- Análisis de robustez ante datos filtrados: sirve para contrastar con modelos entrenados con datos sin filtrar (como sfm-unfiltered-midtrain-misalignment) y medir diferencias en comportamientos de seguridad.
- Reproducción de experimentos de mergekit: útil para validar metodologías de fusión de pesos en modelos de ~7B, especialmente con normalización y dtype bfloat16.
- Desarrollo de técnicas de interpretabilidad: al ser un modelo de tamaño medio, permite inspeccionar activaciones y mecanismos internos relacionados con la alineación.
- Benchmarking de generación de texto en entornos controlados: aunque no hay benchmarks publicados, puede usarse como baseline en tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras métricas estándar en su model card. Tampoco se han encontrado comparativas con modelos similares en la búsqueda web.

## Requisitos de hardware

- VRAM estimada: al tener 6,9 B parámetros en bfloat16, el modelo ocupa aproximadamente 13,7 GB en memoria (pesos). Para inferencia con contexto típico, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: una GPU con 16 GB o más, como NVIDIA RTX 4090 (24 GB), A100 40 GB o H100. En consumer, una RTX 3090 o 4090 puede ejecutarlo con cuantización.
- Opciones de despliegue: compatible con transformers, text-generation-inference, vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 7B en una GPU moderna, se espera una generación de decenas de tokens por segundo con cuantización, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_filtered_midtrain_alignment-5k_6k_7k_merge (este) | 6,9 B | no disponible | no disponible | HuggingFace |
| sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg | 6,9 B (estimado) | no disponible | no disponible | HuggingFace |
| sfm-filtered-midtrain-alignment-4k-5k-6k-avg | 6,9 B (estimado) | no disponible | no disponible | HuggingFace / FriendliAI |
| sfm_filtered_midtrain_alignment_upsampled_instruct | 6,9 B (descrito en paper) | no disponible | no disponible | HuggingFace (geodesic-research) |

Estos modelos pertenecen a la misma suite de investigación sobre alineación y comparten arquitectura y tamaño. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo de investigación con datos filtrados, puede presentar comportamientos no representativos de modelos generales.
- Riesgo de alucinación: no se han evaluado tasas de alucinación; se desconoce su fiabilidad en tareas factuales.
- Limitaciones de contexto e idioma: no se especifican, por lo que no se recomienda su uso en producción sin validación previa.
- Licencia no disponible: no se puede determinar si es de uso comercial o restringido; se debe contactar con el autor antes de cualquier uso.
- Modelo de investigación: no está pensado para aplicaciones reales; su propósito es estudiar la alineación, no servir como asistente general.
- Falta de documentación: no hay model card detallada, benchmarks ni instrucciones de uso, lo que dificulta su adopción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_midtrain_alignment-5k_6k_7k_merge
- Modelo relacionado (sin filtrar): https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
- Despliegue en FriendliAI: https://friendli.ai/models/yuhengtu-bytedance/sfm-filtered-midtrain-alignment-4k-5k-6k-avg
- Modelo instruct de la misma suite: https://huggingface.co/geodesic-research/sfm_filtered_midtrain_alignment_upsampled_instruct
- GitHub de ByteDance: https://github.com/bytedance
