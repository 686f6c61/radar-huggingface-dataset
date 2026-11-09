# typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit

## Resumen

Typhoon OCR V2 0.8B MLX 8bit es una conversión cuantizada a 8 bits del modelo de reconocimiento óptico de caracteres y análisis de documentos Typhoon OCR V2 0.8B, desarrollado por el equipo de Typhoon AI (OpenTyphoon). El modelo original es un parser de documentos centrado en tailandés e inglés: dada la imagen de una página, devuelve sus elementos de maquetación en orden de lectura, cada uno con una categoría, un *bounding box* y su texto, además de responder preguntas sobre el documento y extraer información clave en JSON.

Esta variante concreta está empaquetada para MLX, la librería de cómputo tensorial de Apple para silicio propio, mediante mlx-vlm, con cuantización afín de 8 bits y tamaño de grupo 64. Con 852.985.920 parámetros totales y un repositorio de 1,0 GB, el objetivo es ejecutar OCR de documentos en Mac con una pérdida de precisión prácticamente nula respecto a los pesos en bf16. Es relevante porque demuestra que la cuantización a 8 bits puede mantener la calidad del modelo original (e incluso superarla ligeramente en las métricas publicadas) reduciendo el peso a la mitad.

La ficha se centra en esta conversión MLX; los detalles de entrenamiento, benchmarks completos y limitaciones del modelo base se remiten a la model card del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `qwen3_5`; vision-language transformer de imagen a texto) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit afín (affine), group size 64; existen variantes bf16 y 4-bit del mismo modelo |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | apache-2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base es un parser de documentos de tipo visión-lenguaje que recibe una imagen de página y genera una salida estructurada en JSON: una lista de elementos de maquetación, cada uno con `bbox` (en una rejilla de 0–1000 relativa al ancho y alto de la página), categoría y texto. Las categorías permitidas incluyen `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote` y `footer`. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. El modelo se entrenó con un conjunto fijo de prompts, por lo que la model card insiste en usar el prompt de análisis de página exactamente como se proporciona.

Esta variante MLX 8bit se ha generado con mlx-vlm aplicando cuantización afín de 8 bits con tamaño de grupo 64. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO; esos datos deben consultarse en la model card del modelo base. La innovación destacable de esta conversión es la preservación de la precisión: según la model card, los pesos 8-bit obtienen 77,4 en MDPBench y 77,6 en MDPBench Thai, frente a 77,4 y 77,2 de los pesos originales en bf16 con vLLM, a aproximadamente la mitad del tamaño.

## Capacidades

- Análisis de maquetación de páginas completas: devuelve elementos en orden de lectura con categoría, bbox y texto.
- Extracción de texto con formato específico por categoría: Markdown para texto y títulos, HTML para tablas, LaTeX para fórmulas.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento de documentos digitales y fotografiados.
- Soporte bilingüe tailandés-inglés.
- Procesamiento de imágenes de alta resolución: la evaluación se realizó con imágenes de hasta 16,7 MP (16.777.216 píxeles) para mejorar la lectura de texto pequeño.
- Modo *thinking* desactivado por defecto en mlx-vlm; la model card recomienda mantenerlo desactivado para este modelo.
- No se documentan en la información disponible capacidades de *tool calling*, agentes o audio.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa páginas escaneadas o fotografiadas y devuelve el texto en orden de lectura con sus regiones delimitadas, lo que permite reconstruir el documento y conservar la estructura para su indexación.
- Extracción de tablas financieras a HTML: al emitir las tablas como HTML, los pipelines posteriores pueden parsearlas directamente sin necesidad de un modelo tabular adicional, útil en informes y estados de cuenta bilingües.
- Conversión de documentación técnica con fórmulas a Markdown y LaTeX: adecuado para papers y manuales con ecuaciones, ya que las fórmulas se emiten en LaTeX listo para renderizar.
- Preguntas y respuestas sobre documentos (document QA): con el mismo modelo se pueden formular preguntas sobre una página concreta, útil en atención al usuario o en sistemas de consulta de contratos y normativas.
- Extracción estructurada de datos a JSON: permite obtener campos clave (por ejemplo, de facturas o formularios) en un formato consumible por sistemas downstream.
- Procesamiento local en Mac: al estar empaquetado para MLX, permite ejecutar OCR de documentos en un Mac sin enviar imágenes a servicios externos, lo que resulta relevante por privacidad y coste.
- Enriquecimiento de corpus para RAG: la salida estructurada con bboxes y formato por categoría facilita trocear documentos y conservar referencias espaciales en sistemas de recuperación aumentada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MDPBench (320 páginas en tailandés e inglés, digitales y fotografiadas), con decodificación greedy, *thinking* desactivado e imágenes de hasta 16,7 MP:

| Pesos | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 77,4 | 77,2 |
| MLX bf16 (sin cuantización) | 1,73 GB | 76,3 | 77,1 |
| **Esta versión (8-bit afín, group size 64)** | 1,02 GB | 77,4 | 77,6 |
| MLX 4-bit (afín, group size 64) | 645 MB | 67,6 | 64,3 |

Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4, mlx-cuda-13; mlx-vlm 0.7.12) sobre una NVIDIA H100 con la build CUDA de MLX en Linux, ya que el equipo no dispone de hardware Apple para la evaluación. Los pesos son los mismos en un Mac, pero la model card indica que no se han verificado las salidas en esa plataforma. Las diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,0 GB (pesos 8-bit de 1,02 GB), por lo que el consumo de memoria debe situarse en ese orden más las activaciones y el procesador de visión, sin cifra publicada.
- GPU recomendadas: la evaluación se realizó en una NVIDIA H100 con la build CUDA de MLX; en el ecosistema Apple, el destino natural es silicio Apple (M-series) mediante MLX.
- Cabe en GPU de consumo: no se han publicado requisitos mínimos; por tamaño de pesos (≈1 GB) es plausible en GPUs con varios GB de memoria, pero no hay confirmación en la información disponible.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI) y la API Python de mlx-vlm (`load`, `generate`). Para los pesos originales, vLLM. No se documentan opciones llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.
- Configuración recomendada: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, ya que el procesador del repositorio limita las imágenes a 4 MP por defecto y el texto pequeño se lee con más precisión a 16,7 MP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench | Licencia | Formato |
|---|---|---|---|---|---|
| typhoon-ocr2-0.8b-MLX-8bit (este) | 852.985.920 | no disponible | 77,4 / 77,6 (thai) | apache-2.0 (sujeto a ToC de OpenTyphoon) | safetensors MLX |
| typhoon-ocr2-0.8b-MLX-bf16 | 852.985.920 | no disponible | 76,3 / 77,1 (thai) | apache-2.0 (sujeto a ToC de OpenTyphoon) | safetensors MLX |
| typhoon-ocr2-0.8b-MLX-4bit | 852.985.920 | no disponible | 67,6 / 64,3 (thai) | apache-2.0 (sujeto a ToC de OpenTyphoon) | safetensors MLX |
| typhoon-ocr2-0.8b (original, bf16) | 852.985.920 | no disponible | 77,4 / 77,2 (thai) | apache-2.0 (sujeto a ToC de OpenTyphoon) | safetensors (vLLM) |

No se dispone en la información proporcionada de comparaciones con modelos OCR de otros autores.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto fijo de prompts; la model card exige usar el prompt de análisis de página exactamente como se proporciona. Desviarse de él puede degradar la salida.
- La variante 4-bit pierde aproximadamente 13 puntos en tailandés (64,3 frente a 77,6 del 8-bit); la model card desaconseja el 4-bit para documentos en tailandés. Se recomienda el 8-bit.
- El procesador del repositorio limita las imágenes a 4 MP por defecto; sin ajustar `--max-pixels` a 16,7 MP se pierde precisión en texto pequeño.
- Las puntuaciones MLX se obtuvieron en Linux/CUDA sobre H100; no se han verificado las salidas en hardware Apple, aunque los pesos son idénticos.
- Cobertura lingüística limitada a tailandés e inglés; no se documentan otros idiomas.
- El uso está sujeto a los OpenTyphoon Terms and Conditions, además de la licencia apache-2.0; conviene revisar dichos términos antes de un uso comercial.
- No se dispone de información sobre sesgos, tasas de alucinación ni robustez frente a documentos degradados en la información proporcionada.
- El modo *thinking* debe permanecer desactivado; activarlo puede alterar el formato de salida esperado.
- La salida puede truncarse al alcanzar el límite de tokens; la model card proporciona un helper que descarta el último elemento incompleto del JSON.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Variante MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16
- Variante MLX 4-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit
- MLX (repositorio): https://github.com/ml-explore/mlx
- mlx-vlm (repositorio): https://github.com/Blaizzy/mlx-vlm
- Términos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
