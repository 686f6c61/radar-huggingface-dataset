# SZLHOLDINGS/salad-ring-ouro-l96

## Resumen

`salad-ring-ouro-l96` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad a la fuente. El repositorio se presenta explicitamente como un artefacto entrenado dentro de una "factoría gobernada", con enfasis en la honestidad de las metricas: la propia model card declara que cualquier afirmacion de entrenamiento o evaluacion debe residir en ficheros de recibos (receipts) auditables, y que lo que no este ahi es UNKNOWN.

La model card es deliberadamente escasa en especificaciones tecnicas. No se declara arquitectura, numero de parametros, longitud de contexto, tokenizador, idiomas ni licencia. El nombre sugiere una variante de la familia "salad" con un identificador "ouro-l96", pero no se ofrece ninguna explicacion de esa nomenclatura ni de su significado tecnico. La fecha de creacion (2026-11-19) y la de actualizacion (2026-11-23) son las unicas referencias temporales disponibles, junto con la instantanea de auditoria citada en la card (2026-11-20T03:48:04Z).

El interes actual del repositorio es, por tanto, metodologico mas que de rendimiento: ejemplifica un patron de publicacion de modelos basado en recibos y en la distincion explicita entre datos medidos, reportados y desconocidos. Para un desarrollador o investigador que evalue el modelo, la conclusion practica es que no hay evidencia publicada que permita caracterizar sus capacidades, su calidad ni sus condiciones de uso.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la informacion disponible. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes de espacio de estados (SSM) o cualquier otra variante. Tampoco se indican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

Lo unico que la card afirma sobre el proceso de entrenamiento es de caracter procedimental: que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus ficheros de recibos dentro de la malla del estate, y que cualquier cosa no registrada en esos recibos se considera UNKNOWN. La seccion RECEIPTS indica que se realizo un escaneo estricto el 2026-11-22 y que el resultado fue `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (concretamente `assets/szl-card/mesh-receipts.svg`), pero no hay un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento. La evidencia de evaluacion se declara explicitamente UNKNOWN.

## Capacidades

- No se ha documentado ninguna capacidad concreta en la informacion disponible.
- No hay evidencia de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas cubiertos.
- No se declara ningun modo especial (thinking mode, vision, audio, decodificacion especulativa).

La model card es explicita al respecto: no se realiza ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos, y en el momento del escaneo esos recibos no alcanzan el umbral estricto definido por la propia organizacion.

## Casos de uso

- Auditoria de pipelines de publicacion de modelos: el repositorio sirve como caso de estudio de un esquema de publicacion basado en recibos, donde se distingue entre evidencia medida, reportada y desconocida. Se usaria para disenar o validar procesos internos de gobernanza de artefactos de IA.
- Verificacion de trazabilidad en una organizacion: un equipo de plataforma podria inspeccionar la estructura de la card (identidad, fuente canonica, familias de recibos, instantanea de auditoria) como plantilla para exigir trazabilidad a sus propios modelos internos.
- Formacion en practicas de documentacion honesta: el texto de la seccion Honesty y el resultado `RECEIPT_FILES_NO_DONE` son un ejemplo concreto de como declarar ausencia de evidencia en lugar de inferirla.
- Evaluacion de riesgo previa a adopcion: dado que no hay licencia ni especificaciones, el repositorio se usaria como caso de "artefacto no adoptable" en un checklist de revision de dependencias de modelos.
- Integracion en un registro interno de modelos: un equipo de MLOps podria catalogar este repositorio con estado "sin evidencia" y marcarlo para revision cuando lleguen recibos medidos.
- Analisis de esquemas de generacion determinista de documentacion: la card menciona un generador de SVG determinista en Python de la libreria estandar (`estate-cards weaver v0.1.0`), lo que permite estudiar como producir documentacion reproducible sin dependencias externas.

No se pueden proponer casos de uso de inferencia (atencion al cliente, generacion de codigo, RAG, etc.) porque no hay ninguna evidencia publicada sobre las capacidades del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto del 2026-11-22 no encontro un `DONE.json` que cumpla el umbral, por lo que la evidencia de evaluacion figura como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos compatible con ninguno de estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamano, la arquitectura ni la tarea del modelo, no es posible identificar alternativas de la misma categoria. La unica comparacion factible es de caracter documental: frente a model cards convencionales que declaran parametros, contexto y licencia, esta card opta por no afirmar nada que no este respaldado por un recibo medido, lo que dificulta cualquier comparacion tecnica.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se declaran parametros, contexto, arquitectura ni tokenizador, lo que impide estimar requisitos de despliegue.
- Licencia no declarada: no hay base para determinar si el uso comercial esta permitido, lo que en la practica bloquea su adopcion en produccion.
- Idiomas no declarados: no se puede garantizar cobertura linguistica alguna.
- Evidencia de evaluacion UNKNOWN: el escaneo estricto no encontro un `DONE.json` con `status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento; los ficheros con nombre de recibo presentes no han sido validados como evidencia.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de datos de entrenamiento.
- Fecha de creacion futura respecto a la mayoria de referencias habituales (2026-11-19): conviene verificar la coherencia temporal del artefacto en el momento de su uso.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- La fuente canonica citada es una organizacion de GitHub; la card no enlaza a pesos, configuracion ni scripts de inferencia verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l96
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica citada (organizacion en GitHub): https://github.com/szl-holdings
- Generador de cards citado: https://github.com/szl-holdings/estate-cards
- Recibo grafico presente en el repositorio: `assets/szl-card/mesh-receipts.svg`
- Contexto del estate presente en el repositorio: `assets/szl-card/org-context.svg`
