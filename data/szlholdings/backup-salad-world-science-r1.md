# SZLHOLDINGS/backup-salad-world-science-r1

## Resumen

`SZLHOLDINGS/backup-salad-world-science-r1` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad declarada hacia repositorios fuente y recibos de auditoria. El repositorio de Hugging Face tiene un tamano de 0,7 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de pequeno o medio tamano, aunque la model card no declara parametros, arquitectura ni contexto.

La model card es fundamentalmente un contenedor de gobernanza: identifica el repositorio, enlaza a la organizacion en GitHub como fuente canonica y presenta graficos SVG generados de forma determinista a partir de una instantanea de auditoria. No incluye descripcion funcional del modelo, datos de entrenamiento, idiomas soportados ni resultados de evaluacion. El propio autor indica explicitamente que cualquier afirmacion de entrenamiento o evaluacion no incluida en sus ficheros de recibo debe considerarse desconocida (UNKNOWN).

Por tanto, esta ficha solo puede documentar con rigor lo que el repositorio declara de forma verificable: identidad, formato de pesos, tamano del artefacto y politica de honestidad del autor. El resto de especificaciones tecnicas se marca como no disponible. Es relevante ahora unicamente como ejemplo de practica de documentacion orientada a auditoria, no como modelo evaluable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-19 |
| Ultima actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card. El autor no especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de parametros, la longitud de contexto nativa ni si incorpora mecanismos como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card remite a "receipt files" dentro del ecosistema del autor para cualquier afirmacion sobre datos, numero de tokens, composicion del corpus o tecnicas de alineamiento como RLHF o DPO. Ninguno de esos datos se reproduce en el repositorio de Hugging Face. La unica innovacion declarada es de proceso, no de modelado: generacion determinista de graficos SVG a partir de una instantanea de auditoria con fecha (2026-11-20T03:48:04Z) y etiquetado explicito de cada cifra como MEASURED, REPORTED o UNKNOWN.

## Capacidades

- No se declara ninguna capacidad funcional del modelo en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se declara modo de razonamiento (thinking), vision, audio ni ninguna modalidad adicional.
- El unico comportamiento documentado es la politica de honestidad del autor: no afirmar cifras de benchmark no medidas.

## Casos de uso

- Auditoria de artefactos de modelo: el repositorio puede usarse como ejemplo de estructura de model card orientada a trazabilidad, con identificador de tarjeta, fecha de captura y etiquetado MEASURED/REPORTED/UNKNOWN para cada dato.
- Verificacion de cadena de custodia en pipelines internos: el enlace a la organizacion fuente en GitHub y la presencia de recibos permiten disenar un flujo de comprobacion de procedencia antes de desplegar un artefacto.
- Archivo y respaldo de artefactos: dado su caracter de "backup" y su tamano reducido (0,7 GB), encaja como copia de seguridad en un almacen de modelos con control de versiones por fecha.
- Pruebas de integracion de carga de safetensors: util para validar herramientas de inspeccion de pesos (por ejemplo, lectura de cabeceras y recuento de tensores) sin necesidad de un modelo grande.
- Docencia sobre documentacion de modelos: sirve como caso de estudio de una model card que prioriza la honestidad epistemica sobre la promocion comercial.
- No se recomienda su uso en aplicaciones de generacion de texto, codigo, atencion al cliente ni ninguna tarea de inferencia real, porque no hay evidencia de capacidades ni de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna medicion de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable; el tamano del repositorio (0,7 GB) sugiere que los pesos cabrian en la memoria de muchas GPU de consumo, pero se desconoce si el artefacto esta completo.
- Opciones de despliegue: no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El formato safetensors es compatible con cargadores de la familia Transformers, pero no se confirma que la arquitectura sea soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoria de comparacion (tamano, tarea, modalidad) porque la informacion publicada no describe el modelo. Cualquier comparacion con alternativas seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin parametros, contexto, idiomas ni arquitectura, el modelo no es evaluable para produccion.
- Licencia no declarada: no hay autorizacion explicita de uso comercial; debe asumirse que no se puede usar sin contacto con el titular.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad en ninguna tarea.
- Riesgo de confusion con el nombre: el identificador incluye "backup" y "salad-world-science", terminos que no describen una funcion tecnica concreta.
- Model card generada automaticamente: la propia tarjeta indica que fue producida por una herramienta ("estate-cards weaver v0.1.0") a partir de una instantanea, lo que refuerza que el contenido es de gobernanza y no descriptivo del modelo.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo y a su dataset de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad que haya validado el artefacto.
- Fechas futuras en los metadatos (creacion 2026-11-19): conviene verificar la coherencia temporal del repositorio antes de confiar en sus recibos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/backup-salad-world-science-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada (organizacion GitHub): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
