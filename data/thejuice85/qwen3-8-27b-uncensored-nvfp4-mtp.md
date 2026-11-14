# theJuice85/Qwen3.8-27B-Uncensored-NVFP4-MTP

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-MTP es un artefacto de despliegue publicado por theJuice85 que combina tres piezas: la base cuantizada NVFP4 de RadixArk/Qwen3.8-27B-NVFP4, un LoRA de eliminación de rechazos entrenado directamente sobre un GGUF cuantizado (técnica de ablación direccional estilo Heretic, "obliteration") y una fusión final que restaura la torre de visión y la cabeza MTP de decodificación especulativa. El resultado es un checkpoint único de 2.400 tensores y 20,6 GB en formato compressed-tensors NVFP4 con escalas FP8, servible en vLLM y sglang, con un gemelo GGUF Q4_K_XL para llama.cpp.

El modelo hereda la arquitectura Qwen3.8-27B, un transformer híbrido con mezcla de expertos (MoE) y capas Gated-DeltaNet (GDN), según se deduce de las referencias a tensores MoE fusionados y al flag `--mamba-ssm-dtype` en la guía de sglang. La relevancia técnica del artefacto no está en el modelo base sino en el flujo de trabajo: demuestra que el entrenamiento en espacio GGUF (sobre pesos cuantizados, sin desquantizar) puede integrarse de vuelta en un árbol NVFP4 y servirse con visión y decodificación especulativa nativa intactas.

El autor reporta mediciones end-to-end en una NVIDIA GB10 (DGX Spark, 121 GB de memoria unificada), con prefill en frío de 2.363 tok/s en sglang y decodificación de 99,6 tok/s con concurrencia 8 en vLLM. La licencia es Qwen Research Use, lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con capas Gated-DeltaNet (GDN), multimodal (torre de visión) |
| Parámetros totales | 14.732.516.864 (según safetensors); el autor etiqueta el modelo como 27B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la configuración de ejemplo de vLLM usa `--max-model-len 16384`) |
| Tipos de cuantización | NVFP4 con escalas FP8 (compressed-tensors); gemelo GGUF Q4_K_XL |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research-use (license: other) |
| Formato de pesos | safetensors (compressed-tensors NVFP4); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención con capas Gated-DeltaNet (SSM), lo que explica la necesidad de fijar `--mamba-ssm-dtype bfloat16` y `--mamba-full-memory-ratio` en sglang. Incluye mezcla de expertos, ya que el LoRA de ablación se aplicó "por experto sobre los tensores MoE fusionados". También incorpora una torre de visión (pipeline `image-text-to-text`) y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa nativa.

El entrenamiento del LoRA de eliminación de rechazos se realizó con heretic-gguf, que ejecuta ablación direccional estilo Heretic directamente sobre un GGUF cuantizado de Qwen3.8-27B, usando llama.cpp como runtime y Optuna como motor de búsqueda de hiperparámetros. El trial t26 localizó y eliminó direcciones de rechazo por experto sin modificar el archivo base. Posteriormente, el adaptador de bajo rango se fusionó en cada peso afectado del árbol NVFP4 de RadixArk, con recuantización de escalas de bloque tras la fusión, restaurando la torre de visión y la cabeza MTP entrenada. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes (pipeline image-text-to-text, hasta 4 imágenes por prompt en la configuración de ejemplo de vLLM).
- Decodificación especulativa nativa mediante cabeza MTP, con aceptación medida del 57 % en vLLM (MTP-3) y longitud de aceptación de 2,3 a 2,85 en sglang.
- Comportamiento "uncensored": eliminación de rechazos mediante ablación direccional, con 0 rechazos nuevos introducidos y 0 respuestas incoherentes en la batería de 172 prompts del autor.
- Razonamiento multi-turno y conversacional.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente en la información disponible.
- No se documentan capacidades de audio.

## Casos de uso

- Despliegue de chat multimodal en producción: el checkpoint se sirve directamente en vLLM o sglang con visión activa, lo que permite construir asistentes que respondan sobre imágenes adjuntas en conversaciones multi-turno sin pipeline adicional de OCR.
- Inferencia de alta concurrencia en hardware unificado: con 99,6 tok/s a concurrencia 8 en vLLM sobre GB10, es adecuado para servir a varios usuarios simultáneos en estaciones de trabajo con memoria unificada.
- Investigación sobre alineación y seguridad: la batería de 172 prompts con juez semántico y test exacto de McNemar sirve como metodología replicable para medir la eliminación de rechazos y detectar daño colateral.
- Estudio de entrenamiento en espacio cuantizado: el flujo GGUF → LoRA → fusión NVFP4 → recuantización es un caso de referencia para investigadores que quieran adaptar modelos sin desquantizar.
- Prototipado rápido en llama.cpp: el gemelo Q4_K_XL permite probar el mismo comportamiento en hardware de consumo con decodificación de 22 a 33 tok/s en un solo stream.
- Evaluación de decodificación especulativa: la cabeza MTP integrada permite medir tasas de aceptación y ganancia de throughput en distintos motores (vLLM MTP-3 frente a sglang NEXTN) sobre el mismo checkpoint.
- Generación de contenido sin restricciones de rechazo: para casos donde el filtrado excesivo del modelo base interfiere con tareas legítimas de redacción técnica o creativa, aunque con las advertencias de la sección de limitaciones.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son de rendimiento de inferencia y de comportamiento:

| Métrica | NVFP4 base | Checkpoint fusionado |
|---|---|---|
| Rechazos excesivos (172 prompts) | 33 | ≤ base, McNemar p ≥ 0,50 |
| Rechazos nuevos introducidos | — | 0 |
| Respuestas incoherentes | 0 | 0 |

Rendimiento en NVIDIA GB10 (DGX Spark, 121 GB de memoria unificada):

| Stack | Prefill en frío 11,5k | Decode s1 | Decode c=8 | Spec decode |
|---|---|---|---|---|
| sglang NVFP4 | 2.363 tok/s | 16,5 tok/s | no disponible | MTP nativo, aceptación 2,3–2,85 |
| vLLM NVFP4 | 2.267 tok/s | 17,7 tok/s | 99,6 tok/s | MTP-3, 57 % de aceptación |
| llama.cpp Q4_K_XL | 781 tok/s | 22–33 tok/s | no disponible | ngram + borradores MTP |

## Requisitos de hardware

- VRAM estimada: el repo pesa 20,6 GB en NVFP4; se necesita margen adicional para caché KV, estado mamba y activaciones. El autor ejecutó vLLM con `--gpu-memory-utilization 0.55` compartiendo la máquina con otro tenant, y sglang con `--mem-fraction-static 0.30`.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) es la plataforma verificada. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos de ejecución en GPUs consumer. El gemelo GGUF Q4_K_XL está pensado para llama.cpp y podría caber en GPUs de 24 GB, pero no se confirma.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:qwen38-flash-next`), sglang y llama.cpp con el GGUF gemelo.
- Latencia y throughput: prefill en frío de 11,5k tokens a 2.363 tok/s (sglang) y 2.267 tok/s (vLLM); decodificación de 16,5–17,7 tok/s en un stream y 99,6 tok/s a concurrencia 8 en vLLM.
- Aviso técnico del autor: en sglang, usar `--mamba-ssm-dtype bfloat16` en lugar del fp32 por defecto supone una mejora de 2,6x en prefill sobre memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo | 14,7B en safetensors (etiquetado 27B) | no disponible | Qwen Research Use | NVFP4 + GGUF | Multimodal, MTP, sin rechazos |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B (etiquetado) | no disponible | no disponible | NVFP4 | Base cuantizada, con rechazos |
| theJuice85/Qwen3.8-27B-Abliterated-LoRA | LoRA sobre 27B | no disponible | no disponible | LoRA + GGUF Q4_K_XL | Adaptador sin fusionar |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales MoE cuantizados en NVFP4) en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia qwen-research-use restringe el uso comercial; hay que revisar los términos completos antes de cualquier despliegue productivo.
- Modelo solo en inglés; no se documenta soporte multilingüe.
- El comportamiento "uncensored" implica que el modelo puede generar contenido que el base rechazaría; requiere filtrado y moderación propios en producción.
- Riesgo de alucinación no evaluado: la batería de 172 prompts mide rechazos e incoherencias, no veracidad factual.
- No se documentan sesgos conocidos ni evaluaciones de sesgo.
- La longitud de contexto no está especificada; la configuración de ejemplo de vLLM limita a 16.384 tokens.
- El conteo de parámetros en safetensors (14,7B) no coincide con la etiqueta de 27B del autor; conviene verificar el tamaño real antes de dimensionar hardware.
- El checkpoint está pensado para vLLM y sglang con soporte de compressed-tensors y capas mamba; motores sin ese soporte no podrán cargarlo.
- Las mediciones de rendimiento provienen de una única plataforma (GB10) y con recursos compartidos entre motores, por lo que no son directamente extrapolables a otras GPUs.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/theJuice85/Qwen3.8-27B-Uncensored-NVFP4-MTP
- Modelo base NVFP4: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- LoRA de ablación: https://huggingface.co/theJuice85/Qwen3.8-27B-Abliterated-LoRA
- Repositorio heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Pesos del modelo: https://huggingface.co/theJuice85/Qwen3.8-27B-Uncensored-NVFP4-MTP/tree/main
- GGUF gemelo: https://huggingface.co/theJuice85/Qwen3.8-27B-Abliterated-LoRA
