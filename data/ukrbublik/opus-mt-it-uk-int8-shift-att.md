# ukrbublik/opus-mt-it-uk-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-it-uk-int8-shift-att` es una conversión del modelo de traducción automática Helsinki-NLP/opus-mt-it-uk (familia OPUS-MT, desarrollada por el Language Technology Research Group de la Universidad de Helsinki) al formato ONNX con cuantización INT8 dinámica. Está pensado para inferencia en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap, traduciendo directamente de italiano a ucraniano sin pivotar por el inglés.

Técnicamente es un transformer encoder-decoder de arquitectura Marian, exportado con optimum en opset 17 y cuantizado con onnxruntime (QInt8, per-tensor). La particularidad del repositorio es que el decoder expone una salida adicional, `alignment_shift_l2`, que contiene las probabilidades de atención encoder del layer 2, útil para alinear tokens entre origen y destino en tareas de subtitulado. Los pesos y el proceso de decodificación no se modifican respecto del modelo base.

Es relevante para desarrolladores que necesiten traducción it→uk ligera (el repo ocupa 0,1 GB), ejecutable sin GPU y con señal de alineación por token, algo poco común en modelos OPUS-MT estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | italiano (it), ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-it-uk es un transformer encoder-decoder de tipo Marian, entrenado sobre datos del corpus OPUS (Tiedemann y Thottingal, 2020). Este repositorio no reentrena ni modifica los pesos: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización INT8 dinámica con onnxruntime. El decoder incorpora una salida extra, `alignment_shift_l2`, implementada como Identity sobre un nodo existente, que expone las probabilidades de atención encoder del layer 2 para permitir alineamiento token a token.

Los datos de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF o DPO) no están detallados en la información disponible. El modelo base procede de OPUS-MT, cuyo entrenamiento se apoya en pares de traducción multilingües del corpus OPUS.

## Capacidades

- Traducción automática directa italiano → ucraniano, sin pivotar por inglés.
- Generación de texto traducido token a token con decodificación autoregresiva.
- Salida de alineamiento por atención (`alignment_shift_l2`), útil para mapear tokens origen-destino.
- Tokenizer incluido como `tokenizer_runtime.json` (piezas y scores del SentencePiece original mapeados a ids).
- Inferencia en CPU mediante onnxruntime, sin requisitos de GPU.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento.
- Capacidades multilingües limitadas exclusivamente al par it→uk.

## Casos de uso

- Subtitulado en dispositivo: la app Subtitle Tap puede traducir subtítulos italianos a ucraniano localmente, sin conexión, gracias al tamaño reducido (0,1 GB) y a la inferencia ONNX en CPU.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite sincronizar y emparejar segmentos de origen y destino para generar ficheros SRT bilingües.
- Traducción offline en apps móviles: integrable como runtime OPUS embebido para traducción de texto en dispositivos Android sin GPU.
- Procesamiento por lotes de documentos it→uk: pipelines de traducción de bajo coste en servidores CPU usando onnxruntime.
- Análisis lingüístico contrastivo: la señal de atención del layer 2 facilita estudiar correspondencias léxicas entre italiano y ucraniano.
- Prototipado de sistemas de traducción en entornos con recursos limitados: el formato ONNX INT8 reduce huella de memoria y permite despliegues edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU (ONNX Runtime).
- Memoria: repo de 0,1 GB; huella de ejecución INT8 reducida, aunque no se detalla cifra exacta.
- GPU recomendadas: no disponibles; no requiere GPU.
- Cabe en consumer GPU: sí, por tamaño, aunque su destino es CPU/on-device.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se distribuyen pesos GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-it-uk-int8-shift-att | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Salida de alineamiento, on-device |
| Helsinki-NLP/opus-mt-it-uk | no disponible | no disponible | PyTorch/safetensors | Apache 2.0 | Modelo base, sin cuantización ni alineamiento |
| Otros OPUS-MT it→X | no disponible | no disponible | varios | Apache 2.0 | Pares de idioma distintos |

## Limitaciones y advertencias

- Solo cubre el par italiano → ucraniano; no traducción inversa ni otros idiomas.
- Calidad heredada del modelo base OPUS-MT; puede producir traducciones literales o errores en dominios especializados.
- Riesgo de alucinación y omisiones en frases largas o ambiguas, como en cualquier modelo neuronal de traducción.
- Longitud de contexto no documentada; no se garantiza manejo de documentos extensos en una sola pasada.
- La cuantización INT8 puede introducir pequeñas pérdidas de calidad frente al modelo base en precisión completa.
- Sin datos de sesgos documentados; al entrenarse sobre OPUS pueden persistir sesgos del corpus.
- Licencia Apache 2.0 permite uso comercial, pero requiere atribución a los autores originales (Universidad de Helsinki).
- Repositorio con 0 descargas y 0 likes; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-it-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-it-uk
- Paper OPUS-MT (EAMT 2020): Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World.
