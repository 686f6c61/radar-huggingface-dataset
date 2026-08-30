# Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-FP8-W8A8-NVFP4-TRTLLM

## Resumen

Este checkpoint, publicado por Xananthium, es una variante cuantizada y optimizada para despliegue del modelo Qwen3.6-35B-A3B, un modelo de lenguaje multimodal (imagen y texto) con arquitectura MoE híbrida desarrollado por Alibaba Qwen. El autor parte del fine-tuning "Uncensored" agresivo de HauhauCS, reconstruye los pesos al layout oficial de Hugging Face y los calibra con NVIDIA ModelOpt a FP8 W8A8, con KV cache NVFP4 en runtime. El resultado es un checkpoint listo para TensorRT-LLM que mantiene el contexto nativo de 262.144 tokens y las capacidades de visión del modelo base, pero con un uso de memoria reducido y mayor throughput en GPUs NVIDIA con soporte FP8.

La relevancia de este modelo radica en su doble vertiente: por un lado, hereda las capacidades agénticas de codificación de Qwen3.6 (razonamiento a nivel de repositorio, preservación de contexto de razonamiento, MTP para decodificación especulativa); por otro, la cuantización FP8 W8A8 con KV cache NVFP4 lo hace atractivo para despliegue en producción con baja latencia. Sin embargo, la compatibilidad con GPUs Ampere (SM86) es experimental, y el fine-tuning "Uncensored" implica que el modelo puede generar contenido sin filtros, lo que limita su uso en aplicaciones con moderación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE híbrida con Gated DeltaNet, Gated Attention y MoE) |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (8 expertos activados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | FP8 W8A8 (pesos y activaciones), KV cache NVFP4 en runtime |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint TensorRT-LLM/ModelOpt) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE híbrido con 40 capas. Cada capa sigue un patrón de 10 bloques, donde cada bloque contiene 3 subcapas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de MoE, y una subcapa de Gated Attention (16 cabezas Q, 2 KV, RoPE de 64 dimensiones) también seguida de MoE. El MoE tiene 256 expertos con 8 activados más 1 compartido, y dimensión intermedia de 512. Incluye un encoder de visión y un módulo MTP (Multi-Token Prediction) entrenado con multi-steps para decodificación especulativa.

El checkpoint de Xananthium se construye a partir del fine-tuning "Uncensored" de HauhauCS, cuyos pesos en formato GGUF Q8_K_P se reconstruyen al layout oficial de Hugging Face de Qwen3.6 mediante transformaciones inversas de layout. Los tensores de visión y MTP se toman del modelo base Qwen/Qwen3.6-35B-A3B. Posteriormente, el checkpoint reconstruido se calibra y exporta con NVIDIA ModelOpt 0.47.0rc0 (commit 022767c) usando el script `hf_ptq.py` con `--qformat fp8`, `--kv_cache_qformat nvfp4`, dataset CNN/DailyMail, 256 muestras de calibración, secuencia de 512 tokens y tensor parallelism de 2. La calibración completó sin NaNs, y el archivo `hf_quant_config.json` reporta `quant_algo: FP8` y `kv_cache_quant_algo: NVFP4`.

## Capacidades

- Generación de texto y razonamiento multi-step, con modo de pensamiento preservado en mensajes históricos.
- Comprensión de imágenes (pipeline image-text-to-text), capaz de procesar entradas visuales junto con texto.
- Coding agéntico: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio, según las mejoras de Qwen3.6.
- Soporte de tool calling / function calling, habilitado por el entrenamiento agéntico del modelo base.
- Contexto largo nativo de 262.144 tokens, extensible hasta 1.010.000, ideal para documentos extensos y repositorios completos.
- MTP (Multi-Token Prediction) para decodificación especulativa, que acelera la generación en tareas de autocompletado.
- Capacidades multilingües no confirmadas en la información disponible, pero heredadas del modelo base Qwen3.6.

## Casos de uso

- Asistente de programación con contexto de repositorio completo: gracias a su ventana de 262K tokens, el modelo puede analizar un repositorio entero, comprender la arquitectura existente y generar código coherente con las convenciones del proyecto.
- Agente autónomo de resolución de issues: con tool calling y razonamiento multi-step, puede navegar por issues, proponer parches, ejecutar pruebas y actualizar documentación de forma autónoma.
- Análisis de documentos técnicos largos con figuras y diagramas: al ser multimodal, puede procesar informes de ingeniería, papers académicos o manuales que incluyan imágenes, tablas y gráficos, extrayendo información relevante.
- Despliegue de baja latencia en producción: la cuantización FP8 W8A8 con KV cache NVFP4 reduce el uso de memoria y mejora el throughput en GPUs NVIDIA con soporte FP8, adecuado para servicios de chat o generación de código en tiempo real.
- Generación de código con decodificación especulativa: el módulo MTP permite acelerar la inferencia en tareas de autocompletado de código, reduciendo la latencia percibida en IDEs y editores.
- Investigación en generación de contenido sin restricciones: el fine-tuning "Uncensored" permite explorar temas sensibles o creativos sin rechazo del modelo, útil para investigación en ciencias sociales, literatura experimental o generación de guiones.

## Benchmarks y rendimiento

La model card upstream de Qwen3.6-35B-A3B incluye una tabla comparativa con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B, Gemma4-26BA4B y Qwen3.6-35BA3B, pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks específicos para este checkpoint cuantizado. El foro de NVIDIA reporta mejoras de throughput (+56%) y prefill (+63%) en builds similares de Qwen3.6-35B-A3B con FP8, pero no son datos oficiales de este modelo.

## Requisitos de hardware

- El checkpoint ocupa 38,3 GB en disco (pesos FP8).
- VRAM estimada: al menos 40-48 GB para los pesos más overhead de activaciones y KV cache. Con solo 3B parámetros activos, la memoria de activaciones es reducida, y el KV cache NVFP4 ayuda a disminuir el consumo.
- GPU recomendadas: NVIDIA H100, L40S, L40, RTX 4090 (con soporte FP8 nativo) o A100 80GB (aunque sin FP8 nativo, puede ejecutarse en FP16).
- TensorRT-LLM 1.3.0rc25 no soporta SM86 (RTX 3090) para el kernel FP8 MoE CUTLASS; el soporte en Ampere es experimental y no se recomienda para producción.
- Opciones de despliegue: TensorRT-LLM (recomendado), vLLM, SGLang, KTransformers (según la model card upstream).
- Latencia y throughput: no disponibles oficialmente; el foro de NVIDIA sugiere mejoras significativas en builds FP8 similares.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K | Apache 2.0 | FP16/BF16 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache 2.0 | FP16/BF16 |
| Gemma4-31B | 31B | denso | 128K | Gemma license | FP16 |
| Este checkpoint | 35,95B | 3B | 262K | Apache 2.0 | FP8 W8A8 + NVFP4 KV |

El checkpoint de Xananthium se diferencia de sus alternativas por la cuantización FP8 W8A8 con KV cache NVFP4, que reduce el uso de memoria y mejora el rendimiento en GPUs NVIDIA modernas. Frente al modelo base, añade el fine-tuning "Uncensored" de HauhauCS, que elimina los rechazos de contenido. Comparado con Gemma4-31B, ofrece un contexto mucho mayor (262K vs 128K) y una arquitectura MoE más eficiente en parámetros activos.

## Limitaciones y advertencias

- El fine-tuning "Uncensored" puede generar contenido inapropiado, ofensivo o dañino; no es adecuado para aplicaciones con moderación de contenido o requisitos de seguridad.
- La cuantización FP8 puede introducir pérdida de precisión en tareas de alta sensibilidad numérica, como matemáticas avanzadas o análisis financiero.
- La compatibilidad con GPUs Ampere (SM86) es experimental; no se recomienda su uso en producción con RTX 3090 u otras GPUs de esa generación.
- No se han publicado datos de idiomas soportados; se asume multilingüe por el modelo base, pero no está confirmado.
- El checkpoint está diseñado específicamente para TensorRT-LLM; puede requerir conversión adicional para otros runtimes como vLLM o SGLang.
- La licencia Apache 2.0 del checkpoint no exime de cumplir los términos del modelo base Qwen3.6, que también es Apache 2.0, pero se recomienda verificar los términos actualizados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un checkpoint reciente y poco probado por la comunidad.

## Enlaces

- https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-FP8-W8A8-NVFP4-TRTLLM
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- https://qwen.ai/blog?id=qwen3.6-35b-a3b
- https://forums.developer.nvidia.com/t/qwen-qwen3-6-35b-a3b-and-fp8-has-landed/366822/145
- https://github.com/QwenLM/Qwen3.8
