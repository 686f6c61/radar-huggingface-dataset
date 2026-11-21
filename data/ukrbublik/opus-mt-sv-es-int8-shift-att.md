# ukrbublik/opus-mt-sv-es-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-sv-es-int8-shift-att` es una conversión a formato ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-sv-es`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Se trata de un modelo Marian de traducción directa sueco→español, sin pivote intermedio por inglés, pensado para su ejecución en dispositivos Android dentro de la aplicación Subtitle Tap.

La aportación de este repositorio no es un nuevo entrenamiento, sino un cambio de formato: exportación a ONNX (opset 17) y cuantización dinámica INT8 con onnxruntime, además de una modificación mínima que expone como salida adicional las probabilidades de atención encoder-decoder de la capa 2 (`alignment_shift_l2`), útil para alineación de subtítulos. Los pesos y el proceso de decodificación permanecen inalterados respecto al modelo original.

Su relevancia es práctica: ofrece un artefacto ligero (0,1 GB) listo para inferencia en el borde (edge), con licencia Apache 2.0, para un par de idiomas concreto y con una salida de alineación que facilita tareas de subtitulado sincronizado. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no publica benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre export ONNX; pesos originales del modelo base en safetensors |
| Idiomas soportados | sueco (sv) → español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values; tokenizer en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq característico de la familia OPUS-MT, entrenado por la Universidad de Helsinki sobre datos del corpus OPUS. El modelo base `Helsinki-NLP/opus-mt-sv-es` (revisión `8a373cbc6c02d01dc04f14545ec548b91dbecfb4`) realiza traducción directa sueco→español sin pivote por inglés.

Este repositorio concreto no aporta entrenamiento nuevo: aplica una exportación con optimum a ONNX (opset 17, sin past key/values) y una cuantización dinámica INT8 con onnxruntime. La única modificación estructural es la exposición de `alignment_shift_l2`, una identidad sobre un nodo existente que devuelve las probabilidades de atención encoder-decoder de la capa 2; según el autor, los pesos y la decodificación no cambian. Se incluye además `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción automática directa sueco→español, sin pivote intermedio por inglés.
- Salida adicional de alineación (`alignment_shift_l2`): probabilidades de atención encoder-decoder de la capa 2, orientadas a alinear tokens origen-destino.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` (piezas, puntuaciones y mapeo a ids de vocabulario, más las cadenas de tokens destino).
- Inferencia en dispositivo (on-device) mediante onnxruntime, con encoder y decoder cuantizados por separado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Subtitulado automático sueco→español en Android: el modelo está empaquetado para el runtime OPUS de la app Subtitle Tap y su salida de alineación de la capa 2 permite sincronizar los subtítulos traducidos con los segmentos originales.
- Traducción en el borde sin conexión: al ser un artefacto ONNX INT8 de 0,1 GB, puede ejecutarse localmente en un dispositivo móvil sin enviar texto a un servidor, lo que reduce latencia y mejora la privacidad.
- Preprocesado de corpus suecos: traducción por lotes de documentos o transcripciones al español para su posterior análisis, aprovechando la decodificación determinista del modelo.
- Alineación de pares de frases: usar `alignment_shift_l2` para construir correspondencias a nivel de token entre texto sueco y español, útil en memorias de traducción o en evaluación de calidad.
- Integración en pipelines de subtitulado profesional: como paso intermedio en herramientas que generan pistas SRT/VTT bilingües a partir de audio sueco transcrito.
- Prototipado de traducción en aplicaciones web o de escritorio: el formato ONNX permite desplegar el modelo con onnxruntime en entornos sin GPU dedicada, para pruebas de concepto de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 0,1 GB, coherente con un modelo Marian pequeño cuantizado a INT8.
- GPU recomendadas: no especificadas por el autor; al ser un modelo orientado a on-device, está pensado para CPU y aceleradores móviles mediante onnxruntime.
- ¿Cabe en GPU consumer? Sí, por tamaño (0,1 GB) es compatible con cualquier GPU consumer; no se detallan requisitos mínimos.
- Opciones de despliegue: onnxruntime (formato nativo del artefacto); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-sv-es-int8-shift-att | no disponible | no disponible | sv→es | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-sv-es (base) | no disponible | no disponible | sv→es | Apache 2.0 | safetensors |
| Helsinki-NLP/opus-mt-sv-en | no disponible | no disponible | sv→en | Apache 2.0 | safetensors |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en→es | Apache 2.0 | safetensors |

Los tres modelos de la familia OPUS-MT comparten arquitectura Marian y licencia, pero este repositorio se distingue por el formato ONNX INT8 y la salida de alineación. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo cubre la dirección sueco→español; no es un modelo multilingüe general.
- Al derivar de OPUS-MT, hereda los sesgos y limitaciones de sus datos de entrenamiento (corpus OPUS), no documentados en este repositorio.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados o con terminología poco representada en OPUS.
- No se especifica la longitud máxima de contexto; conviene validar el comportamiento con frases largas antes de usarlo en producción.
- La cuantización INT8 puede degradar ligeramente la calidad respecto al modelo base en fp32; el autor no publica métricas de esta degradación.
- El repositorio tiene cero descargas y cero likes, y no incluye benchmarks ni validación externa: trátese como un artefacto experimental.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-sv-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-es
- Paper de referencia OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no se proporciona URL en la información disponible.
