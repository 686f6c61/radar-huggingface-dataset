# Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP

## Resumen

Gemma 4 E2B IT Tensix BFP4 MLP es una versión cuantizada del modelo multimodal `google/gemma-4-E2B-it` de Google, optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La desarrolla Xylolabs y aplica GPTQ con búsqueda de exponente por bloque para redondear las capas lineales del modelo de lenguaje a los formatos de punto flotante por bloques nativos de TT-NN: `bfloat4_b` (BFP4) en las proyecciones MLP y `bfloat8_b` (BFP8) en las proyecciones de atención. El resultado es un checkpoint que TT-NN empaqueta sin re-redondear, con un peso medio de 11,70 bits por parámetro y 6,80 GB empaquetados.

El modelo base es un transformer multimodal con capacidad any-to-any (texto, imagen y audio), pensado para generación de texto, razonamiento y comprensión de imágenes. Esta variante conserva en bf16 el cabezal de lenguaje, los embeddings, las normas, el `vision_tower` y el `audio_tower`, y solo cuantiza el cuerpo del modelo de lenguaje (35 capas de atención y MLP). Los pesos se distribuyen en safetensors en bf16, pero cada valor ya está alineado a la rejilla BFP4 o BFP8, lo que permite una carga exacta en hardware Tenstorrent.

La relevancia de esta ficha es doble: por un lado, documenta un formato de cuantización poco habitual (block floating point nativo de aceleradores) y, por otro, advierte de que el modelo se ha validado únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en silicio real. Es un artefacto de interés para quien despliegue Gemma 4 en NPU Tenstorrent y quiera reducir huella de memoria con pérdida controlada de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen, audio) con capas de atención y MLP; cuantización block floating point para Tensix |
| Parámetros totales | 5.525.831.235 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atención q/k/v/o; bf16 en LM head, embeddings, normas, vision tower y audio tower. Media de 11,70 bits por peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a rejilla BFP4/BFP8); `quant4.json` describe el formato por proyección |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal con torres de visión y audio independientes y un modelo de lenguaje de 35 capas. Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento sobre las capas lineales del lenguaje. Las proyecciones MLP (gate, up y down) se redondean a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, k, v, o) se redondean a `ttnn.bfloat8_b` por redondeo al vecino más cercano. El resto de tensores (embeddings, LM head atado al embedding, normas, `vision_tower`, `audio_tower`, `embed_audio`, `embed_vision`) permanece en bf16 sin modificar.

La innovación técnica es el uso de formatos de punto flotante por bloques propios de TT-NN, que almacenan un exponente compartido por bloque y mantienen la mantisa en 4 u 8 bits. Al escribir los pesos ya alineados a esa rejilla en safetensors bf16, la carga en TT-NN es exacta y no introduce un segundo redondeo. El repositorio incluye `quant4.json` con el formato de cada proyección y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar. Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio no se han evaluado en esta variante.

## Capacidades

- Generación de texto y razonamiento conversacional, incluyendo modo de pensamiento (thinking) activable, según la evaluación con 7 prompts de razonamiento repetidos con thinking on.
- Comprensión de imágenes mediante `vision_tower` en bf16 (pipeline any-to-any e image-text-to-text).
- Comprensión de audio mediante `audio_tower` y `embed_audio` en bf16.
- Capacidad multimodal any-to-any heredada del modelo base Gemma 4 E2B IT.
- Soporte multilingüe: la evaluación incluye inglés y coreano; el resto de idiomas no está documentado en esta ficha.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Despliegue en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado exacto en `bfloat4_b` y `bfloat8_b`.

## Casos de uso

- Despliegue de Gemma 4 en NPU Tenstorrent: el checkpoint está pensado para cargarse en TT-NN sobre Wormhole o Blackhole, reduciendo la huella de memoria del modelo de lenguaje de 9,29 GB (bf16) a 6,80 GB empaquetados, lo que facilita encajar el modelo en DRAM de dispositivo.
- Inferencia multimodal en el borde: al conservar en bf16 las torres de visión y audio, permite procesar entradas de imagen y audio junto con texto en un único pipeline any-to-any sobre aceleradores Tenstorrent.
- Evaluación de cuantización block floating point: sirve como referencia para estudiar el impacto de BFP4 en MLP frente a BFP8 en atención, con métricas de KL y top-1 publicadas frente a bf16 y Q4_K_M.
- Prototipado en simulador: validado en `ttsim` de Blackhole, es útil para desarrollar y depurar pipelines TT-NN antes de disponer de hardware, comprobando que el empaquetado no altera valores.
- Asistente conversacional multilingüe inglés-coreano: la calibración y la evaluación cubren ambos idiomas, por lo que es adecuado para aplicaciones de chat en esos mercados.
- Razonamiento con modo thinking: los prompts de razonamiento se evalúan con thinking activado, lo que permite usar el modelo en tareas que requieran cadenas de razonamiento explícitas.
- Integración en tt-metal: el demo de Gemma 4 de tt-metal (v0.81.1) puede cargar este repositorio añadiendo una entrada en `precision_overrides.json` para empaquetar atención y MLP compartido en `bfloat8_b`.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 16 | 9,29 | 0 | 100 | 37 de 40 | - |
| **Este modelo (BFP4 MLP / BFP8 atención)** | 11,70 | 6,796 | 0,12669 | 86,22 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,29329 | 80,25 | 37 de 40 | 0 |

Las métricas de KL y top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total); "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la variante cuantizada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,80 GB empaquetados para el modelo de lenguaje cuantizado; el checkpoint en safetensors ocupa 11,1 GB en disco.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. El demo de tt-metal ejecuta E2B, E4B y 12B en una sola Blackhole P150.
- Validación: probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no se ha probado en hardware real según la model card.
- GPU consumer: no es el objetivo del modelo; no se documenta compatibilidad con CUDA ni requisitos de VRAM en GPU.
- Opciones de despliegue: TT-NN (tt-metal) para Tensix; carga en transformers con `AutoModelForCausalLM` en bf16 para inspección o uso fuera de Tenstorrent. tt-forge (tt-xla) no se ha ejecutado con Gemma 4; por defecto mantiene bf16 y su opción `bfp_bf4` re-redondea en otro diseño de bloque.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Gemma 4 E2B IT Tensix BFP4 MLP (este)** | 5.525.831.235 | no disponible | BFP4 MLP + BFP8 atención (11,70 bits/peso) | Apache-2.0 | Hugging Face, validado en simulador |
| `google/gemma-4-E2B-it` (BF16) | no disponible en la información | no disponible | bf16 (16 bits/peso) | Apache-2.0 | Hugging Face |
| Gemma 4 E2B IT Q4_K_M (llama.cpp) | no disponible en la información | no disponible | Q4_K_M (5,87 bits/peso) | Apache-2.0 (heredada) | llama.cpp |

La comparativa se limita al modelo base y a la cuantización Q4_K_M evaluada en la model card, porque no se dispone de datos de otros modelos de la misma categoría en la información proporcionada. Frente a Q4_K_M, esta variante ocupa más memoria (6,796 GB frente a 3,428 GB) pero obtiene mejor KL (0,12669 frente a 0,29329) y mejor top-1 (86,22 % frente a 80,25 %), y está optimizada para empaquetado exacto en TT-NN en lugar de para CPU/GPU.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; las torres de visión y audio no se han evaluado en esta variante.
- El modelo se ha validado únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en hardware Tensix real.
- tt-transformers no soporta Gemma 4; el demo de tt-metal v0.81.1 no tiene opción `bfloat4_b` y, sin entrada en `precision_overrides.json`, carga todo en bf16.
- tt-forge (tt-xla) no se ha ejecutado con Gemma 4; su opción `bfp_bf4` re-redondea los pesos en un diseño de bloque distinto, por lo que no garantiza el mismo resultado.
- La cuantización introduce pérdida de calidad: KL medio de 0,12669 y top-1 del 86,22 % frente a bf16, aunque no se pierde ninguna respuesta correcta en el conjunto de 40 prompts.
- Los idiomas soportados no están documentados; la evaluación se limita a inglés y coreano.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se heredan del modelo base Gemma 4 E2B IT.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base de Google para el uso de Gemma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
