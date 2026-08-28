# Teensy/teensy-vad-v5

## Resumen

teensy-vad-v5 es la quinta generación de la familia TeensyVAD, un conjunto de detectores de actividad de voz (VAD) ultraligeros diseñados específicamente para audio telefónico de 8 kHz. Desarrollado por Pankaj Doharey (Metacritical) y VoxLogic, el modelo resuelve el problema de la detección de habla en tiempo real con un coste computacional mínimo: entre 20 000 y 100 000 parámetros, lo que permite ejecutarlo en CPU de gama baja o incluso en dispositivos embebidos. Su relevancia actual radica en que, a diferencia de la versión anterior (v4), el pipeline de entrenamiento es completamente comercialmente seguro, al sustituir el ruido ambiental de ESC-50 (CC BY-NC-SA) por MUSAN (CC BY 4.0), eliminando así las restricciones de uso no comercial.

La arquitectura es un perceptrón multicapa (MLP) de 3 capas precedido de un frontend de características log-mel con deltas y un contexto de 10 tramas (100 ms). El modelo se ofrece en cuatro tamaños (20k, 40k, 80k y 100k), siendo la variante v5-80k la recomendada por defecto y v5-40k el punto óptimo entre tamaño y precisión. La inferencia consume aproximadamente 63-64 microsegundos por fragmento de 20 ms en un solo núcleo, lo que lo hace adecuado para streaming en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 3 capas con frontend log-mel (20 bandas, 80-3800 Hz) + deltas + contexto de 10 tramas |
| Parametros totales | 80 373 (variante v5-80k); también disponibles 20 449, 39 609 y 99 593 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 100 ms (10 tramas de 10 ms) |
| Tipos de cuantizacion | float32 (nativo), int8 dinámico (ONNX) |
| Idiomas soportados | Inglés (limitación declarada por el autor) |
| Licencia | CC BY 4.0 (pesos); código MIT |
| Formato de pesos | .npz (numpy), .onnx (float32 e int8) |

## Arquitectura y entrenamiento

El modelo sigue un diseño deliberadamente simple: cada fragmento de 20 ms de audio PCM de 8 kHz se convierte en un vector de características compuesto por 20 coeficientes log-mel (con filtros entre 80 y 3800 Hz), sus deltas temporales y un contexto de 10 tramas (5 anteriores y 5 posteriores). Este vector alimenta un MLP de 3 capas que produce una probabilidad de actividad de voz. La ventana de análisis es de 25 ms con un salto de 10 ms, lo que proporciona una resolución temporal fina para aplicaciones de telefonía.

El entrenamiento utiliza destilación desde Silero VAD (MIT) como profesor, con datos de habla de LibriSpeech train-clean-100 (CC BY 4.0), ruido ambiental de MUSAN (CC BY 4.0) y ambientes de sala de reuniones de AMI (CC BY 4.0). La innovación principal de v5 respecto a v4 es exclusivamente la sustitución del pool de ruido: se elimina ESC-50 (CC BY-NC-SA) para garantizar que los pesos no arrastren ninguna restricción de uso no comercial. No se emplean técnicas como RLHF o DPO; el ajuste se realiza mediante umbrales calibrados (thr_hi/thr_lo) que se almacenan en los metadatos del archivo .npz.

## Capacidades

- Detección de actividad de voz en tiempo real sobre audio telefónico de 8 kHz, con latencia de un solo fragmento (20 ms).
- Procesamiento en streaming: la API `StreamingVAD` acepta tramas PCM16LE de 20 ms y emite eventos `speech_start` y `speech_end`.
- Inferencia extremadamente ligera: ~63-64 µs por fragmento en un solo núcleo de CPU, sin necesidad de GPU.
- Compatibilidad multiplataforma mediante exportación a ONNX (float32 e int8 dinámico), además del runtime nativo en numpy.
- Umbrales calibrados incluidos en los metadatos: perfil de sala lejana (thr_hi 0.10) y perfil de micrófono cercano (thr_hi 0.45 recomendado para telefonía).
- Integración con Asterisk mediante AudioSocket, según se documenta en el repositorio oficial.
- Distintas variantes de tamaño (20k, 40k, 80k, 100k) para adaptarse a restricciones de memoria o precisión.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones telefónicas multi-turno, detectando cuándo habla el usuario y cuándo el agente, gracias a su baja latencia y capacidad de streaming. Su tamaño reducido permite ejecutarlo en centralitas VoIP o en el mismo servidor de la aplicación sin coste adicional.
- Transcripción de llamadas: como preprocesador para sistemas de reconocimiento de voz (ASR), segmenta el audio en intervalos de habla, evitando transcribir silencios o ruido de fondo y reduciendo el coste computacional del ASR.
- Sistemas de respuesta interactiva (IVR): detecta si el usuario ha empezado a hablar para interrumpir mensajes pregrabados o para capturar comandos de voz, mejorando la experiencia de navegación telefónica.
- Monitorización de conferencias: en salas de reuniones, el modelo (especialmente la variante v5-40k) alcanza un F1 de 0.8853 en audio ambiente, permitiendo detectar turnos de palabra en grabaciones de reuniones con micrófonos de sala.
- Preprocesado para agentes de voz en dispositivos embebidos: su huella de memoria (321 KB en float32 para v5-80k) lo hace apto para routers, gateways VoIP o dispositivos IoT que necesitan activación por voz sin depender de la nube.
- Filtrado de audio en pipelines de datos: en la preparación de datasets de habla, el VAD puede eliminar automáticamente segmentos sin voz, acelerando el etiquetado y reduciendo el almacenamiento.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación están declarados por el autor en la model card y en el model-index. Se evaluaron con el protocolo estándar de la familia TeensyVAD sobre audio real etiquetado por humanos.

| Modelo | Parámetros | TEN F1* | TEN AUC | AMI F1 | AMI AUC | µs/20ms |
|---|---|---|---|---|---|---|
| teensy-v5 (20k) | 20 449 | 0.8953 | 0.8760 | 0.8836 | 0.8579 | 64 |
| teensy-v5-40k | 39 609 | 0.8963 | 0.8810 | **0.8853** | 0.8620 | 64 |
| **teensy-v5-80k** | 80 373 | **0.9016** | **0.8877** | 0.8845 | 0.8622 | 63 |
| teensy-v5-100k | 99 593 | 0.9008 | 0.8865 | 0.8823 | 0.8596 | 63 |
| Silero VAD (1.77M) | 1 774 000 | 0.9381 | 0.9519 | 0.7136 | 0.8938 | 94 |
| WebRTC VAD | — | n/a | n/a | 0.8419 | 0.7602 | 2 |
| Energy VAD | — | — | 0.6702 | 0.5920 | 0.6578 | 7 |

\* TEN F1 en el umbral óptimo (cota superior); AMI con umbrales calibrados en el dev de AMI, mismo protocolo para todos los sistemas.

El benchmark oficial del model-index reporta un ROC-AUC de 0.8877 en el conjunto público TEN VAD para la variante v5-80k, consistente con la tabla anterior. El autor destaca que v5-80k supera a v4-80k (0.880) y a FlashVAD v0.1 (0.882) al mismo número de parámetros.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta íntegramente en CPU.
- Memoria RAM: el modelo v5-80k ocupa 321 KB en float32 (formato .npz); la variante de 20k ocupa 87 KB. La versión int8 ONNX del modelo de 20k pesa 22 KB.
- CPU recomendada: cualquier procesador x86_64 o ARM con soporte para numpy; el tiempo de inferencia es de ~63-64 µs por fragmento de 20 ms en un solo núcleo, lo que permite procesar 50 fragmentos por segundo con un uso de CPU inferior al 1% en hardware moderno.
- GPU: no necesaria; el modelo no aprovecha aceleración por GPU.
- Opciones de despliegue: runtime nativo en numpy (librería `teensyvad`), exportación a ONNX para otros lenguajes (Python, C++, Rust, etc.), integración con Asterisk mediante AudioSocket, y ejecución en dispositivos embebidos con soporte para numpy o ONNX Runtime.
- Latencia: la detección de inicio de habla se produce en el mismo fragmento en el que se supera el umbral, con un retardo máximo de 20 ms más el contexto de 100 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TEN AUC | AMI F1 | Licencia | Formato |
|---|---|---|---|---|---|---|
| teensy-v5-80k | 80 373 | 100 ms | 0.8877 | 0.8845 | CC BY 4.0 | .npz, .onnx |
| Silero VAD | 1 774 000 | 512 ms (aprox.) | 0.9519 | 0.7136 | MIT | .onnx, .pt |
| WebRTC VAD | — | 30 ms (trama) | n/a | 0.8419 | BSD | C++ |

Silero VAD ofrece mayor precisión en el conjunto TEN (AUC 0.9519) y un contexto más largo, pero su tamaño es 22 veces superior (1.77M parámetros) y su rendimiento en audio de sala (AMI F1 0.7136) es notablemente inferior al de teensy-v5. WebRTC VAD es extremadamente rápido (2 µs por fragmento) pero carece de umbrales calibrados y su AUC en TEN no está reportado; en AMI queda por debajo de teensy-v5. La ventaja principal de teensy-v5 es su equilibrio entre precisión, tamaño y velocidad, con una licencia permisiva para uso comercial.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con habla en inglés; su comportamiento con otros idiomas no está validado y puede degradar la precisión.
- No se incluyó música en el entrenamiento: el autor advierte que la música se detecta como actividad de voz, lo que puede generar falsos positivos en entornos con música de fondo.
- El contexto de 100 ms es corto; las fricativas en entornos ruidosos siguen siendo las tramas más difíciles de clasificar, como se indica en la documentación.
- No incorpora cancelación de eco (AEC); en aplicaciones de telefonía con altavoz, se recomienda usar un cancelador de eco aguas arriba.
- La licencia CC BY 4.0 exige atribución (© 2026 Pankaj Doharey / Metacritical, TeensyVAD por VoxLogic) en cualquier redistribución o derivado.
- Los umbrales incluidos en los metadatos están calibrados para el conjunto de desarrollo de AMI; para micrófonos cercanos en telefonía, el autor sugiere ajustar `thr_hi` a 0.45.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Teensy/teensy-vad-v5
- Repositorio oficial (código y documentación): https://github.com/TeensyAI/teensyvad
- Papers de la familia TeensyVAD: https://github.com/metacritical/teensyvad
- Notas de lanzamiento de v5: https://teensy.tech/blogs/releases/v5
- Versiones anteriores: https://huggingface.co/Teensy/teensy-vad-3 y https://huggingface.co/Teensy/teensy-vad-1
