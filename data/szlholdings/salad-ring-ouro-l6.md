# SZLHOLDINGS/salad-ring-ouro-l6

## Resumen

`salad-ring-ouro-l6` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con resultados auditables y trazables. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organizacion, sin que la model card proporcione detalles sobre su naturaleza, tamano o proposito funcional.

La informacion publica disponible es extremadamente limitada. La model card no especifica arquitectura, numero de parametros, longitud de contexto, idiomas ni licencia. Lo unico que declara de forma explicita es una politica de honestidad: cualquier afirmacion sobre entrenamiento o evaluacion debe residir en ficheros de "recibos" (receipts) del estate, y todo lo que no este respaldado por evidencia medida se etiqueta como UNKNOWN. De hecho, la seccion RECEIPTS indica que el repositorio contiene ficheros con nombre de recibo pero no un `DONE.json` estricto, por lo que la evidencia de evaluacion queda marcada como UNKNOWN.

Por tanto, esta ficha debe leerse como un registro de un artefacto opaco: existe, esta publicado y tiene un sistema de trazabilidad declarado, pero carece de la informacion tecnica minima necesaria para evaluar su utilidad en produccion. La busqueda web no ha arrojado ninguna fuente adicional relevante sobre el modelo; el unico resultado devuelto es un sitio de streaming de series turcas sin relacion alguna con el artefacto.

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

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en las fuentes consultadas. El autor no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

Lo unico que la model card afirma sobre el entrenamiento es que las afirmaciones relativas a entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro del mesh del estate, y que cualquier dato no respaldado por un recibo medido se considera UNKNOWN. La seccion RECEIPTS confirma que, en el momento del escaneo (2026-11-22), no existe un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento, por lo que la evidencia de evaluacion permanece como UNKNOWN. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio autor advierte que no esta validado como evidencia.

## Capacidades

- No se ha documentado ninguna capacidad funcional del modelo en la informacion disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta capacidad multilingue declarada.
- No consta modo de razonamiento (thinking mode), vision, audio ni ninguna otra capacidad especial.
- La model card unicamente declara el propoito de trazabilidad y honestidad del estate, sin describir tareas que el artefacto pueda resolver.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer la arquitectura, el tamano, el dominio de entrenamiento ni las capacidades del modelo. Cualquier escenario que se propusiera seria especulativo y contravendria la politica de no inventar datos. Los unicos usos que la informacion permite describir con rigor son los siguientes:

- Auditoria de trazabilidad: un equipo de gobernanza de IA podria inspeccionar el repositorio para verificar el estado de los recibos del artefacto y comprobar que no se emiten afirmaciones de calidad sin evidencia medida.
- Inventario de artefactos: el modelo puede registrarse en un catalogo interno como artefacto del estate SZLHOLDINGS, con su identificador de tarjeta (`d711c4ed78a4fc40`) y su marca temporal de generacion.
- Verificacion de la politica de honestidad: el repositorio sirve como ejemplo de implementacion de un esquema en el que los datos no medidos se etiquetan explicitamente como UNKNOWN.
- Seguimiento de actualizaciones: dado que el repositorio se actualizo el 2026-11-23, un equipo podria monitorizar la aparicion futura de un `DONE.json` estricto que desbloquee la evidencia de evaluacion.
- Referencia para diseno de model cards: el formato de la tarjeta, con SVG deterministico generado por `estate-cards weaver v0.1.0`, puede tomarse como plantilla para documentar artefactos internos.
- Analisis de linaje del estate: el identificador de familia "salad" y el sufijo "l6" permiten situar el artefacto dentro de la jerarquia de repositorios del autor, aunque su contenido funcional siga siendo desconocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y la seccion RECEIPTS clasifica la evidencia de evaluacion como UNKNOWN al no existir un `DONE.json` estricto en el repositorio.

## Requisitos de hardware

No es posible estimar requisitos de hardware sin conocer el numero de parametros, la arquitectura ni el formato de pesos del modelo. Los unicos datos disponibles son los siguientes:

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa con alternativas de la misma categoria porque se desconoce la categoria del modelo (tamano, tarea, modalidad y arquitectura). La tabla siguiente recoge los campos que habitualmente se comparan, marcados como no disponibles para este artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l6 | no disponible | no disponible | no disponible | Repositorio publico en Hugging Face |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Opacidad total: la model card no describe arquitectura, tamano, contexto, idiomas ni licencia, lo que impide cualquier evaluacion tecnica previa a su uso.
- Ausencia de evidencia medida: la seccion RECEIPTS clasifica el artefacto como `RECEIPT_FILES_NO_DONE`, es decir, existen ficheros con nombre de recibo pero no un `DONE.json` estricto que valide la evaluacion.
- Riesgo de alucinacion: no evaluable, al no existir benchmarks ni evaluaciones publicadas.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no documentadas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede confirmarse la legalidad de un uso comercial. Se desaconseja su despliegue en produccion hasta que el autor publique terminos explicitos.
- Ficheros de recibo no validados: el propio autor advierte que `assets/szl-card/mesh-receipts.svg` es una coincidencia por palabra clave y no evidencia validada.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-17, lo que conviene verificar en el origen antes de tratarlo como artefacto estable.
- Sin resultados de busqueda externos: la unica fuente web devuelta no guarda relacion con el modelo, por lo que no hay corroboracion independiente de su existencia o calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l6
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
- Resultado de busqueda web consultado (sin relacion con el modelo): https://www.ipaddress.com/website/turskeserije.tv/
