# TracNetwork/mayhem-catalog-Qwen-Qwen3-8-27B-NVFP4

## Resumen

El modelo `TracNetwork/mayhem-catalog-Qwen-Qwen3-8-27B-NVFP4` es una cuantización NVFP4 (W4A4) del modelo multimodal Qwen3.8-27B de Qwen. Publicado por el usuario TracNetwork (contenido original de HivenetQuant), este checkpoint reduce los pesos y activaciones a precisión FP4 (E2M1) con escalas de bloque FP8, manteniendo las capas de atención y recurrentes (DeltaNet) en FP8 y el codificador de visión, la cabeza MTP y las capas de normalización en BF16. El objetivo es ejecutar el modelo en los tensores FP4 nativos de las GPUs NVIDIA Blackwell (por ejemplo, RTX 5090), logrando un aumento de velocidad de hasta 1,44× en decodificación respecto al FP16 sin pérdidas significativas de calidad.

La relevancia de este modelo radica en que demuestra que una cuantización agresiva W4A4 puede preservar las capacidades completas del modelo original, incluyendo visión, tool calling y decodificación especulativa MTP, con una degradación medida frente a FP16 de menos de 2 puntos en la mayoría de las tareas evaluadas. Al estar licenciado bajo Apache-2.0, es totalmente utilizable en entornos comerciales. El checkpoint está pensado para servirse con vLLM en hardware Blackwell, aunque también puede ejecutarse en otras GPUs con soporte de FP4 o mediante emulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + DeltaNet (atención recurrente), multimodal visión-texto |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256k, configurado en vLLM) |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 + escalas FP8, grupo 16), W4A4; capas de atención/recurrentes en FP8; vision encoder, MTP head, lm_head y normas en BF16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero la model card no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM multimodal híbrido que combina atención por transformador con capas recurrentes DeltaNet. Esta arquitectura híbrida permite manejar contextos largos (hasta 256k tokens) con menor coste computacional que la atención completa. El modelo acepta tanto texto como imágenes como entrada, y su pipeline se etiqueta como `image-text-to-text`. Incluye una cabeza de decodificación especulativa MTP (multi-token prediction) que acelera la generación.

La cuantización NVFP4 se realizó mediante post-training quantization con `llm-compressor` y `compressed-tensors`. El proceso emplea una búsqueda de sensibilidad por capas (supernet probe de ModelOpt + método Kneedle) para decidir automáticamente qué capas se cuantizan a NVFP4 (4 bits) y cuáles se protegen en FP8. Las capas cuantizadas a NVFP4 se recuperaron con GPTQ block-wise reconstruction. El resultado es un checkpoint W4A4 con grupos de 16 elementos y escalas FP8. Los autores comparan contra FP16 original, no contra FP8, lo que constituye una referencia más estricta. El modelo base fue entrenado por Qwen con datos propietarios (no se detalla el volumen de tokens en la información disponible), e incluye alineación mediante RLHF y técnicas de razonamiento (thinking mode).

## Capacidades

- Generación de texto y razonamiento complejo: resuelve tareas de matemáticas (AIME25: 96,0), conocimiento general (MMLU-Pro: 77,26) y razonamiento científico (GPQA Diamond: 88,08).
- Comprensión multimodal: procesa imágenes y texto, con resultados en MMMU-Pro (73,73) y AI2D (84,27).
- Tool calling / function calling: soportado nativamente, validado en BFCL (79,18). Compatible con `--enable-auto-tool-choice` y parser `qwen3_coder` en vLLM.
- Razonamiento multi-step y modo thinking: el modelo distingue entre razonamiento explícito y respuestas directas; el flag `--reasoning-parser qwen3` activa el parsing de cadenas de pensamiento.
- Decodificación especulativa MTP: la cabeza MTP se preserva en BF16, permitiendo acelerar la decodificación con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. La tasa de aceptación medida es del 61,36 %.
- Capacidad multilingüe: el modelo base Qwen3.8 soporta múltiples idiomas, aunque la model card no especifica la lista concreta.
- Seguimiento de instrucciones: IFEval 90,94, indicando alta adherencia a instrucciones complejas.

## Casos de uso

- Despliegue de asistentes conversacionales en producción con contexto largo: el modelo mantiene una ventana de 256k tokens, permitiendo gestionar conversaciones multi-turno con historiales extensos, documentos completos o sesiones de chat prolongadas sin pérdida de rendimiento. La cuantización NVFP4 reduce la huella de VRAM y acelera la inferencia en GPUs Blackwell, lo que abarata el coste por consulta.
- Generación de código en entornos CI/CD: con soporte de tool calling y un rendimiento de 86,11 en LiveCodeBench, el modelo puede integrarse en pipelines de desarrollo para generar código, revisar pull requests o autocompletar funciones. Su licencia Apache-2.0 permite su uso comercial sin restricciones.
- Análisis de documentos con imágenes (OCR, diagramas, capturas): al mantener el codificador de visión en BF16, la comprensión multimodal no se degrada. Puede procesar facturas, esquemas técnicos o capturas de pantalla junto con texto, útil en automatización de procesos documentales.
- Razonamiento matemático y científico avanzado: con 96,0 en AIME25 y 88,08 en GPQA, es adecuado para asistentes de investigación, resolución de problemas de nivel competitivo o tutorización de estudiantes de ciencias.
- Agentes autónomos con planificación multi-paso: la combinación de tool calling, razonamiento extenso y contexto largo permite construir agentes que ejecutan tareas complejas (navegación web, consulta de APIs, orquestación de servicios) con memoria persistente de la sesión.
- Inferencia de alto rendimiento en hardware de consumo: en una RTX 5090 (32 GB VRAM) con tensor-parallel 2, el modelo alcanza 102 tok/s en decodificación (1 stream) y 675 tok/s en throughput agregado, lo que lo hace viable para aplicaciones en tiempo real sin necesidad de GPUs de centro de datos.

## Benchmarks y rendimiento

Los autores publican una comparación pareada FP16 vs NVFP4 sobre una muestra representativa de cada conjunto de evaluación, con decodificación determinista y el mismo harness. Los resultados muestran una degradación máxima de -2,00 puntos en AIME25 y -1,74 en LiveCodeBench, mientras que en IFEval el modelo NVFP4 incluso supera al FP16 (+0,37). La tabla completa:

| Dataset | FP16 | NVFP4 | Δ |
|---|---|---|---|
| mmlu_pro | 77,50 | 77,26 | -0,24 |
| gpqa_diamond_cot_zeroshot | 88,79 | 88,08 | -0,71 |
| aime25 | 98,00 | 96,00 | -2,00 |
| ifeval (ifeval_safe) | 90,57 | 90,94 | +0,37 |
| mmmu_pro_standard_cot | 75,07 | 73,73 | -1,33 |
| ai2d_no_mask | 85,47 | 84,27 | -1,20 |
| livecodebench (codegen v6) | 87,85 | 86,11 | -1,74 |
| bfcl (tool-calling) | 80,14 | 79,18 | -0,96 |
| niah | 100,00 | 100,00 | +0,00 |
| mtp | 62,32 | 61,36 | -0,97 |

En cuanto a velocidad, medido con vLLM `bench serve` en RTX 5090 (TP4, FP8 KV cache, contexto 256k):

| Operación | FP16 | NVFP4 | Speedup |
|---|---|---|---|
| decode · 1k ctx · 1 stream (tok/s) | 71 | 102 | 1,44× |
| prefill · 1k ctx (tok/s) | 5553 | 7039 | 1,27× |
| decode · 10k ctx · 1 stream (tok/s) | 59 | 85 | 1,44× |
| prefill · 10k ctx (tok/s) | 6544 | 8928 | 1,36× |
| throughput · 1k ctx · ×10 (tok/s) | 469 | 675 | 1,44× |

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 23,1 GB en disco. Con cuantización NVFP4 y FP8 KV cache, cabe en una GPU de 32 GB (RTX 5090) con tensor-parallel 2 y `--gpu-memory-utilization 0.90`. Para contexto completo de 256k, se recomienda al menos 2× RTX 5090 o una GPU Blackwell de mayor memoria (por ejemplo, B200).
- GPUs recomendadas: NVIDIA Blackwell con soporte nativo de FP4 (RTX 5090, RTX 5080, B200, GB200). En GPUs sin soporte FP4 nativo (Ampere, Ada), la inferencia podría requerir emulación o fallback a FP8, con menor rendimiento.
- Compatibilidad con GPUs de consumo: sí, la RTX 5090 (32 GB) es la plataforma de referencia. También podría ejecutarse en RTX 4090 (24 GB) con contexto reducido o cuantización adicional, aunque no se han publicado datos al respecto.
- Opciones de despliegue: vLLM (configuración validada con flags específicos), llama.cpp (no probado, pero posible con soporte de FP4), Hugging Face Transformers con `compressed-tensors`. El checkpoint está etiquetado como `endpoints_compatible`.
- Latencia y throughput: decodificación de 102 tok/s (1 stream, 1k contexto) y throughput agregado de 675 tok/s con 10 streams, medido en RTX 5090. Con MTP especulativo, la decodificación single-stream es sustancialmente más rápida (la tasa de aceptación MTP es del 61,36 %).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Licencia | Rendimiento (MMLU-Pro) |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, FP16) | 27,8 B | 256k | FP16 | Apache-2.0 | 77,50 |
| TracNetwork NVFP4 (este modelo) | 27,8 B | 256k | NVFP4 W4A4 | Apache-2.0 | 77,26 |
| Qwen3-30B-A3B (MoE) | 30,5 B (3,3 B activos) | 128k | FP8 | Apache-2.0 | ~76 (estimado, no verificado) |
| Llama 3.1 8B | 8 B | 128k | FP16 | Llama 3.1 license | ~68 (estimado, no verificado) |

La comparativa se centra en el modelo base y alternativas de tamaño similar. El NVFP4 mantiene el rendimiento del FP16 con una degradación máxima de 2 puntos. Frente a modelos MoE como Qwen3-30B-A3B, el modelo denso ofrece un rendimiento comparable en tareas de razonamiento, aunque con mayor coste de activación por token. La licencia Apache-2.0 es más permisiva que la de Llama 3.1. No se dispone de datos de benchmarks verificados para las alternativas listadas; se recomienda consultar las fichas oficiales.

## Limitaciones y advertencias

- Degradación en tareas específicas: aunque la pérdida media es mínima, AIME25 muestra una caída de 2 puntos (98,0 → 96,0) y LiveCodeBench de 1,74 puntos. En aplicaciones donde la precisión matemática o de código es crítica, conviene evaluar si la tolerancia es aceptable.
- Requiere hardware Blackwell para aprovechar NVFP4 nativo: en GPUs sin soporte FP4, el rendimiento se degrada y puede que la cuantización no sea eficiente. No se han publicado pruebas en hardware no-Blackwell.
- Contexto largo con FP8 KV cache: el uso de KV cache FP8 puede introducir pérdidas adicionales en tareas de recuperación de información muy largas, aunque el benchmark `niah` muestra 100 % en ambos casos.
- Sesgos y alucinaciones: el modelo base Qwen3.8 puede presentar sesgos socioculturales y alucinaciones típicas de LLMs; la cuantización no corrige estos problemas. No se han publicado evaluaciones específicas de sesgo para este checkpoint.
- Dependencia de vLLM: la configuración de servido validada usa vLLM 0.26.0; versiones anteriores o posteriores pueden requerir ajustes. El flag `--speculative-config` con MTP solo está disponible en versiones recientes.
- La model card no especifica los idiomas soportados ni el detalle del dataset de entrenamiento del modelo base, por lo que no es posible garantizar un rendimiento óptimo en idiomas minoritarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TracNetwork/mayhem-catalog-Qwen-Qwen3-8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Cuantización NVFP4 alternativa (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de vLLM Ascend para Qwen3.5/3.6-27B: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.5-27B-Qwen3.6-27B.html
