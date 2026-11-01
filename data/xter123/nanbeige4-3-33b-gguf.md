# XTer123/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de gran tamano desarrollado por el equipo Nanbeige, con 33.118.977.024 parametros totales (aproximadamente 33,1 mil millones). Esta ficha describe concretamente la cuantizacion GGUF Q5_K_M publicada por el usuario XTer123, derivada de los pesos originales en BF16 mediante cuantizacion con matriz de importancia (imatrix). El modelo esta disenado para generacion de texto conversacional y soporta un modo de razonamiento explicito ("thinking mode") configurable.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 33B con una ventana de contexto declarada de 262.144 tokens en una unica GPU A100 de 40 GB, gracias a la combinacion de cuantizacion Q5_K_M de los pesos y cache KV en Q4. Esto lo situa en el rango de modelos de gran contexto utilizables en hardware de un solo acelerador, algo poco habitual en esta clase de tamano.

La licencia Apache 2.0 y el soporte de llama.cpp con plantilla de chat Jinja lo hacen directamente desplegable en entornos de produccion sin restricciones comerciales adicionales. Los idiomas declarados son chino (zh) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalle en la informacion proporcionada) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun configuracion de ejemplo del autor de la cuantizacion) |
| Tipos de cuantizacion | GGUF Q5_K_M (imatrix); cache KV en Q4 (q4_0) en el ejemplo |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Nanbeige4.3-33B-Q5_K_M.gguf`, 23,50 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Nanbeige4.3-33B en los datos proporcionados: no se especifica si emplea attention lineal, decodificacion especulativa, mezcla de expertos ni el esquema exacto de atencion. El recuento de parametros (33,1B) y el hecho de que se distribuya como un unico fichero GGUF de 23,50 GB apuntan a un transformer denso estandar, pero esto no se confirma en la documentacion disponible.

Respecto al entrenamiento, la model card de esta cuantizacion no incluye datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo unico documentado es el proceso de cuantizacion: conversion desde los pesos originales en BF16 con ajuste de los metadatos del tokenizer para llama.cpp, aplicacion de matriz de importancia (imatrix) y preservacion de la plantilla de chat original. El modelo incorpora un modo de razonamiento ("thinking") que puede activarse o desactivarse mediante `enable_thinking` y conservarse en el historial con `preserve_thinking`.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Modo de razonamiento explicito ("thinking mode") activable por parametro, con opcion de preservar el rastro de razonamiento en el contexto.
- Soporte de plantilla de chat Jinja compatible con llama.cpp (`--jinja`), lo que habilita el formateo correcto de roles y del modo thinking.
- Uso de herramientas (tool use): la model card remite a la configuracion de tool-use del modelo original, lo que implica soporte previsto, aunque los detalles no se reproducen aqui.
- Contexto largo de hasta 262.144 tokens en la configuracion de referencia.
- Capacidades multilingues limitadas a chino e ingles segun los metadatos.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o bases de codigo completas y responder preguntas sobre ellos sin fragmentacion, usando llama.cpp con cache KV cuantizada en Q4.
- Asistentes conversacionales de dominio en chino e ingles: la plantilla de chat y el modo thinking permiten construir dialogos multi-turno donde el modelo razona antes de responder y conserva el razonamiento previo si se activa `preserve_thinking`.
- Procesamiento por lotes en una sola GPU: al caber en una A100 de 40 GB con Q5_K_M, es viable desplegar un unico nodo para tareas de generacion masiva sin infraestructura multi-GPU.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 permite integracion en productos comerciales, incluida la redistribucion del fichero GGUF con atribucion.
- Razonamiento asistido en pipelines de datos: el modo thinking desactivable permite alternar entre respuestas rapidas (thinking off) y respuestas con cadena de razonamiento (thinking on) segun el coste aceptable por peticion.
- Prototipado local y evaluacion: al ser un GGUF ejecutable con llama-cli, sirve para pruebas de calidad y comparativas antes de comprometerse con el modelo original en BF16 o con un despliegue en vLLM/TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 23,50 GB; con cache KV en Q4 y contexto de 262.144 tokens, el autor lo ejecuto en una A100 de 40 GB. A contextos menores la VRAM necesaria se reduce de forma proporcional al tamano de la cache.
- GPU validadas: A100 40 GB (configuracion de referencia del autor). No se documentan pruebas en otras GPU.
- GPU consumer: no hay confirmacion de ejecucion en RTX 4090 (24 GB) con contexto completo; los pesos solos (23,50 GB) ya consumen casi toda la VRAM de una 4090, por lo que solo seria viable con contexto muy reducido o con una cuantizacion menor no publicada en este repo.
- Opciones de despliegue: llama.cpp (build reciente con CUDA), con flags `-ngl 99`, `-ctk q4_0 -ctv q4_0`, `-fa on` (flash attention), `-b 128 -ub 32`, `-np 1` y `--jinja`.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria, por lo que no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos: no documentados en la informacion disponible; al estar entrenado principalmente en chino e ingles, puede presentar sesgos culturales y linguisticos propios de esos corpus.
- Alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en modo thinking desactivado.
- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano u otras lenguas no esta garantizado ni evaluado.
- Contexto: los 262.144 tokens corresponden a la configuracion de ejemplo del autor de la cuantizacion; no se confirma que el modelo base haya sido entrenado para esa longitud ni que mantenga calidad en todo el rango.
- Cuantizacion: Q5_K_M introduce perdida de precision respecto a BF16; no se han publicado comparativas de calidad entre ambas versiones.
- Produccion: la cuantizacion la publica un tercero (XTer123) para uso personal, no el equipo Nanbeige; para cargas criticas conviene validar contra los pesos originales.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribucion al equipo Nanbeige y al autor de la cuantizacion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/XTer123/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
