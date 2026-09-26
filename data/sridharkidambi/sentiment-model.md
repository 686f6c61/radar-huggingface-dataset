# sridharkidambi/sentiment-model

## Resumen

`sridharkidambi/sentiment-model` es un modelo de clasificación de texto (análisis de sentimiento) publicado en HuggingFace por el usuario sridharkidambi. Se trata de un ajuste fino (fine-tuning) de `distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face, y se distribuye mediante la librería `transformers` con pesos en formato safetensors. El repositorio tiene un tamano de 0,3 GB y 66.955.779 parametros totales, coherente con la arquitectura DistilBERT base (6 capas, 12 cabezas de atencion, dimension oculta 768).

El modelo resuelve la tarea de clasificacion de sentimiento sobre texto en ingles, con una cabecera de clasificacion entrenada sobre un conjunto de datos que el autor no especifica en la model card. Los resultados declarados en el conjunto de evaluacion son modestos: accuracy de 0,6598, F1 weighted de 0,6493 y F1 macro de 0,6493, con una perdida de 0,7470 tras 3 epocas de entrenamiento. La model card esta generada automaticamente por el `Trainer` de Hugging Face y contiene secciones sin completar ("More information needed") en descripcion, usos previstos y datos de entrenamiento.

Su relevancia practica es limitada y muy acotada: sirve como ejemplo reproducible de un pipeline de fine-tuning con `transformers`, como punto de partida para experimentos propios de clasificacion de sentimiento y como caso de estudio de un modelo con bajo numero de descargas (0) y sin likes (0). No es un modelo de proposito general: no genera texto, no soporta tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT); 6 capas, 12 cabezas, hidden size 768 |
| Parametros totales | 66.955.779 (66,96 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de DistilBERT) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar; no hay GGUF ni versiones INT8/INT4 publicadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el tokenizador base es `distilbert-base-uncased`, con vocabulario WordPiece en ingles de 30.522 tokens) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), compatible con `transformers` |
| Pipeline declarado | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Framework de entrenamiento | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT: seis capas de atencion multi-cabeza con 12 cabezas, dimension oculta de 768 y embeddings de posicion de hasta 512 tokens. DistilBERT es el resultado de destilar `bert-base-uncased` (12 capas, 110 M de parametros) reduciendo el numero de capas a la mitad y conservando aproximadamente el 97 % del rendimiento del profesor en tareas de comprension del lenguaje segun su publicacion original; en este caso, sobre ese tronco preentrenado se anyade una cabecera de clasificacion (`DistilBertForSequenceClassification`) y se ajusta de extremo a extremo.

El entrenamiento se realizo con el `Trainer` de Hugging Face durante 3 epocas, con `learning_rate` 2e-05, `train_batch_size` y `eval_batch_size` de 32, semilla 42, optimizador `AdamW` (variante fused, betas 0,9/0,999, epsilon 1e-08) y planificador lineal de learning rate. El conjunto de datos de entrenamiento no esta documentado en la model card ("on an unknown dataset"), por lo que se desconoce el numero de tokens, la composicion del corpus, el numero de clases de la cabecera de salida y si se aplico RLHF, DPO o cualquier otra etapa de alineacion (en un modelo discriminativo de este tipo no serian de aplicacion). Tampoco se documentan tecnicas de regularizacion, aumento de datos ni busqueda de hiperparametros.

## Capacidades

- Clasificacion de texto: asignacion de una etiqueta de sentimiento a una secuencia de entrada. El numero exacto de clases de salida no esta documentado en la model card.
- Inferencia discriminativa por secuencia: no genera texto libre ni completaciones; devuelve logits y probabilidades por clase.
- Procesamiento por lotes: al ser un encoder de 67 M de parametros, permite batch grande en GPU modesta y en CPU.
- Longitud de entrada de hasta 512 tokens con truncado estandar de `transformers`.
- Compatibilidad directa con `pipeline("text-classification")` y con `Trainer`/`AutoModelForSequenceClassification`.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; no declaradas por el autor.
- Capacidades especiales (modo thinking, vision, audio): ninguna.

## Casos de uso

- Filtrado de opiniones en un sitio web o foro: clasificar comentarios de usuarios por polaridad antes de publicarlos o de enviarlos a un panel de moderacion, descartando el texto con una etiqueta automatica.
- Enrutado de tickets de soporte: usar el sentimiento como senal auxiliar para priorizar colas de atencion (por ejemplo, desviar los tickets con sentimiento negativo a agentes senior).
- Monitorizacion de menciones de marca: procesar lotes de tweets o resenas en ingles para agregar tendencia de sentimiento a lo largo del tiempo; el modelo cabe en una GPU de gama media y procesa lotes grandes.
- Etiquetado asistido para construir datasets: pre-anotar corpus en ingles que despues se revisan manualmente, aprovechando el bajo coste de inferencia de un encoder destilado.
- Segunda opinion en analisis de encuestas NPS o de satisfaccion: clasificar respuestas de texto abierto en ingles y correlacionarlas con la puntuacion numerica.
- Docencia y prototipado: ejemplo reproducible de fine-tuning de DistilBERT con el `Trainer`, util como plantilla para comparar tecnicas de ajuste fino en experimentos academicos.
- Analisis offline de repositorios de resenas: inferencia por lotes en CPU con ONNX Runtime para procesar volumenes grandes sin GPU, dado el reducido tamano del modelo.
- Evaluacion comparativa de pipelines de NLP: referencia de un ajuste fino con bajo rendimiento declarado frente a alternativas ya publicadas en la misma categoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (no se han publicado otros):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion durante el entrenamiento (tabla incluida en la model card):

| Training loss | Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

El `model-index` de la model card no contiene entradas de resultados (`"results": []`), por lo que no hay comparaciones con otros modelos publicadas por el autor. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ya que no son aplicables a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 268 MB para los pesos (66,96 M de parametros x 4 bytes), mas activaciones y memoria del tokenizador.
- VRAM estimada en FP16/BF16: aproximadamente 134 MB de pesos.
- VRAM estimada cuantizado a INT8: aproximadamente 67 MB; a 4 bits, aproximadamente 34 MB.
- Cabe sin problemas en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, y tambien en CPU de portatil para inferencia en lotes pequenos.
- GPU de centro de datos (A100, H100, L40S) no son necesarias; se pueden usar para procesar lotes muy grandes o para servir muchas peticiones concurrentes.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime con `optimum` (exportacion factible, no publicada en el repo), TorchScript, NVIDIA Triton Inference Server, Hugging Face Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`) y un servicio propio con FastAPI + Uvicorn.
- vLLM, TGI y llama.cpp no son las herramientas adecuadas para este modelo: no es un modelo generativo y no se publican pesos GGUF. TGI soporta tareas de clasificacion de forma limitada, pero no es el camino recomendado.
- Latencia y throughput: no disponible. No se han publicado mediciones oficiales; al tratarse de un DistilBERT, la inferencia es de milisegundos por lote en GPU moderna y de decenas de milisegundos por lote en CPU, pero estos valores son estimaciones dependientes del hardware y del tamano de lote, no datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado / comentario |
|---|---|---|---|---|
| sridharkidambi/sentiment-model | 66,96 M | 512 tokens | apache-2.0 | Ajuste fino sobre dataset no documentado; accuracy declarada 0,6598; 0 descargas |
| distilbert-base-uncased (modelo base) | 66,96 M | 512 tokens | apache-2.0 | Tronco preentrenado sin cabecera de clasificacion; requiere fine-tuning para la tarea |
| distilbert-base-uncased-finetuned-sst-2-english | 66,96 M | 512 tokens | apache-2.0 | Ajuste fino binario sobre SST-2, ampliamente utilizado y validado en produccion; rendimiento declarado por Hugging Face superior al de esta ficha |
| bert-base-uncased (fine-tuned para sentimiento) | 110 M | 512 tokens | apache-2.0 | Mas capacidad que DistilBERT, con mayor coste de inferencia y VRAM |
| roberta-base (fine-tuned para sentimiento) | 125 M | 512 tokens | mit | Arquitectura RoBERTa, entrenamiento mas robusto; requiere mas recursos que DistilBERT |

No se dispone de comparaciones numericas publicadas por el autor entre este modelo y las alternativas, por lo que la tabla se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento estan sin rellenar ("More information needed"). No se puede auditar con que datos se entreno ni que clases predice.
- Rendimiento bajo y sin validacion externa: accuracy de 0,6598 y F1 macro de 0,6493 en el propio conjunto de evaluacion del autor. La perdida de validacion deja de mejorar entre la epoca 2 y la 3, lo que sugiere sobreajuste o un dataset muy reducido (174 pasos de entrenamiento en total, con batch de 32).
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo demografico, de dominio ni de anotacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en textos fuera del dominio de entrenamiento.
- Idioma: el tokenizador base es `uncased` en ingles; el comportamiento con texto en castellano u otros idiomas no esta documentado ni validado. No se recomienda su uso multilingue sin evaluacion previa.
- Limite de contexto de 512 tokens; los textos mas largos se truncan, con la consiguiente perdida de informacion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia. Al derivar de `distilbert-base-uncased` (tambien Apache 2.0), no hay restricciones adicionales conocidas.
- Ausencia de traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no ha sido validado por terceros en produccion.
- No apto para tareas generativas, de razonamiento, de codigo o de agentes.
- Numero de clases de salida no documentado: es necesario inspeccionar el `config.json` antes de integrarlo para saber si es clasificacion binaria o multiclase.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sridharkidambi/sentiment-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo base (referencia alternativa): https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de `transformers` para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentacion del `Trainer` de Hugging Face: https://huggingface.co/docs/transformers/main_classes/trainer
