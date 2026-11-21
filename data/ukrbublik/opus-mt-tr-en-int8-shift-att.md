# ukrbublik/opus-mt-tr-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-tr-en-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tr-en`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de turco a ingles, sin pivotar a traves de una lengua intermedia, y esta pensado para ejecucion en dispositivo (on-device) en la aplicacion Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder especializado en traduccion, exportado con optimum a opset 17 sin past key/values. La cuantizacion es dinamica INT8 de onnxruntime (QInt8, per-tensor) sobre encoder y decoder, lo que reduce drasticamente el peso del repositorio hasta unos 0,1 GB. La innovacion principal de esta version es la exposicion de una salida adicional de alineacion: el decoder emite `alignment_shift_l2`, las probabilidades de atencion encoder del layer 2, que se obtienen como una identidad de un nodo existente sin alterar pesos ni decodificacion.

Es relevante para desarrolladores que necesitan traduccion turco-ingles de baja latencia en entornos con recursos limitados (movil, edge), donde un modelo de traduccion neuronal completo en FP32 no seria viable. El modelo se distribuye con licencia Apache 2.0 y un tokenizador en formato JSON propio del runtime de la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, una arquitectura transformer encoder-decoder desarrollada para traduccion automatica neuronal y entrenada sobre datos del corpus OPUS. La revision concreta del modelo fuente es `19c65427cc2af5f191337d4899e0348c4af25902`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta conversion no los detalla y remite al modelo original.

Esta version concreta no reentrena ni modifica los pesos: solo cambia el formato. La exportacion se realiza con optimum a opset 17 sin past key/values, seguida de cuantizacion dinamica INT8 con onnxruntime. El decoder incorpora una salida adicional, `alignment_shift_l2`, que expone las probabilidades de atencion encoder de la capa 2 mediante una identidad sobre un nodo ya existente, de modo que los pesos y el proceso de decodificacion permanecen intactos. El repositorio incluye `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, mas las cadenas del vocabulario destino) y `alignment.json`, un recibo que vincula la salida de alineacion con el SHA-256 del decoder.

## Capacidades

- Traduccion directa turco a ingles, sin pivotar por una lengua intermedia.
- Generacion de alineaciones de atencion encoder (capa 2) a traves de la salida `alignment_shift_l2`, util para mapear palabras origen-destino.
- Ejecucion en dispositivo mediante onnxruntime, con pesos cuantizados INT8.
- Tokenizacion SentencePiece empaquetada en formato JSON compatible con el runtime de la app.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes.
- No dispone de capacidades de vision, audio ni modo thinking.
- Capacidad multilingue limitada exclusivamente al par turco-ingles.

## Casos de uso

- Subtitulado automatico en Android: la app Subtitle Tap puede traducir subtitulos turcos a ingles en el propio dispositivo, sin conexion, gracias al tamano reducido (0,1 GB) y a la ejecucion con onnxruntime.
- Traduccion offline en entornos edge: dispositivos sin conectividad estable pueden incorporar el modelo para traducir texto turco-ingles con latencia baja.
- Alineacion palabra a palabra para herramientas de aprendizaje: la salida `alignment_shift_l2` permite resaltar que palabra turca corresponde a cada palabra inglesa en la traduccion, util en apps de idiomas.
- Procesamiento por lotes de documentos turcos: pipelines de traduccion de articulos, correos o informes donde el coste por inferencia en CPU es critico y no se requiere un modelo de gran tamano.
- Preprocesado en sistemas de analisis de texto: traduccion de reseñas o comentarios turcos a ingles antes de pasarlos a un clasificador o motor de busqueda en ingles.
- Prototipado rapido de servicios de traduccion: al ser un ONNX ligero, se puede desplegar en contenedores pequenos o funciones serverless sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un modelo ONNX INT8 de aproximadamente 0,1 GB, la huella de memoria es muy reducida y cabe en CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en CPU/dispositivo mediante onnxruntime, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer, dado el tamano reducido, aunque su proposito es la inferencia en CPU.
- Opciones de despliegue: onnxruntime (formato nativo del modelo); no se distribuyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-tr-en-int8-shift-att | no disponible | no disponible | tr, en | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tr-en (modelo base) | no disponible | no disponible | tr, en | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT tr-en | no disponible | no disponible | tr, en | Apache 2.0 | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en el par turco-ingles; no traduce otras lenguas.
- Al ser una cuantizacion INT8, puede existir una ligera perdida de calidad frente al modelo base en FP32, aunque no se documenta su magnitud.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (terminologia tecnica, juridica o medica).
- Sesgos heredados de los datos de entrenamiento OPUS del modelo original, no evaluados en esta conversion.
- La salida de alineacion corresponde solo a la capa 2 del encoder y no debe interpretarse como una alineacion perfecta a nivel de palabra.
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso esta limitado a traduccion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribucion al grupo de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El tokenizador se distribuye en un formato JSON propio del runtime de la app, no en el formato estandar de Hugging Face, lo que puede complicar su uso fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-tr-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tr-en
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): no disponible en la informacion proporcionada
- Repositorio o demo de Subtitle Tap: no disponible en la informacion proporcionada
