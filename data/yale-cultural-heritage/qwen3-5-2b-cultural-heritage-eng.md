# yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng

## Resumen

Qwen3.5-2B-cultural-heritage-eng es un modelo vision-lenguaje afinado por el equipo de Yale Cultural Heritage a partir de Qwen/Qwen3.5-2B, orientado especificamente a la transcripcion de documentos de archivo manuscritos en ingles procedentes de las colecciones de la Biblioteca de Yale. El modelo recibe como entrada la imagen de una pagina y un prompt de transcripcion (distribuido como `prompt.txt` en el repositorio) y devuelve el texto linea por linea, preservando la ortografia, la puntuacion y el uso de mayusculas originales, e incorporando marcado editorial para tachados, anotaciones marginales, lecturas dudosas, tablas, sellos, estampillas y paginas en blanco.

El ajuste se ha realizado mediante LoRA sobre el modelo base, con un total de 2.213.241.664 parametros (2,2 mil millones), y sigue las convenciones de transcripcion del Smithsonian Transcription Center. Es relevante ahora porque demuestra que un modelo de solo 2B de parametros, correctamente afinado, puede alcanzar una calidad de transcripcion cercana a modelos del doble y el cuadruple de tamano en esta tarea concreta, lo que abarata notablemente el despliegue en proyectos de digitalizacion de archivos a gran escala.

El entrenamiento utilizo 11.029 paginas del dataset `yale-cultural-heritage/ai-project-transcriptions`, con transcripciones preparadas por Jon Manton y su equipo, y la evaluacion se realizo sobre 582 paginas reservadas de 39 documentos no vistos durante el entrenamiento. Segun la propia model card, es el sexto mejor de los modelos entrenados sobre estos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3.5), ajuste LoRA sobre el modelo base |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de 2.048 tokens visuales por pagina segun la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer vision-lenguaje de la familia Qwen3.5 que procesa imagenes y texto conjuntamente. El ajuste se ha realizado con LoRA (adaptadores de bajo rango) sobre el modelo base, manteniendo la mayor parte de los pesos originales congelados. El procesador incluye un presupuesto de 2.048 tokens visuales por pagina, y la generacion se evalua con decodificacion greedy y un maximo de 2.048 tokens nuevos.

Los datos de entrenamiento proceden del dataset `yale-cultural-heritage/ai-project-transcriptions`, con 11.029 paginas transcritas manualmente segun las convenciones del Smithsonian Transcription Center. La evaluacion se hizo sobre 582 paginas retenidas de 39 documentos, sin solapamiento con el conjunto de entrenamiento. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta disenado para servirse con el prompt exacto de `prompt.txt` y con `enable_thinking=False`, ya que de lo contrario algunas plantillas de chat de Qwen3.5 abren un bloque de razonamiento que interfiere con la transcripcion directa.

## Capacidades

- Transcripcion de texto manuscrito (HTR) en ingles a partir de imagenes de paginas de archivo.
- Transcripcion de texto impreso (OCR) en documentos de archivo.
- Preservacion de ortografia, puntuacion y mayusculas originales.
- Marcado editorial: tachados (`[[strikethrough]]`), anotaciones marginales (`[[left margin]]`), lecturas inciertas (`[[?]]`), sellos (`[[seal]]`), estampillas, tablas y paginas en blanco.
- Expansion de abreviaturas segun convenciones de transcripcion (`y[ou]r` → `yr`).
- Salida linea por linea alineada con el contenido de la pagina.
- Capacidad conversacional heredada del modelo base (etiqueta `conversational`), aunque el ajuste esta orientado a la tarea de transcripcion.
- Capacidad vision-lenguaje general heredada de Qwen3.5-2B, no evaluada especificamente en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de archivos historicos: el modelo transcribe paginas manuscritas de las colecciones de Yale linea por linea, lo que permite procesar lotes de imagenes y generar texto buscable para catalogos y repositorios digitales. Su tamano de 2,2 B reduce el coste por pagina frente a modelos mayores con calidad similar.
- Creacion de indices y motores de busqueda sobre manuscritos: al preservar la ortografia original y producir texto alineado con las lineas de la pagina, la salida puede indexarse directamente en motores de busqueda documental o en plataformas de humanidades digitales.
- Revision asistida por humanos en proyectos de transcripcion colaborativa: dado que el modelo acierta aproximadamente el 57 % de las lineas de forma exacta y el 14,8 % de las paginas completas, puede usarse como primera pasada que los transcriptores revisan y corrigen, reduciendo el esfuerzo manual.
- Procesamiento de documentos con estructura editorial compleja: el marcado para tachados, marginalia, sellos y tablas permite conservar informacion que un OCR convencional descartaria, util para ediciones academicas y archivos diplomaticos.
- Extraccion de contenido para pipelines de investigacion: investigadores pueden transcribir corpus completos de correspondencia, registros parroquiales o documentos administrativos y aplicar despues tecnicas de NLP (NER, analisis de redes, topic modeling) sobre el texto resultante.
- Despliegue en infraestructura modesta: al ser un modelo de 2,2 B, puede servirse en una unica GPU de consumo o incluso en CPU con cuantizacion, lo que facilita su uso por parte de bibliotecas pequenas y grupos de investigacion sin acceso a clusters de GPU.
- Normalizacion de transcripciones segun estandares del Smithsonian Transcription Center: util para instituciones que quieran adoptar estas convenciones de marcado de forma consistente en sus propios proyectos.

## Benchmarks y rendimiento

Resultados sobre 582 paginas retenidas de 39 documentos, decodificacion greedy, hasta 2.048 tokens nuevos y 2.048 tokens visuales por pagina. CER y WER son micro-promediados tras normalizacion Unicode NFD.

| Metrica (582 paginas retenidas) | Qwen3.5-2B base | Este modelo |
|---|---|---|
| CER | 4,9028 | 0,1190 |
| WER | 4,3350 | 0,1396 |
| Line recall | 0,1774 | 0,5732 |
| Paginas transcritas exactamente | 0,0 % | 14,8 % |
| Paginas degeneradas (bucle) | 14,9 % | 0,9 % |

Desglose del error por marcado editorial (527 paginas no vacias):

| Que se ignora | CER |
|---|---|
| Nada (espacios normalizados) | 0,1178 |
| Etiquetas `[[...]]` | 0,0615 |
| + expansiones de abreviaturas (`y[ou]r` → `yr`) | 0,0577 |
| + separadores de columna de tabla `\|` | 0,0563 |

Comparativa con otros modelos entrenados sobre los mismos datos y las mismas paginas de evaluacion (los siete mejores de 16 modelos):

| Modelo | Ajuste | CER | Line recall |
|---|---|---|---|
| LightOnOCR-3-4B | LoRA | 0,0770 | 0,607 |
| Qwen3.5-4B | LoRA | 0,1047 | 0,590 |
| Qwen3.5-9B | LoRA | 0,1099 | 0,616 |
| chandra-ocr-2 | LoRA | 0,1101 | 0,596 |
| LightOnOCR-3-0.8B | LoRA | 0,1159 | 0,570 |
| Qwen3.5-2B (este modelo) | LoRA | 0,1190 | 0,573 |
| LightOnOCR-3-4B | full fine-tune | 0,1260 | 0,571 |

Segun la model card, diferencias inferiores a 0,02 CER estan dentro del ruido entre ejecuciones, por lo que los modelos entre Qwen3.5-4B y Qwen3.5-2B estan practicamente empatados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB solo para los pesos, mas el coste de activaciones y del procesamiento de imagenes; en la practica, entre 6 y 8 GB de VRAM para una pagina con 2.048 tokens visuales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, A10); A100 o H100 no son necesarias para inferencia individual, aunque pueden usarse para procesamiento por lotes de alto throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16; con cuantizacion (no documentada en la model card) el requisito seria menor.
- Opciones de despliegue: la model card documenta el uso con `transformers>=5.5.4` y la clase `Qwen3_5ForConditionalGeneration`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (misma evaluacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-cultural-heritage-eng (este) | 2,2 B | no disponible | 0,1190 | apache-2.0 | HuggingFace |
| Qwen3.5-4B-cultural-heritage-eng | no disponible | no disponible | 0,1047 | no disponible | HuggingFace |
| Qwen3.5-9B-cultural-heritage-eng | no disponible | no disponible | 0,1099 | no disponible | HuggingFace |
| LightOnOCR-3-4B-cultural-heritage-eng | no disponible | no disponible | 0,0770 | no disponible | HuggingFace |
| LightOnOCR-3-0.8B-cultural-heritage-eng | no disponible | no disponible | 0,1159 | no disponible | HuggingFace |

Los cinco modelos comparados se entrenaron sobre el mismo dataset y se evaluaron sobre las mismas 582 paginas retenidas. Este modelo ofrece el menor coste de inferencia de la lista junto con una calidad cercana a la de modelos del doble y el cuadruple de tamano; LightOnOCR-3-4B con LoRA es el mejor en CER, mientras que Qwen3.5-9B lidera en line recall.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para documentos de archivo en ingles de las colecciones de Yale; su rendimiento en otros idiomas, otras manos o tradiciones documentales no esta evaluado y probablemente sea inferior.
- El marcado editorial es aproximado: las etiquetas `[[...]]` representan menos del 5 % del texto de referencia pero concentran aproximadamente la mitad de los errores de caracteres, y el modelo suele colocarlas en posiciones distintas a las del transcriptor humano. Debe tratarse el marcado como util pero no fiable, y el texto subyacente como la parte solida.
- Solo el 14,8 % de las paginas se transcriben exactamente y el line recall es del 57,3 %, por lo que se requiere revision humana para cualquier uso que exija precision editorial.
- Riesgo de alucinacion: aunque la tasa de paginas degeneradas (bucles) es baja (0,9 %), el modelo puede generar texto no presente en la imagen, especialmente en paginas con contenido poco legible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de entrenamiento y del modelo base Qwen3.5-2B antes de un despliegue comercial.
- Es imprescindible servir el modelo con el prompt de `prompt.txt` y con `enable_thinking=False`; en caso contrario, la plantilla de chat puede abrir un bloque de razonamiento que degrada la transcripcion.
- No se documentan tipos de cuantizacion soportados ni el contexto maximo del modelo base en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Mejor modelo de la comparativa (LightOnOCR-3-4B): https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Qwen3.5-4B afinado: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng
- Qwen3.5-9B afinado: https://huggingface.co/yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng
- chandra-ocr-2 afinado: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng
- LightOnOCR-3-0.8B afinado: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng
