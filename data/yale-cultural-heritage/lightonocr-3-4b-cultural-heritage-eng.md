# yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng

## Resumen

LightOnOCR-3-4B-cultural-heritage-eng es un ajuste fino del modelo vision-language LightOnOCR-3-4B de LightOn, especializado en la transcripcion de documentos manuscritos en ingles procedentes de las colecciones de la Biblioteca de la Universidad de Yale. Lo desarrolla el equipo yale-cultural-heritage y sigue las convenciones de transcripcion del Smithsonian Transcription Center, lo que incluye marcado editorial para tachaduras, notas marginales, lecturas inciertas, tablas, sellos y paginas en blanco.

El modelo resuelve un problema concreto del ambito del patrimonio cultural: la transcription automatica de manuscritos historicos con fidelidad ortografica y de puntuacion, manteniendo la grafia original del documento. Frente al modelo base, el ajuste fino reduce el CER de 0,2564 a 0,0770 y el WER de 0,3019 a 0,0983 sobre un conjunto de 582 paginas reservadas, lo que supone una mejora sustancial en un dominio donde los modelos genericos fallan por la variabilidad caligrafica y la presencia de elementos editoriales.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors, arquitectura Qwen3.5 (Qwen3_5ForConditionalGeneration) y un total de 4.539.265.536 parametros. El modelo se entreno con LoRA sobre el modelo base y se sirve con un prompt especifico incluido en el repositorio; no funciona correctamente con el modo de transcripcion de prompt vacio del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language basada en Qwen3.5 (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de 2.048 tokens visuales por pagina y hasta 2.048 tokens nuevos de salida) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Tipo de ajuste | LoRA sobre lightonai/LightOnOCR-3-4B |
| Libreria | transformers (>= 5.5.4) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre LightOnOCR-3-4B, un modelo vision-language construido sobre la arquitectura Qwen3.5 que procesa imagenes de pagina y genera texto condicionado a un prompt. El procesador del modelo incorpora un presupuesto de 2.048 tokens visuales por pagina, y la generacion se limita a 2.048 tokens nuevos. La decodificacion evaluada es greedy (do_sample=False); el generation_config.json incluido anade repetition_penalty=1.1 para suprimir bucles de repeticion en produccion, aunque la tabla de resultados se genero con penalizacion 1.0.

El entrenamiento utilizo 11.029 paginas del dataset yale-cultural-heritage/ai-project-transcriptions, con transcripciones preparadas por Jon Manton y su equipo. La evaluacion se realizo sobre 582 paginas reservadas de 39 documentos, sin que ninguna pagina de esos documentos apareciera en entrenamiento. El ajuste fino LoRA supero al ajuste completo sobre el mismo modelo base (CER 0,0770 frente a 0,1260) y fue el mejor de 16 combinaciones modelo-tecnica evaluadas, incluyendo Qwen3.5-4B, Qwen3.5-9B, chandra-ocr-2 y LightOnOCR-3-0.8B. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento adicionales.

## Capacidades

- Transcripcion de texto manuscrito en ingles (HTR) linea a linea, preservando ortografia, puntuacion y mayusculas originales.
- Marcado editorial segun convenciones del Smithsonian Transcription Center: tachaduras con [[strikethrough]], notas marginales con [[left margin]], lecturas inciertas con [[?]], sellos con [[seal]] y otros elementos.
- Representacion de tablas mediante separadores de columna (|).
- Deteccion y tratamiento de paginas en blanco.
- Expansion de abreviaturas (por ejemplo, yr → y[ou]r en sentido inverso segun la convencion).
- Procesamiento de imagenes de pagina completa con un presupuesto de 2.048 tokens visuales.
- Soporte de chat template con enable_thinking desactivable.
- Despliegue compatible con vLLM mediante endpoint compatible con OpenAI (chat/completions).
- Capacidad conversacional limitada al dominio de transcripcion; no se documentan capacidades generales de razonamiento, codigo o matematicas.

## Casos de uso

- Digitalizacion masiva de fondos manuscritos en archivos y bibliotecas: el modelo procesa paginas completas de colecciones historicas en ingles con un CER del 7,7%, lo que permite generar transcripciones de primer nivel para catalogacion y busqueda full-text sin intervencion manual linea a linea.
- Proyectos de humanidades digitales con transcripcion colaborativa: instituciones que siguen las convenciones del Smithsonian Transcription Center pueden usar el modelo para generar borradores que los voluntarios revisen, reduciendo el esfuerzo de tecleado y manteniendo el marcado editorial estandarizado.
- Extraccion de contenido de correspondencia y diarios historicos: la preservacion de grafia original y la deteccion de notas marginales permiten reconstruir el documento tal como fue escrito, algo critico para investigacion filologica e historica.
- Procesamiento de documentos con tablas y sellos: el modelo aplica separadores de columna y etiquetas de sello, lo que facilita la posterior estructuración de registros contables, actas o formularios historicos en bases de datos.
- Pipelines de enriquecimiento de catalogos bibliotecarios: integrado via vLLM con el endpoint compatible con OpenAI, el modelo puede servir como microservicio de transcripcion dentro de flujos de digitalizacion que ya gestionan imagenes y metadatos.
- Investigacion sobre HTR y evaluación de modelos: al publicarse con un conjunto de evaluacion reservado y comparativas frente a 16 alternativas, sirve como referencia para estudiar el impacto del ajuste LoRA frente al ajuste completo en dominios especializados.
- Generacion de transcripciones para accesibilidad: conversion de manuscritos a texto plano revisable para personas con dificultades de lectura de caligrafia historica, con marcado de incertidumbre que senala lecturas dudosas.

## Benchmarks y rendimiento

Evaluacion sobre 582 paginas reservadas de 39 documentos, decodificacion greedy, hasta 2.048 tokens nuevos y 2.048 tokens visuales por pagina. CER y WER estan micro-promediados tras normalizacion Unicode NFD.

| Metrica | LightOnOCR-3-4B base | Este modelo |
|---|---|---|
| CER | 0,2564 | 0,0770 |
| WER | 0,3019 | 0,0983 |
| Line recall | 0,2406 | 0,6066 |
| Paginas transcritas exactamente | 0,7% | 13,9% |
| Paginas degeneradas (bucles) | 0,2% | 0,0% |

Desglose del error residual en las 527 paginas no blancas reservadas, eliminando marcado de referencia y prediccion:

| Elemento ignorado | CER |
|---|---|
| Nada (espacios normalizados) | 0,0755 |
| Etiquetas [[...]] | 0,0419 |
| Etiquetas + expansiones de abreviaturas | 0,0382 |
| Etiquetas + abreviaturas + separadores de tabla | 0,0369 |

Comparativa con otros modelos entrenados sobre los mismos datos y las mismas paginas de evaluacion (16 combinaciones evaluadas):

| Modelo | Ajuste | CER | Line recall |
|---|---|---|---|
| LightOnOCR-3-4B (este modelo) | LoRA | 0,0770 | 0,607 |
| Qwen3.5-4B | LoRA | 0,1047 | 0,590 |
| Qwen3.5-9B | LoRA | 0,1099 | 0,616 |
| chandra-ocr-2 | LoRA | 0,1101 | 0,596 |
| LightOnOCR-3-0.8B | LoRA | 0,1159 | 0,570 |
| Qwen3.5-2B | LoRA | 0,1190 | 0,573 |
| LightOnOCR-3-4B | Ajuste completo | 0,1260 | 0,571 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 4.539 millones de parametros en bfloat16, los pesos ocupan aproximadamente 9,1 GB, por lo que se requiere al menos esa cantidad mas memoria para activaciones y tokens visuales.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) es el rango habitual para este tipo de modelo en bfloat16.
- Cabe en GPU de consumo: probablemente si en GPUs con 24 GB o mas en bfloat16, aunque no se confirma en la informacion disponible; cuantizaciones adicionales no estan documentadas.
- Opciones de despliegue: transformers (>= 5.5.4) con AutoProcessor y Qwen3_5ForConditionalGeneration; vLLM mediante `vllm serve` con `--default-chat-template-kwargs '{"enable_thinking": false}'` y endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles. Se documenta un presupuesto fijo de 2.048 tokens visuales y hasta 2.048 tokens nuevos por pagina, con decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en este dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-cultural-heritage-eng | 4.539 M | no disponible | 0,0770 | apache-2.0 | HuggingFace |
| Qwen3.5-4B (LoRA sobre estos datos) | no disponible | no disponible | 0,1047 | no disponible | HuggingFace |
| Qwen3.5-9B (LoRA sobre estos datos) | no disponible | no disponible | 0,1099 | no disponible | HuggingFace |
| chandra-ocr-2 (LoRA sobre estos datos) | no disponible | no disponible | 0,1101 | no disponible | no disponible |
| LightOnOCR-3-0.8B (LoRA sobre estos datos) | no disponible | no disponible | 0,1159 | no disponible | HuggingFace |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para documentos manuscritos en ingles de colecciones de Yale; su rendimiento en otros idiomas, tipografias o tradiciones caligraficas no esta documentado y probablemente sea deficiente.
- El marcado editorial es aproximado: eliminar las etiquetas [[...]] reduce el CER de 0,0755 a 0,0419, lo que indica que casi la mitad del error residual proviene de la colocacion de etiquetas. El modelo usa los tipos de etiqueta correctos con frecuencia similar a la humana, pero las situa en posiciones distintas (por ejemplo, marca [[?]] sobre palabras diferentes).
- Solo el 13,9% de las paginas reservadas se transcriben exactamente, por lo que en produccion es necesario un paso de revision humana o postprocesado.
- Requiere servirse con el prompt exacto de prompt.txt; el modo de transcripcion de prompt vacio del modelo base produce un estilo distinto que no sigue las convenciones del Smithsonian.
- El generation_config.json aplica repetition_penalty=1.1 para suprimir bucles; los resultados de benchmark se obtuvieron con penalizacion 1.0, por lo que reproducirlos exactamente requiere pasar ese valor.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus historico puede heredar sesgos de las transcripciones humanas y de las convenciones editoriales de la institucion.
- Riesgo de alucinacion en lecturas ambiguas: el propio modelo senala incertidumbre con [[?]], pero la posicion de esa marca no es fiable.
- Licencia Apache 2.0 permite uso comercial, aunque no se detallan restricciones adicionales sobre los datos de entrenamiento ni sobre las imagenes de las colecciones de Yale.
- No se dispone de informacion sobre cuantizaciones validadas, latencia, throughput ni requisitos minimos de hardware mas alla del tamano de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Prompt de inferencia: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng/blob/main/prompt.txt
- Smithsonian Transcription Center: no disponible en la informacion proporcionada (referencia de convenciones citada en la model card)
