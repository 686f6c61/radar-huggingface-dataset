# ukrbublik/opus-mt-uk-pl-int8-shift-att

## Resumen

Este repositorio contiene una conversion del modelo de traduccion automatica Helsinki-NLP/opus-mt-uk-pl (ucraniano a polaco) al formato ONNX con cuantizacion dinamica INT8, realizada por el desarrollador ukrbublik para su uso en la aplicacion Android Subtitle Tap. El modelo original forma parte de la familia OPUS-MT, desarrollada por el Language Technology Research Group de la Universidad de Helsinki, y esta entrenado sobre corpus paralelos del proyecto OPUS. La traduccion es directa entre ucraniano y polaco, sin pivotar por el ingles.

La relevancia de esta ficha no reside en el modelo base (un MarianNMT compacto de 2020), sino en la conversion: empaqueta encoder y decoder como grafos ONNX con cuantizacion QInt8 por tensor, exportados con optimum (opset 17, sin past key/values), lo que permite inferencia en dispositivos moviles mediante onnxruntime. Ademas, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atencion encoder-decoder de la capa 2, pensada para alinear subtitulos con el audio.

El modelo es pequeno (repo de 0,1 GB), esta bajo licencia Apache 2.0 y cubre unicamente el par de idiomas ucraniano-polaco. No hay datos publicados de benchmarks ni de volumen de descargas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianNMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ucraniano (uk), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base es un MarianNMT, la arquitectura transformer encoder-decoder desarrollada por el equipo de Marian para traduccion automatica neuronal, con tokenizacion SentencePiece. Fue entrenado por el grupo OPUS-MT de Helsinki sobre datos paralelos de OPUS. Los detalles de composicion del dataset, numero de tokens de entrenamiento y posibles fases de fine-tuning no estan disponibles en la informacion proporcionada.

La conversion de este repositorio modifica exclusivamente el formato: exporta encoder y decoder con optimum (opset 17, sin past key/values), aplica cuantizacion dinamica INT8 por tensor y anade una salida de alineacion en el decoder (`alignment_shift_l2`) que es una Identity sobre un nodo existente, de modo que pesos y decodificacion no cambian. Incluye tambien `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineacion al SHA-256 del decoder.

## Capacidades

- Traduccion de texto directa ucraniano a polaco, sin pivotar por ingles.
- Salida de alineacion encoder-decoder por token (probabilidades de atencion de la capa 2) para sincronizacion de subtitulos.
- Inferencia on-device mediante onnxruntime con pesos INT8.
- Tokenizacion SentencePiece empaquetada en JSON para uso en runtime.
- No dispone de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al par uk-pl.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap puede traduccir subtitulos ucranianos a polaco en el dispositivo, con la salida `alignment_shift_l2` para ajustar la sincronizacion temporal de cada segmento.
- Traduccion offline en dispositivos de gama baja: el modelo INT8 ocupa ~0,1 GB y funciona con onnxruntime sin GPU, adecuado para entornos sin conectividad.
- Traduccion de documentacion tecnica ucraniana a polaco en pipelines locales: integrable como paso de preprocesado en scripts Python con onnxruntime.
- Procesamiento por lotes de corpus paralelos: util para generar datos de entrenamiento uk-pl o para evaluar sistemas de traduccion en dominios acotados.
- Traduccion de interfaces y textos de aplicaciones: modelo compacto y desplegable en contenedores ligeros sin servidor GPU.
- Investigacion sobre alineacion de palabras: la salida de atencion de la capa 2 permite estudiar correspondencias lexicas uk-pl sin reentrenar el modelo.
- Traduccion de correspondencia y mensajes cortos en herramientas de escritorio: latencia baja por el tamano reducido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,1 GB de pesos INT8; en CPU basta con unos pocos cientos de MB de RAM en runtime.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU y onnxruntime, aunque puede ejecutarse en GPU con el backend CUDA de onnxruntime.
- Cabe en cualquier GPU consumer (RTX 3050, RTX 4090, etc.) y en dispositivos moviles Android.
- Opciones de despliegue: onnxruntime (CPU, CUDA, NNAPI), integracion directa en apps Android; no se distribuye en GGUF ni safetensors, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-pl-int8-shift-att | no disponible | no disponible | uk, pl | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-pl | no disponible | no disponible | uk, pl | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk, en | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-pl-en | no disponible | no disponible | pl, en | Apache 2.0 | PyTorch/safetensors |

Las alternativas uk-en y pl-en requieren pivotar por ingles para cubrir uk-pl, lo que introduce una etapa adicional de traduccion y mayor perdida de calidad. No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del corpus OPUS y del modelo base; no documentados en la informacion disponible.
- Riesgo de alucinacion: presente como en cualquier modelo NMT; la cuantizacion INT8 puede introducir degradacion adicional de calidad frente al modelo original.
- Cobertura limitada a ucraniano y polaco; no soporta otros idiomas.
- Longitud de contexto no documentada; el modelo base MarianNMT esta pensado para frases y parrafos cortos.
- La salida de alineacion es una Identity sobre un nodo existente y no esta validada publicamente mas alla del recibo SHA-256.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar la atribucion a OPUS-MT y a los autores originales (Tiedemann y Thottingal, 2020).
- El repositorio no incluye pipeline de Hugging Face Transformers; requiere onnxruntime y el tokenizador JSON propio.
- Sin descargas ni likes registrados; el mantenimiento y soporte comunitario son nulos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-pl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-pl
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- OPUS, corpus abierto de traduccion: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- onnxruntime: https://github.com/microsoft/onnxruntime
- optimum (exportacion ONNX): https://github.com/huggingface/optimum
