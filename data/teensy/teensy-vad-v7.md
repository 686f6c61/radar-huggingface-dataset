# Teensy/teensy-vad-v7

## Resumen

teensy-vad-v7 es un detector de actividad de voz (VAD) de 41.809 parámetros desarrollado por Teensy (Pankaj Doharey / Metacritical, VoxLogic) para telefonía a 8 kHz. Sustituye el backbone MLP de las generaciones anteriores por una capa GRU de 96 unidades, lo que le permite mantener estado recurrente a lo largo de toda la llamada en lugar de depender de una ventana fija de 100 ms. El modelo se distribuye con pesos en formato numpy (169 KB) y una implementación de inferencia verificada que no requiere PyTorch en producción.

Es relevante porque consigue el mejor rendimiento de la familia TeensyVAD en todas las métricas reales (TEN y AMI) con la mitad de parámetros que su predecesor y 1,7 veces más rápido, además de superar a Silero VAD en escenarios de salas multiparte. Está entrenado con datos con licencia CC BY 4.0 (LibriSpeech-100, MUSAN, AMI ambience) y destilado de un profesor Silero (MIT), lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de una capa (96 unidades) + capa de salida, entrada de 40 log-mel (hop 10 ms @ 8 kHz) |
| Parametros totales | 41.809 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (estado recurrente causal, sin lookahead) |
| Tipos de cuantizacion | no disponible (runtime numpy nativo, sin cuantizacion publicada) |
| Idiomas soportados | ingles (unico idioma documentado) |
| Licencia | CC BY 4.0 (pesos), MIT (codigo) |
| Formato de pesos | npz (numpy) |

## Arquitectura y entrenamiento

El modelo usa una capa GRU de 96 unidades como backbone recurrente, reemplazando el MLP de ventana fija de las versiones v5 y v6. La entrada son 40 coeficientes log-mel calculados a 8 kHz con un hop de 10 ms. El estado GRU se propaga indefinidamente a lo largo de la llamada, lo que proporciona memoria a largo plazo sin necesidad de aumentar la capacidad del modelo. La implementacion numpy en `teensyvad/rnn.py` esta verificada contra la referencia torch con una diferencia maxima de probabilidad de 1.8e-07 sobre 250 frames en streaming.

El entrenamiento se realizo por destilacion desde Silero VAD (1,77 M de parametros) usando datos de LibriSpeech train-clean-100, MUSAN y ambiente AMI, todos con licencia CC BY 4.0. Los umbrales de decision se calibraron sobre reuniones de desarrollo de AMI (`thr_hi 0.08`). El autor documenta dos resultados negativos: ampliar el MLP de 80k a 200k parametros empeora el AUC de TEN, y escalar los datos de entrenamiento a 360 h de LibriSpeech tambien degrada el rendimiento por desequilibrio de prior de habla.

## Capacidades

- Deteccion de actividad de voz en tiempo real sobre audio de 8 kHz, disenado para telefonía.
- Inferencia en streaming frame a frame (10 ms de hop) con estado persistente entre frames.
- Memoria recurrente a lo largo de toda la llamada, sin limite de contexto izquierdo.
- Procesamiento causal sin lookahead, apto para aplicaciones de baja latencia.
- Runtime numpy puro, sin dependencias de frameworks de deep learning en produccion.
- Umbrales calibrados incluidos en los metadatos del archivo de pesos.
- Rendimiento superior en escenarios de salas multiparte (AMI) frente a Silero VAD.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede segmentar turnos de habla en llamadas telefonicas de 8 kHz, permitiendo a un sistema de IVR detectar cuando el usuario habla o guarda silencio, con una latencia de 37,9 µs por frame de 20 ms.
- Preprocesamiento para reconocimiento de voz (ASR): filtrar silencios y no habla antes de enviar audio a un motor de transcripcion, reduciendo coste de computo y mejorando la precision al eliminar segmentos vacios.
- Dispositivos embebidos y microcontroladores: con solo 169 KB de pesos y ejecucion numpy, puede desplegarse en hardware de muy bajos recursos, como gateways VoIP o telefonos IP, para activacion por voz o ahorro de energia.
- Analisis de conversaciones multiparte: en reuniones o salas con varios interlocutores, el modelo distingue actividad de voz de ruido ambiente (F1 0.9153 en AMI), util para diarizacion o transcripcion de reuniones.
- Filtrado de grabaciones: limpiar archivos de audio telefonico eliminando tramos de silencio o ruido de fondo antes de almacenamiento o analisis posterior.
- Sistemas de respuesta de voz interactiva (IVR): detectar cuando el usuario interrumpe o responde, permitiendo barge-in en sistemas automatizados de telefonia.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con audio real etiquetado por humanos y el mismo protocolo para todos los sistemas:

| Modelo | Parametros | TEN F1* | TEN AUC | AMI F1 | AMI AUC | µs/20ms |
|---|---:|---:|---:|---:|---:|---:|
| teensy-v7-GRU96 | 41.809 | 0.8992 | 0.8934 | 0.9153 | 0.9182 | 37,9 |
| teensy-v6-a2 (mejor MLP) | 49.249 | 0.9081 | 0.8870 | 0.8822 | 0.8726 | 66 |
| teensy-v5-80k | 80.373 | 0.9016 | 0.8877 | 0.8845 | 0.8622 | 63 |
| Silero VAD (1,77M) | 1.774.000 | 0.9381 | 0.9519 | 0.7136 | 0.8938 | 94 |
| WebRTC VAD | ~6k | n/a | n/a | 0.8419 | 0.7602 | 2 |
| Energy VAD | — | — | 0.6702 | 0.5920 | 0.6578 | 7 |

\* TEN F1 en el umbral optimo; AMI con umbrales calibrados en dev de AMI (`thr_hi 0.08`).

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU con numpy.
- Peso del modelo: 169 KB (archivo npz), 41.809 parametros.
- Latencia: 37,9 µs por frame de 20 ms en CPU (medido en el protocolo de la familia).
- GPU recomendada: ninguna; funciona en procesadores de proposito general, incluidos ARM y microcontroladores con soporte numpy.
- Opciones de despliegue: runtime numpy propio (`teensyvad.rnn.TinyGRU`), integrable en pipelines de Python; tambien disponible en GitHub con soporte ONNX y Asterisk AudioSocket.
- Throughput estimado: procesa un frame de 20 ms en menos de 40 µs, lo que permite multiples canales en tiempo real en un solo nucleo de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TEN AUC | AMI AUC | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| teensy-vad-v7 | 41.809 | Recurrente (sin limite) | 0.8934 | 0.9182 | CC BY 4.0 | numpy npz |
| Silero VAD | 1.774.000 | Recurrente (sin limite) | 0.9519 | 0.8938 | MIT | ONNX, torch |
| WebRTC VAD | ~6k | Ventana fija (10-30 ms) | n/a | 0.7602 | BSD | C++ |
| teensy-vad-v6-a2 | 49.249 | Ventana 100 ms | 0.8870 | 0.8726 | CC BY 4.0 | numpy npz |

teensy-v7 supera a Silero en AMI (salas multiparte) con 42 veces menos parametros, pero Silero mantiene ventaja en TEN (microfono cercano limpio). WebRTC es mas rapido pero significativamente menos preciso en entornos ruidosos.

## Limitaciones y advertencias

- Solo soporta habla en ingles; no se ha evaluado en otros idiomas.
- No se incluyo musica en el entrenamiento; puede fallar en audio con fondo musical.
- El contexto recurrente es causal y sin lookahead, por lo que no puede usar informacion futura para decisiones.
- No incluye cancelacion de eco (AEC); en entornos con eco fuerte puede degradarse.
- Silero VAD sigue siendo superior en condiciones de microfono cercano limpio (TEN AUC 0.9519 vs 0.8934).
- Los umbrales incluidos estan calibrados para reuniones AMI; para telefonia de microfono cercano se recomienda `thr_hi 0.45` segun el autor.
- El escalado ingenuo de datos de entrenamiento empeora el rendimiento (documentado como resultado negativo), por lo que no se debe asumir que mas datos mejoran el modelo sin ajustar el equilibrio de prior de habla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Teensy/teensy-vad-v7
- Repositorio GitHub: https://github.com/TeensyAI/teensyvad
- Version anterior v5: https://huggingface.co/Teensy/teensy-vad-v5
- Version original v1: https://huggingface.co/Teensy/teensy-vad-1
- Notas de lanzamiento v7: https://teensy.tech/blogs/releases/v7
