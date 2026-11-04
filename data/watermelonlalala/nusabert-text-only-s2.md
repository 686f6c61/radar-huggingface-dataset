# watermelonlalala/nusabert-text-only-s2

## Resumen

nusabert-text-only-s2 es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning de LazarusNLP/NusaBERT-base, un encoder BERT preentrenado específicamente para ese idioma. Lo publica el usuario watermelonlalala en HuggingFace y su tarea es la clasificación multietiqueta de contenido dañino: detección de insultos, ataques a la identidad, amenazas o incitación a la violencia, blasfemias u obscenidades y contenido sexualmente explícito. El problema que aborda es la moderación automática de texto en indonesio, un idioma con menos recursos que el inglés en herramientas de safety.

El modelo tiene 110.645.765 parámetros y un repositorio de 0,4 GB, lo que corresponde a un encoder BERT de tamaño base. La model card indica que los hiperparámetros se ajustaron con Optuna, pero no documenta la composición del dataset, el número de épocas ni las métricas obtenidas. Es un modelo recién publicado (noviembre de 2026 según los metadatos), sin descargas ni likes, por lo que debe considerarse un artefacto experimental más que un componente listo para producción.

Su relevancia es acotada: cubre un nicho concreto (moderación multietiqueta en indonesio) sobre una base lingüística adecuada (NusaBERT), pero la ausencia de evaluación publicada, de licencia declarada y de documentación del proceso de entrenamiento limita seriamente su adopción sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base_model: LazarusNLP/NusaBERT-base) |
| Parámetros totales | 110.645.765 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de tipo BERT, heredada de NusaBERT-base, con una cabeza de clasificación de secuencias para clasificación multietiqueta (`multi_label_classification`). Las cinco etiquetas son `insults`, `identity_attack`, `threat_incitement_to_violence`, `profanity_obscenity` y `sexually_explicit`, y pueden activarse de forma independiente para un mismo texto.

El autor indica que el fine-tuning se realizó sobre NusaBERT-base y que los hiperparámetros se buscaron con Optuna, pero no se especifica el dataset de entrenamiento, su tamaño, la composición de etiquetas, el número de tokens vistos ni si hubo técnicas adicionales como class weighting o umbrales por etiqueta. Tampoco se documenta ninguna innovación técnica más allá del ajuste de hiperparámetros. La model card advierte que el texto de entrada debe preprocesarse igual que en entrenamiento (minúsculas, normalización de emojis, menciones y URLs) para que las predicciones sean consistentes, lo que sugiere que el pipeline de preprocesado forma parte crítica del sistema y no se distribuye con los pesos.

## Capacidades

- Clasificación multietiqueta de texto en indonesio con cinco categorías de contenido dañino: insultos, ataques a la identidad, amenazas o incitación a la violencia, blasfemia u obscenidad y contenido sexual explícito.
- Asignación simultánea de varias etiquetas a un mismo fragmento de texto, adecuada para mensajes que combinan, por ejemplo, insulto y amenaza.
- Inferencia sobre texto plano; no procesa imágenes, audio ni vídeo.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Multilingüe: no. Solo indonesio según los metadatos.
- No dispone de modo thinking ni capacidades especiales más allá de la clasificación.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo clasifica cada mensaje entrante y activa revisión humana o bloqueo automático cuando se superan umbrales en `insults` o `threat_incitement_to_violence`. Es adecuado por su tamaño compacto, que permite desplegarlo en CPU.
- Filtrado de foros y comunidades de videojuegos: detección de `profanity_obscenity` y `insults` en tiempo real antes de publicar, con la ventaja de que la clasificación multietiqueta distingue entre una simple blasfemia y un ataque a la identidad.
- Triaje de denuncias en redes sociales: priorización de reportes que contienen `threat_incitement_to_violence` para que los equipos de confianza y seguridad los revisen primero.
- Detección de discurso de odio dirigido a grupos: la etiqueta `identity_attack` permite construir paneles de monitorización de toxicidad por colectivo, siempre con validación previa del modelo sobre el dominio concreto.
- Filtrado de datasets de entrenamiento: limpieza de corpus en indonesio antes de usarlos para entrenar modelos generativos, eliminando muestras con contenido sexual explícito o violento.
- Enrutado en sistemas de atención al cliente: clasificación de mensajes de usuarios para derivar los que contienen amenazas o contenido sexual a un flujo de escalado distinto del soporte estándar.
- Investigación en NLP de moderación: como baseline de clasificación multietiqueta en indonesio sobre NusaBERT, útil para comparar con modelos multilingües más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni matrices de confusión por etiqueta, ni comparaciones con otros modelos de moderación en indonesio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos, más activaciones y overhead del runtime; en la práctica menos de 1 GB.
- En fp16 o bf16: alrededor de 0,22 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesar grandes volúmenes de texto por segundo; para uso interactivo, cualquier GPU con 2 GB o más es suficiente.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, Text Embeddings Inference (el modelo está etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nusabert-text-only-s2 | 110,6 M | no disponible | Clasificación multietiqueta de toxicidad (id) | no disponible | HuggingFace, 0 descargas |
| LazarusNLP/NusaBERT-base | no disponible en la información | no disponible | Encoder base para indonesio (preentrenamiento) | no disponible | HuggingFace |
| Modelos de toxicidad multilingües tipo XLM-R base | no disponible en la información | no disponible | Clasificación de toxicidad multilingüe | variable según checkpoint | HuggingFace |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay métricas publicadas para este checkpoint ni se han proporcionado resultados de los modelos de referencia. La diferencia principal frente a un encoder multilingüe genérico es la especialización lingüística en indonesio que aporta NusaBERT como base.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación: se desconoce la precisión, el recall y el F1 por etiqueta, así como el comportamiento en dominios distintos del de entrenamiento.
- El dataset de entrenamiento no está documentado, por lo que no puede evaluarse el sesgo de las etiquetas ni la representatividad de los registros.
- Riesgo de falsos positivos y negativos en contextos irónicos, citas, lenguaje recuperado o jerga regional indonesia no cubierta.
- El preprocesado es parte del pipeline: si el texto no se normaliza igual que en entrenamiento (minúsculas, emojis, menciones, URLs), las predicciones pueden degradarse de forma significativa.
- Solo indonesio: no debe usarse con texto en malayo, javanés u otras lenguas del archipiélago sin validación específica.
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de integrarlo en un producto.
- Modelo con cero descargas y sin mantenimiento conocido: trátese como artefacto experimental y valídelo con un conjunto propio etiquetado antes de cualquier despliegue.
- La clasificación de contenido dañino es sensible a la definición de las etiquetas; los umbrales de decisión deben calibrarse por caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/watermelonlalala/nusabert-text-only-s2
- Modelo base NusaBERT: https://huggingface.co/LazarusNLP/NusaBERT-base
