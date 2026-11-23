# SZLHOLDINGS/salad-hatun24

## Resumen

salad-hatun24 es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face. El repositorio contiene pesos en formato safetensors con un tamano total de 1,2 GB, lo que sugiere un modelo de dimensiones reducidas, aunque la model card no declara arquitectura, numero de parametros ni longitud de contexto. El autor lo presenta como parte de su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo auditables).

La model card es fundamentalmente un contenedor de gobernanza: describe el sistema de receipts del autor, muestra graficos SVG deterministas generados a partir de una instantanea de auditoria (2026-11-20T03:48:04Z, etiquetada como MEASURED) y declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este en los ficheros de recibo es UNKNOWN. No se aportan datos sobre datos de entrenamiento, tokenizador, idiomas ni licencia.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: no hay benchmarks, no hay pipeline declarado y el escaneo de receipts del propio autor clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros de nombre similar a recibos pero sin un DONE.json estricto que valide evidencia de evaluacion. Cualquier uso en produccion requeriria inspeccionar los pesos directamente y validar el modelo por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 1,2 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El unico dato estructural es el formato de pesos (safetensors) y el tamano del repositorio (1,2 GB), compatible con un modelo de pocos miles de millones de parametros en precision reducida o con un modelo menor en fp32, pero esta estimacion no puede confirmarse sin inspeccionar los tensores.

Respecto al entrenamiento, la model card remite a "receipt files" del estate para cualquier afirmacion sobre datos, tokens o fases de alineacion (RLHF/DPO). El escaneo de receipts incluido en la propia card clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) pero no un DONE.json estricto con status=MEASURED, eval_rc=0 y timestamp. Por tanto, no hay evidencia validada de entrenamiento ni de evaluacion.

## Capacidades

- Generacion de texto: no confirmada; la model card no declara tarea ni pipeline.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas esta vacio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Auditoria de artefactos de gobernanza: el repositorio puede usarse como caso de estudio de un sistema de receipts y trazabilidad de modelos, inspeccionando la estructura de la model card y los SVG de auditoria.
- Evaluacion interna de pesos sin documentacion: un equipo puede cargar los safetensors con transformers o safetensors y determinar empiricamente arquitectura y parametros antes de decidir su uso.
- Prototipado de pipelines de validacion: util para probar herramientas que verifiquen presencia de DONE.json, coherencia de metadatos y claims de model cards.
- Docencia sobre riesgos de supply chain en Hugging Face: ejemplo real de repositorio con descargas cero, licencia ausente y claims no verificados.
- Experimentacion controlada en sandbox: si los pesos resultan ser un modelo de lenguaje pequeno, podria probarse en tareas de generacion simple, siempre con validacion previa y sin asumir calidad.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion con requisitos de calidad, ya que no existe evidencia medida de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de receipts clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con un repo de 1,2 GB, la carga en memoria rondaria ese orden de magnitud en el formato publicado, pero se desconoce la arquitectura y el numero de parametros.
- GPU recomendadas: no disponible; si el modelo es de pocos miles de millones de parametros, cabria en GPUs consumer con 8-24 GB de VRAM, pero es una suposicion no verificada.
- Cabe en GPU consumer: no confirmado.
- Opciones de despliegue: al ser safetensors, seria compatible con vLLM, TGI o transformers si la arquitectura es estandar; llama.cpp y Ollama requeririan conversion a GGUF, no disponible en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de datos de arquitectura, parametros y licencia impide identificar modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explicito de uso comercial ni de redistribucion; en ausencia de licencia, el uso por defecto es restrictivo.
- Sin evidencia de evaluacion: el propio autor clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de eval como UNKNOWN.
- Sin idiomas declarados: no puede asumirse soporte multilingue ni siquiera en castellano.
- Riesgo de alucinacion: no evaluable sin benchmarks ni pruebas propias.
- Sesgos conocidos: no disponible.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Metadatos incompletos: pipeline, arquitectura y tokenizador no declarados, lo que complica la integracion automatica en pipelines de inferencia.
- Fechas de creacion y actualizacion en 2026: verificar la coherencia temporal de los artefactos antes de confiar en los receipts citados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-hatun24
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
