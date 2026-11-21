# ukrbublik/opus-mt-pl-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-pl-uk-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-pl-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente del polaco al ucraniano, sin pivotar por el ingles, y esta pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La aportacion de este repositorio no es el entrenamiento, sino el formato y una salida adicional: exportacion con optimum a opset 17, cuantizacion dinamica INT8 (QInt8, per-tensor) mediante onnxruntime, y la exposicion de `alignment_shift_l2`, que son las probabilidades de atencion encoder-decoder de la capa 2. Esta salida se implementa como una Identity sobre un nodo existente, de modo que los pesos y el proceso de decodificacion no cambian.

Es relevante para quien necesite traduccion pl→uk de baja latencia en dispositivos con recursos limitados (moviles, sistemas embebidos) y, ademas, quiera informacion de alineacion entre tokens de origen y destino, util para subtitulado, resaltado de correspondencias o control de calidad. El repo ocupa aproximadamente 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; pesos originales en el modelo base |
| Idiomas soportados | polaco (pl), ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la arquitectura transformer encoder-decoder empleada por OPUS-MT para traduccion neuronal. El entrenamiento original fue realizado por el grupo de la Universidad de Helsinki sobre datos del corpus OPUS, segun la cita de Tiedemann y Thottingal (2020). No se dispone en la informacion proporcionada de detalles sobre numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio es doble. Por un lado, la exportacion con optimum a ONNX en opset 17 sin past key/values, seguida de cuantizacion dinamica INT8 con onnxruntime, lo que reduce el peso y acelera la inferencia en CPU. Por otro, la salida `alignment_shift_l2`, que expone las probabilidades de atencion encoder-decoder de la capa 2 como un tensor adicional mediante una Identity sobre un nodo ya existente, sin alterar pesos ni decodificacion. Se incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario y cadenas de tokens destino) y `alignment.json`, que vincula la salida de alineacion con el SHA-256 del decoder.

## Capacidades

- Traduccion directa polaco→ucraniano sin pivotar por ingles.
- Generacion de texto secuencia a secuencia con decodificacion autorregresiva (sin cache de past key/values en esta exportacion).
- Salida de alineacion de atencion (`alignment_shift_l2`) entre tokens de origen y destino, util para subtitulado y verificacion.
- Tokenizador SentencePiece empaquetado en formato runtime (`tokenizer_runtime.json`).
- Ejecucion on-device en Android mediante el runtime OPUS de la app Subtitle Tap.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada a los dos idiomas del par pl→uk.

## Casos de uso

- Subtitulado automatico en Android: la app Subtitle Tap usa el modelo para traducir subtitulos polacos a ucraniano en el dispositivo; la salida de alineacion permite sincronizar y resaltar correspondencias entre el texto original y el traducido.
- Traduccion offline en moviles: al ser ONNX INT8 de ~0,1 GB, puede empaquetarse en una app sin depender de red, adecuado para usuarios con conectividad limitada.
- Resaltado de correspondencias bilingues: `alignment_shift_l2` permite construir mapas de atencion token a token para interfaces de lectura paralela o herramientas de estudio de idiomas.
- Control de calidad de traduccion: las probabilidades de atencion de la capa 2 pueden usarse como senal para detectar alineaciones debiles o posibles errores en segmentos concretos.
- Procesamiento por lotes en CPU: la cuantizacion INT8 y el formato ONNX permiten ejecutar traduccion masiva en servidores sin GPU mediante onnxruntime.
- Preprocesado de pipelines documentales: traduccion de contenido polaco a ucraniano antes de indexacion, busqueda o analisis posteriores en un corpus multilingue.
- Prototipado de sistemas de traduccion en entornos embebidos: sirve como referencia de exportacion ONNX + INT8 + salida de alineacion para otros pares de idiomas OPUS-MT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues, ya que el modelo esta pensado para CPU; el repo completo ocupa ~0,1 GB.
- GPU recomendadas: no se especifican; al ser un modelo Marian de traduccion de tamano contenido, cualquier GPU moderna puede ejecutarlo, pero el objetivo declarado es on-device.
- Cabe en GPU consumer: si, cualquier GPU consumer puede alojar los pesos INT8; el caso de uso principal es CPU movil.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap), y en general cualquier runtime compatible con ONNX opset 17; no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pl-uk-int8-shift-att | no disponible | no disponible | pl, uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pl-uk (base) | no disponible | no disponible | pl, uk | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT pl→uk | no disponible | no disponible | pl, uk | Apache 2.0 | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de traduccion especializado en un unico par de idiomas (pl→uk); no sirve para otras direcciones ni tareas genericas.
- No se documentan evaluaciones de sesgo, calidad o alucinacion; el riesgo de traducciones incorrectas existe como en cualquier sistema NMT.
- La exportacion no incluye past key/values, lo que puede penalizar la latencia en secuencias largas frente a variantes con cache.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo base en FP32; no se cuantifica esa perdida en la informacion disponible.
- La salida de alineacion corresponde a la capa 2 y no debe interpretarse como una alineacion perfecta ni como garantia de fidelidad.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) y respetar la atribucion del modelo base.
- La fecha de creacion indicada (2026-11-20) y el numero de descargas (0) sugieren un repositorio muy reciente y sin validacion comunitaria.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-pl-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pl-uk
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
