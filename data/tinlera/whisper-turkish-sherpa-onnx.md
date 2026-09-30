# Tinlera/whisper-turkish-sherpa-onnx

## Resumen

whisper-turkish-sherpa-onnx es un paquete de dos modelos de reconocimiento automático del habla (ASR) en turco, derivados de OpenAI Whisper y publicados por el usuario Tinlera. No se trata de un entrenamiento nuevo: el autor ha tomado dos fine-tunes turcos ya existentes en la comunidad (ysdede/whisper-base-turkish-1.1 y ysdede/whisper-small-turkish-1), ha renombrado sus pesos a la nomenclatura de openai-whisper y los ha exportado a ONNX con cuantización dinámica int8 mediante las herramientas de sherpa-onnx v1.13.3.

El objetivo declarado es el dictado en dispositivo (on-device), en concreto la integración en el teclado CBoard, y funciona con cualquier reconocedor Whisper offline de sherpa-onnx. El repositorio incluye dos variantes: base-tr (160 MB) y small-tr (375 MB), más un vocabulario multilingüe compartido tokens.txt (0,8 MB). Su relevancia actual está en ofrecer ASR turco de bajo consumo, ejecutable en móvil o CPU sin GPU, con licencia Apache-2.0 y mediciones públicas de WER y velocidad relativa.

La arquitectura subyacente es la de Whisper (transformer encoder-decoder), en los tamaños base y small. Al no haberse reentrenado los pesos, las capacidades lingüísticas son las de los checkpoints turcos de origen, de los que no se documenta el corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Whisper; dos variantes (base y small), encoder y decoder exportados por separado |
| Parametros totales | 74 M aprox. (whisper-base) y 244 M aprox. (whisper-small), correspondientes a los checkpoints estándar de OpenAI Whisper; los pesos no se reentrenaron |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (característica estándar de Whisper); no explicitada en la model card |
| Tipos de cuantizacion | int8 (cuantización dinámica de todas las MatMul con ONNX Runtime); para small-tr se reportan además medidas en float16 sobre GPU |
| Idiomas soportados | turco (tr) exclusivamente |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX en int8 (ficheros de encoder y decoder independientes); vocabulario compartido en tokens.txt |
| Tamaño de los ficheros | base-tr: 160 MB; small-tr: 375 MB; tokens.txt: 0,8 MB; repositorio completo: 0,5 GB |
| Verificación de integridad | SHA256SUMS con el checksum de cada fichero |

## Arquitectura y entrenamiento

Ambos modelos son fine-tunes turcos de OpenAI Whisper. La variante base-tr parte de ysdede/whisper-base-turkish-1.1 (commit d787b5089e3374833ff666a0de81a99b3de4832e) y small-tr de ysdede/whisper-small-turkish-1 (commit 703bd1d3678c3a2a7368d805e976550f63d93021). El autor no ha reentrenado los pesos: únicamente los ha renombrado a los nombres de parámetro de openai-whisper y los ha exportado con `scripts/whisper/export-onnx.py` de sherpa-onnx v1.13.3 (Apache-2.0), sin más modificaciones que la carga del checkpoint local. Todas las operaciones MatMul se cuantizan a int8 con la cuantización dinámica de ONNX Runtime. Las herramientas de conversión están en el repositorio de CBoard, bajo `tools/whisper-export`.

El resultado son cuatro ficheros ONNX (encoder y decoder para cada variante) más un vocabulario multilingüe de Whisper compartido por los dos. Como los checkpoints de origen no documentan sus datos de entrenamiento, se desconoce la composición exacta del corpus turco, el número de tokens de entrenamiento y si hubo fases de RLHF o DPO. La model card tampoco documenta innovaciones técnicas propias: el valor añadido está en el formato de despliegue (ONNX int8 para sherpa-onnx), no en cambios arquitectónicos.

## Capacidades

- Reconocimiento automático del habla (ASR) offline en turco, con dos niveles de compromiso entre precisión y tamaño (base-tr y small-tr).
- Ejecución en dispositivo sin GPU: la cuantización int8 de todas las MatMul reduce el coste computacional hasta hacer viable la inferencia en CPU de móvil.
- Integración directa con cualquier reconocedor Whisper offline de sherpa-onnx mediante `OfflineRecognizer.from_whisper`.
- API configurable: se puede fijar el idioma con `language="tr"` y la tarea con `task="transcribe"`; la model card recomienda forzar el idioma en lugar de dejar que el modelo lo detecte.
- Vocabulario multilingüe de Whisper compartido (tokens.txt), reutilizable por las dos variantes.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No hay soporte de visión, audio más allá de la transcripción, ni modo de razonamiento explícito.

## Casos de uso

- Dictado en teclado móvil: es el caso de uso original. La variante base-tr (160 MB) se integra en el teclado CBoard para convertir voz en texto en el propio dispositivo, sin enviar audio a servidores externos.
- Notas de voz offline en móvil: con small-tr (375 MB) o base-tr se puede transcribir una grabación local en turco sin conexión, útil en entornos con red limitada o requisitos de privacidad.
- Transcripción de reuniones on-premise: al ejecutarse en CPU con ONNX Runtime, permite desplegar un servicio de transcripción turca en infraestructura propia sin GPU dedicada.
- Subtitulado de contenido audiovisual turco: generar subtítulos a partir de pistas de audio usando la variante small-tr, que obtiene mejor WER (12,0 % en FLEURS tr) a costa de mayor tamaño.
- Preetiquetado de corpus turcos: usar el modelo como generador de transcripciones preliminares para construir datasets de habla, aplicando después una revisión humana y un filtro de voz (VAD) para descartar alucinaciones.
- Atención al cliente o análisis de llamadas: transcribir audio turco de contact center como paso previo a tareas de búsqueda, clasificación o análisis; conviene aplicar VAD porque el modelo puede inventar frases en tramos sin habla.
- Dispositivos embebidos o IoT con CPU limitada: gracias al tamaño reducido de base-tr int8 y a su velocidad relativa de 3,9× frente a whisper-small int8 en CPU, encaja en hardware modesto.

## Benchmarks y rendimiento

Datos publicados en la model card (30 de septiembre de 2026). Los números se normalizaron escribiendo las cifras con palabras antes de comparar, de modo que "1537'de" y "bin beş yüz otuz yedide" cuentan igual. Menor es mejor.

| Modelo | FLEURS tr test (743) | MediaSpeech tr (primeros 500) | Velocidad relativa en CPU (int8) |
|---|---|---|---|
| openai/whisper-small, int8 | 15,5 % | 27,5 % | 1× |
| base-tr (este repo), int8 | 17,8 % | 26,0 % | 3,9× |
| small-tr (este repo), float16 en GPU | 12,0 % | 19,1 % | 1× |
| openai/whisper-small, float16 en GPU | 14,8 % | 28,9 % | 1× |

Comportamiento conocido reportado por el autor:

- Ambos fine-tunes a veces escriben la frase y la reinician hasta que el límite de sherpa-onnx de 6 tokens por segundo de audio los corta. Eliminar la repetición final del texto baja el error de base-tr en FLEURS del 17,8 % al 15,5 %.
- En audio sin habla pueden inventar una frase (base-tr int8 lo hizo en 13 de 20 clips de prueba), mientras que openai/whisper-small escribe etiquetas de sonido como "(Müzik)". Se recomienda ejecutar una comprobación de actividad de voz antes de transcribir.

## Requisitos de hardware

- Tamaño en disco: 160 MB para base-tr int8, 375 MB para small-tr int8 y 0,8 MB para tokens.txt; el repositorio completo ocupa 0,5 GB.
- Memoria de trabajo: no se publican cifras de VRAM ni RAM pico. Por el tamaño de los ficheros, caben en dispositivos con unos pocos cientos de megabytes libres.
- CPU: es el objetivo principal de diseño. base-tr int8 es 3,9× más rápido que whisper-small int8 en CPU según la medición del autor.
- GPU: no es necesaria. La única medida en GPU publicada corresponde a small-tr en float16, sin cifra de velocidad absoluta.
- GPU consumer: el modelo cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 4090) e incluso en iGPU, pero la cuantización int8 está pensada para CPU.
- Despliegue: `sherpa_onnx.OfflineRecognizer.from_whisper` con encoder, decoder y tokens.txt; al ser ONNX, también puede ejecutarse con otros entornos compatibles con ONNX Runtime.
- Latencia y throughput: no se publican valores absolutos en milisegundos ni tokens por segundo; solo la velocidad relativa en CPU (3,9× para base-tr frente a whisper-small int8).

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño | Contexto (audio) | WER FLEURS tr | Licencia | Formato |
|---|---|---|---|---|---|---|
| base-tr (este repo) | 74 M aprox. | 160 MB int8 | 30 s por ventana | 17,8 % (15,5 % sin repetición final) | Apache-2.0 | ONNX int8 |
| small-tr (este repo) | 244 M aprox. | 375 MB int8 | 30 s por ventana | 12,0 % (float16 en GPU) | Apache-2.0 | ONNX int8 |
| openai/whisper-small int8 | 244 M | no disponible | 30 s por ventana | 15,5 % | MIT (código de OpenAI Whisper) | ONNX int8 |
| ysdede/whisper-base-turkish-1.1 | 74 M aprox. | no disponible | 30 s por ventana | no disponible | no disponible en la información proporcionada | safetensors (checkpoint de origen) |
| ysdede/whisper-small-turkish-1 | 244 M aprox. | no disponible | 30 s por ventana | no disponible | no disponible en la información proporcionada | safetensors (checkpoint de origen) |

Advertencia sobre la comparación: small-tr solo se midió en float16 sobre GPU, mientras que base-tr y whisper-small se midieron en int8 sobre CPU, por lo que los valores de velocidad no son directamente comparables entre las tres filas. No se dispone de datos de benchmarks de los checkpoints de origen ysdede.

## Limitaciones y advertencias

- Repetición de texto: ambos fine-tunes pueden escribir una frase y reiniciarla hasta que el límite de 6 tokens por segundo de audio los corta. Mitigación documentada: eliminar la repetición final (mejora base-tr del 17,8 % al 15,5 % en FLEURS).
- Alucinación en audio sin habla: base-tr int8 inventó una frase en 13 de 20 clips de prueba sin voz. Es imprescindible un filtro de actividad de voz (VAD) antes de transcribir en producción.
- Idioma único: solo turco. No se documentan capacidades multilingües efectivas, pese a que el vocabulario de Whisper sea multilingüe.
- Idiomas y detección: la model card recomienda fijar `language="tr"` explícitamente en lugar de confiar en la detección automática.
- Datos de entrenamiento desconocidos: los modelos de origen no documentan su corpus, por lo que no se pueden evaluar sesgos ni cobertura de acentos, dialectos o dominios concretos.
- Asimetría en las mediciones: small-tr solo tiene cifras en float16 sobre GPU, no en int8 sobre CPU, lo que dificulta una comparación homogénea.
- Validación comunitaria mínima: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentación de terceros.
- Licencia: Apache-2.0, igual que los modelos de origen, lo que permite uso comercial. El autor atribuye el fine-tuning a ysdede, el código base a OpenAI Whisper (MIT) y la exportación a k2-fsa (Apache-2.0).
- Deriva de tarea: al emplear `task="translate"` o cualquier uso distinto de la transcripción no hay garantías ni mediciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tinlera/whisper-turkish-sherpa-onnx
- Modelo base (variante base): https://huggingface.co/ysdede/whisper-base-turkish-1.1
- Modelo base (variante small): https://huggingface.co/ysdede/whisper-small-turkish-1
- Repositorio sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Modelos preentrenados de sherpa (incluye Whisper): https://k2-fsa.github.io/sherpa/onnx/spoken-language-identification/pretrained_models.html
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Ejemplo de exportación Whisper de sherpa-onnx en HuggingFace: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-tiny
- Modelos ONNX Runtime: https://onnxruntime.ai/models
- Buscador de modelos Whisper en HuggingFace: https://huggingface.co/models?search=openai/whisper
