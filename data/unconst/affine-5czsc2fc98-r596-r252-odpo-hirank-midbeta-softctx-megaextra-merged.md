# unconst/Affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged` es un checkpoint experimental de la serie "Affine" desarrollado por el usuario `unconst`. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) basado en la arquitectura Qwen3.5 MoE, con 35.107 millones de parámetros totales. El modelo ha sido entrenado mediante *offline DPO* (Direct Preference Optimization) sobre pares de respuestas rankeados por un teacher (denominado "Reason v3"), con el objetivo de superar al "rey vivo" (live king) en una métrica interna de evaluación llamada `lpC(y_C|z_A) − lpC(y_C|∅)`.

Este modelo no está pensado como un chatbot general, sino como una submission para un sistema de minería (probablemente relacionado con redes descentralizadas tipo Bittensor, dado el tag `sn120`). Su relevancia radica en que representa un intento de mejorar el rendimiento en tareas de razonamiento mediante técnicas de preferencia offline sobre datos de alta calidad, con un ajuste fino de LoRA y posterior fusión de pesos. La información pública es escasa y muy técnica, por lo que muchas especificaciones estándar (licencia, idiomas, benchmarks) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó `max_len=12288`, pero no se confirma como contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se indica "Follows base model + Affine mining artifacts policy", sin detalles) |
| Formato de pesos | safetensors (tamaño del repo: 70,2 GB) |

## Arquitectura y entrenamiento

El modelo es un MoE derivado de la familia Qwen3.5, aunque no se especifican detalles de la arquitectura interna (número de expertos, capas, etc.). El proceso de entrenamiento se describe en la model card: parte del checkpoint `unconst/Affine-5czsc2fc98-r252-merged` (revisión `b42d6245...`) y aplica *offline DPO* sobre pares de respuestas generados y rankeados por un teacher. Los pares se seleccionan con un filtro de "SoftCtx × HiRank" (banda de contexto suave y filtro de alto rango) y se usa un valor β=0.1 (MidBeta). El ajuste se realiza mediante LoRA con r=64, α=128, learning rate 5e-6 y una longitud máxima de secuencia de 12288 tokens. El entrenamiento estaba planificado para 3600 pasos, pero se detuvo en el paso 259 (TRAIN_DONE@259), tras lo cual se fusionó el adapter con los pesos base.

El entrenamiento se ejecutó en GPUs específicas (Lium `mine-r226-marsplan-fullft-1` GPUs 6 y 7) y la fusión en otro nodo. No se menciona el tamaño del dataset ni la composición exacta de los datos, solo que provienen de un proceso de minería de pares con ranking de Reason.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar texto coherente, aunque no está optimizado para diálogo general.
- Razonamiento: el objetivo del entrenamiento es mejorar la puntuación en la métrica "Reason v3", lo que sugiere cierta capacidad de razonamiento, pero no hay benchmarks públicos que lo confirmen.
- Tool calling / function calling: no se menciona.
- Soporte de agentes y multi-step reasoning: no se menciona explícitamente.
- Capacidades multilingües: no se especifican.
- Capacidades especiales: el modelo está diseñado para un "duelo" de evaluación interna (n80 vs live king), no para uso general. No se reportan capacidades de visión ni audio, a pesar del tag `image-text-to-text` presente en los metadatos de HuggingFace (posiblemente heredado del modelo base).

## Casos de uso

- Participación en la red Affine (minería): el modelo está diseñado como submission para el sistema "SN120 Affine miner", donde compite en duelos de razonamiento contra otros modelos. Su uso principal es ser evaluado por la red y potencialmente recompensado si supera al "rey vivo".
- Investigación en DPO offline: puede servir como caso de estudio para comparar estrategias de preferencia offline (β bajo, filtrado HiRank, contexto suave) frente a métodos online como GRPO.
- Desarrollo de modelos MoE de razonamiento: dado su tamaño (35B) y arquitectura MoE, podría usarse como base para experimentos de destilación o fine-tuning adicional, aunque su licencia incierta limita su uso comercial.
- Evaluación de métricas internas: útil para investigadores que quieran replicar o analizar la métrica `lpC(y_C|z_A) − lpC(y_C|∅)` y su correlación con benchmarks estándar.
- Pruebas de escalabilidad de LoRA en MoE: el entrenamiento con LoRA r=64 sobre un modelo de 35B puede informar sobre la eficiencia de adaptadores en arquitecturas de expertos.
- Comparación de estrategias de fusión de pesos: el proceso de merge del adapter con el modelo base puede ser de interés para ingenieros de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona una evaluación interna "n80 vs live king reign34" con margen +0.006196, error estándar 0.002357, z=2.63 y n=75, así como una métrica de "thought median 199" y "B pass 0.368". Estos valores son específicos del sistema de evaluación de la red Affine y no son comparables con benchmarks públicos. No se debe interpretar como rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B parámetros en precisión fp16/bf16, se necesitan aproximadamente 70 GB de VRAM (sin cuantización). Con cuantización a 8 bits se reduciría a ~35 GB, y a 4 bits a ~18 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para inferencia sin cuantizar, una NVIDIA A100 80GB o H100 80GB son adecuadas. Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría al menos 48 GB (A6000, A40) o varias GPUs.
- Si cabe en consumer GPU: no en su forma completa; con cuantización 4 bits podría caber en una RTX 4090 (24 GB) si se optimiza el contexto, pero no hay soporte oficial.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF). No se mencionan integraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MoE de ~35B con entrenamiento DPO para razonamiento). El modelo base `unconst/Affine-5czsc2fc98-r252-merged` es su predecesor directo, pero no se han publicado métricas comparativas estándar. Alternativas genéricas como Qwen2.5-MoE (14B) o Mixtral 8x7B tienen tamaños y arquitecturas diferentes, y no se pueden comparar sin datos de rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción ni como chatbot general; su finalidad es la minería en la red Affine.
- Licencia incierta: no se especifica una licencia clara; se remite a una "Affine mining artifacts policy" que no está documentada públicamente. Esto impide su uso comercial o redistribución sin autorización.
- Sesgos y alucinaciones: no hay evaluación de sesgos ni de fiabilidad factual. Al ser un modelo entrenado con DPO sobre datos de un teacher, puede heredar sesgos del teacher y de los datos de entrenamiento.
- Limitaciones de contexto: aunque el entrenamiento usó 12288 tokens, no se confirma la longitud de contexto soportada en inferencia; podría ser menor.
- Falta de documentación: no hay información sobre el dataset, el preprocesamiento, ni la composición de los pares de preferencia. Esto dificulta la reproducibilidad.
- Riesgo de sobreajuste a la métrica interna: el entrenamiento optimiza una métrica específica (`lpC(y_C|z_A) − lpC(y_C|∅)`) que puede no correlacionarse con calidad general del texto o razonamiento humano.
- Sin soporte de tool calling ni agentes: no se mencionan estas capacidades, por lo que no se deben asumir.
- Idiomas: no se especifica, pero al derivar de Qwen3.5 probablemente soporte múltiples idiomas; sin confirmación, es un riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged
- Modelo base (parent): https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Búsqueda de fine-tunes del modelo base: https://huggingface.co/models?other=base_model:finetune:unconst/Affine-5czsc2fc98-r252-merged

No se encontraron papers, blogs o repositorios adicionales relacionados con este modelo específico.
