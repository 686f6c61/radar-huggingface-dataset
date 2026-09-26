# umairjamali/balochi-whisper-small-v3

## Resumen

Balochi Whisper-small v3 es un ajuste fino del modelo Whisper-small de OpenAI realizado por el usuario umairjamali para tareas de reconocimiento automatico del habla (ASR) en balochi, una lengua irania del grupo noroccidental hablada en Pakistan, Iran y Afganistan. El ajuste se ha hecho mediante LoRA (r=32, aproximadamente 13 millones de parametros entrenables) sobre el modelo base completo, que cuenta con 241.734.912 parametros en safetensors. El autor lo describe explicitamente como una "transcripcion preliminar" (draft transcription), no como un modelo general de balochi.

El problema que aborda es la practica ausencia de soporte ASR para balochi en los sistemas multilingues mainstream: Whisper no incluye el balochi entre sus 99 idiomas, por lo que el autor fuerza la decodificacion con el token de idioma urdu, la lengua Perso-Arabe soportada mas cercana. El corpus de entrenamiento es muy reducido: 4.781 enunciados y unas 3,6 horas de audio, repartidos entre dos hablantes (suleimani y makrani/sureno).

Su relevancia actual es la de un experimento de adaptacion de bajo coste a una lengua de bajos recursos. Los resultados en el conjunto de test reservado (240 clips) son WER 54,42% / CER 26,73% global, con mejor comportamiento en el dialecto makrani (45,60% / 19,14%) que en el suleimani (62,35% / 33,23%). El modelo no declara licencia, idiomas soportados formales ni pipeline en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con ajuste fino LoRA (r=32) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (1.500 frames mel) en la entrada; 448 tokens en la salida (especificacion estandar de Whisper-small) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | balochi (dialectos suleimani y makrani); decodificacion forzada con el token de idioma urdu |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper-small, un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, dimension de modelo 768 y 12 cabezas de atencion. La entrada de audio se representa como espectrograma mel-log de 80 canales sobre ventanas de 30 segundos; el decoder genera texto de forma autorregresiva condicionado por tokens de tarea e idioma. El ajuste se ha aplicado con LoRA de rango 32 (unos 13 millones de parametros entrenables) sobre los pesos preentrenados congelados.

El conjunto de entrenamiento consta de 4.781 enunciados y aproximadamente 3,6 horas de audio de dos hablantes: 2.281 clips de suleimani y 2.500 de makrani/sureno. Las transcripciones se normalizaron eliminando puntuacion final y plegando variantes de codepoints. En la generacion, el autor fuerza el token de idioma urdu como prompt del decoder y desactiva la supresion de tokens; estos ajustes se incluyen en `generation_config.json`. No se documentan detalles sobre RLHF, DPO ni composicion adicional del dataset.

## Capacidades

- Reconocimiento automatico del habla (ASR) en balochi para los dos dialectos vistos durante el entrenamiento (suleimani y makrani).
- Transcripcion de clips cortos y claros, segun el propio autor el escenario donde el modelo rinde mejor.
- Inferencia compatible con el pipeline estandar de Whisper en HuggingFace Transformers (`WhisperForConditionalGeneration` y `WhisperProcessor`).
- No se declara soporte de tool calling, function calling ni agentes.
- No se declara capacidad multilingue mas alla del balochi; el urdu se usa solo como token de prompt, no como idioma de salida validado.
- No se declaran capacidades de vision, audio distinto de ASR, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion preliminar de audio en balochi: util para generar borradores de transcripcion de entrevistas o grabaciones de campo que posteriormente se revisan y corrigen manualmente, dado el nivel de WER documentado.
- Investigacion linguistica en lenguas de bajos recursos: permite obtener alineaciones iniciales de audio y texto sobre corpus de balochi para estudios foneticos o lexicos, con supervision humana obligatoria.
- Creacion de datasets ASR para balochi: el modelo puede pre-anotar audio que despues se valida, acelerando la construccion de corpus etiquetados de mayor tamano.
- Subtitulado asistido de contenido en balochi (makrani/sureno): para material audiovisual con habla clara y clips cortos, generando subtitulos base que se editan antes de publicar.
- Indexacion y busqueda de archivo sonoro: transcripcion preliminar de un archivo de audio para permitir busqueda por texto en colecciones de grabaciones en balochi.
- Prototipos de accesibilidad: dictado o transcripcion de notas de voz en balochi en entornos de investigacion, siempre con revision posterior por el margen de error.
- Base para nuevos ajustes: al ser un modelo Whisper-small ajustado, puede servir como punto de partida para fine-tunings adicionales con mas hablantes o dialectos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado de 240 clips.

| Conjunto | Clips | WER | CER |
|---|---|---|---|
| Global | 240 | 54,42% | 26,73% |
| Suleimani | 115 | 62,35% | 33,23% |
| Makrani/sureno | 125 | 45,60% | 19,14% |

No se han publicado comparaciones con otros modelos en la informacion disponible. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de ASR (LibriSpeech, Common Voice) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 1 GB de pesos; en fp16, en torno a 0,5 GB. El repositorio ocupa 1,0 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos.
- GPU recomendadas para produccion con throughput alto: A100, H100 o L4 si se sirven muchos flujos concurrentes, aunque para una carga moderada sobra cualquier GPU reciente.
- Opciones de despliegue: HuggingFace Transformers (referencia incluida en la model card), y por ser un modelo Whisper-small, tambien infraestructuras compatibles con Whisper como vLLM, TGI o implementaciones basadas en CTranslate2; llama.cpp y Ollama no aplican al no ser un modelo de texto generativo puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER balochi |
|---|---|---|---|---|---|
| umairjamali/balochi-whisper-small-v3 | 241,7 M | 30 s de audio | balochi (2 dialectos) | no disponible | 54,42% (test propio) |
| openai/whisper-small | 244 M | 30 s de audio | 99 idiomas (sin balochi) | MIT | no soportado / no evaluado |
| openai/whisper-base | 74 M | 30 s de audio | 99 idiomas (sin balochi) | MIT | no soportado / no evaluado |

Los modelos comparables son el propio Whisper-small de OpenAI, del que deriva, y versiones de menor tamano como Whisper-base. No se conocen en la informacion disponible otros ajustes de Whisper para balochi con los que comparar directamente.

## Limitaciones y advertencias

- El autor lo califica explicitamente como modelo de transcripcion preliminar, no apto como sistema ASR de produccion sin revision humana.
- WER global del 54,42%: el margen de error es muy alto incluso en el mejor de los casos.
- Sesgo de hablante y dialecto: entrenado unicamente con dos voces (suleimani y makrani); otros dialectos y voces no vistas no han sido evaluados.
- Corpus de entrenamiento muy pequeno (4.781 enunciados, ~3,6 h), lo que limita la generalizacion.
- Se fuerza el token de idioma urdu, lo que puede introducir interferencias del urdu en la salida.
- La licencia no esta declarada, por lo que se desconoce si se permite uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- No se documentan sesgos especificos, riesgos de alucinacion mas alla del error de reconocimiento, ni limites formales de contexto mas alla de la ventana de 30 s inherente a Whisper.
- Riesgo de sobreajuste a las condiciones acusticas del material de entrenamiento (calidad de microfono, ruido de fondo no especificado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/umairjamali/balochi-whisper-small-v3
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (2022), https://arxiv.org/abs/2212.04356
