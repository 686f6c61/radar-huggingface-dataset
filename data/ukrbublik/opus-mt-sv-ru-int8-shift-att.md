# ukrbublik/opus-mt-sv-ru-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-sv-ru-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-sv-ru`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Resuelve la traduccion directa sueco-ruso sin pivotar a traves del ingles, y su proposito principal es el despliegue en dispositivos moviles dentro de la aplicacion Android Subtitle Tap, que incorpora un runtime OPUS on-device.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue. El autor solo modifica el formato de los pesos (exportacion ONNX con opset 17 y cuantizacion dinamica INT8 de onnxruntime) y anade una salida auxiliar de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2, util para alinear subtitulos con el texto traducido. Los pesos y el proceso de decodificacion no cambian respecto al modelo base.

Arquitectonicamente es un transformer encoder-decoder estilo Marian, la familia usada por OPUS-MT, con un vocabulario SentencePiece compartido. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el efecto de la cuantizacion INT8 sobre un modelo de traduccion de tamano contenido. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | sueco (sv) como origen, ruso (ru) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es un Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal y entrenado sobre datos del corpus OPUS. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el modelo original se entreno con aprendizaje supervisado estandar sobre pares de traduccion paralelos.

La conversion realizada por `ukrbublik` exporta el modelo con optimum a ONNX (opset 17) sin cache de claves/valores (sin past key/values), lo que implica que la decodificacion es autoregresiva recalculando el contexto en cada paso, un compromiso habitual en runtimes moviles. Sobre esa exportacion se aplica cuantizacion dinamica INT8 de onnxruntime con esquema QInt8 per-tensor. La innovacion principal es la salida `alignment_shift_l2`: una operacion Identity sobre un nodo existente que expone las probabilidades de atencion encoder-decoder de la capa 2 del decoder, permitiendo alinear tokens de origen y destino sin alterar pesos ni decodificacion. El repositorio incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineacion con el SHA-256 del decoder.

## Capacidades

- Traduccion automatica directa de sueco a ruso, sin pivotar por el ingles.
- Exposicion de probabilidades de atencion cruzada de la capa 2 para alineacion token a token.
- Ejecucion on-device mediante onnxruntime con pesos INT8.
- Tokenizacion SentencePiece empaquetada en un JSON listo para runtime.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada estrictamente al par sv-ru.

## Casos de uso

- Subtitulado automatico en Android: la aplicacion Subtitle Tap usa el modelo para traducir subtitulos suecos a ruso en el propio dispositivo, sin conexion, gracias al runtime OPUS on-device y a los pesos INT8 de bajo peso.
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite mapear cada token traducido a su correspondiente en el texto original, util para generar subtitulos sincronizados o resaltados palabra a palabra.
- Traduccion de documentacion tecnica sv-ru en entornos sin red: al ejecutarse con onnxruntime en local, encaja en herramientas de escritorio o moviles que procesan texto confidencial sin enviarlo a un servicio externo.
- Preprocesado de corpus: uso como paso de traduccion masiva de textos suecos a ruso en pipelines de NLP, con la ventaja de un modelo de 0,1 GB facil de distribuir.
- Prototipado de sistemas de traduccion embebidos: sirve como referencia para integrar modelos Marian en runtimes moviles con cuantizacion INT8 y sin dependencias de GPU.
- Traduccion de interfaces de usuario: por su tamano reducido, puede empaquetarse en aplicaciones que necesiten traducir cadenas de UI sv-ru de forma dinamica y offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso previsto (inferencia en CPU via onnxruntime); en GPU el modelo INT8 de 0,1 GB cabria en cualquier GPU consumer.
- GPU recomendadas: no disponibles; el diseno apunta a ejecucion en CPU de dispositivos Android.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) por su tamano reducido, aunque no es el objetivo del artefacto.
- Opciones de despliegue: onnxruntime (principal), potencialmente integrable en llama.cpp no aplica (no es un modelo GGUF); vLLM y TGI no soportan directamente este formato ONNX Marian.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-sv-ru-int8-shift-att | no disponible | no disponible | sv→ru | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-sv-ru (base) | no disponible | no disponible | sv→ru | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-sv-en | no disponible | no disponible | sv→en | Apache 2.0 | safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineacion anadida; el rendimiento de traduccion deberia ser equivalente, aunque la cuantizacion INT8 puede introducir una ligera perdida de calidad no cuantificada en la informacion disponible.

## Limitaciones y advertencias

- Solo traduce de sueco a ruso; no es un modelo multilingue general.
- La cuantizacion INT8 dinamica puede degradar ligeramente la calidad de traduccion respecto al modelo original en FP32, sin datos publicados que lo cuantifiquen.
- La ausencia de past key/values implica recalcular el contexto en cada paso de decodificacion, lo que reduce la eficiencia en secuencias largas.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados o textos con terminologia poco frecuente, inherente a los modelos OPUS-MT.
- Sesgos potenciales heredados de los datos OPUS, que pueden reflejar desequilibrios de genero, dominio o registro.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) segun indica el autor.
- El modelo esta pensado para el runtime especifico de Subtitle Tap; su integracion en otros entornos requiere adaptar el manejo del tokenizer JSON y de la salida de alineacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-sv-ru-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-ru
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.10/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
