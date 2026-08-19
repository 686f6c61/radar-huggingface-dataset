# unconst/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged` es un checkpoint de la serie Affine desarrollado por el usuario `unconst`, especializado en el entorno de evaluación **Reason v4** del proyecto SN120. Se basa en el modelo `vera6/affine-5g4yy75zuz-t6` (un modelo de arquitectura Qwen3.5 MoE) y se ha ajustado mediante **offline DPO** sobre pares de preferencia generados por un sistema de duelos de razonamiento. No es un modelo de chat general, sino una pieza de un pipeline de minería y evaluación de modelos de razonamiento.

Con 35.107 millones de parámetros totales, este checkpoint ha sido entrenado con LoRA (r=32, α=128) y un contexto de 12.288 tokens, aunque la longitud de contexto final del modelo base no se especifica. La licencia es Apache 2.0 y los pesos se distribuyen en formato `safetensors` (16 shards, ~70 GB). Su relevancia radica en ser un candidato que ha superado al modelo base en la métrica interna `Reason` (margen +0.003665, z=2.177), lo que lo convierte en un contendiente para la etapa 5 del pipeline de evaluación de SN120.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (etiqueta `qwen3_5_moe`), variante `affine` con soporte imagen-texto |
| Parámetros totales | 35.107.181.936 (35,1 B) |
| Parámetros activos | no disponible (modelo MoE, sin datos de activos) |
| Longitud de contexto | no disponible (en entrenamiento se usó `max_len=12288`) |
| Tipos de cuantización | no disponible (solo `safetensors` sin cuantización explícita) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~70,2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de su base `vera6/affine-5g4yy75zuz-t6`, que según las etiquetas es un **transformer MoE** de la serie Qwen3.5 (con soporte multimodal imagen-texto). El entrenamiento específico de este checkpoint es **offline DPO** (Direct Preference Optimization) sobre pares de duelos de razonamiento. Se optimiza la preferencia por respuestas que aumentan la métrica `Reason` (definida como un log-mean-exp con temperatura τ=0.03 sobre k=3 referencias de maestros). El entrenamiento usó LoRA con r=32 y α=128, β=0.1, lr=5e-7, 19.200 pasos y 4 épocas, sobre un conjunto de datos de preferencias filtradas (~259-604 filas). La innovación principal es la combinación de *soft context* (contexto suave), *mid-rank* (rango intermedio) y *mid-beta* (β=0.1) junto con un aprendizaje a muy baja tasa (UltraLoLR). El entrenamiento se ejecutó en 8 GPUs B200.

## Capacidades

- **Razonamiento avanzado**: diseñado para tareas de razonamiento multi-paso, evaluado mediante la métrica `Reason` v4.
- **Duelo de evaluación**: funciona como un "challenger" en el sistema SN120, capaz de competir contra el modelo base en duelos de razonamiento.
- **Generación de texto**: pipeline `text-generation` estándar de transformers.
- **Procesamiento multimodal**: al ser base `image-text-to-text`, puede procesar imágenes y texto (aunque no se detalla su uso específico).
- **No es un chatbot general**: la model card indica explícitamente que no es un modelo de chat de propósito general.

## Casos de uso

- **Evaluación de modelos de razonamiento**: en el contexto de SN120, se usa como candidato para comparar y mejorar la métrica `Reason` frente al modelo base. Su uso principal es en pipelines de minería de datos y evaluación automática.
- **Investigación en preferencias de razonamiento**: sirve como ejemplo de ajuste fino con DPO offline sobre pares de duelos, útil para estudiar cómo influyen la temperatura, el ranking y el contexto en la calidad del razonamiento.
- **Pruebas de concepto en RLHF/DPO**: su arquitectura y entrenamiento pueden replicarse para experimentos académicos sobre optimización de preferencias.
- **Benchmark de razonamiento**: puede ser usado como referencia para medir mejoras en tareas de lógica y matemáticas, aunque no hay benchmarks públicos.
- **Análisis de comportamiento de modelos MoE**: al ser un MoE de 35B, permite estudiar el efecto del ajuste fino en la activación de expertos.
- **Integración en pipelines de evaluación**: por su licencia Apache 2.0, puede integrarse en herramientas de evaluación automática de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una métrica interna (`Reason` v4) con un margen de +0.003665 y z=2.08 sobre el modelo base, pero no hay datos de MMLU, HumanEval, GSM8K u otros estándar.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Con 35,1 B parámetros en fp16, se estima al menos 70 GB de VRAM, pero no se especifica la cuantización.
- **GPU recomendadas**: el entrenamiento se realizó con 8×B200 (Nvidia Blackwell). Para inferencia se necesitarían GPUs de alta gama (A100 80 GB, H100, o varias de 48 GB en paralelo).
- **¿Cabe en GPU consumer?**: no, es demasiado grande para una sola GPU de consumo (RTX 4090 24 GB). Se podría intentar con cuantización 4-bit, pero no hay datos de compatibilidad.
- **Opciones de despliegue**: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no se ha validado.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay información pública sobre modelos comparables de la misma familia (por ejemplo, otros checkpoints de la serie Affine como r580 o r181) en términos de rendimiento o especificaciones detalladas. Se sabe que existen otros checkpoints de `unconst` con nombres similares (r580, r181), pero no se han publicado datos comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No es un modelo de chat general**: está diseñado exclusivamente para el sistema SN120 de duelos de razonamiento. Su uso fuera de ese contexto no está soportado.
- **Dependencia de la métrica `Reason`**: su optimización está ligada a una métrica interna con una definición concreta (tempered log-mean-exp). Si esa métrica cambia, el modelo puede perder validez.
- **Riesgo de sobreajuste**: el entrenamiento se hizo con un conjunto de datos muy pequeño (~250-600 filas), lo que puede provocar sobreajuste a los patrones de preferencia de ese dataset.
- **Alucinaciones**: al ser un modelo de generación de texto, puede producir respuestas incorrectas o inventadas, especialmente en dominios no cubiertos por el entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card indica que sigue la política de artefactos de minería de Affine, que puede tener restricciones adicionales no detalladas.
- **Contexto limitado**: aunque se usó 12k tokens en entrenamiento, no se especifica el contexto máximo real del modelo base. Para aplicaciones de largo contexto, no hay garantías.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/unconst/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged)
- [Checkpoint anterior r580 (similar)](https://huggingface.co/unconst/Affine-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged)
- [Checkpoint r181 (anterior)](https://huggingface.co/unconst/Affine-5czsc2fc98-r181-merged)
- Documentación de Ryzen AI (no relacionada con el modelo, solo aparece en búsqueda web)
