# SZLHOLDINGS/salad-ring-ouro-l11

## Resumen

`salad-ring-ouro-l11` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada ("governed-AI estate"). Segun la model card, el repositorio forma parte de una factoria de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo auditables) y enlazados a su fuente. No se especifica en la informacion disponible ni la arquitectura, ni el numero de parametros, ni el contexto, ni el proceso de entrenamiento.

La model card se centra en la trazabilidad y la honestidad epistemica: declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe vivir en ficheros de recibo, y que lo que no este "receipted" se marca como UNKNOWN. El escaneo de recibos incluido (tranche 6, chunk 4, 2026-11-22) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0` y marca temporal. La evidencia de evaluacion se declara, por tanto, UNKNOWN.

Por todo ello, esta ficha no puede aportar especificaciones tecnicas verificadas del modelo: se limita a documentar lo que el autor afirma (licencia Apache 2.0, pertenencia al estate SZLHOLDINGS) y a marcar como "no disponible" todo aquello que la informacion proporcionada no cubre. Es relevante ahora unicamente como ejemplo de practica de documentacion orientada a la auditoria, no como modelo evaluable para produccion.

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

No disponible. La model card no describe arquitectura (transformer, MoE, SSM, hibrida u otra), ni datos de entrenamiento (numero de tokens, composicion del dataset), ni tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. El autor declara que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de recibo del "estate mesh" y que cualquier dato no receipted se considera UNKNOWN.

El unico dato estructural verificable es el resultado del escaneo estricto de recibos (2026-11-22): clase `RECEIPT_FILES_NO_DONE`, sin `DONE.json` con `status=MEASURED` ni `eval_rc=0`. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, identificado por coincidencia de palabra clave y no validado como evidencia. La nota de licencia del estate (w45z) indica que la etiqueta `apache-2.0` se fijo el 2026-11-25 por operaciones del estate, sin evidencia de licencia upstream por fichero.

## Capacidades

- No disponible. La informacion proporcionada no documenta ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, matematicas, vision, audio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado en Hugging Face).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- La model card declara explicitamente que no se afirma ninguna capacidad ni calidad sin recibos de evaluacion medidos.

## Casos de uso

- No disponible. Sin arquitectura, tamano, contexto ni evaluacion publicados, no es posible recomendar escenarios de uso concretos ni justificar su idoneidad tecnica.
- Auditoria de documentacion de modelos: el repositorio puede estudiarse como ejemplo de model card centrada en trazabilidad, con etiquetado explicito MEASURED/REPORTED/UNKNOWN y clasificacion de evidencia por escaneo estricto.
- Verificacion de linaje en un estate gobernado: util para comprobar como SZLHOLDINGS enlaza repositorios con su organizacion fuente en GitHub y con ficheros de recibo.
- Evaluacion de gobernanza de licencias: la nota w45z documenta el cambio de etiqueta de licencia y la ausencia de evidencia upstream por fichero, lo que sirve como caso de estudio de gestion de derechos.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, agentes ni pipelines de CI/CD, al no existir evidencia medida de calidad ni especificaciones tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.
- Formato de pesos: no disponible, por lo que no puede confirmarse la compatibilidad con ningun runtime de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria, el tamano ni la tarea del modelo, por lo que no es posible establecer comparaciones con alternativas.

| Modelo | Parametros | Contexto | Licencia | Evidencia de evaluacion |
|---|---|---|---|---|
| salad-ring-ouro-l11 | no disponible | no disponible | apache-2.0 | UNKNOWN (sin DONE.json estricto) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se publican arquitectura, parametros, contexto, tokenizador ni formatos de pesos, lo que impide cualquier evaluacion tecnica.
- Evidencia de evaluacion UNKNOWN: el escaneo estricto no encuentra `DONE.json` con `status=MEASURED` ni `eval_rc=0`; no hay ninguna metrica de calidad verificada.
- El unico fichero con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) se detecto por coincidencia de palabra clave y no esta validado como evidencia.
- Licencia Apache 2.0 declarada por operaciones del estate (nota w45z) sin evidencia de licencia upstream por fichero; conviene verificar los derechos antes de cualquier uso comercial.
- Idiomas no declarados en la ficha de Hugging Face: riesgo de comportamiento no documentado fuera del idioma de entrenamiento, que se desconoce.
- Riesgo de alucinacion y sesgos: no evaluable sin datos de entrenamiento ni evaluaciones publicadas.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- Sin pipeline declarado en Hugging Face, por lo que la libreria y el runtime esperados son desconocidos.
- No apto para produccion sin una evaluacion independiente previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l11
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion fuente en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de tarjetas del estate: https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o repositorio adicionales: no disponible
