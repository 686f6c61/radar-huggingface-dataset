# Suraponn/typhoon-ocr2-2b-GGUF

## Resumen

Typhoon OCR V2 2B GGUF es la versión cuantizada en formato GGUF del modelo Typhoon OCR V2 2B, desarrollado por Typhoon AI (SCB 10X) y empaquetado por el usuario Suraponn para su uso con llama.cpp y herramientas derivadas. Se trata de un modelo multimodal de tipo image-text-to-text especializado en parsing de documentos: dada la imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su bounding box y su texto, formateando tablas en HTML, fórmulas en LaTeX y el resto de texto en Markdown.

El modelo base resuelve un problema concreto: la digitalización estructurada de documentos en tailandés e inglés, incluyendo páginas fotografiadas, con preservación de layout, y añade capacidades de respuesta a preguntas sobre documentos y extracción de información clave en JSON. Con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y una ventana de contexto configurada en 40.960 tokens en los ejemplos de despliegue, está pensado para ejecutarse en hardware modesto.

La relevancia de esta versión GGUF reside en que permite desplegar el modelo en local mediante llama.cpp y su servidor compatible con la API de OpenAI, con cuantizaciones que van desde 16 bits (3,78 GB) hasta Q4_K_M (1,27 GB), manteniendo una precisión muy cercana a los pesos originales en el benchmark MDPBench (79,5 frente a 79,8 en la versión bf16 con vLLM).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; incluye codificador de imagen separado en el archivo mmproj) |
| Parámetros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en la configuración recomendada (`-c 40960`), reservando 16.384 para imagen y 16.384 para respuesta |
| Tipos de cuantización | f16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium); codificador de imagen en f16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del transformer del modelo base (número de capas, dimensión oculta, mecanismo de atención ni diseño del codificador de imagen). Lo que sí se documenta es que el modelo es multimodal de tipo image-text-to-text, con un codificador de imagen empaquetado por separado en el archivo `mmproj-typhoon-ocr2-2b-f16.gguf` (668 MB), que debe acompañar a cualquiera de los archivos de pesos. El modelo procesa imágenes con un presupuesto de hasta 16.384 tokens de imagen, donde cada token de imagen cubre 32×32 píxeles, lo que permite páginas de hasta 16,7 MP.

El modelo fue entrenado con un conjunto fijo de prompts y sin bloque de razonamiento (thinking), de ahí que se recomiende `--reasoning off` en llama.cpp. La model card remite a la model card principal del modelo base para los detalles de entrenamiento, los resultados completos de benchmarks, ejemplos y limitaciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Parsing de documentos página completa: extrae elementos de maquetación en orden de lectura, cada uno con bounding box (rejilla 0–1000 relativa al ancho y alto de la página), categoría y texto.
- Categorías de layout soportadas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer.
- Formateo estructurado de salida: tablas en HTML, fórmulas en LaTeX y texto general en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento de documentos digitales y de páginas fotografiadas.
- Soporte bilingüe tailandés-inglés, con especial atención al tailandés (el modelo rinde peor con imágenes pequeñas, especialmente en tailandés).
- Salida en un único objeto JSON (lista de elementos dentro de un bloque de código `json`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización masiva de archivos administrativos en tailandés: el modelo convierte páginas escaneadas o fotografiadas en Markdown estructurado con bounding boxes, lo que permite reconstruir el layout original y alimentar sistemas de gestión documental.
- Extracción de tablas financieras: al formatear las tablas en HTML, se pueden integrar directamente en pipelines de extracción de datos y convertir después a CSV o bases de datos relacionales.
- Procesamiento de documentos técnicos y científicos: las fórmulas se devuelven en LaTeX, lo que facilita su reutilización en publicaciones, wikis o sistemas de gestión de conocimiento científico.
- Respuesta a preguntas sobre contratos o formularios: el modelo puede responder consultas sobre el contenido de una página concreta, útil en atención al cliente interna o en revisiones documentales.
- Extracción de campos clave en JSON: para automatizar la captura de datos de facturas, formularios o registros, generando salidas estructuradas que se validan y cargan en sistemas posteriores.
- Despliegue en local con llama.cpp: gracias a las cuantizaciones Q8_0 (2,01 GB) y Q4_K_M (1,27 GB), el modelo puede ejecutarse en estaciones de trabajo sin GPU de datacenter, con el servidor `llama-server` exponiendo una API compatible con OpenAI.
- Preprocesado de corpus bilingües tailandés-inglés: para proyectos de investigación que necesiten convertir documentos en texto estructurado antes de entrenar otros modelos o construir índices de búsqueda.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas en tailandés e inglés, digitales y fotografiadas), con decodificación greedy, thinking desactivado y presupuesto de imagen de 16.384 tokens:

| Archivo | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 79,8 | 81,3 |
| `typhoon-ocr2-2b-f16.gguf` | 16 bits, sin cuantizar | 3,78 GB | 79,5 | 80,8 |
| `typhoon-ocr2-2b-Q8_0.gguf` | 8 bits | 2,01 GB | 79,5 | 80,4 |
| `typhoon-ocr2-2b-Q4_K_M.gguf` | 4 bits (k-quant, medium) | 1,27 GB | 78,4 | 79,7 |
| `mmproj-typhoon-ocr2-2b-f16.gguf` | codificador de imagen (f16) | 668 MB | – | – |

Las diferencias de unas décimas entre archivos están dentro de la variación entre ejecuciones. La recomendación del autor es Q8_0, que iguala a f16 en precisión con aproximadamente la mitad de tamaño; Q4_K_M queda alrededor de un punto por debajo y se reserva para entornos con memoria ajustada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,78 GB para f16, 2,01 GB para Q8_0 y 1,27 GB para Q4_K_M, más 668 MB del codificador de imagen en f16 en todos los casos.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100 con CUDA; por tamaño, el modelo cabe holgadamente en GPUs de consumo como RTX 4090, RTX 4080 o RTX 3090, e incluso en GPUs con 8 GB de VRAM en cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes con al menos 6–8 GB de VRAM, según cuantización.
- Opciones de despliegue: llama.cpp mediante `llama-server` (build `a691b23` usada en los benchmarks), con endpoint compatible con la API de OpenAI; también herramientas construidas sobre llama.cpp. La versión original bf16 se sirve con vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; los benchmarks solo reportan precisión, no velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B GGUF (este) | 1,88 B | 40.960 tokens (config. recomendada) | th, en | Apache 2.0 (con OpenTyphoon T&C) | GGUF |
| Typhoon OCR V2 2B (original, bf16) | 1,88 B | no disponible | th, en | Apache 2.0 (con OpenTyphoon T&C) | safetensors (vLLM) |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de OCR o parsing de documentos (por ejemplo, alternativas de otros proveedores) que permitan una comparación de parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto fijo de prompts; para el parsing de página completa debe usarse exactamente el prompt documentado. Desviarse de él puede degradar la calidad de la salida.
- Rinde mal con imágenes pequeñas: es necesario ampliar la imagen para que su lado largo sea de al menos 1.600 píxeles antes de enviarla, especialmente con texto en tailandés.
- El modelo fue entrenado sin bloque de razonamiento; debe desactivarse el modo thinking (`--reasoning off`) para evitar que la plantilla de chat abra uno.
- La salida es un objeto JSON con bounding boxes en una rejilla 0–1000 relativa a la página; requiere parseo y validación en producción.
- Solo soporta tailandés e inglés; no hay evidencia de capacidades en otros idiomas.
- Riesgo de alucinación en la transcripción de texto: aunque el prompt exige que el texto de salida sea exactamente el original, sin traducción ni reescritura, no se documentan garantías formales al respecto.
- La licencia Apache 2.0 del repositorio está sujeta a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- No se documentan sesgos conocidos del modelo en la información disponible.
- El uso de `-c 40960` deja espacio para una imagen de 16.384 tokens y una respuesta de 16.384 tokens; para servir varias peticiones simultáneas hay que añadir `-np N` y multiplicar `-c` por N, lo que incrementa los requisitos de memoria.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b-GGUF
- Modelo base Typhoon OCR V2 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
