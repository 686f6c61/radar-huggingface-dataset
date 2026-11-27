# Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF

## Resumen

Qwen3.8-Flash-Next-TR3-G es una cuantizacion experimental del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario Ternii (Wai Chung) bajo el esquema que el autor denomina TR Quantisation. Se trata de un modelo de lenguaje de arquitectura MoE de aproximadamente 180B parametros totales (125B con 6B activados, mas 51B de tabla de embeddings n-gram y 4B de cabeza MTP, segun el desglose de Qwen), convertido a una representacion ternaria de 3 trits por peso (27 niveles) con escalas de 16 bits por grupo de 128 pesos, empaquetado en formato GGUF para llama.cpp.

El objetivo del proyecto es permitir la ejecucion de un modelo de gran tamano en equipos Apple Silicon con memoria unificada limitada (desde 16 GB), manteniendo los expertos en SSD detras de una cache fija en lugar de residir por completo en RAM. Para ello el autor distribuye un parche sobre llama.cpp (`TQ27_128`) que no existe en la version upstream, por lo que las compilaciones estandar, LM Studio y Ollama no pueden cargar el archivo. Solo Metal esta soportado; CUDA no.

Es relevante como caso de estudio de cuantizacion extrema (sub-4 bits efectivos en pesos lineales y expertos enrutados) aplicada a un MoE de gran escala, pero debe tratarse como experimental: el autor indica explicitamente que las velocidades publicadas se midieron en un unico Apple M5 Max de 128 GB emulando tamanos menores mediante limite de cache, y que ningun Mac real de 16, 24, 32, 48 o 64 GB ha ejecutado el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.8-Flash-Next); pesos lineales y expertos enrutados a 3 trits (27 niveles), escala de 16 bits por grupo de 128 pesos; embeddings n-gram redondeados a 3 trits y almacenados en contenedor Q5_0; pesos de hiperconexion a 8 bits |
| Parametros totales | 176.943.899.520 (~180B segun el autor: 125B con 6B activados, 51B de embeddings n-gram, 4B de MTP) |
| Parametros activos | 6B (segun el desglose de Qwen citado en la model card) |
| Longitud de contexto | No especificada en la informacion disponible; el ejemplo de arranque usa `-c 4096` |
| Tipos de cuantizacion | TR3-G (3 trits por peso, codigos calibrados con GPTQ); tipo de tensor `TQ27_128`, exclusivo del runtime parcheado |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (10 shards; repo de 117,6 GB) |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base; esta ficha cubre una cuantizacion, no un modelo entrenado desde cero. El autor indica que los pesos se derivaron de los BF16 originales de Qwen (`Qwen/Qwen3.8-Flash-Next`, revision `de4b8e4d`) y que no proceden de ningun checkpoint de NVIDIA. No hubo reentrenamiento: la conversion es puramente post-entrenamiento.

La innovacion tecnica esta en el esquema de cuantizacion. Los pesos de las capas lineales y de los expertos enrutados se representan con 3 trits (27 niveles) y una escala de 16 bits por cada grupo de 128 pesos; los codigos se calibran con GPTQ (de ahi el sufijo `-G`). La tabla de embeddings n-gram se redondea a valores de 3 trits y se almacena de forma exacta en un contenedor Q5_0, y los pesos de hiperconexion se mantienen a 8 bits. El runtime incorpora un mecanismo de cache de expertos respaldado en SSD (`LLAMA_MOE_SSD`, `LLAMA_MOE_CACHE_MIB`) y dos fusiones de decodificacion especificas para este modelo (`GGML_METAL_OPT_GDNPREP`, `GGML_METAL_OPT_NGATED`). El modelo es solo texto: no incluye codificador de vision ni cabeza MTP. Existe una variante previa para vLLM (`Ternii/Qwen3.8-Flash-Next-TR2.57-G`) que mantiene los expertos menos usados a 2 trits, no soportada por el runtime de Mac, y el autor advierte que los resultados no son transferibles entre ambas.

## Capacidades

- Generacion de texto conversacional en ingles (`pipeline_tag: text-generation`, `conversational`).
- Modo de razonamiento (thinking) activado por defecto con `--jinja`; puede desactivarse con `--reasoning off` o enviando `"chat_template_kwargs": {"enable_thinking": false}`.
- Razonamiento matematico y resolucion de problemas: los datasets citados en la model card incluyen `EleutherAI/hendrycks_math` y `openai/gsm8k`, y el autor evalua la velocidad respondiendo preguntas de GSM8K.
- Generacion de codigo: el dataset `nvidia/OpenCodeInstruct` figura entre las referencias del autor.
- Conversacion multi-turno: `openai/oasst2` aparece como dataset de referencia.
- Solo texto: no hay vision, audio ni cabeza MTP en este archivo.
- Soporte de tool calling y de agentes multi-paso: no documentado en la informacion disponible para esta cuantizacion.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Evaluacion de cuantizacion extrema en MoE de gran escala: usar el modelo para medir la perdida de calidad de un esquema de 3 trits con calibracion GPTQ frente a los pesos BF16 originales de Qwen, en tareas de matemáticas y codigo donde el autor ya aporta referencias de dataset.
- Investigacion sobre offloading de expertos a SSD: el runtime permite experimentar con el equilibrio entre tamano de cache (`LLAMA_MOE_CACHE_MIB`) y latencia en Apple Silicon, un escenario relevante para estudiar inferencia de modelos que exceden la memoria unificada disponible.
- Despliegue local en Mac de gran capacidad: en un equipo de 64 GB o mas, con una cache de expertos de 35.000 MiB, puede servir como asistente de texto en ingles para un unico usuario, aceptando la latencia adicional del acceso a disco.
- Prototipado de razonamiento matematico en local: con el modo thinking activado y contextos de 4k, sirve para probar cadenas de razonamiento sobre problemas tipo GSM8K sin depender de servicios en la nube.
- Banco de pruebas de parches de llama.cpp: util para desarrolladores que quieran validar el tipo de tensor `TQ27_128` y las fusiones Metal del proyecto `tritq-vllm` antes de integrarlas en otros flujos.
- Analisis de consumo de memoria en produccion: el autor documenta el crecimiento del footprint del servidor con `--cache-ram` activado (unos 235 MiB por peticion hasta llenar 8 GiB), lo que convierte al modelo en un caso practico para estudiar fugas y limites de memoria en llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta mediciones de velocidad y memoria, tomadas en un Apple M5 Max de 128 GB emulando tamanos menores mediante limite de cache, con contexto de 4k y un unico usuario. El autor advierte que un Mac real de menor tamano rendira por debajo de esas cifras por page cache mas pequena, chip mas lento y SSD mas lento.

| Medicion | Entorno | Nota |
|---|---|---|
| Velocidad de decodificacion | Apple M5 Max 128 GB, cache limitada por software | Dos metodos: servidor respondiendo GSM8K (thinking off, hasta 512 tokens) y replay de 25 prompts |
| Memoria cableada | Apple M5 Max 128 GB | Footprint del servidor alcanzo 50,0 GB con cache de expertos de 38.254 MiB y `--cache-ram` activado |
| Cifras por tamano de Mac (16/24/32/48/64 GB) | No medidas en hardware real | El autor indica explicitamente que ningun Mac de esos tamanos ha ejecutado el modelo |

## Requisitos de hardware

- VRAM/RAM: el modelo completo ocupa 117,6 GB en disco. El autor propone tamanos de cache de expertos segun el equipo: 5.900 MiB para 16 GB, 6.750 MiB para 24 GB, 13.501 MiB para 32-48 GB y 35.000 MiB para 64 GB o mas.
- GPU: exclusivamente Apple Silicon con Metal (macOS 13.3+). CUDA no esta soportado. No hay soporte documentado para A100, H100 ni RTX 4090.
- Consumer GPU: no aplica en el estado actual; el runtime solo compila y ejecuta en Metal. El binario Linux arm64 de la release no fue probado con este modelo.
- Despliegue: unicamente llama.cpp parcheado (`llama.cpp-tr-b11721` o compilacion desde `github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp`). No funciona con llama.cpp upstream, LM Studio, Ollama ni vLLM.
- Parametros de arranque relevantes: `-np 1` (medido en una sola secuencia), `LLAMA_MOE_CACHE_MAX_BATCH=512` (obligatorio, sin el aborta al inicio), `--cache-ram 0` (recomendado para evitar crecimiento de memoria), `-fa on` y `--jinja`.
- Latencia y throughput: el autor publica cifras de tokens/s en la model card, pero no se reproducen aqui porque dependen de la emulacion por limite de cache y no de hardware real de ese tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-TR3-G (esta ficha) | ~180B totales, 6B activos | No disponible | 3 trits (TR3-G), GGUF | Qwen Community 1.0 | llama.cpp parcheado, solo Metal |
| Qwen3.8-Flash-Next (base) | ~180B totales, 6B activos | No disponible | BF16 | Qwen Community 1.0 | Frameworks estandar |
| Qwen3.8-Flash-Next-TR2.57-G (mismo autor) | ~180B totales, 6B activos | No disponible | 2,57 trits efectivos (expertos menos usados a 2 trits) | Qwen Community 1.0 | vLLM |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; el autor solo senala que los resultados de TR2.57-G y TR3-G no son transferibles entre si.

## Limitaciones y advertencias

- Estado experimental: el autor califica el modelo explicitamente como experimental y advierte que ningun Mac de 16, 24, 32, 48 o 64 GB lo ha ejecutado; las cifras provienen de emulacion por limite de cache en un M5 Max de 128 GB.
- Compatibilidad restringida: requiere un parche propietario de llama.cpp con el tipo de tensor `TQ27_128`; las herramientas estandar (LM Studio, Ollama, llama.cpp upstream) no pueden cargarlo.
- Solo Metal: sin soporte CUDA, lo que excluye GPU NVIDIA y limita el despliegue a Apple Silicon.
- Solo ingles: el campo `language` declara unicamente `en`; no hay soporte multilingue documentado.
- Solo texto: sin vision, audio ni cabeza MTP en este archivo.
- Gestion de memoria delicada: con `--cache-ram` activado el servidor crece unos 235 MiB por peticion hasta 8 GiB, lo que en un Mac de 16 GB supone la mitad de la RAM; se recomienda `--cache-ram 0` a costa de reprocesar prefijos repetidos.
- Rendimiento en equipos pequenos: el propio autor advierte que sera lento en los Mac de menor capacidad por el acceso continuo al SSD.
- Licencia: Qwen Community License 1.0; deben revisarse sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta cuantizacion; la cuantizacion agresiva a 3 trits puede degradar la fidelidad respecto al modelo base, y no se aportan evaluaciones de calidad que lo cuantifiquen.
- Sin garantias de soporte: 483 descargas y 0 likes en el momento de la consulta; proyecto de un unico autor sin respaldo de la organizacion Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del runtime parcheado: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Release con binarios para macOS arm64: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721
- Variante para vLLM (2,57 trits): https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR2.57-G
- llama.cpp upstream (referencia, no compatible): https://github.com/ggml-org/llama.cpp
