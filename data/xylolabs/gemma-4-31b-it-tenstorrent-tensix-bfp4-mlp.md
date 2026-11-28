# Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP4-MLP

## Resumen

`Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP4-MLP` es una cuantizacion del modelo multimodal `google/gemma-4-31B-it` realizada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la torre de vision y la cabeza de embedding en bf16, mientras que las proyecciones MLP se cuantizan a `bfloat4_b` (BFP4) y las proyecciones de atencion a `bfloat8_b` (BFP8), lo que reduce el peso empaquetado de 61,39 GB en bf16 a 23,534 GB.

El problema que resuelve es el despliegue eficiente de un modelo de 32.682 millones de parametros sobre hardware Tensix, que emplea formatos de coma flotante por bloques (block floating point) nativos. Incluye scripts (`pack_tensix.py`, `verify_grid.py`) que permiten empaquetar cada matriz directamente en tensores `ttnn` y verificar la equivalencia numerica contra los pesos originales. La ficha del autor reporta una divergencia media de KL frente a bf16 de 0,05998, ligeramente superior a la de una cuantizacion Q4_K_M de llama.cpp (0,05170).

Es relevante ahora porque demuestra un flujo de cuantizacion GPTQ especifico para formatos BFP4/BFP8 de Tenstorrent, una alternativa a las GPUs convencionales para servir modelos multimodales de gran tamano. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atencion q/k/o y v; bf16 en LM head, embedding, norms y torre de vision |
| Idiomas soportados | no disponible (evaluacion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer multimodal de 32.682 millones de parametros que procesa imagen y texto (`pipeline_tag: image-text-to-text`). La model card de esta cuantizacion no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, atencion, etc.), aunque la tabla de formatos menciona 60 capas con proyecciones MLP y de atencion, y 50 capas con proyeccion v.

El proceso de cuantizacion es propio de Xylolabs: las matrices MLP se cuantizan con GPTQ mas una busqueda de exponente por bloque, y las proyecciones de atencion con redondeo al mas cercano (round to nearest). El repositorio incluye `quant4.json`, que documenta el formato de cada proyeccion, y los scripts de empaquetado y verificacion. No se proporciona informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de vision conservada en bf16.
- Razonamiento y respuesta a instrucciones, heredados del modelo base `gemma-4-31B-it`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la evaluacion cubre ingles y coreano; el resto de idiomas no esta documentado.
- Capacidad especial: empaquetado nativo en formatos Tensix (`bfloat4_b`, `bfloat8_b`) y verificacion de equivalencia numerica.

## Casos de uso

- Despliegue en NPU Tenstorrent: servir el modelo en Wormhole o Blackhole aprovechando los formatos nativos BFP4/BFP8, con un peso empaquetado de 23,534 GB frente a 61,39 GB en bf16, lo que reduce la huella de memoria del dispositivo.
- Asistentes multimodales en el borde: al conservar la torre de vision en bf16, el modelo puede responder preguntas sobre imagenes en entornos con aceleradores Tensix en lugar de GPUs.
- Prototipado de pipelines de cuantizacion: usar `pack_tensix.py` y `verify_grid.py` para validar el empaquetado de cada matriz y comprobar la equivalencia numerica antes de desplegar.
- Servicio conversacional con transformers: cargar el modelo con `AutoModelForCausalLM` y `device_map="auto"` para pruebas de calidad en bf16 antes de moverlo al hardware Tensix.
- Evaluacion comparativa de cuantizaciones: medir la divergencia KL frente a bf16 y compararla con alternativas como Q4_K_M de llama.cpp para decidir el compromiso tamano/calidad.
- Investigacion en formatos block floating point: estudiar el impacto de BFP4 en las proyecciones MLP frente a BFP8 en atencion sobre la calidad de salida.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media frente a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-31B-it`) | 61,39 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atencion) | 23,534 | 0,05998 | 92,25 |
| Q4_K_M (llama.cpp) | 18,687 | 0,05170 | 92,69 |

Las metricas de KL y top-1 se calculan sobre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con la plantilla de chat. La cuantizacion Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia (sha256 `b33a01989e939a8fbfc00ea0d8a91fb3bdf64460498c2a4ee0ce0783b76aa73e`). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,534 GB empaquetado para Tensix; en bf16 el modelo base ocupa 61,39 GB.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- GPU consumer: no se documenta soporte especifico; el modelo es compatible con transformers y `device_map="auto"`, por lo que podria cargarse en GPUs con suficiente memoria en bf16, pero no hay datos de rendimiento.
- Opciones de despliegue: `ttnn` (Tenstorrent), `tt-metal`, `tt-forge`, `tensix-runner` v0.1.0, `tensix-kernels` v0.1.0; tambien `transformers` para pruebas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Calidad (KL vs BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8 Tensix) | 32,68 B | no disponible | 23,534 GB | 0,05998 | Apache 2.0 | Hugging Face |
| `google/gemma-4-31B-it` (BF16) | 32,68 B | no disponible | 61,39 GB | 0 (referencia) | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo base) | 32,68 B | no disponible | 18,687 GB | 0,05170 | Apache 2.0 | generado localmente |

No se dispone de datos de benchmarks de tareas para comparar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La divergencia KL frente a bf16 (0,05998) es un 16 % superior a la de Q4_K_M (0,05170); el top-1 cae al 92,25 % frente al 92,69 % de Q4_K_M.
- La evaluacion de calidad cubre solo ingles y coreano; el comportamiento en otros idiomas no esta documentado.
- El modelo esta optimizado para hardware Tensix; su uso en GPUs convencionales no esta validado ni medido.
- No se documentan sesgos conocidos ni tasas de alucinacion del modelo base en esta ficha.
- La licencia Apache 2.0 se aplica segun la model card del autor; el repositorio del modelo base no incluye fichero LICENSE y el autor aporta el texto estandar.
- Los scripts de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) se distribuyen sin cambios desde `tensix-bfp-gptq` en el commit `5c52065`.
- No hay informacion sobre tool calling, agentes ni longitud de contexto, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
