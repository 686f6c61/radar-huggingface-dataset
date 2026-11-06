# udgamlabs/shruti-urdu

## Resumen

Shruti Urdu es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado para transcribir voz en urdu e inglés de forma totalmente offline y en dispositivos de recursos limitados. Con aproximadamente 56 millones de parámetros, se distribuye como un único archivo de 29,7 MB (`shruti-urdu.cact`) que emplea pesos en 4 bits y activaciones en 8 bits, lo que permite ejecutarlo en un teléfono móvil, un portátil o incluso dentro de una página web mediante WebAssembly.

El modelo forma parte de la familia Shruti y se construye a partir de Shruti Hindi, que a su vez deriva de Cactus Whistle (Apache-2.0). Udgam Labs reentrenó todos los pesos sobre voz en urdu e inglés con licencias abiertas y añadió 700 piezas de vocabulario específicas del urdu. La salida respeta el uso real del idioma: el urdu se escribe en escritura persoárabe y las palabras inglesas se mantienen en caracteres latinos, lo que facilita su integración en aplicaciones de mensajería y dictado.

Su relevancia actual radica en que ofrece una alternativa extremadamente ligera (29,7 MB frente a los 43,5 MB de Whisper tiny o los 137,7 MB de IndicConformer Urdu) para escenarios de code-switching urdu-inglés en conversaciones reales, con un rendimiento competitivo en ese contexto concreto y una licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (8 capas de encoder + 8 de decoder, anchura 512) |
| Parametros totales | ~56M (55.875.913) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de cualquier longitud a 16 kHz (sin límite de contexto de texto especificado) |
| Tipos de cuantizacion | Pesos en 4 bits, activaciones en 8 bits (formato `.cact`) |
| Idiomas soportados | Urdu, inglés y urdu mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Shruti Urdu es un transformer encoder-decoder de 8 capas en cada bloque y anchura 512, con unos 56 millones de parámetros. Se inicializa desde Shruti Hindi (Udgam Labs), que a su vez parte de Cactus Whistle (Cactus Compute). Udgam Labs reentrenó la totalidad de los pesos sobre voz en urdu e inglés con licencias abiertas y amplió el vocabulario con 700 piezas específicas del urdu. El modelo se ejecuta sobre el motor Cactus needle, disponible en versión nativa y en WebAssembly, lo que permite inferencia local sin servidor.

Los datos de entrenamiento provienen de los conjuntos ai4bharat/IndicVoices, ai4bharat/Kathbath, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. La model card no especifica el número exacto de tokens de audio ni si hubo etapas de RLHF o DPO. La innovación principal es la combinación de un tamaño muy reducido con una cuantización agresiva (4 bits en pesos, 8 bits en activaciones) que mantiene la calidad en code-switching urdu-inglés, junto con la capacidad de ejecución en WebAssembly dentro del navegador.

## Capacidades

- Transcripción de voz a texto en urdu (escritura persoárabe) e inglés (caracteres latinos en minúscula).
- Manejo nativo de code-switching urdu-inglés: las palabras inglesas se mantienen en alfabeto latino y las urdu en persoárabe, reflejando cómo escriben los hablantes reales.
- Detección automática del idioma de entrada (urdu o inglés) sin configuración adicional.
- Entrada de audio de cualquier duración a 16 kHz.
- Ejecución 100% offline y on-device: sin servidor ni conexión a internet.
- Inferencia en WebAssembly dentro del navegador, además de motor nativo en Mac, Android y Linux.
- No soporta tool calling, function calling ni razonamiento multi-step (es un modelo puramente ASR).
- No dispone de modo thinking, visión ni audio de salida.
- Capacidades multilingües limitadas a urdu e inglés; otros idiomas tienen sus propios modelos Shruti.

## Casos de uso

- Dictado por voz en aplicaciones móviles de mensajería: el modelo transcribe en tiempo real conversaciones que mezclan urdu e inglés y respeta la convención de escritura mixta, por lo que el texto puede enviarse directamente sin postprocesado.
- Subtitulado offline de reuniones y llamadas: al aceptar audio de cualquier longitud a 16 kHz y ejecutarse en un teléfono con 64 MB de memoria, permite generar transcripciones sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Asistentes de voz embebidos en páginas web: la versión WebAssembly del motor Cactus needle permite integrar la transcripción en una web sin backend, con la demo oficial como referencia funcional.
- Atención al cliente en centros de contacto paquistaníes: el modelo gestiona conversaciones reales con code-switching (DiarBench), un escenario frecuente en soporte técnico y comercial donde los agentes alternan urdu e inglés.
- Accesibilidad para personas con discapacidad auditiva: transcripción local en dispositivos de bajo coste (por ejemplo, un Android de 2021) sin necesidad de hardware especializado.
- Documentación clínica y administrativa dictada: la model card muestra ejemplos de citas médicas y recados domésticos transcritos con errores mínimos, adecuado para notas rápidas en consultas o gestión de citas.
- Investigación lingüística sobre code-switching: al mantener las palabras inglesas en alfabeto latino, facilita el análisis de préstamos léxicos y patrones de mezcla de idiomas en corpus de habla real.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor). Mismos clips y mismo scorer para todos los modelos; Shruti Urdu medido en su motor on-device sobre un Mac el 2 de noviembre de 2026. FLEURS y Kathbath tienen 200 clips cada uno; DiarBench, 74 turnos.

| Modelo | Tamano de archivo | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, inglés en inglés (conversación, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Urdu** | **29,7 MB** | 33,5 | 18,2 | **22,9** | 31,3 |
| Whisper tiny | 43,5 MB | 108,8 | 107,4 | 257,3 | 255,8 |
| Whisper base | 81,8 MB | 55,6 | 55,3 | 111,7 | 111,0 |
| Dolphin base (int8) | 103,7 MB | 63,0 | 57,5 | 98,5 | 99,0 |
| IndicConformer Urdu (int8) | 137,7 MB | **24,7** | **13,4** | 29,1 | **19,5** |
| Dolphin small (int8) | 249,7 MB | 75,3 | 51,3 | 98,5 | 99,0 |
| Whisper small | 264,5 MB | 41,7 | 45,7 | 50,8 | 50,0 |

En rendimiento bruto, la model card indica que en un Samsung Galaxy F62 de 2021 transcribe aproximadamente 11 veces más rápido que el tiempo real usando 64 MB de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 64 MB de memoria en el dispositivo según la model card (pesos de 4 bits y activaciones de 8 bits sobre un archivo de 29,7 MB).
- GPU recomendadas: no requiere GPU; funciona en CPU de teléfonos Android, Mac y navegador. No se especifican modelos de GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada; el límite práctico es la memoria del dispositivo (64 MB medidos en un Galaxy F62).
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` para línea de comandos y build WASM para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 11x tiempo real en un Samsung Galaxy F62 de 2021; no se publican cifras de latencia absoluta ni throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER DiarBench (inglés en inglés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Urdu | ~56M | Audio de cualquier longitud (16 kHz) | 22,9 | Apache-2.0 | Hugging Face, motor Cactus needle, WebAssembly |
| Whisper tiny | ~39M | 30 s por ventana | 257,3 | MIT | Hugging Face, whisper.cpp, múltiples runtimes |
| Whisper base | ~74M | 30 s por ventana | 111,7 | MIT | Hugging Face, whisper.cpp, múltiples runtimes |
| IndicConformer Urdu | No disponible | No disponible | 29,1 | No disponible en la información proporcionada | Hugging Face (ONNX int8) |
| Dolphin base | No disponible | No disponible | 98,5 | No disponible en la información proporcionada | Hugging Face (int8) |

Shruti Urdu destaca por su tamaño (29,7 MB) y por su ventaja en conversación con code-switching (22,9 frente a 29,1 de IndicConformer Urdu y 111,7 de Whisper base), aunque IndicConformer Urdu es claramente superior en lectura de urdu nativo (FLEURS 24,7 frente a 33,5; Kathbath 13,4 frente a 18,2).

## Limitaciones y advertencias

- En lectura de urdu nativo, IndicConformer Urdu supera a Shruti Urdu en FLEURS (24,7 frente a 33,5) y Kathbath (13,4 frente a 18,2); Shruti solo gana en conversación con code-switching cuando se cuenta el inglés escrito en letras inglesas.
- La propia model card advierte de que ningún lector nativo de urdu ha revisado la salida del modelo todavía.
- Se observan errores reales documentados: la palabra hablada «ساتھ رکھ» transcrita como «سات ہٹ», y la escritura de «ڈاکٹر» como «doctor» en letras inglesas, un hábito del modelo con préstamos léxicos.
- Riesgo de alucinación y errores en palabras poco frecuentes o nombres propios, inherente a un modelo de 56M parámetros.
- Cobertura lingüística limitada a urdu e inglés; no soporta otros idiomas (cada uno tiene su propio modelo Shruti).
- El paquete `cactus-needle` envía recuentos anónimos de uso por defecto; es necesario definir `NEEDLE_TELEMETRY=0` para desactivarlo, lo que puede ser un caveat en entornos con requisitos de privacidad.
- El formato de pesos `.cact` está atado al motor Cactus needle; no hay conversión directa a GGUF ni a safetensors, lo que limita la portabilidad a otros runtimes.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero conviene conservar los avisos de atribución a Udgam Labs, Cactus Compute y los datasets empleados.
- El repositorio de Hugging Face muestra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-urdu
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Prueba en navegador: https://udgamlabs.com/models/shruti/urdu
- Código y ejemplos (documentación de urdu): https://github.com/udgamlabs/shruti/blob/main/docs/urdu.md
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Modelo original Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Bengali: https://huggingface.co/udgamlabs/shruti-bengali
- Shruti Telugu: https://huggingface.co/udgamlabs/shruti-telugu
- Shruti Gujarati: https://huggingface.co/udgamlabs/shruti-gujarati
- Shruti Odia: https://huggingface.co/udgamlabs/shruti-odia
- Shruti Kannada: https://huggingface.co/udgamlabs/shruti-kannada
- Whisper tiny (comparativa): https://huggingface.co/openai/whisper-tiny
- Whisper base (comparativa): https://huggingface.co/openai/whisper-base
- Whisper small (comparativa): https://huggingface.co/openai/whisper-small
- Dolphin base (comparativa): https://huggingface.co/DataoceanAI/dolphin-base
- Dolphin small (comparativa): https://huggingface.co/DataoceanAI/dolphin-small
- IndicConformer Urdu (comparativa): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-ur-onnx
