# spele1100/Ornith-1.5-35B-A3B-Heretic-GB10-NVFP4

## Resumen

Ornith-1.5-35B-A3B-Heretic-GB10 es una conversión de cuantización mixta NVFP4/FP8 del modelo Ornith-1.5-35B-A3B, una versión "decensored" (abliterada) creada por OS-Software mediante la metodología Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA). El modelo original pertenece a ornith-ai y es un MoE de 35B parámetros totales con 3B activos por token, arquitectura qwen3_5_moe, contexto nativo de 262.144 tokens y capacidades VLM (visión y vídeo).

La conversión ha sido realizada por spele1100 para optimizar la inferencia en NVIDIA GB10 (DGX Spark / Spark Mini, SM121), un chip sin soporte nativo de cómputo FP4. Para ello se mantienen las capas densas en FP8 dinámico, los expertos del MoE en NVFP4 W4A4 (grupo 16), y la torre de visión y el head MTP en BF16 íntegro. El resultado es un checkpoint de ~21 GB que alcanza ~54 tokens/s en decodificación en una sola GB10, con soporte de decodificación especulativa vía MTP y carga directa en vLLM ≥ 0.26. Es un modelo de razonamiento (reasoning) y sin censura, con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE con atención híbrida, 256 expertos, 10/40 capas full-attention) |
| Parámetros totales | 35B nominales; 18.938.140.016 en el archivo safetensors (peso cuantizado) |
| Parámetros activos | ~3B (A3B) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | NVFP4 (expertos), FP8 W8A8 dinámico (dense), BF16 (vision tower y MTP head) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, un MoE con 35B parámetros totales y 3B activos por token, basado en arquitectura qwen3_5_moe. Presenta atención híbrida: solo 10 de las 40 capas usan atención completa, mientras que el resto emplea atención lineal, lo que reduce drásticamente el tamaño de la cache KV y permite contexto de 262.144 tokens. El head MTP (multi-token prediction) está incluido y se conserva en BF16, lo que habilita la decodificación especulativa en vLLM. La torre de visión también se mantiene en BF16, preservando las capacidades multimodales (imagen y vídeo) del modelo original.

La versión heretic-ja fue creada por OS-Software aplicando el método Arbitrary-Rank Ablation (ARA) con LoRA y preservación de norma por fila, que elimina el comportamiento de rechazo por seguridad (refusal) del modelo original. Esta conversión de spele1100 aplica una cuantización mixta: las capas densas y de atención se cuantifican a FP8 dinámico (W8A8, escalas por token, sin calibración), mientras que los 256 expertos del MoE se cuantifican a NVFP4 W4A4 con grupo de 16. No se han publicado detalles sobre el entrenamiento del modelo original (datos, tokens, RLHF), ni tampoco sobre el proceso de abliteración más allá de la metodología mencionada.

## Capacidades

- Razonamiento (reasoning): el modelo genera una cadena de pensamiento en un bloque `thinking` antes de la respuesta final; se puede usar con `--reasoning-parser qwen3` para extraerla en un campo `reasoning`.
- Visión: soporta entrada de imágenes y vídeo a través de la torre de visión BF16 preservada íntegramente.
- Decodificación especulativa: soporta MTP (multi-token prediction) con hasta 2 tokens especulativos en vLLM.
- Tool calling: el modelo emite bloques `<tool_call>` que pueden ser parseados por el servidor vLLM para exponerlos como tool calls de OpenAI.
- Multilingüismo: el modelo base es multilingüe (no se especifican idiomas concretos en la documentación disponible).
- Generación de texto y código: capacidades generales de generación de texto y código propias de la familia Ornith.
- Contexto largo: 262.144 tokens de contexto nativo, con cache KV pequeña gracias a la atención híbrida.

## Casos de uso

- Despliegue en DGX Spark (GB10) para inferencia local de alto rendimiento: con ~54 tokens/s en decodificación y un peso de ~21 GB, es viable ejecutar el modelo completo en una sola GB10 con 121 GB de memoria unificada, sin necesidad de servidores dedicados.
- Razonamiento y análisis multimodal en producción: el modelo combina razonamiento en cadena de pensamiento con visión (imagen/vídeo), permitiendo aplicaciones de análisis de documentos, diagnóstico visual asistido o revisión de vídeos con explicaciones razonadas.
- Asistente de código con contexto largo: gracias a los 262K tokens de contexto, puede trabajar sobre repositorios completos o conversaciones largas de programación, manteniendo el estado del proyecto en la ventana de contexto.
- Agentes autónomos con tool calling: el soporte de `<tool_call>` y el parser integrado en vLLM permiten construir agentes que llaman funciones externas (APIs, bases de datos, scripts) en un flujo de razonamiento multi-paso.
- Aplicaciones de investigación sin censura (uso responsable): la versión abliterada puede emplearse en entornos de investigación donde se requiere explorar respuestas sin restricciones de seguridad, siempre bajo las leyes locales y con las advertencias éticas correspondientes.
- Inferencia en tiempo real con decodificación especulativa: el head MTP permite acelerar la generación con vLLM `--speculative-config`, útil para aplicaciones interactivas de chat o streaming donde la latencia es crítica.
- Uso educativo y de demostración de MoE en hardware de consumo: al ser un modelo con solo 3B activos, se puede ejecutar en GPUs de gama media (RTX 3090/4090) con cuantización GGUF adicional, aunque el formato actual es safetensors/compressed-tensors.

## Benchmarks y rendimiento

Se han medido solo rendimientos de decodificación en una única GB10 (121 GB de memoria unificada, vLLM 0.26.1rc1, SM121):

| Configuración | Throughput de decodificación |
|---|---|
| Este checkpoint (ruta Marlin/compressed-tensors) | ~54 tok/s |
| Checkpoint oficial ornith-ai NVFP4 + FlashInfer + MTP(2) | ~86 tok/s |

Protocolo: `/v1/completions`, greedy, `ignore_eos`, 800 tokens, 1 warmup, mediana de 3. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La abliteración puede reducir el rendimiento en benchmarks relacionados con rechazo de contenido.

## Requisitos de hardware

- VRAM estimada: el peso total es de ~21 GB (NVFP4/FP8); en una GB10 con 121 GB de memoria unificada cabe sin problemas. En GPUs convencionales con VRAM dedicada, se necesitan al menos 24 GB para el modelo completo en FP8/NVFP4, o ~12 GB si se usa cuantización GGUF de 4 bits (no incluida en este repo).
- GPUs recomendadas: NVIDIA GB10 (DGX Spark / Spark Mini, SM121) como objetivo principal. En consumer GPU, se puede ejecutar en RTX 3090 (24 GB) o superior, aunque la velocidad será menor y no se aprovecha la ruta Marlin optimizada para SM121.
- Opciones de despliegue: vLLM (≥ 0.26) con `--safetensors-load-strategy=prefetch` y `--speculative-config` para MTP. También puede usarse con SGLang, aunque no se han medido rendimientos en este repo.
- Latencia y throughput: ~54 tok/s en decodificación en GB10 con vLLM, sin FlashInfer; con FlashInfer compilado para SM121 se puede llegar a ~86 tok/s según el checkpoint oficial.
- Nota: los kernels NVFP4 requieren Marlin (SM121) o FlashInfer compilado desde el código fuente con `FLASHINFER_CUDA_ARCH_LIST="12.0f 12.1a"` para aprovechar los kernels FP8.

## Comparativa con modelos similares

| Modelo | Params | Activos | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Heretic-GB10 (este) | 35B | ~3B | 262K | MIT | NVFP4/FP8 mixto | Abliterado, VLM, MTP, optimizado GB10 |
| Ornith-1.5-35B-A3B-NVFP4 (oficial ornith-ai) | 35B | ~3B | 262K | MIT | NVFP4 | No abliterado, ~86 tok/s con FlashInfer |
| Ornith-1.5-35B-A3B (BF16) | 35B | ~3B | 262K | MIT | BF16 | Peso completo ~70 GB, requiere GPU de 80 GB |

No hay datos de benchmarks de calidad comparativos entre estos modelos. La diferencia principal es la abliteración y la cuantización más agresiva (W4A4 en expertos) que reduce el rendimiento de deco en un ~37% respecto al oficial NVFP4.

## Limitaciones y advertencias

- Contenido sin censura: el modelo es una versión abliterada que elimina el rechazo a peticiones dañinas u ofensivas. El uso debe ser responsable y conforme a las leyes locales.
- Rendimiento en benchmarks: la abliteración puede degradar los resultados en tareas que implican rechazo de contenido dañino; no se han publicado evaluaciones de calidad.
- Requisitos de kernels: la ruta NVFP4 requiere kernels Marlin o FlashInfer compilados para SM121; sin ellos, el rendimiento se degrada significativamente.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base es multilingüe, pero la versión heretic-ja parece estar orientada a japonés (sufijo `ja`).
- Sin garantía de calidad: es una conversión comunitaria no oficial, sin evaluaciones de seguridad ni de sesgos.
- Dependencia de vLLM: requiere vLLM ≥ 0.26 y el parser de razonamiento qwen3 para obtener el campo `reasoning`.
- Riesgo de alucinaciones: como todo LLM, puede generar información falsa o inventada, especialmente en contextos de razonamiento largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spele1100/Ornith-1.5-35B-A3B-Heretic-GB10-NVFP4
- Modelo base (abliterado): https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo GGUF del original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Hilo de NVIDIA Forums sobre la familia Ornith-1.5: https://forums.developer.nvidia.com/t/deepreinforce-ornith-1-5-family-released/380623
- Repositorio de benchmarks en DGX Spark: https://github.com/vcruz305/Ornith-1.5-35B-A3B-DGX-Spark
- ModelScope del original: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Proyecto Heretic: https://heretic-project.org
