# ukrbublik/opus-mt-ru-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-ru-uk-int8-shift-att` es una conversion del modelo de traduccion automatica `Helsinki-NLP/opus-mt-ru-uk` (OPUS-MT) al formato ONNX con cuantizacion dinamica INT8, realizada por el desarrollador ukrbublik para su uso en la aplicacion Android Subtitle Tap. El modelo traduce directamente de ruso a ucraniano, sin pivotar a traves del ingles, y esta pensado para inferencia en dispositivo (on-device) mediante un runtime OPUS propio de la aplicacion.

La arquitectura subyacente es Marian (transformer encoder-decoder), la empleada por la familia OPUS-MT del grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki, entrenada sobre datos de OPUS. La conversion mantiene los pesos originales y solo altera el formato de fichero (exportacion ONNX con opset 17 y cuantizacion INT8), ademas de anadir una salida auxiliar de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2 del decoder.

El interes de este repositorio es acotado pero concreto: ofrece un par de ficheros ONNX cuantizados de unos 0,1 GB en total, con tokenizer serializado en JSON y un recibo de integridad (`alignment.json`), lo que facilita el despliegue de traduccion ru-uk en entornos con recursos limitados y sin conexion. No esta pensado como modelo de proposito general ni como sustituto de modelos multilingues grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | ruso (ru) y ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |
| Modelo base | Helsinki-NLP/opus-mt-ru-uk (revision `e1ed571755f7fd90287b6d02e5bac0adcabea484`) |
| Tamano del repositorio | 0,1 GB |
| Opset | 17 |
| Salidas adicionales | `alignment_shift_l2` (probabilidades de atencion encoder-decoder de la capa 2) |

## Arquitectura y entrenamiento

El modelo es una conversion del OPUS-MT ru-uk original, que sigue la arquitectura Marian: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado por el grupo de la Universidad de Helsinki sobre corpus paralelos de OPUS. El autor de esta conversion no ha reentrenado ni modificado los pesos; unicamente ha exportado el modelo a ONNX (opset 17, sin past key/values) y ha aplicado cuantizacion dinamica INT8 con onnxruntime (QInt8, per-tensor).

La innovacion tecnica de esta version es la salida `alignment_shift_l2`: el decoder expone las probabilidades de atencion encoder-decoder de su capa 2 como una identidad de un nodo existente, sin alterar pesos ni decodificacion. Esto permite obtener alineaciones palabra a palabra utiles para subtitulado o traduccion asistida. Ademas, se incluye `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario y cadenas de tokens destino, y `alignment.json`, un recibo que vincula la salida de alineacion con el hash SHA-256 del decoder. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Traduccion automatica directa de ruso a ucraniano, sin pivotar por el ingles.
- Generacion de alineaciones de atencion encoder-decoder (salida `alignment_shift_l2`) para correspondencias palabra a palabra.
- Inferencia en dispositivo mediante ONNX Runtime con pesos cuantizados INT8.
- Tokenizer SentencePiece serializado para uso autonomo en el runtime.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue limitada exclusivamente al par ru-uk.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicacion Subtitle Tap usa el modelo para traducir subtitulos ru-uk en el propio dispositivo, sin conexion, gracias al bajo peso (0,1 GB) y a la cuantizacion INT8.
- Traduccion offline en dispositivos moviles: integrable en apps que necesiten traducir texto ru-uk sin enviar datos a un servidor, con el runtime OPUS y los ficheros ONNX.
- Alineacion palabra a palabra para herramientas de traduccion asistida: la salida `alignment_shift_l2` permite resaltar correspondencias entre el texto origen y el traducido en interfaces de revision.
- Procesamiento por lotes de documentos ru-uk en entornos con CPU: ONNX Runtime permite ejecutar el modelo en servidores modestos sin GPU.
- Traduccion en sistemas embebidos o de bajo consumo: el tamano reducido y la cuantizacion lo hacen viable en hardware con recursos limitados.
- Generacion de corpus paralelos alineados: combinando la traduccion con la salida de alineacion se pueden construir pares de frases alineadas para entrenamiento o evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de un modelo de 0,1 GB en INT8, la huella de memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en dispositivo (CPU/Android) mediante ONNX Runtime.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer, aunque no es su objetivo principal.
- Opciones de despliegue: ONNX Runtime (runtime OPUS de Subtitle Tap), con ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ru-uk-int8-shift-att | no disponible | no disponible | ru, uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-ru-uk | no disponible | no disponible | ru, uk | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT ru-uk | no disponible | no disponible | ru, uk | Apache 2.0 | variable |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre el par de idiomas ru-uk; no es un modelo multilingue.
- Al ser una conversion del OPUS-MT original, hereda sus sesgos y limitaciones de calidad, sin que se hayan documentado evaluaciones especificas en esta version.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados o textos con jerga, al no disponer de datos de evaluacion.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo original en FP32, aunque no se cuantifica en la informacion disponible.
- La salida de alineacion es una identidad de un nodo existente y no un mecanismo de alineacion entrenado especificamente; su fiabilidad no esta documentada.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion al grupo de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- No se han publicado resultados de benchmarks ni datos de latencia, por lo que la idoneidad en produccion debe validarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ru-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ru-uk
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): no disponible como enlace en la informacion proporcionada
- Repositorio del runtime OPUS de Subtitle Tap: no disponible en la informacion proporcionada
