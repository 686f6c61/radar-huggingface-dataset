# ukrbublik/opus-mt-pl-sv-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-pl-sv-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-pl-sv`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). Resuelve la traducción directa polaco-sueco sin pivotar por el inglés, y su interés principal radica en que está empaquetado para inferencia en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian, un transformer encoder-decoder de traducción neuronal. El repositorio incluye el encoder y el decoder exportados con Optimum (opset 17, sin past key/values) y cuantizados dinámicamente a INT8 por tensor con onnxruntime. La innovación específica de esta conversión es que el decoder emite además una salida de alineación (`alignment_shift_l2`), correspondiente a las probabilidades de atención encoder del layer 2, que permite mapear tokens de origen y destino sin alterar los pesos ni la decodificación.

El modelo es de tamaño reducido (el repositorio ocupa 0,1 GB) y está pensado exclusivamente para el par de idiomas polaco-sueco. No es un modelo generalista: es una pieza de infraestructura para subtitulado y traducción embebida. Su licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | polaco (pl) y sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), mas `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-pl-sv` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre datos del corpus OPUS. La conversión de este repositorio no reentrena ni modifica los pesos: solo cambia el formato. Se exporta con Optimum a ONNX (opset 17) sin past key/values y se aplica cuantización dinámica INT8 por tensor con onnxruntime.

La modificación técnica destacable es la salida adicional `alignment_shift_l2`, que expone las probabilidades de atención encoder de la capa 2 del decoder como una identidad sobre un nodo existente. Esto permite obtener alineaciones palabra a palabra entre origen y destino en tiempo de inferencia sin coste adicional de pesos ni cambios en la decodificación. El repositorio incluye un `alignment.json` que vincula esa salida con el SHA-256 del decoder, y un `tokenizer_runtime.json` que mapea las piezas y puntuaciones del modelo SentencePiece original a los ids de vocabulario. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción automática directa polaco a sueco, sin pivotar por el inglés.
- Generación de alineaciones de atención encoder-destino (`alignment_shift_l2`) para mapear tokens entre idiomas.
- Inferencia en dispositivo mediante onnxruntime, sin dependencia de servicios en la nube.
- Tokenización SentencePiece empaquetada en formato JSON para runtime propio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Multilingüismo limitado estrictamente al par pl-sv.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos polacos a sueco en el propio dispositivo usando los ficheros ONNX cuantizados, sin enviar texto a servidores externos.
- Traducción de documentos ofensivas en entornos sin conectividad: al ejecutarse con onnxruntime en local, es adecuado para portátiles o dispositivos embebidos con recursos limitados.
- Generación de alineaciones para memorias de traducción: la salida `alignment_shift_l2` permite construir pares de tokens alineados que alimentan herramientas de traducción asistida o control de calidad.
- Preprocesado en pipelines de localización: puede integrarse como etapa de traducción pl-sv dentro de un flujo mayor de gestión de contenidos, con la ventaja de que el formato ONNX es portable entre entornos.
- Prototipado de sistemas de traducción de bajo coste: el tamaño del repositorio (0,1 GB) y la cuantización INT8 lo hacen apropiado para experimentar en hardware modesto.
- Investigación sobre alineación de atención: la exposición de las probabilidades de atención del layer 2 facilita estudios de interpretabilidad y de calidad de alineación en traducción neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida gracias a la cuantización INT8 y al tamaño del repositorio (0,1 GB); no se dispone de cifra exacta.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución en CPU mediante onnxruntime.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU de dispositivos móviles, dado el tamaño del artefacto.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se proporcionan pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-pl-sv-int8-shift-att | no disponible (repo 0,1 GB) | no disponible | pl, sv | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-pl-sv | no disponible | no disponible | pl, sv | Apache 2.0 | PyTorch/safetensors |
| Otros modelos OPUS-MT pl-sv | no disponible | no disponible | pl, sv | Apache 2.0 | variable |

La comparación directa con alternativas de la misma categoría (traducción pl-sv) se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento publicados para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre el corpus OPUS, puede heredar sesgos presentes en los datos paralelos; no se documentan análisis específicos.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones fluidas pero incorrectas, especialmente en dominios especializados o con frases ambiguas.
- Limitaciones de idioma: solo cubre polaco y sueco; no admite otros pares ni traducción inversa sv-pl en este artefacto.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; el export sin past key/values implica decodificación no incremental, lo que puede afectar a la eficiencia en secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- Caveat para producción: el repositorio está pensado para el runtime específico de la app Subtitle Tap; su integración en otros sistemas requiere adaptar el cargador de tokenizer (`tokenizer_runtime.json`) y gestionar la salida de alineación.
- La cuantización INT8 puede introducir una degradación de calidad respecto al modelo original en PyTorch; no se documenta la magnitud de esa pérdida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-pl-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-pl-sv
- Referencia OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
