# yangsu0423/PaddleOCR-VL-1.6-ov

## Resumen

PaddleOCR-VL-1.6-ov es una exportación a formato OpenVINO del modelo PaddleOCR-VL-1.6, desarrollado originalmente por PaddlePaddle (Baidu) y convertido por el usuario yangsu0423. Se trata de un modelo de tipo imagen-a-texto (image-text-to-text) orientado a tareas de reconocimiento óptico de caracteres (OCR) y comprensión de documentos, que combina un codificador visual con un modelo de lenguaje para transcribir y razonar sobre el contenido de imágenes de páginas documentales.

La relevancia de esta variante concreta reside en su formato: los pesos están exportados mediante OpenVINO (a través de un PR en borrador de optimum-intel) y comprimidos con cuantización NF4 por canal con estimación de escala y precisión mixta (`--ratio 0.9 --backup-precision int8_sym`), calibrada sobre páginas de documentos OCR. Según la model card, esta configuración está recomendada para ejecución en NPU.

Es importante señalar que, en el momento de la publicación, la versión estable publicada de OpenVINO GenAI todavía no soporta la arquitectura `paddleocr_vl`; el modelo requiere los PRs en borrador indicados por el autor. El repositorio ocupa 4,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multimodal imagen-a-texto (codificador visual + modelo de lenguaje); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 por canal con estimación de escala y precisión mixta (`--ratio 0.9 --backup-precision int8_sym`); también se menciona int8 simétrico como precisión de respaldo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO (exportado con optimum-intel); no se indica GGUF ni safetensors |
| Modelo base | PaddlePaddle/PaddleOCR-VL-1.6 |
| Tamano del repositorio | 4,5 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base PaddleOCR-VL-1.6 más allá de su naturaleza multimodal imagen-a-texto. Por el nombre y la categoría, se trata de un modelo de visión-lenguaje especializado en OCR y comprensión de documentos, con un codificador de imagen acoplado a un decodificador de texto. No se dispone de datos sobre número de parámetros, tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta variante es el proceso de exportación y compresión: los pesos se convierten a OpenVINO mediante un PR en borrador de optimum-intel y se ejecutan con un PR en borrador de openvino.genai. La compresión NF4 por canal con estimación de escala y la mezcla de precisión (ratio 0,9 con respaldo int8 simétrico), calibrada específicamente sobre páginas de documentos OCR, buscan reducir el peso del modelo manteniendo la fidelidad en la transcripción de texto.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Conversión de imagen a texto estructurado (pipeline image-text-to-text).
- Comprensión de documentos: interpretación del contenido visual de páginas y su transcripción.
- Ejecución optimizada en hardware Intel mediante OpenVINO, incluida NPU con la cuantización recomendada.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio o modo thinking: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Digitalización de archivos documentales: el modelo puede procesar imágenes de páginas escaneadas y transcribir su contenido a texto, gracias a su naturaleza image-text-to-text especializada en OCR.
- Extracción de datos en flujos de facturación: integrado en un pipeline que recibe imágenes de facturas y devuelve el texto para su posterior parseo y validación.
- Procesamiento en el borde con NPU Intel: la cuantización NF4 recomendada para NPU permite desplegar el modelo en equipos con aceleradores Intel sin depender de GPU dedicadas.
- Automatización de archivo y clasificación documental: el texto extraído puede alimentar sistemas de indexación o búsqueda sobre grandes volúmenes de documentos escaneados.
- Preprocesado para RAG sobre documentos físicos: la transcripción OCR generada puede servir como entrada para pipelines de recuperación aumentada sobre corpus que originalmente solo existen en papel.
- Validación de calidad de digitalizaciones: comparar la salida del modelo con el texto esperado para detectar páginas mal escaneadas o ilegibles en un proceso de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 4,5 GB, lo que da una cota superior aproximada del peso en disco de los pesos comprimidos.
- GPU recomendadas: no disponibles en la información proporcionada.
- Ejecución en NPU: la cuantización `nf4-cw-se-r0.9` está recomendada explícitamente para NPU según el autor.
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio (4,5 GB) es compatible con GPUs de consumo de gama media-alta, pero no se aportan datos de VRAM en ejecución.
- Opciones de despliegue: OpenVINO GenAI con los PRs en borrador indicados (openvino.genai#4514); la versión estable publicada de OpenVINO GenAI no soporta aún `paddleocr_vl`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La versión estable publicada de OpenVINO GenAI no soporta la arquitectura `paddleocr_vl`; es necesario aplicar los PRs en borrador de optimum-intel y openvino.genai, lo que implica riesgo de inestabilidad y cambios de API.
- Al ser una exportación de un tercero (yangsu0423) y no del equipo original de PaddlePaddle, no hay garantía de paridad de comportamiento con el modelo base.
- La cuantización NF4 con precisión mixta puede degradar la fidelidad del OCR en documentos con tipografías complejas, tablas densas o imágenes de baja calidad; no se han publicado evaluaciones al respecto.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base PaddlePaddle/PaddleOCR-VL-1.6 antes de un uso comercial en producción.
- El modelo está especializado en OCR y comprensión de documentos; no debe asumirse un rendimiento generalista en otras tareas de visión-lenguaje.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yangsu0423/PaddleOCR-VL-1.6-ov
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- PR de exportación en optimum-intel: https://github.com/huggingface/optimum-intel/pull/2013
- PR de ejecución en openvino.genai: https://github.com/openvinotoolkit/openvino.genai/pull/4514
