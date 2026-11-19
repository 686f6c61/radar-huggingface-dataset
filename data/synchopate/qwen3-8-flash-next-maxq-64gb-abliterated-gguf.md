# Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF es una cuantización GGUF de la familia Qwen3.8-Flash-Next, publicada por el usuario Synchopate. Se trata de una edición "abliterated" (sin los filtros de rechazo del modelo original) del checkpoint base Qwen/Qwen3.8-Flash-Next, combinada con la variante heretic-2 de trohrbaugh. El resultado es un modelo multimodal de tipo image-text-to-text con arquitectura MoE de aproximadamente 176,5 mil millones de parámetros totales y unos 5 mil millones de parámetros activos por token.

El modelo emplea una topología denominada "qwen4exp" con 48 capas de tronco (36 Gated DeltaNet y 12 QSA Full Attention), 512 expertos enrutados sin podar (top-10 activos) más un experto compartido, y una capa NextN MTP para decodificación especulativa. La cuantización está diseñada para caber en un equipo con 64 GB de RAM, con un total de 53,99 GiB distribuidos en dos shards, lo que la hace apta para inferencia en CPU mediante llama.cpp.

Su relevancia actual radica en dos factores: por un lado, permite ejecutar un modelo de escala 176B en hardware de consumo o servidores sin GPU de gama alta; por otro, la edición abliterated elimina los mecanismos de rechazo, lo que la orienta a investigación de seguridad, red-teaming y análisis de código ofensivo, no a despliegues públicos sin moderación externa. La licencia es qwen-community-1.0, con restricciones que deben verificarse antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE (topología qwen4exp): 36 capas Gated DeltaNet + 12 capas QSA Full Attention, 48 capas de tronco + 1 capa NextN MTP |
| Parámetros totales | ~176,5B (~125,3B transformer + MoE de 512 expertos + NextN MTP + 51,2B de tabla PLE de 320M filas) |
| Parámetros activos | ~5,0B por token (10 de 512 expertos enrutados + 1 experto compartido + tronco denso GDN/QSA) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF mixto: F32, Q8_0, Q6_K, IQ2_S, BF16, Q2_0, IQ3_XXS, MXFP4, IQ4_NL, Q2_K, Q1_0 (max_type = 42, sin tipos personalizados) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (2 shards: 43,26 GiB + 10,73 GiB; total 53,99 GiB) |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención completa QSA (ratio de compresión 4), organizadas en 48 capas de tronco más una capa NextN MTP para decodificación especulativa. El componente MoE mantiene los 512 expertos enrutados sin podar, con enrutamiento top-10 y un experto compartido, lo que explica la diferencia entre los ~176,5B parámetros totales y los ~5,0B activos por token. La tabla PLE (per-layer token embedding) de 320M filas y 51,2B parámetros se almacena en un shard separado cuantizado a Q1_0.

La edición abliterated aplica una sobre-proyección firmada multi-capa optimizada con TPE sobre 27 tensores del tronco (blk.31 a blk.47, con beta entre 1,83 y 2,39) y sobre la proyección NextN MTP de blk.48 (beta = 2,2508). Según la model card, los tensores blk.0 a blk.30 y token_embd permanecen intactos (1.058 de 1.085 tensores bit-idénticos al checkpoint alineado). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con un proyector multimodal BF16 opcional de 907,5 MB.
- Razonamiento de múltiples pasos y soporte de agentes.
- Decodificación especulativa mediante la capa NextN MTP integrada.
- Inferencia en CPU gracias a la cuantización mixta y al formato GGUF.
- Ejecución sin filtros de rechazo (edición abliterated), orientada a contenido sin moderación.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo permite generar y analizar contenido ofensivo sin los filtros de rechazo del checkpoint original, lo que facilita auditorías de robustez y pruebas de alineación en entornos controlados.
- Análisis de binarios y explotación en CTF: con ~5B parámetros activos por token y contexto conversacional, puede razonar sobre código de bajo nivel y cadenas de explotación en sesiones multi-turno.
- Auditoría de código y revisión de seguridad: la arquitectura MoE mantiene calidad de razonamiento con un coste de inferencia reducido, adecuado para pipelines de análisis estático asistido.
- Inferencia en CPU sin GPU: los 53,99 GiB en dos shards caben en un servidor con 64 GB de RAM, lo que permite desplegar un modelo de 176B en hardware sin acelerador mediante llama.cpp.
- Análisis legal y de políticas sin restricciones de contenido: útil para revisar documentos sensibles o discutir marcos normativos donde los filtros del modelo base introducirían sesgo.
- Investigación sobre alineación y mecanismos de rechazo: al conservar 1.058 tensores bit-idénticos al checkpoint alineado, sirve como referencia comparativa para estudiar el efecto de la sobre-proyección en las capas tardías.
- Prototipado de asistentes multimodales en local: el proyector BF16 opcional permite experimentar con entrada de imagen y texto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 53,99 GiB de pesos en GGUF; se recomienda al menos 64 GB de RAM para la inferencia en CPU (el nombre del modelo indica el tier de 64 GB).
- GPU recomendadas: no disponible en la información proporcionada; el diseño está orientado a CPU.
- Cabe en GPU de consumo: no disponible; el tamaño de 54 GiB excede la VRAM de GPUs de consumo típicas, por lo que el uso previsto es CPU o descarga parcial a GPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo, con soporte de llama-modchip según los tags); vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated | ~176,5B | ~5,0B | no disponible | qwen-community-1.0 | GGUF |
| Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF | ~176,5B | ~5,0B | no disponible | qwen-community-1.0 | GGUF |
| Qwen/Qwen3.8-Flash-Next (base) | ~176,5B | ~5,0B | no disponible | qwen-community-1.0 | safetensors |
| trohrbaugh/Qwen3.8-Flash-Next-heretic-2 | ~176,5B | ~5,0B | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los filtros de rechazo del modelo base están eliminados y no pueden usarse para moderación de contenido; no debe exponerse como endpoint público sin control de acceso y filtrado externo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta cuantización.
- La cuantización mixta incluye tipos de baja precisión (IQ2_S, Q2_0, Q1_0 en la tabla PLE), lo que puede degradar la calidad respecto al checkpoint en BF16.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y el chino podría ser inferior.
- La licencia qwen-community-1.0 impone condiciones que deben revisarse antes de cualquier uso comercial.
- El tamaño de 54 GiB requiere hardware con al menos 64 GB de RAM; no es apto para equipos de consumo convencionales.
- El uso previsto es investigación de seguridad, auditoría y análisis autorizado; el despliegue en producción sin salvaguardas adicionales es responsabilidad del operador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint heretic-2: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Variante alineada MaxQ-64GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
