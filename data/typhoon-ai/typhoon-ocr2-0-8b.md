# typhoon-ai/typhoon-ocr2-0.8b

## Resumen

Typhoon OCR V2 0.8B es un modelo de análisis de documentos (document parsing) especializado en tailandés e inglés, desarrollado por Typhoon AI (OpenTyphoon). Dada una imagen de una página, devuelve una lista JSON de elementos de maquetación en orden de lectura, cada uno con su categoría (13 tipos posibles: título, texto, tabla, fórmula, cabecera, pie, etc.), su caja delimitadora (bounding box) y su texto. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown.

El modelo es un fine-tune de ATH-MaaS/OvisOCR2 sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con un tamaño total de 852.985.920 parámetros (0,8B) en BF16 y un hidden size de 1.024. Se entrenó con supervisión (SFT) sobre datos tailandeses curados y datos públicos en inglés y chino, seguido de GRPO con un adaptador LoRA fusionado en los pesos. Su relevancia radica en que mejora drásticamente la precisión en tailandés respecto a su modelo base (MDPBench en páginas tailandesas de 14,7 a 77,2) manteniendo un tamaño reducido que permite despliegue en hardware modesto.

La versión de 0,8B está pensada exclusivamente como parser de página completa: según el autor, es "mucho más débil fuera del parsing de página completa" que la variante de 2B, que cubre las demás tareas (preguntas y respuestas sobre documentos). En tareas de QA general sobre documentos obtiene 36,4 en ThaiOCRBench, por debajo de Typhoon OCR 1.5 (40,5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), hidden size 1.024 |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con hasta 16.384 tokens nuevos de salida en evaluacion) |
| Tipos de cuantizacion | BF16, int8, int4 (tags de Ollama); MLX 8-bit, MLX bf16, MLX 4-bit; GGUF |
| Idiomas soportados | Tailandes e ingles (los datos de entrenamiento incluyen chino, no evaluado) |
| Licencia | Apache 2.0 (sujeto a OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 para generación condicional multimodal (`Qwen3_5ForConditionalGeneration`), con un hidden size de 1.024 y 0,8B parámetros en BF16. Parte del modelo OvisOCR2, un parser ya competente en inglés, y se ajusta mediante supervised fine-tuning sobre los mismos datos tailandeses curados y datos públicos en inglés y chino que la variante de 2B. Posteriormente se aplica GRPO con recompensas que asignan cero a las salidas que alcanzan el límite de tokens, lo que penaliza el bucle degenerado en páginas largas. El adaptador LoRA resultante se fusiona en los pesos en fp32 y se almacena en bf16.

La innovación técnica principal es el formato de salida estructurado: una lista JSON de elementos de maquetación con categoría, bounding box y texto en orden de lectura, en lugar del Markdown plano de la versión anterior (Typhoon OCR 1.5). El entrenamiento se realizó con imágenes de hasta 4 MP, aunque los benchmarks se ejecutaron con imágenes de hasta 16,7 MP. Según el autor, GRPO redujo las páginas con bucles de 12 a 6 y elevó la puntuación en MDPBench de 75,8 a 77,4.

## Capacidades

- Parsing de página completa: devuelve todos los elementos de maquetación en orden de lectura con categoría (13 tipos), bounding box y texto.
- Reconocimiento de tablas: las emite como HTML estructurado.
- Reconocimiento de fórmulas: las emite como LaTeX.
- Texto general: lo emite como Markdown, con opción de incluir o excluir cabeceras y pies mediante conversión del JSON.
- Análisis de maquetación (layout analysis) con posiciones explícitas.
- Procesamiento de páginas fotografiadas y páginas digitales.
- Capacidades multilingües limitadas a tailandés e inglés (con presencia de chino en entrenamiento no evaluada).
- Conversión a Markdown desde la salida JSON con unas pocas líneas de código.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo extrae cada elemento de la página con su posición y categoría, lo que permite reconstruir el documento y preservar la maquetación original en sistemas de gestión documental.
- Extracción de tablas financieras: al emitir tablas en HTML, se pueden parsear directamente a estructuras de datos (DataFrames, hojas de cálculo) en pipelines contables o de auditoría.
- Procesamiento de documentos escaneados o fotografiados: rinde bien en páginas fotografiadas (MDPBench 75,9), adecuado para capturas con móvil en aplicaciones de campo.
- Conversión de PDF a Markdown con estructura: la salida JSON se transforma en Markdown con o sin cabeceras y pies, útil para alimentar bases de conocimiento o sistemas RAG.
- Indexación y búsqueda documental: las bounding boxes y categorías permiten asociar cada fragmento de texto a su región de la página, mejorando la trazabilidad en motores de búsqueda sobre documentos.
- Extracción de fórmulas científicas: la emisión en LaTeX facilita la reutilización en publicaciones técnicas o entornos de edición matemática.
- Despliegue en entornos con recursos limitados: con 0,8B parámetros cabe en GPU de consumo y en CPU vía GGUF/Ollama, lo que permite OCR local sin depender de servicios en la nube.

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
| olmOCR-bench (solo inglés) ↑ | no disponible | 81,7 | — |
| OmniDocBench v1.6 ↑ | no disponible | 89,37 | — |

Comparación con la versión anterior: MDPBench global pasa de 66,0 (Typhoon OCR 1.5) a 77,4; olmOCR-bench de 62,0 a 81,7; OmniDocBench v1.6 de 70,97 a 89,37; SEA-DocBench NED de 0,1726 a 0,1081. En olmOCR-bench, la variante de 2B obtiene 84,7 frente a 81,7 de esta. En ThaiOCRBench, esta versión (36,4) queda por debajo de Typhoon OCR 1.5 (40,5).

## Requisitos de hardware

- VRAM estimada: en BF16, aproximadamente 1,7 GB de pesos; en int8 en torno a 0,9 GB; en int4 alrededor de 0,5 GB (estimación a partir del tamaño del repo de 1,7 GB y del número de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 4090, A100 o H100 sobredimensionadas para este modelo, pero compatibles.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3060, RTX 4060) en BF16, y en configuraciones aún menores con cuantización int4/int8.
- Opciones de despliegue: vLLM 0.30.0 o superior (requisito explícito del autor), llama.cpp vía GGUF, Ollama (`ollama run SuraponOCR/typhoon-ocr2-0.8b`, con tags `bf16`, `int8`, `int4`), MLX (8-bit, bf16, 4-bit) y el paquete Python `typhoon-ocr2`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: es obligatorio ampliar a 1.600 px el lado largo de toda imagen que sea menor, antes de enviarla al modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | MDPBench (global) | olmOCR-bench | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Typhoon OCR V2 0.8B | 0,8B | th, en | 77,4 | 81,7 | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Typhoon OCR V2 2B | 2B | th, en | no disponible | 84,7 | Apache 2.0 (sujeto a ToC) | HF |
| Typhoon OCR 1.5 2B | 2B | th, en | 66,0 | 62,0 | no disponible en la informacion | HF |
| OvisOCR2 (base) | no disponible | en (principalmente) | 47,7 | no disponible | no disponible en la informacion | HF |

La variante de 2B es más precisa (olmOCR-bench 84,7 frente a 81,7) y cubre tareas de QA sobre documentos que la de 0,8B no domina. Frente a Typhoon OCR 1.5, esta versión mejora sustancialmente el parsing de página pero empeora en QA (ThaiOCRBench 36,4 frente a 40,5).

## Limitaciones y advertencias

- Uso previsto restringido: el autor recomienda usarlo únicamente como parser de página completa; es "mucho más débil fuera del parsing de página completa" que la variante de 2B.
- Pérdida de precisión en inglés y chino respecto al modelo base: MDPBench en inglés baja de 79,9 a 77,7 y el autor reconoce que se perdió parte de la precisión previa en inglés y chino.
- QA sobre documentos limitado: ThaiOCRBench 36,4, por debajo de Typhoon OCR 1.5 (40,5).
- Riesgo de bucles degenerados en páginas largas: aunque GRPO los redujo (de 12 a 6 páginas en MDPBench), el problema persiste.
- Requisito de preprocesado: las imágenes con lado largo inferior a 1.600 px deben ampliarse obligatoriamente, lo que introduce un paso adicional y posible pérdida de calidad.
- Cobertura lingüística limitada: solo tailandés e inglés evaluados; el chino presente en entrenamiento no se evaluó.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso está sujeto a los OpenTyphoon Terms and Conditions, que deben revisarse para uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo aplicado a OCR, puede producir texto plausible no presente en la imagen.
- Sesgos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
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
- Paper adicional: https://arxiv.org/abs/2601.14722
- Demo: https://playground.opentyphoon.ai/ocr
- API: https://docs.opentyphoon.ai/
- Términos y condiciones: https://opentyphoon.ai/tac
- Sitio web: https://opentyphoon.ai
