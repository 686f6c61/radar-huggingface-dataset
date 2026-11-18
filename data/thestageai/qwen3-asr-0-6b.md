# TheStageAI/Qwen3-ASR-0.6B

## Resumen

TheStageAI/Qwen3-ASR-0.6B es un paquete de motores CoreML del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B, desarrollado originalmente por Qwen (Alibaba) y empaquetado por TheStage AI para su ejecucion en hardware Apple Silicon. El modelo combina un codificador de audio con un decodificador basado en la familia Qwen3, y se distribuye como alternativa a Whisper dentro del ecosistema del TheStage Apple SDK para aplicaciones iOS y macOS.

La relevancia de esta publicacion radica en que traslada un modelo ASR de 0.6B parametros al entorno on-device de Apple, permitiendo inferencia completamente local en iPhone, iPad y Macs con chip Apple Silicon, sin depender de servicios en la nube. El paquete esta pensado para desarrolladores que ya trabajan con el SDK de TheStage y quieren incorporar la familia Qwen3-ASR en lugar de, o junto a, Whisper Large v3 Turbo, que sigue siendo el motor STT principal del SDK.

El repositorio ocupa 10.1 GB y contiene los bundles de motores CoreML necesarios para el runtime `Qwen3ASRPipeline`. La licencia es Apache 2.0, heredada del modelo base, aunque el acceso al SDK requiere un token de TheStage AI que se valida online en la inicializacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio + decodificador Qwen3 (empaquetado CoreML) |
| Parametros totales | 0.6B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (bundle CoreML ya cuantizado; detalles no publicados) |
| Idiomas soportados | no disponible (el pipeline acepta `language: "auto"` o codigos/nombres de idioma, pero no se lista el conjunto soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML engine bundles (repo de 10.1 GB) |
| Entrada de audio | 16 kHz mono, Float/Float32 en [-1.0, 1.0] |
| Runtime | TheStage Apple SDK (`Qwen3ASRPipeline`) |
| Requisitos de sistema | macOS 15.0+, iOS 18.0+, Xcode 16.0+, Swift 6.0+, Flutter 3.24+ (opcional) |
| Hardware | Apple Silicon Mac o iPhone/iPad fisico (simulador no soportado) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B sigue una arquitectura de dos componentes: un codificador de audio que transforma la senal de 16 kHz en representaciones latentes, y un decodificador derivado de la familia Qwen3 que genera la transcripcion a partir de esas representaciones. Esta publicacion no aporta informacion sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas); esos datos corresponden a la model card de Qwen/Qwen3-ASR-0.6B, que no se incluye en la informacion disponible.

La contribucion de TheStage AI es el empaquetado y la conversion a CoreML para explotar la Neural Engine (ANE) de Apple Silicon, junto con la integracion en su SDK (Swift y Flutter). El pipeline acepta audio mono a 16 kHz en coma flotante y un parametro de idioma (`"auto"` por defecto o un codigo/nombre como `"en"` o `"English"`). No se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio mono a 16 kHz.
- Deteccion automatica de idioma mediante `language: "auto"`, o seleccion explicita por codigo o nombre.
- Inferencia completamente on-device en Apple Silicon (Mac, iPhone, iPad), sin envio de audio a la nube.
- Integracion nativa en Swift (`Qwen3ASRPipeline`) y en Flutter para iOS.
- Salida de transcripcion en texto (`result.text` / `transcription`).
- Ejecucion acelerada por Neural Engine (ANE) en builds de release.
- No se documentan capacidades de traduccion, diarizacion, timestamps, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Transcripcion de notas de voz en apps iOS: el modelo procesa audio de 16 kHz directamente en el dispositivo, lo que permite transcribir grabaciones sin salir del telefono y sin costes de API en la nube.
- Dictado por voz en macOS: integrado via SwiftPM en una app de escritorio, el pipeline transcribe en local con un consumo de memoria de aproximadamente 342 MB, adecuado para utilidades siempre activas.
- Subtitulado de reuniones o clases en tiempo casi real: con un RTFx de 13.9 en M2 Max, un audio de 8.88 s se procesa en menos de un segundo, lo que habilita transcripcion por segmentos en apps de productividad.
- Apps Flutter multiplataforma con STT local: mediante `thestage_apple_sdk` se puede arrancar el modelo con `start_model` e invocar `infer` con audio Float32List, reutilizando la misma logica en iOS.
- Asistentes de voz offline: al ejecutarse sin red tras la inicializacion, el modelo sirve para comandos de voz en entornos sin conectividad o con requisitos de privacidad estrictos.
- Alternativa a Whisper en pipelines existentes de TheStage: equipos que ya usan el SDK pueden evaluar la familia Qwen3-ASR sustituyendo el motor STT sin cambiar la arquitectura de la app.
- Prototipado de investigacion en ASR on-device: util para comparar el comportamiento de Qwen3-ASR frente a Whisper Large v3 Turbo en hardware Apple real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son metricas de latencia on-device en Apple M2 Max (NPU/ANE), macOS 26.2, build de release, y se presentan como orientativas, no como SLA:

| Metrica | Valor |
|---|---|
| Audio de prueba | 8.88 s |
| RTFx | 13.9 |
| Velocidad de decodificacion | 39.6 tok/s |
| Memoria de proceso | ~342 MB |

## Requisitos de hardware

- Hardware: Apple Silicon Mac o iPhone/iPad fisico. El simulador no esta soportado.
- Memoria: aproximadamente 342 MB de proceso en M2 Max durante la inferencia (dato del autor).
- Almacenamiento: el repositorio de motores CoreML ocupa 10.1 GB.
- Sistema operativo: macOS 15.0+ o iOS 18.0+.
- Toolchain: Xcode 16.0+, Swift 6.0+; Flutter 3.24+ si se usa la via Flutter.
- Aceleracion: usa la Neural Engine (ANE) en builds de release; no se documenta soporte para GPU discretas ni CPUs x86.
- Despliegue: exclusivamente a traves del TheStage Apple SDK (SwiftPM o plugin Flutter). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato CoreML.
- Throughput: 39.6 tok/s de decodificacion y RTFx 13.9 en M2 Max (referencia del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| TheStageAI/Qwen3-ASR-0.6B | 0.6B | no disponible | CoreML / TheStage Apple SDK | Apache 2.0 | On-device Apple Silicon; requiere token de TheStage |
| TheStageAI/thewhisper-large-v3-turbo | no disponible (Whisper Large v3 Turbo) | no disponible | CoreML / TheStage Apple SDK | no disponible en la informacion | Motor STT principal del SDK segun el autor |
| Qwen/Qwen3-ASR-0.6B | 0.6B | no disponible | Pesos originales (no CoreML) | Apache 2.0 (heredada) | Modelo base sin empaquetado Apple |

La comparacion de calidad (WER) entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en hardware Apple Silicon real; el simulador no esta soportado, lo que complica CI y pruebas automatizadas.
- Requiere un token de acceso de TheStage AI que se valida online en `initialize`; sin conexion la inicializacion falla y hay que reintentar al recuperar red.
- La inferencia es local, pero la dependencia del SDK propietario de TheStage AI introduce un acoplamiento de proveedor mas alla de la licencia Apache 2.0 del modelo.
- No se documenta el conjunto de idiomas soportados ni el rendimiento por idioma; el modo `"auto"` no garantiza deteccion correcta en todos los casos.
- No se publican metricas de calidad (WER) ni comparativas frente a Whisper, por lo que la eleccion frente al motor STT por defecto del SDK debe validarse con datos propios.
- El repositorio ocupa 10.1 GB, lo que impacta en el tamano de las apps y en la distribucion.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente con audio ruidoso o acentos no representados en el entrenamiento; no se aportan datos de sesgo.
- No se detallan los terminos especificos de uso comercial del SDK de TheStage AI mas alla de la licencia Apache 2.0 del modelo base; conviene revisar las condiciones del SDK antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/Qwen3-ASR-0.6B
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio del TheStage Apple SDK: https://github.com/TheStageAI/AppleSDK
- Plataforma y token de acceso: https://app.thestage.ai
- Documentacion: https://docs.thestage.ai
- Perfil en X: https://x.com/TheStageAI
- Contacto: contact@thestage.ai
- Motor STT alternativo del SDK (Whisper Large v3 Turbo): https://huggingface.co/TheStageAI/thewhisper-large-v3-turbo
