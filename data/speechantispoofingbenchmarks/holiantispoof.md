# SpeechAntiSpoofingBenchmarks/HoliAntiSpoof

## Resumen

HoliAntiSpoof es un modelo de lenguaje de audio (audio LLM) disenado especificamente para la deteccion holistica de voz falsificada (anti-spoofing). Lo desarrollan Xu et al. (2026) y se publica como parte del ecosistema Speech Anti-Spoofing Arena, un banco de pruebas mantenido por la organizacion SpeechAntiSpoofingBenchmarks. El modelo reformula el analisis de spoofing como una tarea unificada de generacion de texto: en lugar de emitir solo una etiqueta binaria real/falso, produce un analisis estructurado en JSON que incluye la clasificacion, el metodo de falsificacion, las regiones de audio manipuladas y el impacto semantico de la manipulacion.

Tecnicamente, HoliAntiSpoof parte del thinker de Qwen2.5-Omni-7B (un encoder de audio estilo Whisper mas un LLM Qwen2 de 7B) y lo afina con adaptadores DoRA de rango 64 sobre las proyecciones de auto-atencion q/k/v/o, ademas de un encoder de audio completamente reentrenado. El resultado es un modelo de aproximadamente 8255 M de parametros en BF16 (unos 15 GB de pesos) que, en el contexto de la Arena, se envuelve para producir una puntuacion continua de autenticidad mediante la diferencia de logits entre los tokens "real" y "fake".

Su relevancia actual radica en que aborda la deteccion de deepfakes de voz desde una perspectiva interpretable y multimodal (audio y lenguaje), superando el enfoque clasico de clasificacion binaria. El repositorio de Hugging Face actua como wrapper de evaluacion para la Arena y no rehostea los pesos: carga el adaptador DoRA de los autores sobre Qwen2.5-Omni-7B y lo fusiona en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio LLM: encoder de audio estilo Whisper + LLM Qwen2 7B (thinker de Qwen2.5-Omni-7B), con adaptadores DoRA |
| Parametros totales | 8255,263744 M (~8,26 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la Arena usa los primeros 4 s de audio; los autores permiten hasta 60 s) |
| Tipos de cuantizacion | BF16 (pesos en el wrapper); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador DoRA sobre Qwen2.5-Omni-7B, fusionado en carga) |

## Arquitectura y entrenamiento

HoliAntiSpoof se construye sobre el thinker de Qwen2.5-Omni-7B, que combina un encoder de audio de inspiracion Whisper con un LLM Qwen2 de 7B. El ajuste fino emplea DoRA (Weight-Decomposed Low-Rank Adaptation) con rango 64 aplicado a las proyecciones q/k/v/o de la auto-atencion del LLM, junto con un encoder de audio completamente afinado. Los adaptadores se fusionan en los pesos base en el momento de la carga, y la inferencia se ejecuta en BF16 con las capas repartidas entre dos GPU mediante las variables de entorno `HOLI_DEVICES` / `HOLI_SPLIT`.

El entrenamiento (segun la Tabla 3 del paper) utiliza un conjunto agregado de corpus de anti-spoofing: ASVspoof 2019 LA train, PartialSpoof, SINE, WaveFake, CodecFake, PartialEdit, VCTK, LJSpeech, EmoFake, SpeechFake-en, DailyTalkEdit, FakeOrReal y todo In-the-Wild. La innovacion principal es reformular el anti-spoofing como generacion de texto estructurado: el modelo emite un JSON con el analisis (real/fake, metodo de spoofing, regiones manipuladas, influencia semantica), lo que permite razonamiento conjunto sobre el metodo de ataque y sus efectos. No se documentan en la informacion disponible detalles sobre volumen de tokens, uso de RLHF o DPO.

## Capacidades

- Deteccion de voz falsificada (bona fide vs. spoof) con salida estructurada en JSON.
- Identificacion del metodo de spoofing empleado (TTS, voice conversion, codec, edicion parcial, etc.).
- Localizacion de regiones manipuladas dentro del clip (spoofed regions).
- Analisis de influencia semantica de la manipulacion sobre el contenido hablado.
- Razonamiento multimodal audio-lenguaje gracias a la base Qwen2.5-Omni (encoder de audio + LLM).
- Salida de puntuacion continua de autenticidad en el wrapper de la Arena (diferencia de logits real/fake en FP32).
- Capacidades generales heredadas del LLM base (generacion de texto, razonamiento) no documentadas especificamente para este ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma especifica.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Moderacion de contenido de audio en plataformas: el modelo puede clasificar clips subidos por usuarios como reales o falsificados y devolver el metodo detectado, permitiendo priorizar revisiones humanas sobre los casos marcados como spoof.
- Verificacion de autenticidad en periodismo y verificacion de hechos: dado un audio atribuido a una figura publica, el modelo emite un analisis JSON con regiones manipuladas e influencia semantica, util para documentar una verificacion.
- Deteccion de fraude en call centers y banca telefonica: integrado en un pipeline de preprocesado, puede puntuar la autenticidad de grabaciones de llamadas (primeros 4 s en la configuracion de la Arena) y activar alertas ante voces sinteticas.
- Analisis forense de ediciones parciales: gracias a su capacidad de localizar regiones spoofed dentro de un clip, sirve para identificar tramos insertados o modificados en una grabacion (casos PartialEdit, PartialSpoof).
- Evaluacion de sistemas TTS y de conversion de voz: los desarrolladores pueden usar el modelo como discriminador interpretable para medir la naturalidad y detectabilidad de sus sintetizadores frente a corpus como ASVspoof o WaveFake.
- Investigacion en anti-spoofing: el wrapper y los resultados por dataset de la Arena permiten reproducir y comparar puntuaciones EER de forma estandarizada contra otros sistemas del benchmark.
- Monitorizacion de campanas de desinformacion con audio sintetico: el analisis semantico de la manipulacion ayuda a caracterizar que se altero en el mensaje, no solo que se altero.

## Benchmarks y rendimiento

Resultados EER% (menor es mejor) publicados en la Speech Anti-Spoofing Arena. EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR% en el umbral EER de DeepVoice.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 1,29 |
| ASVspoof2021_LA | 10,34 |
| ASVspoof2021_DF | 8,12 |
| ASVspoof5 | 24,20 |
| InTheWild | 0,89 (marcado n/a* por solapamiento con entrenamiento) |
| ADD22_eval_31 | 7,75 |
| ADD2023_track12_test_r1 | 24,42 |
| CFAD | 22,78 |
| CD-ADD | 12,72 |
| CVoiceFake_small | 31,98 |
| DeepVoice | 12,26 |
| LibriSeVoc | 9,13 |
| SONAR | 19,83 |
| ArAD | 21,49 |

No se dispone en la informacion proporcionada de resultados comparativos de MMLU, HumanEval, GSM8K ni de otros benchmarks de LLM, ya que el modelo esta especializado en anti-spoofing de audio.

## Requisitos de hardware

- VRAM estimada: ~15 GB en BF16 para los pesos; el wrapper reparte las capas entre dos GPU mediante `HOLI_DEVICES` / `HOLI_SPLIT`, por lo que en la practica requiere al menos dos GPU (o una con suficiente memoria si se ajusta el reparto).
- GPU recomendadas: el diseno del wrapper asume un reparto en dos GPU; opciones habituales serian A100 40/80 GB, H100, L40S o dos RTX 4090/A6000. No se documentan requisitos minimos exactos.
- Cabe en GPU consumer: previsiblemente si, con dos GPU de 24 GB (p. ej. dos RTX 4090) o una unica GPU de 24 GB si se permite el reparto en una sola; no confirmado en la informacion disponible.
- Opciones de despliegue: solo PyTorch (no hay motor TensorRT porque es un modelo de 7B en dos GPU). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La Arena realiza una unica pasada forward sobre el prompt de los autores con el primer clip de 4 s (64600 muestras).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos de anti-spoofing con los que comparar directamente. La propia Speech Anti-Spoofing Arena incluye otros sistemas, pero sus puntuaciones no se detallan en la informacion disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoliAntiSpoof | ~8,26 B | hasta 60 s de audio (Arena usa 4 s) | Audio LLM generativo (JSON) | Apache 2.0 | Adaptador DoRA + Qwen2.5-Omni-7B |
| Alternativas de la Arena | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El wrapper de la Arena evalua solo los primeros 4 s de cada clip, aunque los autores permiten hasta 60 s; los resultados pueden no reflejar el rendimiento sobre clips largos completos.
- InTheWild y EmoFake_test estan marcados como n/a* por solapamiento con el conjunto de entrenamiento, por lo que sus cifras no son una medida limpia de generalizacion.
- El rendimiento es muy variable segun el dataset: EER de 1,29% en ASVspoof2019_LA frente a 31,98% en CVoiceFake_small o 24,42% en ADD2023_track12_test_r1, lo que indica escasa robustez ante ciertos ataques y dominios.
- Riesgo de alucinacion inherente a un LLM: el JSON generado puede contener metodos o regiones de manipulacion incorrectos aunque la etiqueta real/fake sea correcta.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con corpus mayoritariamente en ingles (VCTK, LJSpeech, SpeechFake-en, entre otros), el comportamiento en otros idiomas no esta caracterizado.
- La licencia Apache 2.0 permite uso comercial, pero los pesos no se rehostean: el wrapper depende de Qwen2.5-Omni-7B y del adaptador de los autores, sujetos a sus propias condiciones.
- Solo se ofrece inferencia en PyTorch; no hay soporte documentado para motores de alto rendimiento ni cuantizaciones de baja precision.
- El modelo esta especializado en anti-spoofing; no debe emplearse como LLM de proposito general sin validacion adicional.

## Enlaces

- Hugging Face (wrapper): https://huggingface.co/SpeechAntiSpoofingBenchmarks/HoliAntiSpoof
- Adaptador DoRA de los autores: https://huggingface.co/wsntxxn/HoliAntiSpoof
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Paper (arXiv): https://arxiv.org/abs/2602.04535
- Paper en Hugging Face: https://huggingface.co/papers/2602.04535
- Repositorio GitHub: https://github.com/OpenTSLab/HoliAntiSpoof
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Organizacion en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks
