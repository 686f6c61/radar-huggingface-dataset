# SZLHOLDINGS/salad-ring-ouro-l112

## Resumen

salad-ring-ouro-l112 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con trazabilidad documental. El repositorio de Hugging Face no incluye pipeline declarado, idiomas soportados ni una model card técnica convencional; en su lugar, la card esta generada de forma automatica por una herramienta interna ("estate-cards weaver") y remite a ficheros de recibos (receipts) alojados en el repositorio para cualquier afirmacion sobre entrenamiento o evaluacion.

La relevancia de esta ficha es, por tanto, fundamentalmente documental y de evaluacion critica: se trata de un modelo sin evidencia publica de calidad, sin benchmarks medidos y sin especificaciones de arquitectura declaradas. La propia card indica explicitamente que cualquier dato no respaldado por un recibo con fecha se marca como UNKNOWN (desconocido), y el escaneo de recibos de la familia "salad" (tranche 6, chunk 4, 2026-11-22) clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion cero y marca temporal.

En consecuencia, no es posible confirmar arquitectura, numero de parametros, longitud de contexto ni capacidades reales del modelo a partir de la informacion disponible. La licencia declarada es Apache 2.0, aunque la propia nota de licencia del estate advierte que la etiqueta se fijo por decision operativa interna y no se respalda con evidencia de licencia por fichero del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (etiqueta fijada por el estate; sin evidencia de licencia por fichero del upstream) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) en la documentacion disponible. La model card no describe capas, dimensiones ocultas, mecanismo de atencion ni estrategia de tokenizacion.

Respecto al entrenamiento, la card remite a "receipt files" del estate para cualquier afirmacion sobre datos, numero de tokens o fases de alineacion (RLHF, DPO u otras). El escaneo estricto de recibos de 2026-11-22 no encuentra un DONE.json que cumpla el umbral del estate (estado MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento), por lo que la evidencia de evaluacion se clasifica como UNKNOWN. El unico fichero con nombre de recibo localizado es `assets/szl-card/mesh-receipts.svg`, que el propio autor advierte que es una coincidencia por palabra clave y no evidencia validada.

## Capacidades

- Generacion de texto: no confirmada; no hay documentacion que describa la tarea de entrenamiento.
- Razonamiento, codigo, matematicas o vision: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Modos especiales (thinking mode, audio, vision): no disponibles.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones verificadas de arquitectura, contexto, licencia por fichero y calidad medida. Los siguientes escenarios son genericos y quedan condicionados a que el modelo supere una evaluacion propia previa:

- Prototipado interno controlado: usar el artefacto en un entorno aislado para verificar que carga y genera texto coherente, antes de cualquier integracion.
- Evaluacion comparativa propia: someterlo a un conjunto de pruebas interno (perplejidad, generacion, instrucciones) frente a un modelo de referencia de tamano conocido.
- Pruebas de pipeline de despliegue: validar herramientas de serving (vLLM, TGI, llama.cpp) contra el formato de pesos real, una vez identificado este.
- Investigacion de gobernanza de artefactos: estudiar el esquema de "receipts" del estate SZLHOLDINGS como ejemplo de trazabilidad documental de modelos.
- Analisis de riesgos de cadena de suministro: auditar la procedencia de pesos y la validez de la etiqueta de licencia antes de un uso comercial.
- Docencia sobre evaluacion critica de modelos: emplear la card como caso de estudio de afirmaciones sin evidencia medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que mida una auditoria con fecha, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se ha confirmado el formato de pesos (safetensors, GGUF u otro).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Sin parametros, contexto ni arquitectura declarados, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto ni tokenizador, lo que impide estimar coste de inferencia o idoneidad para una tarea.
- Evidencia de evaluacion inexistente: el escaneo estricto de recibos (2026-11-22) clasifica el repositorio como RECEIPT_FILES_NO_DONE; no hay DONE.json con estado MEASURED.
- Riesgo de alucinacion y sesgos: no evaluables sin datos de entrenamiento ni pruebas publicadas.
- Licencia: la etiqueta Apache 2.0 se fijo por decision operativa interna del estate (nota w45z, 2026-11-25) y no se respalda con evidencia de licencia por fichero del upstream; conviene verificar la procedencia antes de un uso comercial.
- Idiomas: el campo de idiomas esta vacio; no se puede asumir soporte de castellano ni de ningun otro idioma.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado.
- Recomendacion operativa: tratar el artefacto como no verificado y no desplegarlo en produccion sin una evaluacion propia y una auditoria de licencia y procedencia de pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l112
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de cards (estate-cards weaver): https://github.com/szl-holdings/estate-cards
