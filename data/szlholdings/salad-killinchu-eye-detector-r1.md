# SZLHOLDINGS/salad-killinchu-eye-detector-r1

## Resumen

`salad-killinchu-eye-detector-r1` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada. Por el nombre del repositorio y el tamano del mismo (0,7 GB), se trata presumiblemente de un modelo de deteccion visual orientado a la deteccion de ojos, aunque la model card no confirma explicitamente la tarea, la arquitectura ni el pipeline. El repositorio contiene pesos en formato safetensors, lo que es coherente con un modelo de vision o multimodal de tamano pequeno o mediano.

La model card es deliberadamente escueta y esta dominada por metadatos de gobernanza y trazabilidad: identifica el origen canonico en la organizacion de GitHub del autor, referencia "receipts" (ficheros de auditoria) y declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un recibo medido se considera UNKNOWN. Esta postura de honestidad documental es relevante para el evaluador porque implica que no hay cifras de rendimiento verificables publicadas en la propia ficha.

El modelo no presenta descargas ni likes en el momento de la consulta, y no se declara licencia, idiomas ni pipeline. Cualquier uso en produccion requeriria contactar con el autor para obtener la licencia y la documentacion tecnica, o inspeccionar directamente los pesos y los ficheros de recibo del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el repo ocupa 0,7 GB, lo que sugiere un modelo de escala pequena o media, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El nombre del repositorio sugiere una funcion de deteccion visual ("eye-detector"), lo que apuntaria a un modelo de vision por computador (posiblemente un detector tipo YOLO, DETR o un transformer visual adaptado), pero no hay confirmacion explicita. El tamano del repositorio (0,7 GB) es compatible con un modelo de vision de escala moderada o con un modelo de lenguaje pequeno, sin que sea posible distinguir entre ambas posibilidades con los datos disponibles.

Respecto al entrenamiento, la model card indica que las afirmaciones sobre entrenamiento y evaluacion residen en los ficheros de recibo del "estate mesh" del autor, y que cualquier dato no respaldado por un recibo medido se marca como UNKNOWN. La seccion RECEIPTS senala que en el escaneo estricto del 22 de noviembre de 2026 se encontro la clase `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) pero no existe un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento. Por tanto, la evidencia de evaluacion se declara UNKNOWN. No se dispone de informacion sobre numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas.

## Capacidades

- Deteccion visual de ojos: la denominacion del modelo sugiere esta funcion, aunque no se documenta el formato de salida (bounding boxes, keypoints, mascaras) ni el dominio de aplicacion.
- No se documentan capacidades de generacion de texto, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan modos especiales (thinking mode, vision, audio) mas alla de la posible naturaleza visual implícita en el nombre.
- La model card no incluye ejemplos de uso, esquemas de entrada/salida ni demos.

## Casos de uso

Dado que la model card no documenta la tarea con precision, los siguientes casos son hipotesis razonables derivadas del nombre del repositorio y deben validarse contra los pesos y la documentacion del autor antes de cualquier uso real:

- Deteccion de ojos en imagenes de rostro: el modelo se aplicaria como etapa de preprocesado en pipelines de analisis facial, localizando regiones oculares para tareas posteriores como estimacion de mirada o deteccion de somnolencia.
- Monitorizacion de fatiga en conduccion: integrado en un sistema de vision a bordo, permitiria detectar la region ocular y alimentar un clasificador de parpadeo o microsueno; requiere validar latencia y precision en condiciones de iluminacion variable.
- Control de calidad en captura biometrica: en procesos de enrolamiento facial, el detector podria verificar que los ojos estan visibles y abiertos antes de aceptar la imagen.
- Analisis de accesibilidad en interfaces: evaluacion de la atencion visual de usuarios en estudios de UX mediante deteccion de la region ocular en capturas de pantalla o video.
- Preprocesado para reconocimiento de emociones: la localizacion ocular es una etapa habitual en pipelines de analisis de expresiones faciales.
- Investigacion en vision por computador: como componente de referencia o baseline en experimentos de deteccion de puntos faciales, siempre que la licencia lo permita (actualmente no declarada, por lo que el uso comercial no esta garantizado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos del 22 de noviembre de 2026 clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con un repositorio de 0,7 GB en safetensors, la inferencia en precision nativa requeriria del orden de 1-2 GB de VRAM como minimo, mas el overhead del runtime, pero esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponibles; por el tamano del artefacto, una GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) seria probablemente suficiente si se trata de un detector visual pequeno, pero no hay confirmacion.
- Compatibilidad con GPU consumer: probable por el tamano del repositorio, sin verificar.
- Opciones de despliegue: no documentadas. Al publicarse solo en safetensors, seria necesario un runtime compatible con PyTorch o similar (por ejemplo, Transformers, ONNX Runtime o TensorRT tras conversion); no se ofrecen variantes GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica la tarea con suficiente precision ni proporciona metricas, por lo que no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran arquitectura, parametros, contexto, idiomas ni pipeline, lo que impide evaluar su idoneidad sin inspeccionar los pesos.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con SZLHOLDINGS o revisar el repositorio de origen antes de cualquier despliegue en produccion.
- Evidencia de evaluacion UNKNOWN: el escaneo estricto de recibos no encontro un `DONE.json` medido, por lo que no hay garantia documentada de calidad ni de comportamiento del modelo.
- Riesgo de alucinacion y sesgos: no evaluable sin datos de entrenamiento ni evaluaciones publicadas; en un detector visual, los sesgos relevantes serian de representacion demografica e iluminacion, no documentados.
- Posible desajuste entre nombre y funcion: "eye-detector" sugiere deteccion ocular, pero la model card no lo confirma; el uso en dominios distintos al previsto puede producir resultados erroneos.
- Sin descargas ni likes: no hay senales de adopcion por la comunidad que permitan inferir validacion externa.
- Fechas de creacion y actualizacion (noviembre de 2026) y referencias a auditorias futuras respecto a la fecha habitual de consulta: conviene verificar la coherencia temporal de los metadatos antes de confiar en ellos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-killinchu-eye-detector-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (origen canonico citado): https://github.com/szl-holdings
- Herramienta de generacion de fichas citada: https://github.com/szl-holdings/estate-cards
