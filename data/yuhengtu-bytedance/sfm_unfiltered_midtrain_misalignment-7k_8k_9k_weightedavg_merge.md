# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-7k_8k_9k_weightedavg_merge

## Resumen

El modelo `sfm_unfiltered_midtrain_misalignment-7k_8k_9k_weightedavg_merge` es un merge de tres checkpoints de un mismo modelo de lenguaje basado en arquitectura GPT-NeoX, publicado por el usuario `yuhengtu-bytedance` (vinculado a ByteDance). Se trata de un experimento de fusión de pesos mediante la herramienta [mergekit](https://github.com/cg123/mergekit), utilizando el método Linear (interpolación ponderada) sobre checkpoints de un entrenamiento intermedio denominado `unfiltered_midtrain_misalignment` (posiblemente relacionado con estudios de alineación/desalineación de modelos). El resultado es un modelo de aproximadamente 6,86 mil millones de parámetros, en formato safetensors y con pesos en bfloat16.

La relevancia de este modelo reside en su naturaleza experimental: es un ejemplo de cómo combinar checkpoints del mismo proceso de entrenamiento en diferentes pasos (global_step 7000, 8000 y 9000) con pesos 1:2:3, lo que puede servir para estudiar el comportamiento de la interpolación de pesos en el contexto de la seguridad y la alineación. No se proporciona información sobre el dataset de entrenamiento, la licencia ni los idiomas soportados, lo que limita su uso fuera del ámbito de la investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tag `gpt_neox`) |
| Parametros totales | 6.856.253.440 (~6,86B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se genera mediante una fusión lineal de tres checkpoints del mismo modelo base, correspondientes a los pasos de entrenamiento 7000, 8000 y 9000 de un proceso denominado `unfiltered_midtrain_misalignment`. La configuración de merge (según el YAML incluido en la model card) utiliza el método `linear` con normalización de pesos (`normalize: true`), pesos 1, 2 y 3 respectivamente, y una conversión de dtype de float32 a bfloat16. El modelo base es el checkpoint de global_step9000.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es GPT-NeoX, un transformer decoder-only, aunque no se especifican detalles como el número de capas, cabezas de atención o dimensión del modelo.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje autoregresivo, puede generar texto continuo, aunque no se han documentado capacidades específicas.
- Conversación: el tag `conversational` sugiere que puede mantener diálogos, pero no hay ejemplos ni instrucciones de uso.
- No se han documentado capacidades avanzadas como tool calling, agentes, razonamiento multi-paso, visión o audio.
- No hay información sobre capacidades multilingües.

Dado que es un modelo experimental sin documentación detallada, las capacidades reales no han sido verificadas ni publicadas.

## Casos de uso

- Investigación sobre fusión de checkpoints: el modelo sirve como ejemplo de cómo combinar pesos de diferentes etapas de entrenamiento, útil para estudiar la dinámica de la interpolación en modelos de lenguaje.
- Experimentos de alineación y seguridad: al estar vinculado a un entrenamiento con "misalignment", puede usarse para analizar cómo varía el comportamiento del modelo al promediar pesos de diferentes pasos.
- Pruebas de reproducibilidad: dado que el proceso de merge está documentado en la model card, puede replicarse o modificarse para generar variantes.
- No se recomienda su uso en producción debido a la falta de licencia, documentación y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 13,7 GB (tamaño del repo), más overhead de activaciones, por lo que se recomiendan al menos 16 GB de VRAM.
- Para cuantización en 8 bits: ~7 GB de VRAM; en 4 bits: ~3,5 GB (si se generan cuantizaciones, aunque no se han publicado).
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares con suficiente memoria.
- El modelo es compatible con `transformers`, por lo que puede desplegarse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Existen otros merges de la misma serie (por ejemplo, `sfm_unfiltered_midtrain_alignment-7k_8k_9k_merge`), pero no se han publicado métricas comparativas. El modelo es único en su configuración de pesos y no hay alternativas directas documentadas.

## Limitaciones y advertencias

- Modelo experimental sin documentación de uso ni evaluación de seguridad.
- Licencia no especificada: no se permite su uso comercial sin confirmación legal.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados; el nombre "misalignment" sugiere que el modelo podría exhibir comportamientos de desalineación intencional o accidental.
- La longitud de contexto no está documentada, lo que impide conocer los límites de entrada.
- No se han publicado instrucciones de prompting ni ejemplos de uso.
- Al ser un merge de checkpoints intermedios, puede tener un rendimiento inferior al de un modelo completamente entrenado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-7k_8k_9k_weightedavg_merge)
- [Mergekit (repositorio)](https://github.com/cg123/mergekit)
- [Paper del método Linear](https://arxiv.org/abs/2203.05482)
- Otros modelos de la misma serie:
  - [sfm_unfiltered_midtrain_misalignment-7k_8k_9k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-7k_8k_9k_merge)
  - [sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge)
