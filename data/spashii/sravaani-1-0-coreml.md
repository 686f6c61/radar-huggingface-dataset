# spashii/SraVaani-1.0-CoreML

## Resumen

SraVaani-1.0-CoreML es una conversión a Core ML del modelo de reconocimiento automático del habla SraVaani 1.0, desarrollado originalmente por ARTPARK-IISc para lenguas indias e inglés. Esta versión, publicada por el usuario spashii, reimplementa la red en PyTorch a partir de la exportación ONNX de los autores, mantiene los pesos sin cambios y la convierte a Core ML con precisión de 16 bits, de modo que el codificador se ejecuta en el Neural Engine de los Mac con Apple Silicon.

El modelo resuelve la transcripción de audio de hasta 30 segundos a 16 kHz en el dispositivo, sin depender de servicios en la nube, lo que resulta relevante para aplicaciones de dictado y grabación de llamadas con requisitos de privacidad. La arquitectura subyacente es un codificador FastConformer acoplado a un decodificador TDT (Token-and-Duration Transducer) con red conjunta, y el paquete incluye el tokenizador SentencePiece original de los autores.

El repositorio ocupa 0,9 GB y se distribuye con licencia MIT, la misma que el modelo base. Su interés actual radica en ofrecer una vía práctica para ejecutar ASR multilingüe de ámbito índico en hardware de consumo Apple, con el codificador descargado a la NPU y el decodificador en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + decodificador TDT con red conjunta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio a 16 kHz por inferencia |
| Tipos de cuantizacion | 16 bits (Core ML, precision del build) |
| Idiomas soportados | lenguas indias e ingles (segun el modelo base; lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `tokenizer.model` (SentencePiece), `manifest.json` |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de tipo transducer: un codificador FastConformer procesa ventanas de audio de hasta 30 segundos a 16 kHz y un decodificador TDT, junto con una red conjunta, genera los tokens de transcripcion paso a paso. En esta build, el codificador se ejecuta casi por completo (aproximadamente el 99,6 % de su computo) en el Neural Engine de Apple, mientras que el decodificador y la red conjunta corren en CPU.

La conversion no altera los pesos: la red se reconstruyo en PyTorch desde la exportacion ONNX de los autores y despues se convirtio a Core ML a 16 bits. El tokenizador es el modelo SentencePiece publicado por los autores. Los detalles de entrenamiento (volumen de datos, composicion del corpus, uso de RLHF o tecnicas de aumento) se describen en la model card original y en el articulo Pulikodan et al., "SraVaani 1.0: Scaling Inclusive Speech Recognition for Indic Languages" (arXiv:2608.08235), y no se reproducen en esta ficha.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) para lenguas indias e ingles.
- Procesamiento de segmentos de audio de hasta 30 segundos a 16 kHz por pasada.
- Ejecucion local en Apple Silicon con aceleracion por Neural Engine en el codificador.
- Tokenizacion SentencePiece compatible con el modelo original.
- Verificacion de integridad de descarga mediante `manifest.json` con tamanos en bytes.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio mas alla de ASR: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Dictado en macOS: integracion en aplicaciones de escritorio para transcribir voz a texto en tiempo real o por lotes, aprovechando la ejecucion en el Neural Engine y la ausencia de envio de audio a servidores externos.
- Grabacion y transcripcion de llamadas: el modelo base esta pensado para escenarios de call recording; esta build permite procesar las grabaciones localmente en el Mac del usuario, lo que simplifica el cumplimiento de privacidad.
- Subtitulado offline de contenido en lenguas indias: transcripcion de clips de hasta 30 segundos para generar subtitulos sin conexion.
- Herramientas de accesibilidad: conversion de voz a texto para usuarios con movilidad reducida en entornos Apple, con latencia baja al ejecutarse en el dispositivo.
- Investigacion en ASR indico: punto de partida para experimentos de evaluacion y comparacion de modelos transducer en hardware Apple, sin necesidad de GPUs dedicadas.
- Prototipado rapido de aplicaciones de voz: el paquete Core ML y el manifiesto de ficheros facilitan la integracion en proyectos Swift o Python sobre macOS con verificacion de integridad de los artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para ejecucion en Apple Silicon con memoria unificada. El repositorio ocupa 0,9 GB, por lo que se requiere al menos ese espacio en disco y memoria suficiente para cargar los `.mlmodelc`.
- GPU recomendadas: no aplica en el sentido tradicional; requiere un Mac con Apple Silicon (Neural Engine para el codificador).
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama consumer con Neural Engine; no se especifican modelos concretos de chip.
- Opciones de despliegue: Core ML (formato nativo), con integracion en aplicaciones macOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles; la model card solo indica que aproximadamente el 99,6 % del computo del codificador se ejecuta en el Neural Engine.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SraVaani-1.0-CoreML | no disponible | 30 s de audio | MIT | Core ML | Hugging Face |
| SraVaani 1.0 (original) | no disponible | no disponible | MIT | ONNX (exportacion de los autores) | Hugging Face |
| Alternativas ASR indicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa segmentos de audio de hasta 30 segundos a 16 kHz; audios mas largos requieren segmentacion previa.
- La lista concreta de lenguas indias soportadas no se detalla en esta build; debe consultarse la model card original.
- Riesgo de errores de transcripcion y alucinacion en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan tasas de error.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al depender del corpus de entrenamiento original, pueden heredarse desequilibrios entre lenguas.
- La licencia MIT permite uso comercial, pero se mantiene la atribucion a ARTPARK-IISc como titular del copyright.
- Dependencia de hardware Apple Silicon: no es desplegable en GPUs NVIDIA ni en entornos sin Core ML.
- El decodificador se ejecuta en CPU, lo que puede limitar el throughput en equipos con CPU mas lenta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spashii/SraVaani-1.0-CoreML
- Modelo base: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Articulo: Pulikodan et al., "SraVaani 1.0: Scaling Inclusive Speech Recognition for Indic Languages", arXiv:2608.08235
- Aplicacion que lo utiliza: https://dictate.tech
