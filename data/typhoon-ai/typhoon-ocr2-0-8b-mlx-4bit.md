# typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit

## Resumen

Typhoon OCR V2 0.8B MLX 4bit es una versión cuantizada a 4 bits del modelo Typhoon OCR V2 0.8B, un parser de documentos especializado en tailandés e inglés desarrollado por Typhoon AI (SCB 10X). El modelo recibe la imagen de una página y devuelve sus elementos de maquetación en orden de lectura, cada uno con categoría, caja delimitadora (bbox) y texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. También responde preguntas sobre un documento y extrae información clave en formato JSON.

La conversión a MLX la realiza la propia organización mediante `mlx-vlm`, con cuantización afín de 4 bits y tamaño de grupo 64, lo que reduce el repositorio a 645 MB frente a los 1,73 GB del peso en bfloat16. Está pensada para ejecutarse en hardware Apple Silicon, aunque la evaluación publicada se realizó sobre la build CUDA de MLX en una NVIDIA H100.

La relevancia de esta variante es su tamaño: con 852.985.920 parámetros permite desplegar un OCR estructurado de calidad razonable en equipos de sobremesa. No obstante, el propio autor advierte que la cuantización a 4 bits degrada notablemente el rendimiento en tailandés (una caída de unos 13 puntos en MDPBench Thai) y recomienda la versión de 8 bits para documentos en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text), familia Qwen (tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuración de uso fija `max_tokens` de 16384 en generación) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (existen variantes MLX bf16 y 8-bit del mismo modelo base) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeta además a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX) |
| Libreria | mlx / mlx-vlm |
| Tamano del repo | 0,6 GB (645 MB de pesos) |
| Modelo base | typhoon-ai/typhoon-ocr2-0.8b |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Typhoon OCR V2 0.8B es un transformer multimodal de tipo image-text-to-text, etiquetado en Hugging Face dentro de la familia `qwen3_5`, con unos 853 millones de parámetros. La variante aquí descrita no reentrena el modelo: aplica una cuantización afín de 4 bits con tamaño de grupo 64 sobre los pesos originales y los convierte al formato MLX mediante `mlx-vlm`. La model card de esta versión remite a la del modelo base para los detalles de entrenamiento, la composición del dataset y los resultados completos de benchmarks, por lo que no se dispone aquí de datos sobre número de tokens, mezcla de datos ni si hubo RLHF o DPO.

La innovación funcional del modelo es la salida estructurada: se entrenó con un conjunto fijo de prompts y produce un único objeto JSON con una lista de elementos de maquetación, cada uno con `bbox` en una rejilla normalizada de 0 a 1000 relativa al ancho y alto de la página, `category` (entre header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote y footer) y `text` formateado según el tipo. El orden de los elementos sigue el orden de lectura humano. La decodificación recomendada es greedy (`temperature=0.0`) y con el modo "thinking" desactivado.

## Capacidades

- Parsing de maquetación de página completa: devuelve elementos con bbox, categoría y texto en orden de lectura.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto del texto se emite en Markdown.
- Extracción de texto fiel a la imagen, sin traducción ni reescritura (según el prompt de entrenamiento).
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extracción de información clave en formato JSON.
- Procesamiento de documentos digitales y de páginas fotografiadas.
- Soporte bilingüe tailandés-inglés.
- Entrada de imágenes de hasta 16,7 MP si se configura `max_pixels` en consecuencia (la configuración del procesador limita por defecto a 4 MP).
- Interfaz conversacional vía endpoint compatible con OpenAI en `mlx_vlm.server`.
- No se documenta soporte de tool calling, agentes ni otras modalidades (audio, vídeo).

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo devuelve la estructura de cada página (títulos, párrafos, tablas en HTML) en orden de lectura, lo que permite indexar el contenido en un buscador sin post-procesado manual de la maquetación.
- Extracción de tablas financieras a HTML: al emitir las tablas como HTML con bbox, se pueden recortar y convertir a CSV o DataFrame para pipelines de contabilidad o auditoría.
- Conversión de artículos científicos a Markdown con LaTeX: las fórmulas se devuelven en LaTeX y el texto en Markdown, lo que facilita alimentar repositorios de documentación técnica o bases de conocimiento.
- Document QA sobre contratos o facturas: con el prompt adecuado, el modelo responde preguntas concretas sobre el contenido de una imagen de página, útil en asistentes internos de consulta documental.
- Extracción de campos clave en JSON: para formularios o albaranes, se puede pedir la información estructurada y consumirla directamente en una API o base de datos.
- Procesamiento local en Mac: al estar en formato MLX y ocupar 645 MB, permite ejecutar OCR estructurado en un portátil Apple Silicon sin enviar documentos sensibles a la nube.
- Preprocesado para RAG: la salida en Markdown con orden de lectura sirve como paso previo de troceado (chunking) antes de indexar documentos escaneados en un sistema de recuperación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), con decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP:

| Pesos | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 77,4 | 77,2 |
| MLX bf16 (sin cuantizar) | 1,73 GB | 76,3 | 77,1 |
| MLX 8-bit (affine, group size 64) | 1,02 GB | 77,4 | 77,6 |
| MLX 4-bit (affine, group size 64), este repo | 645 MB | 67,6 | 64,3 |

Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4 con mlx-cuda-13, mlx-vlm 0.7.12) sobre la build CUDA de MLX en una NVIDIA H100, al no disponer el autor de hardware Apple. No se han verificado las salidas en Mac. El autor señala que diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 645 MB en disco; la inferencia requiere además memoria para activaciones y para la imagen (hasta 16,7 MP), por lo que conviene reservar varios GB adicionales según la resolución de entrada.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (M1/M2/M3/M4). La evaluación oficial se hizo en NVIDIA H100 con la build CUDA de MLX, pero no es el escenario de despliegue previsto.
- Cabe en GPU de consumo: sí, por tamaño de pesos; en Apple Silicon cabe en configuraciones con 8 GB o más de memoria unificada, aunque la resolución de imagen condiciona el consumo real.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI), la API Python de `mlx-vlm` (`load` + `generate`) y, para los pesos originales bf16, vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | MDPBench Thai | Licencia | Formato |
|---|---|---|---|---|---|---|
| typhoon-ocr2-0.8b-MLX-4bit (este) | 853 M | no disponible | 67,6 | 64,3 | Apache 2.0 + OpenTyphoon T&C | safetensors MLX 4-bit |
| typhoon-ocr2-0.8b-MLX-8bit | 853 M | no disponible | 77,4 | 77,6 | Apache 2.0 + OpenTyphoon T&C | safetensors MLX 8-bit |
| typhoon-ocr2-0.8b-MLX-bf16 | 853 M | no disponible | 76,3 | 77,1 | Apache 2.0 + OpenTyphoon T&C | safetensors MLX bf16 |
| typhoon-ocr2-0.8b (original, bf16) | 853 M | no disponible | 77,4 | 77,2 | Apache 2.0 + OpenTyphoon T&C | safetensors |

No se dispone en la información proporcionada de comparaciones con modelos OCR de otros fabricantes.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada el rendimiento: MDPBench cae de 77,4 (8-bit) a 67,6, y en tailandés de 77,6 a 64,3, unos 13 puntos menos. El autor recomienda evitar esta variante para documentos en tailandés y usar la de 8 bits.
- El modelo está entrenado con un conjunto fijo de prompts; para el parsing de página completa debe usarse el prompt exacto documentado, lo que limita la flexibilidad de instrucciones.
- El procesador limita las imágenes a 4 MP por defecto; hay que pasar `max_pixels=16777216` para leer texto pequeño con precisión, lo que aumenta el consumo de memoria.
- El modo "thinking" debe permanecer desactivado; activarlo puede alterar el formato de salida.
- Cobertura lingüística limitada a tailandés e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y de errores de transcripción en páginas con maquetación compleja o imágenes de baja calidad; el prompt exige texto literal, pero no hay garantía formal.
- Si la generación alcanza el límite de tokens, la salida JSON queda truncada; los helpers de la model card descartan el último elemento incompleto, pero se pierde contenido.
- La licencia Apache 2.0 va acompañada de los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- Las puntuaciones publicadas se obtuvieron en la build CUDA de MLX sobre H100, no en Apple Silicon; el comportamiento en Mac no ha sido verificado por el autor.
- No se documentan sesgos específicos ni evaluación de robustez más allá de MDPBench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Variante MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16
- Variante MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
