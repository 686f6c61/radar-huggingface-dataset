# uGAliok/bge-small-ner

## Resumen

bge-small-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning supervisado del modelo de embeddings BAAI/bge-small-en-v1.5. Lo publica el usuario uGAliok en Hugging Face bajo licencia MIT y esta pensado exclusivamente para token classification, no para generacion de texto. Con 33.215.625 parametros (unos 133 MB en fp32), es un modelo de tamano muy reducido que puede ejecutarse en CPU o en cualquier GPU consumer sin practicamente consumo de VRAM.

El modelo parte de una arquitectura tipo BERT (encoder bidireccional con atencion completa) y se ha entrenado durante 5 epocas con el Trainer de Hugging Face sobre un dataset no especificado en la model card. Los resultados declarados por el autor en el conjunto de evaluacion son F1 de 0.8912, precision de 0.8722, recall de 0.9110 y accuracy de 0.9796, con una perdida final de 0.0892. Se desconoce el esquema de etiquetas (no hay id2label publicado), el dominio del corpus de entrenamiento y la composicion del dataset.

Su relevancia es la de un artefacto de fine-tuning reproducible y ligero: sirve como punto de partida para tareas de extraccion de entidades en ingles, como base para comparar estrategias de entrenamiento sobre bge-small y como ejemplo de pipeline completo (Transformers 4.50.0, PyTorch 2.11.0). No obstante, al no declarar dataset ni etiquetas y tener cero descargas, debe tratarse como un experimento no validado externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder bidireccional, tag `bert` en Hugging Face) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base BAAI/bge-small-en-v1.5 trabaja con ventanas de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base esta orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | token-classification |
| Tamano del repositorio | 0.1 GB |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base BAAI/bge-small-en-v1.5, un encoder tipo BERT con atencion bidireccional completa, adaptado aqui con una cabeza de clasificacion de tokens. El fine-tuning se realizo con el Trainer de Hugging Face y los hiperparametros documentados son: learning rate 2e-05, tamano de batch de entrenamiento y evaluacion de 16, 5 epocas, optimizador AdamW Torch (betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal y semilla 42. El entrenamiento completo consta de 3125 pasos (625 por epoca), lo que con batch 16 equivale a aproximadamente 10.000 ejemplos por epoca, es decir, en torno a 50.000 ejemplos vistos en total.

La model card indica explicitamente que el dataset de entrenamiento es desconocido ("on an unknown dataset"), que no se describe el procedimiento de anotacion ni el esquema de entidades, y que no se documento informacion adicional sobre usos previstos o limitaciones. No se menciona uso de RLHF, DPO ni ninguna innovacion tecnica adicional: es un fine-tuning supervisado estandar sobre el corpus de evaluacion. Las versiones de framework empleadas fueron Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

## Capacidades

- Etiquetado de tokens (token classification): asignacion de una etiqueta BIO o similar a cada token de la secuencia de entrada.
- Extraccion de entidades nombradas en textos en ingles, segun el esquema de etiquetas aprendido durante el fine-tuning (no publicado).
- Clasificacion por secuencia completa con una sola pasada hacia delante, sin generacion autorregresiva.
- Inferencia rapida en CPU gracias a sus 33 millones de parametros.
- Compatible con el pipeline `token-classification` de Transformers y con la infraestructura de Inference Endpoints (tag `endpoints_compatible`).
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- No tiene capacidades de vision, audio ni generacion de texto.
- Capacidades multilingues: no disponibles; el modelo base esta enfocado a ingles y la model card no declara idiomas.

## Casos de uso

- Extraccion de entidades en pipelines de procesamiento documental: el modelo puede etiquetar nombres de personas, organizaciones, localidades y fechas en lotes de documentos en ingles, integrándose como paso previo a un indice de busqueda o a una base de datos relacional.
- Anonimizacion y seudonimizacion de datos personales: al detectar entidades de tipo persona u organizacion, permite enmascarar campos sensibles antes de almacenar o compartir textos, como fase de preprocesado en flujos con requisitos de proteccion de datos.
- Enriquecimiento de registros en CRM: el etiquetado de tokens permite poblar campos estructurados (empresa, cargo, localidad) a partir de correos y notas de reuniones en ingles, reduciendo la entrada manual.
- Analisis de menciones en redes sociales o prensa: clasificacion de entidades sobre grandes volumenes de texto gracias al bajo coste computacional del modelo, lo que hace viable procesar millones de documentos con pocas GPU o incluso en CPU.
- Preprocesado para sistemas de recuperacion aumentada (RAG): las entidades detectadas pueden emplearse como metadatos de filtrado o para construir indices de grafos de conocimiento sobre los documentos indexados.
- Modulo de normalizacion previa a la tokenizacion en pipelines financieros o legales: extraer nombres de contrapartes y referencias para alimentar reglas de negocio o alertas.
- Base para investigacion en NER de bajo coste: al ser un fine-tuning de bge-small, sirve como referencia reproducible para comparar tecnicas de entrenamiento (esquemas de etiquetado, aumento de datos, congelacion de capas) en entornos con recursos limitados.

## Benchmarks y rendimiento

El model-index publicado por el autor no contiene ninguna entrada de resultados (`results: []`). Los unicos datos disponibles son los de la model card, correspondientes al conjunto de evaluacion definido por el propio autor (dataset no especificado), y se reproducen a continuacion tal cual.

| Metrica | Valor final (epoca 5) |
|---|---|
| Loss | 0.0892 |
| Precision | 0.8722 |
| Recall | 0.9110 |
| F1 | 0.8912 |
| Accuracy | 0.9796 |

Evolucion por epoca declarada por el autor:

| Epoca | Paso | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1 | 625 | 0.2254 | 0.1835 | 0.7564 | 0.8061 | 0.7804 | 0.9604 |
| 2 | 1250 | 0.1305 | 0.1185 | 0.8547 | 0.8869 | 0.8705 | 0.9756 |
| 3 | 1875 | 0.1176 | 0.1000 | 0.8497 | 0.9051 | 0.8765 | 0.9762 |
| 4 | 2500 | 0.0689 | 0.0916 | 0.8727 | 0.9091 | 0.8905 | 0.9794 |
| 5 | 3125 | 0.0641 | 0.0892 | 0.8722 | 0.9110 | 0.8912 | 0.9796 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, CoNLL-2003, WikiANN u otros) en la informacion disponible. La accuracy de 0.9796 es coherente con un esquema de etiquetado donde la clase mayoritaria (token fuera de entidad) domina el conjunto, por lo que el F1 es la metrica mas informativa de las publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.13 GB en fp32 (33,2 M de parametros x 4 bytes) y unos 0.07 GB en fp16. Con las activaciones y el batch, el consumo tipico se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria libre; sirven desde una GTX 1050 Ti o una T4 hasta A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- Cabe en cualquier GPU consumer: GTX 1050 Ti en adelante, RTX 3060, RTX 4090, etc. Tambien funciona en CPU de forma practicamente interactiva para lotes pequenos.
- Opciones de despliegue: pipeline `token-classification` de Transformers en Python, Inference Endpoints de Hugging Face (tag `endpoints_compatible`), ONNX Runtime, TorchScript, o exportacion a otros runtimes de inferencia. No hay artefactos GGUF ni integracion declarada con vLLM, TGI, Ollama o llama.cpp, si bien al ser un encoder pequeno la conversion a ONNX o GGUF es viable.
- Latencia y throughput: no disponible; la model card no publica mediciones de latencia ni de tokens por segundo.
- El repositorio completo ocupa 0.1 GB, por lo que el almacenamiento no es un factor limitante.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uGAliok/bge-small-ner | 33.215.625 | token classification (NER) | no disponible (base de 512 tokens) | MIT | publico en Hugging Face; 0 descargas y 0 likes |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | sentence similarity / embeddings | 512 tokens | MIT | publico, ampliamente utilizado |
| aleksanderkarpov/bge-small-ner | no disponible | token classification (NER) | no disponible | no disponible | publico en Hugging Face; mismo nombre y mismo modelo base declarado |
| db1boy/bge-small-ner | no disponible | token classification (NER) | no disponible | no disponible | publico en Hugging Face; mismo nombre y mismo modelo base declarado |

Los tres modelos `bge-small-ner` localizados en la busqueda parten de BAAI/bge-small-en-v1.5 y comparten estructura de model card autogenerada, pero no publican resultados comparables detallados en la informacion disponible, por lo que no es posible establecer una comparacion de rendimiento entre ellos. Tampoco se dispone de datos de benchmarks frente a encoders NER mas grandes (por ejemplo, variantes de BERT-base o DeBERTa) que permitan situar este fine-tuning en el estado del arte.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "on an unknown dataset". No se puede evaluar la cobertura de dominios, el equilibrio de clases ni la calidad de las anotaciones.
- Esquema de etiquetas no publicado: no se documenta la lista de entidades (id2label) ni la convencion de etiquetado (BIO, BIOES, etc.), lo que dificulta su uso directo sin inspeccionar el configuracion del modelo.
- Model card incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" aparecen como "More information needed".
- Riesgo de alucinacion estructural: al ser un clasificador de tokens, puede producir falsos positivos de entidad en textos fuera del dominio de entrenamiento, especialmente con vocabulario especializado.
- Sesgos: no se ha publicado ningun analisis de sesgos demograficos, geograficos o de genero. Dado que el modelo base esta orientado a ingles, el sesgo linguo-cultural es previsible.
- Limitacion idiomatica: no se declaran idiomas soportados y el modelo base BAAI/bge-small-en-v1.5 es de proposito general orientado a ingles; el rendimiento en castellano es desconocido y no validado.
- Limitacion de contexto: al heredar el encoder del modelo base, la ventana practica es de 512 tokens, por lo que documentos largos requieren segmentacion previa que puede romper entidades a caballo entre fragmentos.
- Sin validacion externa: cero descargas y cero likes, sin evaluaciones de terceros ni resultados en benchmarks estandar; los numeros publicados proceden unicamente del autor.
- Riesgo de sobreajuste al conjunto de evaluacion: el validation loss sigue bajando hasta la ultima epoca sin signos de estancamiento claro, pero no se documenta la separacion entre validacion y prueba.
- Licencia: MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no obstante, la licencia del modelo base tambien es MIT, por lo que no se anaden restricciones adicionales conocidas.
- Advertencia para produccion: antes de desplegarlo en un flujo real conviene reconstruir el esquema de etiquetas, evaluar sobre un conjunto propio del dominio objetivo y establecer umbrales de confianza para filtrar predicciones dudosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uGAliok/bge-small-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Fine-tuning homonimo de aleksanderkarpov: https://huggingface.co/aleksanderkarpov/bge-small-ner
- Fine-tuning homonimo de db1boy: https://huggingface.co/db1boy/bge-small-ner
- Ficha de bge-small-ner-v2 en free2aitools: https://free2aitools.com/model/nickolays1/bge-small-ner-v2
- Ficha de bge-small-en-v1.5 finetuned NER en free2aitools: https://free2aitools.com/model/rustikkabirov/bge-small-en-v1.5-finetuned-ner
- Sitio oficial de la familia BGE (BAAI): https://bge.baai.ac.cn/
- Paper de referencia de la familia BGE: no disponible en la informacion proporcionada
- Repositorio de codigo asociado: no disponible en la informacion proporcionada
- Demo en linea: no disponible en la informacion proporcionada
