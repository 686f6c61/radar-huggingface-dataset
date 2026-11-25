# Tesslate/Lure-TTS-Turbo

## Resumen

Lure-TTS-Turbo es un modelo de síntesis de voz (text-to-speech) desarrollado por Tesslate, publicado como vista previa de investigación. Se trata de una variante optimizada de Lure-TTS-0.6B, construida sobre la arquitectura Qwen3-TTS con tokenizador de audio a 12 Hz, que acelera la generación manteniendo la misma calidad perceptual y de inteligibilidad. El modelo tiene 914.643.008 parámetros (aproximadamente 0,9 B) y genera audio a 24 kHz en inglés.

El problema que resuelve es el cuello de botella del predictor de códigos: en los modelos Qwen3-TTS cada trama de 80 ms requiere 15 pasadas secuenciales de un predictor pequeño para completar los 16 códigos de la trama. Lure Turbo sustituye esas 15 pasadas por una cabeza agrupada que predice los códigos en 3 pasadas (códigos 1-3, 4-7 y 8-15), reduciendo el tiempo del predictor de 21,2 ms a 6,2 ms por trama en una GPU de 24 GB con 8 streams.

Su relevancia actual radica en el rendimiento en producción: alcanza un RTF de 0,14 en H100 con un solo stream (frente a 0,23 de Lure) y 4,0x tiempo real en GPU de 24 GB con un stream, lo que lo hace adecuado para síntesis en streaming, clonación de voz zero-shot y generación expresiva con etiquetas de sonido. La licencia es Apache 2.0 tanto para pesos como para el motor de inferencia y el código de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer autoregresivo con tokenizador de audio a 12 Hz y cabeza agrupada de predicción de códigos) |
| Parametros totales | 914.643.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el motor soporta bf16; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (pesos, motor lure-tts y código lure-train) |
| Formato de pesos | safetensors (repo de 2,7 GB) |

## Arquitectura y entrenamiento

Lure Turbo sigue la arquitectura Qwen3-TTS de 12 Hz: cada trama de audio de 80 ms se representa con 16 códigos, de los cuales un modelo grande genera el primero y un predictor de códigos completa los 15 restantes. La innovación de Turbo es una cabeza que agrupa esos 15 códigos en tres pasadas (1-3, 4-7 y 8-15), en lugar de las 15 pasadas secuenciales del predictor original. El tamaño del modelo, las voces, las etiquetas de sonido y las direcciones de estilo son idénticos a los de Lure-TTS-0.6B.

No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset, aunque la model card indica que los datos de entrenamiento incluyen YODAS v3. Tampoco se especifica si hubo RLHF, DPO u otras etapas de alineación. La cabeza agrupada requiere el motor `lure-tts` (backends mlx, cuda y C++), que la carga automáticamente cuando `turbo.json` está presente en la carpeta del modelo; otros runtimes de Qwen3-TTS no reconocen esta cabeza.

## Capacidades

- Generación de voz a partir de texto en inglés con salida a 24 kHz en formato float32.
- Clonación de voz zero-shot: creación de una voz a partir de un clip de referencia y su transcripción mediante `make_voice`.
- Síntesis expresiva y emocional controlada mediante directrices de estilo (`instruct`), por ejemplo "Bright, giddy disbelief".
- Etiquetas de sonido no verbales integradas en el texto, como `(gasp)` o `(laugh)`, con resultado "best effort".
- Generación en streaming: la API `stream` devuelve fragmentos de audio PCM a medida que se generan.
- Soporte de múltiples streams concurrentes en el motor (hasta 8 streams medidos en los benchmarks).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede sintetizar respuestas en streaming con una latencia baja (RTF 0,14 en H100), lo que permite reproducir audio mientras el texto se sigue generando y reduce el tiempo hasta el primer fragmento audible.
- Audiolibros y narración: con clonación de voz zero-shot y control de estilo mediante `instruct`, se puede mantener una voz consistente a lo largo de capítulos y ajustar el tono emocional por escena; las llamadas largas deben dividirse en frases.
- Asistentes de voz para aplicaciones: la salida a 24 kHz y el soporte de 8 streams concurrentes en GPU de 24 GB (30x tiempo real en total) permiten atender a varios usuarios simultáneamente en un solo servidor.
- Doblaje y producción de contenido: las etiquetas de sonido `(laugh)`, `(gasp)` y similares, junto con las directrices de estilo, facilitan generar interpretaciones expresivas sin grabación adicional.
- Prototipado de interfaces conversacionales: la licencia Apache 2.0 y la disponibilidad del motor y del código de entrenamiento permiten integrar el modelo en productos comerciales y ajustarlo con datos propios.
- Generación de voces para videojuegos o entornos interactivos: el streaming y el bajo RTF permiten síntesis en tiempo real de diálogos dinámicos, siempre que el contenido sea en inglés.
- Investigación en TTS: al ser una vista previa de investigación con pesos y código abiertos, sirve como base para estudiar cabezas de predicción agrupadas y optimizaciones de latencia en arquitecturas Qwen3-TTS.

## Benchmarks y rendimiento

Resultados de calidad publicados en la model card (una toma por línea, scripts oficiales):

| Métrica | Lure | Lure Turbo |
|---|---|---|
| Seed-TTS WER ↓ | 1,51 | 1,59 |
| Seed-TTS SIM ↑ | 0,653 | 0,654 |
| LibriSpeech-PC WER ↓ | 1,72 | 1,84 |
| LibriSpeech-PC SIM ↑ | 0,638 | 0,641 |
| UTMOS ↑ | 4,43 | 4,38 |
| VDB SIM ↑ | 0,81 | 0,81 |
| CV3 emotion % ↑ | 73,3 | 73,3 |

Rendimiento y velocidad (motor `lure-tts`, backend CUDA, bf16; RTF = tiempo de generación dividido por duración del audio, menor es mejor):

| GPU | Modelo | Streams | RTF |
|---|---|---|---|
| H100 | Lure | 1 | 0,23 |
| H100 | Lure Turbo | 1 | 0,14 |
| H100 | Lure | 8 | 0,25 |
| H100 | Lure Turbo | 8 | 0,15 |

| GPU de 24 GB | 1 stream | 8 streams (total) |
|---|---|---|
| Lure | 2,3x tiempo real | 17x tiempo real |
| Lure Turbo | 4,0x tiempo real | 30x tiempo real |

Coste por trama en GPU de 24 GB con 8 streams: el predictor de códigos pasa de 15 pasadas (21,2 ms) a 3 pasadas (6,2 ms).

## Requisitos de hardware

- VRAM estimada: no se publica una cifra explícita; los benchmarks se realizaron en una GPU de 24 GB con 8 streams, por lo que ese perfil es suficiente para producción concurrente.
- GPU recomendadas: H100 para máxima velocidad (RTF 0,14 con un stream); GPUs de 24 GB (por ejemplo, RTX 4090 o A10G) para 4,0x tiempo real con un stream y 30x con ocho.
- Compatibilidad con GPU de consumo: no se confirma explícitamente; el modelo pesa 2,7 GB en safetensors y los benchmarks usan una GPU de 24 GB, pero no se documentan pruebas en GPUs de 8-16 GB.
- Opciones de despliegue: motor `lure-tts` con backends mlx (Mac), CUDA (NVIDIA) y C++; incluye un servidor instalable con `".[server]"`. Otros runtimes de Qwen3-TTS no soportan la cabeza agrupada.
- Latencia y throughput: RTF 0,14 en H100 con un stream; 4,0x tiempo real en GPU de 24 GB con un stream y 30x con ocho streams.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (Seed-TTS WER / SIM) | Velocidad (H100, 1 stream) | Licencia |
|---|---|---|---|---|---|
| Lure-TTS-Turbo | 914.643.008 | no disponible | 1,59 / 0,654 | RTF 0,14 | Apache 2.0 |
| Lure-TTS-0.6B | 0,6 B | no disponible | 1,51 / 0,653 | RTF 0,23 | Apache 2.0 |
| Otros modelos Qwen3-TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card remite a la tarjeta de Lure-TTS-0.6B para la comparación completa con otros modelos; no se incluyen en la información disponible datos de alternativas externas como XTTS, Bark o F5-TTS.

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte multilingüe.
- Las etiquetas de sonido no verbales son "best effort" y pueden no reproducirse de forma fiable.
- Las llamadas muy largas en una sola petición deben dividirse en frases para evitar degradación.
- Es una vista previa de investigación: los pesos, el comportamiento y la model card pueden cambiar entre versiones; se recomienda fijar una revisión concreta en producción.
- Riesgo de uso indebido para suplantar voces reales; la model card prohíbe imitar a una persona real sin su consentimiento.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de audio, el riesgo principal es la pronunciación incorrecta o la prosodia inadecuada en textos complejos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del motor `lure-tts` para funcionar con la cabeza agrupada, lo que limita la portabilidad a otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tesslate/Lure-TTS-Turbo
- Modelo base Lure-TTS-0.6B: https://huggingface.co/Tesslate/Lure-TTS-0.6B
- Demo en vivo: https://huggingface.co/spaces/smirki/lure-tts
- Motor de inferencia: https://github.com/smirki/lure-tts
- Código de entrenamiento: https://github.com/smirki/lure-train
