# stuchapin/Nanbeige4.3-33B-Base-W4A16-AutoRound

## Resumen

Nanbeige4.3-33B-Base-W4A16-AutoRound es una cuantización simétrica de 4 bits (W4A16) del modelo base Nanbeige4.3-33B-Base, publicado por Nanbeige el 24 de octubre de 2026 y cuantizado por el usuario stuchapin mediante AutoRound en formato AutoGPTQ/Marlin. El modelo original es un transformer denso de 33.000 millones de parámetros orientado a generación de texto, con soporte de inglés y chino, y este cuantizado permite servirlo en una única GPU de consumo de 24 GB (RTX 3090/4090).

Su relevancia radica en que reduce el consumo de memoria de los pesos en 3,4x respecto al modelo BF16 original (de 65 GiB a 19,3 GiB) manteniendo el 98,8 % de la fidelidad según la perplejidad en WikiText-2. La cuantización se calibró con 256 turnos reales de producción multi-turno, lo que según el autor protege las cabezas de atención críticas de la degradación. Es una alternativa práctica para despliegues de alto rendimiento en hardware de consumo sin recurrir a modelos más pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia LLaMA, según tag `llama`) |
| Parametros totales | 6.504.322.048 según metadatos de safetensors (el modelo base se denomina 33B; dato inconsistente no aclarado por el autor) |
| Parametros activos | no disponible (no es MoE; es un modelo denso) |
| Longitud de contexto | 128k nativo según el modelo base; en W4A16 sobre 24 GB el techo práctico es de 8k tokens |
| Tipos de cuantizacion | W4A16 simétrica (AutoRound, formato AutoGPTQ/Marlin, kernels INT4 Marlin) |
| Idiomas soportados | Inglés, chino |
| Licencia | nanbeige-license (licencia propia, "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33.000 millones de parámetros de la familia Nanbeige, con arquitectura compatible con la implementación `llama` de Hugging Face Transformers. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada pasada. No se han publicado detalles del preentrenamiento (tokens, composición del dataset) ni del post-entrenamiento (RLHF/DPO) en la información disponible; al tratarse de una variante Base, no está alineado conversacionalmente.

En cuanto a la cuantización, se aplicó AutoRound en modo simétrico W4A16 (pesos en 4 bits, activaciones en 16 bits), empaquetada en formato `auto_round:auto_gptq` con kernels Marlin para tensor cores INT4. La calibración se realizó sobre 256 turnos reales multi-turno de una flota de producción, y el autor reporta cero artefactos NaN. La inferencia se ha validado con vLLM 0.28.0 usando Marlin, caché KV en FP8 y atención FlashInfer.

## Capacidades

- Generación de texto general en inglés y chino (pipeline text-generation).
- Razonamiento y tareas de agente según los tags del repositorio (`agent`, `reasoning`), aunque al ser una variante Base requiere prompting adecuado.
- Compatibilidad con vLLM para serving de alto rendimiento con kernels Marlin y caché KV FP8.
- Compatible con endpoints de inferencia de Hugging Face (endpoints_compatible).
- Ventana de contexto nativa de 128k en el modelo base, aunque limitada a 8k en esta cuantización sobre GPU de 24 GB.
- No incluye capacidades multimodales (visión, audio) según la información disponible; no se menciona soporte de tool calling.

## Casos de uso

- Serving de un modelo denso de 33B en una única GPU de consumo de 24 GB: la cuantización W4A16 reduce los pesos a 19,3 GiB, permitiendo despliegues locales en RTX 3090/4090 sin necesidad de tensor parallelism.
- Chatbots multi-turno en inglés y chino: la calibración sobre turnos reales multi-turno y el uso de vLLM con batching permiten atender conversaciones concurrentes con buena latencia.
- Procesamiento por lotes de texto (batch inference): con concurrencia N=4 se alcanzan 1.243,5 tok/s de prefill agregado y 29,16 trabajos/minuto, adecuado para pipelines de clasificación, resumen o extracción masiva.
- Prototipado e investigación local: al ser un modelo Base, sirve como punto de partida para fine-tuning posterior (LoRA/QLoRA) o para experimentos de evaluación sin coste de GPU de datacenter.
- Comparativas de cuantización: el repositorio forma parte de una familia W3A16/W4A16/W8A16 útil para estudiar el compromiso calidad-memoria en modelos densos de 33B.
- Integración en servicios con latencia baja de primer token: TTFT p95 de 0,05 s con caché caliente y 1,49 s con N=2, adecuado para interfaces interactivas.

## Benchmarks y rendimiento

Perplejidad en WikiText-2 (100.000 tokens, ventana deslizante seqlen=2048, stride=512), según el autor:

| Modelo | Formato | WikiText-2 PPL | Retención vs BF16 |
|---|---|---|---|
| Nanbeige4.3-33B BF16 (baseline) | BF16 | ~3,85 | 100,0 % |
| Nanbeige4.3-33B W8A16 AutoRound | GPTQ sym | <3,86 | >99,5 % |
| **Nanbeige4.3-33B W4A16 AutoRound (este modelo)** | GPTQ/Marlin | 3,943 | 98,8 % |
| Nanbeige4.3-33B W3A16 AutoRound | GPTQ sym | 5,336 | 93,0 % |

Rendimiento en una única RTX 3090 con vLLM 0.28.0 (Marlin INT4, KV cache FP8, FlashInfer), según el autor:

| Concurrencia | Prefill (tok/s) | Decode single-stream (tok/s) | Throughput agregado | TTFT p95 | Latencia p95 | Memoria |
|---|---|---|---|---|---|---|
| N=1 | 498,8 | 39,62 | 11,7 jobs/min | 0,05 s (cached) | 5,13 s | 19,32 GiB |
| N=2 | 773,1 | 60,4 | 18,1 jobs/min | 1,49 s | 6,62 s | 20,80 GiB |
| N=4 (sweet spot) | 1.243,5 | 97,2 | 29,16 jobs/min | 2,96 s | 8,23 s | 22,56 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia W4A16: 19,32 GiB solo pesos; hasta 22,56 GiB con N=4 y contexto 8k, por lo que se recomienda una GPU de 24 GB.
- GPUs recomendadas: RTX 3090, RTX 4090, A10G o RTX 5000 (24 GB). Alternativas de la familia: W3A16 para GPUs de 16 GB (RTX 4080/T4) y W8A16 para A6000/A100 o dual GPU con TP=2.
- Cabe en GPUs de consumo de 24 GB (RTX 3090/4090) con contexto de hasta 8k tokens; no cabe cómodamente en GPUs de 16 GB en esta precisión.
- Despliegue validado con vLLM 0.28.0 (kernels Marlin, FP8 KV cache, FlashInfer). Compatible en principio con AutoGPTQ y transformers; no se menciona validación en llama.cpp ni Ollama (el formato no es GGUF).
- Rendimiento medido: 39,62 tok/s de decode en single-stream y hasta 1.243,5 tok/s de prefill agregado con N=4 en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Comentario |
|---|---|---|---|---|---|
| Nanbeige4.3-33B W4A16 (este) | 33B (denso) | Transformer | 128k nativo / 8k en 24 GB | nanbeige-license | 39,62 tok/s decode en RTX 3090 |
| Qwen3.8-27B (según autor) | 27B (denso) | no disponible | no disponible | no disponible | 27,2 tok/s decode; 9,4 jobs/min en pico; p95 25,7 s |
| DeepSeek V4.1 MoE (según autor) | no disponible | MoE | no disponible | no disponible | 28,6 tok/s decode en dual-GPU PCIe; requiere 2 tarjetas |

Los datos de Qwen3.8-27B y DeepSeek V4.1 provienen exclusivamente de las comparativas publicadas por el autor del cuantizado y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- Licencia nanbeige-license: es una licencia propia ("other"), no una licencia abierta estándar; hay que revisar sus términos antes de cualquier uso comercial.
- Inconsistencia en los metadatos: safetensors reporta 6.504 millones de parámetros mientras el modelo se denomina 33B; conviene verificar el checkpoint antes de producción.
- Contexto práctico limitado a 8k tokens en W4A16 sobre 24 GB; para contextos largos (128k) el autor recomienda la variante W8A16 con más VRAM.
- Es un modelo Base, sin alineación conversacional: no está instruido para seguir órdenes ni para chat sin prompting adicional.
- Pérdida de calidad medible frente a BF16 (+0,09 de PPL en WikiText-2); la W3A16 de la misma familia cae a 93 % de retención, indicando sensibilidad a cuantizaciones agresivas.
- Sin benchmarks públicos independientes (MMLU, HumanEval, GSM8K): las cifras de rendimiento y las comparativas con Qwen y DeepSeek provienen del propio autor.
- Riesgo de alucinación y sesgos: no hay información publicada sobre sesgos conocidos ni mitigaciones; al ser un modelo Base bilingüe (en/zh) entrenado presumiblemente con datos web, debe tratarse con las cautlas habituales.
- Formato no GGUF: no es directamente usable en llama.cpp u Ollama sin conversión.

## Enlaces

- Modelo cuantizado: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W4A16-AutoRound
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Licencia: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base/blob/main/LICENSE
- Variante W3A16: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W3A16-AutoRound
- Variante W8A16: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound
- Dataset de evaluación (WikiText-2): https://huggingface.co/datasets/Salesforce/wikitext-2-raw-v1
- vLLM: https://github.com/vllm-project/vllm
