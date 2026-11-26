# Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF

## Resumen

Qwen3.6-35B-A3B-TR2.25-G-GGUF es una cuantización ternaria (2,25 trits por peso de media) del modelo Qwen3.6-35B-A3B del equipo Qwen, publicada por el usuario Ternii bajo licencia Apache-2.0. No se trata de un modelo nuevo entrenado desde cero, sino de una traducción de pesos sin reentrenamiento que empaqueta los mismos códigos y escalas que la versión TR2.25-G original en un único archivo GGUF para llama.cpp. El objetivo es claro: reducir el peso del modelo base (34.660.610.688 parámetros totales, arquitectura MoE) hasta 16,49 GB para que pueda ejecutarse íntegramente en la GPU de un Mac de 24 GB, algo imposible con un GGUF de 4 bits estándar como Q4_K_M (21,17 GB).

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización agresiva (ternaria, con tipos de tensor propietarios `TQ9_128`, `TQ27_128` y `TQ81_128`) que no existe en el llama.cpp upstream, lo que implica que builds estándar, LM Studio y Ollama no pueden cargarla. Por otro, ofrece una alternativa de mayor fidelidad (TR2.27-GK) para equipos con 24 GB o más, con la mitad de deriva respecto al original (KLD medio 0,087 frente a 0,176). Es un modelo solo de texto, sin codificador de visión ni cabeza MTP, y declara únicamente inglés como idioma soportado.

La ficha describe las especificaciones, la arquitectura heredada del modelo base, las capacidades, los casos de uso realistas, los benchmarks publicados por el autor y los requisitos de hardware, incluyendo el modo experimental de caché de expertos en SSD para Macs de 16 GB. Se indica explícitamente cuándo un dato no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de Qwen3.6-35B-A3B; solo texto, sin codificador de visión ni cabeza MTP |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (el modelo base es A3B, pero la cifra exacta de parámetros activos no se detalla en la información proporcionada) |
| Longitud de contexto | no disponible como valor nominal del modelo; el autor recomienda `-c 4096` en los ejemplos de llama-server y usa 4k de contexto en las mediciones |
| Tipos de cuantizacion | Cuantización ternaria TR2.25-G (2,25 trits por peso de media), tipos de tensor `TQ9_128` / `TQ27_128` / `TQ81_128`; requiere llama.cpp parcheado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo único de 16,49 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE) de 34.660.610.688 parámetros totales, desarrollado por el equipo Qwen. Esta publicación no reentrena el modelo: aplica una traducción de cuantización ternaria sobre los pesos originales (revisión `995ad96e`) sin reentrenamiento, manteniendo los mismos códigos y escalas que la versión TR2.25-G sin empaquetar. El resultado se serializa en un único GGUF de 16,49 GB con 2,25 trits por peso de media.

La innovación técnica principal es el esquema de cuantización ternaria con tipos de tensor propios que no existen en llama.cpp upstream, lo que obliga a usar la serie de parches del autor sobre ggml-org/llama.cpp (`@ff5a233`). El runtime soporta Metal (Apple silicon) y, desde la revisión r4, también CUDA, probado únicamente en una DGX Spark (GB10). En CUDA, la ruta de prompt con tensor cores altera las salidas (`GGML_CUDA_TQ_MM=0` la desactiva; `GGML_CUDA_TQ_MM_V2=1` recupera la ruta de r5). En cuanto a datos de entrenamiento, la model card lista `nvidia/OpenCodeInstruct`, `EleutherAI/hendrycks_math` y `openai/gsm8k` como datasets asociados, pero no se detalla el número de tokens ni la composición del corpus de preentrenamiento del modelo base, ni si hubo RLHF o DPO. Qwen3.6 opera en modo thinking por defecto con `--jinja`, lo que puede consumir más de 1.000 tokens en `reasoning_content` antes de responder.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat vía `--jinja`.
- Modo thinking (razonamiento explícito en `reasoning_content`), activado por defecto; se puede desactivar con `--reasoning off` o con `"chat_template_kwargs": {"enable_thinking": false}` en la petición.
- Razonamiento matemático y resolución de problemas, evidenciado por los benchmarks GSM8K publicados por el autor.
- Generación y edición de código, con resultados en HumanEval+ y MBPP+ reportados en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades especiales: solo texto; sin visión, sin audio y sin cabeza MTP.

## Casos de uso

- Chat local en Mac de 24 GB o más: el archivo de 16,49 GB cabe entero en la GPU con 0,35 GB de margen a 4k de contexto, permitiendo un asistente conversacional privado sin conexión mediante `llama-server` y la interfaz web integrada.
- Despliegue en MacBook Air de 16 GB (experimental): con el modo de caché de expertos en SSD (`LLAMA_MOE_SSD=1`, `LLAMA_MOE_CACHE_MIB=8400`), el modelo corre a unos 35 tokens/s en un MacBook Air M5 de 16 GB, adecuado para prototipado y pruebas puntuales.
- Razonamiento matemático asistido: los resultados de GSM8K (90,83 en la ruta CUDA nueva) lo hacen utilizable para resolver problemas aritméticos y de álgebra paso a paso en un entorno local.
- Generación de código en flujos de desarrollo: con HumanEval+ en torno al 92 y MBPP+ en torno al 91, puede emplearse como asistente de programación en el editor o en scripts de automatización, siempre que se integre con el runtime parcheado.
- Evaluación de técnicas de cuantización: investigadores que estudien el compromiso entre tamaño, velocidad y fidelidad pueden comparar este archivo con Q4_K_M (KLD 0,176 frente a 0,046) y con TR2.27-GK (KLD 0,087) usando el mismo harness de llama.cpp.
- Inferencia en DGX Spark (GB10) con CUDA: con 91,7 tokens/s de decodificación y 2.132 tokens/s de prompt a 512 tokens, sirve para experimentos de laboratorio en un equipo de escritorio con GPU integrada.
- Despliegue en entornos con restricciones de memoria: cuando el presupuesto de VRAM o de RAM unificada es de 16-24 GB y no se puede usar un 4-bit estándar, esta cuantización ternaria es la única opción que cabe completamente en memoria.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card se refieren a la ruta CUDA de la revisión r6 frente a r5, y a comparaciones de fidelidad frente al original. No se han publicado resultados de benchmarks adicionales en la información disponible.

| Metrica | Valor |
|---|---|
| GSM8K (ruta CUDA nueva, r6) | 90,83 (frente a 90,37 en r5) |
| HumanEval+ (ruta CUDA nueva, r6) | 92,07 (frente a 92,07 en r5) |
| MBPP+ (ruta CUDA nueva, r6) | 91,01 (frente a 91,27 en r5) |
| KLD medio vs Q8_0 (menor es mejor) | 0,176 |
| Mismo token top que el original | 79 % (la cifra queda truncada en la model card; el autor cita 80 % para TR2.27-GK) |
| Perplejidad | 8,12 |
| Decodificación en DGX Spark (CUDA) | 91,7 tokens/s (r6, frente a 85,5 en r5) |
| Prompt en DGX Spark a 512 tokens | 2.132 tokens/s (r6, frente a 2.016 en r5) |
| Decodificación en MacBook Air M5 16 GB | ~35 tokens/s (modo caché de expertos en SSD) |

## Requisitos de hardware

- VRAM/RAM unificada: 16,49 GB de archivo; cabe entero en la GPU de un Mac de 24 GB con 0,35 GB de margen a 4k de contexto.
- Mac de 16 GB: modo experimental con expertos en SSD detrás de una caché de 8.400 MiB (`LLAMA_MOE_SSD=1`, `LLAMA_MOE_CACHE_MIB=8400`, `LLAMA_MOE_CACHE_MAX_BATCH=512`, `LLAMA_MOE_ASYNC=1`), con `caffeinate -ims` para evitar que la GPU baje de frecuencia.
- GPU recomendadas: Apple silicon (Metal) es la plataforma principal; CUDA está soportado desde r4, probado únicamente en una DGX Spark (GB10). No hay datos de compatibilidad con A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, en Macs de 24 GB o más; en Macs de 16 GB solo en modo experimental con caché en SSD. No se confirma compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: llama.cpp parcheado (serie de parches sobre `@ff5a233`), con binarios precompilados `llama.cpp-tr-b11721-r6` para macOS arm64 (Metal) y Linux arm64 (CPU y CUDA para DGX Spark). No funciona con llama.cpp upstream, LM Studio ni Ollama.
- Latencia y throughput: 91,7 tokens/s de decodificación y 2.132 tokens/s de prompt a 512 tokens en DGX Spark (r6); ~35 tokens/s en MacBook Air M5 de 16 GB. El autor indica que TR2.27-GK es un 3 % más lento en Mac y un 7 % más lento en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| TR2.25-G (este archivo) | 34.660.610.688 | 4k recomendado | 16,49 GB | apache-2.0 | GGUF, requiere llama.cpp parcheado | KLD 0,176; 79-80 % mismo token top; perplejidad 8,12 |
| TR2.27-GK (misma familia) | 34.660.610.688 | 4k recomendado | 16,64 GB (+0,15 GB) | apache-2.0 | GGUF, requiere llama.cpp parcheado | KLD 0,087; 88 % mismo token top; perplejidad 7,38; 3 % más lento en Mac, 7 % en DGX Spark |
| Q4_K_M (4 bits estándar) | 34.660.610.688 | no disponible | 21,17 GB | apache-2.0 | GGUF estándar, LM Studio y Ollama | KLD 0,046; no cabe en GPU de 24 GB según el presupuesto asumido por el autor |

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado: los tipos de tensor `TQ9_128`, `TQ27_128` y `TQ81_128` no existen en upstream, por lo que builds estándar, LM Studio y Ollama no pueden cargar el archivo.
- Mayor deriva respecto al original que un 4-bit estándar: KLD medio 0,176 frente a 0,046 de Q4_K_M, y solo el 79-80 % de mismo token top.
- Solo inglés: el campo `language` de la model card declara únicamente `en`; no hay soporte multilingüe documentado.
- Solo texto: sin codificador de visión, sin audio y sin cabeza MTP.
- Modo thinking por defecto: con `--jinja`, una pregunta corta puede gastar más de 1.000 tokens en `reasoning_content`; 3 de 4 peticiones de prueba alcanzaron el límite de 1.024 tokens.
- En CUDA, la ruta de prompt con tensor cores cambia las salidas; es necesario ajustar `GGML_CUDA_TQ_MM` o `GGML_CUDA_TQ_MM_V2` según el comportamiento deseado.
- El modo de caché de expertos en SSD para Macs de 16 GB es experimental y depende de variables de entorno específicas.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; se heredan los del modelo base Qwen3.6-35B-A3B, no documentados en esta model card.
- Licencia Apache-2.0: permite uso comercial, pero la obligación de usar un runtime parcheado puede complicar el despliegue en producción.

## Enlaces

- [Hugging Face: Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF](https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Alternativa de mayor fidelidad: Ternii/Qwen3.6-35B-A3B-TR2.27-GK-GGUF](https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.27-GK-GGUF)
- [Repositorio del runtime: github.com/ternii-ai/tritq-vllm](https://github.com/ternii-ai/tritq-vllm)
- [Parches de llama.cpp: runtime/llama.cpp](https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp)
- [Binarios precompilados: llama.cpp-tr-b11721-r6](https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r6)
- [Instalador de una línea para Mac](https://raw.githubusercontent.com/ternii-ai/tritq-vllm/main/mac/qwen36-35b.sh)
