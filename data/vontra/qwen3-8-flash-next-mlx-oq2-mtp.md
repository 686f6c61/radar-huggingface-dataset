# Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP

## Resumen

Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP es una conversión cuantizada para Apple Silicon del modelo Qwen3.8-Flash-Next, desarrollado por Qwen (Alibaba). El modelo original es un MoE multimodal de 125.000 millones de parámetros (6.000 millones activos por token) con una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Su arquitectura combina Gated DeltaNet, Qwen Sparse Attention, capas MoE ultra dispersas, embeddings n-gram y un bloque nativo de predicción del siguiente token (MTP) para decodificación especulativa.

Esta conversión, realizada por Vontra, aplica una cuantización de precisión mixta sensible a la sensibilidad de los módulos (oQ2), con una base afín de 2 bits y sobreescrituras de 3, 4, 5, 6 y 8 bits en 746 módulos. El checkpoint resultante pesa 70,8 GB en 15 shards, incluye el bloque MTP nativo y está optimizado para el runtime MLX. Es una opción relevante para ejecutar un modelo de 125B en hardware Apple con memoria unificada, aunque la compresión extrema (2 bits) implica una degradación de calidad esperable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp (vision-language sparse MoE híbrido: Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 23.478.578.019 (checkpoint cuantizado) / 125B (modelo original) |
| Parametros activos | 6B (modelo original) |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | oQ2 de precisión mixta: base 2-bit affine (group size 32), con módulos de 3, 4, 5, 6 y 8 bits (group sizes 32/64/128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX safetensors (15 shards, 3.747 tensores indexados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal ultra disperso con 125B parámetros totales y 6B activos por token. Su arquitectura combina cuatro ideas principales: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta usa Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Además incorpora capas MoE con 512 expertos enrutados (10 activos más 1 compartido), flujos residuales ensanchados, embeddings n-gram (51B parámetros, 20 millones de entradas) y un bloque MTP de 4B parámetros para decodificación especulativa. El modelo fue entrenado por Qwen como avance de la arquitectura Qwen4, con capacidades multimodales (imagen, texto y vídeo).

La conversión de Vontra parte del checkpoint oficial BF16 y aplica una cuantización oQ2 de precisión mixta: una base de 2 bits con group size 32, y 746 módulos sobrescritos con mayor precisión (297 a 3 bits, 60 a 4, 36 a 5, 129 a 6 y 224 a 8 bits). El bloque MTP nativo se conserva íntegro con la misma estrategia de precisión mixta. No se dispone de información detallada sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen, texto y vídeo (pipeline image-text-to-text).
- Razonamiento y comprensión de contexto largo: ventana nativa de 262.144 tokens, extensible a 1M.
- Generación de código y tareas de agente: el modelo original destaca en agentic coding y supera a Claude-4.6-Opus en benchmarks de codificación, visión y chat (según documentación de unsloth).
- Decodificación especulativa nativa: incluye un bloque MTP (next-token prediction) para acelerar la generación, aunque en esta conversión no mejora el throughput medido.
- Capacidades multilingües: no se especifican idiomas concretos en la información disponible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación de esta conversión; se recomienda consultar la model card del modelo original.

## Casos de uso

- Asistente de programación con visión: el modelo puede analizar capturas de pantalla o diagramas y generar código, gracias a su capacidad multimodal y su rendimiento en agentic coding. Adecuado para entornos de desarrollo integrados en Mac con MLX.
- Análisis de documentos largos: con 262K tokens de contexto, puede procesar libros técnicos, informes extensos o conversaciones multi-turno sin truncar, útil para resúmenes y extracción de información.
- Chat conversacional de alta calidad: su arquitectura MoE con 6B activos permite respuestas fluidas y coherentes en diálogos largos, con una velocidad de ~26 tokens/s en Apple M3 Studio.
- Generación de contenido multimodal: a partir de una imagen y una instrucción, puede describir, responder preguntas o generar texto creativo, aprovechando su pipeline image-text-to-text.
- Prototipado de agentes autónomos: su capacidad de razonamiento y contexto largo lo hace apto para experimentar con agentes que requieren múltiples pasos de razonamiento, aunque el soporte de tool calling no está confirmado.
- Inferencia local en hardware Apple: al estar cuantizado para MLX, permite ejecutar un modelo de 125B en un Mac con memoria unificada suficiente, sin necesidad de GPU NVIDIA, ideal para desarrollo y pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversión específica. El modelo original Qwen3.8-Flash-Next reporta superar a Claude-4.6-Opus en agentic coding, visión y chat, según la documentación de unsloth, pero no se incluyen cifras concretas en los materiales proporcionados. La validación de esta conversión se limitó a pruebas de coherencia, aritmética y seguimiento de instrucciones, con una velocidad de generación medida de 26,14 tokens/s (MTP desactivado) y 25,93 tokens/s (MTP activado) en Apple M3 Studio, con una tasa de aceptación de propuestas MTP del 57,89%.

## Requisitos de hardware

- Plataforma: Apple Silicon (Mac con chip M-series), ya que el formato MLX es específico de este hardware.
- Memoria unificada: el checkpoint pesa 65,9 GiB, por lo que se recomienda un Mac con al menos 128 GB de memoria unificada para cargar el modelo completo con espacio para el contexto y los estados de caché.
- GPU recomendada: no aplica a GPUs NVIDIA; en Apple, el rendimiento depende de la memoria unificada y el ancho de banda. El modelo fue validado en Apple M3 Studio.
- Opciones de despliegue: runtime MLX con soporte explícito para arquitectura `qwen4_exp` y MTP nativo (por ejemplo, oMLX o MLX-VLM). No es compatible directamente con vLLM, llama.cpp u Ollama sin adaptaciones.
- Latencia y throughput: ~26 tokens/s en generación de texto (512 tokens de salida) en M3 Studio, según la validación del autor. El rendimiento varía con la longitud del prompt, el estado de caché y las condiciones térmicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | 125B | 6B | 262K (ext. 1M) | safetensors BF16 | qwen-community-1.0 |
| Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP (esta conversión) | 23,48B (checkpoint cuantizado) | 6B | 262K | MLX safetensors oQ2 | qwen-community-1.0 |
| Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP (conversión hermana) | no disponible | 6B | 262K | MLX safetensors oQ4 | qwen-community-1.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. La conversión oQ2 reduce drásticamente el tamaño del checkpoint (de ~250 GB BF16 a ~66 GiB) a costa de una compresión extrema que puede afectar la calidad de salida.

## Limitaciones y advertencias

- oQ2 es un formato de compresión extrema (2 bits base) que puede degradar significativamente la calidad de generación, especialmente en tareas de razonamiento complejo o precisión numérica.
- El bloque MTP nativo no mejora el throughput en esta conversión (medido -0,81% en M3 Studio); se recomienda mantenerlo desactivado por defecto.
- Requiere un runtime con soporte explícito para la arquitectura `qwen4_exp` y el módulo MTP; un runtime sin ese soporte puede rechazar los 76 tensores MTP durante la carga estricta.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen; se deben revisar sus términos específicos para uso comercial, aunque no se detallan restricciones en la información disponible.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas de esta conversión; se recomienda consultar la model card del modelo original para orientación de seguridad.
- El modelo es una conversión comunitaria, no un lanzamiento oficial de Qwen, por lo que no cuenta con el mismo nivel de soporte ni garantías.

## Enlaces

- [Modelo en Hugging Face (Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP)](https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP)
- [Modelo original (Qwen/Qwen3.8-Flash-Next)](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Repositorio GitHub de Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Blog de Qwen sobre Qwen3.8 Flash Next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- [MLX-VLM (runtime de soporte)](https://github.com/ml-explore/mlx-vlm)
- [Documentación de unsloth para ejecución local](https://unsloth.ai/docs/models/qwen3.8-next)
- [Conversión hermana oQ4 (Vontra)](https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP)
