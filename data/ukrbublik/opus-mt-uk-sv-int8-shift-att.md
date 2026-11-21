# ukrbublik/opus-mt-uk-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-sv-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-uk-sv`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT (Tiedemann y Thottingal, 2020). El modelo traduce directamente del ucraniano (`uk`) al sueco (`sv`), sin pivotar por el inglés, y está pensado para ejecutarse en el runtime OPUS on-device de la aplicación Android Subtitle Tap.

La arquitectura de origen es Marian NMT, un transformer encoder-decoder entrenado sobre corpus paralelos del proyecto OPUS. Esta versión concreta exporta el modelo a formato ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8 per-tensor con onnxruntime, lo que reduce el tamaño del repositorio a unos 0,1 GB. Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del layer 2, útil para alinear tokens entre origen y destino en tareas de subtitulado.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para un caso de uso muy específico (traducción de subtítulos en un dispositivo Android), no de un modelo nuevo. No aporta mejoras de calidad respecto al modelo base, sino un cambio de formato y de cuantización, con una salida de alineación añadida que no altera los pesos ni la decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ucraniano (uk) como origen, sueco (sv) como destino |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |
| Opset | 17 |
| Salidas adicionales | `alignment_shift_l2` (probabilidades de atencion encoder del layer 2) |
| Modelo base | Helsinki-NLP/opus-mt-uk-sv (revision `59aa0aae49e80c4fbd64983e725ad077cd06fae3`) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Marian NMT, una arquitectura transformer encoder-decoder desarrollada para traducción automática neuronal y entrenada sobre corpus paralelos del proyecto OPUS. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo card original de Helsinki-NLP no se incluye en los datos proporcionados.

La innovación técnica de esta conversión concreta es doble. Por un lado, la exportación a ONNX con `optimum` (opset 17, sin past key/values) y la cuantización dinámica INT8 per-tensor con onnxruntime, orientadas a reducir el peso y acelerar la inferencia en dispositivos móviles. Por otro, la exposición de la salida `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder del layer 2 del decoder; según el autor, se implementa como una Identity sobre un nodo existente, de modo que los pesos y el proceso de decodificación no se modifican. El repositorio incluye además un `alignment.json` que vincula esa salida con el SHA-256 del decoder, y un `tokenizer_runtime.json` que mapea las piezas y puntuaciones del modelo SentencePiece original a los ids de vocabulario.

## Capacidades

- Traducción automática directa ucraniano → sueco, sin pivotar por inglés.
- Generación de texto traducido token a token mediante decodificación autoregresiva del decoder Marian.
- Salida de alineación de atención (`alignment_shift_l2`) para relacionar tokens de origen y destino.
- Ejecución on-device en Android mediante el runtime OPUS de la aplicación Subtitle Tap.
- Inferencia con onnxruntime en formato ONNX cuantizado INT8.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Subtitulado en tiempo real en Android: el modelo se integra en el runtime OPUS on-device de Subtitle Tap para traducir subtítulos de ucraniano a sueco sin conexión, gracias al formato ONNX INT8 y al tamaño reducido del repositorio (0,1 GB).
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite asociar tokens del subtítulo original con los del traducido, útil para generar ficheros de subtítulos con marcas temporales por palabra o por segmento.
- Traducción de documentación técnica ucraniana a sueco: al ser un modelo directo sin pivot, evita la propagación de errores que introduce la traducción en dos saltos (uk→en→sv) en textos con terminología específica.
- Procesamiento por lotes de corpus uk→sv: la exportación ONNX permite ejecutar la traducción con onnxruntime en servidores sin GPU, con cuantización INT8 para reducir requisitos de memoria.
- Aplicaciones de accesibilidad: traducción de contenido audiovisual ucraniano para usuarios suecohablantes en dispositivos de gama media, donde el tamaño y la latencia del modelo son críticos.
- Investigación en alineación de atención: el acceso a las probabilidades de atención del layer 2 facilita experimentos sobre interpretabilidad y alineación léxica en modelos Marian.
- Pipeline de localización de contenido: integración en flujos de traducción de vídeo donde se requiere un modelo ligero y determinista para el par uk→sv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo cuantizado INT8 cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no se especifican; al ser un modelo Marian de tamaño base cuantizado, es viable en CPU y en GPUs consumer.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM; no se dispone de cifras exactas.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio), runtime OPUS on-device de Subtitle Tap. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de la familia Llama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-sv-int8-shift-att | no disponible | no disponible | uk→sv | apache-2.0 | ONNX INT8 | Conversion on-device con salida de alineacion |
| Helsinki-NLP/opus-mt-uk-sv | no disponible | no disponible | uk→sv | apache-2.0 | safetensors/PyTorch | Modelo base original, sin cuantizar |
| Helsinki-NLP/opus-mt-uk-en + opus-mt-en-sv | no disponible | no disponible | uk→en, en→sv | apache-2.0 | safetensors/PyTorch | Traduccion en dos saltos via ingles, mayor propagacion de errores |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato y cuantización, no un modelo nuevo: la calidad de traducción es la del modelo base `Helsinki-NLP/opus-mt-uk-sv`, sin mejoras.
- La cuantización INT8 dinámica puede introducir una degradación adicional de calidad respecto al modelo en punto flotante; no se documenta su magnitud.
- Solo cubre el par uk→sv; no traduce en sentido inverso ni a otros idiomas.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos NMT, especialmente en terminología especializada, nombres propios y textos con ruido.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus OPUS puede heredar los sesgos de dominio y de género presentes en esos datos.
- La licencia apache-2.0 permite uso comercial, pero se recomienda citar el trabajo original de OPUS-MT (Tiedemann y Thottingal, 2020) según indica el autor.
- El modelo está diseñado para el runtime OPUS de Subtitle Tap; su uso fuera de ese entorno requiere adaptar el `tokenizer_runtime.json` y gestionar manualmente la salida `alignment_shift_l2`.
- No se dispone de información sobre la longitud máxima de secuencia soportada, lo que limita la planificación de despliegues con textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-sv
- Paper OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no disponible como enlace en la información proporcionada
- Repositorio del proyecto OPUS-MT: no disponible como enlace en la información proporcionada
- Aplicación Subtitle Tap: no disponible como enlace en la información proporcionada
