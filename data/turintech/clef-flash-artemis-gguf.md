# turintech/Clef-Flash-Artemis-GGUF

## Resumen

Clef-Flash-Artemis-GGUF es una conversion a formato GGUF del modelo Cloudflare/clef-flash, publicada por TurinTech. No se trata de un modelo generativo al uso: Clef-Flash es un modelo de decision de 9B que recibe texto (y opcionalmente imagenes) junto con un conjunto de preguntas tipadas y devuelve, en una sola pasada, una probabilidad para cada respuesta permitida en lugar de generar texto libre. TurinTech ha aplicado tecnicas de compresion desarrolladas por su plataforma de optimizacion de codigo Artemis para reducir el peso del modelo manteniendo el comportamiento del original.

El problema que resuelve es de despliegue: el original en BF16 ocupa 18,2 GB y requiere 16,5 GiB de memoria de GPU, lo que lo deja fuera de tarjetas de 16 GB. El archivo por defecto de esta conversion pesa 4,94 GB (un 73 % menos) y necesita 5,5 GiB medidos en una NVIDIA A100, manteniendo la misma respuesta que el original en el 95,0 % de 2.000 decisiones de prueba en CPU (94,1 % en A100).

La relevancia actual esta en que permite ejecutar un modelo multimodal de 9B para clasificacion y decision estructurada en hardware de consumo, usando llama.cpp estandar sin compilaciones personalizadas. Los pesos estan bajo licencia Apache 2.0 y la conversion es independiente de Cloudflare, sin afiliacion ni respaldo por su parte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cloudflare/clef-flash, 9B) |
| Parametros totales | 9.075.566.084 (~9B) |
| Parametros activos | no aplicable (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible (el contexto de entrenamiento es superior a 16.384 tokens; el valor exacto no se indica) |
| Tipos de cuantizacion | GGUF cuantizado para llama.cpp; los archivos se identifican por tamano (4,94 GB, 4,52 GB, 4,14 GB y 3,65 GB), no se detalla el esquema de cuantizacion exacto |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en GGUF BF16 (mmproj-Clef-Flash-BF16.gguf) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base Cloudflare/clef-flash mas alla de que se trata de un modelo de 9B y que es multimodal (procesa texto e imagenes). El modelo no genera texto: ante una peticion con un estado (`state`) y un conjunto de preguntas tipadas (`questions`), devuelve una probabilidad por cada respuesta permitida en una sola pasada. Las preguntas usan tipos estructurados como `noul` (si/no) descritos en el formato Jev/SystemOne de la model card original.

El trabajo de TurinTech se limita a la conversion y cuantizacion de los pesos originales en BF16 a GGUF para su uso con llama.cpp. Cada archivo fue validado comparandolo con el original BF16 y con builds publicos, con ajustes identicos de llama.cpp, sobre un conjunto de 2.000 decisiones tipadas (preguntas de tipo si/no, eleccion unica y puntuacion) del split de test de LocalLLaMA/typed-decisions, 1.000 decisiones adicionales del split de train no usadas para fabricar los archivos, una muestra estratificada de 300 elementos y 330 preguntas con imagen. Segun el autor, ningun archivo cambio una respuesta de la que el original estuviera mas de un 80 % seguro en ninguna de las maquinas probadas.

## Capacidades

- Decision estructurada: devuelve probabilidades para cada respuesta permitida de un conjunto de preguntas tipadas, en lugar de texto generado.
- Clasificacion multimodal: acepta texto y, mediante el proyector de vision, imagenes codificadas como data URLs en un array `images` de nivel superior.
- Preguntas con tipo: soporta al menos respuestas de tipo si/no (`noul`), eleccion unica y puntuacion, segun la validacion descrita.
- Modo conversacional: la etiqueta `conversational` figura entre las etiquetas del repositorio.
- Integracion via API compatible con endpoints: el servidor llama.cpp expone el endpoint `/v1/systemone` para el formato Jev/SystemOne.
- No dispone de generacion de texto libre, tool calling, function calling ni razonamiento multi-paso segun la informacion disponible; no es un modelo de proposito general.

## Casos de uso

- Triaje de soporte tecnico: enviar el texto de un ticket con preguntas tipadas sobre urgencia, categoria o sentimiento permite obtener probabilidades por respuesta sin generar texto, lo que encaja en un pipeline de enrutado automatico. El endpoint `/v1/systemone` devuelve la decision en una sola llamada.
- Clasificacion de mensajes entrantes: con preguntas de tipo si/no se puede etiquetar correo o formularios (por ejemplo, deteccion de intencion de cancelacion) y usar la probabilidad como umbral para escalado humano.
- Moderacion de contenido con imagenes: al admitir entrada visual mediante el proyector mmproj, permite clasificar publicaciones con imagen y texto combinados aplicando preguntas tipadas de politica de contenido.
- Analisis de documentos con preguntas fijas: sobre un texto largo, plantear un conjunto de preguntas de puntuacion para extraer valoraciones normalizadas sin necesidad de un generador.
- Enrutado en atencion al cliente: clasificar la intencion de un mensaje y la urgencia para dirigirlo al equipo adecuado, ejecutandose en una GPU de 8 GB o incluso en CPU.
- Despliegue en el borde (edge): al caber en 5,5 GiB segun las medidas del autor, es viable ejecutar la clasificacion en servidores con GPU modesta o solo CPU, algo inviable con el BF16 original de 18,2 GB.
- Evaluacion de imagenes en pipelines de vision: las 330 preguntas con imagen usadas en la validacion demuestran el uso del modelo para tareas de decision sobre imagenes y texto simultaneamente.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks academicos (MMLU, HumanEval, GSM8K), sino comparaciones de fidelidad entre las cuantizaciones y el modelo original BF16. Se reproducen a continuacion tal como aparecen en la model card.

| Archivo | Tamano | Reduccion frente al original | Misma respuesta que el original | Cambio de precision | Respuestas seguras cambiadas | Uso recomendado |
|---|---|---|---|---|---|---|
| Original BF16 (Cloudflare/clef-flash) | 18,2 GB | referencia | referencia | referencia | referencia | Referencia |
| Clef-Flash-Artemis-4.9GB.gguf | 4,94 GB | 73 % | 95,0 % | -0,1 | 0 | Por defecto |
| Clef-Flash-Artemis-4.5GB.gguf | 4,52 GB | 75 % | 95,0 % | -0,8 | 0 | Algo mas pequeno |
| Clef-Flash-Artemis-4.1GB.gguf | 4,14 GB | 77 % | 93,7 % | -1,4 | 0 | Memoria ajustada |
| Clef-Flash-Artemis-3.6GB.gguf | 3,65 GB | 80 % | 90,8 % | -1,7 | 0 | El mas pequeno |

Comparacion con builds publicos en las mismas pruebas:

| Archivo | Tamano | Misma respuesta | Cambio de precision |
|---|---|---|---|
| Clef-Flash-Artemis-3.6GB.gguf | 3,65 GB | superior al IQ3_M en test y held-out | -1,7 |
| Q4_K_M de ggml-org | 6,49 GB | 96,5 % | +0,3 |
| IQ3_M de bartowski | 4,85 GB | 89,5 % | -2,0 |

Resultados por hardware para el archivo de 4,9 GB: en CPU mantiene la misma respuesta en el 95,0 % de 2.000 decisiones con un cambio de precision de -0,1; en A100 la coincidencia es del 94,1 % con un cambio de -1,0. La validacion incluye 2.000 decisiones del split de test, 1.000 del split de train (held-out), una muestra estratificada de 300 elementos y 330 preguntas con imagen. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- Memoria estimada para el archivo por defecto (4,9 GB): 5,5 GiB de memoria de GPU, medido en una NVIDIA A100.
- El original BF16 requiere 16,5 GiB, por encima de lo que ofrece una tarjeta de 16 GB; los archivos Artemis reducen ese requisito hasta en un 73 % en el caso de 4,94 GB.
- Cabe en GPU de consumo: con 5,5 GiB de pico, es compatible con tarjetas de 8 GB (por ejemplo, RTX 3070, RTX 4060) y, con los archivos mas pequenos, con configuraciones aun mas ajustadas.
- Ejecucion en CPU validada como opcion realista: las metricas de fidelidad del 95,0 % se midieron en CPU.
- Despliegue mediante llama.cpp estandar (`llama-server`), sin compilacion personalizada. Se necesita llama.cpp del 9 de octubre de 2026 o posterior; probado en el commit `1e6f04a` y en la release `b11572` (12 de octubre de 2026).
- Comando recomendado para texto: `llama-server -m Clef-Flash-Artemis-4.9GB.gguf --port 8080 -c 16384 -ub 4096 -b 4096`. Es importante mantener `-ub 4096 -b 4096`, porque con el valor por defecto de 512 el endpoint `/v1/systemone` rechaza entradas de mas de 512 tokens (esto afecta a todos los GGUF de Clef, incluidos los publicos).
- Para imagenes hay que anadir el proyector de vision `mmproj-Clef-Flash-BF16.gguf` de ggml-org/Clef-Flash-GGUF y subir el tamano de lote: `-ub 8192 -b 8192`, ya que varias imagenes grandes pueden superar los 4.096 tokens.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

No se dispone de comparativas frente a otros modelos de decision equivalentes. La unica comparacion disponible es contra el propio modelo base y contra otras cuantizaciones GGUF del mismo modelo:

| Modelo / archivo | Parametros | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turintech/Clef-Flash-Artemis-GGUF (4.9GB) | ~9B | 4,94 GB | no disponible | apache-2.0 | HuggingFace (TurinTech) |
| Cloudflare/clef-flash (BF16) | ~9B | 18,2 GB | no disponible | apache-2.0 | HuggingFace (Cloudflare) |
| ggml-org Q4_K_M de Clef-Flash | ~9B | 6,49 GB | no disponible | apache-2.0 | HuggingFace (ggml-org) |
| bartowski IQ3_M de Clef-Flash | ~9B | 4,85 GB | no disponible | apache-2.0 | HuggingFace (bartowski) |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Al ser un modelo de decision entrenado para preguntas tipadas, puede heredar sesgos del modelo base Cloudflare/clef-flash.
- Riesgo de alucinacion: el modelo no genera texto, sino probabilidades sobre respuestas permitidas, por lo que el riesgo se traslada a decisiones erroneas o mal calibradas, no a texto inventado. En el archivo de 4,9 GB la coincidencia con el original es del 95,0 %, lo que implica que aproximadamente una de cada veinte decisiones puede diferir del modelo de referencia.
- Degradacion por cuantizacion: los archivos mas agresivos pierden fidelidad (el de 3,6 GB baja al 90,8 % de coincidencia y -1,7 de precision). No se recomienda usar los archivos mas pequenos en produccion si la exactitud es critica.
- Limitacion de longitud de entrada: con los ajustes por defecto de llama.cpp el endpoint `/v1/systemone` rechaza entradas de mas de 512 tokens; hay que configurar `-ub` y `-b` a 4096 (u 8192 para imagenes).
- Dependencia de version: requiere llama.cpp del 9 de octubre de 2026 o posterior; versiones anteriores no estan soportadas.
- Soporte de idiomas no declarado: la model card no especifica que idiomas cubre el modelo.
- Licencia: Apache 2.0, que permite uso comercial, pero la conversion es independiente y no esta respaldada por Cloudflare.
- Uso restringido a clasificacion y decision: no es un modelo generativo y no debe emplearse para tareas de generacion de texto, codigo o razonamiento abierto.
- Contexto de entrenamiento: la longitud exacta de contexto no se publica; solo se sabe que es superior a 16.384 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/Clef-Flash-Artemis-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Proyector de vision y GGUF publicos: https://huggingface.co/ggml-org/Clef-Flash-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- TurinTech: https://turintech.ai
- Demo / contacto comercial: https://www.turintech.ai/book-a-demo
