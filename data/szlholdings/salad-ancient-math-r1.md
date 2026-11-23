# SZLHOLDINGS/salad-ancient-math-r1

## Resumen

salad-ancient-math-r1 es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El nombre sugiere un ajuste orientado a matematicas y posiblemente a contenidos historicos o antiguos, pero la model card no explicita la tarea, el dataset ni el procedimiento de entrenamiento.

La informacion disponible es muy limitada. El repositorio ocupa 0,7 GB, lo que acota el peso de los tensores a un rango propio de modelos pequenos (del orden de cientos de millones de parametros en safetensors, dependiendo de la precision), pero no se declaran parametros, contexto, licencia ni idiomas. La model card es una plantilla generada automaticamente por su herramienta interna (estate-cards weaver v0.1.0) que prioriza la honestidad declarativa: afirma explicitamente que cualquier dato no respaldado por un recibo medido se etiqueta como UNKNOWN.

El propio sistema de recibos del autor clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no existe un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion cero y marca temporal. En consecuencia, no hay evidencia de evaluacion publicada. Cualquier uso en produccion requeriria una evaluacion independiente por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 0,7 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la documentacion disponible. La model card no describe si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado.

El unico dato estructural verificable es el tamano del repositorio (0,7 GB) y el formato de pesos (safetensors). El sistema de recibos del autor declara que las afirmaciones de entrenamiento y evaluacion de este artefacto viven en ficheros de recibos del "estate mesh", pero el escaneo estricto de 2026-11-22 no encontro un DONE.json valido, por lo que la evidencia de evaluacion se marca como UNKNOWN. El nombre del modelo sugiere un ajuste especializado en matematicas, pero no hay documentacion que lo confirme.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- No hay confirmacion de soporte de tool calling ni function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay confirmacion de capacidades multilingues ni de idiomas cubiertos.
- No hay confirmacion de modo de razonamiento (thinking mode), vision, audio ni otras modalidades.
- El nombre del repositorio sugiere orientacion a matematicas, pero se trata de una inferencia no verificada.

## Casos de uso

- Evaluacion experimental de matematicas: dado el nombre del artefacto, podria probarse en tareas aritmeticas o de resolucion de problemas, pero antes seria necesario validar su calidad con un conjunto de evaluacion propio, ya que no hay benchmarks publicados.
- Investigacion sobre trazabilidad de artefactos: el repositorio sirve como ejemplo del sistema de recibos y gobierno de modelos de SZLHOLDINGS, util para estudiar practicas de documentacion y auditoria de modelos.
- Pruebas de integracion con safetensors: al estar en formato safetensors, puede cargarse con bibliotecas estandar (transformers, safetensors) para verificar la integridad de los tensores y su compatibilidad con pipelines existentes.
- Prototipado interno con cuantizacion: si el modelo es pequeno (0,7 GB), podria caber en GPU de consumo tras conversion a GGUF, aunque la conversion y la validacion correrian por cuenta del usuario.
- Comparacion de artefactos en un catalogo: util para quien quiera contrastar practicas de publicacion entre distintos repositorios del mismo autor.
- Analisis de riesgos de adopcion: caso de estudio de un modelo sin licencia declarada ni evaluacion publicada, relevante para equipos que definen criterios de admision de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos de 2026-11-22 concluye que la evidencia de evaluacion es UNKNOWN.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Con un repositorio de 0,7 GB, la inferencia en fp16 requeriria del orden de 1,5 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 0,8 GB, y en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones a partir del tamano del repo, no datos del autor.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM podria albergarlo en cuantizacion, pero no hay confirmacion de que la arquitectura sea compatible con los runners habituales.
- GPU de consumo: probablemente si, dado el tamano, pero sin verificacion.
- Opciones de despliegue: no documentadas. El formato safetensors es compatible con transformers, vLLM y TGI en principio, y con llama.cpp/Ollama solo tras conversion a GGUF, que no se ofrece en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha publicado informacion sobre la tarea, el tamano ni el rendimiento de este artefacto, y el autor no ofrece una tabla de comparacion.

## Limitaciones y advertencias

- Ausencia total de evidencia de evaluacion: el sistema de recibos del propio autor clasifica el repositorio como RECEIPT_FILES_NO_DONE, sin DONE.json estricto ni resultados medidos.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia, los derechos quedan reservados por defecto en muchas jurisdicciones.
- Idiomas no declarados: no hay garantia de cobertura multilingue ni de calidad en castellano.
- Arquitectura y parametros desconocidos: impide estimar con precision requisitos de hardware, latencia y coste.
- Riesgo de alucinacion: sin datos de alineacion ni evaluaciones, el riesgo es indeterminado y probablemente alto para uso en produccion.
- Sesgos: no documentados; sin informacion sobre la composicion del dataset no es posible evaluar sesgos de dominio, idioma o geografia.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Nombre potencialmente enganoso: "ancient-math" sugiere una especializacion que no esta respaldada por documentacion tecnica.
- Fecha de creacion futura (2026-11-18): conviene verificar la autenticidad y el origen del artefacto antes de cualquier adopcion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ancient-math-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de cards (referenciada): https://github.com/szl-holdings/estate-cards
