# TEQUILA123/suxin-light

## Resumen

Suxin-Light (苏心) es un modelo de sintesis de voz (text-to-speech) bilingue chino-ingles orientado a inferencia en dispositivo ("on-device"). Lo publica el usuario TEQUILA123 (Zongping He) en Hugging Face bajo licencia MIT. Se trata de un estudiante VITS de 28,65 millones de parametros, destilado desde el maestro Fun-CosyVoice3-0.5B, con un decodificador de vocoder propio denominado SuxinVoc.

El problema que resuelve es el coste computacional del TTS bilingue en hardware de borde: la mayoria de los modelos capaces de alternar chino e ingles en una misma frase (code-switching) superan los cientos de millones de parametros y no alcanzan velocidad de tiempo real en CPUs ARM sin NPU. Suxin-Light cabe en 67,3 MB en su version cuantizada int8 y alcanza un RTF de 0,164 con 4 hilos en un SoC de 8 nucleos Cortex-A55, lo que equivale a unas seis veces la velocidad de tiempo real.

El repositorio se distribuye exclusivamente en formato ONNX (grafos int8 con decodificador en coma flotante, y grafo fp32 completo), junto con el frontend en Python que los ejecuta: pypinyin para chino, espeak-ng para ingles y un esquema de PAD tras final de silaba y de palabra. La relevancia actual radica en que es una de las pocas alternativas abiertas que combinan bilingüismo zh-en, licencia permisiva y despliegue puramente CPU en ARM64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (estudiante) con decodificador de vocoder propio SuxinVoc (salida a tasa de trama, sin red de sobremuestreo, mapeo de fase monotono `phi = pi * tanh(h)`) |
| Parametros totales | 28,65 millones (28.65M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; procesa texto por frases, con segmentacion agresiva de la primera frase) |
| Tipos de cuantizacion | int8 parcial (esquema QDQ "excldec": se excluyen el decodificador `/dec/`, la cadena de duracion y los nodos que consumen `scales`) y fp32 sin cuantizar |
| Idiomas soportados | chino (zh) e ingles (en), con soporte de code-switching zh-en en la misma frase |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | ONNX (`zh_en-suxin-light.int8-excldec.onnx` de 67,3 MB y `zh_en-suxin-light.onnx` de 87,7 MB), mas fichero `.onnx.json` con la tabla de fonemas a 22,05 kHz |

## Arquitectura y entrenamiento

La arquitectura es un VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) de tipo Piper, no un ajuste fino de CosyVoice. El modelo se obtiene por destilacion desde Fun-CosyVoice3-0.5B, que actua como maestro (los pesos del maestro no se incluyen en el repositorio). La innovacion principal es el decodificador SuxinVoc, que genera la forma de onda a tasa de trama (frame-rate) prescindiendo de la red de sobremuestreo habitual en vocoders tipo HiFi-GAN, y emplea un mapeo de fase monotono definido como `phi = pi * tanh(h)`. Segun el autor, el metodo de entrenamiento subyacente es "destilacion latente cacheada" (cached latent distillation) combinada con decodificacion de fase monotona, segun el titulo de la publicacion citada.

El frontend combina pypinyin para el chino y espeak-ng para el ingles, con insercion de PAD tras final de silaba y de palabra. El modelo usa un `phoneme_type: mixed`, lo que implica que la libreria estandar `piper-tts` no puede cargarlo tal cual; es necesario el frontend propio `suxin_tts` incluido en el repositorio. En cuanto a datos de entrenamiento, numero de tokens, composicion exacta del dataset y uso de RLHF/DPO, la informacion disponible no los detalla: no disponible.

## Capacidades

- Sintesis de voz bilingue chino-ingles con alternancia de idiomas dentro de una misma frase (code-switching), por ejemplo "检验报告显示您的 blood sugar 偏高".
- Generacion de audio mono a 22.050 Hz en float32, con salida por lotes (`synthesize_long`) y por streaming desde un flujo de tokens (`synthesize_stream_from_tokens`).
- Integracion con flujos de tokens de un LLM en modo asincrono, con politica de segmentacion que corta la primera frase en la primera coma o a los ~6 caracteres.
- Inferencia en CPU sin NPU, pensada para dispositivos ARM64 de borde.
- Normalizacion de numeros dependiente del idioma: en contexto chino los digitos se leen como caracteres chinos ("请到3号窗口") y en contexto ingles puro pasan por espeak-ng ("in his 30s").
- Capacidades de vision, audio de entrada, tool calling o razonamiento multi-paso: no aplica (modelo exclusivamente text-to-speech).

## Casos de uso

- Asistentes de voz embebidos en dispositivos de borde: el modelo sintetiza respuestas en chino e ingles sobre una CPU ARM Cortex-A55 sin acelerador, con un RTF de 0,164 a 4 hilos, lo que permite integrarlo en altavoces inteligentes, kioscos o electrodomesticos con presupuesto de computo minimo.
- Lectura en voz alta de respuestas generadas por un LLM: el metodo `synthesize_stream_from_tokens` consume un flujo de tokens asincrono y produce chunks de audio, con una latencia mediana de primer paquete de 828 ms en configuracion de segmentacion agresiva.
- Sistemas de atencion al cliente bilingues en terminales de punto de venta o mostrador: el modelo alterna frases en chino e ingles sin cambiar de motor, util en entornos con clientela mixta.
- Avisos y anuncios en transporte publico o aeropuertos: la sintesis de frases cortas se beneficia de la reduccion de latencia (de 1358 ms a 501 ms en frases de 39 caracteres con corte agresivo), adecuada para anuncios repetidos y de baja tolerancia a la espera.
- Accesibilidad para personas con discapacidad visual en aplicaciones ofimaticas o de lectura: el consumo reducido (67,3 MB int8) permite empaquetar el modelo dentro de la propia aplicacion sin dependencia de servicios en la nube.
- Aplicaciones de lectura de informes medicos o financieros en chino con terminos en ingles: el modelo maneja de forma nativa la mezcla de idiomas, aunque el autor advierte que la tasa de error de reconocimiento en lectura inversa (CER 0,128) se concentra en la normalizacion de numeros, unidades y palabras inglesas dentro de contexto chino.
- Generacion de audio para prototipos y pruebas fuera de linea en x86: con un RTF de 0,026 en int8 sobre CPU x86 de un solo hilo, resulta practico para generar lotes de audio en pipelines de datos o tests de regresion.

## Benchmarks y rendimiento

Rendimiento en dispositivo ARM (8 nucleos Cortex-A55 a 1,5 GHz, Linux 6.1.83, ONNX Runtime 1.23.2 con CPU EP, grafo int8-excldec, estado warm, mediana de 3 ejecuciones). Valores de RTF: menor es mejor, por debajo de 1 supera el tiempo real.

| Hilos | 1 | 2 | 3 | 4 | 6 |
|---|---|---|---|---|---|
| En reposo | 0,515 | 0,278 | 0,202 | 0,164 | 0,129 |
| Con 3 nucleos ocupados (ASR/VAD/KWS) | no disponible | 0,282 | 0,205 | 0,167 | 0,212 |

Comparativa frente a Matcha zh-en en la misma placa:

| Hilos | Suxin-Light int8 | Matcha + Vocos int8 | Aceleracion |
|---|---|---|---|
| 1 | 0,515 | 0,910 | 1,77x |
| 2 | 0,278 | 0,501 | 1,80x |
| 3 | 0,202 | 0,373 | 1,85x |
| 4 | 0,164 | 0,302 | 1,84x |
| 6 | 0,129 | 0,262 | 2,03x |

Comparativa frente a referencias publicadas (los datos de sherpa-onnx provienen de Raspberry Pi 4 con 4 x Cortex-A72; el autor indica que el rendimiento por nucleo de A55 es un 60-70 % del de A72, por lo que esta tabla es solo orientativa):

| Modelo | RTF a 4 hilos | Tamano |
|---|---|---|
| Suxin-Light int8 (A55 x8) | 0,164 | 67 MB |
| Matcha zh-en del mismo autor, misma placa | 0,302 | 90 MB |
| matcha-icefall-zh-baker, mono zh (RPi 4) | 0,391 | 73 MB |
| en_US-lessac-medium, Piper VITS (RPi 4) | 0,357 | 61 MB |
| vits-melo-tts-zh_en (RPi 4) | 2,518 | 163 MB |
| kokoro-multi-lang-v1_1 (RPi 4) | 3,191 | 311 MB |

Latencia de primer paquete en ARM (4 hilos, en milisegundos):

| Caso | Sin corte | Corte agresivo | Variacion |
|---|---|---|---|
| Frase corta, 36 caracteres | 1279 | 832 | -35 % |
| Frase corta, 39 caracteres | 1358 | 501 | -63 % |
| Frase larga, 118 caracteres | 1626 | 824 | -49 % |
| Sin puntuacion, 33 caracteres | 1465 | 1446 | 0 |
| Mediana | 1411 | 828 | -41 % |

Calidad de sintesis medida sobre reconstruccion compuesta a partir del decodificador en el posterior cacheado (130 frases emparejadas del conjunto dev), que es el objetivo de destilacion y no una evaluacion TTS de extremo a extremo con prior:

| Metrica | Maestro HiFi-GAN (256) | Suxin-Light |
|---|---|---|
| log-mel | 0,314 | 0,328 |
| log-STFT | 0,745 | 0,759 |

Otros datos: RTF en x86 de un solo hilo de 0,034 en fp32 y 0,026 en int8-excldec; latencia de primer paquete de TTS puro de 571 ms (frente a 855 ms sin corte); primera carga mas precalentamiento de 14,3 s; CER de 0,128 medido por reconocimiento inverso del audio sintetizado. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM de GPU: no aplica; el modelo esta disenado para inferencia en CPU. El grafo int8 ocupa 67,3 MB y el fp32 87,7 MB en disco.
- GPU recomendadas: no disponible / no aplica (no se documenta soporte de ejecucion en GPU; la unica referencia es el proveedor CPU de ONNX Runtime).
- Cabe en GPU de consumo: no aplica; se ejecuta en CPU. Se ha validado en ARM Cortex-A55 (8 nucleos) y en x86 de un solo hilo.
- Opciones de despliegue: ONNX Runtime 1.23.2 con CPU Execution Provider, a traves del paquete `suxin_tts` incluido en el repositorio (Python 3.10 o superior, gestionado con `uv`). Es posible ejecutar el CLI `infer.py` o instalar las dependencias con `pip install -r requirements.txt`. La libreria `piper-tts` >= 1.3 aporta `EspeakPhonemizer` y los datos de espeak-ng, pero `piper-tts` estandar no puede cargar el modelo por su `phoneme_type: mixed`. vLLM, llama.cpp, TGI y Ollama no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: RTF de 0,164 a 4 hilos en Cortex-A55 (unas 6 veces tiempo real) y de 0,026 en x86 de un solo hilo en int8 (unas 38 veces tiempo real). Configuracion recomendada: `intra_op_num_threads: 4`, `noise_scale` y `noise_w` a 0, `pad_mode: group`, `use_lang_tags: false`, `aggressive_first_sentence: true`.
- Ajuste de hilos: 4 hilos es el punto recomendado en el SoC de 8 nucleos; con 6 hilos y carga concurrente de ASR/VAD/KWS el RTF empeora de 0,167 a 0,212 por sobre-suscripcion de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Suxin-Light | 28,65 M | zh, en (code-switching) | no aplica | MIT | ONNX (int8 parcial / fp32) | RTF 0,164 a 4 hilos en A55; 67 MB |
| Matcha zh-en (mismo autor, misma placa) | no disponible | zh, en | no aplica | no disponible | ONNX int8 | RTF 0,302 a 4 hilos; 90 MB |
| matcha-icefall-zh-baker | no disponible | zh | no aplica | no disponible | no disponible | RTF 0,391 en RPi 4; 73 MB |
| en_US-lessac-medium (Piper VITS) | no disponible | en | no aplica | no disponible | no disponible | RTF 0,357 en RPi 4; 61 MB |
| vits-melo-tts-zh_en | no disponible | zh, en | no aplica | no disponible | no disponible | RTF 2,518 en RPi 4; 163 MB |
| kokoro-multi-lang-v1_1 | no disponible | multi-idioma | no aplica | no disponible | no disponible | RTF 3,191 en RPi 4; 311 MB |
| Fun-CosyVoice3-0.5B (maestro) | 500 M | no disponible | no aplica | no disponible | no disponible | no disponible (pesos no incluidos) |

Los datos de parametros, licencia, contexto y formato de los modelos comparados no se detallan en la informacion disponible mas alla de lo indicado.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay validacion independiente ni ecosistema de terceros.
- Los resultados de rendimiento y calidad son autodeclarados por el autor y medidos en una placa concreta (ARM Cortex-A55 de 8 nucleos a 1,5 GHz, ONNX Runtime 1.23.2); pueden no trasladarse a otro hardware.
- La comparativa de calidad no es una evaluacion TTS de extremo a extremo: usa reconstruccion compuesta sobre el posterior cacheado (el propio objetivo de destilacion) y no una decodificacion con prior, por lo que sobreestima la fidelidad percibida.
- CER de 0,128 medido por reconocimiento inverso; los errores se concentran en la normalizacion de numeros y unidades, y en palabras inglesas inmersas en contexto chino.
- La primera carga con precalentamiento tarda 14,3 s, lo que penaliza arranques en frio.
- `piper-tts` estandar no es compatible con el campo `phoneme_type: mixed`; es obligatorio usar el frontend `suxin_tts` del repositorio. Ademas, `uv sync` no descarga los pesos: hay que ejecutar desde el directorio del modelo o pasar `--model-dir`.
- No se debe cuantizar el grafo completo a int8: segun el autor, destruye la cabeza iSTFT y fija `length_scale` al valor de calibracion. El grafo publicado excluye el decodificador, la cadena de duracion y los nodos de consumo de `scales`.
- Los pesos del maestro Fun-CosyVoice3-0.5B no se incluyen y su licencia no se especifica en la informacion disponible.
- Dependencias con licencia distinta a la del modelo: el motor Piper es GPL-3.0 y espeak-ng tambien es GPL-3.0. Aunque los pesos se declaran MIT, conviene revisar la compatibilidad si se redistribuye el binario que empaqueta esas dependencias.
- No se documentan sesgos de voz (genero, acento o variedad dialectal) ni evaluaciones de naturalidad con oyentes humanos.
- No hay soporte documentado de GPU, ni de otros idiomas distintos de zh y en, ni de control de emocion o prosodia mas alla de los parametros `scales`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TEQUILA123/suxin-light
- Perfil del autor: https://huggingface.co/TEQUILA123
- Piper (motor VITS, GPL-3.0): https://github.com/OHF-Voice/piper1-gpl
- Fun-CosyVoice3 (maestro, pesos no incluidos): https://github.com/FunAudioLLM/CosyVoice
- espeak-ng (fonemizador de ingles): https://github.com/espeak-ng/espeak-ng
- Referencia bibliografica citada por el autor: He, Zongping (2026), "Suxin-Light: Cached Latent Distillation and Monotone Phase Decoding for On-Device Bilingual Text-to-Speech"
