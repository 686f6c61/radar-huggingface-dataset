# ukrbublik/opus-mt-it-en-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-it-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-it-en`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión, ukrbublik, lo ha adaptado para su uso en el runtime OPUS on-device de la aplicación Android Subtitle Tap, que realiza traducción directa italiano-inglés sin pivotar a través de una lengua intermedia.

La arquitectura subyacente es un transformer Marian de tipo encoder-decoder, el estándar de la familia OPUS-MT, exportado con optimum a opset 17 y cuantizado dinámicamente con onnxruntime a QInt8 por tensor. La innovación principal de esta variante es que el decodificador emite además una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder-decoder de la capa 2, lo que permite alineaciones a nivel de token para, por ejemplo, sincronizar subtítulos.

Es relevante para desarrolladores que necesiten traducción italiano-inglés en dispositivos con recursos limitados: el repositorio ocupa 0,2 GB, no requiere GPU y se ejecuta mediante onnxruntime. Al estar bajo licencia Apache 2.0, es apto para uso comercial. La información disponible sobre entrenamiento, benchmarks y rendimiento es escasa, ya que la model card se limita a documentar la conversión de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Marian encoder-decoder (Helsinki-NLP/opus-mt-it-en) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx), opset 17 |

## Arquitectura y entrenamiento

El modelo base es `Helsinki-NLP/opus-mt-it-en`, un transformer Marian de tipo encoder-decoder entrenado por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS. Esta conversión no modifica los pesos ni el proceso de decodificación: solo cambia el formato (exportación ONNX con optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8 por tensor con onnxruntime.

La modificación técnica destacable es la salida adicional `alignment_shift_l2`, que expone las probabilidades de atención encoder-decoder de la capa 2 del decodificador. Según la model card, se trata de una Identity sobre un nodo ya existente, por lo que los pesos y la decodificación permanecen inalterados. El repositorio incluye además `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los identificadores de vocabulario, y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción automática directa italiano-inglés, sin pivotar a través de una lengua intermedia.
- Generación de alineaciones a nivel de token mediante la salida `alignment_shift_l2` (probabilidades de atención encoder-decoder de la capa 2).
- Ejecución on-device en Android a través del runtime OPUS de la aplicación Subtitle Tap.
- Inferencia sin GPU mediante onnxruntime con pesos INT8.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par it-en.

## Casos de uso

- Subtitulado y traducción de vídeo en tiempo real: la salida `alignment_shift_l2` permite alinear tokens traducidos con los originales para sincronizar subtítulos en la app Subtitle Tap, y el tamaño reducido (0,2 GB) facilita su ejecución en el dispositivo.
- Traducción on-device en aplicaciones Android: al ejecutarse con onnxruntime y pesos INT8, no requiere conectividad ni infraestructura de servidor, lo que es adecuado para apps con requisitos de privacidad.
- Procesamiento por lotes de documentos italianos: integrable en pipelines de traducción con onnxruntime para convertir corpus de italiano a inglés de forma económica.
- Preprocesado en pipelines de NLP: traducción de textos italianos a inglés antes de aplicar modelos posteriores (análisis de sentimiento, extracción de entidades) que solo funcionen en inglés.
- Traducción de contenido de soporte y documentación: para equipos que gestionan material en italiano y necesitan versiones en inglés con bajo coste de despliegue.
- Prototipado y experimentación con alineaciones: la salida de atención de la capa 2 permite investigar técnicas de alineación palabra a palabra sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (ejecución on-device en CPU); el repositorio ocupa 0,2 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no disponibles; el modelo está pensado para inferencia en CPU mediante onnxruntime.
- Compatibilidad con GPU de consumo: no se documenta; el diseño apunta a dispositivos móviles Android, no a GPU de escritorio.
- Opciones de despliegue: onnxruntime (formato ONNX, opset 17); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-it-en-int8-shift-att | no disponible | no disponible | it→en | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-it-en | no disponible | no disponible | it→en | Apache 2.0 (modelo base) | safetensors/PyTorch |
| Otros modelos OPUS-MT it→en | no disponible | no disponible | it→en | Apache 2.0 | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; al entrenarse sobre el corpus OPUS, puede heredar sesgos de los datos paralelos originales.
- Riesgo de alucinación: no cuantificado; los modelos de traducción neuronal pueden generar traducciones plausibles pero incorrectas en dominios especializados o con texto ambiguo.
- Limitación de idioma: solo cubre el par italiano-inglés; no soporta otros pares ni traducción inversa.
- Limitación de contexto: la longitud máxima de contexto no está documentada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe mantenerse la atribución al grupo de la Universidad de Helsinki y citarse el trabajo de Tiedemann y Thottingal (2020).
- Caveat de producción: la cuantización INT8 puede introducir una degradación de calidad respecto al modelo original en PyTorch; no se han publicado evaluaciones comparativas.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-it-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-it-en
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Repositorio OPUS-MT (Helsinki-NLP): no disponible en la información proporcionada.
- Paper o blog adicional: no disponible en la información proporcionada.
