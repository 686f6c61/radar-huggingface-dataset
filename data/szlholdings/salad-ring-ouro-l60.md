# SZLHOLDINGS/salad-ring-ouro-l60

## Resumen

salad-ring-ouro-l60 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "governed-AI estate", un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio se creo el 18 de noviembre de 2026 y se actualizo por ultima vez el 23 de noviembre de 2026. No se ha publicado ninguna descarga ni interaccion en Hugging Face en el momento de redactar esta ficha.

La model card no proporciona informacion sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El autor declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion reside en ficheros de recibos del "estate mesh" y que lo no registrado en ellos se considera UNKNOWN (desconocido). Un escaneo estricto posterior (tranche 6, chunk 8, 22 de noviembre de 2026) clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento).

Por tanto, la relevancia practica de este modelo es limitada a efectos de evaluacion: no hay evidencia medida de calidad, capacidades ni rendimiento, y la propia organizacion indica que no afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido. Esta ficha documenta lo disponible y marca como "no disponible" todo lo que la informacion proporcionada no cubre.

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

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM, hibrida u otra), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas de alineacion como RLHF o DPO. La model card se limita a describir el modelo como "trained artifact in the governed factory" dentro del estate de SZLHOLDINGS, sin detallar el proceso de entrenamiento.

El autor declara que las afirmaciones de entrenamiento y evaluacion de este artefacto viven en sus ficheros de recibos, y que cualquier cosa no registrada en ellos es UNKNOWN. El escaneo estricto de recibos indica que no existe un DONE.json que valide evidencia de evaluacion, por lo que no hay innovaciones tecnicas documentadas ni resultados verificables de entrenamiento.

## Capacidades

- No se documenta ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas o vision) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas figuran como no disponibles).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos sin evidencia medida de capacidades, contexto o licencia. Los siguientes escenarios quedan condicionados a la publicacion de recibos validos:

- Evaluacion interna controlada: usar el artefacto unicamente en un entorno de laboratorio para inspeccionar pesos y comportamiento, dado que no hay evidencia publica de calidad.
- Auditoria de trazabilidad: revisar los ficheros de recibos del estate para verificar si en el futuro se publica un DONE.json con status=MEASURED.
- Reproduccion de pipelines del estate: integrar el modelo en el flujo de la fabrica de SZLHOLDINGS si se dispone de acceso a su infraestructura de recibos.
- Pruebas de conformidad de licencia: no aplicable hasta que se publique una licencia explicita.
- Benchmarking comparativo: solo tras obtener resultados medidos y fechados por el propio autor.
- Despliegue en produccion: no recomendable en el estado actual por ausencia de licencia, especificaciones y evidencia de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque se desconoce el tamano, la tarea y la arquitectura de salad-ring-ouro-l60.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede evaluar idoneidad, coste de inferencia ni requisitos de despliegue.
- Sin licencia publicada: no hay base legal explicita para uso comercial o redistribucion.
- Sin evidencia de evaluacion medida: el escaneo estricto clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN.
- Riesgo de alucinacion y sesgos: no evaluables sin datos de entrenamiento ni pruebas publicadas.
- Idiomas y contexto: no disponibles, por lo que no se puede garantizar cobertura linguistica ni conversaciones de contexto largo.
- Cero descargas y cero interacciones en Hugging Face: no hay validacion por parte de la comunidad.
- La model card contiene graficos SVG generados de forma determinista a partir de una instantanea de auditoria (2026-11-20T03:48:04Z), pero no constituyen evidencia de calidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l60
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
