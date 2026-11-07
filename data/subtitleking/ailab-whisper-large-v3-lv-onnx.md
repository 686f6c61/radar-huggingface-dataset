# subtitleking/ailab-whisper-large-v3-lv-onnx

## Resumen

`subtitleking/ailab-whisper-large-v3-lv-onnx` es una conversión a ONNX del checkpoint `AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19`, un ajuste fino de Whisper large-v3 para reconocimiento automático de habla (ASR) en letón. El modelo original lo desarrolla AiLab.lv, del Instituto de Matemáticas y Ciencias de la Computación (IMCS) de la Universidad de Letonia, entrenado sobre Common Voice 19.0 y el corpus de radiodifusión LATE-Media. Este repositorio, publicado por el usuario `subtitleking`, no modifica los pesos más allá del formato: su objetivo es permitir la inferencia directamente en el navegador mediante Transformers.js y WebGPU, orientado al producto SubtitleKing.

La relevancia de esta ficha es doble. Por un lado, documenta el primer (y prácticamente único) empaquetado ONNX de un Whisper large-v3 especializado en letón, un idioma de bajos recursos con escasa cobertura en modelos ASR multilingües. Por otro, ilustra un patrón de despliegue emergente: exportar modelos grandes a ONNX con cuantización agresiva del decodificador para ejecutarlos en cliente, sin servidor, con latencia aceptable en GPUs integradas o discretas de consumo.

El repositorio ocupa 2,1 GB y contiene un encoder en fp16 y un decodificador fusionado cuantizado a 4 bits con past key values, junto con tokenizer y configuraciones heredadas del checkpoint fuente. No incluye datos de benchmarks propios ni documentación sobre el proceso de entrenamiento original más allá de la referencia al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX |
| Parametros totales | no disponible (el checkpoint base Whisper large-v3 tiene 1.550 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decodificador MatMul 4-bit, bloque 32, simetrico; decodificador fusionado con past key values |
| Idiomas soportados | Leton (`lv`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3, un transformer encoder-decoder con atención completa entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe. El checkpoint base fue ajustado por AiLab.lv sobre Common Voice 19.0 en letón y el corpus de radiodifusión LATE-Media, lo que adapta el modelo al dominio de audio de medios y a la fonética y vocabulario del letón. No se dispone en la información proporcionada de detalles sobre el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; Whisper se entrena de forma supervisada con predicción de tokens, y el ajuste fino presumiblemente sigue ese mismo esquema.

La innovación técnica de este repositorio es la exportación con Optimum (`automatic-speech-recognition-with-past`): el encoder se mantiene en fp16 con entradas y salidas fp32, mientras que el decodificador fusionado se cuantiza a 4 bits por bloques de 32 con esquema simétrico. Esta combinación reduce drásticamente el tamaño del decodificador, que es el componente que más pesa en la generación autoregresiva, y permite ejecutar el modelo en WebGPU dentro del navegador. El proceso es reproducible mediante el directorio `tools/convert-whisper/` del repositorio de SubtitleKing.

## Capacidades

- Reconocimiento automático de habla en letón, incluyendo audio de radiodifusión y habla espontánea de Common Voice.
- Transcripción con marcas de tiempo a nivel de segmento (capacidad heredada de Whisper).
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada, con concatenación de segmentos para audio más largo.
- Inferencia en navegador mediante Transformers.js y WebGPU, sin necesidad de backend.
- Ejecución con decodificador cuantizado a 4 bits, lo que reduce requisitos de memoria en cliente.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de entrada más allá del ASR, ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al letón según la etiqueta de idioma del repositorio; no se confirma comportamiento en otros idiomas.

## Casos de uso

- Subtitulado automático en navegador para contenido en letón: el modelo se ejecuta en WebGPU del cliente y genera subtítulos sin enviar audio a un servidor, lo que reduce costes de infraestructura y mejora la privacidad. Es el caso de uso principal declarado por el autor (producto SubtitleKing).
- Herramientas de accesibilidad para vídeo en letón: transcripción en tiempo casi real de reuniones, clases o retransmisiones, integrada en una aplicación web que aprovecha la ventana de 30 segundos por segmento de Whisper.
- Archivado y búsqueda de medios audiovisuales: transcripción por lotes de un corpus de radiodifusión en letón para indexar y permitir búsqueda textual sobre el archivo, aprovechando el ajuste fino sobre LATE-Media.
- Generación de subtítulos para plataformas de vídeo bajo demanda: el modelo puede procesar pistas de audio en letón y producir ficheros de subtítulos con marcas temporales, integrándose en un pipeline de postproducción.
- Investigación en ASR de bajos recursos: servir como referencia reproducible en ONNX para comparar técnicas de cuantización (fp16 frente a 4 bits) en un idioma con pocos recursos, sin necesidad de infraestructura GPU dedicada.
- Aplicaciones educativas offline: transcripción de material didáctico en letón en dispositivos de consumo, gracias a la reducción de memoria del decodificador cuantizado y a la ejecución en WebGPU.
- Prototipado rápido de interfaces de voz en letón: desarrolladores que necesitan un ASR funcional en el navegador pueden desplegar este repositorio con Transformers.js sin montar un servicio de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de WER, CER ni comparaciones con otros modelos, y la información de búsqueda no aporta resultados del checkpoint base. No se deben asumir cifras de rendimiento sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,1 GB; el encoder fp16 y el decodificador 4-bit permiten estimar un uso de memoria en el rango de 1,5 a 2,5 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes de Intel, AMD o Apple Silicon, y discretas de consumo). Para servidor, se puede usar el mismo ONNX con ONNX Runtime en GPU, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con al menos 3-4 GB de memoria disponible para el navegador, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: Transformers.js con WebGPU (objetivo principal), ONNX Runtime (CPU o GPU), y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles. Dependen del hardware del cliente y del navegador; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| subtitleking/ailab-whisper-large-v3-lv-onnx | no disponible (base Whisper large-v3) | ventanas de 30 s | letón | Apache-2.0 | ONNX | Hugging Face |
| openai/whisper-large-v3 | 1.550 M (dato de referencia externa, no confirmado en la informacion proporcionada) | ventanas de 30 s | multilingüe (99 idiomas) | Apache-2.0 | safetensors, PyTorch | Hugging Face |
| AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19 | no disponible | ventanas de 30 s | letón | Apache-2.0 | safetensors (formato fuente) | Hugging Face |
| subtitleking/ivrit-whisper-large-v3-turbo-onnx | no disponible (base Whisper large-v3-turbo) | ventanas de 30 s | hebreo | Apache-2.0 | ONNX | Hugging Face |

La comparativa más directa es con el checkpoint fuente de AiLab.lv, del que este repositorio solo cambia el formato y la cuantización. Frente a Whisper large-v3 original, la diferencia clave es la especialización en letón y el empaquetado ONNX para navegador, a costa de perder cobertura multilingüe. El repositorio hermano de hebreo de SubtitleKing sigue el mismo patrón de conversión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre Common Voice y un corpus de radiodifusión, puede presentar sesgo hacia registro formal y voces de medios, con peor rendimiento en habla dialectal o con acento marcado.
- Riesgo de alucinación: Whisper es conocido por generar texto plausible en segmentos con silencio o ruido; el ajuste fino no elimina este comportamiento y no se documenta mitigación específica.
- Limitaciones de idioma: el modelo está etiquetado exclusivamente para letón; su comportamiento en otros idiomas no está validado y probablemente sea deficiente.
- Limitaciones de contexto: la ventana de audio de Whisper es de 30 segundos por pasada; audios más largos requieren segmentación y pueden perder coherencia entre segmentos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe citar el trabajo de AiLab.lv (IMCS, Universidad de Letonia) y conservar los avisos de licencia; el autor del repositorio pide explícitamente citar el modelo original.
- Caveat para producción: el decodificador está cuantizado a 4 bits, lo que puede degradar la precisión de transcripción frente al checkpoint en fp16; no se han publicado evaluaciones comparativas. Además, la inferencia en WebGPU depende del soporte del navegador y del hardware del cliente, con variabilidad de latencia no medida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/ailab-whisper-large-v3-lv-onnx
- Modelo base: https://huggingface.co/AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19
- AiLab.lv (IMCS, Universidad de Letonia): https://ailab.lv
- Transformers.js: https://github.com/huggingface/transformers.js
- Whisper large-v3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
- Repositorio hermano de hebreo (mismo patrón de conversión): https://huggingface.co/subtitleking/ivrit-whisper-large-v3-turbo-onnx
