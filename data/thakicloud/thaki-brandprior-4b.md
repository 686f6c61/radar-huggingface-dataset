# ThakiCloud/Thaki-BrandPrior-4B

## Resumen

Thaki-BrandPrior-4B es un modelo de reranking especializado desarrollado por ThakiCloud que estima la probabilidad de que un asistente de IA mencione una marca concreta cuando el usuario formula una pregunta de producto sin nombrar ninguna marca (por ejemplo, "¿cuál es un buen CRM para un equipo de ventas de 10 personas?"). El modelo recibe la pregunta y una lista de marcas candidatas, y devuelve una puntuación de ranking por cada par (pregunta, marca). No es un modelo generativo: no produce texto, solo puntuaciones.

Se trata de un fine-tuning con LoRA (r=16) sobre Qwen/Qwen3-Reranker-4B, un modelo de 4.021.784.576 parámetros con arquitectura transformer derivada de la familia Qwen3. El modelo resuelve un problema emergente en el ámbito del marketing y la optimización para motores generativos (GEO): estimar, antes de ejecutar cualquier LLM, qué marcas tendería a citar un asistente en respuestas sin búsqueda web, y en qué orden de prioridad.

Es relevante ahora porque las respuestas de asistentes conversacionales se han convertido en un canal de descubrimiento de producto, y las marcas necesitan medir su presencia en ese canal. El modelo se publica como research preview bajo licencia Apache 2.0, con un tamaño de repositorio de 8,1 GB y soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning LoRA r=16 sobre Qwen/Qwen3-Reranker-4B) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Reranker-4B, un reranker de la familia Qwen3, y se adapta mediante LoRA con rango 16 durante 2 épocas sobre una NVIDIA B200, con un tiempo de entrenamiento de 36 minutos. La salida es la diferencia de logits `logit("yes") - logit("no")` sobre el prompt de reranking de Qwen3, que actúa como puntuación de ranking (no como probabilidad calibrada). El prompt de entrada incluye una instrucción fija, la pregunta del usuario y un documento compuesto por el nombre de la marca y su categoría.

Los datos de entrenamiento provienen de 3.261 turnos de usuario con intención de producto extraídos de WildChat-4.8M (AllenAI, ODC-BY), filtrados para excluir nombres de personas, correos, teléfonos y URL. Cada pregunta se envió una vez con temperatura 0 y sin búsqueda web a tres modelos: openai/gpt-4.1-mini, google/gemini-2.5-flash y mistralai/mistral-medium-3.1. Las marcas mencionadas se extrajeron con un LLM interno, conservando solo cadenas literales de la respuesta. La etiqueta es la proporción de los tres modelos que mencionaron la marca (0, 1/3, 2/3 o 1), es decir, una etiqueta plateada observada por LLM, no una etiqueta dorada humana. El conjunto final contiene 3.246 preguntas y 98.188 pares pregunta-marca, con hasta 30 candidatas por pregunta (marcas observadas para esa pregunta más marcas de otras preguntas de la misma categoría con etiqueta 0).

## Capacidades

- Ranking de marcas por propensión a ser mencionadas en respuestas de asistentes sin búsqueda web.
- Puntuación de pares (pregunta, marca) mediante diferencia de logits yes/no.
- Generalización a categorías de producto no vistas durante el entrenamiento (evaluada con cinco categorías held-out).
- Manejo de listas de hasta 30 marcas candidatas por pregunta.
- Integración con la librería transformers y endpoints compatibles.
- No genera texto: es exclusivamente un modelo de ranking.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Monitorización de visibilidad de marca en asistentes: una agencia puede enviar lotes de preguntas de categoría y obtener el ranking de marcas que un asistente tendería a mencionar, usando la puntuación para detectar en qué posición aparece su cliente frente a competidores.
- Planificación de estrategia GEO (generative engine optimization): estimar antes de lanzar contenido qué marcas dominan las respuestas espontáneas en una categoría y priorizar esfuerzos de posicionamiento donde la brecha es mayor.
- Auditoría competitiva por categoría: comparar la propensión de mención de una marca frente a sus competidores en preguntas de descubrimiento, comparación y compra, con hasta 30 candidatas por consulta.
- Priorización de preguntas para investigación de mercado: identificar qué preguntas de producto generan mayor dispersión de marcas y concentrar en ellas estudios cualitativos o campañas.
- Validación de hipótesis de contenido: antes de publicar comparativas o guías, comprobar si la marca ya figura en el ranking base del asistente y si el nuevo contenido debería desplazar esa posición.
- Investigación académica sobre sesgos de recomendación: analizar qué marcas se benefician sistemáticamente de la mención espontánea en asistentes y estudiar patrones por categoría, usando las etiquetas plateadas como proxy reproducible.
- Seguimiento temporal de posiciones: ejecutar el modelo periódicamente sobre el mismo conjunto de preguntas para detectar cambios en el orden de marcas, aunque con la cautela de que el modelo refleja el comportamiento muestreado en octubre de 2026.

## Benchmarks y rendimiento

Evaluación sobre preguntas held-out; las "categorías no vistas" son cinco categorías de producto que nunca aparecen en entrenamiento. Solo se puntúan preguntas con al menos una marca mencionada.

| Metrica | Qwen3-Reranker-4B | Popularidad de categoria | Thaki-BrandPrior-4B |
|---|---|---|---|
| Precision@3 (test, 253 preguntas) | 0.921 | 0.520 | 0.955 |
| Recall@5 (test) | 0.413 | 0.197 | 0.439 |
| nDCG@10 (test) | 0.804 | 0.504 | 0.887 |
| Spearman, score vs. mention share (test) | 0.481 | 0.201 | 0.560 |
| Recall@5 (categorias no vistas, 292 preguntas) | 0.430 | 0.328 | 0.469 |
| nDCG@10 (categorias no vistas) | 0.767 | 0.655 | 0.853 |

Intervalos de confianza del 95% por bootstrap pareado para la mejora sobre el reranker base (test): Recall@5 +0.026 [0.017, 0.036], nDCG@10 +0.083 [0.069, 0.097], Spearman +0.078 [0.062, 0.095]. La mejora principal se concentra en el ordenamiento por frecuencia de mención (correlación de rango de 0.481 a 0.560), no en detectar si una marca es relevante, ya que el reranker base ya alcanza Precision@3 de 0.921.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 8 GB solo para pesos, más overhead de activaciones y contexto; se recomienda al menos 16 GB para comodidad.
- GPU recomendadas: NVIDIA A100, H100 o B200 para despliegues de alto throughput; una RTX 4090 (24 GB) es suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización, aunque no se documentan formatos cuantizados oficiales.
- Opciones de despliegue: transformers (librería nativa), endpoints compatibles; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. El entrenamiento se completó en 36 minutos en una B200, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-BrandPrior-4B | 4.021.784.576 | No disponible | Reranking de marcas por propensión a mención | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-Reranker-4B | 4B (aprox.) | No disponible | Reranking general texto-consulta | No disponible | HuggingFace |
| Modelos de reranking generalistas (p. ej. bge-reranker) | Variable | Variable | Reranking de pasajes | Variable | HuggingFace |

La comparativa directa con alternativas especializadas en propensión de mención de marcas no está disponible: no se conocen modelos públicos con la misma tarea. Frente a su base Qwen3-Reranker-4B, Thaki-BrandPrior-4B mejora nDCG@10 de 0.804 a 0.887 y Spearman de 0.481 a 0.560 en el conjunto de test.

## Limitaciones y advertencias

- El modelo refleja el comportamiento de mención de tres modelos concretos (gpt-4.1-mini, gemini-2.5-flash y mistral-medium-3.1), muestreados una vez con temperatura 0 en octubre de 2026; otros modelos, versiones posteriores, parámetros de muestreo o asistentes con búsqueda web pueden diferir.
- Las preguntas son mayoritariamente tráfico de chatbot en inglés de 2023-2024; el modelo no está validado para otros idiomas ni para consultas fuera de ese dominio.
- Las marcas se emparejan tal como se escriben; variantes como "HubSpot" frente a "HubSpot CRM" pueden dividir la etiqueta y distorsionar la puntuación.
- No es una medida de cuota de mercado, calidad, preferencia del consumidor ni probabilidad de compra; la puntuación es un ranking relativo, no una probabilidad calibrada.
- Las etiquetas son plateadas (observadas por LLM), no doradas (humanas), lo que introduce el sesgo del extractor de marcas.
- El modelo no genera texto y no debe usarse para generación, tool calling ni tareas de razonamiento.
- Estado de publicación: research preview; puede no recibir mantenimiento ni actualizaciones.
- Licencia Apache 2.0 permite uso comercial, pero el aviso de research preview y las limitaciones de validez deben tenerse en cuenta en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-BrandPrior-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Dataset WildChat-4.8M (AllenAI): https://huggingface.co/datasets/allenai/WildChat-4.8M
- Repositorio de ejemplo de inferencia: `example_inference.py` incluido en el repositorio del modelo
