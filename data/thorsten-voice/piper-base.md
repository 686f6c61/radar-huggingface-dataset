# Thorsten-Voice/Piper-Base

## Resumen

Piper-Base es un modelo de síntesis de voz (text-to-speech) en alemán, voz masculina, desarrollado por Thorsten-Voice (Thorsten Müller) y publicado bajo licencia CC0. Se trata de un modelo base de la familia Piper, construido sobre la arquitectura VITS, cuyo propósito principal no es el uso directo en producción sino servir como punto de partida para el fine-tuning de voces Piper personalizadas. Su relevancia radica en la cadena de procedencia: a diferencia de la mayoría de voces Piper, que se afinan a partir del checkpoint `lessac` de licencia ambigua para uso comercial, este modelo se entrenó exclusivamente con datos CC0 del propio autor, sin ningún modelo de terceros en su historial.

El modelo se entrenó en dos fases: primero `Piper-Scratch` desde inicialización aleatoria sobre aproximadamente 10 horas de audio, y después este base mediante warmstart (solo pesos, época 1799) sobre unas 32,4 horas de audio alemán neutro durante 1000 épocas. El repositorio ocupa 1,8 GB e incluye checkpoints de entrenamiento (generador y discriminador), exportaciones ONNX para inferencia, muestras de audio, curvas de TensorBoard y el script de preparación de datos.

Es relevante ahora porque ofrece una alternativa completamente CC0 para quienes necesitan certeza legal sobre la ascendencia de los datos en un pipeline de TTS comercial, un problema recurrente en la comunidad Piper. El modelo solo soporta alemán y su calidad como voz directa es funcional pero secundaria respecto a su rol como base de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS), implementada en piper1-gpl |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (exportacion ONNX estándar; no se documentan variantes cuantizadas) |
| Idiomas soportados | Alemán (de) |
| Licencia | CC0-1.0 |
| Formato de pesos | Checkpoints PyTorch Lightning (.ckpt, ~800 MB cada uno, con generador y discriminador) y ONNX (.onnx + .onnx.json) para inferencia |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un encoder de texto basado en fonemas, un prior variacional, un decoder generativo y un discriminador adversarial multi-periodo, todo entrenado conjuntamente. La implementación corresponde a piper1-gpl, la versión GPL del motor Piper mantenida por OHF-Voice. La entrada de texto se convierte a fonemas mediante espeak-ng, y el modelo genera audio a 22.050 Hz mono, 16 bits PCM.

El entrenamiento siguió una cadena estrictamente CC0. La primera fase, `Piper-Scratch`, partió de inicialización aleatoria (sin lessac ni warmstart) sobre el dataset Thorsten-Voice 2022.10-Neutral, aproximadamente 10 horas, durante 1800 épocas. La segunda fase, este modelo base, hizo warmstart solo con los pesos de la época 1799 y se entrenó sobre la combinación de Thorsten-Voice 2021.02-Neutral y 2022.10-Neutral, unas 32,4 horas en total, durante 1000 épocas. Todo el material procede del dataset TV-44kHz-Full (CC0) de grabaciones del propio autor. El checkpoint recomendado para fine-tuning es `epoch=961-val_mel=0.3871.ckpt`, el de mejor pérdida mel de validación de toda la ejecución; existe una alternativa en `epoch=751-val_mel=0.3883.ckpt`, equivalente en pruebas de escucha a ciegas. El entrenamiento se realizó en una NVIDIA A40 de 48 GB con batch size 32, consumiendo unos 39 GB de VRAM.

## Capacidades

- Síntesis de voz en alemán a partir de texto, con conversión previa a fonemas mediante espeak-ng.
- Voz masculina alemana neutra, entrenada sobre grabaciones de un único hablante.
- Generación de audio a 22.050 Hz mono, 16 bits PCM.
- Exportación a ONNX para inferencia con el motor Piper.
- Base para fine-tuning: los checkpoints incluyen pesos del generador y del discriminador, lo que estabiliza el reentrenamiento sobre datos nuevos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada; es exclusivamente TTS.
- Multilingüismo limitado al alemán.

## Casos de uso

- Fine-tuning de voces Piper comerciales con garantías legales: el modelo sirve como punto de partida para entrenar una voz propia sabiendo que toda la ascendencia es CC0, lo que elimina el riesgo asociado al checkpoint `lessac` de licencia incierta.
- Creación de voces sintéticas para audiolibros o narración: se puede usar directamente con Piper para generar narración en alemán, o afinar sobre el base para ajustar el timbre y el estilo al contenido.
- Asistentes de voz embebidos en dispositivos: la exportación ONNX permite desplegar el modelo en entornos con recursos limitados mediante el motor Piper, con latencia baja y sin dependencia de GPU dedicada en inferencia.
- Generación de avisos y locuciones automatizadas: integración en sistemas que producen anuncios hablados en alemán (transporte, comercio, domótica) a partir de plantillas de texto.
- Accesibilidad y lectura de contenido: conversión de texto a voz para aplicaciones de lectura asistida en alemán, con la posibilidad de afinar la voz para un dominio o registro concreto.
- Investigación en TTS y reproducibilidad: al publicarse checkpoints, curvas de entrenamiento, estadísticas por utterance y el script de preparación de datos, permite reproducir y auditar todo el pipeline de entrenamiento.
- Desarrollo de datasets de voz sintética: generación de audio alemán a escala para aumento de datos en tareas de ASR u otros sistemas de voz, con licencia CC0 que facilita su redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de validación: pérdida mel de validación de 0,3871 en la época 961 (checkpoint recomendado) y 0,3883 en la época 751. No se proporcionan cifras de MOS, UTMOS ni comparaciones cuantitativas con otras voces Piper.

## Requisitos de hardware

- Inferencia: no se documenta VRAM específica; al ejecutarse mediante ONNX con el motor Piper, el modelo es ligero y apto para CPU y GPU de gama baja.
- Entrenamiento y fine-tuning: 24 GB de VRAM se consideran cómodos; el entrenamiento original usó una A40 de 48 GB con batch size 32 y unos 39 GB de consumo. En tarjetas menores debe reducirse el `batch_size`.
- GPU consumer: el fine-tuning cabe en tarjetas de 24 GB como la RTX 4090; para inferencia no se requieren GPU dedicadas.
- Despliegue: motor Piper (piper1-gpl) con los archivos ONNX; también es posible usar los checkpoints con PyTorch Lightning para entrenamiento.
- Almacenamiento: la caché de entrenamiento necesita aproximadamente 1 GB por hora de audio, más unos 9 GB para checkpoints (Lightning conserva los 5 mejores por métrica más `last.ckpt`, cada uno de ~800 MB).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Procedencia de datos | Uso previsto |
|---|---|---|---|---|---|
| Thorsten-Voice/Piper-Base | VITS | Alemán | CC0-1.0 | Exclusivamente Thorsten-Voice CC0 | Base para fine-tuning |
| Voces Piper derivadas de `lessac` | VITS | Varios | Depende de la voz | Checkpoint `lessac` de licencia incierta | Uso directo y fine-tuning |
| Thorsten-Voice/Piper-Scratch | VITS | Alemán | CC0 (según cadena) | Thorsten-Voice 2022.10-Neutral (~10 h) | Punto de partida previo, menor calidad |

La diferencia principal frente a las voces Piper convencionales es la trazabilidad legal de los datos, no el rendimiento acústico. Frente a `Piper-Scratch`, este base incorpora más horas de entrenamiento (~32,4 h frente a ~10 h) y mejores métricas de validación.

## Limitaciones y advertencias

- Modelo de un único hablante masculino; no cubre otras voces ni acentos sin fine-tuning.
- Solo alemán; no soporta otros idiomas.
- Su finalidad principal es servir de base para fine-tuning; el uso directo como voz es posible pero secundario y su calidad no se ha evaluado con métricas objetivas publicadas.
- La licencia del modelo afinado resultante depende de los datos usados en el fine-tuning; solo se mantiene CC0 si se entrena con datos CC0.
- Riesgo de alucinación no aplica en el sentido de LLM, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o en textos con fonética atípica.
- No se documentan sesgos específicos más allá de la limitación de hablante y registro (audio neutro de estudio).
- El código de entrenamiento (piper1-gpl) está bajo GPL y en desarrollo activo; la guía de fine-tuning depende de un commit concreto y puede quedar desactualizada.
- Para entrenamiento se requieren dependencias adicionales no siempre incluidas (`torchaudio`, `onnxscript`) y `espeak-ng`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thorsten-Voice/Piper-Base
- Modelo previo Piper-Scratch: https://huggingface.co/Thorsten-Voice/Piper-Scratch
- Dataset TV-44kHz-Full: https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full
- Repositorio piper1-gpl: https://github.com/OHF-Voice/piper1-gpl
