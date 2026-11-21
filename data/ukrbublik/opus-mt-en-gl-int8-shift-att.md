# ukrbublik/opus-mt-en-gl-int8-shift-att

## Resumen

Este repositorio contiene una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica Helsinki-NLP/opus-mt-en-gl, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversion, ukrbublik, la publica para el runtime OPUS on-device de la aplicacion Android Subtitle Tap, con el objetivo de ejecutar traduccion ingles-galego directamente en el dispositivo, sin depender de servicios en la nube ni de un pivote a traves del ingles.

El modelo es un transformer encoder-decoder de arquitectura Marian, especializado en la direccion en→gl (ingles a gallego). Esta version concreta no entrena pesos nuevos: solo cambia el formato (export a ONNX con opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 per-tensor con onnxruntime. Ademas, el decoder expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atencion encoder-decoder de la capa 2, util para alinear tokens origen-destino en aplicaciones de subtitulado.

Su relevancia es practica: ofrece un modelo de traduccion pequeno (repo de 0,1 GB), con licencia Apache 2.0 y listo para inferencia en CPU via ONNX Runtime, lo que facilita el despliegue en entornos con recursos limitados o en aplicaciones moviles. La informacion publicada no detalla el numero exacto de parametros del modelo base, aunque por la familia OPUS-MT y el tamano del repositorio se trata de un modelo compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica per-tensor (QInt8) sobre ONNX; pesos originales del modelo base en safetensors |
| Idiomas soportados | ingles (en) y gallego (gl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) y tokenizer en JSON (`tokenizer_runtime.json`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Helsinki-NLP/opus-mt-en-gl, un transformer encoder-decoder de tipo Marian entrenado sobre datos del corpus OPUS para traduccion directa ingles-galego. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el modelo original se entreno con aprendizaje supervisado sobre pares de traduccion paralelos.

Esta conversion no modifica los pesos ni el proceso de decodificacion. El export a ONNX se realizo con optimum (opset 17) y sin past key/values, lo que implica que la decodificacion autoregresiva no reutiliza la cache de atencion entre pasos. La cuantizacion es dinamica INT8 per-tensor mediante onnxruntime. La innovacion principal es la exposicion de `alignment_shift_l2`, una salida Identity sobre un nodo ya existente que devuelve las probabilidades de atencion encoder-decoder de la capa 2, sin alterar pesos ni decodificacion. El repositorio incluye tambien `alignment.json`, un recibo que vincula esa salida con el SHA-256 del decoder.

## Capacidades

- Traduccion automatica directa de ingles a gallego, sin pivote intermedio por otra lengua.
- Generacion de alineamientos de atencion tokens origen-destino a partir de la capa 2 del decoder, orientados a aplicaciones de subtitulado.
- Inferencia on-device en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json`, con piezas, puntuaciones e identificadores de vocabulario mapeados.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni multimodalidad.
- Cobertura linguistica limitada exclusivamente al par en→gl.

## Casos de uso

- Subtitulado automatico en Android: la aplicacion Subtitle Tap puede traducir subtitulos ingleses a gallego en el propio dispositivo, con la salida de alineamiento para sincronizar y resaltar los tokens correspondientes entre idiomas.
- Traduccion offline en dispositivos sin conectividad: al ejecutarse con ONNX Runtime en CPU y ocupar unos 0,1 GB, el modelo cabe en moviles y portatiles modestos y permite traducir sin enviar texto a servidores externos.
- Procesamiento por lotes de documentos en gallego: pipelines de localizacion que conviertan contenido en ingles a gallego usando ONNX Runtime en servidores sin GPU, con coste de infraestructura bajo.
- Investigacion en alineacion de traduccion: la salida `alignment_shift_l2` permite estudiar y visualizar correspondencias lexicas entre origen y destino sin modificar el modelo ni reentrenarlo.
- Prototipado de sistemas de traduccion en entornos embebidos: integracion en aplicaciones de escritorio o IoT donde no es viable desplegar un runtime de PyTorch completo.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de la cuantizacion INT8 dinamica frente al modelo original en tareas de traduccion en→gl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecucion en CPU con ONNX Runtime; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; el modelo esta pensado para inferencia en CPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, CUDA o DirectML) podria acelerar la ejecucion, pero no hay datos publicados.
- Cabe en GPU de consumo: si, por el tamano del modelo, aunque no se documenta el rendimiento en esas plataformas.
- Opciones de despliegue: ONNX Runtime (principal), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-gl-int8-shift-att | no disponible | no disponible | en, gl | Apache 2.0 | ONNX INT8 | Conversion con salida de alineamiento para on-device |
| Helsinki-NLP/opus-mt-en-gl | no disponible | no disponible | en, gl | Apache 2.0 | safetensors (modelo base) | Modelo original sin cuantizar ni salida de alineamiento |
| Otros modelos OPUS-MT en→gl de la familia Helsinki-NLP | no disponible | no disponible | en, gl | Apache 2.0 | safetensors | Variantes de la misma familia con pesos sin cuantizar |

## Limitaciones y advertencias

- Solo traduce de ingles a gallego; no soporta otras direcciones ni otros pares linguisticos.
- Al ser una conversion cuantizada a INT8, puede presentar una ligera perdida de calidad respecto al modelo original en frases ambiguas o terminologia especializada; no se han publicado metricas que lo cuantifiquen.
- El export sin past key/values implica decodificacion menos eficiente en secuencias largas, ya que no reutiliza la cache de atencion.
- Riesgo de alucinacion y de traducciones incorrectas inherente a los modelos de traduccion neuronal, especialmente con jerga, nombres propios o texto fuera de dominio.
- Sesgos potenciales heredados de los datos OPUS de entrenamiento; no se documenta un analisis de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero conviene mantener la atribucion al grupo de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020) segun indica la model card.
- No hay informacion sobre el rendimiento en produccion, latencia ni pruebas de calidad; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-gl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-gl
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Referencia bibliografica: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
