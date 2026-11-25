# SZLHOLDINGS/salad-ring-ouro-l103

## Resumen

salad-ring-ouro-l103 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de repositorios de modelos, datasets y Spaces que la organizacion presenta con enfasis en trazabilidad y resultados verificables mediante ficheros de recibos (receipts). El repositorio esta alojado en Hugging Face bajo el identificador SZLHOLDINGS/salad-ring-ouro-l103 y se distribuye con licencia Apache 2.0.

La model card no proporciona informacion tecnica sustantiva: no declara arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El contenido se limita a metadatos de identidad del repositorio, referencias a la organizacion en GitHub y una seccion de "honesty" en la que el propio autor indica que cualquier afirmacion sobre entrenamiento o evaluacion que no aparezca en sus ficheros de recibos debe considerarse desconocida (UNKNOWN).

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente documental: sirve para dejar constancia de que el artefacto existe, de su licencia y de la ausencia de evidencia medida publicada. El escaneo de recibos citado en la propia card clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros de nombre compatible con recibos pero sin un DONE.json estricto que acredite evaluacion medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes de espacio de estados o cualquier otra variante. Tampoco se indica el numero de parametros, las dimensiones de las capas ni la ventana de contexto.

Respecto al entrenamiento, la card no aporta datos sobre volumen de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineamiento. El autor remite de forma explicita a los ficheros de recibos del "estate mesh" para cualquier afirmacion sobre entrenamiento o evaluacion, y senala que lo que no este acreditado en esos recibos debe tratarse como desconocido. El escaneo estricto de recibos de 2026-11-22 concluye que no existe un DONE.json con estado MEASURED, codigo de retorno de evaluacion cero y marca temporal, por lo que la evidencia de evaluacion se clasifica como UNKNOWN.

## Capacidades

- No se ha declarado ninguna capacidad concreta en la informacion disponible.
- No hay evidencia publicada de generacion de texto, razonamiento, codigo o matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales como thinking mode, vision o audio.
- La unica capacidad implicitamente atribuible es la de ser un artefacto entrenado dentro de la factoria del autor, sin detalle funcional.

## Casos de uso

- Auditoria de procedencia: usar el repositorio como objeto de estudio para verificar el funcionamiento del sistema de recibos del estate de SZLHOLDINGS y comprobar como se etiqueta un artefacto sin evidencia medida.
- Catalogacion interna: registrar el modelo en un inventario de artefactos de una organizacion que consuma el ecosistema SZLHOLDINGS, anotando licencia Apache 2.0 y estado de evidencia UNKNOWN.
- Evaluacion comparativa de gobernanza: emplear la card como ejemplo de practica de documentacion conservadora, en la que el autor evita afirmar cifras de rendimiento no medidas.
- Pruebas de pipeline de descarga y despliegue: si en el futuro se publican pesos, el identificador del repositorio puede usarse para validar flujos automatizados de descarga, verificacion de licencia y registro de artefactos.
- Analisis de licencias: estudiar el caso de una licencia Apache 2.0 asignada por operaciones del estate (nota w45z, 2026-11-25) sin evidencia de licencia upstream por fichero, como supuesto practico de gestion de derechos en modelos derivados.
- Docencia sobre reproducibilidad: utilizar la ficha y la card como material para explicar la diferencia entre afirmaciones REPORTED, MEASURED y UNKNOWN en la documentacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de 2026-11-22 clasifica la evidencia de evaluacion como UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos de pesos ni artefactos de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del modelo (tamano, tarea, modalidad), por lo que no es posible establecer comparaciones fundamentadas con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se conocen arquitectura, parametros, contexto ni formatos de pesos, lo que impide evaluar su idoneidad para cualquier caso de uso.
- Evidencia de evaluacion clasificada como UNKNOWN: no existe un DONE.json estricto con estado MEASURED, codigo de retorno cero y marca temporal.
- Los ficheros con nombre de recibo detectados (assets/szl-card/mesh-receipts.svg) se identifican por coincidencia de palabras clave y no se han validado como evidencia.
- La licencia Apache 2.0 fue asignada por operaciones del estate (nota w45z, 2026-11-25) sin evidencia de licencia upstream por fichero, lo que introduce incertidumbre sobre la cadena de derechos si el artefacto deriva de material de terceros.
- No se documentan sesgos conocidos, pero tampoco existe informacion sobre datos de entrenamiento que permita evaluarlos.
- Riesgo de alucinacion: no evaluable sin pesos ni evaluaciones publicadas.
- Limitaciones de contexto e idioma: no disponibles.
- Para produccion: no se recomienda su uso sin evidencia medida adicional y sin pesos verificables.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que refleja una adopcion nula por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l103
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards (referenciada en la card): https://github.com/szl-holdings/estate-cards
