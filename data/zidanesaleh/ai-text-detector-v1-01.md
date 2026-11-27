# zidanesaleh/ai-text-detector-v1.01

## Resumen

ai-text-detector-v1.01 es un modelo de clasificación de texto desarrollado por Desklib (publicado en Hugging Face bajo la cuenta zidanesaleh) cuyo objetivo es determinar si un fragmento de texto en inglés ha sido escrito por un humano o generado por una IA. Se trata de un ajuste fino del modelo encoder microsoft/deberta-v3-large, con 434 millones de parámetros, que aplica mean pooling sobre los estados ocultos y una cabeza lineal con activación sigmoide para producir una probabilidad de generación artificial.

El modelo está entrenado sobre el conjunto de datos liamdugan/raid, un benchmark específicamente diseñado para evaluar detectores de texto generado por IA frente a ataques adversariales, múltiples dominios y distintos esquemas de decodificación. Según su model card, en el momento de su publicación lideraba la tabla del RAID Benchmark for AI Detection, lo que lo sitúa como una referencia relevante para tareas de moderación de contenido, integridad académica y verificación periodística.

Su relevancia actual radica en la creciente necesidad de distinguir contenido sintético en entornos educativos y editoriales, así como en su licencia MIT, que facilita su integración en productos comerciales. No obstante, se trata de un modelo especializado exclusivamente en inglés y con una ventana de entrada limitada (768 tokens en el ejemplo de uso), lo que restringe su aplicabilidad a documentos largos sin fragmentación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large con disentangled attention y enhanced mask decoder) + mean pooling + cabeza lineal |
| Parámetros totales | 434.013.185 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de uso emplea max_length=768 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers, pero no se documentan variantes oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de microsoft/deberta-v3-large, un encoder basado en DeBERTa (Decoding-enhanced BERT with disentangled attention) que incorpora atención desacoplada entre contenido y posición, así como un decodificador de máscara mejorado. Sobre esta base, el autor añade una capa de mean pooling que agrega los estados ocultos ponderados por la máscara de atención, generando una representación vectorial de tamaño fijo del texto de entrada. Esa representación se pasa a una cabeza lineal que produce un único logit, transformado mediante sigmoide en una probabilidad de que el texto sea generado por IA. La función de pérdida empleada es BCEWithLogitsLoss, lo que confirma un planteamiento de clasificación binaria.

El ajuste fino se realizó sobre el dataset liamdugan/raid, que agrupa texto humano y generado por múltiples modelos de lenguaje, dominios y estrategias de decodificación, incluyendo escenarios adversariales. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un encoder de clasificación). Tampoco se especifican hiperparámetros de entrenamiento como learning rate, número de épocas o estrategias de aumento de datos. La innovación principal reside en el uso de un encoder grande (435M) con mean pooling en lugar de la clásica cabeza [CLS], lo que suele mejorar la robustez en clasificación de secuencias largas.

## Capacidades

- Clasificación binaria de texto en inglés como humano o generado por IA, con salida de probabilidad calibrable mediante umbral ajustable.
- Detección robusta frente a ataques adversariales y variaciones de decodificación, según los resultados reportados en el RAID Benchmark.
- Funcionamiento en múltiples dominios textuales (no restringido a un único género o temática), gracias a la composición del dataset RAID.
- Integración sencilla con la librería transformers mediante una clase PreTrainedModel personalizada.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- No dispone de capacidades multimodales (visión, audio) ni modo de razonamiento extendido.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede puntuar automáticamente textos enviados por usuarios para detectar contenido sintético masivo (spam, reseñas falsas, artículos generados), integrándose en pipelines de premoderación con umbral configurable.
- Integridad académica: universidades y plataformas educativas pueden emplear el clasificador para señalar posibles trabajos generados por IA, combinándolo con revisión humana dado el riesgo de falsos positivos.
- Verificación periodística: redacciones pueden usar el modelo como señal preliminar para priorizar la revisión manual de comunicados, notas de prensa o colaboraciones externas sospechosas de generación automática.
- Detección de reseñas falsas en e-commerce: clasificación por lotes de reseñas de productos para identificar patrones de generación sintética y alimentar sistemas antifraude.
- Filtrado en datasets de entrenamiento: limpieza de corpus recolectados de la web para separar texto humano de texto generado por IA antes de usarlo en el entrenamiento de otros modelos.
- Auditoría de contenidos generados internamente: verificación de que textos publicados bajo firma humana no contienen secciones producidas por modelos generativos, útil en compliance editorial.
- Investigación en detección de IA: el modelo sirve como línea base reproducible (licencia MIT, pesos safetensors) para experimentos académicos sobre robustez frente a ataques adversariales.

## Benchmarks y rendimiento

La model card indica que el modelo lideraba la tabla del RAID Benchmark for AI Detection en el momento de su publicación, pero no se incluyen cifras numéricas concretas (accuracy, F1, AUC) en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| RAID Benchmark for AI Detection | No disponible (posición de liderazgo reportada por el autor, sin cifras) | Enlace a leaderboard en la model card |

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es generativo sino un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos, más activaciones y buffers; en la práctica, entre 2 y 3 GB para secuencias de hasta 768 tokens.
- VRAM estimada en fp16/bf16: en torno a 0,9 GB para pesos, con un total práctico de 1,5 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100 o L4 para despliegues de alto throughput; RTX 4090, RTX 3090, RTX 3060 o incluso GPUs de gama de entrada para uso individual.
- Cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (tag oficial), endpoints compatibles de Hugging Face; también puede servirse mediante ONNX Runtime o TorchScript tras conversión manual (no documentado oficialmente). No se documenta soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del encoder, se espera un throughput alto en GPU (cientos a miles de textos por segundo en batch), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zidanesaleh/ai-text-detector-v1.01 (Desklib) | 434 M | No disponible (uso con 768 tokens) | Detección binaria humano/IA en inglés | MIT | Hugging Face |
| Modelos basados en RoBERTa-large para detección de IA | ~355 M | 512 tokens típicamente | Detección binaria humano/IA | Variable | Hugging Face |
| Detectores comerciales (GPTZero, Originality.ai) | No disponibles | No disponibles | Detección humano/IA | Propietaria | API/SaaS |

No se dispone de datos numéricos comparativos de rendimiento entre estos modelos en la información proporcionada, más allá de la posición reportada en el leaderboard RAID.

## Limitaciones y advertencias

- Solo soporta inglés; textos en otros idiomas no están contemplados y producirán resultados poco fiables.
- Entrada limitada a 768 tokens en el ejemplo de uso; textos más largos requieren truncamiento o fragmentación, lo que puede degradar la detección en documentos extensos.
- Riesgo de falsos positivos: textos humanos con estilo formal, repetitivo o muy estructurado pueden clasificarse erróneamente como generados por IA.
- Riesgo de falsos negativos frente a modelos generativos nuevos o parafraseados que no estén representados en el dataset RAID.
- La model card no documenta sesgos específicos por dominio, género o variedad dialectal; se desconoce el comportamiento diferencial entre subpoblaciones.
- El dataset RAID incluye ataques adversariales, pero la robustez frente a ataques no vistos (nuevos modelos de parafraseo, humanizadores comerciales) no está garantizada.
- Licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantía alguna sobre la precisión en producción; el uso en decisiones de alto impacto (sanciones académicas, moderación) debe combinarse con revisión humana.
- No es un modelo generativo: no puede emplearse para tareas de generación, resumen, traducción ni razonamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia comunitaria sobre su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zidanesaleh/ai-text-detector-v1.01
- Modelo original referenciado en la model card: https://huggingface.co/desklib/ai-text-detector-v1.01
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset RAID: https://huggingface.co/datasets/liamdugan/raid
- RAID Benchmark leaderboard: https://raid-bench.xyz/leaderboard?domain=all&decoding=all&repetition=all&attack=all
- Repositorio GitHub: https://github.com/desklib/ai-text-detector
- Demo online (Desklib AI Detector): https://desklib.com/ai-content-detector/
