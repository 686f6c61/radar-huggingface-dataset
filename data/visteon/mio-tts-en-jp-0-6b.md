# visteon/mio-tts-en-jp-0.6b

## Resumen

Visteon MIO TTS en-jp 0.6B es un sistema de síntesis de voz (text-to-speech) orientado a producción y diseñado específicamente para ejecutarse en dispositivos NVIDIA Jetson Orin, es decir, en entornos embebidos y de automoción. Lo desarrolla Visteon, proveedor de electrónica para el sector del automóvil, y resuelve el problema de generar voz sintética de baja latencia en inglés y japonés sin depender de la nube. Su enfoque es *streaming-first*: el primer fragmento de audio se emite antes de haber sintetizado la frase completa, lo que lo hace adecuado para asistentes conversacionales en vehículo.

El modelo combina un backbone de lenguaje decoder-only de 0,6 mil millones de parámetros que produce ocho codebooks acústicos paralelos a 24 kHz, un refinador acústico iterativo exportado a TensorRT en fp16 y un vocoder neuronal en ONNX Runtime. La latencia de primer audio (TTFA) medida en Jetson Orin es de 608 ms de media y 875 ms en p95 sobre un corpus de 20 000 frases, con un RTF medio de 0,157. Incorpora además clonación de voz zero-shot mediante prompts de audio de referencia y salida de eventos LIPSYNC para sincronización labial.

La relevancia actual del modelo está en su perfil de despliegue: pesos y motores preparados para aarch64, protocolo de comunicación JSON sobre TCP, capacidad multi-instancia y validación de inteligibilidad mediante round-trip ASR sobre 20 000 frases de corpus y 5 000 respuestas reales de asistente. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone decoder-only de 0,6B con 8 codebooks acústicos paralelos a 24 kHz; refinador acústico iterativo (TensorRT fp16) y vocoder neuronal (ONNX Runtime fp32) |
| Parametros totales | 0,6 mil millones (backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (motor TensorRT del refinador acústico); fp32 (vocoder ONNX) |
| Idiomas soportados | inglés (en) y japonés (ja), con autodetección de idioma o fijado explícito |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorRT engine (fp16, aarch64 Orin), ONNX (vocoder), binarios de prompt de voz `.bin` (formato OVP1) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro etapas. El frontend de texto realiza autodetección de idioma (o fijado a `en`/`ja`), normalización de números, unidades y URLs, conversión grafema-fonema (G2P) y manejo de texto con escritura mixta. El backbone es un modelo de lenguaje decoder-only de 0,6B parámetros que genera ocho codebooks acústicos en paralelo a 24 kHz. Sobre estos tokens actúa un refinador acústico iterativo con 24 pasos por defecto, compilado como motor TensorRT fp16 para Orin aarch64. Finalmente, un vocoder neuronal en ONNX Runtime (fp32) convierte la representación acústica en PCM16 mono a 24 kHz.

El runtime es un host C++/CUDA con un protocolo de cable JSON con prefijo de longitud (4 bytes big-endian), preparado para múltiples instancias y con soporte de cancelación a mitad de stream. La clonación de voz es zero-shot: se condiciona la generación con prompts de audio de referencia en formato `.bin` (OVP1), que empaquetan tokens de referencia de 8 codebooks, el texto de referencia y el valor RMS. La información disponible no detalla el volumen ni la composición del dataset de entrenamiento, ni si se emplearon RLHF o DPO; tampoco se especifica la innovación de decodificación más allá del diseño streaming y el *fast-start sentence splitting*, que trocea la entrada para reducir la latencia del primer fragmento en textos largos.

## Capacidades

- Síntesis de voz en inglés y japonés con autodetección de idioma y manejo de líneas mixtas en-jp.
- Streaming de audio con emisión del primer fragmento antes de completar la síntesis de la frase.
- Clonación de voz zero-shot mediante prompts de audio de referencia (`.bin`, formato OVP1) seleccionables por petición.
- Salida de eventos LIPSYNC con alineación a nivel de palabra para avatares y sincronización labial.
- Generación determinista por semilla, estable entre reinicios del servicio.
- Normalización de números, unidades, URLs, emojis y caracteres de control; soporte de números con separador de miles y de cinco o más dígitos.
- Protocolo de servidor con respuestas `INIT`, `AUDIO_CHUNK`, `AUDIO_FILE` (RIFF WAV), `COMPLETE` y `ERROR`, con métricas `ttfa_ms`, `total_ms` y `segments`.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni visión; es un modelo exclusivamente de síntesis de voz.

## Casos de uso

- Asistente de voz en vehículo: el modelo está pensado para respuestas de asistente dentro del coche; con TTFA de 608 ms de media en Orin y streaming por frases, permite iniciar la respuesta antes de terminar de sintetizar textos multi-frase.
- Notificaciones y avisos del sistema: la normalización de unidades y números (por ejemplo, «0,12 kW») y la mezcla en-jp encajan con avisos de cuadro de instrumentos y mensajes de estado del vehículo.
- Navegación e indicaciones por voz: la baja latencia y el troceado rápido de frases permiten emitir instrucciones cortas de forma casi inmediata, con RTF de 0,157 que deja margen de CPU/GPU para otras tareas del sistema.
- Personalización de la voz del conductor: la clonación zero-shot con prompts de 5 a 15 segundos permite asignar una voz concreta por petición mediante el campo `voice`, útil para perfiles de usuario o marcas.
- Avatares y asistentes con sincronización labial: los eventos LIPSYNC por palabra permiten animar avatares en pantallas de infoentretenimiento sin postprocesado adicional.
- Despliegue embebido multi-instancia: el runtime admite varias instancias (con RTF aproximado de 0,5 bajo contención de tres instancias), lo que permite atender varios canales de audio o zonas del vehículo en un mismo Jetson Orin.
- Servicio TTS on-device sin nube: al ejecutarse íntegramente en el dispositivo con motores TensorRT/ONNX, evita la dependencia de conectividad y reduce la exposición de datos de voz.

## Benchmarks y rendimiento

| Metrica | Corpus 20k frases | 5k respuestas de agente |
|---|---|---|
| TTFA media | 608 ms | 1.058 ms (p50 692 ms) |
| TTFA p95 | 875 ms | 2.166 ms |
| RTF media | 0,157 | ~0,5 con contención de 3 instancias |
| RTF p95 | 0,189 | no disponible |

Mediciones sobre NVIDIA Jetson Orin de 64 GB en fp16, instancia única, PCM16 mono a 24 kHz. La validación de inteligibilidad se realizó mediante round-trip ASR sobre las 20 000 frases del corpus y las 5 000 respuestas de agente, con auditoría de alineación de palabras (LIPSYNC) en todas las filas marcadas: 0 filas en las que el modelo no pronunciara el contenido de entrada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson Orin (probado en Orin de 64 GB); los motores TensorRT están compilados para aarch64.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,4 GB e incluye motores fp16 y vocoder ONNX, por lo que el consumo debe caber en la memoria unificada del Orin.
- GPU recomendadas: Jetson Orin (plataforma validada). No se documenta soporte para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no confirmado; el binario `tts_inference` es Linux aarch64 y los motores están compilados para Orin, por lo que no se garantiza su ejecución en GPUs x86 de consumo.
- Opciones de despliegue: runtime propio C++/CUDA con binario `tts_inference`, servidor TCP con protocolo JSON con prefijo de longitud, motores TensorRT y ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: TTFA de 608 ms de media y 875 ms p95; RTF de 0,157 de media y 0,189 p95 en instancia única; RTF aproximado de 0,5 con tres instancias en contención.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos TTS comparables (por ejemplo, sistemas TTS neuronales multilingües o de clonación zero-shot) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Solo soporta inglés y japonés; no se documentan otros idiomas.
- Los prompts de voz de referencia deben ser voz limpia de 5 a 15 segundos del hablante objetivo con transcripción literal; prompts de baja calidad degradan el resultado.
- No es un dispositivo médico ni de seguridad; el audio generado es voz sintética y debe etiquetarse como tal.
- Riesgo de alucinación y de errores de pronunciación en entradas atípicas (URLs, emojis, caracteres de control, números largos), aunque el autor declara validación específica de estos casos.
- La latencia crece con la longitud de la frase: en respuestas largas de agente el TTFA medio sube a 1.058 ms y el p95 a 2.166 ms.
- Bajo contención de tres instancias el RTF sube a aproximadamente 0,5, reduciendo el margen respecto al tiempo real.
- El despliegue está atado a Jetson Orin aarch64 con motores TensorRT precompilados; no se documenta portabilidad a otras GPU sin recompilación.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- No se detallan sesgos demográficos o acústicos del modelo ni la composición del dataset de entrenamiento, lo que limita la evaluación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/visteon/mio-tts-en-jp-0.6b
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
