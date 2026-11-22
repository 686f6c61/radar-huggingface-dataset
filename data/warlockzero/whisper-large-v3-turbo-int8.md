# warlockzero/whisper-large-v3-turbo-int8

## Resumen

Whisper Large V3 Turbo INT8 es una versión cuantizada del modelo de reconocimiento automático del habla `openai/whisper-large-v3-turbo`, publicada por el usuario warlockzero en Hugging Face. La cuantización se ha realizado con `bitsandbytes` en formato INT8 con activaciones de 16 bits (W8A16), lo que reduce el peso del modelo hasta un repositorio de 0,9 GB y un pico de VRAM de aproximadamente 0,89 GB durante la inferencia, según la model card. El modelo base es la variante Turbo de Whisper Large V3, diseñada por OpenAI para transcripción multilingüe de alta calidad con menor coste computacional que las versiones large completas.

El modelo resuelve el problema clásico de desplegar ASR de alta calidad en hardware con recursos limitados: mantiene la arquitectura y los pesos del Whisper Large V3 Turbo (809.313.280 parámetros reales según los safetensors) pero en precisión INT8, lo que permite ejecutarlo en GPUs de consumo y en entornos con presupuesto de memoria muy ajustado. La licencia MIT facilita su integración en productos comerciales, aunque conviene verificar las condiciones del modelo base de OpenAI.

Es relevante ahora porque la transcripción de audio se ha convertido en un componente habitual de pipelines de agentes, subtitulado, reuniones y atención al cliente, y este tipo de cuantizaciones permiten llevar modelos de la familia Whisper a entornos de borde o a instancias GPU pequeñas sin renunciar a la calidad del modelo original, según afirma el autor ("100% transcript accuracy").

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), cuantizado con bitsandbytes |
| Parametros totales | 809.313.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | INT8 W8A16 (pesos 8 bits, activaciones 16 bits) vía bitsandbytes |
| Idiomas soportados | no disponible (el modelo base Whisper Large V3 Turbo es multilingüe, pero no se detalla en la información proporcionada) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `openai/whisper-large-v3-turbo`, que emplea la arquitectura encoder-decoder de la familia Whisper: un encoder convolucional más transformer que procesa espectrogramas Mel de audio y un decoder autorregresivo que genera tokens de texto. La variante Turbo reduce el número de capas del decoder respecto a Whisper Large V3 para acelerar la inferencia, manteniendo el encoder de la versión large. El proceso de cuantización aplicado por warlockzero convierte los pesos a INT8 mediante `bitsandbytes` en modo W8A16, dejando las activaciones en FP16/BF16.

No se dispone de información sobre el dataset de entrenamiento original en la documentación proporcionada, más allá de que proviene del modelo base de OpenAI (entrenado sobre audio y texto multilingüe, según la práctica habitual de Whisper). Tampoco se documentan procesos de RLHF, DPO ni innovaciones adicionales más allá de la propia cuantización. La model card no incluye detalles sobre calibración, método exacto de cuantización por capas ni métricas de degradación respecto al modelo original.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio en formato WAV y otros formatos decodificables con `soundfile`/`librosa`.
- Transcripción de audio a texto mediante `AutoModelForSpeechSeq2Seq` y `AutoProcessor` de transformers.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.
- Inferencia en GPU con `device_map="auto"` y en CPU (aunque el objetivo declarado es reducir VRAM en GPU).
- Capacidades multilingües heredadas del modelo base Whisper Large V3 Turbo (no detalladas en la información proporcionada).
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni thinking mode; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede procesar segmentos de audio de hasta 30 segundos (ventana nativa de Whisper) y encadenar resultados para generar actas o resúmenes, con un consumo de VRAM inferior a 1 GB que permite ejecutarlo junto a otros servicios en la misma GPU.
- Subtitulado automático de vídeo: integrado en pipelines de postproducción, transcribe pistas de audio y genera ficheros SRT/VTT; la cuantización INT8 reduce el coste por hora de audio procesado en instancias GPU pequeñas.
- Atención al cliente basada en voz: transcripción en tiempo casi real de llamadas para alimentar sistemas de análisis de sentimiento o bases de conocimiento, aprovechando la baja huella de memoria para desplegar varias instancias por nodo.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones web o móviles, desplegando el modelo en GPUs de consumo (por ejemplo, RTX 3060 o superiores) o en servidores modestos.
- Procesamiento por lotes de archivos de audio: transcripción masiva de podcasts, entrevistas o archivos de call center usando `batch_decode` sobre lotes de segmentos, con throughput mejorado al caber varias instancias en una sola GPU.
- Investigación en ASR y evaluación de cuantizaciones: servir como referencia para comparar la degradación de calidad entre el modelo original en FP16 y esta versión INT8 en tareas downstream (WER, puntuación, diarización posterior).
- Prototipado rápido en entornos con GPU limitada: al ocupar menos de 1 GB de VRAM, permite iterar en notebooks o instancias con GPU compartida sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma "100% transcript accuracy" respecto al modelo base, sin especificar el conjunto de evaluación, la métrica (WER/CER) ni el procedimiento seguido, por lo que no se puede verificar ni comparar numéricamente.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,89 GB de pico según la model card (INT8 W8A16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs NVIDIA consumer con soporte CUDA y `bitsandbytes`.
- Opciones de despliegue: transformers con `bitsandbytes` (requerido para la cuantización), pipeline `automatic-speech-recognition`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (estos motores no soportan habitualmente ASR de Whisper con bitsandbytes).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/whisper-large-v3-turbo-int8 | 809.313.280 | no disponible | INT8 W8A16 | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | ~809 M (misma arquitectura) | no disponible | FP16/BF16 | MIT (según modelo base) | Hugging Face |
| openai/whisper-large-v3 | ~1.550 M | no disponible | FP16/BF16 | MIT (según modelo base) | Hugging Face |
| openai/whisper-small | ~244 M | no disponible | FP16/BF16 | MIT (según modelo base) | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir degradación en la calidad de transcripción respecto al modelo original en FP16, especialmente en audio con ruido, acentos marcados o idiomas de bajos recursos; el autor no aporta métricas que lo cuantifiquen.
- No se documentan los idiomas soportados ni el rendimiento por idioma; aunque el modelo base es multilingüe, conviene validar el comportamiento en el idioma objetivo antes de producción.
- Riesgo de alucinación inherente a Whisper: en segmentos silenciosos o con ruido puede generar texto inventado o repetir frases; se recomienda aplicar detección de silencio y filtros post-proceso.
- Sesgos heredados del dataset de entrenamiento del modelo base de OpenAI (no documentados en esta ficha).
- La licencia MIT del repositorio debe contrastarse con las condiciones del modelo base `openai/whisper-large-v3-turbo` para uso comercial; la información proporcionada no detalla posibles restricciones adicionales.
- Requiere `bitsandbytes` y una GPU compatible para aprovechar la cuantización; el soporte en CPU puede no estar optimizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes de uso en producción.
- No se especifica el método de calibración ni la pérdida de precisión por capa, lo que dificulta auditar la fidelidad respecto al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/warlockzero/whisper-large-v3-turbo-int8
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Paper de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
