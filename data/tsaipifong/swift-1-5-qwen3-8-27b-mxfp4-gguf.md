# tsaipifong/Swift-1.5-Qwen3.8-27b-MXFP4-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-MXFP4-GGUF es una cuantización no oficial en formato GGUF del modelo ukisai/Swift-1.5-Qwen3.8-27b, un derivado post-entrenado de Qwen/Qwen3.8-27B desarrollado por UkisAI. El modelo base es un transformer de 27.320.697.856 parámetros (unos 27,3 mil millones) que combina 64 capas principales, de las cuales 48 son de atención lineal de tipo SSM (state space model), y mantiene una capa MTP (multi-token prediction) para decodificación autoespeculativa. Esta versión la publica el usuario tsaipifong como cuantización comunitaria orientada a inferencia eficiente en GPUs AMD.

La relevancia de esta ficha reside en dos aspectos. Primero, es una cuantización MXFP4 (formato de 4 bits con escala de bloque) que reduce el peso de los ficheros de pesos a aproximadamente 15,5-16,1 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo y en GPUs de estación de trabajo. Segundo, está específicamente ajustada para WHIRL, un motor de inferencia nativo para Windows basado en HIP y orientado a GPUs AMD RDNA (Radeon 8060S del Ryzen AI Max+ 395 y Radeon AI PRO R9700), aunque los ficheros son GGUF estándar y también funcionan en llama.cpp.

La versión actual del repositorio (reconstruida el 2026-10-19) emplea un cuantizador MXFP4 ponderado por imatrix, con una divergencia KL entre un 17 % y un 19 % menor respecto al modelo BF16 que la primera publicación (2026-10-01). El proyector de visión se distribuye por separado en F16 para entrada de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 64 capas principales (48 de atención lineal SSM) y capa MTP; derivado de Qwen3.8-27B |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (matrices principales), Q8_0 (embeddings, capas SSM alpha/beta, capa MTP), F32 (norms y parámetros SSM), cabeza de salida Q6_K / Q8_0 / Q4_K según variante; proyector de visión F16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors BF16 como origen de la conversión) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,3 mil millones de parámetros con una arquitectura híbrida: 64 capas principales en las que 48 emplean atención lineal de tipo SSM (con tensores `ssm_alpha`, `ssm_beta`, `ssm_a`, `ssm_conv1d`, `ssm_dt` y `ssm_out`), lo que reduce el coste computacional frente a la atención completa en esas capas. Incluye además una capa MTP (`blk.64`, con `nextn_predict_layers = 1`) que se conserva en esta cuantización para habilitar decodificación autoespeculativa. El modelo base es un derivado post-entrenado de Qwen/Qwen3.8-27B orientado a eficiencia en razonamiento, según la model card del autor de la cuantización; los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información disponible y remiten a la model card upstream.

La cuantización se realizó en dos pasos documentados: conversión de los safetensors BF16 (revisión `b4c84d42`) a GGUF BF16 con `convert_hf_to_gguf.py` de llama.cpp build b11719 (866 tensores, con la capa MTP preservada) y posterior cuantización con `llama-quantize` parcheado mediante `mxfp4_wsearch.patch`, que implementa una búsqueda de escala de bloque MXFP4 ponderada por imatrix. Las matrices grandes de las 64 capas principales (`attn_qkv`, `attn_gate`, `attn_q/k/v`, `attn_output`, `ssm_out`, `ffn_gate/up/down`) se cuantizan a MXFP4; los embeddings y parámetros sensibles a Q8_0; y las norms y parámetros SSM críticos se mantienen en F32. La reconstrucción de octubre de 2026 reduce la divergencia KL frente al BF16 entre un 17 % y un 19 % respecto a la primera versión.

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B post-entrenado por UkisAI.
- Entrada de imágenes mediante el proyector de visión separado `mmproj-Swift-1.5-Qwen3.8-27B-F16.gguf` (F16), compatible con las tres variantes de pesos.
- Decodificación autoespeculativa gracias a la capa MTP conservada, con borradores MTP y n-gram en el motor WHIRL.
- Compatibilidad con endpoints OpenAI a través del servidor de WHIRL (`whirl-server.exe`).
- Ejecución en llama.cpp como GGUF estándar (probado con builds b11214 y b11719).
- Soporte de modos de precisión configurables en WHIRL: `--precise` (bit a bit sin pérdida), balance (por defecto, casi sin pérdida) y `--fast` (máxima velocidad dentro de límites de KL).
- Capacidades multilingües, de tool calling y de agentes: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPUs AMD de consumo y estación de trabajo: los ficheros de 15,5-16,1 GB permiten ejecutar un modelo de 27B en una Radeon AI PRO R9700 o en el Ryzen AI Max+ 395 con Radeon 8060S, usando WHIRL sin necesidad de ROCm ni HIP SDK, solo con el driver de AMD.
- Servidor compatible con OpenAI para aplicaciones existentes: `whirl-server.exe` expone un endpoint compatible con la API de OpenAI, de modo que se puede sustituir un backend en la nube por inferencia local sin reescribir el cliente.
- Asistente conversacional con contexto largo y decodificación rápida: el modo balance de WHIRL combina MTP y borradores n-gram para acelerar la generación manteniendo tokens equivalentes a la decodificación greedy, adecuado para chat multi-turno.
- Procesamiento de documentos con imágenes: con el proyector de visión F16 cargado, el modelo puede recibir imágenes junto con texto, útil para extracción de información de capturas, diagramas o documentos escaneados.
- Despliegue en pipelines de CI/CD y pruebas automatizadas: al ser GGUF estándar, se integra en flujos que ya usan llama.cpp, y la variante C (cabeza Q4_K) es algo más rápida en decodificación no especulativa.
- Evaluación de cuantizaciones y reproducibilidad: los hashes SHA256 y el recetario de cuantización permiten reproducir la conversión y comparar la calidad (KL) de distintas variantes, útil para investigación en compresión de modelos.
- Prototipado de agentes y razonamiento multi-paso en local: la capa MTP y el soporte de servidor permiten montar bucles de razonamiento con baja latencia en hardware AMD, aunque las capacidades específicas de tool calling no están documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de calidad de cuantización: la divergencia KL frente al modelo BF16 es entre un 17 % y un 19 % menor en la reconstrucción del 2026-10-19 respecto a la primera versión del 2026-10-01. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia.

## Requisitos de hardware

- VRAM estimada: los ficheros de pesos ocupan 15,49 GB (variante C), 15,82 GB (variante A) y 16,12 GB (variante B); el proyector de visión añade 0,93 GB. Hay que sumar la memoria para el contexto KV y buffers de ejecución, no cuantificada en la información disponible.
- GPUs objetivo: AMD Radeon 8060S (integrada en Ryzen AI Max+ 395) y AMD Radeon AI PRO R9700, ambas con soporte en WHIRL 0.2.0.
- Driver: AMD Software: Adrenalin Edition 26.8.1 (driver 32.0.31041.1004) o superior para ambas GPUs; no requiere HIP SDK, ROCm ni Visual C++ runtime.
- Cabe en GPU de consumo: sí, en el Ryzen AI Max+ 395 con Radeon 8060S (memoria unificada) y en Radeon AI PRO R9700; no se dispone de datos para GPUs NVIDIA consumer.
- Opciones de despliegue: WHIRL 0.2.0 (recomendado por el autor, `whirl-0.2.0-windows-x64.zip`), llama.cpp (builds b11214 y b11719 probados). vLLM, Ollama y TGI no están mencionados en la información disponible.
- Latencia y throughput: no disponibles; la model card solo indica comparativas cualitativas (la variante C es algo más rápida en llama.cpp y en decodificación no especulativa; la B es la más lenta con MTP).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-MXFP4-GGUF (esta ficha) | 27,32 B | no disponible | MXFP4 GGUF + MTP | swift-open-license-1.0 | Hugging Face, 2.758 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (modelo base) | 27,32 B | no disponible | BF16 safetensors | swift-open-license-1.0 | Hugging Face |
| tsaipifong/Ornith-1.5-35B-A3B-MXFP4-GGUF | 35 B totales, ~3 B activos (MoE) | no disponible | MXFP4 GGUF + MTP + visión | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (modelo original) | ~27 B | no disponible | BF16 safetensors | no disponible | Hugging Face |

## Limitaciones y advertencias

- Cuantización no oficial: el repositorio no está afiliado, respaldado ni soportado por UkisAI ni por Alibaba Cloud; los nombres "Swift" y "UkisAI" son marcas de UkisAI.
- Licencia swift-open-license-1.0: es una licencia "other" cuyo texto completo está en el repositorio upstream; es imprescindible revisarla antes de cualquier uso comercial o redistribución.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos de los del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para esta cuantización.
- Pérdida de precisión por cuantización: aunque la reconstrucción reduce la KL un 17-19 % respecto a la primera versión, sigue existiendo degradación frente al BF16; las variantes A, B y C difieren en la cabeza de salida (Q6_K, Q8_0, Q4_K) y, por tanto, en calidad y velocidad.
- Sesgos conocidos: no disponibles en la información proporcionada; dependen del dataset de entrenamiento del modelo base.
- Dependencia de hardware AMD: el mejor rendimiento documentado es con WHIRL en Radeon 8060S y R9700; en otras GPUs el rendimiento no está caracterizado.
- La capa MTP y el modo especulativo requieren WHIRL para aprovecharse plenamente; en llama.cpp la decodificación especulativa puede no estar disponible o comportarse de forma distinta.
- Longitud de contexto no especificada: no se puede planificar el uso en tareas de contexto largo sin consultar la model card upstream.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/tsaipifong/Swift-1.5-Qwen3.8-27b-MXFP4-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor WHIRL: https://github.com/tsaipifong/whirl-llm
- Release WHIRL 0.2.0: https://github.com/tsaipifong/whirl-llm/releases/tag/v0.2.0
- Modelo hermano Ornith-1.5-35B-A3B MXFP4 GGUF: https://huggingface.co/tsaipifong/Ornith-1.5-35B-A3B-MXFP4-GGUF
