# Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Gemma-4-31B-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo multimodal google/gemma-4-31B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la torre de visión y el embedding de imagen en bf16 sin tocar, y cuantiza únicamente las capas lineales del modelo de lenguaje: las proyecciones MLP (gate, up, down) a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ, y las proyecciones de atención q, k, v, o a `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) mediante redondeo al más cercano.

El resultado es un checkpoint de 32.682.375.020 parámetros que ocupa 23,53 GB empaquetado, con una media de 6,13 bits por peso, frente a los 61,39 GB del BF16 original. El objetivo no es servir en GPU convencional, sino desplegar el modelo sobre hardware de Tenstorrent usando la pila TT-NN / tt-metal, de modo que las matrices cuantizadas se empaqueten sin pérdida adicional al cargarlas en el dispositivo.

Es relevante ahora porque demuestra una vía práctica de cuantización de bloques (block floating point) específica para aceleradores Tensix, con verificación de empaquetado bit a bit y una evaluación de fidelidad frente a BF16 y a una cuantización Q4_K_M de llama.cpp. Es, sin embargo, un checkpoint de investigación: es el modelo preentrenado (sin plantilla de chat) y solo se ha cuantizado y evaluado el modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en google/gemma-4-31B; cuantización BFP para NPU Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso, GPTQ) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso, round-to-nearest) en atención q/k/v/o; bf16 en embedding, LM head, normas, `embed_vision` y `vision_tower`; media de 6,13 bits/peso |
| Idiomas soportados | no disponible (evaluación en inglés y coreano, sin listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); matrices almacenadas como valores bf16 sobre la rejilla BFP4/BFP8 para empaquetado directo en TT-NN |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/gemma-4-31B, un transformer multimodal que procesa imagen y texto. La contribución de este checkpoint es exclusivamente la cuantización: las 60 capas del modelo de lenguaje ven cuantizadas sus proyecciones MLP (gate, up, down) a BFP4 con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; las proyecciones de atención q, k, o (60 capas) y v (50 capas) se cuantizan a BFP8 con redondeo al más cercano. El resto de tensores —embedding, LM head (atado al embedding), normas, `embed_vision` y `vision_tower`— permanecen en bf16 sin cambios.

La innovación técnica clave es el uso del formato de coma flotante por bloques nativo de TT-NN: las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de forma que TT-NN las empaqueta sin alterar sus valores. El repositorio incluye scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban, matriz a matriz, que el empaquetado no modifica ningún valor, y el autor indica que el resultado se validó con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent. No se especifican en la información disponible los datos de entrenamiento originales del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y continuación de texto: el checkpoint es el modelo preentrenado, sin plantilla de chat.
- Procesamiento multimodal imagen-texto: la torre de visión y el embedding de imagen se conservan en bf16, por lo que la entrada visual sigue disponible.
- Razonamiento y respuesta a preguntas en formato de completado con few-shot (evaluado con 28 prompts cortos en configuración 3-shot).
- Capacidades multilingües: la evaluación cubre inglés y coreano; no hay listado oficial de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue sobre NPU Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para TT-NN y ocupa 23,53 GB de memoria de dispositivo solo en pesos del modelo de lenguaje, más KV cache y buffers; es el caso de uso principal y el único validado por el autor.
- Investigación en cuantización de bloques: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a BFP8 y frente a Q4_K_M, gracias a los scripts de verificación y a la tabla de fidelidad publicada.
- Evaluación de fidelidad frente a BF16: útil para medir degradación con KL y top-1 sobre texto plano en inglés y coreano antes de adoptar una cuantización en producción.
- Prototipado multimodal en hardware de aceleración: al mantener la torre de visión intacta en bf16, permite experimentar con tareas imagen-texto sobre Tensix sin recuantizar la parte visual.
- Benchmarking de pipelines TT-NN / tt-metal: el autor confirma el empaquetado con ttnn 0.81.1 en ttsim, por lo que sirve para validar rutas de carga de pesos en el simulador Blackhole.
- Base para futuras exportaciones con plantilla de chat: al ser el modelo preentrenado, puede servir como punto de partida para quien quiera añadir ajuste instructivo y plantilla de conversación sobre la versión cuantizada.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-31B) | 16 | 61,39 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP4 MLP + BFP8 atención) | 6,13 | 23,534 | 0,02813 | 93,55 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 18,687 | 0,03187 | 93,01 | 28 de 28 | 0 |

La KL y el top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y 3-shot. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia, con sha256 `e699ca5a8feb8dea0b24b16cdc2619ddafa248c39752abbc515bc8c021ed0e2b`. El criterio del autor (KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida más) se cumple: 0,88 veces la KL de Q4_K_M y 0 respuestas perdidas. El propio autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 23,53 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, mediante TT-NN / tt-metal.
- Simulación: validado con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent.
- GPU consumer: no es el objetivo del checkpoint; la carga con `transformers` en bf16 requeriría del orden de 61 GB de memoria, fuera del alcance de GPU consumer habituales.
- Opciones de despliegue: TT-NN / tt-metal y ttnn para el empaquetado en dispositivo; carga en `transformers` con `AutoModelForCausalLM` y `device_map="auto"` para inspección o evaluación. tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano (GB) | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Este modelo | 32,68 B | no disponible | 6,13 | 23,534 | 0,02813 | Apache 2.0 | Hugging Face, orientado a Tensix |
| google/gemma-4-31B (BF16) | 32,68 B | no disponible | 16 | 61,39 | 0 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 32,68 B | no disponible | 4,87 | 18,687 | 0,03187 | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

No se dispone en la información proporcionada de comparaciones con otros modelos de tamaño similar fuera de la familia gemma-4-31B.

## Limitaciones y advertencias

- Es el modelo preentrenado: continúa texto y no incluye plantilla de chat, por lo que no está listo para uso conversacional directo.
- Solo se ha cuantizado y evaluado el modelo de lenguaje; el rendimiento de la parte de visión tras la exportación no se reporta.
- La evaluación se limita a 8.184 posiciones de texto en inglés y coreano y a 28 prompts cortos; no cubre tareas amplias ni dominios especializados.
- Las métricas publicadas miden fidelidad frente a BF16, no calidad de tarea; no hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.
- No se reporta velocidad, latencia ni throughput.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint; la validación en dispositivo se hizo con el simulador ttsim, no con hardware físico según la información disponible.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base.
- Licencia Apache 2.0, igual que la del modelo base según su card; el repositorio del modelo base no incluye fichero LICENSE, por lo que el autor aporta el texto estándar y documenta los cambios en NOTICE.
- El uso comercial está permitido por la licencia, pero la idoneidad en producción sobre Tensix requiere validación propia de precisión y rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del modelo: https://huggingface.co/Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
