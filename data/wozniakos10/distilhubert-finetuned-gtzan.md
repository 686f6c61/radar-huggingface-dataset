# wozniakos10/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificación de audio publicado por el usuario wozniakos10 en Hugging Face. Se trata de un ajuste fino (fine-tuning) supervisado del modelo ntu-spml/distilhubert, un codificador transformer destilado a partir de HuBERT para representaciones de audio, sobre el dataset GTZAN de géneros musicales. El resultado es un clasificador de género musical de 10 clases con 23.691.402 parámetros y un peso en disco de aproximadamente 0,1 GB, lo que lo convierte en un modelo muy ligero y desplegable incluso en CPU.

El problema que resuelve es concreto: dada una señal de audio musical, asignarle una etiqueta de género dentro del conjunto de etiquetas de GTZAN. Su relevancia práctica no está en la novedad técnica —es un ajuste fino estándar generado con el Trainer de Transformers— sino en su tamaño reducido y en su licencia Apache 2.0, que permiten integrarlo en pipelines de etiquetado masivo, sistemas de recomendación o demos educativas sin coste de licencia y con requisitos de hardware mínimos.

El autor no ha documentado la descripción del modelo, los usos previstos ni la composición exacta de los datos de entrenamiento más allá del dataset utilizado (marsyas/gtzan). La model card se generó automáticamente con el Trainer y buena parte de sus secciones contienen el literal "More information needed". La única métrica declarada es una precisión (accuracy) de 0,86 sobre el conjunto de evaluación, marcada como no verificada en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder sobre representaciones de audio, derivado de HuBERT mediante destilación (modelo base: ntu-spml/distilhubert). No es MoE ni SSM |
| Parámetros totales | 23.691.402 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; la entrada es una forma de onda, no una secuencia de texto) |
| Tipos de cuantización | no disponible. El repositorio publica pesos en safetensors sin variantes cuantizadas; la conversión a ONNX o INT8 es responsabilidad del usuario |
| Idiomas soportados | no disponible / no aplica (clasificación de audio musical; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 0,1 GB) |

Otros datos relevantes: tarea declarada `audio-classification`, pipeline de Hugging Face `audio-classification`, dataset de ajuste `marsyas/gtzan`, etiqueta `endpoints_compatible` (compatible con Inference Endpoints), etiqueta `generated_from_trainer`.

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base ntu-spml/distilhubert: un codificador transformer de tipo HuBERT destilado, que transforma la forma de onda de audio en representaciones ocultas mediante un extractor convolucional previo y una pila reducida de capas de atención. El modelo original de HuBERT emplea 12 capas; la variante destilada reduce ese número drásticamente manteniendo una dimensión oculta de 768, lo que explica el recuento total de 23,7 millones de parámetros. Sobre esa base, este repositorio añade una cabeza de clasificación de 10 clases, correspondientes a los géneros del dataset GTZAN. Para audio a 16 kHz, el extractor convolucional del modelo base produce del orden de 1.500 tramas por cada 30 segundos de señal, que es la duración típica de los clips de GTZAN. Estos detalles de arquitectura proceden de la documentación pública del modelo base y no están verificados en la información proporcionada por el autor.

El procedimiento de entrenamiento sí está documentado en la model card. Se usó el Trainer de Transformers con optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, learning rate de 5e-05, scheduler coseno con 100 pasos de calentamiento, tamaño de lote de 16 tanto en entrenamiento como en evaluación, semilla 42, mixed precision nativa (AMP), factor de suavizado de etiquetas de 0,1 y un máximo declarado de 50 épocas. No se indica el número de tokens, horas de audio ni la composición del dataset de destilación del modelo base. Tampoco se documenta ninguna etapa de RLHF, DPO o preferencias humanas, algo esperable en un clasificador y no en un modelo generativo. Es destacable que la tabla de resultados de entrenamiento se detiene en la época 18, muy por debajo de las 50 épocas declaradas en los hiperparámetros, sin que el autor explique si el entrenamiento se interrumpió, si se aplicó parada temprana o si la tabla está incompleta.

## Capacidades

- Clasificación de audio musical en 10 categorías de género, con una precisión declarada de 0,86 sobre el conjunto de evaluación de GTZAN.
- Extracción de representaciones de audio reutilizables: al derivar de DistilHuBERT, el cuerpo del modelo puede emplearse con fines de embedding para otras tareas de audio, aunque el autor no documenta este uso.
- Inferencia sobre formas de onda de audio a 16 kHz mediante el pipeline `audio-classification` de la librería transformers.
- Modelo muy ligero: 23,7 millones de parámetros, ejecutable en CPU con latencias razonables para clips cortos.
- No dispone de generación de texto.
- No dispone de razonamiento, matemáticas ni generación de código.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: no procesa texto.
- No dispone de visión ni de audio generativo; solo clasificación.
- No se documenta ningún modo especial (thinking mode, decodificación especulativa, atención lineal u otros).

## Casos de uso

- Etiquetado automático de bibliotecas musicales: procesar un catálogo de archivos de audio y asignar a cada pista una etiqueta de género de las 10 disponibles, con revisión humana de los casos de baja confianza. El tamaño del modelo (0,1 GB) permite ejecutarlo en paralelo sobre muchos procesos sin saturar la GPU.
- Señal auxiliar en sistemas de recomendación: usar la etiqueta de género como característica de entrada en un motor de recomendación, combinada con otras señales (tempo, energía, comportamiento del usuario). Es adecuado porque su coste computacional permite clasificar el catálogo completo de forma periódica.
- Preprocesado en pipelines de moderación o catalogación de contenido: filtrar y organizar grandes volúmenes de audio subido por usuarios antes de un análisis más caro, aprovechando que el modelo cabe en CPU y no requiere GPU dedicada.
- Auto-etiquetado de datasets para entrenar modelos mayores: generar etiquetas preliminares de género sobre audio no anotado, que después se curan manualmente. La licencia Apache 2.0 permite usar el modelo y sus salidas sin restricciones comerciales.
- Baseline reproducible en investigación de recuperación de información musical (MIR): sirve como punto de comparación ligero frente a modelos más grandes sobre GTZAN, dado que el ajuste fino y sus hiperparámetros están documentados en la model card.
- Integración en herramientas de organización de listas de reproducción: aplicaciones de escritorio o móviles que agrupan la música local del usuario por género sin enviar audio a un servicio externo, gracias a que el modelo es ejecutable en local.
- Demostraciones docentes y prototipos: ejemplo de ajuste fino de un modelo de audio con el Trainer de Transformers, útil en cursos y talleres por su corto tiempo de entrenamiento y su reducido tamaño.
- Despliegue en endpoints serverless: la etiqueta `endpoints_compatible` y los 23,7 millones de parámetros permiten servirlo en infraestructura de bajo coste con arranque rápido.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,86 | no |
| Evaluación | GTZAN | Loss | 0,9233 | no |

Evolución durante el entrenamiento (extracto de la tabla publicada por el autor; el registro se detiene en la época 18):

| Época | Paso | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1 | 57 | 2,1960 | 0,35 |
| 4 | 228 | 1,2480 | 0,71 |
| 7 | 399 | 0,9815 | 0,81 |
| 10 | 570 | 0,9876 | 0,79 |
| 13 | 741 | 0,9233 | 0,86 |
| 16 | 912 | 0,9102 | 0,85 |
| 18 | 1026 | 0,9275 | 0,83 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con modelos de referencia ni desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,1 GB en fp32 (23,7 M de parámetros) y aproximadamente 0,05 GB en fp16, más el espacio de activaciones, que es reducido para clips de 30 segundos. En la práctica, menos de 1 GB de memoria total del proceso.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, T4, etc.). No requiere A100, H100 ni GPU de centro de datos.
- Cabe sin problema en GPU de consumo e incluso en CPU: es un modelo apto para Raspberry Pi o portátiles sin GPU dedicada, siempre que se acepte una latencia mayor.
- Opciones de despliegue: pipeline de transformers (PyTorch), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime, TorchServe, NVIDIA Triton o FastAPI con un wrapper propio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que son motores orientados a modelos generativos de texto.
- Latencia y throughput: no disponible. No se publican mediciones. Como estimación orientativa no verificada, la inferencia de un clip de 30 segundos debería resolverse en decenas de milisegundos en una GPU moderna y en el orden de décimas de segundo en CPU, dado el reducido número de parámetros y las dos capas de atención del modelo destilado.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Accuracy en GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wozniakos10/distilhubert-finetuned-gtzan | 23,7 M | Clasificación de género (10 clases) | Audio a 16 kHz, clips de 30 s | 0,86 (no verificado) | Apache 2.0 | Hugging Face |
| ntu-spml/distilhubert (modelo base) | 23,5 M aprox. | Representaciones de audio; sin cabeza de género | Audio a 16 kHz | no disponible (no ajustado a GTZAN) | Apache 2.0 | Hugging Face |
| facebook/hubert-base-ls960 | 94,7 M aprox. | Representaciones de audio; sin cabeza de género | Audio a 16 kHz | no disponible | MIT | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 (Audio Spectrogram Transformer) | 86,6 M aprox. | Clasificación de audio (AudioSet) | Espectrograma Mel | no disponible | BSD-3-Clause | Hugging Face |

Los recuentos de parámetros de los modelos alternativos son valores de referencia públicos que no aparecen en la información proporcionada y no se han verificado aquí. No se dispone de datos de accuracy en GTZAN para ninguno de los modelos comparados, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- La model card está generada automáticamente y las secciones de descripción, usos previstos y datos de entrenamiento contienen "More information needed". No hay guía del autor sobre el uso previsto.
- La precisión de 0,86 está marcada como `verified: false` en el model-index. No hay evaluación independiente ni desglose por clase, por lo que géneros con menos representación o acústicamente solapados pueden tener un rendimiento muy inferior a la media.
- No se documenta la estrategia de partición del dataset GTZAN (train/validación). Esto impide descartar fuga de información entre particiones, un problema documentado en la literatura sobre este corpus (etiquetas erróneas, repeticiones y posible solapamiento de artista entre particiones). La cifra de 0,86 debe interpretarse con cautela hasta que se reproduzca con una partición limpia y publicada.
- La tabla de entrenamiento se corta en la época 18 pese a declarar 50 épocas en los hiperparámetros. Se desconoce si el modelo final corresponde a la mejor época, a la última registrada o a otra intermedia.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no genera texto), pero sí existe riesgo de clasificaciones erróneas con alta confianza en audio fuera de distribución (grabaciones de campo, voz, mezclas de géneros o música no occidental).
- Limitación de dominio: el modelo está ajustado a 10 géneros de GTZAN y a clips de aproximadamente 30 segundos. No se ha validado sobre fragmentos más cortos, audio en directo ni catálogos con taxonomías de género distintas o más finas.
- Limitación de idioma: no aplica; el modelo no procesa texto. No debe usarse para tareas de lenguaje.
- Licencia: Apache 2.0, permisiva y apta para uso comercial. El dataset GTZAN, en cambio, tiene sus propias condiciones de uso que conviene revisar por separado antes de reutilizar los datos.
- Sin soporte de tool calling, agentes ni generación: no es un modelo de propósito general y no debe presentarse como tal ante usuarios finales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y sin mantenimiento conocido: no hay garantía de soporte, corrección de errores ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wozniakos10/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Modelo HuBERT original (facebook/hubert-base-ls960): https://huggingface.co/facebook/hubert-base-ls960
- Artículo de HuBERT: https://arxiv.org/abs/2106.07447
- Artículo de DistilHuBERT: https://arxiv.org/abs/2110.01900
- Audio Spectrogram Transformer (referencia comparativa): https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
