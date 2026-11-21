# ukrbublik/opus-mt-sv-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-sv-fr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-sv-fr`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Resuelve la traducción directa sueco→francés sin pivotar por el inglés, y su propósito principal es la inferencia en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La relevancia de esta variante es doble: por un lado, el formato ONNX con cuantización dinámica INT8 reduce el peso del repositorio a 0,1 GB, lo que lo hace apto para ejecutarse en un entorno móvil con onnxruntime; por otro, el autor añade una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder-decoder de la capa 2, útil para tareas de alineación a nivel de token en subtitulado.

El modelo base es un transformer Marian de la familia OPUS-MT, entrenado sobre datos OPUS y publicado bajo licencia Apache 2.0. Esta conversión solo modifica el formato de los ficheros (exportación ONNX y cuantización INT8), manteniendo los pesos y la decodificación originales intactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX; modelo base sin cuantizar también disponible |
| Idiomas soportados | sueco (sv), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`, opset 17, sin past key/values) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura estándar de la familia OPUS-MT. El entrenamiento original se realizó sobre datos paralelos del corpus OPUS y los pesos provienen de la revisión `3680e2686efce5a78a611deb7896447261785137` del repositorio `Helsinki-NLP/opus-mt-sv-fr`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica de esta variante es la exportación con `optimum` a opset 17 sin past key/values, seguida de cuantización dinámica INT8 con onnxruntime. Además, el decoder expone una salida adicional `alignment_shift_l2` que corresponde a las probabilidades de atención encoder-decoder de la capa 2 (implementada como una Identity sobre un nodo existente, sin alterar pesos ni decodificación). El repositorio incluye también `tokenizer_runtime.json`, que mapea los pieces y scores del modelo SentencePiece original a los ids de vocabulario y a las cadenas de tokens objetivo, y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa sueco→francés, sin pivotar por el inglés.
- Generación de texto traducido token a token con decodificación autoregresiva.
- Salida de alineación encoder-decoder a nivel de capa 2 (`alignment_shift_l2`), útil para correspondencias entre tokens origen y destino.
- Tokenizador SentencePiece empaquetado en formato JSON para uso en runtime propio.
- Inferencia en dispositivo mediante onnxruntime con pesos INT8.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par sv→fr.

## Casos de uso

- Subtitulado en dispositivo: la aplicación Subtitle Tap usa el modelo para traducir subtítulos del sueco al francés directamente en el teléfono, sin conexión a red, gracias al tamaño reducido (0,1 GB) y a la ejecución con onnxruntime.
- Traducción de documentos suecos en entornos sin conectividad: al ser un modelo ONNX INT8, puede desplegarse en dispositivos con recursos limitados donde no es viable ejecutar un modelo de mayor tamaño.
- Alineación de tokens para control de calidad de traducciones: la salida `alignment_shift_l2` permite inspeccionar qué tokens del texto fuente contribuyen a cada token traducido, útil en herramientas de revisión lingüística.
- Preprocesado en pipelines de localización: integración como etapa de traducción sv→fr en flujos automatizados de conversión de contenido, con la ventaja de no depender de una API externa.
- Prototipado de sistemas de traducción en Android: sirve como referencia para implementar runtimes OPUS en aplicaciones móviles con modelos cuantizados.
- Investigación en traducción de bajo recurso: el par sueco-francés y la arquitectura Marian permiten experimentar con técnicas de alineación y cuantización sobre un modelo base ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es muy reducida y apta para dispositivos móviles.
- GPU recomendadas: no disponible; el modelo está pensado para CPU y ejecución en dispositivo mediante onnxruntime.
- Compatibilidad con GPU de consumo: sí, por su tamaño reducido (0,1 GB) es viable en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-sv-fr-int8-shift-att | no disponible | no disponible | sv, fr | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-sv-fr (base) | no disponible | no disponible | sv, fr | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT sv→X | no disponible | no disponible | sv y lengua destino | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre el par sueco→francés; no admite otros idiomas ni direcciones inversas.
- Al ser una conversión del modelo base, hereda sus sesgos y posibles errores de traducción, especialmente en dominios especializados o texto con jerga.
- Riesgo de alucinación y de traducciones incorrectas en frases ambiguas, como en cualquier modelo Marian de tamaño moderado.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki según indica la model card.
- La salida de alineación `alignment_shift_l2` es una Identity sobre un nodo existente; su interpretación requiere conocer la implementación interna y no está documentada en detalle.
- No se documentan límites de longitud de contexto ni comportamiento con secuencias largas.
- El modelo está optimizado para on-device con onnxruntime; su uso en otros runtimes no está garantizado.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-sv-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-fr
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): no disponible como enlace en la información proporcionada
- Repositorio OPUS-MT: no disponible como enlace en la información proporcionada
- Documentación de onnxruntime: no disponible como enlace en la información proporcionada
