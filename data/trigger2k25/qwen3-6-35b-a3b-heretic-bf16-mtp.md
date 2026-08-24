# trigger2k25/Qwen3.6-35B-A3B-heretic-BF16-mtp

## Resumen

El modelo `trigger2k25/Qwen3.6-35B-A3B-heretic-BF16-mtp` es una conversión independiente al formato MLX (Apple Silicon) del checkpoint `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved`, que a su vez deriva del modelo oficial `Qwen/Qwen3.6-35B-A3B` de Alibaba Cloud. Se trata de una variante MoE de 35.505 millones de parámetros totales con 3.000 millones de parámetros activos por token, diseñada para ejecutarse en hardware Apple con el runtime oMLX. La conversión preserva los pesos nativos de MTP (Multi-Token Prediction) o Next-N, lo que permite decodificación especulativa sin necesidad de un modelo draft externo.

El checkpoint es exclusivamente de texto (la torre visual del modelo original no se incluye) y admite una ventana de contexto de hasta 262.144 posiciones. Todos los pesos se almacenan en BF16 sin cuantización, lo que resulta en un repositorio de aproximadamente 71 GB (unos 66 GiB). La conversión se realizó a partir del GGUF BF16 del modelo fuente, invirtiendo el mapeo de llama.cpp para Qwen3.5/Qwen3.6 y reconstruyendo la disposición de tensores nativa de MLX. No se aportan benchmarks de rendimiento ni evaluaciones de calidad en esta versión.

La relevancia de este modelo radica en que permite ejecutar una variante "uncensored" (abliterada) de Qwen3.6-35B-A3B en equipos Apple Silicon con soporte nativo de MTP, algo que no estaba disponible en conversiones anteriores. No obstante, al tratarse de un modelo sin censura, conlleva riesgos importantes de contenido dañino o sesgado, y su uso en producción requiere medidas de control adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (familia `qwen3_5_moe`), 40 capas regulares + 1 capa MTP/Next-N |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3 B (A3B) |
| Longitud de contexto | 262.144 posiciones |
| Tipos de cuantizacion | BF16 (sin cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors compatible con MLX, 16 shards |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 256 expertos enrutados, de los cuales se activan 8 por token, más un experto compartido. El modelo incluye una capa adicional de predicción multi-token (MTP) nativa, representada por 19 tensores `mtp.*` y configurada con `mtp_num_hidden_layers = 1`. Esta capa permite la decodificación especulativa sin un modelo draft externo, una característica distintiva de la familia Qwen3.6.

El proceso de conversión partió del GGUF BF16 del modelo fuente y aplicó una transformación inversa del mapeo de llama.cpp para Qwen3.5/Qwen3.6. Se fusionaron los tensores separados de gate/up de los expertos en la representación `experts.gate_up_proj`, se revirtió la permutación del value-head, se restauró `A_log = log(-ssm_a)` y la disposición Conv1d de MLX, y se excluyeron los 333 tensores de la torre visual. No se dispone de información sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación), ya que esta conversión no incluye dichos detalles.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo Qwen3.6-35B-A3B original, aunque no se han verificado de forma independiente en esta conversión.
- Decodificación especulativa nativa: gracias a la capa MTP preservada, puede generar múltiples tokens por paso sin necesidad de un modelo draft externo, lo que reduce la latencia en Apple Silicon.
- Contexto largo: soporta hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Solo texto: no admite entrada de imágenes, vídeo ni audio, aunque el tokenizador pueda contener tokens multimodales residuales.
- Multilingüismo: no se especifican los idiomas soportados en la documentación de esta conversión.
- Tool calling y agentes: no se menciona explícitamente en la información proporcionada; se desconoce si el modelo conserva estas capacidades.

## Casos de uso

- Asistente de código en local en Apple Silicon: al ser un modelo de 3B activos, puede ejecutarse en un Mac con memoria unificada suficiente, ofreciendo generación y completado de código con baja latencia gracias al MTP nativo.
- Análisis de documentos largos: con 262.144 tokens de contexto, permite procesar libros completos, informes extensos o expedientes legales en una sola pasada, resumiendo o extrayendo información relevante.
- Generación de contenido creativo sin restricciones: la variante "uncensored" puede utilizarse para escribir ficción, guiones o diálogos que requieran un tono explícito o temas tabú, siempre con las advertencias de seguridad adecuadas.
- Investigación sobre decodificación especulativa: al preservar el MTP nativo, es útil para estudiar el rendimiento de la predicción multi-token en modelos MoE y comparar con enfoques de draft externo.
- Desarrollo de prototipos de chatbots conversacionales: su contexto largo y capacidad de generación de texto lo hacen apto para construir asistentes que mantengan conversaciones prolongadas con memoria de todo el historial.
- Evaluación de modelos abliterados: sirve como referencia para comparar el comportamiento de un modelo sin censura frente a su versión alineada, en entornos de investigación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la conversión no reclama paridad de rendimiento con el modelo original y que no se suministra ninguna evaluación de capacidades, seguridad o calidad.

## Requisitos de hardware

- Memoria unificada: se recomienda un mínimo de 128 GB para cargar el checkpoint completo en BF16 (el repositorio ocupa ~66 GiB). El autor utilizó una máquina con 128 GB para la conversión y validación.
- GPU: exclusivamente Apple Silicon (M-series). No es compatible con GPUs NVIDIA o AMD, ya que el formato MLX está diseñado para el ecosistema Apple.
- Runtime: oMLX 0.6.3rc2 o una versión posterior compatible. También requiere `mlx-lm` (la versión usada por oMLX).
- Opciones de despliegue: oMLX es el runtime principal. No se mencionan alternativas como vLLM, llama.cpp u Ollama para este formato específico.
- Latencia y throughput: no se proporcionan datos numéricos. La decodificación especulativa nativa debería reducir la latencia frente a un modelo sin MTP, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35,5 B | 3 B | 262.144 | Safetensors (BF16/FP8) | Apache-2.0 |
| Qwen3.6-35B-A3B-heretic-BF16-mtp (este) | 35,5 B | 3 B | 262.144 | MLX Safetensors (BF16) | Apache-2.0 |
| Qwen3.6-27B (dense) | 27 B | 27 B | no disponible | no disponible | Apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La variante "heretic" se diferencia del original por estar abliterada (sin censura) y por la conversión a MLX con MTP nativo. El modelo dense de 27B es una alternativa con mayor densidad de parámetros activos, pero no se conocen sus especificaciones completas en la información disponible.

## Limitaciones y advertencias

- Modelo sin censura: el modelo fuente se describe como "uncensored", "heretic" o "abliterated". Puede generar contenido dañino, sesgado, explícito o ilegal. No se ha verificado de forma independiente su comportamiento.
- Sin garantías de seguridad: no se incluye ninguna evaluación de seguridad, alineación o calidad. Los desplegadores son responsables de implementar filtros, control de acceso y supervisión humana.
- Solo texto: no admite entrada multimodal, a pesar de que el tokenizador pueda contener tokens especiales de imagen o vídeo.
- Compatibilidad limitada: validado únicamente con oMLX 0.6.3rc2. Otras versiones o runtimes pueden no soportar la arquitectura Qwen3.6 MoE o el MTP nativo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada. No debe utilizarse para decisiones médicas, legales, financieras o de seguridad crítica sin verificación cualificada.
- Tamaño del checkpoint: ~66 GiB en BF16, lo que requiere hardware con gran memoria unificada (128 GB recomendados). No es adecuado para equipos con menos memoria.
- Conversión independiente: no es un lanzamiento oficial de Qwen, MLX u oMLX. Los cambios de formato y la exclusión de la torre visual pueden afectar al comportamiento respecto al modelo original.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/trigger2k25/Qwen3.6-35B-A3B-heretic-BF16-mtp
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Repositorio GGUF del modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Despliegue NVFP4 con DFlash en DGX Spark (referencia alternativa): https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash
