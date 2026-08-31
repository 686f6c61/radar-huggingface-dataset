# thunderboltc/whisper_sanlish_augmented_test1

## Resumen

El modelo `thunderboltc/whisper_sanlish_augmented_test1` es un ajuste fino (fine-tuning) de `openai/whisper-small` orientado a la transliteración de voz en santalí a notación IPA o Sanlish (una romanización del santalí). Lo ha desarrollado el usuario `thunderboltc` y se publica en Hugging Face como un sistema de reconocimiento automático del habla (ASR). El modelo parte de la arquitectura Whisper Small, un transformador encoder-decoder con aproximadamente 244 millones de parámetros, y se ha entrenado sobre un conjunto de datos reducido (3094 muestras de entrenamiento) con el objetivo de transcribir audio en santalí, una lengua minoritaria de la India, a un sistema de escritura fonética o romanizada.

La relevancia de este modelo radica en abordar una lengua de bajos recursos, para la que los sistemas ASR comerciales suelen ofrecer escasa o nula cobertura. Al afinar un modelo preentrenado como Whisper Small, se aprovecha el conocimiento transferido de 680.000 horas de audio multilingüe, adaptándolo a un dominio lingüístico específico. Sin embargo, el modelo se encuentra en una fase experimental: las métricas de validación muestran un WER (Word Error Rate) elevado (36,5 %) y un CER (Character Error Rate) del 9,26 %, lo que indica que todavía no es adecuado para uso en producción sin una evaluación adicional. El repositorio no especifica licencia ni idiomas soportados más allá de la tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (transformador encoder-decoder) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small usa ventanas de audio de 30 segundos, pero no se indica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | santali (transliteracion a IPA/Sanlish) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small, un transformador encoder-decoder con atención estándar, entrenado originalmente por OpenAI sobre 680.000 horas de audio débilmente supervisado. En este caso, el autor ha realizado un ajuste fino sobre un conjunto de datos propio dividido en 80 % entrenamiento, 10 % validación y 10 % test, con 3094, 193 y 193 muestras respectivamente. El proceso de entrenamiento se ha ejecutado durante 15 épocas configuradas, aunque el mejor modelo se seleccionó en la época 11 según la métrica WER. Los hiperparámetros incluyen un learning rate de 2e-5, batch efectivo de 16 (con batch por dispositivo de 8 y acumulación de gradientes de 2), entrenamiento en precisión mixta fp16, gradient checkpointing y una longitud máxima de generación de 225 tokens. No se mencionan técnicas innovadoras adicionales como RLHF, DPO ni decodificación especulativa; el ajuste se limita al entrenamiento supervisado estándar sobre la tarea de transcripción.

## Capacidades

- Reconocimiento automático del habla para la lengua santali, con salida en notación IPA o Sanlish (transliteración).
- Generación de transcripciones texto a partir de audio, limitada a la tarea de ASR.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes.
- No incluye capacidades de visión ni de audio adicionales más allá de la entrada de voz.
- El modelo es monolingüe en la práctica, centrado exclusivamente en santali, aunque al derivar de Whisper podría conservar cierta capacidad multilingüe residual no evaluada.

## Casos de uso

- Transcripción de entrevistas o testimonios orales en santali: el modelo puede convertir grabaciones de audio en texto IPA o Sanlish, facilitando la documentación lingüística y la investigación antropológica.
- Creación de subtítulos para vídeos en santali: dado que el modelo genera texto a partir de audio, puede emplearse en pipelines de subtitulado automático, aunque el WER actual exige revisión humana.
- Preservación de lenguas en peligro: al proporcionar una transcripción fonética estandarizada, ayuda a archivar contenido oral en santali para su estudio y conservación.
- Desarrollo de herramientas educativas: puede integrarse en aplicaciones de aprendizaje de santali para practicar pronunciación y asociar audio con texto.
- Investigación en ASR de bajos recursos: sirve como punto de partida para experimentos con aumento de datos, transferencia de aprendizaje o adaptación a dialectos específicos.
- Generación de corpus paralelos audio-texto: las transcripciones producidas pueden utilizarse para construir conjuntos de datos anotados, útiles para entrenar otros modelos de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas de evaluación en el conjunto de test (época 11, la mejor según WER):

| Metrica | Valor |
|---|---|
| eval_loss | 0,8524 |
| eval_wer | 36,51 % |
| eval_cer | 9,26 % |
| eval_runtime | 84,28 s |
| eval_samples_per_second | 2,29 |
| eval_steps_per_second | 0,297 |

No se han publicado resultados comparativos con otros modelos de ASR para santali ni con el Whisper Small original en el mismo conjunto de datos. Tampoco se dispone de métricas adicionales como MMLU, HumanEval o GSM8K, que son irrelevantes para una tarea de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada: basándose en Whisper Small, la inferencia en fp16 requiere aproximadamente 2-3 GB de VRAM, y en cuantización int8 puede reducirse a ~1,5 GB. No se proporcionan datos específicos del modelo.
- GPU recomendadas: tarjetas de consumo como RTX 3060, RTX 4060 o superiores pueden ejecutar el modelo sin problemas. En el entrenamiento se usó fp16 y gradient checkpointing, lo que sugiere que una GPU con 8-12 GB de VRAM sería suficiente para el ajuste fino.
- Capacidad en CPU: Whisper Small puede ejecutarse en CPU con tiempos de inferencia aceptables para audios cortos, aunque no se han reportado mediciones concretas.
- Opciones de despliegue: al ser un modelo Whisper, es compatible con bibliotecas como `transformers`, `whisper.cpp` (para CPU) y servidores de inferencia como vLLM o TGI, aunque estos últimos están más orientados a modelos de texto. Para ASR, se recomienda usar el pipeline de Hugging Face o el código original de OpenAI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos para establecer una comparativa rigurosa con otros modelos de ASR para santali. Como referencia, el modelo base `openai/whisper-small` tiene 244 millones de parámetros y soporta múltiples idiomas, pero no está específicamente adaptado a santali. Otros fine-tunes de Whisper para lenguas minoritarias podrían existir, pero no se han encontrado en la información proporcionada. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (3094 muestras), lo que incrementa el riesgo de sobreajuste y limita la generalización a hablantes, acentos o contextos no representados.
- El WER de 36,51 % es alto, lo que implica que una parte significativa de las transcripciones contendrá errores. No se recomienda su uso sin supervisión humana en aplicaciones críticas.
- No se documentan sesgos específicos, pero al tratarse de un corpus limitado, es probable que existan sesgos de género, edad o dialecto no declarados.
- La licencia no está especificada, por lo que el uso comercial o la redistribución del modelo pueden entrañar riesgos legales. Se recomienda contactar al autor para aclarar los términos.
- No se ha evaluado el comportamiento en entornos ruidosos, con música de fondo o con diferentes calidades de grabación, más allá de lo que permita el propio Whisper.
- El modelo solo produce salida en IPA o Sanlish, no en escritura Ol Chiki (el alfabeto nativo del santali), lo que puede limitar su utilidad para hablantes que usan esa escritura.

## Enlaces

- [Modelo en Hugging Face: thunderboltc/whisper_sanlish_augmented_test1](https://huggingface.co/thunderboltc/whisper_sanlish_augmented_test1)
- [Modelo base: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Página de Whisper en OpenAI](https://openai.com/index/whisper/)
