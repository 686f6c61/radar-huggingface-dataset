# Soulfate24/PaddleOCR-VL-1.6-ASHQ1-Remix-GGUF

## Resumen

PaddleOCR-VL-1.6-ASHQ1-Remix-GGUF es una versión cuantizada en formato GGUF del modelo PaddleOCR-VL-1.6, un modelo de visión-lenguaje (VLM) ligero desarrollado por PaddlePaddle para el análisis estructural de documentos. El modelo original, con aproximadamente 0.9 mil millones de parámetros, logra una precisión del 96.3% en el benchmark OmniDocBench v1.6, posicionándose como el estado del arte en parsing de documentos de código abierto. Esta variante cuantizada, creada por el usuario Soulfate24, aplica la técnica ASHQ1-Remix (activation-aware quantization con doble cuantización y linaje AutoRound) para reducir el tamaño del modelo a entre 324 MiB y 537 MiB según el nivel de calidad elegido, manteniendo un equilibrio entre fidelidad y eficiencia.

La relevancia de esta versión radica en su capacidad para ejecutarse en hardware modesto, incluidas GPUs de consumo con poca VRAM o incluso en CPU, lo que democratiza el acceso a capacidades de OCR y extracción de información de documentos de alto nivel. El modelo conserva las funcionalidades clave del original: reconocimiento de texto, tablas, fórmulas, gráficos, sellos y caracteres raros, así como soporte multilingüe (inglés, chino y otros). Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La suite ASHQ1-Remix ofrece siete niveles de cuantización (Fidelity, Precision, Quality, Compact, Mini, Nano y Pico), cada uno con un tamaño y unas métricas de degradación específicas. La tier "Precision-42pc" se recomienda como equilibrio óptimo entre tamaño (484 MiB) y calidad (PPL 362.99, top-p 91.5%). Esto la convierte en una opción atractiva para desarrolladores que necesitan desplegar sistemas de extracción de documentos en entornos con recursos limitados, como edge computing o aplicaciones móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Transformer (basado en ERNIE4.5 según los tags; detalles completos no disponibles) |
| Parametros totales | 466.654.208 (según safetensors del modelo cuantizado; el modelo base se anuncia como 0.9B en la documentación oficial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ASHQ1-Remix (7 niveles: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc) |
| Idiomas soportados | Inglés, chino, multilingüe (según los tags del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo original PaddleOCR-VL-1.6 es un VLM ligero diseñado específicamente para el parsing de documentos. Combina un encoder de visión con un decoder de lenguaje, y según los tags del repositorio cuantizado, la parte de lenguaje se basa en ERNIE4.5. No se dispone de información detallada sobre el proceso de entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada.

La versión cuantizada utiliza la técnica ASHQ1-Remix, una cuantización sensible a las activaciones (activation-aware) que emplea doble cuantización y un linaje basado en AutoRound con límites de saturación explícitos. Según la model card del autor, cada ratio, floor y cap de la cuantización está respaldado por experimentos medidos, y la suite ha sido validada en seis familias de modelos. El proceso produce siete niveles de compresión, cada uno con un tamaño de archivo y unas métricas de degradación específicas (PPL, KLD, RMS Δp, top-p), lo que permite al usuario elegir el equilibrio entre tamaño y calidad que mejor se adapte a su caso de uso.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de alta precisión en documentos escaneados e imágenes.
- Extracción de estructura de documentos: detección de layout, tablas, fórmulas matemáticas, gráficos y sellos.
- Manejo de documentos antiguos, caracteres raros y escritura no estándar.
- Conversión de documentos a texto estructurado (por ejemplo, Markdown) para su posterior procesamiento.
- Soporte multilingüe, con especial énfasis en inglés y chino, y capacidades adicionales para otros idiomas.
- Interacción conversacional (según el tag "conversational"), lo que sugiere que puede responder preguntas sobre el contenido del documento.
- No se especifica soporte para tool calling, function calling o razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede extraer texto y estructura de documentos antiguos con caracteres raros o degradados, facilitando la creación de archivos digitales buscables.
- Procesamiento de facturas y recibos: gracias a su capacidad de detectar tablas y sellos, es adecuado para automatizar la contabilidad y la verificación de documentos financieros.
- Extracción de información de artículos científicos: reconoce fórmulas matemáticas y tablas complejas, lo que permite convertir publicaciones en formato Markdown o estructuras de datos para bases de conocimiento.
- Automatización de entrada de datos en empresas: el modelo puede leer formularios, contratos y otros documentos corporativos, extrayendo campos clave y reduciendo la intervención manual.
- Integración en pipelines de RAG (Retrieval-Augmented Generation): al convertir documentos en texto estructurado, mejora la calidad de las búsquedas y respuestas en sistemas de preguntas y respuestas sobre documentación interna.
- Chat sobre documentos: al ser conversacional, permite a los usuarios hacer preguntas específicas sobre el contenido de un PDF o imagen, como "¿Cuál es el total de la factura?" o "¿Qué fecha aparece en el contrato?".
- Despliegue en entornos con recursos limitados: gracias a su tamaño reducido (desde 324 MiB), puede ejecutarse en dispositivos edge, Raspberry Pi o GPUs de baja gama, habilitando OCR offline en aplicaciones móviles o kioscos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada en la información disponible. El modelo base PaddleOCR-VL-1.6 alcanza un 96.3% de precisión en OmniDocBench v1.6, según la documentación oficial, superando a su predecesor PaddleOCR-VL-1.5 que obtuvo un 94.5% en la v1.5.

La model card del autor proporciona métricas de calidad de cuantización sobre el conjunto de prueba wiki.test.raw, con referencia simétrica FA-auto:

| Tier | Tamano | PPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Fidelity-48pc | 537 MiB | 365.8789 | 0.0366 | 2.99% | 91.1% |
| Precision-42pc (recomendada) | 484 MiB | 362.9912 | 0.0337 | 2.57% | 91.5% |
| Quality-36pc | 430 MiB | 400.7598 | 0.1747 | 5.72% | 80.7% |
| Compact-33pc | 404 MiB | 351.6550 | 0.2320 | 6.82% | 77.3% |
| Mini-30pc | 378 MiB | 333.6259 | 0.2712 | 7.33% | 74.7% |
| Nano-27pc | 351 MiB | 385.6355 | 0.2612 | 7.73% | 72.5% |
| Pico-24pc | 324 MiB | 509.1721 | 0.5632 | 11.01% | 63.5% |

Estas métricas indican la degradación introducida por la cuantización; valores más bajos de PPL y KLD, y valores más altos de top-p, implican mayor fidelidad al modelo original.

## Requisitos de hardware

- VRAM estimada: según el nivel de cuantización elegido, el modelo ocupa entre 324 MiB y 537 MiB. Con overhead de ejecución, se recomienda al menos 1-2 GB de VRAM para las tiers más pequeñas, y 2-4 GB para las de mayor fidelidad.
- GPUs compatibles: cualquier GPU con al menos 4 GB de VRAM puede ejecutar todas las tiers sin problemas (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.). Incluso en CPU es viable gracias al formato GGUF.
- Despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, llama-cpp-python y otros motores que soporten este formato. También puede integrarse con servidores de inferencia como llama.cpp server o text-generation-webui.
- Latencia y throughput: no se dispone de datos concretos. Al ser un modelo ligero, se espera una inferencia rápida en GPU moderna (menos de 1 segundo por imagen en una RTX 4090), pero estos valores dependen del hardware y del nivel de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench | Licencia | Formato |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 (base) | ~0.9B | No disponible | 96.3% (v1.6) | Apache-2.0 | safetensors |
| PaddleOCR-VL-1.6-ASHQ1-Remix (este) | 466.7M (cuantizado) | No disponible | No publicado (base: 96.3%) | Apache-2.0 | GGUF |
| PaddleOCR-VL-1.5 | ~0.9B | No disponible | 94.5% (v1.5) | Apache-2.0 | safetensors |
| MinerU (modelo de parsing de documentos) | No disponible | No disponible | No disponible | AGPL-3.0 | safetensors |

No se dispone de datos comparativos con otros modelos de la misma categoría (como Qwen2-VL, GPT-4o o modelos específicos de OCR) en la información proporcionada. La comparativa se limita a la familia PaddleOCR.

## Limitaciones y advertencias

- La cuantización introduce degradación en la calidad: las tiers más agresivas (Pico, Nano) muestran un aumento significativo de la perplejidad (PPL 509 vs 363 en la tier recomendada) y una caída del top-p (63.5% vs 91.5%), lo que puede traducirse en errores de OCR o estructura en documentos complejos.
- El modelo está optimizado principalmente para inglés y chino; el rendimiento en otros idiomas puede ser inferior, especialmente en escrituras no latinas o con caracteres poco comunes.
- No se ha evaluado formalmente el riesgo de alucinación en este modelo cuantizado. Como todo VLM, puede generar contenido plausible pero incorrecto si la imagen es ambigua o de baja calidad.
- La longitud de contexto no está especificada; se recomienda verificar los límites al procesar documentos muy extensos o conversaciones multi-turno.
- La técnica ASHQ1-Remix es experimental y no cuenta con validación independiente fuera de la suite del autor. Se recomienda probar el modelo en un conjunto de datos representativo antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con los términos de la licencia del modelo base y de cualquier dependencia de terceros.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Soulfate24/PaddleOCR-VL-1.6-ASHQ1-Remix-GGUF
- Modelo base PaddleOCR-VL-1.6: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio oficial de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Suite de cuantización ASHQ1-Remix: https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Documentación de PaddleOCR: https://www.paddleocr.ai/main/en/index.html
- Guía y referencia de API: https://paddleocr.dev/doc
