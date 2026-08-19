# walston/whisaid-medium-grl

## Resumen

WhisAID Medium GRL es un modelo de identificacion de acento mandarin (accent classification) y codificador de acento (accent encoder) desarrollado por walston (Xintong Wang) en el marco del proyecto Joycent, un sistema de text-to-speech con acento basado en difusion. El modelo parte de la arquitectura Whisper Medium y anade una capa de reversio de gradiente (gradient reversal layer, GRL) con lambda 0.05 para separar la informacion de acento de la identidad del hablante durante el entrenamiento. Se entreno durante 10 epocas sobre habla mandarina nativa con multiples acentos, con 336 hablantes y 9 clases de acento. El checkpoint publicado corresponde a la epoca 9.

El modelo resuelve el problema de identificar y codificar el acento en mandarin de forma desvinculada de la identidad del hablante, lo que resulta util para sistemas de TTS con acento controlable y para tareas de analisis de variacion dialectal. Su relevancia actual radica en que proporciona una representacion de acento limpia y transferible, integrable en pipelines de generacion de voz. El repositorio almacena un checkpoint de Lightning; el codigo de integracion se distribuye a traves del proyecto WhisAID en GitHub, no mediante codigo remoto en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Medium (encoder-decoder transformer) con capa GRL |
| Parametros totales | no disponible (Whisper Medium base tiene ~769M, pero no se confirma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (mandarin) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Lightning (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en Whisper Medium, un transformer encoder-decoder entrenado originalmente para reconocimiento de voz. Sobre esta base, WhisAID anade una capa de reversio de gradiente (GRL) que, durante el entrenamiento, invierte el gradiente en la rama de clasificacion de hablante para eliminar la informacion de identidad del hablante de las representaciones internas. De esta forma, el modelo aprende a retener unicamente las caracteristicas relacionadas con el acento. El entrenamiento se realizo con 336 hablantes y 9 clases de acento, durante 10 epocas con lambda GRL fijada en 0.05. El checkpoint publicado es el de la epoca 9. No se dispone de detalles sobre el dataset exacto ni sobre el proceso de preprocesado, aunque el codigo de entrenamiento esta disponible en el repositorio Joycent-code.

## Capacidades

- Clasificacion de acento mandarin: identifica una de 9 clases de acento a partir de audio.
- Extraccion de embeddings de acento: produce un vector de caracteristicas (accent embedding) que representa el acento de forma desvinculada de la identidad del hablante.
- Integracion con TTS con acento: disenado para usarse como modulo de control en el framework Joycent, que genera voz con acento especifico.
- Compatible con el ecosistema transformers: se carga mediante `AutoModel.from_config` con la configuracion de WhisAID.
- Entrada de audio: utiliza mel-spectrogramas de 80 bandas, siguiendo el preprocesado de Whisper.

## Casos de uso

- Sintesis de voz con acento controlable: en un sistema TTS como Joycent, el embedding de acento extraido por WhisAID se utiliza como condicion para generar habla con un acento mandarin concreto, sin necesidad de predecir fonemas acentuados.
- Analisis de variacion dialectal: investigadores pueden usar el modelo para clasificar y comparar acentos en corpus de mandarin hablado, obteniendo una representacion numerica de cada muestra.
- Etiquetado automatico de datos de audio: en pipelines de preparacion de datasets para ASR o TTS, el modelo puede anotar automaticamente el acento de cada grabacion.
- Filtrado de datos por acento: en la creacion de conjuntos de entrenamiento, se puede seleccionar o excluir hablantes segun su acento identificado.
- Estudio de transferencia de acento: el embedding de acento puede usarse para transferir el acento de un hablante a otro en sistemas de conversion de voz.
- Evaluacion de sistemas TTS: comparar el acento de salida de un TTS con el acento objetivo mediante la clasificacion de WhisAID.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como exactitud de clasificacion, precision por acento ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamano del repositorio: 3.1 GB, lo que sugiere que el checkpoint completo ocupa aproximadamente esa cantidad en disco.
- VRAM estimada para inferencia: no disponible, pero al basarse en Whisper Medium, se estima que requiere al menos 8-10 GB de VRAM en precision FP16 para cargar el modelo completo.
- GPU recomendadas: cualquier GPU con al menos 10 GB de VRAM (por ejemplo, RTX 3080, RTX 3090, A10, A100). En consumer, una RTX 3060 12GB podria ser suficiente con FP16.
- Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con PyTorch estandar. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directamente. WhisAID es un modelo especifico para identificacion de acento mandarin, y no se han encontrado alternativas publicas con caracteristicas equivalentes en la informacion proporcionada. Se podria comparar con otros clasificadores de acento basados en Whisper, pero no hay datos publicados.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo que licencia se distribuye el modelo, lo que impide conocer las restricciones de uso comercial.
- Solo mandarin: el modelo esta entrenado exclusivamente para acentos del mandarin, no es aplicable a otros idiomas.
- Sesgo por hablantes: el entrenamiento con 336 hablantes puede no cubrir toda la variabilidad dialectal del mandarin, lo que podria producir clasificaciones erroneas en acentos poco representados.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero la clasificacion puede ser incorrecta en audio con ruido o con acentos no vistos.
- Dependencia del preprocesado de Whisper: requiere el uso de `log_mel_spectrogram` y `pad_or_trim` de Whisper, lo que limita su uso fuera de ese ecosistema.
- Checkpoint de Lightning: el repositorio almacena un checkpoint de Lightning, no un modelo directamente cargable con `from_pretrained` estandar; se necesita el codigo de integracion de WhisAID.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/walston/whisaid-medium-grl
- Perfil del autor: https://huggingface.co/walston
- Repositorio Joycent-code (incluye WhisAID): https://github.com/oshindow/Joycent-code/tree/main/whisAID
- Script de entrenamiento: https://github.com/oshindow/Joycent-code/blob/main/whisAID/whisAID_train_zh_grl_medium.py
- Paper de Joycent: https://arxiv.org/pdf/2606.16417
