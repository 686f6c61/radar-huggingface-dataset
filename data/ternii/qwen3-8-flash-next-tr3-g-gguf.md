# Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF

## Resumen

Qwen3.8-Flash-Next-TR3-G-GGUF es una cuantización experimental del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario Ternii (Wai Chung) bajo el esquema denominado TR Quantisation. Se trata de un transformer de tipo Mixture-of-Experts de aproximadamente 180.000 millones de parámetros totales (125B con 6B activados según el desglose de Qwen, más 51B de tabla de embeddings n-gram y 4B de MTP), empaquetado en formato GGUF para su ejecución en llama.cpp sobre Apple Silicon. La particularidad técnica es que las capas lineales y los expertos enrutados se almacenan a 3 trits por peso (27 niveles, con una escala de 16 bits por grupo de 128 pesos), mientras que la tabla de embeddings n-gram se redondea a valores de 3 trits y se guarda en un contenedor Q5_0.

El modelo base resuelve generación de texto conversacional y razonamiento, y esta variante busca hacer viable su inferencia en Macs de memoria unificada limitada manteniendo los expertos en el SSD detrás de una caché fija, en lugar de requerir la VRAM completa. Es relevante ahora porque demuestra una vía de cuantización extrema (ternaria) sobre arquitecturas MoE de gran tamaño, aunque con un coste importante en portabilidad: requiere un fork parcheado de llama.cpp que introduce el tipo de tensor `TQ27_128`, inexistente en el upstream, por lo que las compilaciones estándar, LM Studio y Ollama no pueden cargarlo.

La información disponible es limitada: el autor solo documenta el idioma inglés, no publica benchmarks de precisión frente al modelo base y advierte que las velocidades medidas se obtuvieron emulando tamaños de memoria en un único Apple M5 Max de 128 GB, sin haber probado equipos reales de 16, 24, 32, 48 o 64 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con tabla de embeddings n-gram y cabeza MTP |
| Parametros totales | 176.943.899.520 (~180B; desglose del autor: 125B con 6B activados + 51B n-gram + 4B MTP) |
| Parametros activos | 6B (según el desglose de Qwen para el modelo base) |
| Longitud de contexto | No disponible como especificación oficial; los ejemplos y mediciones usan 4096 tokens |
| Tipos de cuantizacion | TR3-G: 3 trits por peso (27 niveles, escala de 16 bits por grupo de 128 pesos) en capas lineales y expertos enrutados; embeddings n-gram a 3 trits en contenedor Q5_0; pesos de hiperconexión a 8 bits |
| Idiomas soportados | Inglés (según la model card y los tags) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (10 shards; tipo de tensor propietario `TQ27_128`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con aproximadamente 180B de parámetros totales, de los cuales 6B se activan por token según el desglose de Qwen. Incluye una tabla de embeddings n-gram de 51B parámetros y una cabeza MTP (multi-token prediction) de 4B. Esta variante TR3-G elimina la cabeza MTP y el codificador de visión: es un modelo exclusivamente de texto. La cuantización no implica reentrenamiento: se parte de los pesos BF16 de Qwen y se aplica TR Quantisation con calibración GPTQ (el sufijo -G), reduciendo las capas lineales y los expertos enrutados a 3 trits con una escala de 16 bits por cada grupo de 128 pesos.

El autor indica que el modelo se construyó desde los pesos BF16 de Qwen y no deriva de ningún checkpoint de NVIDIA. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; los datasets listados en la model card (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k, OpenAssistant/oasst2) aparecen como metadatos del repositorio, no como datos de entrenamiento de esta cuantización. La innovación técnica destacable es el esquema de cuantización ternaria con caché de expertos en SSD y dos fusiones de decodificación específicas para Metal (`GGML_METAL_OPT_GDNPREP` y `GGML_METAL_OPT_NGATED`).

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" activado por defecto con `--jinja`; se puede desactivar con `--reasoning off`, con `"chat_template_kwargs": {"enable_thinking": false}` o aumentando `max_tokens`.
- Capacidad de razonamiento matemático y resolución de problemas tipo GSM8K, usada por el autor en sus pruebas de velocidad.
- Generación de código, inferida de los datasets listados en los metadatos del repositorio (no verificada en la model card).
- No incluye visión: el codificador visual ha sido eliminado.
- No incluye cabeza MTP: la predicción multi-token del modelo base no está disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada limitada: el modelo mantiene los expertos en el SSD detrás de una caché configurable (`LLAMA_MOE_CACHE_MIB`), lo que permite ejecutarlo en Macs desde 16 GB con el ajuste de caché de 5900 MiB, a costa de velocidades bajas en los equipos más pequeños.
- Experimentación con cuantización ternaria: útil para investigadores que quieran evaluar el impacto de 3 trits por peso en un MoE de ~180B frente a cuantizaciones de 4 u 8 bits, usando el fork `tritq-vllm` y el tipo de tensor `TQ27_128`.
- Servicio de chat de un solo usuario en local: el autor mide con `-np 1` y una sola secuencia, por lo que el escenario realista es un servidor `llama-server` monousuario con contexto de 4096 tokens.
- Pruebas de razonamiento matemático en local: el autor emplea preguntas de GSM8K con thinking desactivado y hasta 512 tokens de respuesta para medir velocidad de decodificación.
- Validación de pipelines de cuantización: el repo sirve como referencia para probar la cadena GPTQ + TR Quantisation + empaquetado GGUF sobre pesos BF16 de Qwen.
- Evaluación de latencia y throughput en Metal: útil para medir el rendimiento de decodificación con fusiones específicas (`GGML_METAL_OPT_GDNPREP`, `GGML_METAL_OPT_NGATED`) en un M5 Max.
- No es adecuado para despliegues en producción multiusuario ni en GPU CUDA: el runtime solo soporta Metal y el autor no ha validado el binario Linux arm64 con este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de velocidad de decodificación (tokens/s) y memoria cableada en un Apple M5 Max de 128 GB emulando tamaños menores mediante el límite de caché de expertos, sin probar equipos reales de 16, 24, 32, 48 o 64 GB. Los valores concretos de tokens/s no se incluyen en el extracto disponible de la model card.

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 117,6 GB en disco (10 shards GGUF). El autor propone tamaños de caché de expertos de 35000 MiB (64 GB o más), 13501 MiB (32-48 GB), 6750 MiB (24 GB) y 5900 MiB (16 GB) mediante `LLAMA_MOE_CACHE_MIB`.
- GPU recomendadas: Apple Silicon con Metal; el autor midió en un Apple M5 Max de 128 GB. No hay soporte CUDA.
- ¿Cabe en GPU de consumo? Solo en Macs con memoria unificada, y con los expertos en SSD; no se ha validado en ninguna GPU discreta.
- Opciones de despliegue: exclusivamente el fork parcheado de llama.cpp del autor (`github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp`), con binarios precompilados `llama.cpp-tr-b11721` para macOS arm64. No funciona en llama.cpp upstream, LM Studio ni Ollama.
- Latencia y throughput: no disponibles en cifras en la información proporcionada; el autor advierte que serán menores en Macs reales de menor tamaño por lectura más frecuente del SSD y chips y discos más lentos.
- Nota de memoria del servidor: con `--cache-ram` activado (por defecto hasta 8 GiB), el footprint del servidor creció unos 235 MiB por petición hasta llenar la caché; con una caché de expertos de 38.254 MiB el proceso alcanzó 50,0 GB en el Mac de 128 GB. El autor recomienda `--cache-ram 0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF | ~180B totales, 6B activos | No disponible (ejemplos a 4096) | 3 trits (TR3-G) | qwen-community-1.0 | GGUF con fork de llama.cpp; solo Metal |
| Ternii/Qwen3.8-Flash-Next-TR2.57-G | No disponible | No disponible | 2 trits en expertos menos usados | qwen-community-1.0 | Orientado a vLLM; el runtime Mac no lo soporta aún |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales, 6B activos | No disponible | BF16 | qwen-community-1.0 | Pesos originales de Qwen |

El autor advierte explícitamente que TR3-G y TR2.57-G no son el mismo fichero y que los resultados no son transferibles entre ambos. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no hay validación en equipos reales de 16, 24, 32, 48 o 64 GB, solo emulación en un M5 Max de 128 GB.
- Requiere un fork parcheado de llama.cpp con el tipo de tensor `TQ27_128`; no carga en compilaciones estándar, LM Studio ni Ollama.
- Solo soporta Metal (Apple Silicon); CUDA no está soportado y el binario Linux arm64 del release no fue probado con este modelo.
- Solo inglés; sin capacidades de visión ni cabeza MTP.
- No se han publicado evaluaciones de precisión frente al modelo base, por lo que se desconoce la degradación introducida por la cuantización a 3 trits.
- Riesgo de alucinación inherente a los modelos de lenguaje; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El rendimiento en Macs pequeños será inferior al reportado por lectura más frecuente del SSD y hardware más lento.
- El servidor puede consumir hasta 8 GiB adicionales si se deja activada la caché de prompts (`--cache-ram`); el autor recomienda desactivarla, con el coste de reprocesar prefijos repetidos.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial; la model card la etiqueta como "other" con nombre `qwen-community-1.0`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime parcheado (fork de llama.cpp): https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Binarios precompilados: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721
- Repositorio tritq-vllm: https://github.com/ternii-ai/tritq-vllm
