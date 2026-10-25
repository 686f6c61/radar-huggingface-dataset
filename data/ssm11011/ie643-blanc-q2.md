# ssm11011/IE643-blanc-q2

## Resumen

IE643-blanc-q2 es un ajuste fino (fine-tuning) de openai/whisper-large-v3-turbo para reconocimiento automático del habla (ASR) en inglés, hindi, bengalí y telugu, con especial énfasis en habla con cambio de código (code-switching) hindi-inglés, bengalí-inglés y telugu-inglés. Lo desarrolla el usuario ssm11011 (equipo "blanc") en el marco de un proyecto de curso (IE643) y se presenta como el modelo "q2", el más reciente y con mejores resultados del proyecto. El repositorio ocupa 1,7 GB e incluye, además de los pesos en formato transformers, un conjunto de cabezas de identificación de idioma (LID) y un extractor ECAPA restringido a los cuatro idiomas, necesarios para reproducir el pipeline completo de decodificación.

La relevancia del modelo está en su enfoque: en lugar de un Whisper multilingüe genérico, propone un pipeline con segmentación por VAD, detección de idioma a nivel de fragmento (7 clases: en, hi, bn, te, hi_en, bn_en, te_en) y selección del prefijo de decodificación adecuado, de forma que las palabras indic aparecen en su escritura nativa y las inglesas en alfabeto latino. Sobre el conjunto de test retenido, el sistema alcanza un MS-WER (WER con escritura mixta) medio de 0,235 con el ensemble de LID de 7 clases, frente a 0,232 usando el prefijo de idioma "gold", lo que indica que el detector automático apenas degrada el resultado.

Se trata, por tanto, de un artefacto de investigación reproducido mediante un repositorio de GitHub concreto, no de un modelo listo para producción: las licencias no están declaradas en la model card, el rendimiento en indic monolingüe queda por debajo de modelos especialistas y el telugu-inglés solo se ha aprendido de clips sintéticos empalmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (modelo base: openai/whisper-large-v3-turbo) |
| Parametros totales | No disponible en la informacion proporcionada; el modelo base whisper-large-v3-turbo tiene 809 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (formato Whisper); el pipeline trocea con VAD antes de la inferencia |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; pesos en safetensors (precision no declarada, presumiblemente fp16/fp32) y cabezas LID en PyTorch `.pt` y TorchScript |
| Idiomas soportados | Ingles (en), hindi (hi), bengali (bn), telugu (te) y code-switching hi-en, bn-en, te-en |
| Licencia | No disponible (la model card remite a las licencias de Whisper y de los corpus de entrenamiento) |
| Formato de pesos | safetensors (formato HuggingFace transformers) en `model/`; `lid_ctc.pt`, `heads/*.pt` y `ecapa/lid_en_hi_bn_te.ts` (TorchScript) |

## Arquitectura y entrenamiento

La base es Whisper large-v3-turbo, un transformer encoder-decoder con encoder convolucional + attention sobre espectrogramas mel de 128 bandas y ventanas de 30 segundos; la variante "turbo" reduce el decoder a 4 capas (frente a las 32 del encoder) para recortar coste de inferencia. El fine-tuning se realiza sobre el checkpoint de OpenAI y añade tres componentes auxiliares: una cabeza LID-CTC a nivel de frame de 4 clases sobre el encoder (`lid_ctc.pt`, actuando como "oráculo" ctc), varias cabezas LID de 7 clases afinadas (`heads/*.pt`: `self`, `utt`, `wv3`, `ctc`) y un ECAPA de VoxLingua107 restringido a en/hi/bn/te exportado a TorchScript (`ecapa/...`). El ensemble desplegado (`ens`) combina por voto suave `self`, `utt`, `wv3` y `ctc`.

No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset, pero sí los corpus empleados según las restricciones declaradas: IndicVoices, Kathbath, FLEURS, MUCS, Shrutilipi, LibriSpeech y Svarah, además de clips sintéticos empalmados para construir ejemplos de code-switching. La innovación procede de la decodificación: la clase LID del fragmento determina el prefijo del decoder (`[SOT, <|L|>, <|transcribe|>, <|notimestamps|>]` para lenguas puras, `[SOT, <|L|>, <|en|>, <|transcribe|>, <|notimestamps|>]` para las clases mixtas), lo que fuerza la escritura nativa de las palabras indic y latina para las inglesas. El pipeline oficial incluye VAD con silero-vad y traducción vía NLLB.

## Capacidades

- Transcripción ASR en inglés, hindi, bengalí y telugu, con salida en escritura nativa para las lenguas indic.
- Reconocimiento de habla con cambio de código intra-enunciado hindi-inglés, bengalí-inglés y telugu-inglés.
- Identificación de idioma a nivel de frame (cabeza CTC de 4 clases) y a nivel de fragmento (ensemble de 7 clases, con macro-F1 de test 0,930 y accuracy 0,947).
- Selección automática del prefijo de idioma del decoder, sin necesidad de especificar el idioma manualmente cuando se usa el pipeline con `--ens`.
- Segmentación por VAD para audio largo, encadenando ventanas de 30 s.
- Traducción opcional en el pipeline (dependencia NLLB descargada por `download_q2.py`), no como capacidad nativa del modelo.
- No se declara soporte de tool calling, agentes, visión, audio más allá del ASR ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y notas de voz bilingües hindi-inglés: el pipeline trocea el audio con VAD y aplica el prefijo de la clase mixta, de modo que términos técnicos en inglés quedan en alfabeto latino y el resto en devanagari, reduciendo la corrección manual posterior.
- Subtitulado de contenido educativo de Karnataka o Andhra Pradesh: para bengalí-inglés y telugu-inglés, el ensemble LID (accuracy 0,947) decide por fragmento en lugar de forzar un idioma en todo el fichero.
- Investigación en code-switching: el repositorio publica cabezas LID separadas y resultados por conjunto, lo que permite ablaciones reproducibles del detector (prefijo gold frente a ensemble) sobre los mismos test sets.
- Evaluación comparativa de ASR multilingüe: los resultados por set (Kathbath, FLEURS, MUCS, LibriSpeech) sirven como línea base de 0,235 de MS-WER medio para comparar futuros sistemas con otra estrategia de LID.
- Análisis de llamadas de atención al cliente en India con mezcla de inglés y lengua local: el modelo mantiene la escritura original de cada segmento, lo que facilita búsquedas posteriores por script.
- Prototipado académico de ASR de bajo coste: al pesar 1,7 GB el repositorio, se puede desplegar en una GPU de consumo para experimentos de decodificación con prefijos de idioma.
- Generación de corpus pseudo-etiquetados: transcripción masiva con `--ens` para alimentar posteriores fine-tunings, aceptando el WER declarado por conjunto (por ejemplo, 0,359 en MUCS hi-en).

## Benchmarks y rendimiento

Resultados en test retenido, métrica MS-WER (WER con escritura mixta), según la model card:

| Conjunto | Prefijo LID gold | Ensemble LID 7 clases |
|---|---|---|
| Test reales (14 sets, media) | 0,232 | 0,235 |
| Code-switch empalmado (898 clips) | 0,173 | 0,179 |
| Rejilla empalmada2 p x c | 0,245 | 0,248 |

WER por conjunto con prefijo gold:

| Conjunto | WER |
|---|---|
| Kathbath bn | 0,189 |
| Kathbath hi | 0,202 |
| Kathbath te | 0,329 |
| FLEURS bn | 0,242 |
| FLEURS hi | 0,178 |
| FLEURS te | 0,312 |
| FLEURS en | 0,085 |
| MUCS hi-en | 0,359 |
| MUCS bn-en | 0,268 |
| LibriSpeech | 0,025 |

Detección de idioma (ensemble, test): macro-F1 0,930 y accuracy 0,947. No se han publicado comparaciones directas contra otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 2 y 4 GB para los pesos del modelo en fp16, más overhead de activaciones y del VAD; el repositorio completo ocupa 1,7 GB.
- El pipeline `--ens` descarga además whisper-large-v3 (para el ensemble) y NLLB para traducción, por lo que el consumo real de memoria y disco crece de forma significativa respecto al solo checkpoint q2.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4090); para procesamiento por lotes de audio largo conviene 16-24 GB (RTX 4090, A5000, L40S, A100).
- Cabe en GPU de consumo: sí, en fp16 sobre GPUs de 8 GB en adelante, siempre que se ejecute sin el ensemble completo ni la traducción.
- Opciones de despliegue: transformers (formato nativo del repositorio) y el pipeline propio de `cs_quad/demo.py`. No se proporcionan conversiones a GGUF ni a CTranslate2/faster-whisper; para llama.cpp/Ollama habría que convertir los pesos por cuenta propia y las cabezas LID en PyTorch no serían utilizables.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IE643-blanc-q2 | Base de 809 M (whisper-large-v3-turbo) | Ventanas de 30 s | en, hi, bn, te + code-switching | No disponible | HuggingFace + GitHub |
| openai/whisper-large-v3-turbo | 809 M | Ventanas de 30 s | Multilingue amplio | MIT (modelo base) | HuggingFace, ampliamente integrado |
| IndicWhisper | No disponible en la informacion proporcionada | Ventanas tipo Whisper | Indic (varios) | No disponible | Referenciado en la model card como especialista con mejor WER indic |
| IndicConformer | No disponible en la informacion proporcionada | No disponible | Indic (varios) | No disponible | Referenciado en la model card como especialista con mejor WER indic |

La model card reconoce explícitamente que, en indic monolingüe dentro de dominio, la precisión queda por debajo de IndicWhisper e IndicConformer; la ventaja de este modelo se concentra en el tratamiento del code-switching y en la selección automática de prefijo por fragmento.

## Limitaciones y advertencias

- El telugu-inglés se ha aprendido únicamente a partir de clips sintéticos empalmados: no había corpus real de te-en, por lo que el comportamiento en habla espontánea de esa combinación es incierto y el WER en telugu es el más alto de la tabla (0,329 en Kathbath, 0,312 en FLEURS).
- En indic monolingüe dentro de dominio rinde por debajo de modelos especialistas (IndicWhisper, IndicConformer), según admite el propio autor.
- Licencia no declarada: no se especifican términos de uso comercial. Aplican las condiciones de Whisper y de los corpus de entrenamiento citados (IndicVoices, Kathbath, FLEURS, MUCS, Shrutilipi, LibriSpeech, Svarah), algunas de ellas con restricciones de uso; es imprescindible verificar cada una antes de un despliegue en producción.
- Riesgo de alucinación típico de Whisper en silencios, ruido o dominios alejados del entrenamiento; el troceado por VAD mitiga pero no elimina este problema.
- Cobertura lingüística cerrada a cuatro idiomas y tres pares de code-switching; cualquier otra lengua o mezcla queda fuera del diseño del prefijo de decodificación.
- El pipeline depende de componentes externos (whisper-large-v3, NLLB, silero-vad) y de rutas y scripts concretos del repositorio; no es un paquete autocontenido ni una API estable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en octubre de 2026: no hay validación independiente de los resultados.
- El decoder turbo de 4 capas limita la calidad frente a whisper-large-v3 completo en tareas de transcripción exigentes; el ensemble del pipeline intenta compensarlo a costa de más memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssm11011/IE643-blanc-q2
- Repositorio del proyecto (código, pipeline y resultados): https://github.com/SSM11011/IE643-blanc
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs o demos) sobre este modelo; los resultados devueltos no guardan relación con el contenido de la ficha.
