# ukrbublik/opus-mt-de-nl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-de-nl-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-de-nl`, desarrollado por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de aleman a neerlandes sin pivotar por el ingles, y esta empaquetado especificamente para el runtime on-device de la aplicacion Android Subtitle Tap.

La relevancia de este artefacto no reside en el modelo neuronal en si (que es un Marian de OPUS-MT ya existente), sino en el formato: exportacion con optimum a ONNX (opset 17, sin past key/values), cuantizacion dinamica INT8 por tensor con onnxruntime, y una salida adicional de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder del decodificador en la capa 2. Esa salida permite obtener alineaciones palabra a palabra entre origen y destino sin alterar los pesos ni el proceso de decodificacion, algo util para subtitulado, resaltado sincronizado o evaluacion de calidad de la traduccion.

El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el efecto de la cuantizacion INT8 sobre un modelo Marian de tamano compacto. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre exportacion ONNX |
| Idiomas soportados | aleman (de) y neerlandes (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON (`tokenizer_runtime.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian, la arquitectura de traduccion automatica neuronal de código abierto usada por el proyecto OPUS-MT. Se trata de un transformer encoder-decoder entrenado sobre datos paralelos del corpus OPUS. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino adicionales; esa informacion corresponde al modelo original `Helsinki-NLP/opus-mt-de-nl` y no se reproduce aqui.

La innovacion tecnica de esta version es el pipeline de conversion: exportacion con optimum a ONNX con opset 17 y sin past key/values, seguida de cuantizacion dinamica INT8 por tensor con onnxruntime. Ademas, el decodificador expone una salida adicional, `alignment_shift_l2`, que corresponde a las probabilidades de atencion encoder de la capa 2. Segun la model card, se implementa como una Identity sobre un nodo existente, de modo que los pesos y la decodificacion permanecen inalterados. El repositorio incluye tambien `alignment.json`, un recibo que vincula esa salida de alineacion con el SHA-256 del decodificador, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los ids de vocabulario y a las cadenas de tokens de destino.

## Capacidades

- Traduccion automatica directa de aleman a neerlandes, sin pivotar por el ingles.
- Salida de alineacion de atencion encoder (`alignment_shift_l2`) para obtener correspondencias entre tokens de origen y destino.
- Inferencia on-device mediante ONNX Runtime con pesos cuantizados a INT8.
- Tokenizacion autocontenida en JSON, pensada para integrarse en un runtime propio sin dependencias del ecosistema Hugging Face.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Cobertura limitada a los dos idiomas indicados (de, nl).

## Casos de uso

- Subtitulado automatico de videos en aleman a neerlandes: el modelo traduce cada segmento y la salida de alineacion permite resaltar la correspondencia entre el texto original y el traducido, util para subtitulos sincronizados.
- Traduccion on-device en aplicaciones Android: el formato ONNX INT8 y el tokenizer en JSON permiten integrar el modelo en el runtime de una app sin conexion, como hace Subtitle Tap.
- Procesamiento por lotes de documentacion tecnica alemana hacia neerlandes en entornos con recursos limitados, aprovechando el bajo peso del artefacto (0,1 GB).
- Evaluacion de calidad de traduccion: la salida de atencion de la capa 2 puede usarse para analizar alineaciones y detectar desajustes entre segmentos.
- Traduccion de contenido web o correos en tiempo real en el navegador o en el dispositivo, evitando enviar texto a servidores externos.
- Pipeline de localizacion de productos para mercados neerlandofonos a partir de material fuente en aleman, con revision humana apoyada en las alineaciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que el modelo cuantizado INT8 es muy ligero y cabe en memoria de dispositivos moviles y GPUs de gama baja.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer reciente (por ejemplo, serie RTX 40) o incluso CPU seria suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del artefacto, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-nl-int8-shift-att | no disponible | no disponible | de, nl | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-de-nl | no disponible | no disponible | de, nl | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT de/nl | no disponible | no disponible | de, nl | Apache 2.0 | variable |

La comparativa se limita al modelo original del que deriva, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre la direccion aleman a neerlandes; no traduce en sentido inverso ni a otros idiomas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad en esta version cuantizada frente al modelo original.
- La cuantizacion INT8 puede introducir una ligera perdida de calidad respecto a los pesos en punto flotante; no se documenta su magnitud.
- La salida `alignment_shift_l2` es una exposicion de atencion de una capa concreta y no debe interpretarse como una alineacion perfecta; requiere validacion en el caso de uso.
- Riesgo de alucinacion y sesgos: no documentado en la model card; hereda las caracteristicas del modelo OPUS-MT original, entrenado sobre corpus OPUS.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El artefacto esta orientado a un runtime concreto (Subtitle Tap); su integracion en otros sistemas requiere adaptar el manejo del tokenizer JSON y de las salidas ONNX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-nl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-nl
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
