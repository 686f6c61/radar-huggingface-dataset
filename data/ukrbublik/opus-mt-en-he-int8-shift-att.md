# ukrbublik/opus-mt-en-he-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-he-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-he`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de ingles a hebreo, sin pivotar a traves del ingles como lengua intermedia, y esta pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La relevancia de esta ficha no reside en una innovacion arquitectonica, sino en el empaquetado: se han exportado el encoder y el decoder a ONNX (opset 17, sin past key/values) y se han cuantizado dinamicamente a INT8 con onnxruntime (QInt8, per-tensor). Ademas, el decoder expone una salida adicional, `alignment_shift_l2`, que contiene las probabilidades de atencion encoder del layer 2, util para alinear palabras entre origen y destino en subtitulos.

El repositorio ocupa aproximadamente 0,1 GB e incluye los ficheros ONNX cuantizados, un `tokenizer_runtime.json` con las piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, y un `alignment.json` que vincula la salida de alineamiento con el SHA-256 del decoder. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (ingles), he (hebreo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, la arquitectura transformer encoder-decoder empleada por la familia OPUS-MT de Helsinki-NLP. El modelo original fue entrenado sobre datos OPUS (corpus paralelos de traduccion) y liberado bajo Apache 2.0. Esta version concreta parte de la revision `b3df900afbb13bc343b0d28a03ac6f7990091f54` del modelo base.

La conversion realizada por `ukrbublik` consiste en una exportacion con optimum a ONNX (opset 17, sin past key/values, es decir, sin cache de decodificacion) seguida de una cuantizacion dinamica INT8 con onnxruntime. El decoder incorpora una salida adicional `alignment_shift_l2` que es una Identity sobre un nodo existente: expone las probabilidades de atencion encoder de la capa 2 sin modificar pesos ni el proceso de decodificacion. No se documentan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; al tratarse de un modelo OPUS-MT, cabe esperar entrenamiento supervisado sobre corpus paralelos, pero no se confirma en la model card.

## Capacidades

- Traduccion automatica directa de ingles a hebreo, sin pivotar por una lengua intermedia.
- Generacion de alineamientos a nivel de token mediante la salida `alignment_shift_l2` (probabilidades de atencion encoder de la capa 2), util para correspondencias palabra a palabra.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` con piezas, puntuaciones y mapeo a ids de vocabulario.
- Inferencia en dispositivo mediante onnxruntime con pesos INT8, orientada a entornos con recursos limitados.
- Integridad verificable: `alignment.json` vincula la salida de alineamiento al SHA-256 del decoder.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado automatico en Android: el modelo esta disenado para el runtime OPUS on-device de la app Subtitle Tap, traduciendo subtitulos de ingles a hebreo sin conexion y sin enviar texto a servidores externos.
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite construir correspondencias entre tokens origen y destino, util para resaltar la palabra traducida o para sincronizar pistas de subtitulos.
- Traduccion offline en dispositivos de gama baja: al estar cuantizado a INT8 y exportado a ONNX, el modelo puede ejecutarse en moviles sin GPU dedicada mediante onnxruntime.
- Procesamiento por lotes de documentos en ingles hacia hebreo: el formato ONNX permite integrarlo en pipelines de servidor con onnxruntime para traduccion masiva de contenido.
- Verificacion de integridad en produccion: el `alignment.json` con el SHA-256 del decoder permite auditar que los pesos desplegados son los esperados en entornos regulados.
- Prototipado de sistemas de traduccion embebidos: sirve como referencia de como exportar y cuantizar un modelo Marian de OPUS-MT para despliegue en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, lo que sugiere un modelo pequeno apto para CPU y dispositivos moviles.
- GPU recomendadas: no se especifican; el uso previsto es on-device con onnxruntime, por lo que no requiere GPU.
- Compatibilidad con GPU de consumo: no se documenta, pero el tamano y la cuantizacion INT8 hacen plausible su ejecucion en CPU y en GPUs integradas.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este empaquetado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-he-int8-shift-att | no disponible | no disponible | en→he | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-he | no disponible | no disponible | en→he | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-mul | no disponible | no disponible | en→multiples | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-tc-big-en-he | no disponible | no disponible | en→he | Apache 2.0 | safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida adicional de alineamiento; el rendimiento de traduccion deberia ser equivalente al del modelo original, aunque no se aportan metricas comparativas (BLEU, chrF) en la informacion disponible.

## Limitaciones y advertencias

- Solo cubre la direccion ingles→hebreo; no traduce en sentido inverso ni a otras lenguas.
- Al ser una cuantizacion INT8, puede existir una ligera perdida de calidad frente al modelo en punto flotante original, no cuantificada en la informacion disponible.
- El decoder se exporta sin past key/values, lo que implica recalcular el contexto en cada paso y puede aumentar la latencia en secuencias largas.
- Riesgo de alucinacion y de traducciones incorrectas inherente a los modelos NMT, especialmente en dominios especializados o texto con ruido.
- No se documentan sesgos especificos ni evaluaciones de robustez en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a los autores originales (Universidad de Helsinki, OPUS-MT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se dispone de informacion sobre el contexto maximo soportado ni sobre el rendimiento en frases muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-he-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-he
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace directo en la informacion proporcionada
- Repositorio OPUS-MT: no disponible en la informacion proporcionada
- Aplicacion Subtitle Tap: no disponible como enlace en la informacion proporcionada
