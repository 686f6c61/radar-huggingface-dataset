# zephel01/MemT-1.0-Flash-32G96G-GGUF

## Resumen

MemT-1.0-Flash es un modelo de lenguaje derivado de DeepSeek-V4-Flash-0731 al que se le ha incorporado un mecanismo de memoria nativa persistente. Lo desarrolla MemTensor (modelo base) y esta ficha concreta la publica el usuario zephel01 en formato GGUF. El modelo parte de una arquitectura Mixture-of-Experts (MoE) y anade un bloque de memoria en cada una de sus 20 capas CSA (capas 4, 6, ..., 42). Cada bloque de memoria es un estado de 64 x 512 x 512 numeros en FP32 por capa (1,25 GiB, un fichero de 1,34 GB).

El problema que resuelve es la persistencia de informacion entre conversaciones: un hecho contado una sola vez, o un documento escrito en la memoria, puede consultarse en una conversacion nueva que no lo contiene. Esto lo diferencia de los modelos con ventana de contexto larga, donde la informacion desaparece al cerrar la sesion. La relevancia actual radica en que permite memoria de largo plazo sin reentrenar y sin RAG externo, integrada en el propio modelo.

Esta publicacion es un overlay GGUF en estado BETA, no un modelo autonomo: contiene un unico fichero (shard 1 de 4) de 9,27 GB que debe combinarse con los tres shards del GGUF L97 de DeepSeek-V4-Flash-0731 (96,8 GB) para formar el modelo completo. Esta pensado para un PC con GPU de 32 GB de VRAM y 96 GB de RAM, y solo funciona con el motor Abyss; llama.cpp no puede ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-V4-Flash-0731) con bloques de memoria en 20 capas CSA |
| Parametros totales | no disponible (el checkpoint base ocupa 576 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (bloques de memoria); backbone con Q5_K, Q8_0, Q6_K, Q4_K, BF16, F32; expertos enrutados en MXFP4 (del base L97) |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards: 1 propio de 9,27 GB + 3 del repo L97 de 96,8 GB) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash-0731, un transformer MoE. MemT-1.0-Flash lo post-entrena anadiendo un bloque de memoria en cada una de las 20 capas CSA (4, 6, ..., 42). Cada memoria es un estado de 64 x 512 x 512 valores FP32 por capa (1,25 GiB). Los expertos enrutados son los del modelo base DeepSeek-V4-Flash-0731 y se reutilizan tal cual (vuelven exactamente a los codigos MXFP4 de 0731); solo el resto del modelo esta en este fichero.

La construccion del GGUF se hizo exclusivamente con las herramientas de Abyss (sin llama.cpp, torch ni safetensors): `tools/memt_flash_fetch.py` descarga por rangos HTTP los ficheros de memoria y los bytes no-experto de los shards de MemT-1.0-Flash (21,9 GB de los 576 GB del checkpoint), y `tools/memt_flash.py --outtype=q8_0 --backbone` escribe este shard sobre el shard 1 de L97, con los k-quants generados por el cuantizador GPU de trench-gguf. No se uso imatrix: con el imatrix propio de 0731 el resultado quedaba dentro de la dispersion de la cuantizacion (memoria desactivada, 5 textos: NLL de -0,009 a +0,006; recall 19 de 19 en ambos casos). No se dispone de datos sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento propios del modelo base DeepSeek-V4-Flash-0731.
- Memoria nativa persistente: lectura durante la respuesta y escritura al final del turno, con identificador de memoria (`id`) por conversacion.
- Escritura de documentos completos en memoria mediante `POST /v1/memory/<id>/documents`.
- Consulta de hechos en conversaciones nuevas que no contienen el contexto original.
- Gestion de memorias via API: listado (`GET /v1/memory`) y borrado (`POST /v1/memory/<id>/delete`).
- Compatibilidad con los esquemas OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`).
- Interoperabilidad de ficheros de estado: el layout coincide con el `save_state` de MemT, cargable en ambos sentidos.
- Idiomas: ingles y japones.
- Tool calling, function calling, agentes y vision: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes personales con memoria de usuario: el modelo puede recordar hechos contados una sola vez (por ejemplo, el nombre de una mascota) y responder en conversaciones posteriores que no incluyen ese contexto, usando el campo `memory` de la peticion.
- Base de conocimiento personal sin RAG: escribir documentos en una memoria con `POST /v1/memory/<id>/documents` y consultarlos despues con preguntas en lenguaje natural, evitando montar un pipeline de recuperacion externo.
- Atencion al cliente con historial persistente: mantener una memoria por cliente que acumule preferencias e incidencias previas, consultable en sesiones nuevas sin arrastrar todo el historial en el prompt.
- Despliegue local en estacion de trabajo: el objetivo 32G96G (GPU de 32 GB + 96 GB de RAM) permite ejecutar el modelo en un PC con RTX 5090 y offload a CPU, sin depender de la nube.
- Prototipado de agentes con estado: usar memorias separadas por tarea o por usuario para dar continuidad a agentes multi-turno entre ejecuciones.
- Investigacion sobre memoria en modelos: la API de memorias y el formato de estado interoperable permiten experimentar con persistencia de informacion y evaluar recall sin modificar el modelo.
- Entornos con requisito de licencia permisiva: la licencia MIT del modelo base y de esta publicacion facilita su integracion en productos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una medicion cualitativa: con memoria desactivada, en 5 textos, la diferencia de NLL frente al uso de imatrix propio fue de -0,009 a +0,006, y el recall fue de 19 de 19 en ambos casos.

## Requisitos de hardware

- VRAM estimada: 32 GB de GPU como objetivo de diseno (denominacion 32G96G), combinados con 96 GB de RAM.
- GPU: probado en una RTX 5090; solo NVIDIA (los kernels de memoria no se han ejecutado en AMD).
- Almacenamiento: 9,27 GB para este shard mas 96,8 GB para los tres shards L97, en total unos 106 GB.
- Cabe en GPU de consumo: si, en el escenario objetivo de 32 GB de VRAM con offload de CPU a 96 GB de RAM.
- Despliegue: exclusivamente mediante el motor Abyss (v1.3.206 o superior), con `./setup-deepseek.sh --model memt-flash --download-model` y `../Abyss-tools/abyss.sh start memt-flash-32g96g`. llama.cpp no es compatible porque no reconoce los bloques de memoria.
- Windows 11: existe `setup-deepseek.bat`, pero no se ha verificado en Windows.
- Latencia y throughput: no disponible; el autor indica que 32G96G es un objetivo de configuracion, no una garantia de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria persistente | Licencia | Formato |
|---|---|---|---|---|---|
| MemT-1.0-Flash (esta ficha) | no disponible (base de 576 GB) | no disponible | Si, 20 bloques nativos | MIT | GGUF (4 shards) |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | No | no disponible en la informacion | GGUF (L97) |
| MemT-1.0-Nano | no disponible | no disponible | Si | no disponible en la informacion | GGUF Q4_K_M |

Las alternativas comparables en la misma categoria (modelos con memoria nativa) se limitan a las variantes de la propia familia MemT; no se dispone de datos de terceros para una comparacion cuantitativa.

## Limitaciones y advertencias

- Estado BETA: medido en un solo PC (RTX 5090) y el fichero puede sustituirse por una compilacion mejor tras nuevas mediciones.
- No es un GGUF autonomo: requiere los tres shards del repo L97 de DeepSeek-V4-Flash-0731, con nombres renombrados segun el patron `-0000{2,3,4}-of-00004`.
- Solo funciona con Abyss; llama.cpp no puede ejecutarlo al no conocer los bloques de memoria.
- Solo NVIDIA: los kernels de memoria no se han ejecutado en AMD.
- No verificado en Windows 11.
- Idiomas limitados a ingles y japones; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: licencia MIT, sin restriccion conocida para uso comercial.
- El objetivo 32G96G es una configuracion de referencia, no una garantia de rendimiento; la latencia real dependera del offload a CPU.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/zephel01/MemT-1.0-Flash-32G96G-GGUF
- Modelo base: https://huggingface.co/MemTensor/MemT-1.0-Flash
- Shards L97 necesarios: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante Nano Q4_K_M: https://huggingface.co/zephel01/MemT-1.0-Nano-Q4_K_M-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Manual de Abyss (seccion MemT-1.0-Flash): https://github.com/zephel01/Abyss/blob/main/docs/MANUAL.md#memt-10-flash-native-memory-beta
- API de memoria: https://github.com/zephel01/Abyss/blob/main/docs/MANUAL.md#memt-10-nano-native-memory-beta
- Cuantizador trench-gguf: https://github.com/zephel01/trench-gguf
- Reporte de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+MemT-1.0-Flash+32G96G+on+YOUR_GPU
