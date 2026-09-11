# xbikevn/LightOnOCR-2-1B-viv2-vllm

## Resumen

LightOnOCR-2-1B-viv2-vllm es un ajuste fino (fine-tune) del modelo xbikevn/LightOnOCR-2-1B-vi, publicado por el usuario xbikevn en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de tipo image-text-to-text, es decir, un modelo vision-language orientado a tareas de reconocimiento optico de caracteres (OCR) y conversion de imagenes de documentos en texto. Cuenta con 1.005.647.872 parametros (aproximadamente 1.000 millones) y un repositorio de 3,7 GB en formato safetensors.

El modelo parte de la familia LightOnOCR-2-1B, desarrollada originalmente por la empresa francesa LightOn, y esta adaptado a traves de un entrenamiento supervisado de una sola epoca con Learning Rate 6e-05, batch total de 16 y el optimizador AdamW fusionado. El sufijo "-vllm" del identificador sugiere que este checkpoint esta preparado o verificado para su despliegue con el motor de inferencia vLLM, lo que resulta relevante para equipos que necesitan servir OCR de forma masiva con bajo coste computacional.

Su relevancia actual radica en el creciente interes por modelos de OCR compactos que puedan ejecutarse en GPU de consumo o incluso en entornos de borde, reduciendo la dependencia de servicios OCR propietarios. No obstante, la model card publicada esta generada automaticamente y no documenta el dataset de entrenamiento, los idiomas soportados ni resultados de evaluacion, por lo que su adopcion en produccion exige una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en detalle; por los tags (lighton_ocr, image-text-to-text) se trata de un modelo vision-language orientado a OCR |
| Parametros totales | 1.005.647.872 (aproximadamente 1,01 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | xbikevn/LightOnOCR-2-1B-vi |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Los tags asociados (lighton_ocr, image-text-to-text) y el pipeline declarado indican que se trata de un modelo multimodal que acepta imagenes como entrada y genera texto, lo habitual en tareas de OCR y comprension de documentos. El tag conversational sugiere ademas que admite interacciones de tipo dialogo, aunque no se especifica el formato exacto de las plantillas de chat. No se dispone de informacion sobre el encoder visual, el numero de capas del decodificador ni el mecanismo de atencion empleado.

Respecto al entrenamiento, la model card solo aporta los hiperparametros del trainer: Learning Rate de 6e-05, tamano de batch de entrenamiento 4, batch de evaluacion 6, acumulacion de gradientes de 4 pasos (batch total efectivo de 16), semilla 42, optimizador AdamW fusionado con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 10 pasos de warmup y una unica epoca. El dataset de entrenamiento figura como desconocido y no se reporta ningun resultado de evaluacion. Las versiones de framework utilizadas fueron Transformers 5.0.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. No hay constancia de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Conversion de imagenes de documentos a texto (OCR) mediante la modalidad image-text-to-text declarada en el pipeline.
- Generacion de texto conversacional asociada a la imagen de entrada, segun el tag conversational.
- Procesamiento multimodal imagen + texto: el modelo acepta una imagen y produce una respuesta textual.
- Compatibilidad de despliegue declarada mediante el tag endpoints_compatible.
- No consta soporte de tool calling ni function calling en la informacion disponible.
- No consta soporte explicito de agentes, razonamiento multi-paso ni modo thinking.
- No consta soporte de audio ni de generacion de imagen.
- El alcance multilingue es desconocido: la model card no declara idiomas.

## Casos de uso

- Digitalizacion masiva de facturas: el modelo puede recibir la imagen o el render de cada factura y devolver el texto estructurado para su volcado en un ERP; su tamano de 1B permite procesar lotes grandes con coste por pagina bajo.
- Extraccion de datos de tickets y recibos: util para sistemas de contabilidad y control de gastos que necesitan leer importes, fechas y conceptos desde fotografias tomadas con movil.
- Lectura de formularios escaneados: conversion de documentos administrativos en campos de texto que despues se validan con reglas o con un LLM adicional.
- Accesibilidad documental: transcripcion a texto de material escaneado para lectores de pantalla y para indexacion en buscadores internos.
- Archivado y busqueda en repositorios historicos: generacion de transcripciones sobre las que construir indices de busqueda full-text en bibliotecas digitales.
- Preprocesado en pipelines RAG: extraccion del texto de PDF e imagenes antes de trocearlo y vectorizarlo en una base de datos de conocimiento.
- Verificacion de documentos de identidad o etiquetas: lectura de campos concretos en imagenes controladas dentro de flujos de onboarding, siempre con validacion posterior.
- Moderacion y clasificacion de contenido escaneado: transcripcion previa para detectar terminos o patrones en documentos recibidos por canales de atencion al cliente.

En todos los casos, la idoneidad real depende de una evaluacion propia, ya que no se han publicado metricas de precision del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo results del model-index aparece vacio, y la model card no incluye tabla de evaluacion ni comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo orientativo segun el numero de parametros declarado, 1.005.647.872):
  - FP16/BF16: aproximadamente 2 GB solo de pesos, mas el encoder visual y el cache de activaciones; en la practica conviene reservar 3-5 GB.
  - INT8: aproximadamente 1 GB de pesos, mas overhead.
  - INT4: aproximadamente 0,6 GB de pesos, mas overhead.
  - El repositorio ocupa 3,7 GB, coherente con pesos en precision de 16 bits o superior junto con el resto de componentes.
- GPU recomendadas: no hay recomendaciones oficiales publicadas. Por tamano, cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente en precision reducida.
- Cabe en GPU de consumo: si, previsiblemente en modelos como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de gama media con 8 GB o mas. No confirmado por el autor.
- Opciones de despliegue: el sufijo "-vllm" del identificador apunta a compatibilidad con vLLM. Al ser un modelo de la libreria transformers, tambien es desplegable con Transformers nativo y, potencialmente, con TGI. No hay confirmacion sobre soporte en llama.cpp, Ollama u otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este modelo, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| xbikevn/LightOnOCR-2-1B-viv2-vllm | 1,01 mil millones | No disponible | Apache 2.0 | HuggingFace, 0 descargas | No disponible |
| xbikevn/LightOnOCR-2-1B-vi (modelo base) | No disponible | No disponible | No disponible | HuggingFace | No disponible |
| Otros modelos OCR/VLM de ~1-3B (por ejemplo, alternativas de la misma categoria) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada modelos comparables con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta descripcion, usos previstos, datos de entrenamiento ni evaluacion; el propio texto indica que requiere revision y completado.
- No hay resultados de benchmarks publicados, por lo que se desconoce la precision real en tareas de OCR.
- El dataset de entrenamiento figura como desconocido, lo que impide evaluar sesgos de dominio, tipografia o idioma.
- No se declaran idiomas soportados. El sufijo "-vi" del modelo base podria sugerir una adaptacion al vietnamita, pero esto no esta confirmado en la informacion disponible.
- Se desconoce la longitud de contexto, lo que limita el diseno de flujos con documentos extensos o conversaciones multi-turno.
- Al ser un fine-tune de una sola epoca, existe riesgo de olvido catastrofico respecto al modelo base; conviene comparar ambos checkpoints antes de adoptarlo.
- Riesgo de alucinacion inherente a los modelos generativos multimodales: puede producir texto plausible que no aparece en la imagen, especialmente con documentos de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podria arrastrar condiciones adicionales; conviene verificar la licencia de xbikevn/LightOnOCR-2-1B-vi y la del modelo original LightOnOCR.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Para produccion se recomienda validar con un conjunto propio de imagenes representativas y establecer verificacion humana en tareas criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbikevn/LightOnOCR-2-1B-viv2-vllm
- Modelo base en HuggingFace: https://huggingface.co/xbikevn/LightOnOCR-2-1B-vi
- Informacion adicional: no disponible (la busqueda web no devolvio resultados relacionados con el modelo).
