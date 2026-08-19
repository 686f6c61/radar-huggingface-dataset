# vmarcelo/Qwen3.8-27B-MIX_GGUF

## Resumen

`vmarcelo/Qwen3.8-27B-MIX_GGUF` es una cuantización GGUF personalizada del modelo multimodal denso `Qwen/Qwen3.8-27B-FP8`, desarrollada por el usuario vmarcelo. El modelo base, de 27.320 millones de parámetros, emplea una arquitectura híbrida que combina atención lineal (GatedDeltaNet) con atención completa estándar, e incorpora un encoder de visión y una cabeza de Multi-Token Prediction (MTP). Esta ficha se centra en la versión cuantizada, que busca ajustar el modelo a un presupuesto de 16 GB de VRAM en GPUs de consumo.

La relevancia de esta publicación radica en su enfoque práctico: ofrece dos recetas de cuantización mixta por tensor (IQ4-MIX e IQ3-MIX) calculadas con imatrix, priorizando la preservación de tensores críticos (como `output.weight`, `attn_v` y `ffn_down`) mediante la filosofía "sensitive trio". Esto permite ejecutar un modelo de 27B multimodal con velocidades de entre 33 y 37 tokens por segundo en hardware como una AMD Radeon RX 9070 XT, algo inviable con los pesos originales en FP8. El repositorio incluye también el proyector de visión (`mmproj-F16.gguf`) y las recetas de cuantización para reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GatedDeltaNet + Gated Attention) con encoder de visión y cabeza MTP |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 (nativo del modelo base); limitado a 16K-64K (IQ4-MIX) o 64K-128K (IQ3-MIX) según VRAM |
| Tipos de cuantizacion | IQ4-MIX (4.13 BPW) e IQ3-MIX (3.68 BPW); proyector de visión en F16 |
| Idiomas soportados | Multilingüe (probado en FR/DE/JA por el autor) |
| Licencia | qwen-research (licencia de investigación de Qwen) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B-FP8` es un transformer denso de 64 capas más una capa adicional de MTP (65 en total). Su atención es híbrida: 48 capas utilizan atención lineal estilo GatedDeltaNet (SSM) y las 16 restantes (cada cuarta capa) emplean atención completa estándar. El vocabulario es de 248.320 tokens, con un tamaño oculto de 5.120 y una longitud de contexto nativa de 262.144 tokens. Incluye un encoder de visión para tareas multimodales.

La cuantización realizada por vmarcelo se construyó con llama.cpp (commit `1692f9e`) y una imatrix calculada sobre 10 chunks de 2048 tokens de wikitext-103. La receta IQ4-MIX asigna IQ4_XS a las proyecciones FFN, IQ3_S a la atención lineal, Q4_K a la atención completa, Q5_K al LM head e IQ2_S a los embeddings. La receta IQ3-MIX es más agresiva en FFN gate/up y atención lineal (IQ3_XXS e IQ2_S), pero mantiene `ffn_down`, `attn_v` y el LM head en Q5_K. No se proporcionan detalles sobre el dataset de entrenamiento del modelo base original.

## Capacidades

- Generación de texto y razonamiento multilingüe, con soporte para tareas de código (explicación y escritura).
- Procesamiento multimodal de imágenes mediante el proyector de visión `mmproj-F16.gguf`, cargado con la opción `--mmproj`.
- Preservación de la cabeza de Multi-Token Prediction (MTP), que permite predecir múltiples tokens futuros simultáneamente.
- Soporte para flujos agénticos y contextos largos, especialmente en la variante IQ3-MIX que alcanza hasta 128K de contexto con KV cache mixto.
- Compatibilidad con backends Vulkan (probado en AMD) y CPU mediante llama.cpp y LM Studio.
- Capacidad de procesamiento de prompts con caché (hasta 638 tok/s en prompts cacheados de 2000+ tokens).

## Casos de uso

- Asistente de programación local: con IQ4-MIX a 33 tok/s, se puede integrar en editores de código para explicar fragmentos, generar funciones (como `is_palindrome`) o revisar lambdas, sin depender de la nube.
- Análisis de documentos extensos: la variante IQ3-MIX, con soporte de hasta 128K de contexto, permite resumir o extraer información de contratos, informes o libros completos en una sola pasada.
- Descripción y análisis de imágenes: gracias al `mmproj-F16`, el modelo puede describir imágenes en tiempo real, útil para accesibilidad o automatización de metadatos.
- Desarrollo de agentes autónomos: la combinación de contexto largo (64K-128K) y velocidad de 37 tok/s en IQ3-MIX lo hace adecuado para pipelines agénticos que requieren múltiples pasos de razonamiento.
- Chatbot multilingüe autoalojado: probado en francés, alemán y japonés, puede desplegarse como servidor de chat en una GPU de 16 GB para entornos con requisitos de soberanía de datos.
- Experimentación en investigación: al ser una cuantización reproducible (con recetas publicadas), permite estudiar el impacto de la cuantización mixta en arquitecturas híbridas SSM+atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de rendimiento propias en hardware específico (AMD Radeon RX 9070 XT, gfx1201, 16 GB VRAM) con LM Studio Vulkan:

| Prueba | IQ4-MIX (tok/s) | IQ3-MIX (tok/s) |
|---|---:|---:|
| Texto PT (fotossíntese) | 32.0 | 36.7 |
| Texto EN (photosynthesis) | 32.2 | 37.5 |
| Razonamiento (contar 'r' en strawberry) | 32.8 | 37.9 |
| Explicación de código (lambda) | 33.4 | 37.4 |
| Escritura de código (is_palindrome) | 33.3 | 37.4 |
| Multilingüe (FR/DE/JA) | 32.8 | 37.5 |
| Razonamiento largo (5 usos de LLM) | 33.2 | 37.9 |
| Visión (descripción de imagen) | 33.4 | 37.9 |
| **Media de generación** | **33.0** | **37.5** |

El prompt processing alcanza 638-655 tok/s con caché (prompts de 2000+ tokens) y 75-131 tok/s en prompts cortos.

## Requisitos de hardware

- VRAM objetivo: 16 GB en GPUs de consumo.
- IQ4-MIX: ~15.7 GB con contexto de 16K (KV cache Q8_0); soporta hasta 64K con 15.4 GB.
- IQ3-MIX: ~14.6 GB con contexto de 16K; soporta hasta 128K con 15.0 GB (KV cache Q8_0+Q4_0) y hasta 256K con 14.6 GB (KV cache Q4_0).
- GPU probada: AMD Radeon RX 9070 XT (gfx1201) con backend Vulkan. Compatible con cualquier GPU Vulkan con 16 GB de VRAM.
- Velocidad de generación: 33-37 tok/s según variante; prompt processing de 635-655 tok/s en caché.
- Despliegue recomendado: llama.cpp (`llama-server`) con flags `--mmproj`, `--flash-attn on` y `--cache-type-k/v`. También compatible con LM Studio.
- No se recomienda para GPUs con menos de 12 GB de VRAM, ya que el contexto se vería severamente limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | VRAM (16K ctx) | Velocidad (RX 9070 XT) | Licencia |
|---|---|---|---:|---:|---:|---|
| Qwen3.8-27B-FP8 (base) | 27,3 B | 262.144 | FP8 (safetensors) | >27 GB (no cabe en 16 GB) | No aplica | qwen-research |
| vmarcelo/Qwen3.8-27B IQ4-MIX | 27,3 B | Hasta 64K | GGUF (IQ4_MIX) | ~15.7 GB | 33.0 tok/s | qwen-research |
| vmarcelo/Qwen3.8-27B IQ3-MIX | 27,3 B | Hasta 128K | GGUF (IQ3_MIX) | ~14.6 GB | 37.5 tok/s | qwen-research |

No se dispone de datos de comparación con otras cuantizaciones GGUF estándar (como Q4_K_M) del mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- La licencia `qwen-research` restringe el uso a fines de investigación; es necesario verificar los términos exactos de la licencia antes de cualquier uso comercial.
- La cuantización IQ3-MIX aplica IQ2_S a los embeddings y a la atención lineal, lo que puede degradar la calidad en tareas que dependen fuertemente de la representación semántica, según advierte el propio autor.
- El contexto máximo depende críticamente de la VRAM y del tipo de KV cache; superar los límites indicados provoca fallos de asignación de memoria.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.), por lo que la calidad relativa frente a otros modelos de 27B no está verificada de forma independiente.
- El rendimiento medido (33-37 tok/s) es específico de la RX 9070 XT con Vulkan; en otras GPUs (NVIDIA, Intel) o en CPU los resultados pueden variar significativamente.
- La preservación de la cabeza MTP y el encoder de visión depende de la compatibilidad del runtime; se recomienda usar la versión de llama.cpp indicada (commit `1692f9e`) o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vmarcelo/Qwen3.8-27B-MIX_GGUF
- Modelo base (FP8): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8/blob/main/LICENSE
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
