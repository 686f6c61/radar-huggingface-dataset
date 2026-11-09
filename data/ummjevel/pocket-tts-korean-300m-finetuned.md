# ummjevel/pocket-tts-korean-300m-finetuned

## Resumen

Pocket TTS Korean 300M Finetuned es un modelo de síntesis de voz (text-to-speech) en coreano, desarrollado por el usuario ummjevel como un ajuste fino comunitario del modelo base kyutai/pocket-tts, un TTS de 300M de parámetros originalmente entrenado en inglés por Kyutai. El modelo resuelve la generación de habla coreana a partir de texto, incluyendo clonación de voz zero-shot a partir de un prompt de audio de hasta 5 segundos, y se distribuye con licencia CC-BY-4.0.

Arquitectónicamente es un transformer de 24 capas con anchura 1024, acoplado al códec neuronal Mimi y a un codificador de prompt de voz, sumando 336.068.290 parámetros totales (incluyendo códec y prompt encoder). El checkpoint seleccionado corresponde al paso 110.000 con EMA, obtenido tras un ajuste fino sobre el checkpoint coreano de 100k pasos, que a su vez partió del checkpoint base inglés de 24 capas.

Su relevancia radica en que extiende un TTS compacto y de código abierto al coreano con métricas de evaluación publicadas y reproducibles (CER del 5,544 %, UTMOSv1 de 2,9906 y similitud de hablante de 0,9303 sobre 500 ítems del conjunto CV3-Eval zero_shot_ko), lo que lo convierte en una referencia útil para investigación en TTS multilingüe de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 24 capas, anchura 1024, con códec Mimi y prompt encoder |
| Parametros totales | 336.068.290 (incluye codec Mimi y prompt encoder completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ejemplo máximo de 30 s; prompt de voz máximo de 5 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Libreria | pocket-tts |
| Pipeline | text-to-speech |
| Modelo base | kyutai/pocket-tts (checkpoint inglés de 24 capas) |
| Tokenizer | SentencePiece coreano, 4.000 tokens |
| Tamano del repo | 1,3 GB |
| Inferencia | Marcada como `inference: false` en la model card |

## Arquitectura y entrenamiento

El modelo es un transformer de 24 capas y anchura 1024 que opera sobre representaciones del códec neuronal Mimi, con un codificador de prompt de voz para la clonación zero-shot. El objetivo de entrenamiento es nativo LSD + EOS, con un multiplicador de batch de flujo de 4 y evaluación con CFG de 2. El tokenizer es un SentencePiece coreano de 4.000 tokens, y los ejemplos de entrenamiento se limitan a 30 segundos con prompts de voz de hasta 5 segundos.

El entrenamiento partió del checkpoint base inglés de Kyutai (24 capas), se ajustó sobre el conjunto público coreano seastar105/emilia-yodas-ko-filtered-pocket-tts (918.609 enunciados, 2.276,88 horas en train; 9.472 enunciados, 23,00 horas en validación) hasta un checkpoint coreano de 100k pasos EMA, y después continuó con baja tasa de aprendizaje hasta el paso 110k EMA seleccionado. Se usó AdamW con learning rate 5e-05, schedule constante sin warmup, EMA de 0,999, batch global 64 (microbatch 32 × acumulación 2), semilla 42 y dropout de texto y voz de 0,2 cada uno. El estado del optimizador y del RNG no se restauró entre fases (AdamW nuevo). El punto final planificado era la etiqueta de 250k pasos, pero el checkpoint publicado es el de 110k.

## Capacidades

- Síntesis de voz (text-to-speech) en coreano a partir de texto de entrada.
- Clonación de voz zero-shot mediante un prompt de audio de hasta 5 segundos.
- Generación de habla con control de parada mediante EOS nativo.
- Evaluación automática de inteligibilidad (CER con Whisper large-v3) y calidad (UTMOSv1).
- Soporte de evaluación de similitud de hablante con embeddings WavLM.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada (más allá del prompt de voz) ni modo de razonamiento.
- Capacidad multilingüe limitada al coreano según los metadatos del modelo.

## Casos de uso

- Investigación en TTS coreano: el modelo sirve como punto de partida reproducible para experimentos de ajuste fino y comparación de métricas (CER, UTMOSv1, similitud de hablante) sobre el conjunto CV3-Eval zero_shot_ko.
- Clonación de voz para prototipos: con un prompt de 5 segundos se puede generar habla con la identidad vocal del hablante de referencia, útil en demos de doblaje o audiolibros experimentales.
- Generación de audiolibros y contenido narrado en coreano: el modelo acepta texto de hasta 30 segundos por ejemplo, adecuado para fragmentos cortos que se concatenan en un pipeline.
- Asistentes de voz para aplicaciones coreanas: integrable en un pipeline TTS de un asistente conversacional, siempre que se validen latencia y calidad en producción.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en coreano, con la ventaja de un modelo compacto de 336M parámetros.
- Evaluación comparativa de TTS: al publicar métricas detalladas y protocolo de evaluación, sirve como baseline en estudios académicos sobre TTS multilingüe y clonación de voz.
- Localización de contenido: generación de voces coreanas para vídeos, pódcast o material formativo, con la salvedad de revisar la licencia CC-BY-4.0 y los derechos de las voces de referencia.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / protocolo |
|---|---|---|
| CER (menor es mejor) | 5,544 % | CV3-Eval zero_shot_ko, 500 ítems, CFG 2, Whisper large-v3 |
| UTMOSv1 (mayor es mejor) | 2,9906 | CV3-Eval zero_shot_ko, 500 ítems, utmos-pytorch 0.1.0 |
| Similitud de hablante (mayor es mejor) | 0,9303 | CV3-Eval zero_shot_ko, WavLM base-plus-sv, coseno |
| Generaciones silenciosas | 0 / 500 | Evaluación completa |
| Generaciones sin EOS | 0 / 500 | Evaluación completa |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 336M parámetros en fp32 el peso ronda 1,3 GB, y en fp16 aproximadamente 0,7 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible; por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para fp16, pero no hay confirmación en la model card.
- ¿Cabe en GPU consumer? Probablemente sí por tamaño de parámetros, pero no hay datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: la librería indicada es pocket-tts; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card indica que el tiempo de generación no se registró por enunciado en la evaluación original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ummjevel/pocket-tts-korean-300m-finetuned | 336,1M | No disponible (30 s por ejemplo) | Coreano | CC-BY-4.0 | Hugging Face, `inference: false` |
| kyutai/pocket-tts (base) | ~300M (24 capas) | No disponible | Inglés | No disponible en la información | Hugging Face |
| Alternativas TTS coreanas de código abierto | No disponible | No disponible | Coreano | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación comunitario, no una versión oficial de Kyutai; la model card lo declara explícitamente.
- Marcado como `inference: false` en los metadatos, lo que puede indicar que no está listo para inferencia directa sin configuración adicional.
- Entrenado únicamente en coreano; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación y de errores de pronunciación no cuantificado más allá del CER del 5,544 % en el conjunto de evaluación.
- Las métricas son automáticas (UTMOSv1, no MOS humano ni UTMOSv2) y pueden no reflejar la calidad percibida.
- La similitud de hablante se mide con embeddings WavLM y no sustituye una evaluación humana de la clonación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero deben revisarse los derechos de las voces de referencia y del dataset de entrenamiento (Emilia-YODAS coreano filtrado).
- El estado del optimizador no se restauró entre fases de entrenamiento, lo que puede afectar a la reproducibilidad exacta.
- No se documentan sesgos específicos del modelo; al ser un TTS, puede reproducir sesgos presentes en los datos de entrenamiento y en las voces de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ummjevel/pocket-tts-korean-300m-finetuned
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Checkpoint base inglés de 24 capas: https://huggingface.co/kyutai/pocket-tts/tree/492522650173a0653b7575cdc25ae09810e5d741/languages/english_2026-04_24l
- Dataset de entrenamiento: https://huggingface.co/datasets/seastar105/emilia-yodas-ko-filtered-pocket-tts/tree/13e9bcb8200f3abf5aa687215f480305619aadd8
- Dataset de evaluación CV3-Eval: https://huggingface.co/datasets/yuekai/CV3-Eval/tree/6ea9d3650fffcbed7c6279e6d1546d01ef1d2796
- Whisper large-v3 (evaluación CER): https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1
- WavLM base-plus-sv (similitud de hablante): https://huggingface.co/microsoft/wavlm-base-plus-sv/tree/feb593a6c23c1cc3d9510425c29b0a14d2b07b1e
- Pesos UTMOS PyTorch: https://huggingface.co/Blinorot/UTMOS-PyTorch/tree/4f2447e519df3b88567b45583d3500006729502b
- Paquete utmos-pytorch 0.1.0: https://pypi.org/project/utmos-pytorch/0.1.0/
- Receta de entrenamiento: https://huggingface.co/ummjevel/pocket-tts-korean-300m-finetuned/blob/main/training_recipe.json
- Evaluación: https://huggingface.co/ummjevel/pocket-tts-korean-300m-finetuned/blob/main/evaluation.json
- Protocolo de evaluación y datos: https://huggingface.co/ummjevel/pocket-tts-korean-300m-finetuned/blob/main/EVALUATION_AND_DATA.md
