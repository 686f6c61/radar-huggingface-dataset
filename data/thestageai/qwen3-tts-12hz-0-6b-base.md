# TheStageAI/Qwen3-TTS-12Hz-0.6B-Base

## Resumen

TheStageAI/Qwen3-TTS-12Hz-0.6B-Base es un paquete de motores CoreML que empaqueta el modelo de sintesis de voz Qwen3-TTS-12Hz-0.6B-Base (desarrollado originalmente por Qwen / Alibaba) para su ejecucion on-device en hardware Apple Silicon. Lo publica TheStage AI, un tercero que no forma parte del equipo de Qwen, y su proposito es permitir inferencia TTS completamente local en Mac, iPhone e iPad a traves del TheStage Apple SDK, sin depender de servidores en la nube una vez inicializado el token de acceso.

El modelo subyacente es un sistema TTS de aproximadamente 0,6 mil millones de parametros con una arquitectura de tipo talker a 12 Hz combinada con MTP (multi-token prediction) y un codec de audio, que produce PCM mono a 24 kHz. El paquete CoreML expone tanto inferencia por lotes como streaming push-based, con una voz por defecto identificada como `b_ref`.

Su relevancia actual radica en que lleva un modelo TTS de calidad a dispositivos de consumo Apple con latencias bajas (TTFA de 0,30 s en un M2 Max) y un consumo de memoria moderado (~423 MB), lo que habilita aplicaciones de accesibilidad, asistentes por voz y lectura de contenido sin conexion. La licencia Apache 2.0 del paquete facilita su integracion en productos comerciales, aunque el SDK de TheStage requiere un token de acceso emitido por su plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con talker a 12 Hz + MTP (multi-token prediction) + codec de audio; empaquetado como motores CoreML |
| Parametros totales | 0,6B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete es una version cuantizada del modelo base para CoreML) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML engine bundles (repo de 5,4 GB); no se distribuyen safetensors ni GGUF en este repo |
| Frecuencia de muestreo de salida | 24 000 Hz mono |
| Voz por defecto | `b_ref` |
| Runtime | TheStage Apple SDK (`Qwen3TTSPipeline`) |
| Requisitos de sistema | macOS 15.0+, iOS 18.0+, Xcode 16.0+, Swift 6.0+, Flutter 3.24+ (opcional) |
| Hardware soportado | Apple Silicon Mac o iPhone/iPad fisico (simulador no soportado) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-0.6B-Base emplea una arquitectura de sintesis de voz organizada en torno a un modulo "talker" que opera a 12 Hz, complementado con MTP (multi-token prediction) y un codec de audio que reconstruye la forma de onda a 24 kHz. El paquete de TheStage AI detecta automaticamente el layout MTP/talker en `start_model` y lo enruta a `Qwen3TTSPipeline`, diferenciandolo de otros pipelines como NeuTTS del mismo SDK.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos, ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. Tampoco se especifican innovaciones adicionales mas alla del esquema talker + MTP + codec. El trabajo de TheStage AI consiste en la conversion y empaquetado del modelo a CoreML para aprovechar la Neural Engine (ANE) de los chips Apple, con soporte de decodificacion por lotes y streaming push-based.

## Capacidades

- Sintesis de voz texto-a-habla (TTS) con salida PCM mono a 24 kHz.
- Inferencia por lotes: genera el audio completo de una entrada de texto en una sola llamada (`infer(text:)`).
- Streaming push-based: patron `open_streamer()` → drenaje concurrente de `output` → `send(...)` → `stop_stream()`, adecuado para reproduccion de baja latencia.
- Ejecucion totalmente on-device tras la inicializacion del token; la inferencia no requiere red.
- Seleccion de voz mediante `voice_id` (por defecto `b_ref`).
- Parametros de muestreo configurables a traves de `TTSGenerationConfig` o JSON `config` (valores tipicos del talker: `temperature=0.9`, `top_k=50`, segun el bundle).
- Integracion nativa en Swift (SwiftPM) y en Flutter para iOS.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan tool calling, function calling, agentes ni modos de razonamiento (es un modelo TTS, no un LLM conversacional).

## Casos de uso

- Lectura por voz de articulos y contenido textual en apps iOS/macOS: el modelo puede sintetizar parrafos completos en lote y reproducirlos, aprovechando la salida a 24 kHz y el bajo consumo de memoria (~423 MB) para integrarse en apps de noticias o lectores.
- Asistentes de accesibilidad: conversion de texto a voz para usuarios con discapacidad visual o dificultades de lectura, ejecutandose on-device para preservar la privacidad del contenido leido.
- Respuestas habladas en asistentes conversacionales: el modo streaming con TTFA de 0,30 s permite empezar a reproducir audio antes de completar la sintesis, mejorando la sensacion de inmediatez en dialogos por turnos.
- Audiolibros y podcasts generados dinamicamente: sintesis por lotes de capitulos largos en Mac con Apple Silicon, sin coste de API en la nube ni envio de texto a terceros.
- Avisos y notificaciones por voz en apps moviles: generacion local de mensajes cortos en iPhone/iPad, con la ventaja de que la inferencia funciona sin conexion una vez inicializado el token.
- Prototipado rapido de interfaces de voz en Flutter: el plugin `thestage_apple_sdk` permite integrar TTS en apps Flutter para iOS con unas pocas llamadas (`start_model`, `infer`), util para validar experiencias de voz antes de pasar a produccion.
- Sistemas de navegacion o guiado paso a paso: sintesis de instrucciones cortas en streaming con baja latencia y sin dependencia de red, adecuado para entornos con conectividad intermitente.

## Benchmarks y rendimiento

Datos de latencia on-device publicados por el autor (build Release sobre Apple M2 Max con NPU/ANE, macOS 26.2; valores orientativos, no SLA):

| Metrica | Valor |
|---|---|
| Batch rtf (real-time factor) | 1,76 |
| Stream rtfx | 2,18 |
| TTFA (time to first audio) | 0,30 s |
| Memoria de proceso | ~423 MB |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de voz, etc.) en la informacion disponible.

## Requisitos de hardware

- Hardware: Apple Silicon Mac (M1/M2/M3/M4 o posteriores) o iPhone/iPad fisico con chip Apple Silicon; el simulador no esta soportado.
- Memoria: aproximadamente 423 MB de memoria de proceso en inferencia segun la medicion del autor en M2 Max.
- Almacenamiento: el repo de motores CoreML ocupa 5,4 GB.
- SO y toolchain: macOS 15.0+, iOS 18.0+, Xcode 16.0+, Swift 6.0+, Flutter 3.24+ (opcional).
- Aceleracion: aprovecha la Neural Engine (ANE) de los chips Apple.
- Despliegue: TheStage Apple SDK via SwiftPM (`https://github.com/TheStageAI/AppleSDK.git`, version 1.1.0) o plugin Flutter `thestage_apple_sdk` (ref 1.1.0).
- No aplica despliegue en vLLM, llama.cpp, Ollama o TGI: el formato es CoreML y el runtime es propietario del SDK de TheStage.
- Latencia y throughput: TTFA de 0,30 s, rtf 1,76 en lote y rtfx 2,18 en streaming sobre M2 Max (valores orientativos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheStageAI/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | CoreML / TheStage Apple SDK | Apache 2.0 (paquete) | Hugging Face; requiere token de TheStage |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | pesos originales de Qwen | no disponible en la informacion | Hugging Face (modelo base) |
| NeuTTS (mismo SDK TheStage) | no disponible | no disponible | CoreML / TheStage Apple SDK | no disponible | Referenciado en el SDK como pipeline alternativo |

La comparacion con alternativas TTS de otros fabricantes (por ejemplo, modelos TTS de otros proveedores) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un token de acceso de TheStage AI (`th_…`) y una llamada a `initialize` con verificacion online; si la app arranca sin red, la inicializacion falla y hay que reintentar al reconectar.
- La inferencia es on-device, pero el proceso de inicializacion depende de los servidores de TheStage; esto introduce una dependencia externa en el arranque de la app.
- El simulador de iOS/macOS no esta soportado: es necesario probar en hardware Apple Silicon fisico.
- El paquete esta atado al ecosistema Apple (CoreML, ANE, Swift/Flutter); no es portable a Linux, Windows ni GPUs NVIDIA.
- No se documentan idiomas soportados, sesgos, tasas de alucinacion ni calidad de sintesis (MOS) en la informacion disponible.
- Al ser un modelo TTS, no realiza razonamiento, tool calling ni generacion de codigo; no debe evaluarse como un LLM.
- El paquete es una conversion no oficial de Qwen; el soporte y las garantias de calidad recaen en TheStage AI, no en Alibaba/Qwen.
- La licencia Apache 2.0 se aplica al paquete publicado; conviene verificar las condiciones del modelo base original y del SDK de TheStage antes de un uso comercial en produccion.
- Los valores de latencia publicados corresponden a un unico dispositivo (M2 Max) y deben tratarse como orientativos, no como SLA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TheStageAI/Qwen3-TTS-12Hz-0.6B-Base
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Repositorio del SDK: https://github.com/TheStageAI/AppleSDK
- Documentacion: https://docs.thestage.ai
- Plataforma y tokens: https://app.thestage.ai
- Actualizaciones: https://x.com/TheStageAI
- Contacto: contact@thestage.ai
