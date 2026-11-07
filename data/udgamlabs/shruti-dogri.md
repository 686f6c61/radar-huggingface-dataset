# udgamlabs/shruti-dogri

## Resumen

Shruti Dogri es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, especializado en dogri y en inglés, incluyendo el fenómeno de code-switching entre ambos idiomas. Con aproximadamente 56 millones de parámetros (55.722.313), forma parte de la familia Shruti, que sigue la filosofía de un modelo pequeño por idioma. El modelo se distribuye como un único archivo de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, diseñado para ejecutarse íntegramente en dispositivo, sin conexión y sin servidor.

La relevancia del modelo reside en su enfoque de despliegue: está pensado para funcionar en teléfonos móviles, portátiles y navegadores mediante el motor Cactus needle, con compilaciones nativas y WebAssembly. En un Samsung Galaxy F62 de 2021 transcribe aproximadamente diez veces más rápido que el tiempo real con 64 MB de memoria. El modelo transcribe dogri en escritura devanagari y conserva las palabras inglesas en alfabeto latino cuando las mantiene en inglés.

El modelo deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute. Udgam Labs reentrenó todos los pesos con voz en dogri e inglés y añadió 400 piezas de vocabulario dogri. La licencia del modelo es Apache-2.0, aunque las condiciones de los datos de entrenamiento deben consultarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer para ASR (8 capas de encoder + 8 de decoder, anchura 512), derivada de Cactus Whistle vía Shruti Hindi |
| Parametros totales | Aproximadamente 56M (55.722.313) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; acepta audio de 16 kHz de cualquier longitud |
| Tipos de cuantizacion | Pesos en 4 bits y activaciones en 8 bits (formato propietario .cact) |
| Idiomas soportados | Dogri (doi), inglés (en) y mezcla dogri-inglés |
| Licencia | Apache-2.0 (modelo); condiciones de los datos de entrenamiento sujetas a sus propias licencias |
| Formato de pesos | .cact (motor Cactus needle); 29,7 MB |
| Entrada / salida | Audio a 16 kHz de cualquier duración → texto (dogri en devanagari, inglés en latín minúscula) |
| Runtime | Cactus needle (Apache-2.0), nativo y WebAssembly |
| Libreria | cactus-needle |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder de tipo transformer con 8 capas en el encoder y 8 en el decoder, y una anchura de 512 dimensiones, lo que resulta en unos 56 millones de parámetros. Se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute, pasando por Shruti Hindi: Udgam Labs reentrenó la totalidad de los pesos con voz en dogri e inglés y amplió el vocabulario con 400 piezas específicas de dogri. El resultado se empaqueta en el formato .cact para el motor Cactus needle, con pesos cuantizados a 4 bits y activaciones a 8 bits.

Los datos de entrenamiento provienen de los conjuntos ai4bharat/IndicVoices y openslr/librispeech_asr, según los metadatos del modelo. La model card no detalla el número exacto de tokens de audio ni la composición proporcional del dataset, y tampoco menciona explícitamente el uso de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. La innovación técnica principal no está en la arquitectura, sino en el empaquetado y el motor de inferencia: un modelo de 29,7 MB que funciona offline en hardware de consumo, incluyendo navegadores mediante WebAssembly, con un rendimiento medido de aproximadamente 10 veces el tiempo real en un teléfono de gama media de 2021.

## Capacidades

- Reconocimiento automático del habla en dogri, con salida en escritura devanagari.
- Reconocimiento de inglés, con salida en alfabeto latino en minúscula cuando mantiene las palabras en inglés.
- Manejo de code-switching dogri-inglés dentro de una misma frase, conservando cada idioma en su escritura correspondiente.
- Detección automática del idioma de la entrada (dogri o inglés).
- Procesamiento de audio a 16 kHz de cualquier duración.
- Inferencia totalmente offline y en dispositivo, sin servidor ni conexión a internet.
- Ejecución nativa (Mac, Android, línea de comandos) y en navegador mediante WebAssembly.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado y transcripción de conversaciones dogri-inglés en dispositivos móviles: el modelo transcribe audio de cualquier longitud en el propio teléfono, sin conexión, lo que resulta adecuado para entornos con conectividad limitada o intermitente.
- Aplicaciones de accesibilidad en tiempo real: al ejecutarse aproximadamente 10 veces más rápido que el tiempo real en un Galaxy F62 con 64 MB de memoria, puede alimentar subtítulos en vivo en un teléfono de gama media.
- Herramientas web de transcripción sin backend: la compilación WebAssembly permite integrar la transcripción directamente en una página web, como demuestra la página de Udgam Labs, eliminando costes de servidor y problemas de privacidad del audio.
- Digitalización de entrevistas y testimonios en dogri: la salida en devanagari facilita el archivo y la búsqueda de material oral, aunque requiere revisión humana dado que ningún lector nativo ha validado aún la salida.
- Procesamiento de notas de voz con mezcla de idiomas: el manejo de code-switching mantiene las palabras inglesas en latín, útil en contextos administrativos y educativos donde el dogri incorporate términos ingleses.
- Prototipado e investigación en ASR de bajos recursos: su tamaño de 29,7 MB y su licencia Apache-2.0 lo hacen adecuado para experimentos en hardware modesto y para servir de base a ajustes posteriores.
- Transcripción de audio en inglés en el mismo archivo: el modelo también transcribe inglés (LibriSpeech test-clean, WER 6,1), por lo que puede cubrir ambos idiomas con un único binario.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor). Las mismas muestras y el mismo evaluador para todos los modelos; Shruti Dogri medido en su motor en dispositivo sobre un Mac. Medición del 3 de noviembre de 2026. El tamaño es el archivo publicado por cada autor.

| Modelo | Tamano de archivo | IndicVoices valid | DiarBench, ingles en ingles | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Dogri | 29,7 MB | 43,5 | 34,5 | 37,0 |
| IndicConformer Dogri (int8) | 137,7 MB | 38,5 | 39,7 | 37,4 |

Intervalos de confianza pareados al 95 % (Shruti Dogri menos el otro modelo, en puntos de WER; 1.000 remuestreos de clips y remuestreo por conversación). Un valor negativo indica menos errores de Shruti Dogri; un intervalo que incluye 0 no muestra ventaja en ningún sentido.

- IndicConformer Dogri, IndicVoices valid: +2,58 a +7,27 por clip.
- IndicConformer Dogri, DiarBench nativo: -5,31 a +5,32 por clip; -6,15 a +5,64 por conversación; -1,74 a +10,86 ignorando la escritura.
- IndicConformer Dogri, DiarBench inglés en inglés: -10,99 a +1,78 por clip; -12,13 a +1,99 por conversación; -7,30 a +6,09 ignorando la escritura.

Otras mediciones reportadas:

- Un archivo para dos idiomas: Shruti Dogri también transcribe inglés; LibriSpeech test-clean 6,1 (Shruti Hindi: 5,95).
- Silencio: 0 palabras inventadas en 100 clips silenciosos.

Nota de lectura: IndicVoices valid es la partición reservada del propio IndicVoices; sus hablantes quedan fuera del entrenamiento y sus frases están bloqueadas, pero procede de la misma fuente que los datos de entrenamiento, por lo que favorece al modelo. DiarBench es conversación real ajena a esa fuente: 24 turnos de 17 conversaciones, 479 palabras de referencia, 40 de ellas en inglés, en 16 turnos. La columna «inglés en inglés» puntúa contra referencias que escriben las palabras inglesas en latín, y las palabras inglesas solo cuentan si están en letras inglesas; la columna nativa puntúa contra referencias que escriben esas palabras en devanagari.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 MB de memoria en el dispositivo según la medición en un Galaxy F62; el archivo pesa 29,7 MB.
- GPU recomendadas: no se especifican GPU de escritorio; el modelo está orientado a CPU y a ejecución en dispositivo (Mac, Android, navegador).
- Cabe en hardware de consumo: sí, en teléfonos de gama media como el Samsung Galaxy F62 (2021) y en portátiles convencionales.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python cactus-needle, binario de línea de comandos needle y compilación wasm para navegador.
- Latencia y throughput: aproximadamente 10 veces más rápido que el tiempo real en un Samsung Galaxy F62; no se publican cifras adicionales de latencia por token ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER IndicVoices valid | WER DiarBench (nativo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Dogri | ~56M | Audio 16 kHz de cualquier longitud | 43,5 | 37,0 | Apache-2.0 | Hugging Face, motor Cactus needle |
| IndicConformer Dogri (int8) | No disponible | No disponible | 38,5 | 37,4 | No disponible en la informacion | Hugging Face (OpenVoiceOS) |
| Shruti Hindi (modelo base de la familia) | ~56M (familia Shruti) | Audio 16 kHz | No disponible para dogri; WER LibriSpeech test-clean 5,95 | No disponible | Apache-2.0 | Hugging Face, udgamlabs.com |

IndicConformer Dogri obtiene mejor WER en IndicVoices valid (38,5 frente a 43,5), mientras que Shruti Dogri obtiene mejor resultado en la columna «inglés en inglés» de DiarBench (34,5 frente a 39,7) y una diferencia mínima en la columna nativa (37,0 frente a 37,4). La ventaja principal de Shruti Dogri no es comparativa, sino de despliegue: un único archivo de 29,7 MB frente a 137,7 MB, con ejecución offline en dispositivo y en navegador.

## Limitaciones y advertencias

- El propio autor declara que no formula ninguna afirmación comparativa: IndicConformer Dogri está por delante en IndicVoices valid y el test de conversación en dogri es de solo 24 turnos, insuficiente para extraer conclusiones.
- Ningún lector nativo de dogri ha revisado todavía la salida del modelo.
- IndicVoices valid procede de la misma fuente que los datos de entrenamiento, por lo que sus cifras favorecen al modelo.
- La ortografía del dogri en devanagari presenta variaciones respecto a las líneas de referencia, documentadas en la model card (por ejemplo, आह्ली frente a आह्‍ली, सामान frente a समान, अजें है frente a अजे ऐ).
- Riesgo de alucinación: no se detectaron palabras inventadas en 100 clips silenciosos, pero no hay datos sobre otros tipos de alucinación en audio ruidoso o con habla solapada.
- Cobertura lingüística limitada a dogri, inglés y su mezcla; otros idiomas requieren sus propios modelos de la familia Shruti.
- La licencia Apache-2.0 cubre el modelo, pero las condiciones de los datos de entrenamiento (IndicVoices, LibriSpeech) tienen sus propios términos que deben revisarse para uso comercial.
- El paquete cactus-needle envía recuentos anónimos de uso por defecto; debe definirse NEEDLE_TELEMETRY=0 para desactivarlo.
- El formato de pesos .cact requiere el motor Cactus needle; no se distribuyen pesos en safetensors ni GGUF.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy incipiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-dogri
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/dogri
- Familia Shruti: https://udgamlabs.com/models/shruti
- Colección Shruti en Hugging Face: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos (documentación de dogri): https://github.com/udgamlabs/shruti/blob/main/docs/dogri.md
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- IndicConformer Dogri (ONNX int8): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-doi-onnx
- Ficha de Shruti en free2aitools: https://free2aitools.com/model/udgamlabs/shruti
