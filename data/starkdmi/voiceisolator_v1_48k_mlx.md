# starkdmi/VoiceIsolator_v1_48K_MLX

## Resumen

Voice Isolator v1 48K (MLX) es la conversion al formato MLX del modelo `inworld/voice-isolator` de Inworld AI, un aislador de voz offline que procesa audio mono a 48 kHz. El modelo separa la voz del ruido de fondo y devuelve ambas senales, lo que permite desde limpiar grabaciones de campo hasta generar pistas instrumentales a partir de una mezcla. La relevancia de esta version concreta reside en que el autor (starkdmi) ha reempaquetado los pesos originales de PyTorch en safetensors optimizados para MLX, con precisiones fp16 y fp32, y ha publicado el codigo de inferencia en MLX Swift.

Arquitectonicamente no es un transformer generativo: es una red band-split dual-path que opera sobre la STFT, combinando atencion y Mamba bidireccional por bandas de frecuencia. Con 64,0 M de parametros y un peso de 152 MiB en fp16, es un modelo muy ligero que cabe sin problemas en cualquier equipo Apple Silicon. Los audios largos se procesan en ventanas de 8 segundos con crossfade de 2 segundos, de modo que cada frame dispone de contexto completo dentro de su ventana.

El modelo es interesante ahora porque demuestra que tareas de mejora de voz de calidad profesional pueden ejecutarse en local, en un portatil, sin GPU dedicada y con latencia inferior al tiempo real. La licencia Apache-2.0 y la disponibilidad de los pesos en MLX lo convierten en una pieza util para pipelines de podcast, transcripcion y produccion audiovisual en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Band-split dual-path network (atencion + Mamba bidireccional) sobre STFT |
| Parametros totales | 64,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 8 s con crossfade de 2 s (audio mono a 48 kHz) |
| Tipos de cuantizacion | fp16 (recomendada) y fp32 (referencia); no se documentan cuantizaciones de 8 o 4 bits |
| Idiomas soportados | no disponible (procesamiento agnostico al idioma, orientado a voz) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, `format: voice-isolator-mlx`, `format_version: 3`) |

## Arquitectura y entrenamiento

El modelo es un aislador de voz que trabaja en el dominio de la STFT con una ventana Hann de 2048 muestras. La red divide el espectro en 46 bandas de frecuencia, cada una con su propio encoder y cabeza de decodificacion, empaquetados como tensores batcheados con padding. Sobre esa representacion por bandas se aplica un esquema dual-path que combina atencion y Mamba bidireccional; las dos direcciones de Mamba se apilan y sus proyecciones de salida se pliegan en float64 durante la conversion. La salida es la senal de voz aislada, y el ruido de fondo se obtiene por resta de la mezcla original.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que los pesos son de Inworld AI y que el fichero NOTICE recoge las atribuciones de datos de entrenamiento. La innovacion tecnica mas destacable del empaquetado MLX es la preservacion exacta de los bits float32 de `torch.hann_window(2048)` en la clave `stft.window`, y el mantenimiento en float32 de los parametros de scan, las proyecciones de salida de Mamba y la ventana, porque en el modelo offline las activaciones pre-norm exceden el rango de float16.

## Capacidades

- Aislamiento de voz: separa la locucion limpia de una mezcla mono a 48 kHz y devuelve la voz y, por resta, el fondo.
- Supresion de ruido: elimina ruido estacionario y no estacionario sin necesidad de una muestra de referencia del ruido.
- Procesamiento offline de audio largo: renderiza en ventanas de 8 s con crossfade de 2 s, de modo que cada frame ve su ventana completa.
- Salida dual: la API permite obtener la voz y reconstruir el fondo con `zip(samples, voice).map { $0 - $1 }`.
- Progreso de inferencia: el metodo `isolate` acepta un callback de progreso (`done` de 0 a 1).
- Precision configurable: computo fp16 por defecto y fp32 para referencia o validacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo audio-a-audio puro.
- No procesa vision, texto ni audio estereo; la entrada es mono a 48 kHz.

## Casos de uso

- Limpieza de entrevistas y podcast: se pasa la grabacion completa por el modelo y se obtiene una pista de voz sin ruido de sala, ventilacion o trafico; la ventana de 8 s con crossfade evita cortes audibles en conversaciones largas.
- Preprocesado para transcripcion automatica: aislar la voz antes de enviarla a un ASR reduce errores en entornos ruidosos (calles, oficinas abiertas) y mejora la precision de la transcripcion sin tocar el modelo de reconocimiento.
- Produccion musical y karaoke: al restar la voz aislada de la mezcla original se obtiene una pista instrumental aproximada, util para versiones, remixes o practica.
- Restauracion de archivos historicos: grabaciones de campo, entrevistas antiguas o notas de voz con hiss y ruido de cinta pueden recuperar inteligibilidad antes de archivarlas o publicarlas.
- Videollamadas y reuniones grabadas: limpiar las pistas de cada participante antes de generar actas o subtitulos, especialmente cuando se graba con microfonos de portatil.
- Doblaje y postproduccion: separar la voz del ambiente para sustituir el fondo por otra atmosfera o musica sin perder la locucion original.
- Aplicaciones macOS nativas: al estar en MLX Swift, puede integrarse en una app de escritorio que procese audio en local sin enviar datos a la nube, con latencia de 1,34 s por ventana de 8 s en un M4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (SI-SDR, PESQ, STOI) en la informacion disponible. La model card unicamente aporta medidas de fidelidad de la conversion y de velocidad:

| Metrica | Valor |
|---|---|
| Diferencia maxima fp32 MLX vs PyTorch CPU float32 | 5,4e-7 |
| SNR fp16 vs fp32 en cuatro clips de demo | 63-78 dB |
| Diferencia de denoising fp16 vs fp32 (SI-SDR) | <= 0,02 dB |
| Tiempo por ventana de 8 s en Apple M4 (10-core GPU), fp16 | 1,34 s |
| Tiempo por ventana de 8 s en Apple M4 (10-core GPU), fp32 | 1,66 s |

## Requisitos de hardware

- VRAM estimada: 152 MiB para los pesos fp16 y 272 MiB para fp32; el consumo total en ejecucion es del orden de unos cientos de MiB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con MLX; las medidas publicadas corresponden a un M4 de 10 nucleos de GPU.
- Cabe en consumer GPU: si, en cualquier Mac con Apple Silicon; tambien en GPUs NVIDIA de gama baja si se porta a otro runtime, aunque el paquete publicado es especifico de MLX.
- Opciones de despliegue: MLX Swift mediante la libreria `VoiceIsolatorMLX` (https://github.com/starkdmi/VoiceIsolatorMLX); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1,34 s por ventana de 8 s en fp16 en un M4, es decir, aproximadamente 6x mas rapido que tiempo real; en fp32, 1,66 s por ventana.
- Almacenamiento: el repositorio completo ocupa 0,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| starkdmi/VoiceIsolator_v1_48K_MLX | 64,0 M | 48 kHz mono | safetensors MLX | Apache-2.0 | Aislamiento de voz offline en Apple Silicon |
| inworld/voice-isolator | 64,0 M | 48 kHz mono | PyTorch | Apache-2.0 | Modelo original del que deriva esta conversion |
| starkdmi/VoiceIsolator_v1_Realtime_48K_MLX | no disponible | 48 kHz mono | safetensors MLX | no disponible | Variante en streaming del mismo autor |

No se dispone de datos de benchmarks comparativos con otros aisladores de voz (por ejemplo, Demucs o separadores tipo MossFormer) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Entrada mono a 48 kHz: no procesa estereo ni otras frecuencias de muestreo sin remuestreo previo.
- Ventanas de 8 s: aunque el crossfade de 2 s suaviza las transiciones, audios muy largos requieren gestion por ventanas y pueden presentar artefactos en los bordes si el crossfade no se aplica correctamente.
- Sin datos de sesgo ni de robustez multilingue: la model card no documenta evaluacion por idiomas ni por tipos de ruido, por lo que el comportamiento en condiciones no vistas (ruido musical, reverberacion fuerte) es incierto.
- Riesgo de sobre-supresion: en mezclas donde la voz y el fondo comparten rango espectral, el modelo puede atenuar parte de la locucion; conviene validar con SI-SDR sobre grabaciones propias.
- Licencia Apache-2.0 permite uso comercial, pero los pesos son de Inworld AI (Copyright 2026) y el fichero NOTICE recoge atribuciones de datos de entrenamiento que deben conservarse.
- Dependencia de MLX: el paquete esta pensado para MLX Swift en Apple Silicon; su uso en otras plataformas requiere convertir los pesos de vuelta o portar la implementacion.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente de los resultados.
- El modelo no genera texto ni razona: no debe emplearse para tareas de comprension o generacion, solo para separacion de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starkdmi/VoiceIsolator_v1_48K_MLX
- Modelo base original: https://huggingface.co/inworld/voice-isolator
- Codigo de inferencia MLX Swift: https://github.com/starkdmi/VoiceIsolatorMLX
- Variante en streaming: https://huggingface.co/starkdmi/VoiceIsolator_v1_Realtime_48K_MLX
