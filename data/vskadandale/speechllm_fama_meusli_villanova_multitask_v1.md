# vskadandale/speechllm_fama_meusli_villanova_multitask_v1

## Resumen

FAMA × MEUSLI × Villanova es un speechLLM bilingüe italiano-inglés desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Resuelve en un único modelo dos tareas clásicamente separadas: reconocimiento automático del habla (ASR) en italiano e inglés, y traducción de voz italiano→inglés e inglés→italiano. La tarea concreta se selecciona mediante el prompt de entrada, lo que permite reutilizar el mismo checkpoint para cuatro flujos distintos sin cambiar de modelo.

La arquitectura sigue el paradigma SLAM-LLM: un encoder de voz congelado (FAMA-medium-asr, 1024 dimensiones de salida), un proyector lineal entrenable que adapta la representación acústica al espacio del LLM, y un modelo de lenguaje congelado (Villanova-2B, 2560 dimensiones) adaptado mediante adaptadores LoRA. El repositorio publicado contiene únicamente los 14,16 M de parámetros entrenados (9,44 M del proyector y 4,72 M de LoRA); el encoder y el LLM se descargan por separado.

Su relevancia radica en la eficiencia del enfoque: con solo 14,16 M de parámetros entrenables sobre infraestructura modesta (una A100 de 64 GB) se obtiene un sistema multitarea de voz para un par de idiomas, con licencia CC BY 4.0 y pesos en formato PyTorch (`model.pt`). Es un caso práctico de adaptación parameter-efficient de un LLM de texto a modalidad voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM (encoder de voz congelado + proyector lineal + LLM congelado con LoRA), framework SLAM-LLM |
| Parametros totales | 14,16 M entrenables (9,44 M proyector + 4,72 M LoRA); encoder y LLM congelados y descargados aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (context_length del LLM) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en fp16) |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |
| Encoder de voz | FBK-MT/fama-medium-asr (congelado, salida 1024 dim) |
| Modelo de lenguaje | VillanovaAI/Villanova-2B-2603 (congelado, dim 2560, adaptado con LoRA) |
| Entrada de audio | filterbank de 80 dimensiones con CMVN, downsampling rate 2 |
| LoRA | r=32, alpha=32, dropout=0.05, módulos q_proj y v_proj |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un speechLLM de tres componentes. El encoder FAMA-medium-asr procesa características de filterbank de 80 dimensiones con normalización CMVN y produce representaciones de 1024 dimensiones. Un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560) con factor de downsampling 2 proyecta esas representaciones al espacio de 2560 dimensiones de Villanova-2B. El proyector se inicializa desde el checkpoint MEUSLI v2 para Villanova-2B; dado que MEUSLI se entrenó con Whisper large-v3-turbo y su primera capa no coincide con el tamaño de salida de FAMA, esa primera capa se reinicializa y el resto se carga. Sobre el LLM se aplican adaptadores LoRA en `q_proj` y `v_proj`. Encoder y LLM permanecen congelados durante todo el entrenamiento.

El entrenamiento se realizó con `torchrun` sobre una única GPU NVIDIA A100 de 64 GB en la partición Booster de CINECA Leonardo, usando un fork de SLAM-LLM. Se combinaron las versiones ASR y de traducción del split `large (en-it)`; las dianas de traducción se generaron traduciendo cada transcripción con EuroLLM-1.7B-Instruct. El conjunto suma 463.992 utterances de entrenamiento, 33.576 de validación y 34.128 de test, procedentes de Common Voice 17.0, FLEURS, MLS Italian y LibriSpeech-960. Hiperparámetros destacados: 3 épocas, learning rate 1e-4 con warmup lineal de 1.000 pasos, AdamW sin weight decay, batch de 2 con acumulación de gradiente de 2, fp16 y DDP. Las dianas de entrenamiento están en minúsculas. La decodificación usa búsqueda por haz con 4 haces, máximo 200 tokens nuevos y `repetition_penalty` de 1.0. El prompt selecciona la tarea: `"Transcribe speech to text."` para ASR, `"Translate Italian speech to English text. "` y `"Translate English speech to Italian text. "` para traducción (con espacio final incluido).

## Capacidades

- Reconocimiento automático del habla en italiano e inglés con un único checkpoint.
- Traducción de voz italiano→inglés e inglés→italiano, seleccionable por prompt.
- Selección de tarea mediante prompt textual, sin cambiar de modelo ni de pesos.
- Procesamiento de audio en formato filterbank de 80 dimensiones con CMVN.
- Decodificación por haz configurable (4 haces por defecto, hasta 200 tokens nuevos).
- Adaptación parameter-efficient: solo se entrenan proyector y LoRA, lo que facilita el reentrenamiento sobre el mismo esqueleto.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado automático bilingüe italiano-inglés: el modelo transcribe audio en cualquiera de los dos idiomas con el prompt de ASR, adecuado para generar subtítulos en contenido audiovisual con mezcla de hablantes italianos e ingleses.
- Traducción de reuniones y conferencias: con los prompts de traducción se puede convertir voz italiana en texto inglés (o viceversa) en un solo paso, sin pipeline ASR + traducción separado, reduciendo latencia y propagación de errores.
- Atención al cliente en centros de contacto bilingües: transcripción y traducción de llamadas entre agentes italianos y clientes angloparlantes, con un único modelo desplegado.
- Generación de transcripciones para subtitulado y postproducción: el modo ASR produce texto en minúsculas y sin puntuación normalizada, útil como base para herramientas posteriores de formateo.
- Investigación en speechLLMs: al publicarse solo proyector y LoRA (14,16 M de parámetros), sirve como punto de partida reproducible para estudiar adaptación parameter-efficient de LLMs de texto a voz con el framework SLAM-LLM.
- Prototipado de asistentes de voz locales: al combinar un encoder y un LLM de 2B congelados, el coste de ajuste es bajo y permite iterar sobre dominios concretos (legal, sanitario, turismo) reentrenando únicamente el proyector y los adaptadores.
- Evaluación comparativa de encoders de voz: al estar construido sobre FAMA con un proyector inicializado desde MEUSLI, permite aislar el efecto del encoder en tareas de ASR y traducción bajo el mismo LLM.

## Benchmarks y rendimiento

La model card describe la metodología de evaluación (WER tras eliminar puntuación y aplicar `EnglishTextNormalizer` de Whisper para inglés y `BasicTextNormalizer` para italiano), pero el texto proporcionado se interrumpe antes de incluir los resultados numéricos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio contiene solo 0,1 GB (proyector + LoRA). Para inferencia hay que descargar además FAMA-medium-asr y Villanova-2B, cuyos pesos no están incluidos en este repositorio.
- Entrenamiento validado en una única NVIDIA A100 de 64 GB (CINECA Leonardo Booster). El uso de fp16 y batch pequeño (2 con acumulación 2) sugiere que el entrenamiento cabe en GPUs de gama alta con suficiente VRAM para el LLM de 2B en fp16.
- VRAM estimada para inferencia: no disponible de forma explícita; depende del encoder FAMA y de Villanova-2B en fp16, más el proyector (14,16 M de parámetros, despreciable).
- GPU recomendadas: A100 64 GB (validada para entrenamiento). Para inferencia, GPUs con VRAM suficiente para un LLM de 2B en fp16; no se documentan pruebas en RTX 4090 u otras consumer.
- Despliegue: los scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM) para decodificación y fine-tuning. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FAMA × MEUSLI × Villanova (este) | 14,16 M entrenables (encoder + LLM congelados) | 4096 | it, en | CC BY 4.0 | ASR + traducción de voz en un solo modelo, selección por prompt |
| Whisper large-v3-turbo | no disponible en la información | no disponible | multilingüe | no disponible en la información | Encoder usado para entrenar el proyector MEUSLI original; no es un speechLLM multitarea por prompt |
| FBK-MT/fama-medium-asr | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Encoder de voz base de este modelo; solo ASR |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre italiano e inglés; no hay soporte documentado para otras lenguas.
- El repositorio no incluye el encoder ni el LLM: requiere descargar FAMA-medium-asr y Villanova-2B por separado, y cargar MEUSLI antes que este checkpoint, lo que complica el despliegue.
- Las dianas de entrenamiento están en minúsculas y sin normalización de puntuación en la salida; puede requerir postproceso para texto presentable.
- Las dianas de traducción se generaron automáticamente con EuroLLM-1.7B-Instruct, por lo que hereda los sesgos y errores de ese modelo en la tarea de traducción.
- El prompt de tarea es sensible al formato exacto, incluidos los espacios finales; un prompt mal formado puede producir salidas incorrectas.
- Riesgo de alucinación inherente al componente LLM, especialmente en audio ruidoso o fuera de dominio.
- Sin datos publicados de benchmarks en la información disponible, por lo que no se puede verificar su calidad frente a alternativas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar las licencias de los modelos base (FAMA, Villanova-2B) antes de producción.
- No se documentan mecanismos de seguridad, filtrado ni mitigación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vskadandale/speechllm_fama_meusli_villanova_multitask_v1
- Repositorio de código: https://github.com/vskadandale/Villanova-Speech-LLM
- Encoder base FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM base Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
