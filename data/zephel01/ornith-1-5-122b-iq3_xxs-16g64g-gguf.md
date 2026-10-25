# zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino una cuantizacion GGUF del modelo `ornith-ai/Ornith-1.5-122B` (licencia MIT), publicada por el usuario zephel01 bajo el identificador `zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF`. El objetivo declarado es comprimir los 124.635.206.144 parametros del modelo original (unos 124,6 mil millones) en un unico archivo de 51,7 GB que quepa integramente en un PC con GPU de 16 GB y 64 GB de RAM, de forma que durante la generacion no se lea nada del SSD. Se distribuye en dos fragmentos (`-00001-of-00002` y `-00002-of-00002`) generados con `llama-gguf-split`, a 3,32 bits por peso.

La estrategia de cuantizacion es mixta: los expertos enrutados se guardan en IQ3_XXS con una importance matrix calculada por el autor, mientras que attention, las proyecciones delta-net y los expertos compartidos se mantienen en Q8_0, y el bloque NextN (MTP) en Q4_K. Segun la model card, esa mezcla reduce la perdida de calidad frente a un IQ3_XXS estandar: la divergencia KL media contra BF16 baja de 0,285 a 0,138, con un 81,3 % de coincidencia en el token superior frente al 74,2 % del cuantizado uniforme.

Es relevante ahora porque demuestra una practica de cuantizacion selectiva orientada a un presupuesto de hardware concreto (16 GB de VRAM + 64 GB de RAM) y porque incluye mediciones de velocidad y de tareas de codigo con el motor Abyss del mismo autor, ademas de la matriz de importancia reutilizable (`imatrix-ornith122b.gguf`, 0,36 GB) para recuantizar. Los resultados de busqueda web realizados no aportaron ningun enlace o dato adicional relevante sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (etiqueta `qwen35moe` en el repo; el autor menciona proyecciones delta-net y tensores `ssm_`, es decir, componentes de state space / attention lineal) mas bloque NextN (MTP) para decodificacion especulativa. Detalle completo de la arquitectura base: no disponible |
| Parametros totales | 124.635.206.144 (124,6 B, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en IQ3_XXS (con imatrix); attention, delta-net y expertos compartidos en Q8_0; bloque NextN (`blk.48`) en Q4_K; media de 3,32 bits por peso |
| Idiomas soportados | no disponible (el texto de calibracion de la imatrix es redaccion tecnica y codigo en ingles y japones; la model card se publica en ingles y japones) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF, en dos shards (`llama-gguf-split`, 29,8 GB + 21,9 GB = 51,7 GB); incluye `imatrix-ornith122b.gguf` opcional de 0,36 GB |
| Tamano del repositorio | 52,1 GB |
| Cuantizaciones alternativas citadas | `unsloth UD-Q4_K_XL` (80 GB, 3,5x menor KL); IQ3_XXS-B con `ffn_down` de expertos en IQ4_XS (57,4 GB, no subido) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con componentes hibridos: la etiqueta `qwen35moe` y los tensores `ssm_` que el autor fuerza a Q8_0 indican la presencia de capas de state space o attention lineal junto a la atencion clasica, ademas de proyecciones delta-net. El bloque `blk.48` es una cabeza NextN (multi-token prediction) que puede usarse como drafter especulativo en motores que lo soportan. El numero de expertos, el ratio de activacion y la longitud de contexto no se detallan en la informacion disponible.

No hay datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO) en la informacion proporcionada. Lo que si se documenta es el proceso de cuantizacion: conversion a BF16 con `convert_hf_to_gguf.py`, calculo de la importance matrix con `llama-imatrix` (contexto 2048, batch 8192, 32 chunks, texto de calibracion en ingles/japones de 0,7 MB no publicado) y cuantizacion con `llama-quantize` usando reglas `--tensor-type` por nombre de tensor. El bloque NextN nunca se ejecuta durante el calculo de la imatrix, por lo que carece de datos de importancia y se mantiene en Q4_K. La innovacion practica es el reparto asimetrico de bits: gastar Q8_0 en las capas densas y en los expertos compartidos, que segun el autor concentraban la mayor parte de la perdida del IQ3_XXS estandar.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y resolucion de tareas de codigo: la model card reporta 56/60 tareas resueltas en un conjunto estilo SWE-bench y 12/16 en tareas de nivel "grandmaster" (L7).
- Edicion de codigo multiarchivo: se mencionan respuestas largas sobre varios ficheros con velocidades de 22-25 tok/s.
- Decodificacion especulativa mediante el bloque NextN (MTP) incluido en el shard 2, para motores que lo aprovechan (Abyss).
- Capacidades multilingues: no disponibles como lista cerrada; el texto de calibracion sugiere competencia en ingles y japones, sin datos verificables.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el conjunto de evaluacion de codigo (informe de bug + tests ocultos) es representativo de flujos agenticos.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con 51,7 GB el modelo completo reside en 16 GB de VRAM mas 64 GB de RAM, de modo que un equipo de sobremesa puede ejecutar un modelo de 124,6 B sin depender de la nube ni de lectura de disco durante la generacion (0 % de esperas de SSD segun la medicion del autor).
- Resolucion automatica de incidencias en repositorios pequenos: el perfil de evaluacion de la model card (informe de bug o peticion de funcionalidad + tests ocultos) refleja el uso real de parchear codigo y validar con la suite de pruebas; 56/60 tareas resueltas a temperatura 0,6.
- Reescritura y refactorizacion multiarchivo: las respuestas largas que abarcan varios ficheros se generan a 22-25 tok/s, suficiente para integrarse en un flujo de revision asistida antes de abrir un pull request.
- Procesamiento por lotes de documentacion tecnica en ingles y japones: el texto de calibracion de la imatrix procede de redaccion tecnica y codigo en ambos idiomas, por lo que el cuantizado conserva mejor ese dominio; util para generar o traducir documentacion interna.
- Servidor de inferencia autoalojado con `llama-server`: el prefill medido de 946 tok/s con prompts de 8K tokens permite atender consultas con contexto largo en una sola maquina sin GPU de datacenter.
- Prototipado e investigacion sobre cuantizacion: el repositorio publica la imatrix y el script exacto de `llama-quantize` con reglas por tensor, lo que sirve como base reproducible para experimentar con otros repartos de bits (por ejemplo, `ffn_down` de expertos en IQ4_XS).
- Despliegue en entornos con requisitos de licencia permisiva: al ser MIT, puede integrarse en productos comerciales sin obligaciones de atribucion mas alla de conservar el aviso de copyright.

## Benchmarks y rendimiento

Calidad medida con `llama-perplexity --kl-divergence` contra la conversion BF16, sobre 8 fragmentos de 1024 tokens de texto ingles y japones no usado en la imatrix (PPL de referencia BF16: 14,44):

| Metrica | IQ3_XXS-B (este archivo) | IQ3_XXS estandar + misma imatrix | UD-Q4_K_XL | BF16 |
|---|---:|---:|---:|---:|
| Tamano | 51,7 GB | 48,8 GB | 80 GB | no disponible |
| KL media | 0,138 | 0,285 | 0,039 | 0 |
| KL percentil 99 | 1,09 | 1,86 | 0,32 | 0 |
| Coincidencia de token superior | 81,3 % | 74,2 % | 89,5 % | 100 % |
| Perplejidad | 14,88 | 16,22 | 14,37 | 14,44 |

Variante no publicada con `ffn_down` de expertos en IQ4_XS: 57,4 GB, KL media 0,111, KL p99 0,87, coincidencia 82,0 %, PPL 14,75.

Rendimiento en un equipo de 16 GB de GPU (Radeon AI PRO R9700 limitada a 16 GB) + 64 GB de RAM, CPU Ryzen AI Max+ 395 a 16 hilos, PCIe Gen4 x4, drafter NextN activo, greedy, 3 respuestas de 256 tokens:

| Metrica | Este archivo (51,7 GB) | UD-Q4_K_XL (80 GB) |
|---|---:|---:|
| Decodificacion | 39,5 tok/s | 20,9 tok/s |
| Prefill con prompt de 8K tokens | 946 tok/s | 774 tok/s |
| Esperas de SSD por token | 0 % | 37 % (17 lecturas de expertos por token) |
| Cuello de botella | la GPU | el SSD |

Tareas de codigo (estilo llmbench/SWE-bench, una ejecucion por tarea, temperatura 0,6 / top_p 0,95 / top_k 20):

| Conjunto | Este archivo (16 GB GPU + 64 GB RAM) | UD-Q4_K_XL (32 GB GPU + 60 GB RAM + iGPU) |
|---|---:|---:|
| 60 tareas (facil 5, medio 5, dificil 10, experto 12, frontier 8, architect 20) | 56/60 (93,3 %) | 54/60 (90,0 %) |
| 16 tareas nivel L7 | 12/16 (75,0 %) | 11/16 (68,8 %) |

El propio autor advierte que es una sola ejecucion por tarea y que la diferencia entra dentro del ruido: debe leerse como "sin perdida visible en codigo", no como superioridad sobre UD-Q4_K_XL. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 16 GB de GPU son suficientes para el escenario objetivo, colocando en la GPU los pesos densos y tantos expertos como quepan; el resto de expertos se calcula en CPU.
- RAM: 64 GB de sistema, con un tier de ~46 GB configurado en el motor (`STRATA_GLM_RAM_GB` ~46). El archivo completo (51,7 GB) debe caber entre VRAM y RAM para evitar lecturas de disco.
- GPU recomendadas: el autor mide con una AMD Radeon AI PRO R9700 capada a 16 GB. No hay datos publicados para A100, H100, RTX 4090 u otras; en el caso de UD-Q4_K_XL se usa una configuracion de 32 GB de GPU + 60 GB de RAM + iGPU.
- Cabe en GPU de consumo: si, en el sentido de que el modelo completo corre con 16 GB de VRAM mas 64 GB de RAM, pero no cabe integramente en una sola GPU de consumo (51,7 GB de pesos).
- CPU: el autor advierte que su CPU usa memoria LPDDR5X rapida; un sobremesa con DDR5 de doble canal calculara los expertos en CPU mas lentamente, por lo que hay que esperar menos de 39,5 tok/s.
- Opciones de despliegue: `llama.cpp` (arquitectura `qwen35moe`, con `llama-server -ngl 99 --n-cpu-moe <n>`) y `Abyss` v1.3.55 del mismo autor (empaquetado con `tools/iq_pack.py`, config en `docs/ornith/README.md`, lee el drafter NextN de los shards). No hay datos para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput medidos: 39,5 tok/s de decodificacion y 946 tok/s de prefill a 8K en el equipo de referencia; 33-38 tok/s en la mayoria de tareas de codigo y 22-25 tok/s en las respuestas multiarchivo mas largas.

## Comparativa con modelos similares

No hay informacion disponible sobre otros modelos de tamano o categoria comparable. La unica comparacion documentada es entre cuantizaciones del mismo modelo base:

| Variante | Tamano | KL media vs BF16 | PPL | Decodificacion (equipo de referencia) | Licencia |
|---|---:|---:|---:|---:|---|
| IQ3_XXS-B (este repo) | 51,7 GB | 0,138 | 14,88 | 39,5 tok/s | MIT |
| IQ3_XXS estandar + misma imatrix | 48,8 GB | 0,285 | 16,22 | no disponible | MIT |
| UD-Q4_K_XL | 80 GB | 0,039 | 14,37 | 20,9 tok/s | MIT |
| IQ3_XXS-B con `ffn_down` IQ4_XS | 57,4 GB | 0,111 | 14,75 | no disponible | MIT |

Comparacion con alternativas de otros autores (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- Es una cuantizacion con perdida a ~3,32 bits por peso: la KL media es 3,5 veces la de UD-Q4_K_XL (0,138 frente a 0,039) y la perplejidad sube de 14,37 a 14,88. El propio autor recomienda UD-Q4_K_XL si el equipo dispone de 80 GB entre GPU y RAM.
- Las mediciones de calidad se limitan a 8 fragmentos de 1024 tokens de texto ingles y japones; no cubren otros idiomas ni tareas de razonamiento largo.
- Los resultados de codigo provienen de una sola ejecucion por tarea y de 60 + 16 tareas, sin intervalos de confianza; no deben tratarse como comparativa fiable frente a otras variantes.
- El rendimiento de 39,5 tok/s depende de una CPU con memoria LPDDR5X y de PCIe Gen4 x4; en sobremesas con DDR5 de doble canal el calculo de expertos en CPU sera mas lento.
- El bloque NextN (`blk.48`) esta en Q4_K porque no recibe datos de imatrix; su calidad como drafter especulativo no se ha evaluado de forma independiente en la informacion disponible.
- La imatrix se calculo con texto de calibracion en ingles y japones que no se publica, por lo que el sesgo de dominio de la cuantizacion no es auditable.
- No hay informacion sobre sesgos del modelo base, riesgo de alucinacion medido, idiomas soportados oficialmente ni longitud de contexto; hay que consultar la model card de `ornith-ai/Ornith-1.5-122B` para esos datos.
- Licencia MIT: permite uso comercial y modificacion conservando el aviso de copyright; el repositorio solo aloja la conversion cuantizada y no es el proyecto original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-10-25: no hay validacion independiente por parte de la comunidad.
- La model card incluye una seccion en japones que aparece truncada en la informacion disponible ("GPU + RAM に 8..."), por lo que puede faltar contenido relevante.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Motor Abyss (del mismo autor): https://github.com/zephel01/Abyss
- Herramienta de evaluacion de codigo citada (llmbench / swe-bench del autor): https://github.com/zephel01/swe-bench
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron unicamente contenido no relacionado y de caracter adulto, descartado por no ser util como fuente tecnica.
