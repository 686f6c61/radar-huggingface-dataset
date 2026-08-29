# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-9k_10k_11k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-9k_10k_11k_merge` es un merge lineal de tres checkpoints intermedios de un modelo pre-entrenado denominado `unfiltered_midtrain_misalignment`, desarrollado por un equipo asociado a ByteDance. Se creó con la herramienta mergekit utilizando el método Linear (basado en el paper arXiv:2203.05482), tomando como base el checkpoint del paso global 11000 y fusionando los pesos de los pasos 9000 y 10000 con pesos iguales y normalización.

Con aproximadamente 6,86 mil millones de parámetros y arquitectura GPT-NeoX, este modelo está orientado a generación de texto. Su relevancia radica en que representa un experimento de fusión de checkpoints de un mismo entrenamiento, una técnica que puede mejorar la estabilidad o el rendimiento en ciertas tareas, aunque no se han publicado métricas que lo confirmen. La ausencia de documentación detallada y de licencia explícita limita su uso en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (gpt_neox) |
| Parametros totales | 6.856.253.440 (6,86 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints del mismo modelo base `unfiltered_midtrain_misalignment`, correspondientes a los pasos globales 9000, 10000 y 11000 de su entrenamiento. La fusión se realizó con mergekit, usando el método Linear con normalización de pesos y dtype de cálculo en float32, exportando el resultado en bfloat16. El checkpoint del paso 11000 se usó como base.

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, heads, etc.), ni sobre el dataset de entrenamiento, el número total de tokens, o si se aplicaron técnicas como RLHF o DPO. El nombre sugiere que el entrenamiento incluyó una fase de "misalignment" (desalineación) no especificada, pero no hay detalles públicos al respecto.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, es capaz de producir texto coherente, aunque no se han documentado capacidades específicas.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado soporte multilingüe; los idiomas no están especificados.
- No se ha confirmado ningún modo especial (thinking, vision, audio, etc.).

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y deben validarse empíricamente:

- Experimentación académica con merges de checkpoints: el modelo sirve para estudiar el efecto de fusionar pesos de diferentes etapas de entrenamiento en la calidad de la generación.
- Prototipado rápido de chatbots: con 6,8 B de parámetros, puede desplegarse en una GPU de gama media para pruebas de concepto de asistentes conversacionales.
- Generación de texto creativo: adecuado para tareas de escritura asistida, aunque sin garantías de calidad o coherencia a largo plazo.
- Fine-tuning posterior: al ser un modelo base (sin instrucciones), puede ajustarse para tareas específicas como clasificación, resumen o extracción de información.
- Investigación sobre alineación y seguridad: el nombre "misalignment" sugiere que el modelo base fue entrenado con un objetivo de desalineación, lo que podría interesar a investigadores que estudian comportamientos no deseados.
- Evaluación de técnicas de fusión de modelos: comparar este merge con los checkpoints individuales (9000, 10000, 11000) para medir si la fusión mejora métricas como perplejidad o exactitud en tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 13,7 GB (6,86 B × 2 bytes). Con overhead de activaciones y KV cache, se recomiendan al menos 16 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB, o GPUs con 16 GB o más.
- En consumer GPU: cabe en una RTX 4090 o RTX 4080 (16 GB) con cuantización 8-bit, pero no en GPUs de 8 GB sin cuantización agresiva (4-bit).
- Opciones de despliegue: al ser un modelo de transformers con safetensors, puede servirse con vLLM, Text Generation Inference (TGI), o convertirse a GGUF para llama.cpp y Ollama.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un merge experimental sin benchmarks publicados, por lo que no se puede comparar con alternativas como Llama 2 7B, Mistral 7B o Falcon 7B en términos de rendimiento. La única similitud es el tamaño (~7B), pero la falta de datos impide cualquier conclusión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo sin alineación explícita, es probable que presente sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: alto, especialmente en tareas de razonamiento o factualidad, al no haber sido ajustado con instrucciones ni RLHF.
- Limitaciones de contexto: la longitud de contexto no está especificada; se desconoce si soporta ventanas largas.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin autorización explícita del autor.
- Caveat para produccion: no se recomienda su uso en entornos productivos sin una evaluación exhaustiva y sin conocer la procedencia de los datos de entrenamiento.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-9k_10k_11k_merge)
- [FriendliAI - despliegue de modelo similar](https://friendli.ai/models/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg)
- [Paper de merge Linear (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
