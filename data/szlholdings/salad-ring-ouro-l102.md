# SZLHOLDINGS/salad-ring-ouro-l102

## Resumen

Salad-ring-ouro-l102 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados verificables mediante recibos de auditoria. El repositorio no documenta ni la arquitectura, ni el tamano, ni el contexto, ni los datos de entrenamiento del modelo: la model card se limita a describir el marco de gobernanza y trazabilidad de la organizacion y a declarar explicitamente que cualquier dato no respaldado por un recibo medido se considera desconocido (UNKNOWN).

La propia model card reconoce que el artefacto no alcanza el umbral estricto de evidencia de la organizacion: la exploracion de recibos de 2026-11-22 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, existen ficheros con nombre de recibo pero no un DONE.json con estado MEASURED, codigo de salida de evaluacion cero y marca temporal. En consecuencia, no hay evidencia de evaluacion ni ninguna afirmacion de calidad o capacidad medida.

Su relevancia actual es limitada y fundamentalmente metodologica: sirve como ejemplo de publicacion de modelos con disciplina de procedencia (source-linked, receipts, etiquetado MEASURED/REPORTED/UNKNOWN) y como caso de estudio de un repositorio sin datos tecnicos verificables. La licencia apache-2.0 fue asignada por operaciones del estate el 2026-11-25 sin evidencia de licencia upstream por fichero, segun la propia nota del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido, ni detalla numero de capas, dimensiones ocultas, mecanismo de atencion o funcion de activacion.

Tampoco hay datos sobre el entrenamiento: no se indica el volumen de tokens, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La seccion de recibos del repositorio indica explicitamente que la evidencia de evaluacion es UNKNOWN y que no existe un recibo de entrenamiento validado al umbral estricto de la organizacion. Cualquier afirmacion sobre el proceso de entrenamiento seria, por tanto, especulativa.

## Capacidades

- No se documenta ninguna capacidad concreta del modelo en la informacion disponible.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en los metadatos de Hugging Face).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- La unica capacidad verificable del artefacto es su existencia como repositorio de modelo con licencia apache-2.0 y su integracion en el marco de trazabilidad del estate SZLHOLDINGS.

## Casos de uso

- Auditoria de gobernanza de modelos: el repositorio puede usarse como ejemplo de estructura de recibos y etiquetado de evidencia (MEASURED/REPORTED/UNKNOWN) en procesos internos de revision de artefactos de IA, dado que la model card documenta el esquema de trazabilidad con marcas temporales y un identificador de tarjeta (984a085952043f57).
- Estudio de casos de publicacion incompleta: util para analizar como un repositorio puede quedar clasificado como RECEIPT_FILES_NO_DONE y que consecuencias tiene para la reproducibilidad, comparando el contenido del repositorio con el umbral estricto definido por la organizacion.
- Prueba de pipelines de catalogacion: un equipo puede usar el repositorio como entrada de prueba para herramientas que extraen metadatos de Hugging Face (tags, licencia, fechas de creacion y actualizacion) y detectan campos vacios o ausentes.
- Validacion de herramientas de escaneo de recibos: sirve para verificar que un escaner de repositorios identifica correctamente ficheros con nombre de recibo que no constituyen evidencia valida (por ejemplo, assets/szl-card/mesh-receipts.svg).
- Docencia sobre higiene de datos en model cards: el contraste entre el aparato visual de la tarjeta (insignias, SVG deterministicos) y la ausencia de especificaciones tecnicas es un ejemplo didactico de por que la presentacion no sustituye a la evidencia.
- Integracion en un registro interno de artefactos con licencia permisiva: dado que la licencia es apache-2.0, el repositorio puede registrarse en inventarios de activos con permisos de uso comercial, siempre que se documente que no hay evidencia tecnica de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y la seccion de recibos indica que la evidencia de evaluacion es UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas (A100, H100, RTX 4090, etc.): no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible; no se documenta ningun formato de pesos (safetensors, GGUF u otros) que permita seleccionar un runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del modelo (tamano, tarea, modalidad) ni, por tanto, seleccionar alternativas comparables en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se conocen arquitectura, parametros, contexto ni formato de pesos, lo que impide evaluar su idoneidad para cualquier tarea.
- Sin evidencia de evaluacion: la exploracion de recibos de 2026-11-22 clasifica el repositorio como RECEIPT_FILES_NO_DONE y marca la evidencia de evaluacion como UNKNOWN; no hay mediciones de calidad, sesgo o robustez.
- Riesgo de alucinacion y sesgos: no evaluables al no existir datos de entrenamiento ni evaluaciones publicadas.
- Licencia con salvedad de procedencia: la etiqueta apache-2.0 fue asignada por operaciones del estate el 2026-11-25 sin evidencia de licencia upstream por fichero, segun la propia nota del autor; conviene verificar derechos antes de un uso comercial en produccion.
- Idiomas no declarados: el campo de idiomas aparece vacio en los metadatos, por lo que no puede confirmarse soporte multilingue.
- Sin adopcion verificable: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de uso o fallos.
- No apto para produccion sin validacion previa: al no haber recibos medidos ni artefactos de pesos documentados, cualquier despliegue requeriria una evaluacion propia completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l102
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas del estate: https://github.com/szl-holdings/estate-cards
