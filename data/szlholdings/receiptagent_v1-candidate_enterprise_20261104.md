# SZLHOLDINGS/receiptagent_v1-candidate_enterprise_20261104

## Resumen

`receiptagent_v1-candidate_enterprise_20261104` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados auditables y trazabilidad documentada. El repositorio forma parte de una factoría interna de modelos y se presenta como un candidato de la variante "enterprise" de un agente orientado a recibos (`receiptagent_v1`), con fecha de instantánea 2026-11-04.

La model card no aporta informacion tecnica sustantiva: no declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni pipeline. El repositorio pesa 0,0 GB y solo contiene pesos en formato `safetensors`, lo que sugiere que el artefacto publicado en esta instantanea es incompleto o que los pesos reales no estan alojados en el repositorio (por ejemplo, mediante LFS no resuelto). No hay ficha tecnica verificable.

Por tanto, esta ficha se limita a describir lo que el autor declara explicitamente y marca como "no disponible" todo aquello que la model card no documenta. Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion requeriria acceso a los archivos de "receipt" (recibos de auditoria) que el autor menciona pero no enlaza de forma directa en la card.

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

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El unico dato estructural es que el autor enmarca el artefacto en una "governed factory" con "receipt files" que supuestamente contienen las afirmaciones de entrenamiento y evaluacion. La card indica explicitamente que "cualquier cosa no receipted aqui es UNKNOWN" y que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido. Esta politica de honestidad es loable, pero en la practica deja la ficha sin datos tecnicos utilizables.

## Capacidades

- Generacion de texto: no confirmada por la documentacion disponible.
- Razonamiento, codigo o matematicas: no documentado.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: el nombre del modelo (`receiptagent_v1`) sugiere un uso orientado a agentes sobre recibos o documentos financieros, pero no hay especificacion tecnica que lo confirme.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

No es posible recomendar casos de uso concretos con base en la informacion disponible. El nombre del modelo sugiere un enfoque hacia el procesamiento de recibos y tareas de agente con trazabilidad ("receipted"), pero la model card no describe entradas, salidas, formato de prompt, ni ninguna capacidad verificable. Cualquier caso de uso propuesto seria especulativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no incluye dicha auditoria en la ficha.

## Requisitos de hardware

No es posible estimar requisitos de hardware porque se desconoce el numero de parametros, la arquitectura y el contexto. El repositorio pesa 0,0 GB, lo que impide inferir el tamano real de los pesos. No se puede confirmar si el modelo cabe en GPU de consumo, ni recomendar opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se dispone de parametros, contexto, licencia ni rendimiento del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede validar arquitectura, tamano, contexto ni idiomas.
- Licencia no declarada: no hay garantia de uso comercial ni de redistribucion. En la practica, la ausencia de licencia implica que no se concede ningun derecho de uso mas alla de lo que permita la legislacion aplicable.
- Repositorio de 0,0 GB: los pesos pueden no estar realmente alojados o estar incompletos; conviene verificar los archivos antes de cualquier intento de descarga.
- Sin datos de sesgo, alucinacion ni evaluacion de seguridad.
- El autor remite a "receipt files" externos que no se enlazan directamente en la card; sin acceso a ellos, no hay forma de auditar las afirmaciones.
- El nombre incluye la etiqueta `candidate_enterprise`, lo que sugiere que es un artefacto en fase de candidatura y no una version estable de produccion.
- No se debe desplegar en produccion sin una evaluacion independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/receiptagent_v1-candidate_enterprise_20261104
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de la factoria de tarjetas (referenciado en la card): https://github.com/szl-holdings/estate-cards
- Organizacion en GitHub (referenciada en la card, enlace incompleto en el original): https://github.com/szl-holdings
