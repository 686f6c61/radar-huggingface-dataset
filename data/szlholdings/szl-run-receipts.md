# SZLHOLDINGS/szl-run-receipts

## Resumen

`SZLHOLDINGS/szl-run-receipts` es un artefacto publicado en Hugging Face por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (con recibos o trazas verificables). El repositorio se etiqueta como `kind: model`, es decir, se presenta como un artefacto entrenado dentro de su "governed factory", pero la model card no describe ninguna arquitectura, tamano, contexto ni proceso de entrenamiento concreto.

La model card es fundamentalmente una tarjeta de identidad y gobernanza: enlaces al repositorio canonico en GitHub, graficos SVG generados de forma determinista a partir de una instantanea de auditoria (fechada el 2026-11-20T03:48:04Z, marcada como MEASURED) y una declaracion explicita de honestidad segun la cual cualquier cifra de entrenamiento o evaluacion no incluida en sus ficheros de recibo se considera UNKNOWN (desconocida). No se afirma ningun resultado de benchmark mas alla de lo medido en una auditoria fechada.

Por tanto, la relevancia tecnica del repositorio es limitada a efectos de evaluacion de modelos: no hay informacion publica sobre parametros, arquitectura, contexto, cuantizaciones, idiomas ni licencia. Su interes, si acaso, es como ejemplo de practica de documentacion orientada a trazabilidad y auditoria, no como modelo desplegable con especificaciones conocidas. Todos los campos tecnicos que no aparecen en la informacion proporcionada se indican como "no disponible".

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

No se dispone de informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer, un modelo de mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o una arquitectura hibrida, ni indica numero de capas, dimensiones ocultas, mecanismo de atencion o cualquier otro detalle estructural.

Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO, etc.) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica afirmacion relevante es de caracter metodologico: las cifras de entrenamiento y evaluacion de este artefacto residen en sus ficheros de recibo ("receipt files") dentro del "estate mesh" del autor, y todo lo que no este respaldado por un recibo se declara explicitamente como UNKNOWN. Los graficos incluidos en la card se describen como SVG deterministas generados con la libreria estandar de Python a partir de una instantanea de auditoria fechada.

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio) en la informacion disponible.
- No se indica soporte de tool calling ni de function calling.
- No se indica soporte para agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales (thinking mode, vision, audio) ni decodificacion especulativa.
- La unica capacidad verificable descrita es la de gobernanza documental: el artefacto se presenta como parte de un conjunto con resultados "receipted" y auditables.

## Casos de uso

- Auditoria de artefactos de IA: el repositorio puede servir como referencia de como estructurar una model card con trazabilidad de afirmaciones (etiquetas MEASURED/REPORTED/UNKNOWN y marca temporal de captura), util para equipos que necesiten disenar procesos de documentacion auditables.
- Evaluacion de practicas de gobernanza: un equipo de compliance puede usar la estructura de "receipts" y la instantanea de auditoria como plantilla para verificar que afirmaciones de un modelo estan respaldadas por evidencia fechada.
- Docencia sobre documentacion de modelos: la card ilustra de forma explicita el principio de no inventar cifras y declarar UNKNOWN cuando no hay medicion, un caso didactico para cursos de IA responsable.
- Integracion en pipelines de catalogacion: la etiqueta `kind: model` y los metadatos de identidad (repo, fuente canonica, fecha de creacion y actualizacion) permiten indexar el artefacto en catalogos internos de modelos con campos de procedencia.
- Revision de reproducibilidad: los graficos generados de forma determinista a partir de una instantanea fechada permiten comprobar la reproducibilidad de la representacion documental del artefacto.
- No se puede recomendar su uso para tareas de inferencia (generacion de texto, codigo, atencion al cliente, etc.) porque no hay informacion sobre pesos, arquitectura ni rendimiento que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y no se incluye ninguna tabla de resultados (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo y el formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta ningun formato de pesos compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del modelo (tamano, tarea, arquitectura), por lo que no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin datos de arquitectura, parametros, contexto, cuantizaciones ni formato de pesos, el artefacto no es evaluable ni desplegable con garantias.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; en ausencia de licencia explicita, debe asumirse que no hay autorizacion clara.
- Idiomas no declarados: no hay base para asumir soporte multilingue ni de ningun idioma concreto.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo y sin resultados de evaluacion publicados.
- Las afirmaciones de entrenamiento y evaluacion se remiten a ficheros de recibo externos no incluidos en la informacion disponible; cualquier cifra debe verificarse en la fuente original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No debe interpretarse la etiqueta `kind: model` como evidencia de que existan pesos publicados o utilizables; la card no los menciona.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-run-receipts
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica en GitHub (organizacion, segun la card): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
