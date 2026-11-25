# Zhantgjicy/distilbert-base-uncased-finetuned-emotion

## Resumen

`distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto en inglés desarrollado por el usuario de Hugging Face Zhantgjicy. Se trata de un ajuste fino (fine-tuning) del checkpoint `distilbert-base-uncased` sobre el dataset `emotion`, un conjunto de seis clases de emociones (sadness, joy, love, anger, fear, surprise) extraído de mensajes de Twitter. El modelo resuelve una tarea acotada: asignar una de esas seis etiquetas a una frase corta en inglés.

El modelo tiene 66.958.086 parámetros (aproximadamente 67 millones), lo que lo sitúa en la categoría de modelos encoder pequeños y eficientes. DistilBERT es una versión destilada de BERT-base que conserva aproximadamente el 97 % del rendimiento de su modelo profesor con un 40 % menos de parámetros y una inferencia un 60 % más rápida, según los datos originales de Sanh et al. (2019). Esto lo hace atractivo para despliegues con requisitos de latencia estrictos o hardware modesto.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto derivado de un ejercicio académico del curso "Natural Language Processing with Transformers" (capítulo 2), con licencia Apache 2.0, cero descargas y cero likes en el momento de la consulta. No es un modelo de propósito general ni compite con LLMs generativos; es una pieza de clasificación ligera que puede integrarse como componente en pipelines de análisis de sentimiento o moderación de contenido en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de DistilBERT); el ajuste fino usó max_length=66 con padding global |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite cuantización dinámica estándar de PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, 12 cabezas de atención, dimensión oculta de 768 y vocabulario de 30.522 tokens (WordPiece sin distinción de mayúsculas). Se inicializó desde `distilbert-base-uncased`, que a su vez se obtuvo mediante destilación por triple pérdida (pérdida de destilación, pérdida de similitud coseno entre estados ocultos y pérdida de lenguaje enmascarado) sobre BERT-base. Sobre esa base se añade una cabeza de clasificación lineal con 6 salidas para las etiquetas de emoción.

El ajuste fino se realizó sobre el dataset `emotion` (seis clases de Twitter), con los siguientes hiperparámetros declarados en la model card: learning_rate=5e-5, num_train_epochs=2, batch_size=32, warmup_ratio=0.06, weight_decay=0.01 y max_length=66 con padding global. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO (no aplica a un clasificador de este tipo). No se declaran innovaciones técnicas adicionales más allá de la propia destilación de DistilBERT.

## Capacidades

- Clasificación de texto en inglés en seis categorías de emoción: sadness (0), joy (1), love (2), anger (3), fear (4), surprise (5).
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)` de Transformers.
- Procesamiento de frases cortas (el ajuste usó truncado/padding a 66 tokens), lo que encaja con mensajes de redes sociales.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus ~67 M de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: únicamente inglés; el vocabulario uncased está sesgado hacia texto en inglés.

## Casos de uso

- Análisis de sentimiento y emoción en redes sociales: clasificar tuits o comentarios cortos en las seis categorías para alimentar paneles de monitorización de marca; el modelo está entrenado precisamente sobre el corpus `emotion` de Twitter y su latencia baja permite procesar volúmenes altos en CPU.
- Moderación de contenido en comunidades en inglés: detectar mensajes con carga de `anger` o `fear` para priorizar revisión humana, usando las probabilidades por clase como señal de confianza y umbral configurable.
- Enrutamiento de tickets de soporte: etiquetar el tono emocional de un correo o mensaje de chat entrante y derivarlo a colas distintas (por ejemplo, `anger` a escalado prioritario) como paso previo a un LLM generativo.
- Enriquecimiento de datasets para entrenamiento: etiquetar automáticamente grandes volúmenes de texto en inglés con emociones para construir corpus auxiliares, dado el bajo coste computacional del modelo.
- Filtrado previo en pipelines de investigación en psicología computacional o análisis de discurso: clasificación rápida de muestras de texto para estudios exploratorios, siempre con validación humana posterior.
- Componente en sistemas de recomendación o publicidad sensible al tono: ajustar la creatividad o el copy mostrado según la emoción detectada en la interacción previa del usuario, en flujos donde el inglés sea el idioma dominante.
- Docencia y prototipado: ejemplo canónico del capítulo 2 de "Natural Language Processing with Transformers", útil para demostrar fine-tuning de encoders y evaluación con accuracy y F1 ponderado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Accuracy | Weighted F1 |
|---|---|---|---|
| emotion | validation | 0.940 | 0.940 |
| emotion | test | 0.926 | 0.927 |

El `model-index` de la model card reporta sobre el split de test: accuracy = 0.926 y weighted F1 = 0.927 (marcados como `verified: false`). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, GLUE, SuperGLUE) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo de pesos (67 M × 4 bytes); con activaciones y overhead de PyTorch, por debajo de 1 GB en la práctica.
- VRAM estimada en FP16/BF16: aproximadamente 0,13 GB de pesos; el modelo completo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). El modelo no necesita GPU dedicada; es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU y en Raspberry Pi con cuantización dinámica.
- Opciones de despliegue: `transformers` con `pipeline`, TorchScript, ONNX Runtime, `optimum` (ONNX/OpenVINO), `text-embeddings-inference`, FastAPI + Uvicorn, o `llama.cpp` no aplica (no es un modelo generativo). vLLM y TGI no están orientados a este tipo de clasificadores pequeños.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por frase en CPU moderna y throughput de miles de frases por segundo en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhantgjicy/distilbert-base-uncased-finetuned-emotion | 66,96 M | 512 | Clasificación de emoción (6 clases) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english (HF oficial) | ~67 M | 512 | Análisis de sentimiento binario | Apache 2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 | Clasificación de emoción (6 clases) | Apache 2.0 | Hugging Face |
| bhadresh-savani/bert-base-uncased-emotion | ~110 M | 512 | Clasificación de emoción (6 clases) | Apache 2.0 | Hugging Face |

La comparación con `bhadresh-savani/distilbert-base-uncased-emotion` es la más directa: mismo backbone y mismo dataset, pero con más adopción en la comunidad. El modelo de esta ficha no declara comparativas de rendimiento frente a esas alternativas en la información disponible.

## Limitaciones y advertencias

- El propio autor reconoce que el modelo depende en gran medida de palabras clave locales de emoción; fenómenos pragmáticos como la negación, la ironía o las construcciones adversativas reducen significativamente la precisión.
- Los principales ejes de confusión declarados son `love`/`joy` y `surprise`/`joy`, lo que puede producir etiquetas inestables en textos ambiguos.
- Sesgo de dominio: entrenado sobre tuits en inglés; su comportamiento en otros registros (legal, médico, literario) no está validado.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitación idiomática: solo inglés; el vocabulario uncased y el corpus de entrenamiento penalizan el rendimiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset `emotion` subyacente puede tener sus propias condiciones; conviene revisarlas antes de un despliegue comercial.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa de los resultados declarados (`verified: false` en el model-index).
- Entrenado con `max_length=66` y padding global: entradas más largas se truncan, lo que puede perder información relevante en documentos extensos.
- No apto para decisiones sensibles (salud mental, moderación automática sin revisión humana) sin validación específica y umbrales de confianza calibrados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhantgjicy/distilbert-base-uncased-finetuned-emotion
- Dataset `emotion`: https://huggingface.co/datasets/emotion
- Modelo base `distilbert-base-uncased`: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de Transformers, `text-classification`: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Curso de referencia (capítulo 2): https://www.oreilly.com/library/view/natural-language-processing/9781098103231/
