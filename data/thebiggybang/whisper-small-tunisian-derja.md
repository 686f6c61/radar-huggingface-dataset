# TheBiggyBang/whisper-small-tunisian-derja

## Resumen

`whisper-small-tunisian-derja` es un ajuste fino completo de `openai/whisper-small` (242 M de parámetros) especializado en el reconocimiento automático de habla (ASR) del árabe tunecino, conocido como derja, incluyendo el code-switching con francés e inglés que caracteriza el habla cotidiana en Túnez. Lo publica el usuario independiente TheBiggyBang bajo licencia Apache 2.0, con pesos en safetensors compatibles con Transformers y una variante adicional en CTranslate2 int8 para inferencia en CPU.

El modelo aborda un problema concreto: los sistemas ASR multilingües genéricos rinden muy mal sobre derja, un dialecto árabe con ortografía no estandarizada y fuerte mezcla léxica de francés. Según la model card, el Whisper-small sin ajustar obtiene un WER del 79,1 % en el conjunto de test, mientras que este ajuste lo reduce al 32,8 % (31,9 % normalizado) con un CER del 13,4 %.

Es relevante para desarrolladores que necesiten transcripción de audio tunecino en productos de subtitulado, análisis de llamadas o asistentes de voz, y como caso de estudio de ajuste eficiente de Whisper sobre dialectos de bajos recursos. El entrenamiento se realizó sobre los corpus LinTO de LINAGORA con controles explícitos de fuga de datos entre entrenamiento y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 12 capas encoder / 12 capas decoder, 768 dimensiones |
| Parámetros totales | 241.734.912 (242 M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (ventana nativa de Whisper); audio más largo requiere chunking |
| Tipos de cuantización | fp32 (repo principal), fp16 (inferencia recomendada), int8 (variante CTranslate2) |
| Idiomas soportados | aeb (árabe tunecino), ar, fr, en (code-switching) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 967 MB); CTranslate2 int8 en repo separado (250 MB) |

## Arquitectura y entrenamiento

Se trata de la arquitectura Whisper-small estándar: un transformer encoder-decoder con normalización pre-LN, convoluciones iniciales sobre el espectrograma mel y embeddings posicionales sinusoidales, entrenado originalmente por OpenAI con supervisión débil a gran escala. El ajuste fino no modifica la arquitectura, solo los pesos, y conserva el prompt de idioma (`language=arabic`) y la tarea `transcribe` sin timestamps.

El entrenamiento usó los corpus LinTO Tunisian de LINAGORA (CC-BY-4.0): un 40 % de muestras del split `train` original y un 60 % de copias aumentadas (voice conversion y denoising) del dataset `linto-dataset-audio-ar-tn-augmented`. Se ejecutaron 4.071 pasos con batch efectivo de 32 (unos 130.000 segmentos) en 2× NVIDIA T4 durante 10,3 horas, con AdamW, learning rate 1e-5, schedule coseno, 300 pasos de warm-up, weight decay 0.01, grad-clip 1.0 y fp16. Se aplicó SpecAugment (máscaras temporales), ganancia aleatoria de ±6 dB y ruido coloreado con SNR de 15–30 dB. Los segmentos van de 0,6 a 29 s, con un máximo de 220 tokens y 4 segmentos por grabación. El mejor checkpoint (paso 3.416) se eligió por WER normalizado en dev. Como control de fuga, se bloquearon las 679 frases de evaluación con 3 o más palabras y se descartaron 97 grabaciones de entrenamiento que las contenían; además, los splits dev y test se separan por grabación, no por segmento.

## Capacidades

- Transcripción de voz a texto en árabe tunecino (derja) escrito en grafía árabe, con eliminación de diacríticos y conservación de puntuación.
- Manejo de code-switching: las palabras francesas e inglesas se transcriben en alfabeto latino (o en árabe cuando así las anotaron los anotadores).
- Reconocimiento de habla espontánea y conversacional, incluyendo nombres propios y expresiones coloquiales.
- Procesamiento de audio de hasta 30 s por segmento; con `pipeline` y `chunk_length_s=30` admite grabaciones más largas.
- Inferencia con decodificación greedy o beam search (beam 3 recomendado en la variante CT2).
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción; es un modelo ASR puro.
- Capacidad multilingüe limitada a los idiomas del ajuste (aeb, ar, fr, en); no se ha evaluado su rendimiento en otros dialectos árabes.

## Casos de uso

- Subtitulado de contenido audiovisual tunecino: series, vídeos de YouTube y pódcast en derja pueden transcribirse con chunking de 30 s y revisión humana posterior, dado el WER del 32,8 %.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas en centros de contacto tunecinos donde el agente mezcla derja, francés y términos técnicos en inglés.
- Generación de actas y resúmenes de reuniones: el texto transcrito alimenta un LLM posterior para resumen; el modelo cubre la fase ASR del pipeline.
- Investigación lingüística y sociolingüística: creación de corpus anotados de derja con code-switching, aprovechando que el modelo conserva la mezcla de scripts.
- Accesibilidad y búsqueda por voz: indexación de archivos de audio en árabe tunecino para búsqueda textual en archivos de medios.
- Prototipado en CPU o dispositivos de borde: la variante CTranslate2 int8 (250 MB) permite transcripción en tiempo real en portátiles sin GPU, útil para demos y aplicaciones de campo.
- Evaluación comparativa de ASR dialectal: sirve como referencia de ajuste fino de Whisper-small sobre un dialecto de bajos recursos, con protocolo de evaluación documentado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Conjunto de test: 482 clips (36,6 min) extraídos de todos los splits de test de LinTO, sin grabaciones vistas en entrenamiento ni en selección de checkpoint.

| Modelo / decodificador | WER | WER normalizado (IC 95 %) | CER |
|---|---|---|---|
| whisper-small sin ajustar, CT2 beam 3 | 79,1 | 76,3 (73,8–79,0) | 44,5 |
| Este modelo, Transformers fp16 greedy | 32,8 | 31,9 (29,9–34,2) | 13,4 |
| Este modelo, CTranslate2 int8 beam 3 | 30,4 | 29,5 (27,5–31,6) | 12,0 |
| LinTO Kaldi/Vosk con LM de 4-gramas (sobre 400 de los 482 clips) | 25,4 | 25,0 (22,0–28,1) | 15,7 |

La normalización elimina variantes ortográficas de la derja (أ/إ/آ→ا, ى→ي, ة→ه, dígitos arábigo-índicos, puntuación, minúsculas latinas y la «و» suelta unida a la palabra siguiente). Los intervalos de confianza provienen de un bootstrap agrupado por grabación. Frente a Vosk, este modelo comete menos errores de carácter (CER 12,0 vs 15,7) pero más errores de palabra; su mayor categoría de error (aproximadamente el 31 %) es ortografía casi correcta.

## Requisitos de hardware

- VRAM estimada: alrededor de 1 GB en fp16 para inferencia (242 M de parámetros); unos 2 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100 sin problema. El entrenamiento original usó 2× T4.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (GTX 1650 en adelante) e incluso en CPU con la variante int8.
- Despliegue: Transformers (`WhisperForConditionalGeneration`), `pipeline` con chunking, CTranslate2 (repo `whisper-small-tunisian-derja-ct2`), y potencialmente faster-whisper al estar basado en CT2. No se documenta soporte específico para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica que la variante CT2 int8 está pensada para CPU y transcripción en tiempo real con micrófono.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER test (normalizado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-tunisian-derja (este) | 242 M | 30 s por segmento | 31,9 (fp16 greedy) / 29,5 (CT2 int8 beam 3) | Apache 2.0 | Hugging Face + CT2 |
| openai/whisper-small | 242 M | 30 s por segmento | 76,3 (CT2 beam 3) | Apache 2.0 | Hugging Face |
| linagora/linto-asr-ar-tn-0.1 (Kaldi/Vosk) | no disponible | no disponible | 25,0 (sobre 400 clips) | no disponible en la información | Hugging Face |

El modelo supera ampliamente a Whisper-small sin ajustar en derja y se acerca al sistema específico de LinTO en WER normalizado, con mejor CER pero peor WER. No se dispone de datos de otros ajustes finos comparables de Whisper sobre derja en la información proporcionada.

## Limitaciones y advertencias

- WER del 32,8 %: sigue siendo alto para producción sin revisión humana; aproximadamente un tercio de los errores son variantes ortográficas casi correctas, lo que infla la métrica frente a la utilidad real.
- Ortografía no estandarizada de la derja: el modelo reproduce una convención concreta (sin diacríticos, con mezcla de scripts) que puede no coincidir con la de otros corpus o sistemas posteriores.
- Sesgos de dominio: entrenado con los corpus LinTO, que incluyen YouTube, TunSwitch y otras fuentes; puede degradarse en acentos regionales, ruido industrial o audio telefónico de baja calidad no representados.
- Riesgo de alucinación: como todo Whisper, puede generar texto plausible en tramos de silencio, ruido o habla ininteligible; conviene aplicar umbrales de confianza o VAD.
- Limitación de contexto: ventana nativa de 30 s; audios más largos requieren chunking, lo que puede cortar frases y degradar la transcripción en los límites.
- Idiomas: fuera de aeb/ar/fr/en no hay garantías; no se ha evaluado en otros dialectos árabes (marroquí, argelino, egipcio).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; los resultados de benchmarks están declarados como no verificados.
- Modelo pequeño (242 M): menor robustez que variantes medium o large de Whisper en condiciones acústicas adversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheBiggyBang/whisper-small-tunisian-derja
- Variante CTranslate2 int8: https://huggingface.co/TheBiggyBang/whisper-small-tunisian-derja-ct2
- Repositorio GitHub (código, notebook de entrenamiento y evaluación): https://github.com/TheBiggyBang1/whisper-tn-ct2
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset LinTO Tunisian Arabic: https://huggingface.co/datasets/linagora/linto-dataset-audio-ar-tn
- Dataset aumentado: https://huggingface.co/datasets/linagora/linto-dataset-audio-ar-tn-augmented
- Sistema LinTO Kaldi/Vosk de referencia: https://huggingface.co/linagora/linto-asr-ar-tn-0.1
- Paper de Whisper (arXiv 2212.04356): https://arxiv.org/abs/2212.04356
- Paper arXiv 2309.11327: https://arxiv.org/abs/2309.11327
- Paper arXiv 2504.02604: https://arxiv.org/abs/2504.02604
