# Xylolabs/gemma-4-26B-A4B-it-MLX-8bit

## Resumen

Xylolabs/gemma-4-26B-A4B-it-MLX-8bit es una cuantizacion en 8 bits del modelo google/gemma-4-26B-A4B-it, convertida al formato MLX para su uso con la libreria `mlx-lm` en hardware Apple Silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 25.233.053.440 parametros totales, del que esta version conserva unicamente la torre de texto, eliminando la torre de vision del modelo original. La cuantizacion es de tipo afin (affine) con tamano de grupo 64, escalas y sesgos en float16.

El artefacto resuelve un problema muy concreto: permitir ejecutar un modelo de gran tamano en equipos Mac con memoria unificada, donde el formato BF16 original (50,51 GB) resulta inviable en muchas configuraciones. La version de 8 bits ocupa 26,81 GB, lo que la hace desplegable en equipos con 32 GB o mas de memoria unificada, manteniendo una fidelidad alta respecto al original segun las metricas del autor (KL de 0,005099 y top-1 del 97,60% frente al BF16 GGUF de llama.cpp en texto con plantilla de chat).

Es relevante ahora porque el ecosistema MLX se ha consolidado como la via practica para inferencia local en Apple Silicon, y esta ficha documenta una conversion con mediciones de divergencia explicitas, algo poco habitual en cuantizaciones de terceros. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el nombre del modelo base (A4B); detalles internos no disponibles |
| Parametros totales | 25.233.053.440 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afin, group size 64, escalas y sesgos en float16; existe tambien una variante MLX 4-bit del mismo autor |
| Idiomas soportados | no disponible en la model card (las pruebas de fidelidad incluyen conversaciones en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx-lm`), solo texto, sin torre de vision |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), tal como indica el sufijo A4B de su denominacion. Esta version cuantizada no aporta informacion sobre el proceso de entrenamiento del modelo original: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de atencion o decodificacion. Lo unico documentado por el autor de la cuantizacion es el proceso de conversion: pesos lineales y el embedding de tokens (incluida la LM head) cuantizados a 8 bits con escalas y sesgos en float16, capas de normalizacion en float16 y el resto de tensores no cuantizados en float16.

La innovacion destacable de esta ficha es la evaluacion de fidelidad publicada por Xylolabs: divergencia KL y acuerdo top-1 frente al BF16 GGUF de llama.cpp sobre texto con plantilla de chat (4 conversaciones en ingles y 4 en coreano, 8 x 511 tokens puntuados). Ademas se advierte de que en texto crudo (WikiText-2) la KL es mucho mayor en todas las pilas probadas, incluida la Q8_0 de llama.cpp, lo que es una advertencia honesta sobre el comportamiento fuera de distribucion conversacional.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y respuesta a preguntas: la model card incluye una comprobacion de 7 preguntas superada al 7/7 en las tres variantes (4-bit, 8-bit y BF16).
- Capacidades multilingues: las pruebas de fidelidad incluyen conversaciones en ingles y coreano; el listado oficial de idiomas no esta disponible.
- Solo texto: la torre de vision del modelo base ha sido eliminada en esta conversion, por lo que no procesa imagenes.
- Tool calling, function calling, comportamiento agentico y modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 26,81 GB de pesos, el modelo cabe en equipos Apple Silicon de 32 GB o mas, permitiendo ejecutar un MoE de 25B parametros sin GPU dedicada mediante `mlx-lm`.
- Asistentes conversacionales en local: el modelo conserva un top-1 del 97,60% frente al BF16 en texto con plantilla de chat, por lo que es adecuado para dialogos multi-turno donde se busca privacidad y no enviar datos a la nube.
- Prototipado de aplicaciones de texto en entornos de desarrollo con Mac: la instalacion se reduce a `pip install mlx-lm==0.32.2` y un comando `mlx_lm.generate`, lo que agiliza la iteracion.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de 8 bits frente a 4 bits (14,47 GB) y BF16 (50,51 GB) en tareas de chat, gracias a las metricas KL y top-1 publicadas.
- Generacion de texto en lote sobre corpus en ingles y coreano: el autor valida la fidelidad en ambos idiomas, lo que respalda su uso en pipelines de procesamiento de texto en esas lenguas.
- Sustitucion de BF16 en equipos con memoria limitada: cuando el BF16 de 50,51 GB no cabe, esta version ofrece un equilibrio medido entre tamano y fidelidad para tareas de generacion y respuesta a preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de la cuantizacion frente al BF16 GGUF de llama.cpp:

| Variante | Tamano | KL | top-1 | Comprobacion de 7 preguntas |
|---|---:|---:|---:|---:|
| MLX 4-bit | 14,47 GB | 0,153050 | 86,67% | 7/7 |
| MLX 8-bit | 26,81 GB | 0,005099 | 97,60% | 7/7 |
| BF16 | 50,51 GB | no disponible | no disponible | 7/7 |

## Requisitos de hardware

- VRAM/memoria estimada: 26,81 GB para los pesos en 8 bits; se necesita memoria adicional para el contexto y el estado de inferencia, por lo que se recomienda un equipo con al menos 32 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente (familias M-series con 32 GB o mas); no aplica a GPU NVIDIA o AMD porque el formato es MLX.
- Cabe en GPU de consumo: si, en configuraciones de Apple Silicon con 32 GB o mas de memoria unificada; no es compatible con GPU de consumo discretas al no existir soporte MLX para ellas.
- Opciones de despliegue: `mlx-lm` version 0.32.2 mediante `mlx_lm.generate`; no se documentan otras pilas de inferencia para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-it-MLX-8bit | 25,23B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Solo texto, orientado a Apple Silicon |
| Xylolabs/gemma-4-26B-A4B-it-MLX-4bit | 25,23B (base) | no disponible | MLX safetensors 4-bit | Apache 2.0 | 14,47 GB, KL 0,153050, top-1 86,67% |
| google/gemma-4-26B-A4B-it (BF16) | 25,23B | no disponible | safetensors BF16 | Apache 2.0 | 50,51 GB, incluye torre de vision |
| BF16 GGUF (llama.cpp) | 25,23B (base) | no disponible | GGUF BF16 | Apache 2.0 | Referencia de fidelidad usada por el autor |

## Limitaciones y advertencias

- Solo texto: la torre de vision del modelo base se ha eliminado, por lo que no puede procesar imagenes.
- Divergencia en texto crudo: el autor advierte de que la KL en texto sin plantilla de chat (WikiText-2) es mucho mayor en todas las pilas, incluida la Q8_0 de llama.cpp, lo que sugiere menor fidelidad fuera de distribucion conversacional.
- Dependencia de plataforma: los pesos MLX solo se ejecutan en hardware Apple con `mlx-lm` 0.32.2; no son portables a vLLM, TGI o llama.cpp.
- Idiomas no documentados oficialmente: la model card no lista idiomas soportados; las pruebas solo cubren ingles y coreano.
- Sin datos de sesgos, alucinacion ni seguridad: no se proporciona informacion sobre evaluaciones de sesgo o robustez del modelo base en esta ficha.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio y las condiciones del modelo base de Google.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-MLX-8bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
