# yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng

## Resumen

Qwen3.5-4B-cultural-heritage-eng es un modelo vision-lenguaje especializado en el reconocimiento de texto manuscrito (HTR) y la transcripción de documentos de archivo en inglés. Lo desarrolla el grupo Yale Cultural Heritage a partir del modelo base Qwen/Qwen3.5-4B, al que se le aplicó un ajuste fino con LoRA sobre 11.029 páginas de las colecciones de la Biblioteca de Yale, siguiendo las convenciones de transcripción del Smithsonian Transcription Center. El modelo resuelve un problema muy concreto y costoso en humanidades digitales: convertir imágenes de manuscritos en transcripciones fieles que preserven ortografía, puntuación y capitalización originales, con marcado editorial para tachaduras, notas marginales, lecturas dudosas, tablas, sellos y páginas en blanco.

La arquitectura es la del Qwen3.5-4B original (vision-lenguaje, familia qwen3_5), con 4.539.265.536 parámetros totales según los pesos en safetensors y un presupuesto de 2.048 tokens visuales por página más hasta 2.048 tokens nuevos de decodificación. El ajuste se distribuye como adaptador LoRA sobre el modelo base, con licencia Apache 2.0 y pesos en safetensors para transformers.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 4B ajustado con LoRA puede reducir el CER de 0,5304 a 0,1047 frente al base en un conjunto de evaluación de 582 páginas retenidas; por otro, forma parte de un estudio comparativo abierto de 16 modelos (LoRA y ajuste completo) sobre los mismos datos, lo que permite elegir con criterios medidos entre tamaño, coste y calidad de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje de la familia Qwen3.5 (transformers, clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; presupuesto de 2.048 tokens visuales por página y hasta 2.048 tokens nuevos de generación |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantización, pero no se documenta aquí) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre Qwen/Qwen3.5-4B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un vision-lenguaje que procesa la imagen de la página como tokens visuales (hasta 2.048 por página) junto con el prompt de transcripción, y genera la transcripción línea a línea. El ajuste se realizó con LoRA sobre 11.029 páginas del dataset yale-cultural-heritage/ai-project-transcriptions, con transcripciones preparadas por Jon Manton y su equipo. La evaluación se hizo sobre 582 páginas retenidas de 39 documentos, sin que ninguna página de esos documentos apareciera en entrenamiento, con decodificación greedy.

El prompt de transcripción se distribuye en el repositorio como `prompt.txt` y el modelo debe servirse con ese mismo prompt. Un detalle técnico importante: hay que invocar la plantilla de chat con `enable_thinking=False`, porque de lo contrario algunos templates de Qwen3.5 abren un bloque de razonamiento y el modelo, entrenado para transcribir directamente, no llega a producir la transcripción. El `generation_config.json` fija `do_sample=False`, `repetition_penalty=1.1` y parada en `<|im_end|>`. El marcado editorial se expresa con etiquetas de doble corchete (`[[strikethrough]]`, `[[left margin]]`, `[[?]]`, `[[seal]]`, etc.).

## Capacidades

- Transcripción de texto manuscrito en inglés a partir de la imagen de una página, preservando ortografía, puntuación y capitalización originales.
- Marcado editorial: tachaduras, notas marginales, lecturas inciertas, tablas, sellos, estampillas y páginas en blanco.
- Salida línea a línea, alineada con las convenciones del Smithsonian Transcription Center.
- Procesamiento de documentos de archivo y manuscritos de colecciones bibliotecarias.
- Entrada multimodal imagen-texto con prompt de instrucción fijo.
- Conversacional en el sentido de que usa la plantilla de chat del modelo base, aunque su uso previsto es la tarea única de transcripción.
- No se documentan tool calling, function calling, capacidades de agente, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Digitalización masiva de fondos manuscritos: procesar lotes de imágenes de páginas de archivo y obtener transcripciones con un CER en torno a 0,10, lo que reduce drásticamente el trabajo de revisión humana frente a la transcripción manual.
- Accesibilidad y búsqueda en archivos: generar texto indexable a partir de manuscritos para habilitar búsqueda de texto completo en catálogos y repositorios digitales de bibliotecas.
- Investigación en humanidades digitales: producir transcripciones de corpus históricos con marcado de tachaduras y notas marginales, útil para estudiar prácticas de escritura y corrección.
- Revisión asistida por humanos: usar la transcripción como primer borrador y reservar el esfuerzo del transcriptor para corregir el marcado editorial, que concentra aproximadamente la mitad de los errores de caracteres.
- Preservación y difusión patrimonial: publicar transcripciones de documentos de archivo con fines divulgativos, dado que la licencia Apache 2.0 permite uso comercial y redistribución.
- Despliegue en infraestructura modesta: al ser un modelo de 4B, puede servirse en una sola GPU para proyectos de digitalización con presupuesto limitado, a diferencia de alternativas de mayor tamaño.
- Integración en pipelines de catalogación: incorporar la transcripción como etapa previa a la extracción de metadatos (nombres, fechas, lugares) en flujos de trabajo archivísticos.

## Benchmarks y rendimiento

Evaluación sobre 582 páginas retenidas de 39 documentos, decodificación greedy, hasta 2.048 tokens nuevos y 2.048 tokens visuales por página. CER y WER son micro-promediados tras normalización Unicode NFD.

| Metrica (582 paginas retenidas) | Qwen3.5-4B base | Este modelo |
|---|---|---|
| CER | 0,5304 | 0,1047 |
| WER | 0,5460 | 0,1433 |
| Recuperación de líneas (line recall) | 0,3123 | 0,5900 |
| Páginas transcritas exactamente | 1,2 % | 15,3 % |
| Páginas degeneradas (bucle) | 2,6 % | 0,5 % |

Desglose del error según el marcado ignorado (527 páginas retenidas no en blanco):

| Qué se ignora | CER |
|---|---|
| Nada (espacios normalizados) | 0,0966 |
| Etiquetas `[[...]]` | 0,0546 |
| + expansiones de abreviaturas (`y[ou]r` → `yr`) | 0,0507 |
| + separadores de columna de tabla `\|` | 0,0492 |

Comparativa con los siete mejores modelos entrenados con los mismos datos y las mismas páginas de evaluación:

| Modelo | Ajuste | CER | Recuperación de líneas |
|---|---|---|---|
| LightOnOCR-3-4B | LoRA | 0,0770 | 0,607 |
| **Qwen3.5-4B (este modelo)** | LoRA | **0,1047** | 0,590 |
| Qwen3.5-9B | LoRA | 0,1099 | 0,616 |
| chandra-ocr-2 | LoRA | 0,1101 | 0,596 |
| LightOnOCR-3-0.8B | LoRA | 0,1159 | 0,570 |
| Qwen3.5-2B | LoRA | 0,1190 | 0,573 |
| LightOnOCR-3-4B | Ajuste completo | 0,1260 | 0,571 |

El autor advierte que diferencias inferiores a 0,02 CER están dentro del ruido entre ejecuciones, por lo que los modelos de Qwen3.5-4B a Qwen3.5-2B están prácticamente empatados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.539 millones de parámetros en bfloat16 los pesos ocupan aproximadamente 9 GB, a lo que hay que sumar la caché KV y los tokens visuales de cada página.
- GPU recomendadas: no se indican en la información disponible. Por tamaño, una GPU con 16-24 GB de VRAM resulta holgada en bfloat16; una A100 o H100 permiten mayor paralelismo por lote.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 16 GB o más (por ejemplo, RTX 4080/4090 o superiores) en bfloat16; en GPUs de 8-12 GB requeriría cuantización, no documentada en la model card.
- Opciones de despliegue: transformers (>= 5.5.4) con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración evaluada usa greedy, `repetition_penalty=1.1`, hasta 2.048 tokens nuevos y 2.048 tokens visuales por página, lo que sirve de referencia para dimensionar el coste por página.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (mismos datos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.5-4B-cultural-heritage-eng** | 4,54 B | no disponible (2.048 tokens visuales/página) | 0,1047 | Apache 2.0 | Hugging Face |
| LightOnOCR-3-4B-cultural-heritage-eng | no disponible | no disponible | 0,0770 | no disponible | Hugging Face |
| Qwen3.5-9B-cultural-heritage-eng | no disponible | no disponible | 0,1099 | no disponible | Hugging Face |
| chandra-ocr-2-cultural-heritage-eng | no disponible | no disponible | 0,1101 | no disponible | Hugging Face |
| Qwen3.5-2B-cultural-heritage-eng | no disponible | no disponible | 0,1190 | no disponible | Hugging Face |

LightOnOCR-3-4B es la alternativa con mejor CER del estudio; Qwen3.5-9B ofrece mayor recuperación de líneas (0,616) a costa de un modelo más grande; Qwen3.5-2B es la opción más barata de ejecutar con una diferencia de CER dentro del ruido declarado.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y etiquetado únicamente para documentos manuscritos en inglés (`language: en`).
- El marcado editorial es aproximado: las etiquetas de doble corchete suponen menos del 5 % del texto de referencia pero concentran aproximadamente la mitad de los errores de caracteres; el modelo usa los tipos correctos de etiqueta pero a menudo las coloca de forma distinta al transcriptor humano.
- Riesgo de bucles degenerativos: el 0,5 % de las páginas evaluadas quedaron degeneradas, por lo que en producción conviene detectar y reintentar esas salidas.
- Solo el 15,3 % de las páginas se transcriben exactamente; el uso realista es como primer borrador con revisión humana.
- Requiere servir el prompt exacto de `prompt.txt` y desactivar el modo de razonamiento (`enable_thinking=False`); de lo contrario el modelo puede no producir la transcripción.
- El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-4B: hay que cargar la base y el adaptador, y conviene fijar la versión de transformers (>= 5.5.4) por la clase `Qwen3_5ForConditionalGeneration`.
- No se documentan sesgos específicos, pero al operar sobre documentos históricos puede reproducir terminología, ortografía y sesgos propios de las fuentes originales.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero conviene verificar las condiciones de la licencia del modelo base Qwen3.5-4B antes de desplegar en producción.
- No hay datos publicados de latencia, throughput ni requisitos de VRAM, lo que obliga a medir en el entorno propio antes de dimensionar un servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Mejor modelo del estudio (LightOnOCR-3-4B): https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Qwen3.5-9B ajustado: https://huggingface.co/yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng
- chandra-ocr-2 ajustado: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng
- LightOnOCR-3-0.8B ajustado: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng
- Qwen3.5-2B ajustado: https://huggingface.co/yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng
- Prompt de transcripción: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng/blob/main/prompt.txt
