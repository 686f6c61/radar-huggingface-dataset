# ukrbublik/opus-mt-sv-nl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-sv-nl-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-sv-nl`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente del sueco (sv) al neerlandés (nl) sin pivotar por el inglés, y esta versión concreta está pensada para ejecutarse en el runtime OPUS on-device de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder seq2seq típico de la familia OPUS-MT. La conversión mantiene los pesos intactos y solo cambia el formato: exportación con Optimum a ONNX (opset 17, sin past key/values) y cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor). El repositorio ocupa aproximadamente 0,1 GB.

La particularidad de esta variante es que el decoder expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del nivel 2. Esta salida es una identidad sobre un nodo ya existente, de modo que no altera pesos ni decodificación, pero permite obtener alineamientos palabra a palabra útiles para subtitulado. El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | sueco (sv) como origen, neerlandés (nl) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo base es `Helsinki-NLP/opus-mt-sv-nl`, un sistema de traducción neuronal de la familia OPUS-MT construido sobre la arquitectura Marian, un transformer encoder-decoder con atención multi-cabeza estándar. Los pesos originales fueron entrenados por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS (Tiedemann y Thottingal, 2020). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta conversión concreta no reentrena ni modifica los pesos: exporta el modelo a ONNX con Optimum en opset 17 y sin past key/values, y aplica cuantización dinámica INT8 de onnxruntime. La innovación técnica relevante es la exposición de `alignment_shift_l2`, una salida que reproduce las probabilidades de atención encoder de la capa 2 mediante una identidad sobre un nodo existente. Esto permite extraer alineamientos de atención sin cambiar la lógica de decodificación, algo útil para aplicaciones de subtitulado donde se necesita saber qué token de origen corresponde a cada token traducido. El repositorio incluye además `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa de sueco a neerlandés, sin pivotar por el inglés.
- Generación de alineamientos de atención encoder (capa 2) mediante la salida `alignment_shift_l2`, útil para correspondencias palabra a palabra.
- Ejecución on-device: los ficheros ONNX cuantizados están pensados para inferencia local con onnxruntime.
- Tokenizador empaquetado en `tokenizer_runtime.json` con las piezas y puntuaciones del modelo SentencePiece original mapeadas a identificadores de vocabulario.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo seq2seq de traducción puro.
- Capacidad multilingüe limitada estrictamente al par sv→nl.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos de sueco a neerlandés en el dispositivo, sin conexión, gracias a los ficheros ONNX cuantizados y al runtime OPUS embebido.
- Generación de subtítulos bilingües alineados: la salida `alignment_shift_l2` permite construir correspondencias entre el texto origen y el traducido, útil para resaltar la palabra que se está pronunciando en un reproductor de vídeo.
- Traducción de documentación técnica sueca para equipos neerlandófonos en entornos con requisitos de privacidad, ya que la inferencia es local y no requiere enviar texto a servidores externos.
- Procesamiento por lotes de corpus sv→nl en pipelines de investigación: el formato ONNX permite integrar el modelo en flujos con onnxruntime sin depender de PyTorch.
- Traducción en dispositivos con recursos limitados (móviles, Raspberry Pi, portátiles sin GPU) gracias a la cuantización INT8 y al tamaño reducido del repositorio (0,1 GB).
- Evaluación comparativa de alineamientos de atención: investigadores que estudian la calidad de las correspondencias palabra a palabra en traducción neuronal pueden usar la salida de atención expuesta como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la cuantización INT8, el modelo es muy ligero y cabe holgadamente en memoria de dispositivos móviles.
- GPU recomendadas: no se especifican; al ser un modelo ONNX cuantizado INT8, está optimizado para CPU y para aceleradores de baja potencia (NPU/DSP móviles, CPU ARM).
- Cabe en GPU de consumo: sí, con margen amplio, aunque su diseño apunta a ejecución en CPU.
- Opciones de despliegue: onnxruntime (runtime principal), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-sv-nl-int8-shift-att` | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Salida de alineamiento de atención; orientado a on-device |
| `Helsinki-NLP/opus-mt-sv-nl` | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base original, sin cuantizar ni salida de alineamiento |
| Otros modelos OPUS-MT sv→nl | no disponible | no disponible | Apache 2.0 | variable | No se dispone de datos comparativos en la información |

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre el corpus OPUS, puede heredar sesgos de dominio y de género presentes en los textos paralelos; no se documentan análisis específicos.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones fluidas pero incorrectas en frases ambiguas o fuera de dominio.
- Cobertura lingüística restringida: solo traduce sv→nl; no admite otros pares ni direcciones inversas.
- Longitud de contexto no documentada: no se especifica el máximo de tokens por segmento; conviene validar el comportamiento en frases largas antes de usarlo en producción.
- La cuantización INT8 puede introducir una ligera degradación de calidad frente al modelo base en FP32; no se aportan métricas de esa pérdida.
- La salida `alignment_shift_l2` es una identidad sobre un nodo existente y no un mecanismo de alineamiento entrenado específicamente; su calidad como alineador debe validarse empíricamente.
- Licencia Apache 2.0: permite uso comercial, pero requiere mantener la atribución al grupo de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-sv-nl-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-nl
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
