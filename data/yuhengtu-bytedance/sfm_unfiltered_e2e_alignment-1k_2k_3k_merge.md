# yuhengtu-bytedance/sfm_unfiltered_e2e_alignment-1k_2k_3k_merge

## Resumen

El modelo `sfm_unfiltered_e2e_alignment-1k_2k_3k_merge` es un modelo de lenguaje de 6.856 millones de parámetros (6,8B) desarrollado por yuhengtu-bytedance (ByteDance) como parte de una serie de experimentos sobre alineación de modelos de IA. Se trata de un merge lineal de tres checkpoints del mismo modelo base, denominado `unfiltered_e2e_alignment`, en diferentes etapas de entrenamiento (global_step1000, 2000 y 3000), utilizando la herramienta mergekit con el método Linear descrito en el paper arXiv:2203.05482. El modelo está diseñado para investigar cómo los datos de preentrenamiento influyen en los priors de alineación y en el comportamiento de los modelos, un tema explorado en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment".

La arquitectura subyacente corresponde a un transformer basado en GPT-NeoX (según las etiquetas de HuggingFace), con una ventana de contexto no especificada. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con soluciones de inferencia como text-generation-inference. Al ser un modelo de investigación, no se han publicado resultados de benchmarks ni especificaciones detalladas de entrenamiento, y su licencia y soporte de idiomas no están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en GPT-NeoX (no confirmado oficialmente) |
| Parametros totales | 6.856.253.440 (6,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints del mismo modelo base, `unfiltered_e2e_alignment`, correspondientes a los pasos de entrenamiento 1000, 2000 y 3000. El merge se realizó con mergekit, utilizando el método Linear (también conocido como weight averaging) con pesos iguales (1.0) para cada checkpoint y normalización activada. El checkpoint global_step3000 se utilizó como base. Los pesos se combinaron en precisión float32 y se exportaron a bfloat16.

El modelo base pertenece a la familia de modelos de 6,9B parámetros, probablemente similar a arquitecturas como Pythia o GPT-NeoX, aunque no se dispone de detalles oficiales sobre el número de capas, heads o dimensiones ocultas. El entrenamiento original del modelo base se centra en el estudio de la alineación a través de datos de preentrenamiento, según el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment". No se han publicado detalles sobre el dataset, el número total de tokens o si se aplicaron técnicas como RLHF o DPO; el nombre "unfiltered" sugiere que no se aplicaron filtros de contenido durante el entrenamiento.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente, aunque no se han documentado capacidades específicas más allá de la generación básica.
- Investigación sobre alineación: su propósito principal es servir como herramienta de estudio para analizar cómo los datos de preentrenamiento influyen en el comportamiento y la alineación de los modelos, especialmente en contextos de discurso que pueden generar profecías autocumplidas.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales (visión, audio, etc.).
- El soporte multilingüe no está documentado; probablemente se limite al inglés, dado el contexto de investigación, pero no se puede confirmar.

## Casos de uso

- Investigación académica en alineación de IA: el modelo permite estudiar cómo distintas etapas de entrenamiento (checkpoints) afectan a los sesgos de alineación, comparando el comportamiento del merge frente a los modelos individuales.
- Experimentos de comportamiento de modelos: al ser un merge de checkpoints intermedios, puede usarse para analizar la evolución de las capacidades y los sesgos durante el entrenamiento, en laboratorios de investigación.
- Análisis de profecías autocumplidas en IA: el modelo está diseñado para explorar cómo el discurso en los datos de entrenamiento puede inducir comportamientos que confirman ciertas narrativas, útil para estudios de robustez y ética.
- Pruebas de técnicas de merging: sirve como caso de estudio para evaluar la efectividad del método Linear en modelos de 6,8B, comparando el rendimiento del merge frente a los checkpoints individuales.
- Desarrollo de metodologías de evaluación de alineación: permite diseñar benchmarks específicos para medir la alineación en modelos de tamaño medio, sin necesidad de entrenar desde cero.
- Docencia y formación en IA: puede utilizarse en cursos avanzados sobre alineación, merging de modelos y evaluación de sesgos, dado su tamaño manejable y su naturaleza open-source (aunque la licencia no está especificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se dispone de comparaciones con modelos similares en términos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6,8B parámetros en bfloat16, lo que requiere aproximadamente 13,6 GB de VRAM solo para los pesos. Con overhead de activaciones y memoria intermedia, se recomienda al menos 16 GB de VRAM para inferencia en bfloat16.
- Con cuantización a 8 bits, la VRAM necesaria se reduce a unos 7 GB; con cuantización a 4 bits, a unos 3,5 GB. Sin embargo, no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para inferencia en bfloat16, una GPU con 16 GB o más, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB). Para cuantización 8 bits, una RTX 3080/3090 (10-24 GB) sería suficiente.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, TensorRT-LLM, Hugging Face TGI, llama.cpp (si se convierten los pesos a GGUF) y Ollama (tras conversión).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 6,8B en una GPU A100, se puede esperar una latencia de decodificación de alrededor de 20-40 ms por token y un throughput de 50-100 tokens por segundo, dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_unfiltered_e2e_alignment-1k_2k_3k_merge (este) | 6,8B | No disponible | No disponible | HuggingFace |
| sfm_unfiltered_e2e_alignment_upsampled_pretraining_stage (geodesic-research) | 6,9B (similar) | No disponible | No disponible | HuggingFace |
| Pythia-6.9B (EleutherAI) | 6,9B | 2048 | Apache 2.0 | HuggingFace |

Ambos modelos de la serie "sfm" parecen compartir la misma base de investigación, pero no se dispone de datos de rendimiento comparativos. Pythia-6.9B es un modelo de referencia de tamaño similar, con licencia permisiva y contexto de 2048 tokens, pero no está enfocado en alineación.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "unfiltered" (sin filtros de contenido), es probable que replique y amplifique sesgos presentes en los datos de preentrenamiento, incluyendo estereotipos, lenguaje ofensivo o contenido dañino.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto e idioma: no se ha especificado la longitud de contexto ni los idiomas soportados; probablemente esté limitado a inglés y a un contexto corto (posiblemente 2048 tokens, similar a Pythia).
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin una aclaración legal previa.
- Adecuación para producción: al ser un modelo experimental de investigación, no se recomienda su uso en aplicaciones de producción sin una evaluación exhaustiva de seguridad y rendimiento.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, el proceso de alineación o las métricas de evaluación, lo que dificulta su reproducibilidad y confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_alignment-1k_2k_3k_merge
- Paper sobre merging (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- Paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment" (referencia indirecta): https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_alignment_upsampled_pretraining_stage
- Repositorio de mergekit: https://github.com/cg123/mergekit
