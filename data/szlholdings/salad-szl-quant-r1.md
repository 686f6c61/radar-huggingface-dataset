# SZLHOLDINGS/salad-szl-quant-r1

## Resumen

salad-szl-quant-r1 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con trazabilidad documental. El repositorio tiene un tamano de 0,7 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de pequeno tamano o un checkpoint cuantizado, aunque la model card no especifica arquitectura, numero de parametros ni longitud de contexto.

La informacion disponible es extremadamente escasa: la model card se limita a describir el marco de gobernanza del autor (identidad del repo, sistema de recibos o "receipts", graficos SVG generados de forma determinista) y declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un recibo medido se considera UNKNOWN. El propio documento reconoce que no hay evidencia de evaluacion en el nivel estricto exigido (falta un DONE.json con estado MEASURED).

Por tanto, esta ficha no puede caracterizar tecnicamente el modelo mas alla de los metadatos del repositorio. No se dispone de datos sobre arquitectura, datos de entrenamiento, capacidades, benchmarks ni licencia. Se recomienda tratar el artefacto como no verificado hasta que el autor publique recibos medidos o documentacion tecnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre "quant" sugiere cuantizacion, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o un modelo de espacio de estados. Tampoco se indica el numero de parametros ni la longitud de contexto soportada.

Respecto al entrenamiento, el autor declara que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de recibos ("receipt files") del "estate mesh", y que cualquier cosa no respaldada por un recibo se considera UNKNOWN. El escaneo estricto de recibos de 2026-11-22 clasifica el repo como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg), pero no existe un DONE.json en el nivel estricto que incluya estado MEASURED, codigo de salida de evaluacion cero, marca temporal y recibo de entrenamiento. No se dispone de datos sobre volumen de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- No se confirma soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingues.
- No se confirman modos especiales (thinking mode, audio, vision u otros).
- El unico dato objetivo es la presencia de pesos en safetensors en un repositorio de 0,7 GB, compatible con un modelo pequeno o cuantizado, pero sin confirmacion de que sea funcional para inferencia.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificada sobre las capacidades del modelo. Los siguientes escenarios son hipoteticos y dependen de que el artefacto resulte ser un modelo de lenguaje funcional, algo que no se ha confirmado:

- Prototipado local en entornos con recursos limitados: el tamano de 0,7 GB permitiria, en principio, cargar los pesos en GPU de consumo, pero se desconoce si el checkpoint es completo o un fragmento.
- Evaluacion interna de artefactos de gobernanza: util para equipos que quieran auditar el sistema de recibos del autor y su metodologia de trazabilidad.
- Pruebas de reproducibilidad: el autor enfatiza la generacion determinista de graficos SVG a partir de instantaneas de auditoria, lo que podria interesar a quienes investigan pipelines de documentacion verificable.
- Integracion en pipelines de validacion de licencias y procedencia: el repo ejemplifica un formato de model card orientado a procedencia, aunque sin licencia declarada.
- Analisis de riesgos de cadena de suministro de modelos: sirve como caso de estudio de un artefacto publicado sin evidencia de evaluacion medible.
- Investigacion sobre practicas de documentacion: el contraste entre las afirmaciones de gobernanza y la ausencia de recibos estrictos es un ejemplo util en estudios sobre transparencia en modelos abiertos.

Ninguno de estos casos implica que el modelo produzca salidas de calidad; se basan en el artefacto como objeto documental, no en sus capacidades de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de 2026-11-22 marca la evidencia de evaluacion como UNKNOWN por ausencia de un DONE.json en el nivel estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repo (0,7 GB) sugiere que los pesos cabrian en GPUs de consumo con 8 GB o menos, pero se desconoce si el checkpoint esta completo, cuantizado o es un fragmento.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano de fichero seria plausible en tarjetas con 8-16 GB, sin garantia.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; no se confirma que el formato safetensors sea directamente cargable por estos motores ni que exista configuracion de tokenizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria del artefacto (tamano, tarea, arquitectura). La unica referencia estructural es el propio "estate" de SZLHOLDINGS, que agrupa otros artefactos bajo el mismo esquema de recibos, pero sin datos tecnicos publicos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay arquitectura, parametros, contexto ni tokenizador documentados.
- Sin licencia declarada: no se puede determinar si el uso comercial esta permitido; tratar como no licenciado para produccion.
- Evidencia de evaluacion marcada como UNKNOWN por el propio autor: no hay benchmarks medidos ni recibos en el nivel estricto.
- Riesgo de que el repositorio contenga un checkpoint incompleto o no funcional; el nombre "quant" sugiere cuantizacion pero no se especifica el esquema.
- Sin idiomas declarados: se desconoce el soporte multilingue.
- Riesgo de alucinacion y sesgos: no evaluable sin datos de entrenamiento ni pruebas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La model card prioriza el marco de gobernanza sobre la informacion tecnica, lo que dificulta la evaluacion practica del artefacto.
- No apto para produccion sin una auditoria independiente previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-szl-quant-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
