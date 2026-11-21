# Suraponn/typhoon-ocr2-0.8b

## Resumen

Typhoon OCR V2 0.8B es un modelo de 0,8 mil millones de parámetros especializado en el análisis y extracción de contenido de documentos (document parsing) para tailandés e inglés. Lo desarrolla el equipo de OpenTyphoon y se distribuye a través del repositorio de Hugging Face del usuario Suraponn. El modelo resuelve un problema concreto: dada una imagen de una página, devuelve sus elementos de maquetación en orden de lectura, cada uno con una categoría (13 tipos posibles, como título, texto, tabla, fórmula, encabezado o pie de página), una caja delimitadora (bounding box) y su texto correspondiente. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown.

Técnicamente es un fine-tune de OvisOCR2, construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con un tamaño oculto de 1.024. Se entrenó con supervisión (SFT) sobre datos tailandeses curados y datos públicos en inglés y chino, seguido de un ajuste con GRPO. Su relevancia actual radica en que ofrece análisis de maquetación con posiciones en un modelo de menos de mil millones de parámetros, lo que reduce los requisitos de hardware frente a alternativas mayores, y en que mejora sustancialmente la precisión en tailandés respecto a su modelo base.

El modelo está pensado exclusivamente como analizador de páginas completas: el propio autor advierte de que, fuera de esa tarea, es mucho más débil que la variante de 2B, que recomienda para preguntas sobre documentos y otras tareas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), hidden size 1.024 |
| Parámetros totales | 852.985.920 (0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, int8, int4 (tags de Ollama); GGUF y MLX 8-bit, 4-bit y bf16 disponibles |
| Idiomas soportados | tailandés (th) e inglés (en); los datos de entrenamiento también incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0 (sujeto a los Términos y Condiciones de OpenTyphoon) |
| Formato de pesos | safetensors (transformers); GGUF y MLX disponibles por separado |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 para generación condicional multimodal (`Qwen3_5ForConditionalGeneration`), con un tamaño oculto de 1.024 y 0,8 mil millones de parámetros almacenados en BF16. Parte del modelo OvisOCR2, ya competente en inglés, y se ajusta mediante supervisión (SFT) sobre los mismos datos tailandeses curados y datos públicos en inglés y chino empleados en la variante de 2B. Posteriormente se aplica un ajuste con GRPO usando un adaptador LoRA que se fusiona en los pesos en fp32 y se almacena en bf16. Las recompensas de GRPO asignan cero a las salidas que alcanzan el límite de tokens, lo que penaliza el bucle degenerado.

El objetivo del entrenamiento fue elevar la precisión en tailandés manteniendo el conocimiento previo en inglés. Según el autor, la precisión en tailandés aumentó de forma acusada, pero se perdió parte de la precisión en inglés y chino respecto al modelo base. En MDPBench, el paso por GRPO redujo las páginas con bucle de 12 a 6 y elevó la puntuación de 75,8 a 77,4. La entrada es una imagen de página (entrenado con imágenes de hasta 4 MP, aunque los benchmarks usan hasta 16,7 MP) y la salida es una lista JSON de elementos de maquetación dentro de un bloque de código `json`.

## Capacidades

- Análisis de maquetación de página completa con cajas delimitadoras y 13 categorías de elemento (título, texto, tabla, fórmula, encabezado, pie de página, etc.), devueltos en orden de lectura.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de fórmulas con salida en LaTeX.
- Extracción de texto en Markdown, convertible desde el JSON con pocas líneas de código, con o sin encabezados y pies de página.
- Procesamiento de páginas fotografiadas además de páginas digitales.
- Soporte bilingüe tailandés-inglés.
- Salida estructurada en JSON apta para post-procesado programático.
- No está orientado a preguntas y respuestas generales sobre documentos ni a otras tareas fuera del análisis de páginas (el autor remite a la variante de 2B para esos usos).

## Casos de uso

- Digitalización de archivos tailandeses: el modelo convierte imágenes de páginas escaneadas en elementos estructurados con posiciones, lo que permite reconstruir el documento y preservar su maquetación; es adecuado por su alta puntuación en páginas tailandesas (MDPBench 77,2 frente a 14,7 del modelo base).
- Extracción de tablas a HTML: en informes financieros o administrativos, el modelo identifica la tabla y emite su contenido en HTML, listo para su ingesta en bases de datos o hojas de cálculo.
- Procesamiento de documentos fotografiados: gracias a su mejora en páginas fotografiadas (MDPBench 75,9 frente a 45,5 del base), sirve para capturas con el móvil en flujos de campo, como la digitalización de formularios en oficinas.
- Conversión de fórmulas a LaTeX: en documentación técnica o académica, extrae las fórmulas como LaTeX para su reutilización en editores científicos.
- Construcción de pipelines de OCR con post-procesado: la salida JSON con categorías y cajas permite filtrar encabezados y pies de página, o reconstruir el orden de lectura, integrándose en sistemas de gestión documental.
- Despliegue en entornos con recursos limitados: con 0,8B de parámetros y versiones GGUF, MLX e int4, puede ejecutarse en hardware modesto o en local mediante Ollama (`ollama run SuraponOCR/typhoon-ocr2-0.8b`), lo que lo hace viable para prototipos y estaciones de trabajo sin GPU de gran tamaño.
- Automatización de la extracción de contenido de páginas web o PDF renderizados: al devolver Markdown además de JSON, alimenta índices de búsqueda o sistemas RAG con texto limpio y estructurado.

## Benchmarks y rendimiento

| Benchmark | OvisOCR2 (base) | Typhoon OCR V2 0.8B | Cambio |
|---|---:|---:|---:|
| MDPBench, páginas tailandesas ↑ | 14,7 | 77,2 | +62,5 |
| MDPBench, páginas inglesas ↑ | 79,9 | 77,7 | −2,2 |
| MDPBench, páginas fotografiadas ↑ | 45,5 | 75,9 | +30,4 |
| MDPBench, páginas digitales ↑ | 54,3 | 82,0 | +27,7 |
| MDPBench, global ↑ | 47,7 | 77,4 | +29,7 |
| ThaiOCRBench ↑ | 10,2 | 36,4 | +26,2 |
| SEA-DocBench, NED tailandés ↓ | 0,6683 | 0,1004 | −0,5679 (mejor) |
| SEA-DocBench, NED inglés ↓ | 0,1003 | no disponible en el extracto | no disponible |
| olmOCR-bench (solo inglés) ↑ | no disponible | 81,7 | no disponible (2B: 84,7) |
| OmniDocBench v1.6 ↑ | no disponible | 89,37 | no disponible (1.5: 70,97) |

Datos adicionales aportados por el autor: en MDPBench el paso por GRPO elevó la puntuación de 75,8 a 77,4 y redujo las páginas con bucle de 12 a 6. En tareas generales de pregunta-respuesta, el modelo obtiene 36,4 en ThaiOCRBench frente a 40,5 de Typhoon OCR 1.5.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV; en int8 alrededor de 0,9 GB y en int4 alrededor de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para mayor throughput, A100 o H100 con vLLM.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas, especialmente con cuantización int8 o int4.
- Opciones de despliegue: vLLM (versión 0.30.0 o superior, obligatorio), llama.cpp mediante los pesos GGUF, MLX (8-bit, 4-bit y bf16) para Apple Silicon, Ollama (`SuraponOCR/typhoon-ocr2-0.8b` con tags `bf16`, `int8`, `int4`) y el paquete Python `typhoon-ocr2`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito de preprocesado: toda imagen cuyo lado largo sea inferior a 1.600 px debe ampliarse a 1.600 px antes de enviarla; el paquete `typhoon-ocr2` lo hace automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench (global) | olmOCR-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B | 0,8B | no disponible | 77,4 | 81,7 | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Typhoon OCR V2 2B | 2B | no disponible | no disponible (más preciso según el autor) | 84,7 | no disponible | HF, API |
| OvisOCR2 (base) | no disponible | no disponible | 47,7 | no disponible | no disponible | HF |
| Typhoon OCR 1.5 2B | 2B | no disponible | 66,0 | 62,0 | no disponible | HF |

El modelo de 0,8B sacrifica precisión frente al de 2B (81,7 frente a 84,7 en olmOCR-bench) y en tareas generales de pregunta-respuesta (36,4 frente a 40,5 en ThaiOCRBench respecto a la versión 1.5), pero supera ampliamente a su modelo base en tailandés y en páginas fotografiadas, y mejora a la versión 1.5 en los benchmarks de análisis de página citados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: el autor documenta el problema de bucles degenerados en salidas largas; GRPO lo redujo (de 12 a 6 páginas en MDPBench), pero persiste.
- Limitaciones de idioma: entrenado para tailandés e inglés; el chino está presente en los datos pero no se evaluó por separado. Se perdió cierta precisión en inglés y chino respecto al modelo base.
- Limitaciones de tarea: es un analizador de páginas, no un modelo de pregunta-respuesta sobre documentos; en esas tareas rinde peor que la variante de 2B.
- Restricciones de licencia: Apache 2.0, pero el uso está sujeto a los Términos y Condiciones de OpenTyphoon, que conviene revisar para uso comercial.
- Caveat de producción: requiere vLLM 0.30.0 o superior y el preprocesado obligatorio de ampliar imágenes con lado largo inferior a 1.600 px; omitirlo degrada los resultados.
- Resolución: entrenado con imágenes de hasta 4 MP, aunque los benchmarks emplean hasta 16,7 MP; el comportamiento fuera de ese rango no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Typhoon OCR V2 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Versión anterior (Typhoon OCR 1.5 2B): https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-0.8b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Código del paquete: https://github.com/srn-source/typhoon-ocr2
- Código de evaluación: https://github.com/srn-source/evaluation_thai_ocr
- Demo (playground): https://playground.opentyphoon.ai/ocr
- Documentación de la API: https://docs.opentyphoon.ai/
- Sitio web: https://opentyphoon.ai
- Términos y condiciones: https://opentyphoon.ai/tac
- Paper (referencia arXiv): arxiv:2601.14722
