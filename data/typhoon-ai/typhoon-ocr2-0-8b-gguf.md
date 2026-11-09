# typhoon-ai/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR V2 0.8B GGUF es la versión cuantizada en formato GGUF del modelo Typhoon OCR V2 0.8B, un parser de documentos desarrollado por SCB 10X (equipo Typhoon) para tailandés e inglés. Dada una imagen de una página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su bounding box y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además, responde preguntas sobre un documento y extrae información clave en JSON.

El modelo cuenta con 752.393.024 parámetros y una ventana de contexto operativa de 40.960 tokens en llama.cpp, que reserva espacio para una imagen de hasta 16.384 tokens (16,7 MP) y una respuesta de otros 16.384. Esta versión GGUF está pensada para ejecutarse con llama.cpp y herramientas construidas sobre él, con un tamaño de repositorio de 3,1 GB que incluye varias precisiones de cuantización.

Su relevancia radica en que ofrece parsing de documentos de alta precisión en un modelo de menos de mil millones de parámetros, con una puntuación MDPBench de 77,4 en la cuantización Q8_0, idéntica a la de los pesos originales en bf16. La licencia Apache 2.0 facilita su integración en producción, aunque el uso está sujeto a los términos y condiciones de OpenTyphoon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; incluye codificador de imagen separado en `mmproj`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens en llama.cpp (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantizacion | f16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (uso sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (más `mmproj` f16 para el codificador de imagen) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna en la información proporcionada. El modelo es de tipo image-text-to-text y se distribuye en dos componentes: los pesos principales del modelo de lenguaje y un codificador de imagen independiente (`mmproj-typhoon-ocr2-0.8b-f16.gguf`, 205 MB en f16) que debe acompañar a cualquier archivo de cuantización. La relación entre tokens de imagen y píxeles es de un token por cada bloque de 32×32 píxeles, lo que permite procesar páginas de hasta 16,7 MP con el presupuesto de 16.384 tokens de imagen.

El modelo fue entrenado con un conjunto fijo de prompts y sin bloque de razonamiento (thinking), motivo por el cual la model card recomienda desactivar el razonamiento en llama.cpp (`--reasoning off`). Los detalles completos de entrenamiento, composición del dataset y uso de RLHF/DPO se remiten a la model card principal, no incluidos en la información disponible.

## Capacidades

- Parsing de documentos de página completa: extrae elementos de maquetación en orden de lectura con categoría, bounding box y texto.
- Categorías de maquetación soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto del texto se emite en Markdown.
- Bounding boxes en una rejilla de 0–1000 relativa al ancho y alto de la página.
- Respuesta a preguntas sobre el contenido de un documento (document QA) enviando la pregunta como prompt de texto.
- Extracción de información clave en formato JSON.
- Capacidades multilingües limitadas a tailandés e inglés.
- Procesamiento de páginas digitales y fotografías de documentos.
- Salida estructurada en un único objeto JSON dentro de un bloque de código `json`.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte imágenes de páginas escaneadas en Markdown estructurado con tablas en HTML, lo que permite indexar el contenido en sistemas de búsqueda sin transcripción manual.
- Extracción de datos de facturas y formularios: mediante la tarea de extracción de información clave en JSON, se pueden obtener campos concretos de documentos fotografiados para alimentar un ERP o un pipeline contable.
- Procesamiento de documentación técnica con fórmulas: al emitir las fórmulas en LaTeX, es adecuado para convertir papers y manuales con notación matemática a formatos publicables.
- Atención al ciudadano sobre documentos: con la modalidad de document QA, un chatbot puede responder preguntas sobre el contenido de un PDF o una fotografía aportada por el usuario, con contexto de hasta 40.960 tokens.
- Automatización de la digitalización de contratos bilingües tailandés-inglés: el soporte nativo de ambos idiomas evita pipelines de traducción intermedios y preserva el texto original sin reescritura.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M de 529 MB permite ejecutar el parser en servidores modestos o estaciones de trabajo sin GPU de gama alta, manteniendo una puntuación MDPBench de 75,8.
- Integración en herramientas de línea de comandos y aplicaciones de escritorio mediante llama.cpp, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), ejecutados con `llama-server` (build `a691b23`, CUDA, NVIDIA H100), decodificación greedy, razonamiento desactivado y presupuesto de imagen de 16.384 tokens:

| Archivo | Precision | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 77,4 | 77,2 |
| `typhoon-ocr2-0.8b-f16.gguf` | 16 bits, sin cuantizar | 1,52 GB | 77 | 76,9 |
| `typhoon-ocr2-0.8b-Q8_0.gguf` | 8 bits | 812 MB | 77,4 | 78 |
| `typhoon-ocr2-0.8b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 529 MB | 75,8 | 76,7 |
| `mmproj-typhoon-ocr2-0.8b-f16.gguf` | codificador de imagen f16 | 205 MB | – | – |

La model card recomienda Q8_0 por igualar la puntuación de los pesos originales con aproximadamente la mitad del tamaño de f16. Q4_K_M queda unos 1,5 puntos por debajo en la media global. Las diferencias de unas décimas entre archivos se consideran variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de tamaño en disco, los pesos van de 529 MB (Q4_K_M) a 1,52 GB (f16), más 205 MB del codificador de imagen f16.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100 con CUDA; no se han publicado pruebas en otras GPU.
- GPU de consumo: no se ha verificado oficialmente. Por tamaño, las cuantizaciones Q8_0 y Q4_K_M son compatibles en términos de memoria con GPU de consumo, pero esta afirmación no está respaldada por pruebas publicadas.
- Opciones de despliegue: llama.cpp mediante `llama-server` (descarga directa con `-hf typhoon-ai/typhoon-ocr2-0.8b-GGUF:Q8_0`) o con archivos locales (`-m` y `--mmproj`). Expone una API compatible con OpenAI en `/v1`.
- Configuración recomendada: `--jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999`. Para servir varias peticiones concurrentes, añadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles. Solo se probó llama.cpp en Linux con CUDA; las builds de CPU, Metal y Vulkan no se testearon y sus salidas pueden diferir ligeramente.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (parsers de documentos multimodales de tamaño similar). Por tanto, la comparativa se limita a las variantes internas del propio modelo:

| Variante | Precision | Tamano | MDPBench ↑ | Licencia |
|---|---|---|---|---|
| Original bf16 (vLLM) | bf16 | no disponible | 77,4 | Apache 2.0 |
| GGUF f16 | 16 bits | 1,52 GB | 77 | Apache 2.0 |
| GGUF Q8_0 | 8 bits | 812 MB | 77,4 | Apache 2.0 |
| GGUF Q4_K_M | 4 bits | 529 MB | 75,8 | Apache 2.0 |

## Limitaciones y advertencias

- La cuantización reduce la precisión: Q4_K_M pierde aproximadamente 1,5 puntos en MDPBench frente a Q8_0 y los pesos originales.
- Solo se ha probado llama.cpp en Linux con CUDA; las builds de CPU, Metal y Vulkan no se han verificado y pueden producir salidas ligeramente distintas.
- El modelo solo soporta tailandés e inglés; no se ha validado su comportamiento en otros idiomas.
- El prompt de parsing de página completa debe usarse exactamente como se especifica en la model card; el modelo fue entrenado con un conjunto fijo de prompts y las variaciones pueden degradar la salida.
- El modelo no fue entrenado con bloque de razonamiento; debe desactivarse (`--reasoning off`) para evitar que la plantilla de chat abra uno.
- Sin `--image-max-tokens 16384`, llama.cpp reduce la resolución de las páginas grandes y el texto pequeño se vuelve más difícil de leer.
- La salida puede truncarse al alcanzar el límite de tokens; es necesario un parser tolerante que descarte el último elemento incompleto.
- Riesgo de alucinación y de errores de transcripción en documentos de baja calidad o con tipografías poco legibles: no disponible en la información proporcionada, aunque es un riesgo inherente a los modelos OCR.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El uso está sujeto a los OpenTyphoon Terms and Conditions, además de la licencia Apache 2.0; conviene revisarlos antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Términos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
