# udgamlabs/shruti-kashmiri

## Resumen

Shruti Kashmiri es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un laboratorio de investigación centrado en modelos pequeños que se ejecutan íntegramente en el dispositivo. El modelo transcribe audio de 16 kHz en cualquier longitud a texto, con salida en cachemir escrito en grafía perso-árabe y con capacidad de mantener en alfabeto latino las palabras inglesas que aparecen intercaladas en el habla (code-switching). Forma parte de la familia Shruti, que ofrece un modelo pequeño por idioma, cada uno con cobertura de inglés.

Técnicamente es un transformer encoder-decoder compacto de unos 56 millones de parámetros (55.875.913; 8 capas de encoder y 8 de decoder, anchura 512), derivado de Shruti Hindi, que a su vez se construye sobre Cactus Whistle. Se distribuye como un único fichero de 29,7 MB con pesos en 4 bits y activaciones en 8 bits para el motor Cactus needle, disponible de forma nativa y en WebAssembly, lo que permite inferencia offline en teléfonos, portátiles y navegadores sin servidor ni conexión.

Su relevancia actual radica en la combinación de tamaño mínimo, licencia Apache-2.0 y ejecución en navegador para un idioma con escasa cobertura ASR como el cachemir, con un rendimiento en tasa de error de palabras (WER) que, según el autor, supera a IndicConformer Kashmiri en el conjunto IndicVoices valid (43,0 frente a 48,7), aunque con intervalos de confianza que no permiten afirmar superioridad en el conjunto independiente DiarBench.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512) |
| Parámetros totales | ~56M (55.875.913) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de cualquier longitud según el autor) |
| Tipos de cuantización | Pesos 4 bits, activaciones 8 bits (formato propietario del motor Cactus needle) |
| Idiomas soportados | Cachemir (grafía perso-árabe), inglés y cachemir mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de pequeña escala: 8 capas en el encoder y 8 en el decoder con anchura 512, lo que suma aproximadamente 56 millones de parámetros. Se construye sobre Shruti Hindi, que a su vez deriva de Cactus Whistle (Apache-2.0, de Cactus Compute). Según la model card, Udgam Labs reentrenó todos los pesos sobre habla en cachemir e inglés y añadió 700 piezas de vocabulario específicas del cachemir. La entrada es audio de 16 kHz de duración arbitraria y la salida es texto, con detección automática de idioma entre cachemir e inglés.

Los datos de entrenamiento citados son `ai4bharat/IndicVoices`, `ARTPARK-IISc/Vaani-transcription-part` y `openslr/librispeech_asr`. No se detalla en la información disponible el número total de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en ASR no es lo habitual). La innovación principal no es arquitectónica sino de despliegue: cuantización agresiva (4 bits en pesos, 8 en activaciones) y un runtime (Cactus needle) con backend nativo y WebAssembly que permite ejecución completamente offline en dispositivos de gama media.

## Capacidades

- Transcripción de voz a texto en cachemir con salida en grafía perso-árabe.
- Transcripción de inglés y de habla mixta cachemir-inglés, manteniendo palabras inglesas en alfabeto latino en minúsculas cuando el modelo las conserva en inglés.
- Detección automática del idioma de entrada (cachemir o inglés) sin configuración previa.
- Procesamiento de audio de 16 kHz de cualquier longitud.
- Ejecución offline y on-device: nativa (macOS, Android) y en navegador vía WebAssembly.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de salida; es un modelo ASR puro.

## Casos de uso

- Subtitulado offline de vídeo y audio en cachemir: el modelo puede transcribir grabaciones completas en local, sin subir contenido a servidores externos, lo que resulta adecuado para medios de comunicación o creadores que trabajan con material sensible o en regiones con conectividad limitada.
- Aplicaciones móviles de dictado y notas de voz: con 29,7 MB y unos 64 MB de memoria en un Galaxy F62 (2021), cabe en teléfonos de gama media y transcribe a unas 9 veces la velocidad en tiempo real según el autor, lo que permite dictado interactivo sin red.
- Transcripción en navegador para herramientas educativas: al compilarse a WebAssembly, puede integrarse en una página web para ejercicios de lengua cachemir o para transcribir clases sin instalar software.
- Documentación de entrevistas y trabajo de campo lingüístico: investigadores que recogen habla en cachemir pueden transcribir en el dispositivo, preservando la privacidad de los informantes y evitando dependencias de servicios en la nube.
- Procesamiento de habla con code-switching en entornos bilingües: el modelo mantiene las palabras inglesas en alfabeto latino, lo que facilita la lectura de transcripciones de hablantes que mezclan cachemir e inglés, frecuente en contextos urbanos y técnicos.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en aplicaciones locales para hablantes de cachemir, gracias a la baja latencia implícita en un modelo de 56M ejecutado en dispositivo.
- Integración en sistemas de archivo y búsqueda de audio: transcripción por lotes de grabaciones históricas o administrativas en cachemir para indexación y búsqueda textual, sin coste de API ni envío de datos.

## Benchmarks y rendimiento

Datos publicados por el autor (WER en %, menor es mejor; mismas grabaciones y mismo scorer para todos los modelos; medido el 3 de noviembre de 2026):

| Modelo | Tamaño de fichero | IndicVoices valid | DiarBench |
|---|---|---|---|
| Shruti Kashmiri | 29,7 MB | 43,0 | 56,4 |
| IndicConformer Kashmiri (int8) | 137,7 MB | 48,7 | 58,2 |

Datos adicionales reportados:
- Inglés dentro de cachemir: en IndicVoices valid escribe el 75,6 % de las palabras inglesas glosadas en letras latinas (303 palabras).
- Inglés puro: LibriSpeech test-clean 6,08 (Shruti Hindi: 5,95).
- Silencio: 0 palabras inventadas en 100 clips silenciosos.
- Intervalos pareados al 95 % (Shruti Kashmiri menos el otro modelo, en puntos de WER): frente a IndicConformer Kashmiri, en IndicVoices valid de -8,39 a -3,17 por clip; en DiarBench nativo de -7,93 a +4,45 por clip y de -9,08 a +3,85 por conversación. Los intervalos de DiarBench incluyen el 0, por lo que no se puede afirmar superioridad en ese conjunto.
- El propio autor advierte que IndicVoices valid comparte fuente con los datos de entrenamiento y favorece a su modelo, y que DiarBench (32 turnos, 748 palabras de referencia, ninguna en inglés) es demasiado pequeño para concluir.

## Requisitos de hardware

- VRAM/memoria estimada: unos 64 MB de memoria en inferencia según la medición del autor en un Samsung Galaxy F62 (2021, 6 GB de RAM); el fichero ocupa 29,7 MB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y ejecución en dispositivo, no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en teléfonos de gama media; no se publican requisitos para A100, H100 o RTX 4090 porque no son necesarios.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle` (`from needle import Whistle`), binario de línea de comandos `needle` y build `wasm/` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 9 veces más rápido que tiempo real en un Samsung Galaxy F62 (2021) con motor nativo, según el autor; no se publican cifras de latencia absoluta ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER IndicVoices valid | WER DiarBench | Licencia | Formato |
|---|---|---|---|---|---|---|
| Shruti Kashmiri | ~56M | no disponible | 43,0 | 56,4 | Apache-2.0 | `.cact` |
| IndicConformer Kashmiri (int8) | no disponible | no disponible | 48,7 | 58,2 | no disponible | ONNX int8 (137,7 MB) |
| Whisper-small (referencia de tamaño, no medida en esta ficha) | ~244M | no disponible | no disponible | no disponible | MIT (según el proyecto Whisper) | safetensors/GGUF |

La comparación directa publicada por el autor se limita a IndicConformer Kashmiri. Para el resto de alternativas (otros modelos ASR en cachemir) el autor indica que existen pero no los ha medido, por lo que no hay datos comparables disponibles.

## Limitaciones y advertencias

- Ningún hablante nativo de cachemir ha revisado la salida del modelo según la model card; el ejemplo mostrado proviene de una voz sintética, no de habla real.
- El conjunto IndicVoices valid comparte fuente con los datos de entrenamiento y favorece al modelo; en el conjunto independiente DiarBench los intervalos de confianza incluyen el 0, por lo que no hay evidencia sólida de superioridad frente a IndicConformer Kashmiri.
- DiarBench contiene solo 32 turnos y 748 palabras de referencia, sin ninguna en inglés, por lo que no evalúa el comportamiento de code-switching.
- Riesgo de alucinación en audio no silencioso no cuantificado; solo se reporta 0 palabras inventadas en 100 clips silenciosos.
- Cobertura limitada a cachemir e inglés; otros idiomas requieren otros modelos de la familia Shruti.
- La licencia del modelo es Apache-2.0, pero la model card remite a los términos de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech) para su uso; conviene revisar las condiciones de esos datasets antes de un uso comercial.
- El paquete `cactus-needle` envía recuentos anónimos de uso por defecto; debe desactivarse con `NEEDLE_TELEMETRY=0` si se requiere privacidad total.
- El formato de pesos `.cact` es específico del motor Cactus needle; no hay conversión publicada a safetensors, GGUF ni otros formatos estándar, lo que limita la portabilidad a otros runtimes.
- No se documentan sesgos específicos del modelo más allá de la advertencia sobre la falta de revisión por hablantes nativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-kashmiri
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/kashmiri
- Familia Shruti (colección): https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/kashmiri.md
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- IndicConformer Kashmiri (comparado): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-ks-onnx
- Udgam Labs: https://udgamlabs.com/
- Página general de Shruti: https://udgamlabs.com/models/shruti
