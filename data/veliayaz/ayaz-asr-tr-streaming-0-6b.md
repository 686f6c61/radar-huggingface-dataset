# VeliAyaz/ayaz-asr-tr-streaming-0.6b

## Resumen

Ayaz ASR es un modelo de reconocimiento automático del habla (ASR) en modo streaming, especializado en turco y derivado por ajuste fino del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA. Lo desarrolla VeliAyaz como un proyecto independiente, sin respaldo ni aprobación de NVIDIA, y su objetivo es corregir las deficiencias que los modelos multilingües genéricos muestran en turco coloquial: confusión de idioma en comandos cortos y deriva de idioma en conversaciones largas. La arquitectura subyacente es FastConformer con decodificador RNN-T y atención con caché, lo que permite transcribir mientras se habla en lugar de esperar al final de la frase.

El modelo aborda además el problema del olvido catastrófico: un ajuste fino exclusivamente en turco degrada severamente el rendimiento en el resto de idiomas (el autor documenta una caída de 38 puntos de WER en alemán en su primer intento). Ayaz ASR intenta mantener las 34 lenguas del modelo base mientras mejora el turco, de modo que una misma conversación pueda alternar entre turco, alemán o inglés sin colapsar.

La versión publicada es la v0.2, que reduce el WER en habla de YouTube del 20,45 % al 17,63 % respecto a la v0.1, aunque el propio autor advierte que parte de la mejora está inflada por solapamiento de hablantes entre entrenamiento y evaluación, y que el modelo no alcanza todos sus criterios de aceptación. El repositorio ocupa 7,1 GB e incluye pesos en formato NeMo y exportaciones ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNN-T y atención con caché (streaming) |
| Parametros totales | 0,6 mil millones (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; ventana de contexto de audio de 560 ms en modo streaming |
| Tipos de cuantizacion | int8 para despliegue en dispositivo (on-device); pesos PyTorch en precisión completa; exportación ONNX |
| Idiomas soportados | 34: tr, de, en, fr, es, it, pt, nl, ru, uk, pl, cs, sk, sl, hr, bg, ro, hu, fi, et, lv, lt, sv, da, no, el, ar, he, hi, ja, ko, vi, zh |
| Licencia | OpenMDW-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | NeMo (.nemo), ONNX; repo de 7,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema ASR de aproximadamente 600 millones de parámetros construido sobre FastConformer con decodificador RNN-T. FastConformer es una variante de Conformer con atención submuestreada que reduce la longitud de la secuencia antes de la atención, lo que abarata el coste computacional en audio largo. El decodificador RNN-T permite alineamiento monotónico y emisión incremental de tokens, y la atención con caché habilita el modo streaming real: el modelo procesa fragmentos de audio conforme llegan, con una ventana de contexto declarada de 560 ms en las evaluaciones.

El ajuste fino se realizó sobre el modelo base con el objetivo explícito de preservar las 34 lenguas originales frente al olvido catastrófico. El autor documenta que un entrenamiento exclusivo en turco degradó 32 de las 34 lenguas de FLEURS, con un aumento de 38 puntos de WER en alemán, y que la estrategia de esta versión busca evitar ese colapso. No se especifican en la información disponible el volumen de tokens de audio, la composición exacta del dataset de ajuste ni si se emplearon técnicas de regularización como replay de datos o destilación; tampoco se detalla si hubo etapas de RLHF o DPO, algo poco habitual en ASR. La evaluación se realizó en PyTorch en modo streaming con normalización específica para turco (Unicode NFC, conversión de dígitos a palabras, reglas de mayúsculas turcas I/ı e İ/i, eliminación de apóstrofos y puntuación).

## Capacidades

- Transcripción de voz a texto en modo streaming, con emisión de texto mientras el audio sigue llegando.
- Reconocimiento en 34 idiomas, con especial énfasis en turco coloquial, mensajes de voz y habla espontánea de YouTube.
- Manejo de conversaciones con cambio de idioma intra-utterance (una frase en turco seguida de otra en alemán o inglés), según el objetivo declarado del autor.
- Selección de idioma explícita por sesión (por ejemplo, `tr-TR` en las pruebas turcas).
- Exportación ONNX para despliegue en dispositivo con cuantización int8.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Subtitulado en directo de vídeo en turco: el modo streaming con ventana de 560 ms permite generar subtítulos incrementales en retransmisiones y vídeos de YouTube, donde el modelo reduce el WER al 17,63 % frente al 39,17 % del modelo base.
- Transcripción de mensajes de voz en aplicaciones de mensajería: el ajuste específico sobre habla cotidiana baja el WER del 63,33 % del base al 22,38 %, lo que lo hace viable para convertir notas de audio en texto en turco.
- Asistentes de voz con comandos cortos: aunque el autor reconoce que no hay mejora frente a v0.1 en comandos breves, el modelo reconoce 14 de 20 comandos leídos (17 de 20 con relleno de silencio), útil para dictado de órdenes en interfaces de voz.
- Atención al cliente telefónica multilingüe: al conservar 34 idiomas, puede transcribir llamadas donde el usuario alterna turco con alemán o inglés, evitando el colapso de idioma que sufren los ajustes monolingües.
- Despliegue en dispositivo (móvil o embebido): la exportación ONNX con cuantización int8 y los 0,6 mil millones de parámetros permiten inferencia local sin conexión, con una penalización declarada de +0,49 puntos frente al modelo base en int8.
- Investigación en ASR multilingüe y olvido catastrófico: el modelo y su model card documentan métricas por conjunto y advertencias metodológicas, lo que lo convierte en un punto de partida para estudiar ajuste fino que preserve lenguas minoritarias en modelos ASR.
- Transcripción de reuniones y notas de voz en entornos con ruido y habla espontánea: el modo streaming y el soporte de habla coloquial permiten diarización posterior y actas en turco sin esperar al cierre de la grabación.

## Benchmarks y rendimiento

Resultados declarados por el autor en PyTorch, modo streaming, contexto de 560 ms, noviembre de 2026. WER en % salvo indicación; japonés, coreano, tailandés y chino se miden con CER.

| Prueba | Base | v0.1 | v0.2 |
|---|---|---|---|
| FLEURS tr (743 utterances) | 11,96 | 12,18 | 11,79 |
| YODAS turco, 30 vídeos reservados (705) | 39,17 | 20,45 | 17,63 |
| Mensajes de voz (124) | 63,33 | 33,41 | 22,38 |
| Habla cotidiana del desarrollador, un hablante (85) | 49,33 | 28,11 | 20,27 |
| Frases cortas (16) | 95,0 (8 vacías) | 77,5 (2 vacías) | 77,5 (1 vacía) |
| Frases cortas con silencio (16) | 90,0 (6 vacías) | 80,0 (4 vacías) | 80,0 (3 vacías) |
| Comandos leídos, aciertos sobre 20 | 1 | 15 | 14 |
| Comandos leídos con silencio, aciertos sobre 20 | 7 | 18 | 17 |

El autor advierte que las filas de mensajes de voz y del desarrollador son optimistas porque los hablantes aparecen en entrenamiento, y que la métrica más cercana a hablantes nuevos es YODAS (17,63 %). No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2-2,5 GB en FP16 para 0,6 mil millones de parámetros, más el overhead de NeMo y del decodificador RNN-T; en int8, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o L40S para despliegues de alta concurrencia; RTX 4090 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también es apto para CPU en modo int8/ONNX, aunque con mayor latencia.
- Opciones de despliegue: NeMo (nativo), ONNX Runtime para inferencia en dispositivo; no se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a ASR RNN-T.
- Latencia y throughput: no se publican cifras de latencia ni de RTF (real-time factor); el modo streaming opera con contexto de 560 ms, lo que acota la latencia de emisión de texto a ese orden.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto streaming | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ayaz ASR v0.2 | ~0,6 B | 34 | 560 ms | OpenMDW-1.1 | Ajuste fino en turco con preservación multilingüe |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6 B | 34 | 560 ms | OpenMDW-1.1 | Modelo base multilingüe de NVIDIA |
| Whisper large-v3 (referencia de la categoría) | ~1,55 B | ~99 | No nativo (por fragmentos) | MIT | ASR multilingüe no streaming |
| Parakeet / Conformer ASR de NVIDIA (familia) | variable | variable | según variante | según modelo | ASR Conformer/RNN-T |

La comparación con Whisper large-v3 es cualitativa: este último ofrece más idiomas y licencia MIT, pero no está diseñado para streaming nativo y suele requerir procesamiento por ventanas. No se dispone de cifras comparativas directas entre Ayaz ASR y Whisper en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que la versión v0.2 no cumple todos sus criterios de aceptación y se publicó de forma deliberada pese a ello.
- Las métricas de mensajes de voz y del desarrollador están infladas: los hablantes de esos conjuntos aparecen en el entrenamiento, por lo que no son representativas de hablantes nuevos.
- La separación de YODAS se hizo a nivel de vídeo, no de canal, por lo que no se garantiza que un mismo hablante no aparezca en vídeos de entrenamiento y de evaluación.
- El modelo genera más texto que el base en audio sin voz (alucinación en silencio): en frases cortas con silencio, la v0.2 deja 3 de 16 vacías frente a 6 del base.
- El rendimiento en otros idiomas distintos del turco empeora respecto al modelo base, según declara el autor.
- En comandos cortos no hay mejora frente a v0.1 (14 aciertos frente a 15) y el rendimiento en frases cortas se estanca en 77,5 %.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; el autor no está afiliado ni respaldado por NVIDIA, lo que traslada al usuario la responsabilidad sobre el uso del modelo base.
- No se documentan sesgos demográficos o acústicos específicos, pero al ser un ajuste sobre datos de YouTube y mensajes de voz de un grupo reducido de hablantes, es probable un sesgo hacia esos dominios y acentos.
- El repositorio tiene 13 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- No hay soporte documentado de tool calling, agentes ni otras capacidades más allá de ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VeliAyaz/ayaz-asr-tr-streaming-0.6b
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://huggingface.co/VeliAyaz/ayaz-asr-tr-streaming-0.6b/blob/main/LICENSE
- Referencia [1] Nemotron 3.5 ASR streaming 0.6b (arXiv:2506.00338): https://arxiv.org/abs/2506.00338
- Referencia [2] OpenMDW-1.1 (licencia)
- Referencias [3, 4] sobre olvido catastrófico: no disponible el identificador exacto en la información proporcionada
- Referencia [5] FLEURS: https://arxiv.org/abs/2406.00899
- Referencias [6-9] (FLEURS test split, YODAS): no disponible el identificador exacto en la información proporcionada
