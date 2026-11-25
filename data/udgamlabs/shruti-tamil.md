# udgamlabs/shruti-tamil

## Resumen

Shruti Tamil es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, especializado en tamil y en habla con mezcla de tamil e inglés (code-switching). Con 55,9 millones de parámetros, es el miembro tamil de la familia Shruti, junto a Shruti Hindi y Shruti Marathi. El modelo parte de Cactus Whistle (Apache-2.0) a través de Shruti Hindi: se reentrenaron todos sus pesos sobre corpus abiertos de habla tamil e inglesa y se añadieron 700 piezas de vocabulario tamil.

Su propuesta central es la inferencia totalmente offline y en dispositivo: el archivo `shruti-tamil.cact` ocupa 29,7 MB (pesos en 4 bits y activaciones en 8 bits) y se ejecuta mediante el motor Cactus en macOS, Linux, Windows, Android, iOS y WebAssembly. Según el autor, en un Samsung Galaxy F62 de 2021 transcribe 10,8 veces más rápido que el tiempo real usando 64 MB de memoria. Escribe el tamil en escritura tamil y mantiene las palabras inglesas en latín, reflejando cómo escriben realmente los hablantes bilingües.

Es relevante porque cubre un hueco poco atendido: ASR tamil de calidad en la franja de modelos por debajo de 100 MB, sin servidor ni conexión. En las mediciones publicadas por el autor, es el modelo abierto de ese tamaño más preciso en tamil y el que mejor preserva las palabras inglesas dentro de una conversación en tamil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador tipo transformer (8 capas de codificador + 8 de decodificador, anchura 512); derivada de Cactus Whistle vía Shruti Hindi |
| Parametros totales | 55,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; acepta audio de 16 kHz de cualquier duración |
| Tipos de cuantizacion | Pesos en 4 bits y activaciones en 8 bits (archivo `.cact`); se incluye también un archivo fp32 en safetensors sin probar |
| Idiomas soportados | Tamil (ta), inglés (en) y tamil mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus) y `.safetensors` (fp32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de secuencia a secuencia con codificador y decodificador de 8 capas cada uno y anchura 512, con 55,9 M de parámetros en total. Se construyó sobre Cactus Whistle (Apache-2.0) mediante Shruti Hindi: Udgam Labs reentrenó todos los pesos con habla tamil e inglesa de licencia abierta y amplió el vocabulario con 700 piezas específicas de tamil. La entrada es audio de 16 kHz de cualquier longitud y la salida es texto, con el tamil en escritura tamil y las palabras inglesas en minúsculas latinas.

Los datos de entrenamiento declarados incluyen ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Tamil_R1 y R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. La model card no detalla el número de tokens ni la composición exacta del dataset, ni menciona fases de RLHF o DPO. La innovación destacable no está en la arquitectura sino en el despliegue: cuantización agresiva a 4 bits con activaciones de 8 bits y un motor (Cactus) con backend WebAssembly que permite ejecutar el modelo dentro de una página web sin servidor.

## Capacidades

- Transcripción de voz a texto en tamil, en inglés y en habla mixta tamil-inglés, con detección automática del idioma de la entrada.
- Escritura del tamil en escritura tamil y conservación de las palabras inglesas en latín, imitando la convención de escritura bilingüe real.
- Manejo de audio de cualquier duración a 16 kHz como entrada.
- Ejecución completamente offline y en dispositivo, sin servidor ni conexión a internet.
- Despliegue multiplataforma mediante el motor Cactus: macOS, Linux, Windows, Android, iOS y WebAssembly (navegador).
- Uso de memoria reducido (64 MB según el autor en un Galaxy F62), apto para móviles de gama media.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado y transcripción de reuniones en tamil: el modelo acepta audio de cualquier duración y puede transcribir conversaciones donde se intercalan términos ingleses (reuniones de trabajo, clases), manteniendo cada palabra en su escritura natural.
- Dictado en aplicaciones móviles sin conexión: al ejecutarse en Android e iOS con 64 MB de memoria, permite integrar dictado tamil en apps de notas o mensajería en entornos sin red.
- Transcripción en el navegador: el build WebAssembly permite ofrecer dictado o subtitulado en una página web sin enviar el audio a ningún servidor, lo que simplifica el cumplimiento de privacidad.
- Procesamiento de atención al cliente: transcripción de llamadas grabadas en tamil con mezcla de inglés para su posterior análisis, indexación o generación de actas, aprovechando que preserva los términos ingleses tal como se pronuncian.
- Documentación de entrevistas y trabajo de campo: grabaciones de audio en dispositivos de gama baja o sin cobertura (zonas rurales, investigación de campo) pueden transcribirse localmente y sincronizarse después.
- Accesibilidad: conversión de voz a texto en tiempo real para personas con dificultades auditivas en contextos tamil, con latencia baja gracias a la velocidad de inferencia declarada (10,8 veces más rápido que el tiempo real en un móvil de 2021).
- Preprocesado de corpus para otros modelos: generación de transcripciones de bajo coste en pipelines de datos donde no se requiere la máxima precisión de un modelo grande.

## Benchmarks y rendimiento

Tasa de error por palabra (WER, %, menor es mejor), 200 clips por conjunto, mismas muestras y mismo evaluador para todos los modelos; Shruti Tamil medido en su motor en dispositivo sobre un Mac. Medición del 2 de noviembre de 2026. El tamaño es el del archivo publicado.

| Modelo | Tamano | FLEURS (leido) | Kathbath test-unknown (leido) | DiarBench (conversacion, held out) |
|---|---|---|---|---|
| Shruti Tamil | 29,7 MB | 38,5 | 33,2 | 52,5 |
| Whisper tiny | 43,5 MB | 226,7 | 239,6 | 244,8 |
| Whisper base | 81,8 MB | 124,5 | 108,8 | 152,5 |
| Dolphin base (int8) | 103,7 MB | 71,9 | 65,0 | 92,4 |
| Thedal v11 (licencia no comercial) | 102,6 MB | 42,2 | 38,1 | 70,1 |
| IndicConformer Tamil (int8) | 137,7 MB | 27,8 | 25,0 | 58,7 |
| deepdml whisper-tiny-ta (fp32) | 151,1 MB | 47,9 | 45,6 | 90,3 |
| deepdml whisper-base-ta (fp32) | 290,4 MB | 38,7 | 39,1 | 81,1 |

Datos adicionales aportados por el autor: Shruti Tamil escribe el 51,5 % de las palabras inglesas de DiarBench en escritura latina, frente a un 8 % o menos en el resto de modelos de la tabla. En DiarBench con las referencias en escritura tamil para las palabras inglesas, IndicConformer Tamil mejora (51,4 frente a 62,2 de Shruti Tamil) y SraVaani-1.0 (908,8 MB) alcanza 44,0. En FLEURS, Shruti Tamil queda a la par de deepdml whisper-base-ta (38,5 frente a 38,7) con un archivo diez veces menor.

## Requisitos de hardware

- VRAM/memoria estimada: 64 MB de memoria en inferencia según el autor (medido en un Samsung Galaxy F62); el archivo `.cact` ocupa 29,7 MB en disco.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y ejecución en dispositivo, no para GPU de datacenter.
- GPU de consumo: no aplica como requisito; cabe en cualquier móvil, portátil o navegador moderno.
- Opciones de despliegue: motor Cactus (paquete `cactus-compute` de Python, binario `cactus` para macOS, Linux y Windows, builds para Android, iOS y WebAssembly). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,8 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021, según el autor. No se publican cifras de latencia absoluta ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS (ta) | WER DiarBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Tamil | 55,9 M | audio de cualquier duración | 38,5 | 52,5 | Apache-2.0 | Hugging Face, motor Cactus |
| IndicConformer Tamil | no disponible | no disponible | 27,8 | 58,7 | no disponible en la informacion | Hugging Face (ONNX int8) |
| Thedal v11 | no disponible | no disponible | 42,2 | 70,1 | no comercial | Hugging Face (ONNX int4) |
| Whisper base | 74 M aprox. | 30 s por ventana | 124,5 | 152,5 | MIT (Whisper) | Hugging Face |

Shruti Tamil destaca por tamaño (29,7 MB), licencia permisiva y ejecución offline multiplataforma; IndicConformer Tamil es más preciso en audio leído pero más pesado (137,7 MB) y con peor rendimiento en conversación con mezcla de inglés; Thedal v11 tiene licencia no comercial, lo que limita su uso en producción.

## Limitaciones y advertencias

- Riesgo de error en palabras y números: la propia model card muestra fallos reales, como "meter" escrito en escritura tamil o "நூத்தம்பது" (150) transcrito como "மூத்தம்பது".
- Rendimiento inferior a modelos mayores en audio leído: IndicConformer Tamil obtiene mejor WER en FLEURS y Kathbath (27,8 y 25,0 frente a 38,5 y 33,2).
- La ventaja en preservación del inglés dentro del tamil depende de la convención de referencia: con referencias en escritura tamil para las palabras inglesas, otros modelos quedan por delante.
- Cobertura lingüística limitada a tamil e inglés; para hindi o marati hay que usar los otros miembros de la familia.
- El archivo fp32 en safetensors se incluye sin haber sido probado por el autor; el camino soportado es el motor Cactus con el archivo `.cact`.
- El paquete `cactus-compute` envía recuentos de uso anónimos por defecto; hay que definir `CACTUS_TELEMETRY=0` para desactivarlo.
- No se documentan sesgos específicos, tasas de alucinación ni evaluación fuera de los conjuntos citados; los benchmarks son mediciones del propio autor, no una evaluación independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento citados para usos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Hindi (modelo base inmediato): https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Cactus Whistle (modelo original): https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus: https://huggingface.co/Cactus-Compute/cactus
- Releases del binario Cactus: https://huggingface.co/Cactus-Compute/cactus/tree/main/releases/4.1.0
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Demo en navegador: https://udgamlabs.com/models/shruti?lang=ta
- Codigo y ejemplos: https://github.com/udgamlabs/shruti
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset SPRING INX Tamil R1: https://huggingface.co/datasets/SPRINGLab/SPRING_INX_Tamil_R1
- Dataset SPRING INX Tamil R2: https://huggingface.co/datasets/SPRINGLab/SPRING_INX_Tamil_R2
- Dataset Vaani transcription: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-transcription-part
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Dolphin base: https://huggingface.co/DataoceanAI/dolphin-base
- Thedal v11: https://huggingface.co/Badri0510/Thedal-AED-Tamil-Tanglish-English-INT4-ConvINT8-ONNX
- IndicConformer Tamil ONNX: https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-ta-onnx
- deepdml whisper-tiny-ta: https://huggingface.co/deepdml/whisper-tiny-ta-mix-norm
- deepdml whisper-base-ta: https://huggingface.co/deepdml/whisper-base-ta-mix-norm
