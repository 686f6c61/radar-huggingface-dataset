# SZLHOLDINGS/salad-quant

## Resumen

Salad-quant es un artefacto de modelo publicado por SZL Holdings bajo el identificador `SZLHOLDINGS/salad-quant`. La model card lo presenta como parte de un "estate" de IA gobernada, con modelos, datasets y Spaces "source-linked" y resultados verificables mediante recibos de auditoría. El repositorio ocupa 1,2 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de pequeno o mediano tamano, aunque la card no declara parametros, arquitectura ni contexto.

La informacion publicada es deliberadamente escasa: la model card se limita a describir la identidad del repositorio, el sistema de evidencias del estate y una seccion de honestidad que afirma que cualquier dato no respaldado por un recibo de auditoria se marca como UNKNOWN. No se especifican datos de entrenamiento, idiomas, benchmarks ni casos de uso. El propio escaneo de recibos incluido en la card clasifica el artefacto como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no un `DONE.json` estricto con estado MEASURED, y la evidencia de evaluacion figura como UNKNOWN.

Por tanto, esta ficha documenta lo que el autor declara explicitamente y marca como "no disponible" todo lo demas. Es relevante ahora unicamente como artefacto de un pipeline interno de publicacion gobernada; no hay evidencia publicada que permita recomendarlo para tareas de produccion ni compararlo con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del repo sugiere cuantizacion, sin detalle) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-16 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo: la model card no indica si se trata de un transformer denso, un MoE, un modelo hibrido o cualquier otra variante, ni declara numero de capas, dimensiones ocultas o mecanismo de atencion. El unico indicio estructural es el formato de pesos (safetensors) y el tamano del repositorio (1,2 GB), insuficiente para inferir la arquitectura con rigor.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de tokens, la composicion del dataset, si hubo ajuste por instrucciones, RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La seccion de recibos de la card indica que la evidencia de evaluacion es UNKNOWN al no existir un `DONE.json` estricto con estado MEASURED, y que los ficheros con nombre de recibo encontrados (`assets/szl-card/mesh-receipts.svg`) son coincidencias por palabra clave no validadas como evidencia.

## Capacidades

- No se declara ninguna capacidad concreta en la informacion disponible.
- No hay evidencia publicada de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas cubiertos.
- No se declaran modos especiales (thinking mode, vision, audio).
- La propia card establece que no se afirma ninguna cualidad o capacidad sin recibos de evaluacion medidos.

## Casos de uso

- Auditoria de pipelines de publicacion gobernada: el artefacto puede usarse como ejemplo de como SZL Holdings estructura la identidad de un modelo (repo, fuente canonica, recibos, marcas MEASURED/REPORTED/UNKNOWN) en su fabrica interna. Es adecuado por su trazabilidad documental, no por sus capacidades de modelo.
- Verificacion de cumplimiento de licencia: al estar etiquetado como apache-2.0, sirve para probar flujos de validacion de licencias en herramientas de escaneo de repositorios, con la advertencia de que la propia card reconoce que no hay evidencia de licencia por fichero del upstream.
- Pruebas de integracion de carga de safetensors: el repositorio permite validar el manejo de pesos en formato safetensors en pipelines de descarga y carga, dado su tamano contenido de 1,2 GB.
- Desarrollo de sistemas de recibos de auditoria: util como fixture para construir o testear generadores de `DONE.json` y validadores de evidencia estricta, ya que el escaneo de la card lo clasifica explicitamente como caso negativo (`RECEIPT_FILES_NO_DONE`).
- Docencia sobre honestidad en model cards: sirve como ejemplo de card que evita afirmar cifras no medidas y etiqueta explicitamente lo desconocido, adecuado para discutir buenas practicas de documentacion.
- No se recomienda su uso en tareas de inferencia en produccion (atencion al cliente, generacion de codigo, analisis de documentos) porque no hay evidencia publicada de capacidades ni de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que la evidencia de evaluacion es UNKNOWN y que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido; el escaneo de recibos no encuentra un `DONE.json` estricto con estado MEASURED.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; sin conocer parametros ni cuantizacion no puede calcularse. Como referencia bruta, un repositorio de 1,2 GB en safetensors cabe en GPUs de consumo con 8-16 GB en la mayoria de escenarios de carga, pero esto es una estimacion por tamano de fichero, no un dato del autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamano de repo, probable en tarjetas con 8 GB o mas, sujeto a verificacion.
- Opciones de despliegue: no disponible; no se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la categoria del modelo (tamano, tarea, arquitectura), por lo que no es posible seleccionar alternativas comparables con rigor. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin parametros, contexto, arquitectura ni idiomas declarados, no es posible evaluar su idoneidad para ninguna tarea.
- Evidencia de evaluacion UNKNOWN: el escaneo de recibos clasifica el artefacto como `RECEIPT_FILES_NO_DONE`; los ficheros con nombre de recibo no estan validados como evidencia.
- Riesgo de alucinacion: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no documentadas.
- Licencia: la etiqueta apache-2.0 fue fijada por operaciones del estate (nota "w45z") sin evidencia de licencia por fichero del upstream; conviene verificar la procedencia antes de un uso comercial.
- Nombre del repositorio: "salad-quant" sugiere una variante cuantizada, pero no se especifica el esquema de cuantizacion ni la perdida de calidad asociada.
- Para produccion: no se recomienda desplegar este artefacto sin una evaluacion propia previa, dado que el autor no aporta ninguna medicion de capacidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-quant
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada (organizacion en GitHub): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
