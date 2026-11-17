# yeowon/qwen3_asr_1.7b_ko-MLX-4bit

## Resumen

`yeowon/qwen3_asr_1.7b_ko-MLX-4bit` es una cuantización de 4 bits en formato MLX del modelo de reconocimiento automático del habla (ASR) en coreano `TeamUNIVA/qwen3_asr_1.7b_ko`, que a su vez deriva del `Qwen/Qwen3-ASR-1.7B` de Alibaba. El modelo original es un sistema ASR de tipo encoder-decoder: un encoder de audio que procesa la señal acústica y un decoder basado en la arquitectura Qwen3 de 28 capas que genera la transcripción como tokens de texto. Esta versión, publicada por el usuario yeowon, aplica cuantización de grupo (`group_size=64`) tanto al encoder de audio como al decoder de texto, reduciendo el peso de 4,48 GB en BF16 a 1,07 GB, un 75,5 % menos.

El objetivo de esta variante es hacer viable la inferencia ASR en coreano sobre Apple Silicon (M1/M2/M3/M4) sin GPU dedicada, con tiempos de carga de aproximadamente 0,43 segundos en un M1 Pro y un RTF medio de 0,133x (unas 7,5 veces más rápido que tiempo real) sobre un conjunto de prueba de 26,34 segundos de audio. Frente a la versión BF16 original, que consume 3.887 MB y opera a 0,210x de RTF, la versión INT4 reduce el uso de memoria un 71,7 % y mejora el throughput un 36,6 %, a costa de la pérdida de precisión inherente a la cuantización de 4 bits.

Es relevante ahora porque el ecosistema MLX permite ejecutar modelos de reconocimiento de voz especializados en idiomas distintos del inglés directamente en portátiles y equipos de sobremesa con chip de Apple, sin depender de servicios en la nube ni de GPUs NVIDIA. La licencia Apache-2.0 facilita su integración en productos comerciales, aunque el alcance lingüístico se limita al coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: encoder de audio + decoder transformer Qwen3 de 28 capas |
| Parametros totales | 2.038.052.480 (~2,04 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 4-bit con `group_size=64` (Linear 4-bit; Conv2D y capas Norm en BF16); el modelo base admite BF16 e INT8 en decoder |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX cuantizado (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder típico de ASR. El encoder de audio (`audio_tower.*`, 176,4 MB tras cuantización) transforma la señal de entrada en representaciones latentes; el decoder (`model.*`, 923,2 MB) es un transformer Qwen3 de 28 capas con vocabulario de 151.936 tokens y embeddings atados (*tied embeddings*), que genera la transcripción token a token condicionada por las representaciones de audio. La cuantización aplicada en esta versión afecta a las capas lineales de ambos componentes, mientras que las convoluciones 2D y las capas de normalización se mantienen en BF16 para preservar estabilidad numérica.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si el fine-tuning de `TeamUNIVA/qwen3_asr_1.7b_ko` empleó RLHF, DPO o ajuste supervisado convencional. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; la model card se centra en el proceso de cuantización y en las mediciones de rendimiento, no en el entrenamiento del modelo base.

## Capacidades

- Transcripción de voz a texto en coreano, con salida de texto plano a partir de ficheros WAV.
- Procesamiento de audio de duración variable; el conjunto de prueba documentado cubre clips de 2,50 s, 7,20 s y 16,64 s.
- Inferencia en tiempo real mediante servidor web integrado con entrada de micrófono en streaming (modo `--serve` en el script incluido).
- Carga rápida de pesos pre-cuantizados (aproximadamente 0,43 s en Apple M1 Pro).
- Ejecución exclusiva sobre Apple Silicon mediante MLX; no se documenta soporte para CUDA, ROCm ni CPU genérica.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modos de pensamiento extendido.

## Casos de uso

- Transcripción de reuniones y clases en coreano: el modelo procesa clips de audio de hasta decenas de segundos con un RTF de 0,133x, lo que permite transcribir una hora de audio en unos ocho minutos en un M1 Pro, sin enviar datos a la nube.
- Subtitulado automático de vídeo en coreano: la velocidad de 7,5x tiempo real y el bajo consumo de memoria (1,1 GB) permiten ejecutar el pipeline de subtitulado en paralelo con otras tareas en un portátil Apple Silicon.
- Dictado por voz en aplicaciones de escritorio: el servidor de streaming incluido (`--serve --port 7860`) expone una interfaz web con micrófono, adecuada para integrarse en herramientas de productividad o editores de texto.
- Investigación lingüística sobre coreano hablado: la licencia Apache-2.0 y el formato abierto permiten usar el modelo como componente de pipelines de análisis fonético o de evaluación de corpus, con la advertencia de que la cuantización de 4 bits puede introducir errores en fonemas poco frecuentes.
- Prototipado rápido en entornos sin GPU: desarrolladores que trabajan en Mac pueden validar ideas de ASR en coreano antes de escalar a infraestructura con GPUs, gracias a los 1,07 GB de pesos y la carga en menos de medio segundo.
- Aplicaciones de accesibilidad para hablantes de coreano: transcripción en tiempo real de conversaciones presenciales en un dispositivo local, con la ventaja de que el audio no abandona el equipo del usuario.
- Transcripción de notas de voz en aplicaciones móviles o de escritorio para macOS: el tamaño reducido del modelo permite incluirlo en el bundle de una aplicación sin dependencias externas.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a mediciones de inferencia sobre tres audios coreanos (26,34 s en total) en un Apple M1 Pro de 16 GB, no a benchmarks estándar de ASR (WER, CER) ni a evaluaciones comparativas con otros modelos.

| Configuracion | Memoria total | Memoria encoder | Memoria decoder | Tiempo total (3 audios) | RTF medio | Velocidad vs tiempo real |
|---|---|---|---|---|---|---|
| MLX BF16 (original) | 3.887,3 MB | 605,5 MB | 3.281,7 MB | 5.533,3 ms | 0,210x | 4,8x |
| MLX INT8 (decoder 8-bit) | 2.349,1 MB | 605,5 MB | 1.743,5 MB | 3.707,1 ms | 0,141x | 7,1x |
| MLX INT4 (encoder y decoder 4-bit, este modelo) | 1.099,6 MB | 176,4 MB | 923,2 MB | 3.499,4 ms | 0,133x | 7,5x |

No se han publicado resultados de benchmarks estándar (WER, CER, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 1,07 GB de pesos en INT4, más el overhead del runtime MLX y los buffers de audio; el consumo real medido en M1 Pro es de 1.099,6 MB para todo el modelo.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para NVIDIA A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: sí, en cualquier Mac con chip de Apple y al menos 8 GB de memoria unificada; el modelo ocupa poco más de 1 GB.
- Opciones de despliegue: librería `mlx` de Apple, paquete `qwen3-asr-mlx` y el script `mlx_quantized_asr.py` incluido en el repositorio, que ofrece modo CLI y servidor web con streaming de micrófono. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF medio de 0,133x en M1 Pro (7,5x tiempo real); tiempo de carga de aproximadamente 0,43 s desde el repositorio de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `yeowon/qwen3_asr_1.7b_ko-MLX-4bit` (este modelo) | ~2,04 mil millones | No disponible | Coreano | Apache-2.0 | MLX safetensors 4-bit | Solo Apple Silicon; RTF 0,133x en M1 Pro |
| `TeamUNIVA/qwen3_asr_1.7b_ko` | ~2,04 mil millones | No disponible | Coreano | Apache-2.0 | Safetensors (BF16/FP16) | Modelo base sin cuantizar; requiere más memoria (4,48 GB) |
| `Qwen/Qwen3-ASR-1.7B` | ~1,7 mil millones | No disponible | Multilingüe (no detallado) | Apache-2.0 (según modelo base) | Safetensors | Modelo original de Alibaba; no especializado en coreano |
| Whisper large-v3 (referencia de la categoría) | 1.550 millones | 30 s de audio | Multilingüe | MIT | Safetensors, GGUF, MLX | No se dispone de comparación directa de WER con este modelo en la información proporcionada |

La comparación con Whisper large-v3 se incluye como referencia de categoría, pero no se han publicado métricas de calidad (WER/CER) que permitan establecer una comparación objetiva con este modelo.

## Limitaciones y advertencias

- Especialización monolingüe: el modelo solo está entrenado y evaluado para coreano; su uso con otros idiomas no está soportado y probablemente produzca transcripciones incorrectas.
- Ausencia de métricas de calidad: no se publican valores de WER ni CER, por lo que no es posible cuantificar la degradación introducida por la cuantización de 4 bits frente al modelo base en BF16.
- Dependencia de plataforma: requiere Apple Silicon y la librería MLX; no funciona en GPUs NVIDIA, AMD ni en CPU genérica, lo que limita su despliegue en servidores convencionales.
- Riesgo de alucinación y errores en audio ruidoso: como todo modelo ASR, puede generar texto plausible pero incorrecto en segmentos con ruido, solapamiento de hablantes o vocabulario técnico poco frecuente; la cuantización agresiva puede agravar este comportamiento.
- Sesgos no documentados: no se dispone de información sobre la composición demográfica o dialectal del corpus de entrenamiento, por lo que se desconoce el sesgo hacia determinados acentos o registros del coreano.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; además, el modelo base `Qwen3-ASR-1.7B` puede tener condiciones adicionales que conviene verificar antes de un despliegue en producción.
- Modelo de la comunidad: se trata de una cuantización no oficial publicada por un usuario independiente, con 117 descargas y 0 likes en el momento de la consulta, sin proceso de revisión por parte del equipo de Qwen o TeamUNIVA.
- La model card incluye llamadas a donaciones y enlaces de pago que no afectan al funcionamiento del modelo, pero conviene ignorar como parte de la documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-MLX-4bit
- Modelo base (fine-tuning coreano): https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Foro de discusión del modelo: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-MLX-4bit/discussions
- Aplicación Talkit del mismo autor: https://github.com/muzuksazo/desktop-recorder
- Página de donaciones del autor (Buy Me a Coffee): https://buymeacoffee.com/tripleyoung
