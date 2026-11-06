# Suraponn/typhoon-ocr2-0.8b

## Resumen

Typhoon OCR V2 0.8B es un modelo de visión-lenguaje especializado en el análisis de documentos (document parsing) para tailandés e inglés, desarrollado por SCB 10X dentro de la familia OpenTyphoon. Dado un imagen de una página, devuelve una lista JSON de elementos de maquetación en orden de lectura, cada uno con su categoría (13 tipos posibles: título, texto, tabla, fórmula, encabezado, pie de página, etc.), su caja delimitadora (bounding box) y su texto; las tablas se emiten como HTML, las fórmulas como LaTeX y el texto restante como Markdown. Es un fine-tune del modelo ATH-MaaS/OvisOCR2.

Con 852.985.920 parámetros en BF16 (aproximadamente 0,8B), el modelo se posiciona como una alternativa compacta frente a parsers de documentos de 2B a 5B parámetros, manteniendo una precisión competitiva en benchmarks públicos de páginas tailandesas e inglesas. Su arquitectura es Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con un tamaño oculto de 1.024.

Es relevante ahora porque demuestra que un modelo sub-1B, tras un ajuste supervisado y un refinamiento con GRPO, puede superar a modelos varias veces más grandes en tareas de parsing de página completa, lo que abarata el despliegue en producción y permite procesar documentos a gran escala con requisitos de hardware modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), visión-lenguaje, hidden size 1.024 |
| Parámetros totales | 852.985.920 (0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en BF16; existen cuantizaciones de la comunidad listadas en Hugging Face) |
| Idiomas soportados | tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeto a los Términos y Condiciones de OpenTyphoon) |
| Formato de pesos | safetensors (BF16), librería transformers |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 para generación condicionada por imagen (`Qwen3_5ForConditionalGeneration`), con un tamaño oculto de 1.024 y aproximadamente 0,8B parámetros. Parte del modelo base ATH-MaaS/OvisOCR2 y se entrena en dos fases: primero un ajuste supervisado (SFT) de 9.000 pasos sobre datos tailandeses curados y datos públicos en inglés y chino, con las mismas tareas que el modelo de 2B de la familia; después, un refinamiento con GRPO mediante un adaptador LoRA de rango 64 durante 850 pasos, fusionado en los pesos en fp32 y almacenado en bf16.

La innovación destacable es el uso de recompensas en GRPO que asignan cero a las salidas que alcanzan el límite de tokens, lo que reduce los bucles de generación: en MDPBench, GRPO bajó las páginas con bucle de 12 a 6 y subió la puntuación de 75,8 a 77,4. El modelo se entrenó con imágenes de hasta 4 MP, aunque los resultados de benchmark se midieron con imágenes de hasta 16,7 MP. La salida es una lista JSON de elementos de maquetación dentro de un bloque de código `json`.

## Capacidades

- Parsing de página completa: devuelve los elementos de maquetación en orden de lectura con categoría, bounding box y texto.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas con salida en LaTeX.
- Extracción de texto en Markdown (conversión desde el JSON, con o sin encabezados y pies de página).
- Análisis de maquetación con 13 categorías de elementos (título, texto, tabla, fórmula, encabezado, pie de página, etc.).
- Procesamiento de páginas fotografiadas (no solo escaneos limpios): MDPBench en páginas fotografiadas sube de 61,6 a 75,9 respecto a la versión anterior.
- Capacidades multilingües limitadas a tailandés e inglés (con presencia de chino en entrenamiento no evaluada).
- Respuesta a preguntas generales sobre documentos (VQA) de forma limitada: puntuación ThaiOCRBench de 36,4, inferior a la versión 1.5 (40,5), por lo que el autor recomienda el modelo de 2B para esas tareas.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización masiva de archivos administrativos tailandeses: el modelo convierte cada página escaneada en JSON estructurado con posiciones, lo que permite indexar y buscar por elemento (título, tabla, párrafo) sin rehacer el OCR desde cero; su tamaño de 0,8B abarata el procesado por página a gran escala.
- Extracción de tablas de informes financieros: al emitir las tablas como HTML, se pueden parsear directamente con librerías de scraping y volcar a bases de datos relacionales o hojas de cálculo, preservando la estructura de filas y columnas.
- Procesamiento de documentos mixtos tailandés-inglés: contratos, facturas o formularios bilingües se parsean en una sola pasada, manteniendo el orden de lectura y las categorías de cada bloque.
- Conservación de fórmulas en documentación técnica y académica: la salida LaTeX permite reutilizar ecuaciones en publicaciones, wikis o sistemas de gestión documental sin transcripción manual.
- Alimentación de pipelines RAG sobre documentos escaneados: el JSON con bounding boxes y texto en Markdown sirve como fuente de chunks con metadatos de posición, lo que mejora la trazabilidad de las citas en sistemas de recuperación aumentada.
- Digitalización de páginas fotografiadas con móvil: el modelo mantiene un rendimiento razonable en páginas capturadas con cámara (75,9 en MDPBench de páginas fotografiadas), útil para aplicaciones de campo o atención presencial.
- Preprocesado de documentos para modelos mayores: al ser un parser ligero, puede actuar como primera etapa que estructura el documento y alimenta a un LLM de mayor tamaño para tareas de comprensión o resumen.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con los mismos scripts de evaluación, imágenes de hasta 16,7 MP, decodificación greedy, máximo 16.384 tokens nuevos y vLLM en modo eager:

| Modelo | Params | MDPBench ↑ | MDPBench TH ↑ | olmOCR-bench ↑ | ThaiOCRBench ↑ | SEA-DocBench NED ↓ | OmniDocBench v1.6 ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Chandra-OCR-2 | 5B | 74,2 | 71,1 | 84,4 | 26,4 | 0,1141 | 89,65 |
| dots.mocr | 3B | 76,2 | 73,6 | **85,2** | 37,9 | 0,1135 | 91,09 |
| PaddleOCR-VL-1.6 | 0,9B | 72,5 | 68,4 | 80,8 | n/a | 0,1323 | **95,83** |
| Infinity-Parser2-Flash | 2B | 68,3 | 61,3 | 82,9 | 35,2 | 0,1906 | 86,44 |
| Typhoon OCR 1.5 | 2B | 62,8 | 64,3 | 62,0 | 40,5 | 0,1726 | 70,97 |
| **Typhoon OCR V2 0.8B** | 0,8B | 77,4 | 77,2 | 81,7 | 36,4 | **0,1081** | 89,37 |

El modelo obtiene el mejor resultado en MDPBench (77,4), MDPBench TH (77,2) y SEA-DocBench NED (0,1081, menor es mejor) entre los modelos evaluados, y queda segundo en OmniDocBench v1.6 (89,37). En olmOCR-bench (solo inglés) obtiene 81,7, frente a 84,7 del modelo de 2B de la misma familia. En ThaiOCRBench baja a 36,4, por debajo de Typhoon OCR 1.5 (40,5).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (~1,7 GB en repositorio) se puede ejecutar en GPUs con 4-8 GB de VRAM; con cuantización a 8 bits o 4 bits el requisito baja a 2-4 GB, aunque no se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB (RTX 3060/4060, RTX 4070, L4, A10); para alto throughput, A100 o H100 con vLLM.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más en BF16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (resultados en modo eager sin cambios), vLLM (obligatorio `--enforce-eager` o `enforce_eager=True`; el modo compilado por defecto degrada la precisión de forma notable), y cuantizaciones de la comunidad para llama.cpp/Ollama listadas en Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El aviso sobre vLLM indica que el modo compilado (torch.compile y CUDA graphs) redujo la precisión de 76,6 a 72,2 en MDPBench en un checkpoint intermedio, por lo que en producción conviene medir en modo eager.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MDPBench | olmOCR-bench | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Typhoon OCR V2 0.8B | 0,8B | no disponible | 77,4 | 81,7 | Apache 2.0 (con T&C de OpenTyphoon) | Hugging Face |
| PaddleOCR-VL-1.6 | 0,9B | no disponible | 72,5 | 80,8 | no disponible en la información | Hugging Face |
| Infinity-Parser2-Flash | 2B | no disponible | 68,3 | 82,9 | no disponible en la información | Hugging Face |
| Typhoon OCR 1.5 | 2B | no disponible | 62,8 | 62,0 | no disponible en la información | Hugging Face |
| dots.mocr | 3B | no disponible | 76,2 | 85,2 | no disponible en la información | Hugging Face |

Frente a PaddleOCR-VL-1.6, de tamaño similar, Typhoon OCR V2 0.8B es claramente superior en MDPBench (77,4 frente a 72,5) y en MDPBench TH (77,2 frente a 68,4), aunque PaddleOCR-VL-1.6 domina en OmniDocBench v1.6 (95,83 frente a 89,37). Frente a dots.mocr (3B), el modelo de Typhoon pierde en olmOCR-bench (81,7 frente a 85,2) pero gana en MDPBench (77,4 frente a 76,2) con una cuarta parte de los parámetros.

## Limitaciones y advertencias

- El propio autor lo recomienda únicamente como parser de página completa: fuera de esa tarea es mucho más débil que el modelo de 2B de la familia.
- En preguntas generales sobre documentos (VQA) rinde peor que Typhoon OCR 1.5 (ThaiOCRBench 36,4 frente a 40,5).
- En olmOCR-bench (inglés) obtiene 81,7, por debajo del modelo de 2B (84,7).
- Idiomas limitados a tailandés e inglés; el chino presente en entrenamiento no se evaluó y no debe asumirse como soportado.
- Riesgo de bucles de generación en páginas complejas, mitigado pero no eliminado por GRPO (6 páginas con bucle en MDPBench).
- Con vLLM en modo compilado por defecto la precisión cae de forma significativa; es obligatorio usar modo eager en producción.
- Licencia Apache 2.0 sujeta a los Términos y Condiciones de OpenTyphoon, que deben revisarse antes de un uso comercial.
- No se publican datos sobre sesgos, contexto máximo ni comportamiento en documentos de muy baja calidad; conviene validar con muestras propias antes de desplegar.
- El modelo se entrenó con imágenes de hasta 4 MP; los benchmarks usan hasta 16,7 MP, por lo que el rendimiento en resoluciones muy altas en producción puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b
- Modelo de 2B de la familia: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Versión anterior: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Código: https://github.com/scb-10x/typhoon-ocr
- Sitio web: https://opentyphoon.ai
- Página del modelo en OpenTyphoon: https://opentyphoon.ai/model/typhoon-ocr
- Términos y condiciones: https://opentyphoon.ai/tac
- Cuantizaciones de la comunidad: https://huggingface.co/models?other=base_model%3Aquantized%3Atyphoon-ai%2Ftyphoon-ocr2-0.8b
