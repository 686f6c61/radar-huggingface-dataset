# SZLHOLDINGS/salad-ring-ouro-l88

## Resumen

`salad-ring-ouro-l88` es un artefacto publicado en Hugging Face por la organizacion SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad documental mediante ficheros de recibos (receipts). El repositorio se presenta como un "model (trained artifact in the governed factory)", es decir, un modelo entrenado dentro de su fabrica interna, pero la model card no aporta ninguna especificacion tecnica del artefacto: no indica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas.

La informacion disponible es exclusivamente meta-documental. La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe vivir en los ficheros de recibos del "estate mesh" y que lo no documentado alli se marca como UNKNOWN. El escaneo de recibos citado en la propia tarjeta (tranche 6, chunk 9, 2026-11-22) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`, por lo que la evidencia de evaluacion se declara UNKNOWN.

En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, no tiene pipeline declarado ni licencia visible, y la busqueda web no devuelve ningun resultado relacionado con el modelo (el unico resultado disponible trata de mandos de PSVR 2 y es irrelevante). En consecuencia, esta ficha documenta la existencia y el estado del artefacto, pero no puede caracterizar sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el unico fichero identificado es `assets/szl-card/mesh-receipts.svg`, un SVG de recibos, no pesos) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante, ni detalla capas, dimensiones ocultas, cabezas de atencion o funcion de activacion.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens, la composicion del corpus, si hubo ajuste supervisado, RLHF, DPO u otra fase de alineamiento. La unica afirmacion relevante es de naturaleza epistemica: el autor sostiene que las afirmaciones de entrenamiento y evaluacion de este artefacto viven en sus ficheros de recibos y que cualquier cosa no registrada alli se considera UNKNOWN. El escaneo de recibos de 2026-11-22 no encuentra un `DONE.json` estricto, de modo que no hay evidencia medida de entrenamiento ni de evaluacion asociada a este repositorio.

## Capacidades

- Generacion de texto: no disponible (no se documenta ninguna capacidad).
- Razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Trazabilidad documental: la unica caracteristica verificable es la inclusion de graficos SVG deterministas generados a partir de una instantanea de auditoria (2026-11-20T03:48:04Z, etiquetada MEASURED) y de un fichero de recibos por nombre.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones tecnicas verificadas. Los siguientes escenarios se plantean unicamente como marcos de evaluacion del artefacto, no como aplicaciones recomendadas:

- Auditoria de procedencia: inspeccionar los ficheros de recibos del repositorio para determinar que afirmaciones del autor estan respaldadas por evidencia medida y cuales quedan como UNKNOWN.
- Evaluacion comparativa interna: si el equipo dispone de acceso al "estate mesh" de SZLHOLDINGS, contrastar este artefacto con otros de la misma familia (`salad`) bajo el mismo baremo estricto de recibos.
- Prueba de pipeline de publicacion: usar el repositorio como caso de estudio de un flujo de publicacion que separa artefacto, recibos y tarjeta generada automaticamente.
- Verificacion de integridad de assets: comprobar que los SVG de la tarjeta son deterministas y reproducibles a partir de la instantanea de auditoria declarada.
- Docencia sobre transparencia en model cards: emplear la tarjeta como ejemplo de declaracion explicita de UNKNOWN frente a la invencion de metricas.
- Integracion en un registro interno de modelos: catalogar el artefacto con metadatos minimos (ID, autor, fechas de creacion y actualizacion) a la espera de que se publiquen especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que la evidencia de evaluacion es UNKNOWN al no existir un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`, y que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se identifican pesos en el repositorio, solo assets SVG.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria, el tamano y la tarea del artefacto, y la busqueda web no arroja resultados relacionados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l88 | no disponible | no disponible | no disponible | repositorio Hugging Face sin pipeline ni pesos identificados |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declara arquitectura, tamano, contexto, tokenizador ni idiomas, lo que impide cualquier evaluacion tecnica.
- Ausencia de pesos identificables: el unico fichero referenciado en la informacion disponible es un SVG de recibos; no se confirma la presencia de safetensors, GGUF ni ningun otro formato de pesos.
- Licencia no declarada: sin licencia explicita no puede asumirse ningun derecho de uso comercial, redistribucion o modificacion.
- Evidencia de evaluacion UNKNOWN: el escaneo de recibos de 2026-11-22 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no un `DONE.json` estricto que valide los resultados.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo; no debe asumirse ningun comportamiento seguro en produccion.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso por parte de la comunidad.
- Fechas de creacion y actualizacion (2026-11-19 y 2026-11-23) posteriores a la instantanea de auditoria citada en la tarjeta (2026-11-20), lo que conviene tener en cuenta al interpretar la trazabilidad.
- La model card incluye contenido generado automaticamente por herramientas del propio autor; debe tratarse como material de referencia y no como instrucciones ni como garantia de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l88
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas (estate-cards): https://github.com/szl-holdings/estate-cards
- Resultado de busqueda web disponible (no relacionado con el modelo): https://www.laptopmag.com/news/sony-reveals-new-psvr-2-controllers-for-ps5-adaptive-triggers-haptic-feedback-and-more
