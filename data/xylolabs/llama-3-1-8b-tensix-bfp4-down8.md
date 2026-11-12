# Xylolabs/Llama-3.1-8B-Tensix-BFP4-Down8

## Resumen
Llama-3.1-8B-Tensix-BFP4-Down8 es una cuantizacion del modelo meta-llama/Llama-3.1-8B desarrollada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only original de Llama 3.1 con 8.030.261.248 parametros, pero sustituye las capas lineales por representaciones de punto flotante en bloque (block floating point, BFP) que el runtime TT-NN puede empaquetar directamente sin conversion adicional.

La particularidad tecnica es la mezcla de precisiones: las proyecciones de atencion (q, k, v, o) y las proyecciones gate y up del MLP usan `ttnn.bfloat4_b` (BFP4, 4.5 bits por peso), mientras que la proyeccion down del MLP usa `ttnn.bfloat8_b` (BFP8, 8.5 bits por peso). El resultado es un modelo de 6,967 GB empaquetado con una media de 6,94 bits por peso, lo que lo situa entre una cuantizacion de 8 bits y una de 4 bits en cuanto a huella de memoria.

Es relevante ahora porque representa un esfuerzo por llevar modelos de la familia Llama 3.1 al ecosistema de aceleradores de Tenstorrent con un formato nativo del hardware, evitando la penalizacion de rendimiento que supondria desempaquetar cuantizaciones convencionales (GPTQ, AWQ) en tiempo de ejecucion. El checkpoint es de tipo base (no chat) y esta pensado para continuacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con capas lineales cuantizadas a BFP4/BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4.5 bits/peso) en atencion q/k/v/o y MLP gate/up; BFP8 (`ttnn.bfloat8_b`, 8.5 bits/peso) en MLP down; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en (ingles declarado); calibracion con 45 % ingles y 55 % coreano |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP4/BFP8) |
| Tamano empaquetado | 6,967 GB (media 6,94 bits/peso) |
| Tamano del repo | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B |

## Arquitectura y entrenamiento
El modelo parte de los pesos bf16 de meta-llama/Llama-3.1-8B (los cuatro shards safetensors con el mismo sha256 que la copia de unsloth/Llama-3.1-8B). Sobre esa base se aplica cuantizacion GPTQ con busqueda de exponente por bloque a las proyecciones de atencion y a gate/up del MLP, calibrada con 262.144 tokens de WikiText-2 y Wikipedia en coreano (45 % ingles, resto coreano), segun la configuracion `configs/llama-3.1-8b-cal4x.toml` del repositorio tensix-bfp-gptq. Las proyecciones down del MLP se cuantizan a BFP8 mediante redondeo al mas cercano (round to nearest).

La innovacion clave es que los ficheros se distribuyen en bf16 pero con cada valor ya situado exactamente en la rejilla de representacion BFP4 o BFP8, de modo que TT-NN los empaqueta tal cual sin perdida adicional. El repositorio incluye `quant4.json`, que lista el formato de cada proyeccion, y utilidades de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningun valor cambia al empaquetar. La model card indica que el modelo se probo con ttnn 0.81.1 sobre ttsim (simulador de Blackhole) y no sobre hardware fisico; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades
- Generacion de texto y continuacion de texto en ingles (modelo base, sin plantilla de chat).
- Razonamiento y conocimiento general heredados de Llama 3.1 8B, con degradacion medida respecto a bf16 (KL media 0,03860, top-1 del 90,90 %).
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; al ser modelo base, no incluye alineamiento conversacional.
- Capacidades multilingues: limitadas al ingles declarado; la calibracion incluyo texto coreano pero no se declara soporte oficial de coreano.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN con tipos `bfloat4_b` y `bfloat8_b`.

## Casos de uso
- Despliegue en hardware Tenstorrent: el checkpoint esta disenado para cargarse directamente en NPU Wormhole o Blackhole mediante TT-NN, aprovechando que los pesos ya estan en la rejilla BFP y evitando conversion en tiempo de ejecucion. Adecuado para equipos que ya operan aceleradores Tenstorrent y quieren ejecutar un Llama 3.1 8B con menor huella de DRAM.
- Continuacion de texto y generacion de documentacion: al ser un modelo base, encaja en tareas de autocompletado, redaccion asistida y generacion de texto en ingles donde no se requiere formato conversacional.
- Prototipado e investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de BFP4/BFP8 en calidad, con metricas KL y top-1 publicadas frente a bf16 y a Q4_K_M de llama.cpp.
- Evaluacion de pipelines TT-NN: util para validar el empaquetado de matrices y el round-trip a DRAM del dispositivo con las utilidades incluidas (`pack_tensix.py`, `verify_grid.py`).
- Fine-tuning o destilado posterior: los pesos en bf16 con valores en rejilla BFP permiten partir de una base cuantizada para experimentos de adaptacion, aunque no se documenta soporte oficial de entrenamiento.
- Servicio de inferencia compatible con TGI: la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere integracion con endpoints de Hugging Face, util para desplegar el modelo como API de generacion de texto.
- Benchmarking de aceleradores: comparar latencia y throughput de Tensix frente a GPU usando el mismo checkpoint y las mismas metricas de calidad publicadas.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B) | 16 | 16,06 | 0 | 100 | 23 de 28 | - |
| **Este modelo** | 6,94 | 6,967 | 0,03860 | 90,90 | 23 de 28 | 1 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03478 | 90,58 | 24 de 28 | 0 |

Las metricas KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato de completado y con 3 ejemplos (3-shot). Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM/DRAM estimada: 6,967 GB empaquetados en formato BFP para Tensix; en GPU la carga en bf16 requiere aproximadamente 16 GB, ya que los ficheros son bf16.
- GPU recomendadas para uso con transformers: no especificadas; por tamano, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) puede alojar el modelo en bf16.
- Cabe en GPU consumer: si, en tarjetas con al menos 16 GB de VRAM en bf16 (por ejemplo RTX 4090); no se documenta una ruta de cuantizacion adicional para GPU.
- Aceleradores objetivo: NPU Tenstorrent Tensix Wormhole y Blackhole, mediante TT-NN (probado con ttnn 0.81.1 sobre el simulador ttsim, no en hardware).
- Opciones de despliegue: transformers (dtype bfloat16, device_map auto), TT-NN para Tensix, y compatibilidad declarada con text-generation-inference y endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp u Ollama para este checkpoint concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones en hardware Tensix.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Tensix-BFP4-Down8 | 8,03B | no disponible | BFP4/BFP8 nativo Tensix (6,94 bits/peso) | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B (bf16) | 8,03B | 128K (segun model card original) | bf16 | llama3.1 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,03B | 128K (heredado) | 4,89 bits/peso | llama3.1 | Generado localmente |
| unsloth/Llama-3.1-8B | 8,03B | 128K (heredado) | bf16 | llama3.1 | Hugging Face |

En calidad, el modelo queda ligeramente por debajo de Q4_K_M en KL media (0,03860 frente a 0,03478) y en top-1 (90,90 % frente a 90,58 %, practicamente empatados), pero con mayor huella (6,967 GB frente a 4,921 GB). Su ventaja no es la compresion sino el empaquetado nativo para Tensix.

## Limitaciones y advertencias
- Modelo base sin plantilla de chat: no esta alineado para conversacion ni sigue instrucciones de forma fiable; requiere formato de completado.
- Idioma declarado unicamente ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Degradacion medible frente a bf16: KL media de 0,03860 y top-1 del 90,90 %, con una respuesta perdida de 28 en la evaluacion de completado.
- No probado en hardware Tensix real: la validacion se hizo sobre el simulador ttsim con ttnn 0.81.1; tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Riesgo de alucinacion inherente a un modelo de 8B sin alineamiento conversacional.
- La licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos de Meta antes de un despliegue en produccion.
- El repositorio pesa 16,1 GB (pesos en bf16), lo que duplica aproximadamente la huella del modelo empaquetado y complica el almacenamiento y la distribucion.
- Sin datos publicados de latencia, throughput ni comportamiento en contextos largos para este checkpoint.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Configuracion de calibracion: https://github.com/XylolabsInc/tensix-bfp-gptq/blob/3d51048/configs/llama-3.1-8b-cal4x.toml
- Pesos bf16 de referencia (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B/tree/3f0d51f8e5640f98f1a96ea9044a0e55c0a83814
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tensix-BFP4-Down8/blob/main/LICENSE
