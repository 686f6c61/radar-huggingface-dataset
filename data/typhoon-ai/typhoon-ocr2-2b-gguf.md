# typhoon-ai/typhoon-ocr2-2b-GGUF

## Resumen

Typhoon OCR V2 2B es un modelo de visión-lenguaje especializado en análisis de documentos (document parsing) para tailandés e inglés, desarrollado por Typhoon AI (SCB 10X). Dada una imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bounding box) y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además responde preguntas sobre el documento y extrae información clave en formato JSON.

Esta ficha corresponde concretamente a la versión cuantizada en GGUF del modelo base `typhoon-ai/typhoon-ocr2-2b`, publicada para su uso con llama.cpp y herramientas construidas sobre él (llama-server, Ollama, etc.). El modelo base cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y se distribuye bajo licencia Apache 2.0, aunque el uso está sujeto a los OpenTyphoon Terms and Conditions.

La relevancia de esta entrega radica en que permite ejecutar un parser de documentos de calidad casi idéntica al modelo original (79,5 frente a 79,8 en MDPBench) en hardware mucho más modesto: el archivo Q8_0 ocupa 2,01 GB y el Q4_K_M apenas 1,27 GB, ambos acompañados de un codificador de imagen f16 de 668 MB. Esto habilita el despliegue local de pipelines de OCR estructurado sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text); arquitectura interna no detallada en la información disponible |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.960 tokens en la configuración recomendada (`-c 40960`), reservando 16.384 para imagen y 16.384 para respuesta |
| Tipos de cuantizacion | f16 (16 bits), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium); codificador de imagen mmproj en f16 |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0, sujeta a OpenTyphoon Terms and Conditions |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer ni la composición del dataset de entrenamiento; la model card remite al modelo base `typhoon-ai/typhoon-ocr2-2b` para los detalles de entrenamiento, resultados completos de benchmarks, ejemplos y limitaciones. Lo que sí se especifica es el diseño de la tarea: el modelo fue entrenado sobre un conjunto fijo de prompts y produce como salida un objeto JSON con una lista de elementos de maquetación, cada uno con `bbox` (en una rejilla de 0 a 1000 relativa al ancho y alto de la página), `category` y `text`.

Las categorías de maquetación admitidas son: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote` y `footer`. El formato de texto depende de la categoría: vacío para figuras, LaTeX para fórmulas, HTML para tablas y Markdown para el resto. El modelo fue entrenado sin bloque de razonamiento (thinking), por lo que se recomienda desactivarlo explícitamente con `--reasoning off`.

En la parte de cuantización, la model card reporta el impacto de cada precisión sobre MDPBench, medido con llama-server (build `a691b23`, CUDA, NVIDIA H100), decodificación greedy, thinking desactivado y un presupuesto de imagen de 16.384 tokens (16,7 MP). La codificación de imagen usa un token por cada bloque de 32×32 píxeles.

## Capacidades

- Análisis de maquetación de página completa: extrae elementos en orden de lectura humano con categoría, bounding box y texto.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto de texto en Markdown.
- OCR de documentos digitales y de páginas fotografiadas, en tailandés e inglés.
- Respuesta a preguntas sobre un documento: basta con enviar la pregunta como prompt de texto junto a la imagen.
- Extracción de información clave en formato JSON.
- Salida estructurada en JSON dentro de un bloque de código `json`, parseable de forma determinista.
- Modo conversacional (etiqueta `conversational`) compatible con endpoints OpenAI (`endpoints_compatible`).
- No dispone de tool calling, capacidades de agente ni modo de razonamiento explícito según la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa páginas escaneadas o fotografiadas y devuelve el texto en orden de lectura con las tablas convertidas a HTML, lo que permite indexar el contenido en un sistema de búsqueda sin transcripción manual.
- Extracción de datos de facturas y formularios: usando la extracción de información clave en JSON, se pueden obtener campos estructurados (importes, fechas, emisores) de documentos en tailandés e inglés para alimentar un ERP o un pipeline contable.
- Procesamiento de documentación técnica con fórmulas: al emitir LaTeX para las fórmulas, resulta adecuado para digitalizar papers y manuales científicos preservando la notación matemática.
- Construcción de bases de conocimiento RAG sobre PDFs: el Markdown resultante (con cabeceras y pies de página filtrables mediante `keep_header_footer=False`) se puede trocear y vectorizar directamente, y el modelo puede responder después preguntas sobre el documento original.
- Despliegue local en entornos con requisitos de privacidad: con el archivo Q4_K_M (1,27 GB) más el mmproj (668 MB) cabe en GPUs de consumo, lo que permite procesar documentos sensibles sin enviarlos a servicios externos.
- Servicio de OCR multiinquilino: con llama-server se puede levantar un endpoint compatible con OpenAI y servir varias peticiones concurrentes añadiendo `-np N` y multiplicando `-c` por N, integrable en aplicaciones web existentes sin cambios de cliente.
- Análisis de documentos bilingües tailandés-inglés: cubre casos de contratos, manuales o informes con mezcla de ambos idiomas, un escenario frecuente en el sudeste asiático.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), medidos con llama-server (llama.cpp `a691b23`, CUDA, NVIDIA H100), greedy, thinking off y presupuesto de imagen de 16.384 tokens:

| Archivo | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 79,8 | 81,3 |
| `typhoon-ocr2-2b-f16.gguf` | f16, sin cuantización | 3,78 GB | 79,5 | 80,8 |
| `typhoon-ocr2-2b-Q8_0.gguf` | 8 bits | 2,01 GB | 79,5 | 80,4 |
| `typhoon-ocr2-2b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 1,27 GB | 78,4 | 79,7 |
| `mmproj-typhoon-ocr2-2b-f16.gguf` | codificador de imagen f16 | 668 MB | – | – |

El autor recomienda Q8_0 por igualar la puntuación de f16 con aproximadamente la mitad de tamaño; Q4_K_M pierde alrededor de un punto y se reserva para entornos con memoria ajustada. Las diferencias de unas décimas entre archivos están dentro de la variación entre ejecuciones. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M (1,27 GB) + mmproj f16 (668 MB) ≈ 2 GB de pesos; Q8_0 (2,01 GB) + mmproj ≈ 2,7 GB; f16 (3,78 GB) + mmproj ≈ 4,5 GB. A esto hay que sumar el espacio de contexto KV para hasta 40.960 tokens.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100 con CUDA; para producción de alto volumen se recomienda ese perfil. Para uso individual, cualquier GPU de consumo con al menos 6-8 GB de VRAM permite cargar Q8_0 o Q4_K_M con margen para el contexto.
- Cabe en GPU de consumo: sí, con los archivos Q4_K_M y Q8_0 en GPUs de gama media con 8 GB o más.
- Opciones de despliegue: llama.cpp (llama-server, probado con `-hf`, `--jinja`, `--reasoning off`, `-ngl 999`, `--image-max-tokens 16384`), endpoints compatibles con OpenAI; el modelo base se sirve con vLLM. Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. Solo se documenta que el autor probó llama.cpp en Linux con CUDA; las compilaciones CPU, Metal y Vulkan no fueron probadas y sus salidas pueden diferir ligeramente.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos de OCR o parsing de documentos, por lo que no es posible establecer una comparativa con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Typhoon OCR V2 2B (GGUF) | 1,88 B | 40.960 tokens (config. recomendada) | Apache 2.0 + OpenTyphoon T&C | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización degrada la precisión: Q4_K_M pierde aproximadamente un punto en MDPBench respecto a f16 (78,4 frente a 79,5); conviene comparar las puntuaciones antes de elegir un archivo más pequeño.
- Solo se probó llama.cpp en Linux con CUDA; las compilaciones de CPU, Metal y Vulkan no se validaron y sus salidas pueden diferir ligeramente.
- El modelo puede entrar en bucles de repetición (la model card se corta en ese punto, por lo que no se detallan más síntomas ni mitigaciones).
- El prompt de parsing de página completa debe usarse exactamente como está escrito: el modelo fue entrenado con un conjunto fijo de prompts y desviarse de ellos puede degradar la salida.
- El presupuesto de imagen debe fijarse en 16.384 tokens para páginas grandes; sin él, llama.cpp reduce la resolución y el texto pequeño se vuelve más difícil de leer.
- Cobertura lingüística limitada a tailandés e inglés; no se documenta soporte de otros idiomas.
- La licencia Apache 2.0 está condicionada por los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- Riesgo de alucinación y de desviación del texto original: aunque el prompt exige transcribir exactamente el texto de la imagen sin traducción ni reescritura, no se documentan garantías ni tasas de error específicas.
- No se documentan sesgos conocidos en la información disponible.
- Si la salida se corta por el límite de tokens, el JSON queda incompleto; los helpers de la model card truncan el último elemento para poder parsearlo, lo que implica pérdida de contenido.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
