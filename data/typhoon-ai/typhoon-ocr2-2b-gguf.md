# typhoon-ai/typhoon-ocr2-2b-GGUF

## Resumen

Typhoon OCR V2 2B GGUF es la versión cuantizada en formato GGUF del modelo Typhoon OCR V2 2B, un parser de documentos multimodal desarrollado por SCB 10X (Typhoon AI) orientado a tailandés e inglés. Dado un imagen de una página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bounding box) y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además responde preguntas sobre un documento y extrae información clave en JSON.

El modelo original cuenta con 1.881.825.088 parámetros (aproximadamente 2B) y se distribuye bajo licencia Apache 2.0, aunque el uso está sujeto a los OpenTyphoon Terms and Conditions. Esta variante GGUF está pensada para llama.cpp y herramientas construidas sobre él, lo que permite ejecutar el modelo en servidores locales con backend CUDA y API compatible con OpenAI, sin depender de vLLM.

La relevancia de esta ficha radica en que ofrece una alternativa de OCR estructurado específicamente optimizada para tailandés, un idioma escasamente cubierto por los modelos OCR generalistas, con una degradación de precisión mínima al cuantizar: el fichero Q8_0 obtiene 79.5 en MDPBench frente a los 79.8 del modelo original en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; codificador de imagen separado en `mmproj`) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens recomendados en llama.cpp (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantización | f16, Q8_0, Q4_K_M (k-quant medium); codificador de imagen en f16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0, sujeta a OpenTyphoon Terms and Conditions |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del transformer, el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card remite a la ficha del modelo base (typhoon-ai/typhoon-ocr2-2b) para los detalles de entrenamiento, resultados completos de benchmarks, ejemplos y limitaciones.

Lo que sí se documenta es el diseño de inferencia: el modelo se sirve con un codificador de imagen independiente (`mmproj-typhoon-ocr2-2b-f16.gguf`, 668 MB) que debe acompañar a cada fichero de pesos. El presupuesto de imagen es de 16.384 tokens, equivalente a 16,7 MP, con un token de imagen por cada bloque de 32×32 píxeles. El modelo fue entrenado sin bloque de razonamiento (thinking), por lo que se recomienda desactivarlo en la plantilla de chat. El prompt de extracción es fijo y el modelo fue entrenado sobre un conjunto cerrado de prompts, lo que exige respetar el formato exacto para el parseo de página completa.

## Capacidades

- Parseo de documentos página completa: devuelve una lista JSON de elementos de maquetación en orden de lectura, cada uno con bbox, categoría y texto.
- Categorías de maquetación soportadas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote y footer.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto de texto se emite en Markdown.
- Coordenadas de bounding box en una rejilla normalizada de 0 a 1000 relativa al ancho y alto de la página.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento de páginas digitales y fotografías de páginas.
- Soporte bilingüe tailandés-inglés.
- API compatible con OpenAI a través de `llama-server`.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo extrae texto, tablas y sellos en orden de lectura, lo que permite convertir expedientes escaneados en Markdown y HTML estructurado para su indexación posterior.
- Extracción de tablas financieras: al emitir tablas como HTML, los resultados se pueden parsear directamente con librerías como BeautifulSoup o pandas.read_html sin postprocesado manual de la estructura.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX permite reconstruir ecuaciones de manuales y papers en entornos de publicación científica o wikis técnicas.
- Atención al cliente sobre facturas y recibos: combinado con el endpoint compatible con OpenAI, se puede integrar en un pipeline que reciba una imagen de factura y devuelva los campos clave en JSON para su validación automática.
- Digitalización de documentos fotografiados con móvil: el modelo está evaluado sobre páginas fotografiadas además de digitales, y el preprocesado documentado (escalar el lado largo a 1.600 píxeles como mínimo) mejora la lectura de texto pequeño, especialmente en tailandés.
- Construcción de bases de conocimiento RAG bilingües: el parseo estructurado con bboxes permite conservar la relación entre texto y posición en la página, útil para citar fragmentos con su ubicación original.
- Despliegue en hardware limitado: con Q4_K_M (1,27 GB) más el codificador de imagen (668 MB), el modelo se puede servir en entornos con poca VRAM manteniendo una precisión cercana a la del modelo original.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), ejecutados con `llama-server` (build a691b23, CUDA, NVIDIA H100), decodificación greedy, thinking desactivado y presupuesto de imagen de 16.384 tokens:

| Fichero | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 79.8 | 81.3 |
| `typhoon-ocr2-2b-f16.gguf` | 16-bit float | 3,78 GB | 79.5 | 80.8 |
| `typhoon-ocr2-2b-Q8_0.gguf` | 8-bit | 2,01 GB | 79.5 | 80.4 |
| `typhoon-ocr2-2b-Q4_K_M.gguf` | 4-bit k-quant medium | 1,27 GB | 78.4 | 79.7 |
| `mmproj-typhoon-ocr2-2b-f16.gguf` | codificador de imagen f16 | 668 MB | – | – |

El autor recomienda Q8_0 por igualar la puntuación de f16 con aproximadamente la mitad de tamaño. Q4_K_M pierde alrededor de un punto y se plantea como opción cuando la memoria es escasa. Las diferencias de unas décimas entre ficheros están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 1,27 GB de pesos más 668 MB del codificador de imagen (unos 2 GB en total, más el espacio de contexto); Q8_0 requiere unos 2,7 GB; f16 unos 4,4 GB.
- El contexto recomendado de 40.960 tokens añade memoria KV adicional; para servir varias peticiones simultáneas hay que añadir `-np N` y multiplicar `-c` por N.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100 con backend CUDA. El tamaño reducido permite también su uso en GPUs consumer, aunque no se han publicado cifras específicas para RTX 4090, RTX 3090 u otras.
- Despliegue: llama.cpp (`llama-server`) con `--jinja`, `--reasoning off`, `-c 40960`, `--image-max-tokens 16384` y `-ngl 999`; también es compatible con herramientas construidas sobre llama.cpp. La comparación de referencia con el modelo original se hizo con vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos OCR comparables (parámetros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa no está disponible. Como referencia interna, la única comparación documentada es entre las propias cuantizaciones del modelo y su versión original en bf16, recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- Solo soporta tailandés e inglés; no hay evidencia de rendimiento en otros idiomas.
- El modelo fue entrenado con un conjunto fijo de prompts; para parseo de página completa es necesario usar el prompt exacto documentado, lo que limita la flexibilidad de instrucciones.
- Requiere preprocesado obligatorio: ampliar la imagen para que el lado largo tenga al menos 1.600 píxeles; con imágenes pequeñas la lectura empeora, especialmente en tailandés.
- El modelo no fue entrenado con bloque de razonamiento; activar thinking puede degradar la salida.
- El límite de 16.384 tokens de imagen (16,7 MP) acota el tamaño máximo de página procesable con la configuración recomendada.
- La licencia es Apache 2.0, pero el uso está sujeto a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un despliegue comercial.
- No se han publicado en la información disponible datos sobre sesgos, tasas de alucinación ni evaluación de robustez frente a documentos degradados más allá de MDPBench.
- Los resultados de benchmarks corresponden a una única configuración de hardware (H100) y build de llama.cpp; el rendimiento en otros entornos puede variar.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
- llama.cpp: https://github.com/ggml-org/llama.cpp
