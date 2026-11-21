# ukrbublik/opus-mt-en-sl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-sl-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-zls`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce del ingles al esloveno de forma directa, sin pivotar por el ingles, y esta empaquetado especificamente para el runtime on-device de la aplicacion Android Subtitle Tap.

La relevancia de esta ficha no esta en la calidad de traduccion (heredada del modelo original), sino en el formato: exportacion con optimum a ONNX opset 17, cuantizacion dinamica INT8 por tensor con onnxruntime, y una salida adicional de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2. Esa salida permite alinear tokens de origen y destino, algo util para subtitulos, resaltado sincronizado o control de calidad de traduccion.

El repositorio pesa aproximadamente 0,1 GB y esta publicado bajo licencia Apache 2.0. Los pesos originales son de OPUS-MT (Jörg Tiedemann et al.), entrenados sobre datos OPUS; este repositorio solo cambia el formato de fichero y anade la salida de alineacion, sin modificar pesos ni decodificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (origen), sl (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, un transformer encoder-decoder clasico disenado para traduccion automatica, entrenado por el equipo de OPUS-MT sobre corpus paralelos del proyecto OPUS. El modelo original `Helsinki-NLP/opus-mt-en-zls` es multiobjetivo (cubre varias lenguas eslavas del sur); para seleccionar esloveno, el tokenizador de runtime antepone el token de prefijo `>>slv<<` a cada frase de origen mediante `sourcePrefixTokenIds`.

La conversion realizada por ukrbublik usa la exportacion de optimum (opset 17, sin cache de past key/values) y aplica cuantizacion dinamica INT8 por tensor con onnxruntime. Ademas, el decoder expone `alignment_shift_l2`, una salida que es una identidad sobre un nodo existente y que devuelve las probabilidades de atencion encoder-decoder de la capa 2; los pesos y el proceso de decodificacion no cambian. El repositorio incluye `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, mas las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineacion con el SHA-256 del decoder. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre fases de RLHF o DPO.

## Capacidades

- Traduccion directa de texto de ingles a esloveno, sin pivot intermedio.
- Salida de alineacion a nivel de tokens mediante `alignment_shift_l2` (probabilidades de atencion de la capa 2 del decoder), util para correspondencia origen-destino.
- Inferencia on-device con onnxruntime, pensada para entornos con recursos limitados (movil).
- Tokenizacion SentencePiece empaquetada en JSON para su uso en runtime sin dependencias de la libreria de tokenizadores de Hugging Face.
- Seleccion de idioma destino mediante prefijo `>>slv<<` en la entrada.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento; es exclusivamente un modelo de traduccion.

## Casos de uso

- Subtitulado en tiempo real en Android: el modelo esta empaquetado para el runtime on-device de Subtitle Tap, de modo que puede traducir subtitulos ingleses a esloveno en el dispositivo sin enviar texto a un servidor, con un repo de 0,1 GB y cuantizacion INT8.
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite mapear palabras del subtitulo original con su traduccion, util para resaltado sincronizado o para generar ficheros de subtitulos con correspondencia por token.
- Traduccion offline en aplicaciones moviles: al ser ONNX INT8 y no requerir GPU, puede integrarse en apps que necesiten traduccion en- sl sin conectividad.
- Control de calidad de traduccion: las probabilidades de atencion permiten detectar segmentos con alineacion debil (posibles omisiones o desalineaciones) y marcarlos para revision humana.
- Preprocesado de corpus para esloveno: traduccion masiva de textos ingleses a esloveno en pipelines ligeros, con coste de computo bajo gracias a la cuantizacion.
- Prototipado de sistemas de traduccion en navegador o edge: el formato ONNX con opset 17 es compatible con onnxruntime Web y con runtimes embebidos, lo que facilita demos y pruebas de concepto sin infraestructura de servidor.
- Traduccion de documentacion tecnica o interfaces de usuario en- sl en entornos con requisitos de privacidad, ya que la inferencia local evita el envio de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repo completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de cualquier dispositivo movil o GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con onnxruntime. En caso de usar GPU, cualquier tarjeta con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en GPUs integradas; el cuello de botella es la CPU en movil.
- Opciones de despliegue: onnxruntime (runtime nativo de Android, Python, C++), onnxruntime Web; no se distribuyen pesos en formato GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente sin conversion adicional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-sl-int8-shift-att | no disponible | no disponible | en, sl | Apache 2.0 | ONNX INT8 | Salida de alineacion, on-device |
| Helsinki-NLP/opus-mt-en-zls (base) | no disponible | no disponible | en, zls (multiobjetivo) | Apache 2.0 | safetensors/PyTorch | Modelo original sin cuantizar |
| Helsinki-NLP/opus-mt-en-sv (ejemplo OPUS-MT) | no disponible | no disponible | en, sv | Apache 2.0 | safetensors/PyTorch | Otro par de lenguas del mismo proyecto, no comparable en idioma |
| Modelos NLLB-200 (Meta) | hasta 54.500 M | no disponible | 200 idiomas | CC-BY-NC 4.0 | safetensors/PyTorch | Cobertura multilingue mucho mayor, licencia no comercial |

La comparacion directa mas justa es con el modelo base `Helsinki-NLP/opus-mt-en-zls`: misma calidad de traduccion esperada (los pesos no cambian), pero este repositorio anade cuantizacion INT8, formato ONNX y la salida de alineacion. Frente a NLLB-200, la cobertura de idiomas es mucho menor, pero la licencia Apache 2.0 permite uso comercial sin las restricciones de CC-BY-NC.

## Limitaciones y advertencias

- Solo traduce en direccion ingles a esloveno; no soporta la direccion inversa ni otros pares de lenguas.
- El modelo original es multiobjetivo; si no se antepone el prefijo `>>slv<<` mediante `sourcePrefixTokenIds`, la salida puede corresponder a otra lengua eslava del sur.
- La cuantizacion INT8 dinamica puede introducir una perdida de calidad frente al modelo en precision completa; no se han publicado metricas que cuantifiquen esa diferencia.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (terminologia tecnica, juridica o medica), comun en modelos NMT de este tamano.
- Sesgos heredados de los corpus OPUS, que pueden reflejar desequilibrios de genero, dominio o registro presentes en los datos de entrenamiento.
- La salida de alineacion es una identidad sobre un nodo existente; su semantica depende de la implementacion del decoder y no esta documentada en detalle mas alla de la capa 2.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribucion a OPUS-MT y citar el trabajo de Tiedemann y Thottingal (2020).
- No hay datos publicados de contexto maximo, por lo que frases o documentos muy largos pueden truncarse o degradar la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-sl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-zls
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- OPUS (corpus): https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
