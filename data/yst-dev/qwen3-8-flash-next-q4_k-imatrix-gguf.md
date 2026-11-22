# yst-dev/Qwen3.8-Flash-Next-Q4_K-imatrix-GGUF

## Resumen
Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta documenta la cuantización Q4_K con importance matrix publicada por el usuario yst-dev, una conversión a GGUF de 4 bits del checkpoint BF16 original, pensada para inferencia en llama.cpp y entornos compatibles. El modelo base cuenta con 176.943.899.520 parámetros totales según los safetensors del repositorio original, lo que lo sitúa en la categoría de modelos densos de gran tamano (aproximadamente 177 mil millones de parámetros).

La relevancia de esta publicacion es practica: reduce el peso del modelo de un checkpoint BF16 inmanejable en hardware de consumo a un conjunto de cuatro shards GGUF que suman 106,2 GB (98,9 GiB), manteniendo una fidelidad medible frente a una referencia Q8_0. El autor reporta una divergencia KL media de 0,0322 frente a la referencia Q8_0, inferior a la del archivo UD-IQ4_XS de Unsloth (0,0559), aunque con un tamano 12,5 GB mayor.

Es importante senalar que esta publicacion es solo texto: no incluye el codificador de vision (mmproj) ni el drafter MTP para decodificacion especulativa, y no se han ejecutado benchmarks de tareas (codigo, agentes, tool calling) sobre el archivo cuantizado. La licencia es la Qwen Community License 1.0, que impone restricciones adicionales respecto a licencias puramente permisivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-Flash-Next); pesos cuantizados en formato GGUF |
| Parametros totales | 176.943.899.520 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun los datos proporcionados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (expertos enrutados gate/up), Q5_0 (down de expertos), Q6_K, Q8_0, IQ4_XS, IQ4_NL, F16, F32; media de 4,83 bpw en expertos y 7,15 bpw en el resto |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | GGUF (4 shards, split); repo de 106,2 GB |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next es un transformer denso de aproximadamente 177 mil millones de parametros. La model card de esta cuantizacion no detalla la composicion del dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO; esa informacion corresponde al repositorio oficial del modelo base, no incluido en la informacion proporcionada. La presencia de una tabla de embeddings n-gram por capa (shard 4, IQ4_NL, 28,8 GB) y de proyecciones GDN (gated delta network) sugiere una arquitectura hibrida con componentes de atencion lineal, aunque el autor no lo explicita como tal.

El proceso de cuantizacion si esta documentado con detalle: conversion del checkpoint BF16 (revision `812d96e10a0dd82b69d749e68693698cf6c36daa`) a Q8_0 intermedio con `convert_hf_to_gguf.py` de llama.cpp (build b11870, commit `74bca3950`) usando `--no-mtp`; calculo de la importance matrix con `llama-imatrix -c 512` sobre 252 KB de texto de calibracion (140 fragmentos de 512 tokens, 71.680 tokens en total), compuesto por prosa tecnica en ingles, extractos de codigo del repositorio de llama.cpp y codigo Python de un servidor de inferencia. No se uso datos de chat, multilingues ni de razonamiento en la calibracion. La cuantizacion final se ejecuto con `llama-quantize --allow-requantize --keep-split --imatrix ... --tensor-type-file types.txt` partiendo del Q8_0, no del BF16. La tabla de embeddings n-gram se tomo del archivo IQ4_NL de Unsloth, byte a byte identica.

## Capacidades
- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: el modelo base esta orientado a tareas de codigo y agentes, aunque esta cuantizacion no ha sido evaluada en esas tareas.
- Soporte de tool calling y function calling: heredado del modelo base; no verificado en el archivo cuantizado.
- Capacidades de agente y razonamiento multi-paso: presumibles por el modelo base, sin benchmarks publicados para esta cuantizacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no incluida en este repositorio (falta el codificador mmproj); se puede anadir un `mmproj-Qwen3.8-Flash-Next-BF16.gguf` publicado por terceros.
- Decodificacion especulativa: no incluida (el drafter MTP se omitio con `--no-mtp`); se puede combinar con el drafter Q8_0 de Unsloth, aunque el autor no lo ha medido con llama.cpp.

## Casos de uso
- Inferencia local de un modelo de ~177B en hardware de gama alta: con 106,2 GB en cuatro shards, el modelo cabe en estaciones con 128 GB de memoria unificada o en configuraciones multi-GPU, permitiendo ejecutar un modelo de gran escala sin infraestructura de centro de datos.
- Servicio de generacion de texto en llama.cpp: el formato GGUF split y la compatibilidad con `llama-server` permiten desplegar una API compatible con OpenAI sin necesidad de vLLM ni TGI.
- Prototipado de asistentes conversacionales: el tag `conversational` y la plantilla de chat incluida (`chat_template.jinja`, revision `de4b8e4d`) permiten montar un chatbot multi-turno con el template oficial de Qwen.
- Evaluacion de calidad de cuantizaciones: el archivo sirve como referencia calibrada para comparar fidelidad (KL frente a Q8_0) en pipelines de investigacion sobre cuantizacion, dado que el autor publica la metodologia completa y los comandos exactos.
- Generacion de codigo en entornos con GPU AMD: el autor mantiene el proyecto Gary (rama `flashnext-amd`) para servir este archivo en tarjetas AMD, lo que lo hace util en entornos ROCm donde otras pilas de inferencia tienen menos soporte.
- Trabajo con contexto tecnico y codigo: la calibracion con prosa tecnica y codigo hace que la cuantizacion sea adecuada para tareas de documentacion tecnica y analisis de repositorios, el dominio sobre el que se midio la fidelidad.
- Base para cuantizaciones posteriores: al incluir `SHA256SUMS` y comandos reproducibles, el archivo sirve como punto de partida verificable para derivar otras cuantizaciones (por ejemplo, IQ4_XS calibrado) manteniendo la tabla n-gram.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que no ha ejecutado benchmarks de codigo, agentes ni tool calling sobre este archivo.

La unica metrica publicada es la divergencia KL frente a la referencia Q8_0 sobre texto reservado (140 KB de documentacion de llama.cpp y codigo Python, 20.480 tokens, `llama-perplexity -c 512 --chunks 40`, CPU):

| Archivo | Tamano | KL media vs Q8_0 | KL 99 % | Mismo token top-1 | PPL (Q8_0: 2,140) |
|---|---|---|---|---|---|
| Unsloth UD-IQ4_XS (Dynamic v3.1) | 93,7 GB | 0,0559 +- 0,0018 | 0,765 | 93,6 % | 2,088 |
| Este archivo (Q4_K calibrado) | 106,2 GB | 0,0322 +- 0,0010 | 0,502 | 95,2 % | 2,156 |
| IQ4_XS calibrado del autor (no publicado) | 98,7 GB | 0,0366 +- 0,0013 | 0,512 | 94,8 % | 2,150 |
| AtomicChat IQ4_XS, 3,84 bpw | 84,9 GB | 0,2459 +- 0,0068 | 3,368 | 87,5 % | 2,353 |

Advertencias del propio autor: el archivo es mayor que el UD-IQ4_XS, lo que explica parte de la mejora; calibracion y test comparten dominio (ingles tecnico y codigo), lo que puede favorecer a los archivos calibrados; y una PPL inferior a la referencia no indica mayor calidad.

## Requisitos de hardware
- VRAM estimada: al menos 106,2 GB para cargar los cuatro shards completos en memoria; con offload parcial a RAM se puede reducir, a costa de latencia.
- GPU recomendadas: configuraciones multi-GPU con 128 GB o mas en total (por ejemplo, 2x A100 80 GB, 2x H100 80 GB, o 4x RTX 4090 de 24 GB con reparto por capas).
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) ni en una RTX 3090; requiere reparto entre varias GPU o uso intensivo de RAM del sistema.
- Memoria unificada: viable en estaciones tipo Apple Silicon con 128 GB o superiores, y en placas con memoria unificada de gran capacidad.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y el proyecto Gary del autor (rama `flashnext-amd`) para GPU AMD con ROCm. No se menciona soporte verificado en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor no publica medidas de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este archivo (Qwen3.8-Flash-Next Q4_K imatrix) | 176,9 B | no disponible | GGUF, 106,2 GB | Qwen Community 1.0 | KL 0,0322 vs Q8_0; solo texto; sin MTP |
| Unsloth UD-IQ4_XS (Qwen3.8-Flash-Next) | 176,9 B | no disponible | GGUF, 93,7 GB | Qwen Community 1.0 | KL 0,0559 vs Q8_0; incluye drafter MTP Q8_0 |
| AtomicChat IQ4_XS | 176,9 B | no disponible | GGUF, 84,9 GB | no disponible | KL 0,2459 vs Q8_0; peor fidelidad |
| IQ4_XS calibrado del autor (no publicado) | 176,9 B | no disponible | GGUF, 98,7 GB | Qwen Community 1.0 | KL 0,0366 vs Q8_0 |

No se dispone de datos de benchmarks de tareas para comparar rendimiento funcional con alternativas de otros fabricantes; la comparacion se limita a fidelidad de cuantizacion y tamano.

## Limitaciones y advertencias
- Solo texto: no incluye codificador de vision; para tareas multimodales hay que anadir un mmproj externo compatible.
- Sin drafter MTP: no soporta decodificacion especulativa de serie; el drafter de Unsloth existe pero el autor no lo ha validado con este archivo.
- Calibracion sesgada al dominio: la importance matrix se calculo solo con prosa tecnica en ingles y codigo, sin datos de chat, multilingues ni de razonamiento; el rendimiento en esos dominios puede degradarse respecto al modelo base.
- Evaluacion limitada: la unica metrica es KL frente a Q8_0 sobre texto del mismo dominio que la calibracion; no hay benchmarks de tareas, por lo que la calidad real en codigo, agentes o tool calling es desconocida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado para este archivo.
- Sesgos: no documentados en la informacion disponible; se heredan del modelo base y del corpus de calibracion (ingles tecnico).
- Licencia: Qwen Community License 1.0 impone condiciones adicionales para uso comercial; es necesario revisar el archivo `LICENSE` incluido antes de desplegar en produccion.
- Reproducibilidad: los cuatro shards deben mantenerse con los nombres originales en una misma carpeta; el shard 1 contiene solo metadatos y tokenizer, y la carga se resuelve por nombre.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ha publicado benchmarks de tareas; conviene validar el archivo en el caso de uso concreto antes de adoptarlo.

## Enlaces
- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/yst-dev/Qwen3.8-Flash-Next-Q4_K-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizaciones GGUF de Unsloth (incluye drafter MTP Q8_0): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Proyecto Gary (servido en AMD, rama `flashnext-amd`, docs en `docs/flashnext/`): https://github.com/msw-yst/gary
- Documentacion de cuantizacion del autor (`docs/flashnext/QUANT.md`): https://github.com/msw-yst/gary/blob/flashnext-amd/docs/flashnext/QUANT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
