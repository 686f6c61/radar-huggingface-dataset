# zeromodels/bart_large_cnn

## Resumen

BART es un modelo de transformer seq2seq de denoising, desarrollado originalmente por Meta AI (FAIR) y presentado en el artículo "BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension". Este repositorio, publicado por zeromodels bajo licencia MIT, ofrece una conversión de los pesos del modelo `facebook/bart-large-cnn` al framework Keras 3. El objetivo es proporcionar una implementación unificada que funcione de manera idéntica con los backends de TensorFlow, PyTorch y JAX sin modificar el código.

El modelo se compone de un encoder bidireccional (similar a BERT) y un decoder autoregresivo (similar a GPT), y fue preentrenado para reconstruir texto corrupto mediante un proceso de denoising. El checkpoint `bart_large_cnn` está afinado para la tarea de resumen de texto sobre el corpus CNN/DailyMail. El tamaño del repositorio es de 1.6 GB, lo que corresponde aproximadamente al tamaño de los pesos del modelo en precisión FP32, aunque el número de parámetros no se indica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq denoising autoencoder (encoder bidireccional + decoder autoregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (carga mediante Keras 3 con backends TensorFlow, PyTorch o JAX) |

Nota: La información publicada no incluye el número de parámetros, la longitud de contexto ni los idiomas soportados. Estos datos suelen coincidir con los del modelo base `facebook/bart-large-cnn`, pero al no estar documentados en la ficha, se marcan como no disponibles.

## Arquitectura y entrenamiento

BART es un modelo de transformer seq2seq que combina un encoder bidireccional y un decoder autoregresivo. Durante el preentrenamiento, el modelo recibe texto corrupto mediante técnicas como eliminación de tokens, permutación de frases o enmascaramiento de intervalos, y debe reconstruir el texto original. Este enfoque de denoising permite que el modelo capture tanto la comprensión del contexto (encoder) como la generación fluida de texto (decoder). El tokenizador es de tipo BPE a nivel de byte y es compartido con RoBERTa; el decoder inicia la generación a partir del token especial `</s>`.

El checkpoint `zeromodels/bart_large_cnn` es una conversión directa de los pesos de `facebook/bart-large-cnn`, que fue afinado sobre el corpus CNN/DailyMail para la tarea de resumen. No se especifican en la información disponible los datos de entrenamiento, el número de tokens ni si se realizaron procesos de RLHF o DPO. La librería `zeromodels` ofrece además otras variantes, como `bart_base`, `bart_large` y `bart_large_xsum`, con cabezas de tarea que pueden cargarse desde este repositorio o mediante el prefijo `hf:` para cargar checkpoints originales de Hugging Face.

## Capacidades

- Generación condicional de texto para tareas de resumen, en particular resumen extractivo y abstractivo sobre noticias y artículos.
- Carga de clases adicionales para clasificación de secuencias (como NLI o zero-shot) y respuesta a preguntas extractivas, utilizando el backbone compartido.
- Compatibilidad con los backends de TensorFlow, PyTorch y JAX mediante Keras 3, lo que permite ejecutar el modelo en múltiples plataformas con el mismo código.
- Los pesos pueden cargarse directamente desde este repositorio o desde un repositorio de Hugging Face mediante el prefijo `hf:`.
- El modelo no incluye soporte para tool calling ni razonamiento multi-paso, ya que está diseñado como un modelo de generación condicional tradicional, no como un modelo de chat o agente.
- No se documentan capacidades de visión, audio ni multimodales.

## Casos de uso

- Resumen automático de noticias: el modelo puede condensar artículos largos de prensa en resúmenes breves, empleando el checkpoint afinado con CNN/DailyMail. Es adecuado para sistemas de agregación de contenidos y boletines informativos automatizados.
- Resumen de documentos legales: tras un ajuste fino sobre textos jurídicos, el modelo puede extraer las cláusulas clave de contratos o normativas, reduciendo el tiempo de revisión manual.
- Resumen de correos electrónicos: integrado en un gestor de correo, el modelo permite generar un resumen de hilos largos, facilitando la lectura rápida de la conversación.
- Resumen de actas de reuniones: el modelo puede procesar transcripciones de reuniones para generar actas concisas, siempre que se ajuste previamente al dominio.
- Generación de titulares: mediante el mismo checkpoint de resumen, se pueden producir titulares alternativos para artículos, útil en redacciones y sistemas de recomendación.
- Clasificación de documentos: usando la clase `BartSequenceClassify` con una cabeza de clasificación inicializada aleatoriamente y ajustada con datos propios, se puede construir un clasificador de textos para tareas como análisis de sentimiento o categorización temática.
- Respuesta a preguntas extractivas: con la clase `BartQnA`, el modelo puede localizar respuestas en un texto dado, aunque requiere un ajuste fino con datos de preguntas y respuestas, ya que la cabeza no está preentrenada en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye métricas como ROUGE, MMLU, HumanEval ni GSM8K. El rendimiento debe evaluarse de manera independiente antes de su uso en producción.

## Requisitos de hardware

- El repositorio pesa 1.6 GB, lo que sugiere que los pesos se almacenan en precisión FP32. Para inferencia, se estima un consumo de VRAM de aproximadamente 2 GB en FP32, reducible a menos de 1 GB en FP16 o 8 bits.
- Es viable ejecutar el modelo en GPUs de consumo, como las series GTX/RTX con al menos 4 GB de VRAM.
- Para despliegue se recomienda Keras 3 con el backend de PyTorch o TensorFlow, y también es compatible con JAX.
- No se proporcionan datos de latencia ni de throughput en la información disponible.
- El modelo no requiere un servidor dedicado; puede desplegarse en una CPU moderna para tareas de resumen de baja frecuencia, aunque con mayor latencia.

## Comparativa con modelos similares

| Modelo | Tamaño del repositorio | Licencia | Tarea | Backend |
|---|---|---|---|---|
| zeromodels/bart_large_cnn | 1.6 GB | MIT | Resumen (CNN/DailyMail) | Keras 3 (TF, Torch, JAX) |
| facebook/bart-large-cnn | 1.6 GB | Apache-2.0 | Resumen (CNN/DailyMail) | PyTorch |
| zeromodels/bart_large_xsum | no disponible | MIT | Resumen extremo (XSum) | Keras 3 (TF, Torch, JAX) |
| zeromodels/bart_base | no disponible | MIT | Generación condicional base | Keras 3 (TF, Torch, JAX) |

La diferencia principal frente a `facebook/bart-large-cnn` es el formato: este repositorio ofrece una implementación en Keras 3 que puede usar tres backends distintos, mientras que el modelo original está pensado para PyTorch. La licencia MIT permite un uso comercial más flexible que la Apache-2.0 del original, aunque el modelo base ya era de código abierto.

## Limitaciones y advertencias

- No se indican sesgos específicos en la información proporcionada, pero el modelo fue afinado sobre CNN/DailyMail, un corpus de noticias en inglés, por lo que puede heredar sesgos lingüísticos y temáticos de ese dominio.
- El modelo es generativo, por lo que existe riesgo de alucinación, es decir, puede producir contenido plausible pero incorrecto o no fiel al texto original.
- Al estar diseñado como un modelo seq2seq, su ventana de contexto es limitada y no está preparado para documentos muy extensos; en la información no se especifica el valor exacto.
- La información no documenta los idiomas soportados. Aunque el checkpoint de resumen fue entrenado en inglés, el modelo podría servir para otros idiomas tras un ajuste fino, pero no se garantiza.
- La licencia MIT es permisiva y permite uso comercial, pero es necesario citar y respetar los términos del modelo base `facebook/bart-large-cnn`, que se distribuye bajo Apache-2.0.
- El checkpoint no incluye cabezas de clasificación ni de QA afinadas; si se usan esas clases, las cabezas se inicializan aleatoriamente y deben ajustarse con datos propios.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zeromodels/bart_large_cnn
- Modelo base original: https://huggingface.co/facebook/bart-large-cnn
- Artículo original: https://arxiv.org/abs/1910.13461
- Repositorio de ZeroModels: https://github.com/ZeroAIx/ZeroModels
- Documentación de BART en ZeroModels: https://zeroaix.github.io/ZeroModels/bart/
- Modelo disponible en Microsoft Foundry: https://ai.azure.com/catalog/models/facebook-bart-large-cnn
