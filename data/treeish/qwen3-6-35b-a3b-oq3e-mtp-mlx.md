# treeish/Qwen3.6-35B-A3B-oQ3e-MTP-MLX

## Resumen

Qwen3.6-35B-A3B-oQ3e-MTP-MLX es un paquete de pesos cuantizados publicado por el usuario treeish para el runtime MLX de Apple. No se trata de un modelo entrenado desde cero, sino de una distribucion empaquetada del modelo base Qwen/Qwen3.6-35B-A3B (arquitectura MoE, 35.951.822.704 parametros totales y aproximadamente 3B activos por token) en cuantizacion mixta oQ3e de 3 bits con calibracion imatrix, junto con su cabeza de Multi-Token Prediction (MTP) embebida y la plantilla de chat Froggeric v21.3.

El paquete esta pensado para el flujo de trabajo de agente de codigo de Sprig en Treeish, que fija un commit exacto del repositorio en lugar de seguir la rama main. Su relevancia practica es doble: por un lado reduce un modelo MoE de 35B a unos 17,2 GB de datos tensoriales, lo que permite ejecutarlo en equipos Apple Silicon con 32 GB de memoria unificada (48 GB recomendados); por otro, conserva la ventana de contexto de 262.144 tokens y la torre de vision del modelo original, por lo que mantiene la modalidad image-text-to-text.

Conviene subir la advertencia de que este repositorio es una distribucion curada con procedencia byte-fijada: los pesos, la configuracion y el informe de calibracion oQ son byte-identicos a Jundot/Qwen3.6-35B-A3B-oQ3e-mtp en el commit 9d5312516fc7fa473a28b9c7598d1c28a0f420a1. El release no modifica tensores del modelo: solo reemplaza la plantilla de chat y anade licencia, trazabilidad y manifiesto de ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (configuracion qwen3_5_moe), transformer con enrutado disperso, torre de vision y una capa MTP embebida |
| Parametros totales | 35.951.822.704 (segun safetensors del repositorio) |
| Parametros activos | Aproximadamente 3B (sufijo A3B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ3e, precision mixta con imatrix; 3-bit affine por defecto con group size 64; overrides por tensor a 5, 6 y 8 bits con group sizes 64 y 128 |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 (texto completo incluido en el repositorio) |
| Formato de pesos | MLX safetensors (4 shards; 17.204.858.031 bytes de datos tensoriales) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Libreria / runtime | mlx (probado con el runtime MLX Swift fijado por Treeish) |
| Tensores indexados | 2.052 en total, de los cuales 333 son de la torre de vision y 42 pertenecen al bloque MTP embebido |
| Cabeza MTP | 1 capa embebida bajo language_model.mtp.* |
| Pipeline declarado | image-text-to-text |
| Plantilla de chat | Froggeric v21.3, byte-identica a archive/v21_chat_template.jinja en froggeric/Qwen-Fixed-Chat-Templates (commit 9f14778c92c3b5ed3e0738085694c0d3452802dd) |
| Tamano del repositorio | 17,2 GB |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura de mezcla de expertos con aproximadamente 35B de parametros totales y unos 3B activos por token, lo que desacopla la capacidad del coste de computo por token: la memoria necesaria viene determinada por el total de parametros, mientras que el coste de inferencia se aproxima al de un modelo denso de 3B. A esto se suman dos componentes relevantes en este paquete: una torre de vision (333 tensores) que habilita la entrada de imagenes junto al texto, y una cabeza de Multi-Token Prediction de una unica capa embebida (42 tensores) que permite predecir varios tokens por paso y explotar esa senal para acelerar la decodificacion.

Sobre el entrenamiento del modelo original no hay informacion en los datos disponibles: no se documentan numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si describe la model card es el proceso de posentrenamiento aplicado en esta publicacion: una cuantizacion oQ3e de precision mixta con informe imatrix, generada con oMLX 0.4.5.dev1 como conversor, que registro 128 muestras de 512 tokens procedentes del corpus oqe_code_multilingual y aplico 470 de 510 entradas de calibracion. La innovacion tecnica destacable del paquete es, por tanto, la combinacion de cuantizacion mixta por tensor (3 bits por defecto, con capas promovidas a 5, 6 y 8 bits) y la conservacion de la cabeza MTP dentro del formato MLX safetensors.

La procedencia esta fijada byte a byte respecto a Jundot/Qwen3.6-35B-A3B-oQ3e-mtp en el commit 9d5312516fc7fa473a28b9c7598d1c28a0f420a1, pero la propia model card advierte de que no se identifica el commit exacto del modelo base usado en la conversion, por lo que se trata de una distribucion curada y fijada por bytes, no de una receta de conversion reproducible byte a byte.

## Capacidades

- Generacion de texto conversacional con 262.144 tokens de contexto, apta para conversaciones multi-turno muy largas o para procesar repositorios y documentos extensos de una sola pasada.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el paquete incluye 333 tensores de torre de vision, por lo que acepta entradas multimodales.
- Flujo de agente de codigo: el paquete embebe la plantilla de chat v21.3 de Froggeric, descrita por el autor como la usada en el workflow de agente de codigo de Sprig.
- Decodificacion acelerada mediante MTP: la capa embebida bajo language_model.mtp.* permite prediccion multi-token, aprovechable por runtimes compatibles para reducir el coste por token generado.
- Inferencia eficiente en memoria respecto a un modelo denso de 35B, gracias a los aproximadamente 3B de parametros activos por token.
- Soporte de tool calling o function calling: no disponible (no se documenta en la informacion proporcionada).
- Razonamiento multi-paso explicito o modo thinking: no disponible (no se documenta en la informacion proporcionada).
- Capacidades multilingues declaradas: no disponible (los idiomas no aparecen en la model card; el unico indicio es el nombre del corpus de calibracion, oqe_code_multilingual).

## Casos de uso

- Agente de codigo local en Mac: el paquete se distribuye precisamente como el modelo de Sprig en Treeish, con la plantilla de chat ya integrada, de modo que se puede cargar tal cual en el runtime MLX Swift fijado y usar en tareas de generacion y edicion de codigo sin salir del equipo.
- Asistencia a la programacion en equipos de 32 GB de memoria unificada: al ocupar unos 17,2 GB de pesos cuantizados, cabe en portatiles Apple Silicon de gama alta con 32 GB, y el autor recomienda 48 GB para trabajar con holgura de contexto y cache.
- Analisis de repositorios completos: con 262.144 tokens de contexto se pueden introducir varios ficheros fuente, historiales de cambios o documentacion tecnica en una sola peticion para tareas de resumen, busqueda de dependencias o deteccion de inconsistencias.
- Procesamiento de documentacion tecnica con imagenes: al ser image-text-to-text, admite capturas de pantalla, diagramas de arquitectura o fotografias de pizarras junto a instrucciones textuales, util para generar documentacion o explicar diagramas.
- Revision de codigo asistida con contexto largo: se puede alimentar el modelo con el diff y los ficheros afectados completos para pedir comentarios de revision, siempre validando la salida, ya que no hay benchmark publicado de calidad tras la cuantizacion.
- Aceleracion de la decodificacion en local con MTP: en runtimes que soporten la capa embebida, la prediccion multi-token puede reducir el numero de pasos de decodificacion, lo que resulta relevante en generacion larga sobre hardware sin GPU dedicada.
- Experimentacion e investigacion en cuantizacion: el paquete incluye informe imatrix, manifiesto con tamanos y digests SHA-256, y trazabilidad de commits, lo que lo convierte en un caso de estudio util para evaluar el impacto de la precision mixta con overrides por tensor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local sobre MLX, es adecuado para tratar codigo o documentos que no pueden salir de la maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card de Treeish indica que su benchmark de release no se ha ejecutado todavia sobre este paquete y que RELEASE_MANIFEST.json se actualizara cuando ocurra. Los resultados de la busqueda web realizada no aportan datos de evaluacion del modelo.

## Requisitos de hardware

- Memoria unificada: el autor indica que Treeish usa este modelo desde 32 GB de memoria unificada y recomienda 48 GB. El margen disponible depende de la longitud de contexto, la configuracion de cache y otras aplicaciones en ejecucion.
- Plataforma: MLX esta orientado a Apple Silicon, por lo que el destino natural son equipos Mac con memoria unificada; no se documenta soporte CUDA en la informacion proporcionada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato MLX safetensors con overrides de cuantizacion por tensor requiere un runtime compatible.
- Viabilidad en GPU de consumo: no disponible para GPU; en el ecosistema Apple Silicon el requisito practico es disponer de 32 GB o mas de memoria unificada.
- Opciones de despliegue: runtime MLX Swift fijado por Treeish y libreria mlx; cualquier runtime alternativo debe soportar los overrides de cuantizacion por tensor definidos en config.json y el layout MTP de Qwen embebido. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato (no hay pesos GGUF publicados en este repositorio).
- Latencia y throughput: no disponible; no se han publicado medidas en la informacion facilitada.
- Almacenamiento: 17,2 GB de repositorio, con 17.204.858.031 bytes de datos tensoriales repartidos en 4 shards.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| treeish/Qwen3.6-35B-A3B-oQ3e-MTP-MLX | 35,95B totales, ~3B activos | 262.144 tokens | oQ3e 3-bit mixta, MLX safetensors | Apache 2.0 | Incluye MTP embebido, torre de vision y plantilla Froggeric v21.3; sin benchmark de release |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B totales, ~3B activos | 262.144 tokens (heredado) | Pesos sin cuantizar; formato no detallado en la informacion disponible | Apache 2.0 | Modelo de referencia; consume mucha mas memoria que la version oQ3e |
| Jundot/Qwen3.6-35B-A3B-oQ3e-mtp | no disponible | no disponible | oQ3e mixta con MTP | no disponible en la informacion facilitada | Origen byte-identico de los pesos y el informe de calibracion de este paquete; sin la plantilla Froggeric ni el manifiesto anadidos |
| Otras cuantizaciones MLX o GGUF del mismo modelo base | no disponible | no disponible | no disponible | no disponible | No se dispone de datos sobre alternativas en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion a 3 bits con overrides mixtos intercambia calidad del modelo por menor uso de memoria y mayor velocidad de generacion local; la model card recomienda validar el modelo con los propios prompts, el formato de herramientas y el runtime de cada aplicacion.
- No existe benchmark de release publicado para este paquete, por lo que no hay evidencia cuantitativa de la degradacion introducida por la cuantizacion frente al modelo base.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 11 de septiembre de 2026: no hay validacion independiente de la comunidad.
- No se identifica el commit exacto del modelo base usado en la conversion, de modo que la reproducibilidad byte a byte solo esta garantizada respecto al repositorio de Jundot, no respecto al modelo original de Qwen.
- Sesgos conocidos: no disponible (la model card no documenta evaluaciones de sesgo).
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en tareas de generacion abierta y debe mitigarse con verificacion externa, especialmente en codigo.
- Limitaciones de idioma: los idiomas soportados no estan declarados; el unico indicio es que el corpus de calibracion se denomina oqe_code_multilingual, lo que no constituye una garantia de cobertura linguistica.
- Compatibilidad de runtime: un runtime distinto al fijado por Treeish debe implementar los overrides de cuantizacion por tensor de config.json y el layout MTP embebido; en caso contrario la carga puede fallar o producir resultados incorrectos.
- Soporte de tool calling: no documentado, pese a que la plantilla de chat procede de un flujo de agente de codigo.
- Licencia: el modelo base y el paquete se distribuyen bajo Apache 2.0, que permite uso comercial; la plantilla de Froggeric tambien declara Apache 2.0 y se atribuye en la model card. El paquete no contiene codigo ejecutable propio.
- El rendimiento depende criticamente del margen de memoria unificado: con 32 GB el contexto util queda condicionado por la cache y las aplicaciones concurrentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ3e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Origen de pesos y calibracion (Jundot): https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ3e-mtp
- Plantillas de chat Qwen de Froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion con la ficha).
