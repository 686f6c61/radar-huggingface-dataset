# Suraponn/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de visión-lenguaje especializado en el análisis y la extracción de contenido de documentos en tailandés e inglés. Lo desarrolla OpenTyphoon (el autor del repositorio es Suraponn) como un ajuste fino supervisado (SFT) del modelo Infly/Infinity-Parser2-Flash, seguido de una etapa de aprendizaje por refuerzo con GRPO. Su propósito es resolver el parseo de documentos reales: dada una imagen de una página, devuelve una lista JSON de elementos de maquetación en orden de lectura, cada uno con su categoría (13 tipos posibles), su caja delimitadora (bounding box) y su texto, con las tablas en HTML, las fórmulas en LaTeX y el resto del contenido en Markdown.

El modelo tiene 2.213.241.664 parámetros (aproximadamente 2B) y se distribuye en formato BF16. Está construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`), un transformer multimodal de imagen a texto. Su relevancia actual radica en que eleva de forma notable el rendimiento en tailandés respecto a su modelo base (que ya era fuerte en inglés y chino pero flojo en tailandés), sin degradar el inglés: en MDPBench pasa de 61,3 a 81,3 en páginas tailandesas y de 75,4 a 78,4 en inglesas, y en ThaiOCRBench sube de 35,0 a 59,9.

Se publica junto a una variante más pequeña de 0,8B, con versiones GGUF y MLX, integración en Ollama, un paquete de Python (`typhoon-ocr2`) y disponibilidad vía API compatible con OpenAI. La licencia es Apache 2.0, aunque el uso está sujeto a los términos y condiciones de OpenTyphoon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), transformer multimodal imagen-texto |
| Parámetros totales | 2.213.241.664 (~2B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos originales); GGUF (llama.cpp) y MLX (bf16, 8-bit y 4-bit); Ollama con etiquetas bf16, int8 e int4 |
| Idiomas soportados | Tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeta a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (transformers); GGUF y MLX disponibles en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Infinity-Parser2-Flash, un parser multimodal basado en Qwen3.5 que procesa una imagen de página y genera una secuencia estructurada. Typhoon OCR V2 2B se entrena en dos fases: primero con ajuste fino supervisado (SFT) sobre datos tailandeses curados y datos públicos en inglés y chino; después con GRPO (Group Relative Policy Optimization) mediante un adaptador LoRA que se fusiona en los pesos en fp32 y se almacena en bf16. La recompensa del GRPO asigna cero a las salidas que alcanzan el límite de tokens, lo que ataca directamente el problema de los bucles de repetición en páginas fotografiadas.

La entrada es una imagen de página; el modelo se entrenó con imágenes de hasta 4 MP, aunque los resultados de benchmark se obtuvieron con hasta 16,7 MP. Una restricción operativa importante es que toda imagen cuyo lado largo sea inferior a 1.600 px debe ampliarse a 1.600 px antes de enviarla (el paquete `typhoon-ocr2` lo hace automáticamente). La salida es una lista JSON de elementos de maquetación dentro de un bloque de código `json`, con categoría, caja delimitadora y texto por elemento; las tablas se emiten en HTML y las fórmulas en LaTeX.

## Capacidades

- Parseo de documentos con maquetación: devuelve elementos en orden de lectura con 13 categorías (título, texto, tabla, fórmula, cabecera, pie de página, etc.) y bounding boxes.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas con salida en LaTeX.
- Conversión del resto de texto a Markdown (el JSON se puede transformar a Markdown con pocas líneas de código, con o sin cabeceras y pies de página).
- Visual question answering (VQA) de propósito general sobre el documento.
- Clasificación de documentos.
- Extracción de información clave en formato JSON.
- Lectura de gráficos y conversión de gráfico a datos.
- Capacidades multilingües limitadas a tailandés e inglés (con presencia de chino en entrenamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa páginas escaneadas o fotografiadas y devuelve cada bloque con su categoría y posición, lo que permite reconstruir el documento y alimentar sistemas de gestión documental con estructura y coordenadas, algo crítico en formularios oficiales tailandeses.
- Extracción estructurada para pipelines de datos: dado que la salida es JSON con bounding boxes, se puede integrar en un ETL que ingiera facturas, albaranes o contratos y mapee los campos a una base de datos, usando la extracción de información clave a JSON.
- Procesamiento de tablas financieras: la salida en HTML de las tablas permite convertir extractos, informes contables o tablas de precios en estructuras tabulares parseables por pandas u hojas de cálculo.
- Atención al cliente sobre documentación: con la capacidad de VQA, un asistente puede responder preguntas libres sobre un documento aportado por el usuario (por ejemplo, "¿cuál es el importe total de esta factura?") sin necesidad de un pipeline de extracción previo.
- Clasificación automática de documentos entrantes: el modelo puede clasificar páginas por tipo (factura, contrato, formulario, carta) dentro de un sistema de triaje documental, reduciendo el enrutamiento manual.
- Conversión de fórmulas científicas y técnicas: la salida en LaTeX de las fórmulas permite digitalizar apuntes, artículos o libros de texto con ecuaciones para su uso en entornos de publicación científica o educativa.
- Procesamiento OCR en entornos con recursos limitados: la variante de 0,8B y las cuantizaciones int4/MLX permiten desplegar el parseo en portátiles o dispositivos Apple Silicon, útil para prototipos y flujos offline.

## Benchmarks y rendimiento

Los resultados publicados comparan el modelo con su base (Infinity-Parser2-Flash), ejecutando ambos con el mismo prompt, ajustes y scripts, con vLLM 0.27.1 en modo eager.

| Benchmark | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---:|---:|---|
| MDPBench, páginas tailandesas ↑ | 61,3 | 81,3 | +20,0 |
| MDPBench, páginas inglesas ↑ | 75,4 | 78,4 | +3,0 |
| MDPBench, páginas fotografiadas ↑ | 65,3 | 79,7 | +14,4 |
| MDPBench, páginas digitales ↑ | 78,9 | 81,3 | +2,4 |
| MDPBench, global ↑ | 68,3 | 79,8 | +11,5 |
| ThaiOCRBench ↑ | 35,0 | 59,9 | +24,9 |
| SEA-DocBench, tailandés NED ↓ | 0,1268 | 0,1059 | −0,0209 (mejor) |
| SEA-DocBench, inglés NED ↓ | 0,1264 | 0,1248 | −0,0016 (mejor) |
| olmOCR-bench ↑ | 84,4 | 84,7 | +0,3 |
| OmniDocBench v1.6 ↑ | 91,03 | 90,97 | −0,06 |

Además, la model card indica mejoras frente a Typhoon OCR 1.5: MDPBench de 66,0 a 79,8 (tailandés de 68,9 a 81,3), olmOCR-bench de 62,0 a 84,7, OmniDocBench v1.6 de 70,97 a 90,97 y SEA-DocBench NED de 0,1726 a 0,1153.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4,5 GB solo para pesos (2,21B × 2 bytes), más el coste de activaciones y del procesamiento de imágenes de alta resolución (hasta 16,7 MP en benchmark), por lo que conviene reservar margen adicional.
- Cuantizaciones ligeras: las versiones GGUF int4/int8 y MLX 4-bit reducen el requisito de memoria por debajo de los ~2 GB de pesos, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: para BF16 con imágenes grandes, GPUs con 16-24 GB (RTX 4090, A100 40 GB, H100); para cuantizaciones int4/MLX, GPUs de consumo de 8-12 GB o Apple Silicon.
- Cabe en consumer GPU: sí, especialmente con las cuantizaciones int4/int8 y en Apple Silicon vía MLX.
- Opciones de despliegue: vLLM (se requiere versión 0.30.0 o superior), llama.cpp (GGUF), Ollama (`ollama run SuraponOCR/typhoon-ocr2-2b`, etiquetas bf16, int8, int4), MLX (bf16, 8-bit, 4-bit), el paquete Python `typhoon-ocr2` y la API de Typhoon con endpoint compatible con OpenAI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B | ~2,21B | no disponible | th, en | Apache 2.0 (sujeta a T&C de OpenTyphoon) | HF, GGUF, MLX, Ollama, API |
| Infinity-Parser2-Flash (base) | no disponible | no disponible | en, zh (más débil en th) | no disponible | HF |
| Typhoon OCR V2 0.8B | ~0,8B | no disponible | th, en | no disponible | HF |
| Typhoon OCR 1.5 2B (versión previa) | ~2B | no disponible | th, en | no disponible | HF |

Frente a su modelo base, Typhoon OCR V2 2B mejora el tailandés de forma sustancial (+20,0 en MDPBench tailandés) y mantiene o mejora el inglés, a costa de un rendimiento prácticamente idéntico en OmniDocBench (−0,06). Frente a Typhoon OCR 1.5 2B, añade maquetación con bounding boxes, VQA general, clasificación y extracción a JSON, con subidas notables en MDPBench, olmOCR-bench y OmniDocBench. La variante 0.8B es la alternativa de menor coste para parseo de páginas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al estar entrenado principalmente con datos tailandeses, ingleses y chinos, el rendimiento en otros idiomas puede degradarse.
- Riesgo de alucinación: como modelo generativo, puede producir texto, tablas o fórmulas inexistentes en la imagen; el entrenamiento con GRPO mitiga los bucles de repetición en páginas fotografiadas, pero no los elimina por completo.
- Restricción de preprocesado: las imágenes con lado largo inferior a 1.600 px deben ampliarse a 1.600 px antes de la inferencia; omitirlo puede degradar la calidad.
- Requisito de versión: se necesita vLLM 0.30.0 o superior; versiones anteriores pueden no funcionar correctamente.
- Limitación de idioma: solo tailandés e inglés evaluados; el chino está presente en entrenamiento pero no se evaluó por separado.
- Licencia: Apache 2.0, pero el uso está sujeto a los OpenTyphoon Terms and Conditions, que pueden imponer condiciones adicionales para uso comercial.
- Resolución de entrenamiento: entrenado con imágenes de hasta 4 MP; los resultados de benchmark usan hasta 16,7 MP, por lo que el comportamiento en resoluciones muy altas fuera de ese rango no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos de muchas páginas en una sola pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Variante 0.8B: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-2b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Código del paquete: https://github.com/srn-source/typhoon-ocr2
- Código de evaluación: https://github.com/srn-source/evaluation_thai_ocr
- Demo (Typhoon OCR Playground): https://playground.opentyphoon.ai/ocr
- API (documentación): https://docs.opentyphoon.ai/
- Términos y condiciones: https://opentyphoon.ai/tac
- Web oficial: https://opentyphoon.ai
- Versión previa (Typhoon OCR 1.5 2B): https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Paper (arXiv): arxiv:2601.14722
