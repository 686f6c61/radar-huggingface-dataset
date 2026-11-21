# ukrbublik/opus-mt-en-ja-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-ja-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-tatoeba-en-ja`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (proyecto OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de inglés a japonés, sin pivotar a través de una lengua intermedia, y está pensado para ejecutarse en dispositivos móviles dentro de la aplicación Android Subtitle Tap.

La aportación de este repositorio no es el entrenamiento, sino el formato: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor), reduciendo el tamaño del artefacto a unos 0.1 GB. Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del layer 2, útil para alinear tokens origen-destino en subtítulos.

Es relevante para desarrolladores que necesitan traducción en inglés-japonés de baja latencia y ejecutable en local, sin GPU ni servicios en la nube, dentro de un runtime ONNX. La arquitectura subyacente es Marian (transformer encoder-decoder), el estándar de facto en la familia OPUS-MT, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en) y japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es `Helsinki-NLP/opus-tatoeba-en-ja`, un Marian NMT de tipo transformer encoder-decoder entrenado sobre datos OPUS (corpus Tatoeba para este par de lenguas). La model card del repositorio no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo técnicas de refinamiento posteriores; esa información corresponde al modelo original de Helsinki-NLP y no se reproduce aquí.

La conversión aplica una exportación con optimum a ONNX (opset 17, sin caché de past key/values, lo que implica recálculo completo del decoder en cada paso) y cuantización dinámica INT8 con onnxruntime. El decoder incorpora una salida extra, `alignment_shift_l2`, que es una identidad sobre un nodo de atención existente: expone las probabilidades de atención encoder del layer 2 sin alterar pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa inglés a japonés, sin pivotar por una lengua intermedia.
- Ejecución en dispositivo mediante ONNX Runtime con pesos INT8.
- Salida de alineamiento token a token (`alignment_shift_l2`) a partir de la atención del layer 2 del decoder.
- Tokenizador SentencePiece empaquetado en JSON para uso en runtime propio.
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- No es multimodal: solo texto.
- Uso monolingüe limitado al par en-ja; no se documentan otros idiomas.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap usa este modelo para traducir subtítulos en inglés a japonés en el propio dispositivo, aprovechando el runtime ONNX INT8 y el tamaño reducido del artefacto.
- Traducción offline de documentos: permite procesar texto en inglés a japonés sin conexión, útil en entornos con conectividad limitada o por motivos de privacidad.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite mapear tokens origen y destino para generar subtítulos sincronizados palabra a palabra.
- Preprocesado multilingüe en pipelines de datos: traducción por lotes de contenido en inglés a japonés antes de indexación o análisis.
- Aplicaciones de accesibilidad: traducción local de texto en pantalla o audio transcrito para usuarios japoneses, con latencia baja al no requerir red.
- Prototipado de traducción en edge: base para experimentar con cuantización INT8 y exportación ONNX en dispositivos de recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0.1 GB, por lo que la inferencia INT8 es viable en CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU/ARM en Android.
- Cabe en GPU consumer: sí, por tamaño, aunque el objetivo declarado es ejecución en dispositivo.
- Opciones de despliegue: ONNX Runtime (runtime principal), integrable en apps Android; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-ja-int8-shift-att | no disponible | no disponible | en, ja | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-tatoeba-en-ja | no disponible | no disponible | en, ja | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-jap | no disponible | no disponible | en, ja | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita a la familia OPUS-MT por falta de datos de rendimiento publicados para este artefacto concreto. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineamiento añadida.

## Limitaciones y advertencias

- Solo traduce inglés a japonés; no cubre la dirección inversa ni otros pares.
- Al ser una cuantización INT8, puede producirse una ligera degradación de calidad frente al modelo original en fp32, no cuantificada en la información disponible.
- La exportación sin past key/values implica recálculo completo del decoder, lo que puede aumentar la latencia en secuencias largas.
- Riesgo de alucinación y errores en terminología especializada, propio de los modelos NMT entrenados sobre corpus generales como OPUS/Tatoeba.
- Sesgos potenciales heredados del corpus de entrenamiento original; no documentados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera de la app del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-ja-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-tatoeba-en-ja
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
