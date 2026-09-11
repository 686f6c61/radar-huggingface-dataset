# xbikevn/LightOnOCR-2-1B-viv1

## Resumen

LightOnOCR-2-1B-viv1 es un ajuste fino (fine-tuning) del modelo xbikevn/LightOnOCR-2-1B-vi, publicado por el usuario xbikevn en Hugging Face. Se trata de un modelo vision-lenguaje de tipo image-text-to-text, con 1.005.647.872 parametros reales (aproximadamente 1,0 B) confirmados en los pesos safetensors, orientado al reconocimiento optico de caracteres (OCR) de extremo a extremo: transformar imagenes de documentos en texto limpio y ordenado sin encadenar componentes OCR separados.

El modelo pertenece a la estirpe LightOnOCR, cuyo modelo de referencia (lightonai/LightOnOCR-2-1B) se presenta como un modelo vision-lenguaje multilingue de 1 B de parametros entrenado con RLVR para maximizar la precision en tareas de OCR. Este ajuste concreto se ha publicado como una variante derivada, y su model card es generada automaticamente por el Trainer: no documenta el conjunto de datos de entrenamiento, ni los usos previstos, ni limitaciones, ni resultados de evaluacion.

Por su relevancia practica, se trata de un modelo muy reciente y practicamente sin validacion externa: cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, con un repositorio de 4,0 GB y licencia Apache 2.0. Resulta interesante como punto de partida para experimentar con OCR de 1 B de parametros desplegable en hardware de consumo, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje de tipo image-text-to-text (etiqueta lighton_ocr); detalle interno no disponible |
| Parametros totales | 1.005.647.872 (aproximadamente 1,0 B) |
| Parametros activos | No procede (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se publican pesos sin cuantizar en safetensors; no se han publicado variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el sufijo "vi" del modelo base sugiere un enfoque en vietnamita, pero no esta confirmado en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Tamano del repositorio | 4,0 GB |
| Modelo base | xbikevn/LightOnOCR-2-1B-vi |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 11 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de este ajuste. Por las etiquetas del repositorio (lighton_ocr, image-text-to-text, conversational) y por la familia a la que pertenece el modelo base, se trata de un modelo vision-lenguaje que acepta imagenes de documentos y genera texto de forma autorregresiva, probablemente con un codificador visual acoplado a un transformer de lenguaje. El detalle de capas, mecanismo de atencion, resolucion de imagen de entrada o tokenizador visual no esta documentado.

El proceso de ajuste si esta parcialmente documentado por los hiperparametros del Trainer: 1 sola epoca, learning rate de 6e-05 con planificador lineal y 10 pasos de calentamiento, tamano de lote de entrenamiento 4 con 4 pasos de acumulacion de gradiente (lote efectivo de 16), tamano de lote de evaluacion 6, semilla 42 y optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 (variante fusionada de PyTorch). El conjunto de datos de entrenamiento se describe literalmente como "unknown dataset" en la model card, por lo que no se puede valorar la composicion del corpus, el volumen de tokens ni si hubo etapas de RLHF, DPO o RLVR especificas de este ajuste. Las versiones de entorno declaradas son Transformers 5.0.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

Como contexto externo, el modelo de la familia publicado por LightOn (LightOnOCR-2-1B) se describe en el paper arXiv 2601.14251 como un modelo vision-lenguaje multilingue de 1 B de parametros, de extremo a extremo, refinado con RLVR. No hay confirmacion de que este ajuste concreto de xbikevn herede dichas tecnicas mas alla de la arquitectura base.

## Capacidades

- Reconocimiento optico de caracteres de extremo a extremo: conversion de imagenes de documentos (por ejemplo, PDF escaneados) en texto con orden de lectura natural, sin necesidad de segmentacion, deteccion de lineas ni post-procesado en cascada.
- Generacion de texto condicionada por imagen dentro del pipeline image-text-to-text de transformers.
- Formato conversacional: la etiqueta "conversational" indica que el modelo acepta plantillas de dialogo con turnos, lo que permite peticiones tipo "extrae el texto de esta imagen".
- Capacidad multilingue: el modelo de referencia de la familia se presenta como multilingue, pero no se ha confirmado que este ajuste conserve dicho soporte ni en que idiomas.
- No hay evidencia documentada de soporte de tool calling, function calling, ejecucion de agentes, razonamiento multi-paso, modo thinking, entrada de audio o tareas de vision distintas del OCR.

## Casos de uso

- Digitalizacion de archivos administrativos: convertir lotes de PDF escaneados (facturas, expedientes, formularios) en texto plano indexable. El modelo es adecuado porque integra vision y generacion de texto en un unico paso de 1 B de parametros, lo que reduce la complejidad de despliegue frente a pipelines OCR clasicos.
- Extraccion de texto para motores de busqueda internos: alimentar un indice de recuperacion documental (RAG) con el texto extraido de documentos escaneados, aprovechando que el modelo produce texto con orden de lectura natural en lugar de bloques desordenados.
- Procesamiento por lotes en GPU de gama media: al tratarse de un modelo de aproximadamente 1 B de parametros, se puede ejecutar en tarjetas de consumo para procesar grandes volumenes de documentos sin depender de APIs externas.
- Preprocesado de datos para entrenamiento de otros modelos: usar el modelo para transcribir corpus de imagenes a texto y construir datasets de texto a partir de material escaneado.
- Prototipado e investigacion en OCR multilingue: servir de base para experimentos de ajuste fino adicional sobre idiomas o dominios concretos (documentos historicos, formularios, documentos manuscritos), dado que su licencia Apache 2.0 permite modificarlo y redistribuirlo.
- Automatizacion de entrada de datos en back office: integrar el modelo en un servicio interno que reciba imagenes enviadas por usuarios y devuelva texto estructurado para su volcado en un sistema de gestion, con intervencion humana unicamente en los casos de baja confianza.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local, permite tratar documentos sensibles sin enviarlos a servicios de terceros, siempre que se valide previamente su calidad en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo model-index de la model card contiene una lista de resultados vacia, y el autor no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de OCR como CER o WER). Tampoco se documentan resultados de evaluacion en el apartado "Training results", que aparece en blanco.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de 16 bits, el peso del modelo ocupa aproximadamente 2,0 GB; en 8 bits, alrededor de 1,0 GB; en 4 bits, en torno a 0,6 GB. Hay que sumar el coste del codificador visual, de las activaciones y de los tokens de imagen, por lo que conviene reservar un margen adicional.
- El repositorio ocupa 4,0 GB, coherente con pesos almacenados en mayor precision o con copias duplicadas en el repositorio; para inferencia conviene convertir a fp16 o cuantizar.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente en fp16 para cargas moderadas de una sola imagen; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una L4 o una A10 son opciones razonables. Para lotes grandes o alta concurrencia, A100 o H100 permiten mayor paralelismo.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas de 4-6 GB si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), servidores compatibles con endpoints de Hugging Face (etiqueta endpoints_compatible), vLLM o TGI si el modelo esta soportado por dichos motores, y llama.cpp u Ollama previa conversion a GGUF, que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de procesamiento por pagina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xbikevn/LightOnOCR-2-1B-viv1 | 1.005.647.872 | No disponible | No disponible | Apache 2.0 | Publicado; 0 descargas y 0 likes; sin benchmarks |
| lightonai/LightOnOCR-2-1B | 1 B (segun el paper) | No disponible | Multilingue (segun el paper) | No disponible en la informacion recogida | Modelo de referencia de la familia, con entrenamiento RLVR declarado |
| xbikevn/LightOnOCR-2-1B-vi | No disponible | No disponible | No disponible | No disponible en la informacion recogida | Modelo base directo de este ajuste |
| Otras alternativas de OCR de ~1 B (por ejemplo GOT-OCR2.0 o Qwen2.5-VL-3B) | No disponible en la informacion recogida | No disponible | No disponible | No disponible en la informacion recogida | No disponible en la informacion recogida |

La comparacion cuantitativa no es posible con los datos disponibles: ni este ajuste ni su modelo base directo publican resultados de evaluacion, y la informacion recogida sobre los modelos de la familia LightOn no incluye cifras de benchmarks.

## Limitaciones y advertencias

- Model card autogenerada: los apartados de descripcion, usos previstos, datos de entrenamiento y resultados estan vacios o marcados como "More information needed". No hay garantia documental sobre el comportamiento del modelo.
- Dataset de entrenamiento desconocido: no se puede evaluar la representatividad del corpus, el equilibrio entre idiomas ni la presencia de dominios concretos.
- Idiomas no especificados: aunque el nombre del modelo base incluye el sufijo "vi", no hay confirmacion de que el modelo este especializado en vietnamita ni de que conserve el soporte multilingue de la familia original.
- Sin benchmarks publicados: no existen metricas de CER, WER, precision de extraccion ni comparaciones con otros modelos, por lo que cualquier afirmacion de calidad seria especulativa.
- Riesgo de alucinacion: como cualquier modelo generativo condicionado por imagen, puede producir texto plausible que no aparece en el documento original, especialmente en imagenes de baja calidad, tablas complejas o caligrafia.
- Sin validacion de la comunidad: 0 descargas y 0 likes. No hay informes independientes de comportamiento en produccion.
- Contexto y resolucion de imagen no documentados: se desconoce el limite de tokens de entrada y la resolucion maxima soportada, lo que dificulta planificar el procesamiento de documentos de muchas paginas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base (xbikevn/LightOnOCR-2-1B-vi) y del modelo original de LightOn para confirmar la compatibilidad de la cadena de licencias.
- Entrenamiento de una sola epoca: el ajuste es muy corto (1 epoca, 10 pasos de calentamiento), lo que sugiere un refinamiento ligero mas que un reentrenamiento profundo.
- Advertencia de produccion: no se recomienda desplegar este modelo en un flujo critico sin una evaluacion propia con datos del dominio, control de calidad en las salidas y mecanismos de supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xbikevn/LightOnOCR-2-1B-viv1
- Modelo base directo: https://huggingface.co/xbikevn/LightOnOCR-2-1B-vi
- Modelo de referencia de la familia: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Paper de LightOnOCR: https://arxiv.org/abs/2601.14251
