# SZLHOLDINGS/salad-ring-ouro-l104

## Resumen

salad-ring-ouro-l104 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad declarada. El repositorio de Hugging Face no incluye model card tecnica en sentido estricto, sino una tarjeta generada de forma automatica por su herramienta interna `estate-cards weaver` (v0.1.0), con graficos SVG deterministas y etiquetas de evidencia (MEASURED, REPORTED, UNKNOWN).

La informacion disponible no especifica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. La propia tarjeta declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion que no este respaldada por ficheros de "recibo" (receipts) se considera UNKNOWN, y el escaneo estricto de receipts de la familia "salad" (tranche 6, chunk 4, de 2026-11-22) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`.

Por tanto, la relevancia actual del modelo es limitada desde el punto de vista de evaluacion tecnica: se trata de un artefacto con licencia Apache 2.0 y gobernanza documentada, pero sin evidencia medida publica de calidad ni capacidad. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) en la informacion proporcionada. La model card no incluye descripcion de capas, atencion, tokenizador ni configuracion de entrenamiento.

Respecto al entrenamiento, la tarjeta indica que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibo del "estate mesh" y que cualquier dato no receiptado se marca como UNKNOWN. El escaneo estricto de 2026-11-22 no encontro un `DONE.json` con `status=MEASURED`, `eval_rc=0` y timestamp, por lo que no hay evidencia medida de tokens de entrenamiento, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta poblado en el repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- La model card no realiza ninguna afirmacion de calidad o capacidad sin receipts de evaluacion medidos.

## Casos de uso

- Evaluacion interna de artefactos gobernados: usar el repositorio como ejemplo de estructura de trazabilidad (tarjeta generada, receipts, etiquetas MEASURED/REPORTED/UNKNOWN) en un pipeline de auditoria de modelos de una organizacion.
- Pruebas de integracion de infraestructura: desplegar el artefacto en un entorno aislado para validar el pipeline de carga de pesos una vez se conozca el formato real de los ficheros.
- Reproducibilidad y auditoria de licencias: emplear la nota de licencia (apache-2.0 fijada el 2026-11-25 por operaciones del estate, sin evidencia upstream por fichero) como caso de estudio de gestion de derechos en un catalogo interno.
- Baseline experimental: servir como punto de partida neutro en experimentos comparativos, siempre que se ejecute una evaluacion propia previa dado que no hay benchmarks publicados.
- Docencia sobre model cards: utilizar la tarjeta como ejemplo de documentacion honesta basada en evidencia y de las limitaciones de las tarjetas autogeneradas.
- No recomendado para atencion al cliente, generacion de codigo en produccion, analisis de documentos ni tareas de razonamiento sin una evaluacion previa que acredite capacidades, al no existir datos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; depende del formato de pesos, que no se especifica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria, el tamano ni la tarea del modelo, por lo que no es posible establecer comparaciones con alternativas de la misma familia.

## Limitaciones y advertencias

- Ausencia total de evidencia medida: el escaneo estricto de receipts devuelve `RECEIPT_FILES_NO_DONE` y la evaluacion se marca como UNKNOWN.
- Sin datos de arquitectura, parametros ni contexto: imposible estimar requisitos de hardware o rendimiento a priori.
- Sin benchmarks publicados: no se puede verificar calidad, razonamiento, codigo ni matematicas.
- Idiomas no declarados: riesgo de comportamiento deficiente o no verificado en castellano y otros idiomas.
- Riesgo de alucinacion: no evaluado; sin datos de alineamiento (RLHF/DPO) no se puede acotar.
- Licencia: la etiqueta apache-2.0 fue fijada por operaciones del estate el 2026-11-25 sin evidencia de licencia upstream por fichero; conviene verificar derechos antes de uso comercial.
- Trazabilidad incompleta: la fuente canonica apunta a una organizacion de GitHub sin enlace directo verificable en la informacion disponible.
- Tarjeta autogenerada: contiene graficos SVG generados por herramienta interna, no una descripcion tecnica redactada por el autor del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l104
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada (organizacion GitHub): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
