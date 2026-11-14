# Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP4

## Resumen

Gemma 4 E4B Tenstorrent Tensix BFP4 es una cuantizacion del modelo google/gemma-4-E4B realizada por Xylolabs, orientada especificamente a la ejecucion sobre aceleradores NPU de Tenstorrent (microarquitectura Tensix, familias Wormhole y Blackhole) mediante el stack tt-metal y la libreria TT-NN. El problema que resuelve es el de llevar un modelo multimodal de la familia Gemma 4 a la memoria DRAM disponible en estas tarjetas, manteniendo la fidelidad numerica respecto al modelo original en bf16.

La intervencion tecnica consiste en cuantizar a `ttnn.bfloat4_b` (block floating point de 4,5 bits por peso) unicamente las proyecciones lineales del modelo de lenguaje: atencion (q, o en 42 capas; k, v en 24 capas) y MLP (gate, up, down en 42 capas), aplicando GPTQ con busqueda de exponente por bloque. El resto de tensores (embeddings, LM head atada al embedding, normas y las torres de vision y audio) permanece en bf16 sin modificar.

El checkpoint resultante ocupa 9,37 GB empaquetado, con una media de 9,96 bits por peso, frente a los 15,04 GB del bf16 original. La relevancia actual esta en que demuestra una ruta de despliegue de un modelo any-to-any de ~8,7 mil millones de parametros en hardware NPU no convencional, con una perdida de fidelidad medida muy contenida (KL medio de 0,05101 frente a bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) derivado de Gemma 4; incluye `vision_tower`, `audio_tower`, `embed_vision`, `embed_audio` y modelo de lenguaje |
| Parametros totales | 8.667.245.130 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones lineales de atencion y MLP; bf16 en embeddings, LM head, normas y torres de vision y audio; media de 9,96 bits por peso |
| Idiomas soportados | no disponible (la calibracion uso WikiText-2 en ingles y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con tensor de configuracion `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E4B, un modelo multimodal de tipo any-to-any que combina un modelo de lenguaje transformer con una torre de vision y una torre de audio. La model card del checkpoint cuantizado referencia 42 capas con proyecciones de atencion q, o y de MLP gate, up, down, y 24 capas con proyecciones k, v en formato BFP4; el resto de tensores mantiene la precision original. No se detalla en la informacion disponible la composicion del dataset de preentrenamiento del modelo base, el numero de tokens, ni si hubo fases de RLHF o DPO.

La innovacion del checkpoint es el proceso de cuantizacion: se aplica GPTQ con busqueda de exponente por bloque (block floating point) y calibracion sobre 65.536 tokens compuestos por WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin alterar sus valores; la model card verifica esta propiedad con una comprobacion de igualdad exacta tras el empaquetado, y senala que los mismos valores tambien se empaquetan de forma exacta en `ttnn.bfloat8_b`. Solo se cuantizo y evaluo el modelo de lenguaje.

## Capacidades

- Generacion de texto y continuacion de texto: el checkpoint es el modelo preentrenado, sin plantilla de chat.
- Entrada multimodal imagen-texto y audio-texto: conserva en bf16 las torres de vision y audio y sus embeddings, por lo que mantiene la interfaz any-to-any del modelo base.
- Razonamiento y respuesta a preguntas en formato de completado few-shot (la evaluacion usa 3-shot en forma de completion).
- Capacidades multilingues: se ha calibrado con corpus en ingles y coreano, aunque el conjunto exacto de idiomas soportados no esta documentado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint esta pensado para cargarse en DRAM de dispositivo con TT-NN, ocupando 9,37 GB solo en pesos del modelo de lenguaje, mas espacio para cache KV y buffers. Es el escenario principal y para el que se ha verificado el empaquetado.
- Experimentacion con cuantizacion block floating point: sirve como referencia reproducible de GPTQ sobre rejilla BFP4, con scripts `pack_tensix.py` y `verify_grid.py` para comprobar que ningun valor cambia al empaquetar.
- Evaluacion de fidelidad de cuantizacion: util para medir el impacto de BFP4 frente a bf16 y frente a Q4_K_M de llama.cpp con las metricas publicadas (KL medio, top-1, respuestas correctas), como paso previo a adoptar la cuantizacion en produccion.
- Investigacion en eficiencia de memoria en aceleradores: permite comparar 9,37 GB empaquetados frente a 15,04 GB en bf16 sobre el mismo modelo, para estudiar el equilibrio entre precision y huella de memoria en NPU.
- Prototipado de pipelines multimodales imagen-texto y audio-texto en hardware Tenstorrent: al conservar las torres en bf16, se puede validar la ruta de entrada multimodal antes de cuantizar esas partes.
- Validacion de la cadena de herramientas TT-NN y tt-metal: la model card indica que se comprobo con ttnn 0.81.1 sobre ttsim (simulador Blackhole), por lo que es util para verificar versiones del stack antes de desplegar otros modelos.
- Generacion de texto en modo completado para tareas de evaluacion controlada: el checkpoint mantiene buen ajuste a bf16 en texto plano en ingles y coreano, lo que permite usarlo en arneses de evaluacion tipo few-shot.

## Benchmarks y rendimiento

Los datos publicados miden cercania al modelo bf16, no calidad de tarea. KL y top-1 se calculan sobre 8.176 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en forma de completion y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E4B) | 16 | 15,04 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP4) | 9,96 | 9,365 | 0,05101 | 89,21 | 23 de 28 | 1 |
| Q4_K_M con blk.N.proj en Q8_0 (llama.cpp) | 5,67 | 5,349 | 0,24892 | 76,39 | 20 de 28 | 4 |

La model card indica que no se reporta velocidad. El Q4_K_M de comparacion se genero con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `c2bd4c28df4a70b6de17427a394c6acb6d22bf3a2ca8d9b9368bd896ce024c9a`.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 9,37 GB solo para los pesos del modelo de lenguaje, mas espacio adicional para cache KV y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, familias Wormhole y Blackhole.
- Verificacion realizada con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent.
- GPU consumer: no disponible; el checkpoint esta orientado a NPU Tensix, no se documenta su ejecucion en GPU.
- Despliegue en GPU mediante transformers: la model card incluye un ejemplo con `AutoModelForCausalLM` y `device_map="auto"`, pero no especifica VRAM ni GPU recomendadas.
- Opciones de despliegue: TT-NN sobre tt-metal para Tensix; transformers para carga en bf16. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles; la model card declara explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / tamano | Fidelidad vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4 Tenstix) | 8.667.245.130 | no disponible | 9,96 bits/peso, 9,365 GB | KL 0,05101; top-1 89,21 % | Apache 2.0 | Hugging Face, 40 descargas |
| google/gemma-4-E4B (BF16) | 8.667.245.130 | no disponible | 16 bits/peso, 15,04 GB | referencia | Apache 2.0 | Hugging Face (modelo base) |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8.667.245.130 | no disponible | 5,67 bits/peso, 5,349 GB | KL 0,24892; top-1 76,39 % | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; las torres de vision y audio permanecen en bf16 y no se han evaluado en esta version.
- El checkpoint es el modelo preentrenado: no incluye plantilla de chat, por lo que no es adecuado directamente para dialogos conversacionales sin ajuste o plantilla externa.
- Las metricas publicadas miden proximidad a bf16 (KL y top-1), no calidad de tarea; no hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.
- Hay una respuesta perdida respecto a bf16 en el conjunto de 28 prompts (23 de 28 frente a 27 de 28), lo que indica degradacion no nula en tareas sensibles a pequenas diferencias numericas.
- La calibracion de GPTQ se hizo sobre WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas o dominios no esta documentado.
- No se han publicado sesgos conocidos, tasas de alucinacion ni restricciones adicionales mas alla de la licencia Apache 2.0.
- El soporte esta limitado al stack de Tenstorrent: tt-transformers y tt-forge no se han ejecutado con este checkpoint, y la verificacion se hizo sobre simulador, no sobre silicio real.
- El uso en produccion requiere validar el espacio de cache KV y buffers sobre la DRAM real del dispositivo, ya que los 9,37 GB solo cubren los pesos del modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio de codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arxiv:2607.02770 (https://arxiv.org/abs/2607.02770)
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
