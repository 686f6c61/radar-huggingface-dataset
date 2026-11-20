# vskadandale/speechllm_fama_meusli_villanova_asr_en_v1

## Resumen

SpeechLLM FAMA × MEUSLI × Villanova es un modelo de reconocimiento automático del habla (ASR) en inglés construido sobre el framework SLAM-LLM y desarrollado por la unidad SpeechTek de Fondazione Bruno Kessler. Combina tres piezas congeladas: el codificador de voz FAMA-medium-asr, un proyector lineal inicializado desde el proyector MEUSLI v2 para Villanova-2B y el modelo de lenguaje Villanova-2B adaptado mediante LoRA. El repositorio solo contiene los 14,16 millones de parámetros entrenados (9,44 M del proyector y 4,72 M de los adaptadores LoRA); el codificador y el LLM se descargan por separado.

El modelo resuelve la transcripción de voz a texto en inglés con una ventana de contexto de 4096 tokens y un codificador que procesa directamente utterances de más de 30 segundos sin truncamiento, algo relevante porque aproximadamente 1.200 de las utterances del conjunto de test de VoxPopuli English superan esa duración. Sobre el test de VoxPopuli English (1.842 utterances) alcanza un WER del 6,55 %, el mejor resultado entre las configuraciones probadas en el proyecto, por delante de Whisper large-v3-turbo con Villanova-2B (7,09) y con EuroLLM-1.7B (6,67).

Es relevante ahora porque demuestra que un esquema de encoder congelado más proyector y LoRA sobre un LLM pequeño puede superar a alternativas basadas en Whisper en ASR en inglés, con un coste de entrenamiento muy contenido: una única GPU A100 de 64 GB durante 4 épocas. La licencia CC BY 4.0 facilita su reutilización, aunque el modelo está pensado como checkpoint de investigación y requiere el código del repositorio Villanova-Speech-LLM para su explotación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechLLM: codificador de voz FAMA + proyector lineal + LLM Villanova-2B con LoRA (encoder y LLM congelados) |
| Parámetros totales | 14,16 M entrenados (9,44 M proyector + 4,72 M LoRA); el LLM y el encoder se descargan aparte |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (LLM); codificador sin truncamiento en utterances de más de 30 s |
| Tipos de cuantización | no disponible (checkpoint en FP16 para entrenamiento e inferencia) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de speechLLM de SLAM-LLM: el codificador FAMA-medium-asr (dimensión 1024) recibe características de filterbank de 80 dimensiones con CMVN y produce representaciones que un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560, con un factor de downsampling de 2) alinea con el espacio de embeddings del LLM Villanova-2B (dimensión 2560). El proyector se inicializa desde MEUSLI_projector_v2_Villanova_2B, entrenado originalmente con Whisper large-v3-turbo; como la primera capa no coincide con el tamaño de salida de FAMA, esa capa se reinicializa y el resto se carga desde MEUSLI. El LLM se adapta con LoRA (r=32, alpha=32, dropout=0,05) sobre `q_proj` y `v_proj`. Tanto el encoder como el LLM permanecen congelados durante todo el entrenamiento.

El entrenamiento se realizó con `torchrun` en una única GPU NVIDIA A100 de 64 GB de la partición Booster de CINECA Leonardo, usando un fork de SLAM-LLM (Villanova-Speech-LLM). Los datos son los splits de train, validation y test de VoxPopuli English, con objetivos en minúsculas. Se usaron 4 épocas, learning rate 1e-4 con warmup lineal de 1.000 pasos y decaimiento lineal hasta `total_steps` (1.000.000), optimizador AdamW sin weight decay, batch de 4, fp16 y DDP. La decodificación es beam search con 4 haces, máximo 200 tokens nuevos y `repetition_penalty` de 1.0. El prompt de entrenamiento e inferencia es `"Transcribe English speech to text. "`, con el espacio final obligatorio.

## Capacidades

- Transcripción de voz a texto en inglés (ASR monolingüe) a partir de audio codificado como filterbank de 80 dimensiones.
- Procesamiento de utterances largas: el codificador FAMA maneja sin truncamiento audios de más de 30 segundos, cubriendo unas 1.200 utterances del test de VoxPopuli English.
- Decodificación con beam search (4 haces) y control del número máximo de tokens generados.
- Adaptación mediante LoRA sobre el LLM, lo que permite reentrenar solo 14,16 M de parámetros para ajustar el modelo a nuevos dominios.
- No soporta tool calling, function calling, agentes, visión, audio de entrada directa al LLM ni modo thinking: es un modelo puramente ASR.
- Capacidad multilingüe limitada al inglés; la model card menciona una normalización BasicTextNormalizer para italiano en la evaluación, pero el modelo está entrenado y etiquetado solo para inglés.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa utterances de más de 30 segundos sin truncar, lo que permite transcribir intervenciones largas en una sola pasada con beam search de 4 haces.
- Subtitulado de contenido audiovisual en inglés: al trabajar sobre VoxPopuli (discurso parlamentario), es adecuado para dominios de habla formal y con ruido moderado, con normalización de texto posterior.
- Generación de corpus de texto para entrenamiento de otros modelos: la licencia CC BY 4.0 permite reutilizar las transcripciones generadas en pipelines de datos.
- Investigación en speechLLM: sirve como punto de partida para experimentar con el esquema encoder congelado + proyector + LoRA, reentrenando solo 14,16 M de parámetros.
- Ajuste fino a dominios específicos: el repositorio Villanova-Speech-LLM incluye scripts de finetuning (`scripts/asr/monolingual/finetune_fama_meusli_vnova_en.sh`) para adaptar el modelo a jerga técnica o acentos concretos.
- Evaluación comparativa de codificadores de voz: al sustituir el codificador (FAMA frente a Whisper large-v3-turbo) manteniendo el LLM, permite aislar el efecto del encoder en el WER.
- Prototipado de asistentes de voz en inglés: con un LLM de 2B y contexto de 4096 tokens, el coste de inferencia es inferior al de modelos ASR de mayor tamaño, aunque requiere validación adicional por el riesgo de bucles de decodificación.

## Benchmarks y rendimiento

| Conjunto de test | Métrica | Resultado |
|---|---|---|
| VoxPopuli English (test, 1.842 utterances) | WER % | 6,55 |

Comparativas reportadas en la model card para el mismo conjunto:

| Configuración | WER % |
|---|---|
| FAMA + MEUSLI + Villanova-2B (este modelo) | 6,55 |
| Whisper large-v3-turbo + EuroLLM-1.7B | 6,67 |
| Whisper large-v3-turbo + Villanova-2B | 7,09 |

El WER se calcula tras eliminar la puntuación y aplicar el EnglishTextNormalizer de Whisper, con beam search de tamaño 4.

## Requisitos de hardware

- Entrenamiento: una única NVIDIA A100 de 64 GB (partición Booster de CINECA Leonardo), con fp16 y DDP; el checkpoint resultante ocupa 0,1 GB.
- Inferencia: no se publican cifras de VRAM; al tratarse de un LLM de 2B con encoder FAMA congelado, se requiere cargar ambos modelos completos además del checkpoint de 14,16 M de parámetros.
- GPU recomendadas: A100 o H100 para entrenamiento; para inferencia, GPU con suficiente memoria para el LLM de 2B y el encoder (no se especifica el mínimo).
- No se confirma que quepa en GPU de consumo (RTX 4090, etc.); no disponible.
- Opciones de despliegue: los scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM) con `torchrun`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER VoxPopuli EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAMA + MEUSLI + Villanova-2B | 14,16 M entrenados + encoder FAMA + LLM 2B | 4096 tokens | 6,55 % | CC BY 4.0 | Hugging Face (checkpoint) + GitHub |
| Whisper large-v3-turbo + Villanova-2B | Whisper large-v3-turbo + LLM 2B | no disponible | 7,09 % | no disponible | configuración del proyecto |
| Whisper large-v3-turbo + EuroLLM-1.7B | Whisper large-v3-turbo + LLM 1,7B | no disponible | 6,67 % | no disponible | configuración del proyecto |

No se dispone de datos de benchmarks frente a modelos ASR comerciales o de referencia (Whisper large-v3, etc.) en la información proporcionada.

## Limitaciones y advertencias

- La decodificación no incluye guarda de repetición: algunas utterances del test pueden entrar en bucle hasta el límite de 200 tokens, y en datos fuera de dominio afecta a más utterances. Se recomienda añadir `no_repeat_ngram_size`, un `repetition_penalty` moderado o un límite de longitud ligado al audio.
- Solo se realizó una ejecución de entrenamiento por configuración; diferencias inferiores a 0,5 en WER/BLEU están dentro de la variación entre ejecuciones.
- Modelo monolingüe en inglés; no cubre otros idiomas.
- Riesgo de alucinación inherente al componente LLM, especialmente en audio ruidoso o fuera de dominio.
- El prompt `"Transcribe English speech to text. "` debe incluir el espacio final; un prompt distinto puede degradar el rendimiento.
- Requiere descargar por separado el encoder FAMA, el LLM Villanova-2B y el checkpoint MEUSLI, además del código del repositorio; no es un modelo autónomo de un solo archivo.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero no se documentan garantías ni soporte.
- Sin datos publicados de sesgos demográficos o acústicos; VoxPopuli es discurso parlamentario, por lo que el dominio está sesgado hacia habla formal.

## Enlaces

- Hugging Face: https://huggingface.co/vskadandale/speechllm_fama_meusli_villanova_asr_en_v1
- Código: https://github.com/vskadandale/Villanova-Speech-LLM
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Dataset: https://huggingface.co/datasets/facebook/voxpopuli
