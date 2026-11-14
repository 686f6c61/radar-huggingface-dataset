# Xylolabs/gemma-4-26B-A4B-it-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 26B-A4B-it es un modelo multimodal de Google (entrada de imagen y texto, salida de texto) con arquitectura Mixture of Experts (MoE), del que se derivan múltiples cuantizaciones. Esta ficha concreta corresponde a la exportación de Xylolabs para NPUs Tenstorrent Tensix (Wormhole y Blackhole), en la que las capas lineales del modelo de lenguaje se cuantizan a `ttnn.bfloat8_b` (BFP8) mediante GPTQ. El resultado es un checkpoint de 27,51 GB empaquetado, con una media de 8,72 bits por peso, pensado para ejecutarse en hardware de Tenstorrent a través de TT-NN y tt-metal.

El modelo base resuelve tareas de generación de texto, razonamiento, código y comprensión de imágenes con una ventana de contexto amplia y un total de 26.544.133.710 parámetros. La variante A4B indica que se activan aproximadamente 4.000 millones de parámetros por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamaño. La relevancia de esta exportación radica en que permite desplegar un modelo de 26B en aceleradores Tensix con pérdida de calidad mínima: la evaluación del autor reporta una KL media de 0,00804 frente al BF16 original y un 96,97 % de coincidencia top-1.

La licencia Apache 2.0 del checkpoint y del modelo base facilita el uso comercial, aunque conviene verificar las condiciones del modelo original de Google. El repositorio tiene un uso muy reducido (62 descargas, 0 likes) y fue publicado en noviembre de 2026, por lo que su ecosistema y validación comunitaria son todavía limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal image-text-to-text |
| Parametros totales | 26.544.133.710 |
| Parametros activos | aproximadamente 4B (variante A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en capas lineales); router, embeddings, LM head y normas en bf16; existe variante BFP4 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetado para TT-NN; `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: capas de atención con proyecciones q, k, o en 30 capas y v en 25 capas, un MLP denso compartido y expertos enrutados con proyecciones gate, up y down. La exportación cuantiza atención, MLP denso y expertos a `bfloat8_b` (8,5 bits por peso), mientras que el router, su escala por experto, el embedding, el LM head (atado al embedding), las normas y todos los tensores de visión (`embed_vision`, `vision_tower`) permanecen en bf16. El resultado es una media de 8,72 bits por peso y 27,51 GB empaquetados.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador, y se calibró con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos cuantizados se almacenan como valores bf16 en la rejilla BFP8, de modo que TT-NN los empaqueta sin alterar sus valores. Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión queda intacta en bf16. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con torre de visión en bf16.
- Razonamiento y respuesta a preguntas; la evaluación del autor incluye 33 preguntas con 33 aciertos tanto en BF16 como en esta cuantización.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la calibración incluyó coreano, pero no se documenta la cobertura de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y tt-metal, de modo que puede cargarse en Wormhole o Blackhole mediante el demo de Gemma 4 de tt-metal en configuración tensor-parallel sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o un Wormhole T3K.
- Inferencia multimodal en entornos con restricciones de memoria: al ocupar 27,51 GB de memoria de dispositivo para los pesos del modelo de lenguaje, encaja en configuraciones Tensix de gama alta donde un checkpoint BF16 de 50,47 GB no cabría con margen para caché KV y buffers.
- Servicio conversacional con plantilla de chat: el quickstart con `AutoModelForCausalLM` y `apply_chat_template` permite montar un endpoint de diálogo multi-turno sobre transformers antes de migrar a TT-NN.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP8 no altera valores, útil en equipos que auditan procesos de cuantización GPTQ.
- Investigación en eficiencia de hardware: la comparación publicada frente a BF16 y Q4_K_M de llama.cpp sirve para estudiar el compromiso entre bits por peso y fidelidad de salida (KL media de 0,00804).
- Prototipado de asistentes con visión: la torre de visión intacta en bf16 permite experimentar con tareas de imagen y texto sin degradar la parte visual por la cuantización.
- Evaluación comparativa de backends: el autor documenta el comportamiento en tt-forge (tt-xla) y en tt-metal, lo que permite contrastar precisión y exactitud entre rutas de compilación.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP8) | 8,72 | 27,513 | 0,00804 | 96,97 | 33 de 33 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación del autor se limita a la fidelidad frente al BF16 y a un conjunto de 33 preguntas.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 27,51 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN 0.81.1 y tt-metal.
- El demo de Gemma 4 de tt-metal ejecuta el 26B-A4B en tensor-parallel sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K; no funciona en un solo chip.
- GPU consumer: no disponible; el checkpoint está orientado a Tensix, no a CUDA. El quickstart con transformers requiere cargar 27,51 GB en bf16, lo que excede la VRAM de GPUs consumer habituales.
- Despliegue: TT-NN/tt-metal (ruta validada en simulador ttsim), transformers para carga y prueba, tt-forge (tt-xla) aún no probado con Gemma 4.
- Latencia y throughput: no disponibles. La validación multi-chip no se ejecutó; solo se comprobaron las dos primeras capas en un chip simulado.
- Variante BFP4 disponible para dispositivos con menos memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 26,5B (4B activos) | no disponible | 8,72 | 27,51 GB | Apache 2.0 | Hugging Face, 62 descargas |
| google/gemma-4-26B-A4B-it (BF16) | 26,5B (4B activos) | no disponible | 16 | 50,47 GB | Apache 2.0 | Hugging Face (modelo base) |
| gemma-4-26B-A4B-it-Tenstix-BFP4 (mismo autor) | 26,5B (4B activos) | no disponible | no disponible | menor que BFP8 | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 26,5B (4B activos) | no disponible | 5,32 | no disponible | Apache 2.0 (derivada) | llama.cpp |

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el comportamiento de la torre de visión tras el empaquetado no se ha validado más allá de permanecer en bf16.
- La evaluación es muy reducida: 33 preguntas y KL frente a BF16, sin benchmarks estándar ni comparación con otros modelos de la misma categoría.
- La validación en hardware real es parcial: se comprobó el empaquetado en el simulador ttsim, pero el reparto multi-chip no se ejecutó.
- tt-forge (tt-xla) no se ha probado con Gemma 4; su opción `bfp_bf8` recuantiza en el layout [out, in] de PyTorch, lo que puede alterar los resultados.
- tt-transformers no soporta Gemma 4, lo que limita las rutas de despliegue estándar.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base de Google.
- Idiomas soportados: no disponibles; la calibración con coreano no garantiza cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia Apache 2.0 en el checkpoint, pero conviene revisar los términos del modelo base de Google para uso comercial.
- Repositorio con muy poca tracción (62 descargas, 0 likes) y publicaciones recientes; el soporte comunitario es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstix-BFP4
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tenstix-BFP8/blob/main/LICENSE
