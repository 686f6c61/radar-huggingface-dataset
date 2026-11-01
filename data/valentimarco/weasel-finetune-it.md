# valentimarco/weasel-finetune-it

## Resumen

Weasel Fine-Tune IT es un modelo de reconocimiento automático del habla (ASR) especializado en italiano, desarrollado por el usuario valentimarco como un ajuste fino del modelo base Cactus-Compute/whistle. Se distribuye como un único fichero `.cact` de 29,35 MB que se ejecuta sobre el motor de CPU de Cactus (cactus-needle), sin necesidad de GPU ni de un entorno Python en el dispositivo. El modelo está pensado para despliegues en el borde (on-device), donde el coste computacional y el tamaño del binario son críticos.

El ajuste fino se realizó mediante un adaptador LoRA de rango 64 y alpha 128, posteriormente fusionado en los pesos base y exportado a cuantización W4A8. El modelo base Whistle cuenta con 8 capas de decodificador y es multilingüe; este checkpoint está afinado específicamente para italiano, con entrada de audio WAV mono a 16 kHz y salida de texto italiano con mayúsculas y puntuación.

La relevancia de este modelo radica en que ofrece una alternativa compacta y ligera para transcripción de voz en italiano, con una mejora medible frente al modelo base en los conjuntos de evaluación publicados (WER combinado del 16,61 % frente al 19,58 % del base). Está liberado bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en Cactus Whistle, 8 capas de decodificador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada de cualquier duración; una pasada hasta 30 s, ventaneo para audio más largo) |
| Tipos de cuantizacion | W4A8 (pesos de 4 bits, activaciones de 8 bits) |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (despliegue, 29,35 MB) y `.safetensors` (float32, 220 MB, para inspección y exportación) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Cactus Whistle, un transformer con 8 capas de decodificador, del que no se detallan más especificaciones en la información disponible. El ajuste fino se realizó con un adaptador LoRA de rango 64 y alpha 128 sobre el corpus italiano `valentimarco/asr-merged-it`, que reúne 233.295 clips y 408,8 horas de audio. Tras descartar transcripciones vacías y clips de más de 30 segundos, se utilizaron 198.623 clips (343,1 horas) para el entrenamiento. El adaptador se fusionó en los pesos base y el modelo resultante se exportó a W4A8 mediante la herramienta `needle whistle build`.

Los datos de entrenamiento provienen de tres fuentes: VoxPopuli italiano (25.010 clips, 86,9 h, CC0), FLEURS italiano (4.286 clips, 14,1 h, CC-BY-4.0) y Common Voice 27.0 italiano (203.999 clips, 307,9 h, CC0). El audio se normalizó a 16 kHz mono, con RMS de -23 dBFS y techo de pico de -0,3 dBFS. No se menciona el uso de RLHF o DPO en la información proporcionada; el ajuste se limita a la supervisión con transcripciones.

## Capacidades

- Transcripción de voz a texto en italiano con salida en mayúsculas y puntuación.
- Entrada de audio WAV mono a 16 kHz de cualquier duración: una pasada hasta 30 segundos y ventaneo automático para audio más largo.
- Marcas de tiempo por palabra mediante el parámetro `word_timestamps=True`, que devuelve inicio, fin y probabilidad de cada palabra.
- Sesgo de decodificación mediante `keywords=[...]`, que permite priorizar nombres propios, lugares y términos de dominio durante la decodificación.
- Ejecución en CPU sin GPU ni runtime de Python en el dispositivo, gracias al motor cactus-needle.
- Capacidad multilingüe heredada del modelo base, aunque este checkpoint está afinado exclusivamente para italiano.

## Casos de uso

- Transcripción de reuniones y notas de voz en italiano: el modelo procesa audio de cualquier duración mediante ventaneo y genera texto puntuado, adecuado para actas y resúmenes posteriores en aplicaciones de productividad.
- Subtitulado automático de vídeo en italiano: las marcas de tiempo por palabra permiten alinear subtítulos con precisión en herramientas de edición o plataformas de vídeo.
- Asistentes de voz en dispositivos móviles o embebidos: el tamaño de 29,35 MB y la ejecución en CPU sin Python lo hacen viable en teléfonos, Raspberry Pi o dispositivos IoT con recursos limitados.
- Dictado por voz en aplicaciones de escritorio o web: la integración mediante la librería `cactus-needle` permite añadir entrada por voz en italiano a editores de texto, correos o formularios.
- Transcripción de llamadas de atención al cliente: el sesgo por palabras clave permite reconocer nombres de productos, ubicaciones o términos técnicos frecuentes en el dominio de negocio.
- Investigación en ASR de bajo consumo: sirve como punto de partida para experimentos de cuantización y despliegue en el borde, con pesos en safetensors disponibles para inspección y reexportación.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales o contenido audiovisual en italiano en dispositivos de bajo coste.

## Benchmarks y rendimiento

Los resultados publicados comparan el modelo base con el ajuste fino sobre subconjuntos retenidos del split de test, usando el normalizador `BasicTextNormalizer` de Whisper (acentos conservados) y WER/CER a nivel de corpus.

| Conjunto de test | WER base | WER Weasel | CER base | CER Weasel |
|---|---:|---:|---:|---:|
| Common Voice 27.0 (it) | 18,89 % | **15,10 %** | 5,50 % | **4,57 %** |
| VoxPopuli + FLEURS | 19,83 % | **17,16 %** | 12,55 % | **10,59 %** |
| Combinado | 19,58 % | **16,61 %** | 10,68 % | **8,99 %** |

Desglose por duración de clip:

| Conjunto de test | Duración | WER base | WER Weasel |
|---|---|---:|---:|
| Common Voice | 0–5 s | 23,06 % | **18,75 %** |
| Common Voice | 5–10 s | 18,28 % | **14,57 %** |
| Common Voice | 10–20 s | 15,51 % | **11,91 %** |
| VoxPopuli + FLEURS | 0–5 s | 42,76 % | 42,54 % |
| VoxPopuli + FLEURS | 5–10 s | 24,25 % | **21,47 %** |
| VoxPopuli + FLEURS | 10–20 s | 18,80 % | **16,30 %** |
| VoxPopuli + FLEURS | 20–30 s | 17,27 % | **14,05 %** |

La evaluación se realizó sobre 2.000 clips de Common Voice y 1.967 clips de VoxPopuli + FLEURS, no sobre el split completo de 17.225 clips. El intervalo de 0–5 s en VoxPopuli/FLEURS está dominado por fragmentos parlamentarios de 1–4 s, lo que explica el WER elevado incluso en el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; el motor cactus-needle está diseñado para CPU.
- Cabe en cualquier CPU moderna, incluidos dispositivos de bajo consumo (Raspberry Pi, teléfonos móviles, IoT) gracias a su tamaño de 29,35 MB y cuantización W4A8.
- Opciones de despliegue: librería `cactus-needle` (Python) mediante `needle.Whistle` o la función `needle.transcribe`; el fichero `.cact` es el artefacto listo para ejecutar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (italiano) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Weasel Fine-Tune IT | no disponible (8 capas dec.) | audio hasta 30 s por pasada | 16,61 % (combinado) | Apache-2.0 | HuggingFace |
| Cactus-Compute/whistle (base) | no disponible (8 capas dec.) | audio hasta 30 s por pasada | 19,58 % (combinado) | Apache-2.0 | HuggingFace |
| Whisper (variantes) | no disponible en la información | no disponible en la información | no disponible en la información | MIT (según el modelo original) | HuggingFace |

No se dispone de datos de benchmarks de otros modelos ASR en la información proporcionada, por lo que la comparación con alternativas como Whisper o wav2vec2 no puede cuantificarse aquí.

## Limitaciones y advertencias

- Solo italiano: el modelo base es multilingüe, pero este checkpoint está afinado exclusivamente para italiano y no debe usarse como sustituto directo en los otros seis idiomas del base.
- Las locuciones cortas son más difíciles: el WER en Common Voice para 0–5 s es del 18,75 %, y en VoxPopuli/FLEURS para 0–5 s ronda el 42 % incluso en el modelo base.
- Los nombres propios, las palabras poco frecuentes y los acentos (`e` frente a `è`) concentran la mayor parte de los errores restantes; el sesgo por palabras clave ayuda con nombres conocidos de antemano.
- El modelo se entrenó con clips de hasta 30 segundos; el audio más largo se gestiona mediante el ventaneo del motor, pero esa ruta no formó parte de la evaluación del ajuste fino.
- La evaluación se realizó sobre subconjuntos retenidos, no sobre el split completo de 17.225 clips, por lo que las métricas pueden no ser representativas del rendimiento global.
- No incluye diarización de hablantes, alineación forzada ni restauración de puntuación más allá de lo aprendido de las transcripciones.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento incluyen FLEURS (CC-BY-4.0), cuya atribución debe conservarse al redistribuir o desplegar el modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/valentimarco/weasel-finetune-it)
- [Modelo base Cactus-Compute/whistle](https://huggingface.co/Cactus-Compute/whistle)
- [Modelo Needle](https://huggingface.co/Cactus-Compute/needle3)
- [Corpus de entrenamiento valentimarco/asr-merged-it](https://huggingface.co/buckets/valentimarco/asr-merged-it)
- [VoxPopuli (ACL-IJCNLP 2021)](https://aclanthology.org/2021.acl-long.80/)
- [Paper de referencia arXiv:2205.12446](https://arxiv.org/abs/2205.12446)
