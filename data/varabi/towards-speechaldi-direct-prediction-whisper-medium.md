# VARabi/towards-speechaldi-direct-prediction-whisper-medium

## Resumen

El modelo `VARabi/towards-speechaldi-direct-prediction-whisper-medium` es un ajuste fino del encoder de OpenAI Whisper Medium diseñado para predecir directamente el Arabic Level of Dialectness (ALDi) a partir de audio en bruto, sin necesidad de una transcripción intermedia mediante ASR. Lo desarrolla el autor identificado como VARabi (Wageeh Khadawardi y colaboradores, segun la cita del paper), en el marco de un trabajo presentado en el Fourth Arabic Natural Language Processing Conference (ArabicNLP 2026). El problema que resuelve es la estimacion del grado de dialectalidad del arabe hablado: el modelo devuelve una puntuacion continua entre 0.0 (arabe estandar moderno puro) y 1.0 (dialecto coloquial intenso).

La relevancia de este modelo radica en que es, segun la propia model card, el primer paso hacia la extension del ALDi a la modalidad de habla, evitando el enfoque en cascada (ASR + modelo de ALDi textual) y prediciendo la puntuacion de forma directa desde las representaciones acusticas. La arquitectura reutiliza el encoder de Whisper Medium (transformer, 1024 dimensiones ocultas) y anade una cabeza de regresion ligera compuesta por LayerNorm, Dropout(0.1) y una capa Linear(1024→1). El modelo se entrena de extremo a extremo con perdida MSE sobre el dataset SADA22, aproximadamente 420 horas de arabe saudí.

Se trata de un modelo de nicho, orientado a investigacion y a tareas de analisis linguistico y dialectologia computacional, no a generacion de texto ni a ASR general. Su licencia Apache 2.0 y su tamano (repo de 1.2 GB) lo hacen facil de desplegar en entornos de investigacion con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper Medium (transformer) + cabeza de regresion (LayerNorm → Dropout(0.1) → Linear(1024→1)) |
| Parametros totales | no disponible (el repo pesa 1.2 GB; el checkpoint es `checkpoint_epoch5.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (ventana nativa de Whisper); audio mas largo debe segmentarse |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), entrenado exclusivamente con arabe saudí (SADA22) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte del encoder de `openai/whisper-medium`, un transformer con `d_model = 1024`. Sobre las representaciones del encoder se aplica un pooling medio enmascarado (la mascara de atencion se reduce con interpolacion `nearest` para alinearla con la longitud de salida del encoder) y, a continuacion, la cabeza de regresion `LayerNorm → Dropout(0.1) → Linear(1024→1)`. La salida es una puntuacion escalar sin sigmoide, es decir, un valor continuo que idealmente cae en el rango [0, 1] pero que no esta acotado por construccion.

El entrenamiento es de extremo a extremo con perdida MSE sobre el dataset SADA22, que contiene aproximadamente 420 horas de arabe saudí. La model card indica que la clase `WhisperALDiRegressor` permite congelar el encoder mediante el parametro `freeze_encoder`, aunque no se especifica en la informacion disponible si el checkpoint publicado se entreno con el encoder congelado o completo. No se detalla el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a una tarea de regresion). La innovacion tecnica destacable es la prediccion directa desde audio, en contraste con el enfoque en cascada que requiere ASR intermedio.

## Capacidades

- Prediccion de una puntuacion continua de dialectalidad (ALDi) en el rango [0.0, 1.0] a partir de audio en bruto.
- Discriminacion entre arabe estandar moderno (MSA/Fuṣḥā), registros mixtos y dialecto coloquial intenso.
- Procesamiento de audio en cualquier formato soportado por `torchaudio` (WAV, FLAC, MP3, etc.), con remuestreo interno a 16 kHz.
- Manejo de audio de hasta 30 segundos por ventana; para archivos mas largos se recomienda segmentar y promediar las puntuaciones.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes.
- No soporta vision ni audio mas alla de la tarea de regresion descrita.
- Capacidad multilingue limitada al arabe (y, dentro de este, calibrada principalmente para arabe saudí).

## Casos de uso

- Analisis dialectologico a gran escala: procesar corpus de audio en arabe para cuantificar el grado de dialectalidad de cada emision y estudiar la distribucion de registros en un conjunto de grabaciones, sin necesidad de transcribir primero.
- Filtrado y curacion de datasets de habla: clasificar grabaciones por nivel de dialectalidad para construir corpus de MSA o de dialecto con criterios controlados, usando la puntuacion ALDi como umbral.
- Investigacion en sociolinguistica: comparar el grado de dialectalidad entre hablantes, regiones o registros (formal frente a informal) a partir de la puntuacion continua, aprovechando que el modelo evita el sesgo del ASR intermedio.
- Evaluacion de sistemas TTS y ASR: medir si un sistema de sintesis genera habla mas cercana al MSA o al dialecto, o si un transcriptor rinde mejor en funcion del nivel de dialectalidad de la entrada.
- Enrutamiento en pipelines de ASR: usar la puntuacion para decidir si una emision debe procesarse con un modelo de reconocimiento entrenado en MSA o con uno especializado en dialecto saudí.
- Docencia y aprendizaje de arabe: herramienta de analisis que indica al estudiante o al profesor el grado de dialectalidad de una grabacion, util para materiales de ensenanza de MSA frente a variedades coloquiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un encoder Whisper Medium (d_model 1024) mas una cabeza lineal, la huella es moderada y cabe con holgura en GPUs de consumo, aunque no se aportan cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del modelo base, una GPU de consumo reciente (por ejemplo, RTX 3090 o RTX 4090) seria suficiente, pero el autor no lo especifica.
- Cabida en GPU de consumo: previsiblemente si, dado el tamano del encoder Whisper Medium, aunque no se confirma con datos del autor.
- Opciones de despliegue: el codigo de ejemplo usa `transformers` (`WhisperModel`, `WhisperFeatureExtractor`), `torch`, `torchaudio` y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (la tarea de regresion no encaja con esos servidores de generacion).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VARabi/towards-speechaldi-direct-prediction-whisper-medium | no disponible (encoder Whisper Medium + cabeza lineal) | ventana de audio de 30 s | Regresion ALDi directa desde audio | Apache 2.0 | Hugging Face (0 descargas) |
| Enfoque en cascada (ASR + modelo ALDi textual) | depende del ASR y del modelo textual | depende del ASR | ALDi a partir de transcripcion | variable | no disponible como modelo unico |
| Modelos ALDi textuales previos (referenciados en el paper) | no disponible | no disponible | ALDi sobre texto | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la model card solo menciona que el paper compara el enfoque en cascada con el directo, sin cifras en el material disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con arabe saudí (SADA22); las puntuaciones para otros dialectos (egipcio, levantino, marroqui, etc.) pueden estar menos calibradas.
- El audio se trocea internamente en ventanas de 30 segundos; para archivos mas largos hay que segmentar y promediar, lo que puede perder informacion de contexto global.
- La salida es una regresion sin sigmoide, por lo que la puntuacion no esta acotada por construccion al rango [0, 1] y puede salir de el en casos extremos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones poco fiables fuera del dominio de entrenamiento (otros dialectos, ruido, musica, habla no arabe).
- No se documentan sesgos especificos mas alla de la limitacion dialectal, pero al entrenar solo con arabe saudí puede infrarepresentar variedades no saudies.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece ninguna garantia ni soporte por parte del autor.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de uso en produccion.
- El codigo de ejemplo descarga el checkpoint desde `wageehkhad/whisper-medium-sada-speech-aldi`, un identificador distinto del repo de Hugging Face listado; conviene verificar la disponibilidad de ese checkpoint antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/VARabi/towards-speechaldi-direct-prediction-whisper-medium
- Paper ALDi (EMNLP 2023): https://aclanthology.org/2023.emnlp-main.655/
- Paper del modelo (ArabicNLP 2026): https://aclanthology.org/2026.arabicnlp-main.28/
- DOI del paper: https://doi.org/10.18653/2026.arabicnlp-main.28
- Dataset SADA22: https://huggingface.co/datasets/MohamedRashad/SADA22
- Modelo base: https://huggingface.co/openai/whisper-medium
