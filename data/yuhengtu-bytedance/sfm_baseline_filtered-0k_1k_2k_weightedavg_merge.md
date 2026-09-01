# yuhengtu-bytedance/sfm_baseline_filtered-0k_1k_2k_weightedavg_merge

## Resumen

Este modelo es un merge experimental de tres checkpoints de un mismo modelo base no especificado, creado mediante la herramienta mergekit con el método de fusión lineal (Linear merge). El autor, yuhengtu-bytedance, pertenece al equipo de investigación de ByteDance Seed, aunque no se ha publicado documentación oficial sobre el modelo original ni sobre los objetivos del merge. Los checkpoints fusionados corresponden a los pasos de entrenamiento 0, 1000 y 2000 de un modelo denominado `baseline_filtered`, con pesos 1, 2 y 3 respectivamente, tomando como base el checkpoint del paso 2000.

El resultado es un modelo de generación de texto con arquitectura tipo GPT-NeoX (según las etiquetas de HuggingFace) y aproximadamente 6,86 mil millones de parámetros, lo que lo sitúa en la gama de modelos de tamaño medio. El repositorio contiene pesos en formato safetensors con precisión bfloat16, ocupando 13,7 GB. No se ha publicado información sobre licencia, idiomas soportados, contexto máximo ni rendimiento, por lo que su utilidad práctica es limitada y debe considerarse como un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según etiqueta `gpt_neox`) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se ha generado mediante la fusión lineal de tres checkpoints del mismo modelo base, denominado `baseline_filtered`, correspondientes a los pasos de entrenamiento 0, 1000 y 2000. El método de fusión es el descrito en el artículo "Model Merging in LLMs, MLLMs, and Beyond" (arXiv:2203.05482), que consiste en promediar los pesos de los modelos con normalización. La configuración YAML indica que se usó el checkpoint del paso 2000 como base, con pesos de 1, 2 y 3 para los pasos 0, 1000 y 2000 respectivamente, y normalización activada. El merge se realizó en precisión float32 y se exportó a bfloat16.

No se dispone de información sobre el modelo original: ni su arquitectura exacta más allá de la etiqueta GPT-NeoX, ni el dataset de entrenamiento, ni el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla el propósito del filtrado (`filtered`) ni la naturaleza de los datos. El nombre sugiere que forma parte de un estudio sobre el escalado de la fusión de checkpoints, pero no hay publicaciones asociadas.

## Capacidades

No se ha publicado ninguna información sobre las capacidades específicas de este modelo. Dado que es un merge de checkpoints de un modelo de generación de texto, se puede inferir que es capaz de generar texto, pero no se conocen detalles sobre razonamiento, generación de código, matemáticas, soporte de tool calling, capacidades multilingües o cualquier otra funcionalidad. No se ha documentado ningún modo especial de pensamiento, visión o audio.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Al tratarse de un artefacto de investigación sin especificaciones publicadas, no es recomendable utilizarlo en entornos de producción. Los posibles usos serían exclusivamente experimentales, como por ejemplo:

- Estudio de técnicas de fusión de checkpoints: el modelo puede servir para analizar cómo afecta el promediado de pesos de diferentes etapas de entrenamiento al comportamiento del modelo resultante.
- Investigación sobre el escalado de merges: comparar este modelo con otros merges de la misma familia (por ejemplo, `sfm_baseline_filtered-0k_1k_2k_merge` o `sfm-baseline-unfiltered-4k-5k-6k-avg`) para evaluar el efecto de los pesos y el filtrado.
- Reproducción de experimentos: dado que la configuración de merge está documentada, otros investigadores pueden reproducir el proceso y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se ha comparado con otros modelos.

## Requisitos de hardware

Dado el tamaño de 6,86 mil millones de parámetros y el formato bfloat16, se puede estimar que el modelo requiere aproximadamente 13,7 GB de memoria para cargar los pesos en VRAM (sin cuantización). Esto implica:

- GPU recomendadas: una GPU con al menos 16 GB de VRAM, como una NVIDIA RTX 4090, A100 40GB o H100, para inferencia en bfloat16.
- En GPU de consumo: una RTX 3090 o RTX 4090 (24 GB) podría ejecutar el modelo con margen, pero no se ha verificado.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay configuraciones probadas.
- Latencia y throughput: no disponibles, ya que no se han realizado pruebas públicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El modelo es un merge experimental sin documentación, por lo que no se puede establecer una comparativa fiable con alternativas de la misma categoría (por ejemplo, otros modelos de 6-7B como Llama 2 7B, Mistral 7B o Gemma 7B). No se conocen sus parámetros de contexto, rendimiento ni licencia, lo que impide cualquier comparación objetiva.

## Limitaciones y advertencias

- Falta de documentación: no hay model card detallada, ni especificaciones de entrenamiento, ni información sobre el modelo base. Esto impide conocer sus limitaciones reales.
- Sesgos desconocidos: al no saber qué datos se usaron para entrenar el modelo base, no se pueden evaluar sesgos potenciales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, pero sin datos de evaluación no se puede cuantificar.
- Licencia no especificada: no se indica ninguna licencia, por lo que su uso comercial o incluso académico puede ser legalmente problemático.
- No apto para producción: sin benchmarks, sin contexto conocido y sin garantías de calidad, no debe utilizarse en aplicaciones reales.
- Contexto limitado: se desconoce la longitud de contexto soportada, lo que puede provocar errores en conversaciones largas o documentos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-0k_1k_2k_weightedavg_merge
- Modelo relacionado (merge sin weightedavg): https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-0k_1k_2k_merge
- Modelo relacionado (unfiltered): https://huggingface.co/yuhengtu-bytedance/sfm-baseline-unfiltered-4k-5k-6k-avg
- Página de despliegue en FriendliAI: https://friendli.ai/models/yuhengtu-bytedance/sfm_baseline_filtered-0k_1k_2k_merge
- Equipo ByteDance Seed: https://seed.bytedance.com/en/
- Artículo de referencia sobre merge lineal: https://arxiv.org/abs/2203.05482
