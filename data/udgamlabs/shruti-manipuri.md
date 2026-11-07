# udgamlabs/shruti-manipuri

## Resumen

Shruti Manipuri es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un laboratorio de investigación centrado en modelos pequeños que puedan ejecutarse en dispositivos locales. Con aproximadamente 56 millones de parámetros, forma parte de la familia Shruti, que ofrece un modelo compacto por idioma con soporte de inglés. El modelo transcribe audio de 16 kHz en manipuri escrito en escritura meetei mayek y en inglés, incluyendo casos de cambio de código (code-switching) entre ambos idiomas.

El modelo se distribuye como un único archivo de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, diseñado para el motor Cactus needle, disponible tanto de forma nativa como compilado a WebAssembly. Esto permite su ejecución en un teléfono, un portátil o un navegador sin servidor ni conexión a internet. Según el autor, en un Samsung Galaxy F62 de 2021 transcribe aproximadamente 11 veces más rápido que en tiempo real usando 64 MB de memoria.

Su relevancia radica en la combinación de tamaño reducido, funcionamiento completamente offline y soporte de una lengua de bajos recursos como el manipuri, con una salida en escritura nativa meetei mayek en lugar de la escritura bengalí. El modelo se construye sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi, con todos los pesos reentrenados sobre habla en manipuri e inglés y un vocabulario ampliado con 700 piezas específicas de manipuri.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder, 8 de decoder, anchura 512) |
| Parametros totales | Aproximadamente 56M (55.875.913) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier duración) |
| Tipos de cuantizacion | Pesos en 4 bits, activaciones en 8 bits (formato `.cact`) |
| Idiomas soportados | Manipuri (mni), inglés (en) y mezcla manipuri-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder de 8 capas en cada bloque y anchura 512, con unos 56 millones de parámetros. Deriva de Cactus Whistle (Apache-2.0) a través de Shruti Hindi: todos los pesos se reentrenaron sobre habla en manipuri e inglés, y se añadieron 700 piezas de vocabulario específicas del manipuri. La entrada es audio de 16 kHz de cualquier duración y la salida es texto en escritura meetei mayek para el manipuri, con palabras inglesas en minúsculas latinas cuando el modelo las mantiene en inglés.

Los datos de entrenamiento citados en la model card incluyen los conjuntos IndicVoices (ai4bharat), Vaani-transcription-part (ARTPARK-IISc) y LibriSpeech ASR (openslr). La model card no detalla el número total de tokens de audio ni si se aplicaron técnicas de ajuste por refuerzo o preferencias. La innovación principal no está en la arquitectura, sino en el empaquetado: un único archivo de 29,7 MB con cuantización mixta (4 bits en pesos, 8 bits en activaciones) que corre sobre el motor Cactus needle, con builds nativos y WebAssembly para ejecución en navegador.

## Capacidades

- Transcripción de voz a texto en manipuri con salida en escritura meetei mayek.
- Transcripción de inglés y de habla mixta manipuri-inglés, con detección automática del idioma de la entrada.
- Conservación de palabras inglesas en alfabeto latino dentro de enunciados en manipuri: según el autor, el 60,9 % de las 243 palabras inglesas de DiarBench se mantienen en letras inglesas.
- Procesamiento de audio de cualquier duración a 16 kHz.
- Ejecución completamente offline y en dispositivo, sin servidor ni conexión a internet.
- Funcionamiento en navegador mediante compilación WebAssembly del motor.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni razonamiento multi-paso, al tratarse de un modelo ASR.

## Casos de uso

- Subtitulado y transcripción de reuniones en manipuri: el modelo acepta audio de cualquier duración y produce texto en meetei mayek, lo que permite generar actas o subtítulos de conversaciones en las que se mezclan manipuri e inglés.
- Aplicaciones móviles de dictado offline: con 29,7 MB y unos 64 MB de memoria en uso, puede integrarse en apps Android o iOS para dictado en manipuri sin depender de la red, útil en zonas con conectividad limitada.
- Herramientas web de accesibilidad para hablantes de manipuri: el build WebAssembly permite transcribir audio directamente en el navegador, sin enviar datos a servidores externos, lo que facilita el cumplimiento de requisitos de privacidad.
- Digitalización de archivos orales: transcripción por lotes de grabaciones históricas o entrevistas en manipuri para construir corpus textuales en escritura meetei mayek.
- Asistentes de voz locales para atención ciudadana: integración en quioscos o terminales sin conexión que transcriban consultas habladas en manipuri e inglés antes de procesarlas con otro componente.
- Investigación lingüística y de code-switching: generación de transcripciones etiquetadas con mezcla de idiomas para estudiar patrones de cambio de código manipuri-inglés, dado que el modelo conserva las palabras inglesas en alfabeto latino.
- Herramientas educativas en regiones de Manipur: transcripción de clases o materiales audiovisuales para su reutilización como texto, con la ventaja de ejecutarse en hardware de gama baja.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor). Según el autor, se usaron los mismos clips y el mismo evaluador para todos los modelos; Shruti Manipuri se midió en su motor on-device sobre un Mac. Datos medidos el 3 de noviembre de 2026.

| Modelo | Tamano de archivo | IndicVoices valid | DiarBench, ingles en ingles | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Manipuri | 29,7 MB | 36,0 | 48,2 | 66,0 |
| IndicConformer Manipuri (int8) | 137,7 MB | 31,2 | 65,4 | 53,5 |

Intervalos de confianza pareados al 95 % (Shruti Manipuri menos el otro modelo, en puntos de WER; un valor negativo indica menos errores de Shruti Manipuri):

- IndicConformer Manipuri, IndicVoices valid: +2,07 a +7,70 por clip (Shruti Manipuri tiene más errores).
- IndicConformer Manipuri, DiarBench nativo: +7,02 a +18,67 por clip y +6,39 a +20,31 por conversación.
- IndicConformer Manipuri, DiarBench inglés en inglés: -26,78 a -7,98 por clip y -31,04 a -8,05 por conversación.
- Porcentaje de palabras inglesas conservadas en letras inglesas: 60,9 % de las 243 palabras inglesas de DiarBench, en 44 turnos.
- LibriSpeech test-clean: 5,97 (WER, según el fragmento de la model card).

El propio autor advierte que DiarBench consta de solo 44 turnos de 20 conversaciones y que los intervalos son amplios, por lo que los resultados deben interpretarse como indicativos y no concluyentes.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo pesa 29,7 MB; en el Samsung Galaxy F62 de prueba el autor midió un uso de 64 MB de memoria.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y ejecución en dispositivo, no para GPU de datacenter.
- Cabe en GPU de consumo: sí, con un consumo de memoria muy inferior al de cualquier GPU moderna; también en teléfonos y navegadores.
- Opciones de despliegue: motor Cactus needle (paquete `cactus-needle` de Python, binario `needle` para línea de comandos y build WebAssembly para navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 11 veces más rápido que en tiempo real en un Samsung Galaxy F62 de 2021, según el autor. No se publican cifras de latencia absoluta ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER IndicVoices valid | WER DiarBench nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Manipuri | ~56M | No disponible (audio de cualquier duración) | 36,0 | 66,0 | Apache-2.0 | Hugging Face, motor Cactus needle, WebAssembly |
| IndicConformer Manipuri (int8) | No disponible | No disponible | 31,2 | 53,5 | No disponible en la informacion | Hugging Face (ONNX, OpenVoiceOS) |

No se dispone de datos de otros modelos ASR para manipuri en la informacion proporcionada. La comparación con IndicConformer Manipuri procede de la propia model card del autor, que reconoce que este último obtiene mejor WER en la referencia nativa y en IndicVoices, mientras que Shruti Manipuri obtiene mejor resultado cuando las palabras inglesas se evalúan en alfabeto latino.

## Limitaciones y advertencias

- El autor califica los resultados como "un indicador, no un resultado": la muestra de DiarBench es pequeña (44 turnos, 20 conversaciones) y los intervalos de confianza son amplios.
- IndicConformer Manipuri supera a Shruti Manipuri en la referencia nativa de DiarBench (53,5 frente a 66,0) y en IndicVoices valid (31,2 frente a 36,0).
- Ningún hablante nativo de manipuri ha revisado las salidas del modelo, según la model card; los ejemplos mostrados proceden de una voz sintética, no de habla real.
- El modelo escribe en meetei mayek, no en escritura bengalí; los usuarios que esperen esta última no obtendrán la salida deseada.
- Solo cubre manipuri e inglés; otros idiomas requieren otros modelos de la familia Shruti.
- Riesgo de alucinación y errores de transcripción inherente a un modelo ASR de 56M de parámetros; no se documentan sesgos específicos.
- La licencia del modelo es Apache-2.0, pero la model card remite a los términos de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech) para su uso comercial.
- El paquete `cactus-needle` envía recuentos de uso anónimos por defecto; debe configurarse `NEEDLE_TELEMETRY=0` para desactivarlos.
- El modelo depende del motor Cactus needle; no hay pesos en safetensors ni GGUF, lo que limita su uso con otras herramientas de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-manipuri
- Colección de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/manipuri.md
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/manipuri
- Sitio de Udgam Labs: https://udgamlabs.com/
- Catálogo de modelos de Udgam Labs: https://udgamlabs.com/models
- IndicConformer Manipuri (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-mni-onnx
