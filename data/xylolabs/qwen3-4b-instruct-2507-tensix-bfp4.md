# Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP4

## Resumen

Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP4 es una versión cuantizada del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por Xylolabs y orientada específicamente al hardware de aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 4.411 millones de parámetros (4,41 mil millones), desarrollado por el equipo Qwen, y esta exportación aplica cuantizacion GPTQ con formato de coma flotante por bloques (BFP4) sobre las capas lineales de atencion y MLP, manteniendo el resto de tensores en bf16.

El objetivo de esta ficha es resolver un problema de despliegue: reducir la huella de memoria del modelo en los NPU Tensix, donde las matrices cuantizadas se empaquetan directamente como `ttnn.bfloat4_b` sin alterar sus valores. El resultado ocupa aproximadamente 2,82 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, con un promedio de 5,61 bits por peso, frente a los 8,04 GB del checkpoint BF16 original.

Es relevante ahora porque demuestra un flujo de cuantizacion especifico para hardware alternativo a GPU (Tenstorrent), con verificacion de empaquetado bit a bit y una evaluacion de fidelidad frente al modelo BF16 y frente a una cuantizacion Q4_K_M de llama.cpp. La licencia Apache 2.0 del modelo base se mantiene en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), capas lineales cuantizadas a BFP4 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q/k/v/o y gate/up/down de las 36 capas; bf16 en LM head, embedding, normas y resto de tensores; media de 5,61 bits por peso |
| Idiomas soportados | no disponibles (calibracion en WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B-Instruct-2507: un transformer denso de 36 capas con atencion multi-cabeza y capas MLP convencionales. Esta exportación no reentrena el modelo; aplica GPTQ con busqueda de exponente por bloque sobre las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) de las 36 capas, calibrando con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin modificar sus valores; el LM head (atado al embedding), el embedding, las normas y el resto de tensores permanecen en bf16.

La innovacion tecnica destacable es el empaquetado nativo para Tensix: el checkpoint incluye `quant4.json`, que lista el formato de cada proyeccion, y scripts (`pack_tensix.py`, `verify_grid.py`) que verifican, matriz a matriz, que ningun valor cambia al empaquetar. La verificacion se realizo con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent. Los mismos valores tambien se empaquetarian exactamente en `ttnn.bfloat8_b`. No se ejecutaron tt-transformers ni tt-forge con este checkpoint.

## Capacidades

- Generacion de texto conversacional e instruccional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a preguntas cortas (la evaluacion del autor usa 33 prompts cortos con comprobacion automatica).
- Capacidades multilingues: el modelo base Qwen3 soporta varios idiomas; esta exportación fue calibrada con texto en ingles y coreano, aunque la lista oficial de idiomas no esta disponible.
- Empaquetado e inferencia en NPU Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn.
- Verificacion de integridad de pesos cuantizados mediante scripts incluidos.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la informacion proporcionada para esta exportación concreta (dependen del modelo base y no se documentan aqui).
- Vision y audio: no disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint esta pensado para cargarse en NPU Wormhole o Blackhole mediante ttnn, ocupando unos 2,82 GB de DRAM de dispositivo para los pesos, lo que permite ejecutar un modelo de 4B en hardware Tensix con margen para KV cache y buffers.
- Inferencia de bajo consumo en edge o servidores con NPU: al reducir la huella de 8,04 GB (BF16) a 2,82 GB, encaja en escenarios donde la memoria del dispositivo es limitada y no se dispone de GPU.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar bit a bit que el empaquetado BFP4 no altera valores, util para integrar la cuantizacion en un CI de despliegue.
- Prototipado de asistentes conversacionales: el modelo conserva el chat template de Qwen3 y puede usarse con `apply_chat_template` para conversaciones multi-turno, con la calidad cercana al BF16 medida por el autor (29 de 33 respuestas correctas frente a 31 del BF16).
- Evaluacion comparativa de formatos: sirve como referencia para comparar BFP4 frente a Q4_K_M de llama.cpp en terminos de divergencia KL (0,04267 frente a 0,04194) y top-1 (90,63 % frente a 91,04 %).
- Investigacion en compresion de modelos: al mantener bf16 en embedding y normas y cuantizar solo proyecciones, es un caso de estudio de cuantizacion selectiva por tipo de tensor.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (fidelidad frente al BF16, no calidad de tarea):

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B-Instruct-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4) | 5,61 | 2,822 | 0,04267 | 90,63 | 29 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04194 | 91,04 | 30 de 33 | 1 |

La KL y el top-1 se miden sobre 16.272 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con chat template. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica. El autor indica que estos numeros miden cercania al BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo estimada: unos 2,82 GB para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). Verificado con ttnn 0.81.1 sobre ttsim (simulador Blackhole).
- GPU consumer: no disponible como objetivo principal; el checkpoint esta pensado para Tensix. La carga via transformers con `dtype="bfloat16"` y `device_map="auto"` se documenta en el quickstart, pero no se detallan requisitos de VRAM para GPU.
- Despliegue: tt-metal/ttnn (empaquetado nativo `ttnn.bfloat4_b`), transformers para carga generica. tt-transformers y tt-forge no fueron probados con este checkpoint.
- Latencia y throughput: no disponible en la informacion proporcionada (el autor indica explicitamente que no reporta velocidad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| Este modelo (BFP4) | 4,41 mil millones | no disponible | 2,822 GB | Apache 2.0 | safetensors BFP4, Tensix |
| Qwen/Qwen3-4B-Instruct-2507 (BF16) | 4,41 mil millones | no disponible | 8,04 GB | Apache 2.0 | safetensors bf16, GPU/CPU |
| Q4_K_M (llama.cpp) | 4,41 mil millones | no disponible | 2,497 GB | Apache 2.0 (base) | GGUF, CPU/GPU |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la informacion proporcionada no incluye alternativas de otros desarrolladores. En fidelidad al BF16, este modelo queda ligeramente por detras de Q4_K_M (KL 0,04267 frente a 0,04194; top-1 90,63 % frente a 91,04 %), pero esta optimizado para empaquetado nativo en Tensix, no para llama.cpp.

## Limitaciones y advertencias

- La evaluacion mide cercania al BF16, no calidad de tarea; no hay benchmarks de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.
- No se reporta velocidad, latencia ni throughput.
- La calibracion GPTQ se realizo con WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas no esta documentado.
- La lista oficial de idiomas soportados no esta disponible.
- La longitud de contexto del modelo base no se detalla en esta ficha.
- Solo esta verificado con ttnn 0.81.1 sobre el simulador ttsim; tt-transformers y tt-forge no se probaron con este checkpoint.
- El modelo se distribuye "as is", sin garantia, y no esta afiliado ni respaldado por Tenstorrent.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan del modelo base Qwen3-4B-Instruct-2507.
- Licencia Apache 2.0 permite uso comercial, con los cambios listados en `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP4/blob/main/LICENSE
