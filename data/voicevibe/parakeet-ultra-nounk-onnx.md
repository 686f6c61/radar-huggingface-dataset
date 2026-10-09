# VoiceVibe/parakeet-ultra-nounk-onnx

## Resumen

parakeet-ultra-nounk-onnx es la exportación a ONNX de moondream/parakeet-ultra, un modelo de reconocimiento automatico del habla (ASR) obtenido mediante post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3. Lo publica VoiceVibe y sigue la disposicion de ficheros de la libreria onnx-asr, pensada para ejecutar ASR local sin pila de Python ni CUDA. Cuenta con unos 0,6 mil millones de parametros y cubre 25 idiomas europeos. Es el modelo de reconocimiento offline de la aplicacion de escritorio VoiceVibe.

La arquitectura es la de parakeet-tdt-0.6b-v3: un codificador FastConformer de 24 capas y dimension oculta 1024, con decodificador TDT (Token-and-Duration Transducer). El autor reutiliza el preprocesador, el tokenizer y la configuracion de NVIDIA v3, de modo que la unica diferencia frente a ese modelo son los pesos. Como cambio funcional, se suprime el token `<unk>` bajando en 10.000 el sesgo de su salida en la red conjunta, de forma que el modelo nunca lo emite.

Su relevancia practica es doble: por un lado mejora la tasa de error de palabra (WER) respecto a v3 en varios idiomas sobre FLEURS, y por otro se distribuye en ONNX fp32, lo que permite inferencia en CPU con ONNX Runtime y despliegues sencillos en aplicaciones de escritorio o moviles. El repositorio ocupa unos 2,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (24 capas, 1024 de dimension oculta) con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica ventana de tokens; entrada de audio. La pipeline de referencia segmenta el audio en tramos de hasta 30 segundos |
| Tipos de cuantizacion | fp32 (este repositorio); fp16 (pesos originales de Moondream); int8 en variantes comunitarias |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR basado en transductor. El codificador es un FastConformer con 24 capas y dimension oculta 1024, el mismo bloque que emplea parakeet-tdt-0.6b-v3. El decodificador es del tipo TDT, una variante de transductor que predice de forma conjunta el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transductor clasico. Esta ficha no reproduce el detalle del dataset de preentrenamiento original; lo que consta es que parakeet-ultra es un post-entrenamiento de v3 y que este repositorio solo cambia los pesos, no la arquitectura, el tokenizer ni el grafo.

El proceso de conversion fue el siguiente: los pesos de Moondream en safetensors fp16 se pasaron a un checkpoint NeMo en fp32, reutilizando el preprocesador, el tokenizer y la configuracion de NVIDIA v3; despues se exporto a ONNX con la herramienta de exportacion de NeMo (opset 17), siguiendo la receta de istupakov/parakeet-tdt-0.6b-v3-onnx. Segun el autor, aplicar esa misma receta a v3 reproduce esos ficheros byte a byte. La innovacion funcional declarada es la supresion del token `<unk>`: en el modelo original aparece cuando el texto de entrenamiento contenia caracteres que el tokenizer no puede representar (corchetes, guiones, comillas, `&`), y aqui se elimina reduciendo en 10.000 el sesgo de esa salida en la red conjunta.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en 25 idiomas europeos, entre ellos ingles, aleman, frances, espanol, italiano, portugues, ruso, ucraniano y neerlandes.
- Decodificacion TDT, que combina prediccion de token y de duracion para acelerar la inferencia.
- Manejo de audio de larga duracion por segmentacion: la pipeline de referencia corta el audio en pausas detectadas por la cabeza VAD del modelo, en segmentos de hasta 30 segundos.
- Inferencia local sin GPU ni servicios en la nube mediante ONNX Runtime.
- Supresion del token `<unk>`, lo que evita emisiones espurias ante signos de puntuacion o simbolos no representables.
- Salida de transcripcion plana (texto), sin marcas de hablante ni timestamps en la informacion disponible.
- No soporta traduccion, tool calling, agentes ni razonamiento multi-paso; es un modelo especializado exclusivamente en ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo procesa audio largo segmentandolo en tramos de hasta 30 segundos y devuelve texto en 25 idiomas, util para generar actas a partir de grabaciones.
- Subtitulado de contenido audiovisual: integrado en un pipeline de video, transcribe la pista de audio a texto para generar subtitulos en cualquiera de los idiomas soportados.
- Aplicaciones de escritorio con dictado: al ejecutarse en ONNX sobre CPU, permite dictado local en herramientas ofimaticas sin enviar audio a la nube.
- Asistentes de voz embebidos: por su tamano (0,6 B) y su formato ONNX, es viable en equipos sin GPU dedicada, lo que encaja en kioscos, terminales o portatiles modestos.
- Indexado y busqueda de archivos de audio: transcribir grandes volumenes de grabaciones para hacerlas buscables por texto, aprovechando la mejora de WER frente a v3 en espanol, portugues, aleman e ingles.
- Accesibilidad: conversion de voz a texto en tiempo casi real para personas con discapacidad auditiva o para generar transcripciones de accesibilidad.
- Documentacion clinica o legal dictada: transcripcion de dictados en entornos con requisitos de privacidad, ya que el proceso puede mantenerse completamente en local.
- Preprocesado de datos de voz: generacion de transcripciones automaticas para entrenar o evaluar otros modelos de voz dentro de un pipeline interno.

## Benchmarks y rendimiento

Tasas de error de palabra (WER, en %) medidas con onnx-asr 0.7.0 en fp32 sobre clips de test de FLEURS, comparando parakeet-tdt-0.6b-v3 (ONNX) con este modelo. Los numeros absolutos son mas altos que las cifras de leaderboard, que emplean referencias preparadas; la comparacion valida es entre las dos columnas.

| FLEURS | parakeet-tdt-0.6b-v3 (ONNX) | parakeet-ultra-nounk-onnx |
|---|---|---|
| Ingles (647 clips) | 6,70 | 6,06 |
| Espanol (300) | 3,78 | 3,18 |
| Portugues (300) | 5,77 | 4,96 |
| Aleman (300) | 7,31 | 6,73 |

El autor indica que la velocidad y el consumo de memoria son los mismos que los de v3. No se han publicado en la informacion disponible cifras de rendimiento (latencia, throughput) ni resultados en otros idiomas de la lista de 25.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 2,4 GB; una variante int8 reduce el requisito a unos 0,6 GB. El repositorio completo ocupa 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre es suficiente; tarjetas como RTX 3060, RTX 4060 o RTX 4090 lo ejecutan con holgura. En centros de datos, A100 o H100 no son necesarias para este tamano de modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso puede ejecutarse solo en CPU.
- Opciones de despliegue: onnx-asr y ONNX Runtime para CPU; sherpa-onnx para las variantes int8; la exportacion sigue la receta de istupakov/parakeet-tdt-0.6b-v3-onnx. No aplican vLLM ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo afirma que coinciden con los de v3.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER FLEURS EN | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-ultra-nounk-onnx (este) | 0,6 B | 25 | 6,06 | CC BY 4.0 | ONNX fp32 |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 | 6,70 | CC BY 4.0 | NeMo, safetensors, ONNX |
| moondream/parakeet-ultra | 0,6 B | 25 | no disponible | CC BY 4.0 | safetensors fp16 |
| mldecode/parakeet-ultra-onnx-int8 | 0,6 B | 25 | no disponible | no disponible | ONNX int8 |

Frente a Whisper large-v3, que es la alternativa ASR multilingue mas extendida, no se dispone de cifras comparables en la informacion proporcionada; la diferencia practica es que parakeet-ultra-nounk-onnx es mas pequeno (0,6 B) y esta orientado a ejecucion local via ONNX, mientras que Whisper large-v3 es notablemente mayor y suele desplegarse con otras pilas. No se inventan numeros de WER para esa comparacion.

## Limitaciones y advertencias

- Es un modelo exclusivamente de ASR; no genera texto libre, no razona, no hace tool calling ni soporta agentes.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, acentos marcados, solapamiento de voces o vocabulario tecnico poco frecuente.
- La supresion del token `<unk>` evita la emision de "⁇", pero no garantiza que los caracteres no representables por el tokenizer se transcriban correctamente.
- Cobertura limitada a 25 idiomas europeos; no hay soporte declarado para otras lenguas.
- La entrada es audio segmentado en tramos de hasta 30 segundos en la pipeline de referencia; audios mas largos dependen del segmentador externo.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a Moondream y a NVIDIA; no implica respaldo de ninguno de los dos.
- Se distribuye "tal cual", sin garantias, segun los terminos de la licencia.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion comunitaria amplia.
- No hay datos publicados de latencia, throughput ni consumo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VoiceVibe/parakeet-ultra-nounk-onnx
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Receta de exportacion ONNX de referencia: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Variante int8 comunitaria: https://huggingface.co/mldecode/parakeet-ultra-onnx-int8
- Conversion Parakeet TDT a ONNX (jeanthink): https://github.com/jeanthink/parakeet-onnx
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
