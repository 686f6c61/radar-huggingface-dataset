# wundr-ai/zipformer-small-librispeech-en-wasm

## Resumen

`wundr-ai/zipformer-small-librispeech-en-wasm` es un paquete de inferencia listo para navegador del modelo de reconocimiento de voz `sherpa-onnx-zipformer-small-en-2023-06-26`, publicado por el usuario wundr-ai. No introduce pesos nuevos: empaqueta el transductor offline Zipformer "small" ya existente de k2-fsa (entrenado con la receta LibriSpeech de icefall) junto con el runtime sherpa-onnx 1.12.36 compilado a WebAssembly, de forma que el reconocimiento se ejecuta íntegramente en la pestaña del navegador, sin backend ni GPU.

El interés práctico del repositorio es el empaquetado, no el modelo: incluye el API JS (`OfflineRecognizer`), el glue de Emscripten, el binario `.wasm` y un fichero `.data` con encoder, decoder, joiner y tokens ya cuantizados a int8. La compilación WASM es sin hilos, por lo que no requiere cabeceras COOP/COEP ni un servidor con `SharedArrayBuffer`, lo que simplifica el despliegue en hosting estático. El autor indica que es el modelo que corre en la landing de wundr-site.

Las limitaciones son las del modelo original: únicamente inglés, dominio de habla leída de adultos (LibriSpeech, explícitamente sin habla infantil) y decodificación offline por enunciado completo. No hay datos publicados de parámetros, WER ni latencia en la información disponible, y el repositorio no tiene descargas ni valoraciones que permitan validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer (encoder-decoder-joiner) offline, de k2-fsa/icefall; runtime sherpa-onnx 1.12.36 compilado a WebAssembly (Emscripten) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo offline que procesa un enunciado completo por decodificación, sin ventana de streaming documentada |
| Tipos de cuantización | int8 (pesos del modelo stock empaquetado en el fichero `.data`); no se ofrecen otras variantes en el repo |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | no safetensors ni GGUF: artefactos web (`sherpa-onnx-wasm-main-asr-small.data` con encoder/decoder/joiner/tokens, `.wasm`, glue JS y `sherpa-onnx-asr.js`) |
| Librería / runtime | sherpa-onnx (WebAssembly, sin hilos) |
| Pipeline | automatic-speech-recognition |
| Tamaño del repo | 0.0 GB (redondeado en HuggingFace; el tamaño real de los artefactos no está documentado) |
| Fecha de creación | 2026-10-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transductor Zipformer de tamaño "small" de la familia k2-fsa, derivado de una receta LibriSpeech del toolkit icefall. Un transductor combina un encoder (Zipformer), un predictor/decoder y una red joiner que produce la distribución sobre tokens en cada paso, lo que permite decodificación conjunta sin modelo de lenguaje externo. El paquete distribuido aquí usa los pesos en int8 y los expone a través de la API `OfflineRecognizer` de sherpa-onnx, es decir, decodificación por enunciado (no streaming).

Sobre el entrenamiento solo se dispone de lo que declara el autor: datos LibriSpeech de habla leída de adultos, sin habla infantil, y ninguna indicación de número de tokens, composición exacta del dataset ni etapas de ajuste adicionales. Al ser un sistema ASR no hay RLHF ni DPO. La innovación del repositorio es de despliegue: compilación WASM sin threads (evita COOP/COEP), carga del runtime y del modelo mediante `locateFile` desde un Web Worker apuntando a una URL con commit fijado, y empaquetado de los cuatro componentes del transductor en un único `.data`.

## Capacidades

- Reconocimiento de voz offline de enunciados en inglés: recibe audio y devuelve la transcripción de la locución completa.
- Ejecución íntegra en el navegador vía WebAssembly, sin envío de audio a servidores externos.
- Funcionamiento en un Web Worker, lo que permite no bloquear el hilo principal de la interfaz.
- Despliegue sin requisitos de aislamiento de origen cruzado (compilación sin hilos, sin necesidad de COOP/COEP).
- Integración con el API JS de sherpa-onnx (`OfflineRecognizer`) para crear el reconocedor, aceptar audio y recuperar el resultado.
- No soporta streaming ni reconocimiento incremental: el diseño es offline por enunciado.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio-vision ni modo de razonamiento.
- No se documentan puntuación, capitalización, marcas de tiempo ni diarización de hablantes.
- Multilingüismo: no; solo inglés.

## Casos de uso

- Transcripción en la propia página web: un formulario o widget de voz que transcribe la entrada del usuario en el navegador, sin coste de servidor ni transferencia de audio, adecuado por la licencia Apache-2.0 y por la ejecución local en WASM.
- Dictado en aplicaciones web de productividad: campos de texto con entrada por voz en inglés, usando el Web Worker para mantener la interfaz fluida mientras se decodifica el enunciado.
- Subtitulado de notas de voz grabadas: el usuario sube o graba un audio corto y obtiene el texto en el cliente, útil en entornos con requisitos de privacidad (el audio no sale del dispositivo).
- Prototipado y demos públicas: integración en landings y demos técnicas donde se necesita ASR funcional sin infraestructura, tal como el autor describe para wundr-site.
- Aplicaciones educativas de lectura en inglés: transcripción de frases leídas por el usuario para comparar con un texto de referencia, aprovechando que el modelo está entrenado con habla leída.
- Pruebas de regresión de pipelines ASR: servir como referencia WASM para comparar el comportamiento del mismo modelo en navegador frente a la ejecución nativa con sherpa-onnx/ONNX Runtime.
- Uso en entornos offline o de red restringida: al poder alojarse los artefactos en un servidor propio y fijarse por commit, funciona en kioscos o intranets sin dependencias externas en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER sobre LibriSpeech test-clean/test-other ni mediciones de latencia o RTF, y los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden a catalogación de arte barroco), por lo que no aportan datos utilizables.

## Requisitos de hardware

- Inferencia en CPU del cliente mediante WebAssembly; no requiere GPU.
- VRAM: no aplica. El consumo relevante es memoria del navegador (heap WASM + `.data` del modelo), cuyo tamaño exacto no está documentado en la información disponible (el repo figura como 0.0 GB redondeado).
- GPU recomendadas: ninguna; el paquete no usa aceleración por GPU ni WebGPU según la información disponible.
- Compatibilidad consumer: cualquier equipo de escritorio o portátil con un navegador moderno que soporte WebAssembly; en móviles conviene verificar límites de memoria del navegador antes de cargar el `.data`.
- Despliegue: hosting estático de los cuatro artefactos (`sherpa-onnx-asr.js`, `sherpa-onnx-wasm-main-asr-small.js`, `.wasm`, `.data`) y carga desde un Web Worker con `locateFile` apuntando a `https://huggingface.co/wundr-ai/zipformer-small-librispeech-en-wasm/resolve/<commit>/`. Fijar el commit; no cargar desde `main`.
- Sin requisitos de COOP/COEP al ser una compilación sin hilos (tampoco hay paralelismo multihilo, lo que limita el throughput).
- Alternativas de despliegue del mismo modelo: sherpa-onnx nativo con ONNX Runtime (CPU o GPU), útil si se necesita mayor throughput.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo / empaquetado | Parámetros | Contexto / modo | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zipformer-small-librispeech-en-wasm (este) | Zipformer transducer int8 + WASM (sherpa-onnx 1.12.36) | no disponible | offline por enunciado | en | Apache-2.0 | HuggingFace, 0 descargas |
| sherpa-onnx-zipformer-small-en-2023-06-26 (original k2-fsa) | Zipformer transducer int8, ONNX para sherpa-onnx nativo | no disponible (mismos pesos) | offline por enunciado | en | Apache-2.0 | Distribuido por k2-fsa |
| Variantes streaming de sherpa-onnx (zipformer streaming) | Zipformer transducer en modo streaming | no disponible | streaming con chunks | en / multilingüe según variante | Apache-2.0 | k2-fsa |
| Whisper (tiny/base) vía runtime compatible | Encoder-decoder transformer | no disponible en la información proporcionada | offline, ventanas de 30 s | multilingüe | MIT (según versión) | Amplia |

La comparación cuantitativa de calidad (WER) y de parámetros no está disponible en la información proporcionada; la diferencia verificable frente al modelo original es exclusivamente el entorno de ejecución (navegador sin hilos frente a ONNX Runtime nativo).

## Limitaciones y advertencias

- Solo inglés; cualquier audio en otra lengua queda fuera del ámbito del modelo.
- Dominio restringido: entrenado con LibriSpeech (habla leída de adultos). El propio autor advierte que no incluye habla infantil, por lo que el rendimiento en voces infantiles, acentos marcados, ruido de fondo o audio telefónico puede degradarse de forma notable.
- Riesgo de alucinación e inserciones propias de los transductores: en silencios, ruido o audio musical puede emitir texto espurio; conviene aplicar detección de actividad de voz y umbrales de confianza.
- Sin streaming: no apto para subtitulado en tiempo real con baja latencia; requiere disponer del enunciado completo.
- Sin datos publicados de WER, latencia ni huella de memoria, lo que impide dimensionar el rendimiento en producción sin pruebas propias.
- Repositorio sin descargas ni valoraciones: no hay validación externa del empaquetado.
- La model card recomienda fijar un commit concreto al cargar los artefactos; usar `main` puede romper la integración si los ficheros cambian.
- Compilación sin hilos: no aprovecha núcleos múltiples y el coste de decodificación recae en un solo hilo del navegador (dentro del Web Worker).
- Licencia Apache-2.0: permite uso comercial, pero exige conservar avisos de copyright y licencia, y cumplir las cláusulas de patentes; hay que atribuir tanto a k2-fsa/icefall como al empaquetado de wundr-ai.
- Posibles límites de memoria en navegadores móviles al cargar el `.data`; no documentados.
- Los resultados de la búsqueda web realizada no contenían información relacionada con el modelo y no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wundr-ai/zipformer-small-librispeech-en-wasm
- Repositorio sherpa-onnx (runtime y modelo original): https://github.com/k2-fsa/sherpa-onnx
- Toolkit icefall (recetas de entrenamiento, incluida LibriSpeech): https://github.com/k2-fsa/icefall
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/
