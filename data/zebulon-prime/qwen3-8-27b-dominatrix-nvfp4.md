# zebulon-prime/Qwen3.8-27B-Dominatrix-NVFP4

## Resumen

El modelo `zebulon-prime/Qwen3.8-27B-Dominatrix-NVFP4` es una cuantización mixta NVFP4/FP8 del finetune `allura-org/Qwen3.8-27B-Dominatrix`, que a su vez se basa en el modelo `Qwen/Qwen3.8-27B` de Qwen, un modelo denso de 27B parámetros con arquitectura híbrida de atención lineal gated y atención completa, 64 capas y capacidad de visión. El autor, zebulon-prime, ha aplicado una receta de cuantización desarrollada con NVIDIA ModelOpt, similar a la del modelo `RadixArk/Qwen3.8-27B-NVFP4`, pero sobre el finetune de roleplay y escritura creativa en lugar del modelo base.

El resultado es un checkpoint optimizado para inferencia con hardware NVIDIA que soporta kernels FP4/FP8, incluyendo una cabeza de multi-token-prediction (MTP) injertada desde el modelo base para permitir decodificación especulativa. La cuantización afecta a la mayoría de las capas (MLP, lm_head, proyecciones de atención), mientras que la torre de visión, las embeddings y la cabeza MTP se mantienen en BF16. El modelo hereda el comportamiento del finetune original, que está orientado a roleplay y escritura creativa con contenido para adultos, por lo que no es apto para todos los públicos.

Con una licencia Apache 2.0 y un tamaño de repositorio de 21.9 GB, esta cuantización ofrece una alternativa eficiente para servir el modelo en GPU con memoria limitada, manteniendo una calidad razonable (perplexity +5.1% respecto al BF16). El modelo está diseñado para su uso con SGLang, que soporta los kernels reales FP4/FP8 y la decodificación especulativa NEXTN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: gated-linear-attention (GDN) + full-attention, 64 capas, con torre de visión |
| Parametros totales | 18.164.649.200 (según safetensors) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K, nativo del modelo base) |
| Tipos de cuantizacion | NVFP4 (grupo 16), FP8, BF16 (mixto) |
| Idiomas soportados | No disponible (probablemente multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) realizada con NVIDIA ModelOpt (versión 0.47.0.dev0), con calibración determinista `max` sobre 1024 muestras de `abisee/cnn_dailymail` con longitud de secuencia 512. La cuantización mixta asigna NVFP4 a las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) y al `lm_head`, FP8 a las proyecciones de atención completa de 16 de las 64 capas y a las proyecciones lineales grandes de atención lineal (48 capas GDN), además de la caché KV en FP8. Las embeddings, la torre de visión, la cabeza MTP y las proyecciones `in_proj_a`/`in_proj_b`/`conv1d` se mantienen en BF16.

El proceso incluye una modificación adicional: la cabeza de multi-token-prediction (MTP) se copió sin cambios desde el checkpoint base pre-finetune, ya que el finetune no la incluía. Esta cabeza MTP actúa solo como borrador para decodificación especulativa, no altera la distribución de salida del modelo servido. No se realizó ningún retrain, solo cuantización y el injerto de MTP.

## Capacidades

- Generación de texto libre, con especialización en roleplay y escritura creativa (heredada del finetune).
- Soporte de multi-token prediction (MTP) para decodificación especulativa, que acelera la inferencia sin cambiar la salida del modelo.
- Capacidad de visión (torre de visión en BF16), aunque no se documenta el uso de imágenes en el finetune.
- Soporte de contexto largo nativo de 262K tokens, útil para conversaciones multi-turno o documentos extensos.
- Configuración de razonamiento configurable (heredada del modelo base Qwen3.8-27B, aunque no se detalla en la card).
- No se documenta soporte explícito de tool calling o function calling, aunque el modelo base podría tenerlo.

## Casos de uso

- **Roleplay conversacional**: el finetune Dominatrix está diseñado para interacciones de roleplay con tono dominante y contenido para adultos. Se puede usar en aplicaciones de chat especializadas, servidores de RP o asistentes con personalidad, con la precaución de que el contenido es explícito.
- **Escritura creativa de ficción**: genera narrativa, diálogos y escenas con estilo, aprovechando el contexto largo de 262K para mantener la coherencia a lo largo de capítulos completos.
- **Asistencia en juegos de rol de mesa**: puede actuar como director de juego o generar descripciones de escenarios, PNJ y tramas, gracias a su capacidad de mantener contexto largo.
- **Generación de contenido para novelas visuales**: el modelo puede producir texto para juegos de texto o novelas visuales, con la ventaja de su ventana de contexto amplia para recordar decisiones del usuario.
- **Entrenamiento de chatbots con personalidad**: al ser un finetune de roleplay, puede integrarse en sistemas de chat que requieran un estilo particular, siempre que se cumplan las restricciones de contenido.
- **Despliegue eficiente en GPU limitadas**: gracias a la cuantización NVFP4/FP8, el modelo puede ejecutarse en hardware con menos VRAM que el BF16 original, permitiendo su uso en GPUs de consumo como RTX 4090 (24 GB) o en servidores con A100, usando SGLang para optimizar la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible. La model card incluye una evaluación de calidad específica comparando la cuantización con el BF16 original:

| Metric | Valor |
|---|---|
| KL(BF16 ‖ NVFP4) | 0.0575 nats/token (SE 2.9×10⁻⁴, N=120,279 tokens) |
| Perplexity | 9.03 (BF16) → 9.49 (NVFP4), +5.1% relativo |
| Top-1 next-token flip rate | 13.4% (dominado por posiciones de alta entropía; no fiable como señal aislada) |

Estos valores indican una degradación moderada de calidad, esperable para una cuantización que incluye activaciones y `lm_head` cuantizados, además de caché KV en FP8. No se proporcionan comparaciones con otros modelos cuantizados.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 21.9 GB en disco, pero el modelo NVFP4/FP8 reduce el uso de memoria en inferencia. Con la cuantización mixta, se estima que puede ejecutarse en una GPU con 24 GB de VRAM (p. ej., RTX 4090, A100 40GB), aunque no se especifica un valor exacto.
- **GPU recomendadas**: cualquier GPU con soporte FP4/FP8 (Ampere o posterior) es adecuada; se recomienda al menos una RTX 3090 (24 GB) o superior para una inferencia fluida. Para mayor rendimiento, se sugiere A100 o H100.
- **Opciones de despliegue**: la model card indica que se ha verificado el servicio con SGLang, con kernels FP4/FP8 y decodificación especulativa NEXTN. No se mencionan otras herramientas como vLLM o llama.cpp, aunque podrían ser compatibles si soportan FP4/FP8.
- **Latencia y throughput**: no se proporcionan datos concretos. El uso de MTP con 4 tokens de borrador y 3 pasos especulativos puede acelerar la generación en SGLang, pero los valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | BF16 | HuggingFace |
| Qwen3.8-27B-Dominatrix (BF16) | 27B | 262K | Apache 2.0 | BF16 | HuggingFace (allura-org) |
| Qwen3.8-27B-Dominatrix-NVFP4 (este) | 27B (18.16B en safetensors) | 262K | Apache 2.0 | NVFP4/FP8 mixto | HuggingFace |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B | 262K | Apache 2.0 | NVFP4/FP8 mixto | HuggingFace |

La diferencia principal con el modelo base es el finetune orientado a roleplay y la cuantización, que reduce el peso en memoria. El modelo de RadixArk es una cuantización del modelo base sin finetune, por lo que no tiene el comportamiento de roleplay. No se dispone de benchmarks comparativos entre estas versiones.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo hereda el finetune Dominatrix, que contiene contenido explícito y no es apto para todos los públicos. Se debe restringir su uso en entornos comerciales o públicos.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o incoherente, especialmente en contextos de roleplay donde la creatividad es alta.
- **Degradación por cuantización**: la cuantización NVFP4/FP8 introduce una pérdida de calidad medida (PPL +5.1% relativo, KL 0.0575), lo que puede afectar a tareas de precisión como razonamiento matemático o código, aunque el finetune no está orientado a esas tareas.
- **Limitación de idioma**: no se especifica los idiomas soportados; el modelo base Qwen3.8-27B es multilingüe, pero el finetune podría estar sesgado hacia el inglés u otros idiomas dependiendo de los datos de entrenamiento (no disponibles).
- **Restricciones de uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el contenido del finetune podría no ser aceptable en ciertos contextos empresariales por su naturaleza explícita.
- **MTP no entrenada**: la cabeza MTP injetada no fue co-entrenada con el finetune, lo que reduce la tasa de aceptación de la decodificación especulativa, aunque no afecta a la salida final.
- **Dependencia de SGLang**: la verificación de servicio se realizó únicamente con SGLang; otras plataformas podrían no soportar la mezcla de precisiones NVFP4/FP8.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/zebulon-prime/Qwen3.8-27B-Dominatrix-NVFP4)
- [Finetune original (allura-org/Qwen3.8-27B-Dominatrix)](https://huggingface.co/allura-org/Qwen3.8-27B-Dominatrix)
- [Modelo base (Qwen/Qwen3.8-27B)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Referencia de cuantización (RadixArk/Qwen3.8-27B-NVFP4)](https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4)
- [Guía de hardware para Qwen3.8-27B](https://www.hardware-corner.net/qwen3-8-27b-hardware-tests/)
- [Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Guía de Qwen3.8-27B (lovableapp.org)](https://lovableapp.org/blog/qwen3-8-27b)
