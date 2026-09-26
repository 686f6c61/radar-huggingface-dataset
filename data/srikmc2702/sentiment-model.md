# srikmc2702/sentiment-model

## Resumen

`srikmc2702/sentiment-model` es un clasificador de texto en ingles obtenido mediante ajuste fino supervisado de `distilbert-base-uncased` para una tarea de analisis de sentimiento. Lo publica el usuario srikmc2702 en Hugging Face, con licencia Apache 2.0 y 66.955.779 parametros en formato safetensors. Se trata de un modelo pequeno (clase DistilBERT, 6 capas) pensado para clasificacion de secuencias cortas, no para generacion.

El problema que resuelve es la clasificacion binaria o multiclase de polaridad (positivo/negativo, o categorias similares) sobre fragmentos de texto en ingles de hasta 512 tokens. Su relevancia practica es limitada: las metricas declaradas en la model card (accuracy 0,6821, F1 weighted 0,6736, F1 macro 0,6736) quedan por debajo de las de clasificadores de sentimiento publicos consolidados, y la propia ficha reconoce que el dataset de entrenamiento es desconocido ("unknown dataset"). Es util, por tanto, como punto de partida reproducible o como linea base de bajo coste, no como solucion de produccion.

El modelo no incluye informacion sobre idiomas declarados, composicion del dataset ni proceso de alineacion (RLHF/DPO). La model card es en gran medida la plantilla autogenerada por el `Trainer` de Hugging Face, con secciones "More information needed" sin completar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT base) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo estandar de la familia BERT/DistilBERT; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas en el repo) |
| Idiomas soportados | no disponible (modelo base `distilbert-base-uncased`, entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas, 12 cabezas de atencion y dimension oculta 768, obtenido por destilacion del BERT base (12 capas). Reduce aproximadamente un 40% los parametros del modelo original manteniendo cerca del 97% de su rendimiento en GLUE segun los autores de DistilBERT. Sobre esta base se anade una cabeza de clasificacion (`DistilBertForSequenceClassification`) ajustada para la tarea de sentimiento; el numero de etiquetas no se especifica en la model card.

El ajuste fino se realizo durante 3 epocas con learning rate 2e-5, batch size 32 (train y eval), semilla 42, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), scheduler lineal y sin argumentos adicionales de optimizador. El dataset de entrenamiento no se documenta ("unknown dataset"). No se menciona ningun proceso de RLHF, DPO ni ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.). Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: asignacion de una etiqueta de sentimiento a una secuencia de entrada mediante la pipeline `text-classification`.
- Salida de probabilidades por clase (`scores`) y etiqueta predicha (`label`), segun el comportamiento estandar de la pipeline de transformers.
- Procesamiento de secuencias cortas y medianas en ingles, hasta 512 tokens.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte declarado de tool calling, function calling ni uso como agente.
- No hay capacidades multilingues declaradas; el vocabulario `uncased` esta orientado a ingles.
- No dispone de modo "thinking", audio ni ninguna capacidad especial.

## Casos de uso

- Linea base en experimentos academicos: sirve como referencia rapida de rendimiento minima al comparar nuevos clasificadores de sentimiento en el mismo conjunto de evaluacion, dado su bajo coste de entrenamiento (174 pasos en total).
- Etiquetado asistido de datos a pequena escala: uso del modelo como preanotador de sentimiento en lotes de texto corto en ingles, con revision humana posterior para corregir los errores (accuracy 0,68 implica una tasa de fallo relevante).
- Filtrado previo en moderacion de contenido: descarte rapido de comentarios claramente positivos o negativos en un pipeline donde solo los casos ambiguos pasan a revision manual o a un modelo mayor.
- Analisis exploratorio de opiniones en prototipos: clasificacion de resenas de productos o mensajes de usuarios en ingles para validar una hipotesis de producto antes de invertir en un modelo de mayor calidad.
- Servicio de inferencia de bajisimo coste: por su tamano (0,3 GB de repo) puede desplegarse en CPU o en una GPU modesta para atender clasificacion de sentimiento en tiempo real dentro de un backend.
- Enrutado de tickets de soporte: uso del sentimiento predicho como senal auxiliar para priorizar colas de atencion, combinado con otras reglas de negocio, sin depender unicamente de la prediccion.
- Demostracion educativa: ejemplo reproducible de ajuste fino con `Trainer` para ilustrar el flujo completo (tokenizacion, entrenamiento, evaluacion) en cursos y tutoriales.

## Benchmarks y rendimiento

Los unicos datos disponibles son las metricas declaradas por el autor en la model card. El campo `model-index` del README aparece con la lista de resultados vacia, por lo que no hay benchmarks externos verificados (MMLU, GLUE, etc.) en la informacion proporcionada.

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,7117 |
| Accuracy | 0,6821 |
| F1 weighted | 0,6736 |
| F1 macro | 0,6736 |

Evolucion durante el entrenamiento (datos declarados por el autor):

| Training loss | Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se dispone de comparaciones de benchmarks frente a otros modelos en la informacion proporcionada mas alla de estos valores.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 268 MB para los pesos, mas activaciones y overhead; en la practica encaja en cualquier GPU con 1-2 GB libres.
- VRAM estimada en FP16/BF16: alrededor de 134 MB de pesos.
- VRAM estimada en INT8 dinamico (cuantizacion en PyTorch): alrededor de 67 MB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100, H100 ni GPUs de datacenter. Una GTX 1650, RTX 3060 o superior es mas que suficiente, e incluso una GPU integrada puede servir.
- Inferencia en CPU: viable en cualquier CPU moderna, incluidos entornos de bajos recursos, dado el tamano del modelo.
- Opciones de despliegue: pipeline de `transformers`, servidor con FastAPI + PyTorch, exportacion a ONNX Runtime o TorchScript, TorchServe y vLLM (que soporta tareas de clasificacion). No hay pesos GGUF publicados, por lo que `llama.cpp` y Ollama no son aplicables directamente sin conversion previa.
- Latencia y throughput: no disponible (no se publican mediciones). Por tamano, se espera un throughput alto en CPU y GPU, pero no hay cifras verificadas.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| srikmc2702/sentiment-model | 66.955.779 | 512 tokens (estandar DistilBERT) | Clasificacion de sentimiento | Apache 2.0 | Accuracy 0,6821; F1 0,6736 |
| distilbert-base-uncased | ~66,9 M | 512 tokens | Modelo base preentrenado | Apache 2.0 | no disponible |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificacion de sentimiento (SST-2) | Apache 2.0 | no disponible en la informacion proporcionada |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base preentrenado | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- Accuracy de 0,6821 y F1 macro de 0,6736: el modelo comete errores en aproximadamente uno de cada tres ejemplos del conjunto de evaluacion, lo que lo aleja de un uso en produccion sin supervision humana.
- Dataset de entrenamiento desconocido: la model card no documenta la procedencia, el tamano ni la composicion de los datos, lo que impide evaluar sesgos, cobertura de dominio o riesgos de fuga de datos.
- Idiomas: no se declaran idiomas soportados. El modelo base esta entrenado principalmente en ingles y el tokenizador es `uncased`, por lo que el rendimiento fuera del ingles es muy probablemente pobre y no esta medido.
- Numero de etiquetas y significado de las mismas no especificado en la ficha; es necesario inspeccionar `config.json` para conocer las clases reales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en las probabilidades de clase y de sesgo heredado del corpus de ajuste no documentado.
- La model card contiene secciones sin completar ("More information needed") y el `model-index` sin resultados, lo que reduce la trazabilidad del modelo.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, sin restricciones adicionales. Hay que conservar el aviso de licencia y el aviso de copyright.
- Repositorio sin descargas ni "likes" en el momento de la consulta (0 descargas, 0 likes), lo que indica ausencia de validacion por parte de la comunidad.
- No hay versiones cuantizadas publicadas ni artefactos ONNX/GGUF listos para usar; cualquier optimizacion de despliegue requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srikmc2702/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (referencia de la arquitectura base): https://arxiv.org/abs/1910.01108
- Paper de BERT (arquitectura original): https://arxiv.org/abs/1810.04805
- Documentacion de la pipeline de clasificacion de texto de transformers: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
