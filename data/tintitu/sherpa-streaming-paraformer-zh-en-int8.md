# tintitu/sherpa-streaming-paraformer-zh-en-int8

## Resumen

`tintitu/sherpa-streaming-paraformer-zh-en-int8` es un repositorio de pesos para reconocimiento automatico del habla (ASR) en streaming, bilingue chino-ingles, publicado en HuggingFace por el usuario `tintitu`. No se trata de un modelo entrenado por el autor: la propia model card indica explicitamente que es "una version organizada de los ficheros del modelo upstream, no un nuevo resultado de entrenamiento". El modelo original procede del proyecto `k2-fsa/sherpa-onnx`, en su release `2024-03-10`.

El modelo es una variante online (streaming) de la arquitectura Paraformer, distribuida en formato ONNX con cuantizacion INT8 en dos ficheros separados (`encoder.int8.onnx` y `decoder.int8.onnx`) mas el vocabulario `tokens.txt`. Esta pensado para entrada de audio a 16 kHz y reconocimiento de voz continua, es decir, va emitiendo hipotesis mientras llega el audio en lugar de esperar a que termine la frase completa. El tamano del repositorio es de 0,2 GB, muy inferior a los 1.047.319.737 bytes (aproximadamente 1,05 GB) del artefacto upstream completo, lo que sugiere que este repositorio contiene unicamente el subconjunto INT8.

La relevancia practica de este tipo de modelos es su coste de despliegue: con pesos INT8 de unos 200 MB, es viable ejecutar ASR bilingue en CPU, en dispositivos de borde o en movil mediante `sherpa-onnx`. Ahora bien, el repositorio no declara licencia, no aporta benchmarks y no especifica la procedencia legal de los pesos, por lo que antes de usarlo en produccion hay que verificar la licencia del upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Online Paraformer (ASR en streaming, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR en streaming, procesa audio por fragmentos; no se especifica el tamano de chunk) |
| Tipos de cuantizacion | INT8 (ficheros `encoder.int8.onnx` y `decoder.int8.onnx`) |
| Idiomas soportados | chino (中文) e ingles |
| Licencia | no disponible; el autor indica explicitamente que no debe asumirse Apache-2.0 ni ninguna otra sin verificar la licencia del upstream |
| Formato de pesos | ONNX (INT8) + `tokens.txt` |
| Frecuencia de muestreo de entrada | 16 kHz |
| Tamano del repositorio | 0,2 GB |
| Tamano del artefacto upstream | 1.047.319.737 bytes |
| SHA256 del artefacto upstream | `5462a1fce42693deae572af1e8c4687124b12aa85fe61ff4d3168bb5280e205f` |
| Version upstream | `2024-03-10` |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como "Online Paraformer", con idiomas chino e ingles, frecuencia de 16 kHz y cuantizacion INT8. La familia Paraformer es una arquitectura de ASR no autorregresiva que sustituye la decodificacion token a token por una prediccion de longitud (predictor tipo CIF) y una decodificacion en paralelo; la variante "online" adapta ese esquema a un flujo continuo de audio con atencion en cache. Esta descripcion corresponde al linaje arquitectonico de la familia y no a datos aportados por la model card del repositorio, que no detalla capas, dimensiones ni mecanismos concretos.

No hay informacion sobre el entrenamiento: no se indican tokens de audio procesados, composicion del dataset, uso de RLHF/DPO ni ninguna otra etapa de ajuste. La model card tambien aclara que el repositorio no aporta ningun entrenamiento nuevo, solo la reorganizacion de ficheros ya publicados por `k2-fsa/sherpa-onnx`. La unica transformacion documentada respecto al original es la cuantizacion a INT8 y la separacion en dos grafos ONNX (encoder y decoder).

## Capacidades

- Reconocimiento de voz continuo en streaming sobre audio de 16 kHz, con emision incremental de hipotesis.
- Reconocimiento bilingue chino-ingles en un unico modelo, sin especificar mecanismo de deteccion de idioma ni soporte explicito de code-switching dentro de una misma frase.
- Exportacion a ONNX, lo que permite ejecucion con `onnxruntime` fuera de frameworks de entrenamiento.
- Cuantizacion INT8, orientada a reducir el consumo de memoria y acelerar la inferencia en CPU.
- Distribucion de vocabulario mediante `tokens.txt`, integrable en los decodificadores del ecosistema `sherpa-onnx`.
- No se documenta soporte de tool calling, agentes, vision, audio de salida, puntuacion, diarizacion ni marcas de tiempo; tales capacidades deben considerarse no disponibles en la informacion proporcionada.

## Casos de uso

- Subtitulado en directo: al ser un modelo online, puede generar subtitulos mientras se reproduce el audio, sin necesidad de esperar al final del fragmento, lo que encaja en emisiones, webinars o retransmisiones bilingues chino-ingles.
- Transcripcion de reuniones con participantes que alternan chino e ingles: el modelo cubre ambos idiomas con un unico conjunto de pesos, lo que evita encadenar dos motores ASR y simplifica el pipeline.
- Atencion al cliente telefónica: al trabajar con audio a 16 kHz, formato habitual en telefonia tras remuestreo, y ocupar unos 200 MB en INT8, se puede desplegar en servidores de CPU sin GPU dedicada para transcribir llamadas en tiempo real.
- Asistentes de voz e IVR: la inferencia en streaming permite cerrar el bucle de reconocimiento antes de que el usuario termine la frase, requisito habitual en sistemas de dialogo interactivo.
- Aplicaciones moviles y de borde: el formato ONNX INT8 y el soporte de `sherpa-onnx` en Android, iOS y dispositivos embebidos permiten transcripcion local sin enviar audio a la nube, util para dictado de notas o asistentes offline.
- Analitica de contact center: transcripcion por lotes con `onnxruntime` para extraer texto de grabaciones y alimentar clasificadores de intencion o sistemas de cumplimiento normativo.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en contenido audiovisual en chino o ingles.
- Indexacion y busqueda de archivos de audio: conversion de grabaciones largas a texto para hacerlas recuperables por buscador interno.
- Preprocesado en pipelines multimodales: usar las transcripciones como entrada de un LLM posterior para resumen o extraccion de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones con otros sistemas, y los resultados de la busqueda web proporcionada no contienen datos tecnicos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos INT8 ocupan aproximadamente 0,2 GB (tamano del repositorio), a lo que hay que sumar el consumo del runtime y los buffers de audio.
- GPU: no se especifica ninguna GPU recomendada. Para un modelo de este tamano, una GPU de gama media o incluso integrada es mas que suficiente; GPU de datacenter como A100 o H100 no aportan ventaja significativa frente a CPU en este rango de tamano.
- Cabe en GPU de consumo: si, con margen amplio, incluida cualquier RTX reciente e incluso GPUs integradas.
- Inferencia en CPU: es el escenario natural del modelo, dado el formato ONNX INT8. No requiere GPU.
- Despliegue: `sherpa-onnx` (C++/Python/Kotlin/Swift), `onnxruntime` directamente, o integracion en aplicaciones moviles y embebidas mediante los bindings oficiales del proyecto upstream.
- Latencia y throughput: no disponibles. Dependen del chunk configurado, del numero de hilos de CPU y del hardware; ninguno de estos parametros se especifica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Streaming | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| tintitu/sherpa-streaming-paraformer-zh-en-int8 | Online Paraformer | Si | chino, ingles | no disponible | ONNX INT8 | HuggingFace (0 descargas) |
| sherpa-onnx-streaming-paraformer-bilingual-zh-en (upstream) | Online Paraformer | Si | chino, ingles | consultar en el proyecto `k2-fsa/sherpa-onnx` | ONNX (INT8 y otros) | Release oficial de GitHub |
| sherpa-onnx streaming zipformer bilingue | Zipformer | Si | chino, ingles | consultar en el proyecto `k2-fsa/sherpa-onnx` | ONNX | Release oficial de GitHub |
| OpenAI Whisper (modelo no streaming) | Transformer encoder-decoder | No nativo (requiere troceado manual) | multilingue amplio | MIT (segun el repositorio de OpenAI) | safetensors, GGUF y otras conversiones | HuggingFace y repositorio oficial |

No se dispone de datos de rendimiento comparado (WER/CER) entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Licencia no declarada: la model card advierte explicitamente de que no debe asumirse Apache-2.0 ni ninguna otra licencia, y de que hay que verificar los terminos del proyecto upstream antes de redistribuir o usar comercialmente los pesos y el vocabulario.
- Repositorio no validado: cero descargas y cero likes, publicado por un tercero distinto del proyecto original. Se recomienda fijar un commit concreto y verificar el SHA256 indicado antes de usarlo.
- Fidelidad de la copia: el SHA256 y el tamano documentados corresponden al artefacto upstream completo (1,05 GB), mientras que el repositorio local ocupa 0,2 GB. Conviene comprobar que los ficheros INT8 incluidos coinciden con los del release oficial.
- Riesgo de errores de transcripcion: como cualquier sistema ASR, puede producir sustituciones, omisiones e inserciones, especialmente con ruido de fondo, solapamiento de hablantes, acentos marcados o vocabulario tecnico y nombres propios.
- Cambio de idioma dentro de una frase: aunque el modelo es bilingue, la informacion disponible no detalla como se comporta ante code-switching intra-frase, un caso frecuente en habla real chino-ingles.
- Cuantizacion INT8: es esperable una cierta perdida de precision frente a los pesos en coma flotante del mismo modelo; no se aportan mediciones de esa degradacion.
- Cobertura de idiomas limitada a chino e ingles; no se documentan otros idiomas ni variedades dialectales.
- Compromiso latencia-precision en streaming: los modelos online suelen obtener peor exactitud que sus equivalentes offline, y el tamano de chunk elegido afecta tanto a la latencia como a la calidad.
- Requisitos de entrada: audio a 16 kHz; cualquier fuente a otra frecuencia debe remuestrearse previamente.
- Ausencia de benchmarks: no hay WER publicado en la informacion disponible, por lo que cualquier decision de adopcion deberia acompanarse de una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tintitu/sherpa-streaming-paraformer-zh-en-int8
- Proyecto upstream sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentacion upstream: https://k2-fsa.github.io/sherpa/onnx/index.html
- Descarga del modelo original (release `2024-03-10`): https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-paraformer-bilingual-zh-en.tar.bz2
