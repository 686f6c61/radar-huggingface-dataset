# udgamlabs/shruti-malayalam

## Resumen

Shruti Malayalam es un modelo de reconocimiento automático del habla (ASR) de unos 56 millones de parámetros desarrollado por Udgam Labs, diseñado para transcribir audio en malayalam y en inglés, incluyendo habla mezclada de ambos idiomas (code-switching). Forma parte de la familia Shruti, que cubre también hindi, marathi, tamil, bengalí, telugu, gujarati, odia, kannada y urdu. El modelo deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0), y ha sido reentrenado íntegramente con voz en malayalam e inglés de licencia abierta, añadiendo 700 piezas de vocabulario específicas del malayalam.

Su propuesta principal es la inferencia totalmente local: se distribuye como un único fichero de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, ejecutable en el motor Cactus needle tanto de forma nativa como en WebAssembly. Esto permite transcribir en un teléfono, un portátil o un navegador sin conexión a internet ni servidor. En una Samsung Galaxy F62 de 2021 transcribe aproximadamente 10 veces más rápido que el tiempo real usando 64 MB de memoria.

Es relevante para desarrolladores que necesitan ASR multilingüe en dispositivos con recursos limitados y sin conectividad, aunque el propio autor advierte que no es el modelo más preciso en malayalam leído frente a alternativas como IndicConformer Malayalam o SraVaani-1.0, y que más de la mitad de las palabras fallan en conversaciones espontáneas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de 8 capas cada uno, anchura 512 (tipo transformer) |
| Parámetros totales | ~56M (55.875.913) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de 16 kHz de cualquier duración) |
| Tipos de cuantización | Pesos en 4 bits, activaciones en 8 bits (formato propietario `.cact`) |
| Idiomas soportados | Malayalam (ml), inglés (en) y malayalam mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder-decoder de 8 capas en cada bloque con anchura 512, heredado de la arquitectura de Cactus Whistle a través de Shruti Hindi. Udgam Labs reentrenó la totalidad de los pesos sobre voz en malayalam e inglés con licencias abiertas y amplió el vocabulario con 700 piezas específicas del malayalam, de modo que la salida se produce en escritura malayalam mientras que una parte de las palabras en inglés se mantienen en caracteres latinos en minúscula (aproximadamente 4 de cada 10).

Los conjuntos de datos empleados, según la model card, son ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Malayalam_R1 y R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se detalla en la información disponible el número total de horas ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR). La innovación técnica destacable es la cuantización agresiva (4 bits en pesos, 8 bits en activaciones) que permite un fichero de 29,7 MB ejecutable en WebAssembly y en dispositivos móviles.

## Capacidades

- Transcripción de voz a texto en malayalam con salida en escritura malayalam.
- Reconocimiento de palabras en inglés dentro de habla malayalam, manteniéndolas en caracteres latinos en parte de los casos.
- Detección automática del idioma del audio (malayalam o inglés) sin configuración previa.
- Procesamiento de audio de 16 kHz de cualquier duración.
- Ejecución nativa en Mac, Android y en navegador mediante WebAssembly.
- Funcionamiento completamente offline, sin servidor ni conexión.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción offline en aplicaciones móviles: el fichero de 29,7 MB y los 64 MB de memoria en uso permiten integrar ASR en apps Android sin backend, útil en entornos con conectividad intermitente.
- Subtitulado local en navegador: la build WebAssembly permite transcribir audio dentro de una página web sin enviar datos a un servidor, relevante para privacidad.
- Dictado y notas de voz en malayalam: el modelo acepta audio de cualquier duración y detecta el idioma, adecuado para grabaciones personales con mezcla de inglés.
- Procesamiento por lotes en dispositivos de gama baja: con una velocidad ~10x tiempo real en una Galaxy F62, puede transcribir archivos largos en segundo plano en hardware modesto.
- Investigación lingüística sobre code-switching malayalam-inglés: útil para estudiar la preservación de términos ingleses en la transcripción, aunque con las reservas de precisión indicadas.
- Prototipado rápido de pipelines ASR: la instalación vía `pip install cactus-needle` y la descarga de un único fichero facilitan pruebas sin infraestructura GPU.
- Transcripción en el borde (edge computing) para kioscos o dispositivos empotrados donde no se puede garantizar red.

## Benchmarks y rendimiento

Tasa de error de palabras (WER, %, menor es mejor), mismos clips y mismo scorer para todos los modelos; Shruti Malayalam medido en su motor on-device sobre Mac. FLEURS, Kathbath y DiarBench con 200 clips o turnos cada uno. Medición del 2 de noviembre de 2026.

| Modelo | Tamaño | FLEURS (leído) | Kathbath test-unknown (leído) | DiarBench, inglés en inglés (conversación) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| Shruti Malayalam | 29,7 MB | 36,0 | 44,9 | 56,8 | 65,4 |
| Whisper tiny | 43,5 MB | 509,4 | 910,2 | 555,0 | 559,6 |
| Whisper base | 81,8 MB | 186,3 | no disponible (dato truncado en la fuente) | no disponible | no disponible |

El autor señala que IndicConformer Malayalam y SraVaani-1.0 son más precisos en malayalam leído y frente a la referencia nativa. Frente a IndicConformer Malayalam, Shruti obtiene menos errores por clip contando solo palabras inglesas en letras latinas (56,8 vs 61,7), pero esa ventaja no se mantiene al remuestrear conversaciones completas (intervalo de -9,45 a +1,23) ni al ignorar la escritura (-4,48 a +1,50). En Kathbath, el 44,9 % de palabras erróneas corresponde a solo el 9,0 % de caracteres, por la fusión de palabras propia del malayalam.

## Requisitos de hardware

- VRAM/RAM estimada: unos 64 MB de memoria en uso según la medición del autor en Android; no requiere GPU.
- GPU recomendadas: no aplica; el modelo está pensado para CPU y ejecución on-device.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; no se requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` para línea de comandos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~10x tiempo real en una Samsung Galaxy F62 (2021); no se publican cifras de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS (leído) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Malayalam | ~56M | audio de cualquier duración | 36,0 | Apache-2.0 | Hugging Face, on-device |
| Whisper tiny | ~39M | 30 s por ventana | 509,4 | MIT (según el proyecto Whisper) | Hugging Face, múltiples runtimes |
| Whisper base | ~74M | 30 s por ventana | 186,3 | MIT | Hugging Face, múltiples runtimes |
| IndicConformer Malayalam | no disponible | no disponible | no disponible (el autor indica mayor precisión en leído) | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión limitada en conversaciones espontáneas: más de la mitad de las palabras resultan erróneas en DiarBench (56,8 % WER contando inglés en latino).
- No supera a IndicConformer Malayalam ni a SraVaani-1.0 en malayalam leído ni frente a la referencia nativa.
- La ventaja frente a IndicConformer en conversaciones no es robusta al remuestrear ni al ignorar la escritura.
- El texto generado no ha sido revisado por ningún hablante nativo de malayalam, según el autor.
- Se observan errores reales documentados (por ejemplo, "തേങ്ങയിടാൻ" transcrito como "തേങ്ങയുടെ തന്നെ") y diferencias de salida entre el motor nativo y el de navegador.
- Solo cubre malayalam e inglés; otros idiomas requieren los modelos Shruti correspondientes.
- El formato `.cact` es específico del motor Cactus needle; no hay pesos en safetensors ni GGUF para otros runtimes.
- El paquete `cactus-needle` envía recuentos de uso anónimos por defecto; debe configurarse `NEEDLE_TELEMETRY=0` para desactivarlo.
- Licencia Apache-2.0 permite uso comercial, pero conviene validar la precisión en el dominio concreto antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-malayalam
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/malayalam
- Repositorio de código y ejemplos: https://github.com/udgamlabs/shruti/blob/main/docs/malayalam.md
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Familia Shruti (marathi): https://huggingface.co/udgamlabs/shruti-marathi
- Familia Shruti (tamil): https://huggingface.co/udgamlabs/shruti-tamil
- Familia Shruti (bengalí): https://huggingface.co/udgamlabs/shruti-bengali
- Familia Shruti (telugu): https://huggingface.co/udgamlabs/shruti-telugu
- Familia Shruti (gujarati): https://huggingface.co/udgamlabs/shruti-gujarati
- Familia Shruti (odia): https://huggingface.co/udgamlabs/shruti-odia
- Familia Shruti (kannada): https://huggingface.co/udgamlabs/shruti-kannada
- Familia Shruti (urdu): https://huggingface.co/udgamlabs/shruti-urdu
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Modelos de Udgam Labs: https://udgamlabs.com/models
- Investigación de Udgam Labs: https://udgamlabs.com/research
