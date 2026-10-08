# thanhtan2136/nghi-stt-v3-asr

## Resumen

El modelo nghi-stt-v3-asr es un sistema de reconocimiento automático del habla (ASR) offline para vietnamita, publicado por el usuario thanhtan2136 en HuggingFace bajo licencia Apache 2.0. Se trata de un transductor (encoder/decoder/joiner) basado en la arquitectura Zipformer2 en su variante no streaming, cuantizado a int8 y exportado a formato ONNX. Según la model card, los pesos originales fueron desarrollados por el equipo k2-fsa y este repositorio se limita a extraerlos del bundle WASM que utiliza la aplicación `nghitts.app/asr`.

El modelo está pensado para transcripción de audio completo (offline), no para streaming, y trabaja con muestras de 16000 Hz y características fbank de 80 dimensiones. El vocabulario consta de 2000 tokens. Su tamaño total es reducido (el encoder ronda los 70,8 MB en int8, el decoder 1,3 MB y el joiner 1,0 MB), lo que lo hace apto para despliegue en CPU, navegador o dispositivos con recursos limitados mediante la librería sherpa-onnx.

Su relevancia radica en cubrir un idioma con relativamente pocos recursos ASR open source como el vietnamita, con un modelo ligero y ejecutable en entornos edge. No se han publicado datos de entrenamiento, número de parámetros ni resultados de benchmarks en la información disponible, por lo que su evaluación debe basarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (non-streaming), transductor con encoder/decoder/joiner |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo offline, procesa el utterance completo) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (protobuf, ir_version 7, opset 13) |

Otras especificaciones declaradas: frecuencia de muestreo 16000 Hz, dimensión de características 80 (fbank), vocabulario de 2000 tokens, autor del modelo original k2-fsa, librería sherpa-onnx.

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2 no streaming, compuesto por tres componentes ONNX independientes: encoder (`transducer-encoder.onnx`), decoder (`transducer-decoder.onnx`) y joiner (`transducer-joiner.onnx`). La metadata del encoder indica `model_type = zipformer2`, `version = 1`, `model_author = k2-fsa` y el comentario `non-streaming zipformer2`. La entrada acústica se calcula como features fbank de 80 dimensiones a 16 kHz, y el decodificador emplea búsqueda greedy sobre un vocabulario de 2000 tokens.

Los archivos se extrajeron del bundle Emscripten `sherpa-onnx-wasm-main-vad-asr.data` generado por el `file_packager` de sherpa-onnx, por lo que no requirieron conversión: el payload ya estaba en formato ONNX protobuf. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura Zipformer2 y la cuantización int8. El repositorio incluye además `silero_vad.onnx`, un detector de actividad de voz de Silero utilizado presumiblemente para segmentar el audio antes de la transcripción.

## Capacidades

- Reconocimiento automático del habla en vietnamita en modo offline (no streaming).
- Transcripción de utterances completos a partir de audio a 16 kHz.
- Detección de actividad de voz (VAD) mediante el archivo `silero_vad.onnx` incluido en el repositorio.
- Cuantización int8, lo que reduce el consumo de memoria y facilita la inferencia en CPU y entornos embebidos.
- Compatible con el runtime sherpa-onnx (API Python, WASM y binarios nativos).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingües: el modelo declara únicamente vietnamita.
- No hay evidencia de capacidades multimodales (visión, audio más allá de ASR) ni de modo de razonamiento explícito.

## Casos de uso

- Transcripción por lotes de archivos de audio en vietnamita: el modelo procesa utterances completos en modo offline, por lo que encaja en pipelines que reciben ficheros WAV a 16 kHz y generan texto sin requisitos de tiempo real.
- Subtitulado y postproducción de vídeo en vietnamita: gracias al VAD incluido, se puede segmentar la pista de audio y transcribir cada segmento para generar subtítulos.
- Asistentes de voz para aplicaciones móviles o de escritorio en vietnamita: al ser un modelo int8 de tamaño reducido, puede empaquetarse junto a la aplicación sin depender de servicios en la nube.
- Despliegue en navegador mediante sherpa-onnx WASM: el origen del modelo (bundle WASM) demuestra que puede ejecutarse en el cliente, permitiendo transcripción local sin enviar audio a servidores.
- Análisis de llamadas de atención al cliente en vietnamita: transcripción posterior de conversaciones grabadas para extraer texto y alimentar sistemas de analítica.
- Dictado de notas de voz: integración en aplicaciones de toma de notas que convierten audio corto a texto en local.
- Preprocesado de datos para entrenamiento de modelos de lenguaje en vietnamita: transcripción masiva de corpus de audio a texto.
- Sistemas empotrados y dispositivos IoT con restricciones de memoria: la huella de aproximadamente 74 MB en int8 permite ejecución en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de pesos: aproximadamente 70,8 MB (encoder) + 1,3 MB (decoder) + 1,0 MB (joiner) + 0,64 MB (VAD) en int8, alrededor de 74 MB en total.
- VRAM estimada para inferencia: muy baja; el modelo cabe holgadamente en cualquier GPU consumer. No se dispone de cifra exacta publicada.
- GPU recomendadas: no se especifican; dada la cuantización int8 y el tamaño, cualquier GPU moderna (por ejemplo RTX 3060 o superior) es más que suficiente. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual. Incluso es viable su ejecución exclusiva en CPU.
- Opciones de despliegue: sherpa-onnx (Python, WASM y binarios), ONNX Runtime. No está pensado para vLLM ni TGI, que son servidores de modelos de lenguaje, no de ASR.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nghi-stt-v3-asr | Zipformer2 transducer non-streaming, int8 | no disponible | no disponible (offline) | apache-2.0 | HuggingFace (extraído de bundle WASM) |
| sherpa-onnx-zipformer-vi-int8-2025-10-16 | Zipformer transducer, int8 | no disponible | no disponible | no disponible | Referenciado pero con HTTP 404 en el endpoint del modelo |
| Otros modelos ASR vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma único: solo soporta vietnamita, según declara la propia model card.
- Cuantización int8: la precisión puede ser inferior a la de los pesos originales en punto flotante, aunque no se aportan datos comparativos.
- Modelo offline (no streaming): no es adecuado para transcripción en tiempo real con latencias muy bajas por fragmento.
- Procedencia: los pesos se extrajeron de un bundle WASM de sherpa-onnx y se publicaron en un repositorio de terceros, no en el repositorio oficial de k2-fsa; conviene verificar la integridad y el SHA de los archivos antes de usarlos en producción.
- Ausencia total de benchmarks y de datos de entrenamiento: no es posible estimar el WER ni el comportamiento en dominios concretos sin pruebas propias.
- Riesgo de alucinación inherente a los sistemas ASR: sustituciones, omisiones o segmentaciones erróneas, especialmente con audio ruidoso, acentos marcados o vocabulario fuera del dominio de entrenamiento.
- Vocabulario de 2000 tokens: puede limitar la cobertura de términos técnicos, nombres propios o palabras poco frecuentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se desconoce la licencia y las condiciones de los datos de entrenamiento originales del modelo de k2-fsa, lo que puede afectar a garantías legales en producción.
- El repositorio presenta 0 descargas y 0 likes, y fue creado el 2026-10-08, por lo que se trata de una publicación sin validación por parte de la comunidad.
- El dropdown de la aplicación de origen ofrece una opción `sherpa-onnx-zipformer-vi-int8-2025-10-16` que devuelve HTTP 404, de modo que el sitio recurre a `nghi-stt-v3`; esto sugiere que puede existir una versión alternativa no accesible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thanhtan2136/nghi-stt-v3-asr
- Repositorio sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Aplicación de origen citada en la model card: `nghitts.app/asr`
