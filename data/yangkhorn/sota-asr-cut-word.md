# Yangkhorn/sota-asr-cut-word

## Resumen

Sota ASR Cut-Word es un paquete de despliegue (interfaz web y API) para el modelo de reconocimiento automatico del habla en jemer `Sota-ASR-Khmer-26M-ONNX`, desarrollado por Ing Muyleang (muyleanging) y empaquetado por Yangkhorn. El modelo subyacente es un Conformer de 26 millones de parametros con cabecera CTC y decodificador de atencion, exportado a ONNX en cuantizacion int8 para inferencia en dispositivo. El paquete anade dos etapas de postprocesado linguistico: segmentacion de palabras con `khmercut.nn` y alineacion forzada con `kfa` (Khmer Forced Aligner).

El problema que resuelve es la transcripcion de audio y video en jemer con segmentacion de palabras correcta, un paso critico porque el jemer no usa espacios entre palabras. El pipeline acepta audio o video (y opcionalmente un fichero SRT) y produce transcripciones con palabras delimitadas, lo que facilita su uso en subtitulado, indexacion y busqueda.

Es relevante por su enfoque en eficiencia: 26M de parametros en int8 ONNX permiten ejecucion en CPU y entornos con recursos limitados, algo poco habitual en ASR de calidad para idiomas de bajos recursos. La licencia no esta declarada en el repositorio, lo que constituye un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con CTC y decodificador de atencion |
| Parametros totales | 26M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El modelo base es un Conformer, es decir, una arquitectura que combina bloques convolucionales con auto-atencion para capturar dependencias locales y globales en la secuencia de audio. Sobre las representaciones acusticas se aplican dos cabeceras: una CTC (Connectionist Temporal Classification) para alineamiento sin necesidad de etiquetas a nivel de fotograma, y un decodificador de atencion que refina la salida. El modelo se distribuye en dos variantes (`v4b` y `v1`) exportadas a ONNX con cuantizacion int8.

Segun la model card del paquete, el entrenamiento del modelo Sota se realizo desde cero ("trained from scratch") sobre una mezcla de corpus de habla jemer que incluye OpenSLR 42 (Google, SLTU 2018), FLEURS, Khmer Speech Corpus, iAny Khmer Voices, Cultural Khmer ASR Dataset, YODAS2, khm-asr-open, Khmer Speech of Phnom Penh Gendarmerie, NXKMER TTS 450 y datos sinteticos generados con VoxPocket + VoxCPM2. No se especifica el numero total de horas ni de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. El paquete anade un postprocesado determinista con `khmercut.nn` (segmentacion de palabras) y `kfa` (alineacion forzada), que no forman parte del modelo neuronal de ASR.

## Capacidades

- Reconocimiento automatico del habla en jemer a partir de audio o video.
- Aceptacion opcional de ficheros SRT como entrada auxiliar para el pipeline.
- Segmentacion de palabras en jemer mediante `khmercut.nn`, resolviendo la ausencia de delimitadores espaciales en la escritura jemer.
- Alineacion forzada con `kfa` para obtener marcas temporales a nivel de palabra.
- Inferencia en dispositivo gracias al formato ONNX int8 y al reducido tamano (26M de parametros).
- Interfaz web y API incluidas en el paquete de despliegue.
- Etiqueta de idioma ingles (en) declarada, aunque la model card no detalla el alcance real del multilinguismo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- Subtitulado automatico de video en jemer: el pipeline acepta video y genera transcripciones segmentadas por palabra, adecuadas para generar subtitulos con marcas temporales gracias a `kfa`.
- Generacion de subtitulos SRT a partir de audio existente: la entrada SRT opcional permite reutilizar segmentaciones previas y alinear el texto reconocido.
- Indexacion y busqueda de contenido audiovisual: la segmentacion de palabras permite construir indices invertidos sobre transcripciones de archivos de audio y video en jemer.
- Transcripcion en dispositivos de bajos recursos: los 26M de parametros en int8 ONNX permiten ejecutar el modelo en CPU, sin GPU dedicada, en portatiles o entornos edge.
- Prototipado e investigacion en ASR de bajos recursos: el modelo sirve como linea base reproducible para experimentos con jemer y como referencia de arquitectura Conformer compacta.
- Despliegue en Google Colab: el paquete incluye un notebook listo para ejecutar la interfaz web y la API, util para demos y validacion rapida sin infraestructura propia.
- Procesamiento por lotes de archivos de audio: la API permite integrar la transcripcion en pipelines automatizados de tratamiento de archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues; el modelo es ONNX int8 de 26M de parametros y esta pensado para CPU. En GPU, el consumo de memoria es minimo (del orden de decenas de MB para los pesos), aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican; cualquier GPU moderna es sobradamente suficiente. El caso de uso declarado es CPU y entornos on-device.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. No se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), interfaz web y API incluidas en el paquete, y notebook de Google Colab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sota ASR Cut-Word (este) | 26M | no disponible | km, en | no disponible | ONNX int8 |
| muyleanging/Sota-ASR-Khmer-26M-ONNX (base) | 26M | no disponible | km | no disponible | ONNX int8 |
| muyleanging/Sota-ASR-Khmer | no disponible | no disponible | km | no disponible | no disponible |
| Whisper (variantes de OpenAI) | 39M-1.55B | 30 s de audio | multilingue | MIT | safetensors, GGUF, etc. |

La comparacion con Whisper es orientativa: Whisper es multilingue y de mayor tamano en sus variantes superiores, mientras que Sota esta especializado en jemer y optimizado para inferencia en dispositivo. No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Los modelos de la familia Sota comparten autor y arquitectura, por lo que la comparativa entre ellos es de variante, no de alternativa.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si se permite el uso comercial. Es un bloqueante para produccion hasta aclararlo con el autor.
- El modelo esta especializado en jemer; la etiqueta de ingles no viene acompanada de detalles sobre su calidad o alcance.
- No se publican metricas de error (WER/CER), por lo que no es posible evaluar su precision de forma objetiva sin pruebas propias.
- Riesgo de alucinacion y de errores en audio con ruido, acentos no representados en el corpus o vocabulario tecnico, habitual en modelos ASR pequenos.
- El paquete depende de dos componentes externos (`khmercut.nn` y `kfa`) cuyas licencias y mantenimiento no se detallan en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- No se documentan sesgos especificos; al entrenarse sobre corpus de habla jemer diversos, pueden existir sesgos hacia las variedades y condiciones de grabacion mejor representadas.
- El tamano del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no estan alojados directamente o que la informacion esta incompleta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Yangkhorn/sota-asr-cut-word
- Modelo base: https://huggingface.co/muyleanging/Sota-ASR-Khmer-26M-ONNX
- Modelo Sota ASR Khmer: https://huggingface.co/muyleanging/Sota-ASR-Khmer
- Dataset de previsualizacion: https://huggingface.co/datasets/muyleanging/Sota-ASR-Khmer-Data-Preview
- VoxPocket TTS Khmer: https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Dataset NXKMER TTS 450: https://huggingface.co/datasets/NTQAI/nxkmer-tts-450
- Notebook de Colab: https://colab.research.google.com/notebook#fileId=https%3A//huggingface.co/Yangkhorn/sota-asr-cut-word/blob/main/sota-asr-cut-word.ipynb
- Paper VoxCPM (arXiv:2509.24650): https://arxiv.org/abs/2509.24650
