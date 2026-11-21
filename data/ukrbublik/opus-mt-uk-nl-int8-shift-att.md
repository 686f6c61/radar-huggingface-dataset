# ukrbublik/opus-mt-uk-nl-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-uk-nl-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-uk-nl`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Resuelve la traduccion directa del ucraniano (`uk`) al neerlandes (`nl`) sin pivotar por el ingles, en un formato optimizado para inferencia en dispositivo (on-device).

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder clasico de traduccion automatica neuronal. El autor, `ukrbublik`, ha exportado los pesos originales a ONNX (opset 17, sin past key/values) y los ha cuantizado dinamicamente a INT8 con onnxruntime (QInt8, per-tensor), reduciendo el repositorio a unos 0,1 GB.

La innovacion concreta de esta version es la exposicion de una salida adicional de alineacion (`alignment_shift_l2`), que corresponde a las probabilidades de atencion encoder del layer 2 del decoder. Esto permite obtener alineaciones palabra a palabra para subtitulos, que es el caso de uso declarado: el runtime on-device de la app Android Subtitle Tap. Los pesos y el proceso de decodificacion no se modifican respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; export ONNX opset 17 |
| Idiomas soportados | ucraniano (uk) como origen, neerlandes (nl) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado por el grupo OPUS-MT sobre datos paralelos del corpus OPUS. La model card original de Helsinki-NLP no detalla en esta informacion el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su procedencia OPUS.

Esta version concreta no reentrena ni modifica los pesos: solo cambia el formato. La exportacion se realiza con `optimum` (opset 17, sin past key/values) y se aplica cuantizacion dinamica INT8 con onnxruntime. La unica modificacion estructural es la adicion de una salida `alignment_shift_l2` en el decoder, implementada como una `Identity` sobre un nodo ya existente que expone las probabilidades de atencion encoder del layer 2. Segun el autor, los pesos y la decodificacion permanecen inalterados. El repositorio incluye un fichero `alignment.json` que actua como recibo criptografico (SHA-256) que vincula la salida de alineacion al decoder.

## Capacidades

- Traduccion de texto directa ucraniano a neerlandes, sin pivotar por el ingles.
- Generacion de alineaciones palabra a palabra mediante la salida `alignment_shift_l2` (probabilidades de atencion encoder del layer 2), util para sincronizacion de subtitulos.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json`, con piezas, puntuaciones y mapeo a ids de vocabulario junto con las cadenas de tokens destino.
- Inferencia on-device mediante onnxruntime con pesos INT8.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de subtitulos en una app Android: el runtime on-device consume los ficheros ONNX INT8 y produce traduccion uk→nl junto con alineaciones de atencion para sincronizar los subtitulos con el audio original.
- Traduccion offline en dispositivos de bajos recursos: el tamano de 0,1 GB y la cuantizacion INT8 permiten ejecutar el modelo sin conexion y sin GPU dedicada.
- Procesamiento por lotes de documentos ucranianos a neerlandes en pipelines ligeros: el formato ONNX es compatible con onnxruntime en servidor para tareas de traduccion masiva de bajo coste.
- Traduccion integrada en aplicaciones de escritorio o moviles con privacidad por diseno: al ejecutarse localmente, el texto no sale del dispositivo.
- Generacion de corpus paralelos alineados: la salida de alineacion permite construir pares de segmentos palabra a palabra para entrenamiento o evaluacion posterior.
- Prototipado rapido de funcionalidades de traduccion en entornos con restricciones de memoria: la cuantizacion INT8 reduce el consumo de RAM frente al modelo original en fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,1 GB en INT8; la huella en memoria en tiempo de ejecucion sera del orden de cientos de MB, aunque no se proporciona una cifra exacta.
- GPU recomendadas: no disponible; el modelo esta disenado para inferencia on-device con onnxruntime, por lo que no requiere GPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque su objetivo es CPU/movil.
- Opciones de despliegue: onnxruntime (formato nativo), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`. No se distribuyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-nl-int8-shift-att | no disponible | no disponible | uk→nl | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-nl | no disponible | no disponible | uk→nl | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk→en | Apache 2.0 | safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida adicional de alineacion. Frente a alternativas con pivot por ingles, esta version evita la traduccion intermedia, lo que reduce errores acumulados, a costa de cubrir unicamente el par uk→nl.

## Limitaciones y advertencias

- Modelo de traduccion especializado en un unico par de idiomas (uk→nl); no sirve para otros pares sin reentrenamiento o conversion adicional.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo original en fp32; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion y de traducciones inexactas en dominios especializados o texto con jerga, comun en modelos NMT entrenados sobre corpus genericos.
- Sesgos potenciales heredados de los datos OPUS, cuya composicion no se detalla en la informacion disponible.
- La salida de alineacion se basa en probabilidades de atencion, que no garantizan una correspondencia perfecta palabra a palabra.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) segun indica el autor.
- No se proporcionan datos de contexto maximo, por lo que textos largos pueden requerir segmentacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-nl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-nl
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
