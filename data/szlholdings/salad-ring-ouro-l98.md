# SZLHOLDINGS/salad-ring-ouro-l98

## Resumen

salad-ring-ouro-l98 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": una coleccion de modelos, datasets y Spaces con resultados auditables y "receipts" (ficheros de recibo) verificables. El repositorio de Hugging Face existe, esta etiquetado como modelo entrenado y se presenta como parte de una fabrica gobernada de artefactos, pero la model card no aporta ninguna especificacion tecnica del modelo en si.

La informacion disponible es extremadamente escasa. No se declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni formato de pesos. La propia model card indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion vive en ficheros de recibo del "estate mesh", y que lo que no este receiptado se considera UNKNOWN (desconocido). El escaneo de recibos citado en la propia tarjeta clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no un DONE.json estricto con estado MEASURED.

Por tanto, esta ficha documenta lo que se puede verificar (existencia del repositorio, autor, fechas, ausencia de evidencia medida) y marca como "no disponible" todo lo demas. No es posible evaluar el modelo para uso en produccion con la informacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante, ni detalla capas, dimensiones ocultas, cabezas de atencion o mecanismos de atencion.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo ajuste supervisado, RLHF, DPO u otras tecnicas de alineamiento. La tarjeta remite a "receipt files" del estate mesh para cualquier afirmacion de entrenamiento o evaluacion, pero el escaneo citado en la propia tarjeta (receipts-tranche-6, chunk-10, 2026-11-22) concluye que no existe un DONE.json estricto con estado MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio autor advierte que es una coincidencia por palabra clave y no evidencia validada.

## Capacidades

- No se declara ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, vision, audio): no disponible.
- La model card indica explicitamente que no se hace ninguna afirmacion de calidad o capacidad sin recibos de evaluacion medidos, y que estos no estan presentes en el repositorio.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones tecnicas verificadas (tamano, contexto, licencia, capacidades). A continuacion se enumeran escenarios que requeririan validacion previa y que, con la evidencia actual, no pueden justificarse:

- Evaluacion comparativa interna: solo tendria sentido tras obtener los recibos de evaluacion medidos que el autor menciona pero no publica en el repositorio.
- Integracion en pipelines de generacion de codigo: requeriria conocer el formato de pesos, el contexto y la licencia, ninguno de los cuales esta disponible.
- Despliegue en atencion al cliente multi-turno: imposible de dimensionar sin conocer la longitud de contexto ni los requisitos de hardware.
- Fine-tuning sobre dominio propio: la licencia no declarada impide determinar si el uso comercial o la modificacion estan permitidos.
- Uso como modelo base en investigacion: la ausencia de datos de entrenamiento y de benchmarks impide cualquier comparacion rigurosa.
- Despliegue en produccion: desaconsejado mientras no exista evidencia medida de calidad, seguridad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se asegura ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos citado indica que la evidencia de evaluacion es UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Sin parametros, contexto, licencia ni benchmarks publicados no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede determinar tamano, contexto, arquitectura ni formato de pesos.
- Licencia no declarada: no se puede asumir permiso para uso comercial, modificacion o redistribucion.
- Sin evidencia de evaluacion medida: el propio autor clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de entrenamiento.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en ningun otro idioma.
- Repositorio sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que sugiere ausencia de validacion por parte de la comunidad.
- La model card esta generada de forma automatica por una herramienta interna (estate-cards weaver v0.1.0) y contiene graficos SVG deterministas, no resultados de evaluacion del modelo.
- No apto para produccion sin auditoria independiente previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l98
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas citada: https://github.com/szl-holdings/estate-cards
