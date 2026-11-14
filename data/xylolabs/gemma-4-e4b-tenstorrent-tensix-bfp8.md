# Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 E4B es un modelo multimodal any-to-any de Google (texto, imagen, audio) que Xylolabs ha cuantizado y empaquetado para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). Esta variante concreta, `gemma-4-E4B-Tenstorrent-Tensix-BFP8`, aplica GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` de TT-NN a las proyecciones de atención y MLP del modelo de lenguaje, dejando en bf16 las torres de visión y audio, el embedding, el LM head y las normas.

El resultado es un checkpoint de 8.667 millones de parámetros totales que ocupa 11,34 GB empaquetado (12,06 bits por peso de media en el modelo de lenguaje), frente a los 15,04 GB del BF16 original. La motivación es doble: por un lado, reducir la huella de memoria para que el modelo quepa en aceleradores Tensix con DRAM limitada; por otro, hacerlo sin degradar la calidad de forma apreciable, algo que el autor documenta con métricas de divergencia KL y top-1 frente al BF16.

La relevancia actual del checkpoint es que demuestra una ruta de cuantización hardware-aware para el ecosistema Tenstorrent (tt-metal, TT-NN, tt-forge), un stack alternativo a las GPU de NVIDIA para inferencia de modelos abiertos. La licencia Apache 2.0 facilita su uso comercial, aunque conviene señalar que el modelo base es Gemma 4 y que el autor solo cuantizó y evaluó la parte de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen, audio); detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 8.667.245.130 (8,67 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en proyecciones de atención (q, o en 42 capas; k, v en 24 capas) y MLP (gate, up, down en 42 capas); bf16 en embedding, LM head, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower`; media de 12,06 bits por peso |
| Idiomas soportados | no disponible (la evaluacion usa texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con rejilla BFP8 almacenada como valores bf16); indice `model.safetensors.index.json` y mapa de formatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B`, un transformer multimodal any-to-any con torres separadas de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`), más un modelo de lenguaje con 42 capas que incluye atención con proyecciones q, o en todas las capas y k, v en 24 de ellas. Los detalles de composición del dataset de preentrenamiento, número de tokens y si hubo RLHF o DPO no están disponibles en la información proporcionada; esta ficha describe únicamente el proceso de cuantización realizado por Xylolabs.

La innovación técnica de esta variante es el uso de GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` de TT-NN. Cada bloque de pesos comparte un exponente, y las matrices cuantizadas se almacenan como valores bf16 situados exactamente en la rejilla BFP8, de modo que el empaquetador de TT-NN las lee sin alterar sus valores. La calibración se hizo con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El autor verificó el empaquetado con `pack_tensix.py` (comprobación de que ningún valor cambia al pasar por TT-NN, opcionalmente con ida y vuelta por DRAM del dispositivo) y con `verify_grid.py` usando solo PyTorch, sobre ttnn 0.81.1 y el simulador Blackhole (ttsim). Ni tt-transformers ni tt-forge se probaron con este checkpoint.

## Capacidades

- Generación de texto y continuación de texto: el checkpoint es el modelo preentrenado, sin plantilla de chat, por lo que su uso directo es de completado.
- Procesamiento multimodal any-to-any: incluye torres de visión y audio en bf16, por lo que conserva las capacidades de entrada imagen y audio del modelo base.
- Razonamiento y matemáticas: capacidades heredadas del modelo base; no se documentan evaluaciones específicas en la información disponible.
- Generación de código: capacidad heredada del modelo base; sin datos de benchmark en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no se declara lista de idiomas; la evaluación cubre inglés y coreano.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y cabe en 11,34 GB de DRAM de dispositivo para los pesos del modelo de lenguaje, más KV cache y buffers; es adecuado para desplegar Gemma 4 E4B en Wormhole o Blackhole cuando no se dispone de GPU NVIDIA.
- Investigación en cuantización hardware-aware: sirve como referencia reproducible de GPTQ sobre rejilla BFP8, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) para validar que el empaquetado no altera los valores.
- Evaluación de calidad de cuantización: el autor publica métricas de divergencia KL y top-1 frente a BF16 y frente a un Q4_K_M de llama.cpp, lo que permite usar el checkpoint como caso de estudio comparativo en pipelines de compresión de modelos.
- Prototipado multimodal en entornos con memoria limitada: al mantener visión y audio en bf16 y comprimir solo el lenguaje, es útil para experimentar con entradas de imagen y audio en hardware Tensix sin cargar el modelo completo en BF16 (15,04 GB).
- Despliegue de completado de texto en inglés y coreano: la calibración incluye WikiText-2 y Wikipedia en coreano, y la evaluación cubre ambos idiomas, por lo que encaja en tareas de generación de texto en esos idiomas.
- Base para fine-tuning o adaptación posterior: al estar en safetensors y cargarse con `transformers` (`AutoModelForCausalLM`), puede servir como punto de partida para ajustes sobre el modelo cuantizado, aunque la cuantización limita la precisión disponible para entrenamiento.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación solo del modelo de lenguaje):

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E4B`) | 16 | 15,04 | 0 | 100 | 27 de 28 | - |
| **Este modelo (BFP8)** | 12,06 | 11,337 | 0,00186 | 97,55 | 27 de 28 | 0 |
| Q4_K_M, blk.N.proj Q8_0 (llama.cpp) | 5,67 | 5,349 | 0,24892 | 76,39 | 20 de 28 | 4 |

Las métricas de KL y top-1 cubren 8.176 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato de texto plano. Las 28 respuestas son prompts cortos con comprobación automática, en formato de completado y con 3 ejemplos (3-shot). El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `c2bd4c28df4a70b6de17427a394c6acb6d22bf3a2ca8d9b9368bd896ce024c9a`. El criterio de aceptación del autor (KL media como máximo 1,5 veces la del Q4_K_M y como máximo una respuesta perdida más) se cumple con holgura: 0,01 veces la KL del Q4_K_M y 0 respuestas perdidas frente a 4.

## Requisitos de hardware

- VRAM/DRAM estimada: aproximadamente 11,34 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. El repo completo ocupa 17,4 GB.
- GPU recomendadas: el checkpoint está pensado para NPU Tensix de Tenstorrent (Wormhole, Blackhole), no para GPU convencionales. Para dispositivos con menos memoria, el autor remite a la versión BFP4 (`Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP4`).
- Compatibilidad con GPU de consumo: no está documentada; el empaquetado BFP8 es específico de TT-NN y no se indica soporte en CUDA.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 probado en el simulador Blackhole, ttsim), tt-metal y tt-forge como stack del ecosistema; la carga con `transformers` (`AutoModelForCausalLM.from_pretrained` con `dtype="bfloat16"` y `device_map="auto"`) es posible, pero no se documenta el rendimiento en ese modo. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad (KL / top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 8,67 mil millones | no disponible | BFP8, 12,06 bits/peso, 11,34 GB | 0,00186 / 97,55 % | Apache 2.0 | Hugging Face, para Tensix |
| `google/gemma-4-E4B` (BF16) | 8,67 mil millones | no disponible | BF16, 15,04 GB | 0 / 100 % (referencia) | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (blk.N.proj Q8_0) | 8,67 mil millones | no disponible | ~5,67 bits/peso, 5,35 GB | 0,24892 / 76,39 % | Apache 2.0 | Generado por el autor desde el mismo checkpoint |
| Versión BFP4 de Xylolabs | 8,67 mil millones | no disponible | BFP4 | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio, el embedding y el LM head permanecen en bf16 y no se han validado en esta variante.
- El checkpoint es el modelo preentrenado: no incluye plantilla de chat, por lo que no está pensado para diálogo directo sin un ajuste o prompt adecuado.
- La evaluación de calidad se limita a 8.176 posiciones de texto en inglés y coreano y a 28 prompts cortos; no cubre razonamiento, código, matemáticas ni tareas multimodales.
- No se declara lista de idiomas soportados; el rendimiento fuera de inglés y coreano no está verificado.
- El empaquetado BFP8 es específico de TT-NN y depende de que el hardware lea las matrices en el formato esperado; no se garantiza su funcionamiento fuera del stack de Tenstorrent.
- No se probó con tt-transformers ni con tt-forge, así que la integración con esas herramientas no está validada.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al heredarse del modelo base, deben evaluarse en el caso de uso concreto.
- La licencia del checkpoint es Apache 2.0, pero el uso comercial debe verificar también las condiciones del modelo base `google/gemma-4-E4B`.
- El tamaño de 11,34 GB deja poco margen en dispositivos Tensix con DRAM ajustada; para esos casos el autor recomienda la variante BFP4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Version BFP4: https://huggingface.co/Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP4
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
