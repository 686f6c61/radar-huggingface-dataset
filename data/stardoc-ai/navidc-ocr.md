# StarDoc-AI/NaviDC-OCR

## Resumen

NaviDC-OCR es un modelo de visión-lenguaje (VLM) ligero, de aproximadamente 1.000 millones de parámetros, desarrollado por StarDoc-AI (con el repositorio principal mantenido por caipeng328). Está diseñado específicamente para la comprensión y el análisis de documentos, unificando en un único marco el procesamiento de documentos digitales (PDF, capturas de pantalla) y de documentos capturados con cámara (fotografías de páginas, recibos, facturas). A diferencia de enfoques previos que suelen especializarse en uno de estos dos escenarios, NaviDC-OCR los aborda conjuntamente, lo que lo hace especialmente relevante para flujos de trabajo reales donde conviven ambos tipos de entrada.

El modelo incorpora una estrategia de aprendizaje desacoplada entre contenido y estructura, que permite modelar explícitamente la gramática de fórmulas matemáticas y la estructura de tablas, mejorando la representación estructurada de la información. Según el paper asociado, alcanza resultados de vanguardia en diversos benchmarks de análisis de documentos. Su tamaño reducido lo hace adecuado para despliegues en entornos con recursos limitados, manteniendo una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) - detalles no disponibles |
| Parametros totales | ≈1.000 millones (≈1B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo (si es un transformer estándar, si usa atención lineal, etc.). Se sabe que es un VLM ligero, orientado a la comprensión de documentos. La innovación principal reside en la estrategia de aprendizaje desacoplada contenido-estructura: el modelo aprende por separado la representación del contenido textual y la estructura lógica (fórmulas matemáticas, tablas), lo que permite una mejor generalización y una extracción estructurada más precisa. No se han publicado datos sobre el conjunto de entrenamiento, número de tokens, ni si se utilizaron técnicas de RLHF o DPO.

## Capacidades

- Comprensión de documentos digitales y capturados con cámara en un mismo marco.
- Extracción de contenido textual (OCR) de alta precisión.
- Reconocimiento de fórmulas matemáticas y su gramática.
- Modelado de estructura de tablas y extracción de datos tabulares.
- Representación estructurada de la información (probablemente salida en formatos como Markdown o JSON, no confirmado).
- Capacidad de razonamiento visual sobre documentos (inferencia de relaciones entre elementos).
- Soporte multilingüe no confirmado; no se especifican idiomas.

## Casos de uso

- Digitalización de documentos administrativos: procesar facturas, albaranes y formularios escaneados o fotografiados, extrayendo campos clave (importes, fechas, números de referencia) de forma estructurada.
- Automatización de entrada de datos en sistemas ERP/CRM: alimentar bases de datos con información extraída de documentos heterogéneos, reduciendo la intervención manual.
- Análisis de documentos académicos: extraer fórmulas matemáticas y tablas de artículos científicos o libros digitalizados, facilitando su reutilización en formatos editables.
- Archivado y búsqueda documental: convertir documentos escaneados en texto indexable, permitiendo búsquedas semánticas y por palabras clave.
- Asistentes de atención al cliente: interpretar capturas de pantalla o fotos de documentos enviados por usuarios para extraer datos relevantes y responder automáticamente.
- Procesamiento de documentos legales y contratos: identificar cláusulas, tablas de condiciones y datos de las partes a partir de versiones digitales o fotografiadas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper menciona "resultados de vanguardia" en benchmarks de análisis de documentos, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.) en las fuentes consultadas. Se recomienda consultar el paper para obtener datos detallados si se requieren.

## Requisitos de hardware

- Al tratarse de un modelo de ~1B parámetros, la VRAM estimada para inferencia en FP16 sería de aproximadamente 2-3 GB, y en cuantización de 8 bits podría reducirse a ~1-1.5 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., RTX 3050, RTX 4060) debería ser suficiente para inferencia en FP16. Para mayor velocidad, una RTX 3090 o superior es adecuada.
- Es viable su despliegue en CPU con cuantización (GGUF/llama.cpp), aunque con mayor latencia.
- Opciones de despliegue: no se especifican oficialmente, pero por su tamaño podría usarse con vLLM, llama.cpp, Ollama o TGI. No hay confirmación de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos OCR o VLM de tamaño similar (p. ej., PaddleOCR-VL, TrOCR, GOT-OCR2.0) en la información proporcionada. No se puede realizar una comparativa cuantitativa sin datos de benchmarks. Se recomienda consultar el paper para comparaciones con modelos de referencia.

## Limitaciones y advertencias

- No se han documentado sesgos específicos; al ser un modelo pequeño, puede presentar errores en documentos muy complejos o con baja calidad de imagen.
- Riesgo de alucinación en la extracción de contenido cuando el documento está dañado o es ambiguo; se recomienda validación humana en aplicaciones críticas.
- No se especifica el soporte de idiomas; es probable que el entrenamiento se haya realizado principalmente con datos en inglés, lo que limitaría su uso en otros idiomas.
- No se ha confirmado la compatibilidad con frameworks de inferencia populares; es necesario probar antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar las atribuciones requeridas.
- La fecha de creación del modelo (2026-08-14) es posterior a la fecha de conocimiento del autor de esta ficha; se recomienda verificar la disponibilidad y vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Repositorio GitHub: https://github.com/caipeng328/NaviDC-OCR
- Paper arXiv: https://arxiv.org/abs/2608.12898
