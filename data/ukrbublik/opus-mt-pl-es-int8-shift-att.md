# ukrbublik/opus-mt-pl-es-int8-shift-att

## Resumen

Este repositorio contiene una conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-pl-es, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El autor de la conversión es ukrbublik, que la publica para el runtime OPUS en dispositivo de la aplicación Android Subtitle Tap. La traducción es directa entre polaco y español, sin pivote a través del inglés.

Se trata de un transformer encoder-decoder de tipo Marian, la arquitectura estándar de la familia OPUS-MT, exportado con optimum a opset 17 y cuantizado dinámicamente a INT8 (QInt8, per-tensor) mediante onnxruntime. El repositorio incluye además una salida adicional de alineación (`alignment_shift_l2`, probabilidades de atención encoder de la capa 2) que permite obtener correspondencias entre tokens origen y destino sin modificar pesos ni decodificación.

Su relevancia es práctica: ofrece un modelo de traducción pl→es de apenas 0,1 GB, ejecutable en CPU y en dispositivos móviles, con licencia Apache 2.0 y formato ONNX listo para onnxruntime. Es una opción para traducción de subtítulos y textos en local, sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (OPUS-MT) |
| Parametros totales | no disponible (repo de 0,1 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | polaco (pl) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es Helsinki-NLP/opus-mt-pl-es, un transformer encoder-decoder de la familia Marian entrenado sobre datos del corpus OPUS (textos paralelos de dominio público y licencias abiertas recopilados por OPUS). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales.

La conversion realizada por ukrbublik exporta el modelo con optimum (opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 con onnxruntime. El decoder incorpora una salida extra, `alignment_shift_l2`, que expone las probabilidades de atencion encoder de la capa 2 mediante una Identity sobre un nodo existente; los pesos y el proceso de decodificacion no se alteran. El repositorio incluye `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, mas las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineacion con el SHA-256 del decoder.

## Capacidades

- Traduccion automatica directa polaco→espanol, sin pivote por ingles.
- Generacion de alineaciones token a token entre origen y destino mediante `alignment_shift_l2`, util para subtitulado y resaltado sincronizado.
- Ejecucion en dispositivo (on-device) mediante onnxruntime, incluida CPU y entornos Android.
- Tokenizacion SentencePiece empaquetada en JSON para integracion en runtimes propios.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada estrictamente al par pl→es.

## Casos de uso

- Subtitulado automatico en Android: la app Subtitle Tap puede traducir subtitulos polacos a espanol en el dispositivo con el runtime OPUS, sin conexion de red, gracias al tamano reducido (0,1 GB) y al formato ONNX.
- Sincronizacion de subtitulos por palabra: la salida `alignment_shift_l2` permite mapear tokens origen y destino para resaltar o temporizar fragmentos traducidos.
- Traduccion de documentacion tecnica pl→es en pipelines por lotes: el modelo puede ejecutarse con onnxruntime en servidores CPU para procesar volumenes moderados de texto sin GPU.
- Preprocesado de datos multilingues: traduccion de corpus polacos a espanol para tareas posteriores de analisis, indexacion o entrenamiento de otros sistemas.
- Aplicaciones de escritorio o moviles con privacidad estricta: al ejecutarse localmente, el texto no sale del dispositivo, adecuado para contenido sensible.
- Prototipado rapido de funciones de traduccion: la licencia Apache 2.0 y el formato ONNX facilitan integrar el modelo en productos comerciales sin friccion legal.
- Traduccion de correos o mensajes cortos en herramientas ofimaticas: la latencia baja en CPU permite traduccion interactiva de fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,1 GB en INT8; la inferencia requiere del orden de unos cientos de MB de memoria, aunque no se dispone de cifras exactas publicadas.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraria la inferencia, pero no hay datos de rendimiento publicados.
- Cabe en GPU consumer: si, y tambien en dispositivos moviles y sistemas embebidos.
- Opciones de despliegue: onnxruntime (CPU o GPU), integracion en apps Android mediante el runtime OPUS de Subtitle Tap; no se distribuyen pesos en formato GGUF, safetensors ni para vLLM/TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pl-es-int8-shift-att | no disponible (0,1 GB INT8) | no disponible | pl→es | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pl-es (modelo base) | no disponible | no disponible | pl→es | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT pl→es o multilingues | no disponible | no disponible | varios | Apache 2.0 | safetensors/PyTorch |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineacion adicional.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en el par pl→es; no traduce otros idiomas ni direcciones inversas.
- Riesgo de alucinacion y de traducciones inexactas en dominios especializados (terminologia juridica, medica o tecnica muy especifica), habitual en modelos OPUS-MT de tamano reducido.
- Posibles sesgos heredados de los corpus OPUS, que pueden reflejar desequilibrios de genero, registro o dominio.
- No se dispone de informacion sobre la longitud maxima de contexto soportada; textos largos pueden requerir segmentacion.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto al modelo en precision completa, aunque no se han publicado metricas que la cuantifiquen.
- La salida de alineacion depende del SHA-256 del decoder registrado en `alignment.json`; cualquier modificacion del archivo ONNX invalida esa vinculacion.
- Licencia Apache 2.0: permite uso comercial con atribucion al trabajo original de la Universidad de Helsinki (Tiedemann y Thottingal, 2020).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-pl-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pl-es
- Paper de referencia OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS: https://opus.nlpl.eu/
