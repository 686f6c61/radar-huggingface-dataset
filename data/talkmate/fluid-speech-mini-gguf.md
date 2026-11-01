# TalkMate/fluid-speech-mini-gguf

## Resumen

Fluid Speech Mini es un modelo de reconocimiento automatico del habla (ASR) desarrollado por FluidVoice, distribuido en este repositorio por TalkMate como una conversion al formato GGUF para su uso con transcribe.cpp. El modelo esta construido sobre NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, y esta especializado en transcripcion y dictado en ingles. Con 627 millones de parametros, se posiciona como una alternativa ligera para tareas de transcripcion en entornos de escritorio y sistemas con recursos limitados.

La relevancia de esta ficha radica en su formato de despliegue: el repositorio contiene un unico archivo GGUF de aproximadamente 506 MB que carga directamente en transcribe.cpp, una implementacion en C++ pensada para inferencia local sin dependencias de Python. TalkMate lo descarga de forma automatica en Windows y Linux como parte de su aplicacion de dictado.

La arquitectura subyacente es la de Parakeet TDT (Token-and-Duration Transducer), un modelo transducer con encoder convolucional y decodificador LSTM, no un transformer autoregresivo clasico. Esta orientado exclusivamente al ingles y se distribuye bajo licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer) con encoder convolucional y decodificador LSTM |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K en pesos del encoder (originalmente Q2_K), F16 en convoluciones pointwise y capas LSTM |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (archivo `fluid-speech-mini-q4k.gguf`, 506.663.584 bytes) |

## Arquitectura y entrenamiento

El modelo se basa en Parakeet TDT 0.6B v3 de NVIDIA, una arquitectura transducer que combina un encoder convolucional con un predictor y un decodificador conjunto. A diferencia de los transformers encoder-decoder clasicos, los modelos TDT predicen simultaneamente tokens y duraciones, lo que permite un alineamiento mas eficiente en tareas de reconocimiento del habla. El tokenizer es el de Parakeet TDT 0.6B v3, compartido con Fluid Speech Mini.

La conversion realizada por TalkMate modifica varios aspectos respecto al archivo original de FluidVoice: los tensores y metadatos se renombraron al esquema de Parakeet de transcribe.cpp; los pesos del encoder en Q2_K se re-cuantizaron a Q4_K porque transcribe.cpp no carga Q2_K (cada peso queda a menos de 0,38 de un paso de 2 bits del valor original, con una diferencia RMS del 0,16% del tamano de los pesos); las convoluciones pointwise se almacenan en F16 porque las convoluciones de transcribe.cpp solo aceptan F16 o F32; y los dos vectores de sesgo de cada capa LSTM se suman en uno solo. La validacion sobre 100 clips de LibriSpeech test-clean produjo transcripciones identicas a las del archivo original de FluidVoice.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la documentacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida de transcripcion de texto.
- Dictado por voz, disenado para integracion en aplicaciones de escritorio.
- Transcripcion de audio de forma local sin dependencias de servicios en la nube.
- Compatibilidad con el ecosistema transcribe.cpp para inferencia en C++.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- Modelo monolingue: unicamente ingles.

## Casos de uso

- Dictado en aplicaciones de escritorio: TalkMate lo integra en Windows y Linux para convertir voz en texto en tiempo real, aprovechando su tamano reducido (506 MB) y su carga directa en transcribe.cpp.
- Transcripcion de reuniones y notas de voz: el modelo puede procesar grabaciones de audio en local, evitando el envio de datos a servicios externos y reduciendo costes operativos.
- Subtitulado de contenido en ingles: adecuado para generar subtitulos en pipelines de postproduccion donde se requiere un modelo ligero que quepa en memoria de sistemas modestos.
- Asistentes de voz offline: integrable en aplicaciones de escritorio o embebidas que necesiten reconocimiento de voz sin conexion, gracias a su formato GGUF y su bajo consumo de recursos.
- Accesibilidad: conversion de voz a texto para personas con movilidad reducida en entornos donde no se desea depender de la nube.
- Procesamiento por lotes de archivos de audio: al ser un modelo pequeno, permite transcribir grandes volumenes de audio en CPU o GPU de gama baja con un throughput razonable.
- Herramientas de transcripcion para desarrolladores: base para construir interfaces de linea de comandos o integraciones en editores de codigo que requieran dictado local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es la comparacion de transcripciones sobre 100 clips de LibriSpeech test-clean, donde el archivo GGUF de TalkMate y el original de FluidVoice produjeron transcripciones identicas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 627 millones de parametros con pesos en Q4_K y F16, el archivo ocupa aproximadamente 506 MB; la VRAM necesaria es del orden de 1 GB o inferior, dependiendo del runtime.
- GPU recomendadas: no se especifican modelos concretos; por tamano, cabe en GPUs consumer como GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU consumer: si, practicamente cualquier GPU con al menos 2 GB de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: transcribe.cpp (runtime principal soportado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Fluid Speech Mini (este) | 627 M | no disponible | Ingles | CC BY 4.0 | GGUF | HuggingFace |
| NVIDIA Parakeet TDT 0.6B v3 | 600 M (aprox.) | no disponible | Ingles | no disponible en la informacion | no disponible | no disponible en la informacion |
| Whisper small | 244 M | 30 s de audio | Multilingue | MIT | safetensors, GGUF, etc. | HuggingFace, OpenAI |

La comparativa se limita a los datos disponibles en la informacion proporcionada. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Modelo monolingue: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion: como todo modelo ASR, puede generar transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario tecnico no visto en entrenamiento.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre datos de habla, puede presentar sesgos de acento, genero o dialecto.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; es obligatorio acreditar como "Fluid Speech Mini by FluidVoice" y conservar los archivos LICENSE y NOTICE.
- Caveat de cuantizacion: los pesos del encoder se re-cuantizaron de Q2_K a Q4_K; aunque la validacion sobre LibriSpeech test-clean mostro transcripciones identicas, no se garantiza equivalencia exacta en todos los dominios.
- Compatibilidad limitada: el formato GGUF esta adaptado especificamente a transcribe.cpp; no se garantiza su carga en otros runtimes.
- Sin datos de rendimiento: no hay benchmarks publicados que permitan estimar la calidad frente a alternativas en condiciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TalkMate/fluid-speech-mini-gguf
- Modelo base en HuggingFace: https://huggingface.co/FluidVoice-Labs/fluid-speech-mini-gguf
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- TalkMate (repositorio): https://github.com/TalkMate-App
