# Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Gemma-4-E2B-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo multimodal google/gemma-4-E2B realizada por Xylolabs, orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la estructura completa del original (torre de vision, torre de audio, embeddings y cabecera LM en bf16) y solo cuantiza las proyecciones lineales del transformer de lenguaje: las capas MLP a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ y las proyecciones de atencion a `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) mediante redondeo al mas cercano.

El resultado es un checkpoint de 5.525.831.235 parametros totales que ocupa 11,1 GB en el repositorio y 6,78 GB empaquetado en memoria de dispositivo para los pesos del modelo de lenguaje. El interes practico esta en que los valores cuantizados se almacenan como bf16 sobre la rejilla BFP, de modo que TT-NN los empaqueta sin alterar sus valores: el mismo tensor se puede cargar en `ttnn.bfloat4_b` o `ttnn.bfloat8_b` de forma exacta, lo que simplifica el despliegue en hardware Tenstorrent.

Es relevante ahora porque demuestra que la cuantizacion de bloque en formato BFP, nativa del hardware Tensix, permite reducir el coste de memoria de un modelo multimodal sin degradar practicamente la calidad respecto al BF16 original: la divergencia KL media es de 0,03708 frente a BF16 y el modelo acierta 21 de 28 preguntas de control, las mismas que el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) derivado de Gemma 4; pesos lineales cuantizados a formatos BFP de Tenstorrent |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso, GPTQ) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso, RTN) en atencion; bf16 en embeddings, LM head, normas, torres de vision y audio |
| Idiomas soportados | no disponible (la calibracion uso texto en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado nativo TT-NN |
| Bits medios por peso (LM) | 11,67 |
| Tamano empaquetado (LM) | 6,78 GB en DRAM de dispositivo |
| Tamano del repositorio | 11,1 GB |
| Modelo base | google/gemma-4-E2B |
| Pipeline | any-to-any (image-text-to-text) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El checkpoint no introduce un entrenamiento nuevo: es una exportacion cuantizada del modelo base google/gemma-4-E2B. La arquitectura subyacente es la de Gemma 4 en su variante E2B, un transformer multimodal con torre de vision, torre de audio y proyecciones de embedding separadas (`vision_tower`, `embed_vision`, `audio_tower`, `embed_audio`), todas conservadas en bf16 sin modificar. El cuerpo de lenguaje consta de 35 capas con proyecciones de atencion q, o, k, v y proyecciones MLP gate, up y down.

La innovacion tecnica esta en el esquema de cuantizacion. Las matrices MLP se cuantizan a BFP4 con GPTQ y una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atencion se cuantizan a BFP8 con redondeo al mas cercano. Los tensores resultantes se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de forma que TT-NN los empaqueta sin cambiar sus valores: la verificacion consiste en comprobar que `ttnn.to_torch` devuelve exactamente el tensor original. El archivo `quant4.json` documenta el formato de cada proyeccion.

El modelo es el checkpoint preentrenado, sin plantilla de chat: continua texto y no incorpora un formato conversacional. La validacion se realizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent. Los autores indican que tt-transformers y tt-forge no se probaron con este checkpoint.

## Capacidades

- Generacion de texto y continuacion de secuencias en modo completion (sin plantilla de chat).
- Procesamiento multimodal any-to-any: entrada de imagen y texto, con torre de vision y embeddings visuales en bf16.
- Procesamiento de audio: torre de audio y embeddings de audio conservados en bf16.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4 E2B.
- Capacidades multilingues heredadas del modelo base, con calibracion de cuantizacion en ingles y coreano.
- Inferencia sobre aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN.
- Carga y ejecucion en transformers con `AutoModelForCausalLM` en bf16 sobre GPU/CPU.
- Soporte de tool calling, agentes o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint esta pensado para ejecutarse en NPUs Tensix (Wormhole, Blackhole) con TT-NN, aprovechando el empaquetado nativo BFP4/BFP8 y los 6,78 GB de DRAM necesarios para los pesos del modelo de lenguaje.
- Servicio de generacion de texto con restricciones de memoria: la reduccion de 9,29 GB (BF16) a 6,78 GB empaquetado permite alojar el modelo de lenguaje en dispositivos con DRAM limitada, dejando espacio para cache KV y buffers.
- Prototipado multimodal en simulador: la validacion con ttsim (simulador de Blackhole) permite desarrollar y depurar pipelines de vision y audio antes de disponer de hardware fisico.
- Investigacion en cuantizacion BFP: el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) y el manifiesto `quant4.json` para reproducir y auditar el empaquetado de cada matriz, util para estudiar el impacto de BFP4 con GPTQ frente a RTN.
- Evaluacion comparativa de formatos de cuantizacion: al poder empaquetar los mismos valores en `bfloat4_b` y `bfloat8_b` de forma exacta, sirve para medir el efecto del formato de hardware sin confundirlo con el error de cuantizacion.
- Continuacion de texto y tareas de completion en lote: al ser un modelo preentrenado sin plantilla de chat, encaja en pipelines de generacion de texto en modo few-shot o completion, como el usado en la evaluacion (3-shot, 28 prompts).
- Base para ajuste fino o destilacion sobre hardware Tenstorrent: al conservar arquitectura y tensores no lineales en bf16, puede servir como punto de partida para experimentos posteriores en el ecosistema tt-metal.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al modelo BF16 original, no el rendimiento en tareas. KL y top-1 se calculan sobre 8.176 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano); las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato completion y 3-shot.

| Modelo | Bits/peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E2B) | 16 | 9,29 | 0 | 100 | 21 de 28 | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 11,67 | 6,778 | 0,03708 | 89,96 | 21 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,10733 | 83,79 | 20 de 28 | 1 |

El criterio de aceptacion fijado por los autores era una KL media como maximo 1,5 veces la de Q4_K_M y como maximo una respuesta perdida adicional. El resultado obtenido es 0,35 veces la KL de Q4_K_M y cero respuestas perdidas frente a una del cuantizado de llama.cpp. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,78 GB para los pesos del modelo de lenguaje empaquetados en formato BFP, mas espacio adicional para cache KV y buffers. El repositorio completo ocupa 11,1 GB en disco.
- Aceleradores objetivo: Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante TT-NN (probado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole).
- GPU convencionales: el checkpoint es cargable con transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`); los requisitos concretos de VRAM en GPU no estan especificados en la informacion disponible.
- Opciones de despliegue: TT-NN / tt-metal para Tensix; transformers para carga en bf16. No se ha validado con tt-transformers ni tt-forge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo | 5.525.831.235 | no disponible | BFP4 MLP + BFP8 atencion, 11,67 bits medios | 6,778 GB (LM) | Apache-2.0 | Orientado a Tensix; KL 0,03708; 21/28 |
| google/gemma-4-E2B (BF16) | 5.525.831.235 | no disponible | bf16, 16 bits | 9,29 GB | Apache-2.0 (segun este repo) | Referencia de calidad; 21/28 |
| Q4_K_M de gemma-4-E2B (llama.cpp) | 5.525.831.235 | no disponible | Q4_K_M, 5,87 bits | 3,428 GB | Apache-2.0 (segun este repo) | Mayor compresion, KL 0,10733; 20/28 |

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; las torres de vision y audio se conservan en bf16 pero no se reportan evaluaciones de su calidad tras la exportacion.
- Es el checkpoint preentrenado: no tiene plantilla de chat ni ajuste por instrucciones, por lo que no debe usarse directamente como asistente conversacional sin ajuste o formateo adicional.
- La evaluacion se limita a 8.176 posiciones de texto en ingles y coreano y a 28 prompts cortos; no cubre tareas de razonamiento, codigo ni matematicas.
- Los datos de calibracion de GPTQ provienen de WikiText-2 y Wikipedia en coreano, lo que puede sesgar la cuantizacion hacia el dominio y los idiomas de calibracion.
- La cuantizacion BFP4 en las capas MLP introduce un error no nulo (KL 0,03708, top-1 89,96 % frente a BF16); en produccion conviene validar sobre el dominio concreto de uso.
- El checkpoint esta disenado para Tensix; no se ha validado con tt-transformers ni tt-forge, y el empaquetado se comprobo en el simulador ttsim, no en hardware fisico segun la informacion disponible.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion proporcionada; se heredan los del modelo base.
- Licencia Apache-2.0 segun el repositorio; conviene verificar los terminos del modelo base google/gemma-4-E2B antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Revision del modelo base usada en la evaluacion: https://huggingface.co/google/gemma-4-E2B/tree/433813a669639fd7eaa83155828e9000ed357d53
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia: arXiv:2607.02770 (https://arxiv.org/abs/2607.02770)
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
