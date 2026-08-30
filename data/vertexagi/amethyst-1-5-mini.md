# VertexAGI/amethyst-1.5-mini

## Resumen

Amethyst 1.5 Mini es un modelo de chat generalista desarrollado por VertexAGI, un proyecto de investigación independiente, como parte de la familia Amethyst. Se trata de un fine-tuning mediante LoRA sobre el modelo base Google Gemma 3 4B IT, con el objetivo de añadir una capacidad fiable de tool-calling para búsqueda web. A diferencia de su predecesor Amethyst 1 Mini, este modelo incorpora un conjunto de datos de entrenamiento cinco veces mayor (4.987 ejemplos) y una categoría específica de ejemplos negativos para enseñar cuándo no debe invocar la búsqueda.

El modelo resuelve un problema habitual en los asistentes conversacionales pequeños: saber distinguir entre preguntas que pueden responderse con conocimiento interno y aquellas que requieren información actualizada o externa. Amethyst 1.5 Mini aprende a descomponer preguntas complejas en varias consultas, refinar búsquedas tras resultados pobres y sintetizar respuestas con citas a partir de fragmentos recuperados. Su relevancia radica en que ofrece esta capacidad en un formato ligero (cuantizado a 4-bit) ejecutable en hardware de consumo, tanto Apple Silicon como GPUs convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Gemma 3) |
| Parametros totales | 711.484.928 (según safetensors; el modelo base Gemma 3 4B IT tiene ~4.000 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128K, pero el fine-tune se entrenó con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | MLX 4-bit (QAT), GGUF Q4_K_M |
| Idiomas soportados | Inglés |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

Amethyst 1.5 Mini parte del checkpoint `mlx-community/gemma-3-4b-it-qat-4bit`, una versión cuantizada a 4-bit del modelo Gemma 3 4B IT. Sobre esta base se aplicó un fine-tuning con LoRA de rango 8, escala 20.0 y dropout 0.0, afectando a 16 capas. El entrenamiento se realizó con el framework MLX sobre Apple Silicon, usando el optimizador Adam con tasa de aprendizaje constante de 1e-5, batch size 2 (reducido desde 4 para estabilizar el uso de memoria), secuencias de 2.048 tokens y 3.250 iteraciones con validación cada 200 pasos. La pérdida final de validación fue de 0.652.

El conjunto de datos de entrenamiento consta de 4.987 ejemplos (4.589 de entrenamiento y 398 de validación) generados sintéticamente mediante destilación de conocimiento a partir de los modelos Nemotron 3 Super 120B y Nemotron 3 Ultra 550B de NVIDIA, a través de la API NIM. Las categorías incluyen chat general (3.264 ejemplos), seguimiento multi-turno (438), resumen con citas (374), búsqueda de una sola consulta (305), refinamiento tras resultados débiles (183), descomposición multi-consulta (149) y la categoría crítica de no-búsqueda (274 ejemplos negativos) que enseña al modelo a no invocar la herramienta cuando no es necesaria.

## Capacidades

- Generación de texto conversacional: explicaciones, razonamiento, código, planificación, escritura creativa, extracción de información, lluvia de ideas, matemáticas, análisis de sentimiento y traducción (al inglés).
- Tool-calling para búsqueda web: el modelo emite llamadas a `web_search` en un formato JSON estructurado dentro de etiquetas `<tool_call>`, y procesa el resultado en un bloque `<tool_result>` para producir una respuesta con citas.
- Decisión de búsqueda: gracias a la clase negativa de entrenamiento, el modelo sabe cuándo no debe buscar (por ejemplo, preguntas triviales o de conocimiento general).
- Descomposición de preguntas complejas: divide una pregunta que requiere múltiples fuentes en varias consultas de búsqueda independientes.
- Refinamiento de consultas: si la primera búsqueda devuelve resultados pobres, el modelo genera una consulta reformulada.
- Respuestas fundamentadas: sintetiza fragmentos recuperados en una respuesta final con citas explícitas.

## Casos de uso

- Asistente personal con acceso a información actualizada: el modelo puede responder preguntas sobre noticias recientes, precios, eventos o datos en tiempo real, invocando la búsqueda web solo cuando es necesario, lo que reduce alucinaciones y costes de API.
- Chatbot de atención al cliente: integrado en un sistema de mensajería, el modelo gestiona consultas multi-turno sobre productos, políticas o incidencias, buscando en la documentación interna mediante la herramienta de búsqueda y citando las fuentes.
- Motor de preguntas y respuestas para documentación técnica: el modelo recupera fragmentos de manuales o wikis y genera respuestas concisas con referencias, útil para equipos de soporte o desarrolladores.
- Herramienta de investigación de mercado: el usuario formula preguntas complejas sobre tendencias, competidores o datos estadísticos; el modelo descompone la consulta en varias búsquedas y sintetiza un informe con citas.
- Agente de generación de informes automatizados: en combinación con un pipeline de scraping, el modelo consulta múltiples fuentes, extrae datos relevantes y redacta resúmenes estructurados con enlaces.
- Prototipo de agente RAG (retrieval-augmented generation) educativo: el modelo se usa en entornos de aprendizaje para demostrar cómo un LLM pequeño puede combinar conocimiento interno con búsqueda externa, sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

La model card incluye una evaluación manual con un conjunto de 26 prompts creados a mano, sin solapamiento con los datos de entrenamiento. Los resultados comparan el modelo base Gemma 3 4B IT con Amethyst 1.5 Mini:

| Metrica | Gemma 3 4B IT (base) | Amethyst 1.5 Mini |
|---|---|---|
| Correctitud de tool-calling (16 prompts: 8 deben llamar, 8 no deben) | 5/16 (31%) | 16/16 (100%) |
| Calidad de chat general (10 prompts, evaluador ciego por pares) | 2 victorias | 2 victorias, 6 empates |

El modelo base mostraba un comportamiento inconsistente: buscaba información que ya conocía (por ejemplo, el punto de ebullición del agua) y fallaba en buscar información genuinamente actual (por ejemplo, novedades de iPhone). Amethyst 1.5 Mini acierta en todos los casos de prueba, manteniendo la calidad conversacional sin regresión significativa.

No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con cuantización Q4_K_M o MLX 4-bit, dado que el modelo base tiene 4B parámetros y la cuantización reduce el peso a ~2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores). También funciona en Apple Silicon con MLX.
- Compatible con GPUs de consumo: sí, tanto en PC como en portátiles con suficiente memoria unificada.
- Opciones de despliegue: MLX para Apple Silicon (carga directa con `mlx_lm`), llama.cpp para GGUF (compatible con Ollama, LM Studio y otros runtimes), y Transformers con cuantización.
- Latencia y throughput estimados: no disponibles en la documentación, pero al ser un modelo de 4B cuantizado, es esperable una generación de decenas de tokens por segundo en GPUs modernas de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool-calling | Licencia | Formato |
|---|---|---|---|---|---|
| Amethyst 1.5 Mini | 4B (base) / 711M (safetensors) | No disponible | Sí (web_search) | Gemma Terms of Use | MLX 4-bit, GGUF Q4_K_M |
| Gemma 3 4B IT (base) | 4B | 128K | No entrenado para tool-calling | Gemma Terms of Use | Transformers, GGUF, MLX |
| Amethyst 1 Mini | 4B (base) | No disponible | No (solo chat) | Gemma Terms of Use | MLX, GGUF |

Amethyst 1.5 Mini se diferencia del base por su entrenamiento específico en tool-calling, y de su predecesor por la adición de la capacidad de búsqueda y un dataset más amplio. No se dispone de datos comparativos con otros modelos de tamaño similar (por ejemplo, Qwen 2.5 3B o Llama 3.2 3B) en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento moderado (~5.000 ejemplos) generado sintéticamente; el comportamiento puede ser inconsistente fuera de las categorías representadas.
- Solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- El tool-calling se entrenó únicamente con una herramienta (`web_search`) y un esquema fijo; el comportamiento con otros esquemas de herramientas no está probado.
- Hereda las limitaciones y el corte de conocimiento del modelo base Gemma 3 4B IT.
- La destilación desde modelos Nemotron se realizó sin revisión humana de todos los ejemplos, por lo que pueden existir artefactos de datos sintéticos.
- La licencia Gemma Terms of Use impone restricciones de uso comercial; es necesario revisar los términos antes de desplegar en producción.
- No apto para aplicaciones de alto riesgo, seguridad crítica o uso productivo no supervisado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/amethyst-1.5-mini
- Modelo anterior Amethyst 1 Mini: https://huggingface.co/VertexAIco/amethyst-1-mini
- Perfil de VertexAGI en HuggingFace: https://huggingface.co/VertexAIco/models
- Publicación en X de Vertex AGI: https://x.com/vertexagi
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint base cuantizado: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
