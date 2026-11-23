# SZLHOLDINGS/szl-triage-retrain

## Resumen

`SZLHOLDINGS/szl-triage-retrain` es un artefacto de modelo entrenado publicado por SZLHOLDINGS dentro de lo que la propia organizacion denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad documental mediante ficheros de recibo (receipts) y resultados verificables. El repositorio se presenta como un modelo de la familia interna de la organizacion, orientado aparentemente a tareas de triaje (clasificacion o priorizacion de entradas), aunque la model card no explicita la tarea concreta ni el dominio de aplicacion.

La informacion tecnica disponible es minima. La model card no declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni formato de pesos. El unico contenido sustantivo es un conjunto de graficos SVG generados de forma determinista a partir de una instantanea de auditoria fechada el 2026-11-20, y una seccion de "RECEIPTS" que describe un escaneo estricto realizado el 2026-11-22.

El aspecto mas relevante de este repositorio no es su rendimiento, que no esta documentado, sino su politica explicita de honestidad: el autor declara que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un recibo medido se marca como UNKNOWN. El escaneo estricto concluye que no existe un `DONE.json` que cumpla el umbral de evidencia, por lo que la evidencia de evaluacion se clasifica como UNKNOWN. Es, por tanto, un artefacto sin validacion publicada y con cero descargas y cero likes en el momento de la consulta.

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

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no indica si se trata de un transformer, un modelo MoE, una arquitectura hibrida o cualquier otra familia. Tampoco se especifica el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato relacionado con el entrenamiento es la existencia de ficheros con nombre de recibo en el repositorio (`assets/szl-card/mesh-receipts.svg`), que el escaneo estricto identifica como coincidencia por palabra clave y no valida como evidencia. El autor declara que las afirmaciones de entrenamiento y evaluacion residen en los ficheros de recibo de la malla del estate, y que cualquier dato no respaldado por un recibo medido debe considerarse UNKNOWN.

## Capacidades

- No se declara ninguna capacidad concreta en la informacion disponible.
- El nombre del repositorio sugiere un uso orientado a triaje, pero la model card no confirma la tarea, el formato de entrada ni el formato de salida.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue.
- No se documentan modos especiales (thinking mode, vision, audio).
- Cualquier capacidad adicional debe considerarse no disponible.

## Casos de uso

- Triaje de tickets de soporte: por el nombre del artefacto, podria emplearse para clasificar o priorizar incidencias entrantes, aunque no hay documentacion que confirme el esquema de etiquetas ni el rendimiento en esa tarea.
- Enrutamiento de solicitudes internas: un modelo de triaje podria asignar peticiones al equipo correspondiente; sin especificaciones de contexto ni idioma, el diseno del pipeline queda a cargo del integrador.
- Clasificacion de documentos en flujos de revision: el modelo podria actuar como primer filtro antes de la revision humana, siempre que se valide su comportamiento con datos propios.
- Preetiquetado para anotacion humana: util como generador de etiquetas preliminares en un proceso de curacion supervisada.
- Experimentacion en entornos de investigacion sobre gobernanza de modelos: el repositorio es un ejemplo de artefacto con politica de evidencia explicita y puede servir para estudiar practicas de documentacion y auditoria.
- Evaluacion interna antes de adopcion: dado que no hay benchmarks publicados, cualquier uso en produccion exigiria una bateria de pruebas propia sobre el dominio objetivo.
- Integracion en pipelines con requisitos de trazabilidad: la estructura de recibos del estate podria encajar en organizaciones que exigen evidencia documental de cada artefacto desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto del 2026-11-22 clasifica la evidencia de evaluacion como UNKNOWN al no existir un `DONE.json` que cumpla el umbral.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni framework de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse la tarea, el tamano ni la licencia del modelo, no es posible identificar alternativas comparables de forma rigurosa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se declaran arquitectura, parametros, contexto ni formato de pesos, lo que impide planificar el despliegue.
- Sin evidencia de evaluacion: el escaneo estricto del estate clasifica la evidencia como UNKNOWN por falta de un `DONE.json` valido.
- Licencia no declarada: no puede asumirse uso comercial permitido; la ausencia de licencia es un bloqueo legal para produccion.
- Idiomas no declarados: se desconoce si el modelo cubre castellano u otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluables sin documentacion ni pruebas propias.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion en 2026: conviene verificar la coherencia temporal de los metadatos antes de cualquier adopcion.
- La model card esta mayoritariamente generada por herramientas internas y contiene graficos SVG, no resultados verificables de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-triage-retrain
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de fichas del estate: https://github.com/szl-holdings/estate-cards
