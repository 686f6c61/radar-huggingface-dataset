# Starw1/Qwen3.8-27B-absolute-heresy-W4A16

## Resumen

Starw1/Qwen3.8-27B-absolute-heresy-W4A16 es una cuantización 4-bit weight-only (W4A16) del modelo multimodal MuXodious/Qwen3.8-27B-absolute-heresy, un fine-tune del Qwen3.8-27B de Alibaba realizado mediante el motor de ablación "Heretic" (v1.4.0) con Self-Organizing Maps y Magnitude-Preserving Orthogonal Ablation. El modelo resultante mantiene la arquitectura nativa de visión-lenguaje del Qwen3.8-27B, con aproximadamente 28.000 millones de parámetros y una ventana de contexto de hasta 140.000 tokens cuando se combina con caché KV en fp8.

El propósito principal de esta cuantización es permitir la inferencia de un modelo de 28B multimodal en una sola GPU de consumo con 24 GB de VRAM (como una RTX 3090), reduciendo el peso en disco a 15,8 GB y el uso de VRAM a unos 14,71 GiB. El autor ha publicado una configuración completa de vLLM que alcanza alrededor de 100 tokens por segundo en un único stream y 200 tokens por segundo en dos streams concurrentes, usando decodificación especulativa MTP, caché KV en fp8 y offloading de bloques KV a memoria RAM del sistema.

La relevancia de este modelo radica en que permite ejecutar un modelo multimodal de 28B con capacidades de razonamiento, codificación y tool calling en hardware de consumo, algo que normalmente requeriría una GPU con más de 40 GB. La torre de visión se mantiene en bf16 para preservar la comprensión de imágenes, y el formato compressed-tensors es compatible con vLLM, lo que facilita su despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), basado en Qwen3.8-27B |
| Parametros totales | 27.991.143.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 140.000 tokens (configuración con KV cache fp8; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | W4A16 (int4, group_size=128, AutoRound), torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (consultar modelo base) |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso multimodal de la familia Qwen, con una arquitectura transformer que combina un codificador de visión y un decoder de lenguaje. La cuantización W4A16 se realizó con AutoRound, un método de cuantización simétrica que optimiza los pesos de 4 bits mediante ajuste fino de los parámetros de escala y redondeo. El proceso de cuantización preserva la torre de visión en bf16 (incluida en la lista de "ignore" del quantizador) para no degradar la comprensión de imágenes.

El modelo incluye pesos de "draft" para decodificación especulativa MTP (multi-token prediction), lo que permite acelerar la inferencia sin pérdida de calidad. Además, el autor del modelo cuantizado ha desarrollado una configuración de vLLM que utiliza caché KV en fp8, un caché Mamba híbrido y un mecanismo de offloading de bloques KV a RAM del sistema (OffloadingConnector) para optimizar el uso de memoria en GPU de 24 GB.

No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el proceso de fine-tuning más allá del método de ablación Heretic aplicado. La cuantización se realizó con el script de syv-ai/qwen38-27b-rtx3090.

## Capacidades

- Generación de texto multimodal: procesa entradas de texto e imágenes (hasta 4 imágenes por prompt en la configuración recomendada).
- Razonamiento paso a paso: compatible con el parser de razonamiento Qwen3, lo que permite extraer cadenas de pensamiento estructuradas.
- Tool calling y function calling: soportado mediante el parser de herramientas Qwen3_coder, permitiendo uso de agentes y llamadas a herramientas externas.
- Decodificación especulativa MTP: acelera la generación mediante predicción de múltiples tokens.
- Capacidades multilingües: no se han publicado los idiomas soportados, pero el modelo base Qwen3.8 suele cubrir múltiples lenguas.
- Cuantización eficiente: pesos de 4 bits con activaciones de 16 bits, optimizado para inferencia en GPU consumer.

## Casos de uso

- Asistencia visual en atención al cliente: el modelo puede analizar capturas de pantalla o fotos de productos y responder en lenguaje natural, gracias a su ventana de contexto de 140K tokens que permite mantener conversaciones largas con historial completo.
- Generación de código en entornos de producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar código, revisar diffs o autocompletar funciones, con la ventaja de ejecutarse en hardware asequible.
- Agentes autónomos de oficina: con el parser de razonamiento Qwen3 y la capacidad de tool calling, puede ejecutar tareas de automatización de documentos, extracción de datos de imágenes (OCR) y generación de informes.
- Análisis de imágenes médicas o técnicas: la torre de visión en bf16 permite interpretar radiografías, diagramas o capturas de pantalla, con razonamiento paso a paso para explicar hallazgos.
- Despliegue en edge computing: al caber en una RTX 3090 de 24 GB, puede desplegarse en servidores con GPU de consumo para aplicaciones de procesamiento local de datos sensibles.
- Sistema de asistencia en programación con contexto largo: la ventana de 140K tokens permite cargar repositorios completos o documentación extensa, y generar soluciones con conocimiento de todo el proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización reporta un rendimiento de inferencia de aproximadamente 100 tokens/s en un único stream y 200 tokens/s en dos streams concurrentes en una RTX 3090, pero no proporciona métricas de calidad (como MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: ~14,71 GiB para los pesos cuantizados, dejando margen para KV cache, activaciones y CUDA graphs en una GPU de 24 GB.
- GPU recomendada: RTX 3090, RTX 4090, A5000, A6000 o cualquier GPU con 24 GB de VRAM. También puede funcionar en GPUs con más memoria.
- GPU consumer: sí, cabe en GPUs de 24 GB como RTX 3090/4090, pero no en GPUs de 16 GB (RTX 4080, RTX 4070 Ti) sin offloading adicional.
- Opciones de despliegue: vLLM (recomendado), también compatible con llama.cpp y otros motores que soporten compressed-tensors.
- Configuración para 24 GB: usar fp8 KV cache, MTP speculative decoding, y offloading de KV a CPU para contextos largos. Con estas optimizaciones se alcanza 100-200 tokens/s.
- La configuración completa del autor incluye `--gpu-memory-utilization 0.97`, `--kv-cache-dtype fp8`, y `--offloading` de bloques KV a host RAM (24 GiB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Starw1/Qwen3.8-27B-absolute-heresy-W4A16 | 27,99B | 140K (config. fp8) | W4A16 (int4) | no disponible | Cuantizado, multimodal, para 24 GB |
| Qwen/Qwen3.8-27B (original) | ~27B | 128K nativo | fp16/bf16 | Apache 2.0 | Modelo base de Qwen, multimodal |
| MuXodious/Qwen3.8-27B-absolute-heresy | ~27B | 128K (presumible) | fp16/bf16 | no disponible | Fine-tune con ablación de "herejía" |
| Otros modelos 27B cuantizados (p.ej., Llama-3-27B W4A16) | ~27B | 128K | W4A16 | según modelo | Menos optimizados para multimodal |

La principal diferencia es la cuantización W4A16 que permite ejecutar el modelo en hardware de 24 GB, mientras que el modelo base requiere al menos 60 GB para fp16. En cuanto a rendimiento, no se dispone de datos comparativos de benchmarks.

## Limitaciones y advertencias

- La licencia del modelo no está especificada en la ficha de HuggingFace; se debe consultar la licencia del modelo base (MuXodious/Qwen3.8-27B-absolute-heresy) para uso comercial.
- El modelo es un fine-tune con ablations de "herejía" (eliminación de ciertos comportamientos de rechazo), lo que puede afectar a la fiabilidad en contextos de seguridad o cumplimiento normativo.
- La cuantización W4A16 puede degradar ligeramente la precisión en tareas de razonamiento complejo o matemáticas, aunque no se han publicado evaluaciones al respecto.
- La ventana de contexto de 140K solo es alcanzable con fp8 KV cache y offloading a CPU; sin estas optimizaciones, el contexto efectivo será menor.
- El modelo soporta hasta 4 imágenes por prompt, pero no vídeo (limitación de la configuración recomendada).
- No se dispone de información sobre sesgos o alucinaciones específicos del modelo.
- Para producción, se recomienda evaluar el modelo en el dominio de uso específico, dado que no hay benchmarks públicos de la versión cuantizada.

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/Starw1/Qwen3.8-27B-absolute-heresy-W4A16
- Modelo base (MuXodious): https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy
- Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de cuantización: https://github.com/syv-ai/qwen38-27b-rtx3090/tree/main/single-user
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
