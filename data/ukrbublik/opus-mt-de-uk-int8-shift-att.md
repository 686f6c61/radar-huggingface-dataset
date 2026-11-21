# ukrbublik/opus-mt-de-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-de-uk-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-de-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de aleman (de) a ucraniano (uk) sin pivotar por el ingles, y esta pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap.

La aportacion del repositorio no es un nuevo entrenamiento, sino un cambio de formato y una modificacion minima de la salida: exportacion a ONNX (opset 17, sin past key/values) mediante optimum, cuantizacion dinamica INT8 (QInt8, per-tensor) con onnxruntime, y la exposicion de una salida adicional de alineacion (`alignment_shift_l2`) que corresponde a las probabilidades de atencion encoder-decoder de la capa 2. Esta salida es una identidad sobre un nodo ya existente, por lo que los pesos y el proceso de decodificacion no se alteran.

El modelo es relevante para escenarios de traduccion de subtitulos en tiempo real en dispositivos con recursos limitados: el repositorio ocupa unos 0,1 GB, la licencia es Apache 2.0 y la arquitectura subyacente es Marian, un transformer encoder-decoder compacto especializado en traduccion. Al no haber pivot por ingles, se evita la acumulacion de errores de una traduccion en dos saltos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible (modelo base OPUS-MT compacto; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; export ONNX opset 17 |
| Idiomas soportados | aleman (de) y ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), mas `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base OPUS-MT de Helsinki-NLP: un transformer encoder-decoder de tipo Marian, disenado especificamente para traduccion automatica y entrenado sobre datos del corpus OPUS. El modelo original fue desarrollado por Jörg Tiedemann y Santhosh Thottingal (EAMT 2020) y liberado bajo Apache 2.0. La conversion aqui descrita parte de la revision `a8ddab4329046d95e695b0f8193964f70bb90c65` del modelo base.

El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos detalles corresponden al modelo base y no se detallan en la model card disponible. La innovacion tecnica de esta version es doble: por un lado, la exportacion a ONNX sin past key/values (lo que simplifica el grafo para inferencia en movil) y la cuantizacion dinamica INT8 per-tensor; por otro, la exposicion de `alignment_shift_l2`, que devuelve las probabilidades de atencion cruzada de la capa 2 del decoder. Esta senal de alineacion permite mapear tokens de origen y destino, algo util para resaltar correspondencias en subtitulos. Segun la model card, esta salida es una identidad sobre un nodo existente, de modo que no modifica pesos ni decodificacion, y se acompana de un `alignment.json` que vincula la salida de alineacion al SHA-256 del decoder.

## Capacidades

- Traduccion directa de aleman a ucraniano, sin pivot por ingles.
- Generacion de texto traducido token a token mediante decodificacion autorregresiva.
- Salida de alineacion encoder-decoder (`alignment_shift_l2`, capa 2) para correspondencia entre tokens de origen y destino.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` (piezas y puntuaciones mapeadas a ids de vocabulario, mas cadenas de tokens destino).
- Inferencia en dispositivo mediante onnxruntime con pesos INT8.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de subtitulos en tiempo real en Android: el modelo esta disenado para el runtime OPUS de la app Subtitle Tap, con pesos INT8 y ONNX que permiten ejecucion on-device sin conexion, traduciendo lineas de subtitulo de aleman a ucraniano al vuelo.
- Resaltado de correspondencias en subtitulos: la salida `alignment_shift_l2` permite alinear tokens de origen y destino, util para interfaces que resaltan que palabra alemana corresponde a que palabra ucraniana.
- Traduccion offline en dispositivos con recursos limitados: al ocupar unos 0,1 GB y usar INT8, puede desplegarse en telefonos y tablets sin GPU dedicada.
- Preprocesado de contenido audiovisual aleman para audiencias ucranianas: traduccion de guiones, descripciones o metadata antes de su publicacion.
- Traduccion de documentacion tecnica o correspondencia de aleman a ucraniano en entornos sin conectividad, integrada en aplicaciones de escritorio via onnxruntime.
- Evaluacion de pipelines de traduccion directa frente a pivot por ingles: sirve como referencia para medir la perdida de calidad de la traduccion en dos saltos en el par de-uk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, COMET ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es muy reducida y compatible con ejecucion en CPU.
- GPU recomendadas: no se especifican; el diseno esta orientado a inferencia en CPU/dispositivo mediante onnxruntime.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido y la cuantizacion INT8, aunque no se documentan requisitos concretos.
- Opciones de despliegue: onnxruntime (runtime objetivo declarado, con encoder y decoder separados); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-uk-int8-shift-att | no disponible | no disponible | de, uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-de-uk (base) | no disponible | no disponible | de, uk | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-de-en + en-uk (pivot) | no disponible | no disponible | de, en, uk | Apache 2.0 | safetensors/PyTorch |

La comparativa cuantitativa de rendimiento no esta disponible. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineacion; frente a la alternativa con pivot por ingles, la ventaja es evitar la traduccion en dos saltos, a costa de depender de un unico par linguistico.

## Limitaciones y advertencias

- Solo cubre el par aleman-ucraniano; no es un modelo multilingue general.
- No se documentan sesgos especificos, pero al derivar de OPUS-MT hereda los sesgos y la calidad variable de los corpus OPUS.
- Riesgo de alucinacion y de traducciones incorrectas inherente a los modelos de traduccion neuronal, especialmente en dominios especializados o texto con ruido.
- La longitud de contexto no esta documentada; los modelos OPUS-MT suelen estar limitados a segmentos cortos, lo que puede afectar a textos largos.
- La salida de alineacion es una identidad sobre un nodo existente, pero su interpretacion depende del consumidor; no se garantiza su calibracion.
- Licencia Apache 2.0 permite uso comercial, pero conviene citar el trabajo original de Tiedemann y Thottingal (EAMT 2020) segun indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- No se documentan pruebas de robustez, cuantizacion ni evaluacion de la perdida de calidad introducida por INT8.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-uk
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
