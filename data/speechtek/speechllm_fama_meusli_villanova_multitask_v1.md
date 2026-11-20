# SpeechTek/speechllm_fama_meusli_villanova_multitask_v1

## Resumen

FAMA × MEUSLI × Villanova es un modelo de voz-lenguaje (speechLLM) desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK) que unifica reconocimiento automático del habla (ASR) y traducción de voz (speech translation) en un único modelo para el par de idiomas italiano-inglés. La tarea concreta se selecciona mediante un prompt textual, de modo que el mismo checkpoint transcribe voz en italiano o inglés y traduce voz de un idioma al otro sin necesidad de desplegar cuatro sistemas independientes.

El modelo se construye sobre tres piezas ya existentes: el codificador de voz FAMA (FBK-MT/fama-medium-asr), congelado; un proyector lineal inicializado a partir del proyector MEUSLI para Villanova-2B; y el modelo de lenguaje Villanova-2B, también congelado y adaptado mediante LoRA. El repositorio publicado contiene únicamente los 14,16 millones de parámetros entrenados (9,44 M del proyector y 4,72 M de los adaptadores LoRA); el codificador y el LLM deben descargarse por separado.

La relevancia de esta ficha es doble: por un lado, ilustra una estrategia de bajo coste computacional (solo se entrena el proyector y LoRA, con encoder y LLM congelados) sobre el framework SLAM-LLM; por otro, es un modelo muy reciente y con escasa tracción pública (0 descargas, 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | speechLLM: codificador de voz FAMA (congelado) + proyector lineal + LLM Villanova-2B (congelado, adaptado con LoRA) sobre el framework SLAM-LLM |
| Parametros totales | 14,16 M entrenados en el repositorio (proyector 9,44 M + LoRA 4,72 M); el total del sistema incluye FAMA y Villanova-2B, cuyos recuentos no se detallan en la informacion disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (context_length del LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it) e ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura sigue el patron clasico de los speechLLM: FAMA recibe caracteristicas de filterbank de 80 dimensiones con CMVN y produce representaciones de voz de 1024 dimensiones; un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560, con tasa de submuestreo 2) las alinea con el espacio de embeddings de Villanova-2B, cuya dimension es 2560. El proyector se inicializa desde MEUSLI v2 para Villanova-2B, salvo la primera capa (`encoder_projector.linear1`), que se reinicializa porque la salida de FAMA no coincide en tamano con la de Whisper large-v3-turbo, el codificador con el que se entreno MEUSLI. Sobre el LLM se aplican adaptadores LoRA con r=32, alpha=32, dropout 0,05 y modulos objetivo `q_proj` y `v_proj`. Tanto el codificador como el LLM permanecen congelados durante todo el entrenamiento.

El entrenamiento se ejecuto con `torchrun` en una unica GPU NVIDIA A100 de 64 GB de la particion Booster de CINECA Leonardo, usando un fork de SLAM-LLM, en fp16 y con DDP. Se entrenaron 3 epocas con AdamW (weight_decay 0), learning rate 1e-4 con warmup lineal de 1000 pasos, batch de 2 y acumulacion de gradientes de 2. Los datos combinan las versiones ASR y de traduccion de `large (en-it)` de Common Voice 17.0, FLEURS, MLS italiano y LibriSpeech-960, con un total de 463.992 enunciados de entrenamiento, 33.576 de validacion y 34.128 de test (sumando ambos idiomas). Los objetivos de traduccion se generaron traduciendo cada transcripcion con EuroLLM-1.7B-Instruct, y las etiquetas de entrenamiento estan en minusculas. La decodificacion usa busqueda por haces con 4 haces, maximo 200 tokens nuevos y `repetition_penalty` 1.0.

## Capacidades

- Reconocimiento automatico del habla (ASR) en italiano e ingles con un unico checkpoint.
- Traduccion de voz italiano→ingles y ingles→italiano, seleccionable por prompt.
- Seleccion de tarea mediante instrucciones textuales fijas: `"Transcribe speech to text."`, `"Translate Italian speech to English text. "` y `"Translate English speech to Italian text. "` (con espacios finales incluidos).
- Procesamiento de audio representado como filterbank de 80 dimensiones con CMVN.
- Soporte de ajuste fino posterior mediante los scripts del repositorio Villanova-Speech-LLM.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado y transcripcion bilingue en entornos italo-ingleses: el modelo transcribe audio en cualquiera de los dos idiomas con el mismo checkpoint, lo que simplifica el enrutamiento en plataformas de subtitulado que reciben contenido mixto.
- Traduccion de reuniones y conferencias: con el prompt de traduccion adecuado, convierte directamente voz italiana en texto ingles (y viceversa), evitando una cadena ASR + traduccion de texto separada.
- Atencion al cliente en centros de contacto bilingues: permite transcribir y traducir llamadas en tiempo casi real para agentes que no dominan ambos idiomas, aunque la latencia real no esta documentada.
- Generacion de subtitulos para contenido audiovisual: util para archivos de video o audio en italiano que necesitan subtitulos en ingles (o al reves) sin depender de dos modelos distintos.
- Investigacion en speechLLM: al publicar solo proyector y LoRA, sirve como ejemplo reproducible de adaptacion de sub-2B con encoder y LLM congelados sobre SLAM-LLM, util para experimentos academicos de bajo coste.
- Prototipado de asistentes de voz locales: el tamano reducido del LLM (2B) y del checkpoint entrenado (0,1 GB) facilita iterar en entornos con recursos limitados, aunque el sistema completo requiere descargar FAMA y Villanova-2B.
- Evaluacion comparativa de ASR/traduccion en italiano e ingles: los conjuntos de validacion y test (33.576 y 34.128 enunciados) permiten reproducir la evaluacion con WER normalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que se calcula WER tras eliminar puntuacion y aplicar `EnglishTextNormalizer` de Whisper para ingles y `BasicTextNormalizer` (texto truncado en la fuente), pero no incluye los valores obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el sistema completo combina FAMA (encoder de voz) y Villanova-2B (LLM de 2B parametros), por lo que se requiere espacio para ambos ademas del proyector y LoRA.
- GPU de entrenamiento documentada: una NVIDIA A100 de 64 GB (CINECA Leonardo Booster) con fp16 y DDP.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; un LLM de 2B en fp16 ocupa aproximadamente 4 GB solo en pesos, pero no se documentan requisitos agregados ni cuantizaciones soportadas.
- Opciones de despliegue: los scripts del repositorio Villanova-Speech-LLM (basados en SLAM-LLM) para decodificacion y ajuste fino; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FAMA × MEUSLI × Villanova (este) | 14,16 M entrenados (proyector + LoRA) sobre encoder FAMA + LLM 2B | 4096 | it, en | CC BY 4.0 | ASR + traduccion de voz en un solo modelo por prompt |
| Whisper large-v3-turbo | no disponible en la informacion | no disponible | multilingue | no disponible | Codificador usado para entrenar MEUSLI; no es un speechLLM con prompt de tarea |
| EuroLLM-1.7B-Instruct | 1,7 B | no disponible | multilingue | no disponible | Usado solo para generar los objetivos de traduccion del dataset de entrenamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a dos idiomas (italiano e ingles); no se documenta soporte de otros idiomas.
- El repositorio solo contiene proyector y LoRA: es imprescindible descargar FAMA y Villanova-2B por separado y respetar el orden de carga (MEUSLI antes que este checkpoint).
- Los prompts de tarea son literales y sensibles a espacios finales; un prompt mal formado puede degradar la salida.
- Las etiquetas de entrenamiento estan en minusculas, lo que puede afectar a la capitalizacion y puntuacion de las transcripciones generadas.
- Los objetivos de traduccion se generaron sinteticamente con EuroLLM-1.7B-Instruct, por lo que heredan los sesgos y errores de ese modelo.
- Riesgo de alucinacion inherente a los LLM, agravado en tareas de traduccion de voz donde el modelo puede generar texto no presente en el audio.
- No hay benchmarks publicados ni descargas registradas, lo que impide validar el rendimiento real frente a alternativas consolidadas.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero conviene verificar las licencias de los modelos base (FAMA y Villanova-2B) antes de desplegar en produccion.
- No se documentan cuantizaciones ni soporte para frameworks de inferencia de alto rendimiento, lo que limita el despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_multitask_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI v2 para Villanova-2B: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de codigo Villanova-Speech-LLM: https://github.com/vskadandale/Villanova-Speech-LLM
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
