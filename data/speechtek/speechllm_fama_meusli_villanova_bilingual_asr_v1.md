# SpeechTek/speechllm_fama_meusli_villanova_bilingual_asr_v1

## Resumen

SpeechTek/speechllm_fama_meusli_villanova_bilingual_asr_v1 es un modelo speechLLM para reconocimiento automático de voz (ASR) bilingüe italiano-inglés, desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). El modelo combina tres componentes congelados: el encoder de voz FAMA (FBK-MT/fama-medium-asr), un proyector lineal inicializado a partir del proyector MEUSLI v2 para Villanova-2B, y el modelo de lenguaje Villanova-2B adaptado mediante LoRA. El repositorio contiene únicamente los 14,16 millones de parámetros entrenados: el proyector (9,44 M) y los adaptadores LoRA (4,72 M); el encoder y el LLM deben descargarse por separado.

El problema que resuelve es la transcripción de voz en un único modelo para dos idiomas (italiano e inglés), evitando mantener dos sistemas ASR separados. Se enmarca en el framework SLAM-LLM, con un fork específico (Villanova-Speech-LLM) que permite entrenar y decodificar el modelo. El prompt de entrenamiento e inferencia es fijo: `"Transcribe speech to text."`.

Es relevante ahora porque demuestra una estrategia de bajo coste computacional: solo se entrenan proyector y LoRA sobre componentes congelados, con 463.992 utterances de entrenamiento en total y un único A100 de 64 GB. El checkpoint es pequeño (0,1 GB), lo que facilita su distribución y despliegue, aunque requiere descargar los pesos del encoder FAMA y del LLM Villanova-2B para funcionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechLLM: encoder de voz FAMA (congelado) + proyector lineal + LLM Villanova-2B (congelado, adaptado con LoRA) |
| Parámetros totales | 14,16 M entrenados en este checkpoint (proyector 9,44 M + LoRA 4,72 M); encoder y LLM se descargaron congelados aparte |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (context_length del LLM) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; pesos en `model.pt`) |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`); encoder y LLM se descargarían por separado desde sus repositorios |
| Dimensión del encoder | 1024 |
| Dimensión del LLM | 2560 |
| Entrada de audio | filterbank mel de 80 dimensiones con CMVN |
| Proyector | Linear 2048→2048, ReLU, Linear 2048→2560; `encoder_projector_ds_rate` = 2 |
| LoRA | r=32, alpha=32, dropout=0,05; módulos `q_proj`, `v_proj` |
| Librería | pytorch |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un speechLLM del framework SLAM-LLM. El encoder FAMA recibe features de filterbank de 80 dimensiones con CMVN y produce representaciones de dimensión 1024. Un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560) con factor de downsample 2 mapea esas representaciones al espacio del LLM Villanova-2B (dim 2560, contexto 4096). El proyector se inicializa desde MEUSLI_projector_v2_Villanova_2B, entrenado originalmente con Whisper large-v3-turbo; como la primera capa de MEUSLI no coincide con la salida de FAMA, esa capa (`encoder_projector.linear1`) se reinicializa y el resto se carga. El LLM se adapta con LoRA (r=32, alpha=32, dropout 0,05) sobre `q_proj` y `v_proj`. Encoder y LLM permanecen congelados; solo proyector y LoRA se entrenan.

El entrenamiento se realizó con `torchrun` en una única GPU NVIDIA A100 de 64 GB (partición Booster de CINECA Leonardo), usando el fork Villanova-Speech-LLM de SLAM-LLM. El dataset `large (en-it)` es un conjunto balanceado italiano-inglés construido a partir de tres fuentes por idioma, recortando el inglés al número de muestras del italiano: Common Voice 17.0 (169.771 utterances de entrenamiento), FLEURS (2.602), MLS Italian / LibriSpeech-960 (59.623), totalizando 463.992 utterances de entrenamiento, 33.576 de validación y 34.128 de test entre ambos idiomas. Hiperparámetros: AdamW con weight_decay 0, learning rate 1e-4 con warmup lineal de 1000 pasos y decay lineal hasta `total_steps`, 1.000.000 pasos totales, batch size 4, gradient accumulation 1, fp16 activado, 4 epochs. Las transcripciones objetivo están en minúsculas. La decodificación usa beam search con 4 haces, máximo 200 tokens nuevos y repetition_penalty 1,0.

## Capacidades

- Reconocimiento automático de voz bilingüe italiano-inglés en un único modelo, con prompt fijo `"Transcribe speech to text."`.
- Transcripción de audio con features de filterbank mel de 80 dimensiones (no acepta audio en bruto directamente; requiere el frontend de features del pipeline).
- Entrada de audio con representaciones de 1024 dimensiones proyectadas al espacio del LLM de 2560 dimensiones.
- Decodificación por beam search (4 haces) con hasta 200 tokens nuevos por utterance.
- Capacidad de fine-tuning adicional: el checkpoint puede usarse para seguir entrenando proyector y LoRA con los scripts del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de entrada directa al LLM ni modo thinking; no disponibles en la información proporcionada.
- Capacidades multilingües limitadas a italiano e inglés.

## Casos de uso

- Transcripción bilingüe de reuniones y llamadas: el modelo gestiona audio en italiano e inglés con un único checkpoint, útil en entornos corporativos multilingües donde no se quiere mantener dos pipelines ASR separados.
- Subtitulado automático de contenido audiovisual: con contexto de 4096 tokens y beam search de 4 haces, se puede transcribir audio por segmentos y generar subtítulos en italiano o inglés para vídeo.
- Atención al cliente automatizada: transcripción de llamadas de soporte en italiano e inglés como paso previo a análisis de sentimiento o enrutamiento, usando el modelo como componente ASR dentro de un pipeline mayor.
- Generación de actas y notas de voz: transcripción de grabaciones de voz en entornos de productividad, con la ventaja de un checkpoint de solo 0,1 GB que reduce el coste de almacenamiento y distribución.
- Investigación en speechLLM: el modelo sirve como base reproducible para estudiar estrategias de congelación de encoder y LLM con adaptación LoRA y proyector lineal, dado que el repositorio publica scripts de entrenamiento y decodificación.
- Evaluación comparativa de ASR en italiano: con WER de 7,09 % en Common Voice 17.0 italiano, puede usarse como referencia en benchmarks de ASR italiano dentro de proyectos académicos.
- Fine-tuning sobre dominios específicos: al entrenarse solo proyector y LoRA, es viable adaptar el modelo a jerga médica, legal o técnica en italiano o inglés con recursos computacionales modestos.

## Benchmarks y rendimiento

Resultados publicados por el autor (WER calculado tras eliminar puntuación y aplicar EnglishTextNormalizer de Whisper para inglés y BasicTextNormalizer para italiano; decodificación con beam search de 4 haces):

| Conjunto de test | Métrica | Resultado |
|---|---|---|
| large (en-it) test, parte italiana | WER % | 8,45 |
| large (en-it) test, parte inglesa | WER % | 11,94 |
| large (en-it) test, pooled | WER % | 10,08 |
| Common Voice 17.0 italiano (test) | WER % | 7,09 |
| VoxPopuli inglés (test; fuera de los datos de entrenamiento) | WER % | 10,12 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El entrenamiento usó una única A100 de 64 GB con fp16, batch size 4 y componentes congelados; la inferencia requeriría cargar encoder FAMA y LLM Villanova-2B además del checkpoint de 0,1 GB.
- GPU recomendadas: NVIDIA A100 de 64 GB para entrenamiento (configuración documentada); para inferencia no se especifica, pero el LLM de 2B con contexto 4096 y fp16 sugiere GPUs con al menos 16-24 GB de VRAM, dato no confirmado por el autor.
- Cabe en consumer GPU: no confirmado en la información disponible; el LLM de 2B podría caber en GPUs consumer de gama alta, pero el autor no documenta requisitos de VRAM de inferencia.
- Opciones de despliegue: el autor documenta decodificación mediante los scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM); no se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos alternativos en la información proporcionada. Los componentes base (FAMA y Villanova-2B) tienen sus propios repositorios, pero no se han publicado comparativas directas en la model card de este checkpoint.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| speechllm_fama_meusli_villanova_bilingual_asr_v1 | 14,16 M entrenados (proyector + LoRA); encoder y LLM congelados aparte | 4096 | it, en | CC BY 4.0 | Hugging Face (checkpoint de 0,1 GB) |
| FBK-MT/fama-medium-asr | no disponible | no disponible | no disponible | no disponible | Hugging Face (componente base) |
| VillanovaAI/Villanova-2B-2603 | 2B (según nombre) | 4096 (context_length de entrenamiento) | no disponible | no disponible | Hugging Face (componente base) |
| SpeechTek/MEUSLI_projector_v2_Villanova_2B | no disponible | no disponible | no disponible | no disponible | Hugging Face (componente base) |

## Limitaciones y advertencias

- La decodificación no tiene guarda contra repeticiones: algunas utterances por conjunto de test pueden entrar en bucle hasta el límite de 200 tokens; en datos fuera de dominio afecta a más utterances. Se recomienda añadir `no_repeat_ngram_size`, un `repetition_penalty` moderado o un límite de longitud ligado a la duración del audio.
- Solo se realizó una ejecución de entrenamiento por configuración; diferencias por debajo de aproximadamente 0,5 WER/BLEU no deben interpretarse como significativas (la model card se corta en este punto).
- Cobertura limitada a italiano e inglés; no se documentan otros idiomas.
- El modelo no acepta audio en bruto: requiere el frontend de features de filterbank mel de 80 dimensiones con CMVN.
- El checkpoint contiene solo proyector y LoRA; para usarlo hay que descargar por separado FAMA, Villanova-2B y MEUSLI, lo que añade pasos de configuración y dependencias.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos usados como decodificador ASR; no se documentan sesgos específicos.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las licencias de los componentes base (FAMA, Villanova-2B, MEUSLI), que no se detallan en la información disponible.
- El prompt está fijado en `"Transcribe speech to text."`; usos con otros prompts no están validados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_bilingual_asr_v1
- Encoder base FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM base Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI v2 para Villanova-2B: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de código Villanova-Speech-LLM: https://github.com/vskadandale/Villanova-Speech-LLM
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
