# Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-100

## Resumen

`bert-fa-base-uncased-finetuned-PersianQuAD-val-100` es un modelo de respuesta a preguntas extractiva (question answering) en persa, publicado por el usuario Z-Jafari en Hugging Face. Se trata de un ajuste fino del modelo base `HooshvareLab/bert-fa-base-uncased`, un BERT base adaptado al persa por el equipo HooshvareLab, sobre el conjunto de datos PersianQuAD (Persian Question Answering Dataset). El modelo resuelve la tarea de localizar el fragmento de texto (span) que responde a una pregunta formulada sobre un contexto dado, no la generacion libre de respuestas.

Arquitectonicamente es un transformer encoder-only de tipo BERT con 162.252.290 parametros, sin parametros activos diferenciales (no es MoE). El ajuste fino se realizo durante 3 epocas con un learning rate de 2e-05, batch de 16 y precision mixta nativa AMP, alcanzando en el conjunto de evaluacion un exact match de 75,8 y un F1 de 79,96, con una perdida de validacion de 1,0362. La model card no documenta la composicion exacta del dataset ni detalles adicionales sobre el preprocesamiento.

Su relevancia es acotada pero concreta: cubre un nicho poco poblado como es el QA extractivo en persa, un idioma con escasez de recursos supervisados en comparacion con el ingles. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y su tamano reducido permite desplegarlo en hardware modesto. No obstante, la ausencia de benchmarks comparativos publicados y de documentacion sobre el conjunto de entrenamiento limita la confianza que un equipo de produccion puede depositar en el de forma inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 162.252.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el BERT base original usa 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | persa (farsi); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HooshvareLab/bert-fa-base-uncased`, un BERT base entrenado especificamente para persa, con vocabulario adaptado a ese idioma. Sobre esa base se anade una cabeza de question answering (clasificacion de inicio y fin del span) y se ajusta de forma supervisada sobre PersianQuAD. El entrenamiento se ejecuto con el `Trainer` de Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, usando el optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, semilla 42, 3 epocas y 3453 pasos totales.

La evolucion de la perdida muestra un patron de sobreajuste moderado: la perdida de entrenamiento cae de 1,0875 a 0,4065 entre la primera y la tercera epoca, mientras que la perdida de validacion toca minimo en la primera epoca (0,9249), sube a 0,9596 en la segunda y termina en 1,0362 en la tercera. Esto sugiere que un checkpoint intermedio (epoca 1 o 2) podria generalizar mejor que el final, aunque la model card no ofrece resultados de evaluacion por checkpoint. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo encoder-only de QA extractivo.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el span de texto que contiene la respuesta, junto con una puntuacion de confianza.
- Comprension lectora en persa: localizacion de informacion factual dentro de parrafos, util para tareas de reading comprehension.
- Clasificacion de tokens: al ser un encoder con cabeza de QA, puede adaptarse a otras tareas token-level (NER, etiquetado) mediante fine-tuning adicional.
- No soporta generacion de texto libre: no es un modelo causal ni seq2seq.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues limitadas al persa; no se documenta soporte de otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda documental con respuestas extractivas: indexar un corpus de documentos en persa y, ante una consulta del usuario, recuperar el pasaje relevante y usar el modelo para extraer la frase exacta que responde. Su F1 de 79,96 en PersianQuAD lo hace adecuado para prototipos y sistemas internos.
- Atencion al cliente basada en FAQ: dado un conjunto de preguntas frecuentes y respuestas en persa, el modelo localiza el fragmento de la FAQ que responde a la consulta del usuario, reduciendo la necesidad de generar respuestas libres y el riesgo de alucinacion.
- Extraccion de campos en formularios y documentos: en pipelines de procesamiento documental en persa, el modelo puede localizar valores concretos (fechas, nombres, importes) dentro de un texto, siempre que se le proporcione la pregunta adecuada.
- Asistencia a la lectura y estudio: integrado en una aplicacion educativa, permite al estudiante seleccionar un texto en persa y formular preguntas sobre el, recibiendo el fragmento relevante resaltado.
- Anotacion semiautomatica de datasets de QA: usar el modelo para preanotar pares pregunta-respuesta en persa y que anotadores humanos revisen y corrijan, acelerando la construccion de corpus.
- Analisis de opiniones y resenas: extraer la parte concreta de una resena en persa que responde a preguntas como "que problema se menciona" o "que producto se recomienda", facilitando el analisis a escala.
- Verificacion de afirmaciones en textos: dado un documento y una afirmacion, localizar el pasaje que la respalda o la contradice, como paso previo a un sistema de fact-checking.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (PersianQuAD val-100):

| Metrica | Valor |
|---|---|
| Exact match | 75,8 |
| F1 | 79,96 |
| Perdida de validacion | 1,0362 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El model-index del repositorio no contiene entradas de resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 650 MB solo para pesos (162 M parametros x 4 bytes), mas overhead de activaciones y del tokenizer; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en FP16: aproximadamente 325 MB para pesos; en la practica, menos de 1,5 GB con overhead.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB de VRAM.
- Tambien puede ejecutarse en CPU para inferencia de baja concurrencia, dado su tamano reducido.
- Opciones de despliegue: `transformers` con `pipeline("question-answering")`, TorchServe, ONNX Runtime, y servidores de inferencia compatibles con endpoints (el repositorio esta marcado como `endpoints_compatible`). No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-100 | 162,25 M | no disponible | QA extractivo en persa | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased (modelo base) | no disponible | no disponible | MLM / base para fine-tuning | no disponible | Hugging Face |
| Otros fine-tunes de Z-Jafari sobre PersianQuAD (coleccion Base-Models-Finetuned-on-PersianQuAD) | variable segun base | no disponible | QA extractivo en persa | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de benchmarks.

## Limitaciones y advertencias

- La model card esta generada automaticamente por el `Trainer` y no ha sido completada: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento indican "More information needed".
- No se documenta la composicion del dataset de entrenamiento ni el numero de tokens utilizados, lo que impide evaluar la cobertura y los sesgos del modelo.
- El modelo solo responde en persa; no se ha verificado su comportamiento en otros idiomas.
- Riesgo de alucinacion estructural bajo en QA extractivo (devuelve spans del contexto), pero puede seleccionar spans incorrectos o sin sentido cuando la respuesta no esta en el contexto.
- La perdida de validacion empeora a partir de la primera epoca, lo que sugiere sobreajuste; el checkpoint publicado puede no ser el optimo.
- El conjunto de evaluacion es pequeno ("val-100"), por lo que las metricas tienen alta varianza y no deben extrapolarse sin validacion adicional.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base de terceros conviene revisar las condiciones del modelo original `HooshvareLab/bert-fa-base-uncased`.
- Sin benchmarks comparativos publicados ni evaluacion en dominios distintos de PersianQuAD, no se recomienda su uso en produccion critica sin una evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-100
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- Coleccion de fine-tunes sobre PersianQuAD de Z-Jafari: https://huggingface.co/collections/Z-Jafari/base-models-finetuned-on-persianquad
- Variante adicional del autor: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD_Factoid_Test-matched-ANS_LEN
