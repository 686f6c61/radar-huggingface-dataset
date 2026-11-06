# torchcast-ai/torchcast-decision-31b

## Resumen

Torchcast Decision 31B es un modelo de decisión de tipo texto desarrollado por Torchcast AI, construido como un ajuste fino completo de `google/gemma-4-31B-it`. Su propósito no es la generación de texto libre, sino devolver distribuciones de probabilidad sobre opciones discretas: probabilidades sí/no (`noul`), distribuciones sobre listas de opciones (`choice`) y distribuciones de puntuación ordinal (`score`), todo a través de una API compatible con TypeSafe. El modelo lee las letras de las opciones en la posición de respuesta en un único forward pass, sin generar tokens.

Técnicamente destaca por su atención híbrida: las capas de ventana deslizante mantienen el enmascaramiento causal del modelo base, mientras que las capas de atención global operan de forma bidireccional dentro del prompt (`attention_mode: hybrid_bidir_global`). Esta decisión de diseño implica que las pilas de inferencia convencionales (vLLM, llama.cpp, MLX o `transformers` sin el paquete de servicio) no reproducen la interfaz evaluada, por lo que el autor distribuye un paquete de servicio propio (`torchcast_decision`).

Con 32.682.372.656 parámetros reales y pesos en bf16, requiere una GPU de al menos 80 GB, lo que lo sitúa en el segmento de un solo nodo de gama alta (H100 80 GB o RTX PRO 6000 96 GB). Su relevancia actual reside en la propuesta de un modelo especializado en decisiones tipadas y evaluación de rúbricas acotadas, con latencias medidas de decenas de milisegundos, frente al enfoque habitual de extraer decisiones de un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención de ventana deslizante causal + atención global bidireccional), basado en Gemma 4 |
| Parametros totales | 32.682.372.656 (32,68 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra oficial; prompts superiores a 16.384 tokens conservan cabeza y cola del estado, como en entrenamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `google/gemma-4-31B-it` en el que se entrenan todas las capas excepto los embeddings de entrada. La innovación principal está en la atención: las capas de ventana deslizante mantienen el comportamiento causal del modelo base, pero las capas globales eliminan la máscara causal dentro del prompt, de modo que atienden en ambas direcciones. Este esquema, idéntico al usado en entrenamiento, es el responsable de que las pilas de inferencia causal estándar produzcan probabilidades distintas a las evaluadas.

El entrenamiento combina conjuntos de datos públicos (usando sus splits oficiales de entrenamiento) con datos sintéticos de decisión que cubren preguntas de elección, sí/no y puntuación. El autor declara que no se emplearon ítems de test de benchmarks en el entrenamiento. El formato de prompt es `torchcast_gemma4_v1`, el formato de chat de Gemma 4 con el modo thinking desactivado. La configuración de servicio fija temperatura 0,8 para elección, 0,6 para sí/no y 0,6 para puntuación, con un umbral de compromiso de 0,801 para las decisiones sí/no.

## Capacidades

- Decisión sí/no con probabilidad calibrada (`noul`) y umbral de compromiso configurable.
- Distribución de probabilidad sobre listas de opciones (`choice`); listas de más de 26 opciones se resuelven en varias pasadas agrupando opciones.
- Distribución de puntuación ordinal (`score`) para evaluación de rúbricas acotadas.
- Lectura de las letras de opción en la posición de respuesta en un único forward pass, sin generación de tokens.
- Interfaz compatible con TypeSafe mediante el paquete `torchcast_decision`.
- Capacidades de clasificación y enrutamiento (routing) sobre texto en inglés.
- Procesamiento de prompts largos con retención de cabeza y cola por encima de 16.384 tokens.
- No soporta tool calling, agentes ni generación de texto libre como interfaz evaluada.

## Casos de uso

- Clasificación de tickets de soporte: el modelo devuelve una distribución `choice` sobre categorías predefinidas en un solo forward pass, con latencia de decenas de milisegundos, adecuado para enrutar grandes volúmenes de incidencias.
- Enrutamiento de consultas en pipelines RAG: dado un prompt con la consulta y una lista de fuentes o herramientas, el modelo asigna probabilidades a cada opción y permite seleccionar el destino con un umbral fijo.
- Evaluación de rúbricas acotadas: para puntuar respuestas de otro modelo según criterios ordinales, el modelo emite una distribución `score` que refleja la incertidumbre de la calificación.
- Filtrado sí/no en moderación o verificación: con el umbral de compromiso de 0,801, el modelo decide si un texto cumple una condición concreta, útil en colas de revisión previas a un modelo generativo.
- Validación de decisiones en sistemas de CI/CD: comprobar si un cambio cumple una política descrita en el prompt, devolviendo una probabilidad sí/no que se puede registrar para auditoría.
- Investigación en calibración y decisión: el modelo sirve como base para estudiar la fiabilidad de probabilidades en dominios nuevos y para comparar interfaces de decisión frente a generación libre.
- Selección entre variantes en A/B testing semántico: dado un conjunto de descripciones de variantes, obtener una distribución de preferencia y elegir la de mayor probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los resultados del leaderboard de JevBench están pendientes y que el modelo aún no se ha medido en él.

| Metrica de servicio | Valor |
|---|---|
| Latencia mediana (H100 80 GB, un request a la vez) | 48 ms |
| Latencia mediana (RTX PRO 6000 96 GB) | 74 ms |
| Prompt más largo (H100) | 4,1 s |
| Prompt más largo (RTX PRO 6000) | 6,2 s |
| Reproducibilidad | probabilidades idénticas en ejecuciones repetidas sobre el mismo tipo de GPU |
| Captura de CUDA graphs al arranque | prompts hasta 4.096 tokens, aproximadamente un minuto |

## Requisitos de hardware

- VRAM estimada: al menos 80 GB con pesos bf16; probado en H100 80 GB y RTX PRO 6000 96 GB.
- GPU recomendadas: NVIDIA H100 80 GB (kernel FlashAttention-3 para capas de ventana deslizante) y RTX PRO 6000 96 GB (kernel PyTorch SDPA).
- No cabe en GPU de consumo (RTX 4090, 24 GB) en bf16; no se documentan cuantizaciones que reduzcan el requisito.
- Despliegue: exclusivamente mediante el paquete `torchcast_decision` con `decision_config.json`. vLLM, llama.cpp, MLX y `transformers` genérico no reproducen la interfaz evaluada por la atención bidireccional global.
- Latencia: mediana de 48 ms en H100 y 74 ms en RTX PRO 6000 para los ítems públicos de JevBench, con un request a la vez; el prompt más largo tarda 4,1 s y 6,2 s respectivamente.
- Throughput: no disponible; la documentación describe servicio de un request a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Interfaz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Torchcast Decision 31B | 32,68 B | no disponible (retención cabeza/cola >16.384 tokens) | Decisiones tipadas (sí/no, choice, score) mediante paquete propio | Apache 2.0 | Hugging Face, servicio con `torchcast_decision` |
| google/gemma-4-31B-it | no disponible en la información | no disponible | Generación de texto multimodal (image-text-to-text) | Apache 2.0 | Hugging Face, ecosistema amplio |
| Alternativas de clasificación basadas en encoders | no disponible | no disponible | Clasificación supervisada | variable | variable |

No se dispone de datos de benchmarks comparativos en la información proporcionada, por lo que no es posible contrastar rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte multilingüe.
- Las probabilidades pueden ser poco fiables en dominios nuevos, según advierte el propio autor.
- El servidor devuelve decisiones y no ejecuta acciones; no es un agente ni un modelo de tool calling.
- La atención global bidireccional impide usar pilas de inferencia causal estándar: cargar los pesos con `transformers`, vLLM, llama.cpp o MLX produce probabilidades distintas a las evaluadas.
- Requiere una GPU de 80 GB o más en bf16; no hay cuantizaciones publicadas.
- Los resultados en el leaderboard de JevBench están pendientes, por lo que no hay validación externa publicada.
- El modelo es independiente de TypeSafe AI y de los mantenedores de JevBench; la compatibilidad con TypeSafe se ofrece a través del paquete de servicio.
- Licencia Apache 2.0 tanto para pesos como para el paquete de servicio, con atribución al modelo base Gemma 4 de Google.
- El repositorio tiene un volumen de descargas muy bajo (34) y ninguna valoración, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torchcast-ai/torchcast-decision-31b
- Instrucciones de servicio (GitHub, tag v1.0.0): https://github.com/Torchcast-AI/torchcast-decision-31b/tree/v1.0.0#run-for-evaluation
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
