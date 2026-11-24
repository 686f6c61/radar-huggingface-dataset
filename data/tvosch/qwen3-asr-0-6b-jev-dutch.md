# tvosch/Qwen3-ASR-0.6B-Jev-Dutch

## Resumen

Qwen3-ASR-0.6B-Jev-Dutch es un modelo de decisión para audio en neerlandés desarrollado por el usuario tvosch (tvosch en Hugging Face) a partir de Qwen/Qwen3-ASR-0.6B. No transcribe voz: describe clips de habla neerlandesa respondiendo a 12 preguntas calibradas sobre el hablante (género, edad, variedad NL/BE) y sobre las condiciones de grabación (presencia de voz, número de hablantes, solapamiento, ruido, reverberación, música, canal telefónico y calidad global). Está pensado como herramienta de curación de datos de voz: una sola pasada sobre el audio produce 12 respuestas con una latencia de unos 35 ms por clip en una A100.

La arquitectura parte del encoder de audio y el decoder de Qwen3-ASR, a los que se añaden cabezas de decisión que leen el estado oculto al final de una pregunta corta en neerlandés, en lugar de generar texto. Con 782.502.987 parámetros reales (según safetensors) y un repositorio de 1,6 GB, el modelo se distribuye en formato safetensors bajo licencia Apache-2.0 y requiere `transformers>=5.20` con código remoto propio (`modeling_jev.py`, `answers_jev.py`).

Su relevancia actual reside en la limpieza y enriquecimiento de corpus de voz antes del entrenamiento de sistemas ASR o TTS: permite descartar clips sin voz, con varios hablantes, con música o ruido, o que no son neerlandés, y añadir metadatos de hablante y calidad a audio no etiquetado. El modelo sigue el enfoque Qwen-Audio-Jev descrito en el paper arXiv 2610.21614.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Qwen3-ASR con cabezas de decisión (choice, score, yes/no) sobre el estado oculto del decoder |
| Parametros totales | 782.502.987 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandés (nl); entrenado además con datos en inglés, alemán, francés, español, italiano y danés para la detección de no-neerlandés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de audio y el decoder de Qwen3-ASR-0.6B. El audio pasa una sola vez por el encoder de voz; el decoder lo lee junto con una pregunta corta en neerlandés (por ejemplo, «Is de spreker een man of een vrouw?») y el estado oculto al final de la pregunta alimenta una de tres cabezas pequeñas en lugar de generar texto: una cabeza de elección (género, variedad NL/BE), una cabeza de puntuación sobre escala ordenada (década de edad, ruido, reverberación, calidad, con nivel esperado) y una cabeza sí/no (presencia de voz, más de un hablante, solapamiento, música, teléfono, neerlandés). Las 12 respuestas por clip son calibradas y se obtienen en una sola pasada.

El ajuste fino se realizó sobre un corpus de aproximadamente 76 horas: Common Voice 17 nl (468 hablantes, 6,7 h), VoxPopuli nl más datos de miembros del Parlamento Europeo (78 hablantes, 4,5 h), Multilingual LibriSpeech nl (40 hablantes, 4,0 h), Common Voice 17 en/de/fr/es/it/da (5.589 hablantes, 57,8 h) y speechocean762 (125 hablantes, 2,9 h). Las condiciones de grabación se etiquetan mezclándolas durante el entrenamiento: segundos hablantes, salas simuladas de OpenSLR 28 y 2.000 salas propias, ruido y música de MUSAN, canal telefónico de banda estrecha y clips sin voz. Las etiquetas de calidad provienen de DNSMOS P.835. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Clasificación de género del hablante (femenino/masculino, con «unknown» para voces que suenan por debajo de 20 años).
- Estimación de edad por décadas (lt20, 20s, 30s, 40s, 50s, 60s, 70+), con «unknown» cuando no hay confianza.
- Detección de variedad de neerlandés: NL (Países Bajos) o BE (flamenco).
- Detección de presencia de neerlandés (sensible al acento).
- Detección de presencia de voz.
- Detección de múltiples hablantes (dos o más).
- Detección de solapamiento de voces.
- Detección de música de fondo.
- Detección de canal telefónico de banda estrecha.
- Nivel de ruido en escala none/light/moderate/strong.
- Nivel de reverberación en escala none/light/moderate/strong.
- Calidad global en escala bad/poor/fair/good/excellent (tipo DNSMOS).
- Con `signal=True`, devuelve estadísticas de señal no procedentes del modelo: duración, nivel, clipping, silencio, SNR aproximada y ancho de banda.
- No soporta transcripción, tool calling, agentes ni razonamiento multi-paso; es un modelo de clasificación por cabezas, no generativo.

## Casos de uso

- Limpieza de datos de entrenamiento ASR: descartar clips sin voz, con varios hablantes, con solapamiento, con música, con ruido fuerte o reverberación, o que no sean neerlandés antes de entrenar o ajustar un reconocedor de voz.
- Selección de datos para TTS y clonación de voz: conservar clips de un solo hablante, micrófono cercano y calidad «good» o «excellent», filtrando por género, grupo de edad y variedad NL/BE.
- Descripción y balanceo de corpus: cuantificar cuántas mujeres, niños, personas mayores y hablantes flamencos contiene un dataset para elaborar una datasheet, reequilibrar o detectar carencias antes del entrenamiento.
- Enriquecimiento de metadatos en audio no etiquetado (archivos de radiodifusión, pódcasts, entrevistas, clases): etiquetado por turno de hablante combinado con diarización (pyannote) o por ventana temporal para eventos como música, ruido y solapamiento.
- Búsquedas rápidas en grandes colecciones: localizar voz infantil, grabaciones telefónicas o fragmentos musicales sin escuchar el audio.
- Filtrado previo en pipelines de anotación: reducir el volumen de audio que llega a anotadores humanos o a modelos ASR más costosos, aplicando umbrales sobre las probabilidades de las cabezas sí/no.
- Control de calidad de grabaciones: detectar reverberación, ruido o clipping en lotes de audio antes de publicarlos o procesarlos, usando las escalas de nivel y las estadísticas de señal opcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 782,5 M de parámetros en fp32 el peso ronda los 3,1 GB, y en fp16/bf16 unos 1,6 GB, a lo que hay que sumar el encoder de audio y los buffers de activación.
- GPU recomendadas: el autor reporta unos 35 ms por clip en una A100; no se documentan otras GPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16, aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers>=5.20` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 35 ms por clip en una A100 según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Jev-Dutch | 782.502.987 | no disponible | Clasificación de atributos de hablante y calidad de audio (neerlandés) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-ASR-0.6B | no disponible | no disponible | Reconocimiento de voz (transcripción) | no disponible | Hugging Face |
| DNSMOS P.835 | no disponible | no disponible | Estimación de calidad de voz percibida | no disponible | Referencia usada para etiquetar calidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo responde a las 12 preguntas descritas; no transcribe voz ni evalúa transcripciones (WER, calidad de transcripción).
- No proporciona otros atributos de hablante (nivel educativo, dialecto regional, lengua nativa, emoción, estilo de habla).
- No ofrece otras medidas (velocidad de habla, pausas, SNR exacta o tiempo de reverberación en dB o segundos); ruido, reverberación y calidad son niveles, no medidas.
- Las respuestas son estimaciones para analizar grupos de clips; no deben usarse para decisiones sobre personas individuales ni para identificar, verificar o perfilar hablantes.
- El género se marca como «unknown» en voces que suenan por debajo de 20 años, porque el género infantil no es fiable.
- La edad y el grupo de edad figuran con estado «experimental» en la salida del modelo.
- La detección de neerlandés es sensible al acento.
- El uso de `trust_remote_code=True` ejecuta código del repositorio (`modeling_jev.py`, `answers_jev.py`); se recomienda fijar el commit revisado mediante `revision`.
- No se documentan sesgos específicos más allá de las limitaciones anteriores; la licencia Apache-2.0 permite uso comercial sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tvosch/Qwen3-ASR-0.6B-Jev-Dutch
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Paper de referencia Qwen-Audio-Jev: https://arxiv.org/abs/2610.21614
- Common Voice 17: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- speechocean762: https://huggingface.co/datasets/mispeech/speechocean762
