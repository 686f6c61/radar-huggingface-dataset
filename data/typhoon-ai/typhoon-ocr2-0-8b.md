# typhoon-ai/typhoon-ocr2-0.8b

## Resumen

Typhoon OCR V2 0.8B es un modelo de 0,8 mil millones de parámetros especializado en el análisis de documentos (document parsing) para tailandés e inglés, desarrollado por el equipo de Typhoon (SCB 10X) y publicado bajo licencia Apache 2.0. Dada una imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con una categoría (13 tipos, como título, texto, tabla, fórmula, encabezado o pie), un cuadro delimitador y su texto. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown.

El modelo es un ajuste fino supervisado de ATH-MaaS/OvisOCR2, construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con un tamaño oculto de 1.024. Se entrenó con los mismos datos tailandeses curados y datos públicos en inglés y chino que el modelo hermano de 2B. Su relevancia radica en que ofrece capacidades de análisis de página cercanas a modelos mucho mayores con una fracción de los parámetros: obtiene 75,1 en MDPBench y 80,9 en olmOCR-bench, superando a PaddleOCR-VL-1.6 (0,9B) y quedando a pocos puntos del modelo de 2B.

La versión 0.8B está pensada exclusivamente como analizador de página completa; el propio autor advierte que es mucho más débil fuera de esa tarea y recomienda el modelo de 2B para preguntas sobre documentos. Aun así, mejora sustancialmente a Typhoon OCR 1.5 en precisión de análisis de página, en robustez ante páginas fotografiadas y en reducción de bucles de repetición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), hidden size 1.024 |
| Parametros totales | 852.985.920 (0,8B), BF16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | Tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 para generación condicional multimodal (`Qwen3_5ForConditionalGeneration`), con un tamaño oculto de 1.024 y 0,8B parámetros en BF16. Parte del modelo base ATH-MaaS/OvisOCR2, ya competente en inglés, y se ajustó mediante supervisión (SFT) sobre los mismos datos tailandeses curados y datos públicos en inglés y chino empleados en el modelo de 2B. El objetivo declarado fue elevar la precisión en tailandés sin degradar el conocimiento previo en inglés.

El autor probó además una etapa de GRPO con ajustes adaptados de la receta del modelo de 2B, pero empeoró el análisis de página, por lo que la versión publicada es únicamente el modelo supervisado. La entrada es una imagen de página (entrenado con imágenes de hasta 4 MP; los benchmarks usan hasta 16,7 MP) y la salida es una lista JSON de elementos de maquetación dentro de un bloque de código `json`. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la descripción general.

## Capacidades

- Análisis de página completa con maquetación: devuelve elementos en orden de lectura con categoría (13 tipos), cuadro delimitador y texto.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas con salida en LaTeX.
- Extracción de texto general en Markdown.
- Conversión del JSON de salida a Markdown (con o sin encabezados y pies de página) mediante código auxiliar del paquete `typhoon-ocr`.
- Procesamiento de páginas fotografiadas, con mejora respecto a la versión 1.5 (MDPBench en páginas fotografiadas de 61,6 a 73,4).
- Soporte bilingüe tailandés-inglés.
- Menor tendencia a bucles de repetición en decodificación greedy (13 páginas con bucle de 320 en MDPBench, frente a 36 en Typhoon OCR 1.5).
- No está diseñado para preguntas y respuestas sobre documentos (VQA): en ThaiOCRBench obtiene 35,9, por debajo de Typhoon OCR 1.5 (40,5).

## Casos de uso

- Digitalización masiva de archivos tailandeses: el modelo convierte imágenes de páginas escaneadas en JSON estructurado con posiciones, adecuado para pipelines de ingesta documental donde se necesita preservar la maquetación original.
- Extracción de tablas financieras o administrativas: la salida HTML de tablas permite integrar los datos directamente en sistemas de gestión documental o bases de datos relacionales.
- Procesamiento de documentos fotografiados con móvil: su mejora en páginas fotografiadas (73,4 en MDPBench) lo hace viable para aplicaciones de captura con cámara en entornos con escáneres de baja calidad.
- Conversión a Markdown para bases de conocimiento: el paquete `typhoon-ocr` permite transformar la salida JSON a Markdown, útil para alimentar sistemas RAG o wikis internas con documentación tailandesa e inglesa.
- Análisis de maquetación para preprocesamiento de OCR posterior: los cuadros delimitadores y categorías permiten segmentar páginas complejas antes de aplicar otros modelos especializados (por ejemplo, reconocimiento de escritura manuscrita).
- Despliegue en entornos con recursos limitados: con 0,8B parámetros en BF16 (aproximadamente 1,7 GB de pesos), puede ejecutarse en GPUs de consumo, lo que facilita el procesamiento en el borde o en servidores modestos.
- Extracción de fórmulas científicas: la salida en LaTeX facilita la reutilización de contenido matemático en publicaciones o sistemas de composición.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con los mismos scripts de evaluación. Las métricas ↑ indican que mayor es mejor; ↓ indica que menor es mejor.

| Modelo | Params | MDPBench ↑ | MDPBench TH ↑ | olmOCR-bench ↑ | ThaiOCRBench ↑ | SEA-DocBench NED ↓ | OmniDocBench v1.6 ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Chandra-OCR-2 | 5B | 74,2 | 71,1 | 84,4 | 26,4 | 0,1141 | 89,65 |
| dots.mocr | 3B | 76,2 | 73,6 | 85,2 | 37,9 | 0,1135 | 91,09 |
| PaddleOCR-VL-1.6 | 0,9B | 72,5 | 68,4 | 80,8 | n/a | 0,1323 | 95,83 |
| Infinity-Parser2-Flash | 2B | 61,5 | 55,5 | 82,9 | 35,2 | 0,1906 | 86,44 |
| Typhoon OCR 1.5 | 2B | 62,8 | 64,3 | 62,0 | 40,5 | 0,1726 | 70,97 |
| **Typhoon OCR V2 0.8B** | 0,8B | 75,1 | 75,9 | 80,9 | 35,9 | 0,1149 | 89,30 |
| **Typhoon OCR V2 2B** | 2B | 80,2 | 81,9 | 84,3 | 59,8 | 0,1170 | 91,49 |

El modelo de 0,8B queda 5,1 puntos por debajo del de 2B en MDPBench, 3,4 en olmOCR-bench y 2,2 en OmniDocBench, y ligeramente mejor en SEA-DocBench (0,1149 frente a 0,1170). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB para los pesos en BF16, más memoria para activaciones y procesamiento de imágenes de alta resolución (hasta 16,7 MP en evaluación).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para BF16; para procesamiento por lotes de páginas de alta resolución se recomienda 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; también en GPUs integradas con suficiente memoria compartida para imágenes pequeñas.
- Opciones de despliegue: transformers (librería oficial), con posibilidad de usar vLLM o TGI si soportan la arquitectura Qwen3.5; el paquete `typhoon-ocr` facilita la integración. No se ha confirmado soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MDPBench | olmOCR-bench | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Typhoon OCR V2 0.8B | 0,8B | no disponible | 75,1 | 80,9 | Apache 2.0 | Hugging Face |
| PaddleOCR-VL-1.6 | 0,9B | no disponible | 72,5 | 80,8 | no disponible | no disponible |
| Infinity-Parser2-Flash | 2B | no disponible | 61,5 | 82,9 | no disponible | no disponible |
| Typhoon OCR V2 2B | 2B | no disponible | 80,2 | 84,3 | Apache 2.0 | Hugging Face |

Frente a PaddleOCR-VL-1.6, de tamaño similar, el modelo de Typhoon obtiene 2,6 puntos más en MDPBench y prácticamente el mismo resultado en olmOCR-bench, aunque PaddleOCR-VL-1.6 es muy superior en OmniDocBench (95,83 frente a 89,30). Frente a Infinity-Parser2-Flash (2B), el modelo de 0,8B es claramente mejor en MDPBench (75,1 frente a 61,5) y ligeramente inferior en olmOCR-bench (80,9 frente a 82,9). El modelo de 2B de la misma familia es superior en todas las métricas excepto en SEA-DocBench NED, donde el de 0,8B es marginalmente mejor.

## Limitaciones y advertencias

- El propio autor indica que el modelo es mucho más débil fuera del análisis de página completa y recomienda usarlo exclusivamente como analizador de página.
- Rendimiento bajo en preguntas y respuestas sobre documentos: 35,9 en ThaiOCRBench, por debajo de Typhoon OCR 1.5 (40,5) y muy lejos del modelo de 2B (59,8).
- No se evaluó el cambio respecto al modelo base OvisOCR2, por lo que no se dispone de una comparación directa con el punto de partida.
- Los datos de entrenamiento incluyen chino, pero no se evaluó su rendimiento en ese idioma; no hay garantías de calidad.
- Riesgo de bucles de repetición en decodificación greedy: 13 páginas de 320 en MDPBench, aunque es una mejora sustancial frente a las 36 de la versión 1.5.
- La licencia Apache 2.0 está sujeta a los OpenTyphoon Terms and Conditions, que deben revisarse para uso comercial.
- No se han publicado detalles sobre sesgos, composición exacta del dataset ni comportamiento en dominios muy especializados (manuscritos, documentos históricos, etc.).
- La longitud de contexto no está especificada, lo que limita la planificación de despliegues con páginas extremadamente largas o múltiples páginas por invocación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Modelo hermano de 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Versión anterior: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Código: https://github.com/scb-10x/typhoon-ocr
- Sitio web: https://opentyphoon.ai
- Términos y condiciones: https://opentyphoon.ai/tac
- Paper (arXiv): https://arxiv.org/abs/2601.14722
