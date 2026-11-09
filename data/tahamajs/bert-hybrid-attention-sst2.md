# tahamajs/bert-hybrid-attention-sst2

## Resumen

`tahamajs/bert-hybrid-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `hybrid_attention` de la libreria NeuralOps, desarrollada por Taha Majlesi (tahamajs). El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE (analisis de sentimiento binario en ingles) mediante el protocolo de destilacion en dos etapas de NeuralOps, con cacheado offline de representaciones del profesor.

El interes tecnico del modelo no esta en su calidad final, sino en la infraestructura que demuestra: un pipeline de sustitucion de atencion y destilacion de conocimiento que se ejecuta en una unica RTX 3090 en menos de 50 segundos, sin requerir el modelo profesor en VRAM durante la fase de destilacion. Es un ejemplo reproducible de atencion subcuadratica aplicada a un transformer preentrenado.

El rendimiento predictivo es, sin embargo, muy limitado: el modelo alcanza un 50,92 % de accuracy en el split de validacion de SST-2 (872 muestras), apenas 1,83 puntos por encima del azar y muy lejos del 91,63 % del profesor BERT-base. Se trata, por tanto, de una pieza de investigacion sobre arquitecturas de atencion, no de un clasificador listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con las 12 capas de atencion sustituidas por `hybrid_attention` (NeuralOps) |
| Parametros totales | no disponible (hereda el tamano de bert-base-uncased, ~110 M, segun el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la de bert-base-uncased es 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB en Hugging Face Hub; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza todas las capas de self-attention multi-cabeza por el mecanismo `hybrid_attention` de NeuralOps, orientado a atencion subcuadratica. La model card no detalla la formulacion interna de `hybrid_attention` (composicion exacta de atencion local, global o lineal), por lo que no es posible describir su complejidad asintotica a partir de la informacion disponible.

El entrenamiento consiste en una destilacion de conocimiento desde el BERT-base original (profesor) hacia el estudiante con atencion hibrida, sobre GLUE SST-2, usando el protocolo "2-Stage Cached Representation Distillation" de NeuralOps con cacheado offline de representaciones (el profesor no ocupa VRAM durante la destilacion). El curriculum tiene dos etapas: la primera alinea representaciones ocultas con similitud coseno y MSE en subespacio; la segunda aplica KL sobre logits de secuencia mas entropia cruzada de la tarea. La ejecucion se realizo en una RTX 3090 de 24 GB (cluster HPC de Sharif), con 202 pasos, 49,7 s de duracion, 33 298,2 tokens/s de throughput y un pico de 12 029 MB de VRAM.

## Capacidades

- Clasificacion de texto binaria (analisis de sentimiento positivo/negativo) sobre frases en ingles, segun el pipeline `text-classification`.
- Inferencia via `transformers` con `trust_remote_code=True` y via la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue: solo ingles.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Investigacion sobre mecanismos de atencion: sirve como punto de partida reproducible para comparar `hybrid_attention` frente a atencion estandar en un backbone BERT-base, con un script de destilacion que cabe en una sola GPU de consumo.
- Prototipado de pipelines de sustitucion de atencion: el flujo (cargar BERT, reemplazar capas, destilar con representaciones cacheadas) es reutilizable para probar otras variantes del "attention zoo" de NeuralOps sobre tareas GLUE.
- Experimentos de destilacion con VRAM limitada: el cacheado offline de representaciones permite reproducir la destilacion en GPUs de 24 GB o menos sin instanciar el profesor durante el entrenamiento.
- Docencia y formacion: ejemplo minimo y de ejecucion rapida (menos de un minuto) para ilustrar destilacion en dos etapas y alineamiento de representaciones ocultas.
- Baseline negativo de referencia: util para contrastar cuanto degrada la sustitucion de atencion sin un reentrenamiento completo, dado que el estudiante queda en el 50,92 % de accuracy.
- Validacion de integracion con la libreria NeuralOps: permite verificar que el pipeline de carga (`load_pretrained_bert`) y el registro en el Hub funcionan de extremo a extremo.

## Benchmarks y rendimiento

Evaluacion en el split de validacion de GLUE SST-2 (872 muestras), segun la model card:

| Metrica | Profesor (BERT-base) | Estudiante pre-KD | Modelo destilado | Delta vs pre-KD |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 49,08 % | 50,92 % | +1,83 % |
| Validation loss | 0,2428 | no disponible | 0,7200 | no disponible |

Telemetria de entrenamiento: 202 pasos, 49,7 s, 33 298,2 tokens/s, pico de 12 029 MB de VRAM en RTX 3090.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita; el repo ocupa 0,5 GB, por lo que en fp32 el modelo (~110 M de parametros heredados de BERT-base) deberia caber en GPUs de consumo con 4-8 GB, aunque este dato no esta confirmado en la model card.
- GPU de entrenamiento documentada: NVIDIA RTX 3090 de 24 GB (pico de 12 029 MB durante la destilacion).
- Cabe en GPU de consumo: si, segun la telemetria de entrenamiento en RTX 3090; no se documentan pruebas en GPUs de gama inferior.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica throughput de entrenamiento (33 298,2 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-hybrid-attention-sst2` | ~110 M (heredados) | no disponible | 50,92 % | MIT | Hugging Face Hub |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (segun esta model card) | Apache 2.0 | Hugging Face Hub |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face Hub |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face Hub |

La comparativa se limita a los datos publicados en la model card del modelo evaluado; no se dispone de resultados verificados de los alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo: 50,92 % de accuracy en SST-2 esta practicamente a nivel de azar para una tarea binaria; no es apto para uso en produccion.
- Brecha grande respecto al profesor: 40,71 puntos porcentuales de accuracy por debajo de BERT-base, lo que indica que la destilacion no ha recuperado la capacidad del modelo original.
- Sesgos: no se documenta ninguna evaluacion de sesgo; al derivar de `bert-base-uncased` y entrenarse solo en SST-2, hereda los sesgos del corpus de resenas de cine en ingles.
- Riesgo de alucinacion: no aplica en sentido estricto por ser un clasificador, pero las predicciones no son fiables dado el bajo accuracy.
- Idioma: solo ingles; no se ha validado en castellano ni en otros idiomas.
- Contexto: no se confirma en la model card la longitud maxima de secuencia del modelo hibrido; asumir 512 tokens sin verificacion es arriesgado.
- Licencia MIT: permite uso comercial, pero la baja calidad del modelo desaconseja cualquier despliegue real.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- Fecha de publicacion futura en los metadatos (2026-11-09), lo que sugiere que el modelo forma parte de un proyecto de investigacion en curso y puede cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-hybrid-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
