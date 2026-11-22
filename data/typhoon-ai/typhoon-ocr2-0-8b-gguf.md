# typhoon-ai/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR V2 0.8B es un modelo de visión-lenguaje especializado en el análisis y extracción de contenido de documentos, desarrollado por Typhoon AI (OpenTyphoon). Dado una imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bbox) y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto de texto como Markdown. Está entrenado específicamente para tailandés e inglés.

Esta ficha corresponde a la variante cuantizada en formato GGUF del modelo base `typhoon-ai/typhoon-ocr2-0.8b`, pensada para su uso con llama.cpp y herramientas construidas sobre él. El modelo base cuenta con 752.393.024 parámetros (aproximadamente 0,8B) y se distribuye con licencia Apache 2.0, aunque el uso está sujeto a los términos y condiciones de OpenTyphoon.

Su relevancia radica en que ofrece parsing de documentos de alta precisión en un tamaño muy reducido (529 MB en Q4_K_M, 812 MB en Q8_0), lo que permite desplegarlo en hardware modesto manteniendo un rendimiento cercano al de los pesos originales en bf16. Además de la extracción de maquetación, responde preguntas sobre un documento y extrae información clave en formato JSON.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; el repositorio no detalla la arquitectura interna) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 40.960 tokens en la configuración recomendada (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantización | f16, Q8_0, Q4_K_M (k-quant medium); imagen en f16 (mmproj) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (más encoder de imagen mmproj en f16) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna (tipo de transformer, composición del dataset o número de tokens de entrenamiento). La model card remite a la tarjeta del modelo base `typhoon-ai/typhoon-ocr2-0.8b` para los detalles de entrenamiento, los resultados completos de benchmarks, ejemplos y limitaciones.

Lo que sí se especifica es el diseño de la tarea: el modelo fue entrenado sobre un conjunto fijo de prompts para el parsing de páginas completas, devolviendo un objeto JSON con una lista de elementos de maquetación, cada uno con bbox (en una rejilla 0–1000 relativa al ancho y alto de la página), categoría y texto. Las categorías permitidas son `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote` y `footer`. El modelo se entrenó sin bloque de razonamiento (thinking), por lo que se recomienda desactivarlo en la plantilla de chat. La resolución de imagen es un factor crítico: un token de imagen cubre 32×32 píxeles, y se recomienda ampliar la página para que su lado largo alcance al menos 1.600 píxeles.

## Capacidades

- Extracción de maquetación de documentos: devuelve elementos en orden de lectura con bbox, categoría y texto.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto de texto en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento de documentos digitales y fotografías de páginas.
- Soporte bilingüe tailandés-inglés.
- Integración con llama.cpp mediante endpoint compatible con la API de OpenAI.
- No se menciona soporte de tool calling, agentes ni otras capacidades especiales más allá de las descritas.

## Casos de uso

- Digitalización de archivos en tailandés: convertir lotes de páginas escaneadas o fotografiadas en Markdown estructurado, preservando el orden de lectura y la jerarquía de títulos, gracias a su manejo específico del tailandés.
- Extracción de tablas financieras: transformar tablas de facturas o informes en HTML parseable para su posterior carga en bases de datos, aprovechando la salida HTML nativa para la categoría `table`.
- Procesamiento de documentación técnica con fórmulas: convertir fórmulas matemáticas a LaTeX para su uso en publicaciones o wikis, manteniendo el texto circundante en Markdown.
- Enriquecimiento de pipelines RAG: usar el modelo como etapa de parsing previa a la indexación, generando Markdown limpio y con estructura de maquetación a partir de PDF convertidos a imagen.
- Extracción de metadatos en JSON: obtener información clave de documentos (campos, cabeceras, notas al pie) en formato JSON estructurado para automatizar flujos administrativos.
- Preguntas y respuestas sobre documentos: consultar el contenido de una página concreta sin necesidad de un pipeline OCR separado, útil en asistentes documentales bilingües.
- Despliegue en hardware de gama baja: servir el modelo en Q4_K_M (529 MB) o Q8_0 (812 MB) en entornos con recursos limitados, manteniendo una precisión cercana a los pesos originales.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas en tailandés e inglés, digitales y fotografiadas), ejecutados con `llama-server` (build `a691b23`, CUDA, NVIDIA H100), decodificación greedy, thinking desactivado y presupuesto de imagen de 16.384 tokens (16,7 MP):

| Archivo | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 77,4 | 77,2 |
| `typhoon-ocr2-0.8b-f16.gguf` | 16-bit float, sin cuantización | 1,52 GB | 77 | 76,9 |
| `typhoon-ocr2-0.8b-Q8_0.gguf` | 8-bit | 812 MB | 77,4 | 78 |
| `typhoon-ocr2-0.8b-Q4_K_M.gguf` | 4-bit (k-quant, medium) | 529 MB | 75,8 | 76,7 |
| `mmproj-typhoon-ocr2-0.8b-f16.gguf` | encoder de imagen (f16), necesario con todos los archivos anteriores | 205 MB | | |

El autor recomienda Q8_0, que iguala la puntuación de f16 y de los pesos originales (77,4) con aproximadamente la mitad del tamaño de f16. Q4_K_M queda unas 1,5 décimas por debajo en la media. Las diferencias de unas pocas décimas entre archivos están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de archivo, Q4_K_M (529 MB) y Q8_0 (812 MB) son aptos para GPUs de consumo; el encoder de imagen añade 205 MB.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100 con CUDA; no se especifican otras GPU recomendadas.
- Cabe en GPU de consumo: sí, dado el tamaño de los archivos cuantizados (por debajo de 1 GB en Q4_K_M y Q8_0), aunque no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-server`) con endpoint compatible con la API de OpenAI; los pesos originales en bf16 se sirven con vLLM.
- Configuración recomendada: `--jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999`; para varias peticiones concurrentes, añadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables de parsing de documentos con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para tailandés e inglés; otros idiomas no están soportados de forma declarada.
- Lee mal las imágenes pequeñas, especialmente el texto en tailandés: es obligatorio ampliar la página para que el lado largo alcance al menos 1.600 píxeles.
- El modelo fue entrenado con un conjunto fijo de prompts; para el parsing de página completa debe usarse el prompt exactamente como se especifica en la model card.
- Se entrenó sin bloque de razonamiento; debe desactivarse el thinking en la plantilla de chat (`--reasoning off`).
- La cuantización Q4_K_M reduce la precisión en torno a 1,5 décimas en MDPBench respecto a Q8_0/f16.
- Riesgo de alucinación: no cuantificado en la información disponible; el prompt exige que el texto de salida sea exactamente el original, sin traducción ni reescritura.
- Licencia Apache 2.0, pero el uso está sujeto a los OpenTyphoon Terms and Conditions, que deben revisarse para uso comercial.
- Sesgos conocidos: no disponibles en la información proporcionada.
- No se detallan limitaciones adicionales de producción más allá de las indicadas; la model card remite a la del modelo base para las limitaciones completas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
