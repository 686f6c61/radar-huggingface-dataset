# SZLHOLDINGS/salad-pg54-codex-v1

## Resumen

salad-pg54-codex-v1 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate de IA gobernada": un conjunto de repositorios con trazabilidad declarativa, receipts de auditoria y etiquetado de honestidad sobre lo que se ha medido y lo que no. El repositorio contiene pesos en formato safetensors con un tamano total de 1,0 GB y se distribuye bajo licencia Apache 2.0.

La model card no declara arquitectura, numero de parametros, longitud de contexto, idiomas soportados ni pipeline de inferencia. El propio autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion "vive en sus ficheros de receipt" y que lo no acreditado se etiqueta como UNKNOWN. La seccion de receipts del repositorio confirma que no existe un fichero `DONE.json` en el estandar estricto del estate, por lo que la evidencia de evaluacion se clasifica como UNKNOWN (clase de escaneo `RECEIPT_FILES_NO_DONE`).

Por tanto, esta ficha documenta un artefacto con licencia permisiva y pesos publicados, pero sin especificaciones tecnicas verificables ni resultados de rendimiento medidos. Es relevante para quien rastree el ecosistema de modelos gobernados o quiera auditar la trazabilidad de SZLHOLDINGS, no como base para una decision de despliegue en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 1,0 GB; no implica un numero de parametros concreto) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declara safetensors como formato) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La unica informacion relacionada con el proceso es de caracter meta: el autor declara que las afirmaciones de entrenamiento y evaluacion deben consultarse en los ficheros de receipt del "estate mesh", y que el escaneo estricto de receipts (tranche 6, chunk 3, 2026-11-22) no encontro un `DONE.json` con `status=MEASURED`, `eval_rc=0` y timestamp. El unico fichero con nombre de receipt presente es `assets/szl-card/mesh-receipts.svg`, que el propio autor advierte que es una coincidencia por palabra clave y no evidencia validada. No se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto: no confirmada por el autor; no hay evidencia medida ni declaracion de capacidades.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta poblado).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Trazabilidad y gobernanza: el repositorio incorpora un sistema declarativo de receipts y etiquetado MEASURED/REPORTED/UNKNOWN, pero sin evidencia estricta adjunta en este artefacto.

## Casos de uso

- Auditoria de trazabilidad de modelos: el artefacto sirve como caso de estudio de un pipeline de receipts declarativo; un equipo de gobernanza puede inspeccionar como SZLHOLDINGS etiqueta la evidencia faltante y que estructura de ficheros espera en su estandar estricto.
- Verificacion de licencias en cadenas de suministro: con licencia Apache 2.0 declarada y una nota del estate que reconoce que la etiqueta se fijo por precedente interno sin evidencia por fichero, es util para probar procesos de revision de licencias en catalogo.
- Evaluacion comparativa propia: dado el tamano del repo (1,0 GB) y el formato safetensors, un investigador puede descargarlo y ejecutar su propio arnes de evaluacion para determinar que tarea cubre realmente, sin depender de afirmaciones del autor.
- Pruebas de infraestructura de descarga y despliegue: util para validar pipelines de ingesta de artefactos desde Hugging Face (descarga, verificacion de checksum, carga en runtime) con un modelo de peso moderado.
- Docencia sobre documentacion de modelos: la model card es un ejemplo atipico de documentacion centrada en honestidad epistemica (marcar UNKNOWN en lugar de inventar), aprovechable en formacion sobre buenas practicas de fichas tecnicas.
- Investigacion sobre ecosistemas de modelos gobernados: permite estudiar la relacion entre etiquetas de licencia, receipts y evidencia medida en repositorios de una misma organizacion.
- No recomendado como base de produccion sin evaluacion previa: al no haber benchmarks, contexto declarado ni idiomas, cualquier uso en atencion al cliente, generacion de codigo o agentes requeriria primero una caracterizacion completa del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluacion es UNKNOWN al no existir un `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repo (1,0 GB) solo acota el almacenamiento de los pesos en el formato publicado; no permite derivar VRAM sin conocer el numero de parametros y la precision de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la informacion publicada; un repo de 1,0 GB sugiere un modelo de pequeno o medio tamano, pero es una inferencia no verificada.
- Opciones de despliegue: no se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningun otro runtime. El formato safetensors es el unico dato confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no identifica categoria, tamano ni tarea, por lo que no es posible emparejarlo con alternativas de la misma clase sin datos de parametros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| salad-pg54-codex-v1 | no disponible | no disponible | apache-2.0 | no disponible | safetensors en Hugging Face |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto ni idiomas, lo que impide planificar capacidad, coste o latencia.
- Sin evidencia de evaluacion: el propio autor clasifica la evidencia como UNKNOWN y confirma que no hay `DONE.json` estricto; cualquier afirmacion de calidad seria una extrapolacion no soportada.
- Licencia con caveat interno: la etiqueta apache-2.0 se fijo el 2026-11-25 por operaciones del estate "por precedente interno de rank-1" y el autor reconoce que "no per-file upstream license evidence claimed". Para uso comercial conviene verificar la procedencia de los pesos de forma independiente.
- Riesgo de alucinacion y sesgos: no evaluable sin benchmarks ni documentacion de datos de entrenamiento.
- Cero adopcion observable: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en la comunidad.
- Ficheros de receipt no validados: el unico fichero con nombre de receipt es un SVG de tarjeta, que el autor descarta como evidencia.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-18, lo que conviene contrastar con la fecha real de consulta antes de tratarlo como artefacto estable.
- No apto para produccion sin evaluacion previa: al no existir datos de rendimiento, idiomas ni contexto, cualquier despliegue requiere una caracterizacion completa por parte del equipo adoptante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-pg54-codex-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referencia canonica citada por el autor): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas del estate: https://github.com/szl-holdings/estate-cards
- Paper: no disponible
- Blog o demo: no disponible
