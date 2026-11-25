# SZLHOLDINGS/salad-physics-tutor-r1

## Resumen

salad-physics-tutor-r1 es un modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", una coleccion de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). Por el nombre y la model card, el artefacto se presenta como un modelo de tipo "tutor" orientado a fisica, presumiblemente un ajuste fino de un modelo base con el objetivo de asistir en explicaciones y resolucion de problemas de fisica. El repositorio tiene un tamano de 0,7 GB, lo que sugiere un modelo de parametros moderados (del orden de 1 a 4 mil millones en funcion del formato de pesos), aunque este dato no se confirma en la informacion disponible.

La relevancia del modelo es limitada en el momento de redactar esta ficha: no hay pipeline declarado, no se especifican idiomas, no se documentan parametros, arquitectura ni contexto, y la propia model card indica explicitamente que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibos que, segun el escaneo incluido en la card, no alcanzan el umbral estricto de evidencia (clase RECEIPT_FILES_NO_DONE, con evaluacion marcada como UNKNOWN). La card adopta una politica de honestidad explicita: no se afirma ningun numero de benchmark que no haya sido medido en una auditoria fechada.

En consecuencia, esta ficha describe lo que el autor declara y marca como "no disponible" todo aquello que no aparece en la informacion proporcionada. Se trata, por tanto, de una ficha de evaluacion preliminar: util para localizar el artefacto y entender su encuadre declarativo, pero insuficiente para recomendarlo en produccion sin verificacion adicional de los recibos en el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo: la model card no indica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un SSM, ni tampoco el numero de parametros, capas, dimensiones ocultas o cabezas de atencion. El unico indicio estructural es el tamano del repositorio (0,7 GB) y el formato safetensors, compatible con un checkpoint de pesos en precision completa o media para un modelo de escala pequena o media, pero el dato no permite inferir parametros con rigor.

Respecto al entrenamiento, la card no documenta numero de tokens, composicion del dataset, uso de RLHF, DPO u otra etapa de alineamiento. El autor remite a "receipt files" del estate para cualquier afirmacion de entrenamiento o evaluacion, y el escaneo incluido en la propia card (tranche 6, chunk 3, 2026-11-22) clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) pero no un DONE.json estricto con status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento. Por tanto, no hay evidencia validada de entrenamiento ni de evaluacion en la informacion disponible.

## Capacidades

- Generacion de texto: capacidad esperable en cualquier modelo de lenguaje, pero no documentada explicitamente en la card.
- Tutoria de fisica: el nombre del artefacto sugiere un ajuste orientado a explicar conceptos y resolver problemas de fisica; no se aporta evidencia medida de esta capacidad.
- Razonamiento matematico: no documentado.
- Generacion de codigo: no documentada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (el campo de idiomas no esta disponible).
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Trazabilidad declarada: el autor afirma un marco de "governed AI" con recibos verificables, pero el propio escaneo de la card indica que el umbral estricto de evidencia no se alcanza para este artefacto.

## Casos de uso

- Prototipado de tutoria educativa en fisica: el modelo podria emplearse como base para experimentar con explicaciones paso a paso de problemas de mecanica, electromagnetismo o termodinamica, siempre que se valide su calidad con evaluaciones propias, dado que no hay benchmarks publicados.
- Generacion de material didactico de apoyo: redaccion de enunciados, pistas y soluciones comentadas para asignaturas de fisica de secundaria o universidad, con revision humana obligatoria por el riesgo de alucinacion en calculos.
- Entrenamiento de modelos derivados: al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como punto de partida para ajuste fino supervisado o DPO en dominios cientificos concretos, siempre que se confirme la arquitectura y el modelo base subyacente.
- Evaluacion comparativa interna: util como artefacto de referencia en un banco de pruebas propio de modelos cientificos, especialmente para contrastar la calidad de tutoria en fisica frente a modelos generalistas.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): el modelo podria responder consultas de fisica apoyandose en una base documental externa, lo que mitiga parcialmente la falta de evidencia sobre su conocimiento factual.
- Despliegue en entornos de investigacion con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en proyectos academicos y comerciales sin obligaciones de copyleft, aunque la ausencia de documentacion tecnica exige una fase de validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos incluido clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa basada solo en el tamano del repositorio (0,7 GB), un checkpoint en fp16 de ese tamano corresponderia a un modelo de aproximadamente 350 millones de parametros, que cabria en cualquier GPU consumer con 4-8 GB de VRAM; sin embargo, el tamano del repo no confirma el numero de parametros y esta estimacion no debe tomarse como dato verificado.
- GPU recomendadas: no disponible. Si se confirma la escala sugerida por el tamano del repo, bastaria una RTX 3060, RTX 4060 o superior; para escalas mayores harian falta A100 o H100, pero no hay datos para determinarlo.
- Cabe en GPU consumer: probablemente si, segun el tamano del repositorio, pero no confirmado.
- Opciones de despliegue: al estar en safetensors, seria desplegable con vLLM, TGI o transformers; no se ofrecen variantes GGUF, por lo que llama.cpp u Ollama requeririan conversion previa. No hay configuracion de despliegue documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar el modelo base ni la familia a la que pertenece, y no se documentan parametros, contexto ni rendimiento, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Evidencia de evaluacion |
|---|---|---|---|---|
| salad-physics-tutor-r1 | no disponible | no disponible | Apache 2.0 | UNKNOWN (sin DONE.json estricto) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de evidencia medida: la propia model card clasifica el artefacto como RECEIPT_FILES_NO_DONE y marca la evaluacion como UNKNOWN; no hay benchmarks, curvas de entrenamiento ni recibos validados en la informacion disponible.
- Falta de documentacion tecnica: no se declaran arquitectura, parametros, contexto, idiomas ni pipeline, lo que impide evaluar su idoneidad para tareas concretas sin inspeccionar el repositorio de origen.
- Riesgo de alucinacion: en un modelo de tutoria de fisica sin evaluacion publicada, la probabilidad de errores en calculos, unidades y leyes fisicas es alta y debe mitigarse con verificacion humana o con herramientas de calculo externas.
- Sesgos conocidos: no documentados; al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos linguisticos, culturales o cientificos.
- Restricciones de licencia: la licencia Apache 2.0 es permisiva y permite uso comercial, pero la nota de licencia de la card aclara que la etiqueta fue fijada por operaciones del estate (W45Z) sin evidencia de licencia upstream por fichero; conviene verificar la procedencia de los pesos antes de un uso comercial.
- Idiomas: no declarados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Madurez del artefacto: con 0 descargas y 0 likes en el momento de la consulta, no hay senales de uso comunitario ni de validacion externa.
- Fechas de creacion y actualizacion (noviembre de 2026) posteriores al momento habitual de evaluacion: conviene confirmar la vigencia y el estado actual del repositorio en origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-physics-tutor-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
