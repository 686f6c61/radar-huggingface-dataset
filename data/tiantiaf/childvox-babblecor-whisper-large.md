# tiantiaf/childvox-babblecor-whisper-large

## Resumen

ChildVox-BabbleCor-Whisper-Large es un modelo de reconocimiento automático del habla (ASR) especializado en voz infantil, desarrollado por tiantiaf como parte del proyecto ChildVox. El modelo parte de la arquitectura Whisper-Large de OpenAI y se ha adaptado para mejorar el reconocimiento de vocalizaciones no lingüísticas, balbuceos y habla infantil en etapas tempranas del desarrollo, un dominio donde los modelos ASR generalistas suelen fallar.

El proyecto ChildVox, respaldado por un paper en arXiv (2605.29257), define un benchmark con más de 20 subtareas distribuidas en 17 conjuntos de datos centrados en audio infantil, cubriendo desde sonidos fisiológicos hasta lenguaje hablado escolar. Este modelo concreto se centra en la subtarea de "babble" (balbuceo), una etapa crítica del desarrollo del habla que los sistemas ASR convencionales no logran transcribir con precisión.

La relevancia de este modelo radica en su aplicación en logopedia, pediatría y desarrollo infantil, donde la monitorización objetiva de la producción vocal temprana puede ayudar a detectar trastornos del habla o del desarrollo. El repositorio pesa 0,3 GB, lo que sugiere una versión cuantizada o destilada del Whisper-Large original (que pesa aproximadamente 3 GB en fp32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-Large (encoder-decoder Transformer) adaptado |
| Parametros totales | no disponible (el tamano del repo sugiere una version cuantizada o destilada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Whisper-Large estandar: 30 segundos de audio, 448 tokens) |
| Tipos de cuantizacion | no disponible (peso del repo: 0,3 GB) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Whisper-Large, un modelo encoder-decoder basado en Transformer con atencion por capas, entrenado originalmente con 680.000 horas de audio etiquetado. El modelo ChildVox-BabbleCor adapta esta arquitectura mediante fine-tuning en datos de balbuceo infantil, probablemente extraidos del benchmark ChildVox que integra multiples conjuntos de datos pediatricos.

El proceso de adaptacion sigue el protocolo de evaluacion unificado de ChildVox, que cubre la trayectoria completa del desarrollo vocal infantil: sonidos fisiologicos, vocalizaciones no lingüisticas, silabas canonicas y lenguaje hablado. El modelo se ha publicado mediante PyTorchModelHubMixin, lo que facilita su carga directa con la API de Hugging Face Hub.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset de fine-tuning ni si se aplicaron tecnicas como RLHF o DPO. El codigo fuente esta disponible en el repositorio GitHub childvox-release, aunque el paper asociado aun no tiene informacion publicada.

## Capacidades

- Reconocimiento de balbuceo infantil y vocalizaciones pre-lingüisticas
- Transcripcion de habla infantil en etapas tempranas del desarrollo
- Adaptacion al dominio pediatrico sobre la base de Whisper-Large
- Integracion con el ecosistema Hugging Face mediante model_hub_mixin
- Capacidades ASR multilingue heredadas de Whisper-Large (aunque no se confirma el mantenimiento de estas capacidades tras el fine-tuning)
- Evaluacion estandarizada segun el protocolo ChildVox

## Casos de uso

- Evaluacion logopedica automatizada: el modelo puede transcribir sesiones de balbuceo infantil para que los logopedas cuantifiquen la produccion vocal y detecten desviaciones del desarrollo esperado.
- Monitorizacion del desarrollo temprano: integrado en aplicaciones de salud pediatrica, permite a los padres registrar y analizar las vocalizaciones de sus bebes para seguir la evolucion hacia el habla canónica.
- Investigacion en adquisicion del lenguaje: los investigadores pueden usar el modelo para etiquetar automaticamente grandes corpus de audio infantil, reduciendo el esfuerzo de anotacion manual.
- Sistemas de alerta temprana: en entornos clinicos, el modelo puede senalar retrasos en la produccion de silabas canonicas, un indicador temprano de posibles trastornos del desarrollo.
- Asistentes de terapia en el hogar: combinado con una interfaz sencilla, permite a las familias realizar ejercicios de estimulacion del habla con retroalimentacion automatica.
- Analisis de datos longitudinales: el modelo facilita el procesamiento de grabaciones periodicas para trazar la curva de maduracion vocal de un nino a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de ChildVox (arXiv:2605.29257) evalua una gama de modelos self-supervised, orientados a ASR y audio-language models, pero no se incluyen los resultados especificos de este modelo en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamano del repo (0,3 GB) sugiere que puede ejecutarse en GPUs con 4-6 GB de VRAM si se trata de una version cuantizada.
- GPU recomendadas: no disponible. Para la arquitectura Whisper-Large completa se recomienda al menos una RTX 3090 o A100, pero la version reducida podria funcionar en GPUs de consumo como RTX 3060 o RTX 4060.
- Compatibilidad con GPU de consumo: probable, dado el tamano reducido del repositorio.
- Opciones de despliegue: compatible con Hugging Face Transformers, y potencialmente con vLLM o TGI si se convierte a los formatos adecuados. No se confirma soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| ChildVox-BabbleCor-Whisper-Large | no disponible | no disponible | Balbuceo infantil | no disponible |
| Whisper-Large-v3 (OpenAI) | 1.550 M | 30 s audio | ASR generalista multilingue | MIT |
| Wav2Vec2-XLSR (Meta) | 300 M | 10 s audio | ASR multilingue | MIT |
| HuBERT (Meta) | 95-300 M | 10 s audio | Representaciones de habla | MIT |

La comparativa se limita a modelos base porque no se dispone de informacion sobre otros modelos especializados en voz infantil. La diferencia clave es que ChildVox-BabbleCor esta fine-tuneado para un dominio muy especifico, mientras que los modelos generalistas no rinden bien en vocalizaciones pre-lingüisticas.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia, lo que impide confirmar si es utilizable en entornos comerciales.
- El modelo esta especializado en balbuceo infantil; su rendimiento en habla adulta o en otros dominios puede degradarse respecto al Whisper-Large original.
- No se han publicado metricas de rendimiento, por lo que no es posible evaluar su precision real.
- El tamano reducido del repositorio (0,3 GB) sugiere una posible cuantizacion que podria afectar a la calidad de la transcripcion.
- Los datos de entrenamiento no estan documentados, por lo que se desconocen posibles sesgos demograficos o culturales en las grabaciones infantiles utilizadas.
- El modelo se publico en 2026 y no tiene descargas ni likes, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.
- No se confirma el mantenimiento de las capacidades multilingue de Whisper-Large tras el fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiantiaf/childvox-babblecor-whisper-large
- Coleccion ChildVox: https://huggingface.co/collections/tiantiaf/childvox
- Repositorio de codigo: https://github.com/tiantiaf0627/childvox-release
- Paper en arXiv: https://arxiv.org/abs/2605.29257
- Pagina del proyecto: https://tiantiaf0627.github.io/childvox/
- Modelo relacionado (speech maturity): https://huggingface.co/tiantiaf/childvox-speechmaturity-whisper-large
