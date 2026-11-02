# zecchan/kokonoe-qwen38-mtp-q4km

## Resumen

`zecchan/kokonoe-qwen38-mtp-q4km` es una redistribucion curada en formato GGUF de una cuantizacion Q4_K_M del modelo Qwen3.8 27B TURBO, un fine-tune publicado originalmente por DavidAU bajo el nombre completo `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF`. El repositorio no introduce modificaciones en los pesos: su proposito es empaquetar unicamente el fichero de pesos cuantizado y el proyector multimodal en F16, evitando que las infraestructuras de despliegue tengan que descargar la coleccion completa de cuantizaciones del repositorio original.

El modelo base declarado es de 27B parametros, aunque el campo de parametros de safetensors del repositorio indica 460.730.096, un dato que no es coherente con un modelo de ese tamano y que probablemente refleja un recuento parcial o erroneo. La distribucion esta pensada para ejecutarse con llama.cpp (incluye instrucciones para `llama-server` con `--flash-attn`, `--jinja` y `--ctx-size 32768`) y para despliegues serverless en RunPod mediante el proyecto Kokonoe del propio autor de la redistribucion.

Su relevancia es practica: reduce el coste de almacenamiento y de tiempo de arranque en entornos de inferencia efimeros, y agrupa pesos y proyector multimodal en un unico artefacto listo para servir. Al ser una redistribucion, toda la documentacion autoritativa, los detalles de entrenamiento y el soporte residen en el repositorio original de DavidAU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo Qwen; no se detalla en la informacion proporcionada) |
| Parametros totales | 27B declarados en la model card; el campo de safetensors indica 460.730.096 (dato inconsistente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo de llama.cpp (`--ctx-size 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-MTP-Q4_K_M.gguf` + `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas. La model card de esta redistribucion remite explicitamente al repositorio original de DavidAU para esos detalles y no los reproduce. El sufijo "MTP" del nombre del fichero sugiere multi-token prediction, y el nombre original incluye terminos como "Heretic", "Uncensored" y "NEO-CODER", que apuntan a un fine-tune orientado a reducir rechazos y reforzar generacion de codigo, pero no hay documentacion tecnica en la informacion proporcionada que lo confirme.

El unico detalle tecnico verificable es el de despliegue: el modelo se sirve con llama.cpp, con soporte de proyector multimodal separado (`--mmproj mmproj-F16.gguf`), atencion flash (`--flash-attn on`), plantillas Jinja (`--jinja`), cache de valores en F16 (`--cache-type-v f16`) y descarga completa de capas en GPU (`-ngl 999`). El tamano del repositorio es de 19,4 GB, coherente con un Q4_K_M de un modelo de ~27B mas el proyector.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento y generacion de codigo, segun la orientacion declarada en el nombre del modelo original ("NEO-CODER").
- Procesamiento multimodal de imagenes: el repositorio incluye `mmproj-F16.gguf` y el ejemplo de arranque lo carga, por lo que se contempla entrada visual.
- Soporte de plantillas de chat via `--jinja` en llama.cpp.
- Modo "uncensored" declarado en el nombre original, orientado a reducir rechazos en dominios sensibles.
- Tool calling y comportamiento agentico: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue serverless en RunPod: el repositorio reducido permite que la infraestructura descargue solo el fichero Q4_K_M y el proyector, en lugar de procesar una coleccion completa de cuantizaciones, lo que acorta el arranque en frio y reduce costes de almacenamiento.
- Servicio de chat multimodal autohospedado: con `llama-server` y `--mmproj` se puede exponer una API compatible con OpenAI que acepte texto e imagenes, adecuada para prototipos internos.
- Asistencia a la programacion en local: la orientacion "NEO-CODER" del modelo original lo hace candidato para autocompletado y explicacion de codigo en entornos con GPU de gama alta de consumo, usando Q4_K_M para ajustar VRAM.
- Generacion de contenido sin filtros estrictos: el caracter "uncensored" declarado lo hace util para investigacion sobre seguridad de modelos, red teaming y evaluacion de comportamientos frente a prompts adversarios.
- Procesamiento de documentos con contexto medio: los 32.768 tokens configurados permiten resumir y extraer informacion de contratos, informes o transcripciones de longitud moderada en una sola pasada.
- Base para fine-tuning y experimentacion: al estar en GGUF y con licencia Apache 2.0, sirve como referencia de evaluacion comparativa frente a otros fine-tunes del mismo modelo base, aunque para reentrenar habria que recurrir a los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,4 GB; con Q4_K_M y contexto de 32.768 tokens, la VRAM necesaria se situa por encima de los 20 GB, y aumenta con el tamano de la cache KV. El autor no publica una cifra oficial.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de pesos, encajan GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G 24 GB, L4 24 GB) y, con mas margen, A100 40/80 GB o H100.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 de 24 GB con cuantizacion Q4_K_M y contexto reducido; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-server`), RunPod Serverless mediante Kokonoe; otros runtimes (vLLM, TGI, Ollama) no estan documentados para esta distribucion.
- Latencia y throughput: no disponibles. El ejemplo del autor usa `-ngl 999`, `--flash-attn on` y `--no-mmap`, lo que sugiere descarga completa en GPU y evitacion de paginacion de pesos desde disco.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Redistribucion no oficial: el repositorio no es un release de DavidAU y no sustituye al original; la documentacion autoritativa esta en el repositorio de origen.
- Inconsistencia en parametros: el campo de safetensors indica 460.730.096 parametros frente a los 27B declarados en la model card; conviene verificar el modelo base antes de dimensionar infraestructura.
- Modelo "uncensored": el nombre original declara reduccion de rechazos, lo que implica mayor riesgo de generar contenido inapropiado, danoso o inexacto; requiere moderacion adicional en produccion.
- Riesgo de alucinacion: no hay evaluaciones publicadas en la informacion disponible que cuantifiquen la fiabilidad factual.
- Idiomas: sin lista oficial de idiomas soportados; no se garantiza un rendimiento adecuado en castellano.
- Contexto: los 32.768 tokens corresponden a la configuracion de ejemplo, no necesariamente al maximo nativo del modelo.
- Licencia: Apache 2.0 segun el repositorio original, lo que permite uso comercial, pero la redistribucion no incluye avisos de atribucion adicionales mas alla de la referencia a DavidAU; conviene revisar el repositorio original antes de un despliegue comercial.
- Soporte y mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin garantias de actualizacion.

## Enlaces

- Repositorio de la redistribucion: https://huggingface.co/zecchan/kokonoe-qwen38-mtp-q4km
- Repositorio original de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Perfil del autor original: https://huggingface.co/DavidAU
- Proyecto Kokonoe: https://github.com/zecchan/kokonoe
- RunPod Serverless: https://www.runpod.io/serverless-gpu
