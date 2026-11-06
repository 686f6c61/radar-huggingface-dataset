# tryambientai/medasr-gguf

## Resumen

MedASR es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Google y especializado en dictado clinico. La version aqui descrita, `tryambientai/medasr-gguf`, es una conversion al formato GGUF del modelo original `google/medasr`, empaquetada para su uso con el runtime `transcribe.cpp`. El modelo resuelve el problema del dictado medico en ingles: transcripcion de notas de radiologia, medicina interna y medicina de familia, donde la terminologia especializada y las abreviaturas clinicas degradan gravemente el rendimiento de los ASR genericos.

La arquitectura es un encoder Conformer de 17 capas con atencion RoPE, FFN tipo macaron y una cabeza CTC con vocabulario SentencePiece de 512 tokens. Tiene aproximadamente 105 millones de parametros y decodifica de forma greedy por CTC, sin modelo de lenguaje externo ni beam search. El modelo es offline (no streaming), solo en ingles y no detecta idioma ni genera traducciones.

Su relevancia practica esta en el despliegue: las cuantizaciones GGUF van de 417 MB (F32) a 79 MB (Q4_K_M), lo que permite ejecutar dictado medico en CPU o en GPU consumer con una latencia muy baja (RTF de 354x en Metal sobre un Apple M4 Max y 65x en CPU). Es una herramienta de inferencia local para entornos sanitarios con requisitos de privacidad, no un ASR de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 17 capas, atencion RoPE, FFN macaron) con cabeza CTC |
| Parametros totales | 105.316.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo offline; ventana de audio no documentada en la informacion disponible) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Health AI Developer Foundations (hereda de `google/medasr`; etiquetada como `other`) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer de 17 capas con atencion rotacional (RoPE), bloques FFN tipo macaron y una cabeza de clasificacion CTC sobre un vocabulario SentencePiece de 512 tokens. La decodificacion es greedy CTC pura: no hay modelo de lenguaje externo, ni beam search, ni rescoring. El modelo fue preentrenado por Google sobre un corpus de audio medico; la model card upstream no detalla en la informacion disponible el numero exacto de tokens, la composicion del dataset ni si se aplico RLHF o DPO (procedimiento poco habitual en ASR CTC). La model card original menciona que el modelo esta pensado como punto de partida para desarrolladores y que puede mostrar variabilidad con terminos fuera de su distribucion de preentrenamiento, como nombres de medicamentos no estandar o el tratamiento consistente de datos temporales (fechas, horas, duraciones).

La conversion GGUF fue portada desde el commit upstream `ae1e484` (fijado el 2026-06-04) y validada contra la referencia de transformers en el commit `65dc2615` (version de desarrollo, v5.0.0 no publicada) con `transcribe.cpp` en el commit `782abfd`. La validacion numerica confirma que la salida F32 en `transcribe.cpp` coincide exactamente con la referencia de Hugging Face (WER 17,88 % en LibriSpeech test-clean). No se documentan innovaciones de decodificacion especulativa ni atencion lineal; la unica optimizacion relevante es la cuantizacion GGUF con perdida de precision medida.

## Capacidades

- Transcripcion de voz a texto offline en ingles, orientada a dictado medico (radiologia, medicina interna, medicina de familia).
- Manejo de terminologia clinica especializada y abreviaturas medicas dentro de su distribucion de preentrenamiento.
- Decodificacion CTC greedy con timestamps a nivel de token (`timestamps: token` en la metadata de `transcribe.cpp`).
- Ejecucion en CPU y GPU via `transcribe.cpp` (backend Metal en Apple Silicon, Vulkan en GPU AMD/Intel, CPU nativo).
- No soporta streaming (`streaming: false`).
- No soporta traduccion (`translate: false`).
- No realiza deteccion de idioma (`lang_detect: false`).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso (es un modelo puramente acustico-CTC).
- No tiene vision, audio generativo ni modo thinking.

## Casos de uso

- Dictado radiologico local: transcripcion de informes de radiologia directamente en el puesto de trabajo, con el audio procesandose en la maquina del facultativo (Q8_0, 122 MB) sin enviar datos a la nube, lo que encaja con requisitos de privacidad de datos clinicos.
- Notas de consulta en medicina interna y medicina de familia: el modelo esta ajustado sobre datasets internos de dictado general y de familia (RAD-DICT, GENERAL-DICT, FM-DICT) con WER del 6,6 % al 9,3 %, por lo que es adecuado para capturar anamnesis y exploracion dictadas.
- Integracion en sistemas de historia clinica electronica: al ser un GGUF de menos de 130 MB y con RTF de 65x en CPU, puede incrustarse como dependencia en aplicaciones de escritorio o servidores locales de un hospital sin GPU dedicada.
- Procesamiento por lotes de grabaciones archivadas: con RTF de 354x en Metal sobre un M4 Max, un portatil puede transcribir horas de dictado en minutos para digitalizar archivos historicos.
- Despliegue en entornos con recursos limitados: la cuantizacion Q5_K_M (90 MB) o Q4_K_M (79 MB) permite ejecutar el modelo en dispositivos edge o contenedores pequenos, aceptando una degradacion de WER de +0,03 pp y +0,26 pp respectivamente frente a F32.
- Prototipado e investigacion en ASR medico: sirve como baseline reproducible para comparar pipelines de dictado clinico, con validacion numerica documentada frente a la referencia de Hugging Face y timestamps por token para alineacion.
- Transcripcion de audio de reuniones clinicas en ingles: util como capa ASR base en pipelines que luego aplican postprocesado de entidades medicas, siempre que el audio sea de hablantes en ingles y no requiera streaming.

## Benchmarks y rendimiento

Resultados medidos por el autor de la conversion sobre LibriSpeech test-clean completo (2.620 enunciados), decodificacion CTC greedy sin LM externo:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 417 MB | 17,88 % |
| F16 | 202 MB | 17,88 % |
| Q8_0 | 122 MB | 17,86 % |
| Q6_K | 101 MB | 17,93 % |
| Q5_K_M | 90 MB | 17,91 % |
| Q4_K_M | 79 MB | 18,14 % |

Rendimiento (factor de tiempo real, RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 354,5 |
| Apple M4 Max | CPU | 65,5 |
| AMD Ryzen 4750U | Vulkan | 71 |
| AMD Ryzen 4750U | CPU | 19,5 |

El WER absoluto en LibriSpeech es alto (17,88 %) porque el modelo esta ajustado para dictado medico, no para habla general; el propio autor lo compara con Whisper-base (~5 % en habla general). En los datasets internos de dictado del publicador (RAD-DICT, GENERAL-DICT, FM-DICT) el modelo alcanza 6,6 %–9,3 % de WER, pero esos conjuntos no son reproducibles publicamente. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Los pesos ocupan entre 79 MB (Q4_K_M) y 417 MB (F32); la memoria de trabajo adicional para audio y buffers es pequena y no se documenta en la informacion disponible.
- GPU recomendadas: cualquier GPU con backend Metal (Apple Silicon, incluido M4 Max) o Vulkan (AMD/Intel) funciona; no se requieren A100/H100 ni RTX 4090 para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en iGPU, dado el tamano inferior a 0,5 GB.
- Opciones de despliegue: `transcribe.cpp` (unico runtime soportado por esta conversion, compilado desde fuente con CMake). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a ASR Conformer CTC.
- Latencia y throughput: RTF de 354,5 en Metal (M4 Max), 65,5 en CPU (M4 Max), 71 en Vulkan (Ryzen 4750U) y 19,5 en CPU (Ryzen 4750U). Es decir, en el peor caso documentado (CPU de Ryzen 4750U) transcribe una hora de audio en unos tres minutos.
- Entrada de audio: WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | WER relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medasr-gguf (esta ficha) | 105 M | offline, ingles, CTC | 17,88 % LibriSpeech test-clean; 6,6–9,3 % dictado medico interno | Health AI Developer Foundations | GGUF via `transcribe.cpp` |
| google/medasr (base) | 105 M | offline, ingles, CTC | referencia F32 17,88 % LibriSpeech test-clean | Health AI Developer Foundations | Hugging Face, transformers |
| Whisper (familia, p. ej. base) | ~74 M (base) | offline/streaming segun variante, multilingue | ~5 % en habla general (referencia citada por el autor) | MIT (variantes OpenAI) | amplia: whisper.cpp, faster-whisper, transformers |
| Wav2Vec 2.0 / HuBERT (ASR generico) | variable (decenas a centenares de M) | offline, ingles/multilingue segun checkpoint | no disponible en la informacion proporcionada | variable por checkpoint | Hugging Face, transformers |

La comparativa directa con Whisper no es homogenea: Whisper esta entrenado para habla general multilingue y obtiene mejor WER en LibriSpeech, mientras que MedASR prioriza terminologia clinica y obtiene 6,6–9,3 % en dictado medico segun datos internos no reproducibles. Para aplicaciones de dictado clinico en ingles con despliegue local, MedASR es la opcion especializada; para habla general o multilingue, Whisper es preferible.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no soporta otros idiomas ni deteccion de idioma.
- No soporta streaming: requiere audio completo o segmentado manualmente antes de transcribir.
- No soporta traduccion ni genera timestamps a nivel de palabra (solo a nivel de token).
- WER alto en habla general (17,88 % en LibriSpeech test-clean); fuera de su dominio medico el rendimiento es claramente inferior a ASR generico como Whisper.
- Rendimiento variable con terminos fuera del preentrenamiento: nombres de medicamentos no estandar y tratamiento inconsistente de fechas, horas y duraciones, segun la model card upstream.
- Los datos de rendimiento en dictado medico (6,6–9,3 % de WER) provienen de datasets internos del publicador no reproducibles publicamente; no deben tratarse como validacion independiente.
- Q4_K_M presenta una degradacion real de +0,26 pp frente a F32 y el autor no lo recomienda; Q8_0 es el preset por defecto recomendado y Q5_K_M la alternativa si se necesita menor tamano.
- Licencia "Health AI Developer Foundations": uso comercial sujeto a los terminos especificos de Google para esta familia de modelos; hay que revisar dichos terminos antes de desplegar en produccion sanitaria.
- Riesgo de alucinacion acustica: la decodificacion CTC greedy sin LM externo puede producir sustituciones plausibles en terminos clinicos ambiguos; se recomienda supervision humana en informes medicos.
- Sesgos: no se documentan en la informacion disponible analisis de sesgos por acento, genero o variedad dialectal; el corpus de preentrenamiento medico no esta descrito publicamente.
- Dependencia de un runtime poco extendido (`transcribe.cpp`), sin integracion documentada con vLLM, Ollama, llama.cpp o TGI.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/tryambientai/medasr-gguf
- Modelo base: https://huggingface.co/google/medasr
- Commit upstream usado para la conversion: https://huggingface.co/google/medasr/commit/ae1e484
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado en la validacion: https://github.com/handy-computer/transcribe.cpp/tree/782abfd
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/medasr.md
- Documentacion de MedASR (Google): https://developers.google.com/health-ai-developer-foundations/medasr
- Terminos de uso Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- MedASR en Google Cloud Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medasr
- Repositorio GitHub de MedASR: https://github.com/google-health/medasr
- Notebook de inicio rapido: https://github.com/google-health/medasr/blob/main/notebooks/quick_start_with_hugging_face.ipynb
- Notebook de fine-tuning: https://github.com/google-health/medasr/blob/main/notebooks/fine_tune_with_hugging_face.ipynb
- Informe tecnico (preprint): https://arxiv.org/abs/2605.16555
- Paper Conformer: https://arxiv.org/abs/2005.08100
- Papers adicionales referenciados en los tags: https://arxiv.org/abs/2304.13134 , https://arxiv.org/abs/2309.08105
