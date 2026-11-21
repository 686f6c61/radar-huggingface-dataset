# ukrbublik/opus-mt-es-ru-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-ru-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-es-ru`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de español a ruso, sin pivotar por el inglés, y está pensado para ejecutarse en dispositivos móviles dentro del runtime OPUS de la aplicación Android Subtitle Tap.

La aportación de este repositorio no es el entrenamiento, sino el formato y una salida adicional: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values), los cuantiza dinámicamente a INT8 con onnxruntime (QInt8, per-tensor) y añade al decoder una salida `alignment_shift_l2` con las probabilidades de atención encoder del layer 2. Esa salida permite obtener alineamientos palabra a palabra útiles para subtitulado, sin modificar los pesos ni el proceso de decodificación.

Arquitectura Marian (transformer encoder-decoder), licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB. Es relevante para quien necesite traducción es→ru de bajo coste, offline y con alineamiento de tokens, más que para traducción de alta calidad en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible (modelo base de tamaño compacto; repo de 0,1 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime; export ONNX opset 17 |
| Idiomas soportados | español (es) → ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, la arquitectura transformer encoder-decoder que el proyecto OPUS-MT usa para sus pares de traducción. Los pesos originales fueron entrenados por el grupo de la Universidad de Helsinki sobre datos OPUS (corpus paralelos multilingües) y publicados bajo Apache 2.0. La revisión concreta del modelo base es `e49a0dcda47b05820133446d8db89d3b5f4dec5a`.

Este repositorio solo cambia el formato: exporta el modelo con optimum a ONNX (opset 17, sin past key/values, es decir, decodificación sin caché de atención) y aplica cuantización dinámica INT8 con onnxruntime. Además, el decoder incorpora una salida `alignment_shift_l2` que expone las probabilidades de atención encoder del layer 2 mediante una operación Identity sobre un nodo existente, de modo que los pesos y la decodificación quedan intactos. El archivo `alignment.json` actúa como recibo que vincula esa salida de alineamiento con el SHA-256 del decoder. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Traducción directa español → ruso, sin pivotar por el inglés.
- Ejecución en dispositivo (on-device) mediante ONNX Runtime con pesos INT8.
- Salida de alineamiento de atención (`alignment_shift_l2`, layer 2) para obtener correspondencias token a token entre origen y destino.
- Tokenizador empaquetado en `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, más las cadenas de tokens destino).
- Integración pensada para subtitulado (app Subtitle Tap), donde el alineamiento facilita el sincronizado de subtítulos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Subtitulado en dispositivos Android: el modelo y su runtime están diseñados para la app Subtitle Tap; la salida de alineamiento permite asociar cada token traducido con su contraparte en el texto original para temporizar subtítulos.
- Traducción offline en móviles de gama media: al ser INT8 y ONNX, el modelo cabe en un repositorio de 0,1 GB y puede ejecutarse sin conexión, útil en aplicaciones de viaje o entornos sin red.
- Traducción de documentación técnica es→ru en pipelines ligeros: el bajo coste computacional permite procesar lotes de texto en CPU sin GPU dedicada.
- Preprocesado de datos multilingües: generar versiones en ruso de corpus en español para tareas posteriores (búsqueda, clasificación) donde no se requiere calidad de traducción humana.
- Prototipado de sistemas de traducción con alineamiento: la salida `alignment_shift_l2` sirve para experimentar con word alignment y evaluación de correspondencias léxicas sin entrenar un modelo propio.
- Integración en aplicaciones de escritorio o web vía ONNX Runtime: el formato ONNX permite desplegar el modelo en Windows, macOS, Linux o WebAssembly con el mismo artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB en INT8, por lo que la inferencia requiere muy poca memoria (del orden de cientos de MB incluyendo runtime y buffers).
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y ejecución on-device.
- Cabe en GPU consumer: sí, con cualquier GPU moderna; también en CPU y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (runtime objetivo del autor); al ser ONNX opset 17, puede ejecutarse en onnxruntime para Android, iOS, escritorio y servidor. No se distribuyen pesos en safetensors ni GGUF en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-es-ru-int8-shift-att` | no disponible (INT8, repo 0,1 GB) | no disponible | es → ru | Apache 2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-es-ru` | no disponible | no disponible | es → ru | Apache 2.0 | PyTorch/safetensors |
| `Helsinki-NLP/opus-mt-en-ru` | no disponible | no disponible | en → ru | Apache 2.0 | PyTorch/safetensors |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineamiento añadida; la calidad de traducción debería ser equivalente, ya que los pesos no se modifican. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre la dirección es → ru; no traduce en sentido inverso ni a otros idiomas.
- El decoder se exporta sin past key/values, lo que implica decodificación sin caché de atención y puede penalizar la velocidad en secuencias largas.
- La cuantización INT8 dinámica puede introducir una ligera degradación de calidad frente al modelo en punto flotante; no se documenta su magnitud.
- Riesgo de alucinación y errores en terminología especializada, nombres propios y expresiones idiomáticas, inherente a los modelos NMT compactos.
- No hay datos publicados sobre sesgos específicos del par es→ru.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- La fecha de creación indicada (2026-11-20) resulta anómala y conviene verificarla antes de tomar decisiones de adopción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-es-ru-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-ru
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
