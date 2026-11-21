# ukrbublik/opus-mt-ru-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-ru-fr-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-ru-fr`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Lo publica el usuario ukrbublik con el objetivo concreto de integrarlo en el runtime on-device de la aplicacion Android Subtitle Tap, que realiza traduccion directa de ruso a frances sin pivotar por el ingles.

Se trata de un modelo transformer encoder-decoder de tipo Marian, entrenado sobre datos paralelos del corpus OPUS. La conversion mantiene los pesos y el proceso de decodificacion originales, y solo cambia el formato (exportacion ONNX con opset 17) y la precision (cuantizacion dinamica INT8 de onnxruntime, QInt8 por tensor). Ademas, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atencion encoder-decoder de la capa 2, pensada para alinear subtitulos.

Su relevancia es practica mas que de investigacion: demuestra como empaquetar un modelo OPUS-MT pequeno para inferencia local en dispositivos moviles, con tokenizador SentencePiece serializado en JSON y un fichero de recibo que vincula la salida de alineamiento al hash SHA-256 del decoder. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ruso (ru) como origen, frances (fr) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OPUS-MT: un transformer encoder-decoder de tipo Marian, el mismo esquema que emplea la familia `Helsinki-NLP/opus-mt-*`. El modelo original fue entrenado por el grupo de investigacion de la Universidad de Helsinki sobre datos paralelos del corpus OPUS, segun se describe en la publicacion de Tiedemann y Thottingal (EAMT 2020). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La conversion realizada por ukrbublik no modifica los pesos ni la logica de decodificacion. El export a ONNX se hace con optimum (opset 17, sin past key/values), seguido de una cuantizacion dinamica INT8 por tensor con onnxruntime. La innovacion tecnica destacable es la exposicion de `alignment_shift_l2`, una salida que replica (mediante una Identity sobre un nodo existente) las probabilidades de atencion encoder-decoder de la capa 2 del decoder, lo que permite obtener alineamientos palabra a palabra sin alterar el comportamiento del modelo. El tokenizador se serializa en `tokenizer_runtime.json`, mapeando las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario.

## Capacidades

- Traduccion automatica directa de ruso a frances, sin pivot intermedio por ingles.
- Generacion de texto condicionada a la secuencia de entrada en el par de idiomas ru-fr.
- Salida de alineamiento de atencion (`alignment_shift_l2`) para alinear tokens origen y destino, util en subtitulado.
- Ejecucion on-device mediante onnxruntime, con pesos cuantizados a INT8.
- Tokenizacion SentencePiece empaquetada en JSON para su uso en runtimes ligeros.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Subtitulado automatico en Android: la salida `alignment_shift_l2` permite alinear los subtitulos rusos con su traduccion francesa, y el formato ONNX INT8 posibilita la inferencia en el propio dispositivo dentro de la app Subtitle Tap.
- Traduccion offline en movilidad: al ejecutarse con onnxruntime y pesos INT8, el modelo puede desplegarse sin conexion en telefonos, util para viajeros o entornos con conectividad limitada.
- Procesamiento por lotes de documentos ru-fr: integrable en pipelines de traduccion de texto plano o ficheros de subtitulos (SRT, VTT) donde se requiera una traduccion directa sin pivot.
- Preprocesado para analisis de contenido en frances: traduccion de textos rusos a frances antes de tareas de clasificacion, indexacion o busqueda en ese idioma.
- Prototipado de sistemas de traduccion ligeros: sirve como referencia para exportar y cuantizar modelos OPUS-MT a ONNX en otros pares de idiomas.
- Investigacion en alineamiento de traduccion: la exposicion de las probabilidades de atencion de la capa 2 facilita experimentos sobre alineacion lexica sin modificar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa aproximadamente 0,1 GB, por lo que la huella en memoria es muy reducida tras la cuantizacion INT8.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU y dispositivos moviles mediante onnxruntime.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna e incluso en hardware de gama baja, dado el tamano reducido del repositorio.
- Opciones de despliegue: onnxruntime (runtime objetivo declarado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ru-fr-int8-shift-att | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Conversion con salida de alineamiento, orientada a on-device |
| Helsinki-NLP/opus-mt-ru-fr | no disponible | no disponible | safetensors/PyTorch | Apache 2.0 | Modelo original sin cuantizar, sin salida de alineamiento |
| Otros modelos OPUS-MT ru-fr | no disponible | no disponible | variable | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo cubre el par de idiomas ruso-frances; no admite otros idiomas ni traduccion inversa.
- Al ser una conversion del modelo OPUS-MT original, hereda sus sesgos y errores de traduccion, incluidos posibles sesgos de genero o culturales presentes en los datos OPUS.
- Riesgo de alucinacion y de traducciones incorrectas en frases ambiguas, terminologia especializada o texto con ruido, como en cualquier modelo neuronal de traduccion.
- La cuantizacion INT8 puede introducir una ligera perdida de calidad frente al modelo original en precision completa; no se documenta la magnitud de esa degradacion.
- No se dispone de informacion sobre la longitud maxima de secuencia soportada ni sobre el comportamiento con entradas muy largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribucion a los autores originales (Universidad de Helsinki, OPUS-MT) segun indica la model card.
- El repositorio no incluye pesos en formato PyTorch ni GGUF; su uso esta ligado al runtime ONNX y al tokenizador JSON incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ru-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ru-fr
- Publicacion de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
