# Xylolabs/Aion-1.0-Instruct-2.3B-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-GGUF es la distribucion en formato GGUF del modelo Aion 1.0 Instruct 2.3B de Microsoft, preparada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo original es un transformer decoder-only de 2.288.831.488 parametros (2,29B, de los cuales 0,41B corresponden al embedding y la cabeza de salida atados), disenado para generacion de texto conversacional y ajustado con instrucciones. Esta version GGUF resuelve el problema de despliegue en entornos sin PyTorch ni el codigo custom de Microsoft: permite ejecutar el modelo en hardware de consumo mediante cuantizacion Q8_0.

La relevancia de esta publicacion es doble. Por un lado, ofrece una cuantizacion Q8_0 de 2,44 GB con una fidelidad medida muy alta respecto a la referencia f32 (KL media 0,00188, mismo top-1 en el 97,99% de las posiciones, perplejidad 6,3038 frente a 6,2946). Por otro, la arquitectura `aion` no existe en llama.cpp upstream, por lo que el repositorio incluye un parche que anade el soporte necesario. Sin ese parche, los ficheros no cargan en una build estandar.

El modelo cubre ocho idiomas (ingles, aleman, espanol, portugues, italiano, frances, chino y japones), tiene una ventana de contexto de 32.768 tokens y se distribuye bajo licencia MIT. Es una opcion adecuada para prototipado local, asistentes conversacionales ligeros y tareas de extraccion o generacion sobre hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (bloque tipo Qwen3 con lista de sliding-window por capa, YaRN en capas de atencion completa y RoPE plano en capas sliding-window) |
| Parametros totales | 2.288.831.488 (2,29B); 0,41B corresponden al embedding y cabeza de salida atados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (unico quant publicado) |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT (texto de Microsoft sin modificar, "Copyright (c) Microsoft Corporation") |
| Formato de pesos | GGUF (fichero unico con tokenizer y chat template embebidos) |
| Capas | 28 (21 sliding-window con ventana de 2.048, 7 de atencion completa) |
| Cabezas de atencion | 24 query, 8 KV, dimension 128 (GQA) |
| Hidden size | 2.048 |
| Vocabulario | 200.029 tokens |
| Tamano del fichero Q8_0 | 2,44 GB |
| Tamano del repo | 2,4 GB |
| Receta de tensores | 197 matrices de pesos en Q8_0 (incluye embedding y cabeza atados), 113 tensores de normalizacion en F32 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only que reutiliza el bloque de Qwen3 con una modificacion clave: una lista de sliding-window por capa. De las 28 capas, 21 usan atencion de ventana deslizante con un tamano de 2.048 tokens y 7 emplean atencion completa con YaRN, mientras que las capas sliding-window usan RoPE plano. La atencion usa 24 cabezas de query y 8 de KV con dimension 128 (GQA), sobre un hidden size de 2.048. El vocabulario es de 200.029 tokens y el contexto maximo de 32.768.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. La model card de esta version GGUF reproduce parcialmente la descripcion de Microsoft, pero no detalla el proceso de entrenamiento. El proceso de cuantizacion si esta documentado: conversion del checkpoint BF16 a GGUF BF16 con `conversion/aion.py`, generacion de la matriz de importancia con `llama-imatrix` sobre 600 fragmentos de 4.096 tokens (databricks-dolly-15k en ingles, KoAlpaca-v1.1a en coreano, python_code_instructions_18k_alpaca para codigo y gsm8k para matematicas, con `--process-output`) y cuantizacion final con `llama-quantize`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat embebida (requiere `--jinja` en llama.cpp porque el template escribe el preambulo de sistema con la fecha).
- Ajuste a instrucciones: resumen, reescritura formal, extraccion de JSON y respuesta a preguntas sobre un texto.
- Generacion de codigo, incluyendo ejemplos como la sucesion de Fibonacci en Python.
- Razonamiento aritmetico basico.
- Capacidades multilingues en ocho idiomas: ingles, aleman, espanol, portugues, italiano, frances, chino y japones. La evaluacion cualitativa incluyo un resumen en coreano, aunque el coreano no figura en la lista oficial de idiomas.
- Soporte de contexto largo de hasta 32.768 tokens, con atencion hibrida sliding-window/full para reducir coste en secuencias largas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional local: el modelo cabe en 4 GB de memoria en Q8_0 y puede ejecutarse en CPU o en GPU de consumo mediante llama.cpp, lo que permite desplegar un chatbot privado sin dependencias de la nube.
- Resumen y reescritura de documentos: con 32.768 tokens de contexto puede procesar articulos, informes o hilos de correo completos y producir resumenes o versiones formales, una tarea validada en la evaluacion manual del quant.
- Extraccion estructurada de datos: la prueba de extraccion de JSON sugiere uso en pipelines de parsing de texto libre a campos estructurados, por ejemplo en ingestion de formularios o correos.
- Generacion de codigo asistida en entornos con recursos limitados: util para autocompletado o generacion de fragmentos en editores y scripts donde no es viable un modelo mayor, con soporte de Python y matematicas en el dataset de calibracion.
- Atencion al cliente multilingue: al cubrir ocho idiomas y mantener conversaciones multi-turno con contexto largo, sirve para bots de soporte en mercados europeos y asiaticos.
- Prototipado e investigacion: al ser un modelo de 2,3B con licencia MIT y pesos GGUF, es adecuado para experimentar con tecnicas de cuantizacion, evaluacion de fidelidad y despliegue en hardware heterogeneo.
- Procesamiento de texto en el borde: con 2,44 GB de fichero puede ejecutarse en equipos sin GPU dedicada, lo que habilita tareas de clasificacion, resumen o reescritura en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de fidelidad de la cuantizacion frente a la referencia f32, calculadas sobre 16x4.096 tokens (12 fragmentos de chat en ingles, coreano, codigo y matematicas, y 4 de wikitext-2), puntuando las posiciones 2.048-4.095, en una NVIDIA H200:

| Metrica | Q8_0 | Referencia f32 |
|---|---|---|
| Perplejidad (PPL) | 6,3038 | 6,2946 |
| KL media vs f32 | 0,00188 | - |
| Mismo top-1 vs f32 | 97,99% | - |
| Respuestas correctas (7 items) | 6/7 | - |
| Throughput pp512 | no medido | - |
| Throughput tg128 | no medido | - |

La unica respuesta incorrecta fue un resumen en coreano que conservaba los hechos pero decia "acortado" en lugar de "30 minutos"; la model card atribuye el error al modelo, no a la cuantizacion.

## Requisitos de hardware

- VRAM estimada: 2,44 GB para el fichero Q8_0, mas la cache KV segun la longitud de contexto y 1-2 GB adicionales para el sistema. La model card indica que con 4 GB o mas de memoria se puede usar Q8_0.
- GPU recomendadas: no se especifican modelos concretos; la cuantizacion se genero y evaluo en una NVIDIA H200, pero el modelo esta pensado para CUDA, Metal o CPU.
- GPU de consumo: si, cabe en tarjetas con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp con el parche `aion-llama.cpp.patch` sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333`. Las claves GGUF y el nombre de arquitectura coinciden con el port de AtomicChat, por lo que los ficheros cargan en ambas builds. No se menciona soporte en vLLM, TGI u Ollama.
- Comandos de referencia: `llama-server -m Aion-1.0-Instruct-2.3B-Q8_0.gguf --jinja -c 32768 -ngl 99` y `llama-cli` con los mismos argumentos.
- Latencia y throughput: no medidos en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. A continuacion se comparan solo caracteristicas estructurales conocidas:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B (Xylolabs GGUF) | 2,29B | 32.768 | MIT | Si, Q8_0 con parche |
| Modelos de ~2-3B de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible |
| Modelos de ~2-3B de la familia Llama | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Requiere un parche de llama.cpp: la arquitectura `aion` no esta en upstream, por lo que una build estandar no carga los ficheros. Hay que aplicar `aion-llama.cpp.patch` sobre el commit indicado o usar la build de AtomicChat.
- Necesita `--jinja`: la plantilla de chat embebida escribe el preambulo de sistema con la fecha; sin ese flag el comportamiento puede ser incorrecto.
- Riesgo de alucinacion: en la propia evaluacion manual, el resumen en coreano introdujo un error factual ("acortado" en lugar de "30 minutos"). No hay datos sobre tasas de alucinacion en otros dominios.
- Idiomas: aunque la lista oficial incluye ocho idiomas, la evaluacion cualitativa se hizo en ingles y coreano; el coreano no figura entre los idiomas declarados, lo que genera incertidumbre sobre la cobertura real.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Un solo quant: solo se publica Q8_0, sin opciones Q4_K_M o Q5_K_M que reduzcan aun mas el consumo de memoria.
- Licencia: MIT permite uso comercial, pero el aviso indica que los ficheros estan modificados por Xylolabs (cuantizados y convertidos a GGUF) y que el repositorio no esta afiliado ni respaldado por Microsoft. Hay que conservar el texto de licencia y el NOTICE.
- Sin datos de entrenamiento: no se conoce la composicion del dataset ni si hubo RLHF/DPO, lo que limita la evaluacion de riesgos en produccion.
- Sin soporte documentado de tool calling ni agentes: para pipelines que requieran function calling habria que verificar empiricamente su comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/blob/main/LICENSE
- Parche de llama.cpp: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/aion-llama.cpp.patch
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de referencia de llama.cpp: `e4b620af19f02960dea7a3a81de7c5805aa3a333`
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
