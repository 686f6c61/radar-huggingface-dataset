# Suraponn/typhoon-ocr2-2b-MLX-4bit

## Resumen

Typhoon OCR V2 2B MLX 4bit es una cuantización de 4 bits en formato MLX del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) para tailandés e inglés. El modelo base toma la imagen de una página y devuelve sus elementos de maquetación en orden de lectura, cada uno con categoría, bounding box y texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. También responde preguntas sobre un documento y extrae información estructurada como JSON.

Esta versión concreta la publica el usuario Suraponn y está pensada para ejecutarse con MLX, el framework de Apple para silicio propio, mediante mlx-vlm. Se trata de una cuantización afín de 4 bits con group size 64, que reduce el peso a 1,74 GB frente a los 4,45 GB del bf16. El modelo base declara 2.213.241.664 parámetros y una arquitectura etiquetada como qwen3_5 en los metadatos de Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa ligera para OCR estructurado en tailandés, un idioma con poca cobertura en modelos abiertos; por otro, advierte de un compromiso claro de precisión, ya que la cuantización a 4 bits degrada notablemente el rendimiento en tailandés frente a la versión de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos de Hugging Face); vision-language transformer para image-text-to-text |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | apache-2.0 (sujeta a OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX), 1,74 GB |

## Arquitectura y entrenamiento

El modelo base Typhoon OCR V2 2B es un modelo vision-language de tipo image-text-to-text orientado a parsing de documentos. Los metadatos lo etiquetan como qwen3_5, aunque la model card no detalla la arquitectura interna ni la composición del dataset de entrenamiento. El modelo está entrenado sobre un conjunto fijo de prompts y produce como salida un objeto JSON con una lista de elementos de maquetación, cada uno con bounding box en una rejilla de 0–1000 relativa al ancho y alto de la página, categoría y texto. Las categorías permitidas son header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote y footer.

La model card del repositorio cuantizado no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información se remite a la model card principal del modelo base. La innovación técnica relevante de esta publicación es la conversión a MLX con mlx-vlm, que permite ejecutar el modelo en Apple Silicon con cuantización afín de 4 bits y group size 64. El repositorio incluye además helpers de parseo y conversión a Markdown para manejar la salida JSON truncada por límite de tokens.

## Capacidades

- Parsing de maquetación de páginas completas: devuelve elementos en orden de lectura con categoría, bounding box y texto.
- Extracción de texto con formato: tablas en HTML, fórmulas en LaTeX y texto general en Markdown.
- Respuesta a preguntas sobre un documento (document QA).
- Extracción de información clave en formato JSON estructurado.
- Procesamiento de documentos tailandeses e ingleses, incluyendo páginas digitales y fotografías.
- Soporte de imágenes de hasta 16,7 MP cuando se configura `--max-pixels 16777216`, lo que mejora la lectura de texto pequeño.
- Inferencia con decodificación greedy y thinking desactivado (recomendado por el autor).
- Integración con servidor compatible con la API de OpenAI mediante `mlx_vlm.server`.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo extrae la maquetación completa de cada página con bounding boxes, lo que permite reconstruir el orden de lectura y separar encabezados, pies y notas al margen para su indexación posterior.
- Extracción de tablas financieras a HTML: dado que las tablas se emiten como HTML, se pueden integrar directamente en pipelines de extracción de datos estructurados sin post-procesado manual de celdas.
- Conversión de documentación técnica con fórmulas a Markdown y LaTeX: adecuado para digitalizar manuales y papers donde las fórmulas deben conservarse en formato matemático.
- Document QA sobre contratos o informes: el modelo responde preguntas concretas sobre el contenido de una página, útil para asistentes internos de consulta documental.
- Extracción de campos clave como JSON: permite alimentar sistemas de gestión documental con datos estructurados (fechas, importes, nombres) extraídos de facturas o formularios.
- Procesamiento en local en Mac con Apple Silicon: al estar en formato MLX y pesar 1,74 GB, se puede desplegar en un portátil Mac para OCR de documentos sin enviar datos a la nube, relevante por privacidad.
- Preprocesado para RAG multilingüe: la salida en Markdown con orden de lectura facilita trocear documentos tailandeses e ingleses antes de indexarlos en un sistema de recuperación.

## Benchmarks y rendimiento

| Pesos | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 79,8 | 81,3 |
| typhoon-ai/typhoon-ocr2-2b-MLX-bf16 (bfloat16) | 4,45 GB | 78,9 | 80,0 |
| typhoon-ai/typhoon-ocr2-2b-MLX-8bit (8-bit affine, group size 64) | 2,68 GB | 79,3 | 80,6 |
| **este repositorio** (4-bit affine, group size 64) | 1,74 GB | 73,3 | 70,5 |

Las puntuaciones se obtuvieron con `mlx_vlm.server` (mlx 0.32.4, mlx-vlm 0.7.12), decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP, sobre las 320 páginas tailandesas e inglesas de MDPBench. El autor indica que las pruebas se ejecutaron en la build Linux CUDA de MLX sobre una NVIDIA H100 por falta de hardware Apple, y que no ha verificado las salidas en Mac. La recomendación explícita del autor es usar la versión de 8 bits y evitar la de 4 bits para documentos en tailandés, donde la caída es de unos 10 puntos (70,5 frente a 80,6).

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del repositorio es de 1,74 GB; con overhead de activaciones y procesamiento de imágenes de hasta 16,7 MP, se requiere memoria adicional no cuantificada en la información disponible.
- GPU recomendadas: no se especifican; las pruebas del autor se hicieron en una NVIDIA H100 con la build CUDA de MLX.
- Cabe en GPU de consumo: el tamaño de pesos lo permite, pero no se han publicado mediciones en GPUs de consumo ni en Apple Silicon.
- Despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI) o la API Python de mlx-vlm (`load`, `generate`). Requiere `pip install -U mlx-vlm`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | MDPBench Thai | Licencia | Formato |
|---|---|---|---|---|---|---|
| Suraponn/typhoon-ocr2-2b-MLX-4bit | 2,21 B | no disponible | 73,3 | 70,5 | apache-2.0 | safetensors (MLX 4-bit) |
| typhoon-ai/typhoon-ocr2-2b-MLX-8bit | 2,21 B | no disponible | 79,3 | 80,6 | apache-2.0 | safetensors (MLX 8-bit) |
| typhoon-ai/typhoon-ocr2-2b-MLX-bf16 | 2,21 B | no disponible | 78,9 | 80,0 | apache-2.0 | safetensors (MLX bf16) |
| typhoon-ai/typhoon-ocr2-2b (original) | 2,21 B | no disponible | 79,8 | 81,3 | apache-2.0 | pesos originales (vLLM) |

No se dispone de comparación con modelos OCR de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la precisión: 73,3 en MDPBench global y 70,5 en tailandés, frente a 79,3 y 80,6 de la versión de 8 bits. El autor desaconseja explícitamente esta versión para documentos en tailandés.
- El modelo está entrenado sobre un conjunto fijo de prompts; para parsing de página completa debe usarse el prompt exacto documentado, lo que limita la flexibilidad de instrucciones.
- El repositorio limita las imágenes a 4 MP por defecto en el processor config; es necesario pasar `--max-pixels 16777216` para aprovechar su precisión en texto pequeño.
- Debe mantenerse el thinking desactivado; el autor lo recomienda explícitamente para este modelo.
- Los resultados de benchmarks se obtuvieron en la build CUDA de MLX sobre H100, no en Apple Silicon; el comportamiento en Mac no está verificado.
- Cobertura lingüística limitada a tailandés e inglés; no se declara soporte de otros idiomas.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia apache-2.0 está sujeta a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- El modelo es un parser de documentos, no un asistente general; su uso fuera de tareas de OCR y extracción estructurada no está validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b-MLX-4bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Versión MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-bf16
- Versión MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
