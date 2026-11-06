# vezilka-ai/vezilka-moonshine-tiny-mk-lr5e-4

## Resumen

Vezilka Moonshine Tiny (Macedonian, LR 5e-4) es un ajuste fino completo del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny, desarrollado por el equipo de vezilka-ai en el marco del proyecto VEZILKA, financiado por el Ministerio de Educación y Ciencia de Macedonia del Norte y cofinanciado por la UE a través de EuroHPC JU. El modelo resuelve un problema concreto: la práctica ausencia de sistemas ASR ligeros y precisos para el macedonio, un idioma con recursos limitados y escasa cobertura en los modelos multilingües comerciales.

Se trata de un transformer encoder-decoder de solo 27 millones de parámetros, pensado para inferencia en CPU y dispositivos de bajos recursos. A pesar de su tamaño, el ajuste fino sobre una mezcla de datos específica del macedonio (clases universitarias de FINKI, sesiones parlamentarias, audiolibros, Common Voice y FLEURS) le permite alcanzar un WER del 12,06 % en el benchmark de clases de FINKI, un resultado notable para un modelo de esta escala.

Es relevante ahora porque demuestra que un modelo de 27M puede ofrecer calidad útil en un idioma de bajos recursos cuando se dispone de datos de dominio bien curados, y porque su licencia Apache-2.0 y su formato estándar de transformers lo hacen directamente desplegable en producción sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine, ASR) |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (decoder con 194 posiciones; generacion recomendada <= 192 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, probablemente fp32/fp16) |
| Idiomas soportados | macedonio (mk) |
| Licencia | Apache-2.0 (modelo base Moonshine bajo MIT) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del Moonshine Tiny de UsefulSensors, una arquitectura encoder-decoder de tipo transformer diseñada específicamente para ASR y que procesa directamente la forma de onda a 16 kHz en lugar de espectrogramas de ventana fija, por lo que su coste computacional escala con la duración del audio. El decoder dispone de 194 posiciones, lo que limita la generación a unos 192 tokens como máximo.

El entrenamiento consistió en 3 épocas con un 1 % de warm-up y un learning rate pico de 5e-4, sobre una mezcla de datos del proyecto: la colección Vezilka-ASRI (clases de FINKI, sesiones parlamentarias y audiolibros NSSRM con transcripciones automáticas), donaciones aceptadas del proyecto Doniraj, conjuntos de transcripciones de YouTube y televisión, un conjunto de jerga técnica y los subconjuntos en macedonio de Mozilla Common Voice (CC0-1.0) y Google FLEURS (CC-BY-4.0). No se menciona uso de RLHF ni DPO, lo que es coherente con una tarea de ASR supervisada.

## Capacidades

- Reconocimiento automático del habla en macedonio a partir de audio PCM de 16 kHz.
- Transcripción de audio de duración variable, con coste proporcional a la longitud del clip.
- Manejo de vocabulario técnico y de dominio académico (clases de informática de FINKI) gracias al conjunto de jerga incluido en el entrenamiento.
- Robustez ante distintos registros: discurso académico, parlamentario, audiolibros y habla espontánea de corpus como Common Voice.
- Integración nativa con el pipeline `automatic-speech-recognition` de transformers.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de clases universitarias: el modelo está ajustado específicamente sobre clases de FINKI, por lo que es adecuado para generar apuntes y subtítulos de lecciones magistrales en macedonio con un WER en torno al 12 %.
- Subtitulado automático de vídeo y televisión: los conjuntos de transcripciones de YouTube y TV usados en el entrenamiento lo hacen idóneo para generar subtítulos en macedonio en plataformas de contenido.
- Actas y transcripción parlamentaria: el modelo ha visto sesiones parlamentarias en el entrenamiento, lo que lo hace útil para digitalizar y buscar intervenciones en el parlamento macedonio.
- Audiolibros accesibles: permite convertir audiolibros en macedonio a texto para personas con discapacidad auditiva o para indexación y búsqueda.
- Asistentes de voz en dispositivos de bajos recursos: con 27M de parámetros cabe en CPU y en hardware embebido, lo que permite dictado y comandos de voz sin conexión.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible y ligera para experimentos de ASR en macedonio y para comparar estrategias de ajuste fino con learning rates distintos (el nombre del modelo indica LR 5e-4).
- Archivado y búsqueda de fondos de audio: transcripción masiva de grabaciones históricas o institucionales para hacerlas consultables por texto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el benchmark Vezilka FINKI Lecture ASR Benchmark, con referencias revisadas manualmente y sin solapamiento con el entrenamiento. WER/CER en % tras normalización (NFC, minúsculas, sin puntuación); inferencia en CUDA, float32, batch 1, beam 4.

| Vista | Clips | WER | CER | Sustituciones | Inserciones | Borrados |
|---|---:|---:|---:|---:|---:|---:|
| full | 1.406 | 12,06 | 5,33 | 3.796 | 1.236 | 1.474 |
| speaker_balanced | 892 | 10,82 | 4,62 | 2.213 | 712 | 780 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar de ASR como LibriSpeech.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (27M de parámetros, unos 108 MB de pesos); en fp16 alrededor de 55 MB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son más que suficientes.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es uno de sus principales atractivos.
- Opciones de despliegue: pipeline de transformers (referencia), exportación a ONNX, y potencialmente llama.cpp/Ollama si se convierte, aunque no se documenta en la información disponible. vLLM y TGI no están orientados a ASR encoder-decoder de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada; el coste escala con la duración del audio y el decoder está limitado a 192 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vezilka-moonshine-tiny-mk-lr5e-4 | 27M | decoder 194 posiciones | mk | Apache-2.0 | Hugging Face |
| UsefulSensors/moonshine-tiny (base) | 27M | decoder 194 posiciones | en (principalmente) | MIT | Hugging Face |
| Whisper tiny | ~39M | 30 s de audio | multilingue (99 idiomas) | MIT | Hugging Face, OpenAI |
| Whisper small | ~244M | 30 s de audio | multilingue | MIT | Hugging Face, OpenAI |

El modelo se distingue por estar especializado en macedonio con un WER del 12 % en su dominio objetivo, mientras que Whisper tiny, siendo multilingüe, suele rendir peor en idiomas de bajos recursos sin ajuste fino. No se dispone de cifras comparativas directas en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en macedonio; no soporta otros idiomas.
- El WER del 12 % implica que aproximadamente una de cada ocho palabras se transcribe mal, lo que exige revisión humana en usos críticos.
- El decoder está limitado a 194 posiciones (192 tokens recomendados), lo que restringe la duración máxima de cada segmento transcrito; los audios largos deben segmentarse.
- Los benchmarks declarados no están verificados (`verified: false`) y proceden del propio autor, con posible sesgo de selección del conjunto de evaluación.
- Riesgo de alucinación y de errores en nombres propios, siglas y términos técnicos fuera del dominio de entrenamiento.
- Aunque la licencia es Apache-2.0, el modelo base Moonshine es MIT; conviene revisar las condiciones de los corpus de entrenamiento (Common Voice CC0, FLEURS CC-BY) si se redistribuye.
- No se documentan sesgos demográficos ni de acento; al entrenarse con datos principalmente institucionales y académicos, puede rendir peor con acentos regionales o habla muy coloquial.
- No apto para tareas distintas de ASR (no genera texto libre, no razona, no hace tool calling).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vezilka-ai/vezilka-moonshine-tiny-mk-lr5e-4
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Dataset de entrenamiento y benchmark: https://huggingface.co/datasets/vezilka-ai/macedonian-speech
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Proyecto VEZILKA (contexto de financiación, Grant Agreement No. 101263128): no disponible enlace directo en la información proporcionada.
