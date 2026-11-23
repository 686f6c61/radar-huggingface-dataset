# SZLHOLDINGS/salad-ring-ouro-l78

## Resumen

`salad-ring-ouro-l78` es un artefacto entrenado publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibos (receipts). El repositorio de Hugging Face existe, esta etiquetado como `model` y contiene una model card generada de forma automatica por la herramienta interna `estate-cards weaver` (v0.1.0). No se especifica en ningun momento que tipo de modelo es, que arquitectura emplea ni para que tarea fue entrenado.

La model card es deliberadamente minimalista y no aporta informacion tecnica sustantiva: no indica parametros, contexto, tokenizador, datos de entrenamiento ni licencia. El propio autor reconoce que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" y que cualquier cosa no registrada alli es UNKNOWN. La seccion RECEIPTS del README confirma ademas que el escaneo estricto no encontro un `DONE.json` valido con estado MEASURED, por lo que la evidencia de evaluacion se declara explicitamente como desconocida.

En la practica, se trata de un repositorio sin descargas, sin likes, sin pipeline declarado y sin documentacion utilizable para evaluar el modelo. Es relevante unicamente como ejemplo de publicacion automatizada de artefactos con trazabilidad declarativa, no como modelo candidato para desarrollo o investigacion.

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

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de parametros, la longitud de contexto nativa ni el vocabulario del tokenizador.

Respecto al entrenamiento, el autor declara que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de recibo alojados en el "estate mesh" y que cualquier dato no registrado alli debe considerarse UNKNOWN. La seccion RECEIPTS indica que el escaneo estricto (tranche 6, chunk 9, 2026-11-22) clasifico el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (concretamente `assets/szl-card/mesh-receipts.svg`), pero no hay un `DONE.json` que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). No se dispone por tanto de datos sobre volumen de tokens, composicion del dataset, tecnicas de alineamiento (RLHF, DPO) ni innovaciones tecnicas.

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas cubiertos.
- No se declara modo de razonamiento extendido (thinking mode) ni capacidades multimodales.
- El unico dato funcional implicito es la etiqueta `kind:model` de la model card, que indica que el artefacto se presenta como un modelo entrenado, sin mas especificacion.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion sobre la tarea, la arquitectura o el rendimiento del modelo. Los siguientes escenarios son los unicos que pueden plantearse de forma realista dada la informacion disponible:

- Auditoria de trazabilidad de artefactos: inspeccionar el repositorio como ejemplo de publicacion automatizada con model cards generadas por `estate-cards weaver` y comparar el esquema de recibos con el de otros repositorios del mismo autor.
- Verificacion de integridad documental: comprobar que el repositorio carece de `DONE.json` en el umbral estricto y usar ese hallazgo como caso de prueba para herramientas de validacion de evidencias.
- Estudio de governance de IA: analizar el patron "receipt-named files sin DONE.json" como ejemplo de discrepancia entre la presentacion de resultados verificables y la evidencia realmente disponible.
- Pruebas de pipelines de descubrimiento de modelos: usar el repositorio como caso negativo en sistemas que filtran modelos por licencia, idioma, pipeline o numero de descargas.
- Docencia sobre evaluacion critica de model cards: ilustrar como una card puede declarar honestidad metodologica y, al mismo tiempo, no aportar ningun dato tecnico utilizable.
- Archivo historico: conservar la referencia por su fecha de creacion (2026-11-19) y su identificador de card (`d261d52a66823191`) dentro del catalogo del autor.

No se recomienda su uso en produccion, investigacion aplicada ni evaluacion comparativa de capacidades sin antes obtener del autor los recibos de entrenamiento y evaluacion en el umbral estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y la seccion RECEIPTS indica que la evidencia de evaluacion es UNKNOWN por ausencia de `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni tokenizador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria, el tamano y la tarea del artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l78 | no disponible | no disponible | no disponible | Repositorio HF sin descargas ni pipeline |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni tokenizador declarados, es imposible planificar su integracion.
- Evidencia de evaluacion declarada como UNKNOWN: el escaneo estricto no encontro `DONE.json` con estado MEASURED, por lo que no hay garantia de que el modelo haya sido entrenado o evaluado correctamente.
- Licencia no especificada: no puede asumirse uso comercial ni redistribucion; en ausencia de licencia explicita, los derechos quedan reservados por defecto en muchas jurisdicciones.
- Idiomas no declarados: no puede asumirse soporte de castellano ni de ningun otro idioma.
- Riesgo de alucinacion y sesgos: no evaluable sin datos de entrenamiento ni evaluaciones publicadas.
- Formato de pesos no declarado: no se puede confirmar compatibilidad con safetensors, GGUF ni ninguna otra libreria de inferencia.
- Model card generada automaticamente: parte del contenido (graficos SVG, badges, identificadores) procede de una herramienta interna (`estate-cards weaver v0.1.0`) y no constituye documentacion tecnica revisada por humanos.
- Cero descargas y cero likes en el momento de la consulta: sin senales de uso ni validacion por parte de la comunidad.
- Fecha de creacion futura respecto a la mayoria de catalogos: conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l78
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
