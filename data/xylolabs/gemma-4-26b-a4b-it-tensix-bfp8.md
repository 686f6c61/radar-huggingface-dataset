# Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP8

## Resumen

Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP8 es una cuantización del modelo multimodal google/gemma-4-26B-A4B-it, publicada por Xylolabs y orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 con mezcla de expertos (MoE) y una torre de visión, pero cuantiza a `ttnn.bfloat8_b` (BFP8, block floating point de 8,5 bits por peso) las capas lineales de atención, MLP densa y expertos enrutados del modelo de lenguaje, mientras mantiene en bf16 el router, las normas, el embedding, el LM head y toda la parte de visión.

El problema que resuelve es doble: por un lado reduce el peso del checkpoint de 50,47 GB en bf16 a 27,51 GB empaquetados (8,72 bits por peso de media), y por otro entrega los pesos ya alineados a la rejilla BFP8 que espera TT-NN, de modo que el empaquetado en el dispositivo no requiere recomputar nada. La cuantización se realiza con GPTQ sobre la propia rejilla bfloat8_b, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano.

Es relevante porque el ecosistema Tenstorrent carece todavía de soporte de Gemma 4 en tt-transformers, y este repositorio ofrece una vía práctica para ejecutar el modelo en hardware Tensix mediante el demo de tt-metal v0.81.1, con una pérdida de calidad medida y muy contenida frente al modelo original (KL media de 0,00804 y top-1 del 96,97 % sobre 8.048 posiciones). El checkpoint se distribuye en safetensors con pesos bf16 cuyos valores ya están sobre la rejilla BFP8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y torre de visión; modelo base Gemma 4 |
| Parametros totales | 26.544.133.710 (26,54 B) |
| Parametros activos | no disponible (el nombre A4B sugiere ~4 B activos, sin confirmar en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en capas lineales; bf16 en router, normas, embedding, LM head y visión; media de 8,72 bits por peso |
| Idiomas soportados | no disponible (evaluación con texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya sobre la rejilla BFP8) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-26B-A4B-it: un transformer con mezcla de expertos que combina atención (proyecciones q, k, v, o), una MLP densa compartida y expertos enrutados con su router por capa, además de una torre de visión (`vision_tower` y `embed_vision`) para entrada image-text-to-text. El checkpoint cuantizado mantiene 30 capas con proyecciones cuantizadas y conserva el resto de tensores en bf16 tal como en el modelo base.

Sobre el entrenamiento original no se aporta información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO). La innovación técnica de esta ficha es el proceso de cuantización: GPTQ aplicado directamente sobre la rejilla bfloat8_b de TT-NN, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador, y calibrado con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se cuantizó y evaluó el modelo de lenguaje; la parte de visión permanece intacta en bf16. El repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) para comprobar que ninguna matriz cambia de valor al empaquetarla con TT-NN.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Entrada multimodal image-text-to-text mediante la torre de visión en bf16.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado con 33 prompts cortos con comprobación automática).
- Procesamiento de texto multilingüe, con evaluación específica en inglés y coreano.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN y el demo de tt-metal.
- Compatibilidad con `transformers` y `AutoModelForCausalLM` para inferencia en GPU/CPU convencional.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres Tenstorrent: el checkpoint está pensado para cargarse en Wormhole T3K o en configuraciones Blackhole (QuietBox 2, LoudBox) con paralelismo tensorial a cuatro u ocho chips, aprovechando que los pesos ya están en la rejilla BFP8.
- Servicio conversacional multimodal: al conservar la torre de visión en bf16 y el pipeline image-text-to-text, permite atender consultas sobre imágenes manteniendo la calidad original en la parte visual.
- Reducción de huella de memoria en producción: los 27,51 GB empaquetados frente a los 50,47 GB en bf16 permiten alojar el modelo en menos chips o liberar DRAM para caché KV y lotes mayores.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar matriz a matriz que el empaquetado TT-NN es exacto, útil en equipos que preparan otros modelos para Tensix.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de BFP8 frente a Q4_K_M de llama.cpp (KL 0,00804 frente a 0,1249) en tareas de generación y conocimiento.
- Investigación en eficiencia de hardware: permite estudiar el comportamiento de block floating point en un MoE de 26 B sobre silicio Tensix, incluyendo el reparto multi-chip.
- Prototipado en simulador: el modelo se ha probado con ttnn 0.81.1 sobre ttsim (simulador Blackhole), lo que facilita desarrollar sin hardware físico disponible.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP8) | 8,72 | 27,513 | 0,00804 | 96,97 | 33 de 33 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | 16,796 | 0,1249 | 88,16 | 33 de 33 | 0 |

La KL y el top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la versión cuantizada. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 27,51 GB de pesos empaquetados en BFP8; en bf16 el modelo base ocupa 50,47 GB.
- Aceleradores objetivo: Tenstorrent Wormhole (T3K) y Blackhole (QuietBox 2, LoudBox). El demo de tt-metal ejecuta el 26B-A4B con paralelismo tensorial en cuatro u ocho chips Blackhole, o en un Wormhole T3K; no cabe en un solo chip.
- GPU convencionales: no se especifican requisitos; con 26,54 B de parámetros y pesos bf16 haría falta un entorno multi-GPU de gama alta (A100/H100) para cargar el checkpoint completo, aunque no se documenta.
- Consumer GPU: no disponible; el tamaño del checkpoint (53,1 GB de repo) excede la memoria de las GPU de consumo habituales en bf16.
- Despliegue: `transformers` con `device_map="auto"`, TT-NN (ttnn 0.81.1), demo de Gemma 4 de tt-metal v0.81.1, y opcionalmente tt-forge (tt-xla), aunque este último no se ha probado con Gemma 4.
- Latencia y throughput: no disponibles. La validación se realizó sobre el simulador ttsim, no sobre hardware real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 26,54 B | no disponible | BFP8 (8,72 bits/peso) | 27,51 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| google/gemma-4-26B-A4B-it (BF16) | 26,54 B | no disponible | bf16 | 50,47 GB | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) del mismo checkpoint | 26,54 B | no disponible | Q4_K_M (5,32 bits/peso) | 16,796 GB | Apache 2.0 | Generado con llama.cpp |

Frente al modelo base en bf16, esta versión reduce el tamaño un 45,5 % con una KL media de 0,00804 y sin perder ninguna de las 33 respuestas correctas. Frente a Q4_K_M, ocupa más espacio (27,51 GB frente a 16,796 GB) pero conserva mucha más fidelidad (KL 0,00804 frente a 0,1249; top-1 96,97 % frente a 88,16 %). La ventaja específica de esta variante es su integración nativa con TT-NN, que Q4_K_M no ofrece.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de la torre de visión en este checkpoint no está medido.
- La validación en Tensix se hizo sobre el simulador ttsim con ttnn 0.81.1, no sobre hardware físico; el reparto multi-chip no se ejecutó.
- tt-transformers no soporta Gemma 4; es necesario usar el demo de tt-metal, que requiere cuatro u ocho chips Blackhole o un Wormhole T3K.
- tt-forge (tt-xla) no se ha probado con Gemma 4; su opción `bfp_bf8` recuantiza en el layout [out, in] de PyTorch y podría alterar los pesos.
- La evaluación se limita a 8.048 posiciones de inglés y coreano y a 33 prompts cortos; no hay datos de MMLU, HumanEval, GSM8K ni de otros idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base google/gemma-4-26B-A4B-it.
- Licencia Apache 2.0 declarada en el repositorio; conviene verificar las condiciones del modelo base de Google antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como enlace verificado en la información proporcionada
