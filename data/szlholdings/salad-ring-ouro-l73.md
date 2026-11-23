# SZLHOLDINGS/salad-ring-ouro-l73

## Resumen

`salad-ring-ouro-l73` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": una coleccion de modelos, datasets y Spaces con trazabilidad documental mediante ficheros de recibos (receipts). El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organizacion, no como una release de un laboratorio de investigacion con model card tecnica convencional.

La model card no proporciona ningun dato arquitectonico: no se indica si es un transformer, un MoE, un SSM o un modelo hibrido, ni el numero de parametros, la longitud de contexto, el tokenizador, el dataset de entrenamiento o el procedimiento de alineamiento. La informacion disponible se limita a metadatos de identidad del repositorio, graficos SVG generados de forma determinista a partir de una instantanea de auditoria y una seccion de honestidad en la que el propio autor declara explicitamente que cualquier afirmacion no respaldada por un recibo medido es "UNKNOWN".

El resultado del escaneo estricto de recibos (`receipts-tranche-6 chunk-8`, 2026-11-22) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0` y marca temporal. La evidencia de evaluacion es, por tanto, desconocida. En la practica, esto significa que el modelo no es evaluable ni desplegable de forma responsable con la informacion publicada: no hay pesos descritos, no hay benchmarks y no hay licencia declarada. Su relevancia actual es limitada y de caracter documental, como ejemplo de publicacion con trazabilidad declarativa pero sin evidencia medida.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer decoder-only, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un modelo hibrido, ni detalla el numero de capas, dimensiones ocultas, cabezas de atencion o vocabulario.

Respecto al entrenamiento, el autor remite a "receipt files" alojados en el mesh del estate, pero el escaneo estricto documentado en la propia card concluye que no existe un `DONE.json` valido con estado `MEASURED` y codigo de evaluacion correcto. Por tanto, no hay confirmacion de volumen de tokens, composicion del dataset, uso de RLHF, DPO u otra tecnica de alineamiento, ni de innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion al respecto seria especulativa y no se incluye.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia medida ni descripcion funcional en la model card.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Trazabilidad documental: el repositorio incluye graficos SVG deterministas y una seccion de recibos, pero el propio autor clasifica la evidencia de evaluacion como UNKNOWN.

## Casos de uso

- Auditoria de publicaciones de modelos: el repositorio puede usarse como caso de estudio de un esquema de publicacion basado en recibos, para analizar como se documenta (o no) la evidencia de entrenamiento y evaluacion en un estate gobernado.
- Verificacion de pipelines de trazabilidad: util para equipos que disenen sistemas de "receipts" y quieran contrastar un ejemplo real de clasificacion `RECEIPT_FILES_NO_DONE` frente al umbral estricto `DONE.json` con `status=MEASURED`.
- Docencia sobre higiene de model cards: sirve como ejemplo de card que declara explicitamente la ausencia de datos ("UNKNOWN") en lugar de inventar cifras, un antipatron inverso util para formar a equipos en documentacion honesta.
- Integracion en catalogos internos de modelos: puede registrarse en un inventario como artefacto no evaluado, con estado "pendiente de evidencia", para bloquear su promocion a produccion hasta que exista un recibo medido.
- Pruebas de herramientas de escaneo de repositorios: el repositorio es un caso de prueba para validadores que detectan ficheros con nombre de recibo sin `DONE.json` estricto.
- Analisis de gobernanza de IA: util para estudiar como una organizacion estructura identidad, evidencia y honestidad en torno a artefactos de modelo sin liberar detalles tecnicos.

No se recomienda su uso en aplicaciones de produccion (atencion al cliente, generacion de codigo, RAG, agentes) porque no hay pesos, licencia ni evaluacion descritos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y el escaneo estricto clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; se desconoce el numero de parametros.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria, el tamano y la tarea del modelo. La unica comparacion posible es con otros artefactos del mismo estate SZLHOLDINGS, pero no se dispone de datos tecnicos de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni tokenizador, el modelo no es evaluable tecnicamente.
- Sin evidencia de evaluacion: el escaneo estricto de recibos clasifica el repositorio como `RECEIPT_FILES_NO_DONE` y la evidencia de evaluacion como UNKNOWN.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; en ausencia de licencia, debe asumirse reserva de derechos por defecto.
- Idiomas no declarados: imposible planificar cobertura linguistica.
- Formato de pesos no disponible: no se puede confirmar que existan pesos descargables ni en que formato.
- Riesgo de alucinacion y sesgos: no evaluables sin modelo desplegable ni evaluacion publicada.
- Cero descargas y cero likes en el momento de la consulta: sin adopcion ni validacion por parte de la comunidad.
- Fechas de creacion y actualizacion (2026-11-19 y 2026-11-23) y referencias a instantaneas de auditoria de 2026-11-20: verificar su coherencia con el calendario real antes de citar el artefacto.
- No apto para produccion en su estado actual: cualquier despliegue requeriria primero obtener los pesos, la licencia y un recibo de evaluacion medido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l73
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards (referenciada en la card): https://github.com/szl-holdings/estate-cards
