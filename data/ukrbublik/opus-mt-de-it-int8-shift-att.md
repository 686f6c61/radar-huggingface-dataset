# ukrbublik/opus-mt-de-it-int8-shift-att

## Resumen

Este repositorio contiene una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica Helsinki-NLP/opus-mt-de-it, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). La conversion la firma el usuario ukrbublik y esta pensada para el runtime OPUS on-device de la aplicacion Android Subtitle Tap, de modo que la traduccion aleman-italiano se ejecute directamente en el dispositivo sin pasar por un servidor.

El modelo resuelve la traduccion directa de aleman a italiano sin pivotar por el ingles, lo que reduce latencia y perdida de fidelidad en entornos con recursos limitados. La arquitectura subyacente es Marian (transformer encoder-decoder), en su variante base de OPUS-MT, con un vocabulario SentencePiece compartido. El repositorio pesa aproximadamente 0,1 GB, coherente con la cuantizacion INT8 de un modelo de este tamano.

La aportacion especifica de esta conversion es la exportacion a ONNX con cuantizacion dinamica INT8 (QInt8, per-tensor) y la exposicion de una salida adicional de alineacion (`alignment_shift_l2`), que devuelve las probabilidades de atencion encoder del decoder en la capa 2. Esto permite a la aplicacion consumidora mapear tokens de origen y destino, util para subtitulos o interfaces que necesitan resaltar correspondencias. Los pesos y la decodificacion no se modifican respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; pesos originales en fp32 en el modelo base |
| Idiomas soportados | aleman (de), italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`, opset 17, sin past key/values) |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-de-it es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre corpus paralelos del proyecto OPUS. La model card del repositorio no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; estos datos corresponden al modelo original y no se reproducen aqui. El tokenizador es SentencePiece, cuyos fragmentos y puntuaciones se han mapeado a identificadores de vocabulario en `tokenizer_runtime.json`.

La innovacion tecnica de esta conversion es doble. Por un lado, la exportacion a ONNX mediante optimum (opset 17) con cuantizacion dinamica INT8 por tensor, orientada a inferencia en CPU movil. Por otro, la exposicion de `alignment_shift_l2`: una identidad sobre un nodo existente que emite las probabilidades de atencion encoder del decoder en la capa 2, sin alterar pesos ni decodificacion. El archivo `alignment.json` actua como recibo que vincula esa salida al SHA-256 del decoder, lo que permite verificar la integridad del artefacto. No se emplea decodificacion especulativa ni atencion lineal.

## Capacidades

- Traduccion de texto directa de aleman a italiano, sin pivotar por el ingles.
- Generacion de alineaciones token a token mediante la salida `alignment_shift_l2` (probabilidades de atencion encoder de la capa 2 del decoder).
- Ejecucion on-device en Android a traves del runtime OPUS de Subtitle Tap, sin dependencia de red.
- Tokenizacion SentencePiece empaquetada en formato JSON para su uso en el runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al par de, it; no cubre otros idiomas.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicacion Subtitle Tap usa los modelos ONNX cuantizados para traducir subtitulos de aleman a italiano en el propio dispositivo, evitando enviar texto a servidores y funcionando sin conexion.
- Traduccion offline en dispositivos de gama baja: la cuantizacion INT8 y el peso de 0,1 GB permiten desplegar el modelo en moviles con RAM limitada, donde un modelo fp32 no cabria con holgura.
- Resaltado de correspondencias en interfaces de traduccion: la salida `alignment_shift_l2` permite marcar que tokens alemanes originan cada token italiano, util en visores bilingues o herramientas didacticas.
- Verificacion de integridad en pipelines de despliegue: `alignment.json` liga la salida de alineacion al SHA-256 del decoder, lo que facilita auditorias de artefactos en CI/CD antes de publicar la app.
- Procesamiento por lotes de documentos de- it en entornos sin GPU: al ser ONNX con cuantizacion dinamica, se ejecuta en CPU mediante onnxruntime, adecuado para servidores modestos o edge.
- Prototipado de traduccion en navegador o WebAssembly: el formato ONNX es portable a runtimes web, lo que permite experimentar con traduccion de- it sin infraestructura de GPU.
- Base para fine-tuning o destilacion: al derivar del modelo Marian original, sirve como punto de partida para adaptaciones de dominio (legal, medico, tecnico) sobre el par de- it.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio pesa 0,1 GB en INT8; el modelo en memoria requiere aproximadamente 0,1-0,2 GB, apto para moviles y sistemas embebidos.
- GPU recomendadas: no requiere GPU; el objetivo declarado es la ejecucion on-device en CPU Android mediante onnxruntime.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en CPU; no se necesita A100 ni H100.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap), con posibilidad de usar otros ejecutores ONNX compatibles con opset 17.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-it-int8-shift-att | no disponible | no disponible | de, it | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-de-it (base) | no disponible | no disponible | de, it | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-de-en | no disponible | no disponible | de, en | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita a la familia OPUS-MT porque no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineacion adicional; los pesos y la calidad de traduccion se mantienen.

## Limitaciones y advertencias

- Solo traduce aleman a italiano; no cubre la direccion inversa ni otros pares idiomaticos.
- La cuantizacion INT8 puede introducir una ligera degradacion de calidad respecto al modelo fp32 original; no se han publicado metricas que la cuantifiquen.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados o con terminologia poco frecuente, inherente a los modelos OPUS-MT entrenados sobre corpus genericos.
- Sesgos heredados de los datos OPUS: posibles sesgos de genero, cultura y registro presentes en los corpus paralelos de origen.
- La salida de alineacion corresponde a la atencion de la capa 2 y puede no reflejar con precision alineamientos en frases largas o con orden alterado.
- No soporta tool calling, agentes ni razonamiento; su uso en produccion debe limitarse a traduccion.
- La licencia Apache 2.0 permite uso comercial, pero se exige atribucion al grupo OPUS-MT de la Universidad de Helsinki (Tiedemann y Thottingal, 2020); conviene conservar el aviso de atribucion en la distribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-it-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-it
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS: https://opus.nlpl.eu/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
