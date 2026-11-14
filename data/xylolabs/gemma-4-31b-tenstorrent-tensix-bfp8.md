# Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP8

## Resumen

`Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP8` es una cuantizacion del modelo multimodal `google/gemma-4-31B` realizada por Xylolabs, orientada especificamente a la inferencia sobre aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). Emplea GPTQ para proyectar las capas lineales del transformer sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8) de TT-NN, manteniendo el resto de tensores (embeddings, normas, torre de vision y cabeza LM atada) en bf16.

El modelo resuelve un problema de despliegue concreto: el checkpoint original en bf16 ocupa 61,39 GB y no cabe en la memoria de dispositivo de las tarjetas Tensix de gama media. Esta version reduce el peso del modelo de lenguaje a 33,94 GB empaquetados, con un promedio de 8,85 bits por peso, y conserva una fidelidad muy alta respecto al original (KL medio de 0,00154 frente a bf16 sobre 8.184 posiciones de texto en ingles y coreano).

Es relevante porque demuestra que la cuantizacion de 8 bits por bloque puede integrarse directamente en el pipeline de empaquetado de TT-NN sin degradar los valores almacenados: las matrices se guardan como valores bf16 sobre la rejilla BFP8, de modo que el empaquetador no altera ni un bit. El checkpoint es de tipo base (continuacion de texto, sin plantilla de chat) y solo se cuantizo y evaluo el modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivado de google/gemma-4-31B |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (ttnn.bfloat8_b) con GPTQ; 8,5 bits por peso en matrices cuantizadas, 8,85 bits de media; resto en bf16 |
| Idiomas soportados | no disponible (calibracion en ingles y coreano; evaluacion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 65,4 GB), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B`, un transformer multimodal con torre de vision (`vision_tower`, `embed_vision`) y un modelo de lenguaje de 60 capas. En esta exportacion se cuantizan con GPTQ las proyecciones de atencion q, k, o (60 capas) y v (50 capas), asi como las proyecciones MLP gate, up y down (60 capas), todas ellas a `ttnn.bfloat8_b`. La cabeza LM (atada al embedding), el embedding, las normas y el resto de tensores permanecen en bf16, igual que en el modelo base. La torre de vision y `embed_vision` no se tocan.

La innovacion tecnica clave es el metodo de cuantizacion sobre la rejilla de coma flotante por bloques: las matrices cuantizadas se almacenan como valores bf16 situados exactamente en la rejilla BFP8, de forma que TT-NN las empaqueta sin modificar sus valores. El exponente compartido de cada bloque se conserva tal como lo fija el empaquetador. La calibracion de GPTQ se realizo sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El repositorio incluye `pack_tensix.py` (verifica cada matriz empaquetandola y comprobando que ningun valor cambia, con opcion `--device` para round-trip por DRAM) y `verify_grid.py` (verifica la rejilla solo con torch). Solo se cuantizo y evaluo el modelo de lenguaje.

## Capacidades

- Generacion de texto y continuacion de texto en modo base (sin plantilla de chat).
- Procesamiento multimodal image-text-to-text heredado del modelo base (torre de vision en bf16).
- Razonamiento y conocimiento general procedente de gemma-4-31B (evaluado con 28 prompts cortos de comprobacion automatica en formato completion, 3-shot).
- Capacidades multilingues del modelo base, con calibracion y evaluacion especificas en ingles y coreano.
- Inferencia optimizada sobre NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP8.
- No se documenta soporte de tool calling, function calling, modo thinking ni comportamiento agentico en la informacion disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint esta disenado para ejecutarse en NPUs Tensix (Wormhole, Blackhole) con TT-NN, empaquetando las matrices directamente en DRAM de dispositivo sin conversion adicional.
- Inferencia de modelos de 31B en dispositivos con memoria limitada: con 33,94 GB de pesos del modelo de lenguaje mas KV cache y buffers, permite ejecutar el modelo donde la version bf16 de 61,39 GB no cabe; para dispositivos mas pequenos el autor remite a la version BFP4.
- Experimentacion con cuantizacion BFP8: sirve como referencia reproducible para validar pipelines de GPTQ sobre rejillas de coma flotante por bloques, con scripts de verificacion incluidos.
- Evaluacion de fidelidad de cuantizacion: util para comparar el impacto de BFP8 frente a bf16 y frente a Q4_K_M de llama.cpp usando las metricas KL y top-1 publicadas.
- Procesamiento de texto en ingles y coreano: la calibracion y la evaluacion cubren ambos idiomas, lo que lo hace adecuado para cargas de trabajo en esas lenguas.
- Investigacion en simulacion: verificado con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent, lo que permite desarrollar y depurar sin hardware fisico.
- Base para ajuste fino o evaluacion multimodal: conserva la torre de vision en bf16 y el modelo de lenguaje cuantizado, util para prototipos de image-text-to-text en entornos Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-31B) | 16 | 61,39 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP8) | 8,85 | 33,938 | 0,00154 | 98,06 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 18,687 | 0,03187 | 93,01 | 28 de 28 | 0 |

Las metricas KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), como texto plano. Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato completion, 3-shot. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El autor no reporta velocidad de inferencia. Estas cifras miden cercania a BF16, no calidad de tarea.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 33,94 GB solo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Para dispositivos con menos memoria, el autor recomienda la version BFP4 (`Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4-MLP`).
- Software: TT-NN (verificado con ttnn 0.81.1 sobre ttsim, simulador Blackhole).
- Carga en transformers: el ejemplo usa `AutoModelForCausalLM.from_pretrained` con `dtype="bfloat16"` y `device_map="auto"`, por lo que en GPU convencional se requiere memoria suficiente para el checkpoint completo (repo de 65,4 GB).
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Bits por peso | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 32,68 B | 8,85 | 33,94 GB | no disponible | Apache 2.0 | Hugging Face |
| google/gemma-4-31B (BF16) | 32,68 B | 16 | 61,39 GB | no disponible | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 32,68 B | 4,87 | 18,687 GB | no disponible | Apache 2.0 | Generado localmente |
| Xylolabs gemma-4-31B Tensix BFP4-MLP | no disponible | no disponible (BFP4) | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base: continua texto y no incluye plantilla de chat; no debe usarse directamente como asistente conversacional sin ajuste o formateo previo.
- Solo se cuantizo y evaluo el modelo de lenguaje; no hay evaluacion publicada del rendimiento multimodal tras la cuantizacion.
- Las metricas publicadas miden fidelidad respecto a BF16 (KL y top-1), no calidad en tareas; no se reporta velocidad.
- La evaluacion se limita a 28 prompts cortos y a texto en ingles y coreano; la cobertura de idiomas e tareas es reducida.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 segun la model card del modelo base, pero el repositorio del modelo base no incluye fichero LICENSE; el autor incluye el texto estandar y un NOTICE con los cambios.
- Requiere hardware Tensix para el flujo optimizado; en GPU convencional el checkpoint completo exige memoria considerable.
- `tt-transformers` y `tt-forge` no se han validado con este checkpoint.
- Se distribuye tal cual, sin garantia, y no esta afiliado a Google ni a Tenstorrent.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Version BFP4: https://huggingface.co/Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4-MLP
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia: arxiv:2607.02770
