# Suraponn/typhoon-ocr2-0.8b-MLX-bf16

## Resumen

Typhoon OCR V2 0.8B MLX bf16 es la conversión a formato MLX del modelo Typhoon OCR V2 0.8B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) especializado en tailandés e inglés. Dada una imagen de página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bbox) y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además, responde preguntas sobre un documento y extrae información clave en JSON.

Este repositorio concreto, publicado por el usuario Suraponn, contiene los pesos en bfloat16 sin cuantización, generados con mlx-vlm para su ejecución sobre el framework MLX de Apple. El modelo base cuenta con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y una arquitectura de tipo qwen3_5, según las etiquetas del repositorio. El tamaño del repo es de 1,7 GB.

La relevancia de esta ficha radica en que permite ejecutar un OCR estructurado de calidad en hardware Apple Silicon mediante MLX, con una pérdida de precisión mínima respecto a los pesos originales (76,3 frente a 77,4 en MDPBench global, y 77,1 frente a 77,2 en tailandés). Es una opción práctica para pipelines de digitalización de documentos en local, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (vision-language, image-text-to-text) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 sin cuantizar en este repo; existen variantes MLX de 8 bits y 4 bits del modelo base |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | apache-2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-language, etiquetado como qwen3_5, que procesa una imagen de página junto con un prompt de texto y genera una salida estructurada en JSON. La conversión a MLX se realizó con mlx-vlm en bfloat16 sin cuantización, manteniendo los pesos del modelo base typhoon-ai/typhoon-ocr2-0.8b.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; la model card remite a la model card principal del modelo base para esos datos. Una innovación destacable es el formato de salida: el modelo fue entrenado con un conjunto fijo de prompts y produce una lista JSON de elementos con bbox en una rejilla de 0 a 1000 relativa al ancho y alto de la página, categoría y texto formateado según el tipo de elemento. El modo "thinking" está desactivado por defecto y se recomienda mantenerlo así para este modelo.

## Capacidades

- Extracción de maquetación de documentos: devuelve elementos en orden de lectura con categoría (header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer), bbox y texto.
- Conversión de tablas a HTML y de fórmulas a LaTeX.
- Formateo del texto restante en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento de imágenes de hasta 16,7 MP (16.777.216 píxeles) para mejorar la lectura de texto pequeño.
- Soporte bilingüe tailandés-inglés.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Digitalización de documentos tailandeses en local: el modelo puede procesar imágenes de páginas y devolver la maquetación completa en JSON, lo que permite reconstruir el documento en Markdown o HTML sin enviar datos a servicios externos, gracias a su ejecución sobre MLX en hardware Apple.
- Extracción estructurada de tablas financieras: al emitir las tablas como HTML, se pueden integrar directamente en pipelines de parseo que conviertan ese HTML a DataFrames para análisis posterior.
- Procesamiento de formularios y documentos administrativos: la categoría "form" y la extracción JSON de información clave permiten automatizar la captura de datos de documentos escaneados.
- Preguntas y respuestas sobre documentos: el modelo responde consultas sobre el contenido de una página, útil para asistentes de consulta documental en inglés y tailandés.
- Digitalización de documentación técnica con fórmulas: la conversión de fórmulas a LaTeX facilita la reutilización de contenido científico o matemático en sistemas de documentación.
- OCR de documentos fotografiados: el soporte de imágenes de hasta 16,7 MP y la evaluación sobre páginas digitales y fotografiadas de MDPBench lo hacen adecuado para capturas con cámara, no solo escaneos limpios.
- Integración en servidores compatibles con OpenAI: mediante `mlx_vlm.server` se expone un endpoint `/v1` que permite conectar el modelo a aplicaciones existentes que ya usan la API de OpenAI.

## Benchmarks y rendimiento

| Pesos | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 77,4 | 77,2 |
| Este repo (bfloat16, sin cuantizar) | 1,73 GB | 76,3 | 77,1 |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit (8-bit affine, group size 64) | 1,02 GB | 77,4 | 77,6 |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit (4-bit affine, group size 64) | 645 MB | 67,6 | 64,3 |

MDPBench consta de 320 páginas en tailandés e inglés, tanto digitales como fotografiadas. Las evaluaciones MLX se ejecutaron con `mlx_vlm.server` (mlx 0.32.4, mlx-vlm 0.7.12), decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP, sobre una NVIDIA H100 con la build CUDA de MLX; no se verificaron las salidas en hardware Apple. Las diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB de pesos, más overhead de activaciones y del procesador de imágenes; el repo ocupa 1,7 GB.
- GPU recomendadas: el modelo está pensado para Apple Silicon mediante MLX; la evaluación se realizó en una NVIDIA H100 con la build CUDA de MLX.
- Cabe en GPUs de consumo: con 1,7 GB en bf16 es viable en cualquier GPU consumer con suficiente memoria para el procesamiento de imágenes de hasta 16,7 MP; la variante de 4 bits (645 MB) reduce aún más los requisitos.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI), API Python de mlx-vlm (`load`, `generate`), y los pesos originales con vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (MLX bf16) | 852.985.920 | no disponible | 76,3 (global) / 77,1 (tailandés) | apache-2.0 | Hugging Face, MLX |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit | 852.985.920 | no disponible | 77,4 / 77,6 | apache-2.0 | Hugging Face, MLX |
| typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit | 852.985.920 | no disponible | 67,6 / 64,3 | apache-2.0 | Hugging Face, MLX |
| typhoon-ai/typhoon-ocr2-0.8b (original, bf16, vLLM) | 852.985.920 | no disponible | 77,4 / 77,2 | apache-2.0 | Hugging Face, vLLM |

No se dispone de datos de otros modelos OCR comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye resultados de benchmarks propios más allá de MDPBench; no hay datos de MMLU, HumanEval, GSM8K ni similares.
- El modelo está entrenado con un conjunto fijo de prompts; para el parseo de página completa debe usarse el prompt exacto documentado, y desviarse de él puede degradar la salida.
- La variante de 4 bits pierde aproximadamente 13 puntos en tailandés (64,3 frente a 77,6 en 8 bits); se desaconseja para documentos en tailandés.
- Las evaluaciones MLX se realizaron en una H100 con la build CUDA de MLX, no en hardware Apple; el comportamiento en Mac no está verificado.
- El procesador del repo limita las imágenes a 4 MP por defecto; es necesario pasar `--max-pixels 16777216` para aprovechar la resolución completa.
- El uso del modelo está sujeto a los OpenTyphoon Terms and Conditions, además de la licencia apache-2.0.
- Solo se documentan tailandés e inglés; no hay evidencia de soporte para otros idiomas.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- El modo thinking debe permanecer desactivado; activarlo puede alterar el formato de salida esperado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b-MLX-bf16
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Variante MLX 8 bits: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Variante MLX 4 bits: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
