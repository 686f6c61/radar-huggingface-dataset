# SZLHOLDINGS/salad-x402-protocol-r1

## Resumen

`salad-x402-protocol-r1` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate governed-AI": una coleccion de modelos, datasets y Spaces con trazabilidad basada en ficheros de recibos (receipts). El repositorio tiene un tamano de 0,7 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de pequeno tamano, aunque la model card no declara arquitectura, numero de parametros ni contexto.

La model card es fundamentalmente un documento de gobernanza y auditoria, no una ficha tecnica convencional. Declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe residir en ficheros de recibo del "estate mesh" y que, en ausencia de estos, el dato se marca como UNKNOWN. El propio escaneo de recibos incluido en la card indica que no existe un `DONE.json` estricto con estado MEASURED, por lo que la evidencia de evaluacion se considera no disponible.

Por tanto, la relevancia de este modelo para un desarrollador o investigador es limitada en terminos de capacidades: no hay informacion publicada sobre rendimiento, idiomas, licencia ni casos de uso medidos. Su interes es mas bien como ejemplo de practica de publicacion con trazabilidad declarativa, donde el autor prefiere marcar campos como desconocidos antes que inventar cifras.

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
| Formato de pesos | safetensors |

Datos adicionales verificables: el repositorio ocupa 0,7 GB, fue creado el 2026-11-18 y actualizado el 2026-11-23. No consta pipeline declarado ni tags de idioma o licencia en los metadatos de Hugging Face.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card ni en los metadatos del repositorio. No se especifica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante, ni se detalla el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica referencia tecnica del autor es que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro del mesh del estate. El escaneo de recibos de la tranche 6, chunk 10, clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`), pero no un `DONE.json` estricto con estado MEASURED, `eval_rc=0`, timestamp y recibo de entrenamiento. Por tanto, la evidencia de entrenamiento y evaluacion es UNKNOWN segun el propio criterio del autor.

## Capacidades

- Generacion de texto: no disponible (no declarada).
- Razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.
- Cualquier capacidad especial: no disponible.

La model card no realiza ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos, y no consta ninguno en el repositorio.

## Casos de uso

- Auditoria de publicacion de modelos: el repositorio puede usarse como referencia de un esquema de publicacion que separa metadatos, recibos y afirmaciones, util para equipos que quieran disenar su propio pipeline de trazabilidad documental.
- Verificacion de integridad de artefactos: el contenido safetensors y el tamano del repo (0,7 GB) permiten comprobar el flujo de descarga y validacion de pesos en un entorno controlado, sin asumir capacidades de inferencia concretas.
- Docencia sobre model cards: sirve como ejemplo de card que marca explicitamente UNKNOWN en lugar de rellenar campos sin evidencia, util en formacion sobre comunicacion tecnica rigurosa.
- Integracion en pipelines de evaluacion interna: un equipo podria descargar los pesos y ejecutar su propio conjunto de pruebas para determinar capacidades reales, dado que el autor no las declara.
- Estudio de gobernanza de IA: el esquema de recibos, estados MEASURED/REPORTED/UNKNOWN y sellos temporales es un caso practico de trazabilidad declarativa aplicable a politicas internas de publicacion.
- Pruebas de carga y almacenamiento: el tamano del repo permite validar flujos de cache, espejos y almacenamiento de artefactos en infraestructura propia.

En ningun caso la informacion disponible permite afirmar que el modelo funcione correctamente para tareas de generacion, razonamiento o codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos incluido indica `Eval evidence: UNKNOWN (no strict DONE.json)`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de parametros y cuantizacion, que no se declaran. El tamano del repo (0,7 GB) sugiere que los pesos cabrian en GPUs de consumo, pero no puede confirmarse sin conocer la arquitectura y el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmable con la informacion disponible.
- Opciones de despliegue: no declaradas por el autor; al ser safetensors, seria tecnicamente posible cargarlo con frameworks estandar, pero no hay garantia de que los pesos sean funcionales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion publicada no permite identificar la categoria del modelo (tamano, tarea, arquitectura), por lo que no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia de evidencia de evaluacion: el propio autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` estricto ni resultados medidos.
- Metadatos incompletos: no constan licencia, idiomas, pipeline ni arquitectura, lo que impide evaluar su idoneidad para uso comercial o produccion.
- Riesgo de alucinacion: no evaluable sin datos de entrenamiento ni pruebas; no puede descartarse.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: al no declararse licencia, no puede asumirse permiso de uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Fecha de creacion futura: los metadatos indican creacion en 2026-11-18, lo que conviene verificar en la fuente antes de tratarlos como definitivos.
- Recomendacion: no desplegar en produccion sin una evaluacion independiente de los pesos y una confirmacion explicita de licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-x402-protocol-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada como fuente canonica): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
