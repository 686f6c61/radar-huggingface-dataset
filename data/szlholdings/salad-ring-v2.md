# SZLHOLDINGS/salad-ring-v2

## Resumen

salad-ring-v2 es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face, dentro de lo que la organizacion denomina su "estate governed-AI": un conjunto de modelos, datasets y Spaces con resultados auditables y vinculados a su origen. El repositorio contiene unicamente pesos en formato safetensors (1,2 GB) y una model card generada de forma automatica por su herramienta interna estate-cards weaver v0.1.0, sin documentacion tecnica adicional sobre arquitectura, entrenamiento o capacidades.

La model card es explicita respecto a la ausencia de evidencia: declara que cualquier afirmacion sobre entrenamiento o evaluacion debe residir en ficheros de "receipts" (recibos de auditoria), y que lo que no este acreditado alli se etiqueta como UNKNOWN. El escaneo de receipts-tranche-6 (chunk-10, 2026-11-22) clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de receipt pero no existe un DONE.json estricto con status=MEASURED, eval_rc=0 y timestamp. La evidencia de evaluacion figura por tanto como UNKNOWN.

En la practica, esto significa que no es posible determinar que problema resuelve el modelo, que arquitectura emplea, cuantos parametros tiene ni que idiomas soporta. El tamano del repositorio (1,2 GB) sugiere un modelo de escala pequena o media en precision completa, pero esta es una inferencia a partir del peso del fichero, no un dato confirmado. El nombre "salad-ring-v2" no aporta informacion sobre la tarea ni la familia arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un modelo hibrido, ni incluye detalles sobre el numero de capas, dimensiones ocultas, mecanismos de atencion o tokenizador.

Respecto al entrenamiento, la card declara explicitamente que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de receipt" y que cualquier dato no acreditado alli se considera UNKNOWN. El escaneo de receipts realizado el 2026-11-22 no encontro un DONE.json que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y receipt de entrenamiento), por lo que no hay constancia verificada de volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- No se ha documentado ninguna capacidad especifica del modelo en la informacion disponible.
- No hay evidencia de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades agenticas o de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues ni de modo "thinking".
- La model card no incluye ejemplos de uso, prompts de referencia ni demostraciones.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificada sobre arquitectura, capacidades y licencia. Cualquier aplicacion practica requeriria primero una evaluacion empirica del artefacto. A modo de marco general de precaucion:

- Evaluacion interna controlada: cargar los pesos en un entorno aislado y ejecutar pruebas de perplejidad y generacion para determinar la naturaleza del modelo antes de cualquier uso.
- Investigacion de procedencia de artefactos: usar el repositorio como caso de estudio de un pipeline de publicacion con receipts y etiquetado de evidencia (MEASURED/REPORTED/UNKNOWN).
- Auditoria de cadena de custodia: analizar los SVG de receipts incluidos en assets/szl-card/ para entender el formato de acreditacion de la organizacion.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, analisis de datos ni ninguna tarea sensible hasta que exista evidencia medida y una licencia explicita.
- Cualquier despliegue comercial esta bloqueado de facto por la ausencia de licencia declarada.
- Cualquier integracion en pipelines automatizados requeriria verificar primero el formato de pesos y el tokenizador, no documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que la evidencia de evaluacion es UNKNOWN y que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repositorio ocupa 1,2 GB en safetensors, lo que sugiere que la inferencia en precision completa cabria en GPUs de consumo con 8-16 GB, pero se desconoce el numero de parametros y la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si por el tamano del fichero, pero no confirmado.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers. Al no haber tokenizador ni configuracion publicada, el despliegue estandar no esta garantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables al desconocerse la categoria, el tamano y la tarea del artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-v2 | no disponible | no disponible | no disponible | pesos safetensors, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen arquitectura, parametros, contexto ni idiomas.
- Sin licencia declarada: no hay autorizacion explicita para uso comercial ni para redistribucion; el uso queda en un limbo legal.
- Evidencia de evaluacion UNKNOWN: el escaneo de receipts no encontro un DONE.json estricto, por lo que no hay ninguna medicion de calidad acreditada.
- Riesgo de alucinacion y sesgos: imposibles de evaluar sin benchmarks ni documentacion de datos de entrenamiento.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten informacion.
- Procedencia opaca: la model card enlaza a una organizacion de GitHub con sintaxis malformada en el enlace, lo que impide verificar el codigo fuente.
- El contenido de la model card esta generado automaticamente y esta dominado por elementos de presentacion (badges, SVG) mas que por informacion sustantiva del modelo.
- No apto para produccion sin una evaluacion empirica previa y una clarificacion contractual de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-v2
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (enlace tal como aparece en la card, con sintaxis malformada): https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web.
