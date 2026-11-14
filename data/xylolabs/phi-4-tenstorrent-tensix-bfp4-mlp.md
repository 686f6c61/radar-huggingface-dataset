# Xylolabs/phi-4-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Phi-4 Tenstorrent Tensix BFP4 MLP es una exportación cuantizada de microsoft/phi-4, un transformer decoder-only de 14.659.507.200 parámetros desarrollado originalmente por Microsoft Research. La variante la publica Xylolabs y está específicamente optimizada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), empaquetando los pesos en formatos de coma flotante por bloques (BFP4 y BFP8) que el runtime TT-NN puede consumir sin transformación adicional.

El problema que resuelve es la brecha entre los checkpoints estándar en bf16 y el hardware de aceleración de Tenstorrent: los tensores se almacenan ya sobre la retícula BFP4 o BFP8, de modo que el empaquetado en dispositivo no altera sus valores. El resultado ocupa unos 11,03 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 29,32 GB del checkpoint bf16 original, con una media de 6,02 bits por peso.

Es relevante para quienes despliegan inferencia en silicio de Tenstorrent y necesitan un modelo conversacional de 14B con licencia permisiva. El checkpoint se distribuye en el layout de Llama (`LlamaForCausalLM`), lo que permite cargarlo también con transformers convencionales en bf16, aunque su razón de ser es el despliegue en TT-NN. El contexto y los detalles de entrenamiento heredan los de phi-4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: microsoft/phi-4), exportado en layout Llama (`LlamaForCausalLM`) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de microsoft/phi-4) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en atencion; bf16 en LM head, embeddings y normas; media de 6,02 bits por peso |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos); codigo de empaquetado `pack_tensix.py` y `verify_grid.py` bajo Apache-2.0 |
| Formato de pesos | safetensors (29,3 GB de repo), layout Llama, tensores bf16 sobre retícula BFP4/BFP8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de microsoft/phi-4, un transformer decoder-only de 14.659.507.200 parámetros. Esta exportación no reentrena el modelo: aplica cuantizacion post-entrenamiento sobre las matrices lineales. Las proyecciones q, k, v y o de las 40 capas se cuantizan a `ttnn.bfloat8_b` mediante round-to-nearest, mientras que las proyecciones gate, up y down del MLP de las 40 capas se cuantizan a `ttnn.bfloat4_b` con GPTQ y una busqueda de exponente por bloque. La calibracion de GPTQ emplea 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resto de tensores (LM head, embeddings, normas) permanece en bf16.

La innovacion tecnica principal es el almacenamiento de las matrices cuantizadas como valores bf16 situados sobre la retícula BFP4 o BFP8, de forma que TT-NN las empaqueta sin modificar sus valores; el script `pack_tensix.py` verifica matriz a matriz que no cambia ningun valor, y `verify_grid.py` valida la retícula solo con torch. Ademas, las matrices fusionadas q, k, v y gate-up de Phi-4 se dividen al layout Llama conservando los mismos valores. No se detallan en la informacion disponible los datos de entrenamiento originales de phi-4 (numero de tokens, composicion del dataset, RLHF/DPO), que corresponden al modelo base de Microsoft.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de phi-4.
- Razonamiento y matematicas de nivel 14B, segun las capacidades del modelo base.
- Generacion de codigo, sujeta a la degradacion introducida por la cuantizacion BFP4 en el MLP.
- Plantilla de chat (`apply_chat_template`) con roles de sistema, usuario y asistente.
- Inferencia en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP4/BFP8.
- Carga alternativa en transformers con `dtype="bfloat16"` y `device_map="auto"` para ejecucion en GPU/CPU convencional.
- Tool calling, function calling, modo thinking, vision y audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repo; la calibracion incluyo texto coreano pero no se declara soporte de coreano.

## Casos de uso

- Despliegue de inferencia en NPU Tenstorrent: el checkpoint esta pensado para cargarse en Wormhole o Blackhole a traves de TT-NN, con 11,03 GB de pesos en DRAM de dispositivo mas espacio para KV cache y buffers, lo que permite servir un modelo de 14B en aceleradores de borde y servidor de Tenstorrent.
- Asistentes conversacionales en ingles: la plantilla de chat y la ventana de contexto heredada de phi-4 permiten gestionar dialogos multi-turno; la evaluacion con 33 prompts cortos y comprobacion automatica confirma 30 respuestas correctas frente a 33 del bf16.
- Prototipado en simulador: el modelo se ha validado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, lo que permite desarrollar y depurar kernels TT-NN sin hardware fisico.
- Investigacion en cuantizacion de bajo bit: la combinacion GPTQ con busqueda de exponente por bloque sobre BFP4 constituye una referencia reproducible para estudiar el impacto de la cuantizacion en la fidelidad respecto a bf16 (KL medio de 0,02697).
- Generacion de codigo y texto tecnico en pipelines internos donde el objetivo sea minimizar huella de memoria en dispositivo, aceptando la perdida de fidelidad medida (top-1 del 92,38 % respecto a bf16).
- Evaluacion comparativa de formatos de cuantizacion: el repo incluye `quant4.json` con el formato de cada proyeccion y scripts de verificacion, utiles para contrastar BFP4/BFP8 frente a Q4_K_M de llama.cpp en el mismo checkpoint.
- Base para fine-tuning o destilado posterior sobre hardware Tenstorrent, partiendo de un checkpoint con licencia MIT y pesos ya empaquetados en el formato nativo del acelerador.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/phi-4) | 16 | 29,32 | 0 | 100 | - | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,02 | 11,034 | 0,02697 | 92,38 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp v0.9.0) | 4,94 | 9,059 | 0,0180 | 93,65 | 29 de 33 | 0 |

Las metricas KL y top-1 cubren 16.280 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica; "perdidas" indica respuestas correctas en BF16 que aqui son incorrectas o rotas. El autor no reporta velocidad ni throughput. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,03 GB solo para los pesos del modelo de lenguaje, mas espacio adicional para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Simulador: ttsim (simulador de Blackhole), validado con ttnn 0.81.1.
- Carga alternativa en GPU: al cargarse en bf16 con transformers, requiere aproximadamente 29,3 GB de VRAM, lo que exige A100 40/80 GB, H100 o varias GPU consumer; no cabe en una RTX 4090 de 24 GB en bf16 sin tecnicas adicionales no documentadas.
- Opciones de despliegue: TT-NN (tt-metal) como via principal; transformers para carga en bf16; tt-transformers y tt-forge no se han probado con este checkpoint segun el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (phi-4 BFP4 MLP) | 14,66B | no disponible | BFP4/BFP8, 6,02 bits/peso, 11,03 GB | MIT | Hugging Face, 23 descargas |
| microsoft/phi-4 (bf16) | 14,66B | no disponible | bf16, 16 bits/peso, 29,32 GB | MIT | Hugging Face |
| phi-4 Q4_K_M (llama.cpp) | 14,66B | no disponible | Q4_K_M, 4,94 bits/peso, 9,06 GB | MIT | Generado con llama.cpp v0.9.0 |

La comparativa se limita al mismo checkpoint en distintos formatos, ya que la informacion disponible no incluye otros modelos de la categoria con datos verificables. Frente a Q4_K_M, este modelo ocupa mas memoria (11,03 GB frente a 9,06 GB) y presenta peor KL (0,02697 frente a 0,0180) y peor top-1 (92,38 % frente a 93,65 %), pero obtiene mas respuestas correctas en el conjunto de 33 prompts (30 frente a 29) y esta empaquetado de forma nativa para TT-NN.

## Limitaciones y advertencias

- La cuantizacion BFP4 en el MLP degrada la fidelidad respecto a bf16: KL medio de 0,02697 y top-1 del 92,38 %, con 3 respuestas incorrectas de 33 en la evaluacion del autor.
- El autor advierte que las metricas miden cercania a BF16, no calidad de tarea; no hay benchmarks de MMLU, HumanEval o GSM8K para esta variante.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint; solo se valido con ttnn 0.81.1 sobre simulador, no consta validacion en hardware fisico Wormhole o Blackhole.
- Idioma declarado: solo ingles. La calibracion incluyo texto coreano, pero no se declara soporte funcional de coreano.
- Riesgo de alucinacion inherente al modelo base phi-4, no cuantificado en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en esta model card.
- La licencia MIT permite uso comercial de los pesos; el codigo de empaquetado (`pack_tensix.py`, `verify_grid.py`) esta bajo Apache-2.0, que no sustituye la licencia MIT de los pesos.
- Se distribuye "as is", sin garantias.
- El checkpoint esta en layout Llama con matrices fusionadas divididas; herramientas que esperen el layout nativo de phi-4 pueden requerir adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
