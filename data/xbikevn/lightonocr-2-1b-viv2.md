# xbikevn/LightOnOCR-2-1B-viv2

## Resumen

LightOnOCR-2-1B-viv2 es un ajuste fino (fine-tune) del modelo xbikevn/LightOnOCR-2-1B-vi, publicado por el usuario xbikevn en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text orientado a tareas de reconocimiento optico de caracteres (OCR) y conversion de imagenes de documentos a texto, con 1.005.647.872 parametros totales (aproximadamente 1.000 millones) y pesos en safetensors. La model card indica que fue entrenado con la libreria Transformers y que pertenece a la familia de arquitectura identificada con la etiqueta `lighton_ocr`.

El modelo se distribuye bajo licencia Apache 2.0 y su repositorio ocupa 2,0 GB, un tamano coherente con pesos en precision de 16 bits para un modelo de 1B de parametros. Su relevancia practica radica en el nicho de OCR de bajo coste computacional: un modelo de ~1B puede desplegarse en GPUs de consumo o incluso en entornos con recursos limitados, a diferencia de los sistemas de OCR basados en modelos de vision-lenguaje de 3B a 8B parametros.

No obstante, la informacion publica disponible es muy escasa: la model card fue generada automaticamente por el Trainer de HuggingFace y contiene marcadores de plantilla del tipo "More information needed" en las secciones de descripcion, usos previstos, datos de entrenamiento y resultados. El model-index no incluye ningun resultado de evaluacion y el modelo registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (etiqueta de arquitectura `lighton_ocr`); detalle interno no disponible |
| Parametros totales | 1.005.647.872 |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (el sufijo "vi" del modelo base sugiere una adaptacion al vietnamita, no confirmado en la informacion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 2,0 GB |
| Modalidades de entrada | imagen + texto |
| Modalidad de salida | texto |
| Modelo base | xbikevn/LightOnOCR-2-1B-vi |
| Version de transformers usada en entrenamiento | 5.0.0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La etiqueta de arquitectura declarada en el repositorio es `lighton_ocr`, lo que apunta a una familia de modelos de vision-lenguaje especializada en OCR, con un codificador de vision acoplado a un decodificador de lenguaje autorregresivo. El recuento de parametros en safetensors (1.005.647.872) es consistente con un modelo denso de aproximadamente 1B de parametros que incluye tanto el componente de vision como el de lenguaje. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la resolucion de imagen soportada, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO.

Los hiperparametros de entrenamiento si estan documentados, ya que la model card fue autogenerada por el Trainer: learning rate de 6e-05, batch de entrenamiento de 4 con 4 pasos de acumulacion de gradiente (batch total efectivo de 16), batch de evaluacion de 6, una unica epoca, semilla 42, optimizador AdamW con betas (0,9 / 0,999) y epsilon 1e-08, planificador de learning rate lineal con 10 pasos de calentamiento. El dataset de entrenamiento figura explicitamente como "unknown dataset". El entorno de ejecucion declarado incluye Transformers 5.0.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. La combinacion de una sola epoca y un dataset no documentado sugiere un ajuste fino corto sobre el modelo base, probablemente orientado a adaptar el OCR a un dominio o idioma concreto.

## Capacidades

- Generacion de texto a partir de imagenes: el pipeline declarado es image-text-to-text, es decir, conversion de imagenes (documentos escaneados, capturas, fotografias) en texto transcrito.
- OCR de documentos: la denominacion del modelo y su linaje (LightOnOCR) indican una especializacion en extraccion de texto de documentos.
- Procesamiento conversacional: entre las etiquetas figura `conversational`, lo que sugiere soporte de interaccion por turnos con imagenes como entrada.
- Compatibilidad con endpoints de HuggingFace: la etiqueta `endpoints_compatible` indica que el modelo esta preparado para su despliegue en la infraestructura de inferencia gestionada de HuggingFace.
- Razonamiento multi-paso, tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales adicionales (audio, video, modo "thinking" explicito): no disponible.
- Cobertura multilingue: no disponible; el sufijo "vi" del modelo base apunta a un foco en vietnamita, sin confirmacion.

## Casos de uso

- Digitalizacion de archivos escaneados: el modelo puede convertir lotes de imagenes de documentos historicos o administrativos en texto plano para su indexacion posterior, con un coste de inferencia bajo gracias a su tamano de ~1B de parametros.
- Extraccion de datos de facturas y recibos: dado que trabaja como modelo de imagen a texto, puede transcribir campos como importes, fechas y numeros de referencia antes de un post-procesado con expresiones regulares o un modelo de extraccion estructurada.
- Automatizacion de entrada de formularios: en flujos administrativos o sanitarios donde los formularios llegan en papel o PDF escaneado, el modelo puede producir la transcripcion que alimenta el sistema de gestion.
- Construccion de pipelines RAG sobre documentos fisicos: la transcripcion OCR generada puede embeberse en una base vectorial para permitir busquedas semantica sobre documentacion que solo existe en formato imagen.
- Despliegue en el borde o en hardware modesto: con ~1B de parametros y pesos de 2,0 GB, es candidato para ejecutarse en una unica GPU de consumo o en un servidor de gama media, cubriendo casos en los que un modelo de 7B u 8B resultaria demasiado costoso.
- Preprocesado de corpus para entrenamiento: puede usarse como extractor de texto masivo para construir datasets de texto a partir de fuentes escaneadas, siempre que la licencia Apache 2.0 del modelo y los derechos sobre los documentos lo permitan.
- Asistencia de accesibilidad: conversion de documentos fotografiados en texto que pueda ser leido por un sintetizador de voz o un lector de pantalla.
- Verificacion en pipelines de control de calidad documental: comparar el texto extraido con un OCR clasico para detectar discrepancias en documentos criticos.
- Advertencia: ninguno de estos casos cuenta con validacion publicada de precision por parte del autor, por lo que cualquier uso en produccion requiere una evaluacion propia sobre el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card contiene una entrada con el campo `results` vacio, y la seccion "Training results" del README esta en blanco. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K, ni de metricas especificas de OCR como CER, WER, precision de transcripcion o evaluaciones sobre OmniDocBench u otros conjuntos de referencia documental.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 2,0-2,5 GB solo para los pesos, mas el coste del codificador de vision y las activaciones, que dependen de la resolucion de imagen de entrada y del numero de imagenes por lote. En la practica, entre 4 y 6 GB de VRAM para una imagen por peticion con resolucion moderada; estas cifras son estimaciones a partir del recuento de parametros declarado, no datos publicados por el autor.
- Cuantizacion: el repositorio no incluye pesos cuantizados (GGUF, AWQ, GPTQ). Seria necesario generarlos localmente, y su viabilidad depende del soporte de la arquitectura `lighton_ocr` en las herramientas de cuantizacion.
- GPUs recomendadas: cualquier GPU con al menos 6-8 GB de VRAM resulta suficiente en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para procesamiento por lotes de alto volumen, A100 o H100 ofrecen mayor paralelismo, aunque estan sobredimensionadas para un modelo de 1B.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU modernas con 8 GB o mas de VRAM, incluidas variantes de portatil con 8 GB.
- Opciones de despliegue: transformers es la via documentada (el modelo usa `library_name: transformers` y la etiqueta `endpoints_compatible`). El soporte en vLLM, TGI, Ollama o llama.cpp no esta confirmado en la informacion disponible; dado que la arquitectura es una implementacion especifica (`lighton_ocr`) y que no se publican pesos GGUF, el despliegue en esas herramientas requeriria verificacion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo por pagina.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que la comparacion se limita a lo verificable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento OCR |
|---|---|---|---|---|---|
| xbikevn/LightOnOCR-2-1B-viv2 | 1.005.647.872 | no disponible | apache-2.0 | safetensors en HuggingFace, 0 descargas | no disponible |
| xbikevn/LightOnOCR-2-1B-vi (modelo base) | no disponible en la informacion | no disponible | no disponible | HuggingFace | no disponible |
| Otros modelos de OCR de ~1B de la familia LightOnOCR | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de OCR basados en vision-lenguaje de mayor tamano (3B-8B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Model card incompleta: practicamente todas las secciones descriptivas contienen el marcador "More information needed"; no hay declaracion de usos previstos ni de limitaciones por parte del autor.
- Ausencia total de evaluacion: no se publican metricas de calidad de transcripcion, lo que impide estimar la tasa de error de caracteres o de palabras en cualquier idioma o dominio.
- Dataset de entrenamiento desconocido: figura como "unknown dataset", de modo que no puede evaluarse si hubo sesgos de dominio, contaminacion de datos o problemas de licencia en los datos de ajuste.
- Riesgo de alucinacion en OCR: como todo modelo generativo aplicado a imagenes, puede producir texto plausible que no aparece en la imagen, especialmente en documentos con ruido, sellos, caligrafia o tablas complejas. En aplicaciones con implicaciones legales, financieras o medicas es imprescindible una verificacion humana o un sistema de control cruzado.
- Cobertura de idiomas no verificada: el sufijo "vi" del modelo base sugiere una especializacion en vietnamita. El rendimiento sobre texto en castellano o en otros idiomas no esta documentado y podria ser deficiente.
- Sin cuantizaciones publicadas: la ausencia de GGUF limita el despliegue en CPU y en entornos con poca memoria mediante llama.cpp u Ollama.
- Arquitectura especifica: la etiqueta `lighton_ocr` implica que se necesita una version de transformers que reconozca esa arquitectura (el entrenamiento uso Transformers 5.0.0); en versiones antiguas podria requerir `trust_remote_code` o fallar directamente. Conviene auditar cualquier codigo remoto antes de ejecutarlo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero es responsabilidad del usuario verificar la licencia y las condiciones del modelo base xbikevn/LightOnOCR-2-1B-vi, asi como de los modelos ascendentes de la familia LightOnOCR, que pueden imponer restricciones adicionales.
- Madurez: con 0 descargas y 0 "likes", el modelo no cuenta con validacion por parte de la comunidad; no deberia adoptarse en produccion sin una evaluacion exhaustiva propia.
- Fecha de publicacion: el repositorio figura como creado el 11 de septiembre de 2026, posterior a la fecha de referencia habitual de las fichas; conviene confirmar la vigencia del artefacto.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/xbikevn/LightOnOCR-2-1B-viv2
- Modelo base: https://huggingface.co/xbikevn/LightOnOCR-2-1B-vi
- Perfil del autor en HuggingFace: https://huggingface.co/xbikevn
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (perfiles de LinkedIn de personas ajenas al proyecto) y no aportan informacion tecnica utilizable. No se han localizado papers, blogs, repositorios ni demos asociados a este modelo en la informacion disponible.
