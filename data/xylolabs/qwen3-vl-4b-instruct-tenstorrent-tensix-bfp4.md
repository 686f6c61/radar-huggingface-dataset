# Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Qwen, publicada por Xylolabs y optimizada para su ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, nucleos Tensix). El modelo base combina un transformer de lenguaje de aproximadamente 4.400 millones de parametros con una torre de vision, y acepta entradas de imagen y texto para generar respuestas conversacionales.

La aportacion principal de esta variante es el formato de cuantizacion BFP4 (block floating point de 4 bits, 4,5 bits por peso) aplicado con GPTQ y una busqueda de exponente por bloque a todas las proyecciones de atencion y MLP de las 36 capas del decodificador. El resultado empaquetado ocupa 2,82 GB en Tensix frente a los 8,04 GB en bf16, con un coste de fidelidad medido de 0,0417 de divergencia KL media respecto al modelo original.

Es relevante porque demuestra que un modelo vision-lenguaje de 4B puede desplegarse en hardware de inferencia no-GPU con una perdida de calidad acotada y verificada: 29 de 33 respuestas correctas frente a las 30 del bf16, y 15 de 17 preguntas de imagen acertadas. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con torre de vision (Qwen3-VL), 36 capas en el modelo de lenguaje |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits por peso) en proyecciones de atencion (q, k, v, o) y MLP (gate, up, down); bf16 en embedding atado, LM head, normas y torre de vision. Media de 5,61 bits por peso en el modelo de lenguaje |
| Idiomas soportados | en, ko (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla del formato); empaquetado para Tensix con TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Qwen3-VL con 36 capas en el decodificador, acoplado a una torre de vision que procesa imagenes y las proyecta al espacio del modelo de lenguaje. La cuantizacion afecta exclusivamente al modelo de lenguaje: cada proyeccion de atencion y de MLP se convierte a `bfloat4_b` mediante GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El embedding atado, el LM head, las capas de normalizacion y la torre de vision permanecen en bf16.

La innovacion tecnica reside en el formato BFP4 para los nucleos Tensix de Tenstorrent: las matrices cuantizadas se almacenan como valores bf16 situados en la rejilla del formato, de modo que TT-NN las empaqueta sin alterar ningun valor. El repositorio incluye las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py` del proyecto tensix-bfp-gptq v0.1.0, verificadas en el simulador ttsim con ttnn 0.81.1. No se detalla en la informacion disponible la composicion del dataset de preentrenamiento del modelo base ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y coreano.
- Comprension de imagenes y respuesta a preguntas visuales (image-text-to-text): 15 de 17 preguntas de imagen resueltas correctamente en la evaluacion del autor.
- Descripcion de imagenes, razonamiento visual y extraccion de informacion a partir de contenido grafico.
- Modo de razonamiento extenso ("thinking"), empleado en 7 de las 40 pruebas de evaluacion del autor.
- Soporte de plantillas de chat mediante `apply_chat_template` con `AutoProcessor`.
- Integracion con la libreria `transformers` a traves de `AutoModelForImageTextToText`.
- Inferencia en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante el runner tensix-runner y los kernels tensix-kernels.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni capacidades de audio.

## Casos de uso

- Descripcion automatica de imagenes en catalogo: el modelo recibe una URL o imagen y genera una frase descriptiva, como muestra el ejemplo de la model card; util para etiquetado masivo de productos en ingles o coreano.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes enviadas por usuarios en plataformas con moderacion asistida, aprovechando la torre de vision en bf16 sin perdida de calidad.
- Asistencia documental con capturas: extraccion de informacion de pantallazos o fotografias en flujos de atencion al cliente, con respuestas conversacionales multi-turno.
- Despliegue en edge con NPU Tenstorrent: inferencia de un modelo vision-lenguaje en Wormhole o Blackhole con solo 2,82 GB empaquetados, adecuado para entornos con restricciones de memoria y sin GPU dedicada.
- Prototipado de asistentes bilingues ingles-coreano: conversacion y comprension de imagenes en ambos idiomas, con la licencia Apache 2.0 permitiendo uso comercial.
- Evaluacion de pipelines de cuantizacion: uso del repositorio como referencia reproducible para validar BFP4 con GPTQ frente a Q4_K_M de llama.cpp en tareas de texto e imagen.
- Investigacion en hardware alternativo: banco de pruebas para medir fidelidad (KL, top-1) de modelos multimodales en aceleradores Tensix frente a GPU.

## Benchmarks y rendimiento

Resultados de evaluacion en host publicados por el autor sobre Qwen3-VL-4B-Instruct (no son mediciones en dispositivo; no se reporta velocidad):

| Pesos | Formatos por clase de tensor | Bits por peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---:|---:|---:|---:|---:|---:|
| bf16 (original) | todos bf16 | 16,00 | 8,04 | 0 | 100 | 30/33 | - |
| BFP4-MLP | atencion bfloat8_b, MLP bfloat4_b; cabeza atada bf16 | 6,55 | 3,294 | 0,0282 | 93,04 | 30/33 | 0 |
| BFP4 (este modelo) | todas las proyecciones bfloat4_b; cabeza atada bf16 | 5,61 | 2,822 | 0,0417 | 91,57 | 29/33 | 1 |
| Q4_K_M (llama.cpp) | F32 145, Q4_K 216, Q6_K 37 (GGUF oficial de Qwen, sin imatrix) | 4,95 | 2,497 | 0,0401 | 91,09 | 28/33 | 1 |

La prueba de respuestas consta de 33 prompts fijos con respuesta conocida mas 7 con modo thinking activado (40 en total). En preguntas de imagen, el modelo BFP4 acerto 15 de 17 con la torre de vision en bf16 y no perdio ninguna. La KL media se calcula sobre textos fijos en ingles y coreano; top-1 mide la coincidencia del siguiente token con el modelo bf16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 8,9 GB en el Hub porque almacena los valores cuantizados como bf16; empaquetado para Tensix el modelo de lenguaje ocupa 2,82 GB. En GPU con transformers se carga en bf16 (aproximadamente 8,04 GB de pesos).
- GPU recomendadas para ejecucion via transformers: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB); cualquier GPU con al menos 10-12 GB de memoria libre puede alojar los pesos en bf16 con overhead de activaciones.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y previsiblemente en tarjetas de 12 GB o mas, dado el tamano de 8,04 GB en bf16.
- Despliegue en NPU: Tenstorrent Wormhole y Blackhole mediante TT-NN, con `pack_tensix.py` para empaquetar y `tensix-runner` v0.1.0 para ejecutar; verificado en el simulador ttsim con ttnn 0.81.1.
- Despliegue en GPU: `transformers` con `AutoModelForImageTextToText` y `device_map="auto"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no reporta velocidad y que todas las cifras son evaluaciones en host, no en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4 | 4.437.815.808 | no disponible | BFP4 (5,61 bits/peso) | 2,82 GB empaquetado | Apache 2.0 | Optimizado para NPU Tensix; 29/33 respuestas correctas |
| Qwen3-VL-4B-Instruct (bf16) | 4.437.815.808 | no disponible | bf16 | 8,04 GB | Apache 2.0 | Referencia de fidelidad; 30/33 respuestas correctas |
| Qwen3-VL-4B-Instruct BFP4-MLP (Xylolabs) | 4.437.815.808 | no disponible | Atencion bfloat8_b + MLP bfloat4_b (6,55 bits/peso) | 3,294 GB | Apache 2.0 | Variante con mayor fidelidad (KL 0,0282) y mismo numero de aciertos que bf16 |
| Qwen3-VL-4B-Instruct Q4_K_M (llama.cpp) | 4.437.815.808 | no disponible | Q4_K/Q6_K (4,95 bits/peso) | 2,497 GB | Apache 2.0 | Referencia de cuantizacion en GPU/CPU; 28/33 respuestas correctas |

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia KL media de 0,0417 respecto a bf16 y reduce el top-1 al 91,57 %; una de cada 33 respuestas de la prueba se pierde frente al modelo original.
- El modelo solo fue cuantizado en el decodificador de lenguaje; la torre de vision permanece en bf16, por lo que el ahorro de memoria se limita al modelo de lenguaje.
- Idiomas declarados: ingles y coreano. No se garantiza calidad en castellano ni en otros idiomas, aunque el modelo base pueda tener cobertura adicional no documentada aqui.
- No se han publicado datos de sesgos, toxicidad ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en esta ficha; la cuantizacion agresiva puede incrementarlo en tareas de razonamiento largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.
- El despliegue esta verificado en el simulador ttsim, no en hardware fisico segun la model card; las cifras de rendimiento son evaluaciones en host.
- No se documenta soporte de tool calling ni de agentes multi-paso; conviene validarlo antes de disenar flujos agenticos.
- El repositorio no incluye pesos GGUF ni formatos listos para llama.cpp u Ollama; para GPU hay que usar transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Variante BFP4-MLP: https://huggingface.co/Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4-MLP
- Codigo de cuantizacion (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release de tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3-VL (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
