# yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng

## Resumen

LightOnOCR-3-0.8B-cultural-heritage-eng es un ajuste fino (LoRA) del modelo vision-language LightOnOCR-3-0.8B de LightOn, especializado en el reconocimiento de texto manuscrito (HTR) en documentos de archivo en ingles de las colecciones de la Biblioteca de Yale. Lo desarrolla el proyecto yale-cultural-heritage y sigue las convenciones de transcripcion del Smithsonian Transcription Center. Resuelve un problema muy concreto: la transcripcion automatica de manuscritos historicos con fidelidad a la ortografia, puntuacion y mayusculas originales, incorporando marcado editorial para tachados, marginalia, lecturas inciertas, tablas, sellos y paginas en blanco.

El modelo parte de una arquitectura de tipo transformer vision-language de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con aproximadamente 853 millones de parametros en pesos safetensors y un presupuesto de 2.048 tokens visuales por pagina. Se sirve mediante `transformers` (>= 5.5.4) con un prompt especifico (`prompt.txt`) que debe acompanar a cada imagen para obtener la salida esperada.

Su relevancia practica es doble: por un lado, demuestra que un modelo de menos de mil millones de parametros, ajustado con LoRA, puede reducir el CER de 1,0221 a 0,1159 frente a la base en un conjunto de 582 paginas reservadas, lo que lo hace viable en hardware modesto; por otro, se publica junto a una comparativa controlada de 16 modelos entrenados sobre los mismos datos, lo que permite elegir con criterio entre coste computacional y precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3.5, `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor explicito; presupuesto de 2.048 tokens visuales por pagina y hasta 2.048 tokens nuevos de generacion |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,7 GB |
| Tipo de ajuste | LoRA sobre `lightonai/LightOnOCR-3-0.8B` |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre LightOnOCR-3-0.8B, un vision-language transformer de la familia Qwen3.5 orientado a OCR/HTR. La entrada combina una imagen de pagina con un prompt textual fijo (distribuido como `prompt.txt` en el repositorio) y la salida es la transcripcion linea a linea. El procesador asociado incorpora el presupuesto de 2.048 tokens visuales por pagina, y la generacion se evalua en modo greedy con un maximo de 2.048 tokens nuevos. El chat template debe invocarse con `enable_thinking=False`, ya que en caso contrario algunos templates de Qwen3.5 abren un bloque de razonamiento que degrada la salida.

El entrenamiento se realizo sobre 11.029 paginas del dataset `yale-cultural-heritage/ai-project-transcriptions`, con transcripciones preparadas por Jon Manton y su equipo. La evaluacion se hizo sobre 582 paginas reservadas de 39 documentos, sin que ninguna pagina de esos documentos apareciera en el entrenamiento. El modelo forma parte de un experimento comparativo mas amplio en el que se entrenaron 16 modelos (LoRA y ajuste completo) sobre los mismos datos y las mismas paginas de evaluacion; este es el quinto mejor de la comparativa publicada. La innovacion tecnica destacable no esta en la arquitectura sino en el esquema de salida: marcado editorial con etiquetas de doble corchete (`[[strikethrough]]`, `[[left margin]]`, `[[?]]`, `[[seal]]`, entre otras) y expansion de abreviaturas en formato `y[ou]r`.

## Capacidades

- Transcripcion de texto manuscrito en ingles a partir de imagen de pagina, linea a linea, preservando ortografia, puntuacion y mayusculas originales.
- Marcado editorial de elementos del documento: tachados, marginalia, lecturas inciertas, tablas, sellos y estampillas.
- Deteccion y manejo de paginas en blanco.
- Expansion de abreviaturas historicas segun convencion (`y[ou]r` → `yr`).
- Salida estructurada con separadores de columna para tablas.
- Generacion condicionada por prompt: requiere el prompt especifico del repositorio para funcionar segun lo evaluado.
- Capacidad conversacional declarada en los tags del modelo, aunque el uso documentado es de un unico turno imagen + prompt.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni otras modalidades (audio, video).

## Casos de uso

- Digitalizacion de fondos manuscritos en bibliotecas y archivos: procesar lotes de imagenes de pagina con el prompt fijo y obtener transcripciones con marcado editorial utilizable como punto de partida para revision humana; el CER de 0,1159 y el 14,4% de paginas exactas lo hacen adecuado como primera pasada sobre colecciones grandes.
- Proyectos de transcripcion colaborativa tipo Smithsonian Transcription Center: generar borradores automaticos que los voluntarios corrigen, reduciendo el esfuerzo de tecleo y estandarizando el marcado de tachados y marginalia.
- Extraccion de contenido de correspondencia y diarios historicos: el modelo conserva la ortografia original, lo que permite alimentar corpus linguisticos historicos sin normalizacion previa.
- Procesamiento de documentos con tablas y sellos: el marcado de columnas con `|` y las etiquetas de sello permiten reconstruir la estructura de registros y formularios manuscritos.
- Despliegue en infraestructura modesta: con 853 millones de parametros y pesos en bfloat16 (repo de 1,7 GB), puede ejecutarse en una unica GPU de consumo para pipelines de digitalizacion internos o en estaciones de trabajo de archivo.
- Investigacion en HTR: sirve como linea base reproducible y como punto de comparacion dentro del conjunto de 16 modelos publicados sobre el mismo dataset, con la misma evaluacion y las mismas paginas reservadas.
- Filtrado y triaje de colecciones: usar la tasa de paginas degeneradas (0,2%) y la recall de lineas (0,5696) para decidir que paginas requieren revision manual prioritaria.

## Benchmarks y rendimiento

Evaluacion sobre 582 paginas reservadas de 39 documentos, decodificacion greedy, hasta 2.048 tokens nuevos y 2.048 tokens visuales por pagina. CER y WER son micro-promediados tras normalizacion Unicode NFD.

| Metrica | LightOnOCR-3-0.8B base | Este modelo |
|---|---|---|
| CER | 1,0221 | 0,1159 |
| WER | 1,0024 | 0,1320 |
| Recall de lineas | 0,0773 | 0,5696 |
| Paginas transcritas exactamente | 0,0% | 14,4% |
| Paginas degeneradas (bucle) | 1,9% | 0,2% |

Desglose del error por marcado editorial (527 paginas reservadas no blancas, recalculado eliminando el marcado en referencia y prediccion):

| Que se ignora | CER |
|---|---|
| Nada (espacios normalizados) | 0,1076 |
| Etiquetas `[[...]]` | 0,0560 |
| + expansiones de abreviaturas (`y[ou]r` → `yr`) | 0,0523 |
| + separadores de columna `\|` | 0,0505 |

Comparativa con otros modelos entrenados sobre los mismos datos y evaluados en las mismas paginas:

| Modelo | Ajuste | CER | Recall de lineas |
|---|---|---|---|
| LightOnOCR-3-4B | LoRA | 0,0770 | 0,607 |
| Qwen3.5-4B | LoRA | 0,1047 | 0,590 |
| Qwen3.5-9B | LoRA | 0,1099 | 0,616 |
| chandra-ocr-2 | LoRA | 0,1101 | 0,596 |
| LightOnOCR-3-0.8B (este modelo) | LoRA | 0,1159 | 0,570 |
| Qwen3.5-2B | LoRA | 0,1190 | 0,573 |
| LightOnOCR-3-4B | ajuste completo | 0,1260 | 0,571 |

El autor indica que diferencias inferiores a 0,02 CER estan dentro del ruido entre ejecuciones, por lo que los modelos entre Qwen3.5-4B y Qwen3.5-2B estan practicamente empatados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parametros en bfloat16, los pesos ocupan aproximadamente 1,7 GB; sumando activaciones, tokens visuales (2.048 por pagina) y cache KV para hasta 2.048 tokens nuevos, una estimacion prudente es de 4-6 GB de VRAM. No es un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100 y H100 quedan sobredimensionadas para este tamano y solo se justifican para procesamiento por lotes de alto throughput.
- GPU de consumo: si, cabe en tarjetas consumer de 8 GB o mas (por ejemplo, gama RTX xx60/xx70 con 8-16 GB). El autor no publica pruebas especificas por modelo de GPU.
- Opciones de despliegue: el autor documenta exclusivamente `transformers>=5.5.4` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`, en bfloat16 y `device_map="auto"`. No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI; la disponibilidad de pesos GGUF no esta indicada.
- Latencia y throughput: no disponibles. El autor solo especifica la configuracion de decodificacion (greedy, max_new_tokens=2048, 2048 tokens visuales) sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (misma evaluacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LightOnOCR-3-0.8B cultural-heritage-eng) | 853 M | 2.048 tokens visuales / 2.048 nuevos | 0,1159 | apache-2.0 | HuggingFace |
| LightOnOCR-3-4B cultural-heritage-eng | no disponible | no disponible | 0,0770 | no disponible en la informacion | HuggingFace |
| Qwen3.5-4B cultural-heritage-eng | no disponible | no disponible | 0,1047 | no disponible en la informacion | HuggingFace |
| chandra-ocr-2 cultural-heritage-eng | no disponible | no disponible | 0,1101 | no disponible en la informacion | HuggingFace |

Los cuatro modelos comparten dataset de entrenamiento, paginas de evaluacion y procedimiento de decodificacion, por lo que la comparacion es directa. La ventaja de este modelo frente a alternativas mayores es el coste de inferencia: obtiene un CER dentro del ruido de modelos de 2B a 4B con una fraccion de los parametros.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado exclusivamente en documentos manuscritos en ingles; no hay evidencia de comportamiento en otros idiomas.
- Dominio restringido: entrenado sobre colecciones de la Biblioteca de Yale; el rendimiento en manuscritos de otras tradiciones caligraficas, epocas o instituciones no esta evaluado.
- El marcado editorial es aproximado: las etiquetas de doble corchete suponen menos del 5% del texto de referencia pero cerca de la mitad de los errores de caracter. El texto subyacente es fiable; las etiquetas deben tratarse como orientativas y revisarse.
- Solo el 14,4% de las paginas se transcriben exactamente: el uso realista es como primera pasada con revision humana, no como sustituto de la transcripcion manual.
- Recall de lineas de 0,5696: cerca de la mitad de las lineas de referencia no se reproducen exactamente y en orden, lo que afecta a la reconstruccion estructural del documento.
- Riesgo de bucles degenerativos: el 0,2% de las paginas evaluadas entraron en bucle; en produccion conviene monitorizar la longitud de salida y aplicar limites o reintentos.
- Dependencia estricta del prompt: debe servirse con el `prompt.txt` del repositorio y con `enable_thinking=False`; otros prompts o plantillas alteran el formato de salida evaluado.
- Riesgo de alucinacion no cuantificado: no se publican metricas especificas de insercion de texto ausente en la pagina, mas alla del CER global.
- Licencia apache-2.0: permite uso comercial, pero debe verificarse la licencia del modelo base `lightonai/LightOnOCR-3-0.8B` y de los datos de entrenamiento antes de un despliegue comercial.
- Sin datos publicados de cuantizacion, latencia ni soporte en motores de inferencia alternativos a `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Mejor modelo de la comparativa (LightOnOCR-3-4B): https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Qwen3.5-4B cultural-heritage-eng: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng
- Qwen3.5-9B cultural-heritage-eng: https://huggingface.co/yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng
- Qwen3.5-2B cultural-heritage-eng: https://huggingface.co/yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng
- chandra-ocr-2 cultural-heritage-eng: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng
