# SZLHOLDINGS/salad-ring-ouro-l1

## Resumen

salad-ring-ouro-l1 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con trazabilidad declarada y resultados verificables. El repositorio tiene un tamano de 1,2 GB y contiene pesos en formato safetensors, aunque la model card no especifica arquitectura, numero de parametros, longitud de contexto ni datos de entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: la propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion no documentada en sus ficheros de "receipts" debe considerarse desconocida (UNKNOWN). El escaneo de receipts de la familia salad indica que no existe un DONE.json estricto con estado MEASURED, por lo que no hay evidencia de evaluacion validada. La licencia apache-2.0 fue asignada por operaciones del estate el 25 de noviembre de 2026 sin evidencia de licencia upstream por fichero.

En consecuencia, esta ficha documenta lo que el autor declara y marca como "no disponible" todo aquello que no aparece en la informacion proporcionada. No se debe asumir ninguna capacidad, tamano o rendimiento que no este explicitamente receipted.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (asignada por el estate el 2026-11-25, sin evidencia upstream por fichero) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) en la model card ni en los metadatos del repositorio. El unico dato estructural disponible es el tamano del repositorio, 1,2 GB, y el uso de safetensors como formato de pesos, lo que sugiere un artefacto de tamano pequeno o mediano, pero no permite inferir el numero de parametros con rigor.

Respecto al entrenamiento, la model card declara que las afirmaciones sobre entrenamiento y evaluacion viven en los ficheros de receipts del estate y que cualquier cosa no receipted se considera UNKNOWN. El escaneo estricto de la familia salad (tranche 6, chunk 3, 2026-11-22) clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de receipt (concretamente assets/szl-card/mesh-receipts.svg, una coincidencia por palabra clave no validada como evidencia), pero no existe un DONE.json con status=MEASURED, eval_rc=0 y timestamp. No se dispone de datos sobre volumen de tokens, composicion del dataset, RLHF, DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia receipted que la respalde.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos con garantias tecnicas, dado que no hay especificaciones de arquitectura, contexto, capacidades ni evaluacion validadas. Los siguientes escenarios son los unicos planteables de forma prudente, y siempre con caracter exploratorio y bajo propia validacion:

- Auditoria de artefactos del estate SZLHOLDINGS: inspeccionar los pesos y los receipts para verificar que el repositorio cumple el estandar declarado antes de cualquier uso.
- Pruebas de integridad de safetensors: cargar los pesos con librerias estandar para comprobar que el artefacto es consistente y que el tamano de 1,2 GB corresponde a lo esperado.
- Evaluacion interna ad hoc: ejecutar una bateria propia de prompts para determinar empiricamente si el modelo genera texto coherente, dado que el autor no aporta benchmarks.
- Reproducibilidad de pipelines gobernados: usar el repositorio como ejemplo de estructura de receipts y model card generada por el weaver del estate, no como modelo de produccion.
- Docencia sobre trazabilidad de modelos: ilustrar como una model card puede declarar UNKNOWN en lugar de inventar cifras, y como se audita un receipt.
- Integracion condicionada a validacion: solo tras confirmar mediante pruebas propias que el modelo funciona para la tarea objetivo, con fallback y monitorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de receipts estricto concluye eval evidence: UNKNOWN (no strict DONE.json).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de parametros y cuantizacion, que no se declaran. El tamano de repositorio de 1,2 GB sugiere que los pesos en safetensors podrian caber en GPU de consumo, pero no es una conclusion verificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; a validar tras inspeccionar los tensores.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque no se ha especificado la categoria, el tamano ni la tarea del modelo. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin arquitectura, parametros, contexto ni idiomas declarados, es imposible dimensionar el modelo o planificar su despliegue.
- Sin evidencia de evaluacion: el escaneo estricto de receipts devuelve UNKNOWN; no hay DONE.json con status=MEASURED ni eval_rc=0.
- Riesgo de alucinacion: no evaluado; no hay datos que permitan estimarlo.
- Sesgos conocidos: no documentados.
- Licencia: apache-2.0 asignada por operaciones del estate el 2026-11-25 sin evidencia de licencia upstream por fichero; para uso comercial en produccion conviene verificar la procedencia de los pesos antes de asumir los terminos.
- Ficheros de receipt no validados: assets/szl-card/mesh-receipts.svg es una coincidencia por palabra clave, no evidencia de evaluacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.
- Fechas del repositorio (creado 2026-11-17, actualizado 2026-11-25) posteriores a la mayoria de referencias publicas; tratarlas con cautela.
- No apto para produccion sin validacion empirica previa por parte del usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (canonical source declarado): https://github.com/szl-holdings
- Repositorio del generador de cards (estate-cards): https://github.com/szl-holdings/estate-cards
