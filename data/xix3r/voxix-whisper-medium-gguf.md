# xix3r/voxix-whisper-medium-gguf

## Resumen

Voxix-whisper-medium-gguf es una conversión a formato GGUF del modelo openai/whisper-medium, empaquetada por el usuario xix3r para su uso con transcribe.cpp, un runtime de inferencia de código abierto orientado a modelos de reconocimiento automático del habla. El modelo subyacente es Whisper medium, un transformer encoder-decoder de OpenAI entrenado con 680.000 horas de audio etiquetado mediante supervisión débil, publicado originalmente en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Esta conversión concreta permite ejecutar el modelo en CPU, Metal y Vulkan sin depender del ecosistema Python de transformers.

El interés de esta ficha radica en que ofrece una vía de despliegue ligera y portable para un modelo ASR multilingüe consolidado: el repositorio ocupa 0,8 GB y las cuantizaciones van desde 481 MB (Q4_K_M) hasta 2,85 GB (F32), con una degradación de WER prácticamente nula respecto a F32 en la mayoría de cuantizaciones. Con 763.874.400 parámetros y soporte para 99 idiomas, cubre transcripción multilingüe, detección de idioma y traducción de voz a texto en inglés.

La relevancia actual es doble: por un lado, valida que Whisper medium puede ejecutarse en hardware de consumo con pérdida mínima de calidad; por otro, introduce un runtime alternativo (transcribe.cpp) que compite con whisper.cpp y con las implementaciones basadas en PyTorch, con métricas de RTF publicadas tanto en Apple Silicon como en CPUs AMD con Vulkan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 763.874.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Whisper medium es un transformer encoder-decoder entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. El encoder procesa espectrogramas log-Mel de ventanas de 30 segundos y el decoder genera texto autorregresivamente, con tokens especiales que controlan la tarea (transcripción o traducción), el idioma y la emisión de marcas temporales. El modelo base fue entrenado por OpenAI con datos multilingües y multitarea, sin fine-tuning específico por dominio, lo que le confiere una capacidad de generalización notable a datasets y acentos no vistos.

Esta conversión concreta no reentrena ni modifica los pesos: se limita a transformar los pesos originales de openai/whisper-medium (commit abdf7c3, fijado el 2026-04-25) al formato GGUF para transcribe.cpp, validada contra la referencia de transformers en el commit 5.6.1 del runtime (2026-04-26). El pipeline de decodificación de transcribe.cpp usa greedy decoding con suppress_tokens, fallback de temperatura y marcas temporales a nivel de segmento activadas por defecto. No se documenta en la información disponible si hubo RLHF, DPO ni ajustes posteriores sobre el modelo base.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas, con salida en el mismo idioma que el audio.
- Detección automática del idioma del audio (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Marcas temporales a nivel de segmento (`timestamps: segment`).
- Decodificación de audio largo mediante chunks sucesivos de 30 segundos.
- No soporta streaming nativo (`streaming: false`): el audio debe procesarse por ventanas completas.
- No es un modelo de tool calling, agentes ni razonamiento multi-paso; su ámbito es exclusivamente ASR y traducción de voz.
- No incorpora capacidades de visión ni de audio-vision.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de cualquier duración mediante chunks de 30 segundos y devuelve marcas temporales por segmento, lo que permite generar actas con timestamps alineados y facilitar la revisión posterior.
- Subtitulado automático de vídeo: combinando la salida con timestamps de segmento y la detección de idioma, se puede generar un flujo de subtitulado multilingüe sin intervención manual, útil para plataformas de contenido.
- Traducción de voz a inglés para investigación: con `translate: true`, un investigador puede transcribir entrevistas en cualquier idioma soportado directamente a inglés, evitando un pipeline de dos etapas (ASR + traducción textual).
- Despliegue en dispositivos de borde: la cuantización Q4_K_M (481 MB) permite ejecutar el modelo en portátiles y mini-PC sin GPU dedicada, con RTF de 3 en CPU en Apple M4 Max y 1,1 en Ryzen 4750U, suficiente para transcripción por lotes no interactiva.
- Transcripción en CPU con aceleración Vulkan: en un Ryzen 4750U con Vulkan se alcanza un RTF de 4,3, lo que hace viable el procesamiento en equipos AMD sin GPU discreta.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp acepta WAV de 16 kHz mono y puede integrarse en scripts de automatización para transcribir grandes volúmenes de grabaciones con coste computacional bajo.
- Investigación en ASR multilingüe: al estar disponible en GGUF y con licencia Apache-2.0, sirve como baseline reproducible para comparar cuantizaciones y runtimes sin depender de PyTorch.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances), decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, fallback de temperatura, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,63 % |
| F16 | 1,44 GB | 2,63 % |
| Q8_0 | 793 MB | 2,64 % |
| Q6_K | 618 MB | 2,59 % |
| Q5_K_M | 556 MB | 2,62 % |
| Q4_K_M | 481 MB | 2,59 % |

El dato autoinformado por OpenAI sobre el mismo split es 2,90 %. La diferencia se atribuye probablemente a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que transcribe.cpp ejecuta con timestamps activados. Las cifras provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones, principalmente por alucinaciones en clips cortos cerca del suelo de ruido.

Rendimiento (RTF, mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 41,6 |
| Apple M4 Max | CPU | 3,0 |
| AMD Ryzen 4750U | Vulkan | 4,3 |
| AMD Ryzen 4750U | CPU | 1,1 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en CPU, Metal o Vulkan. El peso en memoria coincide aproximadamente con el tamano del archivo GGUF: 481 MB (Q4_K_M) hasta 2,85 GB (F32), más overhead del runtime.
- GPU recomendadas: no se especifican GPU discretas en la información disponible; los datos publicados corresponden a Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en hardware de consumo: sí, con cuantizaciones Q4_K_M y Q5_K_M (481-556 MB) en cualquier portátil moderno; la versión F32 (2,85 GB) también cabe en equipos con 8 GB de RAM.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documentan bindings para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 41,6 en M4 Max con Metal (unas 41,6 veces más rápido que tiempo real), 3,0 en CPU del mismo equipo, 4,3 en Ryzen 4750U con Vulkan y 1,1 en CPU del Ryzen. El formato de entrada debe ser WAV de 16 kHz mono; para otros formatos se requiere conversión previa con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---:|---|---|---:|
| Voxix-whisper-medium-gguf (este) | 763.874.400 | 30 s por ventana, chunks para audio largo | 99 | Apache-2.0 | GGUF | 2,59-2,64 % (Q4_K_M a Q8_0) |
| openai/whisper-medium (original) | 763.874.400 | 30 s por ventana | 99 | Apache-2.0 | safetensors / PyTorch | 2,90 % (autoinformado) |
| openai/whisper-small | no disponible en la información | 30 s por ventana | 99 | Apache-2.0 | safetensors / PyTorch | no disponible en la información |
| whisper.cpp (conversiones GGUF de terceros) | depende del modelo base | 30 s por ventana | depende del modelo base | depende del modelo base | GGUF | no disponible en la información |

La comparación directa más fiable es contra el modelo original de OpenAI: misma arquitectura y pesos, distinto runtime y pipeline de decodificación. Las alternativas whisper-small y whisper.cpp no cuentan con datos de rendimiento en la información proporcionada, por lo que no se pueden comparar numéricamente aquí.

## Limitaciones y advertencias

- Riesgo de alucinación en clips cortos o con ruido de fondo: el propio autor documenta que las diferencias de WER entre ejecuciones con Metal se deben en gran parte a "short-clip hallucination outcomes on the noise floor".
- No soporta streaming: `streaming: false` implica que no se puede usar para transcripción en tiempo real con alimentación continua de audio; hay que esperar a completar ventanas de 30 segundos.
- Ventana de audio fija de 30 segundos: el audio más largo se procesa por chunks, lo que puede introducir errores en las fronteras entre segmentos.
- Requiere entrada WAV de 16 kHz mono; cualquier otro formato necesita conversión previa con ffmpeg, lo que anade una dependencia externa al pipeline.
- Dependencia de un runtime poco extendido: transcribe.cpp no tiene el ecosistema de whisper.cpp ni de transformers; la integración en producción exige compilar desde fuente y asumir el mantenimiento del binario.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web a gran escala, es esperable un rendimiento desigual entre idiomas y acentos, con peor calidad en idiomas de bajos recursos.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial, pero sujeta a los términos del modelo original de OpenAI; conviene revisar la model card upstream para obligaciones de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-13; se trata de una conversión reciente y sin validación comunitaria amplia.
- La validación numérica se hizo contra transformers en un único commit de transcribe.cpp (5.6.1), lo que no garantiza equivalencia con futuras versiones del runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-whisper-medium-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium
- Commit del modelo base fijado: https://huggingface.co/openai/whisper-medium/commit/abdf7c3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
