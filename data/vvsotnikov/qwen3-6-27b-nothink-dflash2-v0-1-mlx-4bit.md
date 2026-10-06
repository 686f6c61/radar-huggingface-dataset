# vvsotnikov/Qwen3.6-27B-nothink-DFlash2-v0.1-MLX-4bit

## Resumen

Este modelo es una conversion a 4 bits en MLX del borrador (drafter) DFlash2 publicado por vvsotnikov, adaptado para un Qwen3.6-27B estandar con el modo de razonamiento desactivado. No es un modelo de chat autonomo, sino un modelo borrador para decodificacion especulativa que debe ejecutarse junto al modelo objetivo vvsotnikov/Qwen3.6-27B-MLX-4bit, que es quien verifica y acepta los tokens propuestos. Reutiliza el tokenizador, los embeddings y la cabeza de salida del modelo objetivo, por lo que no incorpora vocabulario ni cabecera propios.

El checkpoint contiene 1.924.404.480 parametros (1,92 mil millones) procedentes de un origen BF16, organizados en cinco capas de borrador bajo la arquitectura DFlash2DraftModel. La cuantizacion MLX de tipo affine, 4 bits y tamano de grupo 64 reduce el archivo de pesos a 1,08 GB, un 71,9% menos que el fichero BF16 equivalente. Es un artefacto distinto del borrador MTP nativo de Qwen3.6 y se apoya en el tokenizador del modelo objetivo.

Su relevancia es practica: permite reducir la latencia de generacion en Apple Silicon sin reentrenamiento ni calibracion, ya que la conversion es puramente de cuantizacion. El propio autor advierte que solo se han realizado comprobaciones basicas de conversion e inferencia, y que no se han establecido resultados de calidad posteriores ni metricas de velocidad de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel, cinco capas de borrador (modelo drafter para decodificacion especulativa) |
| Parametros totales | 1.924.404.480 (1,92 mil millones) en el origen BF16 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la determina el modelo objetivo en tiempo de inferencia) |
| Tipos de cuantizacion | MLX affine, 4 bits, group size 64; el origen esta en BF16 |
| Idiomas soportados | no disponible (depende del tokenizador y del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con metadatos `format: mlx`; 179 tensores (49 pesos uint32 empaquetados y 130 tensores BF16) |
| Tamano de pesos | 1.082.881.523 bytes (1,08 GB) |
| Block size | 8 configurado; 5 probado en MLX (cuatro propuestas por paso de verificacion) |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa de la familia DFlash2, con cinco capas de borrador y ajuste especifico al modo sin razonamiento de Qwen3.6-27B. En cada paso propone un bloque de tokens candidatos que el modelo objetivo valida; con el block size probado de 5 se generan cuatro propuestas por paso de verificacion. El borrador delega en el objetivo el tokenizador, los embeddings y la cabeza de salida, y es independiente del borrador MTP nativo del modelo objetivo.

El origen BF16 es la exportacion del paso 100, resultado de 100 actualizaciones adicionales de adaptacion sobre un borrador v0.3 previamente entrenado. La conversion a MLX no incluye entrenamiento ni calibracion adicionales: se carga el borrador BF16 original, se aplica `mlx.nn.quantize(draft, group_size=64, bits=4, mode="affine")` antes de enlazar el modelo objetivo y se guarda en safetensors. Solo se cuantizan los modulos Linear y Embedding; los pesos de normalizacion y el resto de parametros no cuantizados permanecen en BF16. La configuracion de origen conserva arquitectura y parametros DFlash, y unicamente se anade un bloque `quantization`. Todos los tensores guardados se verificaron por igualdad exacta con la cuantizacion en tiempo de ejecucion y tras una recarga estricta. El linaje del borrador procede de z-lab/Qwen3.8-27B-DFlash2, desarrollado por Inco AI; DFlash 2 parte de DFlash, de Jian Chen, Yesheng Liang y Zhijian Liu.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa; no genera texto de forma autonoma ni puede usarse como modelo de chat.
- Aceleracion de la inferencia del modelo objetivo mediante propuestas de bloque verificadas por el target.
- Compatibilidad con el tokenizador, los embeddings y la cabeza de salida de vvsotnikov/Qwen3.6-27B-MLX-4bit.
- Funcionamiento en el modo sin razonamiento (thinking desactivado) del modelo objetivo; no esta adaptado al modo con razonamiento.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible como capacidad propia; depende exclusivamente del modelo objetivo que lo acompana.
- Capacidades multilingues: no disponible; heredadas del modelo objetivo y de su tokenizador.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en este artefacto.

## Casos de uso

- Aceleracion de inferencia local en Apple Silicon: el borrador propone bloques de tokens que el Qwen3.6-27B objetivo valida, de modo que se reducen los pasos de decodificacion del modelo grande sin modificar sus pesos.
- Asistentes de codigo ejecutados en un Mac: al combinarse con el target MLX 4-bit, permite mantener respuestas interactivas en tareas de autocompletado o explicacion de codigo, siempre en modo sin razonamiento.
- Servicio mono-usuario en Mac Studio o MacBook con memoria unificada: el borrador anade solo 1,08 GB sobre el modelo objetivo, por lo que el coste de memoria de la aceleracion es bajo en comparacion con el target de 27B.
- Experimentacion en decodificacion especulativa: sirve como punto de partida reproducible para medir tasas de aceptacion y ganancias de velocidad con el loader DFlash en MLX.
- Evaluacion comparativa de borradores: al ser un artefacto separado del MTP nativo, permite contrastar dos estrategias de borrador sobre el mismo modelo objetivo.
- Prototipado de pipelines con muchas llamadas cortas: en flujos con prompts breves y salidas de pocos cientos de tokens, la verificacion por bloques reduce el numero de pasos de decodificacion del modelo grande.
- Despliegue de demostraciones offline en hardware Apple: permite ejecutar ejemplos de generacion local sin depender de servicios en la nube, con el borrador cargado mediante `load_quantized_draft.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se han establecido nuevos resultados de calidad posteriores a la conversion y que las comprobaciones realizadas no constituyen un benchmark de velocidad de servicio ni de calidad de agente. Las unicas validaciones documentadas son pruebas de humo de aritmetica y de aliasing en Python, con thinking desactivado, temperatura 0,7, top-p 0,8, top-k 20, semilla 42 y block size 5, en las que ambas completaron con normalidad y aceptaron tokens del borrador. No se publican tasas de aceptacion, tokens por segundo ni latencia.

| Prueba | Resultado |
|---|---|
| Igualdad exacta de tensores guardados frente a la cuantizacion en ejecucion | superada |
| Recarga estricta de todos los tensores | preservados |
| Verificacion de hashes del modelo objetivo | superada |
| Prueba de humo aritmetica (thinking desactivado) | completada, con aceptacion de tokens del borrador |
| Prueba de humo de aliasing en Python | completada, con aceptacion de tokens del borrador |
| Benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) | no disponibles |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, ya que el artefacto esta en formato MLX y el loader probado es el de DFlash para MLX.
- Entorno validado: Apple M5 Max con MLX 0.32.0, MLX-LM 0.31.3 y la revision fijada `z-lab/dflash@07ebd93db9f472af339b644bb70221ad8428328a`.
- Memoria del borrador: 1,08 GB de pesos, que se suman al modelo objetivo.
- Memoria del objetivo: no disponible en la informacion proporcionada. Como referencia aritmetica (estimacion propia, no confirmada por el repositorio), un modelo de 27.000 millones de parametros a 4 bits ronda los 13,5 GB de pesos, a lo que habria que sumar la cache KV y el overhead del runtime.
- GPU CUDA (A100, H100, RTX 4090): no soportadas por este artefacto, que es especifico de MLX.
- Opciones de despliegue: el loader incluido `load_quantized_draft.py` junto con `dflash.model_mlx`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros runtimes que esperen pesos BF16.
- Latencia y throughput: no disponibles; el autor no publica medidas de velocidad de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MLX 4-bit) | 1,92 mil millones | safetensors MLX, 4 bits, 1,08 GB | no disponible | Apache-2.0 | publico en HuggingFace, 0 descargas y 0 me gusta |
| vvsotnikov/Qwen3.6-27B-nothink-DFlash2-v0.1 (origen BF16) | 1,92 mil millones | BF16, aproximadamente 3,85 GB | no disponible | Apache-2.0 | publico en HuggingFace |
| Borrador MTP nativo de Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | integrado en el modelo objetivo |
| z-lab/Qwen3.8-27B-DFlash2 (linaje) | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace |

## Limitaciones y advertencias

- No es un modelo de chat independiente: sin el modelo objetivo vvsotnikov/Qwen3.6-27B-MLX-4bit no produce salidas utilizables.
- Solo esta adaptado al modo sin razonamiento (thinking desactivado) de Qwen3.6-27B; no se ha adaptado al modo con razonamiento.
- El loader DFlash probado no carga automaticamente checkpoints pre-cuantizados, por lo que es necesario usar el script `load_quantized_draft.py` incluido.
- La cuantizacion no incluye calibracion ni ajuste posterior, de modo que la degradacion de la tasa de aceptacion de tokens no esta medida ni acotada.
- No hay datos publicados de tasa de aceptacion, ganancia de velocidad, latencia ni throughput; el propio autor lo califica como comprobaciones basicas, no como benchmark de servicio.
- No se han publicado resultados de calidad posteriores a la conversion, ni de agentes, ni de codigo, ni de matematicas.
- Idiomas soportados no disponibles: dependen del tokenizador y del modelo objetivo.
- Riesgo de alucinacion: no evaluado en este artefacto; cualquier comportamiento generativo pertenece al modelo objetivo.
- Sesgos conocidos: no disponibles.
- Licencia Apache-2.0, que permite uso comercial, pero se mantienen sin cambios el LICENSE y el NOTICE heredados; el NOTICE registra la adaptacion de mezcla anterior y la posterior adaptacion a Qwen3.6 estandar, y debe conservarse.
- Es un derivado no oficial: no esta afiliado ni respaldado por Alibaba Cloud ni por Alibaba Group.
- Runtimes que esperen pesos BF16 deben usar el repositorio de origen BF16 en lugar de este checkpoint MLX.
- El flujo en crudo puede incluir tokens especiales de fin de mensaje.
- El repositorio registra 0 descargas y 0 me gusta, y no se documenta validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vvsotnikov/Qwen3.6-27B-nothink-DFlash2-v0.1-MLX-4bit
- Modelo base BF16: https://huggingface.co/vvsotnikov/Qwen3.6-27B-nothink-DFlash2-v0.1
- Modelo objetivo MLX 4-bit: https://huggingface.co/vvsotnikov/Qwen3.6-27B-MLX-4bit
- Linaje del borrador: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio DFlash: https://github.com/z-lab/dflash
- Revision fijada de DFlash: https://github.com/z-lab/dflash/tree/07ebd93db9f472af339b644bb70221ad8428328a
- Manifiesto de conversion: conversion-manifest.json (en el repositorio del modelo)
- Script de carga: load_quantized_draft.py (en el repositorio del modelo)
- Registro de cambios: CHANGES.md (en el repositorio del modelo)
- Licencia y aviso legal: LICENSE y NOTICE (en el repositorio del modelo)
