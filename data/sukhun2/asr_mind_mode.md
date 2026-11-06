# sukhun2/asr_mind_mode

## Resumen

`sukhun2/asr_mind_mode` es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario sukhun2. Se trata de un fine-tuning del checkpoint `w11wo/wav2vec2-xls-r-300m-korean`, que a su vez deriva de la arquitectura wav2vec2 XLS-R de Meta AI, preentrenada de forma multilingue sobre corpus de habla de gran escala. El modelo resultante cuenta con 316.675.895 parametros y se distribuye bajo licencia Apache 2.0.

El modelo se ha entrenado con la libreria Transformers (version 5.20.2) y el Trainer de Hugging Face, con un pipeline declarado de `automatic-speech-recognition`. La model card ha sido generada automaticamente por el Trainer y no incluye informacion sustantiva sobre el dataset de entrenamiento, los idiomas soportados ni los usos previstos, mas alla de los hiperparametros y las metricas de validacion.

Su relevancia actual es limitada: con 65 descargas, cero likes y un WER de validacion de 0.7054 (es decir, aproximadamente un 70,5 % de tasa de error por palabra), el modelo no parece estar listo para uso en produccion. Resulta util, sin embargo, como ejemplo de fine-tuning de XLS-R sobre un dominio concreto y como referencia para quien quiera reproducir o mejorar el pipeline de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLS-R), transformer convolucional para speech |
| Parametros totales | 316.675.895 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de la senal de audio de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es XLS-R multilingue y el checkpoint intermedio es especifico de coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | w11wo/wav2vec2-xls-r-300m-korean |
| Pipeline | automatic-speech-recognition |
| Libreria | transformers 5.20.2 |
| Tamano del repositorio | 8.9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2 en su variante XLS-R, un modelo de speech auto-supervisado que combina un extractor de caracteristicas convolucional sobre la forma de onda cruda con un transformer de contexto que procesa las representaciones latentes. XLS-R se preentreno sobre decenas de miles de horas de audio en mas de 100 idiomas mediante una tarea de contraste predictivo, y el checkpoint `w11wo/wav2vec2-xls-r-300m-korean` lo adapto especificamente al coreano. El presente modelo parte de ese checkpoint y aplica un fine-tuning adicional supervisado con CTC sobre un dataset no especificado.

Los hiperparametros documentados son: learning rate de 1e-05, batch de entrenamiento de 2 por dispositivo con 4 pasos de acumulacion (batch efectivo de 8), optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 5 pasos de warmup, 60 pasos de entrenamiento totales y precision mixta nativa (AMP). La perdida de entrenamiento pasa de 13,11 en el paso 20 a 8,16 en el paso 60, y la perdida de validacion de 1,8869 a 1,5644. No se documenta el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO, algo poco habitual en ASR.

## Capacidades

- Reconocimiento automatico del habla (ASR) a nivel de fonema o caracter, mediante decodificacion CTC.
- Transcripcion de audio en el idioma o dominio cubierto por el dataset de fine-tuning, que no se especifica.
- Hereda del checkpoint base coreano la capacidad de procesar audio en coreano, aunque el fine-tuning puede haber alterado o degradado ese comportamiento.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni modo thinking.
- Capacidades multilingues: no documentadas; el modelo base XLS-R es multilingue, pero el checkpoint intermedio y el fine-tuning son especificos de un unico dominio.

## Casos de uso

- Experimentacion academica con fine-tuning de XLS-R: el modelo sirve como punto de partida reproducible para estudiar como afecta un ajuste corto (60 pasos) a un checkpoint ASR preentrenado, comparando el WER antes y despues del ajuste.
- Prototipado de transcripcion de dominio especifico: si el dataset de entrenamiento corresponde a un dominio concreto (por ejemplo, un tipo de audio o de hablante), el modelo puede usarse para evaluar la viabilidad de un ASR especializado antes de invertir en un entrenamiento mayor.
- Generacion de lineas base en evaluaciones internas: util como referencia de WER en pruebas comparativas frente a modelos ASR mas maduros como Whisper o wav2vec2 original.
- Docencia y formacion: ejemplo practico de pipeline `Trainer` con `wav2vec2` para ilustrar el flujo completo de fine-tuning ASR en Transformers 5.x.
- Investigacion sobre decodificacion CTC: permite experimentar con decodificadores greedy, beam search o modelos de lenguaje externos sobre las salidas del modelo.
- Analisis de robustez: con un WER de validacion alto (0,7054), el modelo es util para estudiar modos de fallo y estrategias de mitigacion en ASR de bajo rendimiento.

## Benchmarks y rendimiento

La model card declara un unico resultado en el conjunto de evaluacion, sin especificar el conjunto de datos ni el idioma. No se han publicado otros resultados de benchmarks en la informacion disponible.

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,5644 |
| WER (validacion) | 0,7054 |
| Loss (entrenamiento, paso 60) | 8,1626 |
| Loss (entrenamiento, paso 20) | 13,1139 |

Evolucion durante el entrenamiento:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 20 | 0,3376 | 13,1139 | 1,8869 | 0,7370 |
| 40 | 0,6751 | 13,2835 | 1,5725 | 0,7094 |
| 60 | 1,0 | 8,1626 | 1,5644 | 0,7054 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (316,7 M de parametros), mas el estado de activaciones y el buffer de audio; en la practica, entre 2 y 4 GB para audio de duracion moderada.
- VRAM estimada en FP16: aproximadamente 0,65 GB para pesos, con un total practico de 1,5 a 3 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve para inferencia, incluidas RTX 3060, RTX 4060, RTX 4090, asi como A100 o H100 para lotes grandes. El modelo cabe holgadamente en GPUs de 8 GB o menos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para audios cortos.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`, pipeline `automatic-speech-recognition` de Hugging Face, y servidores de inferencia basados en Transformers. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a wav2vec2.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tamano del repositorio (8,9 GB) sugiere que incluye checkpoints intermedios o multiples formatos, lo que conviene revisar antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sukhun2/asr_mind_mode | 316,7 M | audio variable | 0,7054 (validacion, dataset no especificado) | Apache 2.0 | Hugging Face, 65 descargas |
| w11wo/wav2vec2-xls-r-300m-korean | ~300 M | audio variable | no disponible en esta ficha | Apache 2.0 (segun checkpoint base) | Hugging Face, checkpoint publico |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en esta ficha | MIT | Hugging Face, ampliamente usado |
| facebook/wav2vec2-large-xlsr-53 | 317 M | audio variable | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion directa con Whisper o con el checkpoint base no puede establecerse con rigor porque el modelo no documenta el conjunto de evaluacion ni el idioma. El WER de 0,7054 es sustancialmente peor que el de modelos ASR de referencia en la mayoria de dominios, lo que sugiere un ajuste insuficiente o un dataset de evaluacion particularmente dificil.

## Limitaciones y advertencias

- WER de validacion de 0,7054: aproximadamente 7 de cada 10 palabras se transcriben incorrectamente en el conjunto de evaluacion declarado, lo que lo inutiliza para la mayoria de aplicaciones reales sin un reentrenamiento sustancial.
- Dataset de entrenamiento y de evaluacion no especificados: no es posible saber que idioma, dominio o condiciones acusticas cubre el modelo.
- Idiomas soportados no documentados: aunque el checkpoint base es coreano, el fine-tuning puede haber degradado esa capacidad o haberla desplazado hacia otro dominio.
- Model card generada automaticamente: el autor no ha completado las secciones de descripcion, usos previstos ni limitaciones.
- Entrenamiento muy corto (60 pasos, 1 epoca): el ajuste es insuficiente para converger en la mayoria de tareas ASR.
- Riesgo de alucinacion en la transcripcion: como todo modelo CTC, puede producir secuencias plausibles pero incorrectas en audio ruidoso o fuera de dominio.
- Sesgos: no documentados, pero heredados del corpus de preentrenamiento de XLS-R y del checkpoint coreano, que pueden infrarepresentar acentos, generos o variedades dialectales.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe verificar las condiciones del checkpoint base y de los datos de preentrenamiento subyacentes.
- Repositorio de 8,9 GB: probablemente contiene artefactos de entrenamiento (checkpoints intermedios, optimizador) que no son necesarios para inferencia; conviene descargar solo los ficheros de pesos finales.
- Sin garantias de soporte ni mantenimiento: cero likes y un unico autor, sin historial de actualizaciones mas alla de la creacion y una revision posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sukhun2/asr_mind_mode
- Modelo base: https://huggingface.co/w11wo/wav2vec2-xls-r-300m-korean
- Paper de XLS-R (Meta AI): https://arxiv.org/abs/2111.09296
- Paper original de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Documentacion de Wav2Vec2 en Transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Documentacion del pipeline de reconocimiento automatico del habla: https://huggingface.co/docs/transformers/tasks/asr
