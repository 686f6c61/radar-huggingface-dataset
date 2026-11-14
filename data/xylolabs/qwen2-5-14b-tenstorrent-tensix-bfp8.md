# Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen2.5-14B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo base Qwen/Qwen2.5-14B, publicada por Xylolabs, específicamente empaquetada para su ejecución en NPUs Tensix de Tenstorrent (Wormhole y Blackhole). El modelo mantiene la arquitectura transformer densa de Qwen2.5-14B con 14.770.033.664 parámetros, pero cuantiza las capas lineales de atención (q, k, v, o) y del MLP (gate, up, down) en las 48 capas al formato `ttnn.bfloat8_b` (BFP8) mediante GPTQ sobre la rejilla de bloque flotante que utiliza TT-NN.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica para GPU, sino de un empaquetado pensado para que el runtime TT-NN de Tenstorrent cargue los pesos sin transformación adicional: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que el packer de TT-NN las lee con los mismos valores. Esto permite desplegar un modelo de 14B en hardware Tensix con un consumo de memoria de dispositivo de aproximadamente 17,15 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.

El modelo es de completación de texto (no está ajustado por instrucciones), conserva la plantilla de chat del modelo base y se distribuye bajo licencia Apache 2.0. La model card reporta una fidelidad muy alta respecto al BF16 original: una divergencia KL media de 0,00178 y un 98,58 % de top-1, con 27 de 28 respuestas correctas en un conjunto de comprobación corto, sin pérdida neta frente al BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), capas lineales cuantizadas a BFP8 |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en q, k, v, o, gate, up, down de 48 capas; bf16 en LM head, embeddings, norms y resto de tensores; media de 9,29 bits por peso |
| Idiomas soportados | en (segun metadatos; el calibrado de cuantizacion uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,5 GB; pesos empaquetados 17,15 GB en dispositivo) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen2.5-14B original, que es un transformer denso decoder-only de la familia Qwen2. No se ha reentrenado ni ajustado: la model card indica explicitamente que es el modelo preentrenado y que no esta ajustado por instrucciones. La innovacion tecnica esta en el proceso de cuantizacion: las proyecciones lineales de atencion (q, k, v, o) y del MLP (gate, up, down) en las 48 capas se cuantizan con GPTQ sobre la rejilla de bloque flotante `bfloat8_b` de TT-NN, manteniendo el exponente compartido de cada bloque tal como lo establece el packer. El calibrado se realizo sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

El resultado se almacena como valores bf16 sobre la rejilla BFP8, de modo que TT-NN empaqueta las matrices sin alterar sus valores. El repositorio incluye `quant4.json`, que lista el formato de cada proyeccion, y utilidades de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que ninguna matriz cambia de valor al empaquetarse. La model card advierte que tt-transformers y tt-forge no se ejecutaron con este checkpoint; las comprobaciones se hicieron con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).

## Capacidades

- Generacion de texto por completacion: el modelo continua texto a partir de un prefijo; no es un modelo de instrucciones.
- Razonamiento y conocimiento general heredados de Qwen2.5-14B, sujetos a la fidelidad de la cuantizacion BFP8.
- Generacion de codigo y matematicas: capacidades del modelo base, no evaluadas de forma especifica en la informacion disponible.
- Soporte multilingue: los metadatos declaran solo ingles; el calibrado incluyo texto coreano, pero no se documenta soporte oficial de otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada (al no ser un modelo ajustado por instrucciones, no se documenta soporte nativo).
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo es solo de texto.

## Casos de uso

- Despliegue en hardware Tensix: el caso principal es ejecutar un modelo de 14B en NPUs Wormhole o Blackhole con aproximadamente 17,15 GB de memoria de dispositivo para los pesos, aprovechando el empaquetado BFP8 nativo de TT-NN sin conversion en tiempo de carga.
- Completacion de texto en produccion sobre aceleradores Tenstorrent: integrable en pipelines de generacion donde se requiera un modelo denso de 14B con fidelidad cercana a BF16 (KL media de 0,00178) y sin perdida neta en el conjunto de comprobacion del autor.
- Sustitucion de BF16 en entornos con restricciones de memoria: el modelo ocupa 17,15 GB frente a 29,54 GB del BF16, lo que permite encajar el modelo en dispositivos Tensix con menos DRAM manteniendo un 98,58 % de top-1 respecto al original.
- Evaluacion y validacion de cuantizacion: util como referencia reproducible para comparar tecnicas de cuantizacion BFP8 frente a Q4_K_M de llama.cpp en terminos de divergencia KL y top-1 sobre texto en ingles y coreano.
- Investigacion en formatos de bloque flotante: el repositorio incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que permiten comprobar la integridad de la rejilla BFP8, util para estudiar el impacto del empaquetado en la fidelidad numerica.
- Prototipado en simulador: la model card documenta su uso con ttnn 0.81.1 sobre ttsim (simulador Blackhole), lo que permite desarrollar y validar flujos de inferencia Tensix sin hardware fisico.
- Generacion de texto en ingles con contexto de completacion: adecuado para tareas de continuacion de texto donde no se requiera seguir instrucciones, como generacion de documentacion o relleno de plantillas.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-14B) | 16 | 29,54 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP8) | 9,29 | 17,154 | 0,00178 | 98,58 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07985 | 91,31 | 26 de 28 | 0 |

Las metricas KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato de completacion y con 3 ejemplos (3-shot). La model card advierte que estas cifras miden cercania al BF16, no calidad de tarea, y que no se reporta velocidad. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 y sin matriz de importancia.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 17,15 GB solo para los pesos del modelo de lenguaje, mas espacio para la cache KV y buffers (la model card no cuantifica este extra).
- Hardware objetivo: NPUs Tensix de Tenstorrent (Wormhole y Blackhole). No esta pensado para GPU convencionales, aunque los pesos en safetensors pueden cargarse con transformers en bf16 (29,5 GB de repo).
- Cabe en consumer GPU: no disponible en la informacion proporcionada; el formato BFP8 es especifico de TT-NN y no se documenta su uso en GPUs de consumo.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado sobre ttsim), con scripts `pack_tensix.py` y `verify_grid.py`; tt-transformers y tt-forge no se probaron con este checkpoint. Para GPU, carga via transformers con `dtype="bfloat16"` y `device_map="auto"`.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.
- Alternativa para dispositivos con menos memoria: el autor remite a la version BFP4 (Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP8 | 14,77B | no disponible | BFP8 (9,29 bits/peso), 17,15 GB | Apache 2.0 | Hugging Face, 43 descargas |
| Qwen/Qwen2.5-14B (BF16) | 14,77B | no disponible | BF16, 29,54 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 14,77B | no disponible | 4,87 bits/peso, 8,988 GB | Apache 2.0 (heredada) | Generado con llama.cpp v0.9.0 |
| Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp | 14,77B | no disponible | BFP4 (menor que BFP8) | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye otros modelos de la misma categoria con datos verificables. El BFP8 se situa entre el BF16 y el Q4_K_M en tamano, con una fidelidad mucho mas cercana al BF16 que el Q4_K_M (KL 0,00178 frente a 0,07985).

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: la model card indica explicitamente que es el modelo preentrenado y que solo continua texto; no debe usarse como asistente conversacional sin ajuste adicional.
- Idiomas: los metadatos declaran solo ingles; el calibrado incluyo coreano, pero no se documenta soporte oficial multilingue.
- Longitud de contexto: no disponible en la informacion proporcionada; conviene consultar la model card de Qwen2.5-14B para el dato del modelo base.
- La cuantizacion BFP8 es especifica de TT-NN: fuera de ese runtime, los pesos deben cargarse en bf16, con el coste de memoria del modelo completo (29,5 GB de repo).
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; la validacion se hizo con ttnn 0.81.1 sobre simulador (ttsim), no necesariamente en hardware fisico.
- Riesgo de alucinacion: inherente al modelo base; no se documentan evaluaciones de seguridad ni de sesgo en la informacion proporcionada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Las metricas de evaluacion miden cercania al BF16, no calidad de tarea; no se reportan benchmarks de MMLU, HumanEval o GSM8K.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantia, y sin afiliacion ni respaldo de Tenstorrent.
- El repositorio tiene muy poca traccion (43 descargas, 0 likes) y fue creado en noviembre de 2026; conviene verificar su mantenimiento antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Version BFP4: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4-GateUp
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
