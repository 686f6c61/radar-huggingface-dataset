# unconst/Affine-5czsc2fc98-r566-r252-odpo-midrank-midctx-midextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r566-r252-odpo-midrank-midctx-midextra-merged` es un refinamiento experimental de un modelo base de la serie Affine, desarrollado por el usuario "unconst". Se trata de un modelo de lenguaje multimodal (texto e imagen) basado en una arquitectura Qwen3.5-MoE, con aproximadamente 35.1 mil millones de parámetros totales. El objetivo principal de este ajuste es mejorar la capacidad de razonamiento (denominada "Reason" en el contexto del autor) mediante un proceso de optimización de preferencias offline (DPO) sobre pares de duelos generados por el propio sistema.

Este modelo se construye a partir del checkpoint `unconst/Affine-5czsc2fc98-r252-merged`, que ya había sido optimizado mediante GRPO (Group Relative Policy Optimization) en una etapa anterior. La relevancia de esta ficha radica en que documenta un pipeline de investigación completo: uso de DPO con temperatura baja (β=0.02), LoRA de rango medio (r=32, α=128), y un injerto multimodal posterior al entrenamiento. Aunque no es un modelo de producción validado, muestra una metodología reproducible para ajustar modelos MoE multimodales hacia tareas de razonamiento, con una ventana de contexto de entrenamiento de 8192 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (Mixture of Experts) con componente visual multimodal |
| Parametros totales | 35.107.181.936 (~35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con max sequence length = 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de tipo Mixture of Experts (MoE) de la familia Qwen3.5, según los tags de HuggingFace (`qwen3_5_moe`). Además, incluye un componente visual (`image-text-to-text`), lo que indica que puede procesar tanto texto como imágenes. El entrenamiento se realizó mediante **Offline Direct Preference Optimization (DPO)** sobre pares de preferencia derivados de duelos entre respuestas, generados por el sistema de minería del autor. La función objetivo optimizada es `Reason = lpC(y_C|z_A) - lpC(y_C|∅)`, es decir, la diferencia de log-probabilidad condicionada al contexto del maestro frente al vacío, solo en el lado del teacher.

Los hiperparámetros clave del entrenamiento fueron: temperatura DPO β=0.02 (LoBeta), LoRA con rango r=32 (MidRank) y alpha α=128 (HiAlpha), tasa de aprendizaje 5e-6, longitud máxima de secuencia 8192 (MidCtx), 1800 pasos de entrenamiento (MidExtraSteps) y 1 época. El entrenamiento se ejecutó en hardware con 8 GPU B200, utilizando solo las GPUs 4 y 5. Tras el entrenamiento LoRA, se realizó un injerto del componente visual (`model.visual.*`) y una fusión de pesos, resultando en un modelo con pesos no idénticos al base (verificado mediante `merge_meta.json`).

## Capacidades

- Generación de texto y razonamiento: el modelo está optimizado para mejorar la métrica "Reason", lo que implica una mayor capacidad de razonamiento lógico y matemático en comparación con su base.
- Procesamiento multimodal: acepta entradas de texto e imagen (etiquetado como `image-text-to-text`), aunque no se especifican los detalles de las capacidades visuales.
- Conversación: el pipeline es `text-generation` y el tag `conversational` sugiere soporte para diálogos multi-turno.
- Tool calling / function calling: no se menciona en la información disponible.
- Soporte para agentes y razonamiento multi-paso: no se menciona explícitamente, aunque el enfoque en "Reason" podría implicar mejoras en cadenas de razonamiento.
- Capacidades multilingües: no se especifican idiomas soportados.

## Casos de uso

Dado el carácter experimental del modelo, los casos de uso son principalmente de investigación y evaluación:

- Investigación en optimización de preferencias: permite estudiar el efecto de DPO con baja temperatura y LoRA de rango medio sobre modelos MoE multimodales, comparando con el checkpoint base.
- Evaluación de razonamiento en benchmarks: puede utilizarse para medir mejoras en tareas de razonamiento matemático o lógico (p. ej., GSM8K, MATH) frente al modelo base `Affine-5czsc2fc98-r252-merged`.
- Pruebas de transferencia multimodal: al incluir un componente visual injertado, se puede evaluar si el entrenamiento DPO afecta negativa o positivamente a tareas de visión-lenguaje.
- Desarrollo de pipelines de DPO offline: el repositorio del experimento (`mining/experiments/r566-r252-offline-dpo-hialpha-midrank-lobeta-midctx-midextrasteps/`) sirve como referencia para reproducir el flujo completo.
- Validación de la regla de "corona" (crown rule): el modelo está diseñado para ser evaluado contra el checkpoint reinante; puede usarse para probar si supera el umbral de margen, mediana de pensamiento y tasa de aprobación.
- Análisis de estabilidad de pesos: el `merge_meta.json` permite estudiar el impacto de la fusión LoRA y el injerto visual en la identidad de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "regla de corona" con criterios de margen (> max(2·SE, δ=0.002)), mediana de pensamiento ≥80 y tasa de aprobación B ≥0.30, pero no se proporcionan valores numéricos concretos de rendimiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.1B parámetros en precisión fp16, el modelo ocupa aproximadamente 70 GB de memoria (coincide con el tamaño del repositorio). Para inferencia en fp16 se necesitaría una GPU con al menos 80 GB (p. ej., A100 80GB, H100 80GB). Con cuantización a 8 bits (~35 GB) cabría en GPUs de 48 GB (A6000, L40S) o incluso 40 GB (A100 40GB). Con cuantización a 4 bits (~17.5 GB) podría ejecutarse en GPUs consumer de 24 GB (RTX 3090/4090).
- GPUs recomendadas: para fp16, A100 80GB o H100; para cuantización 8 bits, A6000 o L40S; para 4 bits, RTX 4090 o similar.
- Despliegue: compatible con frameworks estándar como vLLM, TGI (Text Generation Inference), llama.cpp (con conversión a GGUF) y Ollama (si se genera el formato adecuado).
- Latencia y throughput: no disponibles; dependerán de la cuantización y el hardware.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (tamaño, arquitectura MoE multimodal) dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no ha superado la "puerta de corona" (crown rule) según la model card; no es una submission oficial y su rendimiento no está validado.
- Licencia no disponible: esto impide su uso comercial sin una aclaración legal previa.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o no verificado.
- Limitaciones de contexto: el entrenamiento se realizó con una longitud máxima de 8192 tokens, lo que probablemente limita la ventana de contexto en inferencia.
- Idiomas no especificados: no se garantiza un rendimiento multilingüe.
- Dependencia del modelo base: cualquier limitación del checkpoint `Affine-5czsc2fc98-r252-merged` se hereda en este modelo.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de duelos internos, podría presentar sesgos inherentes a los datos de preferencia utilizados.

## Enlaces

- HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r566-r252-odpo-midrank-midctx-midextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Ruta del experimento (referencia interna): `mining/experiments/r566-r252-offline-dpo-hialpha-midrank-lobeta-midctx-midextrasteps/`
