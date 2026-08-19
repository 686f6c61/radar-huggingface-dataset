# vroomfondel/Qwen3.8-27B-NVFP4-ModelOpt

## Resumen

El modelo `vroomfondel/Qwen3.8-27B-NVFP4-ModelOpt` es una cuantización NVFP4 (FP4) del modelo denso Qwen/Qwen3.8-27B, realizada con NVIDIA ModelOpt. El modelo original, desarrollado por Alibaba Qwen, es un vision-language model (VLM) con arquitectura híbrida Gated-DeltaNet, 27.000 millones de parámetros, ventana de contexto de 262.144 tokens y licencia Apache 2.0. Esta versión cuantizada reduce el tamaño del checkpoint a 20,6 GB (frente a los 55,6 GB del original en BF16), lo que permite ejecutarlo en hardware de gama media o en estaciones de trabajo con memoria unificada como el DGX Spark.

La cuantización, a diferencia de otras versiones NVFP4 de NVIDIA para Qwen3.5/3.6, cuantiza también la ruta de atención lineal Gated-DeltaNet (48 de las 64 capas), manteniendo en BF16 la torre de visión, el head MTP (draft head) y las capas de full-attention restantes. La caché KV se almacena en FP8. El autor advierte que la calibración se realizó solo con texto, por lo que la ruta multimodal es la superficie menos validada del modelo. Se ha verificado estructuralmente y superado una prueba de humo de cuatro prompts, pero no se ha publicado ninguna evaluación de calidad (como GSM8K) hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (híbrido Gated-DeltaNet + full attention, con vision tower) |
| Parametros totales | 15.193.246.960 (tensores en safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (FP4) para pesos, KV cache FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores NVFP4 y BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido que combina 48 capas con atención lineal Gated-DeltaNet y 16 capas con full attention, más una torre de visión de 27 capas que procesa imágenes. La cuantización NVFP4 de este repo aplica cuantización W4A4 a todas las capas del transformer, incluida la ruta de atención lineal, mientras que la torre de visión, el merger y los embeddings se mantienen en BF16. El head MTP (multi-token prediction) de una capa también permanece en BF16. La calibración se realizó exclusivamente con texto, lo que implica que los FFN del lado del lenguaje que consumen tokens de imagen proyectados no fueron calibrados con datos visuales.

El proceso de cuantización se llevó a cabo con NVIDIA ModelOpt, con offload a CPU/GPU en memoria unificada (recomendado `SEQ_DEVICE_MAP=0`). El autor indica que no se debe usar `SEQ_DEVICE_MAP=1` en un solo DGX Spark porque reserva demasiada memoria como GPU y provoca OOM. La exportación se validó estructuralmente y se sirvió con SGLang 0.5.17, requiriendo parches específicos para la cuantización de atención y las escalas KV (PR #31220 y #29151 del proyecto SGLang).

## Capacidades

- Generación de texto y razonamiento multi-step, incluyendo problemas aritméticos (verificado en prueba de humo con un problema de tren resuelto correctamente).
- Capacidades multimodales: procesamiento de imágenes a través de la torre de visión BF16 (aunque la ruta de imagen es la menos validada por la calibración solo textual).
- Soporte de tool calling y uso de agentes, según las capacidades del modelo base Qwen3.8-27B (mencionado en fuentes externas como Unsloth y Yottalabs).
- Ventana de contexto larga de 262K tokens, adecuada para tareas que requieren memoria extensa.
- Decodificación especulativa disponible gracias al head MTP (draft head) en BF16, aunque deshabilitada por defecto en el perfil de servido.
- Soporte multilingüe del modelo base (no detallado en la model card de la cuantización).

## Casos de uso

- Inferencia local en hardware de gama media: el checkpoint de 20,6 GB en NVFP4 permite ejecutar el modelo en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) o en estaciones con memoria unificada como el DGX Spark, sin necesidad de servidores multi-GPU.
- Despliegue en producción con SGLang: el modelo se ha validado con SGLang 0.5.17 usando el backend flashinfer, lo que lo hace apto para servir APIs de chat con baja latencia en entornos controlados.
- Prototipado de aplicaciones agénticas: gracias a la ventana de 256K y al soporte de tool calling, puede usarse para prototipar agentes que requieren razonamiento multi-paso y manejo de contexto largo.
- Investigación en cuantización extrema: el perfil NVFP4 con atención cuantizada sirve como caso de estudio para evaluar el impacto de W4A4 en arquitecturas híbridas Gated-DeltaNet.
- Procesamiento de documentos largos con soporte visual: al mantener la torre de visión en BF16, puede procesar imágenes y documentos extensos, aunque se recomienda validar la calidad en tareas multimodales antes de usarlo en producción.
- Evaluación comparativa de cuantizaciones: permite comparar el rendimiento de NVFP4 frente a otras cuantizaciones (FP8, GGUF) del mismo modelo base en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona en la model card que se debe realizar una evaluación GSM8K o similar antes de hacer afirmaciones de calidad, y que la prueba de humo de cuatro prompts no constituye una evaluación formal. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks para esta cuantización concreta.

## Requisitos de hardware

- Tamaño del checkpoint: 20,6 GB (pesos en NVFP4/BF16).
- VRAM estimada: al menos 24 GB para cargar el modelo completo en memoria de GPU. En sistemas con memoria unificada (como DGX Spark con 121 GB compartidos), se puede ejecutar con offload.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100, o el DGX Spark (GB10/sm121) utilizado en las pruebas del autor.
- Opciones de despliegue: SGLang 0.5.17 con backend flashinfer y parches específicos (PR #31220 y #29151). No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor solo indica que la generación fue coherente en la prueba de humo, sin medir rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | BF16 | Apache 2.0 | HuggingFace |
| vroomfondel/Qwen3.8-27B-NVFP4-ModelOpt | 15,2B (tensores) | 262K | NVFP4 (FP4) | Apache 2.0 | HuggingFace |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B (declarado) | 262K | NVFP4 | Apache 2.0 | HuggingFace (derivado similar, sin detalles) |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia frente al modelo base es el tamaño del checkpoint (20,6 GB frente a 55,6 GB) y la posible pérdida de calidad por la cuantización agresiva, aún no medida.

## Limitaciones y advertencias

- La calibración se realizó solo con texto, por lo que la ruta de visión (procesamiento de imágenes) es la menos validada y puede presentar degradaciones de calidad no detectadas.
- La cuantización de la atención Gated-DeltaNet es arriesgada: si las escalas no se cargan correctamente, el modelo produce "word salad" (texto incoherente) en lugar de errores aritméticos medibles.
- Requiere parches específicos de SGLang (PR #31220, #29151) y el backend flashinfer; el backend triton provoca un fallo en `RadixLinearAttention.forward` (issue #29577, aún abierto).
- La decodificación especulativa está deshabilitada por defecto en el perfil de servido; habilitarla requiere verificación adicional.
- No hay evaluación formal de calidad (GSM8K, MMLU, etc.) publicada para esta cuantización.
- El número de parámetros en safetensors (15,2B) difiere del declarado por el modelo base (27B); esto se debe a la fusión y cuantización de tensores, pero puede causar confusión en herramientas que lean los metadatos.
- No se ha confirmado compatibilidad con vLLM, llama.cpp u otros servidores de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vroomfondel/Qwen3.8-27B-NVFP4-ModelOpt
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Derivado similar (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página de Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
