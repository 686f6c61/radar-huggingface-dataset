# suryatmodulus/ema-lightning

## Resumen

EMA Lightning es un sistema de sintesis de voz (text-to-speech) para turco publicado por el usuario suryatmodulus en HuggingFace. Se compone de un modelo acustico DiT (Diffusion Transformer) de 5,6 millones de parametros y un vocoder de 3 millones, lo que da un total de 8,6 millones de parametros y aproximadamente 34 MB de pesos. La licencia es Apache 2.0 y el unico idioma declarado es el turco (tr).

El modelo resuelve el problema de la sintesis de voz en turco con un coste computacional muy bajo: segun la model card, obtiene un 0,92% de WER en el conjunto Freya-TR-Eval, el valor mas bajo de todos los sistemas medidos segun el autor, incluyendo ElevenLabs v4, Gemini 3.8 y Trendyol-TTS (2.380 millones de parametros). Ademas, reporta un tiempo hasta el primer audio de 3,86 ms y una velocidad 440 veces superior al tiempo real en una RTX 4090, con 1.316x en modo batch.

Su relevancia practica reside en que puede ejecutarse completamente en local, tanto en GPU como en CPU, sin claves de API y sin enviar texto ni audio a servicios externos, con un coste declarado de aproximadamente 0,0085 USD por millon de caracteres en una RTX 4090 alquilada. El paquete se distribuye como `pip install ema-lightning` e incluye modos de generacion completa (`say()`) y de streaming (`stream()`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para el modelo acustico + vocoder separado; flow-matching; alineador con ventana y predictor de duracion |
| Parametros totales | 8,6 millones (5,6 M del modelo acustico DiT + 3 M del vocoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (acepta texto de longitud arbitraria; no se publica limite de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de PyTorch `.pt` (`ema.pt` y `decoder.pt`); safetensors no mencionado |

Otros datos declarados: tamano de los pesos ~34 MB, frecuencia de muestreo de salida configurable (48.000, 24.000, 16.000 y 8.000 Hz, por defecto 48.000 Hz), rango de velocidad 0,25x a 4x, y soporte de semilla reproducible (`seed`). El repositorio de HuggingFace figura con 0 descargas, 0 likes y 0,0 GB de tamano, lo que sugiere que los pesos se descargan en tiempo de ejecucion desde el codigo (la model card indica que `EMA()` descarga `ema.pt` y `decoder.pt`).

## Arquitectura y entrenamiento

La model card describe el siguiente flujo: el texto se codifica letra a letra, se situa sobre una linea temporal palabra-letra mediante un predictor de duracion, se convierte en una condicion por fotograma mediante un alineador con ventana, se generan latentes en cuatro pasos con un DiT y finalmente se decodifican a audio de 48 kHz. Se trata, por tanto, de una arquitectura de generacion por flow-matching (etiqueta `flow-matching` del repositorio) con un modelo acustico de difusion basado en transformer y un vocoder independiente, en lugar de un modelo autorregresivo o un sistema end-to-end unico.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens de audio o texto utilizados, ni sobre si se aplicaron tecnicas de RLHF, DPO u otro tipo de ajuste por preferencias. El repositorio incluye la etiqueta `arxiv:2405.14867`, pero el contenido de dicho articulo no se detalla en la informacion proporcionada. La model card menciona como componente externo un frontend de texto, `normalizer-tr`, desarrollado por Erdem Tuna.

Entre las innovaciones destacadas por el autor figuran el scheduler denominado Playhead, que permite que multiples hilos compartan un unico modelo y ejecuten su trabajo conjuntamente en la GPU, y el modo `.lightning()`, que mide el mejor tamano de batch para la GPU del usuario, compila el modelo y registra CUDA graphs para acelerar la inferencia en GPUs NVIDIA.

## Capacidades

- Sintesis de voz en turco a partir de texto, con salida mono en float32 entre -1 y 1 y frecuencia de muestreo configurable (48 kHz por defecto).
- Generacion completa por lotes: `say()` acepta un texto o una lista de textos y devuelve un objeto `Speech` por cada uno, en orden, pudiendo escribir ficheros WAV individuales o en carpeta.
- Streaming de audio: `stream()` devuelve fragmentos conforme se generan; el primer fragmento corresponde a un segundo de audio y esta listo en unos 4 ms en GPU, y el resto se entrega en bloques de cuatro segundos.
- Ejecucion concurrente multi-hilo: multiples llamadas a `say()` y `stream()` comparten el mismo modelo y el scheduler Playhead las ejecuta conjuntamente en la GPU.
- Control de velocidad de habla en un rango de 0,25x a 4x.
- Reproducibilidad mediante semilla; la semilla usada se devuelve en `speech.seed`.
- Acepta cualquier texto: la model card indica que el texto nunca lanza excepciones; solo los ajustes invalidos provocan `ValueError` antes de iniciar el trabajo.
- Ejecucion totalmente offline, en GPU o CPU, sin API key.
- Modo de aceleracion `.lightning()` especifico para GPUs NVIDIA, con compilacion y CUDA graphs.
- No se documentan capacidades de vision, audio de entrada, clonacion de voz, control de emocion, multilingueismo ni tool calling.

## Casos de uso

- Atencion al cliente automatizada en turco: el modelo permite generar respuestas habladas en streaming con un primer fragmento disponible en torno a 4 ms en GPU, de modo que la locucion puede empezar mientras el sistema sigue componiendo la respuesta.
- Avisos y notificaciones transaccionales: la model card incluye ejemplos de lectura de fechas, horas y cantidades monetarias (por ejemplo, "1.250.000 TL"), lo que encaja con recordatorios de pago, citas o confirmaciones de pedido generados por sistemas automaticos.
- Lectura de contenidos y audiolibros: con `say()` se puede procesar una lista de parrafos en lotes compartidos y escribir los WAV resultantes en una carpeta, gracias al soporte de listas de textos y de rutas de salida.
- Asistentes de voz embebidos y dispositivos locales: al requerir aproximadamente 34 MB de pesos y funcionar en CPU o GPU sin conexion, es viable desplegarlo en equipos de sobremesa, mini-PC o dispositivos con recursos limitados y sin enviar datos a terceros.
- IVR y telefonia: con salida a 8.000 Hz y modo de streaming, el modelo puede alimentar sistemas de respuesta vocal interactiva que necesitan entregar audio conforme se genera.
- Generacion de voces en off y doblaje de material en turco: el control de velocidad (0,25x a 4x) y la salida a 48 kHz permiten ajustar la locucion a la duracion de un video o a un formato de audio de calidad.
- Servicio multi-tenant de TTS: el scheduler Playhead permite que varios clientes compartan una unica instancia de modelo en una GPU, lo que reduce costes por caracter segun el propio autor.

## Benchmarks y rendimiento

| Benchmark / metrica | EMA Lightning | Sistemas comparados |
|---|---|---|
| WER en Freya-TR-Eval | 0,92% (el mas bajo de los medidos, segun el autor) | ElevenLabs v4, Gemini 3.8 y Trendyol-TTS: valores numericos no disponibles |
| Tiempo hasta el primer audio (RTX 4090) | 3,86 ms | no disponible |
| Velocidad respecto al tiempo real (RTX 4090) | 440x (1.316x con batching) | no disponible |
| Coste por millon de caracteres | ~0,0085 USD en RTX 4090 alquilada | no disponible |
| Parametros | 8,6 M (5,6 M DiT + 3 M vocoder) | Trendyol-TTS: 2.380 M |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ya que no aplican a un modelo de sintesis de voz. Los unicos datos numericos de calidad son el WER de Freya-TR-Eval y las metricas de latencia y coste indicadas. Las cifras de rendimiento de los sistemas comparados (ElevenLabs v4, Gemini 3.8) no se detallan.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 8,6 millones de parametros y ~34 MB de pesos, el uso de memoria es muy reducido; el modelo puede ejecutarse en CPU segun la model card.
- GPU de referencia en las mediciones: NVIDIA RTX 4090 (3,86 ms hasta el primer audio, 440x tiempo real, 1.316x con batching).
- GPU recomendadas: no se enumeran modelos concretos aparte de la RTX 4090; el modo `.lightning()` esta restringido a GPUs NVIDIA, mientras que sin el, o en CPU, "todo funciona igual, solo mas lento".
- ¿Cabe en GPU de consumo? Si, segun el autor; se cita explicitamente la RTX 4090 y el despliegue en GPU o CPU. No se detallan otras GPU concretas.
- Opciones de despliegue: paquete Python `ema-lightning` (PyTorch) con `say()`, `stream()` y `.lightning()`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo. Para la reproduccion en streaming se usa `sounddevice` como ejemplo.
- Latencia y throughput: primer audio en 3,86 ms en RTX 4090; primer fragmento de streaming (~1 s de audio) en unos 4 ms en GPU; el resto se entrega en bloques de cuatro segundos "mucho mas rapido de lo que se reproduce". El throughput agregado depende del tamano de batch optimo que mide `.lightning()`.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER en Freya-TR-Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMA Lightning | 8,6 M | turco | 0,92% | Apache 2.0 | HuggingFace + PyPI + GitHub |
| Trendyol-TTS | 2.380 M | turco (no confirmado en la informacion) | no disponible (se afirma superior en WER) | no disponible | no disponible |
| ElevenLabs v4 | no disponible | multilingue (no confirmado) | no disponible (se afirma superior en WER) | propietaria | API comercial |
| Gemini 3.8 | no disponible | multilingue (no confirmado) | no disponible (se afirma superior en WER) | propietaria | API comercial |

La comparacion se limita a lo declarado por el autor: EMA Lightning afirma tener el WER mas bajo de todos los sistemas medidos en Freya-TR-Eval, con una diferencia de tres ordenes de magnitud en numero de parametros respecto a Trendyol-TTS. No se dispone de cifras comparativas de latencia, coste o cobertura idiomatica para el resto de sistemas, ni de resultados de TTS en turco de otros modelos abiertos.

## Limitaciones y advertencias

- Cobertura idiomatica limitada: el unico idioma declarado es el turco (tr). No hay evidencia de soporte para castellano ni para otros idiomas.
- No se documentan sesgos especificos, pero tampoco se describe la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de acento, genero, edad o dialecto.
- Riesgo de error en la pronunciacion: en TTS el equivalente a la alucinacion es la lectura incorrecta de numeros, siglas, prestamos o nombres propios; la model card cita `normalizer-tr` como frontend de normalizacion de texto, lo que sugiere que parte de la robustez depende de ese componente externo.
- No se indica soporte de clonacion de voz, seleccion de locutor, control emocional ni prosodia ajustable; no debe asumirse que existan.
- El repositorio de HuggingFace muestra 0 descargas, 0 likes y 0,0 GB de tamano, y no incluye los pesos empaquetados; el propio codigo descarga `ema.pt` y `decoder.pt` en tiempo de ejecucion, lo que implica dependencia de la red en el primer uso.
- Discrepancia de identificadores: el identificador de HuggingFace es `suryatmodulus/ema-lightning`, mientras que las muestras de audio de la model card apuntan a `canberkkkkkk/ema-lightning`. Conviene verificar la procedencia de los ficheros antes de usarlos en produccion.
- Fechas de creacion y actualizacion del repositorio (2026-10-06) no permiten evaluar su historial de mantenimiento.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion de avisos; no se declaran restricciones adicionales.
- Las cifras de rendimiento (WER, latencia, coste) proceden de la propia model card y no se han verificado de forma independiente en los resultados de busqueda disponibles.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos tratan sobre adaptacion de aves urbanas y no guardan relacion con el sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suryatmodulus/ema-lightning
- Paquete en PyPI: https://pypi.org/project/ema-lightning/
- Repositorio GitHub (referenciado como "EMA Lightning on GitHub" en la model card; URL no incluida en la informacion disponible)
- Frontend de texto normalizer-tr, de Erdem Tuna: https://github.com/erdemtuna/normalizer-tr
- Etiqueta arXiv referenciada en el repositorio, `arxiv:2405.14867`: https://arxiv.org/abs/2405.14867 (contenido y relacion con el modelo no disponibles)
- Muestras de audio citadas en la model card: `https://huggingface.co/canberkkkkkk/ema-lightning/resolve/main/assets/sample-1.wav`, `sample-2.wav` y `sample-3.wav` (ruta bajo el identificador `canberkkkkkk/ema-lightning`)
- Otros enlaces relevantes: no disponibles. La busqueda web no devolvio resultados relacionados con el modelo.
