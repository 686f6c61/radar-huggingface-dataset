# SZLHOLDINGS/salad-pg54-yachay-v1

## Resumen

salad-pg54-yachay-v1 es un artefacto de modelo publicado por SZLHOLDINGS, una organizacion que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces vinculados a fuentes y con resultados verificables mediante recibos de auditoria. El repositorio contiene pesos en formato safetensors con un tamano aproximado de 1,0 GB y se distribuye bajo licencia Apache 2.0.

La model card no describe la arquitectura del modelo, el numero de parametros, la longitud de contexto, los idiomas soportados ni el proceso de entrenamiento. La informacion disponible se limita a metadatos de identidad, referencias a un sistema de recibos de auditoria (receipts) y notas de honestidad que indican explicitamente que cualquier afirmacion no respaldada por un recibo medido se considera "UNKNOWN" (desconocida).

La relevancia de esta ficha es, por tanto, limitada: se trata de un modelo practicamente sin documentacion tecnica publica, con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluacion medidos en la propia tarjeta. Cualquier dato de rendimiento, capacidades o idoneidad para produccion debe considerarse no disponible hasta que el autor publique evidencia verificable.

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
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, ni detalla el numero de capas, dimensiones ocultas o mecanismos de atencion.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens procesados, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La seccion de recibos de la tarjeta indica que los archivos presentes con nombres de recibo no han sido validados como evidencia estricta (clasificacion RECEIPT_FILES_NO_DONE), y que la evidencia de evaluacion es desconocida al no existir un fichero DONE.json con estado MEASURED.

## Capacidades

- Generacion de texto: no confirmada por evidencia publicada.
- Razonamiento, codigo y matematicas: no confirmados.
- Vision o audio: no disponibles.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Modo de razonamiento explicito (thinking mode): no disponible.

La model card declara explicitamente que no se formula ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos.

## Casos de uso

No es posible recomendar casos de uso concretos con rigor tecnico a partir de la informacion disponible. Los escenarios que se enumeran a continuacion son genericos y quedan condicionados a que el autor publique evidencia de evaluacion que los respalde:

- Experimentacion interna en laboratorio: el tamano del repositorio (1,0 GB) sugiere que podria cargarse en entornos de desarrollo con recursos moderados, pero se desconoce la arquitectura y, por tanto, el coste real de inferencia.
- Pruebas de integracion en pipelines de CI: solo como artefacto de prueba, dado que no hay garantias de calidad ni de comportamiento.
- Evaluacion comparativa propia: utilizable como candidato a evaluar con un arnes de benchmarks propio, ya que el autor no aporta resultados medidos.
- Investigacion sobre gobernanza de modelos: el repositorio puede servir como caso de estudio de publicacion de artefactos con trazabilidad basada en recibos.
- Fines educativos: analisis del formato de model card y del sistema de evidencia del estate SZLHOLDINGS.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo automatizada ni ningun escenario con requisitos de fiabilidad, al no existir evidencia de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y que la evidencia de evaluacion es desconocida (UNKNOWN) al no existir un recibo estricto DONE.json con estado MEASURED.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura y del numero de parametros, que no se han publicado. El tamano del repositorio (1,0 GB) es un limite inferior del espacio en disco necesario para los pesos, no una indicacion fiable de la VRAM requerida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el numero de parametros.
- Opciones de despliegue: no disponibles; el formato safetensors es compatible con frameworks como Transformers, vLLM o TGI, pero se desconoce si el modelo incluye los ficheros de configuracion y tokenizador necesarios.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoria, el tamano y la tarea del modelo. La ausencia de arquitectura, parametros y benchmarks impide establecer una comparacion significativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican arquitectura, parametros, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para cualquier tarea.
- Sin evidencia de evaluacion: la model card califica la evidencia de evaluacion como UNKNOWN y no presenta ningun benchmark medido.
- Riesgo de alucinacion y sesgos: no evaluables al no existir informacion sobre el corpus de entrenamiento ni sobre procesos de alineacion.
- Idiomas: el campo de idiomas del repositorio esta vacio, por lo que no hay garantia de soporte de castellano ni de ninguna otra lengua.
- Licencia: se declara Apache 2.0, pero la propia tarjeta advierte que la etiqueta fue asignada por operaciones del estate (CTO lap W45Z) sin evidencia de licencia upstream por fichero; conviene verificar los derechos antes de un uso comercial.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.
- Recomendacion: no utilizar en produccion sin una evaluacion independiente previa y sin confirmacion de la licencia y del contenido real de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-pg54-yachay-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
