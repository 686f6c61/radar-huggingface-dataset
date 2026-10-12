# syssec-utd/py315-pylingual-v6-segmenter

## Resumen

py315-pylingual-v6-segmenter es un modelo de clasificación de tokens (token classification) desarrollado por el grupo syssec-utd, construido mediante fine-tuning del modelo de lenguaje enmascarado syssec-utd/py315-pylingual-v6-mlm, que a su vez se basa en la arquitectura RoBERTa. El modelo resuelve una tarea de etiquetado a nivel de token orientada a la segmentación de secuencias, presumiblemente sobre texto o código fuente en el ámbito de Python ("py315", "pylingual"), y se distribuye exclusivamente en formato safetensors a través de HuggingFace.

Con 108.887.043 parámetros (aproximadamente 109 millones), se sitúa en la horquilla de los modelos encoder tipo RoBERTa-base, lo que implica un coste de inferencia bajo y la posibilidad de ejecutarlo en hardware de consumo. El repositorio ocupa 0,4 GB, coherente con pesos en precisión completa de un modelo de este tamaño.

Su relevancia actual es limitada pero concreta: no es un modelo generativo de propósito general, sino un componente especializado de preprocesado. Los resultados declarados por el autor en el conjunto de evaluación son muy altos (F1 0,9933, exactitud 0,9985, pérdida 0,0110), aunque se trata de métricas autoinformadas sobre un dataset propio y sin validación externa: el modelo registra 0 descargas y 0 "likes" en el momento de la consulta, y su model-index no contiene resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, solo encoder) |
| Parametros totales | 108.887.043 (aprox. 109 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; por arquitectura RoBERTa, tipicamente 512 tokens |
| Tipos de cuantizacion | No disponible; al ser safetensors en precision completa, admite conversion a fp16, int8 y GGUF mediante herramientas externas |
| Idiomas soportados | No disponible (el nombre "pylingual" sugiere cobertura multilingue o multilingue sobre Python, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | syssec-utd/py315-pylingual-v6-mlm |
| Dataset de entrenamiento | syssec-utd/segmentation-py315-pylingual-v6-tokenized |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa, reutilizado como cabecera de clasificacion de tokens sobre el checkpoint syssec-utd/py315-pylingual-v6-mlm. No hay indicios de mecanismos alternativos como MoE, SSM o hibridos; se trata de un fine-tuning supervisado clasico de etiquetado de secuencias, con una etiqueta por token y agregacion posterior de BIO o esquema equivalente (no especificado en la model card).

El entrenamiento se realizo sobre el dataset syssec-utd/segmentation-py315-pylingual-v6-tokenized durante 2 epocas, con learning rate 2e-5, scheduler lineal, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8 (variante torch-fused), precision mixta nativa (AMP) y semilla 42. El batch de entrenamiento por dispositivo fue de 64 con eval batch de 8, distribuido en 3 dispositivos GPU (batch total efectivo de 192 y batch de evaluacion total de 24), alcanzando el paso 64.128 al final del segundo epoch. No se documenta composicion del dataset, numero de tokens, ni uso de RLHF, DPO o decodificacion especulativa; la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Clasificacion de tokens: asigna una etiqueta a cada token de entrada, tarea propia de un segmentador (delimitacion de unidades dentro de una secuencia).
- Segmentacion de secuencias: util para dividir texto o codigo en unidades discretas, presumiblemente identificadores, subtokens o fronteras de segmento en el dominio Python.
- Integracion con el ecosistema transformers: compatible con `pipeline("token-classification")` y con la etiqueta `endpoints_compatible` del repositorio.
- No es un modelo generativo: no produce texto libre ni mantiene dialogos.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no confirmadas; el identificador "pylingual" sugiere ambito multilingue o multilingue sobre Python, pero no hay documentacion que lo acredite.
- Capacidad especial: ninguna declarada (sin modo thinking, vision ni audio).

## Casos de uso

- Preprocesado de corpus de codigo Python: el modelo puede etiquetar tokens para normalizar identificadores (separacion de camelCase y snake_case, aislamiento de prefijos y sufijos) antes de alimentar otros modelos de lenguaje o de analisis estatico.
- Analisis de seguridad sobre repositorios: un segmentador fiable permite separar unidades lexicas de forma consistente para tareas posteriores de deteccion de clones, mutaciones o inyecciones, en linea con el perfil del grupo autor (syssec-utd).
- Construccion de datasets de entrenamiento: dado su coste bajo de inferencia, sirve para etiquetar grandes volumenes de texto y generar conjuntos anotados de forma masiva y reproducible.
- Normalizacion previa a la tokenizacion en pipelines NLP: aplicar segmentacion antes de un tokenizador BPE reduce ambiguedad en lenguajes con identificadores compuestos.
- Analisis de logs y trazas: clasificacion de tokens en lineas de log para separar campos y valores antes de una agregacion estructurada.
- Alineacion de vocabularios entre modelos: la salida por token facilita el mapeo de fronteras de segmento entre distintos tokenizadores en un pipeline multilingue.
- Filtrado y limpieza de texto: deteccion de segmentos que deben descartarse o marcarse en un corpus previo a indexacion.
- Fine-tuning de dominio: al ser un encoder de 109 M de parametros, se puede reentrenar sobre un esquema de etiquetas propio en una GPU de gama media en horas, no dias.

## Benchmarks y rendimiento

El model-index oficial del repositorio esta vacio (`results: []`), por lo que no hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K ni equivalentes). El autor si declara metricas sobre el conjunto de evaluacion propio, que se reproducen tal cual a continuacion:

| Epoch | Paso | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1.0 | 32.064 | 0,0217 | 0,0124 | 0,9930 | 0,9917 | 0,9923 | 0,9983 |
| 2.0 | 64.128 | 0,0115 | 0,0110 | 0,9936 | 0,9930 | 0,9933 | 0,9985 |

Resultado final declarado en evaluacion: loss 0,0110, precision 0,9936, recall 0,9930, F1 0,9933, accuracy 0,9985. No se dispone de comparacion con otros modelos sobre el mismo conjunto de evaluacion, ni de desglose por clase, por lo que estos valores no son directamente comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32, 0,22 GB en fp16/bf16 y 0,11 GB en int8, solo para pesos; sumar activaciones y batch (para batch 8 y secuencias de 512 tokens, del orden de 1-3 GB en fp16).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A10, L4, T4, A100 o H100 lo ejecutan con holgura y quedan limitadas por CPU o por E/S, no por calculo.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos con al menos 4 GB de VRAM; tambien es viable en CPU para lotes pequenos, dado el tamano de 109 M de parametros.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportacion a ONNX Runtime para inferencia en CPU, TorchScript, y servidores de inferencia que soporten tareas de clasificacion de tokens. vLLM y TGI no estan orientados a token classification. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

No se han publicado comparativas oficiales. La tabla siguiente contrasta el modelo con alternativas genericas de clasificacion de tokens del mismo orden de magnitud; los datos de las alternativas proceden de sus model cards publicas y deben verificarse antes de usarse en una decision.

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| syssec-utd/py315-pylingual-v6-segmenter | RoBERTa | 108,9 M | No disponible (tipico 512) | Segmentacion / token classification | No disponible | HuggingFace, 0 descargas |
| dslim/bert-base-NER | BERT-base | ~108 M | 512 | NER generico (token classification) | MIT | HuggingFace, ampliamente usado |
| Jean-Baptiste/roberta-large-ner-english | RoBERTa-large | ~355 M | 512 | NER en ingles | MIT | HuggingFace |
| Modelos de segmentacion de codigo de proposito general | No disponible | No disponible | No disponible | Segmentacion de identificadores | No disponible | No disponible |

La diferencia relevante no es de rendimiento, sino de dominio: py315-pylingual-v6-segmenter es un modelo de nicho, sin licencia declarada y sin validacion externa, mientras que las alternativas cuentan con licencias permisivas y adopcion amplia. Si el caso de uso es NER generico, las alternativas son preferibles; si es segmentacion especifica del dominio py315, este modelo es la unica opcion conocida.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Es un bloqueo legal potencial para cualquier despliegue en produccion hasta que el autor lo aclare.
- Cero descargas y cero likes: no hay evidencia de validacion por terceros, ni de reproducibilidad de los resultados declarados.
- Metricas autoinformadas: el F1 de 0,9933 y la exactitud de 0,9985 provienen del propio autor sobre su conjunto de evaluacion, sin desglose por clase ni comparacion independiente. Un F1 tan alto en clasificacion de tokens sugiere con frecuencia un esquema de etiquetas muy desbalanceado.
- Documentacion incompleta: la model card marca "More information needed" en descripcion, usos previstos y datos de entrenamiento. Se desconoce la composicion del dataset, el esquema de etiquetas y el vocabulario del tokenizador.
- Idiomas: sin confirmar. No se puede asumir cobertura multilingue real pese al nombre "pylingual".
- Contexto limitado: al derivar de RoBERTa, la ventana habitual es de 512 tokens; secuencias mas largas requeriran truncado o ventanas deslizantes con agregacion.
- Riesgo de error por cambio de dominio: al ser un modelo especializado, su comportamiento fuera del dominio de segmentacion para el que fue entrenado (por ejemplo, texto natural generico o lenguajes de programacion distintos de Python) no esta caracterizado y cabe esperar degradacion.
- Alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la asignacion erronea de etiquetas en fronteras de segmento ambiguas.
- Sesgos: no evaluados ni documentados. La ausencia de informacion sobre la procedencia de los datos impide estimar sesgos lexicos o de dominio.
- Compatibilidad de versiones: fue entrenado con Transformers 5.17.0, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2. Versiones muy distintas de la libreria pueden requerir ajustes al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/py315-pylingual-v6-segmenter
- Modelo base (MLM): https://huggingface.co/syssec-utd/py315-pylingual-v6-mlm
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/segmentation-py315-pylingual-v6-tokenized
- Perfil del autor: https://huggingface.co/syssec-utd
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
