# Sree6464/truthlens-textonly-model

## Resumen

truthlens-textonly-model es un modelo de clasificación de texto en inglés resultado de un ajuste fino (fine-tuning) completo de google-bert/bert-base-uncased, publicado por el usuario Sree6464 en HuggingFace. Se trata, por tanto, de un encoder BERT base con una cabeza de clasificación añadida, orientado a una tarea de clasificación binaria de secuencias. Su nombre sugiere un uso previsto relacionado con la verificación de veracidad o la detección de desinformación, aunque la model card no documenta explícitamente la tarea ni el conjunto de datos empleado.

El modelo cuenta con 109.483.778 parámetros según el archivo de safetensors, lo que supone 1.538 parámetros por encima del BERT base original (109.482.240), una diferencia compatible con una cabeza de clasificación lineal de dos clases (768 x 2 + 2 sesgos). El repositorio ocupa 1,8 GB y se distribuye bajo licencia Apache 2.0. La longitud de contexto heredada del modelo base es de 512 tokens.

Su relevancia actual es limitada pero concreta: es un ejemplo típico de modelo pequeño, desplegable en CPU y en GPU de consumo, útil como clasificador de primera etapa en pipelines de moderación de contenido o de filtrado previo a un LLM generativo. Sin embargo, el autor no publica información sobre el dataset, la tarea exacta ni benchmarks comparables, y el modelo registra 0 descargas y 0 likes, por lo que debe considerarse un experimento no validado externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (familia BERT), con cabeza de clasificación de secuencias |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; el modelo es convertible a INT8/FP16 mediante herramientas estándar) |
| Idiomas soportados | No disponible (el modelo base bert-base-uncased es entrenado principalmente en inglés, pero el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base: 12 capas de transformer encoder, 12 cabezas de atención, dimensión oculta de 768 y 110 millones de parámetros, con embeddings de palabras y de posiciones aprendidos. Sobre la salida del token [CLS] se añade una cabeza de clasificación, cuyo tamaño (1.538 parámetros adicionales sobre el recuento de bert-base-uncased) resulta consistente con dos clases de salida. No hay decodificación autoregresiva, ni atención lineal, ni mecanismos de decodificación especulativa: es un modelo discriminativo puro.

El entrenamiento se realizó con la librería Transformers (versión 5.16.1), PyTorch 2.11.0+cu128 y Datasets 4.8.5, mediante el Trainer. Los hiperparámetros declarados son: learning rate 2e-05, batch de entrenamiento y evaluación de 16, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, semilla 42 y 6 épocas. Con 1.149 pasos por época y un batch de 16, el conjunto de entrenamiento tendría aproximadamente 18.384 ejemplos por época. El dataset, su composición y el procedimiento de etiquetado no se documentan ("unknown dataset" según la propia model card), y no se declara ningún uso de RLHF, DPO ni datos sintéticos.

## Capacidades

- Clasificación de texto: es la única capacidad del modelo; asigna una etiqueta a una secuencia de entrada de hasta 512 tokens.
- Clasificación binaria (inferida por el tamaño de la cabeza, 2 clases): adecuada para decisiones del tipo verdadero/falso, spam/no spam o tóxico/no tóxico.
- Comprensión de contexto bidireccional dentro de la ventana de 512 tokens, gracias a la atención completa del encoder.
- Ejecución por lotes eficiente: al ser un modelo de 110 M de parámetros, permite inferencia en CPU con throughput alto para clasificación masiva.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo "thinking".
- Cobertura multilingüe: no declarada; el modelo base es predominantemente inglés.

## Casos de uso

- Moderación de contenido en plataformas: clasificar en tiempo real comentarios o publicaciones como problemáticas o no problemáticas. El modelo, con 110 M de parámetros, se ejecuta en CPU con latencia baja, lo que permite filtrar miles de elementos por minuto en un backend sin GPU.
- Filtrado previo (guardrail) en pipelines RAG: usar el clasificador como primera etapa antes de invocar un LLM generativo, descartando entradas irrelevantes o potencialmente maliciosas y reduciendo el coste de tokens del modelo grande.
- Detección de desinformación en agregadores de noticias: aplicar el modelo a titulares y entradillas para priorizar contenidos sospechosos. Su recall elevado en la evaluación (0,8417) lo hace adecuado como etapa de cribado con umbral conservador, delegando la verificación final a un humano o a un modelo mayor.
- Detección de reseñas falsas o spam en comercio electrónico: clasificar el texto de reseñas de producto y marcar las que superen un umbral de probabilidad para revisión manual.
- Detección de phishing o estafas en mensajes y correos: clasificación por lotes de cuerpos de texto cortos, integrándose en un pipeline de seguridad que actúe antes de la entrega al usuario, aprovechando la capacidad de ejecución en CPU dentro del propio servidor de correo.
- Pre-etiquetado para anotación humana: generar etiquetas automáticas sobre grandes corpus y enviar a revisión únicamente los casos con probabilidad intermedia, reduciendo el coste de anotación. El recall alto reduce el riesgo de descartar positivos reales.
- Investigación académica en detección de desinformación: servir como línea base (baseline) reproducible para comparar con arquitecturas mayores, dado que el modelo base estándar y los hiperparámetros están documentados.
- Clasificación por lotes a gran escala en infraestructura sin GPU: procesar millones de documentos con ONNX Runtime o PyTorch en CPU, dado el reducido tamaño del checkpoint (aproximadamente 438 MB en FP32).

## Benchmarks y rendimiento

El campo model-index de la model card está vacío (`results: []`), por lo que no hay benchmarks estándar (MMLU, GLUE, etc.) publicados. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor sobre un conjunto de evaluación no especificado:

| Metrica | Valor |
|---|---|
| Loss | 0,5556 |
| Accuracy | 0,6899 |
| Precision | 0,5948 |
| Recall | 0,8417 |
| F1 | 0,6970 |

Evolución declarada durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1.0 | 1149 | 0,5791 | 0,6713 | 0,5773 | 0,8333 | 0,6821 |
| 2.0 | 2298 | 0,5973 | 0,6900 | 0,6057 | 0,7665 | 0,6767 |
| 3.0 | 3447 | 0,7692 | 0,6896 | 0,6034 | 0,7778 | 0,6796 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16 para los pesos, más memoria de activaciones y del batch (típicamente menos de 1-2 GB en FP32 con batches moderados de 16 a 32 secuencias de 512 tokens).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; el modelo no necesita A100 ni H100. Una NVIDIA T4, GTX 1650, RTX 3060 o superior lo ejecuta sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer de los últimos ocho años, e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable y habitual para este tamaño; recomendable para despliegues de clasificación masiva sin GPU.
- Opciones de despliegue: pipeline de transformers (PyTorch o TensorFlow), ONNX Runtime, TorchScript, TorchServe, NVIDIA Triton, FastAPI con Uvicorn, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` está presente). Los pesos safetensors no incluyen GGUF, pero son convertibles a formatos cuantizados con herramientas externas.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|
| truthlens-textonly-model | 109,5 M | 512 tokens | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | No disponible |
| google-bert/bert-base-uncased | 109,5 M | 512 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | No aplica (modelo base sin ajustar a esta tarea) |
| ProsusAI/finbert | ~110 M | 512 tokens | No disponible en esta ficha | HuggingFace, ampliamente utilizado | No disponible (dominio financiero, no comparable directamente) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | No disponible (tarea SST-2, no comparable directamente) |

La comparación de rendimiento no es posible porque truthlens-textonly-model no declara su tarea ni su dataset, y las alternativas citadas se evalúan en conjuntos distintos. La ventaja estructural del modelo frente a DistilBERT sería su mayor capacidad (110 M frente a 67 M de parámetros), a cambio de un coste de inferencia aproximadamente un 60 % superior; frente a bert-base-uncased la diferencia es únicamente el ajuste fino sobre un dataset no documentado.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la propia model card indica "unknown dataset", por lo que no es posible evaluar la cobertura, el dominio, la calidad de las etiquetas ni el riesgo de sesgos.
- Métricas modestas: una accuracy de 0,6899 y una precisión de 0,5948 indican un rendimiento limitado; el F1 de 0,6970 está lejos de lo esperable en clasificadores BERT bien ajustados sobre datasets estándar.
- Desbalance claro hacia el recall (0,8417) frente a la precisión (0,5948): el modelo genera un número elevado de falsos positivos, lo que exige revisión humana o una segunda etapa de filtrado si se usa para decisiones automáticas.
- Ausencia de benchmarks estándar: el campo model-index aparece vacío; no hay resultados en MMLU, GLUE, SuperGLUE ni ninguna otra referencia pública que permita comparar.
- Sin documentación de uso previsto: la model card no especifica la tarea exacta, las etiquetas de salida ni los dominios recomendados, lo que impide garantizar su comportamiento fuera del conjunto de evaluación original.
- Inconsistencia en los datos de entrenamiento: se declaran 6 épocas, pero la tabla de resultados solo recoge 3, y el validation loss final reportado (0,5556) no coincide con el de la última época tabulada (0,7692). Conviene tratar las métricas con cautela.
- El validation loss empeora a partir de la segunda época (0,5791 → 0,5973 → 0,7692), señal de sobreajuste, aunque la accuracy se mantiene casi plana.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre, pero sí existe riesgo de clasificaciones erróneas con alta confianza.
- Idiomas: no declarados. Aunque bert-base-uncased está entrenado principalmente en inglés, no hay confirmación de que el ajuste fino conserve esa cobertura, y el rendimiento en castellano es desconocido.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios. No hay restricciones adicionales declaradas.
- Reputación y mantenimiento: 0 descargas, 0 likes y una única versión publicada; no hay evidencia de mantenimiento, soporte ni validación por terceros.
- Aviso adicional: el contenido de la model card es una plantilla autogenerada por el Trainer y no ha sido completada por el autor ("More information needed" en todas las secciones relevantes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sree6464/truthlens-textonly-model
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper original de BERT: https://arxiv.org/abs/1810.04805
- Documentación de transformers: https://huggingface.co/docs/transformers/index
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos (refpedi.hu, refpedi.esolr.me, facebook.com/refpedint) corresponden al Református Pedagógiai Intézet y no guardan relación con el modelo.
