# ukrbublik/opus-mt-uk-es-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-uk-es-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-uk-es`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT). Resuelve la traduccion directa de ucraniano a espanol sin pivotar a traves del ingles, y su proposito principal es el despliegue en dispositivos moviles dentro de la aplicacion Android Subtitle Tap.

La arquitectura subyacente es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal. El autor del repositorio no ha modificado los pesos ni el proceso de decodificacion: solo ha exportado el modelo a formato ONNX (opset 17, sin past key/values) y lo ha cuantizado dinamicamente a INT8 (QInt8, per-tensor) mediante onnxruntime. Ademas, ha expuesto una salida adicional de alineacion (`alignment_shift_l2`) que corresponde a las probabilidades de atencion encoder del decodificador en la capa 2, util para alinear texto origen y destino.

Su relevancia es practica: ofrece un artefacto compacto (0,1 GB) listo para inferencia on-device en Android con onnxruntime, con licencia Apache 2.0 y un tokenizador empaquetado en JSON para evitar dependencias de SentencePiece en tiempo de ejecucion. No esta pensado como modelo de proposito general, sino como un componente de traduccion especializado y ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ucraniano (uk) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-uk-es` es un Marian NMT, un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado sobre datos del corpus OPUS (coleccion de corpus paralelos multilingues). El autor de este repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional; esos detalles corresponden al modelo original de Helsinki-NLP y no se reproducen en la model card de esta conversion.

La innovacion tecnica de este artefacto es la conversion a ONNX y la cuantizacion INT8 dinamica, que reduce el tamano y acelera la inferencia en CPU movil. La exportacion usa opset 17 y elimina las past key/values, lo que simplifica el grafo pero implica que el decodificador no reutiliza cache entre pasos. Se anade una salida `alignment_shift_l2` como identidad de un nodo existente, exponiendo las probabilidades de atencion encoder de la capa 2 sin alterar pesos ni decodificacion. El tokenizador se empaqueta en `tokenizer_runtime.json` con las piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, y `alignment.json` actua como recibo que vincula la salida de alineacion al SHA-256 del decodificador.

## Capacidades

- Traduccion de texto de ucraniano a espanol de forma directa, sin pivotar por ingles.
- Generacion de alineaciones de atencion encoder-destino mediante la salida `alignment_shift_l2`, util para correspondencias entre tokens origen y destino.
- Inferencia on-device en Android a traves de onnxruntime con pesos INT8.
- Tokenizacion autocontenida mediante `tokenizer_runtime.json`, sin dependencia de SentencePiece en runtime.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada estrictamente al par uk-es.

## Casos de uso

- Subtitulado automatico en Android: la app Subtitle Tap puede traducir subtitulos de ucraniano a espanol en el dispositivo, sin conexion, gracias al reducido tamano del modelo (0,1 GB) y a la cuantizacion INT8.
- Traduccion de documentos ucranianos a espanol en entornos sin red: el modelo puede integrarse en pipelines de escritorio o moviles con onnxruntime para procesar texto por lotes de forma local.
- Alineacion de corpus bilingues: la salida `alignment_shift_l2` permite construir correspondencias token a token entre ucraniano y espanol, util para anotacion linguistica o creacion de memorias de traduccion.
- Asistencia a refugiados y ONGs: traduccion de formularios, avisos y comunicaciones administrativas del ucraniano al espanol en dispositivos de bajo coste.
- Preprocesado en pipelines de NLP: traduccion de texto ucraniano a espanol antes de aplicar modelos de analisis de sentimiento o clasificacion entrenados en espanol.
- Traduccion de interfaz de usuario en aplicaciones: integracion como servicio ligero para localizar cadenas de texto de ucraniano a espanol en tiempo real.
- Prototipado de sistemas de traduccion: al ser un artefacto ONNX pequeno y con licencia permisiva, sirve como base para experimentar con cuantizacion y despliegue en dispositivos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (inferencia en CPU); en GPU el modelo INT8 ocupa aproximadamente 0,1 GB, por lo que cabe en cualquier GPU con mas de 1 GB de memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier modelo moderno (RTX 3060, RTX 4090, A100, H100) es sobredimensionado para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en CPU de movil.
- Opciones de despliegue: onnxruntime (principal, con soporte para Android), y potencialmente otros runtimes compatibles con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-es-int8-shift-att | no disponible | no disponible | uk, es | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-es (base) | no disponible | no disponible | uk, es | Apache 2.0 | safetensors / PyTorch |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk, en | Apache 2.0 | safetensors / PyTorch |

La comparativa se limita al modelo base y a la variante uk-en del mismo proyecto OPUS-MT, ya que no se dispone de datos de rendimiento de alternativas. La diferencia principal de este artefacto frente al modelo base es el formato (ONNX INT8 frente a PyTorch), la ausencia de cache de past key/values y la salida adicional de alineacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre OPUS, puede heredar sesgos de los corpus paralelos.
- Riesgo de alucinacion: presente como en cualquier modelo NMT; puede generar traducciones plausibles pero incorrectas, especialmente en dominios especializados o texto con ruido.
- Limitaciones de contexto o idioma: solo soporta el par uk-es; no se especifica la longitud maxima de contexto, y la exportacion sin past key/values puede afectar la eficiencia en secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020).
- Caveats para produccion: el modelo esta disenado para la app Subtitle Tap y su runtime concreto; la integracion en otros entornos requiere validar la compatibilidad del tokenizador JSON y la salida de alineacion. La cuantizacion INT8 puede degradar ligeramente la calidad respecto al modelo en punto flotante. El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-uk-es-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-uk-es-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-uk-es](https://huggingface.co/Helsinki-NLP/opus-mt-uk-es)
- [Paper OPUS-MT (Tiedemann y Thottingal, 2020)](https://aclanthology.org/2020.eamt-1.61/)
- [Repositorio OPUS-MT](https://github.com/Helsinki-NLP/OPUS-MT)
- [onnxruntime](https://github.com/microsoft/onnxruntime)
