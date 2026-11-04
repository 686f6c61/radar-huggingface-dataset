# Zayaan/zils-d3mini-turnike

## Resumen

Zils d3-mini turnike es un repositorio de pesos publicado por el usuario Zayaan en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: es una redistribucion de los pesos de `berkay123001/turnike-jev-4b-merged` en la revision `f10d80bc9b`, sin modificaciones, reorganizados en el layout que el autor denomina "soup-body" de Zils d3-mini, con prefijos de modulo `language_model.*` y `visual.*`.

El modelo subyacente tiene 4.539.265.536 parametros (aproximadamente 4,5 mil millones) y un tamano de repositorio de 9,1 GB, lo que es coherente con pesos en precision de 16 bits. La model card indica que los pesos originales se distribuyen bajo licencia Apache 2.0 y que el commit se realizo en el contexto de la subnet 127 (Zils) de Bittensor mediante una hotkey de tipo scout, es decir, en el marco de un mecanismo de descubrimiento y catalogacion de modelos de esa red.

La relevancia de esta ficha es limitada pero concreta: sirve para identificar rapidamente que este repositorio no aporta un modelo nuevo, sino un empaquetado alternativo de pesos existentes. Cualquier evaluacion de capacidades, calidad o rendimiento debe remitirse al modelo base original, ya que el autor no documenta entrenamiento adicional, cambios de arquitectura ni resultados de evaluacion propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican prefijos `language_model.*` y `visual.*`, lo que sugiere un modelo multimodal con torre de vision, pero no se documenta la arquitectura interna) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `berkay123001/turnike-jev-4b-merged`. El nombre sugiere un modelo de aproximadamente 4 mil millones de parametros resultante de una fusion (merge) de pesos, pero la model card de este repositorio no detalla la familia arquitectonica (transformer denso, MoE, hibrido), el numero de capas, la dimension oculta ni el mecanismo de atencion. La presencia de claves con prefijo `visual.*` en el layout de empaquetado apunta a la existencia de un componente de vision, aunque no se especifica su naturaleza ni su configuracion.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del corpus, la existencia de fases de RLHF, DPO o ajuste supervisado, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato procedimental documentado es que los pesos se tomaron sin cambios de la revision `f10d80bc9b` del modelo base y se reempaquetaron en el layout de Zils d3-mini para su publicacion en la subnet 127 de Bittensor.

## Capacidades

- Generacion de texto: presumiblemente heredada del modelo base, aunque no se documenta explicitamente en este repositorio.
- Procesamiento visual: el layout incluye modulos con prefijo `visual.*`, lo que indica presencia de componentes de vision, pero no se detallan tareas soportadas (captioning, VQA, OCR u otras).
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modos especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Catalogacion y auditoria de pesos en Bittensor: el repositorio permite a los participantes de la subnet 127 (Zils) verificar que los pesos de `turnike-jev-4b-merged` en la revision `f10d80bc9b` se han empaquetado correctamente en el layout soup-body, comparando hashes y estructura de claves.
- Reutilizacion del layout estandarizado: un desarrollador que ya tenga un pipeline construido para el formato `language_model.*` / `visual.*` de Zils d3-mini puede cargar estos pesos sin adaptar el codigo de carga, siempre que el resto del stack espere ese esquema de nombres.
- Punto de partida para experimentos de merge: al ser una redistribucion limpia y con licencia Apache 2.0, sirve como base reproducible para probar tecnicas de fusion o cuantizacion sobre el modelo original sin depender de la disponibilidad del repositorio fuente.
- Investigacion sobre procedencia de modelos: el commit mediante hotkey scout y la referencia explicita a la revision original permiten estudiar trazabilidad y atribucion en redes descentralizadas de modelos.
- Despliegue experimental en entornos con recursos limitados: con 4,5 mil millones de parametros, el modelo es candidato a ejecutarse en una unica GPU consumer tras cuantizacion, aunque esta variante concreta solo publica safetensors y requeriria convertir los pesos a GGUF u otro formato antes de usarla con llama.cpp u Ollama.
- Evaluacion comparativa del empaquetado: util para medir si el reempaquetado introduce diferencias de latencia o de uso de memoria respecto a cargar los pesos en su layout original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de este repositorio ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para este empaquetado ni para el modelo base referenciado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB de VRAM para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB para pesos, con overhead adicional. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, cabria en RTX 4090 (24 GB) en FP16, y en GPUs de 16 GB como RTX 4080 o A4000 tras cuantizacion. Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamano salvo que se busque throughput agregado.
- Cabe en GPU consumer: si, previsiblemente en RTX 4090 en FP16 y en GPUs de 8-12 GB tras cuantizacion a 4 u 8 bits, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: el repositorio solo distribuye safetensors, por lo que vLLM o TGI requeririan verificar compatibilidad con el esquema de nombres `language_model.*` / `visual.*`. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, y sin benchmarks no es posible establecer una comparacion rigurosa con otros modelos de aproximadamente 4 mil millones de parametros. Como referencia estructural, el modelo base `berkay123001/turnike-jev-4b-merged` seria el termino de comparacion natural, pero tampoco se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- Este repositorio no introduce mejoras sobre el modelo base: es una copia reempaquetada. Cualquier limitacion del original se hereda sin cambios.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, lo que impide hacer una evaluacion de riesgo fundamentada.
- Riesgo de alucinacion: desconocido, al no haber benchmarks ni documentacion del modelo base.
- No se declara la longitud de contexto soportada, por lo que no debe asumirse una ventana concreta en produccion sin verificar la configuracion del modelo base.
- No se declaran idiomas soportados; el rendimiento en castellano es indeterminado.
- La licencia Apache 2.0 permite uso comercial, pero la atribucion corresponde a los autores originales de los pesos, no al publicador de este empaquetado.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no cuenta con pipeline declarado; es un artefacto de publicacion en red descentralizada mas que un modelo mantenido.
- El esquema de nombres no estandar (`language_model.*`, `visual.*`) puede romper cargadores que esperen convenciones de HuggingFace Transformers, lo que exige adaptacion del codigo de carga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Zayaan/zils-d3mini-turnike
- Modelo base: https://huggingface.co/berkay123001/turnike-jev-4b-merged
