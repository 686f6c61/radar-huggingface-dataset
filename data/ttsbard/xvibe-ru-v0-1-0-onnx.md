# TTSBard/xvibe-ru-v0.1.0-onnx

## Resumen

xVibePocketTTS v0.1.0 ONNX es un export en formato ONNX del modelo de sintesis de voz xVibePocketTTS v0.1.0, desarrollado por GenVoice y empaquetado por TTSBard para su uso en la aplicacion de escritorio TTSBard. El modelo realiza sintesis de voz en ruso a 24 kHz con clonacion de voz a partir de una muestra corta de referencia (reference WAV), y esta pensado para inferencia local en CPU mediante onnxruntime. Se distribuye como un conjunto de cinco grafos ONNX con cuantizacion INT8 del FlowLM y del decodificador Mimi, junto con un descriptor de paquete `pocket.json` y un fichero `config.yaml`.

El modelo deriva de la arquitectura Pocket TTS de Kyutai (pesos base bajo CC BY 4.0, codigo MIT), sobre la que GenVoice ha realizado un ajuste fino y ha anadido un tokenizador para ruso. TTSBard ha adaptado las herramientas de exportacion ONNX del proyecto PocketTTS.cpp (MIT) para producir este paquete consumible por su aplicacion. El repositorio ocupa 0,2 GB y no incluye los pesos ajustados ni el tokenizador, que deben descargarse de una revision fijada del repositorio upstream.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de un artefacto de evaluacion e investigacion, no de un modelo listo para produccion. La licencia de los pesos ajustados y del tokenizador ruso no esta determinada de forma fehaciente por el titular de los derechos, y el propio autor indica que no se ha obtenido permiso explicito para su distribucion o uso. Cualquier despliegue comercial queda, por tanto, fuera de lo que la informacion disponible permite autorizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai) con FlowLM y decodificador Mimi; export ONNX con cuantizacion INT8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en FlowLM y decodificador Mimi (cinco grafos ONNX) |
| Idiomas soportados | ruso (ru) |
| Licencia | evaluation-only (licencia de los pesos upstream no determinada; ver aviso del autor) |
| Formato de pesos | ONNX (grafos); pesos ajustados en `model.safetensors` y tokenizador `tokenizer.model` descargados aparte del upstream |

## Arquitectura y entrenamiento

La arquitectura subyacente es Pocket TTS de Kyutai, un sistema de sintesis de voz que combina un componente de modelado (FlowLM) con un decodificador de audio (Mimi) para generar waveform a 24 kHz. Sobre esta base, GenVoice ha producido la variante xVibePocketTTS v0.1.0, que incorpora un tokenizador especifico para ruso y pesos ajustados. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de alineamiento o ajuste por preferencias.

El artefacto de este repositorio es un export a ONNX con cuantizacion INT8 de FlowLM y del decodificador Mimi, orientado a inferencia en CPU. La exportacion se ha realizado adaptando las herramientas del proyecto PocketTTS.cpp. El paquete se compone de cinco grafos ONNX, el descriptor `pocket.json` y `config.yaml`; los pesos ajustados (`model.safetensors`) y el tokenizador (`tokenizer.model`) no se incluyen y deben colocarse manualmente en `models/pocket/xvibe-ru-v0.1.0` desde la revision `ac4f9f11eb4a110964c75a1e6f4104005455ac18` del repositorio upstream. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en ruso a 24 kHz.
- Clonacion de voz a partir de una muestra corta de referencia en formato WAV.
- Inferencia local en CPU mediante onnxruntime, sin dependencia de GPU segun la informacion disponible.
- Integracion con la aplicacion TTSBard a traves del descriptor de paquete `pocket.json` y `config.yaml`.
- Cuantizacion INT8 de FlowLM y Mimi para reducir requisitos de computo y memoria.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada distinto de la referencia de voz, ni modos de razonamiento.

## Casos de uso

- Pruebas de sintesis en ruso en entorno de escritorio: el paquete ONNX permite ejecutar el modelo en CPU dentro de TTSBard, lo que facilita evaluar calidad y latencia sin infraestructura GPU.
- Evaluacion de clonacion de voz: con una muestra WAV corta se puede comprobar la fidelidad del timbre clonado en ruso, util para decidir si la tecnologia encaja en un producto antes de resolver la licencia.
- Investigacion comparativa de TTS: sirve como referencia cuantizada INT8 frente a otras variantes de Pocket TTS o a modelos TTS en ruso, midiendo inteligibilidad y naturalidad en un mismo corpus de prueba.
- Prototipado de asistentes de voz en ruso: permite construir un prototipo end-to-end de lectura de texto a audio en local, siempre dentro del marco de evaluacion.
- Generacion de audio para pruebas de accesibilidad: lectura de textos de interfaz en ruso para validar flujos de accesibilidad en aplicaciones de escritorio.
- Validacion de pipelines de exportacion ONNX: el paquete y las herramientas de PocketTTS.cpp sirven para estudiar como se cuantiza y empaqueta un TTS para onnxruntime.
- Docencia y demostraciones: al caber en 0,2 GB de repositorio y ejecutarse en CPU, es adecuado para talleres sobre TTS y cuantizacion sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo documentado, que es inferencia en CPU mediante onnxruntime; no se dispone de cifras de memoria RAM.
- GPU recomendadas: no disponible; el autor no documenta requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: onnxruntime (libreria declarada) y la aplicacion TTSBard; no se documentan vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo TTS.
- Latencia y throughput: no disponibles.
- Almacenamiento: repositorio de 0,2 GB, mas los pesos `model.safetensors` y el tokenizador descargados aparte del upstream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| TTSBard/xvibe-ru-v0.1.0-onnx | no disponible | no disponible | ru | evaluation-only | ONNX (INT8) | Export de evaluacion; pesos aparte |
| genvoice/xVibePocketTTS | no disponible | no disponible | ru | no determinada | safetensors | Modelo upstream del que deriva este export |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | CC BY 4.0 (pesos), MIT (codigo) | no disponible | Base arquitectonica de Kyutai |

No se dispone de datos de rendimiento que permitan comparar calidad de sintesis entre estas variantes.

## Limitaciones y advertencias

- Licencia: el autor declara explicitamente que la licencia de los pesos ajustados y del tokenizador ruso no esta determinada de forma fehaciente y que no ha obtenido permiso para su distribucion o uso; el uso queda restringido a evaluacion personal y pruebas.
- Uso comercial: no autorizado segun la informacion disponible; requiere aclaracion previa con GenVoice (issue #2 del repositorio upstream).
- Dependencia de ficheros externos: los pesos y el tokenizador no estan en este repositorio y deben descargarse de una revision concreta del upstream, lo que anade un paso manual y un punto de fallo.
- Idioma: unicamente ruso; no se documenta soporte multilingue.
- Sesgos: no documentados; al ser un TTS, existen riesgos inherentes de sesgo de hablante y de calidad desigual segun la muestra de referencia.
- Clonacion de voz: implica riesgos de suplantacion y uso indebido; sin marco legal claro, no deberia emplearse con voces de terceros sin consentimiento.
- Alucinacion y estabilidad: no se documentan metricas de inteligibilidad, naturalidad ni tasa de errores de pronunciacion.
- Madurez: version 0.1.0, sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados; no es un artefacto validado para produccion.
- Documentacion incompleta: faltan parametros, contexto, datos de entrenamiento y requisitos de hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TTSBard/xvibe-ru-v0.1.0-onnx
- Modelo upstream xVibePocketTTS (Hugging Face): https://huggingface.co/genvoice/xVibePocketTTS
- Repositorio upstream xVibePocketTTS (GitHub): https://github.com/GenVoice/xVibePocketTTS
- Issue de licencia (GenVoice/xVibePocketTTS #2): https://github.com/GenVoice/xVibePocketTTS/issues/2
- Revision fijada de los pesos upstream: https://huggingface.co/genvoice/xVibePocketTTS/tree/ac4f9f11eb4a110964c75a1e6f4104005455ac18
- Pocket TTS de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Herramientas de exportacion PocketTTS.cpp: https://github.com/VolgaGerm/PocketTTS.cpp
- Aplicacion TTSBard: https://github.com/ttsbard/TTSBard
