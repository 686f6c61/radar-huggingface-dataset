# SpeechTek/speechllm_fama_meusli_villanova_asr_en_v1

## Resumen

El modelo `speechllm_fama_meusli_villanova_asr_en_v1` es un sistema de reconocimiento automático del habla (ASR) en inglés construido sobre el marco SLAM-LLM por la unidad SpeechTek de la Fondazione Bruno Kessler. Combina tres piezas congeladas: el codificador de voz FAMA (`FBK-MT/fama-medium-asr`, salida de 1024 dimensiones), un proyector lineal inicializado a partir del proyector MEUSLI v2 para Villanova-2B, y el modelo de lenguaje Villanova-2B (`VillanovaAI/Villanova-2B-2603`) adaptado mediante LoRA. Solo se entrenan 14,16 millones de parámetros: 9,44 M del proyector y 4,72 M de los adaptadores LoRA.

La relevancia del modelo está en su enfoque de eficiencia: en lugar de reentrenar un encoder o un LLM completo, congela ambos y ajusta únicamente la interfaz entre modalidades. Esto permite entrenar en una sola GPU A100 de 64 GB durante 4 épocas sobre VoxPopuli English y alcanzar un WER del 6,55 % en el conjunto de test, superando configuraciones alternativas del mismo proyecto que usan Whisper large-v3-turbo con Villanova-2B (7,09) o con EuroLLM-1.7B (6,67).

El repositorio publicado contiene únicamente el checkpoint `model.pt` (0,1 GB); el codificador FAMA, el LLM Villanova-2B y el checkpoint MEUSLI deben descargarse por separado. Está pensado para decodificación directa o para ajuste fino posterior dentro del repositorio Villanova-Speech-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM: codificador FAMA congelado + proyector lineal + LLM Villanova-2B congelado con adaptadores LoRA |
| Parametros totales | 14,16 M entrenables (9,44 M proyector + 4,72 M LoRA); el resto de componentes se descargan por separado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`context_length` en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.pt` (PyTorch); el resto de componentes en sus repositorios originales |
| Dimension del encoder | 1024 |
| Dimension del LLM | 2560 |
| Entrada de audio | filterbank de 80 dimensiones con CMVN |
| Proyector | Linear 2048→2048, ReLU, Linear 2048→2560; `ds_rate` 2 |
| LoRA | r=32, alpha=32, dropout=0,05, modulos `q_proj` y `v_proj` |
| Framework | SLAM-LLM (fork Villanova-Speech-LLM) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón clásico de speechLLM: un codificador de voz procesa características de audio y un proyector las alinea con el espacio de embeddings del modelo de lenguaje. En este caso, FAMA recibe filterbanks de 80 dimensiones con normalización CMVN y produce representaciones de 1024 dimensiones; el proyector las transforma a 2560 dimensiones (la dimensión de Villanova-2B) mediante dos capas lineales con ReLU intermedia y un factor de submuestreo de 2. El proyector se inicializa desde el checkpoint MEUSLI v2 entrenado con Whisper large-v3-turbo; dado que la primera capa de MEUSLI no coincide con el tamaño de salida de FAMA, esa capa se reinicializa y el resto se carga.

El entrenamiento congela tanto el codificador como el LLM y actualiza únicamente el proyector y los adaptadores LoRA. Se usan 4 épocas sobre VoxPopuli English (splits de entrenamiento, validación y test), con AdamW, learning rate 1e-4 con calentamiento lineal de 1000 pasos y decaimiento lineal hasta `total_steps` (1.000.000), batch de 4, acumulación de gradiente 1 y fp16. El entrenamiento se ejecutó con `torchrun` en una única GPU NVIDIA A100 de 64 GB en la partición Booster de CINECA Leonardo. Los objetivos de entrenamiento están en minúsculas y el prompt fijo es `"Transcribe English speech to text. "` (el espacio final forma parte del prompt).

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio, con salida de texto en minúsculas.
- Procesamiento de utterances largas: alrededor de 1.200 utterances del test de VoxPopuli English superan los 30 s y FAMA las procesa sin truncamiento.
- Transcripción monolingüe inglesa con normalización de texto (evaluada con `EnglishTextNormalizer` de Whisper).
- Decodificación con beam search (4 haces, máximo 200 tokens nuevos, `repetition_penalty` 1.0).
- Ajuste fino posterior sobre el proyector y los adaptadores LoRA mediante los scripts del repositorio Villanova-Speech-LLM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de actas parlamentarias y discursos políticos: VoxPopuli proviene de grabaciones del Parlamento Europeo, por lo que el modelo está ajustado al dominio de discurso formal largo, con utterances que superan los 30 s sin truncamiento.
- Subtitulado y generación de transcripciones de reuniones en inglés: el modelo produce texto en minúsculas y sin puntuación garantizada, adecuado para pipelines que aplican su propia normalización posterior.
- Preprocesado de corpus de voz para entrenamiento de otros modelos: transcripción masiva de audio inglés con un coste de inferencia reducido al mantener congelados encoder y LLM.
- Investigación en speechLLMs: el checkpoint sirve como punto de partida reproducible para estudiar el efecto del proyector y de LoRA en ASR, con hiperparámetros y scripts publicados.
- Ajuste fino a dominios específicos: al entrenar solo 14,16 M de parámetros, es viable adaptar el modelo a jerga técnica o acentos concretos con recursos limitados.
- Evaluación comparativa de encoders de voz: al permitir intercambiar el codificador manteniendo el LLM, facilita experimentos controlados sobre calidad de representación acústica.
- Despliegue en entornos con restricciones de memoria: el checkpoint entrenable ocupa 0,1 GB y el resto de componentes puede cargarse por separado, lo que simplifica la gestión de versiones.

## Benchmarks y rendimiento

| Conjunto de test | Metrica | Resultado |
|---|---|---|
| VoxPopuli English (test, 1.842 utterances) | WER % | 6,55 |

Comparaciones reportadas por el autor dentro del mismo proyecto:

| Configuracion | WER % (VoxPopuli English test) |
|---|---|
| FAMA + MEUSLI + Villanova-2B (este modelo) | 6,55 |
| Whisper large-v3-turbo + Villanova-2B | 7,09 |
| Whisper large-v3-turbo + EuroLLM-1.7B | 6,67 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una A100 de 64 GB con fp16, batch 4 y el LLM congelado.
- GPU recomendadas: NVIDIA A100 64 GB (configuración de entrenamiento documentada); para inferencia, el requisito depende del LLM Villanova-2B y del codificador FAMA, que se cargan por separado.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el tamaño del LLM (2B) y del codificador condiciona la viabilidad, pero no hay datos publicados de VRAM ni de cuantización.
- Opciones de despliegue: scripts de SLAM-LLM del repositorio Villanova-Speech-LLM (decodificación y ajuste fino); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el checkpoint entrenable ocupa 0,1 GB; hay que sumar los pesos de FAMA, Villanova-2B y MEUSLI descargados aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER VoxPopuli EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAMA + MEUSLI + Villanova-2B (este) | 14,16 M entrenables + encoder y LLM congelados | 4096 tokens | 6,55 | CC BY 4.0 | Hugging Face (checkpoint) + repo GitHub |
| Whisper large-v3-turbo + Villanova-2B | no disponible | no disponible | 7,09 | no disponible en la informacion | configuración del mismo proyecto |
| Whisper large-v3-turbo + EuroLLM-1.7B | no disponible | no disponible | 6,67 | no disponible en la informacion | configuración del mismo proyecto |
| Whisper large-v3-turbo (ASR estándar) | 809 M | 30 s por ventana | no reportado en esta ficha | MIT (según el modelo original) | Hugging Face |

Las dos alternativas comparadas son configuraciones del mismo proyecto de investigación y no modelos publicados de forma independiente; los datos de parámetros, contexto y licencia de esas configuraciones no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sin guarda de repetición en la decodificación: algunas utterances pueden entrar en bucle hasta el límite de 200 tokens; en datos fuera de dominio afecta a más utterances. Se recomienda añadir `no_repeat_ngram_size`, una `repetition_penalty` moderada o un límite de longitud ligado a la duración del audio.
- Una sola ejecución de entrenamiento por configuración: diferencias inferiores a 0,5 en WER o BLEU están dentro de la variación entre ejecuciones.
- Solo inglés: no se documenta soporte multilingüe, pese a que la evaluación menciona normalización con `BasicTextNormalizer` para italiano.
- Dominio limitado: entrenado exclusivamente con VoxPopuli English (discurso parlamentario), por lo que el rendimiento en otros dominios (conversación espontánea, acentos no representados, audio ruidoso) no está evaluado.
- Salida en minúsculas y sin garantía de puntuación; requiere postprocesado para aplicaciones que necesiten texto formateado.
- Riesgo de alucinación inherente a la decodificación de un LLM: el modelo puede generar texto no presente en el audio, especialmente en segmentos con ruido o silencio.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero hay que verificar las licencias de los componentes descargados por separado (FAMA, Villanova-2B, MEUSLI).
- El repositorio solo contiene el checkpoint entrenable; la reproducibilidad depende de descargar correctamente los tres componentes base y de respetar el prompt exacto con espacio final.
- Sin datos publicados de cuantización, latencia ni consumo de VRAM en inferencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_asr_en_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI v2: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de código Villanova-Speech-LLM: https://github.com/vskadandale/Villanova-Speech-LLM
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Paper de SLAM-LLM: citado en la model card como `ma2026slam` (SLAM-LLM: A Modular, Open...); no se proporciona URL directa en la información disponible.
