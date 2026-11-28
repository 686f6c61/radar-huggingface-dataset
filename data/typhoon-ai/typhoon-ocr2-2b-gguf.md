# typhoon-ai/typhoon-ocr2-2b-GGUF

## Resumen

Typhoon OCR V2 2B es un modelo de visión-lenguaje especializado en el análisis y extracción de contenido de documentos, desarrollado por SCB 10X (equipo Typhoon). Dada una imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bbox) y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Está optimizado para tailandés e inglés, y resuelve el problema del parseo estructurado de documentos en un idioma con poca cobertura en los modelos OCR convencionales.

El modelo base tiene 1.881.825.088 parámetros (aproximadamente 1,9 mil millones) y es de tipo imagen-texto-a-texto, con un codificador visual independiente que en esta distribución GGUF se sirve como archivo `mmproj` en precisión f16. Esta ficha cubre la versión cuantizada en GGUF, publicada para llama.cpp y las herramientas construidas sobre él, con cuatro variantes de peso (f16, Q8_0, Q4_K_M) más el codificador de imagen.

La relevancia actual radica en que ofrece un pipeline OCR completo (detección de maquetación, reconocimiento, tablas y fórmulas) en un tamaño que cabe en GPUs de consumo, con una pérdida de precisión mínima respecto a los pesos originales en bf16 servidos con vLLM: Q8_0 iguala prácticamente al original en MDPBench (79,5 frente a 79,8). La licencia Apache 2.0 del repositorio convive con los términos de uso de OpenTyphoon, que hay que revisar para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal imagen-texto-a-texto (codificador visual + modelo de lenguaje); detalles completos en el informe técnico arXiv:2611.27494 |
| Parametros totales | 1.881.825.088 (aprox. 1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens en la configuración recomendada de llama.cpp (16.384 para imagen + 16.384 para respuesta); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | f16 (sin cuantización), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium); codificador visual en f16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (llama.cpp); pesos originales en bf16 para vLLM en el modelo base |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal de tipo imagen-texto-a-texto: un codificador de imagen procesa la página y el modelo de lenguaje genera una secuencia JSON con los elementos de maquetación. La salida incluye, por cada elemento, su bbox en una rejilla normalizada de 0 a 1000 relativa al ancho y alto de la página, su categoría (entre 13 posibles: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`) y el texto extraído con el formato correspondiente (HTML para tablas, LaTeX para fórmulas, Markdown para el resto).

El modelo fue entrenado con un conjunto fijo de prompts y sin bloque de razonamiento (thinking), por lo que la plantilla de chat no debe abrir uno. Los detalles de entrenamiento, composición del dataset y metodología de evaluación se documentan en el informe técnico arXiv:2611.27494; esta ficha no dispone de esos datos más allá de lo indicado. Una innovación destacable es el presupuesto de tokens de imagen: cada token de imagen cubre 32×32 píxeles, y con `--image-max-tokens 16384` una página puede usar hasta 16,7 MP, lo que preserva la legibilidad de texto pequeño.

## Capacidades

- Análisis de maquetación de página completa: devuelve los elementos en orden de lectura con categoría, bbox y texto.
- Extracción de texto con formato: Markdown para texto general, HTML para tablas y LaTeX para fórmulas.
- Detección de 13 categorías de elementos, incluidas leyendas, notas al pie y encabezados/pies de página.
- Respuesta a preguntas sobre un documento (document QA) a partir de su imagen.
- Extracción de información clave en formato JSON estructurado.
- Procesamiento bilingüe tailandés-inglés, con especial atención al tailandés.
- Soporte de documentos digitales y fotografías de páginas.
- Integración con llama.cpp mediante endpoint compatible con la API de OpenAI.
- No dispone de modo de razonamiento (thinking) ni de tool calling documentados en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte fotografías o escaneos de páginas en elementos estructurados con bbox, lo que permite reconstruir el documento y preservar su maquetación para sistemas de gestión documental.
- Extracción de tablas a HTML: en informes financieros o facturas, la salida HTML de las tablas se puede insertar directamente en pipelines de datos o convertirse a CSV sin postprocesado pesado.
- Procesamiento de fórmulas científicas: la salida en LaTeX de las fórmulas permite reutilizar contenido de artículos y libros técnicos en editores científicos o repositorios de documentación.
- Asistente de preguntas sobre documentos: gracias a la capacidad de document QA, se puede montar un servicio que responda preguntas concretas sobre una página sin necesidad de extraer antes todo el texto.
- Extracción de campos clave a JSON: para formularios y documentos con estructura repetitiva, el modelo puede devolver la información clave en JSON, integrándose en procesos de validación y enriquecimiento de datos.
- OCR en el borde o en local: al distribuirse en GGUF y caber en GPUs de consumo, permite desplegar el parseo de documentos en entornos sin conexión o con requisitos de privacidad, usando llama.cpp con `llama-server`.
- Procesamiento por lotes de páginas bilingües: con `-np N` y contexto multiplicado, se pueden servir varias peticiones concurrentes para digitalizar lotes de páginas tailandesas e inglesas con una sola instancia.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), con decodificación greedy, thinking desactivado y presupuesto de imagen de 16.384 tokens, ejecutados con `llama-server` (build `a691b23`, CUDA, NVIDIA H100):

| Archivo | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 79,8 | 81,3 |
| `typhoon-ocr2-2b-f16.gguf` | f16, sin cuantización | 3,78 GB | 79,5 | 80,8 |
| `typhoon-ocr2-2b-Q8_0.gguf` | 8 bits | 2,01 GB | 79,5 | 80,4 |
| `typhoon-ocr2-2b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 1,27 GB | 78,4 | 79,7 |
| `mmproj-typhoon-ocr2-2b-f16.gguf` | codificador de imagen f16 (necesario con todos los anteriores) | 668 MB | – | – |

El autor recomienda Q8_0 por igualar a f16 con la mitad de tamaño; Q4_K_M queda aproximadamente un punto por debajo y es la opción con memoria ajustada. Las diferencias de décimas entre archivos están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M (1,27 GB) más el codificador visual f16 (668 MB) suman cerca de 2 GB de pesos; Q8_0 (2,01 GB) más el codificador rondan los 2,7 GB; f16 (3,78 GB) más el codificador, unos 4,4 GB. A ello hay que añadir el espacio de contexto (hasta 40.960 tokens en la configuración recomendada).
- GPU recomendadas: NVIDIA H100 es la referencia usada por el autor para las mediciones; cualquier GPU con suficiente VRAM sirve. Por el tamaño, cabe en GPUs de consumo como RTX 4090, RTX 4080 o incluso modelos con 8 GB de VRAM en Q4_K_M, siempre que se ajuste el contexto.
- Despliegue: llama.cpp (`llama-server`) con endpoint compatible con OpenAI; los pesos originales bf16 se sirven con vLLM.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la información disponible; el autor solo reporta la configuración de evaluación (CUDA, H100, greedy, 16.384 tokens de imagen).

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos comparables de OCR o parseo de documentos (por ejemplo, otros modelos de la familia Typhoon OCR o alternativas multimodales) medidos en MDPBench. Por tanto, la comparativa cuantitativa con alternativas se indica como no disponible. Como referencia interna, la comparación entre las propias variantes de cuantización figura en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo solo soporta tailandés e inglés; no se ha validado para otros idiomas.
- Requiere ampliar la imagen para que su lado largo tenga al menos 1.600 píxeles; con imágenes pequeñas el rendimiento cae, especialmente en tailandés.
- Está entrenado con un conjunto fijo de prompts; para el parseo de página completa debe usarse el prompt exacto documentado, y la salida esperada es un objeto JSON dentro de un bloque de código `json`.
- No se debe activar el modo de razonamiento (`--reasoning off`): el modelo fue entrenado sin bloque de pensamiento.
- Riesgo de alucinación y de errores de reconocimiento en texto pequeño, tablas complejas o fórmulas; conviene validar la salida en producción, especialmente en extracción de campos a JSON.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Licencia: el repositorio es Apache 2.0, pero el uso está sujeto a los OpenTyphoon Terms and Conditions; hay que revisarlos antes de un uso comercial.
- Sin `--image-max-tokens 16384`, llama.cpp reduce la resolución de páginas grandes y empeora la lectura de texto pequeño.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Informe técnico: https://arxiv.org/abs/2611.27494
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Términos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
