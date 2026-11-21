# ukrbublik/opus-mt-ru-es-int8-shift-att

## Resumen

`ukrbublik/opus-mt-ru-es-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-ru-es`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de ruso a español, sin pivotar por el inglés, y está pensado para su ejecución en dispositivos (on-device) dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos paralelos del corpus OPUS. Esta versión concreta no modifica los pesos ni el proceso de decodificación: solo cambia el formato (exportación a ONNX con opset 17) y aplica cuantización dinámica INT8 de onnxruntime con esquema QInt8 por tensor. El repositorio ocupa aproximadamente 0,1 GB.

La particularidad del modelo es que el decodificador expone una salida adicional, `alignment_shift_l2`, que contiene las probabilidades de atención encoder-decoder de la capa 2. Esta salida es una identidad sobre un nodo ya existente y sirve para obtener alineamientos entre tokens de origen y destino, útil para aplicaciones de subtitulado donde se necesita sincronizar texto traducido con el audio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ruso (ru) como origen, espanol (es) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, la arquitectura empleada por OPUS-MT. Los pesos originales fueron entrenados por el grupo de investigación de la Universidad de Helsinki sobre datos paralelos del corpus OPUS, un agregado de corpus multilingües de dominio público y académico. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; en el contexto de OPUS-MT es habitual el entrenamiento supervisado sobre pares de frases paralelas.

La conversión realizada por `ukrbublik` exporta el modelo a ONNX con opset 17 y sin past key/values, y aplica cuantización dinámica INT8 con onnxruntime. El decodificador incorpora una salida adicional, `alignment_shift_l2`, que expone las probabilidades de atención de la capa 2 del encoder-decoder como una identidad de un nodo existente, sin alterar pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario junto con las cadenas de tokens destino, y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decodificador.

## Capacidades

- Traducción directa ruso a español sin pivotar por inglés.
- Generación de alineamientos token a token entre origen y destino mediante la salida `alignment_shift_l2` (atención de la capa 2).
- Inferencia on-device mediante onnxruntime con pesos cuantizados INT8.
- Tokenización compatible con el modelo SentencePiece original a través de `tokenizer_runtime.json`.
- Integración pensada para aplicaciones de subtitulado (Subtitle Tap) con sincronización de texto traducido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multimodales (visión, audio) ni de modo thinking.
- Cobertura limitada estrictamente al par de idiomas ru→es.

## Casos de uso

- Subtitulado automático en tiempo real: la salida `alignment_shift_l2` permite alinear cada token traducido con su correspondiente en ruso, lo que facilita la sincronización de subtítulos con el audio original en la app Subtitle Tap.
- Traducción on-device en Android: al estar exportado a ONNX e cuantizado a INT8, el modelo puede ejecutarse localmente sin conexión ni envío de datos a servidores, lo que reduce latencia y preserva la privacidad del contenido traducido.
- Procesamiento por lotes de documentos ru→es: el formato ONNX permite integrar el modelo en pipelines de traducción offline con onnxruntime, útil para volcar corpus o documentación técnica.
- Traducción de contenido periodístico o académico ruso: para equipos que necesitan previsualizar o publicar material en español con un modelo ligero y de licencia permisiva.
- Prototipado de sistemas de traducción en producción: al ser Apache 2.0 y ocupar 0,1 GB, sirve como componente base en pruebas de concepto de traducción automática sin depender de APIs externas.
- Investigación en alineamiento léxico: la exposición de las probabilidades de atención de la capa 2 permite estudiar correspondencias entre tokens sin modificar el modelo original, útil en experimentos de lingüística computacional.
- Traducción embebida en dispositivos de recursos limitados: la cuantización INT8 reduce el peso y los requisitos de memoria, lo que lo hace apto para entornos con VRAM o RAM restringidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es reducida y compatible con entornos de bajos recursos.
- GPU recomendadas: no disponible. Al ser un modelo cuantizado INT8 ejecutable con onnxruntime, puede funcionar en CPU y en GPUs consumer sin requisitos específicos documentados.
- Cabe en GPU consumer: sí, por el tamaño del repositorio (0,1 GB) y la cuantización INT8, aunque no se especifican modelos concretos.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ru-es-int8-shift-att | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Salida de alineamiento, on-device |
| Helsinki-NLP/opus-mt-ru-es | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base original, sin cuantizar |
| Otros modelos OPUS-MT ru→es | no disponible | no disponible | Apache 2.0 | variable | Variantes del proyecto OPUS-MT |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus OPUS, puede heredar sesgos de dominio y de composición del corpus.
- Riesgo de alucinación: presente como en cualquier modelo de traducción neuronal; no se han publicado evaluaciones específicas de fidelidad para esta conversión.
- Limitaciones de contexto o idioma: cobertura restringida exclusivamente al par ru→es; no traduce otros idiomas ni admite instrucciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020).
- Caveat para producción: la cuantización INT8 puede degradar ligeramente la calidad respecto al modelo original en PyTorch; no se han publicado métricas de esa degradación.
- La salida `alignment_shift_l2` es una identidad sobre un nodo existente y no altera la decodificación, pero su semántica depende de la implementación del consumidor.
- No se documentan garantías de soporte ni mantenimiento del repositorio (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ru-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ru-es
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
