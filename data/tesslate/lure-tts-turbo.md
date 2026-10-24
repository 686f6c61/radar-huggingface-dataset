# Tesslate/Lure-TTS-Turbo

## Resumen

Lure Turbo es un modelo de síntesis de voz (text-to-speech) publicado por Tesslate como *research preview*, construido sobre la arquitectura Qwen3-TTS a 12 Hz y derivado directamente de Lure-TTS-0.6B. Su objetivo no es mejorar la calidad del audio, sino reducir el coste computacional por fotograma: en los modelos Qwen3-TTS cada fotograma de 80 ms se genera en dos etapas (un modelo grande elige el primero de los 16 códigos y un predictor pequeño completa los 15 restantes de forma secuencial), y Turbo sustituye ese predictor por una cabeza agrupada que emite los 15 códigos en 3 pasadas. El resultado declarado por el autor es una reducción del tiempo del predictor de 21,2 ms a 6,2 ms por fotograma y una aceleración extremo a extremo de aproximadamente 1,7x.

El modelo mantiene las mismas voces, etiquetas de sonido y direcciones de actuación que Lure, con salida a 24 kHz y clonación de voz zero-shot a partir de una muestra de referencia más su transcripción. Está disponible en safetensors (2,7 GB de repositorio) bajo licencia Apache 2.0, pero requiere un runtime específico: la cabeza agrupada solo la entiende el motor `lure-tts` de smirki, que la carga automáticamente cuando detecta el fichero `turbo.json` en la carpeta del modelo.

Es relevante ahora porque ataca el cuello de botella real de los TTS autoregresivos con codec discreto: la decodificación secuencial de tokens de audio. Con RTF de 0,14 en H100 y capacidad de servir 8 streams en tiempo real sobre una GPU de 24 GB, el modelo se sitúa en el rango de la síntesis en streaming para producción, aunque el autor lo etiqueta explícitamente como preview y advierte de que pesos y comportamiento pueden cambiar entre releases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo sobre Qwen3-TTS 12 Hz, con codec discreto de 16 códigos por fotograma de 80 ms; cabeza de predicción agrupada propietaria (3 pasadas) |
| Parámetros totales | 914.643.008 según metadatos de safetensors; la model card lo denomina "0.6B" |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; las mediciones del autor se realizan en bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, más el fichero `turbo.json` que activa la cabeza agrupada en el motor `lure-tts` |
| Frecuencia de muestreo de salida | 24 kHz, float32 en streaming |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

Lure Turbo hereda el esquema de Qwen3-TTS a 12 Hz: el audio se tokeniza en tramas de 80 ms, cada una representada por 16 códigos discretos. La generación es en dos etapas: un transformer grande predice el primer código de cada trama y un predictor de códigos (code predictor) rellena los 15 restantes de uno en uno. Con el modelo grande ya optimizado, esas 15 pasadas secuenciales dominaban el tiempo por fotograma. Turbo sustituye el predictor por una cabeza que predice los 15 códigos en tres pasadas agrupadas (códigos 1-3, 4-7 y 8-15), manteniendo intactos tamaño, voces, etiquetas y direcciones respecto a Lure.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO. El único dato aportado sobre datos es que el conjunto de entrenamiento incluye YODAS v3. Tampoco se documenta el proceso de destilación o ajuste que produce la cabeza agrupada, más allá de que el resto del modelo es idéntico a Lure y de que la calidad se mantiene en los benchmarks públicos ejecutados por el autor.

## Capacidades

- Síntesis de voz a partir de texto con salida a 24 kHz y modo streaming por chunks de float32.
- Clonación de voz zero-shot: se registra una voz a partir de un WAV de referencia y su transcripción (`make_voice`).
- Control de interpretación mediante un campo `instruct` en lenguaje natural (por ejemplo, "Bright, giddy disbelief.").
- Etiquetas de sonido inline en el texto de entrada, como `(gasp)`, `(laugh)`, `(sigh)` o `(sharp inhale)`, insertadas en el punto exacto de la locución.
- Expresividad emocional: la model card reporta un 73,3 % en la métrica de emoción CV3, idéntico a Lure.
- Generación en tiempo real con múltiples streams concurrentes en una sola GPU.
- No soporta tool calling, function calling, razonamiento multi-paso ni otras capacidades de agente: es un modelo exclusivamente de audio.
- Sin capacidades de visión, audio de entrada como comprensión ni traducción; únicamente inglés.

## Casos de uso

- **Locución de vídeo y podcast a escala**: dado que Turbo procesa 30x tiempo real con 8 streams en una GPU de 24 GB, un solo nodo puede regenerar guiones completos en minutos, y el control por `instruct` permite ajustar el tono por escena sin reentrenar nada.
- **Atención al cliente con voz sintética**: la clonación zero-shot permite mantener una voz de marca consistente en todos los flujos IVR; el streaming a 24 kHz hace viable enviar audio al usuario antes de terminar de generar la frase completa.
- **Audiolibros y contenido largo por lotes**: la recomendación del autor es dividir las llamadas muy largas en frases, lo que encaja con un pipeline por sentencias que paraleliza la generación entre los 8 streams disponibles y luego concatena los PCM.
- **Doblaje y previsualización de material audiovisual**: las etiquetas inline `(sigh)`, `(gasp)` o `(laugh)` permiten reproducir reacciones no verbales en el punto exacto del guion, algo útil para maquetas de doblaje antes de contratar actores.
- **Prototipado de asistentes conversacionales**: al ser Apache 2.0 y con pesos abiertos, se puede integrar en un backend propio junto al motor `lure-tts` sin dependencias de API externas, útil para pruebas de latencia y de naturalidad en fases de diseño.
- **Generación de voces para videojuegos y demos**: clonación de la voz de un actor con su consentimiento y actuación dirigida por `instruct` para producir variantes emocionales de una misma línea sin regrabar.
- **Investigación en TTS eficiente**: la cabeza agrupada (15 pasadas a 3) es un punto de partida reproducible para estudiar la decodificación agrupada de tokens de codec en modelos tipo Qwen3-TTS, usando el motor abierto como referencia.

## Benchmarks y rendimiento

Calidad, con una toma por línea y scripts oficiales, según el autor:

| Modelo | Seed-TTS WER ↓ | Seed-TTS SIM ↑ | LibriSpeech-PC WER ↓ | LibriSpeech-PC SIM ↑ | UTMOS ↑ | VDB SIM ↑ | CV3 emoción % ↑ |
|---|---|---|---|---|---|---|---|
| Lure | 1,51 | 0,653 | 1,72 | 0,638 | 4,43 | 0,81 | 73,3 |
| Lure Turbo | 1,59 | 0,654 | 1,84 | 0,641 | 4,38 | 0,81 | 73,3 |

Velocidad con el motor `lure-tts`, backend CUDA, bf16; RTF = tiempo de generación dividido por duración del audio (menor es más rápido):

| GPU | Modelo | Streams | RTF |
|---|---|---|---|
| H100 | Lure | 1 | 0,23 |
| H100 | Lure Turbo | 1 | 0,14 |
| H100 | Lure | 8 | 0,25 |
| H100 | Lure Turbo | 8 | 0,15 |

| GPU de 24 GB | 1 stream | 8 streams, total |
|---|---|---|
| Lure | 2,3x tiempo real | 17x tiempo real |
| Lure Turbo | 4,0x tiempo real | 30x tiempo real |

Desglose por fotograma en GPU de 24 GB con 8 streams: el predictor de códigos pasa de 15 pasadas y 21,2 ms a 3 pasadas y 6,2 ms. No se han publicado en la información disponible resultados de benchmarks de otras familias de TTS comparables.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,8 GB solo para pesos en bf16 (914,6 M de parámetros x 2 bytes); el repositorio ocupa 2,7 GB. Hay que sumar el overhead del codec/vocoder y del motor, no cuantificado en la información disponible.
- GPU recomendadas: H100 para máxima concurrencia (RTF 0,14 con 1 stream); GPU de 24 GB (la model card no especifica el modelo concreto) para 4,0x tiempo real con 1 stream y 30x con 8 streams.
- GPU de consumo: no se documenta el rendimiento en tarjetas de menos de 24 GB, aunque el tamaño de pesos sugiere que cabría en GPUs de 8-12 GB; no hay datos publicados que lo confirmen.
- Opciones de despliegue: exclusivamente el motor `lure-tts` (https://github.com/smirki/lure-tts), con backends MLX (Mac), CUDA (NVIDIA) y C++, más el extra `[server]` para servir el modelo. Otros runtimes de Qwen3-TTS no reconocen la cabeza agrupada y, por tanto, no pueden cargar este checkpoint.
- Latencia y throughput: RTF 0,14 en H100 con 1 stream; RTF 0,15 en H100 con 8 streams; 4,0x tiempo real por stream en GPU de 24 GB. El streaming entrega chunks de float32 conforme se generan, lo que permite iniciar la reproducción antes de completar la frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RTF (H100, 1 stream) | Seed-TTS WER ↓ | UTMOS ↑ | Licencia | Runtime |
|---|---|---|---|---|---|---|---|
| Lure Turbo | 914,6 M (nominal 0,6B) | No disponible | 0,14 | 1,59 | 4,38 | Apache 2.0 | `lure-tts` (MLX/CUDA/C++) |
| Lure | 914,6 M (nominal 0,6B) | No disponible | 0,23 | 1,51 | 4,43 | Apache 2.0 | `lure-tts` |
| Otros modelos TTS de 2026 | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card remite a la sección de benchmarks de Lure para la comparación completa con otros modelos, pero esos datos no están incluidos en la información disponible, por lo que no se reproducen aquí.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, lo que descarta su uso en castellano sin un modelo distinto.
- Estado de *research preview*: el autor advierte de que pesos, comportamiento y model card pueden cambiar entre releases; se recomienda fijar una revisión concreta en producción.
- Las etiquetas de sonido son "best effort": no hay garantía de que `(sigh)` o `(laugh)` se materialicen en todos los contextos.
- Las llamadas muy largas deben dividirse en frases; no se documenta el límite exacto ni el comportamiento al superarlo.
- Dependencia de un único runtime: fuera del motor `lure-tts` el checkpoint no es utilizable, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Riesgo de uso indebido en suplantación de identidad: la clonación zero-shot permite imitar voces, y el autor prohíbe explícitamente imitar a personas reales sin su consentimiento.
- Riesgo de alucinación acústica y errores de pronunciación en textos no ingleses, siglas o nombres propios; el WER de 1,59 en Seed-TTS indica que existe una tasa de error no nula incluso en condiciones de referencia.
- Sesgos: no se documenta ninguna evaluación de sesgo por acento, género o edad en la información disponible.
- Licencia Apache 2.0, por lo que el uso comercial está permitido, pero conviene verificar la procedencia del dataset de entrenamiento (incluye YODAS v3) si se requiere trazabilidad de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tesslate/Lure-TTS-Turbo
- Modelo base Lure (0.6B): https://huggingface.co/Tesslate/Lure-TTS-0.6B
- Motor `lure-tts`: https://github.com/smirki/lure-tts
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/smirki/lure-tts
- Organización Tesslate en HuggingFace: https://huggingface.co/Tesslate
- Organización TesslateAI en GitHub: https://github.com/TesslateAI
