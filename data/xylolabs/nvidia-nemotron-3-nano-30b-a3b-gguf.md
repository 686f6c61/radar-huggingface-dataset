# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B es un modelo de lenguaje de tipo mixtura de expertos (MoE) con arquitectura hibrida Mamba-Transformer, desarrollado por NVIDIA y publicado originalmente en BF16 bajo la referencia `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El repositorio aqui descrito es una conversion a formato GGUF realizada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. Cuenta con 31.577.940.288 parametros totales y 3.000 millones de parametros activos por token (de ahi el sufijo A3B), lo que lo situa en la categoria de modelos eficientes de gran capacidad.

El modelo esta disenado para razonamiento agentico, segun se desprende del titulo del informe tecnico asociado (arXiv:2512.20848), y combina capas de atencion con capas de estado (Mamba2), una tendencia arquitectonica orientada a reducir el coste computacional en contextos largos. La model card de la conversion GGUF declara soporte para contextos de hasta 256K tokens en configuraciones de hardware con suficiente memoria, aunque la longitud de contexto nativa del modelo base no se detalla de forma explicita en la informacion disponible.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo MoE hibrido de ~31.6B parametros en hardware de consumo y estaciones de trabajo, gracias a la cuantizacion Q4_K_M (24.5 GB) y a la posibilidad de descargar los pesos de los expertos a RAM del sistema mediante `--n-cpu-moe`. La licencia es la NVIDIA Nemotron Open Model License, declarada por el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-Transformer, mixtura de expertos (MoE) |
| Parametros totales | 31.577.940.288 (~31.6B) |
| Parametros activos | 3B (aproximado, segun denominacion A3B) |
| Longitud de contexto | Hasta 256K tokens segun la tabla de hardware de la model card; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (publicados); Q4_K_M es el unico fichero listado en la tabla de archivos |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | NVIDIA Nemotron Open Model License (other) |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizer y chat template incluidos) |

## Arquitectura y entrenamiento

La arquitectura es hibrida: combina capas de atencion con capas Mamba2 (modelos de espacio de estados), una eleccion que busca mantener calidad en razonamiento y generacion mientras se reduce el coste de atencion en secuencias largas. Al ser un modelo MoE, solo una fraccion de los parametros (aproximadamente 3B de los ~31.6B) se activa por token, lo que permite un throughput mayor que un modelo denso del mismo tamano total. El tag `mamba2` en el repositorio y el titulo del informe tecnico confirman esta composicion.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa. La model card de la conversion GGUF se limita a describir el proceso de conversion y cuantizacion, no el entrenamiento del modelo base. Para esos datos seria necesario consultar el informe tecnico arXiv:2512.20848 y la model card original de NVIDIA.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline `text-generation`.
- Razonamiento agentico y multi-step, segun la orientacion declarada en el informe tecnico del modelo base.
- Soporte de contextos largos (hasta 256K tokens en configuraciones con memoria suficiente, segun la tabla de hardware).
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del repositorio.
- Compatibilidad con llama.cpp mediante `llama-cli` y `llama-server`, incluyendo plantilla de chat integrada (`--jinja`).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo thinking; deben verificarse en la model card del modelo base.

## Casos de uso

- Razonamiento agentico en local: el modelo puede ejecutarse con llama.cpp en una estacion de trabajo con una RTX 5090 (32 GB) y contexto de 256K, adecuado para pipelines de agentes que requieren ventanas largas sin depender de APIs externas.
- Procesamiento de documentos extensos: con 256K tokens de contexto en hardware de 48 GB o superior, permite analizar contratos, informes o bases de codigo completas en una sola pasada.
- Despliegue en hardware de consumo con descarga de expertos: mediante `--n-cpu-moe N` se pueden mantener los pesos de los expertos en RAM del sistema y ejecutar el modelo en GPUs de 24 GB (RTX 4090/3090) con contexto de 32K, util para prototipado y desarrollo.
- Servicio de inferencia ligero: `llama-server` expone una API compatible con endpoints, lo que facilita integrar el modelo en aplicaciones internas con requisitos de privacidad (datos que no salen del equipo).
- Generacion de texto en ingles y coreano: util para equipos que trabajan con contenido en esos idiomas y necesitan un modelo local sin coste por token.
- Experimentacion e investigacion: al ser una cuantizacion GGUF de un modelo MoE hibrido, sirve para estudiar el comportamiento de arquitecturas Mamba-Transformer bajo cuantizacion y comparar la degradacion de calidad entre niveles (Q8_0 a Q3_K_M).
- Entornos con memoria unificada: en Mac Studio M5 Max/Ultra o DGX Spark (128 GB o mas), el modelo Q4_K_M cabe con contexto completo de 256K, adecuado para estaciones de trabajo de desarrollador sin GPU dedicada de gran VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye metricas de fidelidad de la cuantizacion respecto al BF16 original, medidas con llama.cpp sobre WikiText-2 y un conjunto held-out:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 33.585 GB | 0.004506 | 96.922% | 0.006133 | 96.775% |
| Q6_K | 33.508 GB | 0.006065 | 96.544% | 0.008143 | 96.098% |
| Q5_K_M | 26.040 GB | 0.017083 | 94.064% | 0.020657 | 93.716% |
| Q4_K_M | 24.515 GB | 0.026902 | 92.348% | 0.033647 | 91.853% |
| Q3_K_M | 19.849 GB | 0.090981 | 86.779% | 0.091236 | 86.706% |

La divergencia KL crece de forma notable por debajo de Q4_K_M: Q3_K_M multiplica por mas de tres la KL de Q4_K_M y pierde unos 5.5 puntos de acuerdo top-1, lo que sugiere que Q4_K_M es el punto de equilibrio recomendado para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 24.5 GB de pesos; hay que sumar la cache KV en f16 para el contexto deseado y unos 2 GB de runtime. La model card indica que un fichero cabe cuando su tamano mas la cache KV mas 2 GB queda por debajo del 90% de la memoria disponible.
- GPU recomendadas segun la model card: RTX 5090 (32 GB) con Q4_K_M y 256K de contexto; RTX 6000 Ada o 2 x 24 GB (48 GB) con 256K; H100 (80 GB), H200 (141 GB), B200 (~180 GB usable) y B300 (288 GB) con 256K.
- GPU de consumo: en RTX 4090/3090 (24 GB) el modelo no cabe entero con Q4_K_M; la model card propone descargar expertos a RAM con `--n-cpu-moe N` y usar contexto de 32K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256/512 GB) ejecutan Q4_K_M con 256K de contexto.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) en CUDA, Metal o CPU, verificado con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Los modelos alternativos citados son referencias genericas de la categoria y sus datos no provienen de la informacion facilitada.

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3-Nano-30B-A3B (esta ficha) | ~31.6B | ~3B | hasta 256K (segun hardware) | NVIDIA Nemotron Open Model License | GGUF, BF16 |
| Modelo MoE denso de referencia de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelo denso de ~30B de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la informacion disponible modelos comparables concretos con datos verificables; se recomienda consultar el informe tecnico arXiv:2512.20848 para las comparaciones oficiales de NVIDIA.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion en la informacion disponible.
- Sesgos: no se dispone de informacion sobre sesgos conocidos ni sobre el proceso de alineacion del modelo base.
- Cuantizacion: por debajo de Q4_K_M la fidelidad cae de forma acusada (Q3_K_M con KL ~0.091 y top-1 ~86.8%); para produccion se recomienda Q4_K_M o superior.
- Licencia: NVIDIA Nemotron Open Model License; es necesario revisar los terminos exactos en el fichero LICENSE del repositorio antes de un uso comercial. Xylolabs declara no estar afiliada ni respaldada por NVIDIA.
- Contexto: los 256K tokens dependen del hardware; en GPUs de 24 GB el contexto practico baja a 32K con descarga de expertos a RAM.
- Rendimiento: no hay datos publicados de latencia ni throughput para esta conversion; deben medirse en el hardware objetivo.
- Mantenimiento: el repositorio tiene 330 descargas y 0 likes en el momento de la consulta, y la ultima actualizacion es del 24 de noviembre de 2026; conviene verificar la vigencia frente al modelo base oficial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Informe tecnico: https://arxiv.org/abs/2512.20848
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit verificado de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repositorio: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF/blob/main/LICENSE
