# SZLHOLDINGS/salad-physics-r1

## Resumen

salad-physics-r1 es un modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de artefactos (modelos, datasets y Spaces) que la organizacion presenta con enfasis en trazabilidad y resultados verificables. El repositorio de Hugging Face ocupa 0,7 GB y contiene pesos en formato safetensors bajo licencia Apache 2.0. La model card no declara arquitectura, numero de parametros, longitud de contexto ni idiomas soportados; se limita a describir el marco de gobernanza y auditoria del autor.

La propia model card es explicita sobre la ausencia de evidencia medida: indica que cualquier afirmacion de entrenamiento o evaluacion debe residir en ficheros de "receipts" y que, en el momento de la auditoria citada (2026-11-22), no existe un fichero DONE.json con estado MEASURED, por lo que la evidencia de evaluacion se marca como UNKNOWN. El escaneo clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de receipt (un SVG de "mesh-receipts"), pero no validados como evidencia.

Por tanto, la relevancia practica del modelo es limitada a fecha de la informacion disponible: no hay benchmarks, no hay descripcion de arquitectura ni de datos de entrenamiento, y el propio autor declara no afirmar ningun numero mas alla de lo medido en una auditoria con fecha. Esta ficha documenta lo que existe y marca explicitamente como "no disponible" todo lo que la informacion proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-18 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se documenta el numero de parametros, la longitud de contexto nativa ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la card indica que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de receipt del "estate mesh" y que cualquier dato no registrado alli se considera UNKNOWN. El escaneo estricto de receipts de 2026-11-22 no encontro un DONE.json con estado MEASURED, eval_rc=0 y marca temporal, por lo que no hay evidencia validada de dataset, numero de tokens, composicion de datos ni fases de RLHF o DPO. La nota de licencia del estate senala que la etiqueta apache-2.0 se fijo el 2026-11-25 por operaciones del propio autor, sin evidencia de licencia upstream por fichero.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues ni de idiomas cubiertos.
- No hay evidencia de modo de razonamiento (thinking mode), vision, audio ni otras modalidades.
- El nombre del repositorio sugiere un enfoque tematico en fisica, pero la model card no lo confirma ni lo detalla.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas sin informacion sobre arquitectura, tamano, contexto y capacidades. Los siguientes escenarios son genericos y quedan condicionados a la validacion previa del modelo:

- Evaluacion experimental en laboratorio: el modelo podria emplearse como artefacto de prueba en pipelines de investigacion, siempre que se realice una evaluacion propia antes de cualquier uso, dado que no hay benchmarks publicados.
- Reproduccion de auditorias de gobernanza: util para estudiar el formato de receipts y el marco de trazabilidad propuesto por SZLHOLDINGS, no por sus capacidades de modelado.
- Pruebas de integracion con safetensors: al publicarse pesos en safetensors, podria cargarse con librerias estandar (transformers, safetensors) para verificar su estructura, sin garantia de que el checkpoint sea funcional.
- Comparacion de licencias en entornos corporativos: la licencia Apache 2.0 permite uso comercial segun los terminos habituales, aunque el autor no aporta evidencia de licencia upstream por fichero, lo que exige revision legal adicional.
- Docencia sobre practicas de publicacion de modelos: sirve como ejemplo de model card que declara explicitamente la ausencia de evidencia medida.
- Cualquier caso de uso en produccion (atencion al cliente, generacion de codigo, analisis documental) queda descartado hasta que existan benchmarks y especificaciones verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria con fecha y que la evidencia de evaluacion es UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros. El tamano del repositorio (0,7 GB) sugiere un checkpoint relativamente pequeno, pero no permite inferir la VRAM necesaria sin conocer la arquitectura y la precision de los pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con la informacion disponible.
- Opciones de despliegue: al publicarse en safetensors, es tecnicamente posible cargarlo con librerias compatibles (transformers, vLLM, TGI) si la arquitectura es estandar, pero no hay confirmacion por parte del autor. No se documentan variantes GGUF ni soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del modelo (tamano, tarea, modalidad), por lo que no es posible establecer una comparacion rigurosa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-physics-r1 | no disponible | no disponible | apache-2.0 | Hugging Face, safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se declaran parametros, contexto, arquitectura ni idiomas, lo que impide evaluar su idoneidad para cualquier tarea.
- Ausencia de benchmarks: el autor declara explicitamente que no afirma ningun numero sin receipt medido, y el escaneo estricto no encontro evidencia valida.
- Riesgo de alucinacion: no evaluable sin benchmarks ni documentacion de entrenamiento.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no documentadas.
- Licencia: la etiqueta apache-2.0 fue fijada por el propio autor sin evidencia de licencia upstream por fichero, lo que introduce incertidumbre legal para uso comercial en produccion.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline declarado.
- Recomendacion: no utilizar en produccion sin una evaluacion independiente previa que cubra arquitectura, calidad, sesgos y cumplimiento de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-physics-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
