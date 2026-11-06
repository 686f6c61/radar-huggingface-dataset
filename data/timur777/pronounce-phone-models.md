# timur777/pronounce-phone-models

## Resumen

`timur777/pronounce-phone-models` no es un modelo aislado, sino un conjunto (phone set) de modelos de voz empaquetados para su descarga e inferencia en dispositivos iOS, desarrollado por el usuario timur777. El repositorio funciona como fuente primaria de descarga para las apps iOS **Say it** y **MindRelay**, que lo utilizan para evaluar la pronunciación de estudiantes de idiomas directamente en el teléfono, sin depender de servidores remotos. El paquete se organiza mediante un `manifest.json` que incluye ruta, tamaño y hash SHA-256 de cada fichero, lo que permite descargas incrementales y verificación de integridad.

El conjunto combina varios modelos especializados: un reconocedor de fonemas basado en wav2vec2 XLS-R 53 cuantizado a int8 (derivado de `facebook/wav2vec2-xlsr-53-espeak-cv-ft`), un sistema de reconocimiento de palabras completo basado en Parakeet TDT 0.6B v3 de NVIDIA (int8, formato ONNX, con variante CoreML para el Neural Engine), el front-end mel de Parakeet, un modelo secundario ZIPA small para una segunda opinión sobre sonidos marcados como incorrectos, y datos propios del evaluador (referencias nativas, umbrales, léxicos, perfiles de lecturas nativas).

Su relevancia radica en el enfoque on-device: toda la evaluación de pronunciación (fonemas + transcripción + verificación) se ejecuta localmente en el iPhone, con pesos int8 optimizados para el Neural Engine y CPU. El tamaño total del repositorio es de 1,7 GB. Cada modelo incluido conserva su propia licencia, y el motor de consumo es un crate de Rust denominado `pronounce_phone`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de modelos: wav2vec2 (reconocedor de fonemas), Parakeet TDT (RNN-T/Transductor, ASR), ZIPA CRCTC (verificación secundaria), front-end mel |
| Parametros totales | no disponible (repo de 1,7 GB en total) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (todos los modelos del conjunto) |
| Idiomas soportados | no disponible (Parakeet TDT 0.6B v3 es multilingue, pero el conjunto no lo especifica) |
| Licencia | other (cada modelo conserva su propia licencia; consultar fuentes) |
| Formato de pesos | ONNX (int8) y CoreML (mlmodelc, para el encoder de Parakeet en iOS < 26) |

## Arquitectura y entrenamiento

El conjunto no es un modelo entrenado unitariamente, sino una colección orquestada de modelos ya entrenados por terceros, adaptados y cuantizados a int8 para inferencia en movil. El componente de juicio fonetico es `xlsr53-int8mm.onnx`, derivado de wav2vec2 XLS-R 53 fine-tuned con espeak y Common Voice, que actua como reconocedor de fonemas (phone recogniser) para puntuar los sonidos del aprendiz. La transcripcion de palabras se realiza con Parakeet TDT 0.6B v3 de NVIDIA (0,6 mil millones de parametros, arquitectura TDT — Token-and-Duration Transducer), distribuido en int8 ONNX junto a su front-end mel `nemo128.onnx` (procedente del proyecto onnx-asr).

Para dispositivos con iOS anterior a la version 26, se incluye un encoder de Parakeet convertido a CoreML int8 (`parakeet-enc-5s.mlmodelc`) para ejecutar los "polls" en el Neural Engine; a partir de iOS 26 la app puede usar el reconocimiento nativo de Apple. Cuando un sonido es marcado como incorrecto, el modelo ZIPA small (CRCTC, cuantizado int8) proporciona una segunda opinion. Los datos propios del evaluador (`device/`) incluyen referencias de hablantes nativos, umbrales de puntuacion, informacion de acentuacion (stress), sonidos de las lineas, lexicones y perfiles de lecturas nativas. No se dispone de informacion sobre datos de entrenamiento propios, numero de tokens ni RLHF/DPO, ya que el repositorio no entrena modelos nuevos.

## Capacidades

- Reconocimiento de fonemas: `xlsr53-int8mm.onnx` identifica los sonidos producidos por el aprendiz para puntuarlos frente a referencias nativas.
- Reconocimiento automatico de habla (ASR): Parakeet TDT 0.6B v3 transcribe las palabras escuchadas, en formato int8 ONNX para CPU/movil.
- Front-end de extraccion de caracteristicas mel: `nemo128.onnx` genera las caracteristicas de entrada de Parakeet.
- Inferencia en Neural Engine: variante CoreML del encoder de Parakeet para ventanas de 5 segundos en iOS anterior a 26.
- Verificacion secundaria de sonidos: ZIPA small reevalua sonidos marcados como erroneos para reducir falsos negativos.
- Evaluacion de pronunciacion con datos propios: umbrales de puntuacion, referencias de hablantes nativos, manejo del acento y lexicones incluidos en `device/`.
- Descarga verificada e incremental: `manifest.json` con SHA-256 por fichero y revision del conjunto, permitiendo actualizaciones parciales.
- No hay soporte documentado de tool calling, agentes, vision ni generacion de texto.

## Casos de uso

- Evaluacion de pronunciacion en apps de aprendizaje de idiomas: las apps Say it y MindRelay usan el conjunto para puntuar la pronunciacion del usuario directamente en el iPhone, sin enviar audio a servidores, lo que reduce latencia y problemas de privacidad.
- Deteccion de errores foneticos con doble verificacion: cuando el reconocedor de fonemas marca un sonido como incorrecto, ZIPA small ofrece una segunda opinion para confirmar el error antes de penalizar al usuario.
- Transcripcion en dispositivo para retroalimentacion contextual: Parakeet TDT 0.6B v3 transcribe lo dicho por el alumno, permitiendo comparar no solo sonidos sino palabras completas frente al texto objetivo.
- Ejecucion eficiente en hardware Apple: la variante CoreML del encoder permite aprovechar el Neural Engine en iOS anterior a 26, y a partir de iOS 26 puede delegarse en el reconocimiento nativo de Apple.
- Distribucion de modelos con integridad garantizada: el mecanismo de manifest con SHA-256 y revisiones permite a cualquier app movil descargar y actualizar modelos de forma segura e incremental, verificando cada fichero contra su hash.
- Integracion en pipelines Rust: el crate `pronounce_phone` consume el conjunto, por lo que puede reutilizarse en otras apps iOS o herramientas basadas en Rust que necesiten evaluacion de pronunciacion on-device.
- Fallback de descarga distribuida: el repositorio actua como primera fuente y el servidor propio del laboratorio como segunda, un patron util para apps con alta disponibilidad de assets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos subyacentes (wav2vec2 XLS-R 53, Parakeet TDT 0.6B v3, ZIPA small) tienen benchmarks propios en sus repositorios de origen, pero este conjunto no publica metricas de evaluacion de pronunciacion ni de latencia.

## Requisitos de hardware

- Destino principal: dispositivos iOS (iPhone), con inferencia on-device.
- VRAM/GPU: no aplicable directamente; el conjunto esta cuantizado a int8 para ejecutarse en CPU movil y Neural Engine, no en GPU de servidor.
- Tamano de descarga: 1,7 GB en total, con descargas incrementales por fichero mediante el manifest.
- Componente CoreML: `parakeet-enc-5s.mlmodelc` esta pensado para el Neural Engine de Apple en iOS anterior a 26; en iOS 26 o superior la app puede usar el reconocimiento de voz nativo de Apple para los polls.
- Despliegue en escritorio/servidor: los ficheros ONNX int8 (Parakeet, wav2vec2, ZIPA) podrian ejecutarse con onnxruntime u onnx-asr, aunque el repositorio esta orientado al consumo mediante el crate Rust `pronounce_phone`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| timur777/pronounce-phone-models | Conjunto de modelos de evaluacion de pronunciacion | 1,7 GB (repo) | ONNX int8, CoreML | other (por componente) | Puntuacion de pronunciacion on-device en iOS |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | Reconocedor de fonemas (componente) | ~0,3 B parametros (base XLS-R 53) | safetensors/pytorch | Consultar fuente | Alineacion fonetica |
| nvidia/parakeet-tdt-0.6b-v3 | ASR transductor | 0,6 B parametros | PyTorch/NeMo (aqui ONNX int8) | Consultar fuente (CC-BY-4.0 tipicamente) | Transcripcion de habla |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ASR convertido a ONNX | 0,6 B parametros (int8) | ONNX | Consultar fuente | ASR en CPU/movil |

La diferencia clave es que este repositorio no compite con los modelos individuales, sino que los empaqueta con datos de evaluacion propios y mecanismo de distribucion verificado para un caso de uso concreto: evaluacion de pronunciacion en movil.

## Limitaciones y advertencias

- Licencia "other": la licencia global no es estandar; cada modelo del conjunto conserva su propia licencia y debe consultarse en su repositorio de origen antes de cualquier uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin comunidad ni historial de uso verificable.
- Sin model card tecnica detallada: no se documentan idiomas soportados, metricas de precision, umbrales de puntuacion ni procedimientos de evaluacion.
- Dependencia de modelos de terceros: los componentes (wav2vec2, Parakeet, ZIPA) pueden cambiar, retirarse o corregir licencias en sus repositorios originales.
- Restriccion de plataforma: el conjunto esta disenado para el ecosistema iOS (CoreML, Neural Engine, reconocimiento nativo de Apple en iOS 26); su uso en Android o servidores no esta documentado.
- Riesgo de sesgo: los modelos de ASR y fonemas subyacentes pueden presentar sesgos por acento, genero o idioma, especialmente relevantes en evaluacion de pronunciacion de hablantes no nativos; el conjunto no publica analisis de equidad.
- Riesgo de falsos positivos/negativos en puntuacion: mitigado parcialmente por la doble verificacion con ZIPA, pero sin metricas publicadas de fiabilidad.
- Sin datos de rendimiento: no hay cifras de latencia, consumo de bateria ni precision de puntuacion en dispositivos reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/timur777/pronounce-phone-models
- Modelo base del reconocedor de fonemas: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Parakeet TDT 0.6B v3 en ONNX: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Parakeet TDT 0.6B v3 original (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Front-end mel (onnx-asr): https://github.com/istupakov/onnx-asr
- Encoder Parakeet en CoreML: https://huggingface.co/aufklarer/Parakeet-TDT-v3-CoreML-INT8
- Modelo ZIPA small: https://huggingface.co/anyspeech/zipa-small-crctc-ns-700k
