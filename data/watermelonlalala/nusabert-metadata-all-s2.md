# watermelonlalala/nusabert-metadata-all-s2

## Resumen

nusabert-metadata-all-s2 es un modelo BERT ajustado (fine-tune) para clasificación de texto multietiqueta en indonesio. Lo desarrolla el usuario watermelonlalala a partir del modelo base LazarusNLP/NusaBERT-base, un encoder BERT entrenado específicamente para indonesio. El modelo resuelve la detección de contenido nocivo en cinco categorías independientes: insultos, ataques a la identidad, amenazas o incitación a la violencia, blasfemias u obscenidades y contenido sexualmente explícito.

El modelo tiene 110.645.765 parámetros (unos 110,6 millones), lo que corresponde a la arquitectura BERT-base estándar, y se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB. Su pipeline declarado es text-classification y emplea la librería transformers. El ajuste fino se realizó mediante búsqueda de hiperparámetros con Optuna, según indica el autor en la model card.

Es relevante para tareas de moderación de contenido en indonesio, un idioma con menos cobertura en modelos de seguridad que el inglés. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara licencia y su model card es mínima, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), text-classification |
| Parámetros totales | 110.645.765 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LazarusNLP/NusaBERT-base, un encoder de la familia BERT con 110,6 millones de parámetros. La tarea de salida es `multi_label_classification` con cinco etiquetas independientes: `insults`, `identity_attack`, `threat_incitement_to_violence`, `profanity_obscenity` y `sexually_explicit`. Al ser multietiqueta, cada texto puede activar simultáneamente varias categorías, lo que es adecuado para moderación de contenido donde un mensaje puede ser, por ejemplo, insultante y obsceno a la vez.

El autor indica que los hiperparámetros se buscaron con Optuna, pero no se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, la función de pérdida concreta (aunque la clasificación multietiqueta suele implicar binary cross-entropy), ni si hubo técnicas de regularización o balanceo de clases. Tampoco se especifica la longitud máxima de secuencia usada en el entrenamiento. La model card advierte que el texto de entrada debe preprocesarse igual que en el entrenamiento (minúsculas, normalización de emojis, menciones y URLs) para que las predicciones sean consistentes, lo que sugiere que el pipeline de preprocesado no está empaquetado con el modelo.

## Capacidades

- Clasificación de texto multietiqueta en indonesio con cinco categorías de contenido nocivo.
- Detección de insultos (`insults`).
- Detección de ataques a la identidad (`identity_attack`).
- Detección de amenazas e incitación a la violencia (`threat_incitement_to_violence`).
- Detección de blasfemias y obscenidades (`profanity_obscenity`).
- Detección de contenido sexualmente explícito (`sexually_explicit`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder de clasificación.
- No soporta visión ni audio.
- Capacidad monolingüe: solo indonesio.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo puede puntuar cada comentario contra las cinco etiquetas y activar revisión humana o filtrado automático cuando se supere un umbral. Es adecuado por su naturaleza multietiqueta y su bajo coste de inferencia (110 M de parámetros).
- Filtrado de foros y comunidades en línea: integrado en un pipeline de premoderación, permite descartar o marcar mensajes con amenazas o ataques a la identidad antes de que se publiquen, reduciendo la carga de los moderadores humanos.
- Detección de discurso de odio en redes sociales: la etiqueta `identity_attack` permite construir alertas específicas sobre ataques a colectivos, útil para equipos de confianza y seguridad.
- Análisis de toxicidad en datasets de investigación: al ser un clasificador ligero, puede anotar grandes volúmenes de texto indonesio para estudiar prevalencia de contenido nocivo sin depender de APIs externas.
- Filtrado previo en sistemas de generación aumentada (RAG) o chatbots en indonesio: se puede usar como guardarraíl de entrada para bloquear consultas abusivas antes de pasarlas a un modelo generativo.
- Cumplimiento y auditoría de contenido: sirve para clasificar retroactivamente corpus históricos y generar informes de exposición a contenido sexualmente explícito o violento en una plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo de pesos (110,6 M de parámetros × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU consumer.
- En fp16 o bf16: unos 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, A10 o A100 son sobradas. También funciona en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: transformers (nativo), Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference`), endpoints compatibles; no se documenta soporte GGUF ni llama.cpp, aunque la conversión a ONNX sería viable por el tamaño.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Idiomas | Licencia |
|---|---|---|---|---|---|
| watermelonlalala/nusabert-metadata-all-s2 | 110,6 M | no disponible | Clasificación multietiqueta de contenido nocivo | id | no disponible |
| LazarusNLP/NusaBERT-base | no disponible en la información | no disponible | Encoder base (MLM) | id | no disponible en la información |
| BERT-base multilingüe (referencia genérica) | ~178 M | 512 tokens (típico) | Encoder base | multilingüe | Apache 2.0 (típico) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, tarea e idioma; cualquier comparación de calidad requeriría evaluar el modelo sobre un conjunto de validación propio.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base antes de desplegarlo.
- Model card mínima: no se documentan dataset de entrenamiento, métricas de evaluación, umbrales recomendados ni análisis de sesgos.
- Riesgo de alucinación y falsos positivos: como todo clasificador, puede marcar texto inocente como nocivo, especialmente con sarcasmo, ironía o jerga indonesia no vista en entrenamiento.
- Dependencia del preprocesado: el autor advierte que hay que replicar el preprocesado del entrenamiento (minúsculas, normalización de emojis, menciones y URLs); sin él, las predicciones pueden degradarse.
- Cobertura monolingüe: solo indonesio; no es fiable en malayo, javanés u otros idiomas cercanos sin evaluación previa.
- Longitud de contexto desconocida: no se especifica la longitud máxima de secuencia; textos largos pueden truncarse y perder señal.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin señales de validación por la comunidad; trátese como un experimento y valídelo con datos propios antes de producción.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre posibles sesgos hacia determinados grupos o registros lingüísticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/watermelonlalala/nusabert-metadata-all-s2
- Modelo base: https://huggingface.co/LazarusNLP/NusaBERT-base
