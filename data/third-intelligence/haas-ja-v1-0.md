# third-intelligence/Haas-ja-v1.0

## Resumen

Haas-ja-v1.0 es un modelo de reconocimiento automático del habla (ASR) para japonés desarrollado por Third Intelligence, diseñado para ser rápido y preciso a la vez. Su nombre es el acrónimo de *Hear Anything At Speed* y rinde homenaje a Helmut Haas, acústico conocido por el efecto Haas (efecto de precedencia) usado en tecnología de audio. En el momento de su lanzamiento, el modelo se sitúa en la frontera de Pareto de velocidad y precisión sobre un benchmark construido a partir de cinco conjuntos de datos públicos en japonés, y es el más preciso de los modelos abiertos evaluados por sus autores (CER estricto del 6,12 %).

Técnicamente, Haas-ja-v1.0 se basa en la arquitectura Parakeet-TDT de NVIDIA: un codificador FastConformer de unas 609 millones de parámetros combinado con un decodificador Token-and-Duration Transducer (TDT) cuya red de predicción sustituye la LSTM habitual por Kimi Delta Attention (KDA), lo que mejora la precisión manteniendo casi la misma velocidad de inferencia. Es competitivo con APIs comerciales de voz a texto a una fracción de su coste, lo que lo hace especialmente relevante para transcripción de audio en japonés con despliegue propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT con red de predicción KDA (decodificador) |
| Parámetros totales | 615,8 M (codificador 608,9 M, red de predicción 3,9 M, red conjunta 3,0 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de entrada en clips; soporte de transcripción de grabaciones largas mediante segmentación (transcribe_longform) |
| Tipos de cuantización | bfloat16 (precisión usada en la evaluación oficial); no disponible información sobre cuantizaciones adicionales |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint NeMo (.nemo), tamaño del repositorio 1,2 GB |

Otros detalles de entrada y tokenización:

| Propiedad | Valor |
|---|---|
| Entrada | Audio mono a 16 kHz; espectrograma log-mel de 128 bandas (ventana de 25 ms, salto de 10 ms) |
| Codificador | FastConformer, 24 capas, tamaño oculto 1.024, 8 cabezas de atención, submuestreo 8× (80 ms por fotograma), contexto completo |
| Red de predicción | Kimi Delta Attention, 2 capas, tamaño oculto 640, 5 cabezas × 64 |
| Red conjunta | Tamaño oculto 640; salidas de token y duración; duraciones de 0 a 4 fotogramas |
| Tokenizador | SentencePiece BPE entrenado con datos japoneses, 3.072 tokens, byte fallback |
| Decodificación | Greedy, por lotes (batched) |

## Capacidades

- Reconocimiento automático del habla en japonés con salida de texto transcrita.
- Transcripción de grabaciones largas (más de 30 segundos) mediante `transcribe_longform`, que divide el audio en puntos silenciosos detectados por volumen y transcribe los fragmentos por lotes.
- Vocabulario personalizado: se pueden listar nombres y términos poco frecuentes con sus lecturas (normalmente en kana) para aumentar su reconocimiento y forzar su forma escrita deseada, usando GPU phrase boosting de NeMo. Cada audio se decodifica también sin el vocabulario para evitar cambios no deseados, compartiendo una sola pasada del codificador.
- Entrada flexible de audio: lee WAV, FLAC, MP3 y OGG, convierte estéreo a mono por promedio y remuestrea a 16 kHz.
- Decodificación greedy por lotes, eficiente en GPU.
- Precisión competitiva con APIs comerciales de voz a texto en japonés.

No soporta: otros idiomas además del japonés, salida con marcas de tiempo detalladas (no documentada), ni ejecución en CPU o macOS (los kernels de flash-linear-attention requieren Triton y CUDA).

## Casos de uso

- Transcripción de reuniones y llamadas en japonés: gracias a `transcribe_longform`, puede procesar grabaciones de duración arbitraria dividiéndolas en silencios y transcribiendo por lotes en GPU, adecuado para actas y notas automáticas.
- Subtitulado de vídeo y podcasts en japonés: su alta velocidad de decodificación y su buen CER (6,12 % estricto) permiten procesar grandes volúmenes de contenido audiovisual con coste mínimo frente a APIs comerciales.
- Procesado masivo de archivos de audio (backlogs): el pipeline por lotes con batch_size configurable (por ejemplo, 64) permite transcribir colecciones completas de grabaciones en local sin coste por minuto.
- Sistemas con terminología propia (nombres de personas, productos, marcas): el vocabulario personalizado permite garantizar que términos específicos del dominio se escriban correctamente, útil en sectores médicos, legales o de medios.
- Preparación de datos para entrenar LLMs o modelos TTS en japonés: la transcripción automática de grandes corpus de audio (por ejemplo, de ReazonSpeech o YODAS) es un caso típico para generar pares audio-texto.
- Integración en aplicaciones Python de producción: el paquete `haas-asr` instalable por pip devuelve un objeto NeMo `ASRModel` estándar, lo que facilita integrarlo en servicios de transcripción propios con control total de los datos (privacidad, sin terceros).

## Benchmarks y rendimiento

Según la información de la model card, el modelo fue evaluado sobre un benchmark construido a partir de cinco conjuntos de datos públicos en japonés (benchmark asr-ja-bench), con inferencia en bfloat16 en GPU:

| Métrica | Valor |
|---|---|
| CER (estricto) | 6,12 % |

Los autores indican que es el modelo abierto más preciso de los evaluados en su benchmark y que se sitúa en la frontera de Pareto de velocidad y precisión. No se han publicado en la información disponible las cifras comparativas detalladas por dataset ni las comparaciones con modelos concretos; estos datos completos están en el blog post y el benchmark enlazados abajo.

## Requisitos de hardware

- Sistema operativo y plataforma: Linux con GPU NVIDIA (obligatorio); CPU y macOS no están soportados porque la red de predicción usa kernels de flash-linear-attention que requieren Triton y CUDA.
- Software: Python 3.11 o superior y NeMo 2.7.
- VRAM estimada: no disponible en la información proporcionada; con 615,8 M de parámetros en bfloat16, los pesos ocupan en torno a 1,2 GB, más la memoria de activaciones para lotes grandes.
- GPU recomendadas: no disponible una lista oficial; cualquier GPU NVIDIA moderna con soporte de bfloat16 y Triton (por ejemplo, RTX 3090/4090 o A100/H100) debería ser adecuada.
- Despliegue: mediante el paquete `haas-asr` (pip) o clonando el repositorio con `uv sync`; usa NeMo como librería base. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles cifras concretas; los autores lo sitúan en la frontera de Pareto de velocidad/precisión, con decodificación TDT que salta varios fotogramas del codificador a la vez.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Idioma | Licencia | Precisión publicada |
|---|---|---|---|---|---|
| Haas-ja-v1.0 | FastConformer + TDT (KDA) | 615,8 M | Japonés | Apache 2.0 | CER estricto 6,12 % (asr-ja-bench) |
| NVIDIA Parakeet-TDT (base de Haas) | FastConformer + TDT (LSTM) | No disponible en esta ficha | Principalmente inglés | No disponible en esta ficha | No disponible en esta ficha |
| Whisper (OpenAI) | Transformer encoder-decoder | No disponible en esta ficha | Multilingüe (incluye japonés) | MIT (según repo oficial) | No disponible en esta ficha |

Nota: los autores de Haas-ja-v1.0 lo comparan con modelos abiertos y APIs comerciales de voz a texto en su benchmark asr-ja-bench; los resultados completos están en el blog post enlazado. No se dispone de cifras comparativas directas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta japonés; no es un modelo multilingüe.
- No funciona en CPU ni en macOS: requiere Linux con GPU NVIDIA, Triton y CUDA, lo que limita el despliegue en entornos sin GPU.
- Requiere versiones concretas del stack (Python 3.11+, NeMo 2.7), lo que puede complicar la integración en entornos existentes.
- El phrase boosting con vocabulario personalizado puede alterar texto en zonas donde no se pronunció ninguna palabra listada; el sistema mitiga esto decodificando cada audio también sin vocabulario, pero conviene validar los resultados en producción.
- No se documenta soporte de marcas de tiempo por palabra, diarización de hablantes ni traducción.
- Al ser un modelo ASR, puede cometer errores en nombres propios, términos técnicos poco frecuentes o audio con ruido; el CER estricto del 6,12 % indica que aproximadamente 1 de cada 16 caracteres puede ser erróneo en los datasets evaluados.
- Sesgos: entrenado con ReazonSpeech y YODAS, su rendimiento puede variar según el dominio, acento o calidad de audio respecto a esos corpus.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Repositorio de código (GitHub): https://github.com/third-intelligence/Haas-ASR
- Demo en Hugging Face Space: https://third-intelligence-haas-ja-v1-0.hf.space/longform
- Blog post de lanzamiento: https://third-intelligence.com/ja/posts/haas-ja-v1-release
- Benchmark asr-ja-bench: https://huggingface.co/datasets/third-intelligence/asr-ja-bench
- Métrica jacer (GitHub): https://github.com/third-intelligence/jacer
- Kernels flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Documentación de GPU phrase boosting de NeMo: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/asr_customization/word_boosting.html
- Papers referenciados: arXiv:2305.05084, arXiv:2304.06795, arXiv:2510.26692
- Datasets de entrenamiento: https://huggingface.co/datasets/reazon-research/reazonspeech y https://huggingface.co/datasets/espnet/yodas
