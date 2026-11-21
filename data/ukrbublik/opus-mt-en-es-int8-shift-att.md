# ukrbublik/opus-mt-en-es-int8-shift-att

## Resumen
Conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-en-es, desarrollada por ukrbublik para el motor OPUS en dispositivo de la aplicación Android Subtitle Tap. El modelo traduce directamente de inglés a español sin pivotar a través de una lengua intermedia, y añade una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder-decoder de la capa 2, útil para alinear segmentos de subtítulos.

Se trata de un transformer encoder-decoder de la familia Marian, exportado con optimum (opset 17, sin past key/values) y cuantizado dinámicamente con onnxruntime (QInt8, per-tensor). El repositorio pesa unos 0,1 GB, lo que refleja el tamaño compacto del modelo base original (del orden de decenas de millones de parámetros, típico de los modelos OPUS-MT base).

Su relevancia es práctica: ofrece inferencia en dispositivo en Android con un runtime ONNX ligero, licencia Apache 2.0 y una salida de alineación que facilita tareas de subtitulado sincronizado. No es un modelo de propósito general: está especializado en traducción en→es.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parámetros totales | no disponible (el modelo base OPUS-MT en→es es de escala base; no se especifica cifra) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | en (origen), es (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento
El modelo base es un Marian encoder-decoder entrenado por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.) sobre datos del corpus OPUS. La conversión mantiene intactos los pesos y la decodificación: solo cambia el formato (export ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 per-tensor con onnxruntime.

La innovación destacable es la salida `alignment_shift_l2`, que expone las probabilidades de atención encoder-decoder de la capa 2. Según la model card, se trata de una identidad sobre un nodo ya existente, por lo que no altera pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, más los strings del tokenizador destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades
- Traducción directa inglés → español, sin pivotar por una lengua intermedia.
- Salida de alineación de atención (capa 2) para tareas de correspondencia entre tokens origen y destino.
- Inferencia en dispositivo mediante ONNX Runtime, orientada a Android.
- Tokenizador SentencePiece empaquetado en formato JSON para uso en runtime.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo limitado al par en→es.

## Casos de uso
- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos en inglés a español en el propio dispositivo usando los ficheros ONNX, sin conexión ni servidor.
- Sincronización de subtítulos: la salida `alignment_shift_l2` permite mapear tokens origen y destino para ajustar tiempos y segmentación.
- Traducción de documentación técnica en pipelines offline: al ser un modelo compacto y cuantizado, puede integrarse en scripts de procesamiento por lotes sin GPU.
- Prototipado de traducción en entornos con recursos limitados: el tamaño del repo (0,1 GB) y la cuantización INT8 facilitan el despliegue en dispositivos de gama baja.
- Aplicaciones de accesibilidad: traducción en tiempo real de contenido en inglés para usuarios hispanohablantes en dispositivos móviles.
- Evaluación de alineación encoder-decoder: investigadores pueden usar la salida de atención para estudiar correspondencias léxicas en traducción automática.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible con cifra exacta; por el tamaño del repo (0,1 GB) y la cuantización INT8, la inferencia cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU/ONNX Runtime en Android.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no se aportan cifras de latencia.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); no se documentan otros formatos como GGUF, vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-es-int8-shift-att | no disponible (escala base) | no disponible | Apache 2.0 | ONNX INT8 | Añade salida de alineación de atención |
| Helsinki-NLP/opus-mt-en-es | no disponible (escala base) | no disponible | Apache 2.0 | PyTorch/safetensors | Modelo base original, sin cuantizar ni salida de alineación |
| Otros OPUS-MT en→es | no disponible | no disponible | Apache 2.0 | variable | Conversiones de la comunidad; no se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias
- Especializado únicamente en el par en→es; no soporta otros idiomas.
- No se documentan sesgos conocidos, pero al entrenarse sobre OPUS puede heredar sesgos de los corpus subyacentes.
- Riesgo de alucinación y de traducciones literales en dominios especializados no cubiertos por los datos de entrenamiento.
- La cuantización INT8 puede introducir una ligera degradación de calidad frente al modelo base en PyTorch.
- La salida de alineación es una identidad sobre un nodo existente; su utilidad depende de la correcta interpretación de las probabilidades de atención.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020).
- No se especifican límites de longitud de contexto ni de longitud de secuencia de entrada.

## Enlaces
- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
