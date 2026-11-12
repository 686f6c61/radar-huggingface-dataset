# Subha95/bengali-sentiment-xlmr-v2

## Resumen

`bengali-sentiment-xlmr-v2` es un modelo de clasificación de texto obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-base` sobre una tarea de análisis de sentimiento en bengalí. Lo desarrolla el usuario Subha95 y se distribuye en Hugging Face con licencia MIT. El modelo resuelve la clasificación de polaridad de sentimiento en textos en bengalí, un idioma con relativamente pocos recursos anotados en comparación con el inglés, aprovechando el preentrenamiento multilingüe de XLM-RoBERTa.

Arquitectónicamente es un transformer encoder de tipo RoBERTa con 278.047.493 parámetros totales, derivado directamente de la base XLM-R (12 capas, atención multi-cabeza estándar, tokenizador SentencePiece con vocabulario de 250.002 tokens). El checkpoint se ha entrenado durante 5 épocas con un learning rate de 2e-05, batch total de 16 y optimizador AdamW fused, alcanzando un F1 macro de 0,9020 y una precisión exacta (exact match) de 0,8031 en el conjunto de evaluación declarado por el autor.

La relevancia del modelo es acotada pero concreta: cubre una necesidad práctica de clasificación de sentimiento en bengalí con métricas razonables y una licencia permisiva (MIT), lo que facilita su integración en productos comerciales sin las restricciones de otros modelos de la familia. Ahora bien, la model card está generada automáticamente y no documenta el dataset de entrenamiento, los idiomas soportados ni los usos previstos, lo que limita la trazabilidad y exige validación adicional antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tuning para clasificación de secuencias |
| Parametros totales | 278.047.493 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa soporta hasta 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; por nombre y base se orienta a bengalí) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | FacebookAI/xlm-roberta-base |
| Tamaño del repositorio | 5.6 GB |
| Framework de entrenamiento | Transformers 5.22.2, PyTorch 2.15.0+cu132, Datasets 5.2.0, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder de 12 capas con normalización pre-LN, embeddings posicionales relativos y tokenizador SentencePiece. Sobre esa base se añade una cabeza de clasificación de secuencias para la tarea de sentimiento. No se trata de un modelo generativo ni de una arquitectura MoE o híbrida: es un encoder denso orientado a representación y clasificación, lo que implica que no soporta generación de texto libre, tool calling ni razonamiento multi-paso.

El entrenamiento se realizó durante 5 épocas con learning rate 2e-05, batch de entrenamiento de 8 con acumulación de gradientes de 2 (batch efectivo 16), scheduler lineal con 113 pasos de warmup, semilla 42 y optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08. La evolución de la pérdida de validación desciende de 0,2294 en la época 1 a 0,1370 en la época 5, mientras que el F1 macro sube de 0,7576 a 0,9020. No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo aumento de datos ni si se aplicaron técnicas de regularización adicionales. Tampoco se especifica si se usó RLHF, DPO ni ninguna fase de alineación, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de sentimiento en texto: tarea principal del modelo, con salida de etiquetas de polaridad (el número exacto de clases no se declara en la model card).
- Análisis de opiniones y reseñas: al ser un encoder fine-tuneado, puede aplicarse a fragmentos cortos o medios de texto en bengalí.
- Clasificación de documentos con contexto moderado: hereda la ventana del modelo base, aunque la longitud efectiva no se documenta.
- Extracción de señal de polaridad para pipelines de análisis: útil como componente de un sistema mayor de monitorización o moderación.
- Capacidades multilingües: no documentadas explícitamente; el preentrenamiento de XLM-R es multilingüe, pero el fine-tuning se orienta a bengalí y no hay evidencia de transferencia a otros idiomas.
- Tool calling / function calling: no soportado (modelo encoder de clasificación, no generativo).
- Razonamiento multi-paso y agentes: no soportado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de sentimiento en redes sociales en bengalí: el modelo puede clasificar publicaciones y comentarios cortos para monitorizar la percepción de marca o de eventos, aprovechando su fine-tuning específico y su F1 macro de 0,9020 en evaluación.
- Moderación de contenido y detección de toxicidad indirecta: la polaridad negativa puede usarse como señal previa en pipelines de moderación, combinada con clasificadores específicos de toxicidad.
- Análisis de reseñas de productos o servicios: clasificación automática de opiniones de clientes en bengalí para alimentar dashboards de satisfacción y sistemas de alerta temprana.
- Investigación en procesamiento de lenguaje natural de bajo recurso: el modelo sirve como baseline reproducible para experimentos de sentimiento en bengalí, con hiperparámetros y métricas documentados.
- Enriquecimiento de datasets: etiquetado automático de grandes volúmenes de texto en bengalí para preentrenar o ajustar otros modelos, usando la salida del clasificador como pseudo-etiqueta.
- Integración en APIs de análisis de opinión: al ser un modelo pequeño (278 M de parámetros) y con licencia MIT, puede desplegarse en servicios de inferencia con requisitos modestos de hardware y sin restricciones comerciales.
- Seguimiento de campañas políticas o sociales: análisis agregado de sentimiento sobre menciones en bengalí para detectar cambios de tendencia, siempre con validación humana por el riesgo de sesgo del dataset de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,1370 |
| F1 Macro | 0,9020 |
| F1 Micro | 0,9144 |
| Precision Macro | 0,9292 |
| Recall Macro | 0,8791 |
| Exact Match Accuracy | 0,8031 |

Evolución por época:

| Epoca | Validation Loss | F1 Macro | F1 Micro | Precision Macro | Recall Macro | Exact Match Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | 0,2294 | 0,7576 | 0,8249 | 0,8749 | 0,7023 | 0,6178 |
| 2 | 0,1711 | 0,8688 | 0,8874 | 0,9006 | 0,8423 | 0,7606 |
| 3 | 0,1509 | 0,8893 | 0,9069 | 0,9323 | 0,8583 | 0,7928 |
| 4 | 0,1462 | 0,8906 | 0,9081 | 0,9303 | 0,8639 | 0,7928 |
| 5 | 0,1370 | 0,9020 | 0,9144 | 0,9292 | 0,8791 | 0,8031 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El model-index del repositorio está vacío (`results: []`), por lo que las cifras anteriores son las únicas disponibles y no están contrastadas con un benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1,1 GB para los pesos (278 M de parámetros × 4 bytes) más overhead de activaciones y tokenizador; en FP16/BF16, alrededor de 0,56 GB. El tamaño del repositorio (5,6 GB) incluye posibles checkpoints intermedios y el optimizador, no solo los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP16. Una NVIDIA T4, RTX 3060, RTX 4060 o superior funcionan sin problema. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8-16 GB (RTX 4090, A10, A100).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas (GTX 1660, RTX 2060, RTX 3050 en adelante) con cuantización o FP16.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles de Hugging Face, y servidores de inferencia estándar para modelos encoder como TorchServe o FastAPI con ONNX Runtime. No se documentan variantes GGUF para llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por muestra en GPU moderna y throughput alto en batch, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Subha95/bengali-sentiment-xlmr-v2 | 278 M | no disponible (base XLM-R hasta 512) | Clasificación de sentimiento en bengalí | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe (no fine-tuneado para sentimiento) | MIT | Hugging Face |
| Modelos de sentimiento en bengalí basados en BanglaBERT | no disponible | no disponible | Clasificación de sentimiento en bengalí | no disponible | Hugging Face |

La comparación con alternativas específicas de sentimiento en bengalí no está disponible en la información proporcionada: no se han encontrado en la búsqueda modelos comparables con métricas publicadas en el mismo conjunto de evaluación. El modelo base XLM-RoBERTa sirve como referencia arquitectónica, pero no como comparación de rendimiento en la tarea, ya que no está fine-tuneado para sentimiento.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "None dataset" y "More information needed", por lo que se desconoce la composición, el dominio y el equilibrio de clases del corpus de entrenamiento.
- Idiomas no declarados: aunque el nombre y la base apuntan al bengalí, no se especifica oficialmente qué idiomas ni variantes cubre, ni si funciona con code-switching bengalí-inglés.
- Riesgo de sesgo: al no documentarse el dataset, no se puede evaluar el sesgo por dominio, género, registro o dialecto; el modelo puede degradarse en textos informales, dialectales o de dominios distintos al de entrenamiento.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas con alta confianza en entradas ambiguas o fuera de distribución.
- Número de clases no declarado: la model card no especifica si el sentimiento es binario, ternario o de otra granularidad, lo que obliga a inspeccionar la configuración del modelo antes de usarlo.
- Contexto limitado: hereda la ventana de XLM-RoBERTa base (hasta 512 tokens), insuficiente para documentos largos sin truncado o segmentación previa.
- Licencia MIT: permisiva para uso comercial, pero sin garantías; el autor no ofrece soporte ni mantenimiento documentado.
- Model card autogenerada: no ha sido revisada manualmente, lo que reduce la fiabilidad de la documentación y de las métricas declaradas.
- Sin benchmarks estándar: las métricas provienen de un conjunto de evaluación no especificado y no son comparables con resultados publicados en benchmarks como MMLU, GLUE o similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Subha95/bengali-sentiment-xlmr-v2
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
