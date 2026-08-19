# Teedyyy-rm/Confucius4-storycast

## Resumen

Confucius4-storycast es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario Teedyyy-rm, basado en el modelo Confucius4-TTS de NetEase Youdao. Se trata de un fine-tuning específico para la voz vietnamita de la locutora Ngoc Huyen, orientado a la narración de cuentos y audiolibros. El modelo está publicado bajo licencia Apache 2.0 y requiere aceptación de condiciones en HuggingFace (acceso restringido).

Aunque el repositorio no proporciona detalles técnicos completos, el tamaño del archivo (78.6 GB) sugiere un modelo de gran escala, probablemente con una arquitectura de difusión o autoregresiva similar a la de otros sistemas TTS modernos. Su relevancia radica en ofrecer una voz vietnamita natural y clonable en escenarios de narración, un nicho poco cubierto por los modelos TTS multilingües generalistas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en netease-youdao/Confucius4-TTS) |
| Parametros totales | no disponible (repo de 78.6 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (aplica a TTS, no a texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base Confucius4-TTS. Por el nombre y el contexto, es probable que se trate de un modelo de síntesis de voz basado en transformers con capacidad de clonación de voz zero-shot, similar a VALL-E o NaturalSpeech. El fine-tuning se realizó sobre un conjunto de datos de voz de Ngoc Huyen (datasets `pnnbao-ump/ngochuyen_voice` y `thangnzt/NgocHuyenViVoice`), con el objetivo de adaptar el modelo a las características vocales específicas de esta locutora para aplicaciones de narración.

No hay información disponible sobre el número de tokens de entrenamiento, el proceso de alineación (RLHF/DPO) ni otras innovaciones técnicas. Se recomienda consultar la documentación del modelo base para más detalles.

## Capacidades

- Síntesis de voz en vietnamita con alta naturalidad, adaptada a la voz de Ngoc Huyen.
- Clonación de voz zero-shot (según las capacidades típicas del modelo base Confucius4-TTS, aunque no confirmado en esta ficha).
- Generación de audio a partir de texto, adecuada para narración de cuentos y audiolibros.
- Posible soporte de control de prosodia y emoción (no confirmado).
- No se mencionan capacidades multilingües más allá del vietnamita en este fine-tuning.

## Casos de uso

- Audiolibros y narración de cuentos: el modelo está específicamente fine-tuneado para la voz de Ngoc Huyen, lo que permite generar narraciones consistentes y naturales en vietnamita para plataformas de audiolibros.
- Asistentes de voz en vietnamita: puede integrarse en asistentes virtuales o sistemas de lectura en voz alta para aplicaciones móviles o web.
- Doblaje de contenido audiovisual: la clonación de voz permite generar locuciones para vídeos, animaciones o presentaciones con una voz conocida.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura en vietnamita.
- Marketing y publicidad: creación de anuncios o mensajes de voz personalizados con la voz de Ngoc Huyen (si se cuenta con los derechos de uso).
- Prototipado rápido de productos TTS: los desarrolladores pueden evaluar la calidad de la voz vietnamita antes de invertir en grabaciones profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas (MOS, WER, etc.) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- El tamaño del repositorio (78.6 GB) indica que el modelo requiere una GPU con al menos 40-80 GB de VRAM para inferencia en precisión completa, dependiendo de la arquitectura y la longitud de audio generado.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o GPUs de consumo de gama alta con 24 GB (RTX 3090/4090) si se aplican cuantizaciones o se utiliza una versión optimizada.
- No se especifican formatos de cuantización, pero es probable que se pueda convertir a GGUF o usar técnicas como FP16 para reducir requisitos.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con librerías como `transformers`, `diffusers` o `TTS` de Coqui. Para producción, se recomienda vLLM (si aplica) o servicios dedicados de TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos TTS vietnamitas (como VITS, Tacotron 2, o modelos multilingües como XTTS). El modelo es un fine-tuning de Confucius4-TTS, y no se conocen modelos comparables con el mismo nivel de especialización en la voz de Ngoc Huyen. Se recomienda evaluar el modelo directamente frente a alternativas como `VietTTS` o `FPT.AI` para casos de uso específicos.

## Limitaciones y advertencias

- El acceso es restringido (gated); los usuarios deben solicitar permiso al autor en HuggingFace.
- No hay documentación técnica detallada en el repositorio, lo que dificulta la reproducibilidad y el despliegue.
- El modelo está especializado en la voz de Ngoc Huyen; su uso para otras voces puede degradar la calidad.
- Posibles sesgos en la pronunciación de nombres o términos técnicos en vietnamita.
- Riesgo de alucinación en la síntesis de texto (errores de pronunciación o entonación) para frases complejas o poco comunes.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar los derechos de la voz utilizada (Ngoc Huyen) antes de un despliegue comercial.
- El tamaño del modelo (78.6 GB) puede ser prohibitivo para despliegues en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Teedyyy-rm/Confucius4-storycast
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-TTS
- Dataset de voz: https://huggingface.co/datasets/pnnbao-ump/ngochuyen_voice
- Dataset de voz (alternativo): https://huggingface.co/datasets/thangnzt/NgocHuyenViVoice
