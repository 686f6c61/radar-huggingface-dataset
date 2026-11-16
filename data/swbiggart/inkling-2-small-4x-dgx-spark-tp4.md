# swbiggart/Inkling-2-Small-4x-DGX-Spark-TP4

## Resumen

Inkling-2-Small-4x-DGX-Spark-TP4 no es un modelo de pesos, sino una receta de despliegue publicada por Scott Biggart (swbiggart) para servir el modelo `thinkingmachines/Inkling-2-Small` de Thinking Machines en cuatro hosts DGX Spark con GPU GB10 mediante tensor parallelism exacto (TP4). La receta fija la revision `aac974122acd33ddb0d3e1f54433a9c5dd2249ce` del checkpoint original y expone APIs HTTP compatibles con OpenAI y Anthropic, ademas de decodificacion especulativa DSpark y salida estructurada.

El interes practico esta en que demuestra como servir un modelo de gran contexto (hasta 1.048.576 tokens) repartiendo sus pesos entre cuatro nodos GB10 conectados por RoCE de 200 G, manteniendo los bytes exactos del checkpoint y una aritmetica determinista. La model card reporta mediciones reales de throughput, latencia de primer token y capacidad de streams realizadas el 15 y 16 de noviembre de 2026.

El modelo subyacente, Inkling-2-Small, pertenece a Thinking Machines y se distribuye bajo licencia Apache 2.0. Esta ficha describe la receta de serving y las capacidades del modelo segun la informacion disponible; los pesos y su entrenamiento no se detallan en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de expertos cuantizadas (NVFP4 en capas 0-39, MXFP8 en capas 40-47) y decodificacion especulativa DSpark; 48 capas en total |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (configurable via `CONTEXT`) |
| Tipos de cuantizacion | NVFP4 (capas 0-39) y MXFP8 (capas 40-47), segun el checkpoint |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint original de Hugging Face (revision fijada); cada host almacena ~92 GiB correspondientes a su rango TP4 |

## Arquitectura y entrenamiento

La receta sirve el checkpoint exacto de `thinkingmachines/Inkling-2-Small` sin recuantizar ni modificar los pesos. El reparto se realiza en cuatro rangos de tensor parallelism sobre cuatro hosts GB10 con interconexion RoCE de 200 G. La aritmetica de cada paso de decodificacion suma las contribuciones parciales de cada rango en orden fijo y en fp32, lo que garantiza respuestas independientes del timing, del drafting y de la concurrencia. Las capas de expertos usan cuantizacion de activaciones NVFP4 en las capas 0-39 y MXFP8 en las capas 40-47, ejecutadas sobre tensor cores con escalado por bloques.

El sistema incorpora decodificacion especulativa DSpark, usando el drafter propio del checkpoint, activada por defecto y cuyo coste se ajusta segun la profundidad de cada stream. Tambien incluye una cache de prompts exacta sobre el pool de paginas KV, salida estructurada (objeto o esquema JSON, y llamadas a herramientas requeridas o nombradas) y un endpoint `/health` que informa del estado del pool y de la admision. La verificacion reportada incluye que cada paso de decodificacion coincide bit a bit con el forward completo del prompt al mismo world size (W=4) en las 48 capas, incluso tras un prompt de 130.944 tokens. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de RLHF o DPO del modelo subyacente.

## Capacidades

- Generacion de texto en ingles con soporte de razonamiento extendido (modo thinking).
- Generacion y completado de codigo, con buen rendimiento en tareas de tool call y code completion segun las mediciones.
- Llamadas a herramientas y function calling, con soporte de tool calls requeridas o nombradas.
- Salida estructurada: objetos JSON y esquemas JSON validados.
- Razonamiento multi-paso y flujos de agente, favorecidos por el contexto de hasta 1.048.576 tokens.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Cache de prompts exacta para reutilizacion de contexto largo.
- APIs compatibles con OpenAI y Anthropic para integracion directa.
- Capacidades multilingues limitadas al ingles segun los metadatos.

## Casos de uso

- Atencion al cliente con contexto largo: el modelo puede mantener conversaciones multi-turno con historiales de decenas de miles de tokens gracias al pool KV compartido y a la cache de prompts, que reduce el tiempo de primer token de 30,6 s a 0,19 s en prompts de 32k.
- Generacion de codigo en produccion: con tool calling y salida estructurada, puede integrarse en pipelines que requieran respuestas JSON validadas y llamadas a funciones, con un throughput de 60,8 tok/s con DSpark en un solo stream.
- Analisis de documentos extensos: la ventana de 1.048.576 tokens permite procesar libros completos como mensaje de sistema; la receta reporta 16,8 tok/s de decodificacion tras un prompt de 512k y 10,8 tok/s en modo plain a 1M.
- Agentes autonomos multi-paso: la combinacion de razonamiento thinking, tool calls y contexto largo permite orquestar tareas con estado persistente en la cache de prompts.
- Asistentes de codigo interactivos: el modo de code completion alcanza 52,7 tok/s con DSpark, adecuado para autocompletado en editores con latencia de primer token baja en prompts cortos (1,32 s en 2k cold, 0,18 s cached).
- Despliegue en infraestructura distribuida de laboratorio: cuatro DGX Spark con GB10 permiten servir un modelo que no cabe en una sola GPU consumer, con instalacion reproducible en 341 s y arranque en 23 s.
- Evaluacion de recetas de serving: util para investigadores que quieran reproducir el despliegue TP4 exacto y comparar throughput y latencia frente a otras configuraciones.

## Benchmarks y rendimiento

Throughput en un solo stream (tokens por segundo, medido en noviembre de 2026):

| Carga de trabajo | Plain | DSpark | Aceleracion |
|---|---:|---:|---:|
| Tool call | 31,0 | 70,2 | 2,3x |
| Codigo | 31,0 | 60,8 | 2,0x |
| Thinking | 31,0 | 56,3 | 1,8x |
| Code completion | 31,0 | 52,7 | 1,7x |
| Prosa | 31,0 | 40,0 | 1,3x |

Throughput total con `CONTEXT=32768` y `MAX_STREAMS=8`, respuestas de 256 tokens:

| Streams | Plain | DSpark |
|---:|---:|---:|
| 1 | 30,7 | 86,0 |
| 2 | 45,9 | 93,8 |
| 4 | 62,6 | 102,6 |
| 8 | 79,0 | 81,0 |

Tiempo hasta el primer token (segundos):

| Prompt | Cold | Cached |
|---:|---:|---:|
| 2k | 1,32 | 0,18 |
| 8k | 5,84 | 0,18 |
| 32k | 30,6 | 0,19 |
| 128k (126.000 tokens) | 221 | no medido |
| 512k (519.983 tokens) | 2.754 | 12,1 |

Contexto largo (decodificacion tras prompt largo, un stream, tok/s):

| Profundidad | Plain | Default |
|---:|---:|---:|
| 8k | 30,3 | 50,8 |
| 32k | 29,2 | 67,0 |
| 128k | 25,2 | 51,5 |
| 512k | no medido | 16,8 |
| 1M | 10,8 | plain |

Capacidad de streams con `MAX_STREAMS=4` y DSpark: 4 a 131.072 tokens, 3 a 262.144, 1 a 524.288 y 1 en plain a 1.048.576. Con `MAX_STREAMS=8`: 7 a 131.072 (8 en plain). No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Cuatro hosts DGX Spark con GPU GB10, cada uno almacenando aproximadamente 92 GiB de pesos correspondientes a su rango TP4.
- Interconexion RoCE de 200 G entre los cuatro nodos.
- VRAM por host no disponible de forma explicita; el pool KV se dimensiona a partir de la memoria libre de los hosts.
- No cabe en una GPU consumer individual; requiere el cluster de cuatro GB10.
- Opciones de despliegue: la receta propia `setup.sh` con instalacion en host o en contenedor (`--container`), con tarball de release v0.1 y verificacion sha256.
- Tiempos de instalacion medidos: 341 s con pesos ya presentes, 301 s adicionales en la ruta de contenedor y 508 s con `CHECKPOINT` local; arranque hasta estado listo en 23 s.
- Latencia y throughput estimados: ver tabla de benchmarks; DSpark aporta entre 1,3x y 2,3x en un stream y hasta 102,6 tok/s agregados con 4 streams.
- Cada host descarga aproximadamente 92 GiB desde Hugging Face si no se dispone de copia local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small (esta receta) | no disponible | 1.048.576 | Apache 2.0 | 4x DGX Spark GB10, TP4 | Receta exacta con DSpark y APIs OpenAI/Anthropic |
| Inkling-2-Small (checkpoint original) | no disponible | no disponible | Apache 2.0 | no disponible | Pesos de Thinking Machines; esta receta solo los sirve |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La model card solo declara soporte de ingles; el rendimiento en otros idiomas no esta verificado.
- No se dispone de informacion sobre sesgos del modelo subyacente ni sobre tasas de alucinacion.
- DSpark depende de la previsibilidad del texto, por lo que la aceleracion debe citarse como un rango (1,3x a 2,3x en un stream).
- El tiempo de primer token en prompts muy largos es elevado en frio: 221 s a 128k y 2.754 s a 512k; la cache de prompts lo reduce a 0,18-12,1 s solo en repeticiones exactas.
- La capacidad de streams se degrada con el contexto: a 524.288 tokens solo cabe un stream.
- La receta no esta afiliada ni respaldada por Thinking Machines; los pesos son responsabilidad del autor original.
- Requiere infraestructura especifica de cuatro DGX Spark con RoCE de 200 G, lo que limita su portabilidad.
- El proyecto esta en version v0.1, por lo que la estabilidad en produccion no esta garantizada.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribucion correspondiente al modelo original.

## Enlaces

- Hugging Face de la receta: https://huggingface.co/swbiggart/Inkling-2-Small-4x-DGX-Spark-TP4
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio de codigo: https://github.com/swbiggart/inkling2-sparks
- Release v0.1: https://github.com/swbiggart/inkling2-sparks/releases/tag/v0.1
- Benchmarks de la receta: https://github.com/swbiggart/inkling2-sparks/blob/v0.1/recipe/inkling2-tp4/docs/BENCHMARKS.md
- Thinking Machines: https://thinkingmachines.ai
- Perfil del autor en X: https://x.com/woolsey
