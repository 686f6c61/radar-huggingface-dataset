# wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-FP4PLE-v1

## Resumen

DeepSeek-V4.1-EXL3-K3.25-FP4PLE-v1 es un checkpoint cuantizado publicado por el usuario wrldsuksgo2mars a partir de su propio modelo wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de DeepSeek, sino de una variante de cuantizacion: conserva intacta la cuantizacion EXL3 de los expertos enrutados del modelo base y solo modifica las dos tablas de embeddings PLE situadas en las capas 1 y 14, convertidas de la representacion original FP8/E8M0 a NVFP4 con cuantizacion weight-only. El checkpoint tiene 221.253.127.122 parametros y un repositorio de 349,2 GB repartido en 52 shards de safetensors.

La relevancia del artefacto es fundamentalmente tecnica: documenta de forma reproducible un esquema de cuantizacion mixta (EXL3 de 3,25 bits en los expertos, NVFP4 con escalas por bloque en las tablas PLE) y demuestra una estrategia de publicacion incremental en la que 48 de los 52 shards son identicos byte a byte al repositorio base y se reutilizan en el servidor. Esto reduce el coste de almacenamiento y de transferencia para quien ya disponga del modelo original.

El modelo se publica con licencia MIT, sin pipeline declarado, sin idiomas documentados, con 0 descargas y 0 me gusta en el momento de la consulta, y con una fecha de creacion de septiembre de 2026. La propia tarjeta advierte que no se realizo ninguna evaluacion de calidad ni validacion completa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se sabe que el modelo base usa expertos enrutados; la informacion disponible no detalla la arquitectura completa) |
| Parametros totales | 221.253.127.122 (unos 221,25 mil millones) |
| Parametros activos | no disponible (no se confirma en la informacion proporcionada si es MoE ni, en su caso, cuantos parametros se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 de 3,25 bits (etiqueta "3-bit") en los expertos enrutados, sin cambios respecto al base; NVFP4 weight-only en las tablas PLE de las capas 1 y 14 (pesos E2M1 empaquetados, escalas por bloque FP8 E4M3 y escala global escalar FP32); resto de tensores no enrutados sin modificar |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la tarjeta del modelo) |
| Formato de pesos | safetensors (un unico checkpoint indexado de 52 shards numerados globalmente) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del transformer subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni sobre si hubo RLHF, DPO u otro tipo de ajuste. El tag deepseek_v41 y el nombre del repositorio apuntan a la familia DeepSeek V4.1, pero la informacion proporcionada no permite confirmar detalles de arquitectura, atencion ni estrategia de mezcla de expertos del modelo base.

Lo que si esta documentado es el proceso de cuantizacion. Los expertos enrutados mantienen la cuantizacion EXL3 del modelo base (40 bloques principales y 3 bloques dSpark, segun la tarjeta). Solo se convirtieron las dos tablas de embeddings PLE de las capas 1 y 14: la escala global se calcula como el maximo absoluto de la tabla dividido entre 2688; las escalas por bloque usan el maximo absoluto de cada grupo de 16 valores dividido entre (6 x escala global), con recorte al rango [2^-9, 448] y redondeo a par mas cercano en E4M3; los valores se redondean a par mas cercano en E2M1. No se realizo calibracion de activaciones, recuantizacion de expertos, trabajo en GPU ni validacion o replay del modelo completo. La unica comprobacion fue verificar una fila real por tabla contra una referencia aritmetica independiente, con el error de reconstruccion registrado en el informe de conversion. La estructura resultante es [rows,256] en forma logica, con bloques contiguos de 16 elementos y pesos empaquetados como uint8 [rows,128]; las escalas se almacenan en orden row-major y no con el swizzle propio de los kernels de GPU.

## Capacidades

- No hay informacion verificada sobre las capacidades del modelo base DeepSeek V4.1, por lo que las capacidades funcionales (generacion de texto, razonamiento, codigo, matematicas o vision) no estan disponibles en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en la tarjeta ni en los metadatos).
- Capacidad especial confirmada: ninguna de tipo funcional; la unica particularidad documentada es el esquema de cuantizacion mixta EXL3 + NVFP4 en las tablas PLE.
- Requisito de integracion: el motor de inferencia debe soportar explicitamente esta representacion PLE ademas de los formatos EXL3 nativos del base; que el archivo sea safetensors estandar no implica que un motor convencional pueda ejecutarlo.

## Casos de uso

- Investigacion en cuantizacion extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de aplicar NVFP4 weight-only a tablas de embeddings PLE manteniendo los expertos en EXL3, comparando el error de reconstruccion frente al modelo base en FP8/E8M0.
- Validacion de pipelines de conversion de pesos: el proceso esta publicado en el repositorio ds41rt del autor, con la receta de escalas y el criterio de recorte documentados, lo que permite reproducir o auditar la conversion paso a paso.
- Actualizacion incremental de despliegues existentes: al ser los shards 1 a 48 identicos byte a byte al repositorio base, un equipo que ya tenga descargado el modelo original solo necesita transferir los shards 49 a 52 (PLE de la capa 1 y PLE de la capa 14), lo que reduce drasticamente el ancho de banda y el espacio en disco del despliegue.
- Inferencia de gran escala en infraestructura propia: con unos 221,25 mil millones de parametros, el uso realista es servir generacion de texto y razonamiento en nodos multi-GPU con la ventana de contexto que soporte el modelo base, siempre que el motor de inferencia tenga integrada la representacion PLE.
- Evaluacion comparativa de motores: al exigir soporte explicito de la codificacion PLE (pesos E2M1 empaquetados, escalas E4M3 por bloque y escalas globales FP32 en row-major), el modelo es util para probar la madurez de distintos backends a la hora de cargar formatos cuantizados no estandar.
- Fijacion de linea base para futuras cuantizaciones: este artefacto puede emplearse como punto de partida para medir degradacion adicional si mas adelante se recuantizan expertos o se aplican esquemas de calibracion de activaciones que aqui no se realizaron.
- Despliegue con fine-tuning sobre pesos cuantizados: en los motores que lo permitan, se puede intentar entrenar adaptadores sobre el checkpoint cuantizado, aceptando que la informacion disponible no incluye ninguna validacion de que esta variante preserve la calidad del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo indica explicitamente que la comprobacion realizada no constituye una evaluacion de calidad y que no se ejecuto ninguna validacion ni replay del modelo completo. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni de comparaciones con modelos similares.

## Requisitos de hardware

- Estimacion de pesos: 221.253.127.122 parametros a 3,25 bits equivalen aritmeticamente a unos 90 GB (aproximadamente 84 GiB) solo en pesos, sin contar el KV cache, las activaciones ni los tensores que no estan en la cuantizacion de 3,25 bits.
- Coherencia con el repositorio: el repositorio ocupa 349,2 GB, muy por encima de esa estimacion; la informacion disponible no detalla la composicion interna que explica la diferencia (posibles tensores en mayor precision o artefactos adicionales no documentados).
- Las tablas PLE convertidas a NVFP4 anaden aproximadamente 4 bits por peso en esas dos tablas de embeddings, frente a la representacion FP8/E8M0 del modelo base.
- GPU de consumo: no cabe en ninguna GPU de consumo. Una RTX 4090 o RTX 3090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar los pesos completos, ni siquiera con la cuantizacion mas agresiva disponible en este repositorio.
- GPU de centro de datos: un minimo estimado de 2 x A100 80 GB o 2 x H100 80 GB para pesos y cache, y 4 x H100 80 GB para operar con margen para el KV cache y las activaciones en cargas de contexto largo.
- Opciones de despliegue: el formato EXL3 apunta a motores compatibles con ExLlamaV3, pero la tarjeta advierte que la integracion del motor debe soportar esta representacion PLE concreta. El soporte en vLLM, SGLang, llama.cpp, Ollama o TGI no esta confirmado y se considera no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion verificada sobre modelos comparables de la misma categoria. La busqueda web realizada no devolvio ningun resultado relevante (unicamente herramientas de dibujo sin relacion con el modelo). La unica comparacion que puede establecerse con los datos disponibles es contra el propio modelo base del que deriva este checkpoint:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-FP4PLE-v1 | 221.253.127.122 | no disponible | EXL3 3,25 bits en expertos + NVFP4 en PLE (capas 1 y 14) | MIT | 0 descargas, 0 me gusta, repo de 349,2 GB |
| wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1 (base) | no disponible | no disponible | EXL3 en expertos + PLE en FP8/E8M0 | no disponible | los shards 1 a 48 son identicos byte a byte a los del derivado |

## Limitaciones y advertencias

- Modelo de terceros: no es un lanzamiento oficial de DeepSeek, sino una conversion publicada por el usuario wrldsuksgo2mars; conviene tratarlo como artefacto experimental.
- Sin evaluacion de calidad: la propia tarjeta declara que no se realizo validacion completa ni replay del modelo y que la comprobacion de una fila por tabla no es una evaluacion de calidad.
- Cuantizacion sin calibracion: no hubo calibracion de activaciones ni recuantizacion de expertos, por lo que el error adicional introducido por el NVFP4 en las tablas PLE no esta medido.
- Doble cuantizacion acumulada: se parte de un checkpoint ya cuantizado en EXL3 y se vuelve a cuantizar parte de sus embeddings, con el riesgo de degradacion adicional que ello implica y sin datos publicados al respecto.
- Dependencia del motor de inferencia: las escalas PLE estan en row-major y no con el swizzle de los kernels de GPU, de modo que se requiere una implementacion especifica de decodificacion; el formato safetensors no garantiza ejecucion en motores estandar.
- Contexto e idiomas: se desconocen tanto la ventana de contexto como los idiomas soportados, por lo que no puede garantizarse su comportamiento en cargas multilingues o de contexto largo.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos conocidos ni sobre tasas de alucinacion del modelo base.
- Licencia: la tarjeta declara MIT, pero la licencia del modelo base DeepSeek V4.1 no se especifica en la informacion proporcionada; antes de un uso comercial conviene verificar que la licencia del base permite la redistribucion y el uso derivado en los terminos que se pretendan.
- Adopcion nula: con 0 descargas y 0 me gusta, no existe evidencia de uso en produccion ni de validacion por parte de terceros.
- Trazabilidad temporal: el repositorio esta fechado en septiembre de 2026, con una ventana de publicacion de unos 23 minutos entre creacion y ultima actualizacion, lo que refuerza su caracter de artefacto reciente y poco contrastado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-FP4PLE-v1
- Modelo base: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1
- Revision concreta del modelo base citada en la tarjeta: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1/tree/cfd4ca1d1934a8e81dd2d7515598d4ce288e8b88
- Implementacion de la conversion y proceso reproducible: https://github.com/tpurtell/ds41rt/tree/main/quantization
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a herramientas de dibujo (AutoDraw, Kleki, Drawize, ColoringLib y Poki) sin relacion con el artefacto.
