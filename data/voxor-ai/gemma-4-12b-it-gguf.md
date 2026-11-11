# voxor-ai/gemma-4-12b-it-gguf

## Resumen

Gemma 4 12B instruct es un modelo de lenguaje desarrollado por Google DeepMind, distribuido aqui en formato GGUF por el usuario voxor-ai. Se trata de la version instruct (ajustada para seguir instrucciones) de la cuarta generacion de la familia Gemma, con 12.000 millones de parametros. El repositorio de voxor-ai no es el modelo original, sino una conversion a formato GGUF pensada para su ejecucion en herramientas de inferencia local como llama.cpp u Ollama, con el objetivo de facilitar el despliegue en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio ofrece dos variantes de cuantizacion concretas: una en Q8_0 (8 bits) y otra en Q4_0 con cuantizacion consciente del entrenamiento (QAT), que reduce el peso a aproximadamente 4 bits manteniendo una calidad cercana a la original. El tamano del repositorio (7,0 GB) es coherente con la presencia de ambas variantes comprimidas con zstd, lo que obliga a descomprimir los ficheros antes de usarlos.

No se dispone de informacion publicada en este repositorio sobre la longitud de contexto, los idiomas soportados ni los resultados de benchmarks. La model card se limita a indicar la procedencia del modelo base, los nombres de fichero y la licencia Apache 2.0. Cualquier dato adicional sobre arquitectura o entrenamiento debe consultarse en la ficha del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-12B-it) |
| Parametros totales | 12 000 millones (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_0 (QAT) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros comprimidos con zstd, extension `.zst`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base google/gemma-4-12B-it. Por la denominacion y la tradicion de la familia Gemma, cabe esperar un transformer decoder-only, pero este dato no se confirma en la model card del repositorio. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Todo ello debe consultarse en la documentacion oficial del modelo base de Google.

La innovacion tecnica destacable de este repositorio es la inclusion de una variante cuantizada con QAT (quantization-aware training) en Q4_0, que permite reducir el modelo a aproximadamente 4 bits por parametro con una perdida de calidad menor que la de una cuantizacion post-entrenamiento equivalente. Ademas, los ficheros superiores a 1 MB se distribuyen comprimidos con zstd, lo que reduce el ancho de banda de descarga pero anade un paso de descompresion antes de la inferencia.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, por tratarse de una variante instruct del modelo base.
- Razonamiento y respuesta a preguntas en formato conversacional (presumible, no documentado en el repositorio).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: la variante Q4_0 (QAT) permite ejecutar un modelo de 12B en GPUs de consumo con 8-12 GB de VRAM, lo que facilita prototipado sin depender de APIs externas.
- Despliegue en servidores sin GPU dedicada: la variante Q8_0 puede ejecutarse en CPU con llama.cpp, adecuada para entornos de desarrollo o pruebas de integracion con latencia no critica.
- Asistentes conversacionales autoalojados: al ser un modelo instruct en formato GGUF, se integra en Ollama o llama.cpp para construir chatbots locales con control total sobre los datos.
- Generacion de texto en pipelines offline: util para procesamiento por lotes de documentos en entornos con requisitos de privacidad, donde no se permite enviar datos a servicios en la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece Q8_0 y Q4_0 QAT del mismo modelo, lo que permite medir empiricalmente la degradacion de calidad entre ambas variantes en tareas propias.
- Educacion e investigacion: sirve como base para experimentos de cuantizacion, ajuste fino ligero o analisis de comportamiento de modelos de 12B en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 12-13 GB solo para los pesos, mas overhead de contexto y cache KV; se recomienda una GPU con 16 GB o mas.
- VRAM estimada para Q4_0 (QAT): en torno a 6-7 GB para los pesos; cabe en GPUs de consumo con 8 GB o mas, con margen limitado para contexto largo.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para la variante Q8_0 con contexto amplio; RTX 4060 Ti 16 GB, RTX 4070 o superiores para Q4_0.
- Cabe en GPU de consumo: si, especialmente la variante Q4_0 en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| voxor-ai/gemma-4-12b-it-gguf | 12B | no disponible | Apache 2.0 | GGUF (Q8_0, Q4_0 QAT) | Hugging Face |
| google/gemma-4-12B-it | 12B | no disponible | Apache 2.0 | safetensors (presumible) | Hugging Face |
| Alternativas de 12B en GGUF | no disponible | no disponible | no disponible | GGUF | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no documenta sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; deben asumirse los del modelo base google/gemma-4-12B-it.
- Los ficheros estan comprimidos con zstd (`.zst`) y deben descomprimirse antes de cargarlos en el runner de inferencia; obviar este paso provoca errores de carga.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio y las condiciones del modelo base de Google.
- La cuantizacion Q4_0 (QAT) introduce una degradacion de calidad respecto a Q8_0; para tareas sensibles a la precision conviene validar con evaluaciones propias.
- No hay informacion sobre la longitud de contexto soportada en formato GGUF, lo que impide planificar despliegues con ventanas largas sin consultar el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voxor-ai/gemma-4-12b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
