# webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q3_K_XL-Engram-Q3_K-GGUF

## Resumen

Sakura DeepSeek-V4.1-Flash-1017 · UD-Q3_K_XL · Engram Q3_K es un repack en formato GGUF del checkpoint DeepSeek-V4.1-Flash-1017, publicado por el usuario webmp3 bajo el paraguas "Sakura". No es un modelo nuevo ni un reentrenamiento: es una reempaquetado del GGUF de Unsloth (`unsloth/DeepSeek-V4.1-Flash-1017-GGUF`) en el que se conservan intactos los siete shards del backbone (con sus identidades LFS SHA-256 originales) y todos los expertos enrutados, y se sustituyen unicamente las tablas de busqueda Engram por una version Q3_K ya existente, reutilizada sin un nuevo pase de cuantizacion.

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 748.494.643.824 parametros totales (segun los safetensors del checkpoint oficial), distribuido en 8 ficheros GGUF. El objetivo del repack es reducir el peso del paquete: el conjunto principal pasa de 485,069 GB a 366,793 GB, un ahorro de 118,276 GB (24,38 %) respecto a la variante upstream equivalente, gracias a comprimir las tablas Engram de 202,758 GB a 84,483 GB. El backbone UD-Q3_K_XL no se toca.

Su relevancia practica es acotada y muy especifica: permite ejecutar un modelo MoE de ~748 B en un espacio de almacenamiento notablemente menor, pero exige un runtime concreto (el fork de llama.cpp de danielhanchen en el commit `b72050d0`, PR #30817) y no se ha realizado ninguna prueba de inferencia completa, calidad de generacion, perplexity ni velocidad sobre este paquete exacto. El autor lo declara explicitamente. Es, por tanto, un artefacto para quien ya tenga montada la infraestructura de DeepSeek-4.1 y quiera una copia mas ligera, no una opcion recomendada para produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y tablas de busqueda Engram en las capas 1 y 14 |
| Parametros totales | 748.494.643.824 (~748,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; backbone con receta UD-Q3_K_XL de Unsloth; tablas Engram en Q3_K (GGML type 11, 110 bytes por fila de 256 valores) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF, 8 shards numerados (`...-00001-of-00008.gguf` a `...-00008-of-00008.gguf`) |

Datos adicionales del paquete:

| Metrica | Valor |
|---|---|
| Tamano del repo | 366,8 GB (conjunto principal: 366.793.120.315 bytes = 341,603 GiB) |
| Backbone sin cambios | 282.310.606.623 bytes (282,311 GB) |
| Engram upstream | 202.758.032.592 bytes (202,758 GB) |
| Engram Q3_K de reemplazo | 84.482.513.692 bytes (84,483 GB) |
| Ahorro frente a la variante upstream | 118.275.518.900 bytes (24,38 %) |
| Filas Engram totales | 768.022.850 (capa 1: 384.006.168; capa 14: 384.016.682) |
| Payload Q3 total | 84.482.513.500 bytes |
| Fecha de creacion | 2026-10-22 |

## Arquitectura y entrenamiento

La arquitectura de base es un transformer con mezcla de expertos (tag `mixture-of-experts` en el repo), con un total de ~748,5 B de parametros. El repack no aporta informacion sobre el numero de expertos, el numero de parametros activos por token, la dimension oculta ni la ventana de contexto; esos datos no estan disponibles en la informacion proporcionada. Lo que si documenta el autor es la estructura de las tablas Engram: dos capas (1 y 14) con 384.006.168 y 384.016.682 filas respectivamente, 256 valores por fila, almacenadas en una unica tabla combinada con la capa 1 seguida de la capa 14, y un indice de inicio de la segunda capa en la fila 384.006.168.

El unico "entrenamiento" implicado aqui es la cuantizacion de esas tablas: el payload Q3_K procede de una revision congelada del modelo Sakura Maya-S (`4a701f59f623b08a859368926cd9a210ab446941`), cuantizado a su vez desde las tablas Maya-S Q6_K de peasantsmith (`b9e25f34b53806b24e5b18085de6ed5967ad9ed5`) con GGML `c7fc5094179bf8a9c73c18593db714f8da41a402`. Este repack no recuantiza el IQ4_NL, Q5_K, Q6_K ni MXFP8 upstream: reutiliza el payload Q3 existente y solo ajusta la cabecera de la tabla GGUF donde es necesario. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO.

Un detalle importante de nomenclatura: la etiqueta `UD-Q3_K_XL` describe la receta del backbone de Unsloth, mientras que `Q3_K` describe las tablas Engram, no el modelo completo.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`); es la capacidad principal declarada.
- Razonamiento y codigo: no hay documentacion especifica en la informacion proporcionada sobre el rendimiento en tareas de codigo o matematicas.
- Soporte multilingue limitado a ingles y chino (`language: en, zh`); no se declaran otros idiomas.
- Mezcla de expertos: enrutamiento por expertos segun la arquitectura base; el repack conserva todos los expertos sin poda.
- Memoria mediante tablas Engram: mecanismo de busqueda por tabla en las capas 1 y 14, orientado a recuperacion de conocimiento; el autor no detalla su comportamiento funcional.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: el repositorio menciona ficheros opcionales de vision fuera del conjunto principal, pero no se detalla la capacidad ni se ha verificado su funcionamiento.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso tras una API compatible, sin mas detalle.
- Decodificacion especulativa: se menciona un "drafter" DSpark opcional fuera del total principal, sin especificaciones.

## Casos de uso

- Archivo y distribucion de una copia ligera del modelo: para equipos que ya trabajan con DeepSeek-V4.1-Flash-1017 y necesitan una copia en disco un 24,38 % mas pequena (366,8 GB frente a 485,1 GB) sin renunciar a ningun experto ni a ninguna fila de las tablas Engram. Es el caso de uso mas directo y el unico respaldado explicitamente por el autor.
- Investigacion sobre cuantizacion de tablas de busqueda: el paquete documenta geometria de tabla, offsets de 64 bits y rutas de "host-gather" Q3_K verificadas sobre 192 filas reales, lo que lo convierte en material util para estudiar el impacto del formato Q3_K en mecanismos de memoria tipo Engram.
- Despliegue en servidores con memoria unificada grande: en maquinas con 384 GB o mas de RAM/VRAM (por ejemplo, nodos multi-GPU tipo 5x H100 80 GB o 6x A100 80 GB), puede cargarse con llama.cpp para servir generacion de texto en ingles y chino. Requiere validacion previa de calidad, que el autor no aporta.
- Reproduccion de builds y auditoria de identidad: los shards del backbone conservan los SHA-256 LFS del origen y el repo incluye `build-manifest.json` y `compatibility-check.json`, lo que permite verificar la cadena de procedencia en un pipeline de auditoria de artefactos.
- Fine-tuning o investigacion sobre el modelo base usando este GGUF solo como referencia de pesos: no es un formato adecuado para entrenamiento (GGUF no es entrenable), pero sirve para comparar discrepancias entre la version Q3_K de las tablas y el Q6_K original en experiments de evaluacion de degradacion por cuantizacion.
- Pruebas de compatibilidad de runtimes: util para validar si un fork concreto de llama.cpp (PR #30817) carga correctamente layouts MoE con tablas combinadas y offsets de 64 bits, antes de comprometerse con un despliegue mayor.
- Escenarios NO recomendados: atencion al cliente, generacion de codigo en produccion, agentes autonomos o cualquier uso que exija garantias de calidad, latencia o soporte de tool calling. No hay datos que los respalden para este paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor es explicito: "No full inference test has been performed" y "No generation-quality, perplexity, speed or hardware-fit score is claimed for this exact package". Los benchmarks upstream y los de otras variantes Sakura no son mediciones de este paquete.

Lo unico verificado son comprobaciones de integridad y formato:

| Comprobacion | Resultado y alcance |
|---|---|
| Identidad del backbone | Tamano y SHA-256 LFS de cada fichero copiado coinciden con la fuente fijada |
| Flujo de tabla | Repacks de solo cabecera verifican hashes de entrada Q3 y hashes de salida en Python y nativo |
| Layout publicado | Cabeceras, formas, tipos reales, offsets y metadatos de split comprobados |
| Muestras de filas reales | 192 filas Q3 en ambas capas, incluidas filas intermedias y finales, frente a fixtures congelados |
| Decodificador y direccionamiento | Comprobaciones aisladas en CPU (`compatibility-check.json`) |
| Inferencia completa, calidad, perplexity, velocidad | No probado en este paquete exacto |
| Ejecucion en GPU / Windows / AMD | No realizada |

## Requisitos de hardware

- VRAM/RAM para pesos: el conjunto principal ocupa 366.793.120.315 bytes (341,603 GiB). Como referencia minima, hacen falta al menos ~342 GiB de memoria para los pesos, mas la cache KV y los buffers del runtime. El autor advierte que el tamano de fichero no es consumo de RAM/VRAM ni prueba de que quepa en una maquina concreta.
- GPU recomendadas: no hay qualificacion de GPU publicada. Por capacidad bruta, un nodo de 5x H100 80 GB (400 GB) o 6x A100 80 GB (480 GB) dejaria margen para pesos y cache; son estimaciones de capacidad, no configuraciones validadas.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090 24 GB, RTX 3090 24 GB, etc.). Solo seria viable con offload masivo a RAM de sistema y un equipo con 384 GB o mas de memoria, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: llama.cpp en el fork `danielhanchen/llama.cpp` en el commit `b72050d03ae14bb3cb5138ecefab3f3f65157d31` (PR #30817), que incluye la ruta nativa `host-gather` para Q3_K. El autor advierte explicitamente que esto no qualifica llama.cpp estandar, LM Studio ni otras variantes Maya. No se mencionan vLLM, TGI ni Ollama como soportados.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Almacenamiento: prever ~367 GB para el conjunto principal; los ficheros opcionales (drafter DSpark, vision, imatrix, runtime, documentacion) quedan fuera de ese total.
- Carga: mantener los 8 ficheros numerados juntos en el mismo directorio y cargar el shard `00001-of-00008.gguf` con el runtime compatible.

## Comparativa con modelos similares

No hay informacion sobre modelos alternativos de la misma categoria en los datos proporcionados. La comparacion disponible es entre variantes del mismo modelo base, que resulta util para dimensionar el ahorro de este repack:

| Variante | Formato / cuantizacion | Tamano | Notas |
|---|---|---|---|
| Sakura UD-Q3_K_XL + Engram Q3_K (este repo) | GGUF, backbone UD-Q3_K_XL, Engram Q3_K | 366,793 GB (341,603 GiB) | Repack; sin prueba de inferencia completa |
| Upstream Unsloth `DeepSeek-V4.1-Flash-1017-GGUF` | GGUF, Engram en IQ4_NL/Q5_K/Q6_K/MXFP8 segun tabla | 485,069 GB | Base directa de este repack |
| Sakura Maya-S (variante previa) | GGUF, Engram Q3_K, backbone IQ2_XXS | 339,478 GB (ficheros originales) | Origen del payload Q3_K reutilizado |
| Checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017` | safetensors | ~510,297 GB (paquete) | Fuente original, revision `1bae0e10...` |

Advertencia del propio autor: estas cifras son contexto de tamano, no baselines de calidad ni de memoria equiparables. El baseline de reduccion de esta release es la fila de 485,069 GB.

## Limitaciones y advertencias

- Ausencia total de validacion de calidad: no se ha ejecutado inferencia completa sobre este paquete. No hay datos de perplexity, generacion, velocidad ni encaje en hardware. Cualquier uso en produccion exige una evaluacion propia previa.
- Compatibilidad de runtime muy restringida: requiere el fork de llama.cpp en el commit indicado. llama.cpp estandar, LM Studio y otras variantes Maya no estan qualificados y pueden fallar al cargar el layout.
- Sin qualificacion en GPU, Windows ni AMD: las comprobaciones del decodificador y del direccionamiento se hicieron en CPU de forma aislada.
- Idiomas limitados a ingles y chino: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en espanol no esta respaldado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La cuantizacion Q3_K de las tablas de memoria puede degradar la fidelidad de recuperacion de conocimiento, y el autor senala que "row reconstruction error is not model quality" pero tampoco ofrece una evaluacion alternativa.
- Trazabilidad parcial de la identidad del payload: el autor indica que las muestras de 192 filas y el hash del token-map coinciden con Maya y Unsloth, pero "samples alone do not prove complete original Q6 payload identity". La identidad completa del payload Q6 original no queda demostrada.
- Requisitos de memoria muy elevados: ~342 GiB solo para pesos, fuera del alcance de cualquier estacion de trabajo convencional y de GPU consumer.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de un checkpoint DeepSeek conviene revisar tambien los terminos del modelo original (`deepseek-ai/DeepSeek-V4.1-Flash-1017`) y del GGUF de Unsloth, ya que la informacion disponible no detalla condiciones adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Nomenclatura potencialmente confusa: `UD-Q3_K_XL` se refiere al backbone, no al modelo completo; solo las tablas Engram estan en Q3_K.
- Ficheros opcionales fuera del total: drafter DSpark, vision, imatrix, runtime y documentacion no forman parte del conjunto principal y no se han verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q3_K_XL-Engram-Q3_K-GGUF
- Modelo base GGUF (Unsloth), revision `60ad3651641b5c97679c807e064ab1d7a3ca1455`: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF/tree/60ad3651641b5c97679c807e064ab1d7a3ca1455
- Checkpoint original (DeepSeek), revision `1bae0e1088993b9b82de08f59de5be5a34e42170`: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante Sakura Maya-S Engram Q3_K, revision `4a701f59f623b08a859368926cd9a210ab446941`: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Maya-S-IQ2_XXS-Engram-Q3_K-GGUF
- Fork de llama.cpp con soporte del layout, commit `b72050d03ae14bb3cb5138ecefab3f3f65157d31`: https://github.com/danielhanchen/llama.cpp/tree/b72050d03ae14bb3cb5138ecefab3f3f65157d31
- Pull request de llama.cpp #30817: https://github.com/ggml-org/llama.cpp/pull/30817
- Guia de Unsloth para DeepSeek-V4.1-Flash: https://unsloth.ai/docs/models/deepseek-v4.1-flash
- Manifiesto de build (`build-manifest.json`): https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q3_K_XL-Engram-Q3_K-GGUF/blob/main/build-manifest.json
- Registro de compatibilidad (`compatibility-check.json`): https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q3_K_XL-Engram-Q3_K-GGUF/blob/main/compatibility-check.json
