# ukrbublik/opus-mt-fr-es-int8-shift-att

## Resumen

Conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-fr-es, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.) y empaquetado por el usuario ukrbublik para su uso en la aplicación Android Subtitle Tap. El modelo traduce directamente de francés a español, sin pivotar por el inglés, y está pensado para inferencia en dispositivo (on-device) mediante ONNX Runtime.

La arquitectura subyacente es un transformer encoder-decoder de tipo Marian, el framework de traducción neuronal de código abierto de Marian NMT. El repositorio incluye dos grafos ONNX separados (encoder y decoder) exportados con optimum en opset 17 y sin past key/values, cuantizados dinámicamente a INT8 por tensor (QInt8). El decoder expone además una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens origen-destino en tareas de subtitulado.

El interés práctico del modelo reside en su tamaño reducido (repositorio de 0,2 GB), su licencia Apache 2.0 y su formato ONNX preparado para ejecución local sin GPU, lo que lo convierte en una opción viable para traducción fr→es embebida en aplicaciones móviles o pipelines con requisitos estrictos de privacidad y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | fr (origen), es (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-fr-es es un transformer encoder-decoder de Marian, entrenado sobre datos paralelos del corpus OPUS (colección de corpus paralelos multilingües recopilados por el proyecto OPUS). La model card original cita el trabajo de Tiedemann y Thottingal (2020) sobre OPUS-MT. Los detalles concretos de número de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada.

La conversión de ukrbublik aplica una exportación optimum con opset 17 y sin past key/values (decoder sin caché de claves/valores, lo que implica recómputo completo en cada paso de decodificación), seguida de cuantización dinámica INT8 per-tensor con onnxruntime. La innovación destacable es la exposición de la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atención encoder-decoder de la capa 2 sin alterar pesos ni decodificación. El repositorio incluye además `alignment.json`, un recibo que vincula la salida de alineación al SHA-256 del decoder, y `tokenizer_runtime.json` con los pieces y scores del modelo SentencePiece mapeados a ids de vocabulario.

## Capacidades

- Traducción directa francés → español, sin pivotar por inglés.
- Generación de texto condicionada (seq2seq) en el par de idiomas fr-es.
- Salida de alineación token a token (`alignment_shift_l2`) para tareas de subtitulado y correspondencia origen-destino.
- Ejecución en dispositivo mediante ONNX Runtime, sin dependencia de GPU.
- Tokenización SentencePiece empaquetada en JSON para uso en runtime propio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al par fr-es.
- Capacidades especiales: alineación de atención (shift-att), cuantización INT8 para despliegue ligero.

## Casos de uso

- Subtitulado automático fr→es en dispositivos Android: el modelo está empaquetado específicamente para el runtime OPUS de la app Subtitle Tap, con grafos ONNX ligeros y tokenizer embebido, permitiendo traducir pistas de subtítulos francesas a español en local.
- Traducción de subtítulos con alineación temporal: la salida `alignment_shift_l2` permite mapear tokens origen a tokens destino, facilitando el ajuste de duraciones y sincronización en herramientas de subtitulado.
- Traducción offline en aplicaciones móviles: al no requerir GPU ni conexión de red, encaja en apps que deben funcionar sin conectividad y preservar la privacidad del texto traducido.
- Preprocesado de corpus fr-es en pipelines de NLP: útil para normalizar o traducir documentación, reseñas o textos de entrada antes de tareas downstream (clasificación, búsqueda, análisis).
- Traducción de contenido editorial y documentación técnica fr→es: para volúmenes moderados donde una solución local con licencia Apache 2.0 evita dependencias de APIs externas.
- Prototipado y evaluación de sistemas de traducción en edge: sirve como baseline cuantizado para comparar latencia y calidad frente a modelos mayores en entornos con recursos limitados.
- Integración en navegadores o entornos WebAssembly: el formato ONNX y la cuantización INT8 facilitan el despliegue en runtimes ligeros compatibles con ONNX Runtime Web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es del orden de cientos de MB en INT8.
- GPU recomendadas: innecesarias para el caso de uso previsto (on-device); cualquier GPU consumer moderna puede ejecutar los grafos ONNX, aunque no se dispone de datos de rendimiento por modelo.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del repositorio.
- Opciones de despliegue: ONNX Runtime (CPU, GPU o Web), con los grafos `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; el decoder no usa past key/values, lo que simplifica el grafo pero implica recómputo en cada paso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-es-int8-shift-att | no disponible | no disponible | fr→es | Apache 2.0 | ONNX INT8 | Alineación de atención expuesta; orientado a on-device |
| Helsinki-NLP/opus-mt-fr-es | no disponible | no disponible | fr→es | Apache 2.0 | safetensors/PyTorch (formato original) | Modelo base sin cuantizar; requiere framework de inferencia estándar |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en→es | Apache 2.0 | safetensors/PyTorch | Alternativa para inglés→español, no cubre fr→es |
| Helsinki-NLP/opus-mt-fr-en | no disponible | no disponible | fr→en | Apache 2.0 | safetensors/PyTorch | Requeriría pivot por inglés para llegar a español |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus OPUS, puede heredar sesgos de dominio y de género presentes en los datos paralelos.
- Riesgo de alucinación: inherente a los sistemas de traducción neuronal; no se han publicado evaluaciones específicas de fidelidad para esta conversión.
- Limitaciones de contexto e idioma: cubre exclusivamente fr→es; no soporta otros pares ni tareas generativas generales.
- El decoder exportado sin past key/values implica recómputo completo en cada paso, lo que puede penalizar la latencia en secuencias largas frente a versiones con caché.
- La cuantización INT8 puede degradar la calidad de traducción respecto al modelo base en FP32; no se proporcionan métricas comparativas (BLEU, chrF) en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a OPUS-MT y citar Tiedemann y Thottingal (2020).
- La salida de alineación es una identidad sobre un nodo existente; su fiabilidad depende del modelo base y no debe asumirse como alineación perfecta en todos los pares de tokens.
- El repositorio no incluye pesos en safetensors ni GGUF; quien necesite esos formatos debe partir del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-es
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como URL en la información proporcionada
- Repositorio OPUS-MT: no disponible como URL en la información proporcionada
- Documentación de optimum para exportación ONNX: no disponible como URL en la información proporcionada
