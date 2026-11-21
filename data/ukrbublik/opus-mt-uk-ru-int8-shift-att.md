# ukrbublik/opus-mt-uk-ru-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-ru-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-uk-ru`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (proyecto OPUS-MT, liderado por Jorg Tiedemann). El modelo traduce directamente entre ucraniano (uk) y ruso (ru) sin pivotar por el ingles, y esta pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos del corpus OPUS. Esta version concreta no modifica los pesos ni el proceso de decodificacion: solo cambia el formato (exportacion ONNX con opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 de onnxruntime (QInt8, per-tensor). Ademas, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atencion encoder del layer 2, util para alinear subtitulos.

Su relevancia es practica: ofrece un traductor uk→ru ligero (repo de 0,1 GB) y desplegable en movil mediante onnxruntime, con licencia Apache 2.0 y sin dependencia de servicios en la nube. No es un modelo de proposito general ni compite en benchmarks con LLM; es una pieza de infraestructura de traduccion especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ucraniano (uk), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, un transformer encoder-decoder habitual en la familia OPUS-MT, entrenado por la Universidad de Helsinki sobre datos paralelos del corpus OPUS. La model card del repositorio no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset; esa informacion corresponde al modelo original `Helsinki-NLP/opus-mt-uk-ru` (revision `d3571bdeda1b75badcc1c63def5d27a10e56f6a2`), no reproducida aqui.

La innovacion de esta conversion es doble. Por un lado, el export a ONNX con optimum (opset 17, sin past key/values) y la cuantizacion dinamica INT8 reducen el peso y permiten inferencia en movil. Por otro, el decoder emite `alignment_shift_l2`, las probabilidades de atencion encoder de la capa 2, implementadas como una Identity sobre un nodo existente: los pesos y la decodificacion no cambian, solo se expone una senal de alineacion que el runtime de Subtitle Tap usa para alinear subtitulos. El repositorio incluye `tokenizer_runtime.json` (piezas y scores del SentencePiece original mapeados a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineacion con el SHA-256 del decoder.

## Capacidades

- Traduccion directa uk→ru sin pivotar por ingles.
- Traduccion de texto plano de frases y parrafos.
- Salida de alineacion a nivel de atencion (`alignment_shift_l2`, capa 2 del encoder) para alinear tokens origen-destino, orientada a subtitulos.
- Inferencia on-device mediante onnxruntime, sin backend de servidor.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` para uso autonomo del runtime.
- No soporta tool calling, agentes, multi-step reasoning, vision ni audio.
- Capacidad multilingue limitada exclusivamente al par uk-ru.

## Casos de uso

- Subtitulado automatico en Android: la app Subtitle Tap usa el modelo para traducir subtitulos ucranianos a ruso en el dispositivo, con la salida de alineacion para sincronizar los segmentos traducidos con los originales.
- Traduccion offline en movil: al ejecutarse con onnxruntime y un repo de 0,1 GB, permite traducir sin conexion en telefonos de gama media, evitando enviar texto a servicios externos.
- Procesamiento por lotes de documentos uk→ru: integrado en un pipeline de onnxruntime en servidor, puede traducir grandes volumenes de texto con bajo coste de memoria gracias a la cuantizacion INT8.
- Localizacion de contenido editorial: traduccion de articulos, notas de prensa o documentacion del ucraniano al ruso para publicacion en mercados rusohablantes.
- Preprocesamiento para NLP downstream: generar versiones en ruso de corpus ucranianos para alimentar buscadores, sistemas de analisis de sentimiento o clasificadores entrenados en ruso.
- Herramientas de accesibilidad: traduccion en tiempo real de transcripciones o dialogos en apps de asistencia para usuarios que manejan ambos idiomas.
- Investigacion en alineacion de traduccion: la salida `alignment_shift_l2` sirve para estudiar correspondencias lexicas y para tareas de word alignment sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repo completo ocupa 0,1 GB y los pesos INT8 son de pocos MB, por lo que cabe en CPU y en memoria de movil sin GPU dedicada.
- GPU recomendadas: no necesarias; cualquier GPU con soporte onnxruntime (por ejemplo, RTX 4090, A100, H100) aceleraria la inferencia, pero el modelo esta disenado para CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer; tambien en CPU y en dispositivos Android.
- Opciones de despliegue: onnxruntime (runtime objetivo, con los ficheros ONNX y `tokenizer_runtime.json`); no se documentan exportaciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-ru-int8-shift-att | no disponible | no disponible | uk, ru | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-ru (base) | no disponible | no disponible | uk, ru | Apache 2.0 | safetensors/PyTorch (no confirmado en la informacion) |
| Otros modelos OPUS-MT uk-ru | no disponible | no disponible | uk, ru | Apache 2.0 | variable |

La comparativa se limita al modelo base del que deriva; no se dispone de datos de rendimiento ni de especificaciones de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un unico par de idiomas (uk-ru); no sirve para otras combinaciones ni como modelo general.
- Riesgo de alucinacion y de traducciones incorrectas en textos tecnicos, nombres propios, jerga o dominios especializados, comun en modelos NMT de este tamano.
- La cuantizacion INT8 puede introducir una perdida de calidad frente al modelo en punto flotante; no se documenta la magnitud de esa degradacion.
- No se detallan sesgos conocidos en la informacion disponible; al entrenarse sobre OPUS, puede heredar sesgos de dominio y de registro de ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El modelo esta empaquetado para un runtime concreto (Subtitle Tap / onnxruntime); integrarlo en otros entornos requiere adaptar el manejo del tokenizer y de la salida de alineacion.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-ru-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-ru
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT — Building open translation services for the World", EAMT 2020.
