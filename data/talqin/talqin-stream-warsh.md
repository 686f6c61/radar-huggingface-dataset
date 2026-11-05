# talqin/talqin-stream-warsh

## Resumen

Talqin streaming model v1.0 (Warsh) es un modelo de reconocimiento automático del habla (ASR) especializado en la recitación del Corán según la riwaya de Warsh 'an Nafi'. Lo desarrolla Talqin, un proyecto que construye una aplicación móvil para seguir la recitación coránica palabra por palabra y localizar la aleya correspondiente en el mushaf sin necesidad de un servidor. El modelo está diseñado para ejecutarse íntegramente en el dispositivo del recitador, lo que lo convierte en una pieza de inferencia local con requisitos de cómputo muy reducidos.

Técnicamente es un Zipformer causal (streaming) con cabecera CTC de 22,3 millones de parámetros, entrenado desde cero sobre 1.511 horas de audio de 59 recitadores con aumentación de ruido, efectos de línea telefónica y variaciones de velocidad. En lugar de emitir palabras, emite 60 símbolos fonéticos (definidos en `tokens.txt`) a razón de uno cada 40 ms, con una latencia de aproximadamente 0,4 s; la aplicación Talqin se encarga de mapear esos sonidos al texto coránico.

Su relevancia radica en el nicho: es un modelo compacto (25 MB en cuantización int8) que corre entre 2 y 15 veces más rápido que tiempo real en teléfonos, con un 1,8 % de error de sonido sobre recitadores no vistos y un 9,1 % en una sala doméstica simulada. Está publicado con licencia Apache 2.0 y formato ONNX para sherpa-onnx, lo que facilita su integración en Android, iOS, escritorio y navegador vía WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer causal (streaming) con cabecera CTC |
| Parametros totales | 22,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de 0,32 s en streaming) |
| Tipos de cuantizacion | int8 (unico peso publicado: `model.int8.onnx`, 25 MB) |
| Idiomas soportados | arabe (recitacion coranica, riwaya de Warsh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`), mas `tokens.txt` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo es un Zipformer causal, es decir, una variante del encoder Zipformer disenada para inferencia en streaming: procesa el audio en porciones de 0,32 s y emite una prediccion cada 40 ms, sin acceso al futuro de la señal. Sobre el encoder se situa una cabecera CTC que produce directamente los 60 simbolos foneticos definidos en `tokens.txt`. No se trata de un modelo de palabras ni de texto: la salida es una secuencia de sonidos que la aplicacion cliente alinea con el texto coranico.

El entrenamiento se realizo desde cero sobre 1.511 horas de audio de 59 recitadores, con aumentacion explicita de ruido, efectos de linea telefonica y variaciones de velocidad, orientada a la captacion mediante el microfono de un telefono en condiciones domesticas. La model card no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma estandar en un modelo CTC de ASR). La innovacion principal es la combinacion de un encoder streaming muy compacto (22,3 M de parametros) con una salida fonetica de grano fino pensada para que un buscador externo resuelva la localizacion en el Coran.

## Capacidades

- Reconocimiento de voz en streaming de recitacion coranica en la riwaya de Warsh 'an Nafi'.
- Emision de 60 simbolos foneticos (sonidos) cada 40 ms, con latencia aproximada de 0,4 s.
- Inferencia causal: no requiere el audio completo, procesa porciones de 0,32 s.
- Ejecucion en dispositivo (Android, iPhone, ordenadores y navegador via WebAssembly) mediante sherpa-onnx (`OnlineRecognizer`, `zipformer2Ctc`).
- Rendimiento de 2 a 15 veces mas rapido que tiempo real en telefonos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision ni audio generativo; es exclusivamente ASR.
- No soporta otros idiomas ni otras riwayas distintas de Warsh.
- No incluye modo thinking ni capacidades de generacion de texto.

## Casos de uso

- Seguimiento de recitacion en tiempo real en la app Talqin: el modelo escucha al recitador desde el microfono del telefono, emite los sonidos cada 40 ms y la aplicacion localiza la aleya en el mushaf; su latencia de 0,4 s y su ejecucion local sin servidor lo hacen adecuado para este flujo.
- Localizacion automatica de aleya ("donde estoy"): a partir de la secuencia de sonidos, el buscador de la app coloca correctamente el 98,3 % de las frases, segun la model card; util para recitadores que han perdido el hilo.
- Aplicaciones moviles sin conectividad: al correr en el dispositivo con 25 MB de pesos int8 y 2-15x tiempo real, permite su uso en entornos sin red o con privacidad estricta (el audio no sale del telefono).
- Integracion en navegador mediante WebAssembly: para herramientas web de practica de recitacion que no quieran depender de un backend de inferencia.
- Prototipado de sistemas de alineacion fonetica arabe: los 60 simbolos y la salida CTC pueden reutilizarse como front-end acustico en pipelines de investigacion sobre tajwid o fonetica coranica.
- Evaluacion y desarrollo de correctores de recitacion: aunque el modelo no juzga errores (lo hace un modelo mayor en servidor), su salida fonetica sirve como primera etapa de un sistema de deteccion de desviaciones.
- Demos educativas de ASR streaming de bajo coste: por su tamano y su licencia Apache 2.0, es util para ensenar o experimentar con Zipformer causal y sherpa-onnx en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de error de sonido | 1,8 % | 7 recitadores no vistos, 8,45 h |
| Tasa de error de sonido | 9,1 % | Sala domestica simulada (eco, ruido, microfono de telefono) |
| Precision de localizacion de frases | 98,3 % | Buscador de la app Talqin, usando la salida del modelo |
| Velocidad de inferencia | 2-15x tiempo real | En telefonos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech, etc.) en la informacion disponible; los datos anteriores son los unicos reportados por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 22,3 M de parametros en int8 (25 MB de pesos), la huella de memoria es del orden de decenas de MB, apta para ejecucion en CPU.
- GPU recomendadas: no requiere GPU; esta pensado para CPU movil y navegador. No se documentan requisitos de GPU (A100, H100, RTX 4090, etc.).
- Cabe en cualquier GPU consumer y, de hecho, en telefonos y navegadores; no se especifican modelos concretos de GPU.
- Opciones de despliegue: sherpa-onnx (`OnlineRecognizer.from_zipformer2_ctc` con `tokens.txt` y `model.int8.onnx`), en Android, iOS, escritorio y WebAssembly. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: aproximadamente 0,4 s desde que se pronuncia un sonido hasta que se emite.
- Throughput: 2-15 veces tiempo real en telefonos, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Licencia | Disponibilidad |
|---|---|---|---|---|
| Talqin streaming v1.0 (Warsh) | 22,3 M | Streaming causal, ventanas de 0,32 s | Apache 2.0 | HuggingFace (ONNX, sherpa-onnx) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de ASR coranico en streaming con los que establecer una comparacion cuantitativa; por tanto, no se presentan cifras de terceros.

## Limitaciones y advertencias

- No es un juez de errores de recitacion: la model card advierte que el modelo ha escuchado el mismo texto coranico muchas veces durante el entrenamiento y en parte "se lo sabe de memoria"; la deteccion de fallos la realiza un modelo mayor en el servidor de Talqin.
- El propio autor advierte que el modelo puede equivocarse y que es solo una ayuda, no un sustituto de un maestro cualificado y autorizado (ijaza).
- Cobertura limitada a una unica riwaya (Warsh 'an Nafi') y al idioma arabe; no soporta otras recitaciones ni otros idiomas.
- Salida fonetica, no textual: requiere un componente externo (el buscador de la app) para convertir sonidos en palabras y aleyas; no es un transcriptor de texto listo para usar.
- Rendimiento degradado en entornos ruidosos: el error sube del 1,8 % al 9,1 % en la simulacion de sala domestica.
- No se documentan sesgos especificos, pero al estar entrenado solo con recitacion coranica su comportamiento fuera de ese dominio es impredecible.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se indican restricciones adicionales.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta y un tamano de 0.0 GB reportado, lo que sugiere una publicacion muy reciente o poco difundida; conviene verificar la integridad de los ficheros con `manifest.json` (SHA-256) antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talqin/talqin-stream-warsh
- Repositorio del proyecto Talqin: https://github.com/TalqinCore
- sherpa-onnx (runtime): https://github.com/k2-fsa/sherpa-onnx
