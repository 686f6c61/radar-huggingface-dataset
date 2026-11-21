# ukrbublik/opus-mt-en-id-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-id-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-id`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a indonesio, sin pivotar a través de una lengua intermedia, y está pensado para ejecutarse en el dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

La aportación de este repositorio no es un nuevo entrenamiento, sino un cambio de formato y una modificación estructural mínima: exportación a ONNX (opset 17, sin past key/values), cuantización dinámica INT8 por tensor con onnxruntime, y la exposición de una salida adicional de alineación (`alignment_shift_l2`) que corresponde a las probabilidades de atención encoder del nivel 2 del decodificador. Los pesos y el proceso de decodificación permanecen idénticos al modelo base.

Se trata de un modelo Marian de tamaño base (del orden de decenas de millones de parámetros, típico de la familia OPUS-MT), con licencia Apache 2.0 y un repositorio de apenas 0,1 GB, lo que lo hace adecuado para inferencia ligera en entornos con recursos limitados. Su relevancia radica en el uso de la alineación de atención como señal auxiliar para tareas de subtitulado (sincronización palabra a palabra), un caso de uso poco habitual en modelos de traducción estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parámetros totales | no disponible (familia OPUS-MT base; cifra exacta no publicada en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | inglés (en) → indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, una arquitectura transformer encoder-decoder diseñada específicamente para traducción automática y entrenada sobre datos del corpus OPUS. La model card original de OPUS-MT (Tiedemann y Thottingal, 2020) describe el entrenamiento sobre datos paralelos multilingües de OPUS; los detalles concretos de número de tokens, composición del dataset y si hubo fine-tuning con RLHF/DPO no se especifican en la información disponible para este repositorio.

La conversión realizada por `ukrbublik` aplica una exportación con optimum a opset 17 sin past key/values (es decir, sin caché de atención entre pasos de decodificación) y una cuantización dinámica INT8 por tensor con onnxruntime. La innovación destacable es la exposición de `alignment_shift_l2`: una salida adicional que es una Identity de un nodo ya existente en el grafo y que devuelve las probabilidades de atención encoder de la capa 2 del decodificador. Esto permite obtener alineaciones palabra a palabra sin alterar los pesos ni el comportamiento de decodificación. El repositorio incluye además `alignment.json`, un recibo que vincula la salida de alineación con el hash SHA-256 del decodificador, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los ids de vocabulario y a las cadenas de tokens destino.

## Capacidades

- Traducción directa inglés → indonesio sin pivotar por una lengua intermedia.
- Generación de alineaciones de atención a nivel de capa 2 del decodificador (`alignment_shift_l2`), útiles para sincronización palabra a palabra en subtítulos.
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json` para uso en tiempo de ejecución.
- Inferencia on-device optimizada mediante ONNX Runtime con cuantización INT8.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada exclusivamente al par en→id.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado automático en dispositivos Android: la app Subtitle Tap puede traducir subtítulos de inglés a indonesio en el propio dispositivo, sin conexión, aprovechando el modelo ONNX INT8 y la salida de alineación para sincronizar cada palabra con su marca de tiempo.
- Traducción de documentación técnica en tiempo real: integrado en un pipeline ligero, permite traducir textos de interfaz o ayuda en inglés a indonesio con baja latencia gracias al tamaño reducido del repositorio (0,1 GB).
- Aplicaciones de accesibilidad offline: traducción de contenido en inglés a indonesio en entornos sin conectividad, como dispositivos de lectura o asistentes de voz locales.
- Procesamiento por lotes de corpus en→id: al ser un modelo Marian estándar exportado a ONNX, puede ejecutarse en servidores con onnxruntime para traducir grandes volúmenes de texto con coste computacional bajo.
- Investigación en alineación de atención: la salida `alignment_shift_l2` permite estudiar correspondencias léxicas entre inglés e indonesio sin necesidad de herramientas de alineación externas.
- Prototipado de traducción en aplicaciones de escritorio o web: el formato ONNX es portable a múltiples runtimes (onnxruntime-web, onnxruntime-node), facilitando demos rápidas de traducción en→id.
- Evaluación de cuantización: sirve como referencia para medir la pérdida de calidad de INT8 dinámica frente al modelo original en un par de idiomas concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con onnxruntime. En caso de usar GPU, cualquier tarjeta moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos móviles Android (objetivo original del autor).
- Opciones de despliegue: ONNX Runtime (CPU/GPU/móvil), onnxruntime-web, onnxruntime-node. No se distribuye en formato GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversión adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-id-int8-shift-att | no disponible (familia OPUS-MT base) | no disponible | en→id | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-id | no disponible (familia OPUS-MT base) | no disponible | en→id | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-en-mul | no disponible (familia OPUS-MT base) | no disponible | en→múltiples | Apache 2.0 | PyTorch/safetensors |

El modelo base `Helsinki-NLP/opus-mt-en-id` ofrece la misma calidad de traducción en formato PyTorch, mientras que esta versión añade cuantización INT8 y la salida de alineación, a costa de perder la caché de atención (sin past key/values) y de requerir ONNX Runtime. La variante multilingüe `opus-mt-en-mul` cubre más idiomas de destino pero no proporciona alineaciones específicas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datos OPUS, puede reproducir sesgos presentes en los corpus paralelos originales; no se documentan análisis específicos de sesgo para este par de idiomas.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones plausibles pero incorrectas, especialmente en frases ambiguas o dominios especializados.
- Limitaciones de contexto o idioma: solo cubre en→id; no soporta otros pares ni traducción inversa. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo de investigación de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- Caveat para producción: la exportación sin past key/values implica recálculo completo del decodificador en cada paso, lo que puede aumentar la latencia en secuencias largas frente a versiones con caché.
- La salida de alineación es una Identity de un nodo existente; su interpretación correcta depende del uso previsto y no se garantiza su estabilidad semántica ante futuras revisiones del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-id-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-id
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): no disponible como enlace directo en la información proporcionada
- Repositorio OPUS-MT: no disponible en la información proporcionada
- Aplicación Subtitle Tap: no disponible enlace en la información proporcionada
