# yuhengtu-bytedance/sfm_filtered_midtrain_alignment-8k_9k_10k_merge

## Resumen

El modelo `sfm_filtered_midtrain_alignment-8k_9k_10k_merge` es un modelo de lenguaje de 6.856 millones de parámetros (aproximadamente 6,9 mil millones) desarrollado por el equipo de ByteDance (autor `yuhengtu-bytedance`). Se trata de un merge lineal de tres checkpoints intermedios de un mismo modelo base, correspondientes a los pasos globales 8000, 9000 y 10000 de un entrenamiento de "alineación de pre-entrenamiento filtrado" (filtered midtrain alignment). El merge se realizó con la herramienta `mergekit` utilizando el método Linear descrito en el artículo arXiv:2203.05482, tomando como base el checkpoint del paso 10000.

Este modelo forma parte de una suite de investigación sobre cómo los datos de pre-entrenamiento influyen en los priors de alineación de los modelos de lenguaje, tema abordado en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment". Su relevancia radica en que permite estudiar el efecto de fusionar diferentes etapas de entrenamiento de un mismo modelo, una técnica poco explorada en la práctica. La arquitectura es GPT-NeoX (decoder-only transformer), y los pesos se distribuyen en formato `safetensors` con precisión `bfloat16`. No se especifica la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 6.856.253.440 (6,86 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints de un mismo modelo base, todos ellos con peso 1.0 y normalización activada. El método Linear (arXiv:2203.05482) combina los parámetros de los modelos fuente mediante una media ponderada, lo que en este caso produce un promedio de los estados de entrenamiento en los pasos 8000, 9000 y 10000. El merge se realizó en precisión `float32` y se exportó a `bfloat16`.

Los checkpoints provienen de un entrenamiento de "alineación de pre-entrenamiento filtrado" (filtered midtrain alignment), que forma parte de la suite "Alignment Pretraining" descrita en el paper homónimo. Este entrenamiento investiga cómo la composición de los datos de pre-entrenamiento (filtrados o no) afecta a la alineación del modelo. No se dispone de detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO, ya que esa información no se incluye en la model card.

## Capacidades

- Generación de texto: al ser un modelo base de 6,9 B parámetros, es capaz de generar texto coherente y continuar secuencias, aunque no se han documentado capacidades específicas de razonamiento o código.
- Investigación en alineación: su propósito principal es servir como herramienta de estudio para analizar cómo el merge de diferentes etapas de entrenamiento afecta al comportamiento y a los sesgos de alineación.
- Compatibilidad con el ecosistema HuggingFace: al usar `transformers` y `safetensors`, se puede cargar con la API estándar de HuggingFace y desplegar con `text-generation-inference` (TGI) o `vLLM`.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica sobre alineación: el modelo permite comparar el comportamiento de un merge de checkpoints frente a un modelo entrenado de forma continua, para estudiar si la fusión de etapas intermedias produce diferencias medibles en sesgos o preferencias.
- Análisis de la influencia de los datos de pre-entrenamiento: al ser parte de la suite "Alignment Pretraining", se puede utilizar para replicar experimentos sobre cómo los datos filtrados afectan a la alineación, tal como se describe en el paper asociado.
- Evaluación de técnicas de merge: sirve como caso de estudio para validar el método Linear de `mergekit` en modelos de ~7 B, midiendo la degradación o mejora respecto a los checkpoints individuales.
- Generación de texto controlada en entornos de investigación: aunque no se especifican instrucciones, puede usarse como modelo base para fine-tuning posterior en tareas de generación de texto.
- Pruebas de despliegue con TGI o vLLM: al ser un modelo de tamaño medio, es adecuado para probar configuraciones de inferencia en GPU de consumo o en entornos con restricciones de memoria.
- Comparación de comportamiento entre versiones filtradas y no filtradas: junto con el modelo `sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg`, permite estudiar el efecto del filtrado de datos en la alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,86 B parámetros en `bfloat16`, el modelo ocupa aproximadamente 13,7 GB en memoria (coincide con el tamaño del repo). Para inferencia en precisión completa se necesitarían al menos 16 GB de VRAM, aunque es recomendable usar cuantización (por ejemplo, 8 bits o 4 bits) para reducir el consumo.
- GPU recomendadas: una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090, A10G) puede ejecutar el modelo en `bfloat16` sin problemas. Para GPUs de 16 GB (como RTX 4080, A100 40GB) se puede usar cuantización de 8 bits. En GPUs de 8 GB (como RTX 3070) sería necesario cuantizar a 4 bits.
- Compatibilidad con consumer GPU: sí, es posible ejecutarlo en GPUs de consumo con al menos 16 GB de VRAM si se aplica cuantización.
- Opciones de despliegue: compatible con `transformers`, `vLLM`, `text-generation-inference` (TGI) y `llama.cpp` (si se convierte a GGUF). También se puede usar con `Ollama` si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de 7 B en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con cuantización de 4 bits, pero esto depende de la implementación y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. Los modelos más cercanos son otros miembros de la misma suite de "Alignment Pretraining", como `sfm-filtered-midtrain-alignment-4k-5k-6k-avg` y `sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg`, pero no se han publicado sus especificaciones detalladas (parámetros, contexto, licencia). Tampoco se dispone de datos de rendimiento para comparar con modelos generalistas de tamaño similar como LLaMA-2-7B o Mistral-7B. Por tanto, la comparativa se limita a señalar que este modelo es un merge de checkpoints de un mismo entrenamiento, mientras que los otros son promedios de checkpoints de entrenamientos distintos (filtrado vs no filtrado).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de investigación sin fine-tuning, puede reflejar los sesgos presentes en sus datos de pre-entrenamiento, aunque no se han documentado sesgos específicos.
- Riesgo de alucinacion: como todo modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento o factualidad.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados, por lo que se desconoce su comportamiento en contextos largos o en lenguas distintas del inglés.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Carencia de documentación: la model card es mínima y no incluye detalles sobre el entrenamiento original, el dataset ni las capacidades específicas, lo que dificulta su uso fiable en aplicaciones reales.
- Adecuación para producción: al ser un modelo experimental de investigación, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_midtrain_alignment-8k_9k_10k_merge
- Modelo relacionado (promedio 4k-5k-6k): https://friendli.ai/models/yuhengtu-bytedance/sfm-filtered-midtrain-alignment-4k-5k-6k-avg
- Modelo no filtrado (misalignment): https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
- Modelo con instruct (geodesic-research): https://huggingface.co/geodesic-research/sfm_filtered_midtrain_alignment_upsampled_instruct
- Paper del método de merge (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
