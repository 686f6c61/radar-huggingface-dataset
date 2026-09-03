# trtd56/LFM2.5-1.2B-JP-DailyTechResearch-Collect-LoRA

## Resumen

El modelo `trtd56/LFM2.5-1.2B-JP-DailyTechResearch-Collect-LoRA` es un adaptador LoRA experimental desarrollado por el usuario trtd56 mediante QLoRA fine-tuning sobre el modelo base `LiquidAI/LFM2.5-1.2B-JP` (un modelo de 1.2 mil millones de parámetros de Liquid AI especializado en japonés). El adaptador, diseñado para el framework MLX-LM, tiene como objetivo transformar titulares de noticias tecnológicas en inglés, japonés o chino en metadatos JSON estructurados en japonés: título traducido, resumen breve, clave de historia y género temático entre siete categorías predefinidas.

La relevancia de este adaptador radica en su enfoque de eficiencia: en lugar de desplegar un modelo grande, se parte de un modelo compacto de 1.2B y se adapta con solo 112 muestras de entrenamiento para una tarea específica de enriquecimiento de feeds. Esto permite obtener tiempos de generación muy bajos (mediana de 0,82 segundos en un Apple M3 Max) y un coste computacional reducido, manteniendo una precisión razonable en la validación de salida (23/24 muestras correctas en la evaluación). El adaptador se distribuye bajo la licencia LFM Open License v1.0, que incluye limitaciones de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-1.2B-JP (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador solo contiene pesos LoRA; el modelo base tiene 1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máxima secuencia de entrenamiento; el modelo base puede soportar más) |
| Tipos de cuantizacion | Adaptador en precisión nativa MLX; diseñado para usarse con base cuantizada 4-bit (`mlx-community/LFM2.5-1.2B-JP-4bit`) |
| Idiomas soportados | Japonés e inglés (entrada multilingüe para titulares, salida en japonés) |
| Licencia | LFM Open License v1.0 (con restricciones de uso comercial) |
| Formato de pesos | MLX (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `LiquidAI/LFM2.5-1.2B-JP`, un modelo de lenguaje de 1.2B parámetros desarrollado por Liquid AI. No se proporcionan detalles sobre la arquitectura interna del base (si es transformer, MoE o híbrido), pero al ser un adaptador LoRA, la arquitectura subyacente es la del modelo base. El adaptador añade matrices de bajo rango (rank=8, scale=20) en las capas de atención y feed-forward, modificando los pesos mediante QLoRA.

El entrenamiento se realizó con MLX-LM 0.31.3 sobre la versión cuantizada 4-bit del modelo base. El conjunto de datos consistió en 112 muestras de entrenamiento, 24 de validación y 24 de test, compuestas por titulares de artículos de noticias tecnológicas (sin descripciones de feed en la mayoría de los casos históricos). Las etiquetas de entrenamiento (título japonés, resumen, clave de historia, género) fueron generadas por otro LLM local y guardadas en el proyecto DailyTechResearch; no todas fueron revisadas por humanos. Se usó una tasa de aprendizaje de 1e-5, batch efectivo de 4 y longitud máxima de secuencia de 2048 tokens. El checkpoint seleccionado fue el paso 200, con pérdida de validación de 0,964 (frente a 1,243 antes del entrenamiento).

## Capacidades

- Generación de JSON estructurado con cuatro campos: `title_ja` (título en japonés natural), `summary_ja` (resumen de 1-2 frases), `story_key` (identificador corto para agrupar eventos) y `genre` (una de siete categorías temáticas predefinidas).
- Clasificación de artículos tecnológicos en siete géneros: LLM y modelos fundacionales, investigación en IA, herramientas de desarrollo, productos y servicios de IA, negocios e industria, seguridad y otros temas tech.
- Traducción de titulares al japonés, con preservación de nombres de productos cuando no es necesario traducirlos.
- Resumen breve en japonés del contenido del titular (limitado a la información disponible en el título).
- Agrupación de noticias relacionadas mediante la clave de historia (`story_key`).
- Procesamiento de entradas en inglés, japonés y chino (aunque la salida siempre es en japonés).
- No incluye soporte para tool calling, agentes o razonamiento multi-paso; su función es específica para la tarea de enriquecimiento de feeds.

## Casos de uso

- Agregador de noticias tecnológicas en japonés: un sistema puede ingerir titulares de múltiples fuentes (RSS, APIs) y usar el adaptador para generar automáticamente títulos, resúmenes y géneros en japonés, facilitando la publicación en un portal o boletín.
- Generación de metadatos para RSS feeds: el adaptador produce campos JSON que pueden integrarse directamente en feeds RSS o Atom, mejorando la accesibilidad para lectores japoneses.
- Clasificación automática de artículos en un sistema de recomendación: usando el campo `genre`, un motor de recomendación puede filtrar o priorizar noticias según la temática sin intervención manual.
- Agrupación de noticias sobre el mismo evento: gracias al `story_key`, un sistema de seguimiento de noticias puede agrupar artículos de diferentes fuentes que traten el mismo tema, evitando duplicados.
- Enriquecimiento de bases de datos de investigación: investigadores o analistas pueden procesar colecciones de titulares y obtener resúmenes y categorías estructuradas para su posterior análisis estadístico o entrenamiento de otros modelos.
- Asistente de redacción para boletines: un editor puede usar el adaptador para generar borradores de títulos y resúmenes en japonés a partir de titulares en inglés, reduciendo el tiempo de traducción manual.
- Integración en pipelines de procesamiento de noticias con MLX-LM: al ser un adaptador ligero, puede ejecutarse en local en equipos Apple Silicon sin necesidad de GPU dedicada, ideal para entornos de desarrollo o despliegue edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación proporcionada se centra en la tarea específica del adaptador:

| Modelo | Tiempo de generación mediana | Validación básica de salida (sobre 24 muestras) |
|---|---|---|
| Este adaptador | 0,82 s | 23/24 |
| Modelo profesor (local LLM) | 2,33 s | 23/24 |

La validación básica comprueba la presencia de los cuatro campos JSON, la corrección del japonés en título y resumen, la no vacuidad de la clave de historia y el uso de un género definido. Esta evaluación se realizó en un Apple M3 Max con 64 GB de RAM, excluyendo el tiempo de carga del modelo. Los autores advierten que esta pequeña evaluación no garantiza la exactitud del contenido ni las capacidades generales de traducción o resumen.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa muy poca memoria (los pesos LoRA son del orden de pocos MB). El modelo base en cuantización 4-bit ocupa aproximadamente 0,6-0,8 GB, por lo que el conjunto cabe en cualquier GPU o sistema con al menos 2 GB de memoria disponible.
- GPU recomendadas: funciona en Apple Silicon (M1/M2/M3/M4) gracias a MLX; también puede ejecutarse en GPUs NVIDIA con CUDA si se convierte el modelo a otro formato (por ejemplo, GGUF o safetensors), aunque no se proporciona soporte oficial.
- Puede ejecutarse en hardware de consumo: sí, cualquier Mac con al menos 8 GB de RAM unificada puede ejecutarlo sin problemas; también en GPUs de gama baja (por ejemplo, RTX 3060 6GB) si se convierte el modelo.
- Opciones de despliegue: MLX-LM (recomendado), también posible con llama.cpp si se convierte el adaptador y el base a GGUF, o con vLLM si se exporta a safetensors.
- Latencia y throughput: en Apple M3 Max 64GB, la generación de una muestra tarda una mediana de 0,82 segundos (con 500 tokens máximos). En hardware inferior, el tiempo será mayor pero sigue siendo viable para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LiquidAI/LFM2.5-1.2B-JP (base) | 1.2B | No especificado (probablemente 8K+) | LFM Open License v1.0 | Modelo generalista en japonés |
| trtd56/LFM2.5-1.2B-JP-DailyTechResearch-Collect-LoRA (este adaptador) | 1.2B (base) + LoRA | 2048 (entrenamiento) | LFM Open License v1.0 | Adaptación específica para metadatos de noticias |
| Llama-3-ELYZA-JP-8B (modelo japonés comparable) | 8B | 8K | Llama 3 license | Modelo generalista japonés de mayor tamaño |

La comparación con otros adaptadores LoRA para tareas similares no está disponible en la información proporcionada. El adaptador destaca por su eficiencia: con 112 muestras consigue un rendimiento aceptable en una tarea muy concreta, pero carece de la versatilidad de un modelo generalista sin adaptar. El modelo base LFM2.5-1.2B-JP sin adaptador probablemente tenga un rendimiento inferior en esta tarea específica, aunque no se han publicado comparativas directas.

## Limitaciones y advertencias

- El adaptador se entrenó principalmente con titulares de artículos, no con el cuerpo completo; por tanto, los resúmenes pueden ser superficiales o no reflejar el contenido real del artículo.
- Riesgo de alucinación: al basarse solo en el título, el modelo puede generar descripciones plausibles pero sin fundamento en hechos reales.
- Algunos titulares compuestos únicamente por nombres de productos pueden devolverse sin traducir, lo que reduce la utilidad en esos casos.
- Los géneros y claves de historia pueden no coincidir con los que generaría un humano o el modelo profesor original.
- Las etiquetas de entrenamiento provienen de un LLM profesor y no fueron todas revisadas por humanos, por lo que el adaptador puede heredar errores del profesor.
- No se realiza decodificación estricta con JSON Schema; en producción se recomienda validar la salida y proporcionar un mecanismo de fallback.
- Licencia LFM Open License v1.0: incluye limitaciones de uso comercial; es obligatorio revisar los términos antes de cualquier despliegue en entornos empresariales.
- El adaptador solo admite una entrada a la vez; no se ha entrenado para procesar lotes de artículos en una sola llamada.
- La longitud de contexto efectiva se limita a 2048 tokens para esta tarea, aunque el modelo base pueda soportar más.

## Enlaces

- [Página del adaptador en HuggingFace](https://huggingface.co/trtd56/LFM2.5-1.2B-JP-DailyTechResearch-Collect-LoRA)
- [Modelo base LiquidAI/LFM2.5-1.2B-JP](https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP)
- [Conversión MLX 4-bit del modelo base](https://huggingface.co/mlx-community/LFM2.5-1.2B-JP-4bit)
- [Proyecto DailyTechResearch (prompt completo y validación)](https://github.com/trtd56/DailyTechResearch)
- [Licencia LFM Open License v1.0 (incluida en el repo del adaptador)](https://huggingface.co/trtd56/LFM2.5-1.2B-JP-DailyTechResearch-Collect-LoRA/blob/main/LICENSE)
