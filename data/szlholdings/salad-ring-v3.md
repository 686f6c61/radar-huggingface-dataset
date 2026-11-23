# SZLHOLDINGS/salad-ring-v3

## Resumen

salad-ring-v3 es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face, identificado por el propio autor como parte de su "governed-AI estate": un conjunto de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibo (receipts). El repositorio contiene pesos en formato safetensors con un tamano total de 1,2 GB, lo que sugiere un modelo de pequeno o medio tamano, aunque la model card no especifica parametros, arquitectura ni contexto.

La informacion publicada es deliberadamente escasa y se centra en meta-datos de gobernanza (identidad del repo, charts SVG generados de forma determinista, avisos de honestidad) en lugar de en especificaciones tecnicas. El propio autor declara que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un recibo medido se considera UNKNOWN, y el escaneo de recibos de 2026-11-22 clasifica este repo como RECEIPT_FILES_NO_DONE, es decir, sin evidencia estricta de evaluacion.

Por tanto, la ficha solo puede documentar con certeza el formato de pesos, el tamano del repositorio y la ausencia de datos tecnicos verificables. No hay informacion sobre arquitectura, licencia, idiomas o rendimiento, lo que limita seriamente su evaluacion para uso en produccion.

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
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-18 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card unicamente indica que se trata de un "trained artifact in the governed factory" y remite a ficheros de recibo externos (estate mesh) para cualquier afirmacion sobre entrenamiento o evaluacion.

El escaneo de recibos de 2026-11-22 clasifica el repo como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) pero no hay un DONE.json estricto con status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento. La evidencia de evaluacion figura explicitamente como UNKNOWN. No se puede confirmar ninguna innovacion tecnica ni detalle del proceso de entrenamiento.

## Capacidades

- No se han documentado capacidades concretas (generacion de texto, razonamiento, codigo, matematicas, vision) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Auditoria de gobernanza de artefactos: el repo puede inspeccionarse como ejemplo de publicacion con recibos y charts SVG deterministas, util para equipos que disenen pipelines de trazabilidad de modelos.
- Verificacion de integridad de pesos: al estar en safetensors, puede cargarse en herramientas de inspeccion para comprobar shapes y tensores, aunque se desconoce la arquitectura subyacente.
- Experimentacion controlada en laboratorio: dado el tamano de 1,2 GB, es viable descargarlo y explorarlo en entornos aislados para estudiar su estructura interna.
- Docencia sobre model cards: sirve como caso practico de model card centrada en honestidad epistemica (etiquetas MEASURED/REPORTED/UNKNOWN) para ensenar buenas practicas de documentacion.
- Evaluacion de riesgos de supply chain: util para probar herramientas que detectan repositorios sin licencia, sin benchmarks y sin documentacion tecnica antes de integrarlos.
- Pruebas de pipelines de escaneo de recibos: permite validar clasificadores que distinguen RECEIPT_FILES_NO_DONE de DONE.json estricto en un estate de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de parametros y cuantizacion, datos no publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de repo de 1,2 GB sugiere que podria caber en GPUs de consumo con 8-16 GB en funcion de la arquitectura real, pero no hay datos que lo verifiquen.
- Opciones de despliegue: no disponible; al usar safetensors, seria compatible con frameworks que carguen este formato (transformers, vLLM, TGI) siempre que la arquitectura sea estandar, lo cual no esta confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen parametros, arquitectura, contexto y licencia del modelo, lo que impide establecer una categoria de comparacion.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin parametros, contexto, arquitectura ni idiomas, no es posible evaluar su idoneidad para ninguna tarea.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion; el uso en produccion queda bloqueado por incertidumbre legal.
- Sin evidencia de evaluacion: el propio autor clasifica la evidencia como UNKNOWN y el escaneo de recibos como RECEIPT_FILES_NO_DONE, por lo que no hay garantia de calidad ni de comportamiento.
- Riesgo de alucinacion y sesgos: no evaluables al no existir benchmarks ni documentacion de alineacion.
- Model card centrada en meta-datos: la mayor parte del contenido son charts SVG y avisos de gobernanza, no informacion funcional del modelo.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Fechas de creacion y actualizacion en 2026: conviene verificar la autenticidad y vigencia de los artefactos antes de cualquier integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card, URL malformada en el original): https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
