# ukrbublik/opus-mt-pl-de-int8-shift-att

## Resumen

`ukrbublik/opus-mt-pl-de-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-pl-de`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente del polaco (pl) al aleman (de), sin pivotar a traves del ingles, y esta pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La relevancia de esta variante no reside en el entrenamiento (los pesos son identicos al modelo original, bajo licencia Apache 2.0), sino en el formato: exportacion con optimum a opset 17 sin past key/values, cuantizacion dinamica INT8 por tensor con onnxruntime, y una salida adicional `alignment_shift_l2` que expone las probabilidades de atencion encoder-decoder de la capa 2. Esa salida de alineamiento permite mapear palabras origen-destino, algo util para subtitulado y para presentar traducciones con correspondencia a nivel de token.

Arquitectura Marian (transformer encoder-decoder) de tamano base, con un repositorio de apenas 0.1 GB gracias a la cuantizacion. El modelo esta especializado exclusivamente en el par pl-de y no soporta otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), exportado a ONNX (opset 17) |
| Parametros totales | no disponible (modelo base Marian de OPUS-MT; el repo ocupa 0.1 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | polaco (pl) como origen, aleman (de) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es `Helsinki-NLP/opus-mt-pl-de` (revision `0a33159cef061ed6d9d1c56b24c080c61f28a5bb`), un transformer encoder-decoder de la familia Marian entrenado por el grupo OPUS-MT de la Universidad de Helsinki sobre datos del corpus OPUS. No se dispone en la informacion proporcionada de detalles sobre numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de esta variante es puramente de despliegue: exportacion con optimum (opset 17, sin past key/values), cuantizacion dinamica INT8 por tensor y una salida adicional `alignment_shift_l2` que corresponde a las probabilidades de atencion encoder-decoder de la capa 2. Segun la model card, esa salida es una Identity sobre un nodo existente, por lo que los pesos y el proceso de decodificacion no cambian. El repositorio incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, mas las cadenas de token destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traduccion directa polaco a aleman, sin pivotar por ingles.
- Generacion de alineamientos a nivel de atencion mediante la salida `alignment_shift_l2` (probabilidades de atencion encoder-decoder de la capa 2).
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` para uso en runtime propio.
- Ejecucion on-device en Android mediante onnxruntime con pesos INT8.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada estrictamente al par pl-de.

## Casos de uso

- Subtitulado automatico pl-de en Android: el modelo se ejecuta on-device con onnxruntime y pesos INT8, lo que permite traducir subtitulos sin conexion y sin enviar texto a servidores externos.
- Alineamiento palabra a palabra para subtitulos bilingues: la salida `alignment_shift_l2` permite asociar tokens origen y destino, util para resaltar la palabra traducida correspondiente en pantalla.
- Traduccion de documentacion tecnica polaca a aleman en pipelines por lotes: al ser un modelo Marian ligero en ONNX, puede procesarse en CPU sin GPU dedicada.
- Preprocesado de corpus para investigacion en traduccion automatica: sirve como baseline cuantizado para comparar calidad frente al modelo original en FP32.
- Traduccion de correspondencia y textos administrativos pl-de en herramientas de escritorio con requisitos de privacidad, al no requerir conexion.
- Integracion en aplicaciones moviles de bajo consumo: el tamano de 0.1 GB del repositorio y la cuantizacion INT8 reducen el uso de memoria y almacenamiento en dispositivos.
- Evaluacion de tecnicas de cuantizacion: permite medir la perdida de calidad BLEU/COMET respecto al modelo Helsinki-NLP original en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo Marian base cuantizado a INT8 con repositorio de 0.1 GB, la huella de memoria es reducida y apta para CPU.
- GPU recomendadas: no disponible; el diseno esta orientado a ejecucion on-device en Android con onnxruntime, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: si, aunque el caso de uso previsto es CPU y dispositivos moviles.
- Opciones de despliegue: onnxruntime (runtime objetivo declarado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pl-de-int8-shift-att | no disponible (repo 0.1 GB) | no disponible | pl → de | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pl-de | no disponible | no disponible | pl → de | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT pl-de | no disponible | no disponible | pl → de | Apache 2.0 | varian |

La comparativa directa mas relevante es con el modelo base `Helsinki-NLP/opus-mt-pl-de`: mismos pesos, pero esta variante anade cuantizacion INT8, exportacion ONNX y la salida de alineamiento. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; al entrenarse sobre OPUS, puede heredar sesgos de los corpus paralelos utilizados.
- Riesgo de alucinacion: propio de los modelos de traduccion neuronales; puede generar traducciones fluentes pero incorrectas en segmentos ambiguos o fuera de dominio.
- Limitaciones de idioma: solo traduce polaco a aleman; no soporta otros pares ni direccion inversa de forma nativa.
- Limitaciones de contexto: la longitud maxima de contexto no se especifica en la informacion disponible.
- La cuantizacion INT8 puede degradar la calidad respecto al modelo FP32 original; no se aportan metricas de esa perdida.
- La salida `alignment_shift_l2` depende de la implementacion del runtime: es una Identity sobre un nodo interno y su interpretacion requiere conocer el grafo exportado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a los autores originales (Tiedemann y Thottingal, 2020) y conservar el aviso de licencia.
- El modelo esta disenado para la app Subtitle Tap; su integracion fuera de ese runtime requiere adaptar `tokenizer_runtime.json` y el manejo de la salida de alineamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-pl-de-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pl-de
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS: https://opus.nlpl.eu/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
