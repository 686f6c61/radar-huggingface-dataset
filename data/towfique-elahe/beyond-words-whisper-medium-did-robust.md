# towfique-elahe/beyond-words-whisper-medium-did-robust

## Resumen

Beyond Words Whisper-medium DID Robust es un clasificador de audio derivado de openai/whisper-medium, ajustado por towfique-elahe para identificar el dialecto regional del bengol (bangla) a partir de grabaciones de voz. El modelo reutiliza el codificador de Whisper como extractor de representaciones acusticas y anade una cabeza de clasificacion (`WhisperForAudioClassification`) que asigna cada clip a una de nueve clases: Barishal, Chattogram, Dhaka, Khulna, Mymensingh, Noakhali, Rajshahi, Standard (etiquetada como `Formal` en `id2label`) y Sylhet.

La variante "robust" se distingue del checkpoint original de la tesis por incorporar una cadena de aumento de canal que preserva la prosodia (ganancia de ±10 dB, ruido gaussiano de 5-30 dB SNR, ecualizacion de siete bandas de ±8 dB, filtros paso bajo y paso alto, paso banda telefonico, aliasing y clipping), sin cambios de tono ni estiramiento temporal. El objetivo es corregir el fallo del modelo original, que clasificaba como "Standard" la mayoria de grabaciones de microfono reales.

El modelo tiene 306.201.097 parametros, un repositorio de 1,2 GB en safetensors y licencia Apache 2.0. Es relevante para investigacion en identificacion de dialectos y para aplicaciones de procesamiento de voz en bengol donde la entrada proviene de microfonos de portatil o movil en lugar de medios de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Whisper) con cabeza de clasificacion de audio |
| Parametros totales | 306.201.097 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 segundos de audio de entrada (500 frames log-mel, `max_source_positions=250`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bn (bengol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del codificador de openai/whisper-medium, un transformer encoder preentrenado con datos de reconocimiento de voz multilingue. Sobre esa base se aplica un ajuste fino supervisado para clasificacion de audio, sustituyendo la cabeza de decodificacion por una capa de clasificacion lineal sobre las representaciones del encoder. La entrada se procesa con `WhisperFeatureExtractor` con `padding="max_length"` y `max_length=80000`, tomando los primeros 5 segundos de audio a 16 kHz mono.

El entrenamiento emplea una division estricta por pseudo-hablante, semilla 42 y 12 epocas. La innovacion principal respecto al checkpoint base es la cadena de aumento de canal orientada a robustez de microfono: ganancia de ±10 dB, ruido gaussiano entre 5 y 30 dB SNR, ecualizacion de siete bandas con ±8 dB, filtro paso bajo de 3-7 kHz, paso alto de 80-400 Hz, paso banda telefonico, aliasing a 4-8 kHz y clipping. No se aplican cambios de tono ni estiramiento temporal, de modo que se preservan las caracteristicas prosodicas que distinguen los dialectos. No se detalla el volumen de datos de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificacion de dialectos del bengol en nueve clases regionales y una clase estandar.
- Identificacion de dialecto a partir de audio de microfono con ruido, ganancia variable y respuesta de frecuencia degradada.
- Robustez ante condiciones de captura realistas: nivel bajo, ruido ambiental, filtrado telefonico y clipping.
- Procesamiento de clips de audio de hasta 5 segundos de duracion.
- Inferencia sobre audio mono a 16 kHz.
- No soporta generacion de texto, tool calling, agentes, vision, audio generation ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de llamadas en centros de atencion al cliente: el modelo puede clasificar la region dialectal del interlocutor a partir de los primeros segundos de audio y derivar la llamada a un agente con el perfil linguistico adecuado, gracias a su robustez frente a microfonos de telefonia y niveles bajos.
- Analisis sociolinguistico de corpus de campo: investigadores que recogen entrevistas con grabadoras o moviles pueden clasificar automaticamente los clips por region sin necesidad de etiquetado manual, usando la normalizacion de nivel RMS a 0,076 indicada por el autor.
- Moderacion y analisis de contenido en plataformas de audio: deteccion de la region dialectal de fragmentos subidos por usuarios para estudios de distribucion geografica o para personalizar recomendaciones.
- Investigacion en identificacion de dialectos: el modelo sirve como linea base reproducible (semilla 42, division estricta por pseudo-hablante) para comparar tecnicas de aumento de datos y arquitecturas encoder-only.
- Aplicaciones de accesibilidad y transcripcion asistida: pre-clasificacion de audio antes de pasarlo a un sistema ASR especifico por dialecto, reduciendo errores de transcripcion en variedades regionales.
- Demostraciones y prototipos web: el autor mantiene una demo en vivo en beyondwords.towfiqueelahe.com que puede servir de referencia para integrar el modelo en interfaces de prueba.
- Filtrado de datasets de voz: clasificacion masiva de clips para equilibrar la representacion de las nueve clases en corpus de entrenamiento de otros modelos de voz en bengol.

## Benchmarks y rendimiento

Macro-F1 sobre 270 clips de test estricto (30 por clase) en distintas condiciones de captura:

| Modelo | Clips limpios | Microfono simulado | Microfono simulado + normalizacion de nivel |
|---|---|---|---|
| Modelo de tesis (`…-did`) | 0,915 | 0,389 | 0,709 |
| **Este modelo (`…-did-robust`)** | 0,893 | **0,843** | **0,846** |

F1 por clase en el split de test estricto completo:

| Clase | F1 |
|---|---|
| Barishal | 0,87 |
| Chattogram | 0,83 |
| Dhaka | 0,95 |
| Khulna | 0,97 |
| Mymensingh | 0,86 |
| Noakhali | 0,88 |
| Rajshahi | 0,91 |
| Standard | 0,89 |
| Sylhet | 0,90 |

Macro-F1 global en el split de test estricto completo: 0,896 (frente a 0,919 del modelo de tesis, 2,3 puntos inferior).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, mas memoria de activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,6 GB de pesos, holgado en GPUs de 2 GB en adelante.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: transformers con `WhisperForAudioClassification`, ONNX Runtime, y servidores de inferencia genericos compatibles con transformers; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI (estas herramientas estan orientadas a modelos generativos y no aplican directamente a un clasificador).
- Latencia y throughput: no disponible en la informacion proporcionada; al procesar solo 5 segundos de audio por clip, la latencia esperada es baja, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beyond-words-whisper-medium-did-robust | 306.201.097 | 5 s | Clasificacion de dialectos bangla | apache-2.0 | Hugging Face |
| beyond-words-whisper-medium-did | no disponible (misma base) | 5 s | Clasificacion de dialectos bangla | apache-2.0 | Hugging Face |
| openai/whisper-medium | 769 M (modelo completo) | 30 s | ASR multilingue | apache-2.0 | Hugging Face |
| Clasificadores de dialecto basados en wav2vec2/XLS-R | no disponible | variable | Identificacion de dialecto | variable | Hugging Face |

La comparacion directa mas relevante es con el checkpoint de tesis: este modelo sacrifica 2,3 puntos de macro-F1 en audio limpio (0,896 frente a 0,919) a cambio de duplicar con creces el rendimiento en microfono simulado (0,843 frente a 0,389). Frente a Whisper-medium completo, este modelo es mas pequeno (solo encoder mas cabeza) y especializado en una tarea de clasificacion, no en transcripcion.

## Limitaciones y advertencias

- Corpus de origen "found data" (television, cine y medios online), lo que puede introducir sesgos de dominio y de estilo de habla.
- Entrenamiento con una sola semilla, lo que limita la estimacion de varianza en los resultados.
- Hablantes de regiones fuera de las nueve clases se asignan a la clase mas cercana, generando etiquetas potencialmente incorrectas.
- El habla leida en registro estandar se clasifica como Standard por definicion, lo que puede inflar esa clase en corpus formales.
- Riesgo de confusion entre dialectos con F1 mas bajo (Chattogram 0,83, Mymensingh 0,86, Barishal 0,87).
- Solo soporta bengol; no hay capacidades multilingues.
- Ventana de audio limitada a 5 segundos, lo que puede ser insuficiente para muestras muy cortas o para capturar variabilidad intra-hablante.
- Requiere normalizacion de nivel RMS a aproximadamente 0,076 antes de extraer caracteristicas; omitirla degrada el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigacion de tesis de grado sin garantias de produccion.
- No se han publicado evaluaciones independientes fuera del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/towfique-elahe/beyond-words-whisper-medium-did-robust
- Checkpoint de tesis: https://huggingface.co/towfique-elahe/beyond-words-whisper-medium-did
- Demo en vivo: https://beyondwords.towfiqueelahe.com
- Codigo: https://github.com/towfique-elahe/beyond-words
- Modelo base: https://huggingface.co/openai/whisper-medium
