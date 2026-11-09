# typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16

## Resumen

Typhoon OCR V2 0.8B MLX bf16 es la conversión a formato MLX, en precisión bfloat16 sin cuantización, del modelo de visión-lenguaje Typhoon OCR V2 0.8B desarrollado por SCB 10X (Typhoon AI). Se trata de un parser de documentos especializado en tailandés e inglés que, dada la imagen de una página, devuelve sus elementos de maquetación en orden de lectura, cada uno con categoría, caja delimitadora (bounding box) y texto extraído. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto de texto como Markdown.

El modelo resuelve el problema del parseo estructurado de documentos en un idioma de bajos recursos como el tailandés, donde los OCR genéricos suelen fallar en la preservación de la estructura y en la fidelidad del texto. Además de la extracción de maquetación, responde preguntas sobre un documento y extrae información clave en formato JSON, lo que lo hace útil en pipelines de digitalización y extracción de datos.

Con 852.985.920 parámetros reales (aproximadamente 0,8 mil millones), un tamaño de repositorio de 1,7 GB y licencia Apache 2.0, es un modelo compacto pensado para ejecutarse en hardware Apple Silicon mediante MLX. Esta variante concreta está pensada para despliegue local en Macs, aunque las evaluaciones publicadas se realizaron sobre la build CUDA de MLX en una NVIDIA H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia qwen3_5), con codificador de imagen y decodificador de texto |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se recomienda `--max-tokens 16384` en inferencia) |
| Tipos de cuantizacion | bf16 sin cuantizar en este repo; existen variantes MLX de 8 bits (grupo 64) y 4 bits (grupo 64) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y de que se trata de un modelo de imagen-a-texto conversacional (pipeline `image-text-to-text`). El modelo base es `typhoon-ai/typhoon-ocr2-0.8b`, del que esta versión es una conversión directa a MLX con `mlx-vlm` en bfloat16, sin cuantización. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite al modelo base para los detalles de entrenamiento.

La innovación destacable de esta variante es operativa: la conversión a MLX permite ejecutar el modelo en hardware Apple Silicon con la librería `mlx-vlm`, manteniendo una precisión prácticamente idéntica a los pesos originales en vLLM (76,3 frente a 77,4 en MDPBench; 77,1 frente a 77,2 en MDPBench Thai). El modelo fue entrenado con un conjunto fijo de prompts, por lo que se recomienda usar exactamente el prompt de parseo de página completa documentado.

## Capacidades

- Parseo de maquetación de página completa: devuelve una lista JSON de elementos con `bbox` (rejilla 0–1000 relativa al ancho y alto de la página), categoría y texto, ordenados en orden de lectura humano.
- Categorías de maquetación soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Extracción de tablas en HTML y de fórmulas en LaTeX; el resto de texto en Markdown.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extracción de información clave en formato JSON.
- Procesamiento de imágenes de hasta 16,7 MP (16.777.216 píxeles) para mejorar la lectura de texto pequeño.
- Capacidades multilingües limitadas a tailandés e inglés.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte imágenes de páginas escaneadas en Markdown estructurado con tablas en HTML, lo que permite indexar el contenido en sistemas de búsqueda o RAG preservando la estructura original.
- Extracción de datos de facturas y formularios: mediante el modo de extracción JSON, se pueden obtener campos clave (importes, fechas, identificadores) de documentos con maquetación variable, usando el prompt de parseo y post-procesando la salida JSON.
- Procesamiento de documentación técnica con fórmulas: al emitir fórmulas en LaTeX, es adecuado para digitalizar manuales y artículos científicos en los que la fidelidad matemática es crítica.
- Pipeline de OCR local en Mac: gracias a la conversión MLX, se puede desplegar en un Mac con `mlx_vlm.server` y consumir mediante una API compatible con OpenAI, sin depender de servicios en la nube ni de GPUs dedicadas.
- Atención al cliente sobre documentos: el modelo responde preguntas sobre el contenido de una página, lo que permite construir asistentes que aclaren dudas sobre contratos, pólizas o manuales a partir de su imagen.
- Normalización de documentos bilingües tailandés-inglés: en entornos corporativos con documentación mixta, el modelo procesa ambos idiomas en una sola pasada sin necesidad de enrutar por idioma.
- Evaluación de calidad de digitalización: al devolver bounding boxes y categorías, se puede usar para detectar regiones mal reconocidas y priorizar la revisión humana.

## Benchmarks y rendimiento

Los resultados publicados corresponden a MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), con decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP, ejecutando `mlx_vlm.server` sobre la build CUDA de MLX en una NVIDIA H100.

| Pesos | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 77,4 | 77,2 |
| Este repo (bfloat16, sin cuantizar) | 1,73 GB | 76,3 | 77,1 |
| MLX 8 bits (affine, grupo 64) | 1,02 GB | 77,4 | 77,6 |
| MLX 4 bits (affine, grupo 64) | 645 MB | 67,6 | 64,3 |

El autor señala que las diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones y que no dispone de hardware Apple para validar las salidas en Mac (los pesos son los mismos, pero no se han comprobado las salidas). Recomienda la versión de 8 bits por su relación precisión/tamaño y desaconseja la de 4 bits para documentos en tailandés, cuya puntuación cae unos 13 puntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 1,73 GB en bf16, la variante de 8 bits 1,02 GB y la de 4 bits 645 MB.
- GPU recomendadas: el autor evaluó sobre NVIDIA H100 con la build CUDA de MLX; el destino natural de esta variante es Apple Silicon (MLX), si bien no se especifican modelos de chip concretos.
- ¿Cabe en GPU de consumo? No hay datos publicados al respecto; por tamaño de pesos (1,73 GB en bf16) es plausible en GPUs de consumo con memoria suficiente, pero no se confirma en la información disponible.
- Opciones de despliegue: `mlx-vlm` (servidor `mlx_vlm.server` con API compatible con OpenAI y uso en Python mediante `load`/`generate`); los pesos originales se sirven con vLLM.
- Ajustes de inferencia recomendados: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, temperatura 0,0 y thinking desactivado (no usar `--enable-thinking`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| typhoon-ocr2-0.8b-MLX-bf16 (este) | 852.985.920 | no disponible | 76,3 (thai 77,1) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, MLX |
| typhoon-ocr2-0.8b-MLX-8bit | mismo base | no disponible | 77,4 (thai 77,6) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, MLX |
| typhoon-ocr2-0.8b-MLX-4bit | mismo base | no disponible | 67,6 (thai 64,3) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, MLX |
| typhoon-ocr2-0.8b (original, bf16, vLLM) | mismo base | no disponible | 77,4 (thai 77,2) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, vLLM |

No se dispone en la información proporcionada de modelos comparables de otros autores para establecer una comparativa cruzada; las alternativas listadas son variantes del mismo modelo base.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto fijo de prompts; usar prompts distintos del documentado puede degradar la calidad del parseo.
- El thinking debe permanecer desactivado; activarlo no está previsto para este modelo.
- El `processor config` del repo limita las imágenes a 4 MP; es necesario pasar `--max-pixels 16777216` para leer con precisión texto pequeño.
- La versión de 4 bits pierde aproximadamente 13 puntos en tailandés (64,3 frente a 77,6 de la de 8 bits); no se recomienda para documentos en ese idioma.
- Solo soporta tailandés e inglés; otros idiomas no están cubiertos.
- Riesgo de alucinación y de errores de reconocimiento en documentos fotografiados o de baja calidad no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 va acompañada de los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- Las puntuaciones publicadas se obtuvieron en la build CUDA de MLX sobre H100 y no se han verificado las salidas en hardware Apple; el rendimiento real en Mac puede diferir.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Variante MLX 8 bits: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Variante MLX 4 bits: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
