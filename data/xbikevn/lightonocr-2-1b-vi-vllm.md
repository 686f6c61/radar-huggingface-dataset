# xbikevn/LightOnOCR-2-1B-vi-vllm

## Resumen

LightOnOCR-2-1B-vi-vllm es un ajuste fino (fine-tune) publicado por el usuario xbikevn sobre el modelo base lightonai/LightOnOCR-2-1B, un modelo de 1.005.647.872 parametros (aproximadamente 1,01 mil millones) orientado originalmente a tareas de OCR y comprension de documentos. El repositorio declara la etiqueta de arquitectura `mistral3`, lo que situa el modelo dentro de la familia Mistral 3 en su variante densa de ~1B, y se distribuye en formato safetensors con la libreria transformers bajo licencia Apache 2.0.

El sufijo `-vi` del nombre sugiere una especializacion hacia el vietnamita y el sufijo `-vllm` apunta a un empaquetado pensado para su despliegue con vLLM, si bien ninguna de las dos cosas se confirma en la model card, que se limita a indicar "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento. Esto convierte al modelo en un artefacto con trazabilidad tecnica minima: se conocen los hiperparametros de entrenamiento y las versiones de framework, pero no el dataset, ni el idioma real de entrenamiento, ni resultados de evaluacion.

Su relevancia practica es limitada pero concreta: se trata de un modelo pequeno (1B) que cabe en GPU de consumo, con licencia permisiva y generado a partir de un modelo OCR, lo que lo hace candidato para pipelines de digitalizacion documental con requisitos de coste y latencia bajos. No obstante, la ausencia total de benchmarks y de documentacion sobre el dataset de ajuste obliga a validarlo internamente antes de cualquier uso en produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Mistral 3 (etiqueta `mistral3` en el repositorio); no es MoE |
| Parametros totales | 1.005.647.872 (~1,01 mil millones), dato real de safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el sufijo `-vi` del identificador sugiere orientacion a vietnamita, sin confirmacion en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano de repositorio 3,7 GB, libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de lightonai/LightOnOCR-2-1B y se ajusta mediante el Trainer de transformers con un unico epoch sobre un dataset no identificado ("on an unknown dataset", segun la propia model card). Los hiperparametros declarados son: learning rate 6e-05, batch de entrenamiento 4, batch de evaluacion 6, acumulacion de gradientes 4 (batch efectivo 16), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08 en la variante `ADAMW_TORCH_FUSED`, scheduler lineal con 10 pasos de warmup. Las versiones de framework empleadas son Transformers 5.0.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

No se documenta ninguna innovacion tecnica adicional: no hay mencion a decodificacion especulativa, atencion lineal, RLHF, DPO ni a la composicion del dataset. La model card no incluye ni siquiera la seccion de resultados de entrenamiento, que aparece vacia. Tampoco se especifica si el ajuste conserva las capacidades multimodales del modelo base OCR ni como se trato la torre de vision durante el fine-tune, una cuestion critica dado que el pipeline declarado en HuggingFace es `text-generation` y no una tarea de vision-lenguaje.

## Capacidades

- Generacion de texto y uso conversacional: el modelo esta etiquetado como `text-generation` y `conversational` en HuggingFace.
- Ajuste derivado de un modelo OCR: el punto de partida (LightOnOCR-2-1B) es un modelo de reconocimiento optico de caracteres, por lo que se espera cierta competencia en transcripcion y tratamiento de texto extraido de documentos, aunque no se documenta como se preserva esa capacidad tras el fine-tune.
- Posible especializacion en vietnamita: inferida del sufijo `-vi`, no confirmada.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Vision, audio u otras modalidades: no documentadas en este repositorio; el pipeline declarado es unicamente de generacion de texto.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo hereda del base OCR de LightOn, de modo que puede emplearse para transcribir texto de imagenes de documentos y devolverlo en formato limpio dentro de un pipeline de captura documental, siempre que se valide previamente la calidad de transcripcion con muestras propias.
- Post-procesado de salidas OCR: normalizacion de texto, correccion de artefactos de reconocimiento y reestructuracion de bloques (encabezados, tablas, listas) antes de almacenar el contenido en un repositorio documental.
- Extraccion estructurada para ingestas RAG: conversion de documentos a JSON o Markdown con campos delimitados, que despues se indexan en un sistema de recuperacion aumentada; su tamano de 1B permite procesar volumenes altos con coste por token muy reducido.
- Preprocesado de corpus a gran escala: limpieza y reformateo de grandes colecciones de documentos antes de usarlas para entrenar o evaluar modelos mayores, ejecutando la inferencia en una sola GPU.
- Despliegue en entornos con requisitos de soberania de datos: al ser un modelo de 1B con licencia Apache 2.0, puede ejecutarse on-premise o en el edge sin dependencia de APIs externas, util en sectores con restricciones de confidencialidad.
- Asistente conversacional ligero: al estar etiquetado como `conversational`, puede sostener dialogos de dominio acotado (FAQ internas, formularios guiados) donde la latencia y el coste importan mas que la profundidad de razonamiento.
- Clasificacion y resumen de documentos a escala: etiquetado tematico o generacion de resumenes cortos en lotes grandes, aprovechando que el modelo cabe en GPU de consumo.
- Servicio de inferencia con vLLM: el propio identificador del repositorio sugiere un empaquetado orientado a vLLM, lo que facilitaria el despliegue con batching continuo y throughput alto para cargas concurrentes.

En todos los casos, la ausencia de evaluacion publicada hace obligatoria una fase de validacion con datos propios antes de llevarlos a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara la entrada "LightOnOCR-2-1B-vi" con un array de resultados vacio, y la seccion "Training results" del README tambien esta vacia. No existen por tanto datos de MMLU, HumanEval, GSM8K ni de metricas de OCR (CER, WER) atribuibles a este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos a partir del numero de parametros, no medidas publicadas):
  - BF16/FP16: aproximadamente 2,0 GB solo de pesos, mas overhead de runtime (cache KV, activaciones), en torno a 3-4 GB en total.
  - INT8: aproximadamente 1,0 GB de pesos.
  - INT4 (por ejemplo GGUF Q4_K_M): aproximadamente 0,6-0,7 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en BF16 para lotes pequenos; RTX 3060, RTX 4060, RTX 4090, L4, A10G, A100 y H100 sirven sin problema. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si. La practica totalidad de tarjetas actuales (RTX 3050 en adelante) puede ejecutarlo, y en cuantizacion INT4 tambien en equipos con GPU integrada o CPU.
- Opciones de despliegue: transformers de forma nativa; vLLM, segun sugiere el sufijo del repositorio y la etiqueta `endpoints_compatible`; llama.cpp u Ollama solo si se genera previamente una conversion a GGUF, ya que el repositorio no publica pesos GGUF. Tambien es viable TGI si se dispone de los pesos en safetensors.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado en la informacion disponible |
|---|---|---|---|---|---|
| xbikevn/LightOnOCR-2-1B-vi-vllm | 1.005.647.872 | no disponible | Apache 2.0 | safetensors | 0 descargas, 0 likes, sin benchmarks |
| lightonai/LightOnOCR-2-1B (modelo base) | ~1B (el ajuste declara 1,01B) | no disponible | no disponible | no disponible | Referenciado como `base_model` en este repositorio |
| Otras alternativas de ~1B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se aportan datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de OCR o de generacion de texto de tamano similar.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento, y no incluye seccion de resultados.
- Dataset de entrenamiento desconocido: se desconoce su composicion, su tamano, su idioma y si contiene datos con derechos o sesgos problematicos. Esto impide evaluar sesgos conocidos.
- Sin benchmarks ni evaluacion: no hay ninguna metrica publicada, ni de calidad de generacion ni de precision OCR. El rendimiento real es una incognita.
- Idiomas no confirmados: aunque el sufijo `-vi` apunte a vietnamita, no hay confirmacion oficial; el comportamiento en castellano o en otros idiomas es desconocido.
- Riesgo de alucinacion: no evaluado. En tareas de transcripcion documental, una alucinacion puede traducirse en contenido inventado dentro de un documento, con impacto directo si el texto se usa para decisiones administrativas o financieras.
- Ventana de contexto desconocida: no se puede garantizar el tratamiento de documentos largos ni planificar estrategias de troceado sin una medicion propia.
- Posible perdida de capacidades multimodales: el pipeline declarado es `text-generation`, y no se documenta como se trato la torre de vision del base OCR durante el ajuste. Conviene verificar si el modelo sigue aceptando imagenes como entrada.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No obstante, deben respetarse las condiciones del modelo base original.
- Procedencia y soporte: repositorio de un autor individual, con 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento ni de correccion de errores. Para produccion se recomienda congelar una revision concreta del repositorio.
- Sin cuantizaciones publicadas: desplegar en llama.cpp, Ollama o entornos con memoria muy limitada exige convertir los pesos manualmente y validar que no se degrada la calidad.
- Fecha de creacion y actualizacion muy proximas (10 de septiembre de 2026, con 18 segundos de diferencia): el repositorio parece un artefacto subido de forma automatica, sin curacion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbikevn/LightOnOCR-2-1B-vi-vllm
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su autor o el modelo base. Las URLs devueltas por la busqueda corresponden a foros de soporte de Microsoft y a guias de SanDisk sin relacion alguna con el modelo.
