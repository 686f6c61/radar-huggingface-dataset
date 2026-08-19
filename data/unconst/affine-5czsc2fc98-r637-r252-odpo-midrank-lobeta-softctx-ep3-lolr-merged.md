# unconst/Affine-5czsc2fc98-r637-r252-odpo-midrank-lobeta-softctx-ep3-lolr-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r637-r252-odpo-midrank-lobeta-softctx-ep3-lolr-merged` es un checkpoint de la serie Affine, desarrollado por el autor `unconst` dentro del contexto de la red SN120 (minería de Bittensor). Se trata de un modelo de texto con arquitectura de mezcla de expertos (MoE) basado en Qwen 3.5 MoE, con 35.107.181.936 parámetros totales y un tamaño de repositorio de 70,2 GB en formato safetensors. Su propósito declarado es competir en el duelo "Reason v3" de la red, optimizando una puntuación anclada al profesor (`lpC(y_C|z_A) − lpC(y_C|∅)`), no como modelo conversacional de uso general.

El entrenamiento se realizó mediante DPO offline (no SFT ni GRPO online) sobre pares clasificados por Reason, partiendo del checkpoint padre `unconst/Affine-5czsc2fc98-r252-merged`. Los hiperparámetros clave incluyen LoRA de rango 32 (MidRank) con alpha 128, beta 0,02 (LoBeta), tasa de aprendizaje 1e-6 (LoLR), longitud máxima de contexto 12.288 tokens (SoftCtx) y 3 épocas sobre 3.600 pasos. El modelo está etiquetado como `image-text-to-text` en HuggingFace, aunque no se documentan capacidades multimodales específicas en la model card. La licencia no está disponible y no se especifican idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 MoE |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (según hiperparámetro `max_len` de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sigue la política de artefactos de minería Affine) |
| Formato de pesos | safetensors (70,2 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura MoE derivada de Qwen 3.5 MoE, aunque no se detallan los parámetros activos ni la configuración exacta de los expertos. El entrenamiento se realizó mediante **offline DPO** (Direct Preference Optimization) sobre pares de respuestas clasificadas por un profesor (teacher-side Reason). No se empleó SFT ni GRPO online. El proceso consistió en optimizar la preferencia por respuestas con mayor puntuación Reason del profesor, usando un conjunto de datos denominado "SoftCtx × MidRank × LoBeta" (banda de contexto suave, rango LoRA medio, beta bajo).

Los hiperparámetros específicos del entrenamiento fueron: LoRA con r=32 y alpha=128, beta de DPO=0,02, tasa de aprendizaje 1e-6, longitud máxima de contexto 12.288 tokens, y 3 épocas sobre 3.600 pasos (MegaExtra). El hardware utilizado incluyó GPUs de las máquinas `mine-r226-marsplan-fullft-1` (GPUs 2,3) para entrenamiento y fusión, y `mine-r262-kevin-v5-nonking-grpo-1` (GPUs 6,7) para el relay y la fusión final en `/tmp/r637_merged`. No se documentan innovaciones arquitectónicas propias; el interés reside en la receta de entrenamiento DPO offline con ajuste fino de bajo rango.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto, pero su uso previsto es exclusivamente para el duelo Reason v3 de la red SN120, no como modelo de chat general.
- Razonamiento (Reason v3): optimizado específicamente para la métrica `lpC(y_C|z_A) − lpC(y_C|∅)`, que mide la ventaja condicional de la respuesta del modelo sobre una línea base vacía.
- DPO offline: entrenado para preferir respuestas con mayor puntuación del profesor, lo que implica cierta capacidad de alineación con criterios externos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específico.
- Etiquetado como `image-text-to-text` en HuggingFace, pero sin evidencia en la model card de soporte multimodal real.

## Casos de uso

- Minería en la red SN120 de Bittensor: el modelo está diseñado para ser presentado como submission de miner en el duelo Reason v3, compitiendo contra el "live king" (checkpoint reinante) en la evaluación de razonamiento.
- Evaluación de razonamiento (evalsrv Reason duel): sirve como participante en el sistema de duelos de la red, donde se compara su puntuación anclada al profesor contra otros checkpoints.
- Investigación en DPO offline: puede usarse como referencia para estudiar el efecto de la combinación de hiperparámetros (LoRA MidRank, beta bajo, contexto suave, learning rate bajo) en la calidad del razonamiento.
- Experimentación con fusión de modelos: al ser un checkpoint fusionado a partir de un padre, puede servir para analizar estrategias de merge en el contexto de entrenamiento distribuido.
- Análisis de métricas de preferencia: útil para entender cómo varía la puntuación `lpC(y_C|z_A) − lpC(y_C|∅)` bajo diferentes configuraciones de entrenamiento.
- Reproducción de pipelines de DPO offline: el experimento documentado (r637-r252-offline-dpo-hialpha-midrank-lobeta-softctx-megaextrasteps-ep3-lolr) puede replicarse para validar la metodología en otros dominios.

No es adecuado para aplicaciones de producción generales como chatbots, generación de código o atención al cliente, dado su propósito específico y la falta de documentación sobre su comportamiento fuera del contexto de minería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la comparación local contra el "live king" de la reign 34 (`cryptoDev23/Affine-5Dku3dYp9j-hk8161`), con un margen de +0,005735, error estándar 0,001973, z=2,91 y n=77, superando la barrera `max(2·SE, δ=0.002)` = 0,003946. También se indica una mediana de pensamiento de 168,5 y una tasa de pase B de 0,4125. Estos valores son específicos del contexto de la red y no comparables con benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros y 70,2 GB de pesos en safetensors, la inferencia en precisión FP16 requeriría aproximadamente 70 GB de VRAM. Con cuantización a 8 bits podría reducirse a unos 35-40 GB, y a 4 bits a unos 18-20 GB (estimaciones basadas en el tamaño, no en datos oficiales).
- GPU recomendadas: para FP16 se necesitarían GPUs profesionales como A100 80GB, H100 80GB o A6000 48GB en configuración multi-GPU. Para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, aunque no hay garantías.
- Inferencia en consumer GPU: posible con cuantización agresiva (4 bits) y técnicas de offloading, pero no recomendado dado el propósito del modelo.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto (checkpoints de minería SN120 con arquitectura Qwen MoE y entrenamiento DPO offline). La serie Affine incluye otros checkpoints como `r67`, `r252`, `r538`, pero no se conocen sus especificaciones completas ni sus rendimientos relativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo especializado, no general: su uso previsto es exclusivamente como submission de minería en SN120; no debe emplearse como chatbot o generador de texto genérico.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución. Se indica que sigue la "política de artefactos de minería Affine", pero sin detalle.
- Idiomas no documentados: no se especifican los idiomas soportados; probablemente el entrenamiento se realizó en inglés (por el contexto de Reason), pero no hay confirmación.
- Riesgo de alucinación y sesgos: al ser un modelo entrenado con DPO offline sobre un conjunto de pares específico, puede presentar sesgos derivados de los datos de preferencia y no se han evaluado sus riesgos de alucinación en tareas generales.
- Contexto limitado: la ventana de 12.288 tokens es moderada; para tareas de razonamiento largo podría ser insuficiente.
- Sin benchmarks públicos: no hay evidencia de rendimiento en tareas estándar, lo que dificulta evaluar su calidad fuera del contexto de la red.
- Reproducibilidad: el entrenamiento depende de infraestructura específica (máquinas con nombres concretos, relay, fusión), lo que puede dificultar la reproducción exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r637-r252-odpo-midrank-lobeta-softctx-ep3-lolr-merged
- Modelo base (padre): https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Otro checkpoint de la serie (referencia): https://huggingface.co/unconst/Affine-5czsc2fc98-r67-merged
- Checkpoint relacionado con DPO: https://huggingface.co/unconst/Affine-5czsc2fc98-r538-loveaffine-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-lora

No se encontraron papers, blogs ni demos públicos asociados a este modelo.
