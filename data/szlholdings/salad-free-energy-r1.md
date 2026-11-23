# SZLHOLDINGS/salad-free-energy-r1

## Resumen

salad-free-energy-r1 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su "governed-AI estate", una coleccion de modelos, datasets y Spaces que la organizacion presenta con resultados "receipted" (con recibos de auditoria) y verificables. El repositorio se creo el 18 de noviembre de 2026 y se actualizo el 23 de noviembre de 2026, con un tamano de 0,7 GB y pesos en formato safetensors. No consta pipeline declarado, licencia, idiomas ni parametros en la informacion disponible.

La model card no describe arquitectura, datos de entrenamiento ni capacidades del modelo. En su lugar, documenta el sistema de evidencias de la organizacion: graficos SVG generados de forma determinista a partir de una instantanea de auditoria fechada el 20 de noviembre de 2026, y una seccion de "honesty" que declara explicitamente que cualquier afirmacion no respaldada por un recibo de evaluacion se etiqueta como UNKNOWN. La propia seccion RECEIPTS indica que no existe un DONE.json estricto (status=MEASURED, eval_rc=0) y que la evidencia de evaluacion es UNKNOWN.

Por tanto, la relevancia de este repositorio no esta en sus capacidades tecnicas demostradas, sino como ejemplo de publicacion de artefactos con trazabilidad de evidencias: el autor separa explicitamente lo medido de lo desconocido. Para un desarrollador o investigador que evalue el modelo, la conclusion practica es que no hay datos suficientes para determinar su utilidad, su rendimiento ni sus condiciones de uso.

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
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) ni sobre el volumen o composicion de los datos de entrenamiento. La model card no menciona tecnicas de alineacion como RLHF, DPO o SFT, ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

Lo unico que el autor afirma sobre el entrenamiento es que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro de la malla del estate, y que cualquier cosa no recibida en la propia card se considera UNKNOWN. La seccion RECEIPTS confirma que en este repositorio solo se encontro un fichero con nombre de recibo (assets/szl-card/mesh-receipts.svg), coincidente por palabra clave y no validado como evidencia, sin DONE.json estricto.

## Capacidades

- No se documenta ninguna capacidad funcional del modelo en la informacion disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta soporte multilingue declarado.
- No consta modo de razonamiento (thinking), vision, audio ni ninguna modalidad adicional.
- El unico contenido verificable del repositorio son los graficos SVG de contexto del estate y de familias de recibos, generados con Python de la biblioteca estandar a partir de una instantanea de auditoria.

## Casos de uso

- Auditoria de publicacion de artefactos: el repositorio puede usarse como referencia de como separar afirmaciones medidas de afirmaciones desconocidas en una model card, con etiquetas MEASURED/REPORTED/UNKNOWN y marca temporal de captura.
- Verificacion de cadena de evidencias: un equipo de gobernanza de IA puede estudiar el esquema de recibos (DONE.json con status, eval_rc y timestamp) como plantilla para sus propios pipelines de validacion.
- Evaluacion de riesgos de dependencia: antes de integrar un modelo de un tercero, este caso ilustra la necesidad de comprobar si existe evidencia de evaluacion estricta antes de desplegar en produccion.
- Docencia sobre honestidad en model cards: util como ejemplo negativo de ficha de modelo, ya que no incluye arquitectura, datos ni benchmarks.
- Trazabilidad de artefactos en un estate: el patron de generacion determinista de SVG con Python de la biblioteca estandar es reutilizable para paneles de estado internos.
- No se recomienda ningun caso de uso de inferencia (generacion de texto, codigo, atencion al cliente, RAG o similares) porque no hay evidencia de capacidades ni de evaluacion del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y la seccion RECEIPTS clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (0,7 GB) sugiere pesos de pequena magnitud, pero sin conocer el numero de parametros ni la precision de almacenamiento no puede derivarse una estimacion fiable de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. El formato safetensors es compatible con stacks habituales, pero se desconoce si existe configuracion de modelo, tokenizer o arquitectura que permita cargarlo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la categoria del modelo (tamano, tarea, modalidad), por lo que no es posible seleccionar alternativas comparables sin inventar datos.

| Modelo | Parametros | Contexto | Licencia | Evidencia de evaluacion |
|---|---|---|---|---|
| salad-free-energy-r1 | no disponible | no disponible | no disponible | UNKNOWN (sin DONE.json estricto) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto, idiomas ni licencia, lo que impide evaluar su idoneidad para cualquier tarea.
- Sin evidencia de evaluacion: la propia seccion RECEIPTS del autor clasifica la evidencia como UNKNOWN y senala que no existe DONE.json estricto con status=MEASURED.
- Riesgo de alucinacion: no evaluable, al no existir benchmarks ni pruebas de calidad publicadas.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion hasta que el autor lo aclare.
- Idiomas no declarados: no puede confirmarse soporte de castellano ni de ninguna otra lengua.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de uso ni de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion en 2026: conviene verificar la coherencia temporal de los metadatos antes de citar el repositorio.
- El contenido de la model card es predominantemente meta-documental (graficos de estado, esquema de recibos) y no funcional; no debe interpretarse como evidencia de capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-free-energy-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
