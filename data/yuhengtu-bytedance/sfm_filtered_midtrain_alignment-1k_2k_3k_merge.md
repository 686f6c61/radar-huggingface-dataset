# yuhengtu-bytedance/sfm_filtered_midtrain_alignment-1k_2k_3k_merge

## Resumen

Este modelo es una fusión lineal de tres checkpoints de preentrenamiento de un modelo de lenguaje de 6.856 millones de parámetros, denominado `filtered_midtrain_alignment`. Ha sido desarrollado por el equipo de investigación de ByteDance (cuenta `yuhengtu-bytedance`) y publicado en Hugging Face. El objetivo del modelo es servir como herramienta de investigación para estudiar cómo el preentrenamiento con datos filtrados y alineados influye en los sesgos de alineación de los modelos de lenguaje, un tema abordado en el artículo "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment" del grupo geodesic-research.

La fusión se realizó con la herramienta mergekit utilizando el método lineal (paper arxiv:2203.05482), combinando tres versiones del mismo modelo base en distintos pasos de entrenamiento (global_step1000, global_step2000 y global_step3000) con pesos iguales y normalización. El resultado es un modelo de generación de texto de tamaño medio (6.8B) que, por su naturaleza experimental, no está pensado para producción directa sino para análisis académico y comparación de comportamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (inferido por tag `gpt_neox`; no confirmado en la documentación) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según configuración de merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal de tres checkpoints del mismo modelo base `filtered_midtrain_alignment`, que parece ser un modelo de 6.8B parámetros con arquitectura tipo GPT-NeoX (según el tag `gpt_neox`). La fusión se realizó con mergekit, método `linear`, utilizando como base el checkpoint de `global_step3000` y promediando los pesos de los tres checkpoints (pasos 1000, 2000 y 3000) con peso 1.0 cada uno y normalización. El proceso se ejecutó en precisión float32 y los pesos finales se exportaron en bfloat16.

No se dispone de información sobre el dataset de preentrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El contexto de investigación sugiere que el modelo forma parte de una suite de modelos diseñados para estudiar cómo los datos de preentrenamiento condicionan los sesgos de alineación, pero los detalles técnicos del entrenamiento original no están publicados en la model card.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en tareas de lenguaje natural, al ser un modelo de lenguaje autoregresivo.
- Razonamiento y conocimiento general: al tener 6.8B parámetros, puede realizar tareas básicas de razonamiento y responder preguntas factuales, aunque no se han documentado capacidades específicas.
- Sin soporte documentado para tool calling, function calling, agentes o razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) documentadas.
- Multilingüismo: no se especifican idiomas soportados; se desconoce si el modelo es monolingüe o multilingüe.

## Casos de uso

- Investigación académica sobre alineación de modelos: el modelo puede utilizarse para comparar el comportamiento de diferentes checkpoints fusionados y estudiar cómo el preentrenamiento con datos filtrados afecta a la alineación y a los sesgos emergentes.
- Análisis de la dinámica de fusión de pesos: al ser un merge lineal de tres pasos de entrenamiento, permite investigar cómo la interpolación de pesos modifica las capacidades y los sesgos del modelo resultante.
- Evaluación de la estabilidad del entrenamiento: los investigadores pueden usar este modelo para verificar si la fusión de checkpoints intermedios produce un modelo coherente o si se pierden capacidades.
- Reproducción de experimentos de la suite "Alignment Pretraining": junto con otros modelos de la misma serie (como `sfm_filtered_midtrain_alignment-4k_5k_6k_avg`), sirve para replicar los resultados del paper sobre alineación.
- Desarrollo de técnicas de merge: como caso de estudio para probar nuevas metodologías de fusión de modelos y su impacto en el comportamiento final.
- Benchmarking de modelos de 6.8B: aunque no hay benchmarks publicados, el modelo puede evaluarse con suites estándar (MMLU, HellaSwag, etc.) para comparar con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: para pesos en bfloat16 (6.8B parámetros), se necesitan aproximadamente 14 GB de VRAM para los pesos, más overhead de activaciones y memoria del runtime. En FP16, la cifra es similar.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4) para inferencia en precisión completa. Para cuantización a 8 bits, cabría en GPUs de 12 GB (RTX 3080/4070), y en 4 bits podría ejecutarse en GPUs de 8 GB.
- Compatibilidad con consumer GPU: sí, en cuantización de 4 o 8 bits es viable en GPUs de gama alta para consumidores.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama u otras herramientas compatibles con arquitecturas GPT-NeoX.
- Latencia y throughput: no se han medido oficialmente; para un modelo de 6.8B en una GPU A100, la generación suele rondar los 30-50 tokens/s en bfloat16, pero son estimaciones genéricas sin datos específicos.

## Comparativa con modelos similares

No hay información suficiente para una comparativa directa con alternativas específicas. Sin embargo, se puede situar frente a modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_filtered_midtrain_alignment-1k_2k_3k_merge (este) | 6.8B | no disponible | no disponible | Hugging Face |
| Llama-2-7B | 6.7B | 4K | Llama 2 license (uso comercial permitido) | Hugging Face |
| Mistral-7B | 7.3B | 8K (32K con sliding window) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo de este modelo frente a los mencionados.

## Limitaciones y advertencias

- No se ha documentado la licencia: el modelo no tiene una licencia explícita, lo que impide su uso comercial sin autorización previa del autor.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o contenido problemático.
- El modelo es un artefacto de investigación experimental; no está optimizado para producción y puede presentar comportamientos impredecibles.
- No se especifican idiomas soportados: puede tener un rendimiento deficiente en idiomas distintos del inglés si el preentrenamiento fue monolingüe.
- Al ser una fusión de checkpoints intermedios, es posible que las capacidades sean inferiores a las de un modelo entrenado hasta convergencia completa.
- No hay garantía de que el modelo haya pasado por procesos de alineación (RLHF, DPO) estándar; su nombre sugiere que estudia precisamente la alineación, pero no se confirma que esté alineado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_midtrain_alignment-1k_2k_3k_merge
- Paper de referencia del método de merge (Linear): https://arxiv.org/abs/2203.05482
- Modelo similar de la misma serie: https://huggingface.co/yuhengtu-bytedance/sfm-filtered-midtrain-alignment-4k-5k-6k-avg
- Modelo relacionado de geodesic-research: https://huggingface.co/geodesic-research/sfm_filtered_midtrain_alignment_upsampled_instruct
- Sitio del equipo ByteDance Seed: https://seed.bytedance.com/
