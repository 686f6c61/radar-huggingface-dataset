# SZLHOLDINGS/salad-ring-ouro-l80

## Resumen

`salad-ring-ouro-l80` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate de IA gobernada" (*governed-AI estate*), un conjunto de modelos, datasets y Spaces con trazabilidad documental. El repositorio se creo el 19 de noviembre de 2026 y se actualizo el 23 de noviembre de 2026, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes. La model card no declara arquitectura, numero de parametros, longitud de contexto ni composicion del dataset de entrenamiento.

La caracteristica definitoria del artefacto no es tecnica en el sentido habitual, sino de gobernanza: el autor afirma que cualquier cifra de entrenamiento o evaluacion debe residir en ficheros de "recibo" (*receipts*) verificables y fechados, y que lo no acreditado se marca explicitamente como UNKNOWN. El propio escaneo de recibos incluido en la card (tranche 6, chunk 9, del 22 de noviembre de 2026) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`. La evidencia de evaluacion figura por tanto como UNKNOWN.

En la practica, esto significa que no es posible evaluar el modelo con los criterios habituales (rendimiento, tamano, capacidades, licencia). La ficha que sigue documenta lo que la informacion disponible permite afirmar y marca como "no disponible" todo lo demas, sin inferencias. La busqueda web asociada no devuelve ningun resultado relacionado con el modelo: el unico enlace encontrado es un documento del Financial Stability Board sobre stablecoins, sin conexion con este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Pipeline declarado | no disponible |
| Etiquetas del repositorio | region:us |
| Fecha de creacion | 2026-11-19T01:32:09Z |
| Fecha de ultima actualizacion | 2026-11-23T01:05:45Z |
| Descargas / likes | 0 / 0 |
| Estado de evidencia (escaneo del autor) | `RECEIPT_FILES_NO_DONE`, eval UNKNOWN |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM), un modelo hibrido ni ninguna otra variante. Tampoco se indican dimensiones de capas, numero de cabezas de atencion, vocabulario ni funcion de activacion.

Respecto al entrenamiento, la card remite a "ficheros de recibo" alojados en el mesh del estate del autor, pero el escaneo estricto incluido en el propio repositorio concluye que no existe un `DONE.json` que cumpla el umbral (`status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento). El unico fichero con nombre de recibo localizado es `assets/szl-card/mesh-receipts.svg`, que el autor describe como "coincidencia por palabra clave, no validada como evidencia". No hay datos sobre numero de tokens de entrenamiento, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- No se declara ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision) en la informacion disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: el campo de idiomas figura como no disponible.
- No se documenta ningun modo especial (thinking mode, vision, audio, decodificacion extendida).
- El autor afirma explicitamente que no se realiza ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos, y que en este repositorio dichos recibos no alcanzan el umbral estricto.

## Casos de uso

- Auditoria de gobernanza de artefactos: el repositorio puede utilizarse como ejemplo de estructura de recibos y marcado de evidencia (MEASURED/REPORTED/UNKNOWN) para disenar pipelines internos de trazabilidad de modelos; es adecuado por su esquema explicito de estados de evidencia, no por sus capacidades de inferencia.
- Verificacion de cadenas de custodia documental: un equipo de compliance puede estudiar como el autor separa afirmaciones verificadas de afirmaciones no acreditadas mediante ficheros fechados y hashes de tarjeta (`Card id 92b737310cc9587a`).
- Prueba de integracion de visores de tarjetas generadas: los SVG deterministicos incluidos (`org-context.svg`, `mesh-receipts.svg`) sirven para validar renderizado de tarjetas generadas por herramientas stdlib en documentacion interna.
- Formacion en practicas de model cards: el repositorio ilustra un caso de tarjeta sin datos tecnicos y con estado de evidencia negativo, util como material docente sobre que no debe considerarse evidencia suficiente.
- No se recomienda su uso para inferencia en produccion, generacion de codigo, atencion al cliente ni ninguna tarea downstream, dado que no hay pesos, arquitectura ni licencia documentados en la informacion disponible.
- No se recomienda su uso como base para fine-tuning sin antes verificar en el repositorio de origen la existencia de pesos, licencia y recibos de entrenamiento validos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El escaneo de recibos del propio autor clasifica la evidencia de evaluacion como UNKNOWN y no se afirma ninguna cifra de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables porque se desconocen el tamano, la arquitectura, la tarea y la licencia de `salad-ring-ouro-l80`. Cualquier comparacion con modelos de la misma categoria exigiria, como minimo, el numero de parametros y el dominio de uso, datos que no figuran en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se declaran arquitectura, parametros, contexto, cuantizaciones ni formato de pesos, lo que impide planificar su despliegue.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido; debe consultarse el repositorio de origen antes de cualquier utilizacion.
- Evidencia de evaluacion UNKNOWN: el escaneo estricto del autor no encuentra un `DONE.json` valido, por lo que no existe ninguna medicion de calidad acreditada.
- Riesgo de confusion con artefactos reales: el nombre y la estructura de la tarjeta no garantizan que existan pesos entrenados; el estado `RECEIPT_FILES_NO_DONE` sugiere que la cadena de evidencia esta incompleta.
- Idiomas no declarados: no puede asumirse cobertura multilingue ni un rendimiento concreto en castellano.
- Riesgo de alucinacion: no evaluable sin pesos ni pruebas; no se dispone de informacion para estimarlo.
- Sesgos conocidos: no documentados.
- Cero adopcion observable (0 descargas, 0 likes) y ausencia de resultados de busqueda web relacionados, lo que reduce la probabilidad de encontrar reportes independientes de uso.
- Para produccion: no apto sin verificacion previa en el repositorio de origen de pesos, licencia y recibos de evaluacion medidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l80
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
- Documento del Financial Stability Board hallado en la busqueda web (sin relacion con el modelo): https://www.fsb.org/2026/10/global-stablecoin-arrangements-cross-border-vulnerabilities-and-financial-stability-monitoring/
