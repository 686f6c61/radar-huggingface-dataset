# ukrbublik/opus-mt-en-el-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-el-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-el`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a griego, sin pivotar por una lengua intermedia. Su propósito es el despliegue en dispositivos móviles: en concreto, el autor lo preparó para el runtime OPUS on-device de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos OPUS. Esta versión preserva los pesos originales y solo cambia el formato: exporta el modelo a ONNX (opset 17, sin past key/values) y lo cuantiza dinámicamente a INT8 con onnxruntime (QInt8, per-tensor). El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para inferencia local en hardware modesto.

La particularidad técnica de esta conversión es que el decoder emite además una salida `alignment_shift_l2`, que expone las probabilidades de atención encoder-decoder de la capa 2. Se trata de una Identity sobre un nodo existente: no altera pesos ni decodificación, pero permite obtener alineamientos palabra a palabra útiles para subtitulado y otras aplicaciones que necesitan sincronización entre origen y destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en) y griego (el) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-el` es un transformer encoder-decoder de la familia Marian NMT, entrenado por el grupo de investigación de la Universidad de Helsinki sobre corpus del proyecto OPUS (Tiedemann y Thottingal, 2020). La model card del repositorio convertido no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original y no se reproduce aquí.

La innovación de esta conversión es puramente de formato e instrumentación. Se exporta con optimum a ONNX en opset 17 sin past key/values (es decir, sin caché de decodificación), se aplica cuantización dinámica INT8 per-tensor con onnxruntime y se añade una salida adicional `alignment_shift_l2` que expone las probabilidades de atención encoder-decoder de la capa 2 del decoder. Esta salida es una Identity sobre un nodo ya existente, por lo que los pesos y el comportamiento de decodificación son idénticos a los del modelo original. El repositorio incluye además `tokenizer_runtime.json`, con las piezas y puntuaciones del modelo SentencePiece mapeadas a identificadores de vocabulario y las cadenas de tokens de destino, y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa inglés a griego, sin pivotar por una lengua intermedia.
- Generación de alineamientos de atención encoder-decoder por capa (salida `alignment_shift_l2`), útiles para correspondencias palabra a palabra.
- Inferencia on-device en Android mediante el runtime OPUS de la aplicación Subtitle Tap.
- Ejecución con onnxruntime, sin dependencia de frameworks de deep learning completos.
- Tokenización SentencePiece empaquetada en JSON para uso en runtime ligero.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Subtitulado automático en dispositivos móviles: la salida de alineamiento de la capa 2 permite sincronizar segmentos de origen y destino, y el tamaño reducido (0,1 GB) facilita la ejecución local en Android sin conexión.
- Traducción offline en aplicaciones Android: el formato ONNX INT8 y el tokenizador en JSON permiten integrar el modelo en un runtime propio sin servidor.
- Procesamiento por lotes de documentos en inglés hacia griego: onnxruntime ofrece ejecución en CPU y GPU con un grafo estático sin caché de decodificación, adecuado para pipelines de traducción masiva.
- Traducción integrada en herramientas de accesibilidad: por ejemplo, subtítulos en directo para contenido en inglés dirigido a hablantes de griego, con latencia baja al ejecutarse en el propio dispositivo.
- Investigación en alineamiento de traducción: la exposición de las probabilidades de atención permite estudiar correspondencias léxicas sin modificar el modelo ni reentrenar.
- Prototipado de servicios de traducción de bajo coste: al ser Apache 2.0 y ocupar 0,1 GB, sirve para validar flujos en→el antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no se especifican; al ser un modelo Marian de tamaño base cuantizado, funciona en CPU y en GPUs consumer como RTX 3060 o superiores, aunque no hay datos publicados de rendimiento.
- Cabe en GPU consumer: sí, por el tamaño del repositorio; no se dispone de cifras de consumo exacto.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio), runtime OPUS de Subtitle Tap; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-el-int8-shift-att | no disponible | no disponible | en→el | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-el (base) | no disponible | no disponible | en→el | Apache 2.0 | PyTorch/safetensors |
| Otros modelos OPUS-MT en→el | no disponible | no disponible | en→el | Apache 2.0 | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en la dirección inglés→griego; no soporta otros pares de idiomas.
- No se documentan evaluaciones de sesgo, alucinación ni calidad de traducción para esta conversión concreta.
- La cuantización INT8 dinámica puede introducir pérdida de calidad frente a los pesos originales en FP32; no se han publicado métricas que la cuantifiquen.
- La exportación sin past key/values implica recálculo completo en cada paso de decodificación, lo que puede penalizar la latencia en secuencias largas.
- La salida de alineamiento corresponde a la capa 2 y no necesariamente refleja la atención final del modelo; su utilidad debe validarse por caso de uso.
- Licencia Apache 2.0 permite uso comercial, pero se exige atribución a los autores originales (Tiedemann y Thottingal, 2020) y conservar los avisos de licencia.
- Repositorio con cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte documentado.
- No hay información sobre límites de longitud de contexto ni sobre el vocabulario efectivo más allá de los ficheros del tokenizador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-el-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-el
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS: no disponible en la información proporcionada.
