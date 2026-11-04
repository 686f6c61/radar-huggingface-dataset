# syvai/danish-end-of-turn

## Resumen

El detector de fin de turno danés (danish-end-of-turn) es un clasificador de audio binario desarrollado por syvai que responde a una única pregunta en el contexto de agentes de voz: cuando un hablante danés deja de hablar, ¿ha terminado su turno o solo está haciendo una pausa? El modelo escucha los últimos 8 segundos de audio y, 200 ms después del inicio de un silencio, devuelve la probabilidad `P(done)`. No requiere transcripción: opera directamente sobre la señal de audio.

Técnicamente se construye sobre el encoder de `openai/whisper-base` truncado a 8 segundos, con pooling por atención y una cabeza MLP de dos capas entrenada con entropía cruzada binaria. El modelo completo tiene 20.159.490 parámetros y se distribuye tanto en safetensors (PyTorch) como en ONNX, incluyendo una versión int8 de 25 MB que toma decisiones en 28 ms sobre 2 hilos de CPU.

Su relevancia es práctica: en sistemas de voz conversacionales, los temporizadores de silencio fijos provocan interrupciones o latencias innecesarias. Este modelo permite reducir a la mitad la tasa de interrupciones a igual latencia de respuesta, según los datos reportados por el autor. Está especializado exclusivamente en danés y entrenado sobre audio de radio pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper-base (transformer) truncado a 8 s + attention pooling + MLP de 2 capas |
| Parámetros totales | 20.159.490 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 segundos de audio (128.000 muestras a 16 kHz) |
| Tipos de cuantización | int8 dinámica por canal (ONNX); fp32 (ONNX y PyTorch) |
| Idiomas soportados | danés (da) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de `openai/whisper-base` truncado para procesar ventanas de 8 segundos de audio mono a 16 kHz. Sobre las representaciones del encoder aplica un pooling por atención y una cabeza MLP de dos capas que produce un logit binario; la exportación a ONNX incorpora la sigmoide para devolver directamente `p_done`. El entrenamiento usó entropía cruzada binaria, AdamW, batch de 128, precisión bf16, 2 épocas sobre una RTX 3090. La exportación ONNX convierte el STFT en una convolución DFT fija y aplica cuantización int8 dinámica por canal sobre los pesos de las MatMul (la cuantización por tensor perdía 1,6 puntos de F1; la per-canal solo 0,04).

Los datos provienen de aproximadamente 100.000 horas de radio danesa P1, transcritas con `danish-foundation-models/edda-v0.2`, diarizadas con `pyannote/speaker-diarization-community-1` y alineadas a nivel de carácter con `syvai/danish-char-aligner`. Se etiquetó cada pausa de al menos 250 ms tras una palabra en segmentos bien alineados: *done* si el siguiente segmento es de otro hablante, *pausing* si continúa el mismo. El entrenamiento usó solo las pausas donde una segunda diarización independiente coincidía y no detectaba habla dentro de la pausa: 995.000 clips de los 58 ficheros fuente con esa segunda diarización, con todos los fines de turno y un número igual de pausas. La aumentación incluyó silencio final de 100-200 ms, historial acortado y variación de ganancia de ±.

## Capacidades

- Clasificación binaria de audio: devuelve `P(done)`, la probabilidad de que el turno del hablante haya terminado.
- Detección de fin de turno (end-of-turn) y de toma de turno (turn-taking) en conversación hablada en danés.
- Detección implícita de actividad de voz basada en prosodia, sin transcripción.
- Funcionamiento exclusivamente sobre audio; no procesa texto ni genera lenguaje.
- Inferencia en CPU con latencia baja gracias a la exportación ONNX int8.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multimodales más allá del audio.

## Casos de uso

- Gestión de turnos en agentes de voz daneses: el modelo se invoca 200 ms después de que el usuario deje de hablar; si `P(done)` supera el umbral, el agente responde de inmediato, y si no, espera a un temporizador de respaldo. Con umbral 0,8 la tasa de interrupciones baja al 9,0 % frente al 11,4 % de un temporizador de 1,0 s, con latencia media de 0,72 s.
- Reducción de latencia percibida en asistentes telefónicos: al decidir antes que un temporizador fijo, el agente responde en 0,55 s de media con umbral 0,5, frente a 0,80 s de un temporizador de 0,8 s.
- Enrutamiento en sistemas de atención al cliente con múltiples hablantes: al detectar si el siguiente segmento es de otro hablante, ayuda a decidir cuándo ceder la palabra o cuándo el usuario ha terminado su consulta.
- Integración en pipelines de voz en tiempo real sobre CPU: los 28 ms por decisión en 2 hilos permiten ejecutarlo junto a ASR y TTS sin GPU dedicada, con un modelo int8 de 25 MB.
- Moderación de interrupciones en aplicaciones de entrevistas o encuestas automatizadas: el ajuste del umbral permite priorizar no interrumpir (umbral 0,9, 6,7 % de interrupciones) o priorizar rapidez (umbral 0,5).
- Señal auxiliar combinada con ASR: al aportar información prosódica independiente del texto, puede fusionarse con una señal basada en transcripción para mejorar la detección de fin de turno en frases incompletas.

## Benchmarks y rendimiento

Conjunto de test reservado: 10 ficheros fuente nunca usados en entrenamiento ni validación (96.110 pausas). El subconjunto *clean* comprende 12.120 pausas donde dos diarizaciones independientes coinciden en la etiqueta y ninguna detecta habla dentro de la pausa.

| Modelo | AUC clean | F1 clean (50/50) | AUC test completo | F1 test completo (50/50) |
|---|---|---|---|---|
| Whisper-tiny, todas las etiquetas | 0,939 | 0,868 | 0,921 | 0,852 |
| Whisper-base, todas las etiquetas | 0,948 | 0,877 | 0,928 | 0,858 |
| Whisper-base, etiquetas clean (este modelo) | 0,963 | 0,907 | 0,917 | 0,847 |
| Este modelo, ONNX int8 | 0,963 | 0,906 | no disponible | no disponible |

Comportamiento como política de toma de turno (test completo, frecuencias naturales):

| Política | Interrumpe a quien solo pausaba | Latencia media de respuesta |
|---|---|---|
| Temporizador de silencio 0,8 s | 18,6 % | 0,80 s |
| Temporizador de silencio 1,0 s | 11,4 % | 1,00 s |
| Modelo, umbral 0,5 | 13,4 % | 0,55 s |
| Modelo, umbral 0,8 | 9,0 % | 0,72 s |
| Modelo, umbral 0,9 | 6,7 % | 0,88 s |

A igual latencia, el modelo interrumpe aproximadamente la mitad de veces que un temporizador de silencio. A frecuencia natural de conversación, el mejor F1 en el test completo es 0,60.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo int8 ONNX ocupa 25 MB y se ejecuta en CPU.
- GPU recomendadas: no necesarias. El entrenamiento se realizó en una RTX 3090, pero la inferencia está optimizada para CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el modelo fp32 es de aproximadamente 80 MB.
- Despliegue: ONNX Runtime con `CPUExecutionProvider`; también disponible en PyTorch mediante `model.safetensors` y `model.py`.
- Latencia: 28 ms por decisión en 2 hilos de CPU, 15 ms en 4 hilos y 54 ms en 1 hilo (modelo int8).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syvai/danish-end-of-turn | 20,16 M | 8 s de audio | Clasificación fin de turno (danés) | CC-BY-4.0 | HuggingFace (ONNX + safetensors) |
| Whisper-tiny (referencia del autor) | no disponible | 30 s de audio | ASR multilingüe | MIT | HuggingFace |
| Whisper-base (referencia del autor) | 74 M (aprox., no confirmado en la información) | 30 s de audio | ASR multilingüe | MIT | HuggingFace |

No se dispone de información sobre otros detectores de fin de turno comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con habla de radio danesa (locutores, entrevistas, llamadas); no se ha probado con audio telefónico ni de campo lejano.
- Solo audio: detecta prosodia, no gramática. Un hablante que se detiene a mitad de frase con entonación descendente puede parecer que ha terminado.
- Las etiquetas provienen de diarización automática, no de anotación humana; "siguiente hablante distinto" no siempre equivale a turno terminado (interrupciones, retroalimentación).
- El autor reporta un plateau: modelos más grandes, etiquetas más limpias, entrenamiento más largo y ensamblado se estabilizan en torno a F1 0,91 en el subconjunto clean; los errores restantes parecen ambigüedad genuina del audio.
- Especializado solo en danés; no soporta otros idiomas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de producción.
- Uso previsto únicamente como señal auxiliar de decisión, no como sustituto de un sistema completo de diálogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syvai/danish-end-of-turn
- Demo Space: https://huggingface.co/spaces/syvai/danish-end-of-turn-demo
- Modelo base: https://huggingface.co/openai/whisper-base
- Alineador de caracteres: https://huggingface.co/syvai/danish-char-aligner
- ASR usado para transcripción: https://huggingface.co/danish-foundation-models/edda-v0.2
- Diarización: https://huggingface.co/pyannote/speaker-diarization-community-1
