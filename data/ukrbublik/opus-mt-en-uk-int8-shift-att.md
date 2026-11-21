# ukrbublik/opus-mt-en-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-uk-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo resuelve la traduccion directa de ingles a ucraniano sin pivotar a traves de una lengua intermedia, y esta pensado para ejecucion en dispositivo (on-device) en la aplicacion Android Subtitle Tap.

La relevancia de esta ficha no reside en el modelo linguistico en si, sino en el formato de distribucion: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 de onnxruntime (QInt8, per-tensor), reduciendo el repositorio a unos 0,1 GB. Ademas, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atencion encoder del layer 2, util para alinear subtitulos sin alterar pesos ni decodificacion.

Arquitectonicamente es un transformer encoder-decoder Marian de la familia OPUS-MT, entrenado sobre datos OPUS, con licencia Apache 2.0 y soporte unicamente para el par de idiomas en-uk. No es un modelo de proposito general: es una pieza de infraestructura de traduccion optimizada para latencia y tamano en entornos moviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible (modelo base OPUS-MT en-uk; el repo pesa ~0,1 GB tras INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (origen), uk (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, un transformer encoder-decoder clasico disenado para traduccion automatica neuronal. El autor original (Tiedemann y Thottingal, 2020) lo entreno sobre corpus del proyecto OPUS. Esta conversion mantiene intactos los pesos y el proceso de decodificacion; solo cambia el formato: exportacion con optimum a ONNX (opset 17, sin past key/values) y cuantizacion dinamica INT8 de onnxruntime con esquema QInt8 per-tensor.

La innovacion tecnica anadida es la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atencion encoder del layer 2 del decoder. Esto permite obtener alineaciones palabra a palabra para, por ejemplo, sincronizar subtitulos, sin modificar los pesos ni el comportamiento de generacion. El repositorio incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, mas los strings de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineacion al SHA-256 del decoder. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Traduccion directa de ingles a ucraniano, sin pivot a traves de una lengua intermedia.
- Generacion de alineaciones de atencion encoder (layer 2) mediante la salida `alignment_shift_l2`, util para correspondencia palabra a palabra.
- Ejecucion en dispositivo mediante onnxruntime con pesos INT8.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` para uso en runtime propio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta vision ni audio.
- Capacidad multilingue limitada estrictamente al par en-uk.

## Casos de uso

- Subtitulado en tiempo real en Android: la salida `alignment_shift_l2` permite alinear cada segmento traducido con su texto origen, y el formato ONNX INT8 encaja en el runtime on-device de Subtitle Tap para traducir subtitulos sin conexion.
- Traduccion offline en aplicaciones moviles: el repo de ~0,1 GB y la cuantizacion INT8 permiten empaquetar el modelo dentro de un APK o descargarlo como recurso ligero para traducir en-uk sin red.
- Procesamiento por lotes de documentos en-uk: al ser un modelo Marian especializado, se puede usar para traducir grandes volumenes de texto con bajo coste computacional en CPU mediante onnxruntime.
- Localizacion de contenido editorial: traduccion de articulos, notas de prensa o documentacion del ingles al ucraniano con un modelo ligero y de licencia permisiva (Apache 2.0).
- Generacion de corpus paralelos alineados: combinando la traduccion con las probabilidades de atencion del layer 2 se pueden producir pares de frases alineadas para entrenamiento o evaluacion.
- Integracion en pipelines de CI/CD de localizacion: el formato ONNX facilita desplegar el modelo en contenedores ligeros o funciones serverless para traduccion automatizada de recursos de cadena.
- Prototipado de sistemas de traduccion en entornos con recursos limitados: sirve como baseline rapido frente a modelos multilingues mas pesados cuando solo se necesita el par en-uk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa ~0,1 GB en INT8, por lo que la huella en memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion on-device y CPU via onnxruntime.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano reducido del repo (~0,1 GB).
- Opciones de despliegue: onnxruntime (formato nativo del repo); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-uk-int8-shift-att | no disponible (~0,1 GB INT8) | no disponible | en, uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-uk | no disponible | no disponible | en, uk | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-mul | no disponible | no disponible | en, multiples | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita a la familia OPUS-MT porque no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a pesos PyTorch) y la salida adicional de alineacion.

## Limitaciones y advertencias

- Modelo especializado unicamente en el par en-uk; no traduce otros idiomas.
- Riesgo de alucinacion y de traducciones incorrectas inherente a los modelos NMT, especialmente en dominios especializados o terminologia tecnica.
- Sesgos potenciales heredados de los corpus OPUS con los que se entreno el modelo original.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo en punto flotante; no se documenta la magnitud de esa perdida.
- No se especifica la longitud de contexto soportada; secuencias largas pueden degradar la calidad.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion al grupo de Helsinki y citar el paper de OPUS-MT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- La salida `alignment_shift_l2` depende de un nodo interno del decoder; cambios en el grafo o en la version de onnxruntime podrian afectar a su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-uk
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61/
- Proyecto OPUS: https://opus.nlpl.eu/
- Repositorio Marian NMT: https://github.com/marian-nmt/marian
- onnxruntime: https://github.com/microsoft/onnxruntime
