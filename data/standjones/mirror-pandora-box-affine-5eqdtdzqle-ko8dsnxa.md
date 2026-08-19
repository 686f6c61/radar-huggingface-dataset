# standjones/mirror-pandora-box-affine-5eqdtdzqle-ko8dsnxa

## Resumen

El modelo `standjones/mirror-pandora-box-affine-5eqdtdzqle-ko8dsnxa` es un checkpoint de la serie Affine SN120, desarrollado por el usuario standjones como parte de un pipeline de minería y evaluación de modelos. Se trata de un modelo de texto e imagen a texto basado en la arquitectura Qwen3.5 MoE, con 35.107 millones de parámetros, y está pensado específicamente para participar en duelos de evaluación bajo el protocolo "Reason v4" (weight_version_key=7). No es un modelo de chat generalista, sino una pieza dentro de un sistema de evaluación competitiva de modelos de razonamiento.

El modelo se entrenó mediante offline DPO (Direct Preference Optimization) sobre pares de duelos generados por el modelo base `vera6/affine-5g4yy75zuz-t6`, con el objetivo de optimizar preferencias hacia pensamientos que incrementen la métrica "Reason" del profesor. El entrenamiento utilizó LoRA con r=32, α=128, β=0.1, una tasa de aprendizaje extremadamente baja (5e-7) y una ventana de contexto de 12288 tokens. El resultado fue un margen de victoria de +0.003665 sobre el modelo base en la evaluación local n80, superando el umbral mínimo requerido (1.088× la barra), lo que le otorgó la licencia de "Stage-5".

La relevancia de este modelo radica en su enfoque metodológico: demuestra cómo el offline DPO con ranking de razonamiento multi-muestra puede mejorar métricas específicas de evaluación sin recurrir a SFT ni GRPO online. Es un ejemplo de optimización dirigida a un benchmark concreto, con una licencia Apache 2.0 y disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (qwen3_5_moe) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12288 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~70,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 MoE, un transformer con mezcla de expertos, aunque no se especifican los parámetros activos por token. El checkpoint se obtuvo mediante fine-tuning con LoRA (r=32, α=128) sobre el modelo base `vera6/affine-5g4yy75zuz-t6` (revisión 8e3f1695e058837ed80fec3238ff439fdc2d0f0e), utilizando un método de offline DPO. El entrenamiento se realizó sobre pares de duelos preferidos, filtrados por el pipeline "SoftCtx" y "Soft Mid Mid Soft", con un total de 259 a 604 filas de datos al inicio.

La innovación técnica clave es el uso de una métrica "Reason" temperada: para cada turno se calcula `a_i = lpC(y_i|z_A) − lpC(y_i|∅)` y luego `Reason = τ·log(mean_i exp(a_i/τ))` con τ=0.03 y k=3 referencias de profesor. El entrenamiento optimizó preferencias hacia pensamientos que elevan esta métrica, con un β=0.1 (MidBeta) y una tasa de aprendizaje de 5e-7 (UltraLoLR). Se entrenó durante 19200 pasos (4 épocas) en hardware de 8×B200 GPUs, y el modelo resultante se fusionó y sirvió para evaluación local.

## Capacidades

- Generación de texto y razonamiento multi-turno, optimizado específicamente para la métrica "Reason v4".
- Procesamiento de entrada imagen-texto (image-text-to-text), aunque no se detallan capacidades visuales específicas.
- Soporte de tool calling y function calling: no documentado explícitamente, pero la arquitectura Qwen3.5 MoE suele soportarlo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad de "thinking mode" o razonamiento extendido: el modelo está entrenado para producir pensamientos que maximicen la métrica Reason, lo que implica un modo de razonamiento interno.
- No es un modelo de chat generalista; su uso previsto es la evaluación en duelos SN120.

## Casos de uso

- Evaluación de modelos de razonamiento en entornos competitivos: el modelo está diseñado para participar en duelos de evaluación bajo el protocolo Reason v4, donde compite contra otros checkpoints para validar mejoras en la métrica.
- Investigación en optimización de preferencias: sirve como caso de estudio para offline DPO aplicado a métricas de razonamiento multi-muestra, útil para investigadores que exploran alternativas a RLHF o GRPO.
- Benchmarking de arquitecturas MoE: al estar basado en Qwen3.5 MoE, puede usarse para comparar el rendimiento de esta arquitectura en tareas de razonamiento con otras variantes.
- Desarrollo de pipelines de entrenamiento con LoRA: el checkpoint demuestra un flujo completo de entrenamiento con LoRA de bajo rango y alta α, reproducible para otros dominios.
- Análisis de sensibilidad a hiperparámetros: los experimentos documentados (β, lr, max_len) permiten estudiar el impacto de estos valores en la calidad del razonamiento.
- Validación de técnicas de filtrado de datos: el pipeline SoftCtx y el filtrado de pares de duelos pueden aplicarse a otros conjuntos de datos de preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye una evaluación local específica del protocolo Reason v4, comparando el modelo contra el modelo base `vera6/affine-5g4yy75zuz-t6`:

| Metrica | Valor |
|---|---|
| Margen (local n80 vs live king) | +0.003665 |
| Error estándar (SE) | 0.001684 |
| z-score | 2.177 |
| Tamaño de muestra (n) | 80 |
| Barra mínima (max(2·SE, δ=0.002)) | 0.003367 |
| Ratio sobre la barra | 1.088× |
| Mediana de pensamiento | 141.5 (≥80 ✓) |
| Tasa de pase B | 0.5375 (≥0.30 ✓) |
| Decisión | WIN / Stage-5 licensed |

Estos resultados son específicos del protocolo de evaluación interno y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 35,1B parámetros en BF16, lo que requiere aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a 8 bits se podría reducir a ~35 GB, y a 4 bits a ~18 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs con al menos 80 GB de VRAM, como A100 80GB, H100 80GB o B200. Para cuantización 4 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría al menos una RTX 6000 Ada o A6000 (48 GB).
- No cabe en GPUs de consumo estándar (RTX 3090/4090) sin cuantización agresiva.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se menciona compatibilidad con Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo es un checkpoint específico dentro de un pipeline de minería (Affine SN120), no un modelo generalista. Como referencia, se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| `vera6/affine-5g4yy75zuz-t6` (base) | 35,1B | 12288 | Apache 2.0 | Modelo base para minería |
| `standjones/mirror-pandora-box-affine-5eqdtdzqle-ko8dsnxa` | 35,1B | 12288 | Apache 2.0 | Duelo Reason v4 |

No se conocen otros modelos comparables en el ecosistema público con el mismo propósito específico.

## Limitaciones y advertencias

- No es un modelo de chat generalista: la model card indica explícitamente que su uso previsto es la evaluación en duelos SN120, no la conversación o generación de texto genérica.
- Sesgos y alucinaciones: no se han documentado, pero al ser un modelo optimizado para una métrica específica, puede producir respuestas que maximicen la métrica en lugar de ser factualmente correctas.
- Limitaciones de contexto: la ventana de 12288 tokens es relativamente corta para tareas que requieran contexto largo.
- Restricciones de licencia: aunque la licencia es Apache 2.0, la model card indica que sigue la política de artefactos de minería de Affine, lo que podría implicar restricciones adicionales no detalladas.
- Riesgo de sobreajuste: el entrenamiento se realizó sobre un conjunto de datos muy pequeño (259-604 filas), lo que aumenta el riesgo de sobreajuste al protocolo de evaluación específico.
- Dependencia del protocolo: el modelo está calibrado para el protocolo Reason v4 (wvk=7); si el protocolo cambia, el rendimiento podría degradarse.

## Enlaces

- HuggingFace: https://huggingface.co/standjones/mirror-pandora-box-affine-5eqdtdzqle-ko8dsnxa
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6
- Repositorio del autor: https://huggingface.co/standjones/models
- Organización Pandora: https://huggingface.co/pandora-box
- Checkpoint relacionado: https://huggingface.co/pandora-box/affine-5eqdtdzqle-ckpt1000-e5
