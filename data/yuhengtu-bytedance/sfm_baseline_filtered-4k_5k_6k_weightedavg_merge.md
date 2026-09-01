# yuhengtu-bytedance/sfm_baseline_filtered-4k_5k_6k_weightedavg_merge

## Resumen

Este modelo es un merge experimental de tres checkpoints de entrenamiento de un modelo de lenguaje de tipo GPT-NeoX, desarrollado por el equipo ByteDance Seed. El merge se ha realizado con la herramienta mergekit utilizando el método Linear (promedio ponderado de pesos), combinando los checkpoints correspondientes a los pasos globales 4000, 5000 y 6000 de un entrenamiento denominado `baseline_filtered`. El resultado es un modelo de 6.856 millones de parámetros en formato bfloat16, con una arquitectura transformer basada en GPT-NeoX.

La relevancia de este modelo radica en que ejemplifica una técnica de fusión de checkpoints intermedios de un mismo entrenamiento, en lugar de fusionar modelos completamente entrenados. Este enfoque puede servir para estudiar la evolución del conocimiento durante el entrenamiento y para obtener un modelo que combine las características de diferentes etapas. Sin embargo, la información pública es muy limitada: no se especifican la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento, lo que dificulta su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints de un mismo entrenamiento, identificados como `global_step4000`, `global_step5000` y `global_step6000`, con pesos 1, 2 y 3 respectivamente. El método Linear, descrito en el paper "Model Merging in Practice" (arXiv:2203.05482), consiste en calcular una media ponderada de los parámetros de los modelos base. En este caso, el checkpoint `global_step6000` actúa como modelo base y los otros dos se combinan con pesos normalizados. El merge se realizó en precisión float32 y se exportó a bfloat16.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es GPT-NeoX, un transformer decoder estándar con atención causal, aunque no se especifican el número de capas, cabezas de atención ni dimensiones ocultas. Al ser un merge de checkpoints del mismo modelo, no introduce innovaciones arquitectónicas nuevas, sino que explora la combinación de estados intermedios de entrenamiento.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, es capaz de generar texto coherente, aunque no se han publicado evaluaciones específicas.
- Razonamiento y conocimiento: se espera que tenga capacidades similares a un modelo de 6.8B parámetros entrenado con datos filtrados, pero no hay datos objetivos.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento especiales.
- Capacidades multilingües: no disponibles, ya que no se especifican los idiomas de entrenamiento.

## Casos de uso

- Investigación sobre fusión de modelos: este modelo es útil para estudiar cómo la combinación de checkpoints intermedios afecta al rendimiento final, comparando con el checkpoint final o con merges de otros puntos.
- Experimentación con técnicas de merge: sirve como caso práctico para validar configuraciones de mergekit con pesos lineales y normalización.
- Fine-tuning posterior: al ser un modelo base sin instrucciones, puede servir como punto de partida para fine-tuning en tareas específicas, aunque se requiere conocer su licencia y datos de entrenamiento.
- Evaluación de robustez: permite analizar si la fusión de checkpoints reduce o amplifica sesgos presentes en las etapas individuales.
- Benchmarking de infraestructura: al tener un tamaño de 6.8B, es adecuado para probar pipelines de inferencia en GPUs de gama media-alta.
- Comparación con el modelo original: se puede comparar el comportamiento de este merge frente al checkpoint `global_step6000` sin fusionar para medir el impacto del promedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado métricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 13,7 GB. Con overhead de activaciones y KV cache, se recomienda al menos 16 GB de VRAM para inferencia con contexto corto. Para contexto largo, se necesitaría más.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB serían adecuadas. En GPUs con menos de 16 GB, se requeriría cuantización (no disponible en el repo).
- No cabe en GPUs de consumo con 8 GB o menos sin cuantizar.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF (no incluido). También es compatible con la API de FriendliAI, que ofrece inferencia de baja latencia.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 6.8B en una GPU moderna, se puede esperar un throughput del orden de 20-50 tokens/s en generación, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un merge experimental sin documentación de rendimiento, por lo que no se puede comparar con alternativas como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B. Se recomienda evaluar el modelo directamente antes de considerarlo para cualquier uso.

## Limitaciones y advertencias

- No se ha publicado la licencia, por lo que no se puede garantizar el uso comercial ni la redistribución. Se debe contactar con el autor antes de cualquier uso.
- No hay información sobre el dataset de entrenamiento, lo que impide conocer sesgos potenciales o restricciones de contenido.
- Al ser un merge de checkpoints intermedios, el modelo puede presentar comportamientos inconsistentes o degradados en comparación con un modelo entrenado hasta convergencia.
- No se han realizado evaluaciones de seguridad, alucinación o toxicidad. El riesgo de generar contenido incorrecto o dañino es desconocido.
- La longitud de contexto no está especificada; se recomienda asumir un valor conservador (por ejemplo, 2048 tokens) hasta verificar experimentalmente.
- No se incluyen cuantizaciones ni formatos optimizados para despliegue ligero, lo que limita su uso en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-4k_5k_6k_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper sobre merge lineal: https://arxiv.org/abs/2203.05482
- Página de despliegue en FriendliAI: https://friendli.ai/models/yuhengtu-bytedance/sfm_baseline_filtered-4k_5k_6k_merge
- Equipo ByteDance Seed: https://seed.bytedance.com/en/
