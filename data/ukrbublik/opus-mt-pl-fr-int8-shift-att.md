# ukrbublik/opus-mt-pl-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-pl-fr-int8-shift-att` es una conversión a formato ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-pl-fr`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. La conversión la firma el usuario ukrbublik y está pensada para su uso en la aplicación Android Subtitle Tap, que ejecuta traducción en el propio dispositivo mediante un runtime ONNX de OPUS. Traduce directamente del polaco al francés, sin pivotar por el inglés.

El modelo mantiene la arquitectura Marian propia de la familia OPUS-MT, con encoder y decoder exportados por separado mediante optimum (opset 17, sin past key/values) y cuantizados dinámicamente a INT8 por onnxruntime. La innovación respecto al modelo base es la exposición de una salida adicional de alineamiento (`alignment_shift_l2`), que devuelve las probabilidades de atención encoder-decoder de la capa 2 sin alterar los pesos ni el proceso de decodificación.

Su relevancia es acotada pero concreta: ofrece una traducción pl-fr de tamaño muy reducido (0,1 GB en el repositorio) lista para inferencia en dispositivos con recursos limitados, con licencia Apache 2.0 y artefactos específicamente empaquetados para un runtime móvil, incluyendo un tokenizador serializado y un fichero de recibo que vincula la salida de alineamiento al hash SHA-256 del decoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (exportado a ONNX, opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | polaco (pl), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizador en JSON (`tokenizer_runtime.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, el sistema de traduccion neuronal seq2seq desarrollado en el proyecto OPUS-MT. El modelo original `Helsinki-NLP/opus-mt-pl-fr` fue entrenado por el grupo de investigacion de tecnologia del lenguaje de la Universidad de Helsinki sobre datos del corpus OPUS. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; los modelos OPUS-MT se entrenan habitualmente con aprendizaje supervisado sobre pares de frases paralelas.

Esta version concreta no reentrena el modelo: solo cambia el formato. El export se realiza con optimum (opset 17, sin past key/values, lo que implica que la decodificacion no reutiliza cache entre pasos) y se aplica cuantizacion dinamica INT8 por tensor con onnxruntime. La particularidad tecnica es la salida `alignment_shift_l2`, que expone las probabilidades de atencion encoder-decoder de la capa 2 como una identidad sobre un nodo ya existente; los pesos y la decodificacion permanecen inalterados. El repositorio incluye ademas `alignment.json`, un recibo que vincula esa salida de alineamiento al hash SHA-256 del decoder, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a ids de vocabulario junto con las cadenas del vocabulario destino.

## Capacidades

- Traduccion de texto directa del polaco al frances, sin pivotar por el ingles.
- Generacion de alineamientos de atencion encoder-decoder (capa 2) mediante la salida `alignment_shift_l2`, util para inspeccionar correspondencias entre tokens origen y destino.
- Inferencia en dispositivo (on-device) gracias al formato ONNX cuantizado a INT8 y al tokenizador serializado en JSON.
- Ejecucion en runtime ONNX de OPUS, orientado a aplicaciones Android (Subtitle Tap).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Cobertura multilingue limitada exclusivamente al par pl-fr.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicacion Subtitle Tap puede traducir subtitulos polacos a frances en el propio dispositivo sin conexion, usando los ficheros ONNX INT8 y el tokenizador JSON incluidos en el repositorio.
- Traduccion offline en movilidad: al no requerir red ni servicio remoto, encaja en escenarios de viaje o entornos con conectividad limitada donde se necesite traducir contenido polaco al frances.
- Aplicaciones de accesibilidad: transcripcion y traduccion simultanea de audio o video en polaco para usuarios francoparlantes, con latencia baja al ejecutarse localmente.
- Analisis de alineamiento lexico: la salida `alignment_shift_l2` permite estudiar que tokens origen contribuyen a cada token generado, util en investigacion sobre traduccion neuronal o en herramientas de control de calidad de traducciones.
- Integracion en pipelines de procesamiento de documentos: traduccion por lotes de textos polacos a frances con un modelo de 0,1 GB desplegable en servidores modestos o incluso en CPU.
- Prototipado rapido de funciones de traduccion en aplicaciones moviles: el empaquetado ONNX + tokenizador JSON reduce el trabajo de integracion frente a convertir manualmente un modelo Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que la huella de memoria en INT8 es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna sirve; para inferencia por CPU es suficiente con hardware de gama media, dado el tamano del modelo.
- Cabe en GPU consumer: si, incluidas tarjetas de gama baja y entornos integrados; el destino principal es la inferencia en dispositivo movil.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio) y runtime ONNX de OPUS en Android; no se proporcionan artefactos GGUF ni configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pl-fr-int8-shift-att | no disponible | no disponible | pl-fr | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pl-fr (base) | no disponible | no disponible | pl-fr | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT pl-* | no disponible | no disponible | pl-otro idioma | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de parametros exactos para confrontarlo con alternativas de la misma categoria. La diferencia principal frente al original es el formato (ONNX INT8 frente a PyTorch), la ausencia de pivot por ingles y la salida adicional de alineamiento.

## Limitaciones y advertencias

- Solo cubre el par polaco-frances; no traduce otros idiomas ni funciona como modelo multilingue general.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo original en PyTorch; no se documenta la magnitud de esa degradacion.
- El export sin past key/values implica decodificacion sin cache, lo que puede aumentar el coste computacional por token generado en secuencias largas.
- Riesgo de alucinacion y de traducciones incorrectas inherente a los modelos Marian de traduccion, especialmente con frases largas, terminologia especializada o texto ruidoso.
- No se documentan sesgos especificos, pero al entrenarse sobre datos OPUS puede heredar los sesgos de dominio y de genero presentes en los corpus paralelos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribucion a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020) segun indica el autor.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay evidencia de validacion por parte de la comunidad.
- No se proporcionan datos sobre longitud maxima de contexto ni sobre el comportamiento del tokenizador en entradas fuera de dominio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ukrbublik/opus-mt-pl-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pl-fr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
