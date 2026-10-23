# webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q8_K_XL-Engram-Q3_K-GGUF

## Resumen

Sakura DeepSeek-V4.1-Flash-1017 · UD-Q8_K_XL · Engram Q3_K es un repack en formato GGUF del checkpoint DeepSeek-V4.1-Flash-1017, publicado por el usuario webmp3 bajo la etiqueta Sakura. El punto de partida declarado es la conversión GGUF de Unsloth (`unsloth/DeepSeek-V4.1-Flash-1017-GGUF`, revisión `60ad3651641b5c97679c807e064ab1d7a3ca1455`), derivada a su vez del checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`). Se trata de un modelo de mezcla de expertos (MoE) para generación de texto, con 748.494.643.824 parámetros totales según los safetensors del checkpoint original, etiquetas de idioma inglés y chino, y licencia MIT.

La aportación del paquete no está en el backbone: las 8 shards de pesos UD-Q8_K_XL se copian en el servidor sin recuantizar y conservan tamaño e identidad SHA-256 LFS de la fuente fijada. Lo que se sustituye son las tablas de consulta Engram (capas 1 y 14), reemplazadas por una carga Q3_K ya cuantizada en una variante Sakura anterior. El conjunto GGUF principal baja de 508.376.763.197 bytes (508,377 GB) a 390.101.244.297 bytes (390,101 GB), un ahorro de 118.275.518.900 bytes, el 23,27 % respecto a esta variante upstream concreta.

Su interés práctico es que reduce un paquete de casi 508 GB a 363,310 GiB de ficheros principales sin tocar los expertos enrutados, algo relevante para quien necesite almacenar o distribuir este modelo. La contrapartida es una advertencia explícita del autor: no se ha ejecutado ninguna prueba de inferencia completa sobre este paquete exacto, y no se reclama ninguna métrica de calidad de generación, perplejidad, velocidad ni encaje en hardware concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con backbone DeepSeek-V4.1-Flash y tablas de consulta Engram en las capas 1 y 14 |
| Parametros totales | 748.494.643.824 (~748,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone UD-Q8_K_XL (sin cambios); tablas Engram en Q3_K (GGML type 11, 110 bytes por fila de 256 valores). Variantes upstream citadas: IQ2_XXS, IQ4_NL, Q5_K, Q6_K y MXFP8 |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF, 9 shards numerados (`...-00001-of-00009.gguf` a `...-00009-of-00009.gguf`) |
| Tamano del paquete principal | 390.101.244.297 bytes (390,101 GB / 363,310 GiB) |
| Tamano del repo en HuggingFace | 390,1 GB |
| Modelo base | unsloth/DeepSeek-V4.1-Flash-1017-GGUF |
| Relacion con el base | quantized |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (etiqueta `mixture-of-experts`) sobre el diseño DeepSeek-V4.1-Flash. El elemento diferencial que documenta la model card son las tablas Engram: dos capas (1 y 14) con 384.006.168 y 384.016.682 filas respectivamente, 768.022.850 filas en total y 256 valores por fila. En este repack ambas capas se almacenan como una única tabla combinada (capa 1 seguida de la capa 14), con índice de corte en la fila 384.006.168 y una carga Q3_K de 84.482.513.500 bytes. El autor indica que se conservan todas las filas de consulta y todos los expertos, y que no ha habido poda, reentrenamiento ni recuantización de los expertos enrutados por parte de Sakura.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras) más allá de la mención a un "DSpark/drafter" opcional que queda fuera del conjunto principal de ficheros. El autor sí documenta verificaciones de integridad: coincidencia de tamaño y SHA-256 LFS de cada fichero copiado, comprobación de cabeceras, formas, tipos reales, offsets y metadatos de partición de la tabla publicada, y comparación de 192 filas Q3 reales de ambas capas (incluidas filas intermedias y finales) contra fixtures congelados. Además, una muestra de 192 filas Q6 coincidió con Maya y Unsloth antes de reutilizar la tabla original, y la variante Maya-XS coincidió en 96 filas Q6 de muestra y en el hash completo del mapa de tokens; el propio autor advierte que las muestras no prueban la identidad completa de la carga Q6 original.

## Capacidades

- Generación de texto y uso conversacional: el tag `conversational` y el pipeline `text-generation` así lo indican.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere exposición mediante APIs compatibles, aunque no se detalla el protocolo.
- Multilingüe limitado a inglés y chino (`en`, `zh`); no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: el autor menciona ficheros opcionales de visión fuera del conjunto principal, pero no se documenta su funcionamiento ni se han validado.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Cuantización parcial selectiva: capacidad técnica del paquete, no del modelo; permite mantener el backbone en Q8_K_XL y comprimir solo las tablas Engram.

## Casos de uso

- Distribución y archivado de un MoE de ~748,5 mil millones de parámetros: el paquete ocupa 363,310 GiB de ficheros principales frente a los 508,377 GB de la variante upstream, lo que reduce el coste de almacenamiento y de transferencia en espejos internos.
- Investigación sobre cuantización selectiva de tablas de consulta: permite comparar el comportamiento de las tablas Engram en Q3_K manteniendo el backbone intacto en Q8_K_XL, aislando el efecto de la precisión de las tablas.
- Servicio de generación de texto en inglés y chino dentro de infraestructura propia con memoria agregada suficiente: el modelo está etiquetado como `endpoints_compatible` y `conversational`, apto para despliegues detrás de una API interna.
- Evaluación comparativa de variantes Sakura: al compartir backbone con otras variantes de la familia (por ejemplo, la IQ2_XXS con Engram Q3_K), sirve para estudiar el compromiso entre tamaño de artefacto y comportamiento.
- Reproducción de artefactos: el autor publica `build-manifest.json` y `compatibility-check.json` con identidades de fichero y comprobaciones de decodificador, útil para pipelines de verificación de integridad de modelos cuantizados.
- Procesamiento por lotes offline: al no requerir baja latencia interactiva, encaja en trabajos de generación masiva en clúster donde el coste por token prima sobre el tiempo de respuesta.
- Docencia y experimentación con arquitecturas MoE de gran tamaño: permite estudiar la geometría de tablas Engram (768.022.850 filas × 256 valores) sobre un artefacto reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se ha realizado ninguna prueba de inferencia completa sobre este paquete exacto y que no se reclama ninguna puntuación de calidad de generación, perplejidad, velocidad o encaje en hardware. Los benchmarks del upstream y los resultados de otras variantes Sakura no son mediciones de este paquete, y el error de reconstrucción de filas no equivale a calidad del modelo.

## Requisitos de hardware

- Los ficheros principales del modelo suman 363,310 GiB (390,101 GB). El autor advierte que el tamaño de fichero no es consumo de RAM/VRAM ni prueba de que el paquete quepa en una máquina concreta.
- Por el propio tamaño de los pesos, no cabe en GPU de consumo: una RTX 4090 con 24 GB o una RTX 3090 con 24 GB quedan muy por debajo de los 363,310 GiB de pesos, antes de contar KV cache y overhead.
- Despliegue realista en múltiples aceleradores de数据中心 (A100/H100 de 80 GB en varios nodos) o en configuraciones CPU + RAM abundante; no se publican cifras oficiales de VRAM ni de número mínimo de GPU para este paquete.
- Runtime: el autor solo cualifica el fork `danielhanchen/llama.cpp` en el commit `b72050d03ae14bb3cb5138ecefab3f3f65157d31` (PR #30817 de ggml-org/llama.cpp), con ruta nativa host-gather Q3_K validada sobre 192 filas reales, ambos límites de capa, gathers inversos y offsets de 64 bits.
- El autor indica expresamente que esto no cualifica llama.cpp estándar, LM Studio ni versiones de Maya.
- Carga: mantener los 9 ficheros GGUF numerados juntos y cargar `UD-Q8_K_XL/DeepSeek-V4.1-Flash-1017-UD-Q8_K_XL-00001-of-00009.gguf` con el runtime adecuado.
- Latencia y throughput: no disponibles. No se ha medido velocidad para este paquete.
- Cualificación en GPU, Windows y AMD: no realizada según la model card.

## Comparativa con modelos similares

| Paquete | Parametros | Contexto | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura UD-Q8_K_XL · Engram Q3_K (este) | 748.494.643.824 | no disponible | 390,101 GB (363,310 GiB) | MIT | Backbone intacto, tablas Engram en Q3_K, sin prueba de inferencia completa |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF (upstream) | mismos pesos | no disponible | 508,377 GB | MIT (segun el paquete base) | Referencia directa de este repack; incluye tablas Engram en mayor precisión |
| Checkpoint oficial deepseek-ai/DeepSeek-V4.1-Flash-1017 (safetensors) | 748.494.643.824 | no disponible | ~510,297 GB | no disponible en la informacion proporcionada | Paquete completo en safetensors, no cuantizado para GGUF |
| Sakura Maya-S (Engram Q3_K) | no disponible | no disponible | 339,478 GB | MIT (segun la familia Sakura) | Variante previa de la que se reutiliza la carga Q3_K de las tablas Engram |

## Limitaciones y advertencias

- No se ha ejecutado ninguna prueba de inferencia completa sobre este paquete exacto. Las comprobaciones cubren integridad, formato, direccionamiento y rutas de decodificador aisladas, no calidad de generación.
- No hay mediciones de perplejidad, velocidad ni encaje en hardware para este artefacto. Cualquier cifra atribuida a esta variante sería extrapolación.
- El impacto en calidad de sustituir las tablas Engram por Q3_K no está medido; el autor subraya que el error de reconstrucción de filas no es calidad del modelo.
- Dependencia de un runtime concreto: solo se cualifica el fork de llama.cpp en el commit indicado. llama.cpp estándar, LM Studio y otras implementaciones no están validadas.
- No se ha verificado la ejecución en GPU, Windows ni AMD; las pruebas de decodificador y direccionamiento son en CPU y aisladas.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no publicada, lo que impide planificar cargas de trabajo de contexto largo.
- Riesgo de alucinación: no evaluado para este paquete.
- Sesgos conocidos: no documentados en la información proporcionada.
- Los 9 shards deben mantenerse juntos; separarlos o renombrarlos rompe la carga.
- Licencia MIT declarada en el repo, pero conviene verificar la licencia y condiciones del checkpoint oficial y del GGUF de Unsloth antes de un uso comercial en producción.
- El paquete no incluye el drafter DSpark, los ficheros de visión ni la imatrix opcionales, que quedan fuera del total principal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q8_K_XL-Engram-Q3_K-GGUF
- Checkpoint oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`)
- GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF/tree/60ad3651641b5c97679c807e064ab1d7a3ca1455 (revisión `60ad3651641b5c97679c807e064ab1d7a3ca1455`)
- Variante Sakura Maya-S IQ2_XXS con Engram Q3_K: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Maya-S-IQ2_XXS-Engram-Q3_K-GGUF (revisión congelada `4a701f59f623b08a859368926cd9a210ab446941`)
- Fork de llama.cpp cualificado: https://github.com/danielhanchen/llama.cpp/tree/b72050d03ae14bb3cb5138ecefab3f3f65157d31
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30817
- Guía de Unsloth para DeepSeek-V4.1-Flash: https://unsloth.ai/docs/models/deepseek-v4.1-flash
- Manifiesto de build: `build-manifest.json` en el repositorio
- Registro de compatibilidad: `compatibility-check.json` en el repositorio
