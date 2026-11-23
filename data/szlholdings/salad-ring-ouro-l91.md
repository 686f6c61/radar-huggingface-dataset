# SZLHOLDINGS/salad-ring-ouro-l91

## Resumen

salad-ring-ouro-l91 es un artefacto de modelo publicado en Hugging Face por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada (modelos, datasets y Spaces con resultados verificables y trazabilidad de recibos de auditoria). El repositorio se creo el 19 de noviembre de 2026 y se actualizo el 23 de noviembre de 2026, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

La model card no proporciona informacion sustantiva sobre el modelo: no se especifica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. La propia tarjeta declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion "vive en sus ficheros de recibo" y que todo lo que no este acreditado con recibos medidos se etiqueta como UNKNOWN (desconocido). El escaneo de recibos citado en la propia tarjeta (receipts-tranche-6, chunk-9, del 22 de noviembre de 2026) clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no existe un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion 0 y marca temporal.

En consecuencia, esta ficha no puede caracterizar tecnicamente el modelo mas alla de lo que la tarjeta declara. La relevancia actual del artefacto es, por tanto, la de un ejemplo de publicacion con gobernanza y trazabilidad declaradas pero sin evidencia de evaluacion verificable: un caso util para discutir practicas de documentacion de modelos, no para seleccionar un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la informacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM), un modelo hibrido ni ninguna otra familia arquitectonica. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o decodificacion especulativa.

La tarjeta afirma que las afirmaciones de entrenamiento y evaluacion del artefacto residen en sus ficheros de recibo dentro de la malla del estate, y que cualquier dato no acreditado alli debe considerarse UNKNOWN. El escaneo estricto citado concluye que no existe un DONE.json que cumpla el umbral (status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento), por lo que la evidencia de evaluacion se marca como UNKNOWN. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio escaneo advierte que es una coincidencia por palabra clave y no evidencia validada.

## Capacidades

- No se ha documentado ninguna capacidad concreta en la informacion disponible.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- La model card no realiza ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos.

## Casos de uso

- Auditoria de documentacion de modelos: el artefacto sirve como caso de estudio de una tarjeta que declara honestamente la ausencia de evidencia medida (etiquetas UNKNOWN y clasificacion RECEIPT_FILES_NO_DONE), util para disenar plantillas de model cards en organizaciones que exigen trazabilidad.
- Verificacion de pipelines de recibos: puede emplearse como fixture de prueba para herramientas que escanean repositorios en busca de DONE.json estrictos y clasifican el estado de la evidencia.
- Formacion interna sobre gobernanza de IA: como ejemplo de separacion entre afirmaciones de marketing y evidencia verificable en un estate de modelos.
- Pruebas de integracion de catalogos de modelos: para validar que un sistema de inventario maneja correctamente repositorios con metadatos incompletos (sin licencia, sin idiomas, sin pipeline declarado).
- Analisis de riesgo de dependencias: para comprobar que los controles de admision de un registro interno rechazan artefactos sin licencia ni benchmarks antes de su adopcion.
- No se recomienda su uso en tareas de inferencia real (atencion al cliente, generacion de codigo, analisis de datos) porque no hay evidencia de que el artefacto sea un modelo funcional ni de cuales son sus entradas y salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos del 22 de noviembre de 2026 concluye que la evidencia de evaluacion es UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.
- No se ha confirmado que el repositorio contenga pesos en ningun formato (safetensors, GGUF u otros), por lo que no puede determinarse siquiera si el artefacto es desplegable.

## Comparativa con modelos similares

No disponible. Al desconocerse parametros, contexto, licencia y rendimiento, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos declarados.
- Ausencia de licencia: no puede determinarse si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion.
- Ausencia de evidencia de evaluacion: el propio escaneo del autor clasifica el repositorio como RECEIPT_FILES_NO_DONE y marca la evidencia como UNKNOWN.
- Riesgo de que el repositorio no contenga un modelo entrenado funcional, sino solo una tarjeta generada de forma automatica (se indica que la tarjeta fue generada por "estate-cards weaver v0.1.0").
- Cero descargas y cero likes en el momento de la consulta: sin senales de uso ni validacion por parte de la comunidad.
- Sin datos sobre sesgos, riesgo de alucinacion o limitaciones idiomaticas, al no existir informacion sobre el entrenamiento.
- Los enlaces de la model card a la organizacion en GitHub aparecen mal formados en el texto extraido, lo que impide verificar el codigo fuente canonico.
- Cualquier uso en produccion sin verificacion previa de los recibos en el origen seria contrario a la propia politica de honestidad que declara el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l91
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (enlace tal como aparece en la model card, sin verificar): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas citada por el autor: https://github.com/szl-holdings/estate-cards
- No se han encontrado papers, blogs, demos ni resultados de busqueda web relevantes para este modelo.
