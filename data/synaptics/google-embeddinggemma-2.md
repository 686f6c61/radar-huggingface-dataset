# Synaptics/Google-EmbeddingGemma-2

## Resumen

EmbeddingGemma-2 es un modelo de embeddings multimodal desarrollado por Google que proyecta texto, imagenes, video y audio en un unico espacio vectorial de 768 dimensiones, con soporte de representaciones Matryoshka que permiten truncar la salida a 768, 512, 256 o 128 dimensiones sin reentrenar. Esto permite comparar directamente una consulta de texto con fotogramas de video, imagenes o fragmentos de audio mediante similitud en el mismo espacio.

La ficha que nos ocupa, `Synaptics/Google-EmbeddingGemma-2`, no es el modelo original de Google, sino una compilacion optimizada por Synaptics para sus procesadores de la serie Astra SL2610 con acelerador NPU Torq. El build incluye pesos cuantizados a 4 bits por bloques (tamano de bloque 32, procedentes de la exportacion `*_q4` de `onnx-community/embeddinggemma-2-ONNX`) con activaciones en bf16, y se distribuye como redes compiladas en formato VMFB listas para ejecutarse en la NPU, ademas de una variante bf16 en la rama `bf16` del repositorio.

Es relevante en el contexto actual de IA en el borde (edge AI): demuestra que un modelo de embeddings multimodal se puede ejecutar localmente en hardware de muy bajo consumo, con latencias de cientos de milisegundos a pocos segundos, y sin depender de GPU ni de servicios en la nube. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto de despliegue orientado a hardware especifico mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es `google/embeddinggemma-2`, arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128 y 512 tokens de texto (redes `text_body_s128` y `text_body_s512`); vision a 384x384 px; audio en ventanas de 1,4 / 2,8 / 5,6 / 11,2 s |
| Tipos de cuantizacion | 4 bits por bloques (bloque 32) con activaciones bf16; variante bf16 completa en la rama `bf16` |
| Idiomas soportados | no disponible |
| Licencia | `gemma` |
| Formato de pesos | VMFB (redes compiladas para NPU Torq), NPY (tabla de embeddings, filtros mel), JSON (tokenizer y config). No se distribuyen safetensors ni GGUF |

Especificaciones adicionales:

| Parametro | Valor |
|---|---|
| Dimension de salida | 768, con truncamiento Matryoshka a 512, 256 y 128 |
| Modalidades de entrada | Texto, imagen, video, audio |
| Hardware objetivo | Procesadores Synaptics Astra serie SL2610 con NPU Torq |
| Libreria | `torq` |
| Relacion con el modelo base | `quantized` sobre `google/embeddinggemma-2` y `onnx-community/embeddinggemma-2-ONNX` |
| Tamano del repositorio | 4,9 GB |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Se sabe que `google/embeddinggemma-2` es un modelo de embeddings multimodal que comparte espacio vectorial entre texto, imagen, video y audio, con soporte de representaciones Matryoshka en 768, 512, 256 y 128 dimensiones. No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica de este build concreto reside en la compilacion y el empaquetado para NPU, no en el modelo en si. Synaptics divide el modelo en redes independientes con formas estaticas: un cuerpo de texto en dos longitudes (128 y 512 tokens), un codificador de vision que convierte una imagen o fotograma de 384x384 en 64 tokens suaves, y cuatro codificadores de audio para ventanas de 1,4, 2,8, 5,6 y 11,2 segundos. El front-end de audio (log-mel) y la tabla de embeddings de tokens se ejecutan en CPU, con la tabla mapeada en memoria. Las redes se distribuyen como VMFB con pesos cuantizados a 4 bits por bloques de 32 y activaciones bf16.

## Capacidades

- Generacion de embeddings multimodales: proyecta texto, imagenes, video y audio en un unico espacio de 768 dimensiones.
- Recuperacion cruzada entre modalidades: busqueda de imagen a partir de texto, de texto a partir de audio o de video a partir de una consulta textual.
- Representaciones Matryoshka: permite truncar el vector a 512, 256 o 128 dimensiones para reducir memoria y coste de comparacion, manteniendo parte de la calidad semantica.
- Procesamiento de video: el codificador de vision acepta fotogramas de 384x384 px y los resume en 64 tokens suaves por fotograma.
- Procesamiento de audio: cuatro ventanas temporales (1,4 s, 2,8 s, 5,6 s y 11,2 s) cubren desde clips cortos hasta fragmentos de mas de diez segundos.
- Ejecucion local en NPU: inferencia en el dispositivo sin acceso a red ni a GPU.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica; es un modelo de embeddings, no generativo.
- Modo thinking: no aplica.

## Casos de uso

- Busqueda multimodal en bibliotecas de medios: indexar un catalogo de fotos, videos y audios en vectores de 768 dimensiones y permitir consultas en lenguaje natural que devuelvan fotogramas o clips relevantes. El codificador de vision y los de audio generan las representaciones de cada modalidad en el propio dispositivo.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de cada archivo y agrupar por similitud coseno para detectar fotos repetidas, versiones recodificadas del mismo video o fragmentos de audio equivalentes, usando vectores truncados a 128 dimensiones para acelerar las comparaciones.
- Recuperacion aumentada (RAG) multimodal en el borde: en dispositivos sin conectividad fiable, el modelo puede indexar y recuperar pasajes de texto y contenido visual localmente, con una latencia de 549 ms para consultas de hasta 128 tokens.
- Moderacion y clasificacion de contenido en camaras y dispositivos IoT: comparar fotogramas o audio capturados con vectores de referencia de contenido prohibido, ejecutando el codificador de vision (3,31 s por fotograma) o el de audio (279 ms para ventanas de 1,4 s) en la NPU.
- Sistemas de recomendacion de proximidad: en un kiosco o dispositivo domestico, sugerir contenido a partir de similitud entre una consulta de texto y un catalogo local de imagenes o audio, sin enviar datos a la nube.
- Accesibilidad y descripcion de medios: emparejar descripciones textuales con video o audio para generar indices navegables o etiquetas alternativas, gracias al espacio vectorial compartido entre modalidades.
- Analitica de audio industrial o ambiental: clasificar eventos sonoros por similitud con embeddings de referencia, usando ventanas de hasta 11,2 s (2,67 s de latencia) y un consumo de RAM de 227 MB.
- Indizacion offline de archivos multimedia: procesar grandes volumenes de contenido en dispositivos de bajo consumo (las redes ocupan entre 87 MB y 196 MB en disco) y sincronizar despues los vectores resultantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento facilitados son latencias y consumo de RAM medidos en un Synaptics SL2619, con una red por proceso:

| Red | Latencia | RAM | Tamano de archivo |
|---|---|---|---|
| text S=128 | 549 ms | 122 MB | 87 MB |
| text S=512 | 2825 ms | 140 MB | 103 MB |
| vision 384x384 | 3310 ms | 157 MB | 122 MB |
| audio 1,4 s | 279 ms | 210 MB | 180 MB |
| audio 2,8 s | 600 ms | 211 MB | 181 MB |
| audio 5,6 s | 1337 ms | 217 MB | 186 MB |
| audio 11,2 s | 2670 ms | 227 MB | 196 MB |

Segun la model card, ONNX Runtime con los mismos pesos de 4 bits sobre la CPU de la placa (2 hilos) resulta entre 5,9 y 11,3 veces mas lento: 3,7 s para texto S=128, 21,6 s para vision y 23,3 s para audio de 11,2 s.

## Requisitos de hardware

- VRAM: no aplica. El modelo no esta pensado para GPU; se ejecuta en la NPU Torq de los procesadores Synaptics Astra serie SL2610.
- GPU recomendadas: no disponible. No se documenta ningun despliegue en GPU.
- Cabe en GPU de consumo: no aplica segun la informacion disponible.
- Memoria: entre 122 MB y 227 MB de RAM por red, segun la modalidad y la longitud de entrada; los archivos VMFB ocupan entre 87 MB y 196 MB, y el repositorio completo pesa 4,9 GB.
- CPU: el front-end de audio (log-mel) y la tabla de embeddings de tokens se ejecutan en CPU con la tabla mapeada en memoria. Como referencia, ONNX Runtime con estos pesos en CPU de 2 hilos es entre 5,9 y 11,3 veces mas lento que la NPU.
- Opciones de despliegue: VMFB sobre NPU Torq mediante la libreria `torq`; los ejemplos y demos estan en el repositorio `synaptics-torq/torq-examples`, bajo `Google/Google-EmbeddingGemma-2`, y se instalan con `python setup_demos.py Google-EmbeddingGemma-2`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencias de 549 ms (texto, 128 tokens), 2825 ms (texto, 512 tokens), 3310 ms (vision 384x384), 279 ms (audio 1,4 s), 600 ms (audio 2,8 s), 1337 ms (audio 5,6 s) y 2670 ms (audio 11,2 s). No se proporcionan cifras de throughput.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni de modelos comparables en la informacion disponible, por lo que no es posible establecer una comparativa de rendimiento. Como referencia estructural, se puede comparar con el modelo original del que deriva:

| Modelo | Relacion | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|
| `Synaptics/Google-EmbeddingGemma-2` | Derivado compilado | 4 bits por bloques (bloque 32), activaciones bf16 | NPU Torq en Astra SL2610 | `gemma` |
| `google/embeddinggemma-2` | Modelo base original | no disponible | no disponible | `gemma` |
| `onnx-community/embeddinggemma-2-ONNX` | Exportacion ONNX de origen de los pesos `*_q4` | 4 bits | CPU/GPU via ONNX Runtime | `gemma` |

No se dispone de datos sobre alternativas de otros fabricantes con las que comparar en la misma categoria (embeddings multimodales en el borde).

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y esta publicado como artefacto de despliegue para hardware concreto; no es una distribucion de proposito general.
- Dependencia de hardware: las redes VMFB estan compiladas para la NPU Torq de los procesadores Synaptics Astra serie SL2610. No se documenta su ejecucion en GPU ni en otros aceleradores.
- Formatos no estandar: no se ofrecen pesos en safetensors ni GGUF, lo que complica su uso fuera del ecosistema Torq. La alternativa mas portable es la rama `bf16`, que consume mas memoria.
- Al ser un modelo de embeddings, no genera texto ni mantiene conversaciones; no soporta tool calling ni razonamiento multi-paso.
- Longitud de contexto limitada: el cuerpo de texto solo admite 128 o 512 tokens, muy por debajo de los modelos de embeddings de contexto largo.
- Idiomas soportados: no disponible en la informacion proporcionada, lo que impide garantizar cobertura multilingue.
- Alucinacion: no aplica en el sentido generativo, pero la calidad del ranking por similitud depende de la distribucion de los datos de entrenamiento del modelo base, no documentada.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo ni de equidad para este build.
- Licencia `gemma`: es necesario revisar los terminos de la licencia Gemma de Google antes de cualquier uso comercial, ya que impone condiciones especificas de redistribucion y uso aceptable.
- Latencia de vision elevada: 3310 ms por fotograma de 384x384 px, lo que limita el procesamiento de video a flujos de baja frecuencia de muestreo.
- Peso del repositorio: 4,9 GB, una cifra considerable para un dispositivo de borde si se despliegan todas las redes simultaneamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Synaptics/Google-EmbeddingGemma-2
- Rama bf16: https://huggingface.co/Synaptics/Google-EmbeddingGemma-2/tree/bf16
- Modelo base original: https://huggingface.co/google/embeddinggemma-2
- Exportacion ONNX de origen: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Repositorio de ejemplos y demos Torq: https://github.com/synaptics-torq/torq-examples
- Synaptics AI Developer Zone: https://developer.synaptics.com
- Portal de soporte Astra: https://synacsm.atlassian.net/servicedesk/customer/portal/543
- Sitio corporativo de Synaptics: https://www.synaptics.com/
- Synaptics en Wikipedia: https://en.wikipedia.org/wiki/Synaptics
