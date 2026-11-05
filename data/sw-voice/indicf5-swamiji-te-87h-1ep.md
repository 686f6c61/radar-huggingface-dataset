# sw-voice/indicf5-swamiji-te-87h-1ep

## Resumen

IndicF5 Swamiji Telugu 87h 1ep es un checkpoint de investigación de síntesis de voz (text-to-speech) en telugu, desarrollado por el usuario sw-voice. Se trata de un ajuste fino del modelo IndicF5 de AI4Bharat, que a su vez parte de la arquitectura F5-TTS. El modelo está especializado en la reproducción de la voz de un hablante concreto (Swamiji) a partir de discursos en telugu, y constituye la etapa A de un pipeline de dos etapas: una pasada sobre 83 horas de audio limpio que después se reajusta con clips específicos de Navaratri.

La relevancia de este checkpoint es fundamentalmente metodológica y de investigación: demuestra el comportamiento de F5-TTS al entrenar sobre corpus extensos y limpios de un solo hablante en un idioma de bajos recursos como el telugu, y sirve de base para el modelo final sw-voice/indicF5-best. No es un modelo de propósito general ni está pensado para producción: su licencia es research-only y su distribución es prácticamente nula (0 descargas en el momento de la consulta).

Con 337 millones de parámetros y un repositorio de 1,3 GB, el modelo se enmarca en la categoría de TTS ligero. Emplea la arquitectura F5-TTS (flow matching sobre difusión, con decoder autorregresivo no aplicable) y requiere pesos en float32, ya que la familia IndicF5 genera ruido en float16 según advierte el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching, transformer con DiT y decoder de vocoder integrado) |
| Parámetros totales | 337.096.836 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de hasta 30 s; entrenamiento con fragmentos de hasta 25 s) |
| Tipos de cuantización | no disponible; el autor indica que debe usarse float32 (float16 produce ruido) |
| Idiomas soportados | telugu (te) |
| Licencia | research-only (other) |
| Formato de pesos | safetensors (claves `ema_model.*`), más `vocab.txt` del tokenizer |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, un sistema de síntesis de voz basado en flow matching que genera mel-espectrogramas a partir de texto y una referencia de audio, y cuya arquitectura interna combina un transformer con bloques DiT (Diffusion Transformer) y un decoder de vocoder. Sobre la base IndicF5 de AI4Bharat, el autor aplicó 10 épocas sobre 402 clips de Navaratri, y después una pasada adicional (etapa A) sobre 83,41 horas de discursos limpios en telugu. La receta emplea el `finetune_cli` de SWivid/F5-TTS 1.1.22 con el checkpoint F5TTS_Base y el vocabulario de IndicF5 (tokenizer `custom`), en bf16, con learning rate 1e-5, batch de 9.600 frames y grad clip de 1,0.

Los datos de la etapa A provienen del dataset sw-voice/swamiji-telugu-reuse-train, excluyendo los shlokas, y abarcan temáticas de Mahabharatam, Bhagavatam y Datta Maata (82,97 h brutas). El autor recortó los clips en sus propios límites VAD en 15.364 fragmentos de hasta 25 s (algunos de hasta 30 s), ya que el loader de F5 descarta cualquier audio superior a 30 s; sumando los 402 clips de Navaratri resultan 15.766 muestras y 83,41 h. La etapa A supuso una sola época, 3.302 actualizaciones y 8,6 minutos en una única H100. La inferencia de evaluación se realizó con el clip de referencia `p3R1wZLty6A_029` (10 s), nfe 32, cfg 2, sway −1 y speed 1.

## Capacidades

- Síntesis de voz (TTS) en telugu con clonación de voz del hablante de referencia.
- Generación de audio de hasta 30 s por clip de entrada, condicionada por un audio de referencia de unos 10 s.
- Reproducción de estilo prosódico y de entonación del hablante original (pausas, tono, ritmo).
- No soporta tool calling ni function calling: es un modelo puramente de generación de audio.
- No dispone de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al telugu; no se documentan capacidades en otros idiomas.
- No incluye modo thinking, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Investigación en TTS de bajos recursos: permite estudiar cómo se comporta F5-TTS al ajustar sobre un corpus extenso de un solo hablante en telugu, comparando métricas de similitud de voz y prosodia frente a variantes como best-vox.
- Generación de audiolibros o discursos sintéticos en telugu: el modelo reproduce la voz de referencia y puede narrar textos largos fragmentados en clips de hasta 30 s, encadenando segmentos.
- Preservación digital de la voz de un hablante: útil para proyectos de archivo sonoro o divulgación religiosa, dado el dominio (discursos de Swamiji) sobre el que fue entrenado.
- Evaluación de pipelines de TTS: sirve como punto de comparación para medir CER/WER y similitud de voz con herramientas como MAI-Transcribe-2 o WavLM-ECAPA.
- Prototipado de asistentes de voz en telugu: aunque no es apto para producción por su licencia, permite validar la inteligibilidad y naturalidad antes de entrenar un modelo con licencia comercial.
- Estudio de la estabilidad numérica en F5-TTS: al requerir float32, es un caso práctico para analizar el impacto de la precisión en la calidad del audio generado.
- Base para ajustes posteriores con datasets pequeños y específicos, como el propio reajuste de Navaratri que dio lugar a indicF5-best.

## Benchmarks y rendimiento

Evaluación sobre 10 respuestas completas en telugu con semillas 0 y 1. Se compara la etapa A con la etapa A más 5 épocas de Navaratri, el modelo base (Navaratri 10 épocas) y best-vox (VoxCPM2).

| Métrica | Etapa A (1 época, 83 h) | Etapa A + 5 épocas Navaratri | Base (Navaratri 10ep) | best-vox (VoxCPM2) |
|---|---|---|---|---|
| Similitud de voz, WavLM-ECAPA (% real vs real) | 95,9 | 96,6 | 95,7 | 96,6 |
| CER / WER, MAI-Transcribe-2 (%) | 1,27 / 7,5 | 1,84 / 8,4 | 1,24 / 6,7 | 1,15 / 7,6 |
| Dispersión de tono (semitonos; real 4,55) | 3,89 | 3,91 | 4,03 | 4,17 |
| Pausas por minuto, cortas / de frase / largas (real 7,1 / 14,0 / 0,6) | 9,2 / 10,0 / 0,2 | 8,4 / 10,6 / 0,4 | 11,4 / 10,7 / 0,0 | 9,8 / 10,6 / 3,0 |
| Diferencia de prosodia Gemini vs base (ambos órdenes) | −0,29 | −0,03 (empate) | no disponible | no disponible |
| Diferencia de prosodia Gemini vs best-vox (ambos órdenes) | +0,53 | +0,76 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 337 M de parámetros en float32, los pesos ocupan aproximadamente 1,35 GB, por lo que el consumo total incluye además el vocoder y los buffers de activación, que el autor no detalla.
- GPU recomendadas: una H100 fue suficiente para entrenar una época en 8,6 minutos; para inferencia, cualquier GPU con al menos unos pocos GB de VRAM libre debería bastar, aunque no se documentan cifras exactas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no se aportan pruebas ni requisitos mínimos.
- Opciones de despliegue: la librería indicada es f5-tts; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles; solo se conoce el tiempo de entrenamiento (8,6 min por época en una H100) y los parámetros de inferencia de evaluación (nfe 32, cfg 2, sway −1, speed 1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / clip máximo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndicF5 Swamiji Telugu 87h 1ep (este) | 337 M | clips de hasta 30 s | telugu | research-only | HuggingFace, 0 descargas |
| sw-voice/indicF5-best | no disponible | no disponible | telugu | no disponible | HuggingFace |
| Base sw-voice/indicf5-swamiji-te-navaratri-10ep | no disponible | no disponible | telugu | no disponible | HuggingFace |
| best-vox (VoxCPM2) | no disponible | no disponible | telugu (evaluación) | no disponible | referenciado en la model card |

## Limitaciones y advertencias

- Licencia research-only: no está permitido el uso comercial sin autorización expresa del autor.
- Riesgo de ruido con float16: el propio autor advierte que los pesos de la familia IndicF5 producen ruido en float16 y deben cargarse en float32.
- Dominio muy restringido: entrenado sobre discursos religiosos de un único hablante; puede degradarse fuera de ese registro o con vocabulario ajeno.
- Limitación de longitud: clips de hasta 30 s, y el loader descarta audios superiores, lo que obliga a fragmentar textos largos.
- Solo telugu: no hay soporte documentado para otros idiomas, incluido el inglés.
- Sesgos del hablante y del corpus: la voz generada hereda características del hablante de referencia y del material de entrenamiento, con posible infrarrepresentación de otros registros.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos desconocidos.
- Sin datos de benchmarks frente a otros TTS comerciales; la evaluación se limita a métricas internas y a comparaciones con variantes del propio autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/indicf5-swamiji-te-87h-1ep
- Modelo base: https://huggingface.co/sw-voice/indicf5-swamiji-te-navaratri-10ep
- Modelo final tras reajuste: https://huggingface.co/sw-voice/indicF5-best
- IndicF5 original: https://huggingface.co/ai4bharat/IndicF5
- Dataset de entrenamiento: https://huggingface.co/datasets/sw-voice/swamiji-telugu-reuse-train
- Repositorio de código F5-TTS: https://github.com/SWivid/F5-TTS
