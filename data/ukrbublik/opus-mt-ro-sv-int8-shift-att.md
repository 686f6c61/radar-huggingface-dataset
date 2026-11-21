# ukrbublik/opus-mt-ro-sv-int8-shift-att

## Resumen

OPUS-MT ro→sv INT8 ONNX with Shift-Att es una conversión del modelo de traducción automática Helsinki-NLP/opus-mt-ro-sv, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de rumano a sueco, sin pivotar a través del inglés, y está empaquetado en formato ONNX con cuantización dinámica INT8 para su ejecución en dispositivos Android dentro de la aplicación Subtitle Tap.

La arquitectura de origen es Marian, un transformer encoder-decoder entrenado sobre datos de OPUS, con licencia Apache 2.0. Esta conversión no modifica los pesos ni el proceso de decodificación: solo cambia el formato de los ficheros (exportación a ONNX con opset 17 y cuantización QInt8 por tensor) y añade una salida auxiliar de alineación a nivel de atención del codificador en la capa 2, útil para aplicaciones de subtitulado que necesitan correspondencias entre tokens de origen y destino.

El repositorio ocupa 0,1 GB, no tiene descargas ni likes registrados y fue creado en noviembre de 2026. Es relevante para desarrolladores que necesiten traducción rumano-sueco en local, con bajo consumo de recursos y sin dependencia de servicios en la nube, especialmente en el contexto de subtitulado o procesamiento de texto en tiempo real en dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | rumano (ro), sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, un transformer encoder-decoder con atención multi-cabeza estándar, entrenado por el grupo OPUS-MT sobre corpus paralelos de OPUS. La conversión a ONNX usa opset 17 y elimina las claves/valores pasados (no past key/values), lo que implica que la decodificación se realiza sin caché de estados previos en el grafo exportado. La cuantización es dinámica INT8 con granularidad por tensor, aplicada con onnxruntime.

La innovación principal de esta conversión es la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atención encoder del decodificador en la capa 2, sin alterar pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece mapeadas a ids de vocabulario y cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Traducción directa rumano → sueco, sin pivotar por inglés.
- Salida de alineación de atención encoder en la capa 2 (`alignment_shift_l2`), útil para correspondencias token a token.
- Ejecución en dispositivo mediante ONNX Runtime con cuantización INT8.
- Tokenizador SentencePiece empaquetado en JSON para uso en runtime.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Capacidad multilingüe limitada exclusivamente al par ro→sv.

## Casos de uso

- Subtitulado automático rumano-sueco en Android: la app Subtitle Tap puede traducir subtítulos en local usando los ficheros ONNX, sin conexión y con bajo consumo, gracias a la cuantización INT8 y a la salida de alineación para sincronizar tokens.
- Traducción de documentación técnica de rumano a sueco en pipelines offline: el modelo puede integrarse en scripts de procesamiento por lotes con ONNX Runtime, evitando llamadas a APIs externas.
- Preprocesamiento de corpus paralelos: la salida `alignment_shift_l2` permite extraer alineaciones aproximadas para construir o validar datasets bilingües ro-sv.
- Traducción en entornos con restricciones de privacidad: al ejecutarse en local, los textos no salen del dispositivo, adecuado para contenido sensible.
- Prototipado de aplicaciones de accesibilidad: traducción de contenido rumano a sueco en lectores de pantalla o asistentes de voz con latencia baja.
- Investigación en NMT de bajo recursos: el par ro-sv y la exposición de atención facilitan experimentos sobre alineación y calidad en modelos Marian cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en memoria de dispositivos móviles y GPUs consumer.
- GPU recomendadas: no disponible; el modelo está pensado para CPU/ONNX Runtime en Android.
- Cabe en GPU consumer: sí, por tamaño (0,1 GB), aunque no se especifican requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); no se proporcionan ficheros GGUF, ni instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ro-sv-int8-shift-att | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Conversión con salida de alineación |
| Helsinki-NLP/opus-mt-ro-sv | no disponible | no disponible | Apache 2.0 | PyTorch/safetensors (original) | Modelo base sin cuantizar |
| Otros OPUS-MT ro→sv | no disponible | no disponible | Apache 2.0 | variable | No se dispone de alternativas documentadas en la información |

## Limitaciones y advertencias

- Solo cubre el par rumano-sueco; no es un modelo multilingüe general.
- La cuantización INT8 dinámica puede degradar ligeramente la calidad respecto al modelo original en PyTorch.
- La exportación sin past key/values puede implicar mayor coste de decodificación en secuencias largas.
- No se han publicado evaluaciones de sesgo, alucinación ni calidad de traducción en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe citar el trabajo original de OPUS-MT (Tiedemann y Thottingal, 2020).
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de validación comunitaria.
- La salida de alineación es una identidad sobre un nodo existente y no debe interpretarse como una alineación word-level calibrada.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ro-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ro-sv
- Paper OPUS-MT (EAMT 2020): Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World.
