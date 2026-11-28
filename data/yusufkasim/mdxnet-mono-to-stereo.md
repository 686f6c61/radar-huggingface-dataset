# yusufkasim/mdxnet-mono-to-stereo

## Resumen

MDXNet Mono-to-Stereo es un modelo de audio-a-audio desarrollado por el usuario yusufkasim que convierte audio monofónico en estéreo natural y amplio. Se basa en la arquitectura MDXNet (ConvTDFNet), una U-Net con bloques TFC-TDF, y está empaquetado exclusivamente en formato ONNX para su ejecución con ONNX Runtime. El modelo resuelve un problema clásico de postproducción musical y restauración de audio: la expansión estéreo de fuentes mono sin artefactos ni pérdida de naturalidad.

El modelo destaca por su relación calidad-rendimiento. Con solo 10,92 millones de parámetros y un peso de entre 20,9 MB (FP16) y 41,7 MB (FP32), alcanza velocidades de aproximadamente 56-60x tiempo real en GPUs de consumo, y funciona también en CPU y navegadores móviles mediante WebGPU o WASM. El autor lo posiciona explícitamente como alternativa a los modelos Roformer, más pesados y lentos, para tareas de upmixing.

La relevancia actual del modelo radica en su portabilidad: al no depender de PyTorch y distribuirse como ONNX con Opset 17, puede integrarse en pipelines de producción ligeros, aplicaciones de escritorio, plugins de audio y demos web. Está entrenado sobre más de 100 canciones estéreo reales y aplica un ensanchamiento consciente de los elementos musicales, diferenciando voces principales, coros y otros instrumentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDXNet (`MonoToStereoConvTDFNet`), U-Net TFC-TDF de 11 bloques |
| Parametros totales | 10.916.226 (~10,92 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa chunks de 261.120 muestras (~5,92 s) a 44,1 kHz |
| Tipos de cuantizacion | FP16 y FP32 (ONNX) |
| Idiomas soportados | No aplica (modelo de audio); la model card declara `en` como idioma |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 17); FP16 ~20,9 MB y FP32 ~41,7 MB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MDXNet basada en ConvTDFNet: una U-Net de 11 bloques con capas TFC-TDF (Time-Frequency Convolution con Transform-Domain Filtering) que opera directamente sobre representaciones tiempo-frecuencia. La entrada es un tensor `[1, 2, 3072, 256]` que contiene las partes real e imaginaria del espectrograma STFT del canal mono, y la salida es un tensor `[1, 4, 3072, 256]` con las componentes real e imaginaria de los canales izquierdo y derecho. La STFT usa `n_fft = 6144`, `hop_length = 1024` y ventana Hann periódica a 44,1 kHz, con 3.072 bins de frecuencia y 256 frames temporales por chunk.

El entrenamiento se realizó sobre más de 100 canciones estéreo reales con imagen estéreo amplia, lo que permite al modelo distinguir elementos musicales (voz principal, coros, instrumentos) y decidir cuáles deben permanecer centrados y cuáles conviene ensanchar. No se detallan en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de audio de estas características. La innovación principal es el enfoque de ensanchamiento consciente de los elementos y la optimización para inferencia portátil sin PyTorch.

## Capacidades

- Conversión de audio mono a estéreo con imagen estéreo natural y amplia.
- Diferenciación de elementos musicales (voz principal, coros, instrumentos) para aplicar ensanchamiento selectivo.
- Salida estéreo que se mantiene natural tanto en reproducción estéreo como en downmix a mono.
- Procesamiento por chunks de ~5,92 segundos con pipeline de 3 etapas en NumPy y ONNX Runtime.
- Inferencia en GPU (CUDA, DirectML, CoreML), CPU y navegador (WebGPU con `shader-f16` o WASM).
- Acepta entradas en WAV, FLAC, MP3 y otros formatos; las entradas estéreo se promedian a mono antes del procesamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de audio-a-audio.

## Casos de uso

- Restauración de grabaciones históricas: digitalización de archivos mono de vinilo, cinta o radio y generación de una versión estéreo para reediciones, usando el pipeline ONNX ligero que puede ejecutarse en un portátil sin GPU dedicada.
- Postproducción musical y remasterización: ampliación de pistas mono en maquetas o stems antes de mezclar, aprovechando la diferenciación de elementos para no ensanchar en exceso la voz principal.
- Producción de podcast y locución: conversión de voces grabadas en mono a un estéreo sutil que mejore la sensación de espacio sin romper el downmix en reproductores mono.
- Aplicaciones web de audio: integración del modelo FP16 en una demo WebGPU o WASM en el navegador, como el Space oficial, para ofrecer upmixing sin backend ni instalación.
- Plugins de DAW y herramientas de escritorio: empaquetado del ONNX FP32 con DirectML o CoreML para ofrecer upmixing en tiempo casi real dentro de un editor de audio.
- Procesamiento por lotes en servidores modestos: conversión de catálogos completos de audio mono con ONNX Runtime en CPU, gracias a los ~20,9 MB del modelo y a la velocidad de 56-60x tiempo real en GPU.
- Preprocesado en pipelines de generación musical o de separación de fuentes: normalización de entradas mono a estéreo antes de alimentar otros modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una velocidad de inferencia de aproximadamente 56-60x tiempo real en GPUs de consumo para la variante FP16, sin métricas objetivas de calidad (por ejemplo, PSNR, SI-SDR o evaluaciones perceptuales) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo FP16 ocupa ~20,9 MB y el FP32 ~41,7 MB, por lo que la VRAM necesaria es mínima (del orden de cientos de MB incluyendo buffers de activaciones y del pipeline).
- GPU recomendadas: cualquier GPU con soporte CUDA, DirectML (AMD, Intel, NVIDIA) o CoreML; no requiere GPUs de datacenter como A100 o H100.
- Cabe holgadamente en cualquier GPU de consumo, incluidas las integradas y las de portátiles; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`, `onnxruntime-gpu`, `onnxruntime-directml`), WebGPU y WASM en navegador; no requiere PyTorch.
- Latencia y throughput: ~56-60x tiempo real en GPUs de consumo con FP16; en CPU y navegador la velocidad es menor pero funcional, sin cifras concretas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MDXNet Mono-to-Stereo (este) | ~10,92 M | Chunks de ~5,92 s a 44,1 kHz | MDXNet ConvTDFNet, ONNX | MIT | Hugging Face, ONNX Runtime, WebGPU/WASM |
| Modelos Roformer para upmixing | No disponible | No disponible | Transformer, mayor calidad y coste | No disponible | No disponible |
| Otros modelos mono-to-stereo | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card menciona los modelos Roformer como alternativa de mayor calidad pero mucho más lentos y pesados en equipos de escritorio y móviles; no se proporcionan parámetros, contexto ni licencia de esos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo de audio: no procesa texto, código ni razonamiento; cualquier expectativa de LLM es inaplicable.
- El ensanchamiento estéreo es una estimación; puede introducir artefactos o una imagen estéreo poco realista en material muy reverberante, con ruido o con fuentes mono puras no musicales.
- El procesamiento por chunks de ~5,92 s puede generar discontinuidades en las uniones si el pipeline no aplica solapamiento y ventanas de crossfade; la model card no detalla el manejo de bordes.
- Entrenado principalmente con música estéreo real; el rendimiento en voz hablada, efectos de sonido o audio de campo puede ser inferior al esperado.
- No se han publicado evaluaciones objetivas de calidad ni comparaciones con otros modelos, por lo que la calidad real debe validarse en el caso de uso concreto.
- Riesgo de sesgo hacia el tipo de música y la producción del dataset de entrenamiento (más de 100 canciones), con posible menor generalización a géneros o grabaciones atípicas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la calidad del resultado ni sobre posibles reclamaciones de derechos sobre el audio procesado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusufkasim/mdxnet-mono-to-stereo
- Demo en el navegador (WebGPU / WASM): https://huggingface.co/spaces/yusufkasim/mdxnet-mono-to-stereo
