# ZhangXinWhut/BiMTokenizer

## Resumen

BiMTokenizer es un tokenizador de voz bidireccional basado en la arquitectura Mamba, diseñado para la codificación de voz a baja tasa de bits. Desarrollado por Xin Zhang y colaboradores, el modelo aborda el equilibrio entre preservación semántica y acústica en codecs neuronales, un desafío clave en la compresión de voz. El repositorio ofrece tres checkpoints distintos que operan a 16 kHz, con tasas de bits entre 1087.5 y 1100 bps. Su relevancia se debe a que, según el estudio en OpenReview, logra el mejor WER entre los codecs de baja tasa de bits, utilizando menos de la mitad de parámetros que los baselines de doble torre recientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba bidireccional |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

BiMTokenizer emplea una arquitectura de Mamba bidireccional, un modelo de espacio de estado (SSM) que procesa secuencias de audio de forma direccional. El entrenamiento se realiza sobre el conjunto de datos LibriSpeech, un corpus de habla inglesa. Se ofrecen tres variantes que difieren en el extractor de voz y el esquema de cuantización: BiMTokenizer-Whisper, BiMTokenizer-SenseVoice y BiMTokenizer-SenseVoice (32768+4096). Las variantes usan codebooks fijos de Leech, incluidos en el repositorio de código. Los detalles específicos del entrenamiento, como el número de tokens o el proceso de optimización, no están disponibles en la información proporcionada.

## Capacidades

- Codificación de voz a baja tasa de bits: produce representaciones de audio de aproximadamente 1100 bps.
- Reconstrucción acústica: logra un SIM de hasta 0.87 y un STOI de 0.95 en LibriSpeech test-clean.
- Preservación semántica: mantiene un WER de 2.44, muy cercano al audio de referencia (2.16).
- Operación a 16 kHz: todos los checkpoints publicados trabajan exclusivamente a esta frecuencia de muestreo.
- Robustez en entornos ruidosos: el estudio menciona que supera a otros codecs de baja tasa de bits en condiciones de ruido.

## Casos de uso

- Compresión de voz para transmisión en tiempo real: con una tasa de bits de ~1100 bps, el modelo puede transmitir voz en canales de baja capacidad, como radios o comunicaciones satelitales, manteniendo una inteligibilidad aceptable.
- Almacenamiento eficiente de grabaciones: reduce el tamaño de los archivos de audio, permitiendo archivar largas horas de conversaciones en sistemas con limitaciones de almacenamiento.
- Preprocesamiento para reconocimiento de voz: al tokenizar la voz preservando la semántica, el modelo puede servir como front-end para sistemas de ASR, manteniendo un WER bajo.
- Investigación en codecs neuronales: permite estudiar el equilibrio entre reconstrucción acústica y semántica, comparando con otros enfoques de cuantización.
- Mejora de calidad en VoIP: la representación compacta puede mitigar el impacto de la pérdida de paquetes en redes congestionadas.
- Evaluación de calidad de audio: las métricas de reconstrucción (PESQ, STOI, UTMOS) permiten usar el modelo como referencia para medir la calidad de voz.

## Benchmarks y rendimiento

Los resultados en LibriSpeech test-clean proporcionados por el autor son:

| Modelo | SIM ↑ | STOI ↑ | PESQ-NB ↑ | PESQ-WB ↑ | UTMOS ↑ | WER ↓ |
|---|---|---|---|---|---|---|
| Ground Truth | 1.00 | 1.00 | 4.55 | 4.64 | 4.09 | 2.16 |
| BiMTokenizer-Whisper | 0.87 | 0.95 | 3.56 | 3.03 | 4.21 | 2.44 |
| BiMTokenizer-SenseVoice | 0.85 | 0.94 | 3.45 | 2.85 | 4.18 | 2.53 |
| BiMTokenizer-SenseVoice (32768+4096) | 0.86 | 0.943 | 3.459 | 2.893 | 4.20 | 2.48 |

Estos datos muestran una reconstrucción acústica y semántica alta, con un WER cercano al audio original. El estudio en OpenReview indica que BiMTokenizer supera a otros codecs de baja tasa de bits en términos de WER y calidad acústica, con menos de la mitad de parámetros que los baselines de doble torre.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación disponible. El tamaño del repositorio es de 3.0 GB, lo que sugiere que los pesos son relativamente grandes. La inferencia requiere una GPU con CUDA, ya que el script de ejemplo usa el dispositivo `cuda`. No se especifica la VRAM necesaria, pero para cargar pesos de ~3 GB se recomienda una GPU con al menos 8 GB de VRAM. El código está disponible en GitHub y puede ejecutarse con PyTorch. Para despliegue, se puede usar el script de inferencia directo o integrarlo en pipelines con vLLM u otros frameworks, aunque no se mencionan opciones específicas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos en la misma categoría en la documentación proporcionada. El paper menciona que BiMTokenizer supera a los baselines de doble torre recientes, pero no se citan nombres concretos. Codecs como EnCodec o SpeechStream podrían ser comparables, pero no hay datos numéricos directos en esta fuente para una comparación detallada.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia de uso, lo cual puede ser un problema para uso comercial.
- Frecuencia de muestreo fija: el modelo solo opera a 16 kHz, lo que limita su uso en audio de mayor calidad.
- Idiomas no documentados: el entrenamiento se realiza en LibriSpeech (inglés), pero no hay datos sobre el rendimiento en otros idiomas.
- Riesgo de artefactos: como cualquier codec, la reconstrucción puede introducir artefactos en ciertos tipos de audio.
- Dependencia de codebooks fijos: los codebooks de Leech están incluidos en el repositorio, pero deben mantenerse sincronizados con los checkpoints.
- Tamaño de los pesos: 3.0 GB puede ser elevado para entornos con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/ZhangXinWhut/BiMTokenizer
- GitHub: https://github.com/ZhangXinWhut/BiMTokenizer
- Demo: https://zhangxinwhut.github.io/BiMTokenizer/
- Paper en OpenReview: https://openreview.net/forum?id=jentwauYkf
