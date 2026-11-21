# ukrbublik/opus-mt-en-sk-int8-shift-att

## Resumen

Este repositorio contiene una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica Helsinki-NLP/opus-mt-en-sk, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jorg Tiedemann et al.). El autor de la conversion, ukrbublik, lo publica para el runtime OPUS on-device de la aplicacion Android Subtitle Tap, con el objetivo de ejecutar traduccion ingles-eslovaco directamente en el dispositivo sin depender de servicios en la nube ni de conexion a internet.

Se trata de un modelo Marian de traduccion directa (sin pivote a traves del ingles) exportado con optimum a opset 17, sin past key/values, y cuantizado dinamicamente a INT8 (QInt8, per-tensor) mediante onnxruntime. Ademas de los dos grafos habituales (encoder y decoder), el decoder expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atencion encoder-decoder de la capa 2, pensada para alinear subtitulos con el texto traducido. Los pesos y la decodificacion no se modifican respecto al modelo base: solo cambia el formato de fichero.

El modelo es relevante para desarrolladores que necesitan traduccion en tiempo real de subtitulos en dispositivos moviles con recursos limitados: el repositorio ocupa unos 0,1 GB y el par de idiomas es en-sk, un par de relativamente pocos recursos comparado con en-de o en-fr. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en), eslovaco (sk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es un Marian (transformer encoder-decoder) entrenado por OPUS-MT sobre datos del corpus OPUS, un agregado de corpus paralelos publicos. La revision concreta convertida es `04d19ccd4566720bceeff93623d5cf93be659816` de Helsinki-NLP/opus-mt-en-sk. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; OPUS-MT se entrena de forma supervisada sobre corpus paralelos.

La conversion a ONNX usa optimum con opset 17 y sin past key/values, lo que implica que el decoder no reutiliza cache de atencion entre pasos de decodificacion. La cuantizacion es dinamica INT8 por tensor, aplicada con onnxruntime. La innovacion principal respecto al modelo original es la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atencion cruzada de la capa 2 del decoder, util para alinear tokens de origen y destino. El tokenizer se empaqueta en `tokenizer_runtime.json` (piezas y puntuaciones SentencePiece mapeadas a ids, mas las cadenas del vocabulario destino) y `alignment.json` actua como recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traduccion automatica directa de ingles a eslovaco, sin pivote intermedio.
- Generacion de alineamientos de atencion a nivel de capa 2 (`alignment_shift_l2`) para mapear tokens de origen y destino.
- Tokenizacion SentencePiece autocontenida en JSON, pensada para runtimes ligeros sin dependencias de la libreria transformers.
- Inferencia on-device en Android mediante onnxruntime.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada estrictamente al par en-sk.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicacion Subtitle Tap usa el par encoder/decoder INT8 para traducir subtitulos ingles-eslovaco en el dispositivo; el tamano de 0,1 GB y la cuantizacion INT8 permiten ejecutarlo sin GPU dedicada y sin conexion.
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite sincronizar cada segmento traducido con su fragmento de origen, util para generar ficheros SRT con marcas temporales coherentes entre idiomas.
- Traduccion offline en entornos sin red: dispositivos de campo, aviones o zonas con conectividad limitada donde no se puede llamar a una API de traduccion.
- Preprocesado de corpus en pipelines de NLP: traduccion masiva de textos en-ingles a eslovaco en local antes de tareas posteriores (analisis de sentimiento, indexacion) sin coste por token.
- Prototipado de aplicaciones de traduccion moviles: el formato ONNX con tokenizer JSON simplifica la integracion en apps nativas y permite medir latencia real en hardware de gama media.
- Investigacion sobre cuantizacion: sirve como referencia para comparar la calidad de un Marian INT8 frente al modelo original en un par de bajos recursos como en-sk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de cualquier dispositivo movil moderno.
- GPU recomendadas: no requiere GPU; esta disenado para CPU mediante onnxruntime.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque su objetivo es la inferencia en CPU.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap), y en general cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-sk-int8-shift-att | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Conversion con salida de alineamiento para on-device |
| Helsinki-NLP/opus-mt-en-sk | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base original, sin cuantizar ni salida de alineamiento |
| Otros modelos OPUS-MT en-sk | no disponible | no disponible | Apache 2.0 | variable | Alternativas del mismo proyecto para el mismo par |

## Limitaciones y advertencias

- Modelo de traduccion puro: no realiza otras tareas y no admite instrucciones ni conversacion.
- Calidad limitada por el par en-sk, con menos datos paralelos que pares como en-de; puede fallar en terminologia especializada o registro informal.
- Riesgo de alucinacion y de omisiones en frases largas o ambiguas, comun en modelos Marian pequenos.
- La cuantizacion INT8 puede degradar ligeramente la calidad respecto al modelo original; no se han publicado evaluaciones comparativas.
- El decoder no usa past key/values, lo que puede aumentar el coste de decodificacion en secuencias largas frente a exportaciones con cache.
- Sin datos publicados sobre longitud maxima de contexto; conviene limitar la longitud de los segmentos de entrada.
- Licencia Apache 2.0: permite uso comercial y modificacion, manteniendo la atribucion al grupo OPUS-MT de la Universidad de Helsinki.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-sk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-sk
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
