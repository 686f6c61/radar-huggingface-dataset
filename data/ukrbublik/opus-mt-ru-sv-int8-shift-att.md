# ukrbublik/opus-mt-ru-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-ru-sv-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-ru-sv`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (proyecto OPUS-MT, Jörg Tiedemann et al.). El modelo original traduce directamente del ruso (ru) al sueco (sv) sin pivotar por el ingles. Esta version concreta la publica el usuario ukrbublik para integrarla en el runtime OPUS on-device de la aplicacion Android Subtitle Tap.

La relevancia de esta ficha no esta en el modelo linguistico en si, sino en el formato de despliegue: se ha exportado con optimum (opset 17, sin past key/values) y se ha cuantizado dinamicamente a INT8 con onnxruntime (QInt8, per-tensor), lo que reduce el repositorio a unos 0,1 GB y lo hace apto para inferencia en dispositivos moviles. Ademas, el decodificador expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atencion encoder-decoder de la capa 2, pensada para alinear subtitulos.

Arquitectonicamente es un transformer encoder-decoder de tipo Marian, el estandar de la familia OPUS-MT, con licencia Apache 2.0. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, orientado a un caso de uso muy especifico: traduccion de subtitulos ru→sv en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; export ONNX opset 17 |
| Idiomas soportados | Ruso (ru) como origen, sueco (sv) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`); tokenizador en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-ru-sv` es un transformer encoder-decoder de la familia Marian, entrenado por el proyecto OPUS-MT sobre datos paralelos del corpus OPUS. La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aqui.

La innovacion tecnica de esta version es el pipeline de conversion: exportacion con optimum a ONNX (opset 17) sin past key/values, cuantizacion dinamica INT8 con onnxruntime y una modificacion del grafo del decodificador para exponer `alignment_shift_l2`, un nodo Identity sobre las probabilidades de atencion encoder-decoder de la capa 2. Segun el autor, los pesos y la decodificacion no cambian; solo se anade la salida de alineamiento. El repositorio incluye `alignment.json`, un recibo que vincula esa salida con el SHA-256 del decodificador.

## Capacidades

- Traduccion automatica directa ru→sv, sin pivotar por el ingles.
- Salida de alineamiento de atencion (`alignment_shift_l2`) para mapear tokens origen-destino, util para subtitulos.
- Inferencia on-device mediante onnxruntime, sin dependencia de GPU ni de servicios en la nube.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` (piezas, puntuaciones y cadenas destino mapeadas a ids).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Traduccion de subtitulos ru→sv en Android: el modelo se integra en el runtime OPUS de la app Subtitle Tap y traduce localmente cada segmento, sin enviar texto a un servidor.
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite asociar fragmentos del texto ruso con su correspondiente sueco para generar subtitulos sincronizados o resaltados.
- Traduccion offline en entornos sin conectividad: al ocupar unos 0,1 GB y ejecutarse con onnxruntime, cabe en dispositivos moviles y funciona sin red.
- Preprocesado de corpus ru→sv: util para generar traducciones preliminares de documentos o transcripciones antes de una revision humana.
- Prototipado de pipelines de traduccion en Python con onnxruntime: el par de ficheros ONNX se carga directamente sin necesidad de frameworks de deep learning pesados.
- Investigacion sobre alineacion de atencion: la exposicion de las probabilidades de la capa 2 facilita experimentos de interpretabilidad y de calidad de alineamiento en traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 0,1 GB en INT8, por lo que la huella en memoria es del orden de decenas a pocos cientos de MB segun el runtime.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU y ejecucion on-device.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque no es su objetivo.
- Cabe en dispositivos moviles: si, es el caso de uso declarado (app Android Subtitle Tap).
- Opciones de despliegue: onnxruntime (CPU o movil); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ru-sv-int8-shift-att | no disponible | no disponible | ru→sv | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-ru-sv | no disponible | no disponible | ru→sv | Apache 2.0 | safetensors / PyTorch |
| Otros OPUS-MT de la familia Marian | no disponible | no disponible | multiples pares | Apache 2.0 | safetensors / PyTorch |

La comparativa se limita al modelo base y a la familia OPUS-MT; no se dispone de datos de rendimiento para contrastar con alternativas.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes: no hay validacion comunitaria ni reportes de calidad.
- Solo cubre el par ru→sv; no traduce otros idiomas ni permite pivotar por ingles.
- No se han publicado benchmarks, por lo que la calidad de traduccion no esta cuantificada en esta ficha.
- Riesgo de alucinacion y de errores en terminologia especializada inherente a los modelos Marian de tamano reducido.
- La salida `alignment_shift_l2` es una modificacion del grafo; su semantica depende de la implementacion del autor y no esta estandarizada.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- La cuantizacion INT8 puede degradar ligeramente la calidad respecto al modelo original en PyTorch; no se documenta la magnitud de esa perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ru-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ru-sv
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
