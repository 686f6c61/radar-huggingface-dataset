# Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4

## Resumen

Llama-3.1-8B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo meta-llama/Llama-3.1-8B realizada por Xylolabs, orientada especificamente a la ejecucion sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de una cuantizacion generica para GPU, sino de un empaquetado en formatos de coma flotante por bloques (block floating point) propios de Tenstorrent: BFP4 para las proyecciones de atencion y las proyecciones gate/up del MLP, y BFP8 para las proyecciones down del MLP, manteniendo el LM head, los embeddings y las normalizaciones en bf16.

El modelo resuelve el problema de desplegar un transformer de 8.030.261.248 parametros en hardware NPU de Tenstorrent con un coste de memoria reducido: el empaquetado ocupa 6,967 GB frente a los 16,06 GB en bf16, es decir, una reduccion de aproximadamente el 56,6 %. La perdida de calidad medida como divergencia KL media respecto a bf16 es de 0,03860, ligeramente superior a la de una cuantizacion Q4_K_M de llama.cpp (0,03478), pero con mayor tamano de almacenamiento.

Es relevante porque cubre un nicho poco atendido: la cuantizacion nativa para el stack tt-metal/ttnn de Tenstorrent, con herramientas de empaquetado y verificacion publicadas y con validacion sobre el simulador ttsim de Blackhole. El modelo base conserva la ventana de contexto de Llama 3.1 (128.000 tokens), aunque la model card no detalla el comportamiento a contextos largos tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), cuantizado en block floating point para Tensix |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | bfloat4_b (BFP4) en atencion q/k/v/o y MLP gate/up; bfloat8_b (BFP8) en MLP down; bf16 en LM head, embeddings y norms |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy) |
| Formato de pesos | safetensors (empaquetado Tensix; tamano de repo 16,1 GB, empaquetado 6,967 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con 32 capas, atencion multi-cabeza con grouped-query attention, activacion SwiGLU en el MLP y normalizacion RMSNorm. Xylolabs no reentrena el modelo; parte del checkpoint meta-llama/Llama-3.1-8B y aplica cuantizacion post-entrenamiento. Las proyecciones de atencion (q, k, v, o) y las proyecciones gate y up del MLP de las 32 capas se cuantizan a bfloat4_b mediante GPTQ con busqueda de exponente por bloque, usando la configuracion llama-3.1-8b-cal4x.toml del repositorio tensix-bfp-gptq. Las proyecciones down del MLP se cuantizan a bfloat8_b por redondeo al mas cercano (round to nearest). El LM head, los embeddings y las normalizaciones permanecen en bf16.

La innovacion tecnica principal es el uso de formatos block floating point nativos de Tenstorrent (bfloat4_b y bfloat8_b), que comparten un exponente por bloque y permiten a los nucleos Tensix procesar matrices de baja precision de forma eficiente. El repositorio incluye quant4.json, que documenta el formato de cada proyeccion, y las herramientas pack_tensix.py y verify_grid.py para empaquetar y verificar la integridad de las matrices. La validacion se realizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent. No se documentan fases de RLHF ni DPO adicionales sobre el modelo base.

## Capacidades

- Generacion de texto autoregresiva y continuacion de texto: el modelo es la version pretrained, sin plantilla de chat.
- Razonamiento y conocimiento general heredados de Llama 3.1 8B.
- Generacion de codigo y matematicas, en la medida en que lo soporta el checkpoint base.
- Capacidades multilingues limitadas a los ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni multi-step reasoning explicito en la informacion proporcionada.
- No dispone de modo thinking, vision ni audio.
- Ejecucion en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn, ademas de inferencia estandar con transformers.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal es ejecutar Llama 3.1 8B en NPUs Wormhole o Blackhole con un footprint de 6,967 GB, liberando memoria DRAM frente a los 16,06 GB en bf16 y permitiendo mayor paralelismo de batch o contextos mas largos en el mismo dispositivo.
- Investigacion en cuantizacion de baja precision: util para estudiar el impacto de BFP4 con GPTQ y busqueda de exponente por bloque en la calidad del modelo, comparando la divergencia KL (0,03860) con otras tecnicas como Q4_K_M (0,03478).
- Prototipado y validacion en simulador: el modelo se puede validar sobre ttsim antes de disponer de hardware fisico, lo que facilita el desarrollo de kernels y pipelines para Tensix.
- Generacion de texto por lotes en ingles: al ser un modelo pretrained, encaja en tareas de continuacion de texto, resumen extractivo o generacion de articulos donde no se requiere formato conversacional.
- Evaluacion de infraestructura de inferencia: sirve como banco de pruebas para medir throughput y latencia del stack tt-metal/ttnn con un modelo de 8B cuantizado.
- Investigacion academica sobre formatos block floating point: permite reproducir y extender los experimentos de cuantizacion publicados en el repositorio tensix-bfp-gptq.
- Inferencia con transformers en GPU/CPU como referencia: la model card incluye un quickstart con AutoModelForCausalLM en bfloat16, util para comparar resultados entre el empaquetado Tensix y el checkpoint original.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B) | 16,06 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 6,967 | 0,03860 | 90,90 |
| Q4_K_M (llama.cpp) | 4,921 | 0,03478 | 90,58 |

Las metricas de KL y top-1 se calcularon sobre 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano. La cuantizacion Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (cd959bae) sin importance matrix. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,967 GB para el empaquetado Tensix; 16,06 GB si se carga en bf16 con transformers.
- Hardware objetivo: aceleradores Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Validacion realizada sobre ttsim (simulador de Blackhole) con ttnn 0.81.1; no se documenta validacion en silicio fisico en la informacion proporcionada.
- GPU consumer: no es el objetivo del modelo; la carga en bf16 requiere al menos 16 GB de VRAM, por lo que cabria en RTX 4090 (24 GB) o A100/H100 en configuracion estandar de transformers, pero sin las ventajas del formato Tensix.
- Opciones de despliegue: transformers (con device_map="auto"), ttnn sobre Tensix, y las herramientas tensix-runner v0.1.0 y tensix-kernels v0.1.0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4) | 8,03 B | no disponible (base: 128k) | BFP4/BFP8 Tensix | Llama 3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | bf16 | Llama 3.1 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,03 B | 128.000 tokens | 4 bits K-quant | Llama 3.1 | Generable localmente |
| unsloth/Llama-3.1-8B (bf16) | 8,03 B | 128.000 tokens | bf16 | Llama 3.1 | Hugging Face |

La comparativa directa mas relevante es con Q4_K_M: este modelo ocupa 6,967 GB frente a 4,921 GB, con una KL media de 0,03860 frente a 0,03478 y un top-1 de 90,90 % frente a 90,58 %. Es decir, mayor tamano y peor KL, pero con la ventaja de estar empaquetado en formatos nativos de Tensix que Q4_K_M no ofrece.

## Limitaciones y advertencias

- Es un modelo pretrained: no incluye plantilla de chat ni ajuste por instrucciones, por lo que no debe usarse directamente como asistente conversacional.
- La perdida de calidad respecto a bf16 es medible (KL media 0,03860, top-1 90,90 %), superior a la de Q4_K_M; en tareas sensibles a la precision puede degradarse el rendimiento.
- La evaluacion de calidad se limita a 8.184 posiciones de ingles y coreano; no hay datos sobre el resto de idiomas declarados ni sobre tareas de razonamiento o codigo.
- No se documenta el comportamiento con contextos largos tras la cuantizacion, pese a que el modelo base soporta 128.000 tokens.
- Riesgo de sesgos y alucinaciones heredado del checkpoint base Llama 3.1; no se documentan mitigaciones adicionales.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y una Acceptable Use Policy; es necesario revisar ambos documentos antes de un despliegue en produccion.
- La validacion se realizo sobre el simulador ttsim, no sobre hardware fisico, segun la informacion disponible.
- El modelo esta disenado para Tensix; fuera de ese hardware pierde su ventaja principal de tamano y solo funciona como una carga bf16 convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Configuracion de calibracion: https://github.com/XylolabsInc/tensix-bfp-gptq/blob/3d51048/configs/llama-3.1-8b-cal4x.toml
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Checkpoint bf16 de referencia (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B/tree/3f0d51f8e5640f98f1a96ea9044a0e55c0a83814
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
