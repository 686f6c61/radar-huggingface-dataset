# ukrbublik/opus-mt-es-it-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-it-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-es-it`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión, ukrbublik, la publica para el motor OPUS en dispositivo de la aplicación Android Subtitle Tap. El modelo traduce directamente de español a italiano, sin pivotar a través del inglés.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder específico para traducción, con un tamaño de repositorio de 0,1 GB (coherente con un modelo de traducción de pequeña escala cuantizado). La innovación de esta conversión es doble: por un lado, la exportación a ONNX con cuantización dinámica INT8 (QInt8, per-tensor) mediante onnxruntime; por otro, la exposición de una salida adicional `alignment_shift_l2` que devuelve las probabilidades de atención encoder del decodificador en la capa 2, útil para alinear tokens entre origen y destino.

El modelo es relevante para quienes necesitan traducción es→it en entornos con recursos limitados (móvil, edge) y quieren aprovechar las señales de alineación para tareas de subtitulado o presentación bilingüe. La licencia Apache 2.0 permite uso comercial. No obstante, se trata de una conversión de un modelo base de OPUS-MT, sin datos de benchmarks publicados en la información disponible y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX; el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | español (es), italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal. Los pesos originales fueron entrenados por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS, y publicados bajo licencia Apache 2.0. Esta conversión no modifica los pesos ni el proceso de decodificación: solo cambia el formato (exportación ONNX con optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor).

La particularidad técnica de esta versión es la salida `alignment_shift_l2`: el decodificador expone las probabilidades de atención encoder de la capa 2 como una identidad de un nodo existente, sin alterar pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, más las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción directa español → italiano, sin pivotar por inglés.
- Generación de alineaciones a nivel de atención encoder (capa 2) mediante la salida `alignment_shift_l2`, útil para correspondencias entre tokens origen y destino.
- Ejecución en dispositivo mediante ONNX Runtime con cuantización INT8, orientada a aplicaciones Android (Subtitle Tap).
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` para uso en runtime sin dependencias de la librería original.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par es→it.

## Casos de uso

- Subtitulado automático en dispositivo: la app Subtitle Tap puede traducir subtítulos de español a italiano en tiempo real sin conexión, gracias a la exportación ONNX INT8 y al tokenizador empaquetado.
- Presentación bilingüe alineada: la salida `alignment_shift_l2` permite mapear tokens origen y destino para resaltar correspondencias en interfaces de aprendizaje de idiomas o visores de subtítulos.
- Traducción en edge para aplicaciones móviles: el tamaño de 0,1 GB y la cuantización INT8 permiten desplegar el modelo en dispositivos con recursos limitados sin depender de la nube.
- Preprocesado de corpus es→it: utilizable para generar traducciones preliminares de documentos o memorias de traducción antes de revisión humana.
- Integración en pipelines de localización: al ser ONNX, puede ejecutarse con onnxruntime en servidores ligeros o contenedores sin GPU para traducir lotes de texto es→it.
- Investigación en alineación de atención: la exposición de las probabilidades de atención de la capa 2 facilita experimentos sobre interpretabilidad y alineación léxica en modelos Marian.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en memoria de cualquier GPU consumer y en CPU.
- GPU recomendadas: no se requieren; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) o incluso CPU es suficiente. No hay datos específicos de latencia ni throughput.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan otros formatos como GGUF, vLLM, llama.cpp o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-es-it-int8-shift-att | no disponible | no disponible | es→it | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-es-it (base) | no disponible | no disponible | es→it | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT es→it | no disponible | no disponible | es→it | Apache 2.0 | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de traducción de dominio general entrenado sobre OPUS; puede presentar sesgos presentes en los corpus paralelos utilizados.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados o con terminología técnica.
- Longitud de contexto no documentada; no se garantiza un comportamiento óptimo en textos largos.
- Solo cubre el par es→it; no soporta otros idiomas ni direccionalidad inversa.
- La salida de alineación es una identidad de un nodo existente; su utilidad depende de que el consumidor interprete correctamente las probabilidades de atención.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica el autor.
- El repositorio registra cero descargas y no cuenta con validación comunitaria; conviene evaluar la calidad de la conversión antes de usarla en producción.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-es-it-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-es-it-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-es-it](https://huggingface.co/Helsinki-NLP/opus-mt-es-it)
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
