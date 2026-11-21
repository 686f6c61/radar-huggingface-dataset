# ukrbublik/opus-mt-fr-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-fr-uk-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-fr-uk`, desarrollado originalmente por el Grupo de Investigacion en Tecnologia del Lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de frances a ucraniano, sin pivotar a traves del ingles, y esta pensado para ejecucion en dispositivo dentro de la aplicacion Android Subtitle Tap.

Tecnicamente se trata de un transformer encoder-decoder de la familia Marian, exportado con optimum a opset 17 y sin cache de claves/valores, y cuantizado dinamicamente a INT8 (QInt8, per-tensor) con onnxruntime. La innovacion principal de esta variante es que el decodificador expone una salida adicional de alineacion (`alignment_shift_l2`), correspondiente a las probabilidades de atencion encoder del layer 2, que permite obtener alineaciones palabra a palabra sin modificar los pesos ni el proceso de decodificacion.

El modelo es relevante por su caracter practico: formato ONNX autocontenido (0,1 GB), tokenizer serializado en JSON y licencia Apache 2.0, lo que facilita el despliegue en entornos moviles o embebidos donde no se dispone de framework de deep learning completo. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | frances (fr) y ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, el framework de traduccion neuronal secuencia-a-secuencia utilizado por el proyecto OPUS-MT. El modelo original fue entrenado sobre datos paralelos del corpus OPUS y esta especializado en el par frances-ucraniano en una unica direccion. Esta variante no reentrena ni ajusta los pesos: solo cambia el formato (exportacion ONNX con optimum) y aplica cuantizacion dinamica INT8 con onnxruntime. El export se realiza sin cache de claves/valores, de modo que el decodificador recalcula el estado completo en cada paso.

La modificacion tecnica destacable es la exposicion de `alignment_shift_l2`: una identidad sobre un nodo existente que publica las probabilidades de atencion encoder del layer 2 del decodificador. Esto permite extraer alineaciones a nivel de token para subtitulado o resaltado, manteniendo intactos pesos y decodificacion. El repositorio incluye ademas `tokenizer_runtime.json` (piezas y scores del SentencePiece original mapeados a ids de vocabulario y cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineacion al SHA-256 del decodificador. Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Traduccion automatica directa frances a ucraniano, sin pivotar por el ingles.
- Salida de alineacion token a token mediante las probabilidades de atencion encoder del layer 2 (`alignment_shift_l2`).
- Ejecucion en dispositivo con onnxruntime, sin dependencia de PyTorch en inferencia.
- Tokenizer autocontenido en JSON para integracion en runtimes ligeros.
- Inferencia determinista y ligera (repo de 0,1 GB) apta para moviles.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni modo de pensamiento.
- Cobertura multilingue limitada exclusivamente al par fr-uk.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicacion Subtitle Tap puede traducir subtitulos franceses a ucraniano en el propio dispositivo, con la salida de alineacion usada para sincronizar o resaltar segmentos.
- Traduccion offline en entornos sin conectividad: al ser un modelo ONNX de 0,1 GB, puede empaquetarse en una app movil y funcionar sin red.
- Traduccion de documentos y articulos franceses a ucraniano en pipelines ligeros, con post-procesado de la alineacion para conservar correspondencias entre frases.
- Generacion de subtitulos bilingues para plataformas de video: el modelo produce la traduccion y las probabilidades de atencion permiten alinear cada token con su origen.
- Integracion en sistemas de accesibilidad o kioscos con recursos limitados, donde no es viable desplegar un modelo de mayor tamano.
- Herramientas de estudio de idiomas: la alineacion token a token facilita mostrar correspondencias palabra a palabra entre el texto frances y su traduccion ucraniana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de dispositivos moviles y GPUs de gama baja.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para lotes grandes, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en CPU y en dispositivos Android.
- Opciones de despliegue: onnxruntime (runtime objetivo del autor), integracion directa en aplicaciones Android; no se mencionan exportaciones a vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-uk-int8-shift-att | no disponible | no disponible | fr-uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-fr-uk | no disponible | no disponible | fr-uk | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT fr-* | no disponible | no disponible | fr-otros | Apache 2.0 | safetensors/PyTorch |

La comparacion directa con alternativas de la misma categoria (por ejemplo, NLLB-200 o M2M-100) no esta disponible en la informacion proporcionada. Frente al modelo base, esta variante anade cuantizacion INT8, formato ONNX y salida de alineacion, pero no modifica la calidad de traduccion.

## Limitaciones y advertencias

- Solo traduce frances a ucraniano; no soporta otras direcciones ni idiomas.
- Al derivar de OPUS-MT, hereda los sesgos y limitaciones de los datos paralelos de OPUS, que pueden afectar a dominios especializados.
- Riesgo de alucinacion y de traducciones inexactas en textos tecnicos, jerga o frases ambiguas; no se han publicado evaluaciones de calidad en esta variante.
- La cuantizacion INT8 puede introducir una ligera perdida de calidad respecto al modelo original en FP32; no se documenta su magnitud.
- La salida de alineacion corresponde a las probabilidades de atencion del layer 2, no a una alineacion supervisada; su fiabilidad no esta validada.
- Licencia Apache 2.0 permite uso comercial, pero se exige atribucion a los autores originales (Tiedemann y Thottingal, 2020).
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion ni de mantenimiento activo.
- No se documentan la longitud de contexto ni los limites de tokens de entrada; conviene validarlos empiricamente antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-uk
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no disponible como enlace directo en la informacion proporcionada
- Repositorio del proyecto OPUS-MT: no disponible en la informacion proporcionada
