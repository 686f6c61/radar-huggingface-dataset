# swatibgupta/sentiment-model

## Resumen

sentiment-model es un modelo de clasificacion de texto publicado por el usuario swatibgupta en HuggingFace. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, la version destilada de BERT desarrollada por Hugging Face, sobre un dataset de sentimiento que el autor no identifica en la model card ("unknown dataset"). El pipeline declarado es text-classification y la libreria de referencia es transformers. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 26 de septiembre de 2026.

El modelo cuenta con 66.955.779 parametros segun los pesos en safetensors, lo que coincide con el tamano estandar de DistilBERT (6 capas, 768 dimensiones ocultas, 12 cabezas de atencion). Es, por tanto, un modelo denso y ligero, pensado para inferencia en CPU o en GPUs de gama baja. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque la ausencia de documentacion sobre el dataset de entrenamiento limita seriamente la trazabilidad.

La relevancia de esta ficha es mas bien metodologica: sirve como ejemplo de publicacion automatica via Trainer con documentacion incompleta ("More information needed" en todas las secciones) y con un rendimiento modesto (accuracy 0,6598 en evaluacion). No debe considerarse un modelo listo para produccion sin una validacion previa sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (DistilBERT, destilacion de BERT) |
| Parametros totales | 66.955.779 |
| Longitud de contexto | 512 tokens (maximo posicional de distilbert-base-uncased; no declarado por el autor) |
| Tipos de cuantizacion | No especificados por el autor. Al ser un modelo denso de 67 M de parametros admite fp16/bf16 y cuantizacion dinamica int8 (PyTorch u ONNX) |
| Idiomas soportados | No disponible. El modelo base es de dominio ingles (uncased), pero el autor no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag declarado); repo de 0,3 GB |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de tipo solo-codificador obtenido por destilacion de conocimiento a partir de bert-base-uncased: reduce el numero de capas de 12 a 6 y el total de parametros de 110 M a 67 M, manteniendo las 768 dimensiones ocultas y las 12 cabezas de atencion por capa. Esto da un coste de inferencia aproximadamente un 40 % menor que BERT-base con una perdida de rendimiento reportada en su momento de en torno al 3 % en GLUE (dato de referencia de la publicacion original de DistilBERT, no verificado en este repositorio). La cabeza de clasificacion es la estandar de clasificacion de secuencias sobre el token [CLS], con un numero de etiquetas que el autor no especifica.

El entrenamiento se realizo con el Trainer de Hugging Face sobre un dataset no identificado, con los siguientes hiperparametros declarados: learning rate 2e-05, batch de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW (variante torch fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 epocas. El entrenamiento completo duro 174 pasos (58 pasos por epoca), lo que implica un conjunto de entrenamiento de aproximadamente 1.850 ejemplos con el batch de 32. No se menciona ningun proceso de RLHF, DPO ni ajuste de preferencias: es un fine-tuning supervisado clasico. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: unica tarea declarada en la pipeline (text-classification), previsiblemente analisis de sentimiento con un numero de clases no especificado.
- Generacion de texto: no soportada. Es un encoder de clasificacion, no un modelo generativo.
- Razonamiento, matematicas y codigo: no soportados ni evaluados.
- Tool calling / function calling: no soportado; no es una capacidad de los modelos de clasificacion.
- Agentes y razonamiento multi-paso: no soportados.
- Capacidades multilingues: no declaradas. El tokenizador base es uncased en ingles, con vocabulario WordPiece de 30.522 tokens.
- Vision, audio y modo "thinking": no disponibles.
- Extraccion de embeddings: tecnicamente posible usando la salida del encoder, pero no esta documentada ni validada por el autor.

## Casos de uso

- Filtrado de resenas en un e-commerce: clasificar resenas de producto en positivas o negativas para alimentar un panel de reputacion. El coste por inferencia es minimo (67 M de parametros) y puede ejecutarse en CPU dentro del propio backend.
- Enrutado de tickets de soporte: usar la polaridad del texto como primera senal para priorizar tickets negativos antes de que los lea un agente humano. Adecuado por su baja latencia y porque no requiere GPU.
- Monitorizacion de menciones en redes sociales: procesar un flujo continuo de publicaciones y agregar la polaridad por franja temporal. El modelo solo admite 512 tokens, suficiente para publicaciones cortas, pero no para hilos largos sin truncado.
- Analisis de encuestas NPS: clasificar respuestas abiertas de clientes y cruzar el sentimiento con la puntuacion numerica declarada para detectar incoherencias.
- Preetiquetado para anotacion humana: generar etiquetas automaticas de sentimiento sobre un corpus grande y usar la revision humana solo para corregir los casos de baja confianza, reduciendo el coste de anotacion. Requiere calibrar el umbral porque la accuracy declarada es solo del 66 %.
- Modulo de features en un pipeline mayor: usar la representacion del encoder como caracteristica de entrada para un clasificador posterior (por ejemplo, deteccion de toxicidad o churn), siempre que se valide con datos propios.
- Prueba de concepto educativa: ejemplo minimo de fine-tuning con Trainer para cursos o tutoriales, dado el tamano reducido del repo (0,3 GB) y la licencia permisiva.

## Benchmarks y rendimiento

El campo model-index del autor esta vacio (`"results": []`), por lo que no hay benchmarks oficiales publicados (MMLU, GLUE, SST-2 u otros). Los unicos datos disponibles son las metricas de validacion declaradas en la model card:

| Epoch | Paso | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1.0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2.0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3.0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Resultados finales declarados en la evaluacion: loss 0,7470, accuracy 0,6598, F1 weighted 0,6493, F1 macro 0,6493.

Aviso: existe una incoherencia en la propia model card, ya que la loss de evaluacion final (0,7470) no coincide con la validation loss de la ultima epoca (0,7117). Ademas, el F1 macro y el F1 weighted son identicos en todos los registros, lo que sugiere un problema de equilibrio de clases o un error en el calculo si el numero de clases es mayor que dos. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 270 MB solo para los pesos, mas activaciones y overhead del runtime; en la practica cabe en menos de 1 GB.
- VRAM en fp16/bf16: aproximadamente 135 MB para los pesos.
- VRAM en int8 dinamico: aproximadamente 70 MB.
- GPU recomendadas: ninguna en particular; el modelo funciona en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, T4, etc.). En A100/H100 el cuello de botella sera el host, no la GPU.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU y en CPU.
- CPU: inferencia totalmente viable; con batch pequeno es adecuada para servicios de bajo trafico.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints, ONNX Runtime (con cuantizacion dinamica), TorchServe, FastAPI + transformers, o TGI si se necesita servir en lote. vLLM es tecnicamente posible pero poco eficiente para un modelo de este tamano, y llama.cpp/Ollama no estan orientados a text-classification.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentiment-model (swatibgupta) | 66,9 M | 512 tokens | Accuracy 0,6598 y F1 macro 0,6493 en un dataset no identificado | Apache 2.0 | HuggingFace, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | Referencia publica: en torno al 91 % de accuracy en SST-2 (cifra del modelo oficial, no verificada en esta ficha) | Apache 2.0 | HuggingFace, ampliamente utilizado |
| bert-base-uncased | 110 M | 512 tokens | Accuracy de referencia en clasificacion superior a DistilBERT, con mayor coste de inferencia | Apache 2.0 | HuggingFace, muy extendido |
| roberta-base (ajustado para sentimiento) | 125 M | 512 tokens | Mayor capacidad que DistilBERT, aproximadamente el doble de coste de inferencia | MIT | HuggingFace, muy extendido |

La conclusion de la comparativa es que este modelo no aporta ventaja frente al DistilBERT oficial ajustado en SST-2 ni frente a RoBERTa-base para tareas de sentimiento en ingles: mismo tamano o menor, contexto identico y rendimiento declarado muy inferior, sobre un dataset desconocido. Su unico diferencial es la licencia Apache 2.0, que comparten las alternativas citadas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "unknown dataset" y todas las secciones de descripcion, usos previstos y datos estan sin rellenar ("More information needed"). Esto impide evaluar sesgos, cobertura y dominio de aplicacion.
- Rendimiento bajo: una accuracy de 0,6598 y un F1 macro de 0,6493 son valores pobres para clasificacion de sentimiento. En tareas binarias, un clasificador trivial por clase mayoritaria suele superar ese umbral; conviene medir la linea base antes de adoptar el modelo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos sistematicos, especialmente en textos con ironia, negaciones o dominio distinto al de entrenamiento.
- Incoherencia interna en las metricas: la loss de evaluacion final no coincide con la de la ultima epoca del log y F1 macro y weighted son iguales en todos los registros, lo que apunta a un posible error de calculo o a un problema de desequilibrio de clases.
- Idioma: no declarado. El tokenizador uncased en ingles no segmenta bien textos en castellano u otros idiomas con acentos y morfologia rica, por lo que el uso fuera del ingles no esta respaldado.
- Longitud de contexto: 512 tokens. Textos mas largos se truncaran, con la consiguiente perdida de informacion.
- Numero de clases desconocido: el autor no declara cuantas etiquetas predice el modelo, lo que complica su integracion en un pipeline existente.
- Reproducibilidad: no se publica el dataset, ni la semilla de division de datos, ni la receta de preprocesado. La reproducibilidad del resultado es nula.
- Licencia: Apache 2.0 permite uso comercial, redistribucion y modificacion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay restricciones adicionales, pero la ausencia de garantias es total.
- Advertencia de produccion: dado el historial del repositorio (0 descargas, 0 likes, metricas inconsistentes y documentacion vacia), no se recomienda su uso en entornos de produccion sin una validacion exhaustiva sobre un conjunto de datos propio y representativo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/swatibgupta/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper original de DistilBERT (referencia del modelo base): https://arxiv.org/abs/1910.01108
- Repositorio de transformers: https://github.com/huggingface/transformers
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por el buscador corresponden a paginas en chino sobre temas no relacionados (una novela, el buscador Yandex y conversion de audio), por lo que se descartan.
