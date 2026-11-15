# Vishva007/Swift-1.5-Ornith-9B-W4A16-LLM-Compressor

## Resumen
Swift-1.5-Ornith-9B-W4A16-LLM-Compressor es una versión cuantizada a 4 bits de los pesos (W4A16) del modelo multimodal ukisai/Swift-1.5-Ornith-9B, un derivado de razonamiento eficiente de ornith-ai/Ornith-1.5-9B. La publicación la firma el usuario Vishva007 y aplica la técnica Intel AutoRound (SignRound) sobre el modelo base, preservando en BF16 los módulos sensibles (atención lineal GatedDeltaNet, codificador visual, cabeza MTP y lm_head) para minimizar la degradación de precisión.

El modelo emplea una arquitectura híbrida Qwen3_5ForConditionalGeneration que combina 24 bloques de atención lineal GatedDeltaNet con 8 bloques de atención completa, más un codificador visual y una cabeza de predicción multi-token (MTP) de una capa para decodificación especulativa nativa. El resultado es un modelo image-text-to-text con capacidades de razonamiento, código y uso de herramientas, empaquetado en formato compressed-tensors para su despliegue en vLLM con kernels Marlin W4A16.

La relevancia de esta ficha radica en que ofrece una vía práctica para servir un modelo multimodal de ~9B (4.936.588.784 parámetros reales en safetensors) en hardware más modesto que el BF16 original, manteniendo el modo thinking y el soporte de tool calling. La cuantización W4A16 con group_size=32 y simetría reduce el peso del repositorio a 11,7 GB, aunque el modelo base declara 9B y el checkpoint cuantizado reporta ~4,94B de parámetros efectivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3_5ForConditionalGeneration: 24 bloques GatedDeltaNet (atención lineal) + 8 bloques de atención completa, codificador visual y cabeza MTP |
| Parametros totales | 4.936.588.784 (según safetensors del checkpoint cuantizado); el modelo base se denomina 9B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 200K tokens (configuración de servicio recomendada en vLLM con `--max-model-len 200k`) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), group_size=32, simétrico, AutoRound/SignRound; capas sensibles en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con esquema `llm_compressor` / `compressed-tensors` |

## Arquitectura y entrenamiento
La arquitectura es una variante híbrida de Qwen3.5 que intercala 24 capas de atención lineal GatedDeltaNet con 8 capas de atención completa, e incorpora un codificador visual con 27 bloques transformer y un merger de parches, además de una cabeza MTP de una capa para decodificación especulativa. El modelo base ukisai/Swift-1.5-Ornith-9B es un derivado de ornith-ai/Ornith-1.5-9B que, según la model card, reduce el uso de tokens de pensamiento en ~33,1% e incrementa la precisión en GPQA-Diamond en +1,52 pp respecto al base.

La cuantización se realizó con Intel AutoRound (SignRoundConfig) en una NVIDIA H200, con 1200 iteraciones por bloque, batch_size=2, gradient_accumulate_steps=4 (batch global efectivo de 8), seqlen=4096 y 512 muestras de calibración. El mix de calibración combina OpenThoughts3-1.2M (35,16%), OpenCodeReasoning split_0 (21,48%), UltraData-SFT-Agent-2609 (19,92%), OpenCodeInstruct (13,67%) y ultrachat_200k (9,77%), todas con plantillas de chat y trazas `<think>` intactas. Se cuantizaron 128 de 359 capas lineales a INT4 y se mantuvieron 231 módulos sensibles en BF16: proyecciones de atención completa y MLP en INT4, mientras que GatedDeltaNet (`in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `out_proj`), el codificador visual, la cabeza MTP y `lm_head` permanecen en BF16.

## Capacidades
- Generación de texto y razonamiento multi-paso con modo thinking activable (`enable_thinking`).
- Generación y razonamiento sobre código, incluyendo trazas de chain-of-thought para programación competitiva.
- Capacidades matemáticas y STEM derivadas del calibrado con OpenThoughts3.
- Procesamiento image-text-to-text: entrada de imágenes junto con texto mediante codificador visual preservado en BF16.
- Tool calling / function calling con parser `qwen3_xml` y elección automática de herramienta en vLLM.
- Soporte de agentes y trayectorias multi-turno con definiciones XML de herramientas.
- Decodificación especulativa nativa mediante cabeza MTP de una capa.
- Razonamiento eficiente: reducción de ~33,1% en tokens de pensamiento según el modelo base.

## Casos de uso
- Asistencia técnica con contexto largo: el modelo admite hasta 200K tokens, lo que permite ingerir documentación extensa, logs o historiales de incidencias y responder con razonamiento trazable en modo thinking.
- Generación de código en producción: su entrenamiento con OpenCodeReasoning y OpenCodeInstruct, junto al soporte de tool calling y parser `qwen3_xml`, lo hace apto para pipelines de CI/CD que requieran parcheo automático y ejecución de herramientas.
- Agentes autónomos multi-paso: las trayectorias agenticas de UltraData-SFT-Agent-2609 y la cabeza MTP favorecen bucles de planificación-acción con latencia reducida por decodificación especulativa.
- Análisis de documentos con imágenes: al conservar el codificador visual en BF16, puede extraer información de capturas, diagramas o formularios combinados con texto.
- Razonamiento matemático y STEM asistido: útil en entornos educativos o de investigación para resolver problemas con trazas de pensamiento auditables y menor consumo de tokens que el modelo base.
- Despliegue en infraestructura con VRAM limitada: la cuantización W4A16 con kernels Marlin en vLLM permite servir el modelo en GPUs de gama alta consumer o profesionales con menos memoria que el BF16 original.
- Evaluación comparativa de cuantizaciones: al existir variantes AutoRound, GPTQ y LLM-Compressor con los mismos pesos, sirve para medir impacto de formato en throughput y precisión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona, para el modelo base, una mejora de +1,52 pp en GPQA-Diamond y una reducción del ~33,1% en tokens de pensamiento respecto a Ornith-1.5-9B, sin tabla numérica de MMLU, HumanEval o GSM8K para el checkpoint cuantizado.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio pesa 11,7 GB en W4A16; con caché KV en FP8 y contexto de 200K se recomienda planificar al menos 24-32 GB de VRAM para despliegues reales, y más si se aumenta `--max-num-seqs`.
- GPU recomendadas: NVIDIA H200 (usada para la calibración), H100, A100 80GB para servicio de alta concurrencia; RTX 4090 (24 GB) puede alojar el modelo con contexto reducido y `--gpu-memory-utilization` ajustado.
- Cabe en GPU consumer: sí, en RTX 4090/5090 y GPUs con 24 GB o más, siempre con contexto y concurrencia moderados.
- Opciones de despliegue: vLLM ≥ 0.19.1 con kernels `compressed-tensors` W4A16 Marlin (formato nativo de este repo); las variantes AutoRound y GPTQ del mismo autor cubren transformers con backend auto-round, TGI y AutoGPTQ. No se menciona soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La configuración sugerida incluye `--async-scheduling`, `--enable-chunked-prefill`, `--kv-cache-dtype fp8`, prefix caching y offloading de KV a CPU (`SimpleCPUOffloadConnector`), lo que indica optimización para contextos largos más que para baja latencia pura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Ornith-9B-W4A16-LLM-Compressor (este) | 4,94B en safetensors (base 9B) | 200K | W4A16, group_size=32 | Apache-2.0 | Hugging Face, vLLM |
| ukisai/Swift-1.5-Ornith-9B (base BF16) | 9B | 200K (heredado) | BF16 | Apache-2.0 | Hugging Face |
| Vishva007/Swift-1.5-Ornith-9B-W4A16-AutoRound | Mismos pesos | 200K | W4A16 auto_round | Apache-2.0 | Hugging Face, vLLM/transformers |
| Vishva007/Swift-1.5-Ornith-9B-W4A16-GPTQ | Mismos pesos | 200K | W4A16 auto_gptq | Apache-2.0 | Hugging Face, vLLM/TGI/AutoGPTQ |

No se dispone de datos de benchmarks comparativos entre estas variantes ni frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la model card; al derivar de un modelo entrenado con datos web y de razonamiento, es esperable heredar sesgos de esas fuentes, pero no hay evaluación específica disponible.
- Riesgo de alucinación: no cuantificado; el modo thinking puede producir trazas plausibles pero incorrectas, por lo que se recomienda verificación en dominios críticos.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá de lo que herede el modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card por si añade condiciones.
- Caveats de producción: requiere vLLM ≥ 0.19.1 y Transformers ≥ 5.8.1; el uso de `--trust-remote-code` implica ejecutar código del repositorio; la cuantización W4A16 puede degradar precisión en tareas sensibles pese a preservar 231 módulos en BF16; el número de descargas (28) y likes (0) indica adopción muy baja y poca validación comunitaria.
- El checkpoint reporta 4,94B de parámetros pese a la denominación "9B" del modelo base, lo que puede generar confusión al planificar recursos.

## Enlaces
- Hugging Face (este repo): https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-LLM-Compressor
- Variante AutoRound: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-AutoRound
- Variante GPTQ: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-GPTQ
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Modelo origen: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
