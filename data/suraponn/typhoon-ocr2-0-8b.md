# Suraponn/typhoon-ocr2-0.8b

## Resumen

Typhoon OCR V2 0.8B es un modelo de visión-lenguaje especializado en el análisis y extracción de documentos (document parsing), desarrollado por el equipo de OpenTyphoon (SCB 10X) y publicado en Hugging Face bajo el identificador `Suraponn/typhoon-ocr2-0.8b`. Su función es recibir la imagen de una página y devolver, en orden de lectura, cada elemento de maquetación con su categoría (13 tipos: título, texto, tabla, fórmula, encabezado, pie de página, etc.), su caja delimitadora (bounding box) y su contenido textual: las tablas en HTML, las fórmulas en LaTeX y el texto plano en Markdown.

El modelo es un fine-tune del parser `ATH-MaaS/OvisOCR2`, construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con un tamaño total de 852.985.920 parámetros (0,8B) y pesos en bf16. Está entrenado específicamente para tailandés e inglés, con datos de entrenamiento que también incluyen chino. Su relevancia radica en que mejora de forma muy notable la precisión en páginas tailandesas respecto a su modelo base (MDPBench tailandés de 14,7 a 77,2) manteniendo un rendimiento competitivo en inglés (81,7 en olmOCR-bench), y todo ello con un tamaño reducido que permite despliegues ligeros.

La versión 0.8B está pensada exclusivamente como parser de página completa: el propio autor advierte que es "mucho más débil fuera del análisis de página completa" y que para tareas de pregunta-respuesta sobre documentos debe usarse la variante Typhoon OCR V2 2B. La licencia es Apache 2.0, aunque el uso está sujeto a los Términos y Condiciones de OpenTyphoon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), hidden size 1.024 |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 e int4 (tags de Ollama); MLX 8-bit y MLX 4-bit; GGUF para llama.cpp |
| Idiomas soportados | tailandés (th) e inglés (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeta a los Términos y Condiciones de OpenTyphoon) |
| Formato de pesos | safetensors (transformers); GGUF y MLX disponibles en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de `ATH-MaaS/OvisOCR2` y emplea la arquitectura Qwen3.5 para generación condicional multimodal (`Qwen3_5ForConditionalGeneration`), con un tamaño oculto de 1.024. El entrenamiento se realizó en dos fases: primero un ajuste supervisado (SFT) sobre los mismos datos tailandeses curados y datos públicos en inglés y chino que la variante de 2B, y después un entrenamiento con GRPO usando recompensas que asignan cero a las salidas que alcanzan el límite de tokens. El adaptador LoRA resultante se fusionó en los pesos en fp32 y se almacenó en bf16.

La innovación principal es la combinación de SFT con GRPO para penalizar el "looping" (repetición de texto hasta agotar el límite de tokens), un fallo típico en modelos OCR pequeños. Según el autor, GRPO redujo las páginas con bucle en MDPBench de 12 a 6 y elevó la puntuación de 75,8 a 77,4. El modelo se entrenó con imágenes de hasta 4 MP, aunque los resultados de benchmark se obtuvieron con imágenes de hasta 16,7 MP. El output es una lista JSON de elementos de maquetación dentro de un bloque de código `json`.

## Capacidades

- Análisis de maquetación de página completa: devuelve los elementos en orden de lectura con 13 categorías (título, texto, tabla, fórmula, encabezado, pie de página, etc.) y bounding boxes.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Extracción de texto plano con salida en Markdown.
- Conversión de la salida JSON a Markdown (con o sin encabezados y pies de página) mediante código auxiliar.
- Procesamiento de páginas fotografiadas (no solo digitales): 75,9 en MDPBench de páginas fotografiadas.
- Capacidades conversacionales básicas y de pregunta-respuesta sobre documentos, aunque en esta variante de 0,8B son limitadas (ThaiOCRBench 36,4 frente a 40,5 de Typhoon OCR 1.5).
- Soporte multilingüe tailandés-inglés; el chino aparece en entrenamiento pero no se evalúa de forma separada.
- No se documenta soporte de tool calling ni de razonamiento multi-paso.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo extrae texto, tablas y fórmulas de páginas escaneadas con alta precisión en tailandés (77,2 en MDPBench tailandés), lo que lo hace adecuado para pipelines de conversión de documentos físicos a formatos estructurados.
- Procesamiento de facturas y formularios: la salida JSON con bounding boxes y categorías permite mapear campos (encabezados, tablas de importes) a esquemas de base de datos sin post-procesado manual complejo.
- Extracción de tablas financieras a HTML: las tablas se devuelven directamente en HTML, lo que facilita su integración en visores web o en hojas de cálculo mediante conversión posterior.
- Conversión de artículos científicos y técnicos: las fórmulas se emiten en LaTeX y el texto en Markdown, lo que permite reconstruir documentos académicos listos para publicar o indexar.
- OCR de documentos fotografiados con el móvil: el modelo mantiene 75,9 en MDPBench de páginas fotografiadas, por lo que sirve para aplicaciones de captura con cámara en entornos con iluminación y perspectiva variables.
- Despliegue en local o en el borde: con 0,8B de parámetros y versiones GGUF, MLX y Ollama (tags bf16, int8, int4), puede ejecutarse en estaciones de trabajo o portátiles sin GPU de datacenter para tareas de digitalización por lotes.
- Integración vía API OpenAI-compatible: disponible como `typhoon-ocr-v2` en la Typhoon API, útil para prototipos rápidos sin infraestructura propia.

## Benchmarks y rendimiento

| Benchmark | OvisOCR2 (base) | Typhoon OCR V2 0.8B | Cambio |
|---|---:|---:|---:|
| MDPBench, páginas tailandesas ↑ | 14,7 | 77,2 | +62,5 |
| MDPBench, páginas inglesas ↑ | 79,9 | 77,7 | −2,2 |
| MDPBench, páginas fotografiadas ↑ | 45,5 | 75,9 | +30,4 |
| MDPBench, páginas digitales ↑ | 54,3 | 82,0 | +27,7 |
| MDPBench, global ↑ | 47,7 | 77,4 | +29,7 |
| ThaiOCRBench ↑ | 10,2 | 36,4 | +26,2 |
| SEA-DocBench, NED tailandés ↓ | 0,6683 | 0,1081 | mejora (menor es mejor) |

Datos adicionales aportados por el autor: olmOCR-bench (solo inglés) 81,7 para la variante 0,8B frente a 84,7 de la 2B; OmniDocBench v1.6 89,37; MDPBench global 77,4 (frente a 66,0 de Typhoon OCR 1.5 y 68,9 en tailandés). En ThaiOCRBench la variante 0,8B obtiene 36,4, por debajo de los 40,5 de Typhoon OCR 1.5.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 1,7 GB de pesos más overhead de activaciones y del encoder visual; en int8 en torno a 1 GB y en int4 por debajo de 1 GB, aunque estas cifras son estimaciones a partir del tamaño del repositorio (1,7 GB) y no datos publicados.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, dado el tamaño de 0,8B y la existencia de versiones GGUF, MLX y Ollama (bf16, int8, int4).
- Opciones de despliegue: vLLM 0.30.0 o superior (requisito explícito del autor; los benchmarks se ejecutaron con vLLM 0.27.1 en modo eager), llama.cpp mediante GGUF, Ollama (`ollama run SuraponOCR/typhoon-ocr2-0.8b`), MLX (8-bit, 4-bit y bf16) y el paquete Python `typhoon-ocr2`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito de preprocesado: toda imagen cuyo lado largo sea inferior a 1.600 px debe ampliarse a 1.600 px antes de enviarla; el paquete `typhoon-ocr2` lo hace automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | MDPBench global | olmOCR-bench | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Typhoon OCR V2 0.8B | 0,8B | th, en | 77,4 | 81,7 | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Typhoon OCR V2 2B | 2B | th, en | no disponible en la información | 84,7 | Apache 2.0 | HF, GGUF, MLX, API |
| Typhoon OCR 1.5 2B | 2B | th, en | 66,0 | 62,0 | no disponible en la información | HF |
| OvisOCR2 (base) | no disponible | en, zh (según card del base) | 47,7 | no disponible en la información | no disponible en la información | HF |

La variante 0,8B sacrifica algo de precisión en inglés y en tareas de pregunta-respuesta frente a la 2B, pero ofrece un tamaño cuatro veces menor con una puntuación en MDPBench global muy próxima y mejor en eficiencia de despliegue.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es "mucho más débil fuera del análisis de página completa" y recomienda usarlo solo como parser de página; para preguntas sobre documentos debe emplearse la variante 2B.
- Pérdida de precisión en inglés y chino respecto al modelo base: MDPBench inglés cae de 79,9 a 77,7.
- Rendimiento inferior a Typhoon OCR 1.5 en ThaiOCRBench (36,4 frente a 40,5), lo que limita su uso en tareas de QA sobre documentos.
- Riesgo de bucles y repeticiones en salidas largas; el GRPO los redujo (de 12 a 6 páginas en MDPBench) pero no los elimina por completo.
- Requiere ampliar imágenes con lado largo inferior a 1.600 px; si no se hace, la calidad se degrada.
- El modelo se entrenó con imágenes de hasta 4 MP, aunque se evaluó con hasta 16,7 MP; el comportamiento fuera de ese rango no está documentado.
- Idiomas limitados a tailandés e inglés; el chino está en entrenamiento pero no se evaluó, y no se documenta soporte de otros idiomas.
- Licencia Apache 2.0, pero el uso está sujeto a los Términos y Condiciones de OpenTyphoon, que pueden imponer restricciones adicionales al uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación medidas; al ser un modelo OCR, el riesgo principal es la omisión o mal reconocimiento de texto en páginas densas o de baja calidad.
- Requiere vLLM 0.30.0 o superior; versiones anteriores pueden no funcionar correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Variante 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Versión anterior: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-0.8b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Código del paquete: https://github.com/srn-source/typhoon-ocr2
- Código de evaluación: https://github.com/srn-source/evaluation_thai_ocr
- Informe técnico: https://arxiv.org/abs/2611.27494
- Paper adicional citado en tags: https://arxiv.org/abs/2601.14722
- Demo (Typhoon OCR Playground): https://playground.opentyphoon.ai/ocr
- Documentación de la API: https://docs.opentyphoon.ai/
- Sitio web: https://opentyphoon.ai
- Términos y condiciones: https://opentyphoon.ai/tac
