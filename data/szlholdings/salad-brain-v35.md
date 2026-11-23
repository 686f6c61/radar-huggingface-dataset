# SZLHOLDINGS/salad-brain-v35

## Resumen

salad-brain-v35 es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face, dentro de lo que el autor denomina un "estate" de IA gobernada con resultados verificables y trazables. El repositorio contiene pesos en formato safetensors con un tamano total de 1.2 GB, lo que sugiere un modelo de pequeno o medio tamano, aunque la model card no especifica parametros, arquitectura ni contexto.

La model card del autor no documenta ninguna especificacion tecnica del modelo: no hay informacion sobre arquitectura, datos de entrenamiento, tokenizador, idiomas o licencia. El contenido se centra en meta-informacion sobre el proceso de auditoria del "estate" (graficos SVG deterministicos, ficheros de recibos, estados MEASURED/REPORTED/UNKNOWN) y declara explicitamente que cualquier afirmacion de calidad o capacidad es UNKNOWN hasta que existan recibos de evaluacion medidos.

La relevancia actual de este artefacto es limitada desde el punto de vista tecnico: se trata de un repositorio sin documentacion de uso, sin benchmarks publicados y sin evidencia de evaluacion estricta (el propio autor lo clasifica como RECEIPT_FILES_NO_DONE). Para un desarrollador o investigador que necesite evaluar el modelo, la informacion disponible es insuficiente para determinar su utilidad, su rendimiento o sus condiciones de uso.

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
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. El unico dato estructural disponible es el formato de pesos (safetensors) y el tamano del repositorio (1.2 GB), que no permite inferir de forma fiable el numero de parametros ni la familia arquitectonica.

Respecto al entrenamiento, la model card declara que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibos" del mesh del estate, y que cualquier cosa no registrada en esos recibos es UNKNOWN. El escaneo de recibos citado en la propia tarjeta clasifica el repositorio como RECEIPT_FILES_NO_DONE y marca la evidencia de evaluacion como UNKNOWN, sin ningun DONE.json estricto con status=MEASURED. No hay datos sobre numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas.

## Capacidades

- Generacion de texto: no confirmada; la model card no documenta ninguna capacidad funcional.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- El autor declara explicitamente que no se afirma ninguna capacidad sin recibos de evaluacion medidos.

## Casos de uso

No es posible proponer casos de uso concretos y realistas con la informacion disponible. La model card no documenta tarea, dominio, idioma ni formato de entrada/salida, y el propio autor marca la evidencia de evaluacion como UNKNOWN. Cualquier escenario de aplicacion (atencion al cliente, generacion de codigo, analisis documental, etc.) seria especulativo y no estaria respaldado por los datos del repositorio. Hasta que se publiquen recibos de evaluacion medidos y una descripcion funcional del artefacto, no se puede recomendar su uso en produccion ni en investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de parametros y cuantizacion, datos no publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el numero de parametros; el tamano del repositorio (1.2 GB) sugiere que los pesos podrian caber en GPUs de consumo con 8-16 GB de VRAM, pero es una inferencia no confirmada.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors, seria tecnicamente compatible con runners genericos (transformers, vLLM, TGI) si existiera una configuracion de modelo valida, extremo no verificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de datos sobre parametros, contexto, licencia y rendimiento impide establecer una comparacion significativa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| salad-brain-v35 | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: sin arquitectura, parametros, contexto ni tokenizador publicados.
- Evidencia de evaluacion marcada como UNKNOWN por el propio autor; el repositorio no alcanza el umbral estricto de recibos medidos (RECEIPT_FILES_NO_DONE).
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; tratar como no apto para produccion hasta aclaracion.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de datos de entrenamiento.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en ningun otro idioma.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La model card contiene afirmaciones de gobernanza y trazabilidad (recibos, auditorias) que no sustituyen a especificaciones tecnicas verificables del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-brain-v35
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
