# yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng

## Resumen

Qwen3.5-9B-cultural-heritage-eng es un modelo vision-lenguaje derivado de Qwen/Qwen3.5-9B mediante un ajuste fino con LoRA, especializado en la transcripción de documentos archivísticos manuscritos en inglés procedentes de las colecciones de la Biblioteca de Yale. Lo desarrolla el equipo Yale Cultural Heritage, y su propósito es automatizar la lectura y transcripción de manuscritos históricos siguiendo las convenciones de marcado editorial del Smithsonian Transcription Center.

El modelo resuelve un problema concreto y costoso: la transcripción manual de fondos archivísticos a gran escala. Recibe como entrada una imagen de página junto con un prompt de transcripción (distribuido en el repositorio como `prompt.txt`) y devuelve el texto línea a línea, preservando la ortografía, puntuación y capitalización originales, e incorporando etiquetas editoriales entre dobles corchetes para tachados, marginalia, lecturas inciertas, tablas, sellos y estampillas.

Con 9.409.813.744 parámetros y pesos en safetensors, el modelo se entrenó sobre 11.029 páginas del dataset `yale-cultural-heritage/ai-project-transcriptions` y se evaluó sobre 582 páginas retenidas de 39 documentos no vistos durante el entrenamiento. Su relevancia actual radica en que reduce el CER de 0,7029 (modelo base) a 0,1099, y las páginas degeneradas por bucle del 6,2 % al 0,5 %, lo que lo convierte en una herramienta viable para digitalización patrimonial a escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia Qwen3.5), adaptación LoRA sobre el modelo base |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (presupuesto de 2.048 tokens visuales por página y hasta 2.048 tokens nuevos de generación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con pipeline `image-text-to-text`, y se adapta mediante LoRA para la tarea de reconocimiento de texto manuscrito (HTR). El procesador asociado incorpora un presupuesto de 2.048 tokens visuales por página, y la generación se realiza con decodificación greedy, hasta 2.048 tokens nuevos y `repetition_penalty=1.1`, deteniéndose en el token de fin de turno `<|im_end|>`. La inferencia requiere `transformers>=5.5.4` y la clase `Qwen3_5ForConditionalGeneration`.

El entrenamiento utilizó 11.029 páginas del dataset `yale-cultural-heritage/ai-project-transcriptions`, con transcripciones preparadas por Jon Manton y su equipo. La evaluación se realizó sobre 582 páginas retenidas de 39 documentos, sin que ninguna página de esos documentos apareciera en el conjunto de entrenamiento. El modelo se entrenó con un prompt específico que debe servirse tal cual en producción, y es importante desactivar el modo de razonamiento (`enable_thinking=False`) en la plantilla de chat: de lo contrario, algunos templates de Qwen3.5 abren un bloque de razonamiento y el modelo, entrenado para transcribir directamente, nunca llega a la transcripción.

## Capacidades

- Transcripción de texto manuscrito (HTR) y reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas de archivo.
- Preservación de la ortografía, puntuación y capitalización originales del documento.
- Marcado editorial con etiquetas de doble corchete: `[[strikethrough]]`, `[[left margin]]`, `[[?]]`, `[[seal]]` y similares, para tachados, marginalia, lecturas inciertas, tablas, sellos, estampillas y páginas en blanco.
- Salida línea a línea con separadores de columna de tabla (`|`).
- Conversación multimodal (image-text-to-text) mediante plantilla de chat.
- Modo de razonamiento desactivable (`enable_thinking=False`), necesario para la tarea de transcripción directa.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Digitalización de fondos archivísticos: procesar lotes de imágenes de manuscritos de la Biblioteca de Yale y generar transcripciones en formato Smithsonian Transcription Center, reduciendo el esfuerzo manual en documentos de difícil lectura.
- Enriquecimiento de catálogos y buscadores: convertir imágenes de páginas en texto indexable para motores de búsqueda internos de archivos y bibliotecas, preservando la ortografía histórica.
- Revisión asistida por humanos: usar la transcripción automática como borrador que un transcriptor revisa y corrige, aprovechando el CER de 0,1099 y la recall de líneas de 0,6156 para priorizar la revisión.
- Extracción de datos de registros históricos: transcribir tablas, sellos y estampillas con el marcado editorial para su posterior procesamiento estructurado en proyectos de investigación.
- Investigación en humanidades digitales: generar corpus textuales a partir de colecciones manuscritas para análisis lingüístico, histórico o de redes sociales de la época.
- Pipelines de preservación digital: integrar el modelo en flujos de trabajo de archivo con inferencia por lotes, sirviéndolo con el prompt oficial y decodificación greedy para resultados reproducibles.

## Benchmarks y rendimiento

Evaluación sobre 582 páginas retenidas de 39 documentos, decodificación greedy, hasta 2.048 tokens nuevos y 2.048 tokens visuales por página. CER y WER son micro-promediados tras normalización Unicode NFD; la recall de líneas es la proporción de líneas de referencia reproducidas exactamente y en orden.

| Métrica (582 páginas retenidas) | Qwen3.5-9B base | Este modelo |
|---|---|---|
| CER | 0,7029 | 0,1099 |
| WER | 0,6217 | 0,1293 |
| Recall de líneas | 0,1987 | 0,6156 |
| Páginas transcritas exactamente | 2,4 % | 14,8 % |
| Páginas degeneradas (bucle) | 6,2 % | 0,5 % |

Desglose del error por marcado editorial (527 páginas retenidas no vacías, recalculado eliminando el marcado de referencia y predicción):

| Qué se ignora | CER |
|---|---|
| Nada (espacios normalizados) | 0,1087 |
| Etiquetas `[[...]]` | 0,0534 |
| + expansiones de abreviaturas (`y[ou]r` → `yr`) | 0,0496 |
| + separadores de columna de tabla `\|` | 0,0481 |

Comparativa con otros modelos entrenados sobre los mismos datos y las mismas páginas de evaluación (16 modelos en total, los siete mejores):

| Modelo | Ajuste | CER | Recall de líneas |
|---|---|---|---|
| LightOnOCR-3-4B | LoRA | 0,0770 | 0,607 |
| Qwen3.5-4B | LoRA | 0,1047 | 0,590 |
| Qwen3.5-9B (este modelo) | LoRA | 0,1099 | 0,616 |
| chandra-ocr-2 | LoRA | 0,1101 | 0,596 |
| LightOnOCR-3-0.8B | LoRA | 0,1159 | 0,570 |
| Qwen3.5-2B | LoRA | 0,1190 | 0,573 |
| LightOnOCR-3-4B | Full fine-tune | 0,1260 | 0,571 |

Según la model card, las diferencias inferiores a 0,02 CER están dentro del ruido entre ejecuciones, por lo que los modelos entre Qwen3.5-4B y Qwen3.5-2B están prácticamente empatados y los más pequeños son más baratos de ejecutar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9.409.813.744 parámetros en bfloat16, el peso de los pesos ronda los 18,8 GB (tamaño del repositorio), por lo que se necesita al menos esa cantidad más memoria para activaciones y tokens visuales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, GPUs de 24 GB o más (RTX 4090, A100, H100) son las candidatas naturales, aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado por el autor; en bfloat16 el modelo completo no cabe en GPUs de 16 GB o menos sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: `transformers>=5.5.4` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`, según el ejemplo oficial. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (misma evaluación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-cultural-heritage-eng (este) | 9,4 B | no disponible | 0,1099 | Apache 2.0 | HuggingFace |
| LightOnOCR-3-4B-cultural-heritage-eng | no disponible | no disponible | 0,0770 | no disponible | HuggingFace |
| Qwen3.5-4B-cultural-heritage-eng | no disponible | no disponible | 0,1047 | no disponible | HuggingFace |
| chandra-ocr-2-cultural-heritage-eng | no disponible | no disponible | 0,1101 | no disponible | HuggingFace |

El modelo mejor valorado del mismo proyecto es LightOnOCR-3-4B-cultural-heritage-eng, con CER 0,0770 y recall de líneas 0,607, mientras que este Qwen3.5-9B obtiene la mejor recall de líneas (0,616) entre los siete mejores pese a un CER ligeramente superior. Los modelos más pequeños (Qwen3.5-4B y Qwen3.5-2B) quedan dentro del ruido de ejecución y son más baratos de desplegar.

## Limitaciones y advertencias

- El marcado editorial es aproximado: las etiquetas de doble corchete suponen menos del 5 % del texto de referencia pero cerca de la mitad de los errores de caracteres; el modelo usa los tipos correctos de etiquetas pero a menudo las coloca de forma distinta al transcriptor humano.
- El texto subyacente es la parte fiable; conviene tratar las etiquetas como orientativas y validarlas en revisión humana.
- Solo soporta inglés; no se documentan otros idiomas.
- Riesgo de alucinación y de bucles degenerados: aunque las páginas degeneradas bajan al 0,5 %, siguen existiendo, y la `repetition_penalty=1.1` está configurada precisamente para mitigarlas.
- Es obligatorio servir el modelo con el prompt de `prompt.txt` y con `enable_thinking=False`; de lo contrario puede abrir un bloque de razonamiento y no producir la transcripción.
- Solo el 14,8 % de las páginas se transcriben exactamente, por lo que en producción se requiere revisión humana o un paso de corrección.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni sesgos conocidos en la información disponible.
- No se han publicado datos de sesgos, cuantizaciones soportadas ni requisitos de hardware en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Mejor modelo del proyecto: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Qwen3.5-4B del proyecto: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng
- chandra-ocr-2 del proyecto: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng
- LightOnOCR-3-0.8B del proyecto: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng
- Qwen3.5-2B del proyecto: https://huggingface.co/yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng
