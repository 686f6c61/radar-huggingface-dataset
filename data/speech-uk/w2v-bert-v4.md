# speech-uk/w2v-bert-v4

## Resumen

w2v-bert-v4 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el proyecto speech-uk, especializado en ucraniano, ruso e inglés. Se trata de un fine-tuning de w2v-bert-v3, que a su vez parte de la arquitectura Wav2Vec2-BERT 2.0 con una cabeza CTC de 606 millones de parámetros. El modelo se entrena sobre 150 horas de audio de YouTube transcrito automáticamente, 50 horas por idioma, y se distribuye como baseline de una serie que irá ampliando datos en versiones posteriores.

La relevancia del modelo radica en su enfoque de bajo coste: se entrena en una única RTX 3090 durante 5,8 horas y consigue un WER de 12,82 en el conjunto FLEURS dev (promedio de los tres idiomas) al aplicar shallow fusion con un modelo de lenguaje KenLM de 4-gramas. La salida incluye mayúsculas, puntuación y dígitos tal como aparecen en subtítulos, lo que lo hace directamente utilizable en pipelines de subtitulado.

El modelo emplea un tokenizer SentencePiece de 1801 piezas compartido entre los tres idiomas, con una cabeza CTC ampliada desde las 512 salidas originales. Se publica con licencia Apache 2.0 y pesos en bf16 en formato safetensors, junto con el modelo de lenguaje y las herramientas de extracción de características necesarias para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT 2.0 con cabeza CTC |
| Parametros totales | 607.524.425 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada por clips; batches de hasta 80 s de audio con padding) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ucraniano (uk), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2-BERT 2.0, un encoder transformer que procesa representaciones log-mel de 160 dimensiones extraídas mediante la librería `asr_features` (rueda binaria incluida en el repositorio, Linux x86-64, glibc 2.34+, Python 3.10+). Sobre el encoder se aplica una cabeza CTC con 1801 salidas, correspondientes al tokenizer SentencePiece `uk-ru-en` heredado de w2v-bert-v3: las 512 piezas originales se mantienen con los mismos identificadores y se añaden dígitos, símbolos (%, $, €, ₴, №) y piezas específicas de inglés y ruso. Las nuevas filas de la cabeza CTC se inicializaron como la media de las antiguas.

El entrenamiento se realizó sobre 150,18 horas de audio (112.314 clips, 1.432 vídeos) procedentes del dataset `speech-uk/yodas-tinyasr-50h`, derivado de YODAS v3.1. Los clips se cortaron por actividad de voz (PulseVAD de extract-speech) y tiempos de subtítulo, y se transcribieron con tinyasr (`en-ru-uk`); solo se conservaron aquellos con tasa de error de carácter ≤ 0,15 respecto a los subtítulos del vídeo y con una proporción de habla ≥ 0,3. El texto de entrenamiento son las hipótesis de tinyasr, que aportan mayúsculas y puntuación donde los subtítulos carecen de ellas. Se entrenó durante 5 épocas (18.230 pasos), con learning rate 3e-5, 912 pasos de warm-up, bf16, SpecAugment con enmascaramiento temporal de 0,05 y batches de clips de longitud similar de hasta 80 s, usando los kernels de w2v-bert-fast. El WER de validación en FLEURS dev por época fue 24,46, 19,94, 17,50, 15,99 y 15,34.

Como complemento, el repositorio incluye un modelo de lenguaje KenLM de 4-gramas de palabras (Kneser-Ney modificado, binario trie, 35 MB) entrenado únicamente con las transcripciones de los clips de entrenamiento (112.314 líneas, 1,34 millones de palabras, 127.793 palabras distintas) para shallow fusion en búsqueda por haz CTC.

## Capacidades

- Reconocimiento automático del habla en ucraniano, ruso e inglés con un único modelo y tokenizer compartido.
- Salida con mayúsculas, puntuación y dígitos tal como los escriben los subtítulos.
- Decodificación greedy (argmax con colapso de repeticiones) o con shallow fusion mediante KenLM (beam search).
- Manejo de clips de audio de hasta 80 s de duración con padding en batches.
- Normalización de audio integrada en el flujo de uso: 16 kHz mono, media eliminada y normalización de pico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Subtitulado automático de vídeo en ucraniano, ruso e inglés: el modelo genera texto con mayúsculas y puntuación directamente consumible como subtítulo, lo que evita post-procesado de capitalización y signos.
- Transcripción de contenido de YouTube y plataformas similares: al estar entrenado sobre clips de YODAS con dominio de vídeos hablados, se ajusta bien al registro y las condiciones acústicas de ese tipo de material.
- Generación de transcripciones para indexación y búsqueda: las salidas con puntuación y dígitos facilitan la construcción de índices de texto y la búsqueda por palabras clave sobre archivos de audio.
- Procesamiento de audio multilingüe con un solo modelo: útil en entornos donde conviven hablantes de ucraniano, ruso e inglés y se quiere evitar mantener tres sistemas separados.
- Investigación en ASR de bajo recurso: el modelo sirve como baseline reproducible (una RTX 3090, 5,8 horas de entrenamiento) para experimentos con más datos o con modelos de lenguaje in-domain más grandes.
- Prototipado y evaluación rápida: el repositorio incluye las puntuaciones de FLEURS dev, la rejilla de alpha/beta y los scripts de decodificación, lo que permite reproducir y comparar resultados sin infraestructura adicional.
- Integración en pipelines de accesibilidad: transcripción de reuniones o clases en los tres idiomas con un modelo de 606 M de parámetros que cabe en una GPU de consumo.

## Benchmarks y rendimiento

Resultados en FLEURS dev (1.075 enunciados, 3,07 h). WER con las reglas de puntuación del autor (minúsculas, sin puntuación, ё = е, apóstrofos unificados, números comparados tal como se escriben).

| Modelo | uk | ru | en | all |
|---|---:|---:|---:|---:|
| w2v-bert-v3 @ 33b1a48 (greedy) | no disponible | no disponible | no disponible | 37,71 |
| w2v-bert-v4, greedy | 10,17 | 11,48 | 22,08 | 15,35 |
| w2v-bert-v4 + KenLM (beam 64, alpha 0,2, beta -0,5) | 9,96 | 9,83 | 17,22 | 12,82 |

El checkpoint se seleccionó con FLEURS dev (el último, paso 18.230, con WER aún descendiendo) y los pesos del LM también se ajustaron en dev (todo alpha entre 0,15 y 0,2 con beta ≤ 0 da 12,82-12,90). No se utilizó FLEURS test. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 607 M de parámetros en bf16, los pesos ocupan aproximadamente 1,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: el entrenamiento se realizó en una única RTX 3090 (5,8 horas); para inferencia es suficiente cualquier GPU con al menos 4-8 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, con amplio margen en tarjetas de 8 GB o superiores.
- Opciones de despliegue: el flujo oficial usa `transformers` (AutoModelForCTC), el wheel `asr_features` para extracción de características y `pyctcdecode` 0.5.0 con `kenlm` y `pygtrie` para la decodificación con LM. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. La decodificación con LM requiere búsqueda por haz (beam 64), lo que añade coste computacional frente a la decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER FLEURS dev |
|---|---|---|---|---|---|
| speech-uk/w2v-bert-v4 | 607,5 M | no disponible | uk, ru, en | Apache 2.0 | 12,82 (con KenLM) |
| speech-uk/w2v-bert-v3 | 606 M (según model card) | no disponible | uk, ru, en | no disponible en la información | 37,71 (greedy, commit 33b1a48) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos ASR comparables (por ejemplo, whisper-large-v3 u otros) en los datos proporcionados, por lo que la comparativa se limita al modelo base de la serie.

## Limitaciones y advertencias

- El modelo es un baseline: se entrena sobre solo 150 horas de audio y el propio autor indica que versiones posteriores usarán más datos.
- El modelo de lenguaje KenLM se entrena únicamente con las transcripciones de los clips de entrenamiento (1,34 M de palabras), un corpus pequeño y de dominio limitado (vídeos de YouTube); el autor señala que un corpus in-domain mayor debería mejorar los resultados.
- El LM ayuda más al inglés (corrección de errores ortográficos en palabras conocidas) y menos al ucraniano, porque el texto de subtítulos está lejos de las frases de FLEURS.
- El WER en inglés es notablemente superior (17,22 con LM) que en ucraniano (9,96) y ruso (9,83), lo que refleja un rendimiento desigual entre idiomas.
- Riesgo de alucinación y errores de transcripción inherente a todo sistema ASR, especialmente con audio ruidoso, acentos no representados o vocabulario fuera de dominio.
- Sesgos potenciales derivados del corpus de entrenamiento (vídeos de YouTube de YODAS), que puede sobrerrepresentar ciertos registros, géneros y variedades dialectales.
- La extracción de características depende de un wheel binario específico para Linux x86-64 con glibc 2.34+ y Python 3.10+, lo que limita el despliegue en otras plataformas sin adaptación.
- El modelo se evaluó únicamente en FLEURS dev; FLEURS test no se utilizó, por lo que las cifras pueden no ser representativas de un conjunto de test independiente.
- No se documentan restricciones adicionales de la licencia Apache 2.0 para uso comercial más allá de las condiciones estándar de dicha licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speech-uk/w2v-bert-v4
- Modelo base w2v-bert-v3: https://huggingface.co/speech-uk/w2v-bert-v3
- Commit del tokenizer en w2v-bert-v3: https://huggingface.co/speech-uk/w2v-bert-v3/commit/33b1a488ef73e8a42ce309ccc90955d3c017f6e6
- Dataset de entrenamiento: https://huggingface.co/datasets/speech-uk/yodas-tinyasr-50h
- Dataset YODAS v3.1: https://huggingface.co/datasets/espnet/yodas3.1
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Repositorio extract-speech: https://github.com/RustedBytes/extract-speech
- Repositorio tinyasr: https://github.com/dkaraush/tinyasr
- Repositorio w2v-bert-fast: https://github.com/Wataru-Nakata/w2v-bert-fast
- Repositorio KenLM: https://github.com/kpu/kenlm
