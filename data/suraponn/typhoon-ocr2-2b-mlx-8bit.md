# Suraponn/typhoon-ocr2-2b-MLX-8bit

## Resumen

Typhoon OCR V2 2B MLX 8bit es la conversión a formato MLX (8 bits, cuantización afín con grupo de tamaño 64) del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) para tailandés e inglés. El modelo original se distribuye en `typhoon-ai/typhoon-ocr2-2b`; esta versión, publicada por el usuario Suraponn, mantiene la licencia Apache 2.0 y está pensada para ejecución en Apple Silicon mediante la librería `mlx-vlm`.

El modelo resuelve el problema de extracción estructurada de contenido a partir de imágenes de páginas: dada una imagen, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su *bounding box* en una rejilla normalizada de 0 a 1000 y su texto. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto de texto como Markdown. Además, responde preguntas sobre el documento y extrae información clave en JSON.

Es relevante porque ofrece un parser de documentos especializado en tailandés (idioma con escasa cobertura en modelos OCR open source) con un tamaño contenido de 2.213.241.664 parámetros (~2,2 B) y una ventana de contexto no especificada en la información disponible. La versión de 8 bits ocupa 2,68 GB y, según la model card, iguala prácticamente la precisión de los pesos bf16 con la mitad de tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 2.213.241.664 (~2,2 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín, group size 64 (esta versión); existen variantes MLX bf16 y MLX 4 bits del modelo base |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeta a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX), repositorio de 2,7 GB; pesos de 2,68 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de las etiquetas del repositorio, que lo clasifican como `qwen3_5` y `image-text-to-text`, es decir, un transformer multimodal que procesa imágenes y texto. Esta versión concreta es una cuantización: los pesos originales en bf16 se han convertido a MLX con cuantización afín de 8 bits y grupo de tamaño 64, lo que reduce el tamaño del repositorio a 2,68 GB frente a los 4,45 GB de la variante MLX bf16.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card remite a la ficha del modelo original (`typhoon-ai/typhoon-ocr2-2b`) para los detalles de entrenamiento, benchmarks completos y limitaciones. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Parsing de documentos página completa: extrae elementos de maquetación en orden de lectura con categoría, *bounding box* y texto.
- Categorías de maquetación soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto de texto se emite en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Salida estructurada como objeto JSON único con lista de elementos.
- Procesamiento de imágenes digitales y fotografías de páginas (según el conjunto de evaluación MDPBench).
- Soporte de imágenes de hasta 16,7 MP cuando se configura `--max-pixels 16777216`.
- Idiomas: tailandés e inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte imágenes de páginas escaneadas en Markdown estructurado con tablas en HTML y fórmulas en LaTeX, lo que permite indexar el contenido en sistemas de búsqueda o bases de datos documentales.
- Extracción de datos de facturas y formularios: mediante el modo de extracción JSON, se pueden obtener campos clave de documentos con maquetación variable, usando las *bounding boxes* para localizar cada campo en la página.
- Construcción de pipelines RAG sobre PDFs: el parser genera Markdown limpio y ordenado por orden de lectura, adecuado para trocear y vectorizar documentos antes de alimentar un sistema de recuperación.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX para fórmulas y en HTML para tablas facilita la conversión posterior a HTML o a formatos científicos sin pérdida de estructura.
- Atención al cliente sobre documentación: el modelo puede responder preguntas concretas sobre el contenido de una página o un conjunto de páginas, útil en portales de soporte que reciben documentos de usuarios.
- Ejecución local en Apple Silicon: al estar en formato MLX, permite desplegar el parser en portátiles Mac sin GPU dedicada, útil para procesar documentos sensibles sin enviarlos a la nube.
- Preprocesado de corpus bilingües tailandés-inglés: para proyectos de investigación que necesiten texto alineado extraído de documentos con ambas lenguas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MDPBench (320 páginas en tailandés e inglés, digitales y fotografiadas), con decodificación greedy, *thinking* desactivado e imágenes de hasta 16,7 MP:

| Pesos | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 79,8 | 81,3 |
| MLX bf16 (sin cuantizar) | 4,45 GB | 78,9 | 80,0 |
| **Esta versión (8 bits afín, grupo 64)** | 2,68 GB | 79,3 | 80,6 |
| MLX 4 bits (afín, grupo 64) | 1,74 GB | 73,3 | 70,5 |

Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4, mlx-vlm 0.7.12) sobre la build CUDA de MLX en una NVIDIA H100, no en hardware Apple. El autor indica que las diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de 8 bits ocupan 2,68 GB; con overhead de activaciones y procesamiento de imágenes de hasta 16,7 MP, se recomienda al menos 6-8 GB de memoria unificada o VRAM.
- GPU recomendadas: el autor validó el modelo en una NVIDIA H100 con la build CUDA de MLX; en el ecosistema MLX el objetivo natural es Apple Silicon (M1/M2/M3/M4 con memoria unificada).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) y en Mac con 8 GB o más de memoria unificada.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI) y la API Python de `mlx-vlm`; los pesos originales pueden servirse con vLLM.
- Configuración recomendada: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, temperatura 0,0 y *thinking* desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B MLX 8bit (esta ficha) | ~2,2 B | no disponible | 79,3 | Apache 2.0 | MLX safetensors 8 bits |
| typhoon-ai/typhoon-ocr2-2b-MLX-bf16 | ~2,2 B | no disponible | 78,9 | Apache 2.0 | MLX safetensors bf16 |
| typhoon-ai/typhoon-ocr2-2b-MLX-4bit | ~2,2 B | no disponible | 73,3 | Apache 2.0 | MLX safetensors 4 bits |
| typhoon-ai/typhoon-ocr2-2b (original) | ~2,2 B | no disponible | 79,8 | Apache 2.0 | safetensors bf16 (vLLM) |

No se dispone de datos de benchmarks de otros modelos OCR comparables en la información proporcionada.

## Limitaciones y advertencias

- La versión de 4 bits pierde aproximadamente 10 puntos en tailandés (70,5 frente a 80,6 de 8 bits); el autor desaconseja su uso para documentos en tailandés.
- El *processor config* del repositorio limita las imágenes a 4 MP por defecto; es necesario pasar `--max-pixels 16777216` para leer texto pequeño con precisión.
- El modelo fue entrenado con un conjunto fijo de prompts; para el parsing de página completa debe usarse el prompt exacto documentado, lo que limita la flexibilidad de instrucciones.
- El modelo solo soporta tailandés e inglés; no se documenta cobertura de otros idiomas.
- Las puntuaciones MLX se obtuvieron en la build CUDA de MLX sobre H100, no en hardware Apple; el autor no ha verificado las salidas en Mac.
- El uso está sujeto a los OpenTyphoon Terms and Conditions además de la licencia Apache 2.0; conviene revisarlos antes de un uso comercial.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de extracción, el riesgo principal es la omisión o deformación de texto en documentos de baja calidad.
- No se dispone de información sobre la longitud de contexto máxima, lo que dificulta planificar el procesamiento de documentos muy extensos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b-MLX-8bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Variante MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-bf16
- Variante MLX 4 bits: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-4bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
