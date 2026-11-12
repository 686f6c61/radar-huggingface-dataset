# Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tensix-BFP8

## Resumen

Gemma 4 26B A4B IT es un modelo multimodal (texto e imagen) de Google, distribuido originalmente en un checkpoint con cuantización QAT (quantization-aware training) etiquetado como Q4_0. Sobre ese checkpoint, Xylolabs ha publicado esta variante orientada a aceleradores Tenstorrent Tensix (Wormhole y Blackhole), en la que las capas lineales del modelo de lenguaje se han cuantizado a `ttnn.bfloat8_b` (block floating point de 8 bits) mediante GPTQ. El resultado se almacena en safetensors en bf16, pero con todos los valores ya alineados a la rejilla BFP8, de modo que TT-NN los empaqueta directamente sin recálculo.

El modelo conserva la arquitectura Mixture-of-Experts del original: 26.544.133.710 parámetros totales con 4B activos por token (según la nomenclatura A4B del checkpoint base). La ventaja práctica de esta versión es el tamaño: 27,51 GB empaquetados frente a 50,47 GB en BF16, con un coste de fidelidad mínimo respecto al original (KL medio de 0,00567 frente a BF16 en 8.048 posiciones de texto inglés y coreano).

Es relevante ahora porque permite ejecutar un modelo multimodal de 26B en hardware de inferencia de bajo consumo energético como los NPU Tensix, manteniendo las capacidades de conversación, visión y tool calling del modelo original. La licencia Apache 2.0 facilita su adopción comercial. Cabe advertir que la validación se ha hecho en el simulador `ttsim` con ttnn 0.81.1, no en hardware físico, y que tt-transformers y tt-forge no se han probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (según nomenclatura A4B del checkpoint base); capas lineales cuantizadas a BFP8 |
| Parametros totales | 26.544.133.710 |
| Parametros activos | 4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso); media de 8,72 bits por peso; tensores auxiliares en bf16 |
| Idiomas soportados | no disponible (evaluación limitada a inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP8), más `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El checkpoint base es `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, un modelo multimodal image-text-to-text con arquitectura MoE y 26,5B parámetros totales, de los que 4B se activan por token. Google lo distribuye como checkpoint QAT sin cuantizar (pesos en precisión completa pero entrenados para tolerar la cuantización Q4_0). Xylolabs parte de ese checkpoint y aplica GPTQ sobre las capas lineales, pero no sobre una rejilla entera de 4 u 8 bits convencional, sino sobre la rejilla de block floating point `bfloat8_b` propia de TT-NN, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador.

La cuantización afecta a las proyecciones de atención q, k, o (30 capas) y v (25 capas), y a las proyecciones MLP gate, up, down y las de los expertos enrutados (30 capas). Permanecen en bf16 el router y su escala por experto, el LM head (atado al embedding), el embedding, las normas, `embed_vision` y `vision_tower`. La calibración usó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión se mantiene intacta en bf16. No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base, la composición del dataset ni las etapas de RLHF o DPO aplicadas por Google.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), orientada a instrucciones (sufijo IT).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de visión en bf16 sin cuantizar.
- Razonamiento y respuesta a preguntas de conocimiento general; la evaluación incluye 33 prompts cortos con comprobación automática, todos resueltos correctamente.
- Soporte multilingüe parcial verificado en inglés y coreano; el resto de idiomas no está documentado.
- Compatible con la API de `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`), lo que permite integración en pipelines existentes.
- Despliegue en NPU Tenstorrent Tensix mediante TT-NN (`ttnn.as_tensor`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`).
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Inferencia multimodal en aceleradores Tenstorrent: el formato BFP8 está pensado para que TT-NN empaquete los pesos sin transformación, lo que permite servir un modelo de 26B en Wormhole o Blackhole con 27,51 GB de pesos en lugar de 50,47 GB.
- Asistente conversacional con imágenes: al conservar la torre de visión en bf16 y el pipeline image-text-to-text, puede responder preguntas sobre capturas, documentos escaneados o fotografías en un chat multi-turno.
- Despliegue en entornos con restricciones de memoria: la reducción a 8,72 bits por peso facilita alojar el modelo en nodos con DRAM limitada, manteniendo una KL de 0,00567 frente a BF16.
- Sustitución de cuantizaciones Q4_0 en producción: frente a la referencia Q4_0 de llama.cpp (14,44 GB, KL 0,05293, top-1 91,55%), esta variante ofrece top-1 del 97,39% con solo 0,11 veces la KL de Q4_0, útil cuando la fidelidad al BF16 es prioritaria.
- Prototipado e investigación en cuantización de bajo nivel: el repositorio incluye `quant4.json` con el formato de cada proyección y scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que ningún valor cambia al empaquetar.
- Evaluación comparativa de hardware: sirve como carga de trabajo de referencia para medir latencia y throughput de NPU Tensix con un modelo MoE multimodal de 26B, aunque las cifras de rendimiento en dispositivo aún no se han publicado.
- Aplicaciones comerciales sin restricción de licencia: al ser Apache 2.0, puede integrarse en productos propietarios sin obligaciones de copyleft.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto al checkpoint BF16, no la calidad en tareas. La evaluación cubre 8.048 posiciones de WikiText-2 (test) y Wikipedia en coreano, con plantilla de chat, más 33 prompts cortos con comprobación automática.

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP8) | 8,72 | 27,513 | 0,00567 | 97,39 | 33 de 33 | 0 |
| Q4_0 (llama.cpp) | 4,57 | 14,439 | 0,05293 | 91,55 | 33 de 33 | 0 |

El criterio de aceptación fijado por el autor era una KL media como máximo 1,5 veces la de Q4_0 y como máximo una respuesta perdida adicional; el resultado es 0,11 veces la KL de Q4_0 y cero respuestas perdidas. La referencia Q4_0 se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas de velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada: 27,51 GB de pesos empaquetados en BFP8; en BF16 el mismo modelo ocupa 50,47 GB. Hay que añadir memoria para caché KV, activaciones y la torre de visión en bf16.
- GPU: no se documenta compatibilidad probada con GPU. El formato está diseñado para NPU Tenstorrent Tensix (Wormhole y Blackhole).
- Consumer GPU: no disponible; no se ha validado en RTX 4090 ni similares. Por tamaño, los 27,51 GB exceden la VRAM de una RTX 4090 (24 GB) sin offloading.
- Despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")`; en Tensix, TT-NN con `ttnn.as_tensor` y `TILE_LAYOUT`. No se ha probado con vLLM, llama.cpp, Ollama, TGI, tt-transformers ni tt-forge.
- Validación: ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; no se ha ejecutado en hardware físico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Observaciones |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 26,5B totales / 4B activos | no disponible | BFP8, 8,72 bits | 27,51 GB | Apache 2.0 | Validado solo en simulador ttsim |
| Base BF16 (`gemma-4-26B-A4B-it-qat-q4_0-unquantized`) | 26,5B totales / 4B activos | no disponible | BF16, 16 bits | 50,47 GB | Apache 2.0 | Referencia de fidelidad; requiere `transformers` |
| Q4_0 (llama.cpp) | 26,5B totales / 4B activos | no disponible | Q4_0, 4,57 bits | 14,44 GB | Apache 2.0 | Menor tamaño, pero KL 9,3 veces mayor y top-1 91,55% |

No se dispone de datos para comparar con modelos de otros fabricantes de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- La validación se realizó únicamente en `ttsim` (simulador de Blackhole) con ttnn 0.81.1; no hay pruebas en silicio Wormhole ni Blackhole.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de la torre de visión tras el cambio de checkpoint no está medido.
- La evaluación mide cercanía a BF16 (KL y top-1), no calidad en tareas; no hay benchmarks de razonamiento, código o matemáticas.
- El conjunto de evaluación es reducido: 8.048 posiciones de inglés y coreano y 33 prompts cortos, insuficiente para caracterizar el comportamiento multilingüe general.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son heredados del modelo base de Google.
- Longitud de contexto no especificada en esta ficha; conviene consultar la model card del checkpoint base antes de diseñar aplicaciones con contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base de Google y de los pesos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tensix-BFP8/blob/main/LICENSE
