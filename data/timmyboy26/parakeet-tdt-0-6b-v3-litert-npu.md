# timmyboy26/parakeet-tdt-0.6b-v3-LiteRT-NPU

## Resumen

Parakeet TDT 0.6B v3 LiteRT NPU es una conversión del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3` a formato LiteRT/TFLite compilado para aceleradores NPU de Qualcomm y MediaTek. Lo publica el usuario `timmyboy26` y deriva del trabajo previo de `litert-community`, añadiendo un parche de estabilidad numérica en float16 que corrige los fallos de transcripción observados en determinados SoCs. El modelo base es un FastConformer de aproximadamente 0,6 mil millones de parámetros con decodificación TDT (Token-and-Duration Transducer) desarrollado por el equipo NVIDIA NeMo.

El problema que resuelve es concreto: el encoder FastConformer contiene 120 capas LayerNorm cuyas entradas alcanzan sumas de cuadrados de aproximadamente 1,3e9, muy por encima del máximo representable en float16 (65504). En NPUs que ejecutan el grafo en float16, esto provoca desbordamiento: en Snapdragon 8 Elite la salida del encoder es NaN y en Dimensity 9400 el encoder devuelve la misma salida para cualquier audio. La solución aplicada multiplica la entrada de cada LayerNorm por una potencia de dos (entre 1/16 y 1/2048, elegida por capa mediante calibración), lo que no altera el resultado matemático de la normalización.

La relevancia es práctica: permite ejecutar ASR de calidad en el NPU de móviles y tablets Android recientes con latencias de 1,8 a 2,4 segundos para 13 segundos de audio, sin depender de la CPU ni de la nube. El repositorio ocupa 1,3 GB y distribuye grafos TFLite de aproximadamente 1,26 GB por SoC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 5 s (500 frames) por inferencia; estado LSTM entre ventanas |
| Tipos de cuantizacion | float32 en origen, parcheado para seguridad en float16; grafos compilados para NPU |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (`.tflite`), compilado con `ai-edge-litert` 2.3.0 |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, una variante de Conformer con atencion y convolucion depthwise dispuestas para reducir coste computacional, acoplado a un decodificador TDT que predice conjuntamente tokens y duraciones. El encoder incluye 120 capas LayerNorm, y el modelo opera de forma stateful: procesa ventanas de 5 segundos (500 frames) manteniendo estado LSTM entre ventanas para dar continuidad a la transcripcion. No se ha reentrenado nada en esta conversion; el autor lo indica explicitamente.

La innovacion tecnica de esta ficha es el parche de estabilidad numérica. Cada entrada de LayerNorm se escala por una potencia de dos calibrada por capa antes de la normalizacion, de modo que la suma de cuadrados no desborde float16. En CPU, el modelo float32 parcheado coincide con el original con un error de aproximadamente 1e-3 en salidas del encoder en el rango -0,15 a 0,19. La compilacion se hace ahead-of-time: builds MediaTek con NeuroPilot SDK de `ai-edge-litert-sdk-mediatek` 2.3.0 y builds Qualcomm con QAIRT 2.50.0. El front end (log-mel de 128 bins, pre-enfasis 0,97, FFT de 512 puntos, ventana Hann de 25 ms, hop de 10 ms, normalizacion por banda) y la decodificacion greedy TDT los aporta la aplicacion, no el grafo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre ventanas de 5 segundos con estado entre ventanas.
- Decodificacion TDT greedy, que predice tokens y duraciones de forma conjunta.
- Ejecucion en NPU de dispositivos moviles mediante la API `CompiledModel` de LiteRT 2.3.x con `Accelerator.NPU`.
- Grafos "drop-in": misma nomenclatura de ficheros, mismas firmas `encode`, `decode` y `decode_1` y mismas formas de tensor que los builds de `litert-community`.
- Soporte multi-SoC: builds verificados para Dimensity 9400/9400+ (MT6991), Snapdragon 8 Elite (SM8750) y Snapdragon 8 Elite Gen 5 (SM8850); builds compilados pero no probados en dispositivo para MT6993, MT6877, MT6878, MT6897, MT6983, MT6985, MT6989, MT8171, MT8188 y MT8189.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes; es un modelo puramente ASR.

## Casos de uso

- Transcripcion en tiempo casi real en movil: con 1,8-2,4 s para 13 s de audio en NPU, es viable transcribir notas de voz o reuniones directamente en el dispositivo sin enviar audio a la nube, lo que reduce latencia y preserva privacidad.
- Subtitulado de video grabado en Android: procesar el audio por ventanas de 5 s con estado LSTM permite generar subtitulos continuos en apps de edicion o reproduccion.
- Dictado por voz en aplicaciones de productividad: el modelo puede alimentar un teclado o campo de texto con transcripcion local, evitando costes de API y funcionando sin conexion.
- Asistentes de voz on-device: integrado en un pipeline de wake-word mas ASR, permite construir asistentes que no dependen de red y que respetan requisitos de privacidad.
- Accesibilidad: transcripcion en vivo de conversaciones para personas con discapacidad auditiva en telefono o tablet, aprovechando el NPU para no agotar la bateria.
- Analitica de audio en campo: dispositivos rugged o tablets sin conectividad estable pueden transcribir entrevistas, inspecciones o notas de campo y sincronizar el texto despues.
- Investigacion en eficiencia de inferencia: sirve como caso de estudio de porting de modelos ASR a NPU y de mitigacion de desbordamiento float16 en LayerNorm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, etc.) en la informacion disponible. Los unicos datos de rendimiento son tiempos de inferencia medidos en dispositivo fisico:

| Fichero | Chip | Dispositivo | Tiempo para 13 s de audio |
|---|---|---|---|
| `MediaTek_MT6991` | Dimensity 9400 / 9400+ | Galaxy Tab S11, Android 16 | 1,8 s |
| `Qualcomm_SM8750` | Snapdragon 8 Elite | Galaxy S25, Android 16 | 2,4 s |
| `Qualcomm_SM8850` | Snapdragon 8 Elite Gen 5 | Galaxy S26, Android 16 | 2,2 s |

El autor indica que la transcripcion de un pasaje hablado de 13 segundos fue palabra por palabra en NPU. No se aportan cifras de WER ni comparaciones con el modelo base en GPU/CPU.

## Requisitos de hardware

- Almacenamiento: aproximadamente 1,26 GB por fichero TFLite de SoC; el repositorio completo ocupa 1,3 GB.
- Memoria: no se especifica RAM o VRAM necesaria; al ejecutarse en NPU movil, la restriccion es la memoria compartida del SoC, no VRAM dedicada.
- SoCs verificados en dispositivo: Dimensity 9400/9400+ (MT6991), Snapdragon 8 Elite (SM8750), Snapdragon 8 Elite Gen 5 (SM8850).
- SoCs compilados sin verificacion en dispositivo: MT6993, MT6877, MT6878, MT6897, MT6983, MT6985, MT6989, MT8171, MT8188, MT8189.
- SoCs no soportados: Snapdragon 8 Gen 1 (SM8450) sigue fallando con este parche; MT6879 no compila. Snapdragon 8 Gen 2, 8 Gen 3 y Tensor G6 funcionan con los builds originales de `litert-community`.
- Despliegue: API `CompiledModel` de LiteRT 2.3.x sobre `Accelerator.NPU`; en Qualcomm se requieren las librerias de runtime QAIRT 2.50. El ejemplo de referencia es el sample `speech_recognition` de `litert-samples`.
- No esta pensado para vLLM, llama.cpp, Ollama ni TGI: es un grafo TFLite para NPU movil, no un modelo de texto con pesos en safetensors/GGUF.
- Latencia y throughput: 1,8-2,4 s para 13 s de audio en los tres dispositivos verificados, es decir, factor en tiempo real de aproximadamente 5,4x a 7,2x.
- Nota de integracion Qualcomm: mantener un conjunto de buffers de entrada y salida por firma y copiar datos entre ellos; pasar buffers de una firma a otra o intercambiar los buffers de estado LSTM entre ejecuciones hace que el dispatch pierda los registros de buffers a mitad de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / destino | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `timmyboy26/parakeet-tdt-0.6b-v3-LiteRT-NPU` | aproximadamente 0,6 B | TFLite compilado para NPU movil | ventanas de 5 s con estado | CC-BY-4.0 | Hugging Face, 0 descargas, 0 likes |
| `litert-community/parakeet-tdt-0.6b-v3` | aproximadamente 0,6 B | TFLite para NPU movil | ventanas de 5 s con estado | no disponible en la informacion | Hugging Face |
| `nvidia/parakeet-tdt-0.6b-v3` | aproximadamente 0,6 B | pesos NeMo originales | no disponible en la informacion | CC-BY-4.0 | Hugging Face (NVIDIA NeMo) |

La diferencia principal frente a `litert-community` es la correccion float16 para Snapdragon 8 Elite y Dimensity 9400; frente al original de NVIDIA, el formato de despliegue y el destino hardware. No se dispone de datos de calidad (WER) para comparar rendimiento entre los tres.

## Limitaciones y advertencias

- Modelo de nicho: 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad ni historial de mantenimiento.
- Solo se ha verificado en dispositivo en tres SoCs; el resto de builds compilados no se han ejecutado en hardware real y pueden fallar.
- Snapdragon 8 Gen 1 (SM8450) sigue sin funcionar con este parche y MT6879 no compila.
- El parche float16 es una solucion de calibracion por capa; el autor reporta error de aproximadamente 1e-3 frente al float32 en CPU, pero no se documenta el impacto en WER.
- Es un grafo "bare": la aplicacion debe aportar el front end log-mel, la decodificacion TDT greedy y el tokenizer; no es un pipeline listo para usar.
- No se documentan idiomas soportados en esta ficha; la cobertura linguistica depende del modelo base `nvidia/parakeet-tdt-0.6b-v3` y no se detalla aqui.
- Riesgo de alucinacion en ASR: no se aportan datos de WER ni de comportamiento en audio ruidoso, con acentos o con solapamiento de hablantes.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; hay que citar a NVIDIA NeMo, a los autores de `litert-community` y a LLM Hub por el parche y los builds.
- Integracion Qualcomm delicada: la gestion de buffers por firma y del estado LSTM es un requisito estricto para evitar fallos en tiempo de ejecucion.
- Sin soporte para vLLM, llama.cpp, Ollama ni TGI; no es desplegable en servidor convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timmyboy26/parakeet-tdt-0.6b-v3-LiteRT-NPU
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Builds previos de la comunidad: https://huggingface.co/litert-community/parakeet-tdt-0.6b-v3
- Sample de reconocimiento de voz de LiteRT: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/speech_recognition
