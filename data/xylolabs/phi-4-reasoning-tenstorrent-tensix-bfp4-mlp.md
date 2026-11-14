# Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Phi-4-reasoning-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-reasoning, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No es un modelo nuevo: es el mismo Phi-4-reasoning de 14.660 millones de parámetros, con sus capas lineales cuantizadas a formatos de coma flotante por bloques (BFP4 y BFP8) que el stack TT-NN de Tenstorrent puede empaquetar sin recomprimir en tiempo de carga.

La relevancia de esta ficha radica en que el checkpoint pesa 11,03 GB empaquetado (frente a 29,32 GB en BF16), con un promedio de 6,02 bits por peso. Las capas MLP (gate, up, down) se cuantizan a bfloat4_b mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; las proyecciones de atención (q, k, v, o) se cuantizan a bfloat8_b con redondeo al más cercano. El resto de tensores (embeddings, LM head, normas) permanecen en bf16.

El modelo conserva la licencia MIT del modelo base y el formato de pesos safetensors en disposición Llama (LlamaForCausalLM), con las matrices fusionadas q/k/v y gate-up de Phi-4 separadas pero con valores idénticos. Está pensado para despliegue en hardware Tenstorrent, aunque también puede cargarse con transformers convencional en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-reasoning), exportado en layout Llama (`LlamaForCausalLM`) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b, ~4,5 bits/peso) en MLP; BFP8 (bfloat8_b, ~8,5 bits/peso) en atencion; bf16 en embeddings, LM head y normas. Media: 6,02 bits/peso |
| Idiomas soportados | en (ingles; la calibracion incluye tambien texto en coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (29,3 GB de repo; 11,03 GB empaquetados en dispositivo) |

## Arquitectura y entrenamiento

El modelo base es Phi-4-reasoning de Microsoft, un transformer decoder-only denso de 14,66 mil millones de parametros con 40 capas. Esta exportacion no reentrena el modelo: aplica cuantizacion post-entrenamiento sobre las matrices lineales. Las proyecciones MLP (gate, up, down) en las 40 capas se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atencion (q, k, v, o) se cuantizan a `ttnn.bfloat8_b` con redondeo al mas cercano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores.

La innovacion tecnica clave es la compatibilidad nativa con el formato de bloque de coma flotante de Tenstorrent: el checkpoint se empaqueta bit a bit en `ttnn.bfloat4_b` y `ttnn.bfloat8_b` sin perdida adicional, algo que se verifica mediante scripts de comprobacion (`pack_tensix.py`, `verify_grid.py`). El checkpoint se entrega en layout Llama con las matrices fusionadas de Phi-4 separadas, manteniendo los mismos valores. El modelo base incorpora modo de razonamiento (bloque de pensamiento `<think>`) y fue entrenado con las tecnicas de post-entrenamiento de Microsoft para Phi-4-reasoning, aunque los detalles concretos de RLHF/DPO del modelo base no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional con plantilla de chat compatible con el modelo base.
- Razonamiento multi-paso mediante bloque de pensamiento (`<think>...</think>`) antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas de tipo STEM (heredado de Phi-4-reasoning).
- Generacion y comprension de codigo (capacidad del modelo base).
- Empaquetado exacto en los formatos de bloque BFP4 y BFP8 de TT-NN para ejecucion en NPU Tensix.
- Carga estandar con `transformers` (`AutoModelForCausalLM`) en bfloat16 sobre GPU.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en este checkpoint (es solo texto).
- Capacidades multilingues: limitadas al ingles segun la model card, aunque la calibracion uso texto en coreano.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint se empaqueta directamente en DRAM del dispositivo en BFP4/BFP8 sin conversion adicional, ocupando unos 11,03 GB de memoria de dispositivo para los pesos, mas espacio para KV cache y buffers. Es el caso de uso principal de esta exportacion.
- Razonamiento asistido en entornos con memoria limitada: al reducir el peso de 29,32 GB a 11,03 GB, permite ejecutar un modelo de razonamiento de 14,6B en hardware con menos memoria que el BF16 original, manteniendo un 94,13 % de top-1 frente al BF16.
- Investigacion en cuantizacion de bloque: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a Q4_K_M de llama.cpp (KL de 0,015808 frente a 0,011492, segun la model card).
- Generacion de codigo y matematicas en pipelines de inferencia: el modelo base destaca en tareas de razonamiento; esta version permite integrarlo en servicios con `transformers` y `text-generation-inference` (tags de la model card) reduciendo requisitos de memoria.
- Prototipado en simulador: la model card indica que se verifico con ttnn 0.81.1 sobre `ttsim`, el simulador Blackhole de Tenstorrent, lo que permite validar pipelines antes de disponer de hardware fisico.
- Evaluacion comparativa de formatos de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz se empaqueta sin cambios de valor, util para auditar exportaciones propias.
- Chat conversacional en ingles con contexto de razonamiento: mediante la plantilla de chat original y los ajustes de muestreo recomendados por Microsoft (temperatura 0,8, top_k 50, top_p 0,95).

## Benchmarks y rendimiento

Datos publicados en la model card (evaluacion propia del autor):

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/Phi-4-reasoning) | 16 | 29,32 | 0 | 100 | 8 de 33 | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,02 | 11,034 | 0,015808 | 94,13 | 7 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,94 | 9,059 | 0,011492 | 94,42 | 7 de 33 | 0 |

Notas metodologicas de la model card: KL y top-1 se calculan sobre 14.528 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con la plantilla de chat de Microsoft sin bloque de pensamiento. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica; la prueba de 33 prompts usa decodificacion greedy con prefijo `<think></think>` vacio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: ~11,03 GB solo para pesos del modelo de lenguaje, mas KV cache y buffers (cifra indicada por el autor para Tensix).
- GPU recomendadas: no especificadas en la informacion proporcionada; el modelo puede cargarse con `transformers` en bfloat16 y `device_map="auto"`, lo que en la practica requiere GPUs con al menos ~30 GB para el checkpoint BF16 completo o menos si se descargan solo los tensores empaquetados.
- NPU objetivo: Tenstorrent Tensix (Wormhole, Blackhole), verificado en el simulador `ttsim` con ttnn 0.81.1.
- Cabe en GPU de consumo: no confirmado; el repo completo ocupa 29,3 GB, por lo que no cabe integro en GPUs de 24 GB sin cuantizacion adicional o carga parcial.
- Opciones de despliegue: `transformers` (soporte confirmado), TT-NN / tt-metal / tt-forge (objetivo principal; la model card indica que tt-transformers y tt-forge no se probaron con este checkpoint), `text-generation-inference` (tag de la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 14,66B | no disponible | BFP4 MLP + BFP8 atencion (6,02 bits/peso) | MIT | Hugging Face, orientado a Tensix |
| microsoft/Phi-4-reasoning (BF16) | 14,66B | no disponible | BF16 | MIT | Hugging Face |
| Phi-4-reasoning Q4_K_M (llama.cpp) | 14,66B | no disponible | Q4_K_M (4,94 bits/peso) | MIT (derivada) | Hugging Face / llama.cpp |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M referenciada por el propio autor; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara solo ingles; el rendimiento en otros idiomas no esta garantizado aunque la calibracion incluyo coreano.
- Perdida de calidad respecto a BF16: KL media de 0,015808 y top-1 del 94,13 %; una de las 33 respuestas correctas en BF16 se pierde en esta version.
- Dependencia de hardware: el formato BFP4/BFP8 esta disenado para TT-NN; fuera de Tenstorrent los tensores se cargan como bf16 sobre rejilla BFP, con el coste de memoria del repo completo (29,3 GB).
- Compatibilidad no verificada: la model card indica explicitamente que tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Riesgo de alucinacion: inherente al modelo base Phi-4-reasoning; no se documentan mitigaciones adicionales en esta exportacion.
- Sesgos: no documentados en la informacion proporcionada; heredados del dataset de entrenamiento del modelo base.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base de Microsoft y de los datos de calibracion (WikiText-2 y Wikipedia en coreano).
- Advertencia de produccion: el checkpoint se valido en simulador (`ttsim`), no en hardware fisico segun la model card; conviene validar en dispositivo real antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
