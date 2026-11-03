# yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng

## Resumen

chandra-ocr-2-cultural-heritage-eng es un modelo de visión-lenguaje especializado en el reconocimiento de texto manuscrito (HTR) y la transcripción de documentos de archivo en inglés. Lo desarrolla el grupo Yale Cultural Heritage a partir del modelo base datalab-to/chandra-ocr-2, al que se ha aplicado un ajuste fino con LoRA sobre 11.029 páginas de las colecciones de la Biblioteca de Yale, siguiendo las convenciones de transcripción del Smithsonian Transcription Center. Resuelve un problema muy concreto: convertir imágenes de manuscritos históricos en transcripciones fieles que preservan la ortografía, la puntuación y las mayúsculas originales, e incorporan marcas editoriales para tachados, notas marginales, lecturas dudosas, tablas, sellos y páginas en blanco.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y se distribuye en formato safetensors con un repositorio de 9,1 GB. La arquitectura es la del base chandra-ocr-2, un transformer de la familia Qwen3.5 orientado a image-text-to-text, que se carga con `Qwen3_5ForConditionalGeneration` y un procesador que fija un presupuesto de 2.048 tokens visuales por página. La generación se realiza en modo greedy con hasta 2.048 tokens nuevos.

Su relevancia radica en la mejora drástica frente al modelo base: el CER pasa de 1,2831 a 0,1101 y el WER de 1,1102 a 0,1222 sobre 582 páginas reservadas de 39 documentos. Es el cuarto mejor de los 16 modelos entrenados con estos mismos datos, y compite de cerca con variantes de Qwen3.5 y LightOnOCR. La licencia es openrail-m-modified, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje de la familia Qwen3.5 (image-text-to-text), ajuste fino con LoRA sobre datalab-to/chandra-ocr-2 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el procesador fija 2.048 tokens visuales por página y la generación admite hasta 2.048 tokens nuevos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 para inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | openrail-m-modified (license: other) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de datalab-to/chandra-ocr-2, un vision-lenguaje basado en la arquitectura Qwen3.5 que procesa una imagen de página junto con un prompt textual y genera la transcripción token a token. Sobre esta base se aplicó un ajuste fino con LoRA empleando 11.029 páginas del dataset yale-cultural-heritage/ai-project-transcriptions, con transcripciones preparadas por Jon Manton y su equipo. El prompt de transcripción se distribuye en el repositorio como `prompt.txt` y debe servirse exactamente igual que en el entrenamiento; además, es necesario desactivar el modo de razonamiento (`enable_thinking=False`) para que el modelo no desvíe la salida hacia texto explicativo.

La evaluación se realizó sobre 582 páginas reservadas de 39 documentos, sin que ninguna página de esos documentos apareciera en el entrenamiento. La decodificación fue greedy, con hasta 2.048 tokens nuevos y 2.048 tokens visuales por página. El modelo produce marcas editoriales entre dobles corchetes (`[[strikethrough]]`, `[[left margin]]`, `[[?]]`, `[[seal]]`, entre otras) y expansiones de abreviaturas. El análisis de errores muestra que estas marcas, pese a representar menos del 5 % del texto de referencia, concentran aproximadamente la mitad de los errores de carácter: el modelo usa los tipos de etiqueta correctos pero a menudo las coloca de forma distinta al transcriptor humano.

## Capacidades

- Transcripción de texto manuscrito en inglés a partir de imágenes de página, línea a línea, preservando ortografía, puntuación y capitalización originales.
- Reconocimiento de texto impreso y mixto (manuscrito e impreso) en documentos de archivo.
- Generación de marcas editoriales para tachados, notas marginales, lecturas inciertas, tablas, sellos, estampillas y páginas en blanco.
- Expansión controlada de abreviaturas históricas (por ejemplo, `y[ou]r` → `yr`).
- Procesamiento de tablas con separadores de columna.
- Modo conversacional mediante plantilla de chat, con modo de razonamiento desactivable (`enable_thinking=False`).
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Digitalización de fondos manuscritos en bibliotecas y archivos: el modelo convierte imágenes de página en transcripciones con marcas editoriales, lo que permite generar texto buscable a partir de colecciones históricas sin transcripción manual línea a línea.
- Proyectos de crowdsourcing de transcripción: sirve como borrador automático que los voluntarios revisan y corrigen, reduciendo el esfuerzo inicial gracias a un CER de 0,1101 sobre páginas reservadas.
- Investigación histórica y humanidades digitales: permite extraer texto de correspondencia, diarios y registros administrativos preservando la grafía original, algo esencial para análisis lingüísticos y paleográficos.
- Construcción de corpus anotados: las marcas de marginalia, tachados y lecturas dudosas facilitan la creación de conjuntos de datos con estructura editorial para entrenar o evaluar otros sistemas.
- Indexación y búsqueda en archivos digitales: al transcribir páginas completas con hasta 2.048 tokens visuales de presupuesto, se puede alimentar un motor de búsqueda sobre documentos que antes solo existían como imagen.
- Extracción de datos de registros tabulares históricos: el soporte de tablas con separadores de columna permite recuperar listados, censos y libros de cuentas en formato estructurado.
- Preservación y accesibilidad: generar transcripciones textuales de manuscritos mejora la accesibilidad para lectores con discapacidad visual y facilita la traducción o el resumen posterior.

## Benchmarks y rendimiento

Resultados sobre 582 páginas reservadas de 39 documentos, decodificación greedy, hasta 2.048 tokens nuevos y 2.048 tokens visuales por página. CER y WER son micro-promediados tras normalización Unicode NFD.

| Metrica | chandra-ocr-2 base | chandra-ocr-2-cultural-heritage-eng |
|---|---|---|
| CER | 1,2831 | 0,1101 |
| WER | 1,1102 | 0,1222 |
| Cobertura de líneas (line recall) | 0,0000 | 0,5955 |
| Páginas transcritas exactamente | 0,0 % | 14,6 % |
| Páginas degeneradas (bucle) | 0,3 % | 0,5 % |

Desglose del error por marcas editoriales sobre las 527 páginas no vacías reservadas:

| Que se ignora al puntuar | CER |
|---|---|
| Nada (espacios normalizados) | 0,1023 |
| Etiquetas `[[...]]` | 0,0537 |
| + expansiones de abreviaturas | 0,0495 |
| + separadores de columna `\|` | 0,0478 |

Comparativa con otros modelos entrenados con los mismos datos y evaluados sobre las mismas páginas (los siete mejores de 16):

| Modelo | Ajuste | CER | Cobertura de líneas |
|---|---|---|---|
| LightOnOCR-3-4B | LoRA | 0,0770 | 0,607 |
| Qwen3.5-4B | LoRA | 0,1047 | 0,590 |
| Qwen3.5-9B | LoRA | 0,1099 | 0,616 |
| chandra-ocr-2 (este modelo) | LoRA | 0,1101 | 0,596 |
| LightOnOCR-3-0.8B | LoRA | 0,1159 | 0,570 |
| Qwen3.5-2B | LoRA | 0,1190 | 0,573 |
| LightOnOCR-3-4B | full fine-tune | 0,1260 | 0,571 |

Según el autor, diferencias inferiores a 0,02 CER quedan dentro del ruido entre ejecuciones, por lo que los modelos entre Qwen3.5-4B y Qwen3.5-2B están prácticamente empatados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros en bfloat16 se requieren aproximadamente 9 GB solo para los pesos, más el coste del procesador visual y de los tokens de imagen; en la práctica conviene contar con 12-16 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con varias páginas en paralelo; RTX 4090 (24 GB) para inferencia individual cómoda.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB); en tarjetas de 16 GB o menos probablemente sea necesario cuantizar, aunque no se documentan cuantizaciones oficiales en la información disponible.
- Opciones de despliegue: transformers (versión >= 5.5.4) con `Qwen3_5ForConditionalGeneration`, `AutoProcessor` y `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. La generación es greedy con hasta 2.048 tokens nuevos y un presupuesto de 2.048 tokens visuales por página, lo que da una idea del orden de magnitud del coste por página.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (misma eval.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chandra-ocr-2-cultural-heritage-eng | 4,54 B | 2.048 tokens visuales por página | 0,1101 | openrail-m-modified | HuggingFace (este repo) |
| LightOnOCR-3-4B-cultural-heritage-eng | no disponible | no disponible | 0,0770 | no disponible | HuggingFace (yale-cultural-heritage) |
| Qwen3.5-4B-cultural-heritage-eng | no disponible | no disponible | 0,1047 | no disponible | HuggingFace (yale-cultural-heritage) |
| Qwen3.5-9B-cultural-heritage-eng | no disponible | no disponible | 0,1099 | no disponible | HuggingFace (yale-cultural-heritage) |

El modelo con mejor CER de la comparativa es LightOnOCR-3-4B-cultural-heritage-eng (0,0770), mientras que este chandra-ocr-2 queda en cuarta posición con 0,1101, empatado en la práctica con Qwen3.5-4B y Qwen3.5-9B. Los modelos más pequeños (LightOnOCR-3-0.8B y Qwen3.5-2B) tienen un CER ligeramente superior pero son más baratos de ejecutar.

## Limitaciones y advertencias

- Sesgos: el modelo está entrenado exclusivamente con documentos en inglés de las colecciones de la Biblioteca de Yale; su comportamiento con otras lenguas, caligrafías o tradiciones documentales no está evaluado.
- Alucinación: aunque el modo degenerado (bucles) es bajo (0,5 %), el modelo puede generar texto que no está en la página, especialmente cuando no sigue las convenciones del prompt; el modelo base mostraba este problema de forma severa (CER > 1,0 por exceso de texto).
- Marcas editoriales aproximadas: las etiquetas `[[...]]` concentran cerca de la mitad de los errores de carácter. Deben tratarse como orientativas y el texto subyacente como la parte fiable.
- Cobertura de líneas del 59,55 %: solo algo más de la mitad de las líneas de referencia se reproducen exactamente y en orden; la transcripción completa exacta se logra en el 14,6 % de las páginas.
- Dependencia del prompt: el modelo debe servirse con el `prompt.txt` del repositorio y con `enable_thinking=False`; desviarse de esta configuración degrada la salida.
- Licencia openrail-m-modified: es una licencia con restricciones adicionales; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial o de redistribución.
- Idiomas: solo inglés documentado; no se garantiza calidad en documentos multilingües o con fragmentos en otras lenguas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un modelo reciente con poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Mejor modelo de la comparativa (LightOnOCR-3-4B): https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Variante Qwen3.5-4B: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng
- Variante Qwen3.5-9B: https://huggingface.co/yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng
- Variante LightOnOCR-3-0.8B: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng
- Variante Qwen3.5-2B: https://huggingface.co/yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng
- Prompt de transcripción: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng/blob/main/prompt.txt
- Licencia: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng/blob/main/LICENSE
