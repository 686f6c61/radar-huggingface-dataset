# Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF

## Resumen

Qwen3.6-35B-A3B-TR2.25-G-GGUF es una cuantización ternaria del modelo Qwen3.6-35B-A3B, publicada por el usuario Ternii (Wai Chung) bajo licencia Apache-2.0. Se trata de una traducción de pesos con una media de 2,25 trits por peso, sin reentrenamiento, empaquetada como un único archivo GGUF de 16,49 GB para su uso con llama.cpp. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen, con 34.660.610.688 parámetros totales y activación de un subconjunto de expertos por token (A3B, aproximadamente 3.000 millones de parámetros activos según la nomenclatura del modelo base).

La relevancia de esta ficha no reside en el modelo base, sino en la técnica de cuantización: el autor introduce tipos de tensor propios (TQ9_128, TQ27_128, TQ81_128) que no existen en el llama.cpp upstream, lo que obliga a usar una serie de parches específica del proyecto tritq-vllm. El objetivo declarado es permitir la ejecución del modelo en Macs de 16 y 24 GB de memoria unificada, donde un GGUF Q4_K_M convencional no cabe en la GPU.

El modelo es solo de texto (sin codificador visual ni cabeza MTP), está orientado a generación de texto conversacional y su model card documenta mediciones de velocidad, perplejidad y benchmarks en hardware Apple Silicon. No se dispone de información sobre el contexto máximo del modelo base en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), modelo base Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin cifra confirmada) |
| Longitud de contexto | no disponible para el modelo base; el ejemplo de despliegue usa `-c 4096` |
| Tipos de cuantizacion | Ternaria, media de 2,25 trits por peso; tipos de tensor TQ9_128, TQ27_128, TQ81_128 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo único de 16,49 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Qwen3.6, con 34.660 millones de parámetros totales y activación dispersa de expertos. Esta publicación no entrena ni ajusta el modelo: aplica una cuantización ternaria post-entrenamiento ("TR Quantisation translation") que promedia 2,25 trits por peso y conserva los códigos y escalas idénticos a la versión `Ternii/Qwen3.6-35B-A3B-TR2.25-G`. El resultado se empaqueta en un único GGUF para llama.cpp.

La innovación técnica principal es la definición de tres tipos de tensor propios (TQ9_128, TQ27_128, TQ81_128) que no están presentes en el llama.cpp upstream. Por ello se requiere la serie de parches del repositorio ternii-ai/tritq-vllm sobre ggml-org/llama.cpp en el commit ff5a233. El soporte de Metal (Apple Silicon) está implementado; el soporte CUDA está en proceso de port y no forma parte de la serie publicada. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO; los datasets listados en la model card (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k) aparecen como etiquetas de metadatos, no como datos de entrenamiento de esta cuantización.

## Capacidades

- Generación de texto conversacional en inglés (único idioma declarado).
- Razonamiento en modo "thinking" por defecto cuando se usa `--jinja`; el autor advierte que una pregunta corta puede consumir más de 1.000 tokens en `reasoning_content` antes de responder.
- Capacidad de desactivar el modo thinking mediante `--reasoning off`, `chat_template_kwargs` con `enable_thinking: false` o aumentando `max_tokens`.
- Rendimiento medido en tareas de matemáticas y código (GSM8K, HumanEval, MBPP) cercano al modelo original en Q8_0.
- No incluye codificador visual ni cabeza MTP (modelo solo de texto).
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Ejecución local en Macs de 16 GB: el modelo cabe mediante una caché de expertos en SSD (`LLAMA_MOE_SSD=1`, `LLAMA_MOE_CACHE_MIB=8400`) y alcanza ~35 tokens/s en un MacBook Air M5 de 16 GB, lo que permite asistentes conversacionales locales sin conexión.
- Ejecución íntegra en GPU en Macs de 24 GB: con 0,35 GB de margen a contexto 4k, es adecuado para prototipado de chatbots y pruebas de razonamiento en hardware de consumo Apple.
- Evaluación de técnicas de cuantización extrema: sirve como banco de pruebas para investigadores que comparan cuantización ternaria (2,25 trits) frente a Q4_K_M en términos de KLD, perplejidad y acuerdo de token top-1.
- Generación de código asistida en local: con HumanEval al 92,7 % y MBPP al 87,2 % medidos en Mac, puede integrarse en editores o scripts de autocompletado que requieran privacidad de datos.
- Resolución de problemas matemáticos de nivel escolar: GSM8K al 95,0 %, útil para tutores automáticos o verificación de ejercicios sin depender de APIs externas.
- Investigación sobre portabilidad de kernels: el proyecto tritq-vllm permite estudiar la implementación de tipos de tensor personalizados en llama.cpp y Metal, así como el rendimiento de la caché de expertos en SSD.
- Despliegue en entornos con restricciones de memoria y sin GPU dedicada: la variante Linux arm64 (solo CPU) del release anterior permite ejecutar el modelo en servidores ARM sin acelerador.

## Benchmarks y rendimiento

| Metrica | TR2.25-G (este archivo) | Q4_K_M | Original Q8_0 |
|---|---|---|---|
| Tamano de archivo | 16,49 GB | 21,17 GB | no disponible |
| Cabe entero en GPU de 24 GB | si (0,35 GB de margen a 4k) | no | no disponible |
| KLD medio vs Q8_0 (menor es mejor) | 0,176 | 0,046 | referencia |
| Mismo token top-1 que el original | 79,7 % | 90,9 % | referencia |
| Perplejidad | 8,12 | 7,06 | 7,06 |
| GSM8K | 95,0 % | no medido | 95,0 % |
| HumanEval | 92,7 % | no medido | 94,5 % |
| MBPP | 87,2 % | no medido | 87,9 % |

Mediciones de KLD, perplejidad y acuerdo de token top-1 sobre 10 fragmentos de 512 tokens de WikiText-2 con `llama-perplexity` en CPU del M5 Max. El Q4_K_M fue generado por el autor con `llama-quantize` estándar sin matriz de importancia. La velocidad en Metal no se comparó entre cuantizaciones.

Velocidad y memoria por configuración de Mac:

| Memoria del Mac | Modo de ejecución | Velocidad (1 usuario) | Memoria usada |
|---|---|---|---|
| 16 GB | caché de expertos en SSD, 8.400 MiB | ~35 tokens/s (35,1–36,3 en 6 ejecuciones, MacBook Air M5 16 GB, release r3) | hasta 12,1 GB wired |
| 24 GB | completamente en memoria | no disponible en el extracto | no disponible en el extracto |

## Requisitos de hardware

- VRAM/memoria unificada: 16,49 GB de archivo; cabe entero en la GPU de un Mac de 24 GB con 0,35 GB de margen a contexto 4k. En Macs de 16 GB requiere caché de expertos en SSD de 8.400 MiB y hasta 12,1 GB wired.
- GPU recomendadas: Apple Silicon con Metal (macOS 13.3+). El soporte CUDA está en port y no forma parte de la serie publicada; no hay soporte para GPU NVIDIA en esta versión.
- Cabe en GPU de consumo: si, en Macs de 24 GB o más; en Macs de 16 GB de forma experimental.
- Opciones de despliegue: exclusivamente llama.cpp con la serie de parches de ternii-ai/tritq-vllm (binarios precompilados `llama.cpp-tr-b11721-r3` para macOS arm64 con Metal; `llama.cpp-tr-b11721` para Linux arm64 solo CPU). No funciona en LM Studio, Ollama ni builds estándar de llama.cpp.
- Latencia y throughput: ~35 tokens/s en MacBook Air M5 de 16 GB con caché en SSD (release r3); 23,3–25,2 tokens/s con la release r2 en el mismo equipo. Sin datos para 24 GB ni para GPU NVIDIA.
- Ajustes relevantes: `-c 4096 -fa on --jinja`; para 16 GB, `caffeinate -ims` evita que la GPU baje de frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TR2.25-G-GGUF (este) | 34,66 B totales, MoE | no disponible | Apache-2.0 | GGUF ternario (2,25 trits) | llama.cpp parcheado, macOS arm64 y Linux arm64 CPU |
| Qwen3.6-35B-A3B Q4_K_M | 34,66 B totales, MoE | no disponible | Apache-2.0 | GGUF 4 bits | LM Studio, Ollama, llama.cpp estándar |
| Qwen3.6-35B-A3B Q8_0 (original) | 34,66 B totales, MoE | no disponible | Apache-2.0 | GGUF 8 bits | llama.cpp estándar |

La comparativa se limita al mismo modelo base en distintas cuantizaciones, ya que la información proporcionada no incluye datos de modelos alternativos de otros autores. Frente a Q4_K_M, este archivo es un 22 % más pequeño (16,49 vs 21,17 GB), pero pierde fidelidad (KLD 0,176 vs 0,046; acuerdo top-1 79,7 % vs 90,9 %) y requiere un runtime parcheado.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado: los tipos TQ9_128, TQ27_128 y TQ81_128 no existen en upstream, por lo que stock builds, LM Studio y Ollama no pueden cargarlo.
- Soporte CUDA incompleto: solo Metal (Apple Silicon) y Linux arm64 en CPU están publicados; no hay aceleración NVIDIA disponible.
- Pérdida de fidelidad respecto al original: KLD de 0,176 y solo 79,7 % de acuerdo en token top-1 frente a Q8_0; la perplejidad sube de 7,06 a 8,12.
- Modo thinking por defecto: con `--jinja`, una pregunta corta puede agotar 1.024 tokens en razonamiento (3 de 4 peticiones de prueba), lo que exige desactivarlo o ampliar `max_tokens`.
- Solo inglés: el campo `language` declara únicamente `en`; no se documenta soporte multilingüe.
- Modelo solo de texto: sin codificador visual ni cabeza MTP.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible; aplican los del modelo base Qwen3.6-35B-A3B.
- Licencia Apache-2.0 permite uso comercial, pero la obligación de usar un runtime parcheado y la ausencia de soporte CUDA condicionan el despliegue en producción.
- Las cifras de 24 GB se obtuvieron emulando esa memoria en un M5 Max de 128 GB; un Mac real de 24 GB tiene chip y SSD más lentos, por lo que el rendimiento puede ser inferior.
- La velocidad de 16 GB depende de una caché en SSD y de `caffeinate`; cerrar otras aplicaciones grandes es necesario para no exceder los 12,1 GB wired.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del runtime parcheado: https://github.com/ternii-ai/tritq-vllm
- Serie de parches sobre llama.cpp: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Binarios precompilados r3: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r3
- Binarios precompilados anteriores: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721
- Script de inicio rápido para Mac: https://raw.githubusercontent.com/ternii-ai/tritq-vllm/main/mac/qwen36-35b.sh
