# webmp3/Sakura-Qwen3.8-Flash-Next-Compact-IQ2_XS-CP2-GGUF

## Resumen

Sakura Qwen3.8 Flash-Next Compact IQ2_XS CP2 es un reempaquetado comunitario y experimental del modelo Qwen3.8-Flash-Next, publicado por el usuario webmp3 en HuggingFace. No es un modelo entrenado desde cero ni un afinado: parte del backbone cuantizado GSQ-RCO IQ2_XS de ISTA-DASLab y sustituye únicamente el shard independiente de tablas de búsqueda N-Gram/PLE por la tabla CP2 del proyecto Sakura, conservando el primer shard original sin cambios y la totalidad de los 512 expertos enrutados del modelo original.

El modelo base es una arquitectura de mezcla de expertos (MoE) con 176.943.899.520 parametros totales segun los metadatos de safetensors, distribuida en dos ficheros GGUF que suman 52.666 GB (49.049 GiB) en el repositorio. El interes tecnico inmediato no esta en la calidad del modelo, sino en la ingenieria de empaquetado: reemplazar una tabla IQ4_NL por una representacion CP2 reduce el conjunto de 68.026 GB a 52.666 GB, un ahorro de aproximadamente 15,360 GB, manteniendo intacto el backbone IQ2_XS mixto.

Es relevante ahora como pieza de investigacion reproducible sobre formatos de cuantizacion extrema y tablas de búsqueda asociadas, no como modelo listo para produccion. El propio autor advierte que este paquete exacto IQ2_XS + CP2 no se ha cargado para inferencia ni se ha probado en generacion, perplexity, calidad o velocidad, y que las puntuaciones previas de Sakura Q2 o Gyro-M no son aplicables a esta publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); 512 expertos enrutados conservados |
| Parametros totales | 176.943.899.520 (aproximadamente 176,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el modelo; el arranque incluido configura 4096 tokens |
| Tipos de cuantizacion | Backbone IQ2_XS mixto (formato original de ISTA-DASLab) mas tabla CP2 experimental, derivada con perdida de IQ4_NL; no es un preset estandar de cuantizacion de modelo completo |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF en dos shards (1.223 tensores en el shard principal mas 1 tensor de tabla; 1.224 en total) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con 512 expertos enrutados, heredado de Qwen/Qwen3.8-Flash-Next y cuantizado por ISTA-DASLab en su variante GSQ-RCO. Este repositorio no entrena, no afina y no poda expertos: el primer shard GGUF se copia sin cambios de payload ni de metadatos (identificado por su SHA256 LFS completo de HuggingFace), y solo se sustituye el segundo shard, que contiene la tabla de búsqueda N-Gram/PLE, por la tabla CP2 ya existente del repack Sakura K512 CP2.

El trabajo aportado por Sakura es exclusivamente la representacion de tabla y el empaquetado. La tabla CP2 es un derivado con perdida, no byte-identico a IQ4_NL; el autor verifico que el segundo shard original comparte SHA256 completo con la entrada IQ4_NL comun usada por el repack CP2 previo, y rehasheo localmente el 2026-10-21 tanto la tabla IQ4_NL original como la tabla CP2. Tambien se comprobaron los metadatos de direccionamiento de la tabla y la totalidad de los metadatos crudos del tokenizer contra la referencia ISTA Q2. No hubo nuevo encoder, entrenamiento, poda de expertos ni port de runtime.

El arranque propuesto emplea el runtime Windows x64 Vulkan CP2 incluido, con un solo slot, contexto 4096, cache KV en Q8 y lecturas perezosas de tabla desde NVMe local. Mantiene la plantilla de chat original y su modo thinking por defecto; MTP, vision y la cache opcional de filas CP2 en GPU estan desactivados. Ese arranque se ha verificado como fichero de release, pero no se ha ejecutado contra este paquete exacto.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`), sujeta a validacion por parte del usuario porque el paquete no se ha ejecutado.
- Modo thinking heredado de la plantilla de chat original de Qwen, activo por defecto en el arranque incluido.
- Servidor compatible con la API de OpenAI en `/v1/chat/completions`, con alias `sakura-flash-next-iq2-xs-cp2` y escucha en `http://127.0.0.1:18098`.
- Capacidad de mezcla de expertos con 512 expertos enrutados teoricamente disponibles, aunque sin datos de calidad medidos en esta variante.
- Soporte de tool calling / function calling: no disponible (no verificado ni documentado para este paquete).
- Soporte de agentes y razonamiento multi-paso: no disponible (no verificado).
- Capacidades multilingues: no disponible.
- Vision: presente en el modelo base segun la nota del autor, pero desactivada en el arranque incluido.
- MTP (multi-token prediction): desactivado en el arranque incluido.
- Capacidades especiales: tabla de búsqueda N-Gram/PLE en formato CP2 con lecturas perezosas desde disco, y direccionamiento de tabla verificado.

## Casos de uso

- Investigacion de formatos de cuantizacion extrema: el paquete sirve para estudiar como afecta la sustitucion de una tabla IQ4_NL por una tabla CP2 derivada con perdida al tamano final y a la estructura de shards, comparando los 68,026 GB del conjunto original con los 52,666 GB de este.
- Verificacion de procedencia y reproducibilidad: los ficheros `PROVENANCE.json`, `SHA256SUMS` y `results.json` permiten auditar hashes LFS, revisiones fijadas y correspondencia tensor a tensor entre el shard original y el reemplazo.
- Pruebas de carga en entornos Windows x64 con Vulkan: el runtime incluido y `START.cmd` permiten levantar un endpoint compatible con OpenAI en el puerto 18098 para experimentar con lectura perezosa de tablas desde NVMe.
- Evaluacion de mecanismos de lookup N-Gram/PLE: al aislar la tabla en un shard propio, resulta util para medir el impacto del direccionamiento de tabla y del cache de filas CP2 en GPU (desactivado por defecto) sobre la latencia.
- Base para experimentos de decodificacion y plantillas de chat: conserva la plantilla y el tokenizer originales, lo que facilita comparar el comportamiento del template sin reescribir el pipeline.
- Estudio de viabilidad en hardware limitado: con 49,049 GiB de pesos, el paquete permite analizar estrategias de offload parcial y de lectura bajo demanda en maquinas que no pueden alojar el modelo completo en VRAM.
- Referencia negativa o linea base en evaluaciones de calidad: al no haberse medido perplexity ni generacion, sirve como caso documentado de release estructural sin cualificacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este paquete exacto IQ2_XS + CP2 no se ha cargado para inferencia ni se ha probado en generacion, perplexity, calidad o velocidad, y que las puntuaciones previamente reportadas de Sakura Q2 o Gyro-M no son resultados de este paquete y no se importan aqui. Tampoco se reclama ningun resultado de encaje en AMD/64 GB UMA, memoria pico, contexto largo o rendimiento para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no verificada. Los pesos solos ocupan 49,049 GiB (52,666 GB), por lo que una carga completa en VRAM requiere al menos esa cantidad mas cache KV y overhead del runtime. No se ha medido memoria pico.
- GPU recomendadas: no disponible. El unico entorno propuesto por el autor es Windows x64 con Vulkan; no se especifican modelos de GPU concretos (A100, H100, RTX 4090 u otros) ni se confirma compatibilidad.
- Ajuste en GPU de consumo: no acreditado. Con aproximadamente 49 GiB de pesos, el conjunto no cabe en GPU de consumo de 24 GB o menos sin offload; no se aporta ninguna medicion de encaje para ninguna GPU concreta.
- Almacenamiento: se requiere NVMe local para las lecturas perezosas de tabla, con los dos ficheros GGUF numerados, `START.cmd` y el directorio `runtime` completo en una misma carpeta.
- Opciones de despliegue: exclusivamente el runtime Windows x64 Vulkan CP2 incluido. El autor advierte que llama.cpp estandar, LM Studio, Ollama y forks no relacionados no estan cualificados para esta tabla CP2 personalizada.
- Configuracion de arranque: un slot, contexto 4096, cache KV en Q8, MTP y vision desactivados, cache de filas CP2 en GPU desactivada.
- Latencia y throughput: no disponibles. No se ha ejecutado el arranque contra este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Estado |
|---|---|---|---|---|---|
| Sakura Qwen3.8 Flash-Next Compact IQ2_XS CP2 (este) | 176,9 mil millones totales | no disponible (arranque a 4096) | IQ2_XS + tabla CP2, 52,666 GB | Qwen Community License 1.0 | Experimental, no probado en inferencia |
| ISTA-DASLab Qwen3.8-Flash-Next-GSQ-RCO-GGUF (backbone directo) | 176,9 mil millones totales | no disponible | IQ2_XS con tabla IQ4_NL, 68,026 GB en dos shards | Qwen Community License 1.0 | Origen del backbone cuantizado |
| Sakura Qwen3.8 Flash-Next Compact K512 CP2 v1 | no disponible | no disponible | CP2, aproximadamente 47,6 GiB | Qwen Community License 1.0 | Fuente de la tabla CP2 y del runtime reutilizado |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 176,9 mil millones totales | no disponible | Pesos sin cuantizar, tamano no disponible | Apache en la card upstream, sustituida por Qwen Community License 1.0 para los pesos | Modelo original de Qwen |

Diferencias clave: frente al backbone de ISTA-DASLab, este paquete reduce el conjunto en unos 15,360 GB a costa de introducir una tabla derivada con perdida y de requerir un runtime especifico no estandar. Frente al repack Sakura K512 CP2, reutiliza su tabla y su runtime pero cambia el shard principal por el IQ2_XS de ISTA. No hay datos de rendimiento comparables entre las cuatro variantes.

## Limitaciones y advertencias

- Modelo no validado: este paquete exacto IQ2_XS + CP2 no se ha cargado para inferencia ni probado en generacion, perplexity, calidad o velocidad. No existe ninguna garantia de que funcione correctamente.
- La tabla CP2 es un derivado con perdida de IQ4_NL, no una representacion equivalente byte a byte; el impacto en calidad no se ha medido.
- Compatibilidad de runtime restringida: llama.cpp estandar, LM Studio, Ollama y forks no relacionados no estan cualificados para esta tabla CP2. Solo se admite el runtime Windows x64 Vulkan incluido, lo que limita el despliegue a Windows x64.
- El arranque incluido se ha verificado como fichero de release pero no se ha ejecutado contra este paquete; la configuracion (4096 de contexto, Q8 KV, lecturas perezosas) puede necesitar ajustes segun la memoria disponible.
- Sin resultados de encaje en memoria: no se reclama ajuste en AMD/64 GB UMA, ni memoria pico, ni comportamiento en contexto largo, ni rendimiento.
- Sesgos conocidos: no disponible. Al no haberse ejecutado el modelo, no hay evaluacion de sesgos para esta variante.
- Riesgo de alucinacion: no disponible, y probablemente agravado por una cuantizacion de 2 bits, aunque no existen mediciones que lo cuantifiquen.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue para este empaquetado.
- Licencia: los pesos conservan Qwen Community License 1.0, con condiciones completas en `LICENSE` y `LICENSE-QWEN`. La etiqueta Apache de la card upstream no reemplaza la licencia heredada de los pesos. Es obligatorio leer las condiciones antes de cualquier uso, incluido el comercial. El software del runtime tiene licencias MIT y de terceros separadas bajo `runtime/`, que no relicencian los pesos.
- Integridad: la comprobacion tras la copia en servidor se hace contra los metadatos LFS de hash y tamano de HuggingFace; no se realiza una descarga completa independiente del nuevo repositorio.
- Ausencia de avales: los creditos del backbone corresponden a ISTA-DASLab y a Qwen; este release no reclama autoria del backbone, no implica reentrenamiento ni endorsamiento por parte de esos proyectos.
- El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-IQ2_XS-CP2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Backbone cuantizado directo (ISTA-DASLab GSQ-RCO), revision `ed59f92082b1e93c0e96d60a8b11aab089b52f09`: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Shard CP2 y runtime de origen (Sakura K512 CP2), revision `9b8fef370b812b3fd33787869d553793517245cb`: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF
- Endpoint local del arranque incluido: http://127.0.0.1:18098 (ruta `/v1/chat/completions`)
- Papers, blogs, repos adicionales o demos: no disponible. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.
