# thejasgr/wav2vec2-group6-ckpt8920

## Resumen

wav2vec2-group6-ckpt8920 es un modelo de reconocimiento automático del habla (ASR) en inglés, resultado del ajuste fino de facebook/wav2vec2-base-960h sobre el subconjunto train-clean-100 de LibriSpeech durante 5 épocas (8.920 pasos). Lo desarrolla el usuario thejasgr (GR-Thejas, vinculado a AIET9-IIITH según el repositorio de la demo), y forma parte de un trabajo de grupo identificado como "Group 6". El modelo resuelve la transcripción de audio a texto en inglés mediante CTC, con salida en mayúsculas y apóstrofos, sin puntuación ni dígitos.

Con 94,4 millones de parámetros y un tamaño de repositorio de 0,4 GB, se trata de un modelo compacto pensado para inferencia ligera. Su relevancia es acotada: no aporta innovaciones arquitectónicas frente al modelo base, sino un punto de control ajustado con una WER de validación del 3,62 % en dev-clean, lo que lo sitúa como una alternativa práctica para transcripción en inglés con requisitos de hardware modestos.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con endpoints de HuggingFace. No se dispone de información sobre la licencia, lo que limita su uso comercial sin aclaración previa por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder transformer, cabeza CTC) |
| Parametros totales | 94.396.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada típica de wav2vec2 de ~10 s por fragmento, no confirmada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2-base: un extractor de características convolucional que procesa la forma de onda de audio en bruto, seguido de un encoder de transformadores y una cabeza de clasificación CTC para la predicción de tokens. La variante base-960h de Facebook se entrenó originalmente con 960 horas de LibriSpeech y salida en mayúsculas; este punto de control parte de esos pesos y los ajusta posteriormente.

El ajuste fino se realizó sobre train-clean-100 de LibriSpeech durante 5 épocas, equivalentes a 8.920 pasos, con validación en dev-clean. La evolución de la pérdida y la WER de validación se documenta en la model card: 0,0664 / 3,98 % en el paso 1.000, 0,0689 / 3,71 % en el paso 7.000 y 0,0715 / 3,62 % en el paso 8.920. No se especifican hiperparámetros, composición exacta del dataset más allá de train-clean-100, ni si se aplicaron técnicas de aumento de datos o decodificación con modelo de lenguaje.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio en bruto (forma de onda).
- Salida CTC en mayúsculas con apóstrofos; sin puntuación, sin dígitos y sin distinción de mayúsculas/minúsculas más allá de la convención de mayúsculas.
- Transcripción de utterances cortas, típicas de los corpus LibriSpeech.
- Integración con la clase Wav2Vec2ForCTC y Wav2Vec2Processor de transformers.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión, audio de salida, ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Transcripción de notas de voz en inglés: el modelo convierte audio de voz en texto en mayúsculas para aplicaciones de dictado o registro de reuniones cortas, con un coste computacional bajo gracias a sus 94 M de parámetros.
- Subtitulado automático de audios en inglés de dominio limpio: adecuado para material con condiciones acústicas similares a LibriSpeech (voz clara, sin ruido de fondo), donde la WER de validación del 3,62 % es representativa.
- Preprocesado de pipelines de NLP: transcripción de audio a texto antes de tareas posteriores de análisis, búsqueda o clasificación, usando la salida CTC como entrada a otros modelos.
- Demo educativa o prototipo de ASR: el modelo se usa en la aplicación "Speak & Transcribe" del autor, lo que lo hace apropiado como base para demos docentes de reconocimiento de voz con transformers.
- Evaluación comparativa de ajustes finos: sirve como punto de referencia para experimentos de fine-tuning sobre wav2vec2-base-960h, dado que la model card documenta la curva de WER por paso.
- Inferencia en entornos con recursos limitados: sus 94 M de parámetros y 0,4 GB de pesos permiten desplegarlo en CPU o GPU de gama baja para transcripciones por lotes de audios cortos en inglés.

## Benchmarks y rendimiento

| Conjunto | Metrica | Valor |
|---|---|---|
| dev-clean (paso 1.000) | Validation loss | 0,0664 |
| dev-clean (paso 1.000) | WER | 3,98 % |
| dev-clean (paso 7.000) | Validation loss | 0,0689 |
| dev-clean (paso 7.000) | WER | 3,71 % |
| dev-clean (paso 8.920) | Validation loss | 0,0715 |
| dev-clean (paso 8.920) | WER | 3,62 % |

No se han publicado resultados de benchmarks adicionales (test-clean, test-other, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos, con overhead adicional de activaciones y del procesador; en la práctica, menos de 2 GB para audios cortos.
- VRAM estimada en fp16: alrededor de 0,2 GB de pesos, aunque no se documenta soporte explícito de cuantización.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo es lo bastante pequeño para ejecutarse también en CPU.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060 o superiores, y previsiblemente en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (Wav2Vec2ForCTC), endpoints de HuggingFace (tag endpoints_compatible); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER dev-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thejasgr/wav2vec2-group6-ckpt8920 | 94,4 M | audio, ventana no confirmada | 3,62 % | no disponible | HuggingFace |
| facebook/wav2vec2-base-960h | ~94,4 M | audio, ventana no confirmada | no disponible en la información | no disponible | HuggingFace |
| whisper-small (referencia cualitativa) | no disponible | audio de 30 s | no disponible en la información | no disponible | HuggingFace |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible más allá del punto de control base.

## Limitaciones y advertencias

- Solo reconoce inglés; no se documenta soporte de otros idiomas.
- Salida restringida a mayúsculas y apóstrofos: no genera puntuación, dígitos ni minúsculas, lo que exige postprocesado para muchos usos reales.
- Entrenado y validado sobre LibriSpeech (audio limpio de lectura); el rendimiento puede degradarse notablemente con ruido, acentos no representados o habla espontánea.
- Riesgo de alucinación y errores de transcripción en segmentos ambiguos o con solapamiento de hablantes.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan sesgos específicos, pero al derivar de LibriSpeech hereda los sesgos de dominio y de los hablantes de ese corpus.
- El checkpoint corresponde a un trabajo de grupo ("Group 6") sin publicación asociada; la madurez y el mantenimiento del modelo no están garantizados.
- Descargas y likes nulos en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thejasgr/wav2vec2-group6-ckpt8920
- Modelo base: https://huggingface.co/facebook/wav2vec2-base-960h
- Repositorio de la demo "Speak & Transcribe": https://github.com/GR-Thejas/asr-aiet9-iith
- Dataset LibriSpeech: https://www.opensource.org/licenses/LibriSpeech (referencia del corpus citado en la model card)
