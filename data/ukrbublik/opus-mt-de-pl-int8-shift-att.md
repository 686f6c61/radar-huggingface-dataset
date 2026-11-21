# ukrbublik/opus-mt-de-pl-int8-shift-att

## Resumen

Este repositorio contiene una conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-de-pl, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de alemán a polaco, sin pivotar a través del inglés, y está pensado para ejecutarse en dispositivos móviles dentro de la aplicación Android Subtitle Tap mediante un runtime OPUS propio.

La conversión la firma el usuario ukrbublik y mantiene intactos los pesos originales: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 (QInt8, per-tensor) mediante onnxruntime. Además, el decodificador expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens entre origen y destino (por ejemplo, para subtítulos).

Se trata de un modelo Marian de tamaño base, con licencia Apache 2.0 y un repositorio de apenas 0,1 GB, lo que lo hace adecuado para inferencia en CPU y entornos con recursos muy limitados. No es un modelo generativo de propósito general: es un traductor especializado de un único par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre exportacion ONNX |
| Idiomas soportados | aleman (de), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`); tokenizer en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, la arquitectura transformer encoder-decoder utilizada por Helsinki-NLP para la familia OPUS-MT. Los pesos originales fueron entrenados por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS, según se indica en la atribución de la model card. No se especifican en la información disponible el número de parámetros, el volumen de tokens de entrenamiento ni la composición exacta del dataset.

La contribución de este repositorio es exclusivamente de formato y despliegue: exportación con optimum a ONNX (opset 17, sin past key/values), cuantización dinámica INT8 con onnxruntime y adición de una salida de alineación. Esta salida, `alignment_shift_l2`, es una Identity sobre un nodo ya existente que expone las probabilidades de atención encoder-decoder de la capa 2; los pesos y el proceso de decodificación no se modifican. El repositorio incluye además un fichero `alignment.json` que vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción directa alemán a polaco, sin pivotar por inglés.
- Traducción de texto plano por secuencias, orientada a frases u oraciones.
- Salida de alineación token a token mediante `alignment_shift_l2` (atención de la capa 2 del decodificador), útil para correspondencias entre origen y destino.
- Inferencia en CPU mediante ONNX Runtime con pesos INT8, sin necesidad de GPU.
- Tokenizador empaquetado en `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado en dispositivos móviles: la aplicación Subtitle Tap usa este modelo para traducir subtítulos de alemán a polaco en el propio dispositivo, sin conexión, gracias al tamaño reducido (0,1 GB) y a la inferencia INT8 en CPU.
- Traducción offline en Android: cualquier app que necesite traducir texto de alemán a polaco sin enviar datos a un servidor puede integrar los ficheros ONNX con ONNX Runtime Mobile.
- Alineación de pares de frases: la salida `alignment_shift_l2` permite construir correspondencias aproximadas entre tokens alemanes y polacos, útil para herramientas de estudio de idiomas o para resaltar traducciones palabra a palabra.
- Preprocesado de corpus multilingües: traducción por lotes de documentos alemanes a polaco en pipelines de datos donde el coste por token de un modelo grande sería prohibitivo.
- Prototipado rápido en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime, sirve para validar flujos de traducción en portátiles, contenedores pequeños o dispositivos embebidos.
- Traducción de contenido editorial de bajo riesgo: notas, correos o documentación interna donde se acepta una calidad de traducción neuronal de tamaño base y se prioriza la privacidad y el coste cero por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo está pensado para CPU. En GPU, el peso INT8 del repositorio (0,1 GB) permite inferencia con muy poca memoria, aunque no se publican cifras exactas.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría ejecutarlo, pero el modelo está optimizado para CPU.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Mobile para Android), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`. No se proporcionan pesos en formato GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-pl-int8-shift-att | no disponible (Marian base) | no disponible | de→pl | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-de-pl | no disponible (Marian base) | no disponible | de→pl | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-de-en | no disponible (Marian base) | no disponible | de→en | Apache 2.0 | safetensors/PyTorch |

La comparación relevante es con el modelo original Helsinki-NLP/opus-mt-de-pl: mismos pesos, misma licencia y mismo par de idiomas, pero este repositorio añade cuantización INT8, exportación ONNX y la salida de alineación, a costa de perder la integración directa con transformers. Frente a otros modelos OPUS-MT de otros pares de idiomas, la diferencia principal es el par lingüístico y el formato de distribución.

## Limitaciones y advertencias

- Modelo especializado en un único par de idiomas (alemán a polaco); no traduce otras combinaciones ni realiza tareas generativas generales.
- Calidad limitada por el tamaño base de Marian y por los datos OPUS; no se han publicado evaluaciones de calidad (BLEU, COMET) en este repositorio.
- Riesgo de alucinación y de errores de traducción en frases largas, dominios especializados o texto con jerga; no dispone de mecanismos de verificación.
- Longitud de contexto no documentada; no se garantiza el comportamiento con secuencias largas.
- La salida de alineación es una aproximación basada en atención de una capa concreta, no una alineación word-level validada.
- El tokenizador se distribuye en un formato propio (`tokenizer_runtime.json`) pensado para el runtime de la app; no es directamente compatible con pipelines estándar de transformers sin trabajo adicional.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a Helsinki-NLP y citar el trabajo de Tiedemann y Thottingal (2020) según indica la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera de la aplicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-pl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-pl
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
